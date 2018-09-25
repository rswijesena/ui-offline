import { createStore } from 'redux';
import reducers from '../reducers';

const initialState = {
    isOffline: [],
};

export default function cacheStore() {
    return createStore(reducers);
}
