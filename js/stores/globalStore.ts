import { createStore } from 'redux';
import reducers from '../reducers';

const initialState: any = { isOffline: false, isReplaying: false };

export default function globalStore() {
    return createStore(reducers, initialState);
}
