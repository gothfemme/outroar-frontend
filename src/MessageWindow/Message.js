import React, { Component } from 'react';
import { Comment } from 'semantic-ui-react';

class Message extends Component {

  render() {
    const { message } = this.props
    return (
      <Comment>
        <Comment.Avatar src='https://t4.ftcdn.net/jpg/02/15/84/43/240_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg' />
        <Comment.Content>
          <Comment.Author as='a'>{message.user.username}</Comment.Author>
          <Comment.Metadata>
            <div>Today at 5:42PM</div>
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