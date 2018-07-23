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

const PageConditions = {

    /**
     * @param pageOperations An array of page operation objects for a particular condition
     * @param componentId
     * @description To check if a component is listening for a page condition to be triggered
     */
    checkForCondition: (pageConditions, componentId: String) => {
        let result = undefined;
        pageConditions.forEach((pageCondition) => {
            pageCondition.pageOperations.forEach((operation) => {
                if (operation.assignment.assignee.pageObjectReferenceId === componentId) {
                    result = pageCondition;
                }
            });
        });

        return result;
    },

    /**
     * @param pageRules An array of rule objects for a particular condition
     * @param componentId
     * @description To check if a component triggers a page condition
     */
    checkForEvents: (pageConditions, componentId: String) => {
        let result = undefined;
        pageConditions.forEach((pageCondition) => {
            pageCondition.pageRules.forEach((pageRule) => {
                if (pageRule.left.pageObjectReferenceId === componentId) {
                    result = pageRule;
                }
            });
        });

        return result;
    },

    /**
     * @description Handling scalar page conditions whilst offline
     */
    applyScalarCondition: (
        pageCondition: any,
        leftValueReference: (String|Number),
        rightValueReference: (String|Number),
        componentProps: any,
    ) => {

        const newProps = {
            isVisible: componentProps.isVisible,
            isRequired: componentProps.isRequired,
            isEnabled: componentProps.isEnabled,
        };

        const metaDataType = pageCondition.pageOperations[0].assignment.assignee.metadataType;
        const criteria = pageCondition.pageRules[0].criteriaType;
        let toggle = null;

        switch (criteria) {

        case CRITERIA.isEmpty:
            if (rightValueReference === 'False') {
                if (!leftValueReference) {
                    toggle = true;
                } else {
                    toggle = false;
                }
                break;
            }

            if (rightValueReference === 'True') {
                if (leftValueReference) {
                    toggle = true;
                } else {
                    toggle = false;
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

        switch (metaDataType) {

        case METADATA_TYPES.visible:
            newProps.isVisible = toggle;
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
    },

    /**
     * @param pageCondition A single page conditions metadata
     * @param booleanComponentValue The value ID of the component that triggers the condition
     * @param snapshot
     * @param componentProps An object with some default component properties such as isRequired etc
     * @description Handling simple true/false page conditions whilst offline
     */
    applyBooleanCondition: (
        pageCondition: any,
        booleanComponentValue: (String|Boolean),
        snapshot: any,
        componentProps: any,
    ) => {

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

        switch (metaDataType) {

        case METADATA_TYPES.visible:
            newProps.isVisible = toggle;
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
    },
};

export default PageConditions;
