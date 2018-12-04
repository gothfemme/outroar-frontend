import React, { Component } from 'react';
import { Dropdown, Segment, Popup, Icon, Header } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { addFavorite, removeFavorite, toggleUserMenu, setMyStream, setModal, addChannelPassword, setMute } from '../store';

class ChannelHeader extends Component {

  toggleVideo = () => {
    if (this.props.channelSettings.myStream.stream) {
      this.props.channelSettings.myStream.stream.getTracks().forEach(track => track.stop())
      this.props.setMyStream(null, "")
      Object.values(this.props.peers).forEach(peer => {
        if (peer.connected) {
          peer.send(JSON.stringify({ action: "video_stopped", user_id: this.props.currentUser.id }))
        }
      })
      return
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        this.props.setMyStream(stream, window.URL.createObjectURL(stream))
        Object.values(this.props.peers).forEach(peer => {
          if (peer.connected) {
            peer.addStream(stream)
          }
        })
      })
  }

  toggleMute = () => {
    this.props.channelSettings.myStream.stream.getAudioTracks()[0].enabled = !this.props.channelSettings.myStream.stream.getAudioTracks()[0].enabled
    this.props.setMute(!this.props.channelSettings.myStream.stream.getAudioTracks()[0].enabled)
  }

  render() {
    const { conversation, isFavorited, channelSettings } = this.props
    return (
      <Segment textAlign="center" size="big" style={{borderRadius:"0", display: "flex", justifyContent:"space-between", alignItems:"center", flex:"0 0 auto", width:"100%", zIndex:"2", marginBottom:"0"}}>

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

        <div style={{flex:"0 1 auto"}}>
            {conversation.has_password && <Popup
              inverted
              position="bottom center"
              content="Private"
              trigger={
            <Icon name="lock" size="small" style={{marginLeft:".3rem"}} />
          }
        />}
          <Dropdown pointing text={conversation.name}>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => isFavorited ? this.props.removeFavorite(conversation.id) : this.props.addFavorite(conversation.id)}>
                <Icon
                  color={isFavorited ? "yellow" : "default"} name={`star${isFavorited ? "" : " outline"}`}
                  ></Icon> {isFavorited ? "Remove from favorites" : "Add to favorites"}
              </Dropdown.Item>
              {conversation.is_admin && <React.Fragment>
                <Dropdown.Divider />
                <Dropdown.Header>Admin Settings</Dropdown.Header>
                <Dropdown.Item icon={conversation.has_password ? "unlock" : "lock"} onClick={() => {
                  if (conversation.has_password) {
                    return this.props.setChannelPassword({password: null}, conversation.id)
                  }
                  this.props.setModal(true)
                }
              } text={conversation.has_password ? "Make Channel Public" :"Make Channel Private"}/>
                <Dropdown.Item onClick={this.props.deleteRoom} icon="times" text="Delete Channel"/>
              </React.Fragment>
            }
            </Dropdown.Menu>
          </Dropdown>

      </div>

      <div style={{flex:"0 1 auto", float:"right"}}>
        { channelSettings.myStream.stream ?
          (
            <Popup
              inverted
              position="bottom right"
              content={channelSettings.isMuted ? "Unmute" : "Mute"}
              trigger={<i onClick={this.toggleMute} className={`link fas fa-microphone${channelSettings.isMuted ? "-slash" : ""}`} style={{cursor:"pointer", paddingRight:"1.5rem"}}></i>}
            />) : null
          }
          <Popup
            inverted
            position="bottom right"
            content={channelSettings.myStream.stream ? "Stop Video" : "Start Video"}
            trigger={
          <i onClick={this.toggleVideo} className={`link fas fa-video${channelSettings.myStream.stream ? "-slash" : ""}`} style={{cursor:"pointer", paddingRight:"1rem"}}></i>}
        />
        <Popup
          inverted
          position="bottom right"
          content="Toggle User List"
          trigger={
        <i onClick={this.props.toggleUserMenu} className="fas fa-users" style={{float:"right", cursor:"pointer", paddingRight:".5rem"}}></i>}
      />
      </div>

      </Segment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser,
    conversation: state.currentConversation,
    channelSettings: state.channelSettings,
    isFavorited: state.currentUser.favorite_channels.includes(state.currentConversation.id)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addFavorite: (id) => dispatch(addFavorite(id)),
    removeFavorite: (id) => dispatch(removeFavorite(id)),
    toggleUserMenu: () => dispatch(toggleUserMenu()),
    setMyStream: (stream, url) => dispatch(setMyStream(stream, url)),
    setModal: (boolean) => dispatch(setModal(boolean)),
    setChannelPassword: (password, id) => dispatch(addChannelPassword(password, id)),
    setMute: (boolean) => dispatch(setMute(boolean)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelHeader);