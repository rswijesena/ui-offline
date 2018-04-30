import immutabilityHelper from 'immutability-helper';

const cache = (state = [], action) => {
    switch (action.type) {
    case 'ADD_TO_CACHE':
        const flow = {
            id: action.json.state.id,
            flow: action.json,
        };

        return immutabilityHelper(state, {
            $set: [flow],
        });
    case 'REMOVE_FROM_CACHE':
        return immutabilityHelper(state, {
            $set: [],
        });
    default:
        return state;
    }
};
  
export default cache;
