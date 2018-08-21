// Initial state store for page component values that have
// been set whilst the user has gone through the flow online.

// TODO: think this stuff will need to be cached inside indexdb
// else it is lost during a complete page reload.

// TODO: might be worth using redux for this stuff as
// well as the the other stateful parts (offline state)
declare const manywho: any;

let key = null;
let interval = null;
const cachedComponents = {};

const extractComponentValues = () => {
    const components = manywho.state.getComponents(key);
    console.log('Caching components');

    for (const key of Object.keys(components)) {
        cachedComponents[key] = components[key];
    }
};

export const killCachingInterval = () => {
    console.log('Killing cache interval');
    clearInterval(interval);
};

export const getCachedValues = () => {
    console.log('Getting cached components');
    return cachedComponents;
};

export const setCachingInterval = (flowKey) => {
    key = flowKey;

    // TODO: look at possibly calling the caching function
    // recursively from within a setTimeout instead
    // in case the caching takes longer than the defined interval.
    interval = setInterval(extractComponentValues, 5000); // This needs to be configurable
};
