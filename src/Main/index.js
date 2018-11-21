import React, { Component } from 'react';
import Sidebar from './Sidebar';
import MessageWindow from '../MessageWindow';
import { Loader } from 'semantic-ui-react';
import { ActionCableProvider, ActionCable } from 'react-actioncable-provider';
import { connect } from 'react-redux';
import { fetchSplash } from '../store';
import { SimplePeer } from 'simple-peer';

class MainContainer extends Component {
  state = {
    isLoading: true,
    connected: false
  }

  componentDidMount() {
    console.log("mounted")
    this.props.populateSplash()
  }

  handleReceive = (resp) => {
    console.log(resp)
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
      console.log(this.props.conversations)
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
  return { conversations: state.conversations }
}

const mapDispatchToProps = (dispatch) => {
  return { populateSplash: () => dispatch(fetchSplash()) }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainContainer);