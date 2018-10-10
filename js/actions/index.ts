export const isOffline = result => ({
    type: 'is_OFFLINE',
    payload: result,
});

export const isReplaying = result => ({
    type: 'IS_REPLAYING',
    payload: result,
});

export const cachingProgress = result => ({
    type: 'CACHE_PROGRESS',
    payload: result,
});
