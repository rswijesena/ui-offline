import * as React from 'react';
import { hasNetwork } from '../services/Connection';
import OfflineCore from '../services/OfflineCore';
import { getOfflineData, removeOfflineData, setOfflineData } from '../services/Storage';
import { clone, flatten, guid } from '../services/Utils';
import { IOfflineProps, IOfflineState } from '../interfaces/IOffline';
import { killCachingInterval, setCachingInterval } from '../services/StateCaching';

import GoOffline from './GoOffline';
import GoOnline from './GoOnline';
import NoNetwork from './NoNetwork';

declare const manywho: any;
declare const metaData: any;

enum OfflineView {
    cache = 0,
    replay = 1,
    noNetwork = 2,
}

class Offline extends React.Component<IOfflineProps, IOfflineState> {

    constructor(props: any) {
        super(props);
        this.state = {
            view: null,
        };
    }

    onOfflineClick = (e) => {
        this.setState({ view: 0 });
    }

    onOffline = () => {

        // We do not want to keep caching
        // whilst the flow is offline
        killCachingInterval();

        this.setState({ view: null });
        OfflineCore.isOffline = true;
        this.forceUpdate();
    }

    onOnlineClick = (e) => {
        hasNetwork()
            .then((response) => {
                response ? this.setState({ view: OfflineView.replay }) : this.setState({ view: OfflineView.noNetwork });
            });
    }

    onOnline = (flow) => {

        // Start caching again!
        setCachingInterval(this.props.flowKey);

        this.setState({ view: null });
        OfflineCore.isOffline = false;

        setOfflineData(flow)
            .then(() => OfflineCore.rejoin(this.props.flowKey))
            .then(() => removeOfflineData(flow.state.id));
    }

    onCloseOnline = () => {
        this.setState({ view: null });
    }

    onCloseNoNetwork: () => void = () => {
        this.setState({ view: null });
    }

    componentDidMount() {
        const flowKey = this.props.flowKey;
        const stateId = manywho.utils.extractStateId(flowKey);
        const id = manywho.utils.extractFlowId(flowKey);
        const versionId = manywho.utils.extractFlowVersionId(flowKey);

        getOfflineData(stateId, id, versionId)
            .then((flow) => {

                // This is when we initiate caching component values in state,
                // might not be the best time to initiate this, but cannot find
                // another way of accessing the flowkey when the flow is initialising.
                setCachingInterval(flowKey);

                if (flow) {
                    this.onOffline();
                }
            });
    }

    render() {
        const button = OfflineCore.isOffline ?
            <button className="btn btn-info" onClick={this.onOnlineClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/>
                Go Online
            </button> :
            <button className="btn btn-primary" onClick={this.onOfflineClick}><span className="glyphicon glyphicon-import" aria-hidden="true"/>
                Go Offline
            </button>;

        let view = null;

        switch (this.state.view) {
        case OfflineView.cache:
            view = <GoOffline onOffline={this.onOffline} flowKey={this.props.flowKey} />;
            break;

        case OfflineView.replay:
            view = <GoOnline onOnline={this.onOnline} onClose={this.onCloseOnline} flowKey={this.props.flowKey} />;
            break;

        case OfflineView.noNetwork:
            view = <NoNetwork onClose={this.onCloseNoNetwork} />;
        }

        if (metaData) {
            return <div className="offline">
                <div className="offline-options">
                    {button}
                </div>
                {view}
            </div>;
        }

        return null;
    }
}

export default Offline;

manywho.settings.initialize({
    components: {
        static: [
            Offline,
        ],
    },
});
