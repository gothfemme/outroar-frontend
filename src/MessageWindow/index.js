import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Ref, Loader, Header, Input, Segment, Container, Comment } from 'semantic-ui-react';
import Message from './Message';
import { sendMessage } from '../store';

class MessageWindow extends Component {
  state = {
    message: "",
    isLoading: false,
    isVideoCall: true,
    messageContainer: null,
    currentUserVideo: null
    // messages: []
  }

  handleSubmit = (e) => {
    e.preventDefault()

    const newMessage = {
      content: this.state.message,
      conversation_id: this.props.currentConversation.id
    }
    this.setState({
      message: ""
    });

    this.props.sendMessage(newMessage)
      .then(action => {
        this.props.currentPeers.forEach(peer => {
          // console.log(peer)
          if (peer.connected) {

            peer.send(JSON.stringify(action))
          }
        })
      })
  }
  handleRef = node => {
    this.setState({
      messageContainer: node
    }, () => this.state.messageContainer.scrollTo({ top: this.state.messageContainer.scrollHeight }));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentConversation.messages !== this.props.currentConversation.messages) {
      if (this.state.messageContainer) {
        this.state.messageContainer.scrollTo({ top: this.state.messageContainer.scrollHeight })
      }
      // window.scrollTo({ top: this.messageContainer.scrollHeight })
    }
    if (this.refs.video1) {

      // if (this.refs.video1.srcObject !== this.state.stream) {
      //   this.refs.video1.srcObject = this.state.currentUserVideo
      //   this.refs.video1.play()
      // }
    }
    // else if (this.refs.video2.srcObject !== this.state.theirStream) {
    //   this.refs.theirVideo.srcObject = this.state.theirStream
    // }
  }

  startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        this.setState({
          currentUserVideo: stream
        });
        this.props.currentPeers.forEach(peer => {
          // console.log(peer)
          if (peer.connected) {

            peer.addStream(stream)
          }
        })
      })
  }


  handleChange = (e) => {
    this.setState({
      message: e.target.value
    });
  }

  render() {
    const conversation = this.props.currentConversation
    if (Object.entries(conversation).length === 0) {
      return <Container style={{height:"100vh", paddingRight:"20rem"}} textAlign="center">
        <Header color="pink" style={{fontFamily: "'Fredoka One', cursive", paddingTop:"45vh", fontSize:"5rem"}}>outroar</Header>
      </Container>
    }
    // console.log(this.messages)
    return (
      <div style={{height:"100vh", width:"100vw", display: "flex", flexDirection: "column", paddingRight:"20rem"}}>
        <Segment textAlign="center" size="big" style={{borderRadius:"0", flex:"0 0 auto", width:"100%", zIndex:"2", marginBottom:"0"}}>
          <Icon onClick={this.startVideo} name="video" style={{float:"left"}}></Icon>
          <Header as="h5" style={{display:"inline"}}>{conversation.name ? conversation.name : conversation.users.map(userObj =>  userObj.username).join(', ')}</Header>

        </Segment>

        {this.state.isVideoCall ? (

            <Segment inverted style={{ borderRadius:"0", display:"flex", margin:"0", flexDirection:"row", flexBasis:"auto", minHeight:"50vh", flexWrap:"wrap", alignItems:"center"}}>

              <div style={{flex:"1 1 auto", height:"33vh"}}>
              <video muted ref="video1" style={{maxHeight:"100%", maxWidth:"100%"}}>
              </video>
            </div>
              {/* <video ref="video2" controls style={{flex:"1 1 auto", width:"25%", height: "auto", padding:"1rem"}}>
              </video> */}
              {/* <video controls style={{flex:"1 1 auto", width:"auto", height: "auto", padding:"1rem"}}>
              </video> */}


            </Segment>
        ) : null}


        {this.state.isLoading ? (<div style={{width:"100%", paddingTop:"45vh", paddingRight:"20rem"}}><Loader size="massive" inline='centered' active/></div>) : (

          <Ref innerRef={this.handleRef}>
          <Comment.Group style={{padding:"1rem", overflowY:"scroll", margin:"0", maxWidth:"100%"}}>

            {this.state.isLoading ? null : this.props.currentConversation.messages.map(message => <Message key={message.id} message={message}/>)}
          </Comment.Group>
        </Ref>
      )}

        <Segment secondary style={{borderRadius:"0", flex:"0 0 auto", marginTop:"0", width:"100%"}}>
          <form onSubmit={this.handleSubmit}>
          <Input fluid
            disabled={this.state.isLoading}
            action={{color:'pink', content:'Send'}}
            icon='chat'
            iconPosition='left'
            placeholder="Send a message..."
            onChange={this.handleChange}
            value={this.state.message}
            ></Input>
          </form>
        </Segment>

      </div>
    );
  }

}

const mapStateToProps = (state) => {
  return { currentUser: state.user, currentConversation: state.currentConversation }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendMessage: (message) => dispatch(sendMessage(message))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageWindow);