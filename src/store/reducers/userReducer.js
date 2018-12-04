const initialState = { favorite_channels: [] }

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_USER":
      return action.payload
    case "CHANGE_COLOR":
      return { ...state, color: action.payload }
    case "ADD_FAVORITE":
      return { ...state, favorite_channels: [...state.favorite_channels, action.payload] }
    case "REMOVE_FAVORITE":
      return { ...state, favorite_channels: state.favorite_channels.filter(id => id !== action.payload) }
    default:
      return state
  }
}