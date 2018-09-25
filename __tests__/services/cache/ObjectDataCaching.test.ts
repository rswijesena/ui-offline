import {
    default as ObjectDataCaching,
    generateObjectData,
    getObjectDataRequest,
    getChunkedObjectDataRequests } from '../../../js/services/cache/ObjectDataCaching';
import { cacheObjectData } from '../../../js/models/Flow';

jest.mock('../../../js/models/Flow', () => ({
    cacheObjectData: jest.fn(),
}));

const mockBindingId = 'test';
const mockTypeElementId = 'test';
const mockTypeName = 'test';
const propertyName1 = 'prop1';
const propertyName2 = 'prop2';

const mockFlow = {
    state: {},
    tenantId: 'test',
};

const window2: any = window;
const globalAny: any = global;
const mockCacheObjectData: any = cacheObjectData;

const mockMetaData = {
    pageElements: [
        {
            pageComponents: [
                {
                    objectDataRequest: {
                        command: null,
                        listFilter: null,
                        typeElementBindingId: mockBindingId,
                        typeElementDeveloperName: null,
                        typeElementId: mockTypeElementId,
                    },
                },
            ],
        },
    ],
    typeElements: [
        {
            id: mockTypeElementId,
            developerName: mockTypeName,
            bindings: [
                {
                    id: mockBindingId,
                },
            ],
            properties: [
                { developerName: propertyName1 },
                { developerName: propertyName2 },
            ],
        },
    ],
};

const requestLimit = globalAny.manywho.settings.global('offline.cache.requests.limit', null, 250);
const requestPageSize = globalAny.manywho.settings.global('offline.cache.requests.pageSize', null, 10);
const requestIterations = Math.ceil(requestLimit / requestPageSize);

describe('Object data response caching behaviour', () => {

    beforeEach(() => {
        mockCacheObjectData.mockClear();
    });

    test('That an object data request is made for every request', (done) => {
        window2.metaData = mockMetaData;

        function callback() {
            expect(globalAny.manywho.ajax.dispatchObjectDataRequest).toHaveBeenCalledTimes(requestIterations);
            done();
        }

        ObjectDataCaching(mockFlow, callback);
    });

    test('That an object data request response is set into flow model state', (done) => {
        window2.metaData = mockMetaData;

        function callback() {
            expect(mockCacheObjectData).toHaveBeenCalledTimes(requestIterations);
            done();
        }

        ObjectDataCaching(mockFlow, callback);
    });

    test('Generating object data requests should return empty if there are no data actions/page component objectdatarequest in snapshot', () => {
        window2.metaData = {
            pageElements: [],
            mapElements: [],
        };

        expect(generateObjectData()).toEqual([]);
    });

    test('Generating object data requests should return an array of object data requests', () => {
        window2.metaData = mockMetaData;
        const objectDataRequests = generateObjectData();
        expect(objectDataRequests.length).toEqual(requestIterations);
    });

    test('A single object data requests list filter limit should be equal to globally defined limit', () => {
        window2.metaData = mockMetaData;
        const mockRequestObject = {
            command: null,
            listFilter: null,
            typeElementBindingId: mockBindingId,
            typeElementDeveloperName: null,
            typeElementId: mockTypeElementId,
        };

        const result = getObjectDataRequest(mockRequestObject);
        expect(result.listFilter.limit).toEqual(requestLimit);
    });

    test('A single object data requests typeElementBindingId should be equal to the associated type elements binding id', () => {
        window2.metaData = mockMetaData;
        const mockRequestObject = {
            command: null,
            listFilter: null,
            typeElementBindingId: mockBindingId,
            typeElementDeveloperName: null,
            typeElementId: mockTypeElementId,
        };

        const result = getObjectDataRequest(mockRequestObject);
        expect(result.typeElementBindingId).toEqual(mockMetaData.typeElements[0].bindings[0].id);
    });

    test('A single object data requests objectDataTypes typeElementId should be equal to the associated type elements typeElementId', () => {
        window2.metaData = mockMetaData;
        const mockRequestObject = {
            command: null,
            listFilter: null,
            typeElementBindingId: mockBindingId,
            typeElementDeveloperName: null,
            typeElementId: mockTypeElementId,
        };

        const result = getObjectDataRequest(mockRequestObject);
        expect(result.objectDataType.typeElementId).toEqual(mockMetaData.typeElements[0].id);
    });

    test('A single object data requests objectDataTypes developerName should be equal to the associated type elements developerName', () => {
        window2.metaData = mockMetaData;
        const mockRequestObject = {
            command: null,
            listFilter: null,
            typeElementBindingId: mockBindingId,
            typeElementDeveloperName: null,
            typeElementId: mockTypeElementId,
        };

        const result = getObjectDataRequest(mockRequestObject);
        expect(result.objectDataType.developerName).toEqual(mockMetaData.typeElements[0].developerName);
    });

    test('A single object data requests objectDataTypes properties should map to the associated type elements properties', () => {
        window2.metaData = mockMetaData;
        const mockRequestObject = {
            command: null,
            listFilter: null,
            typeElementBindingId: mockBindingId,
            typeElementDeveloperName: null,
            typeElementId: mockTypeElementId,
        };

        const result = getObjectDataRequest(mockRequestObject);
        expect(result.objectDataType.properties.length).toEqual(2);
        expect(result.objectDataType.properties[0].developerName).toEqual(propertyName1);
        expect(result.objectDataType.properties[1].developerName).toEqual(propertyName2);
    });

    test('When splitting an object data request into chunks an array of requests should be returned', () => {
        const mockRequest = {
            listFilter: {
                limit: 250,
            },
        };
        const result = getChunkedObjectDataRequests(mockRequest);
        expect(result.length).toEqual(requestIterations);
    });

});
