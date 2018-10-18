import * as React from 'react';
import { shallow } from 'enzyme';
import { Offline } from '../../js/components/Offline';

const globalAny: any = global;

describe('Offline component behaviour', () => {

    let componentWrapper;

    const props = {
        flowKey: 'test',
        isOffline: false,
        cachingProgress: 0,
        toggleIsOffline: jest.fn(),
        toggleIsReplaying: jest.fn(),
    };

    beforeEach(() => {
        componentWrapper = shallow(<Offline {...props} />);
    });

    test('Offline component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

    test('When object data has finished caching a success alert is displayed', () => {

        const expectedMessageConfig = {
            message: 'Caching is complete. You are ready to go offline',
            position: 'center',
            type: 'success',
            timeout: 2000,
            dismissible: true,
        };

        componentWrapper.setProps({ cachingProgress: 100 });
        expect(globalAny.manywho.model.addNotification).toHaveBeenCalledWith(
            props.flowKey, expectedMessageConfig,
        );
    });
});
