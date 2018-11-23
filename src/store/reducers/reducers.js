const initialState = { user: {}, conversations: [], currentConversation: {}, peers: [] }

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload }
    case "SET_CURRENT_CONVERSATION":
      return { ...state, currentConversation: action.payload }
    case "SET_CURRENT_MESSAGES":
      return { ...state, currentMessages: [] }
    case "ADD_MESSAGE":
      if (action.payload.conversation_id === state.currentConversation.id) {
        return { ...state, currentConversation: { ...state.currentConversation, messages: [...state.currentConversation.messages, action.payload] } }
      } else {
        return state
      }
    case "ADD_PEER":
      console.log(action.payload.id, action.payload.conversation)
      const newPeerArray = state.peers.filter(peer => peer.id !== action.payload.id && peer.conversation !== action.payload.conversation)
      console.log(newPeerArray, action.payload)
      return { ...state, peers: [...newPeerArray, action.payload] }
    default:
      return state
  }
}

export default reducer;