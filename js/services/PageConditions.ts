/**
 *
 */
export const checkForCondition = (pageOperations, componentId) => {
    return pageOperations.find(
        operation => operation.assignment.assignee.pageObjectReferenceId === componentId,
    );
};

/**
 *
 */
export const applyBooleanCondition = (
pageCondition,
booleanComponentValue,
snapshot,
componentProps) => {

    const newProps = {
        isVisible: componentProps.isVisible,
        isRequired: componentProps.isRequired,
        isEnabled: componentProps.isEnabled,
    };

    const metaDataType = pageCondition.pageOperations[0].assignment.assignee.metadataType;

    // For boolean page conditions, this value will always be a system value
    const rightValueRef = snapshot.getSystemValue(
        pageCondition.pageRules[0].right.valueElementToReferenceId.id,
    ).defaultContentValue;

    let leftValueRef = booleanComponentValue;

    // Sometimes the engine sets boolean content values as strings
    // so to be safe we will always transform to a string
    if (booleanComponentValue === true || booleanComponentValue === 'true') {
        leftValueRef = 'True';
    }
    if (booleanComponentValue === false || booleanComponentValue === 'false') {
        leftValueRef = 'False';
    }

    let toggle = null;
    
    if (leftValueRef === 'False' && rightValueRef === 'False') {
        toggle = false;
    }

    if (leftValueRef === 'True' && rightValueRef === 'True') {
        toggle = true;
    }

    if (leftValueRef === 'True' && rightValueRef === 'False') {
        toggle = false;
    }

    if (leftValueRef === 'False' && rightValueRef === 'True') {
        toggle = true;
    }

    switch (metaDataType) {

    case 'METADATA.VISIBLE':
        newProps.isVisible = toggle;
        return Object.assign(componentProps, newProps);

    case 'METADATA.REQUIRED':
        newProps.isRequired = toggle;
        return Object.assign(componentProps, newProps);

    case 'METADATA.ENABLED':
        newProps.isEnabled = toggle;
        return Object.assign(componentProps, newProps);

    default:
        return componentProps;
    }  
};
