import React, { Component } from 'react';
import { Segment, Input, Ref } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { sendMessage } from '../store';

class MessageForm extends Component {
  state = {
    message: ""
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
            let user = this.props.currentUsers.find(u => u.username === arr[1])
            if (user && this.props.peers[user.id]) {
              let whisper = { is_whisper: "received", created_at: Date.now(), user: { id: this.props.currentUser.id, username: this.props.currentUser.username, color: this.props.currentUser.color }, content: arr.slice(2).join(" ") }
              this.props.peers[user.id].send(JSON.stringify(whisper))
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
          Object.values(this.props.peers).forEach(peer => {
            if (peer.connected) {
              peer.send(JSON.stringify(action))
            }
          })
        })
    }
  }

  handleChange = e => this.setState({ message: e.target.value });

  render() {
    return (
      <Segment secondary style = { { borderRadius: "0", flex: "0 0 auto", marginTop: "0", width: "100%" } } >
      <form onSubmit={this.handleSubmit}>
        <Ref innerRef={this.props.setMessageInputRef}>
          <Input fluid
            action={{color:'pink', content:'Send'}}
            icon='chat'
            iconPosition='left'
            placeholder="Send a message..."
            onChange={this.handleChange}
            value={this.state.message}
            ></Input>
        </Ref>
      </form>
    </Segment>
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
    addWhisper: (body) => dispatch({ type: "ADD_MESSAGE", payload: body })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageForm);