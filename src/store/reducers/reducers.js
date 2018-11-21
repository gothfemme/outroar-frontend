const initialState = { user: {}, conversations: [], currentConversation: {} }

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload }
    case "SET_CURRENT_CONVERSATION":
      return { ...state, currentConversation: action.payload }
    default:
      return state
  }
}

export default reducer;