import * as React from 'react';
import { shallow } from 'enzyme';
import GoOnline from '../../js/components/GoOnline';

describe('GoOnline component behaviour', () => {

    // let componentWrapper;

    const props = {
        flowKey: '',
        onOnline: jest.fn(),
        onClose: jest.fn(),
    };

    beforeEach(() => {
        // componentWrapper = shallow(<GoOnline {...props} />);
    });

    test('GoOnline component renders without crashing', () => {
        // expect(componentWrapper.length).toEqual(1);
    });

});
