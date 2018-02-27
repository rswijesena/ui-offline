import 'script-loader!./lib/localforage-1.5.0.min.js';
import 'script-loader!./lib/polyfills.js';

import * as GoOffline from './components/go-offline';
import * as GoOnline from './components/go-online';
import * as NoNetwork from './components/no-network';
import * as OfflineBase from './components/offline';
import * as Request from './components/request';
import * as RequestFault from './components/request-fault';
import {request} from './services/connection';
import * as DataActions from './services/data-actions';
import {metaData} from './services/metadata';
import * as ObjectData from './services/objectdata';
import * as Offline from './services/offline';
import * as Operation from './services/operation';
import * as Page from './services/page';
import * as Rules from './services/rules';
import * as Snapshot from './services/snapshot';
import * as Step from './services/step';
import {setStorageDriver} from './services/storage';
import {clone, flatten, guid} from './services/utils';

setStorageDriver()

const window2 = window as any;

if (window && window2.manywho) {
    window2.manywho.offline = Offline;
    window2.manywho.connection.request = request;
    window2.manywho.offline.components = {};
    window2.manywho.offline.components.offline = OfflineBase;
    window2.manywho.offline.components.goOffline = GoOffline;
    window2.manywho.offline.components.goOnline = GoOnline;
    window2.manywho.offline.components.noNetwork = NoNetwork;
    window2.manywho.offline.components.request = Request;
    window2.manywho.offline.components.requestFault = RequestFault;
    window2.manywho.offline.dataActions = DataActions;
    window2.manywho.offline.metadata = metaData;
    window2.manywho.offline.objectdata = ObjectData;
    window2.manywho.offline.operation = Operation;
    window2.manywho.offline.page = Page;
    window2.manywho.offline.rules = Rules;
    window2.manywho.offline.snapshot = Snapshot;
    window2.manywho.offline.step = Step;
    window2.manywho.utils['clone'] = clone;
    window2.manywho.utils['flatten'] = flatten;
    window2.manywho.utils['guid'] = guid;
}

const uiOffline = {
    DataActions,
    ObjectData,
    Offline,
    Operation,
    Page,
    Rules,
    Snapshot,
    Step,
};

export default uiOffline;