import React, { Component } from 'react';
import { List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import timeAgo from '../timeAgo';
import { removeFavorite, addFavorite } from '../store';
import { connect } from 'react-redux';

class SearchListing extends Component {

  render() {
    return (
      <List.Item>
        <List.Icon
          link
          onClick={() => this.props.isFavorited ? this.props.removeFavorite(this.props.channel.id) : this.props.addFavorite(this.props.channel.id)}
          color={this.props.isFavorited ? "yellow" : "grey"} name={`star${this.props.isFavorited ? "" : " outline"}`} size='large' verticalAlign='middle' />
        <List.Content>
          <List.Header as={Link} to={`/channels/${this.props.channel.id}`}>{this.props.channel.name}</List.Header>
          <List.Description as={Link} to={`/channels/${this.props.channel.id}`}>Created {timeAgo(this.props.channel.created_at)}</List.Description>
        </List.Content>
      </List.Item>
    );
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    isFavorited: state.user.favorite_channels.includes(ownProps.channel.id)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addFavorite: (id) => dispatch(addFavorite(id)),
    removeFavorite: (id) => dispatch(removeFavorite(id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchListing);