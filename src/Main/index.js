import React, { Component } from 'react';
import { Dropdown, Menu, List, Popup, Input, Icon, Container, Header, Loader } from 'semantic-ui-react';
import SearchListing from './SearchListing';
import { connect } from 'react-redux';
import { addPeer, changeColor } from '../store';
import debounce from 'lodash/debounce';
import { getSplash, searchConversations, postConversation } from '../store/actions/adapter';

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
    getSplash()
      .then(res => {
        console.log(res)
        this.setState({
          viewingFavorites: true,
          channels: res,
          isLoading: false
        })
      })
  }

  toggleFavorites = () => {
    this.debouncedSearch.cancel()
    this.setState({
      viewingFavorites: !this.state.viewingFavorites,
      isSearchLoading: !this.state.viewingFavorites,
      isSearching: false,
      search: "",
      channels: []
    }, () => {
      if (this.state.viewingFavorites) {
        getSplash()
          .then(res => {
            this.setState({
              isSearchLoading: false,
              channels: res
            })
          })
      }
    })
  }

  handleColorChange = (e) => {
    // console.log(e.target.innerText.toLowerCase())
    this.props.changeColor(e.target.innerText.toLowerCase())
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
    const loadingPhrases = ["Reticulating Splines...", "Loading...", "Perturbing Matrices...", "Destabilizing Orbital Payloads...", "Inserting Chaos Generator..."]
    let { viewingFavorites, isSearchLoading, isLoading, isSearching, search, channels } = this.state
    const colorKey = {
      "red": "#db2828",
      "orange": "#f2711c",
      "yellow": "#fbbd08",
      "green": "#21ba45",
      "teal": "#00b5ad",
      "blue": "#2185d0",
      "violet": "#6435c9",
      "purple": "#a333c8",
      "pink": "#e03997",
      "black": "#1b1c1d"
    }
    const colors = ["red", "orange", "yellow", "green", "teal", "blue", "violet", "purple", "pink", "black"]
    if (!localStorage.jwt) {
      return this.props.history.push('/login')
    }
    return (
      <React.Fragment>
        {(isLoading) ? (
          <Loader size="massive" active>{loadingPhrases[Math.floor(Math.random()*loadingPhrases.length)]}</Loader>
          ) : (
          <div>
            <Container style={{height:"100vh", width:"100vw"}} textAlign="center">
              {/* <div style={{position:"fixed", top:"0", right:"0", paddingTop:"1rem"}}> */}
              <Menu text size="massive" style={{textAlign:""}} fluid fixed="top">
                <Menu.Menu position="right">
                {/* <Menu.Item  link>{this.props.currentUser.username}</Menu.Item> */}
                <Dropdown style={{color:colorKey[this.props.currentUser.color]}} icon={false} text={this.props.currentUser.username} pointing className='link item'>
                  <Dropdown.Menu>
                    <Dropdown.Header>Chat color</Dropdown.Header>
                    {colors.map(c => <Dropdown.Item onClick={this.handleColorChange} key={c} name={c} label={{ color: c, empty: true, circular: true }} text={c.slice(0, 1).toUpperCase() + c.slice(1)}/>)}
                  </Dropdown.Menu>
                </Dropdown>
                <Popup
                  inverted
                  content="Log out"
                  trigger={
                    <Menu.Item link>
                      <Icon link color="grey" onClick={this.handleLogOut} name="log out"></Icon>
                    </Menu.Item>}
                  />
                </Menu.Menu>
                </Menu>
              {/* </div> */}
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
                   {isSearching && !isSearchLoading &&  channels.length > 0 && !channels.find(channel => channel.name === search) ? (
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
                      {(channels.length === 0 && !isSearchLoading )&& <List.Description>That is, if you <em>had</em> any.</List.Description>}
                    </List.Content>
                  </List.Item>
                                      ) : null}
                   {(!isSearchLoading && (isSearching || viewingFavorites))&& channels.map(channel => <SearchListing key={channel.id} channel={channel}/>)}
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
    addPeer: (peer) => dispatch(addPeer(peer)),
    addMessage: (action) => dispatch(action),
    changeColor: (color) => dispatch(changeColor(color))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainContainer);