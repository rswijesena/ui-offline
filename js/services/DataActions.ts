import ObjectData from './ObjectData';
import { getObjectData } from '../models/Flow';
import { setStateValue } from '../models/State';
import { IFlow } from '../interfaces/IModels';

/**
 * Support for executing data actions offline
 */
const DataActions = {

    /**
     * Execute the data action (`Load` or `Save`) and update the local state.
     * `Delete` data actions aren't currently supported.
     * @param action
     * @param flow
     * @param snapshot
     */
    execute: (action: any, flow: IFlow, snapshot: any) => {
        switch (action.crudOperationType.toUpperCase()) {
        case 'LOAD':
            const objectData = getObjectData(
                action.objectDataRequest.objectDataType ?
                action.objectDataRequest.objectDataType.typeElementId :
                action.objectDataRequest.typeElementId,
            );
            const filteredObjectData = ObjectData.filter(objectData, action.objectDataRequest.listFilter, action.objectDataRequest.typeElementId);
            const value = snapshot.getValue(action.valueElementToApplyId);
            setStateValue(action.valueElementToApplyId, value.typeElementId, snapshot, filteredObjectData);
            break;

        case 'SAVE':
            // No implemention for saving as the state will already be updated. If we can't connect to the mothership then we can't
            // Save the data back to the 3rd party data store
            break;

        case 'DELETE':
            // No implementation for a delete as its potential very destructive
            break;
        }

        return flow.state;
    },
};

export default DataActions;
