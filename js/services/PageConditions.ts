import { getStateValue } from '../models/State';

const METADATA_TYPES = {
    visible: 'METADATA.VISIBLE',
    required: 'METADATA.REQUIRED',
    enabled: 'METADATA.ENABLED',
};

const CRITERIA = {
    isEmpty: 'IS_EMPTY',
    isEqual: 'EQUAL',
    isNotEqual: 'NOT_EQUAL',
};

/**
 * @param pageConditions An array of page conditions metadata
 * @param componentId
 * @description To check if a component is listening for a page condition to be triggered
 */
const checkForCondition = (pageConditions, componentId: String) => {
    let result = undefined;
    pageConditions.forEach((pageCondition) => {
        pageCondition.pageOperations.forEach((operation) => {
            if (operation.assignment.assignee.pageObjectReferenceId === componentId) {
                result = pageCondition;
            }
        });
    });

    return result;
};

/**
 * @param pageConditions An array of page conditions metadata
 * @param componentId
 * @description To check if a component triggers a page condition
 */
const checkForEvents = (pageConditions, componentId: String) => {
    let result = undefined;
    pageConditions.forEach((pageCondition) => {
        pageCondition.pageRules.forEach((pageRule) => {
            if (pageRule.left.pageObjectReferenceId === componentId) {
                result = pageRule;
            }
        });
    });

    return result;
};

const PageConditions = (pageElement, snapshot, component, value) => {
    let pageRuleResult = undefined;
    let pageOperationResult = undefined;
    let triggerComponentContentValue = undefined;

    // Check component triggers a page condition
    const hasEvents = checkForEvents(
        pageElement.pageConditions,
        component.id,
    );

    // If a component triggers a page condition
    // then the components metadata stored in state
    // needs to have the hasEvents property as a flag
    // so the ui knows to make a syncronisation call
    // to the engine.
    if (hasEvents !== undefined) {
        component['hasEvents'] = true;
    } else {
        component['hasEvents'] = false;
    }

    // First check to see if this component is a component
    // listening for a condition i.e. has an operation
    // associated to it
    const assocCondition = checkForCondition(
        pageElement.pageConditions,
        component.id,
    );

    // If it does then do the following:
    if (assocCondition !== undefined && assocCondition.pageRules.length === 1 && assocCondition.pageOperations) {
        const pageRule = assocCondition.pageRules[0];
        const pageOperations = assocCondition.pageOperations;
        const criteriaType = pageRule.criteriaType;

        if (!criteriaType) {
            throw new Error('Check you have added a criteria value');
        }

        // First check to see if the most upda to date contnent value for
        // the trigger component can be found in the offline state
        const triggerComponent = pageElement.pageComponents.find(component => component.id === pageRule.left.pageObjectReferenceId);
        const triggerComponentValueObject = getStateValue(
            { id: triggerComponent.valueElementValueBindingReferenceId.id },
            null,
            null,
            null,
        );

        // If is in state then grab the content value property
        if (triggerComponentValueObject) {
            triggerComponentContentValue = triggerComponentValueObject.contentValue;
        }

        // If value was not found in state then extract the default
        // content value from the flow snapshot
        if (typeof triggerComponentContentValue === 'undefined' || triggerComponentContentValue === null) {
            const snapshotValue = snapshot.getValue(
                { id: triggerComponent.valueElementValueBindingReferenceId.id },
            );
            triggerComponentContentValue = snapshotValue.defaultContentValue;
        }

        // If the components value has object data then we want to extract
        // the appropriate propertiesw content value and use that for comparing
        if (
            triggerComponentValueObject &&
            triggerComponentValueObject.objectData &&
            triggerComponentValueObject.objectData.length > 0
        ) {
            triggerComponentContentValue = triggerComponentValueObject.objectData[0].properties.find(
                property => property.typeElementPropertyId ===
                pageRule.left.valueElementToReferenceId.typeElementPropertyId,
            ).contentValue;
        }

        if (typeof triggerComponentContentValue === 'undefined') {
            throw new Error(`Cannot find a trigger component content value`);
        }

        // We also want the value that we are comparing it too
        // (the "right" property of the page rule)
        // This is static so we always extract the content value
        // from the snapshot
        const valueComparableId = pageRule.right.valueElementToReferenceId.id;
        const valueComparable = snapshot.getValue(
            { id: valueComparableId },
        );

        if (!valueComparable) {
            throw new Error(`Cannot find a value to compare`);
        }

        // Now compare the two values (so this is the left and the right values)
        switch (criteriaType) {

        case CRITERIA.isEqual:
            if (
                String(triggerComponentContentValue).toUpperCase() ===
                String(valueComparable.defaultContentValue).toUpperCase()
            ) {
                pageRuleResult = true;
            } else {
                pageRuleResult = false;
            }
            break;
        case CRITERIA.isNotEqual:
            if (
                String(triggerComponentContentValue).toUpperCase() !==
                String(valueComparable.defaultContentValue).toUpperCase()
            ) {
                pageRuleResult = true;
            } else {
                pageRuleResult = false;
            }
            break;
        case CRITERIA.isEmpty:

            // Is empty
            if (String(valueComparable.defaultContentValue).toUpperCase() === 'TRUE') {
                if (
                    (String(triggerComponentContentValue).toUpperCase() === 'NULL' ||
                    triggerComponentContentValue === '') &&
                    value.objectData === null
                ) {
                    pageRuleResult = true;
                } else {
                    pageRuleResult = false;
                }
                break;
            }

            // Is not empty
            if (String(valueComparable.defaultContentValue).toUpperCase() === 'FALSE') {
                if (
                    (String(triggerComponentContentValue).toUpperCase() === 'NULL' ||
                    triggerComponentContentValue === '') &&
                    value.objectData === null
                ) {
                    pageRuleResult = false;
                } else {
                    pageRuleResult = true;
                }
                break;
            }
        }

        pageOperations.forEach((pageOperation) => {

            // We need the assignor value, this should be
            // extracted from the snapshot
            if (pageOperation.assignment.assignee.pageObjectReferenceId === component.id) {
                const metaDataType = pageOperation.assignment.assignee.metadataType;
                const assignorValueId = pageOperation.assignment.assignor.valueElementToReferenceId.id;
                const assignorValue = snapshot.getValue(
                    { id: assignorValueId },
                );

                if (!assignorValue) {
                    throw new Error(`Cannot find an assignor value value for operation`);
                }

                // Now we need to compare the equality of the result from the page
                // rule equality check with the assignor value
                // The result of which should be a boolean
                if (typeof pageRuleResult !== 'undefined') {
                    if (
                        assignorValue.defaultContentValue.toUpperCase() ===
                        String(pageRuleResult).toUpperCase()
                    ) {
                        pageOperationResult = true;
                    } else {
                        pageOperationResult = false;
                    }

                    const newProps = {
                        isVisible: value.isVisible,
                        isRequired: value.isRequired,
                        isEnabled: value.isEnabled,
                    };

                    // Now the appropriate component key value can
                    // be modified (this is based on the page conditions metadatatype)
                    switch (metaDataType) {

                    case METADATA_TYPES.visible:
                        newProps.isVisible = pageOperationResult;
                        return Object.assign(value, newProps);

                    case METADATA_TYPES.required:
                        newProps.isRequired = pageOperationResult;
                        return Object.assign(value, newProps);

                    case METADATA_TYPES.enabled:
                        newProps.isEnabled = pageOperationResult;
                        return Object.assign(value, newProps);

                    default:
                        return value;
                    }
                }
            }
        });

    }
    return value;
};

export default PageConditions;
