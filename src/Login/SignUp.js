import React, { Component } from 'react';
import { Message, Button, Icon, Header, Form, Grid, Input, Container, Segment } from 'semantic-ui-react';
import { Redirect, Link } from 'react-router-dom';

class SignUp extends Component {
  state = {
    email: "",
    username: "",
    password: "",
    passwordConfirmation: ""
  }

  handleChange = (e, { name, value }) => {
    this.setState({
      [name]: value
    });
  }

  handleSubmit = (e) => {
    e.preventDefault()
    // fetch
    // render errors if any
    // add user to store
    // redirect to splash
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
          <Form.Input icon="mail" iconPosition="left" onChange={this.handleChange} name="email" value={this.state.email} placeholder="example@email.com"/>
          <Form.Input icon="lock" type="password" iconPosition="left" onChange={this.handleChange} name="password" value={this.state.password} placeholder="Password"/>
          <Form.Input icon="lock" type="password" iconPosition="left" onChange={this.handleChange} name="passwordConfirmation" value={this.state.passwordConfirmation} placeholder="Password Confirmation"/>
          <Button color='pink' fluid size='large'>
            Sign Up
          </Button>
        </Form>
      </Segment>
      Have an account already? <Link to="/login">Log In</Link>
      </Grid.Column>

      </Grid>
      </Container>
    );
  }

}

export default SignUp;