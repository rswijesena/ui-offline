import PageConditions from '../../js/services/PageConditions';

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

describe('Page conditions expected behaviour', () => {
    test('Checking for a condition will return an operation if found', () => {
        const componentId = 'test';
        const operations = [
            {
                assignment: {
                    assignee: {
                        pageObjectReferenceId: componentId,
                    },
                },
            },
        ];
        const hasCondition = PageConditions.checkForCondition(operations, componentId);
        expect(hasCondition).toEqual(operations[0]);
    });
    test('Checking for a condition will return undefined if not found', () => {
        const componentId = 'test';
        const pageObjectReferenceId = 'abc123';
        const operations = [
            {
                assignment: {
                    assignee: {
                        pageObjectReferenceId,
                    },
                },
            },
        ];
        const hasCondition = PageConditions.checkForCondition(operations, componentId);
        expect(hasCondition).toBeUndefined();
    });
    test('Checking for events will return a page rule if found', () => {
        const componentId = 'test';
        const rules = [
            {
                left: {
                    pageObjectReferenceId: componentId,
                },
            },
        ];
        const hasEvent = PageConditions.checkForEvents(rules, componentId);
        expect(hasEvent).toEqual(rules[0]);
    });
    test('Checking for events will return undefined if not found', () => {
        const componentId = 'test';
        const pageObjectReferenceId = 'abc123';
        const rules = [
            {
                left: {
                    pageObjectReferenceId,
                },
            },
        ];
        const hasEvent = PageConditions.checkForEvents(rules, componentId);
        expect(hasEvent).toBeUndefined();
    });
    test('Applying a page condition will return component props', () => {
        const pageCondition = {
            pageRules: [
                {
                    left: {
                        pageObjectReferenceId: 'test',
                    },
                    right: {
                        valueElementToReferenceId: {
                            id: 'test',
                        },
                    },
                },
            ],
            pageOperations: [
                {
                    assignment: {
                        assignee: {
                            pageObjectReferenceId: 'test',
                            metadataType: 'METADATA.VISIBLE',
                        },
                    },
                },
            ],
        };

        const snapshot = {
            getSystemValue: jest.fn(() => {
                return { defaultContentValue: 'True' };
            }),
        };

        const component = PageConditions.applyBooleanCondition(pageCondition, true, snapshot, mockComponentProps);
        expect(component).toEqual(mockComponentProps);
    });
    test('When visible metadata type the isVisible prop is modified', () => {
        const pageCondition = {
            pageRules: [
                {
                    left: {
                        pageObjectReferenceId: 'test',
                    },
                    right: {
                        valueElementToReferenceId: {
                            id: 'test',
                        },
                    },
                },
            ],
            pageOperations: [
                {
                    assignment: {
                        assignee: {
                            pageObjectReferenceId: 'test',
                            metadataType: 'METADATA.VISIBLE',
                        },
                    },
                },
            ],
        };

        const snapshot = {
            getSystemValue: jest.fn(() => {
                return { defaultContentValue: 'False' };
            }),
        };

        const component = PageConditions.applyBooleanCondition(pageCondition, true, snapshot, mockComponentProps);
        expect(component.isVisible).toBeFalsy();
    });
    test('When required metadata type the isRequired prop is modified', () => {
        const pageCondition = {
            pageRules: [
                {
                    left: {
                        pageObjectReferenceId: 'test',
                    },
                    right: {
                        valueElementToReferenceId: {
                            id: 'test',
                        },
                    },
                },
            ],
            pageOperations: [
                {
                    assignment: {
                        assignee: {
                            pageObjectReferenceId: 'test',
                            metadataType: 'METADATA.REQUIRED',
                        },
                    },
                },
            ],
        };

        const snapshot = {
            getSystemValue: jest.fn(() => {
                return { defaultContentValue: 'False' };
            }),
        };

        const component = PageConditions.applyBooleanCondition(pageCondition, true, snapshot, mockComponentProps);
        expect(component.isRequired).toBeFalsy();
    });
    test('When enabled metadata type the isEnabled prop is modified', () => {
        const pageCondition = {
            pageRules: [
                {
                    left: {
                        pageObjectReferenceId: 'test',
                    },
                    right: {
                        valueElementToReferenceId: {
                            id: 'test',
                        },
                    },
                },
            ],
            pageOperations: [
                {
                    assignment: {
                        assignee: {
                            pageObjectReferenceId: 'test',
                            metadataType: 'METADATA.ENABLED',
                        },
                    },
                },
            ],
        };

        const snapshot = {
            getSystemValue: jest.fn(() => {
                return { defaultContentValue: 'False' };
            }),
        };

        const component = PageConditions.applyBooleanCondition(pageCondition, true, snapshot, mockComponentProps);
        expect(component.isEnabled).toBeFalsy();
    });
});