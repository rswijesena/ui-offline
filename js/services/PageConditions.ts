import { getStateValue, setStateValue } from '../models/State';

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

/**
 * @param condition Page condition metadata
 * @param pageElement Page metadata
 * @param request Request metadata
 * @param snapshot used to extract stae values
 * @description Extracting metadata values from a page condition
 * that get used later when applying page condition logic on the client
 */
const extractPageConditionValues = (
    condition: any,
    pageElement: any,
    request: any,
    snapshot: any,
) => {

    // This is the value that is used for checking equality
    // against the current value of the trigger component
    // (so when a scalar page condition is performed)
    const rightValueElementToReference =
    condition
    .pageRules[0]
    .right
    .valueElementToReferenceId;

    // And this is it's content value
    const rightValueElementContentValue =
    rightValueElementToReference
    ? snapshot
        .getValue(
            { id: rightValueElementToReference.id },
        ).defaultContentValue
    : null;

    // The id of the component that triggers the page condition
    const leftpageObjectReferenceId = condition
    .pageRules[0]
    .left
    .pageObjectReferenceId;

    // This is the id of the value associated
    // to the component that triggers the page condition
    const leftValueElementToReference = pageElement
    .pageComponents
    .find(
        component => component.id === leftpageObjectReferenceId,
    ).valueElementValueBindingReferenceId;

    // Id of the page component that listens for the condition
    const pageOpAssigeeComponent = condition
    .pageOperations[0]
    .assignment
    .assignee
    .pageObjectReferenceId;

    // Value id for the page component
    // that listens for the condition
    const pageOpAssigneeValue = pageElement
    .pageComponents
    .find(
        component => component.id === pageOpAssigeeComponent,
    ).valueElementValueBindingReferenceId;

    // e.g. required, visible etc
    const metaDataType = condition
    .pageOperations[0]
    .assignment
    .assignee
    .metadataType;

    // e.g. is equal/not equal etc
    const criteria = condition.
    pageRules[0]
    .criteriaType;

    let leftValueElementContentValue = null;
    let leftpageObjectReferenceValue = null;

    if (request.invokeType === 'SYNC') {

        // Get the values content value from state
        leftValueElementContentValue = leftValueElementToReference
        ? getStateValue(
            { id: leftValueElementToReference.id },
            null,
            'Boolean',
            '',
        ).contentValue
        : null;

        // However, the pageComponentInputResponses may
        // contain a null content value for the value we want,
        // in which case we will need to extract the
        // default content value from our snapshot
        if (leftValueElementContentValue === null) {
            leftValueElementContentValue = leftValueElementToReference
                ? snapshot
                    .getValue(
                        { id: leftValueElementToReference.id },
                    ).defaultContentValue
                : null;
        }

        // When the flow attempts to sync with the engine i.e.
        // when the value of a page component changes
        // to trigger a page conditionthen we want to
        // extract that changed value from the incomping request
        leftpageObjectReferenceValue =
            request
            .mapElementInvokeRequest
            .pageRequest
            .pageComponentInputResponses
            .find(
                component => component.pageComponentId === leftpageObjectReferenceId,
            ).contentValue;

    } else {

        // This is for handling when the user has gone into offline
        // mode before hitting the page. We have no idea what the pageComponentInputResponses
        // are so have to extract the value id from the metadata in our snapshot
        leftpageObjectReferenceValue = snapshot.getValue(
            { id: leftValueElementToReference.id },
        ).defaultContentValue;
    }

    return {
        rightValueElementToReference,
        leftpageObjectReferenceId,
        leftValueElementToReference,
        rightValueElementContentValue,
        leftpageObjectReferenceValue,
        leftValueElementContentValue,
        metaDataType,
        criteria,
        pageOpAssigeeComponent,
        pageOpAssigneeValue,
    };
};

/**
 * @param newProps Object with key values that can potentially be changed
 * @param componentProps Object decribing all component properties
 * @param toggle
 * @param metaDataType Determines which property gets changed
 * @param pageOpAssigeeComponent Id of the component in the page operation
 * @param pageOpAssigneeValue Id of the component value in the page operation
 * @param invokeType The type of incoming request from the runtime UI
 * @description Determine which prop value to update based on metadata type
 */
const updateComponentValue = (
    newProps: any,
    componentProps: any,
    toggle: Boolean,
    metaDataType: String,
    pageOpAssigeeComponent: String,
    pageOpAssigneeValue: any,
    invokeType: String,
) => {

    switch (metaDataType) {

    case METADATA_TYPES.visible:
        newProps.isVisible = toggle;

        // When the page component that is listening for the page
        // condition has been triggered to become invisible
        // then it's value needs to be cleared out
        if (toggle === false && invokeType === 'SYNC') {
            const values = {
                contentValue: '',
                objectData: null,
                pageComponentId: pageOpAssigeeComponent,
            };
            setStateValue(
                { id: pageOpAssigneeValue.id },
                '',
                null,
                values,
            );
        }
        return Object.assign(componentProps, newProps);

    case METADATA_TYPES.required:
        newProps.isRequired = toggle;
        return Object.assign(componentProps, newProps);

    case METADATA_TYPES.enabled:
        newProps.isEnabled = toggle;
        return Object.assign(componentProps, newProps);

    default:
        return componentProps;
    }
};

