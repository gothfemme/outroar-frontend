import React, { Component } from 'react';
import { Modal, Button, Input } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { addChannelPassword, setModal } from '../store';

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
    this.props.setModal(false)
  }

  render() {
    return (
      <Modal size="small" open={this.props.channelSettings.modalOpen} onClose={() => this.props.setModal(false)}>
        <Modal.Header>Make Channel Private</Modal.Header>
        <Modal.Content>
          <Input onChange={this.handleChange} value={this.state.password} icon="lock" type="password" fluid placeholder="Create a channel password..."></Input>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => this.props.setModal(false)}>Nevermind</Button>
          <Button positive onClick={this.addPassword} content='Submit' />
        </Modal.Actions>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentConversation: state.currentConversation,
    channelSettings: state.channelSettings,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addChannelPassword: (password, id) => dispatch(addChannelPassword(password, id)),
    setModal: (boolean) => dispatch(setModal(boolean)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelPasswordForm);