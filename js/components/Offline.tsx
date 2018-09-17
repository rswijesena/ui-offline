import * as React from 'react';
import { hasNetwork } from '../services/Connection';
import OfflineCore from '../services/OfflineCore';
import { getOfflineData, removeOfflineData, setOfflineData } from '../services/Storage';
import { IOfflineProps, IOfflineState } from '../interfaces/IOffline';

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
            view: 0,
            status: 'Caching Data',
            progress: 0,
            isProgressVisible: false,
            isDismissEnabled: false,
            hasInit: false,
        };
    }

    onOfflineClick = (e) => {
        this.setState({ view: 0 });
    }

    onOffline = () => {
        this.setState({ isProgressVisible: false });
    }

    onOnlineClick = (e) => {
        hasNetwork()
            .then((response) => {
                response ? this.setState({ view: OfflineView.replay }) : this.setState({ view: OfflineView.noNetwork });
            });
    }

    onOnline = (flow) => {
        this.setState({ view: null });
        OfflineCore.isOffline = false;

        setOfflineData(flow)
            .then(() => OfflineCore.rejoin(this.props.flowKey))
            .then(() => removeOfflineData(flow.state.id));
    }

    onProgress = (current, total) => {
        this.setState({ progress: Math.min((current / total) * 100, 100) });
    }

    onCached = () => {
        this.setState({ progress: 100, isDismissEnabled: true });
    }

    onDismiss = () => {
        this.onOffline();
    }

    onCloseOnline = () => {
        this.setState({ view: null });
    }

    onCloseNoNetwork: () => void = () => {
        this.setState({ view: null });
    }

    init = () => {
        this.setState({ hasInit: true });
        const tenantId = manywho.utils.extractTenantId(this.props.flowKey);
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(this.props.flowKey);
        const stateToken = manywho.state.getState(this.props.flowKey).token;

        OfflineCore.initialize(tenantId, stateId, stateToken, authenticationToken)
            .then((flow) => {
                if (OfflineCore.cacheObjectData(flow, this.onProgress, this.onCached)) {
                    this.setState({ isProgressVisible: true });
                } else {
                    // is offline
                }
            });
    }

    componentDidMount() {
        const flowKey = this.props.flowKey;
        const stateId = manywho.utils.extractStateId(flowKey);
        const id = manywho.utils.extractFlowId(flowKey);
        const versionId = manywho.utils.extractFlowVersionId(flowKey);

        getOfflineData(stateId, id, versionId)
            .then((flow) => {
                if (flow) {
                    this.onOffline();
                }
            });
    }

    render() {
        const stateToken = manywho.state.getState(this.props.flowKey).token;
        if (stateToken && this.state.hasInit === false) {
            this.init();
        }

        const style = {
            width: `${this.state.progress}%`,
        };

        if (this.state.isProgressVisible) {
            return <div className="offline-status">
                <div className="panel panel-default">
                    <div className="panel-body">
                        <h4>{this.state.status}</h4>
                        <div className="progress">
                            <div className="progress-bar progress-bar-striped active" style={style} />
                        </div>
                        <button className="btn btn-success continue-offline" disabled={!this.state.isDismissEnabled} onClick={this.onDismiss}>
                            Continue Offline
                        </button>
                    </div>
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
