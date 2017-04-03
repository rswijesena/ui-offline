/// <reference path="../../typings/index.d.ts" />

declare var manywho;
declare var localforage: LocalForage;

localforage.setDriver(manywho.settings.global('offline.storage.drivers'));

manywho.offline.storage = class {

    static get(id) {
        return localforage.getItem(`manywho:offline-${id}`);
    }

    static set(flow) {
        return localforage.setItem(`manywho:offline-${flow.state.id}`, flow);
    }

    static remove(id) {
        return localforage.removeItem(`manywho:offline-${id}`);
    }

};
