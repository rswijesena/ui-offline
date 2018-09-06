import { METADATA_TYPES } from '../../constants';

/**
 * @param pageOperation
 * @param snapshot
 * @param pageRuleResult
 * @param value
 * @param component
 * @description Determines the result of a page operation by
 * comparing the result of a page rule with the value defined
 * in the page operation and modfifies a components properties
 */
const PageOperation = (
    pageOperation,
    snapshot,
    pageRuleResult,
    value,
    component,
) => {

    let pageOperationResult = undefined;

    if (pageOperation.assignment.assignee.pageObjectReferenceId === component.id) {
        const metaDataType = pageOperation.assignment.assignee.metadataType;
        const assignorValueId = pageOperation.assignment.assignor.valueElementToReferenceId.id;
        const assignorValue = snapshot.getValue(
            { id: assignorValueId },
        );

        if (!assignorValue) {
            throw new Error(`Cannot find an assignor value for operation`);
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
};

export default PageOperation;
