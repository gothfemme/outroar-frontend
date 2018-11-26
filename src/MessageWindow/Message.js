import React, { Component } from 'react';
import { Comment } from 'semantic-ui-react';

class Message extends Component {

  render() {
    const { message } = this.props
    const d = new Date(message.created_at)
    return (
      <Comment>
        <Comment.Content>
          <Comment.Author as='a'>{message.user.username}</Comment.Author>
          <Comment.Metadata>
            <div>{`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.getHours() > 12 ? d.getHours() - 12 : d.getHours()}:${d.getMinutes()} ${d.getHours() > 12 ? "PM" : "AM"}`}</div>
          </Comment.Metadata>
          <Comment.Text>
            {message.content}
          </Comment.Text>
        </Comment.Content>
      </Comment>
    );
  }

}

export default Message;