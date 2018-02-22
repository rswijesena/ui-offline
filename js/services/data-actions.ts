/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

class DataActions {

    static execute(action, flow, snapshot) {
        switch (action.crudOperationType.toUpperCase()) {
            case 'LOAD':
                let objectData = flow.getObjectData(action.objectDataRequest.objectDataType.typeElementId);
                objectData = manywho.offline.objectData.filter(objectData, action.objectDataRequest.listFilter);
                const value = snapshot.getValue(action.valueElementToApplyId.id);
                flow.state.setValue(action.valueElementToApplyId, value.typeElementId, snapshot, { objectData });
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
    }

};

export default DataActions;
