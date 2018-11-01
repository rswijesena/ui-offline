import DataActions from '../../js/services/DataActions';
import { setStateValue } from '../../js/models/State';

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
}));

const mockAction = {
    crudOperationType: 'SAVE',
    valueElementToApplyId: mockValueElementToApplyId,
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
            { id: mockTypeElementId },
        ],
    },
};

describe('Data action behaviour', () => {
    test('When objectdata is existing then the objectdata memory cache should be updated', () => {
        const mockObjectData = {
            objectData: [],
        };
        setStateValue(mockValueElementToApplyId, mockTypeElementId, mockSnapshot, mockObjectData);
        DataActions.execute(mockAction, mockFlow, mockSnapshot);
    });
    test('When objectdata is not existing then new object is concatenated to objectdata cache', () => {
    });
});
