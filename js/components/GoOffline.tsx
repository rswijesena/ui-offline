import * as React from 'react';
import OfflineCore from '../services/OfflineCore';
import { clone, flatten, guid } from '../services/Utils';
import { IGoOfflineProps, IGoOfflineState } from '../interfaces/IGoOffline';

declare const manywho: any;

class GoOffline extends React.Component<IGoOfflineProps, Partial<IGoOfflineState>> {

    constructor(props: any) {
        super(props);
        this.state = {
            status: 'Caching Data',
            progress: 0,
            isProgressVisible: false,
            isDismissEnabled: false,
        };
    }

    render() {
        return null;
    }
}

export default GoOffline;
