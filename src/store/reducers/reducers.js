const initialState = { user: { favorite_channels: [] }, currentConversation: { messages: [] } }

const reducer = (state = initialState, action) => {
  switch (action.type) {
    // case "SET_USER":
    //   return { ...state, user: action.payload }
    case "SET_CURRENT_CONVERSATION":
      return { ...state, currentConversation: action.payload }
      // case "CHANGE_COLOR":
      //   return { ...state, user: { ...state.user, color: action.payload } }
      // case "ADD_FAVORITE":
      //   return { ...state, user: { ...state.user, favorite_channels: [...state.user.favorite_channels, action.payload] } }
      // case "REMOVE_FAVORITE":
      //   return { ...state, user: { ...state.user, favorite_channels: state.user.favorite_channels.filter(id => id !== action.payload) } }
    case "CHANGE_CHANNEL_PASSWORD":
      return { ...state, currentConversation: { ...state.currentConversation, has_password: action.payload } }
    case "ADD_MESSAGE":
      if (action.payload.hasOwnProperty("is_whisper")) {
        return { ...state, currentConversation: { ...state.currentConversation, messages: [...state.currentConversation.messages, action.payload] } }
      }
      if (action.payload.conversation_id === state.currentConversation.id) {
        return { ...state, currentConversation: { ...state.currentConversation, messages: [...state.currentConversation.messages.filter(m => m.id !== action.payload.id), action.payload] } }
      } else {
        return state
      }
    default:
      return state
  }
}

export default reducer;