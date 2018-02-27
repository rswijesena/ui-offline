/// <reference path="../../typings/index.d.ts" />

declare var manywho;
declare var localforage: LocalForage;

export const setStorageDriver = () => {
    localforage.setDriver(manywho.settings.global('offline.storage.drivers'));
};

export const get = (id, flowId, flowVersionId) => {
    return localforage.getItem(`manywho:offline-${id}`)
        .then(value => {
            if (value)
                return value;

            return localforage.iterate((value, key) => {
                if (value.id.id === flowId && value.id.versionId === flowVersionId)
                    return value;
            })
            .then(flow => {
                if (flow)
                    return manywho.offline.storage.remove(flow.state.id)
                        .then(() => {
                            flow.state.id = id;
                            return manywho.offline.storage.set(flow);
                        });
            });
        });
};

export const set = (flow) => {
    return localforage.setItem(`manywho:offline-${flow.state.id}`, flow);
};

export const remove = (id) => {
    return localforage.removeItem(`manywho:offline-${id}`);
};
