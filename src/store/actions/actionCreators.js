import { getToken } from './adapter';

// actions

const setUser = (user) => {
  return {
    type: "SET_USER",
    payload: user
  }
}


// thunks

export const sendAuth = (data) => {
  return (dispatch) => {
    return getToken(data)
      .then(resp => {
        localStorage.setItem("jwt", resp.jwt)
        dispatch(setUser(resp.current_user))
      })
      .catch(console.error)
  }
}