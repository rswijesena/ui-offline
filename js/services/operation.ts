/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

function isCommandSupported(command) {
    const commands = ['NEW', 'EMPTY', 'SET_EQUAL', 'VALUE_OF'];

    if (manywho.utils.isNullOrWhitespace(command) || commands.indexOf(command) !== -1)
        return true;

    manywho.log.info('The Operation command is not supported and this operation will be ignored: ' + command);
    return false;
}

manywho.offline.operation = class Operation {

    static execute(operation, state, snapshot) {
        let valueToReference = {
            objectData: null,
            contentValue: null
        };

        if (operation.valueElementToReferenceId) {
            if (!isCommandSupported(operation.valueElementToReferenceId.command))
                return state;

            const value = snapshot.getValue(operation.valueElementToReferenceId.id);
            valueToReference = state.getValue(operation.valueElementToReferenceId, value.typeElementId);
        }

        if (operation.valueElementToApplyId) {
            if (!isCommandSupported(operation.valueElementToApplyId.command))
                return state;

            const value = snapshot.getValue(operation.valueElementToApplyId.id);

            if (operation.valueElementToApplyId.command === 'NEW' || operation.valueElementToApplyId.command === 'EMPTY')
                valueToReference = { objectData: null, contentValue: null };

            state.setValue(operation.valueElementToApplyId, value.typeElementId, snapshot, valueToReference);
        }

        return state;
    }

};
