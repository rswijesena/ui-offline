import { FlowInit, cacheObjectData, patchObjectDataCache } from '../../js/models/Flow';

describe('Flow model expected behaviour', () => {
    test('Object data gets concatenated', () => {
        const tenantId = 'test';
        const state = {};
        const objectData = {};
        const flow = FlowInit({ tenantId, state, objectData });

        const data = [{}];
        const typeElementId = '123';
        let cache = null;
        let n = 0;

        while (n < 10) {
            n += 1;
            cache = cacheObjectData(data, typeElementId);
        }
        expect(cache[typeElementId].length).toEqual(10);
    });

    test('Object data returned should get updated if object with matching internalId exists', () => {
        const typeElementId = 'test';

        const mockObjectOne = {
            externalId: 'externalId1',
            internalId: 'internalId1',
            properties: [
                {
                    developerName: 'test',
                    contentValue: 'test',
                },
            ],
        };

        const mockObjectTwo = {
            externalId: 'externalId2',
            internalId: 'internalId2',
        };

        const tenantId = 'test';
        const state = {};
        const objectData = {
            test: [
                mockObjectOne,
                mockObjectTwo,
            ],
        };

        FlowInit({ tenantId, state, objectData });

        const updatedObject =  [{
            externalId: 'externalId1',
            internalId: 'internalId1',
            properties: [
                {
                    developerName: 'testUpdated',
                    contentValue: 'testUpdated',
                },
            ],
        }];

        const update = patchObjectDataCache(updatedObject, typeElementId);
        expect(update[typeElementId][0].properties[0].contentValue).toEqual('testUpdated');
    });

    test('Unmodified objectdata should be returned if object with no matching internal id exists', () => {
        const typeElementId = 'test';

        const mockObjectOne = {
            externalId: 'externalId1',
            internalId: 'internalId1',
            properties: [
                {
                    developerName: 'test',
                    contentValue: 'test',
                },
            ],
        };

        const mockObjectTwo = {
            externalId: 'externalId2',
            internalId: 'internalId2',
        };

        const tenantId = 'test';
        const state = {};
        const objectData = {
            test: [
                mockObjectOne,
                mockObjectTwo,
            ],
        };

        FlowInit({ tenantId, state, objectData });

        const updatedObject =  [{
            externalId: 'externalId3',
            internalId: 'internalId3',
            properties: [
                {
                    developerName: 'testUpdated',
                    contentValue: 'testUpdated',
                },
            ],
        }];

        const update = patchObjectDataCache(updatedObject, typeElementId);
        expect(update).toEqual(objectData);
    });
});
