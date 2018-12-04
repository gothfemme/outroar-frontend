import { validateConversationPassword } from './adapter';

export const addChannelUser = (user) => {
  return { type: "ADD_CHANNEL_USER", payload: user }
}

const channelLogin = () => ({ type: "CHANNEL_LOGIN" })

export const resetConversation = () => ({ type: "RESET_CONVERSATION" })

export const removeChannelUser = (id) => ({ type: "REMOVE_CHANNEL_USER", payload: id })

export const setPeerStream = (id, stream) => ({ type: "SET_PEER_STREAM", payload: { id, stream } })

export const setMyStream = (stream, url) => {
  return { type: "SET_MY_STREAM", payload: { stream, url } }
}

export const toggleUserMenu = () => {
  return { type: "TOGGLE_USER_MENU" }
}

export const setModal = (boolean) => {
  return { type: "SET_MODAL", payload: boolean }
}

export const validateAndLoginToChannel = (password, id) => {
  return (dispatch) => {
    return validateConversationPassword(password, id)
      .then(res => {
        if (res.success) {
          return dispatch(channelLogin())
        }
        return "ERROR"
      })
  }
}

export const setMute = (boolean) => ({ type: "SET_MUTE", payload: boolean })