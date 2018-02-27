/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

class Request extends React.Component<any, any> {

    displayName = 'Request';

    constructor(props: any) {
        super(props);
        this.state = {
            isCollapsed: true,
            isReplaying: false,
            response: null
        };
    }

    onReplay = () => {
        this.setState({ isReplaying: true, response: null });
        manywho.offline.isOffline = false;

        return manywho.ajax.invoke(this.props.request, this.props.tenantId, this.props.authenticationToken)
            .then(response => {
                if (response && response.mapElementInvokeResponses && response.mapElementInvokeResponses[0].rootFaults) {
                    this.setState({ response, isReplaying: false });
                    manywho.offline.isOffline = true;
                }
                else if (response && response.invokeType === 'NOT_ALLOWED') {
                    manywho.offline.rejoin(this.props.flowKey);
                }
                else
                    this.props.onReplayDone(this.props.request);
            })
            .fail(response => {
                manywho.offline.isOffline = true;
            });
    }

    onDelete = () => {
        this.props.onDelete(this.props.request);
    }

    onToggleDetails = () => {
        this.setState({ isCollapsed: !this.state.isCollapsed });
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.replayNow && nextProps.replayNow)
            this.onReplay();
    }

    render() {
        let replaying = null;
        if (this.state.isReplaying)
            replaying = <p className="text-info replaying">Replaying...</p>;

        let response = null;
        if (this.state.response)
            response = <manywho.offline.components.requestFault response={this.state.response} />;

        let request = null;
        if (!this.state.isCollapsed && !this.state.isReplaying && !this.state.response)
            request = <div className="pending-request-json">
                <pre>{JSON.stringify(this.props.request, null, 4)}</pre>
            </div>;

        const isDisabled = this.props.isDisabled || this.state.isReplaying;

        return <li className="list-group-item">
            <div className="pending-request-header">
                <div>
                    <span>{this.props.request.currentMapElementDeveloperName}</span>
                    <small>{this.props.request.invokeType}</small>
                </div>
                <button className="btn btn-info btn-sm" onClick={this.onToggleDetails} disabled={isDisabled}>{this.state.isCollapsed ? 'Show' : 'Hide'}</button>
                <button className="btn btn-primary btn-sm" onClick={this.onReplay} disabled={isDisabled}>Replay</button>
                <button className="btn btn-danger btn-sm" onClick={this.onDelete} disabled={isDisabled}>Delete</button>
            </div>
            {replaying}
            {response}
            {request}
        </li>;
    }
};

export default Request;
