import * as React from 'react';
import { hasNetwork } from '../services/Connection';
import OfflineCore from '../services/OfflineCore';
import { getOfflineData, setOfflineData } from '../services/Storage';
import { IOfflineProps, IOfflineState } from '../interfaces/IOffline';
import { DEFAULT_OBJECTDATA_CACHING_INTERVAL } from '../constants';
import ObjectDataCaching from '../services/cache/ObjectDataCaching';
import { connect } from 'react-redux';
import store from '../stores/store';
import { isOffline } from '../actions';

import GoOnline from './GoOnline';
import NoNetwork from './NoNetwork';

declare const manywho: any;
declare const metaData: any;

let pollInterval = manywho.objectDataCachingInterval;
if (!pollInterval || pollInterval < DEFAULT_OBJECTDATA_CACHING_INTERVAL) {
    pollInterval = DEFAULT_OBJECTDATA_CACHING_INTERVAL;
}

enum OfflineView {
    cache = 0,
    replay = 1,
    noNetwork = 2,
}

const mapStateToProps = (state) => {
    return state;
};

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
            () => { this.cacheObjectData(); }, pollInterval,
        );
    }

    onOnline = (flow) => {
        this.setState({ view: null });
        OfflineCore.isOffline = false;

        setOfflineData(flow)
            .then(() => OfflineCore.rejoin(this.props.flowKey));
    }

    onCloseOnline = () => {
        store.dispatch(isOffline(true));
        this.setState({ view: null });
    }

    onCloseNoNetwork: () => void = () => {
        this.setState({ view: null });
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
        hasNetwork()
            .then((response) => {
                if (!response) {
                    getOfflineData(stateId, id, versionId)
                    .then((flow) => {
                        if (flow) {
                            store.dispatch(isOffline(true));
                        }
                    });
                }
            });
    }

    render() {
        const button = this.props.isOffline ?
            <button className="btn btn-info" onClick={this.onOnlineClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/>
                Go Online
            </button> : null;

        let view = null;

        const wifi = !this.props.isOffline ? <p>Online</p> : <p>Offline</p>;

        switch (this.state.view) {

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
                {wifi}
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

export default connect(
    mapStateToProps,
)(Offline);
