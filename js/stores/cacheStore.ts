
import { createStore } from 'redux';
import reducers from '../reducers';

export default function cacheStore() {
    return createStore(reducers);
}

