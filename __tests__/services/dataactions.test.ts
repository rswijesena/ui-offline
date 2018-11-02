import DataActions from '../../js/services/DataActions';
import { setStateValue } from '../../js/models/State';
import { cacheObjectData, patchObjectDataCache } from '../../js/models/Flow';

const mockCacheObjectData: any = cacheObjectData;

const mockTypeElementId = 'testTypeElementId';
const mockValueElementToApplyId = 'testValueId';

const mockObjectOne = {
    externalId: 'externalId1',
    internalId: 'internalId1',
};

const mockObjectTwo = {
    externalId: 'externalId2',
    internalId: 'internalId2',
};

jest.mock('../../js/models/Flow', () => ({
    getObjectData: jest.fn(() => {
        return [
            mockObjectOne,
            mockObjectTwo,
        ];
    }),
    patchObjectDataCache: jest.fn(),
    cacheObjectData: jest.fn(),
}));

const mockAction = {
    crudOperationType: 'SAVE',
    valueElementToApplyId: mockValueElementToApplyId,
    objectDataRequest: {
        typeElementId: mockTypeElementId,
    },
};

const mockFlow = {
    state: 'test',
    tenantId: 'test',
};

const mockSnapshot = {
    getValue: jest.fn(() => {
        return {
            typeElementId: mockTypeElementId,
        };
    }),
    metadata: {
        typeElements: [
            { id: mockTypeElementId, properties: [] },
        ],
    },
};

describe('Data action behaviour', () => {

    beforeEach(() => {
        mockCacheObjectData.mockClear();
    });

    test('Offline state should always be returned', () => {
        const mockObjectData = {
            objectData: [
                {
                    externalId: 'externalId3',
                    internalId: 'internalId3',
                },
            ],
        };

        setStateValue(mockValueElementToApplyId, mockTypeElementId, mockSnapshot, mockObjectData);

        const mockDefaultAction = {
            crudOperationType: '',
            valueElementToApplyId: mockValueElementToApplyId,
            objectDataRequest: {
                typeElementId: mockTypeElementId,
            },
        };
        const executeDefaultDataAction = DataActions.execute(mockDefaultAction, mockFlow, mockSnapshot);
        expect(executeDefaultDataAction).toEqual(mockFlow.state);

        const mockSaveAction = {
            crudOperationType: 'SAVE',
            valueElementToApplyId: mockValueElementToApplyId,
            objectDataRequest: {
                typeElementId: mockTypeElementId,
            },
        };
        const executeSaveDataAction = DataActions.execute(mockSaveAction, mockFlow, mockSnapshot);
        expect(executeSaveDataAction).toEqual(mockFlow.state);

        const mockDeleteAction = {
            crudOperationType: 'DELETE',
            valueElementToApplyId: mockValueElementToApplyId,
            objectDataRequest: {
                typeElementId: mockTypeElementId,
            },
        };
        const executeDeleteDataAction = DataActions.execute(mockDeleteAction, mockFlow, mockSnapshot);
        expect(executeDeleteDataAction).toEqual(mockFlow.state);
    });

    test('When objectdata is existing then the objectdata memory cache should be updated', () => {
        const mockObjectData = {
            objectData: [
                mockObjectOne,
                mockObjectTwo,
            ],
        };

        setStateValue(mockValueElementToApplyId, mockTypeElementId, mockSnapshot, mockObjectData);
        DataActions.execute(mockAction, mockFlow, mockSnapshot);

        // Calling this function indicates that an update is being performed
        expect(patchObjectDataCache).toHaveBeenCalledTimes(2);
    });

    test('When objectdata is not existing then new object is concatenated to objectdata cache', () => {
        const mockObjectData = {
            objectData: [
                {
                    externalId: 'externalId3',
                    internalId: 'internalId3',
                },
            ],
        };

        setStateValue(mockValueElementToApplyId, mockTypeElementId, mockSnapshot, mockObjectData);
        DataActions.execute(mockAction, mockFlow, mockSnapshot);

        // Calling this function indicates that a new object is being cached
        expect(mockCacheObjectData).toHaveBeenCalledTimes(1);
    });
});
