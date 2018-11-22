import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Loader, Header, Input, Segment, Container, Comment } from 'semantic-ui-react';
import Message from './Message';

class MessageWindow extends Component {
  state = {
    message: "",
    isLoading: true,
    messages: []
  }

  handleSubmit = (e) => {
    e.preventDefault()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentConversation !== this.props.currentConversation) {
      console.log('aaaaa')
      fetch(`http://localhost:3000/conversations/${this.props.currentConversation.id}`)
        .then(r => r.json())
        .then(json => {
          console.log(json)
          this.setState({
            messages: json.messages,
            isLoading: false
          });
        })
    }
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

            {this.state.isLoading ? null : this.state.messages.map(message => <Message key={message.id} message={message}/>)}
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
  return { currentConversation: state.currentConversation }
}

export default connect(mapStateToProps)(MessageWindow);