import { createStore } from 'redux';
import reducers from '../reducers';

const initialState: any = { isOffline: false, isReplaying: false, isCaching: 0 };

export default function globalStore() {
    return createStore(reducers, initialState);
}
