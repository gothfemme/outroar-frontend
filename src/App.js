import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Login from './Login';
import SignUp from './Login/SignUp';
import MainContainer from './Main';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
      <div>
        <Route exact path="/" component={MainContainer}/>
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
      </div>
    </BrowserRouter>
    );
  }
}

export default App;