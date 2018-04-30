export const addToCache = flow => ({
    type: 'ADD_TO_CACHE',
    json: flow,
});

export const removeFromCache = () => ({
    type: 'REMOVE_FROM_CACHE',
});
