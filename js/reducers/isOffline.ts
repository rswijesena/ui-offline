import { getFlowModel } from '../models/Flow';
import { setOfflineData } from '../services/Storage';
import immutabilityHelper from 'immutability-helper';

const isOffline = (state = [], action) => {
    switch (action.type) {
    case 'is_OFFLINE':
        const isOffline = {
            result: action.result,
        };

        return immutabilityHelper(state, {
            $set: isOffline.result,
        });

    default:
        return state;
    }
};

export default isOffline;
