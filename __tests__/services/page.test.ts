jest.mock('../../js/models/State', () => ({
    getStateValue: jest.fn(() => {
        return { contentValue: 'True' };
    }),
}));

import { generatePage } from '../../js/services/Page';
import PageConditions from '../../js/services/PageConditions';

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
        const spy = jest.spyOn(PageConditions, 'checkForCondition');
        generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(spy).toHaveBeenCalled();
    });

    test('Check is made to determine if a component triggers a page condition', () => {
        const spy = jest.spyOn(PageConditions, 'checkForEvents');
        const page = generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(spy).toHaveBeenCalled();
        expect(page.pageResponse.pageComponentDataResponses[0].hasEvents).toBeTruthy();
    });

    test('If a page component triggers a page condition then its hasEvents prop must be true', () => {
        const page = generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(page.pageResponse.pageComponentDataResponses[0].hasEvents).toBeTruthy();
    });

    test('If a page has a boolean page condition that component has correct metadata properties', () => {
        const page = generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(page.pageResponse.pageComponentDataResponses[0].isVisible).toBeFalsy();
    });

});
