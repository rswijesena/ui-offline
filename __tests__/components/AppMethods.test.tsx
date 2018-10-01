import * as React from 'react';
import { mount } from 'enzyme';
import App from '../../js/components/App';
import OfflineCore from '../../js/services/OfflineCore';

describe('Base app component behaviour when no data is cached', () => {
    let wrapper = null;
    const props = {
        flowKey: '',
    };

    beforeEach(() => {
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

    test('Initialization will set flow data in offline state and automatically cache object data', () => {
        const wrapperInstance = wrapper.instance();
        const spyInit = jest.spyOn(OfflineCore, 'initialize');
        const spyCache = jest.spyOn(wrapperInstance, 'cacheObjectData');
        wrapperInstance.initialize();
        expect(spyInit).toHaveBeenCalled();
        expect(spyCache).toHaveBeenCalled();
    });
});
