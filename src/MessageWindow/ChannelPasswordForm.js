import React, { Component } from 'react';
import { Modal, Button, Input } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { addChannelPassword } from '../store';

class ChannelPasswordForm extends Component {
  state = {
    password: ""
  }

  handleChange = e => {
    this.setState({
      password: e.target.value
    });
  }

  addPassword = () => {
    this.props.addChannelPassword({ password: this.state.password }, this.props.currentConversation.id)
    this.setState({
      channelPassword: ''
    });
    this.props.close()
  }

  render() {
    return (
      <Modal size="small" open={this.props.open} onClose={this.props.close}>
        <Modal.Header>Make Channel Private</Modal.Header>
        <Modal.Content>
          <Input onChange={this.handleChange} value={this.state.password} icon="lock" type="password" fluid placeholder="Create a channel password..."></Input>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={this.props.close}>Nevermind</Button>
          <Button positive onClick={this.addPassword} content='Submit' />
        </Modal.Actions>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentConversation: state.currentConversation
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addChannelPassword: (password, id) => dispatch(addChannelPassword(password, id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelPasswordForm);