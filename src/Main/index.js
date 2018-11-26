import React, { Component } from 'react';
import { List, Popup, Input, Icon, Container, Header, Loader } from 'semantic-ui-react';
import SearchListing from './SearchListing';
import { connect } from 'react-redux';
import { fetchSplash, addPeer } from '../store';
import debounce from 'lodash/debounce';
import { searchConversations, postConversation } from '../store/actions/adapter';

class MainContainer extends Component {
  state = {
    search: "",
    isLoading: true,
    isSearchLoading: false,
    isSearching: false,
    viewingFavorites: false,
    channels: []
  }

  componentDidMount() {
    this.setState({
      isLoading: false
    })
  }

  toggleFavorites = () => {
    this.debouncedSearch.cancel()
    this.setState({
      viewingFavorites: !this.state.viewingFavorites,
      isSearchLoading: false,
      isSearching: false,
      search: "",
    })
  }

  searchAndSet = () => {
    searchConversations(this.state.search)
      .then(res => {
        this.setState({
          channels: res,
          isSearchLoading: false
        });
      })
  }

  debouncedSearch = debounce(this.searchAndSet, 1000, { 'leading': false, 'trailing': true })

  handleChange = (e) => {
    if (e.target.value.length === 0 || !e.target.value.trim()) {
      this.debouncedSearch.cancel()
      return this.setState({
        search: "",
        isSearching: false,
        isSearchLoading: false,
        channels: []
      });
    }
    this.setState({
      search: e.target.value,
      isSearchLoading: true,
      isSearching: true,
      viewingFavorites: false
    }, this.debouncedSearch)
  }

  newChannel = () => {
    this.setState({
      isLoading: true
    }, () => {
      postConversation(this.state.search)
        .then(resp => this.props.history.push(`/channels/${resp.id}`))
    });
  }

  handleLogOut = () => {
    localStorage.clear()
    this.props.history.push('/login')
  }

  render() {
    const loadingPhrases = ["Reticulating Splines...", "Loading..."]
    let { viewingFavorites, isSearchLoading, isLoading, isSearching, search, channels } = this.state
    return (
      <React.Fragment>
        {(isLoading) ? (
          <Loader size="massive" active>{loadingPhrases[Math.floor(Math.random()*loadingPhrases.length)]}</Loader>
          ) : (
          <div>
            <Container style={{height:"100vh", width:"100vw"}} textAlign="center">
              <div style={{position:"fixed", top:"0", right:"0", paddingTop:"1rem"}}>
                <span><h5 style={{display:"inline", paddingRight:"1rem"}}>{this.props.currentUser.username}</h5></span>
                <Popup
                  inverted
                  content="Log out"
                  trigger={
                    <span style={{marginRight:"1rem", cursor:"pointer"}}>
                      <Icon link color="grey" onClick={this.handleLogOut} size="big" name="log out"></Icon>
                    </span>}
                  />
              </div>
              <Header color="pink" style={{fontFamily: "'Fredoka One', cursive", paddingTop:"10vh", fontSize:"5rem"}}>outroar</Header>
              <Container style={{textAlign:"center"}}>
                <Input  input={<input onChange={this.handleChange} value={search}></input>} loading={isSearchLoading} icon="search" style={{width:"35vw", marginRight:"1.5rem"}} placeholder="Find a channel..."></Input>
                <Popup
                  content="View favorite channels"
                  trigger={<Icon link onClick={this.toggleFavorites} color={viewingFavorites ? "yellow" : "grey"} size="big" style={{ verticalAlign:"-0.25rem", cursor:"pointer" }} name={viewingFavorites ? "star" : "star outline"} />}
                  position="top center"
                  inverted
                 />
                 <List relaxed style={{width:"39vw", textAlign:"left", marginRight:"auto", marginLeft:"auto", marginBottom:"4rem"}}>
                   {isSearching && !isSearchLoading &&channels.length > 0 && !channels.find(channel => channel.name === search) ? (
                     <List.Item>
                       <List.Icon style={{paddingLeft:"0.2rem", paddingRight:"0.6rem"}} size="large" verticalAlign="middle" name='plus' />
                       <List.Content onClick={this.newChannel}>
                         <List.Header as="a"> "{search}" is free as a name.</List.Header>
                         <List.Description as="a">Create a new channel?</List.Description>
                       </List.Content>
                     </List.Item>
                   ) : null}
                   {viewingFavorites ? (
                     <List.Item>
                    <List.Content>
                      <List.Header>Channels you've favorited.</List.Header>
                      {channels.length === 0 && <List.Description>That is, if you <em>had</em> any.</List.Description>}
                    </List.Content>
                  </List.Item>
                                      ) : null}
                   {!isSearchLoading && channels.map(channel => <SearchListing key={channel.id} channel={channel}/>)}
                   {isSearching && !isSearchLoading && channels.length === 0 ? (<List.Item>
                      <List.Icon size="large" verticalAlign="middle" name='question' />
                      <List.Content onClick={this.newChannel}>
                        <List.Header as="a">No results found for "{this.state.search}".</List.Header>
                        <List.Description as="a">Create a new channel with that name?</List.Description>
                      </List.Content>
                    </List.Item>) : null}
                </List>
              </Container>
            </Container>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user,
    // conversations: state.conversations,
    // currentConversation: state.currentConversation
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    populateSplash: () => dispatch(fetchSplash()),
    addPeer: (peer) => dispatch(addPeer(peer)),
    addMessage: (action) => dispatch(action)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainContainer);