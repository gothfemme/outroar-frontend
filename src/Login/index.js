import React, { Component } from 'react';
import { Popup, Button, Header, Form, Grid, Container, Segment } from 'semantic-ui-react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { sendAuth } from '../store';

class Login extends Component {
  state = {
    username: "",
    password: "",
    loginError: false
  }

  handleChange = (e, { name, value }) => {
    this.setState({
      [name]: value
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.logIn({ auth: { username: this.state.username, password: this.state.password } })
      .then(() => this.props.history.push('/'))
      .catch(async (error) => {
        const res = await error
        if (res.status === 404) {
          this.setState({
            loginError: true
          });
        }
        return undefined
      })
  }

  render() {
    if (localStorage.jwt) {
      return <Redirect to="/" />
    }
    return (
      <Container style={{ height:"100vh", width:"100vw" }}>
        <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
          <Grid.Column style={{ maxWidth: 450 }}>
            <Popup
              position="top center"
              inverted
              wide="very"
              content="A peer-to-peer video chat application."
              trigger={
            <Header color="pink" style={{ cursor:"default", fontFamily: "'Fredoka One', cursive", fontSize:"3rem" }}>
              outroar
            </Header>
          } />
            <Segment>
        <Form onSubmit={this.handleSubmit}>
          <Popup
            position="right center"
            basic
            size="tiny"
            wide="very"
            style={{color: "#9f3a38", borderColor: "#e0b4b4", background: "#fff6f6"}}
            open={this.state.loginError}
            content="Username or password are invalid."
            trigger={
          <Form.Input error={this.state.loginError} icon="user" iconPosition="left" onChange={this.handleChange} name="username" value={this.state.username} placeholder="Username"/>
            }
          />
          <Form.Input error={this.state.loginError} icon="lock" type="password" iconPosition="left" onChange={this.handleChange} name="password" value={this.state.password} placeholder="Password"/>
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