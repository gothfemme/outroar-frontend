const initialState = {
  currentUsers: [],
  myStream: { stream: null, url: "" },
  isMuted: false,
  userMenuOpen: true,
  modalOpen: false,
  showLogin: true
}

export default function channel(state = initialState, action) {
  switch (action.type) {
    case "SET_MY_STREAM":
      return { ...state, myStream: { stream: action.payload.stream, url: action.payload.url } }
    case "RESET_CONVERSATION":
      return {
        currentUsers: [],
        myStream: { stream: null, url: "" },
        isMuted: false,
        userMenuOpen: true,
        modalOpen: false,
        showLogin: true
      }
    case "ADD_CHANNEL_USER":
      return { ...state, currentUsers: [...state.currentUsers.filter(u => u.id !== action.payload.id), action.payload] }
    case "REMOVE_CHANNEL_USER":
      return { ...state, currentUsers: [...state.currentUsers.filter(u => u.id !== action.payload)] }
    case "SET_PEER_STREAM":
      let user = state.currentUsers.find(u => u.id === action.payload.id)
      user = { ...user, stream: action.payload.stream }
      return { ...state, currentUsers: [...state.currentUsers.filter(p => p.id !== action.payload.id), user] }
    case "SET_MUTE":
      return { ...state, isMuted: action.payload }
    case "SET_MODAL":
      return { ...state, modalOpen: action.payload }
    case "TOGGLE_USER_MENU":
      return { ...state, userMenuOpen: !state.userMenuOpen }
    default:
      return state
  }
}