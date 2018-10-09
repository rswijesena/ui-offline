import { combineReducers } from 'redux';
import isOffline from './isOffline';
import isReplaying from './isReplaying';
import isCaching from './isCaching';

export default combineReducers({
    isOffline,
    isReplaying,
    isCaching,
});
