/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.dataActions = class DataActions {

    static execute(action, state, snapshot) {
        let objectData = manywho.storage.getObjectData(action.objectDataRequest.objectDataType.typeElementId);

        switch (action.crudOperationType.toUpperCase()) {
            case 'LOAD':
                objectData = manywho.offline.objectData.filter(objectData, action.objectDataRequest.listFilter);
                const value = snapshot.getValue(action.valueElementToApplyId.id);
                state.setValue(action.valueElementToApplyId, value.typeElementId, snapshot, { objectData });
                break;
        }

        return state;
    }

};
