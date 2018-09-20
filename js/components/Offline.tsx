import * as React from 'react';
import { hasNetwork } from '../services/Connection';
import OfflineCore from '../services/OfflineCore';
import { getFlowModel } from '../models/Flow';
import { getOfflineData, removeOfflineData, setOfflineData } from '../services/Storage';
import { IOfflineProps, IOfflineState } from '../interfaces/IOffline';
import { DEFAULT_POLL_INTERVAL } from '../constants';
import ObjectDataCaching from '../services/cache/ObjectDataCaching';

import GoOffline from './GoOffline';
import GoOnline from './GoOnline';
import NoNetwork from './NoNetwork';

declare const manywho: any;
declare const metaData: any;

let pollInterval = manywho.pollInterval;
if (!pollInterval || pollInterval < DEFAULT_POLL_INTERVAL) {
    pollInterval = DEFAULT_POLL_INTERVAL;
}

enum OfflineView {
    cache = 0,
    replay = 1,
    noNetwork = 2,
}

class Offline extends React.Component<IOfflineProps, IOfflineState> {

    flow = null;
    objectDataCachingTimer = null;

    constructor(props: any) {
        super(props);
        this.state = {
            view: null,
            isCachingObjectData: false,
            hasInitialized: false,
        };
    }

    onOfflineClick = () => {
        this.setState({ view: 0 });
    }

    onOffline = () => {
        this.setState({ isCachingObjectData: false, view: null });
        OfflineCore.isOffline = true;

        // Indexdb is initially popolated with data
        // when the user explicitly goes into offline mode
        setOfflineData(getFlowModel())
            .then(() => this.forceUpdate());
    }

    onOnlineClick = () => {
        hasNetwork()
            .then((response) => {
                response ?
                this.setState({ view: OfflineView.replay }) :
                this.setState({ view: OfflineView.noNetwork });
            });
    }

    onCached = () => {
        this.setState({ isCachingObjectData: false });
        this.objectDataCachingTimer = setTimeout(
            () => { this.cacheObjectData(); }, 500000,
        );
    }

    onOnline = (flow) => {
        this.setState({ view: null });
        OfflineCore.isOffline = false;

        setOfflineData(flow)
            .then(() => OfflineCore.rejoin(this.props.flowKey))

            // Indexdb is cleared out when rejoining the flow
            // this indicates the flow is no longer in offline mode
            .then(() => removeOfflineData(flow.state.id));
    }

    onCloseOnline = () => {
        this.setState({ view: null });
    }

    onCloseNoNetwork: () => void = () => {
        this.setState({ view: null });
    }

    initialize = () => {
        const tenantId = manywho.utils.extractTenantId(this.props.flowKey);
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(this.props.flowKey);
        const stateToken = manywho.state.getState(this.props.flowKey).token;

        this.setState({ hasInitialized: true });
        this.flow = OfflineCore.initialize(
            tenantId,
            stateId,
            stateToken,
            authenticationToken,
        );
        this.cacheObjectData();
    }

    cacheObjectData = () => {
        clearTimeout(this.objectDataCachingTimer);
        if (this.flow && OfflineCore.isOffline === false) {
            this.setState({ isCachingObjectData: true });
            if (!ObjectDataCaching(this.flow, this.onCached)) {
                this.setState({ isCachingObjectData: false });
            }
        }
    }

    componentDidMount() {
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const id = manywho.utils.extractFlowId(this.props.flowKey);
        const versionId = manywho.utils.extractFlowVersionId(this.props.flowKey);

        // When component mounts we assume the flow should be
        // running in offline mode if there is an entry for the
        // current state in indexdb
        getOfflineData(stateId, id, versionId)
            .then((flow) => {
                if (flow) {
                    this.onOffline();
                }
            });
    }

    render() {
        const stateToken = manywho.state.getState(this.props.flowKey).token;

        // We need the state token to initialize the offline functionality,
        // which is not set in state when the component initially is mounted
        if (stateToken && this.state.hasInitialized === false) {
            this.initialize();
        }

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

        if (metaData && !this.state.isCachingObjectData) {
            return <div className="offline">
                <div className="offline-options">
                    {button}
                </div>
                {view}
            </div>;
        }

        if (this.state.isCachingObjectData) {
            return <div className="caching-spinner">
                <div className="wait-container">
                    <div className="wait-spinner-small wait-spinner"></div>
                    <span className="wait-message">Caching</span>
                </div>
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
