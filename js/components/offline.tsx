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
            requests: []
        };
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
        this.setState({ isOnline: true, view: null, requests: null });
        manywho.offline.rejoin(this.props.flowKey);
    }

    onSyncPendingClick = () => {
        this.setState({ view: 2 });
    }

    onCloseSyncPending = () => {
        this.setState({ view: null });
    }

    componentWillMount() {
        manywho.offline.storage.getRequests()
            .then(requests => this.setState({ requests }));
    }

    render() {
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const props = {
            tenantId: manywho.utils.extractTenantId(this.props.flowKey),
            stateId: stateId,
            authenticationToken: manywho.state.getAuthenticationToken(stateId),
            stateToken: manywho.state.getState(this.props.flowKey).token
        };

        let requests = null;
        if (this.state.requests && this.state.requests.length > 0 && this.state.isOnline)
            requests = <button className="btn btn-default" onClick={this.onSyncPendingClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/> {`${this.state.requests.length} Pending Requests`}</button>;

        let view = null;

        switch (this.state.view) {
            case 0:
                view = <manywho.offline.components.goOffline {...props} onOffline={this.onOffline} />;
                break;

            case 1:
                view = <manywho.offline.components.goOnline {...props} onOnline={this.onOnline} />;
                break;
        }

        return <div className="offline">
            <div className="offline-options">
                {
                    this.state.isOnline ?
                        <button className="btn btn-primary" onClick={this.onOfflineClick} disabled={!manywho.offline.metadata}><span className="glyphicon glyphicon-import" aria-hidden="true"/>Go Offline</button> :
                        <button className="btn btn-info" onClick={this.onOnlineClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/>Go Online</button>
                }
                {requests}
            </div>
            {view}
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
