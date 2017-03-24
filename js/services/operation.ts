/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

function isCommandSupported(command) {
    if (manywho.utils.isNullOrWhitespace(command) || manywho.offline.operation.commands.indexOf(command) !== -1)
        return true;

    manywho.log.info('The Operation command is not supported and this operation will be ignored: ' + command);
    return false;
}

manywho.offline.operation = class Operation {

    static commands = ['NEW', 'EMPTY', 'SET_EQUAL', 'VALUE_OF', 'GET_FIRST', 'GET_NEXT', 'ADD', 'REMOVE'];

    static execute(operation, state, snapshot) {
        let valueToReference: any = { objectData: null, contentValue: null };

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
            const typeElementId = valueToApply ? valueToApply.typeElementId : null;
            let type = typeElementId ? snapshot.metadata.typeElements.find(typeElement => typeElement.id === typeElementId) : null;

            const stateValue = state.getValue(operation.valueElementToApplyId, valueToApply.typeElementId, valueToApply.contentType, operation.valueElementToApplyId.command);
            if (stateValue)
                valueToApply = stateValue;

            switch (operation.valueElementToApplyId.command) {
                case 'NEW':
                    valueToReference.objectData = [{
                        externalId: manywho.utils.guid(),
                        internalId: manywho.utils.guid(),
                        developerName: type.developerName,
                        order: 0,
                        isSelected: false,
                        properties: JSON.parse(JSON.stringify(type.properties)).map(property => {
                            property.contentValue = null;
                            property.objectData = null;
                            property.typeElementPropertyId = property.id;
                            return property;
                        })
                    }];
                    break;

                case 'ADD':
                    valueToReference.objectData = valueToReference.objectData || [];

                    let objectData = manywho.utils.clone(valueToApply.objectData || valueToApply.defaultObjectData || []).map(objectData => {
                        if (valueToReference.objectData.length > 0) {
                            const existingItem = valueToReference.objectData.find(item => item.externalId === objectData.externalId);
                            if (existingItem) {
                                valueToReference.objectData.splice(valueToReference.objectData.indexOf(existingItem), 1);
                                return existingItem;
                            }
                        }
                        return objectData;
                    });

                    objectData = objectData.concat(manywho.utils.clone(valueToReference.objectData));
                    valueToReference.objectData = objectData;
                    break;

                case 'REMOVE':
                    valueToReference.objectData = valueToReference.objectData || [];

                    valueToReference.objectData = manywho.utils.clone(valueToApply.objectData || valueToApply.defaultObjectData || [])
                        .filter(objectData => !valueToReference.objectData.find(item => item.externalId === objectData.externalId));
                    break;
            }

            state.setValue(operation.valueElementToApplyId, typeElementId, snapshot, valueToReference);
        }

        return state;
    }

};
