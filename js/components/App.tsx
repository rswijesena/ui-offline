import * as React from 'react';
import { Provider } from 'react-redux';
import store from '../stores/store';
import { isOffline } from '../actions';
import { DEFAULT_OBJECTDATA_CACHING_INTERVAL } from '../constants';
import ObjectDataCaching from '../services/cache/ObjectDataCaching';
import OfflineCore from '../services/OfflineCore';
import Offline from './Offline';
import { getOfflineData } from '../services/Storage';

declare const manywho: any;

let pollInterval = manywho.objectDataCachingInterval;
if (!pollInterval || pollInterval < DEFAULT_OBJECTDATA_CACHING_INTERVAL) {
    pollInterval = DEFAULT_OBJECTDATA_CACHING_INTERVAL;
}

class App extends React.Component<any, any> {

    flow = null;
    objectDataCachingTimer = null;

    constructor(props: any) {
        super(props);
        this.state = {
            isCachingObjectData: false,
            progress: 0,
            hasInitialized: false,
        };
    }

    onProgress = (current, total) => {
        this.setState({ progress: Math.min((current / total) * 100, 100) });
    }

    onCached = () => {
        this.setState({ isCachingObjectData: false });
        this.objectDataCachingTimer = setTimeout(
            () => { this.cacheObjectData(); }, pollInterval,
        );
    }

    cacheObjectData = () => {
        clearTimeout(this.objectDataCachingTimer);
        if (this.flow && store.getState().isOffline !== true) {
            this.setState({ isCachingObjectData: true });
            if (!ObjectDataCaching(this.flow, this.onProgress, this.onCached)) {
                this.setState({ isCachingObjectData: false });
            }
        }
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

    render() {

        let cachingSpinner = null;

        const stateToken = manywho.state.getState(this.props.flowKey).token;
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const id = manywho.utils.extractFlowId(this.props.flowKey);
        const versionId = manywho.utils.extractFlowVersionId(this.props.flowKey);

        // Offline initialization only should happen if data
        // has been cached in indexDB
        getOfflineData(stateId, id, versionId)
            .then((flow) => {
                if (!flow && stateToken && !this.state.hasInitialized) {
                    this.initialize();
                }

                // If there is data in indexDB for this state we
                // can assume that this flow currently has requests to be synced
                if (flow) {
                    store.dispatch(isOffline(true));
                }
            });

        if (this.state.isCachingObjectData) {
            cachingSpinner = <div className="caching-spinner">
                <div className="wait-container">
                    <div className="wait-spinner-small wait-spinner"></div>
                    <span className="wait-message">Caching { String(parseInt(this.state.progress, 10)) }%</span>
                </div>
            </div>;
        }

        return <div>
            <Provider store={store}>
                <Offline flowKey={this.props.flowKey} />
            </Provider>;
            { cachingSpinner }
        </div>;
    }
}

export default App;

manywho.settings.initialize({
    components: {
        static: [
            App,
        ],
    },
});
