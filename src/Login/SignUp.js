import React, { Component } from 'react';
import { Popup, List, Button, Header, Form, Grid, Container, Segment } from 'semantic-ui-react';
import { Redirect, Link } from 'react-router-dom';
import { createUser } from '../store';
import { connect } from 'react-redux';

class SignUp extends Component {
  state = {
    username: "",
    password: "",
    password_confirmation: "",
    username_errors: [],
    password_errors: []
  }

  handleChange = (e, { name, value }) => {
    this.setState({
      [name]: value
    });
  }

  handleSubmit = (e) => {
    e.preventDefault()
    console.log(this.state)
    this.props.createUser({ username: this.state.username, password: this.state.password, password_confirmation: this.state.password_confirmation })
      .then(token => localStorage.setItem("jwt", token))
      .then(() => this.props.history.push('/'))
      .catch(async (error) => {
        const res = await error.json()
        console.log(res)
        this.setState({
          username_errors: res.username ? res.username.map(x => "Username " + x) : [],
          password_errors: [...(res.password ? res.password.map(x => "Password " + x) : []), ...(res.password_confirmation ? res.password_confirmation.map(x => "Passwords do not match") : [])]
        });
        return undefined
      })
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
          <Popup
            position="right center"
            basic
            size="tiny"
            wide="very"
            style={{color: "#9f3a38", borderColor: "#e0b4b4", background: "#fff6f6"}}
            open={this.state.username_errors.length > 0}
            content={<List bulleted>{this.state.username_errors.map(x => <List.Item>{x}</List.Item>)}</List>}
            trigger={
          <Form.Input error={this.state.username_errors.length > 0} icon="user" iconPosition="left" onChange={this.handleChange} name="username" value={this.state.username} placeholder="Username"/>
          }
          />
          <Popup
            position="left center"
            basic
            size="tiny"
            wide="very"
            style={{color: "#9f3a38", borderColor: "#e0b4b4", background: "#fff6f6"}}
            open={this.state.password_errors.length > 0}
            content={<List bulleted>{this.state.password_errors.map(x => <List.Item>{x}</List.Item>)}</List>}
            trigger={
          <Form.Input error={this.state.password_errors.length > 0} icon="lock" type="password" iconPosition="left" onChange={this.handleChange} name="password" value={this.state.password} placeholder="Password"/>
        }
      />
          <Form.Input error={this.state.password_errors.length > 0} icon="lock" type="password" iconPosition="left" onChange={this.handleChange} name="password_confirmation" value={this.state.password_confirmation} placeholder="Password Confirmation"/>
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