import { getToken, getSplash, fetchCurrentUser, fetchCurrentConversation, postMessage, postUser } from './adapter';

// actions

const setUser = (user) => {
  return {
    type: "SET_USER",
    payload: user
  }
}

const setConversations = (conversations) => {
  return {
    type: "SET_CONVERSATIONS",
    payload: conversations
  }
}

export const setCurrentConversation = (conversation) => {
  return {
    type: "SET_CURRENT_CONVERSATION",
    payload: conversation
  }
}

export const addPeer = (peer) => {
  return {
    type: "ADD_PEER",
    payload: peer
  }
}

export const addMessage = (message) => {
  return {
    type: "ADD_MESSAGE",
    payload: message
  }
}

// thunks

export const sendMessage = (message) => {
  return (dispatch) => {
    return postMessage(message)
      .then(resp => dispatch(addMessage(resp)))
      .catch(console.error)
  }
}

export const getCurrentConversation = (id) => {
  return (dispatch) => {
    return fetchCurrentConversation(id)
      .then(resp => dispatch(setCurrentConversation(resp)))
      .catch(console.error)
  }
}

export const getCurrentUser = () => {
  return (dispatch) => {
    fetchCurrentUser()
      .then(resp => {
        dispatch(setUser(resp))
        // return resp.token
      })
      .catch(console.error)
  }
}

export const createUser = (data) => {
  return (dispatch) => {
    return postUser(data)
      .then(resp => {
        dispatch(setUser(resp.user))
        return resp.token
      })
      .catch(console.error)
  }
}

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

export const fetchSplash = () => {
  return (dispatch) => {
    return getSplash()
      .then(resp => {
        dispatch(setConversations(resp.conversations))
      })
      .catch(console.error)
  }
}

// export const getCurrentMessages = () => {}