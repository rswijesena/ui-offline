import * as React from 'react';
import { shallow } from 'enzyme';
import GoOnline from '../../js/components/GoOnline';

jest.mock('../../js/services/Storage', () => ({
    getOfflineData: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../js/models/Flow', () => ({
    FlowInit: jest.fn(() => {
        return { requests: [] };
    }),
}));

describe('GoOnline component behaviour', () => {

    let componentWrapper;

    const props = {
        flowKey: '',
        onOnline: jest.fn(),
        onClose: jest.fn(),
    };

    beforeEach(() => {
        componentWrapper = shallow(<GoOnline {...props} />);
    });

    test('GoOnline component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

});
