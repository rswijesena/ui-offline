import * as React from 'react';
import { mount } from 'enzyme';
import App from '../../js/components/App';
import OfflineCore from '../../js/services/OfflineCore';
import ObjectDataCaching from '../../js/services/cache/ObjectDataCaching';

const windowAny:any = window;

jest.mock('../../js/services/Storage', () => ({
    getOfflineData: jest.fn(() => {
        return new Promise((resolve, reject) => {
            resolve(undefined);
        });
    }),
}));

jest.mock('../../js/services/cache/ObjectDataCaching');

const ObjectDataCachingMock:any = ObjectDataCaching;

describe('Base app component behaviour when no data is cached', () => {
    let wrapper = null;
    const props = {
        flowKey: '',
    };

    beforeEach(() => {
        windowAny.manywho.state.getState.mockImplementation(() => {
            return { token: null };
        });
        wrapper = mount(<App {...props} />);
    });

    test('Initialization will set flow data in offline state and automatically cache object data', () => {
        const wrapperInstance = wrapper.instance();
        const spyInit = jest.spyOn(OfflineCore, 'initialize');
        const spyCache = jest.spyOn(wrapperInstance, 'cacheObjectData');
        wrapperInstance.initialize();
        expect(spyInit).toHaveBeenCalled();
        expect(spyCache).toHaveBeenCalled();
    });

    test('Caching object causes loading spinner to display', () => {
        const wrapperInstance = wrapper.instance();
        wrapperInstance.flow = {};
        ObjectDataCachingMock.mockReturnValue(true);
        wrapperInstance.cacheObjectData();
        wrapper.update();
        expect(wrapper.find('.caching-spinner').exists()).toEqual(true);
    });

    test('If no data to cache then loading spinner is not displayed', () => {
        const wrapperInstance = wrapper.instance();
        wrapperInstance.flow = {};
        ObjectDataCachingMock.mockReturnValue(false);
        wrapperInstance.cacheObjectData();
        wrapper.update();
        expect(wrapper.find('.caching-spinner').exists()).toEqual(false);
    });
});
