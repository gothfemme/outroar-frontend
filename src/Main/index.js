import React, { Component } from 'react';
import Sidebar from './Sidebar';
import MessageWindow from '../MessageWindow';
import { Loader } from 'semantic-ui-react';
import { ActionCableProvider, ActionCable } from 'react-actioncable-provider';
import { connect } from 'react-redux';
import { fetchSplash } from '../store';
import Peer from 'simple-peer';
// import { createSignalingPeer, createPeer } from '../peerCreators';

class MainContainer extends Component {
  state = {
    isLoading: true,
    connected: false,
    peers: []
  }

  componentDidMount() {
    // console.log("mounted")
    this.props.populateSplash()
  }

  handleReceive = (resp) => {
    // console.log(resp)
    if (resp.action === "send_signal") {
      this.createPeer(resp)
    }
  }

  createSignalingPeer = (id) => {
    let peer = new Peer({ initiator: true, trickle: false })
      .on('signal', data => {
        this.refs.signalServer.perform('send_signal', { payload: data, to: id, conversation: this.props.currentConversation.id })
      })
    this.setState({
      peers: [...this.state.peers.filter(obj => obj.id !== id && obj.conversation !== this.props.conversation), { peerObj: peer, id: id, conversation: this.props.currentConversation.id }]
    });
    return peer
  }

  createPeer = (resp) => {
    console.log(resp)
    let peer;
    peer = this.state.peers.find(peer => peer.conversation === resp.conversation && peer.id === resp.from)
    // debugger
    peer = peer && peer.peerObj
    if (!peer) {
      peer = new Peer({ trickle: false })
        .on('signal', data => {
          this.refs.signalServer.perform('send_signal', { payload: data, to: resp.from, conversation: resp.conversation })
        })
      console.log("new peer i guess?")
    }
    peer.on('connect', () => {
        console.log('hit connect')
      })
      .on('data', raw => {
        console.log(raw.toString())
      })
      .on('stream', stream => {
        console.log(stream)
      })
      .signal(resp.payload)
    this.setState({
      peers: [...this.state.peers.filter(obj => obj.id !== resp.from && obj.conversation !== this.props.conversation), { peerObj: peer, id: resp.from, conversation: resp.currentConversation }]
    });
    return peer
  }

  handleConnect = () => {
    console.log("connected to websocket")
    this.setState({
      connected: true,
      isLoading: false
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if ((this.state.connected && this.state.connected !== prevState.connected) || (this.state.connected && this.props.conversations !== prevProps.conversations)) {
      // console.log(this.props.conversations)
    }
    if (this.props.currentConversation !== prevProps.currentConversation) {
      this.props.currentConversation.users.forEach(user => {
        this.createSignalingPeer(user.id)
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
        <MessageWindow />
        <Sidebar />
      </div>
    )}
    </ActionCableProvider>
    );
  }

}

const mapStateToProps = (state) => {
  return { conversations: state.conversations, currentConversation: state.currentConversation }
}

const mapDispatchToProps = (dispatch) => {
  return { populateSplash: () => dispatch(fetchSplash()) }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainContainer);