import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Login from './Login';
import SignUp from './Login/SignUp';
import MainContainer from './Main';
import ChannelPage from './ChannelPage';
import { connect } from 'react-redux';
import { getCurrentUser } from './store';
import { ActionCableProvider } from 'react-actioncable-provider';

class App extends Component {

  componentDidMount = () => {
    if (localStorage.jwt) {
      this.props.getCurrentUser()
        .catch(error => {
          localStorage.clear()
          this.props.history.push('/login')
        })
    }
  }

  render() {
    return (
      <BrowserRouter>
      <div>
        <Route exact path="/" component={MainContainer}/>
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
                <ActionCableProvider url="wss://outroar-backend.herokuapp.com/cable">
                {/* <ActionCableProvider url="ws://localhost:3000/cable"> */}
                <Route path="/channels/:id" component={ChannelPage} />
              </ActionCableProvider>
      </div>
    </BrowserRouter>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return { getCurrentUser: () => dispatch(getCurrentUser()) }
}

export default connect(null, mapDispatchToProps)(App);