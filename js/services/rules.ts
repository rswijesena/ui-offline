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
                result = manywho.offline.rules.evaluatRules(comparison.rules, comparison.comparisonType, state, snapshot);

            if (comparison.comparisons)
                result = manywho.offline.rules.evaluateComparisons(comparison.comparisons, state, snapshot);

            if (result && comparison.comparisonType === 'OR')
                return true;
        }

        return result;
    }

    static evaluateRules(rules, criteriaType, state, snapshot): boolean {
        let result = false;

        for (let rule of rules) {
            let left = snapshot.getValue(rule.leftValueElementToReferenceId);
            left = state.getValue(rule.leftValueElementToReferenceId, left.typeElementId, left.contentType) || left;

            let right = snapshot.getValue(rule.rightValueElementToReferenceId);
            right = state.getValue(rule.rightValueElementToReferenceId, right.typeElementId, right.contentType) || right;

            result = manywho.offline.rules.comapreValues(left, right, rule.criteriaType);

            if (result && criteriaType === 'OR')
                return true;
        }

        return result;
    }

    static compareValues(left, right, criteriaType) {
        const contentType: string = 'CONTENTSTRING';

        switch (contentType) {
            case 'CONTENTSTRING':
                return manywho.offline.rules.compareStrings(left.contentValue, right.contentValue, criteriaType);
            case 'CONTENTNUMBER':
                return manywho.offline.rules.compareNumbers(left.contentValue, right.contentValue, criteriaType);
            case 'CONTENTDATETIME':
                return manywho.offline.rules.compareDateTimes(left.contentValue, right.contentValue, criteriaType);
            case 'CONTENTBOOLEAN':
                return manywho.offline.rules.compareBooleans(left.contentValue, right.contentValue, criteriaType);
        }
    }

    static compareStrings(left, right, criteriaType) {
        left = left ? left.toUpperCase() : left;
        right = right ? right.toUpperCase() : right;

        switch (criteriaType.toUpperCase()) {
            case 'EQUAL':
                return left === right;

            case 'NOTE_EQUAL':
                return  left !== right;
        }
    }

    static compareNumbers(left, right, criteriaType) {
        left = left ? parseFloat(left) : left;
        right = right ? parseFloat(right) : right;

        switch (criteriaType.toUpperCase()) {
            case 'EQUAL':
                return left === right;

            case 'NOTE_EQUAL':
                return  left !== right;
        }
    }

    static compareDateTimes(left, right, criteriaType) {
        left = left ? moment(left) : left;
        right = right ? moment(right) : right;

        switch (criteriaType.toUpperCase()) {
            case 'EQUAL':
                return left === right;

            case 'NOTE_EQUAL':
                return  left !== right;
        }
    }

    static compareBooleans(left, right, criteriaType) {
        left = left ? new Boolean(left) : left;
        right = right ? new Boolean(right) : right;

        switch (criteriaType.toUpperCase()) {
            case 'EQUAL':
                return left === right;

            case 'NOTE_EQUAL':
                return  left !== right;
        }

        return false;
    }

};
