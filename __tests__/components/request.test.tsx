import * as React from 'react';
import { shallow } from 'enzyme';
import Request from '../../js/components/Request';

describe('Request component behaviour', () => {

    let componentWrapper;

    const props = {
        flowKey: '',
        request: {},
        tenantId: '',
        authenticationToken: '',
        onReplayDone: jest.fn(),
        onDelete: jest.fn(),
        replayNow: true,
        isDisabled: true,
    };

    beforeEach(() => {
        componentWrapper = shallow(<Request {...props} />);
    });

    test('Request component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

});
