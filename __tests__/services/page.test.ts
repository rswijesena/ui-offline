import { generatePage } from '../../js/services/Page';
import PageConditions from '../../js/services/PageConditions';

PageConditions.checkForCondition = jest.fn(() => {
    return { pageRules: ['test'] };
});

PageConditions.checkForEvents = jest.fn(() => {
    return [];
});

PageConditions.extractPageConditionValues = jest.fn();
PageConditions.applyScalarCondition = jest.fn();
PageConditions.applyBooleanCondition = jest.fn();

// This is here as @types/jest does not type cast mockReturnValue
const castPageConditions: any = PageConditions;

const globalAny:any = global;

const mockRequest = {
    annotations: null,
    currentMapElementDeveloperName: '',
    currentMapElementId: '',
    geoLocation: null,
    invokeType: 'SYNC',
    key: 0,
    mapElementInvokeRequest: {
        pageRequest: {
            pageComponentInputResponses: [
                {
                    contentValue: true,
                    objectData: null,
                    pageComponentId: 'test',
                },
            ],
        },
        selectedOutcomeId: '',
    },
    mode: '',
    navigationElementId: null,
    selectedMapElementId: null,
    selectedNavigationElementId: null,
    stateId: '',
    stateToken: '',
};

const mockSnapshot = {
    metadata: {
        pageElements: [
            {
                id: 'test',
                pageContainers: [],
                pageComponents: [
                    { id: 'test' },
                ],
                pageConditions: [
                    {
                        pageRules: [
                            {
                                left: {
                                    pageObjectReferenceId: 'test',
                                    valueElementToReferenceId: {
                                        id: 'test',
                                    },
                                },
                                right: {
                                    valueElementToReferenceId: 'test',
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
                    },
                ],
            },
        ],
        id: {
            id: '',
            versionId: '',
        },
    },
    getSystemValue: jest.fn(() => {
        return { defaultContentValue: 'False' };
    }),
};

const mockState = {
    currentMapElementId: '',
    id: '',
    token: '',
    values: [],
    getValue: jest.fn(),
    setValue: jest.fn(),
};

const mockMapElement = {
    id: '',
    developerName: '',
    outcomes: [],
    pageElementId: 'test',
};

const mockTenantId = '';

describe('Page service expected behaviour', () => {

    test('Check is made to determine if a component is listening for a page condition', () => {
        generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(PageConditions.checkForCondition).toHaveBeenCalled();
    });

    test('Check is made to determine if a component triggers a page condition', () => {
        generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(PageConditions.checkForEvents).toHaveBeenCalled();
    });

    test('If a page component triggers a page condition then its hasEvents prop must be true', () => {
        const page = generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        const pageComponentDataResponses = page.pageResponse.pageComponentDataResponses.filter(
            response => response.hasEvents === true,
        );
        expect(pageComponentDataResponses.length).toEqual(1);
    });

    test('If a trigger components value is that of a boolean then call boolean page condition function', () => {
        const resp = { leftValueElementContentValue: true };
        castPageConditions.extractPageConditionValues.mockReturnValue(resp);
        generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(PageConditions.applyBooleanCondition).toHaveBeenCalled();
    });

    test('If a comparable value (page rule right) is that of a string then call scalar page condition function', () => {
        const resp = { rightValueElementContentValue: 'test' };
        castPageConditions.extractPageConditionValues.mockReturnValue(resp);
        generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(PageConditions.applyScalarCondition).toHaveBeenCalled();
    });

    test('If a comparable value (page rule right) is that of a number then call scalar page condition function', () => {
        const resp = { rightValueElementContentValue: 10 };
        castPageConditions.extractPageConditionValues.mockReturnValue(resp);
        generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(PageConditions.applyScalarCondition).toHaveBeenCalled();
    });

    test('More complex page conditions throw an error', () => {
        const resp = { rightValueElementContentValue: [], leftValueElementContentValue: [] };
        castPageConditions.extractPageConditionValues.mockReturnValue(resp);
        generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId),
        expect(globalAny.window.manywho.model.addNotification).toHaveBeenCalled();
    });

});
