import React, { Component } from 'react';
import { Button, Header, Form, Grid, Container, Segment } from 'semantic-ui-react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { sendAuth } from '../store';

class Login extends Component {
  state = {
    username: "",
    password: ""
  }

  handleChange = (e, { name, value }) => {
    this.setState({
      [name]: value
    });
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.logIn({ auth: this.state })
      .then(() => this.props.history.push('/'))
  }

  render() {
    if (localStorage.jwt) {
      return <Redirect to="/" />
    }
    return (
      <Container style={{height:"100vh"}}>
        <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h1" style={{fontFamily: "'Fredoka One', cursive"}}>
              outroar
            </Header>
            <Segment>
        <Form onSubmit={this.handleSubmit}>
          <Form.Input icon="user" iconPosition="left" onChange={this.handleChange} name="username" value={this.state.username} placeholder="Username"/>
          <Form.Input icon="lock" type="password" iconPosition="left" onChange={this.handleChange} name="password" value={this.state.password} placeholder="Password"/>
          <Button color='pink' fluid size='large'>
            Login
          </Button>
        </Form>
      </Segment>
      New here? <Link to="/signup">Sign Up</Link>
      </Grid.Column>

      </Grid>
      </Container>
    );
  }

}

const mapDispatchToProps = (dispatch) => {
  return { logIn: (data) => dispatch(sendAuth(data)) }
}

export default connect(null, mapDispatchToProps)(Login);