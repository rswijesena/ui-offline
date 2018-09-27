import { combineReducers } from 'redux';
import isOffline from './isOffline';
import isReplaying from './isReplaying';

export default combineReducers({
    isOffline,
    isReplaying,
});
