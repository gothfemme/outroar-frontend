const initialState = { messages: [] }

export default function conversationReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_CURRENT_CONVERSATION":
      return { ...action.payload, showLogin: action.payload.has_password }
    case "CHANNEL_LOGIN":
      return { ...state, showLogin: false }
    case "RESET_CONVERSATION":
      return { messages: [] }
    case "CHANGE_CHANNEL_PASSWORD":
      return { ...state, has_password: action.payload }
    case "ADD_MESSAGE":
      if (action.payload.hasOwnProperty("is_whisper")) {
        return { ...state, messages: [...state.messages, action.payload] }
      }
      if (action.payload.conversation_id === state.id) {
        return { ...state, messages: [...state.messages.filter(m => m.id !== action.payload.id), action.payload] }
      } else {
        return state
      }
    default:
      return state
  }
}