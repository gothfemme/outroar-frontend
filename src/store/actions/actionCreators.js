import { getToken, fetchCurrentUser, fetchCurrentConversation, postMessage, postUser, postFavorite, patchUser, deleteFavorite } from './adapter';

// actions

export const setUser = (user) => {
  return {
    type: "SET_USER",
    payload: user
  }
}

const changeColorInStore = (color) => {
  return {
    type: "CHANGE_COLOR",
    payload: color
  }
}

const removeFavoriteFromStore = (id) => {
  return {
    type: "REMOVE_FAVORITE",
    payload: id
  }
}

const addFavoriteToStore = (id) => {
  return {
    type: "ADD_FAVORITE",
    payload: id
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

export const removeFavorite = (id) => {
  return (dispatch) => {
    dispatch(removeFavoriteFromStore(id))
    return deleteFavorite(id)
  }
}

export const addFavorite = (id) => {
  return (dispatch) => {
    dispatch(addFavoriteToStore(id))
    return postFavorite(id)
  }
}

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
  }
}

export const changeColor = (color) => {
  return (dispatch) => {
    dispatch(changeColorInStore(color))
    return patchUser({ color: color })
  }
}

export const sendAuth = (data) => {
  return (dispatch) => {
    return getToken(data)
      .then(resp => {
        localStorage.setItem("jwt", resp.jwt)
        dispatch(setUser(resp.current_user))
      })
  }
}

// export const fetchSplash = () => {
//   return (dispatch) => {
//     return getSplash()
//       .then(resp => {
//         dispatch(setConversations(resp.conversations))
//       })
//       .catch(console.error)
//   }
// }

// export const getCurrentMessages = () => {}