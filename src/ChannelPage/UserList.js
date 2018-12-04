import React from 'react';
import { Popup, Menu } from 'semantic-ui-react';

const UserList = ({ conversation, currentUser, messageField }) => (
  <Menu inverted vertical fitted="vertically" borderless style={{marginLeft:"auto", flex:"0 0 auto", marginTop:"0", borderRadius:"0", height:"100%", borderLeft: "1px solid #999"}}>
    <Menu.Item header >Users</Menu.Item>
    {this.state.currentUsers.map(user => ( user.id === this.props.currentUser.id ? <Menu.Item key={user.id}  link>{user.username} {conversation.owner === user.username && <i style={{float:"right"}} className="fas fa-crown"></i>}</Menu.Item> :
      <Popup
        inverted
        key={user.id}
        size="tiny"
        content={<Menu size="tiny" vertical inverted compact>
          {conversation.is_admin && <Menu.Item onClick={() => this.kickUser(user.id)}>Kick</Menu.Item>}
          <Menu.Item onClick={() =>
          {messageField.firstElementChild.value = `/whisper ${user.username}`;
          messageField.firstElementChild.focus()}}
          link>Whisper</Menu.Item>
      </Menu>
}
position = "left center"
on = "click"
trigger = {
<Menu.Item key={user.id} link>{user.username} {conversation.owner === user.username && <i style={{float:"right"}} className="fas fa-crown"></i>}</Menu.Item>
}
/>
))
}

<
/Menu>
);

export default UserList;