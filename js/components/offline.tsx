/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.components = manywho.offline.components || {};

manywho.offline.components.offline = class Offline extends React.Component<any, any> {

    displayName = 'Offline';

    constructor(props: any) {
        super(props);
        this.state = {
            isOnline: true,
            view: null,
            pendingRequests: []
        };
    }

    getPendingRequests() {
        manywho.offline.storage.getRequests()
            .then(response => {
                if (response)
                    this.setState({ pendingRequests: response || [] });
            });
    }

    onOfflineClick = (e) => {
        this.setState({ view: 0 });
    }

    onOffline = () => {
        this.setState({ isOnline: false });

        manywho.settings.initialize({
            offline: {
                isOnline: false
            }
        });
    }

    onOnlineClick = (e) => {
        this.setState({ view: 1 });
    }

    onOnline = () => {
        this.setState({ isOnline: true, view: null });
        manywho.offline.rejoin(this.props.flowKey);
        this.getPendingRequests();
    }

    onSyncPendingClick = () => {
        this.setState({ view: 2 });
    }

    onCloseSyncPending = () => {
        this.setState({ view: null });
    }

    componentWillMount() {
        this.getPendingRequests();
    }

    componentWillUpdate(props, state) {
        const x = 0;
    }

    render() {
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const props = {
            tenantId: manywho.utils.extractTenantId(this.props.flowKey),
            stateId: stateId,
            authenticationToken: manywho.state.getAuthenticationToken(stateId),
            stateToken: manywho.state.getState(this.props.flowKey).token
        };

        let content = null;

        switch (this.state.view) {
            case 0:
                content = <manywho.offline.components.goOffline {...props} onOffline={this.onOffline} />;
                break;

            case 1:
                content = <manywho.offline.components.goOnline {...props} onOnline={this.onOnline} />;
                break;

            case 2:
                content = <manywho.offline.components.syncPendingRequests requests={this.state.pendingRequests} onClose={this.onCloseSyncPending} />;
                break;
        }

        return <div className="offline">
            <div className="offline-options">
                {this.state.isOnline && <button className="btn btn-primary" onClick={this.onOfflineClick} disabled={!manywho.offline.metadata}><span className="glyphicon glyphicon-import" aria-hidden="true"/>Go Offline</button>}
                {!this.state.isOnline && <button className="btn btn-info" onClick={this.onOnlineClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/>Go Online</button>}
                {this.state.pendingRequests && <button className="btn btn-default" onClick={this.onSyncPendingClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/> {`${this.state.pendingRequests.length} Pending Sync`}</button>}
            </div>
            {content}
        </div>;
    }
};

manywho.settings.initialize({
    components: {
        static: [
            manywho.offline.components.offline
        ]
    }
});
