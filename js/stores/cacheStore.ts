import { createStore } from 'redux';
import reducers from '../reducers';

const initialState: any = { isOffline: false };

export default function cacheStore() {
    return createStore(reducers, initialState);
}
