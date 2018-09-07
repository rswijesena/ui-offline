import { CRITERIA } from '../../constants';

/**
 * @param criteriaType
 * @param triggerComponentContentValue
 * @param valueComparable
 * @param value
 * @description Determines the result of a page rule by
 * comparing string values. Will return a boolean.
 * TODO: create interfaces and typecasting
 */
const PageRule = (
    criteriaType,
    triggerComponentContentValue,
    valueComparable,
    value,
) => {

    let pageRuleResult = undefined;

    // Currently, offline only supports - equal, not_equal
    // and is_empty criteria types
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

    return pageRuleResult;
};

export default PageRule;
