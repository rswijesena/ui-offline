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
 * @description creating and updating indexDB cache store
 */
export const setOfflineData = (flow: any) => {

    // Checking if there is an existing cache for current state
    return localforage.getItem(`manywho:offline-${flow.state.id}`)
        .then((value) => {

            // A cache store should only be created if one
            // does not already exist for current state and if
            // one does exist then should only be updated if there are
            // new state values to be cached, otherwise existing values
            // may be wiped from the cache when the flow goes offline
            if (!value || flow.state.values) {
                if (!flow.state.values) {

                    // If the flow has a new state then we want to clear out
                    // stale cache from previous state/s. Any cache store which
                    // has the same associated flow id and version will be removed
                    localforage.iterate((value, key) => {
                        if (value.id.id === flow.id.id && value.id.versionId === flow.id.versionId) {
                            removeOfflineData(value.state.id);
                        }
                    });
                }
                return localforage.setItem(`manywho:offline-${flow.state.id}`, flow);
            }
        });
};

/**
 * @param id
 */
export const removeOfflineData = (id: string) => {
    return localforage.removeItem(`manywho:offline-${id}`);
};
