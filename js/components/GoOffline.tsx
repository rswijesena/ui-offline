import * as React from 'react';
import { IGoOfflineProps, IGoOfflineState } from '../interfaces/IGoOffline';

declare const manywho: any;

class GoOffline extends React.Component<IGoOfflineProps, Partial<IGoOfflineState>> {

    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
        this.props.onOffline();
    }

    render() {
        return null;
    }
}

export default GoOffline;
