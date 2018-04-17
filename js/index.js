import 'script-loader!./lib/localforage-1.5.0.min.js';
import 'script-loader!./lib/polyfills.js';

import { request } from './services/Connection';
import Offline from './components/Offline';

import "../css/offline.less";

const window2 = window;

if (window && window2.manywho) {
    window2.manywho.connection.request = request;
}