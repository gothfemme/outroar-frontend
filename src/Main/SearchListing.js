import React from 'react';
import { List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import timeAgo from '../timeAgo';
import { removeFavorite, addFavorite } from '../store';
import { connect } from 'react-redux';

const SearchListing = ({ channel, isFavorited, addFavorite, removeFavorite }) => {
  return (
    <List.Item>
        <List.Icon
          link
          onClick={() => isFavorited ? removeFavorite(this.props.channel.id) : addFavorite(channel.id)}
          color={isFavorited ? "yellow" : "grey"}
          name={`star${isFavorited ? "" : " outline"}`}
          size='large'
          verticalAlign='middle'
        />
        <List.Content>
          <List.Header as={Link} to={`/channels/${channel.id}`}>{channel.name}</List.Header>
          <List.Description as={Link} to={`/channels/${channel.id}`}>Created {timeAgo(channel.created_at)} by {channel.owner}</List.Description>
        </List.Content>
      </List.Item>
  );
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