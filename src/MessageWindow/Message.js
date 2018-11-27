import React, { Component } from 'react';
import { Comment } from 'semantic-ui-react';

class Message extends Component {

  render() {
    const { message } = this.props
    const colorKey = {
      "red": "#db2828",
      "orange": "#f2711c",
      "yellow": "#fbbd08",
      "green": "#21ba45",
      "teal": "#00b5ad",
      "blue": "#2185d0",
      "violet": "#6435c9",
      "purple": "#a333c8",
      "pink": "#e03997",
      "black": "#1b1c1d"
    }
    const d = new Date(message.created_at)
    return (
      <Comment>
        <Comment.Content>
          <Comment.Author as="a" style={{color: message.user.color ? colorKey[message.user.color] : colorKey["black"]}}>{message.user.username}</Comment.Author>
          <Comment.Metadata>
            <div>{`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.getHours() > 12 ? d.getHours() - 12 : d.getHours()}:${(d.getMinutes() < 10 ? "0" : "") + d.getMinutes()} ${d.getHours() > 12 ? "PM" : "AM"}`}</div>
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