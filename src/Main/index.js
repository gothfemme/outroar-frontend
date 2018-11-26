import React, { Component } from 'react';
import { List, Popup, Input, Icon, Container, Header, Loader } from 'semantic-ui-react';
import SearchListing from './SearchListing';
import { connect } from 'react-redux';
import { fetchSplash, addPeer } from '../store';
import { searchConversations } from '../store/actions/adapter';

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
    this.setState({
      viewingFavorites: !this.state.viewingFavorites
    })
  }

  handleChange = (e) => {
    if (e.target.value.length === 0 || !e.target.value.trim()) {
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
    }, () => {
      searchConversations(this.state.search)
        .then(res => {
          console.log(res)
          this.setState({
            channels: res,
            isSearchLoading: false
          });
        })
    })
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
              <Popup
                inverted
                content="Log out?"
                trigger={
              <div style={{ marginRight:"1rem", float:"right", cursor:"pointer"}}>
                <Icon color="grey" onClick={this.handleLogOut} size="big" name="log out"></Icon>
              </div>} />
              <Header color="pink" style={{fontFamily: "'Fredoka One', cursive", paddingTop:"10vh", fontSize:"5rem"}}>outroar</Header>
              <Container style={{textAlign:"center"}}>
                <Input  input={<input onChange={this.handleChange} value={search}></input>} loading={isSearchLoading} icon="search" style={{width:"35vw", marginRight:"1.5rem"}} placeholder="Find a channel..."></Input>
                <Popup
                  content="View favorite channels"
                  trigger={<Icon onClick={this.toggleFavorites} color={viewingFavorites ? "yellow" : "grey"} size="big" style={{ verticalAlign:"-0.25rem", cursor:"pointer" }} name={viewingFavorites ? "star" : "star outline"} />}
                  position="top center"
                  inverted
                 />
                 <List divided relaxed style={{width:"35vw", textAlign:"left", marginRight:"auto", marginLeft:"auto"}}>
                   {channels.map(channel => <SearchListing key={channel.id} channel={channel}/>)}
                   {isSearching && !isSearchLoading && channels.length === 0 ? (<List.Item>
      <List.Icon name='question' />
      <List.Content>No results found for {this.state.search}. Create a new channel with that name?</List.Content>
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