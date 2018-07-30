import PageConditions from '../../js/services/PageConditions';
import { setStateValue } from '../../js/models/State';

jest.mock('../../js/models/State', () => ({
    setStateValue: jest.fn(),
}));

describe('Page conditions expected behaviour', () => {
    test('Checking for a condition will return a page condition if found', () => {
        const componentId = 'test';
        const pageOperations = [
            {
                assignment: {
                    assignee: {
                        pageObjectReferenceId: componentId,
                    },
                },
            },
        ];
        const hasCondition = PageConditions.checkForCondition([{ pageOperations }], componentId);
        expect(hasCondition).toEqual({ pageOperations: [pageOperations[0]] });
    });
    test('Checking for a condition will return undefined if not found', () => {
        const componentId = 'test';
        const pageObjectReferenceId = 'abc123';
        const pageOperations = [
            {
                assignment: {
                    assignee: {
                        pageObjectReferenceId,
                    },
                },
            },
        ];
        const hasCondition = PageConditions.checkForCondition([{ pageOperations }], componentId);
        expect(hasCondition).toBeUndefined();
    });
    test('Checking for events will return a page rule if found', () => {
        const componentId = 'test';
        const pageRules = [
            {
                left: {
                    pageObjectReferenceId: componentId,
                },
            },
        ];
        const hasEvent = PageConditions.checkForEvents([{ pageRules }], componentId);
        expect(hasEvent).toEqual(pageRules[0]);
    });
    test('Checking for events will return undefined if not found', () => {
        const componentId = 'test';
        const pageObjectReferenceId = 'abc123';
        const pageRules = [
            {
                left: {
                    pageObjectReferenceId,
                },
            },
        ];
        const hasEvent = PageConditions.checkForEvents([{ pageRules }], componentId);
        expect(hasEvent).toBeUndefined();
    });
    test('isEnabled component value gets modified', () => {

        const mockComponentProps = {
            isVisible: true,
            isEnabled: true,
            isRequired: true,
            pageComponentId: 'test',
            contentValue: null,
            objectData: null,
            contentType: 'boolean',
            isValid: true,
        };

        const newProps = {
            isVisible: mockComponentProps.isVisible,
            isRequired: mockComponentProps.isRequired,
            isEnabled: mockComponentProps.isEnabled,
        };

        const update = PageConditions.updateComponentValue(
            newProps,
            mockComponentProps,
            false,
            'METADATA.ENABLED',
            null,
            null,
            null,
        );

        expect(mockComponentProps.isEnabled).toBeFalsy();
    });
    test('isRequired component value gets modified', () => {

        const mockComponentProps = {
            isVisible: true,
            isEnabled: true,
            isRequired: true,
            pageComponentId: 'test',
            contentValue: null,
            objectData: null,
            contentType: 'boolean',
            isValid: true,
        };

        const newProps = {
            isVisible: mockComponentProps.isVisible,
            isRequired: mockComponentProps.isRequired,
            isEnabled: mockComponentProps.isEnabled,
        };

        const update = PageConditions.updateComponentValue(
            newProps,
            mockComponentProps,
            false,
            'METADATA.REQUIRED',
            null,
            null,
            null,
        );

        expect(mockComponentProps.isRequired).toBeFalsy();
    });
    test('isVisible component value gets modified and state value gets updated', () => {

        const mockComponentProps = {
            isVisible: true,
            isEnabled: true,
            isRequired: true,
            pageComponentId: 'test',
            contentValue: null,
            objectData: null,
            contentType: 'boolean',
            isValid: true,
        };

        const newProps = {
            isVisible: mockComponentProps.isVisible,
            isRequired: mockComponentProps.isRequired,
            isEnabled: mockComponentProps.isEnabled,
        };

        const update = PageConditions.updateComponentValue(
            newProps,
            mockComponentProps,
            false,
            'METADATA.VISIBLE',
            'test',
            'test',
            'SYNC',
        );
        expect(setStateValue).toHaveBeenCalled();
        expect(mockComponentProps.isVisible).toBeFalsy();
    });
    test('When applying scalar condition, toggle is set to true when two values are equal', () => {
        const mockComponentProps = {
            isVisible: true,
            isEnabled: true,
            isRequired: true,
            pageComponentId: 'test',
            contentValue: null,
            objectData: null,
            contentType: 'boolean',
            isValid: true,
        };

        const leftValue = 'test';
        const rightValue = 'test';
        const pageOpAssigeeComponent = 'test';
        const pageOpAssigneeValue = { id: 'test' };
        const metaDataType = 'METADATA.REQUIRED';
        const criteria = 'EQUAL';
        const invokeType = 'SYNC';

        const result = PageConditions.applyScalarCondition(
            leftValue,
            rightValue,
            mockComponentProps,
            invokeType,
            metaDataType,
            criteria,
            pageOpAssigeeComponent,
            pageOpAssigneeValue,
        );

        expect(result).toEqual(mockComponentProps);
    });
    test('When applying scalar condition, toggle is set to true when two values are not equal', () => {

        const mockComponentProps = {
            isVisible: true,
            isEnabled: true,
            isRequired: true,
            pageComponentId: 'test',
            contentValue: null,
            objectData: null,
            contentType: 'boolean',
            isValid: true,
        };

        const leftValue = 'test1';
        const rightValue = 'test2';
        const pageOpAssigeeComponent = 'test';
        const pageOpAssigneeValue = { id: 'test' };
        const metaDataType = 'METADATA.REQUIRED';
        const criteria = 'NOT_EQUAL';
        const invokeType = 'SYNC';

        const result = PageConditions.applyScalarCondition(
            leftValue,
            rightValue,
            mockComponentProps,
            invokeType,
            metaDataType,
            criteria,
            pageOpAssigeeComponent,
            pageOpAssigneeValue,
        );

        expect(result).toEqual(mockComponentProps);
    });
    test('When applying scalar condition, toggle is set to false when critera is is set to is empty', () => {

        const mockComponentProps = {
            isVisible: true,
            isEnabled: true,
            isRequired: true,
            pageComponentId: 'test',
            contentValue: null,
            objectData: null,
            contentType: 'boolean',
            isValid: true,
        };

        const leftValue = 'test';
        const rightValue = 'True';
        const pageOpAssigeeComponent = 'test';
        const pageOpAssigneeValue = { id: 'test' };
        const metaDataType = 'METADATA.REQUIRED';
        const criteria = 'IS_EMPTY';
        const invokeType = 'SYNC';

        const result: any = PageConditions.applyScalarCondition(
            leftValue,
            rightValue,
            mockComponentProps,
            invokeType,
            metaDataType,
            criteria,
            pageOpAssigeeComponent,
            pageOpAssigneeValue,
        );

        expect(result.isRequired).toBeFalsy();
    });
    test('When applying scalar condition, toggle is set to false when criteris is set to is not empty', () => {
        const mockComponentProps = {
            isVisible: true,
            isEnabled: true,
            isRequired: true,
            pageComponentId: 'test',
            contentValue: null,
            objectData: null,
            contentType: 'boolean',
            isValid: true,
        };

        const newProps = {
            isVisible: mockComponentProps.isVisible,
            isRequired: mockComponentProps.isRequired,
            isEnabled: mockComponentProps.isEnabled,
        };

        const leftValue = null;
        const rightValue = 'False';
        const pageOpAssigeeComponent = 'test';
        const pageOpAssigneeValue = { id: 'test' };
        const metaDataType = 'METADATA.REQUIRED';
        const criteria = 'IS_EMPTY';
        const invokeType = 'SYNC';

        const result: any = PageConditions.applyScalarCondition(
            leftValue,
            rightValue,
            mockComponentProps,
            invokeType,
            metaDataType,
            criteria,
            pageOpAssigeeComponent,
            pageOpAssigneeValue,
        );

        expect(result.isRequired).toBeFalsy();
    });
    test('When applying boolean condition, component props are returned', () => {
        const mockComponentProps = {
            isVisible: true,
            isEnabled: true,
            isRequired: true,
            pageComponentId: 'test',
            contentValue: null,
            objectData: null,
            contentType: 'boolean',
            isValid: true,
        };

        const snaptshot = {
            getSystemValue: jest.fn(() => false),
        };

        const condition = {
            pageRules: [
                {
                    right: {
                        valueElementToReferenceId: {
                            id: 'test',
                        },
                    },
                },
            ],
        };

        const pageOpAssigeeComponent = 'test';
        const pageOpAssigneeValue = { id: 'test' };
        const metaDataType = 'METADATA.REQUIRED';
        const invokeType = 'SYNC';

        const result = PageConditions.applyBooleanCondition(
            condition,
            true,
            snaptshot,
            mockComponentProps,
            invokeType,
            metaDataType,
            pageOpAssigeeComponent,
            pageOpAssigneeValue,
        );

        expect(result).toEqual(mockComponentProps);
    });
});
