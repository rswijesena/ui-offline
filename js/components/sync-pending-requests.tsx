/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.components = manywho.offline.components || {};

manywho.offline.components.syncPendingRequests = class SyncPendingRequests extends React.Component<any, any> {

    displayName = 'Sync-Pending-Requests';

    constructor(props: any) {
        super(props);
        this.state = {};
    }

    render() {
        const requests = this.props.requests.map(request => <manywho.offline.components.syncPendingRequest request={request} />);

        return <div className="offline-status">
            <div className="panel panel-default">
                <div className="panel-body sync-pending-requests">
                    <h4>Pending Requests</h4>
                    <div className="pending-requests">
                        <ul className="list-group">
                            {requests}
                        </ul>
                    </div>
                </div>
                <div className="panel-footer">
                    <button className="btn btn-danger pull-left">Delete All</button>
                    <button className="btn btn-default pull-right" onClick={this.props.onClose}>Close</button>
                    <button className="btn btn-primary pull-right pending-requests-replay-all">Replay All</button>
                </div>
            </div>
        </div>;
    }
};
