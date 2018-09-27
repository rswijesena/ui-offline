import immutabilityHelper from 'immutability-helper';

const isReplaying = (state = [], action) => {
    switch (action.type) {
    case 'IS_REPLAYING':
        const isReplaying = {
            result: action.result,
        };

        return immutabilityHelper(state, {
            $set: isReplaying.result,
        });

    default:
        return state;
    }
};

export default isReplaying;
