import * as React from 'react';
import { hasNetwork } from '../services/Connection';
import OfflineCore from '../services/OfflineCore';
import { setOfflineData } from '../services/Storage';
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

    onOnline = () => {
        this.setState({ view: null });

        // Out of offline mode and rejoining the flow
        store.dispatch(isOffline(false));
        OfflineCore.rejoin(this.props.flowKey);
    }

    onCloseOnline = (flow) => {

        // Called when the requests modal is closed
        // at this point the entry for this state
        // has been cleared from indexDB, so we need to reinstate it
        setOfflineData(flow)
            .then(() => {

                // Back into offline mode
                store.dispatch(isOffline(true));
                this.setState({ view: null });
            });
    }

    onCloseNoNetwork: () => void = () => {
        this.setState({ view: null });
    }

    // TODO: move this into the parent component
    cacheObjectData = () => {
        clearTimeout(this.objectDataCachingTimer);
        if (this.flow && OfflineCore.isOffline === false) {
            this.setState({ isCachingObjectData: true });
            if (!ObjectDataCaching(this.flow, this.onCached)) {
                this.setState({ isCachingObjectData: false });
            }
        }
    }

    render() {
        const button = this.props.isOffline ?
            <button className="btn btn-info" onClick={this.onOnlineClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/>
                Go Online
            </button> : null;

        let view = null;

        const wifi = !this.props.isOffline ? <p>Online</p> : <p>Offline</p>; // Temporary

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

        // TODO: move this into the parent component
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