/**
 * @param leftValueReference Value of the component that triggers the condition
 * @param rightValueReference Value that leftValueReference is compared with
 * @param componentProps
 * @param invokeType The type of incoming request from the runtime UI
 * @param metaDataType Determines which property gets changed
 * @param criteria Determines what logic is applied to the condition
 * @param pageOpAssigeeComponent Id of the component in the page operation
 * @param pageOpAssigneeValue Object representing the component value in the page operation
 * @description Handling scalar page conditions whilst offline
 */
const applyScalarCondition = (
    leftValueReference: (String|Number),
    rightValueReference: (String|Number),
    componentProps: any,
    invokeType: String,
    metaDataType: String,
    criteria: String,
    pageOpAssigeeComponent: String,
    pageOpAssigneeValue: any,
) => {

    const newProps = {
        isVisible: componentProps.isVisible,
        isRequired: componentProps.isRequired,
        isEnabled: componentProps.isEnabled,
    };

    let toggle = null;

    switch (criteria) {

    case CRITERIA.isEmpty:
        if (rightValueReference === 'False') {
            if (!leftValueReference) {
                toggle = false;
            } else {
                toggle = true;
            }
            break;
        }

        if (rightValueReference === 'True') {
            if (leftValueReference) {
                toggle = false;
            } else {
                toggle = true;
            }
            break;
        }

    case CRITERIA.isEqual:
        if (leftValueReference === rightValueReference) {
            toggle = true;
        } else {
            toggle = false;
        }
        break;

    case CRITERIA.isNotEqual:
        if (leftValueReference !== rightValueReference) {
            toggle = true;
        } else {
            toggle = false;
        }
        break;
    }

    return updateComponentValue(
        newProps,
        componentProps,
        toggle,
        metaDataType,
        pageOpAssigeeComponent,
        pageOpAssigneeValue,
        invokeType,
    );
};

/**
 * @param pageCondition A single page conditions metadata
 * @param booleanComponentValue The value ID of the component that triggers the condition
 * @param snapshot
 * @param componentProps An object with some default component properties such as isRequired etc
 * @param invokeType The type of incoming request from the runtime UI
 * @param metaDataType Determines which property gets changed
 * @param pageOpAssigeeComponent Id of the component in the page operation
 * @param pageOpAssigneeValue Object representing the component value in the page operation
 * @description Handling simple true/false page conditions whilst offline
 */
const applyBooleanCondition = (
    pageCondition: any,
    booleanComponentValue: (String|Boolean),
    snapshot: any,
    componentProps: any,
    invokeType: String,
    metaDataType: String,
    pageOpAssigeeComponent: String,
    pageOpAssigneeValue: any,
) => {

    const newProps = {
        isVisible: componentProps.isVisible,
        isRequired: componentProps.isRequired,
        isEnabled: componentProps.isEnabled,
    };

    // For boolean page conditions, this value will always be a system value
    const rightValueRef = snapshot
        .getSystemValue(
            pageCondition
            .pageRules[0]
            .right
            .valueElementToReferenceId
            .id,
        ).defaultContentValue;

    let leftValueRef = booleanComponentValue;

    // Sometimes the engine sets boolean content values as strings
    // so to be safe we will always transform to a string
    if (booleanComponentValue === true || booleanComponentValue === 'true' || booleanComponentValue === 'True') {
        leftValueRef = 'True';
    }
    if (booleanComponentValue === false || booleanComponentValue === 'false' || booleanComponentValue === 'False') {
        leftValueRef = 'False';
    }

    let toggle = null;

    if (leftValueRef === 'False' && rightValueRef === 'False') {
        toggle = true;
    }

    if (leftValueRef === 'True' && rightValueRef === 'True') {
        toggle = true;
    }

    if (leftValueRef === 'True' && rightValueRef === 'False') {
        toggle = false;
    }

    if (leftValueRef === 'False' && rightValueRef === 'True') {
        toggle = false;
    }

    return updateComponentValue(
        newProps,
        componentProps,
        toggle,
        metaDataType,
        pageOpAssigeeComponent,
        pageOpAssigneeValue,
        invokeType,
    );
};

export default {
    applyBooleanCondition,
    applyScalarCondition,
    updateComponentValue,
    extractPageConditionValues,
    checkForEvents,
    checkForCondition,
};
