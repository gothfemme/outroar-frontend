import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Popup, Icon, Ref, Loader, Header, Input, Segment, Comment } from 'semantic-ui-react';
import Message from './Message';
import Peer from 'simple-peer';
import { ActionCable } from 'react-actioncable-provider';
import { sendMessage, getCurrentConversation, setCurrentConversation } from '../store';

class MessageWindow extends Component {
  constructor() {
    super()
    this.peers = {}
  }

  state = {
    message: "",
    isLoading: true,
    isVideoCall: false,
    messageContainer: null,
    currentUserVideo: { stream: null, url: "" },
    currentUsers: [],
    peerStreams: {}
  }

  componentDidMount = () => {
    this.props.getCurrentConversation(this.props.match.params.id)
      .then(() => this.setState({
        isLoading: false
      }))
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

  handleRef = node => {
    this.setState({
      messageContainer: node
    }, () => this.state.messageContainer.scrollTo({ top: this.state.messageContainer.scrollHeight }));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentConversation.messages !== this.props.currentConversation.messages) {
      if (this.state.messageContainer) {
        this.state.messageContainer.scrollTo({ top: this.state.messageContainer.scrollHeight })
      }
    }
  }

  toggleVideo = () => {
    if (this.state.currentUserVideo.stream) {
      Object.values(this.peers).forEach(peer => {
        if (peer.connected) {
          peer.removeStream(this.state.currentUserVideo.stream)
        }
      })
      this.state.currentUserVideo.stream.getTracks().forEach(track => track.stop())
      this.setState({
        currentUserVideo: { stream: null, url: "" }

      });
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
    })
    peer.on('data', raw => {
      console.log(JSON.parse(raw.toString()))
      this.props.addMessage(JSON.parse(raw.toString()))
    })
    peer.on('stream', stream => {
      this.setState({
        isVideoCall: true,
        peerStreams: { ...this.state.peerStreams, [resp.from]: window.URL.createObjectURL(stream) }
      });
      console.log(stream)
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
    this.refs.presenceChannel.perform("user_join", { user_id: this.props.currentUser.id, username: this.props.currentUser.username })
  }

  handlePresenceReceive = (resp) => {
    switch (resp.action) {
      case "user_join":
        this.setState({
          currentUsers: [...this.state.currentUsers, { username: resp.username, id: resp.user_id }]
        });
        if (resp.user_id !== this.props.currentUser.id) {
          this.refs.presenceChannel.perform("initial_presence", { username: this.props.currentUser.username, user_id: this.props.currentUser.id })
          this.peers[resp.user_id] = this.createSignalingPeer(resp.user_id)
          setTimeout(() => {
            if (this.peers[resp.user_id] && !this.peers[resp.user_id].connected) {
              console.log("peer timeout")
              delete this.peers[resp.user_id]
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
        this.setState({
          currentUsers: this.state.currentUsers.filter(u => u.id !== resp.user_id)
        })
        break;
      default:
        return
    }
  }

  handleConnect = () => {
    console.log("connected to websocket")
  }

  leaveChannel = () => {
    if (this.state.currentUserVideo.stream) {
      this.state.currentUserVideo.stream.getTracks().forEach(track => track.stop())
    }
    this.props.removeCurrentConversation()
    this.props.history.push('/')
  }

  render() {
    const conversation = this.props.currentConversation
    return (
      <React.Fragment>

      <ActionCable ref="signalServer" channel={{channel:"SignalChannel", room: this.props.match.params.id, token:localStorage.jwt}} onReceived={this.handleReceive} onConnected={this.handleConnect}/>
      <ActionCable ref="presenceChannel" channel={{channel:"PresenceChannel", room: this.props.match.params.id, token:localStorage.jwt}} onReceived={this.handlePresenceReceive} onConnected={this.handlePresenceConnect}/>

      {this.state.isLoading? <div style={{width:"100%", paddingTop:"45vh", paddingRight:"20rem"}}><Loader size="massive" inline='centered' active/></div> : (

        <div style={{height:"100vh", width:"100vw", display: "flex", flexDirection: "column"}}>

        <Segment textAlign="center" size="big" style={{borderRadius:"0", flex:"0 0 auto", width:"100%", zIndex:"2", marginBottom:"0"}}>
          <span style={{float:"left"}}>
            <Popup
              inverted
              position="bottom left"
              content="Back"
              trigger={
                <Icon link onClick={this.leaveChannel} name="bars" style={{cursor:"pointer"}}></Icon>}
            />
          </span>

        <span style={{float:"right"}}>
            <Popup
              inverted
              position="bottom right"
              content="Start video"
              trigger={
            <i onClick={this.toggleVideo} className={`link fas fa-video${this.state.currentUserVideo.stream ? "-slash" : ""}`} style={{float:"right", cursor:"pointer", paddingRight:"1rem"}}></i>}
          />
        </span>

        { this.state.currentUserVideo.stream ?
(          <span style={{float:"right"}}><Popup
          inverted
          position="bottom right"
          content="Mute"
          trigger={
        <i onClick={this.muteStream} className={`link fas fa-microphone${this.state.currentUserVideo.stream ? "-slash" : ""}`} style={{cursor:"pointer", paddingRight:"1.5rem"}}></i>}
      /></span> ) : null
    }
          <Header as="h5" style={{display:"inline"}}><Icon name="star" ></Icon>{conversation.name ? conversation.name : conversation.users.map(userObj =>  userObj.username).join(', ')}</Header>
        </Segment>

        {this.state.isVideoCall ? (

            <Segment inverted style={{ borderRadius:"0", display:"flex", margin:"0", flexDirection:"row", flexBasis:"auto", minHeight:"50vh", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between"}}>

              {this.state.currentUserVideo ? <div style={{textAlign:"center", flex:"1 1 auto", height:"33vh"}}>
              <video muted autoPlay={true} src={this.state.currentUserVideo.url} style={{height:"100%"}}>
              </video>
            </div> : null}
            {Object.values(this.state.peerStreams).map(stream => (
              <div style={{textAlign:"center", flex:"1 1 auto", height:"33vh"}}>
              <video autoPlay={true} src={stream} style={{height:"100%"}}>
              </video>
            </div>
            ))}
            </Segment>
        ) : null}

          <div style={{flex:"1 1 100%", display:"flex", overflowY:"scroll"}}>
          <Ref innerRef={this.handleRef}>
          <Comment.Group style={{padding:"1rem", margin:"0", maxWidth:"100%"}}>

            {this.props.currentConversation.messages.map(message => <Message key={message.id} message={message}/>)}
          </Comment.Group>
        </Ref>
        <Menu inverted vertical fitted="vertically" borderless style={{position:"fixed", right:"0", marginTop:"0", borderRadius:"0", height:"100%", borderLeft: "1px solid #999"}}>
          <Menu.Item header >Users</Menu.Item>
          {this.state.currentUsers.map(user => <Menu.Item key={user.id} link>{user.username}</Menu.Item>)}

        </Menu>
      </div>

        <Segment secondary style={{borderRadius:"0", flex:"0 0 auto", marginTop:"0", width:"100%"}}>
          <form onSubmit={this.handleSubmit}>
          <Input fluid
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

      </div>)}
    </React.Fragment>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user,
    currentConversation: state.currentConversation
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendMessage: (message) => dispatch(sendMessage(message)),
    addMessage: (action) => dispatch(action),
    removeCurrentConversation: () => dispatch(setCurrentConversation({})),
    getCurrentConversation: (id) => dispatch(getCurrentConversation(id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageWindow);