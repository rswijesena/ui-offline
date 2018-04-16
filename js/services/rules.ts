declare var manywho: any;
declare var moment: any;

class Rules {

    static getOutcome(outcomes, state, snapshot) {
        if (!outcomes) {
            return null;
        }

        const sortedOutcomes = outcomes.sort((a, b) => a.order - b.order);

        for (const outcome of sortedOutcomes) {
            let result = false;

            if (outcome.comparison) {
                result = Rules.evaluateComparisons([outcome.comparison], state, snapshot);
            } else {
                result = true;
            }

            if (result) {
                return outcome;
            }
        }
    }

    static evaluateComparisons(comparisons, state, snapshot): boolean {
        let result = false;

        for (const comparison of comparisons) {
            if (comparison.rules) {
                result = Rules.evaluateRules(comparison.rules, comparison.comparisonType, state, snapshot);
            }
            if (comparison.comparisons) {
                result = Rules.evaluateComparisons(comparison.comparisons, state, snapshot);
            }
            if (result && comparison.comparisonType === 'OR') {
                return true;
            }
        }

        return result;
    }

    static evaluateRules(rules, criteriaType, state, snapshot): boolean {
        let result = false;

        for (const rule of rules) {
            const contentType = manywho.component.contentTypes.string;

            let left = snapshot.getValue(rule.leftValueElementToReferenceId);
            left = state.getValue(rule.leftValueElementToReferenceId, left.typeElementId, left.contentType) || left;

            let right = snapshot.getValue(rule.rightValueElementToReferenceId);
            right = state.getValue(rule.rightValueElementToReferenceId, right.typeElementId, right.contentType) || right;

            result = Rules.compareValues(left, right, contentType, rule.criteriaType);

            if (result && criteriaType === 'OR') {
                return true;
            }
        }

        return result;
    }

    static compareValues(left, right, contentType, criteriaType) {
        switch (contentType) {
        case manywho.component.contentTypes.object:
            return Rules.compareObjects(left, right, criteriaType);
        case manywho.component.contentTypes.list:
            return Rules.compareLists(left, right, criteriaType);
        default:
            const rightContentValue = criteriaType === 'IS_EMPTY' ?
                Rules.getContentValue(right, manywho.component.contentTypes.boolean) :
                Rules.getContentValue(right, contentType);

            return Rules.compareContentValues(Rules.getContentValue(left, contentType), rightContentValue, criteriaType, contentType);
        }
    }

    static getContentValue(value, contentType) {
        const contentValue = value.defaultContentValue || value.contentValue;

        switch (contentType) {
        case manywho.component.contentTypes.string:
        case manywho.component.contentTypes.content:
        case manywho.component.contentTypes.password:
        case manywho.component.contentTypes.encrypted:
            return contentValue ? contentValue.toUpperCase() : contentValue;
        case manywho.component.contentTypes.number:
            return contentValue ? parseFloat(contentValue) : contentValue;
        case manywho.component.contentTypes.datetime:
            return contentValue ? moment(contentValue) : contentValue;
        case manywho.component.contentTypes.boolean:
            return contentValue ? Boolean(contentValue) : contentValue;
        }
    }

    static compareContentValues(left, right, criteriaType, contentType) {
        switch (criteriaType.toUpperCase()) {
        case 'EQUAL':
            return left === right;

        case 'NOT_EQUAL':
            return  left !== right;

        case 'GREATER_THAN':
            return left > right;

        case 'GREATER_THAN_OR_EQUAL':
            return left >= right;

        case 'LESS_THAN':
            return left < right;

        case 'LESS_THAN_OR_EQUAL':
            return left <= right;

        case 'STARTS_WITH':
            return left.startsWith(right);

        case 'ENDS_WITH':
            return left.endsWith(right);

        case 'CONTAINS':
            return left.indexOf(right) !== -1;

        case 'IS_EMPTY':
            switch (contentType.toUpperCase()) {
            case manywho.component.contentTypes.string:
            case manywho.component.contentTypes.password:
            case manywho.component.contentTypes.content:
            case manywho.component.contentTypes.encrypted:
                return (manywho.utils.isNullOrEmpty(left) && right) || (!manywho.utils.isNullOrEmpty(left) && !right);
            case manywho.component.contentTypes.number:
            case manywho.component.contentTypes.boolean:
            case manywho.component.contentTypes.datetime:
                return (left === null && right) || (left !== null && !right);
            }
        }
    }

    static compareObjects(left, right, criteriaType) {
        switch (criteriaType.toUpperCase()) {
        case 'IS_EMPTY':
            return true;
        }
    }

    static compareLists(left, right, criteriaType) {
        switch (criteriaType.toUpperCase()) {
        case 'IS_EMPTY':
            return true;
        }
    }
}

export default Rules;
