import React, { Component } from 'react';
import { Button, Header, Form, Grid, Container, Segment } from 'semantic-ui-react';
import { Redirect, Link } from 'react-router-dom';
import { createUser } from '../store';
import { connect } from 'react-redux';

class SignUp extends Component {
  state = {
    username: "",
    password: "",
    password_confirmation: ""
  }

  handleChange = (e, { name, value }) => {
    this.setState({
      [name]: value
    });
  }

  handleSubmit = (e) => {
    e.preventDefault()
    console.log(this.state)
    this.props.createUser(this.state)
      .then(token => localStorage.setItem("jwt", token))
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
          <Form.Input icon="lock" type="password" iconPosition="left" onChange={this.handleChange} name="password_confirmation" value={this.state.password_confirmation} placeholder="Password Confirmation"/>
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

const mapDispatchToProps = (dispatch) => {
  return {
    createUser: (data) => dispatch(createUser(data))
  }
}

export default connect(null, mapDispatchToProps)(SignUp);