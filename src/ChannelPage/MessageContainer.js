import React, { Component } from 'react';
import Message from './Message';
import { Comment, Ref } from 'semantic-ui-react';
import { connect } from 'react-redux';

class MessageContainer extends Component {
  state = { node: null }

  componentDidUpdate(prevProps) {
    if ((prevProps.currentConversation.messages.length < this.props.currentConversation.messages.length) || (prevProps.channelSettings.currentUsers.filter(u => u.stream).length !== this.props.channelSettings.currentUsers.filter(u => u.stream).length) || (prevProps.channelSettings.myStream.stream !== this.props.channelSettings.myStream.stream)) {
      this.state.node.scrollTo({ top: this.state.node.scrollHeight })
    }
  }

  handleRef = (el) => {
    this.setState({ node: el }, () => {
      this.state.node.scrollTo({ top: this.state.node.scrollHeight })
    });
  }

  render() {
    return (
      <Ref innerRef={this.handleRef}>
        <Comment.Group style={{padding:"1rem 1rem 1rem 1rem", flex:"1 1 auto", margin:"0", maxWidth:"100%", overflowY:"scroll"}}>
          {this.props.currentConversation.messages.map(message => <Message key={message.hasOwnProperty("is_whisper") ? message.created_at : message.id } message={message} isWhisper={message.hasOwnProperty("is_whisper")} isAuthor={message.hasOwnProperty("is_whisper") && message.is_whisper === "sent"}/>)}
        </Comment.Group>
      </Ref>

    );
  }

}

const mapStateToProps = (state) => {
  return {
    currentConversation: state.currentConversation,
    channelSettings: state.channelSettings
  }
}

export default connect(mapStateToProps)(MessageContainer);