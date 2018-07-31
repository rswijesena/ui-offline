import { getStateValue, setStateValue } from '../models/State';
import { clone, guid } from '../services/Utils';
import { IState } from '../interfaces/IModels';
import Worker from 'worker-loader?publicPath=build/js/&name=worker.js!../../workers/Worker';

declare var manywho: any;

const commands = ['NEW', 'EMPTY', 'SET_EQUAL', 'VALUE_OF', 'GET_FIRST', 'GET_NEXT', 'ADD', 'REMOVE'];

/**
 * Determine if an operation command is supported
 * currently subtract and concatenate are not supported
 * Todo: add support for unsupported commands
 * @param command
 */
const isCommandSupported = (command: string) => {
    if (manywho.utils.isNullOrWhitespace(command) || commands.indexOf(command) !== -1) {
        return true;
    }
    manywho.log.info('The Operation command is not supported and this operation will be ignored: ' + command);
    return false;
};

/**
 * Execute the operation and update the values in the local state.
 * Supports the following command types: NEW, EMPTY, SET_EQUAL, VALUE_OF, GET_FIRST, GET_NEXT, ADD, REMOVE
 * @param operation
 * @param state
 * @param snapshot
 */
export const executeOperation = (operation: any, state: IState, snapshot: any) => {
    let valueToReference: any = { objectData: null, contentValue: null };

    if (operation.macroElementToExecuteId) {
        const macro = snapshot.getMacro(operation.macroElementToExecuteId);

        if (macro) {
            const macroCode = macro.code;
            /*
            const test = (obj) => {
                const state = {
                    setDateTimeValue: (a, b) => {
                        const z = snapshot.getValueByName(a.replace(/[^a-zA-Z ]/g, ''));
                        const values = {
                            contentValue: b,
                            objectData: null,
                            pageComponentId: null,
                        };
                        setStateValue(
                            { id: z.id },
                            '',
                            null,
                            values,
                        );
                        return z;
                    },
                };
                return Function('"use strict";return (' + obj + ')')()(
                    state,
                );
            };*/
            /*
            console.log(test(
                'function(state){return ' + macroCode + '}',
            ));
            */
            const worker = new Worker();

            worker.postMessage({ snapshot, macro: macroCode });

            worker.onmessage = (e) => {
                console.log(e.data + ' has been received');

                const values = {
                    contentValue: e.data.newContentValue,
                    objectData: null,
                    pageComponentId: null,
                };

                setStateValue(
                    { id: e.data.valueId },
                    '',
                    null,
                    values,
                );

                worker.terminate();
            };
        }
    }

    if (operation.valueElementToReferenceId) {
        if (!isCommandSupported(operation.valueElementToReferenceId.command)) {
            return state;
        }

        valueToReference = snapshot.getValue(operation.valueElementToReferenceId);
        const stateValue = getStateValue(
            operation.valueElementToReferenceId,
            valueToReference.typeElementId,
            valueToReference.contentType,
            operation.valueElementToReferenceId.command,
        );
        if (stateValue) {
            valueToReference = stateValue;
        }
    }

    if (operation.valueElementToApplyId) {
        if (!isCommandSupported(operation.valueElementToApplyId.command)) {
            return state;
        }

        let valueToApply = snapshot.getValue(operation.valueElementToApplyId);
        const typeElementId = valueToApply ? valueToApply.typeElementId : null;
        const type = typeElementId ? snapshot.metadata.typeElements.find(typeElement => typeElement.id === typeElementId) : null;

        const stateValue = getStateValue(
            operation.valueElementToApplyId,
            valueToApply.typeElementId,
            valueToApply.contentType,
            operation.valueElementToApplyId.command,
        );
        if (stateValue) {
            valueToApply = stateValue;
        }

        switch (operation.valueElementToApplyId.command) {
        case 'NEW':
            valueToReference.objectData = [{
                externalId: guid(),
                internalId: guid(),
                developerName: type.developerName,
                order: 0,
                isSelected: false,
                properties: clone(type.properties).map((property) => {
                    property.contentValue = null;
                    property.objectData = null;
                    property.typeElementPropertyId = property.id;
                    return property;
                }),
            }];
            break;

        case 'ADD':
            valueToReference.objectData = valueToReference.objectData || [];

            let objectData = clone(valueToApply.objectData || valueToApply.defaultObjectData || []).map((objectData) => {
                if (valueToReference.objectData.length > 0) {
                    const existingItem = valueToReference.objectData.find(item => item.externalId === objectData.externalId);
                    if (existingItem) {
                        valueToReference.objectData.splice(valueToReference.objectData.indexOf(existingItem), 1);
                        return existingItem;
                    }
                }
                return objectData;
            });

            objectData = objectData.concat(clone(valueToReference.objectData));
            valueToReference.objectData = objectData;
            break;

        case 'REMOVE':
            valueToReference.objectData = valueToReference.objectData || [];

            valueToReference.objectData = clone(valueToApply.objectData || valueToApply.defaultObjectData || [])
                .filter(objectData => !valueToReference.objectData.find(item => item.externalId === objectData.externalId));
            break;
        }

        setStateValue(operation.valueElementToApplyId, typeElementId, snapshot, valueToReference);
    }

    return state;
};
