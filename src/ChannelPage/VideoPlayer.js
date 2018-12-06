import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';

class VideoPlayer extends Component {
  state = {
    isMuted: false
  }

  muteToggle = () => {
    this.setState({
      isMuted: !this.state.isMuted
    });
  }

  setRef = (el) => {
    this.player = el
    if (this.player) {
      this.player.srcObject = this.props.stream
    }
  }

  render() {
    return (
      <div style={{textAlign:"center", padding:"1rem", flex:"1 1 20%", maxWidth:"36vw", minWidth:"10vw"}}>
          <div style={{position:"relative"}}>
            <video muted={this.props.isMe || this.state.isMuted} autoPlay={true} ref={this.setRef} style={{borderRadius:"1%", boxShadow:"0 1px 5px #000", width:"100%"}}>
            </video>
            {!this.props.isMe && <div style={{position:"absolute", top:"0", paddingTop:".5rem", paddingLeft:".5rem"}}>
              <Icon onClick={this.muteToggle} style={{cursor:"pointer", textShadow:"0 0 2px rgb(0,0,0,0.5)"}} size="big" name={this.state.isMuted ? "volume off" : "volume up"} />
            </div>}
          </div>
          <div>{this.props.username}</div>
      </div>
    );
  }
}

export default VideoPlayer;