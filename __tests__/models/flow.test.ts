import { FlowInit, cacheObjectData } from '../../js/models/Flow';

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
});
