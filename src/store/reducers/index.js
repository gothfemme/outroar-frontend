import { combineReducers } from 'redux';
import channelReducer from './channelReducer';
import userReducer from './userReducer';
import conversationReducer from './conversationReducer';
import messageFormReducer from './messageFormReducer';

export default combineReducers({
  channelSettings: channelReducer,
  currentUser: userReducer,
  currentConversation: conversationReducer,
  messageForm: messageFormReducer
})