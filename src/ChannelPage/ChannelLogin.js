import React, { Component } from 'react';
import { Segment, Input, Button } from 'semantic-ui-react';
import { validateAndLoginToChannel } from '../store';
import { connect } from 'react-redux';

class ChannelLogin extends Component {
  state = { password: "", hasError: false }

  channelLogin = (e) => {
    e.preventDefault()
    this.props.validateAndLoginToChannel({ password: this.state.password }, this.props.currentConversation.id)
      .then(r => {
        if (r === "ERROR") {
          this.setState({
            hasError: true
          });
        }
      })
    this.setState({
      password: ''
    });
  }

  handleChange = e => this.setState({ password: e.target.value })

  render() {
    return (
      <div style={{width:"100vw", height:"100vh", paddingTop:"40vh"}}>
        <Segment style={{width:"30%", margin:"auto"}}>
          <p>This channel is locked and requires a password.</p>
          <form onSubmit={this.channelLogin}>
            <Input error={this.state.hasError} type="password" fluid icon="lock" onChange={this.handleChange} value={this.state.password} placeholder="Enter password..." />
            <Button color="pink" fluid style={{marginTop:"1rem"}}>Let me in!</Button>
          </form>
        </Segment>
      </div>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    currentConversation: state.currentConversation
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    validateAndLoginToChannel: (password, id) => dispatch(validateAndLoginToChannel(password, id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelLogin);