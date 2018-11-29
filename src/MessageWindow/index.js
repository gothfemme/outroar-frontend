import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Popup, Icon, Loader, Header, Input, Segment, Comment } from 'semantic-ui-react';
import Message from './Message';
import VideoPlayer from './VideoPlayer';
import Peer from 'simple-peer';
import { Redirect } from 'react-router-dom';
import { ActionCable } from 'react-actioncable-provider';
import { sendMessage, getCurrentConversation, setCurrentConversation, removeFavorite, addFavorite } from '../store';

class MessageWindow extends Component {
  constructor() {
    super()
    this.peers = {}
  }

  state = {
    message: "",
    isLoading: true,
    isVideoCall: false,
    isMuted: false,
    messageContainer: null,
    currentUserVideo: { stream: null, url: "" },
    currentUsers: [],
    peerStreams: [],
    loadErr: false
  }

  componentDidMount = () => {
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

  handleSubmit = (e) => {
    e.preventDefault()

    const newMessage = {
      content: this.state.message,
      conversation_id: this.props.currentConversation.id
    }
    this.setState({
      message: ""
    });
    if (newMessage.content.match(/^\/\w+\b/)) {
      switch (newMessage.content.match(/^\/\w+\b/)[0]) {
        case "/whisper":
          let arr = newMessage.content.split(/\s+/)
          if (arr[1]) {
            let user = this.state.currentUsers.find(u => u.username === arr[1])
            if (user && this.peers[user.id]) {
              let whisper = { is_whisper: "received", created_at: Date.now(), user: { id: this.props.currentUser.id, username: this.props.currentUser.username, color: this.props.currentUser.color }, content: arr.slice(2).join(" ") }
              this.peers[user.id].send(JSON.stringify(whisper))
              let whisperForMe = { is_whisper: "sent", created_at: Date.now(), user: { id: user.id, username: user.username, color: null }, content: arr.slice(2).join(" ") }
              this.props.addWhisper(whisperForMe)
            }
          }
          break;
        default:
      }
    } else {
      this.props.sendMessage(newMessage)
        .then(action => {
          console.log(action, this.peers)
          Object.values(this.peers).forEach(peer => {
            if (peer.connected) {
              peer.send(JSON.stringify(action))
            }
          })
        })
    }
  }

  handleRef = node => {
    this.setState({
      messageContainer: node
    }, () => this.state.messageContainer.scrollTo({ top: this.state.messageContainer.scrollHeight }));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentConversation.messages.length < this.props.currentConversation.messages.length && this.state.messageContainer) {
      this.state.messageContainer.scrollTo({ top: this.state.messageContainer.scrollHeight })
    }
  }

  toggleVideo = () => {
    if (this.state.currentUserVideo.stream) {
      this.state.currentUserVideo.stream.getTracks().forEach(track => track.stop())
      this.setState({
        currentUserVideo: { stream: null, url: "" }
      });
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
        });
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
      if (this.peers[resp.from] && this.peers[resp.from].connected) {
        return
      }
      this.peers[resp.from] = this.createResponsePeer(resp)

      console.log(resp.payload.type)
      setTimeout(() => {
        if (this.peers[resp.from] && !this.peers[resp.from].connected) {
          console.log("peer timeout")
          delete this.peers[resp.from]
        }
      }, 5000)
    }
  }

  createSignalingPeer = (id) => {
    let peer = new Peer({ initiator: true, trickle: false })
    peer.on('signal', data => {
      this.refs.signalServer.perform('send_signal', { payload: data, to: id })
    })
    return peer
  }

  createResponsePeer = (resp) => {
    let peer = this.peers[resp.from]
    if (!peer) {
      peer = Peer({ initiator: false, trickle: false })
      peer.on('signal', data => {
        this.refs.signalServer.perform('send_signal', { payload: data, to: resp.from })
      })
    }
    peer.on('connect', () => {
      console.log('hit connect')
      if (this.state.currentUserVideo.stream) {
        peer.addStream(this.state.currentUserVideo.stream)
      }
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
    peer.signal(resp.payload)
    peer.on('error', (error) => {
      console.error('peer error', error)
    })
    return peer
  }

  handleChange = (e) => {
    this.setState({
      message: e.target.value
    });
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

  handleConnect = () => {
    console.log("connected to signal")
  }

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

    return (
      <React.Fragment>

      {this.props.currentUser.hasOwnProperty("id") && <React.Fragment>
        <ActionCable ref="signalServer" channel={{channel:"SignalChannel", room: this.props.match.params.id, token:localStorage.jwt}} onReceived={this.handleReceive} onConnected={this.handleConnect}/>
        <ActionCable ref="presenceChannel" channel={{channel:"PresenceChannel", room: this.props.match.params.id, token:localStorage.jwt}} onReceived={this.handlePresenceReceive} onConnected={this.handlePresenceConnect}/>
      </React.Fragment>}

        <div style={{height:"100vh", width:"100vw", display: "flex", flexDirection: "column"}}>

        <Segment textAlign="center" size="big" style={{borderRadius:"0", flex:"0 0 auto", width:"100%", zIndex:"2", marginBottom:"0"}}>
          <span style={{float:"left"}}>
            <Popup
              inverted
              position="bottom center"
              content="Home"
              trigger={
                <Header className="link" as="h2" color="pink" onClick={this.leaveChannel} style={{ fontFamily: "'Fredoka One', cursive", cursor:"pointer" }}>outroar</Header>
                // <Icon link onClick={this.leaveChannel} name="home" style={{cursor:"pointer"}}></Icon>
              }
            />
          </span>

        <span style={{float:"right"}}>
            <Popup
              inverted
              position="bottom right"
              content={this.state.currentUserVideo.stream ? "Stop Video" : "Start Video"}
              trigger={
            <i onClick={this.toggleVideo} className={`link fas fa-video${this.state.currentUserVideo.stream ? "-slash" : ""}`} style={{float:"right", cursor:"pointer", paddingRight:"1rem"}}></i>}
          />
        </span>

        { this.state.currentUserVideo.stream ?
          (<span style={{float:"right"}}>
            <Popup
              inverted
              position="bottom right"
              content={this.state.isMuted ? "Unmute" : "Mute"}
              trigger={<i onClick={this.muteStream} className={`link fas fa-microphone${this.state.isMuted ? "-slash" : ""}`} style={{cursor:"pointer", paddingRight:"1.5rem"}}></i>}
            />
        </span> ) : null
          }
          <Header as="h5" style={{display:"inline"}}>
            <Icon link onClick={() => this.props.isFavorited ? this.props.removeFavorite(this.props.currentConversation.id) : this.props.addFavorite(this.props.currentConversation.id)}
            color={this.props.isFavorited ? "yellow" : "grey"} name={`star${this.props.isFavorited ? "" : " outline"}`}
            size='large'></Icon>
            {conversation.name ? conversation.name : conversation.users.map(userObj =>  userObj.username).join(', ')}
          </Header>
        </Segment>

        {this.state.currentUserVideo.stream || this.state.peerStreams.length > 0 ? (

            <Segment inverted style={{ borderRadius:"0", display:"flex", margin:"0", flexDirection:"row", flexBasis:"auto", minHeight:"50vh", flexWrap:"wrap", alignItems:"center", alignContent: "center", justifyContent:"center", boxShadow:"inset 0 0 5px 1px rgb(0, 0, 0, 0.5)"}}>

              {this.state.currentUserVideo.stream ? <div style={{textAlign:"center", padding:"1rem", flex:"1 1 20%", maxWidth:"36vw", minWidth:"10vw"}}>
                <div style={{position:"relative"}}>
              <video muted autoPlay={true} src={this.state.currentUserVideo.url} style={{borderRadius:"1%", boxShadow:"0 1px 5px #000", width:"100%"}}>
              </video>
            </div>
              <div>{this.props.currentUser.username}</div>
            </div> : null}
            {this.state.peerStreams.map(p => (
              <VideoPlayer stream={p.stream} username={this.state.currentUsers.find(c => c.id === p.id).username} />
            ))}
            </Segment>
        ) : null}

          <div ref={this.handleRef} style={{flex:"1 1 100%", display:"flex", overflowY:"scroll"}}>
          <Comment.Group style={{padding:"1rem 15rem 1rem 1rem", margin:"0", width:"100%", maxWidth:"100%"}}>

            {this.props.currentConversation.messages.map(message => <Message key={message.hasOwnProperty("is_whisper") ? message.created_at : message.id } message={message} isWhisper={message.hasOwnProperty("is_whisper")} isAuthor={message.hasOwnProperty("is_whisper") && message.is_whisper === "sent"}/>)}
          </Comment.Group>
        <Menu inverted vertical fitted="vertically" borderless style={{position:"fixed", right:"0", marginTop:"0", borderRadius:"0", height:"100%", borderLeft: "1px solid #999"}}>
          <Menu.Item header >Users</Menu.Item>
          {this.state.currentUsers.map(user => (
            <Popup
              inverted
              size="tiny"
              content={<Menu size="tiny" vertical inverted compact><Menu.Item onClick={() => {this.setState({
                message: `/whisper ${user.username}`
              }, () => this.messageField.focus())}} link>Whisper</Menu.Item></Menu>}
              position="left center"
              on="click"
              trigger={
            <Menu.Item key={user.id}  link>{user.username}</Menu.Item>
          }/>
          ))}

        </Menu>
      </div>

        <Segment secondary style={{borderRadius:"0", flex:"0 0 auto", marginTop:"0", width:"100%"}}>
          <form onSubmit={this.handleSubmit}>
          <Input fluid
            ref={el => this.messageField = el}
            disabled={this.state.isLoading}
            action={{color:'pink', content:'Send'}}
            icon='chat'
            iconPosition='left'
            placeholder="Send a message..."
            onChange={this.handleChange}
            value={this.state.message}
            ></Input>
          </form>
        </Segment>
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
    sendMessage: (message) => dispatch(sendMessage(message)),
    addMessage: (action) => dispatch(action),
    addWhisper: (body) => dispatch({ type: "ADD_MESSAGE", payload: body }),
    removeCurrentConversation: () => dispatch(setCurrentConversation({ messages: [] })),
    getCurrentConversation: (id) => dispatch(getCurrentConversation(id)),
    addFavorite: (id) => dispatch(addFavorite(id)),
    removeFavorite: (id) => dispatch(removeFavorite(id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageWindow);