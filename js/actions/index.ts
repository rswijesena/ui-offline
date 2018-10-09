export const isOffline = result => ({
    type: 'is_OFFLINE',
    payload: result,
});

export const isReplaying = result => ({
    type: 'IS_REPLAYING',
    payload: result,
});

export const isCaching = result => ({
    type: 'IS_CACHING',
    payload: result,
});
