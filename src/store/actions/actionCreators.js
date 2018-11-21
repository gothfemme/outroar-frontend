import { getToken, getSplash } from './adapter';

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

export const fetchSplash = () => {
  return (dispatch) => {
    return getSplash()
      .then(resp => {
        dispatch(setConversations(resp.conversations))
      })
      .catch(console.error)
  }
}