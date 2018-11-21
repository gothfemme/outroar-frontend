import React, { Component } from 'react';
import { Menu, Accordion } from 'semantic-ui-react';

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

  render() {
    let { activeIndex } = this.state
    return (
      <Menu inverted borderless size="huge" fixed="right" vertical style={{height:"100vh", overflow:"auto"}}>
        <Menu.Item header as="h1" style={{fontFamily: "'Fredoka One', cursive", textAlign:"center"}}>outroar</Menu.Item>
        <Menu.Item as="a" name="requests">
          Requests
        </Menu.Item>
        <Accordion exclusive={false} inverted>
            <Accordion.Title
              as={Menu.Menu}
              header
              active={activeIndex.includes(0)}
              content='Conversations'
              onClick={this.handleTitleClick}
              index={0}
            />
            <Accordion.Content active={activeIndex.includes(0)}>
              <Menu.Item link>hi</Menu.Item>
                            <Menu.Item link>hi</Menu.Item>
            </Accordion.Content>

            <Accordion.Title
              as={Menu.Menu}
              header
              active={activeIndex.includes(1)}
              content='Friends'
              onClick={this.handleTitleClick}
              index={1}
            />
            <Accordion.Content active={activeIndex.includes(1)}>
              <Menu.Item link>hi</Menu.Item>
                            <Menu.Item link>hi</Menu.Item>
            </Accordion.Content>

        </Accordion>
      </Menu>
    );
  }

}

export default Sidebar;