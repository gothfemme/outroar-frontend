import React, { Component } from 'react';
import Sidebar from './Sidebar';
import MessageWindow from '../MessageWindow';
import { Loader } from 'semantic-ui-react';
import { ActionCableProvider, ActionCable } from 'react-actioncable-provider';
import { connect } from 'react-redux';
import { fetchSplash, addPeer } from '../store';
import Peer from 'simple-peer';
// import { createSignalingPeer, createPeer } from '../peerCreators';

class MainContainer extends Component {
  state = {
    isLoading: true,
    connected: false,
    peers: []
  }

  componentDidMount() {
    this.props.populateSplash()
  }

  handleReceive = (resp) => {
    if (resp.action === "send_signal") {
      this.createResponsePeer(resp)
    }
  }

  createSignalingPeer = (id) => {
    let peer = Peer({ initiator: true, trickle: false })
    peer.on('signal', data => {
      this.refs.signalServer.perform('send_signal', { payload: data, to: id, conversation: this.props.currentConversation.id })
    })
    peer.id = id
    peer.conversation = this.props.currentConversation.id
    this.setState({
      peers: [this.state.peers.filter(p => p.id !== peer.id && p.conversation !== peer.conversation), peer]
    });
    // this.props.addPeer(peer)
  }

  createResponsePeer = (resp) => {
    console.log(resp)
    let peer = this.state.peers.find(peer => peer.conversation === resp.conversation && peer.id === resp.from)
    if (!peer) {
      peer = Peer({ trickle: false })
      peer.on('signal', data => {
        this.refs.signalServer.perform('send_signal', { payload: data, to: resp.from, conversation: resp.conversation })
      })

      console.log("new peer i guess?")
    }
    //upgrade peer with new listeners
    peer.on('connect', () => {
      console.log('hit connect')
    })
    peer.on('data', raw => {
      this.props.addMessage(JSON.parse(raw.toString()))
    })
    peer.on('stream', stream => {
      console.log(stream)
    })
    peer.on('error', (error) => {
      console.error('peer error', error)
    })
    peer.signal(resp.payload)
    peer.id = resp.from
    peer.conversation = resp.conversation
    this.setState({
      peers: [this.state.peers.filter(p => p.id !== peer.id && p.conversation !== peer.conversation), peer]
    });
    // this.props.addPeer(peer)
    // return peer
  }

  handleConnect = () => {
    console.log("connected to websocket")
    this.setState({
      connected: true,
      isLoading: false
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.currentConversation.id !== prevProps.currentConversation.id) {
      let nonConnectedUsers = this.props.currentConversation.users.filter(user =>
        !(this.state.peers.find(peer => peer.id === user.id && peer.conversation === this.props.currentConversation.id && peer.connected)))
      nonConnectedUsers.forEach(user => {
        if (user.id !== this.props.currentUser.id) {
          console.log(user)

          this.createSignalingPeer(user.id)
        }
      })
    }
  }

  testSocket = () => {
    this.refs.signalServer.perform("send_signal", { payload: "hi", to: 2 })
  }

  render() {
    const loadingPhrases = ["Reticulating Splines...", "Loading..."]
    return (
      <ActionCableProvider url="ws://localhost:3000/cable">
      <ActionCable ref="signalServer" channel={{channel:"SignalChannel", token:localStorage.jwt}} onReceived={this.handleReceive} onConnected={this.handleConnect}/>
    {(this.state.isLoading) ? (
      <Loader size="massive" active>{loadingPhrases[Math.floor(Math.random()*loadingPhrases.length)]}</Loader>
    ) : (
      <div>
        {/* <button onClick={this.testSocket}></button> */}
        <MessageWindow currentPeers={this.state.peers.filter(peer => peer.conversation === this.props.currentConversation.id)} />
        <Sidebar />
      </div>
    )}
    </ActionCableProvider>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user,
    conversations: state.conversations,
    currentConversation: state.currentConversation
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    populateSplash: () => dispatch(fetchSplash()),
    addPeer: (peer) => dispatch(addPeer(peer)),
    addMessage: (action) => dispatch(action)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainContainer);