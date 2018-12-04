import React from 'react';
import { Popup, Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setMessageFormText } from '../store';

const UserList = ({ currentConversation, currentUser, channelSettings, kickUser, setMessageFormText }) => {
  return (
    <Menu inverted vertical fitted="vertically" borderless style={{marginLeft:"auto", flex:"0 0 auto", marginTop:"0", borderRadius:"0", height:"100%", borderLeft: "1px solid #999"}}>
    <Menu.Item header>Users</Menu.Item>
    {channelSettings.currentUsers.map(user => (
      user.id === currentUser.id ? (
        <Menu.Item key={user.id}  link>{user.username} {currentConversation.owner === user.username && <i style={{float:"right"}} className="fas fa-crown"></i>}</Menu.Item>
      ) :(
      <Popup inverted key={user.id} size="tiny" position="left center" on="click"
        trigger={<Menu.Item key={user.id} link>{user.username} {currentConversation.owner === user.username && <i style={{float:"right"}} className="fas fa-crown"></i>}</Menu.Item>}
        content={
          <Menu size="tiny" vertical inverted compact>
          {currentConversation.is_admin && <Menu.Item onClick={() => kickUser(user.id)}>Kick</Menu.Item>}
          <Menu.Item link onClick={() =>{setMessageFormText(`/whisper ${user.username}`)}}>Whisper</Menu.Item>
          </Menu>}
        />)
      ))}
    </Menu>
  )
};

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser,
    currentConversation: state.currentConversation,
    channelSettings: state.channelSettings
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setMessageFormText: (text) => dispatch(setMessageFormText(text))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserList);