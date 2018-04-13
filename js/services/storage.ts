declare const manywho;
declare const localforage: LocalForage;

localforage.setDriver(['asyncStorage', 'webSQLStorage']);

export const getOfflineData = (id, flowId = null, flowVersionId = null) => {
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

export const setOfflineData = (flow) => {
    return localforage.setItem(`manywho:offline-${flow.state.id}`, flow);
};

export const removeOfflineData = (id) => {
    return localforage.removeItem(`manywho:offline-${id}`);
};
