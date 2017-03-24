/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;
declare var moment: any;

manywho.offline.rules = class Rules {

    static getOutcome(outcomes, state, snapshot) {
        if (!outcomes)
            return null;

        const sortedOutcomes = outcomes.sort((a, b) => a.order - b.order);

        for (let outcome of sortedOutcomes) {
            let result = false;

            if (outcome.comparison)
                result = manywho.offline.rules.evaluateComparisons([outcome.comparison], state, snapshot);
            else
                result = true;

            if (result)
                return outcome;
        }
    }

    static evaluateComparisons(comparisons, state, snapshot): boolean {
        let result = false;

        for (let comparison of comparisons) {
            if (comparison.rules)
                result = manywho.offline.rules.evaluateRules(comparison.rules, comparison.comparisonType, state, snapshot);

            if (comparison.comparisons)
                result = manywho.offline.rules.evaluateComparisons(comparison.comparisons, state, snapshot);

            if (result && comparison.comparisonType === 'ANY')
                return true;
        }

        return result;
    }

    static evaluateRules(rules, criteriaType, state, snapshot): boolean {
        let result = false;

        for (let rule of rules) {
            let contentType = manywho.component.contentTypes.string;

            let left = snapshot.getValue(rule.leftValueElementToReferenceId);
            left = state.getValue(rule.leftValueElementToReferenceId, left.typeElementId, left.contentType) || left;

            let right = snapshot.getValue(rule.rightValueElementToReferenceId);
            right = state.getValue(rule.rightValueElementToReferenceId, right.typeElementId, right.contentType) || right;

            result = manywho.offline.rules.compareValues(left, right, contentType, rule.criteriaType);

            if (result && criteriaType === 'ANY')
                return true;
        }

        return result;
    }

    static compareValues(left, right, contentType, criteriaType) {
        switch (contentType) {
            case 'CONTENTEOBJECT':
                return manywho.offline.rules.compareObjects(left, right, criteriaType);
            case 'CONTENTLIST':
                return manywho.offline.rules.compareLists(left, right, criteriaType);
            default:
                const values = manywho.offline.rules.getContentValues(left, right, contentType);
                return manywho.offline.rules.compareContentValues(values.left, values.right, criteriaType);
        }
    }

    static getContentValues(left, right, contentType) {
        const leftContentValue = left.defaultContentValue || left.contentValue;
        const rightContentValue = right.defaultContentValue || right.contentValue;

        switch (contentType) {
            case 'CONTENTSTRING':
            case 'CONTENTCONTENT':
            case 'CONTENTPASSWORD':
            case 'CONTENTENCRYPTED':
                return {
                    left: leftContentValue ? leftContentValue.toUpperCase() : leftContentValue,
                    right: rightContentValue ? rightContentValue.toUpperCase() : rightContentValue
                };
            case 'CONTENTNUMBER':
                return {
                    left: leftContentValue ? parseFloat(leftContentValue) : leftContentValue,
                    right: rightContentValue ? parseFloat(rightContentValue) : rightContentValue
                };
            case 'CONTENTDATETIME':
               return {
                    left: leftContentValue ? moment(leftContentValue) : leftContentValue,
                    right: rightContentValue ? moment(rightContentValue) : rightContentValue
                };
            case 'CONTENTBOOLEAN':
                return {
                    left: leftContentValue ? new Boolean(leftContentValue) : leftContentValue,
                    right: rightContentValue ? new Boolean(rightContentValue) : rightContentValue
                };
        }
    }

    static compareContentValues(left, right, criteriaType) {
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
                return manywho.utils.isNullOrEmpty(left);
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
};
