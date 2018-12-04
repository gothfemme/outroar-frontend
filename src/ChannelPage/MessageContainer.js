import React, { Component } from 'react';
import Message from './Message';
import { Comment, Ref, Menu, Popup } from 'semantic-ui-react';
import { connect } from 'react-redux';

class MessageContainer extends Component {

  render() {
    const { handleRef, conversation, currentUsers, currentUser, messageFormRef } = this.props
    return (
      <div style={{flex:"1 1 100%", display:"flex"}}>
        <Ref innerRef={handleRef}>
          <Comment.Group style={{padding:"1rem 1rem 1rem 1rem", flex:"1 1 auto", margin:"0", maxWidth:"100%", overflowY:"scroll"}}>

          {conversation.messages.map(message => <Message key={message.hasOwnProperty("is_whisper") ? message.created_at : message.id } message={message} isWhisper={message.hasOwnProperty("is_whisper")} isAuthor={message.hasOwnProperty("is_whisper") && message.is_whisper === "sent"}/>)}
          </Comment.Group>
        </Ref>
    { this.state.showUserMenu ? <Menu inverted vertical fitted="vertically" borderless style={{marginLeft:"auto", flex:"0 0 auto", marginTop:"0", borderRadius:"0", height:"100%", borderLeft: "1px solid #999"}}>
      <Menu.Item header >Users</Menu.Item>
      {currentUsers.map(user => ( user.id === currentUser.id ? <Menu.Item key={user.id}  link>{user.username} {conversation.owner === user.username && <i style={{float:"right"}} className="fas fa-crown"></i>}</Menu.Item> :
        <Popup
          inverted
          size="tiny"
          content={<Menu size="tiny" vertical inverted compact>
            {conversation.is_admin && <Menu.Item onClick={() => this.kickUser(user.id)}>Kick</Menu.Item>}
            <Menu.Item onClick={() => {this.setState({
            message: `/whisper ${user.username}`
          }, () => this.messageField.focus())}} link>Whisper</Menu.Item>
        </Menu>}
          position="left center"
          on="click"
          trigger={
        <Menu.Item key={user.id} link>{user.username} {conversation.owner === user.username && <i style={{float:"right"}} className="fas fa-crown"></i>}</Menu.Item>
      }/>
      ))}

    </Menu> : null}
  </div>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user,
    currentConversation: state.currentConversation
  }
}

export default connect(mapStateToProps)(MessageContainer);