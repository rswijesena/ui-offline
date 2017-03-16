/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.dataActions = class DataActions {

    static execute(action, state, snapshot) {
        let objectData = manywho.storage.getObjectData(action.objectDataRequest.objectDataType.typeElementId);

        switch (action.crudOperationType.toUpperCase()) {
            case 'LOAD':
                // TODO: filter data here
                const value = snapshot.getValue(action.valueElementToApplyId.id);
                state.setValue(action.valueElementToApplyId, value.typeElementId, { objectData });
                break;

            case 'SAVE':
                // TODO: cache the save request as the objectdata being saved could change later in the flow
                break;
        }

        return state;
    }

};
