import { generatePage } from '../../js/services/Page';

const mockRequest = {
    annotations: null,
    currentMapElementDeveloperName: '',
    currentMapElementId: '',
    geoLocation: null,
    invokeType: '',
    key: 0,
    mapElementInvokeRequest: {
        pageRequest: {
            pageComponentInputResponses: [
                {
                    contentValue: null,
                    objectData: null,
                    pageComponentId: '',
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
    metadata: {},
};

const mockState = {
    currentMapElementId: undefined,
    id: '',
    token: '',
    values: {},
};

const mockMapElement = {
    id: '',
    developerName: '',
    outcomes: [],
};

const mockeTenantId = '';

describe('Page service expected behaviour', () => {

    test('Page conditions are only checked if metadata contains page conditions', () => {
    });

});
