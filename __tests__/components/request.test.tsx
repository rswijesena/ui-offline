import * as React from 'react';
import { shallow } from 'enzyme';
import Request from '../../js/components/Request';
import OfflineCore from '../../js/services/OfflineCore';

OfflineCore.rejoin = jest.fn();

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
        cancelReplay: jest.fn(),
    };

    beforeEach(() => {
        componentWrapper = shallow(<Request {...props} />);
    });

    test('Request component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

    test('Replay is cancelled and flow is rejoined if replay request is unauthorised', () => {
        const wrapperInstance = componentWrapper.instance();
        wrapperInstance.onReplayResponse({ invokeType: 'NOT_ALLOWED' });
        expect(props.cancelReplay).toHaveBeenCalled();
        expect(OfflineCore.rejoin).toHaveBeenCalled();
    });

});
