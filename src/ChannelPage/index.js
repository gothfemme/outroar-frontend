import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Loader, Header } from 'semantic-ui-react';
import ChannelPasswordForm from './ChannelPasswordForm';
import VideoContainer from './VideoContainer';
import MessageForm from './MessageForm';
import MessageContainer from './MessageContainer';
import UserList from './UserList';
import ChannelHeader from './ChannelHeader';
import ChannelLogin from './ChannelLogin';
import { loadingPhrases } from '../loadingPhrases';
import Peer from 'simple-peer';
import { Redirect } from 'react-router-dom';
import { ActionCable } from 'react-actioncable-provider';
import { deleteConversation } from '../store/actions/adapter';
import { addChannelUser, getCurrentConversation, resetConversation, removeChannelUser, setPeerStream } from '../store';

class ChannelPage extends Component {
  constructor() {
    super()
    this.peers = {}
  }

  state = {
    isLoading: true,
    loadErr: false
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
    let peer = new Peer({ initiator: true, trickle: false, stream: this.props.channelSettings.myStream.stream })
    peer.on('signal', data => {
      this.refs.signalServer.perform('send_signal', { payload: data, to: id })
    })
    return peer
  }

  createResponsePeer = (resp) => {
    let peer = this.peers[resp.from]
    if (!peer) {
      peer = Peer({ initiator: false, trickle: false, stream: this.props.channelSettings.myStream.stream })
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
          this.props.setPeerStream(JSON.parse(raw.toString()).user_id, null)
          return
        } else if (JSON.parse(raw.toString()).hasOwnProperty("is_whisper")) {
          this.props.addWhisper(JSON.parse(raw.toString()))
          return
        }
        this.props.addMessage(JSON.parse(raw.toString()))
      })
      peer.on('stream', stream => {
        this.props.setPeerStream(resp.from, stream)
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
        this.props.addChannelUser({ username: resp.username, id: resp.user_id, stream: null })
        if (resp.user_id !== this.props.currentUser.id) {
          this.refs.presenceChannel.perform("initial_presence", { username: this.props.currentUser.username, user_id: this.props.currentUser.id })
          this.peers[resp.user_id] = this.createSignalingPeer(resp.user_id)
          setTimeout(() => {
            console.log("initiating peer timeout", this.peers)
            if (this.peers[resp.user_id] && !this.peers[resp.user_id].connected) {
              delete this.peers[resp.user_id]
              if (this.props.channelSettings.currentUsers.find(u => u.id === resp.user_id)) {
                this.peers[resp.user_id] = this.createSignalingPeer(resp.user_id)
              }
            }
          }, 5000)
        }
        break;
      case "initial_presence":
        if (resp.user_id !== this.props.currentUser.id && !this.props.channelSettings.currentUsers.find(u => u.id === resp.user_id)) {
          this.props.addChannelUser({ username: resp.username, id: resp.user_id, stream: null })
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
        this.props.removeChannelUser(resp.user_id)
        break;
      default:
        return
    }
  }

  deleteRoom = () => {
    deleteConversation(this.props.currentConversation.id)
      .then(r => {
        if (r.success) {
          return this.refs.presenceChannel.perform("delete_channel")
        }
      })
  }

  kickUser = id => this.refs.presenceChannel.perform("kick_user", { user_id: id })

  leaveChannel = () => {
    if (this.props.channelSettings.myStream.stream) {
      this.props.channelSettings.myStream.stream.getTracks().forEach(track => track.stop())
    }
    this.props.resetConversation()
    this.props.history.push('/')
  }

  render() {
    const { channelSettings } = this.props
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
    if (!this.state.isLoading && this.props.currentConversation.showLogin && !this.props.currentConversation.is_admin) {
      return <ChannelLogin />
    }
    return (
      <React.Fragment>
      {this.props.currentUser.hasOwnProperty("id") &&
          <React.Fragment>
              <ActionCable ref="signalServer" channel={{channel:"SignalChannel", room: this.props.match.params.id, token:localStorage.jwt}} onReceived={this.handleReceive} />
              <ActionCable ref="presenceChannel" channel={{channel:"PresenceChannel", room: this.props.match.params.id, token:localStorage.jwt}} onReceived={this.handlePresenceReceive} onConnected={this.handlePresenceConnect}/>
          </React.Fragment>}
          <ChannelPasswordForm />
          <div style={{height:"100vh", width:"100vw", display: "flex", flexDirection: "column"}}>
              <ChannelHeader peers={this.peers} leaveChannel={this.leaveChannel} deleteRoom={this.deleteRoom}/>
              {channelSettings.myStream.stream || channelSettings.currentUsers.filter(u => u.stream).length > 0 ? (
              <VideoContainer myStream={channelSettings.myStream} myUsername={this.props.currentUser.username} currentUsers={channelSettings.currentUsers} />
              ) : null}
              <div style={{flex:"1 1 100%", display:"flex"}}>
                  <MessageContainer />
              { channelSettings.userMenuOpen ?
                  <UserList kickUser={this.kickUser} />
              : null}
              </div>
              <MessageForm peers={this.peers} />
          </div>
    </React.Fragment>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser,
    currentConversation: state.currentConversation,
    channelSettings: state.channelSettings,
    isFavorited: state.currentUser.favorite_channels.includes(state.currentConversation.id)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addMessage: (action) => dispatch(action),
    addWhisper: (body) => dispatch({ type: "ADD_MESSAGE", payload: body }),
    resetConversation: () => dispatch(resetConversation()),
    getCurrentConversation: (id) => dispatch(getCurrentConversation(id)),
    addChannelUser: user => dispatch(addChannelUser(user)),
    removeChannelUser: id => dispatch(removeChannelUser(id)),
    setPeerStream: (id, stream) => dispatch(setPeerStream(id, stream))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelPage);