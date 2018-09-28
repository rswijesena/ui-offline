import * as React from 'react';
import { mount } from 'enzyme';
import store from '../../js/stores/store';
import App from '../../js/components/App';
import { getOfflineData } from '../../js/services/Storage';

jest.mock('../../js/services/Storage', () => ({
    getOfflineData: jest.fn(),
}));

const mockgetOfflineData:any = getOfflineData;

const proto = App.prototype;
const initSpy = jest.spyOn(proto, 'initialize');
const storeSpy = jest.spyOn(store, 'dispatch');

describe('Base app component behaviour when no data is cached', () => {
    let wrapper = null;
    const props = {
        flowKey: '',
    };

    beforeEach(() => {
        mockgetOfflineData.mockImplementation(() => {
            return new Promise((resolve, reject) => {
                resolve(undefined);
            });
        });
        wrapper = mount(<App {...props} />);
    });

    test('Initialization is called when indexdb is empty and there is a token in state', () => {
        expect(initSpy).toHaveBeenCalled();
    });
});

describe('Base app component behaviour when data is cached', () => {
    let wrapper = null;
    const props = {
        flowKey: '',
    };

    beforeEach(() => {
        mockgetOfflineData.mockImplementation(() => {
            return new Promise((resolve, reject) => {
                resolve({});
            });
        });
        wrapper = mount(<App {...props} />);
    });

    test('Action is dispatched to store indicating there is cache in indexdb', () => {
        expect(storeSpy).toHaveBeenCalled();
    });
});
