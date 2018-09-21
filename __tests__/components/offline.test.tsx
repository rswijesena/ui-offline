import * as React from 'react';
import { shallow } from 'enzyme';
import Offline from '../../js/components/Offline';

describe('Offline component behaviour', () => {

    let componentWrapper;

    const props = {
        flowKey: '',
    };

    beforeEach(() => {
        componentWrapper = shallow(<Offline {...props} />);
    });

    test('Offline component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

    test('When page loads flow is set into offline mode if there is an entry in indexdb for current state', () => {
    });

    test('Offline initialization occurs only when a state token is present in state and if initialization has not already occured', () => {
    });

    test('When page loads flow is set into offline mode if there is an entry in indexdb for current state', () => {
    });

    test('Caching object data only occurs periodically when object data requests are present in the snapshot', () => {
    });

    test('If caching object data requests that a loader spinner is present', () => {
    });

    test('Callback triggers caching loader spinner to disappear', () => {
    });

    test('Callback sets a timeout to cache object data request responses based on defined interval value', () => {
    });

});
