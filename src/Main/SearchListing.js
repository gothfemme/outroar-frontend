import React, { Component } from 'react';
import { List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import timeAgo from '../timeAgo';

class SearchListing extends Component {

  render() {
    return (
      <List.Item>
        <List.Icon name='star outline' size='large' verticalAlign='middle' />
        <List.Content>
          <List.Header as={Link} to={`/channels/${this.props.channel.id}`}>{this.props.channel.name}</List.Header>
          <List.Description as={Link} to={`/channels/${this.props.channel.id}`}>Created {timeAgo(this.props.channel.created_at)}</List.Description>
        </List.Content>
      </List.Item>
    );
  }

}

export default SearchListing;