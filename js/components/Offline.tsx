import * as React from 'react';
import { hasNetwork } from '../services/Connection';
import OfflineCore from '../services/OfflineCore';
import { getOfflineData, removeOfflineData, setOfflineData } from '../services/Storage';
import { IOfflineProps, IOfflineState } from '../interfaces/IOffline';
import { DEFAULT_POLL_INTERVAL } from '../constants';
import ObjectDataCaching from '../services/cache/ObjectDataCaching';

declare const manywho: any;

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
            view: 0,
            progress: 0,
            isCachingObjectData: false,
            hasInitialized: false,
        };
    }

    onOfflineClick = (e) => {
        this.setState({ view: 0 });
    }

    onOffline = () => {
        this.setState({ isCachingObjectData: false, progress: 0 });
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
        OfflineCore.initialize(tenantId, stateId, stateToken, authenticationToken)
            .then((flow) => {
                this.flow = flow;
                this.cacheObjectData();
            });
    }

    cacheObjectData = () => {
        clearTimeout(this.objectDataCachingTimer);
        if (this.flow) {
            this.setState({ isCachingObjectData: true });
            ObjectDataCaching(this.flow)
                .then((response) => {
                    this.flow = response;
                    this.setState({ isCachingObjectData: false });
                    this.objectDataCachingTimer = setTimeout(
                        () => { this.cacheObjectData(); }, pollInterval,
                    );
                })
                .catch(() => {
                    this.setState({ isCachingObjectData: false });
                });
        }
    }

    componentDidMount() {

        // TODO - this needs looking at
        const flowKey = this.props.flowKey;
        const id = manywho.utils.extractFlowId(flowKey);
        const versionId = manywho.utils.extractFlowVersionId(flowKey);
        const stateId = manywho.utils.extractStateId(this.props.flowKey);

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
