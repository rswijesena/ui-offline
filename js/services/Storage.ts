declare const manywho;
declare const localforage: any;

localforage.setDriver(['asyncStorage', 'webSQLStorage']);

/**
 * Get the previously saved local version of the state from local storage.
 * If `stateId` isn't provided then iterate across all local storage
 * to find data with a matching `flowId` and `flowVersionId`
 * @param stateId
 * @param flowId
 * @param flowVersionId
 */
export const getOfflineData = (stateId: string, flowId: string = null, flowVersionId: string = null) => {
    return localforage.getItem(`manywho:offline-${stateId}`)
        .then((value) => {
            if (value) {
                return value;
            }

            return localforage.iterate((value, key) => {
                if (value.id.id === flowId && value.id.versionId === flowVersionId) {
                    return value;
                }
            })
            .then((flow) => {
                if (flow) {
                    return removeOfflineData(flow.state.id)
                        .then(() => {
                            flow.state.id = stateId;
                            return setOfflineData(flow);
                        });
                }
            });
        });
};

/**
 * @param flow
 */
export const setOfflineData = (flow: any) => {
    return localforage.setItem(`manywho:offline-${flow.state.id}`, flow);
};

/**
 * @param id
 */
export const removeOfflineData = (id: string) => {
    return localforage.removeItem(`manywho:offline-${id}`);
};
