import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Comment, Ref, Dropdown, Popup, Icon, Loader, Header, Input, Segment, Button } from 'semantic-ui-react';
import ChannelPasswordForm from './ChannelPasswordForm';
import VideoContainer from './VideoContainer';
import MessageForm from './MessageForm';
import Message from './Message';
import Peer from 'simple-peer';
import { Redirect } from 'react-router-dom';
import { ActionCable } from 'react-actioncable-provider';
import { validateConversationPassword, deleteConversation } from '../store/actions/adapter';
import { getCurrentConversation, setCurrentConversation, removeFavorite, addFavorite, addChannelPassword } from '../store';

class ChannelPage extends Component {
  constructor() {
    super()
    this.peers = {}
  }

  state = {
    isLoading: true,
    isVideoCall: false,
    isMuted: false,
    messageContainer: null,
    currentUserVideo: { stream: null, url: "" },
    currentUsers: [],
    peerStreams: [],
    loadErr: false,
    showUserMenu: true,
    modalOpen: false,
    channelPassword: "",
    showLogin: true
  }

  componentDidMount = () => {
    if (localStorage.jwt) {
      this.props.getCurrentConversation(this.props.match.params.id)
        .then(() => this.setState({
          isLoading: false
        }))
        .catch(async (error) => {
          const err = await error.json()
          console.log(err)
          this.setState({
            isLoading: false,
            loadErr: true
          });
          return undefined
        })
    }
  }

  setMessageInputRef = node => this.messageField = node

