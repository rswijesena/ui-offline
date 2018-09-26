import * as React from 'react';
import { Provider } from 'react-redux';
import store from '../stores/store';
import { isOffline } from '../actions';
import OfflineCore from '../services/OfflineCore';
import Offline from './Offline';
import { getOfflineData } from '../services/Storage';

declare const manywho: any;

class App extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            hasInitialized: false,
        };
    }

    initialize = () => {
        const tenantId = manywho.utils.extractTenantId(this.props.flowKey);
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(this.props.flowKey);
        const stateToken = manywho.state.getState(this.props.flowKey).token;

        this.setState({ hasInitialized: true });
        OfflineCore.initialize(
            tenantId,
            stateId,
            stateToken,
            authenticationToken,
        );
    }

    render() {
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

        return <Provider store={store}>
            <Offline flowKey={this.props.flowKey} />
        </Provider>;
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
