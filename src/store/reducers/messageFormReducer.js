const initialState = ""

export default function messageFormReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_MESSAGE_FORM_TEXT":
      return action.payload
    default:
      return state
  }
}