  setMessageContainerRef = node => {
    this.setState({
      messageContainer: node
    }, () => this.state.messageContainer.scrollTo({ top: this.state.messageContainer.scrollHeight }));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentConversation.messages.length < this.props.currentConversation.messages.length && this.state.messageContainer) {
      this.state.messageContainer.scrollTo({ top: this.state.messageContainer.scrollHeight })
    }
  }

  toggleUserMenu = () => this.setState({ showUserMenu: !this.state.showUserMenu });

  toggleVideo = () => {
    if (this.state.currentUserVideo.stream) {
      this.state.currentUserVideo.stream.getTracks().forEach(track => track.stop())
      this.setState({
        currentUserVideo: { stream: null, url: "" }
      }, () => this.state.messageContainer.scrollTo({ top: this.state.messageContainer.scrollHeight }));
      Object.values(this.peers).forEach(peer => {
        if (peer.connected) {
          peer.send(JSON.stringify({ action: "video_stopped", user_id: this.props.currentUser.id }))
        }
      })
      return
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        this.setState({
          isVideoCall: true,
          currentUserVideo: { stream: stream, url: window.URL.createObjectURL(stream) }
        }, () => this.state.messageContainer.scrollTo({ top: this.state.messageContainer.scrollHeight }));
        Object.values(this.peers).forEach(peer => {
          if (peer.connected) {
            peer.addStream(stream)
          }
        })
      })
  }

  handleReceive = (resp) => {
    console.log(resp)
    if (resp.action === "send_signal") {
      this.peers[resp.from] = this.createResponsePeer(resp)
      setTimeout(() => {
        if (this.peers[resp.from] && !this.peers[resp.from].connected) {
          console.log("peer timeout")
          delete this.peers[resp.from]
        }
      }, 5000)
    }
  }

  createSignalingPeer = (id) => {
    let peer = new Peer({ initiator: true, trickle: false, stream: this.state.currentUserVideo.stream })
    peer.on('signal', data => {
      this.refs.signalServer.perform('send_signal', { payload: data, to: id })
    })
    return peer
  }

  createResponsePeer = (resp) => {
    let peer = this.peers[resp.from]
    if (!peer) {
      peer = Peer({ initiator: false, trickle: false, stream: this.state.currentUserVideo.stream })
      peer.on('signal', data => {
        this.refs.signalServer.perform('send_signal', { payload: data, to: resp.from })
      })
    }
    if (!peer.connected) {
      peer.on('connect', () => {
        console.log('hit connect')
      })
      peer.on('data', raw => {
        if (JSON.parse(raw.toString()).action === "video_stopped") {
          this.setState({
            peerStreams: this.state.peerStreams.filter(p => p.id !== JSON.parse(raw.toString()).user_id)
          })
          return
        } else if (JSON.parse(raw.toString()).hasOwnProperty("is_whisper")) {
          this.props.addWhisper(JSON.parse(raw.toString()))
          return
        }
        this.props.addMessage(JSON.parse(raw.toString()))
      })
      peer.on('stream', stream => {
        this.setState({
          isVideoCall: true,
          peerStreams: [...this.state.peerStreams.filter(p => p.id !== resp.from), { id: resp.from, stream: window.URL.createObjectURL(stream) }]
        });
      })
      peer.on('close', () => console.log('closed peer'))
      peer.on('error', (error) => {
        console.error('peer error', error)
      })
    }

    peer.signal(resp.payload)
    return peer
  }

  handlePresenceConnect = () => {
    const sayHi = this.refs.presenceChannel.perform("user_join", { user_id: this.props.currentUser.id, username: this.props.currentUser.username })
    console.log("presence connect")
    setTimeout(sayHi, 1000)
  }

  removeObj = (obj, prop) => {
    let {
      [prop]: omit, ...res
    } = obj
    return res
  }

  handlePresenceReceive = (resp) => {
    switch (resp.action) {
      case "user_join":
        this.setState({
          currentUsers: [...this.state.currentUsers.filter(u => u.id !== resp.user_id), { username: resp.username, id: resp.user_id }]
        });
        if (resp.user_id !== this.props.currentUser.id) {
          this.refs.presenceChannel.perform("initial_presence", { username: this.props.currentUser.username, user_id: this.props.currentUser.id })
          this.peers[resp.user_id] = this.createSignalingPeer(resp.user_id)
          setTimeout(() => {
            console.log("initiating peer timeout", this.peers)
            if (this.peers[resp.user_id] && !this.peers[resp.user_id].connected) {
              delete this.peers[resp.user_id]
              if (this.state.currentUsers[resp.user_id]) {
                this.peers[resp.user_id] = this.createSignalingPeer(resp.user_id)
              }
            }
          }, 5000)
        }
        break;
      case "initial_presence":
        if (resp.user_id !== this.props.currentUser.id) {
          this.setState({
            currentUsers: [...this.state.currentUsers.filter(u => u.id !== resp.user_id), { username: resp.username, id: resp.user_id }]
          });
        }
        break;
      case "kick_user":
        if (resp.user_id === this.props.currentUser.id) {
          this.leaveChannel()
        }
        break;
      case "delete_channel":

        this.leaveChannel()
        break;
      case "user_left":
        if (this.peers[resp.user_id] && this.peers[resp.user_id].connected) {
          this.peers[resp.user_id].destroy()
        }
        this.peers = this.removeObj(this.peers, resp.user_id)
        this.setState({
          currentUsers: this.state.currentUsers.filter(u => u.id !== resp.user_id),
          peerStreams: this.state.peerStreams.filter(p => p.id !== resp.user_id)
        })
        break;
      default:
        return
    }
  }

  removePassword = () => {
    this.props.addChannelPassword({ password: null }, this.props.currentConversation.id)
  }

  channelLogin = (e) => {
    e.preventDefault()
    validateConversationPassword({ password: this.state.channelPassword }, this.props.currentConversation.id)
      .then(res => {
        if (res.success) {
          this.setState({
            showLogin: false
          });
        }
      })
    this.setState({
      channelPassword: ''
    });
  }

  deleteRoom = () => {
    deleteConversation(this.props.currentConversation.id)
      .then(r => {
        if (r.success) {
          return this.refs.presenceChannel.perform("delete_channel")
        }
      })
  }

  handleConnect = () => console.log("connected to signal")

  kickUser = id => this.refs.presenceChannel.perform("kick_user", { user_id: id })

  leaveChannel = () => {
    if (this.state.currentUserVideo.stream) {
      this.state.currentUserVideo.stream.getTracks().forEach(track => track.stop())
    }
    this.props.removeCurrentConversation()
    this.props.history.push('/')
  }

  muteStream = () => {
    this.state.currentUserVideo.stream.getAudioTracks()[0].enabled = !this.state.currentUserVideo.stream.getAudioTracks()[0].enabled
    this.setState({
      isMuted: !this.state.currentUserVideo.stream.getAudioTracks()[0].enabled
    });
  }

  closeModal = () => this.setState({ modalOpen: false })

  render() {
    const conversation = this.props.currentConversation
    const loadingPhrases = ["Reticulating Splines...", "Loading...", "Perturbing Matrices...", "Destabilizing Orbital Payloads...", "Inserting Chaos Generator..."]
    if (!localStorage.jwt) {
      return <Redirect to="/login" />
    }
    if (this.state.isLoading) {
      return <Loader size="massive" active>{loadingPhrases[Math.floor(Math.random()*loadingPhrases.length)]}</Loader>
    }
    if (this.state.loadErr) {
      return <div style={{paddingTop:"45vh", textAlign:"center"}}>
        <Header size="huge">This channel does not exist.</Header>
      </div>
    }
    if (!this.state.isLoading && this.props.currentConversation.has_password && !this.props.currentConversation.is_admin && this.state.showLogin) {
      return <div style={{width:"100vw", height:"100vh", paddingTop:"40vh"}}>
        <Segment style={{width:"30%", margin:"auto"}}>
        <p>This channel is locked and requires a password.</p>
        <form onSubmit={this.channelLogin}>
        <Input type="password" fluid icon="lock" onChange={this.handleChannelPasswordChange} value={this.state.channelPassword} placeholder="Enter password..." />
        <Button color="pink" fluid style={{marginTop:"1rem"}}>Let me in!</Button>
      </form>
      </Segment></div>
    }
    return (
      <React.Fragment>
      {this.props.currentUser.hasOwnProperty("id") &&
      <React.Fragment>
        <ActionCable ref="signalServer" channel={{channel:"SignalChannel", room: this.props.match.params.id, token:localStorage.jwt}} onReceived={this.handleReceive} onConnected={this.handleConnect}/>
        <ActionCable ref="presenceChannel" channel={{channel:"PresenceChannel", room: this.props.match.params.id, token:localStorage.jwt}} onReceived={this.handlePresenceReceive} onConnected={this.handlePresenceConnect}/>
      </React.Fragment>}

      <ChannelPasswordForm open={this.state.modalOpen} close={this.closeModal} />

        <div style={{height:"100vh", width:"100vw", display: "flex", flexDirection: "column"}}>

        <Segment textAlign="center" size="big" style={{borderRadius:"0", display: "flex", justifyContent:"space-between", alignItems:"center", flex:"0 0 auto", width:"100%", zIndex:"2", marginBottom:"0"}}>

          <div style={{flex:"0 1 auto", float:"left"}}>
            <Popup
              inverted
              position="bottom center"
              content="Home"
              trigger={
                <Header className="link" as="h2" color="pink" onClick={this.leaveChannel} style={{ fontFamily: "'Fredoka One', cursive", cursor:"pointer" }}>outroar</Header>
                // <Icon link onClick={this.leaveChannel} name="home" style={{cursor:"pointer"}}></Icon>
              }
            />
          </div>

          <div style={{flex:"0 1 auto"}}>
              {this.props.currentConversation.has_password && <Popup
                inverted
                position="bottom center"
                content="Private"
                trigger={
              <Icon name="lock" size="small" style={{marginLeft:".3rem"}} />
            }
          />}
            <Dropdown pointing text={conversation.name}>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => this.props.isFavorited ? this.props.removeFavorite(this.props.currentConversation.id) : this.props.addFavorite(this.props.currentConversation.id)}>
                  <Icon
                    color={this.props.isFavorited ? "yellow" : "default"} name={`star${this.props.isFavorited ? "" : " outline"}`}
                    ></Icon> {this.props.isFavorited ? "Remove from favorites" : "Add to favorites"}
                </Dropdown.Item>
                {this.props.currentConversation.is_admin && <React.Fragment>
                  <Dropdown.Divider />
                  <Dropdown.Header>Admin Settings</Dropdown.Header>
                  <Dropdown.Item icon={this.props.currentConversation.has_password ? "unlock" : "lock"} onClick={() => {
                    if (this.props.currentConversation.has_password) {
                      return this.removePassword()
                    }
                    this.setState({
                    modalOpen: true
                  })}
                } text={this.props.currentConversation.has_password ? "Make Channel Public" :"Make Channel Private"}/>
                  <Dropdown.Item onClick={this.deleteRoom} icon="times" text="Delete Channel"/>
                </React.Fragment>
              }
              </Dropdown.Menu>
            </Dropdown>

        </div>

        <div style={{flex:"0 1 auto", float:"right"}}>
          { this.state.currentUserVideo.stream ?
            (
              <Popup
                inverted
                position="bottom right"
                content={this.state.isMuted ? "Unmute" : "Mute"}
                trigger={<i onClick={this.muteStream} className={`link fas fa-microphone${this.state.isMuted ? "-slash" : ""}`} style={{cursor:"pointer", paddingRight:"1.5rem"}}></i>}
              />) : null
            }
            <Popup
              inverted
              position="bottom right"
              content={this.state.currentUserVideo.stream ? "Stop Video" : "Start Video"}
              trigger={
            <i onClick={this.toggleVideo} className={`link fas fa-video${this.state.currentUserVideo.stream ? "-slash" : ""}`} style={{cursor:"pointer", paddingRight:"1rem"}}></i>}
          />
          <Popup
            inverted
            position="bottom right"
            content="Toggle User List"
            trigger={
          <i onClick={this.toggleUserMenu} className="fas fa-users" style={{float:"right", cursor:"pointer", paddingRight:".5rem"}}></i>}
        />
        </div>

        </Segment>

        {this.state.currentUserVideo.stream || this.state.peerStreams.length > 0 ? (
          <VideoContainer myStream={this.state.currentUserVideo} myUsername={this.props.currentUser.username} peerStreams={this.state.peerStreams} currentUsers={this.state.currentUsers} />
        ) : null}
          <div style={{flex:"1 1 100%", display:"flex"}}>
            <Ref innerRef={this.handleRef}>
              <Comment.Group style={{padding:"1rem 1rem 1rem 1rem", flex:"1 1 auto", margin:"0", maxWidth:"100%", overflowY:"scroll"}}>

                {this.props.currentConversation.messages.map(message => <Message key={message.hasOwnProperty("is_whisper") ? message.created_at : message.id } message={message} isWhisper={message.hasOwnProperty("is_whisper")} isAuthor={message.hasOwnProperty("is_whisper") && message.is_whisper === "sent"}/>)}
              </Comment.Group>
            </Ref>
        { this.state.showUserMenu ? <Menu inverted vertical fitted="vertically" borderless style={{marginLeft:"auto", flex:"0 0 auto", marginTop:"0", borderRadius:"0", height:"100%", borderLeft: "1px solid #999"}}>
          <Menu.Item header >Users</Menu.Item>
          {this.state.currentUsers.map(user => ( user.id === this.props.currentUser.id ? <Menu.Item key={user.id}  link>{user.username} {conversation.owner === user.username && <i style={{float:"right"}} className="fas fa-crown"></i>}</Menu.Item> :
            <Popup
              inverted
              key={user.id}
              size="tiny"
              content={<Menu size="tiny" vertical inverted compact>
                {this.props.currentConversation.is_admin && <Menu.Item onClick={() => this.kickUser(user.id)}>Kick</Menu.Item>}
                <Menu.Item onClick={() =>
                {this.messageField.firstElementChild.value = `/whisper ${user.username}`;
                this.messageField.firstElementChild.focus()}}
                link>Whisper</Menu.Item>
            </Menu>}
              position="left center"
              on="click"
              trigger={
            <Menu.Item key={user.id} link>{user.username} {conversation.owner === user.username && <i style={{float:"right"}} className="fas fa-crown"></i>}</Menu.Item>
          }/>
          ))}

        </Menu> : null}
      </div>
      <MessageForm peers={this.peers} currentUsers={this.state.currentUsers} setMessageInputRef={this.setMessageInputRef}/>
      </div>
    </React.Fragment>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user,
    currentConversation: state.currentConversation,
    isFavorited: state.user.favorite_channels.includes(state.currentConversation.id)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addMessage: (action) => dispatch(action),
    addWhisper: (body) => dispatch({ type: "ADD_MESSAGE", payload: body }),
    removeCurrentConversation: () => dispatch(setCurrentConversation({ messages: [] })),
    getCurrentConversation: (id) => dispatch(getCurrentConversation(id)),
    addFavorite: (id) => dispatch(addFavorite(id)),
    removeFavorite: (id) => dispatch(removeFavorite(id)),
    addChannelPassword: (password, id) => dispatch(addChannelPassword(password, id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelPage);