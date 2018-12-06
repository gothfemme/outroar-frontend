import React, { Component } from 'react';
import { Segment, Input, Button, Popup, Header } from 'semantic-ui-react';
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
      <div style={{width:"100vw", height:"100vh"}}>
        <Segment textAlign="center" size="big" style={{borderRadius:"0", display: "flex", justifyContent:"space-between", alignItems:"center", width:"100%", zIndex:"2", marginBottom:"30vh"}}>

          <div style={{flex:"0 1 auto", float:"left"}}>
            <Popup
              inverted
              position="bottom center"
              content="Home"
              trigger={
                <Header className="link" as="h2" color="pink" onClick={this.props.leaveChannel} style={{ fontFamily: "'Fredoka One', cursive", cursor:"pointer" }}>outroar</Header>
              }
            />
          </div>
        </Segment>
        <Segment style={{width:"30%", margin:"auto"}}>
          <p>This channel is locked and requires a password.</p>
          <form onSubmit={this.channelLogin}>
            <Popup
              position="right center"
              basic
              size="tiny"
              wide="very"
              style={{color: "#9f3a38", borderColor: "#e0b4b4", background: "#fff6f6"}}
              open={this.state.hasError}
              content="Password is invalid."
              trigger={
            <Input error={this.state.hasError} type="password" fluid icon="lock" onChange={this.handleChange} value={this.state.password} placeholder="Enter password..." />
          } />
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