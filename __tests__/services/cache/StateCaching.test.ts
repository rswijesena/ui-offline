import { pollForStateValues } from '../../../js/services/cache/StateCaching';
import { setStateValue } from '../../../js/models/State';
import OfflineCore from '../../../js/services/OfflineCore';

const globalAny:any = global;
const castSetStateValue: any = setStateValue;

jest.mock('../../../js/models/State', () => ({
    setStateValue: jest.fn(),
}));

const responseJsonMock = jest.fn(() => {
    return new Promise((resolve) => {
        const mockResponse = ['test', 'test'];
        resolve(mockResponse);
    });
});

globalAny.fetch = jest.fn(() => {
    return new Promise((resolve) => {
        const mockResponse = { json: responseJsonMock };
        resolve(mockResponse);
    });
});

describe('State caching service behaviour', () => {

    beforeEach(() => {
        castSetStateValue.mockClear();
    });

    test('Fetch call is made only when network is available', () => {
        OfflineCore.isOffline = true;

        pollForStateValues('test', 'test', 'test');
        expect(globalAny.fetch).not.toHaveBeenCalled();
    });

    test('Polling happens recursively based on polling interval', () => {
        jest.useFakeTimers();
        OfflineCore.isOffline = false;
        pollForStateValues('test', 'test', 'test')
            .then(() => {

                jest.runOnlyPendingTimers();

                expect(setTimeout).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
            });
    });

    test('Every value returned gets injected into offline state', () => {
        OfflineCore.isOffline = false;
        pollForStateValues('test', 'test', 'test')
            .then(() => {
                expect(setStateValue).toHaveBeenCalledTimes(2);
            });
    });

});
