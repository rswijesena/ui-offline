import 'script-loader!./lib/localforage-1.5.0.min.js';

import { request } from './services/Connection';
import Offline from './components/Offline';

import "../css/offline.less";

const window2 = window;

/**
 * The request module needs to hang off of the manywho global
 * so that api requests can be intercepted
 * when a flow is running offline
 */
if (window && window2.manywho) {
    window2.manywho.connection.request = request;
}