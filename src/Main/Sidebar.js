import React, { Component } from 'react';
import { Header, Loader, Menu, Accordion, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setCurrentConversation } from '../store';

class Sidebar extends Component {
  state = {
    activeIndex: [0]
  }

  handleTitleClick = (e, itemProps) => {
    const { index } = itemProps;
    const { activeIndex } = this.state;
    let newState;

    if (activeIndex.indexOf(index) > -1) {
      newState = activeIndex.filter((i) => i !== index);
    } else {
      newState = [...activeIndex, index]
    }

    this.setState({ activeIndex: newState });
  };

  handleConversationClick = (c) => {
    this.props.setCurrentConversation(c)
  }

  render() {
    let { activeIndex } = this.state
    return (
      <Menu inverted borderless size="big" fixed="right" vertical style={{height:"100vh", overflow:"auto"}}>
        <Menu.Item header as="h1" style={{fontFamily: "'Fredoka One', cursive", textAlign:"center"}}>outroar</Menu.Item>
        <Menu.Item as="a" name="requests">
          <Icon name="address book"/>Friend Requests
        </Menu.Item>
        <Accordion exclusive={false} inverted>
            <Accordion.Title
              as={Menu.Menu}
              // header
              active={activeIndex.includes(0)}
              content={<React.Fragment>Conversations<Icon style={{float:"right"}} name="chat" /></React.Fragment>}
              style={{paddingRight:"1rem"}}
              onClick={this.handleTitleClick}
              index={0}
            />
            <Accordion.Content active={activeIndex.includes(0)}>
              {this.props.conversations.map(c => {
                return <Menu.Item active={c.id === this.props.currentConversation.id} onClick={() => this.handleConversationClick(c)} key={c.id} link>{c.name ? c.name : c.users.map(userObj => userObj.username).join(',  ')}</Menu.Item>
              })}
            </Accordion.Content>

            <Accordion.Title
              as={Menu.Menu}
              // header
              active={activeIndex.includes(1)}
              content={<React.Fragment>Friends<Icon style={{float:"right"}} name="users" /></React.Fragment>}
              style={{paddingRight:"1rem"}}
              onClick={this.handleTitleClick}
              index={1}
            />
            <Accordion.Content active={activeIndex.includes(1)}>
              <Menu.Item link>jortsbutch</Menu.Item>
            </Accordion.Content>

        </Accordion>
      </Menu>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    conversations: state.conversations,
    currentConversation: state.currentConversation
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentConversation: (conversation) => dispatch(setCurrentConversation(conversation))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);