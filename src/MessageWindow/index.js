import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Loader, Header, Input, Segment, Container, Comment } from 'semantic-ui-react';
import Message from './Message';
import { sendMessage } from '../store';

class MessageWindow extends Component {
  state = {
    message: "",
    isLoading: false,
    // messages: []
  }

  handleSubmit = (e) => {
    e.preventDefault()

    const newMessage = {
      content: this.state.message,
      conversation_id: this.props.currentConversation.id
    }

    this.props.sendMessage(newMessage)
      .then(json => {
        this.props.currentPeers.forEach(peer => {
          // console.log(peer)
          if (peer.connected) {

            peer.send(json)
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
    return (
      <div style={{height:"100vh"}}>
        <Segment textAlign="center" size="big" style={{borderRadius:"0", position:"fixed", paddingRight:"21rem", top:"0", width:"100%"}}>
          <Header as="h5">{conversation.name ? conversation.name : conversation.users.map(userObj =>  userObj.username).join(', ')}</Header>

        </Segment>

        {this.state.isLoading ? (<div style={{width:"100%", paddingTop:"45vh", paddingRight:"20rem"}}><Loader size="massive" inline='centered' active/></div>) : (<div style={{paddingTop:"5rem", marginRight:"25rem", paddingLeft:"2rem"}}>
          <Comment.Group style={{maxWidth:"100%"}}>

            {this.state.isLoading ? null : this.props.currentConversation.messages.map(message => <Message key={message.id} message={message}/>)}
          </Comment.Group>
        </div>)}
        <Segment secondary style={{borderRadius:"0", position:"fixed", paddingRight:"21rem", bottom:"0", width:"100%"}}>
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
  return { currentUser: state.user, currentConversation: state.currentConversation, currentPeers: state.peers.filter(peer => peer.conversation === state.currentConversation.id) }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendMessage: (message) => dispatch(sendMessage(message))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageWindow);