import * as React from 'react';
import { shallow } from 'enzyme';
import store from '../../js/stores/store';
import Offline from '../../js/components/Offline';
import GoOnline from '../../js/components/GoOnline';
import NoNetwork from '../../js/components/NoNetwork';
import OfflineCore from '../../js/services/OfflineCore';

jest.mock('../../js/services/Connection', () => ({
    hasNetwork: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../js/services/OfflineCore');

const OfflineCoreMock:any = OfflineCore;
OfflineCoreMock.rejoin = jest.fn();

describe('Offline component behaviour', () => {

    let componentWrapper;

    const props = {
        store,
        flowKey: '',
    };

    beforeEach(() => {
        componentWrapper = shallow(<Offline {...props} />).dive();
    });

    test('Offline component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

    test('If is in offline mode then display the sync flows button', () => {
        componentWrapper.setProps({ isOffline: true });
        expect(componentWrapper.find('.btn-success').exists()).toEqual(true);
    });

    test('If view is equal to replay the goOnline component is mounted', () => {
        componentWrapper.setState({ view: 1 });
        expect(componentWrapper.find(GoOnline).length).toEqual(1);
    });

    test('If view is equal to "no network" the noNetwork component is mounted', () => {
        componentWrapper.setState({ view: 2 });
        expect(componentWrapper.find(NoNetwork).length).toEqual(1);
    });

    test('Clicking sync flows button triggers state.view to change', (done) => {
        componentWrapper.setProps({ isOffline: true });
        componentWrapper.find('.btn-success').simulate('click');
        setTimeout(
            () => {
                try {
                    expect(componentWrapper.state().view).toEqual(1);
                    done();
                } catch (e) {
                    done.fail(e);
                }
            },
            100,
        );
    });

    test('When onOnline is called the flow is rejoined', () => {
        const componentInstance = componentWrapper.instance();
        componentInstance.onOnline();
        expect(OfflineCoreMock.rejoin).toHaveBeenCalled();
    });
});
