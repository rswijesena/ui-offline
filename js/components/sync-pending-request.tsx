/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.components = manywho.offline.components || {};

manywho.offline.components.syncPendingRequest = class SyncPendingRequest extends React.Component<any, any> {

    displayName = 'Sync-Pending-Request';

    constructor(props: any) {
        super(props);
        this.state = {
            isCollapsed: true,
            isReplaying: false
        };
    }

    onToggleDetails = () => {
        this.setState({ isCollapsed: !this.state.isCollapsed });
    }

    onReplay = () => {
        this.setState({ isReplaying: true });
        return manywho.ajax.invoke(this.props.request, this.props.tenantId, this.props.authenticationToken)
            .then(() => this.props.onReplay(this.props.request));
    }

    render() {
        let className = 'pending-request-json';
        if (this.state.isCollapsed || this.state.isReplaying)
            className += ' hidden';

        let progress = null;
        if (this.state.isReplaying)
            progress = <div className="progress replay-progress">
                <div className="progress-bar progress-bar-striped active" />
            </div>;

        return <li className="list-group-item">
            <div className="pending-request-header">
                <span>{this.props.request.invokeType}</span>
                <button className="btn btn-info btn-sm" onClick={this.onToggleDetails} disabled={this.state.isReplaying}>{this.state.isCollapsed ? 'Show' : 'Hide'}</button>
                <button className="btn btn-primary btn-sm" onClick={this.onReplay} disabled={this.state.isReplaying}>Replay</button>
                <button className="btn btn-danger btn-sm" disabled={this.state.isReplaying}>Delete</button>
            </div>
            {progress}
            <div className={className}>
                <pre>{JSON.stringify(this.props.request, null, 4)}</pre>
            </div>
        </li>;
    }
};
