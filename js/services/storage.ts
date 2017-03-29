/// <reference path="../../typings/index.d.ts" />

declare var manywho;
declare var localforage: LocalForage;

localforage.setDriver(manywho.settings.global('offline.storage.drivers'));

manywho.offline.storage = class {

    static getState() {
        return localforage.getItem('manywho:offline-state');
    }

    static setState(state) {
        return localforage.setItem('manywho:offline-state', state);
    }

    static getObjectData(typeElementId) {
        return localforage.getItem('manywho:offline-objectdata-' + typeElementId);
    }

    static setObjectData(objectData, typeElementId) {
        return localforage.setItem('manywho:offline-objectdata-' + typeElementId, objectData);
    }

    static appendObjectData(objectData, typeElementId) {
        return localforage.getItem('manywho:offline-objectdata-' + typeElementId)
            .then(value => {
                return localforage.setItem('manywho:offline-objectdata-' + typeElementId, (value as Array<any> || []).concat(objectData));
            });
    }

    static clearObjectData(typeElementId) {
        return localforage.removeItem('manywho:offline-objectdata-' + typeElementId);
    }

    static getRequests() {
        return localforage.getItem('manywho:offline-requests');
    }

    static saveRequest(request) {
        return localforage.getItem('manywho:offline-requests')
            .then(requests => {
                return localforage.setItem('manywho:offline-requests', (requests as Array<any> || []).concat(request));
            });
    }

    static saveRequests(requests) {
        return localforage.setItem('manywho:offline-requests', requests);
    }

    static clearRequests() {
        return localforage.removeItem('manywho:offline-requests');
    }

};
