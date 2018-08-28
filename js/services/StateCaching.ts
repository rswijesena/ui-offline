import { getOfflineData, getOnlineData, setOnlineData } from './Storage';

declare const manywho: any;

let interval = null;
const cachedComponents = {};

/**
 * @param flowKey
 * @description extracting page component properties from
 * runtime state and storing in a new state that gets updated
 * via the set interval
 */
export const extractStateComponentValues = (stateId, flowKey) => {
    const components = manywho.state.getComponents(flowKey);
    const modelComponents = manywho.model.getComponents(flowKey);
    if (components) {
        const clone = {};
        for (const key of Object.keys(components)) {
            if (modelComponents[key] && modelComponents[key].objectData) {
                const selectedObjectData = modelComponents[key].objectData.filter(item => item.isSelected);
                clone[key] = {
                    contentValue: components[key].contentValue || null,
                    objectData: selectedObjectData && selectedObjectData.length > 0 ? selectedObjectData : modelComponents[key].objectData,
                };
            } else {
                clone[key] = {
                    contentValue: components[key].contentValue || null,
                    objectData: null,
                };
            }

        }
        const result = Object.assign(cachedComponents, clone);
        return setOnlineData(stateId, result);
    }
};

export const extractModelComponentValues = (stateId, flowKey) => {
    const components = manywho.model.getComponents(flowKey);
    if (components) {
        const clone = {};
        for (const key of Object.keys(components)) {
            clone[key] = components[key];
        }
        const result = Object.assign(cachedComponents, clone);
        return setOnlineData(stateId, result);
    }
};

/**
 * @description Stopping the set interval,
 * this happens when going offline
 */
export const killCachingInterval = () => {
    clearInterval(interval);
};

/**
 * @description returns an object containing page components,
 * whereby the key is the component id and the value describes
 * the component properties
 */
export const getCachedValues = (stateId) => {
    return getOnlineData(stateId);
};

export const foo = (stateId, flowKey) => {
    extractModelComponentValues(stateId, flowKey)
        .then(() => {
            extractStateComponentValues(stateId, flowKey);
        });
};

/**
 * @param flowKey
 * @description for updating the page component state
 * periodically based on a time set by the flow builder
 */
export const setCachingInterval = (stateId, flowKey) => {
    interval = setInterval(
        () => { foo(stateId, flowKey); }, 5000,
    );
};
