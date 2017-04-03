/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.components = manywho.offline.components || {};

manywho.offline.components.goOnline = class GoOnline extends React.Component<any, any> {

    displayName = 'Go-Online';

    constructor(props: any) {
        super(props);
        this.state = {
            requests: [],
            isReplayingAll: false
        };
    }

    onDeleteRequest = (request) => {
        const index = this.state.requests.indexOf(request);
        const requests = manywho.utils.clone(this.state.requests);
        requests.splice(index, 1);
        manywho.offline.storage.saveRequests(requests);
        this.setState({ requests });
    }

    onReplayDone = (request) => {
        const index = this.state.requests.indexOf(request);

        if (index === this.state.requests.length - 1 && this.state.isReplayAll) {
            this.onDeleteRequest(request);
            this.props.onOnline();
        }
        else
            this.onDeleteRequest(request);
    }

    onReplayAll = () => {
        this.setState({ isReplayAll: true });
    }

    onDeleteAll = () => {
        manywho.offline.storage.clearRequests()
            .then(this.props.onOnline);
    }

    onClose = () => {
        manywho.settings.initialize({
            offline: {
                isOnline: false
            }
        });

        this.props.onClose();
    }

    componentWillMount() {
        manywho.settings.initialize({
            offline: {
                isOnline: true
            }
        });

        manywho.offline.storage.getRequests()
            .then(response => {
                if (response) {
                    const requests = (response || []).map((request, index) => {
                        request.key = index;
                        return request;
                    });

                    this.setState({ requests });
                }
            });
    }

    render() {
        const requests = this.state.requests.map((request, index) => {
            request.stateId = this.props.stateId;
            request.stateToken = this.props.stateToken;

            return <manywho.offline.components.request request={request}
                tenantId={this.props.tenantId}
                authenticationToken={this.props.authenticationToken}
                isDisabled={this.state.isReplayingAll}
                onDelete={this.onDeleteRequest}
                onReplayDone={this.onReplayDone}
                replayNow={index === 0 && this.state.isReplayAll}
                key={request.key} />;
        });

        return <div className="offline-status">
            <div className="panel panel-default">
                <div className="panel-body sync-pending-requests">
                    <h4>Sync Pending Requests</h4>
                    <div className="pending-requests">
                        <ul className="list-group">
                            {requests}
                        </ul>
                    </div>
                </div>
                <div className="panel-footer">
                    <button className="btn btn-danger pull-left" onClick={this.onDeleteAll}>Delete All</button>
                    <button className="btn btn-default pull-right" onClick={this.onClose}>Close</button>
                    <button className="btn btn-primary pull-right pending-requests-replay-all" onClick={this.onReplayAll}>Replay All</button>
                </div>
            </div>
        </div>;
    }
};
