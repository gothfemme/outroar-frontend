import React from 'react';
import { Comment } from 'semantic-ui-react';

const Message = ({ message, isWhisper, isAuthor }) => {
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
        <Comment.Content style={{fontStyle:isWhisper ? "italic" : "initial"}}>
          <Comment.Author as="a" style={{color:isWhisper ? "rgb(120,120,120)" : (message.user.color ? colorKey[message.user.color] : colorKey["black"])}}>{isWhisper ? (<span>Whisper {isAuthor ? "to" : "from"} </span>) : null}<span>{message.user.username}</span></Comment.Author>
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

export default Message;