import * as React from 'react';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';
import store from '../../js/stores/store';
import Offline from '../../js/components/Offline';

describe('Offline component behaviour', () => {

    let componentWrapper;

    const props = {
        flowKey: '',
    };

    beforeEach(() => {
        componentWrapper = shallow(<Provider store={store}><Offline {...props} /></Provider>);
    });

    test('Offline component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });
});
