import { createStore } from 'redux';
import reducers from '../reducers';

export default function globalStore() {
    return createStore(reducers);
}
