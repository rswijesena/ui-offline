declare const manywho: any;

let interval = null;
let cachedComponents = {};

/**
 * @param flowKey
 * @description extracting page component properties from
 * runtime state and storing in a new state that gets updated
 * via the set interval
 */
export const extractComponentValues = (flowKey) => {
    const components = manywho.state.getComponents(flowKey);
    if (components) {
        const clone = {};
        for (const key of Object.keys(components)) {
            clone[key] = components[key];
        }
        cachedComponents = clone;
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
export const getCachedValues = () => {
    return cachedComponents;
};

/**
 * @param flowKey
 * @description for updating the page component state
 * periodically based on a time set by the flow builder
 */
export const setCachingInterval = (flowKey) => {
    interval = setInterval(
        () => { extractComponentValues(flowKey); }, 5000,
    );
};
