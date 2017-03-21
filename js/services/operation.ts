/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

function isCommandSupported(command) {
    if (manywho.utils.isNullOrWhitespace(command) || manywho.offline.operation.commands.indexOf(command) !== -1)
        return true;

    manywho.log.info('The Operation command is not supported and this operation will be ignored: ' + command);
    return false;
}

manywho.offline.operation = class Operation {

    static commands = ['NEW', 'EMPTY', 'SET_EQUAL', 'VALUE_OF', 'GET_FIRST', 'GET_NEXT', 'ADD'];

    static execute(operation, state, snapshot) {
        let valueToReference = null;

        if (operation.valueElementToReferenceId) {
            if (!isCommandSupported(operation.valueElementToReferenceId.command))
                return state;

            valueToReference = snapshot.getValue(operation.valueElementToReferenceId);
            const stateValue = state.getValue(operation.valueElementToReferenceId, valueToReference.typeElementId, valueToReference.contentType, operation.valueElementToReferenceId.command);
            if (stateValue)
                valueToReference = stateValue;
        }

        if (operation.valueElementToApplyId) {
            if (!isCommandSupported(operation.valueElementToApplyId.command))
                return state;

            let valueToApply = snapshot.getValue(operation.valueElementToApplyId);
            const stateValue = state.getValue(operation.valueElementToApplyId, valueToApply.typeElementId, valueToApply.contentType, operation.valueElementToApplyId.command);
            if (stateValue)
                valueToApply = stateValue;

            switch (operation.valueElementToApplyId.command) {
                case 'NEW':
                case 'EMPTY':
                    valueToApply = { objectData: null, contentValue: null };
                    break;

                case 'ADD':
                    valueToReference.objectData = valueToReference.objectData || [];

                    let objectData = JSON.parse(JSON.stringify(valueToApply.objectData || valueToApply.defaultObjectData || [])).map(objectData => {
                        if (valueToReference.objectData.length > 0) {
                            const existingItem = valueToReference.objectData.find(item => item.externalId === objectData.externalId);
                            if (existingItem) {
                                valueToReference.objectData.splice(valueToReference.objectData.indexOf(existingItem), 1);
                                return existingItem;
                            }
                        }
                        return objectData;
                    });

                    objectData = objectData.concat(JSON.parse(JSON.stringify(valueToReference.objectData)));
                    valueToReference.objectData = objectData;
                    break;
            }

            state.setValue(operation.valueElementToApplyId, valueToReference.typeElementId, snapshot, valueToReference);
        }

        return state;
    }

};
