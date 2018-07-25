jest.mock('../../js/models/State', () => ({
    getStateValue: jest.fn(() => {
        return { contentValue: 'True' };
    }),
}));

import { generatePage } from '../../js/services/Page';
import PageConditions from '../../js/services/PageConditions';

const testMeta = require('../../test-metadata.json');

const mockRequest = {
    invokeType: 'SYNC',
    stateId: 'c70108a6-dc99-45a6-9cdf-8ead39b778c0',
    stateToken: 'd34d6d92-ab25-4183-8b91-3cea2b9ee640',
    currentMapElementId: '4df4170d-65ba-4796-a6de-792eadbd3345',
    annotations: null,
    geoLocation: null,
    mapElementInvokeRequest: {
        pageRequest: {
            pageComponentInputResponses: [
                {
                    pageComponentId: 'e11d0042-bfed-905d-ff56-520ba3f946f8', contentValue: false,
                },
                {
                    pageComponentId: '4fb0439e-35b7-8769-c99a-bc865f007016', contentValue: 'stringy', objectData: null,
                },
                {
                    pageComponentId: '7836c976-1bd6-6175-2023-8def57c6aeac', contentValue: 'False', objectData: null,
                },
                {
                    pageComponentId: '9f4f4b13-f725-8fe9-e9f5-349675028691', contentValue: null, objectData: null,
                },
                {
                    pageComponentId: '16664127-2f21-f988-8fe6-8fd291e93735', contentValue: 'False', objectData: null,
                },
                {
                    pageComponentId: '083d9780-3530-bf9b-05fd-0784da1fbbce', contentValue: '', objectData: null,
                },
                {
                    pageComponentId: 'aee098c9-5123-647e-08f1-d9833a01ade2', contentValue: false,
                },
                {
                    pageComponentId: '1351466e-39fe-201c-d955-5bc31f08ce03', contentValue: '',
                },
            ],
        }
        ,
        selectedOutcomeId: null,
    },
    mode:'',
    selectedMapElementId:null,
    navigationElementId:null,
    selectedNavigationElementId:null,
    key:1,
    currentMapElementDeveloperName:'Bool page condition',
};

const mockMapElement = {
    clearNavigationOverrides:false,
    dataActions:null,
    dateCreated:'2018-07-18T15:06:33.2700831+00:00',
    dateModified:'2018-07-18T15:06:33.2700846+00:00',
    developerName:'Bool page condition',
    developerSummary:'',
    elementType:'input',
    groupElementId:null,
    id:'4df4170d-65ba-4796-a6de-792eadbd3345',
    listeners:null,
    messageActions:null,
    navigationOverrides:null,
    notAuthorizedMessage:'',
    operations:null,
    outcomes:[
        {
            attributes: null,
            comparison: null,
            controlPoints: null,
            developerName: 'dfgd',
            developerSummary: null,
            flowOut: null,
            id: 'a96a5a84-9e6f-4de3-ba47-c17184131177',
            isBulkAction: false,
            label: 'fdgdf',
            nextMapElementDeveloperName: null,
            nextMapElementId: 'c4f4d74e-1b96-403c-9d28-6d6a4a33af9a',
            order: 0,
            pageActionBindingType: 'SAVE',
            pageActionType: '',
            pageObjectBindingId: null,
        },
    ],
    pageElementId:'486987d3-a278-1de9-3967-b63a2388d3e9',
    postUpdateMessage:'',
    postUpdateToStream:false,
    postUpdateWhenType:'',
    statusMessage:'',
    updateByName:false,
    userContent:'',
    viewMessageAction:null,
    vote:null,
    x:200,
    y:250,
};

const mockState = {
    currentMapElementId:'4df4170d-65ba-4796-a6de-792eadbd3345',
    id:'c70108a6-dc99-45a6-9cdf-8ead39b778c0',
    token:'d34d6d92-ab25-4183-8b91-3cea2b9ee640',
    values: {
        '7b1fcc9d-f7c2-4449-a837-e438f5d99099': {
            pageComponentId: 'e11d0042-bfed-905d-ff56-520ba3f946f8', contentValue: false,
        }
        ,
        'a50c1b22-096e-4c8f-b8bc-6929e719c1a8': {
            pageComponentId: '4fb0439e-35b7-8769-c99a-bc865f007016', contentValue: 'stringy', objectData: null,
        }
        ,
        '1237524a-4d02-4143-b5e2-b7f697445568': {
            pageComponentId: '7836c976-1bd6-6175-2023-8def57c6aeac', contentValue: 'False', objectData: null,
        }
        ,
        '911370df-75b5-4b69-80ee-baebc00ff00e': {
            pageComponentId: '9f4f4b13-f725-8fe9-e9f5-349675028691', contentValue: null, objectData: null,
        }
        ,
        '702fd35a-f20b-4dec-bec3-f3e83b44742b': {
            pageComponentId: '16664127-2f21-f988-8fe6-8fd291e93735', contentValue: 'False', objectData: null,
        }
        ,
        '5779601d-1dea-45fd-9091-83a6885ee26c': {
            pageComponentId: '083d9780-3530-bf9b-05fd-0784da1fbbce', contentValue: '', objectData: null,
        }
        ,
        '2282a53f-de2f-436a-91ac-9de342433869': {
            pageComponentId: 'aee098c9-5123-647e-08f1-d9833a01ade2', contentValue: false,
        }
        ,
        'e46f7531-c66f-477b-91d5-4f30233dabdc': {
            pageComponentId: '1351466e-39fe-201c-d955-5bc31f08ce03', contentValue: '',
        },
    },
};

const mockSnapshot = {
    getSystemValue: jest.fn(() => {
        return { defaultContentValue: 'False' };
    }),
    getValue: jest.fn(() => {
        return { defaultContentValue: 'False' };
    }),
    getContentTypeForValue: jest.fn(),
    getNavigationElementReferences: jest.fn(),
    metadata: testMeta,
};

const mockTenantId = '';

describe('Page service expected behaviour', () => {

    test('Check is made to determine if a component is listening for a page condition', () => {
        const spy = jest.spyOn(PageConditions, 'checkForCondition');
        generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(spy).toHaveBeenCalledTimes(8);
    });

    test('Check is made to determine if a component triggers a page condition', () => {
        const spy = jest.spyOn(PageConditions, 'checkForEvents');
        const page = generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(spy).toHaveBeenCalledTimes(8);
    });

    test('If a page component triggers a page condition then its hasEvents prop must be true', () => {
        const page = generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        const pageComponentDataResponses = page.pageResponse.pageComponentDataResponses.filter(
            response => response.hasEvents === true,
        );
        expect(pageComponentDataResponses.length).toEqual(2);
    });

    test('If a page has a boolean page condition that component has correct metadata properties', () => {
        const page = generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(page.pageResponse.pageComponentDataResponses[8].isVisible).toBeFalsy();
    });

});
