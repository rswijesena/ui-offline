const isCaching = (state = [], action) => {
    switch (action.type) {
    case 'IS_CACHING':
        return action.payload;

    default:
        return state;
    }
};

export default isCaching;
