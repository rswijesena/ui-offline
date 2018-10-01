export const isOffline = result => ({
    type: 'is_OFFLINE',
    payload: result,
});

export const isReplaying = result => ({
    type: 'IS_REPLAYING',
    payload: result,
});
