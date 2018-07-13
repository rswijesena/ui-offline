import * as React from 'react';
import { shallow } from 'enzyme';
import GoOffline from '../js/components/GoOffline';

describe('GoOffline component behaviour', () => {

    let componentWrapper;

    const props = {
        flowKey: '',
        onOffline: jest.fn(),
    };

    beforeEach(() => {
        componentWrapper = shallow(<GoOffline {...props} />);
    });

    test('GoOffline component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

});
