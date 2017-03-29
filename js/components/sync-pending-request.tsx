/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.components = manywho.offline.components || {};

manywho.offline.components.syncPendingRequest = class SyncPendingRequest extends React.Component<any, any> {

    displayName = 'Sync-Pending-Request';

    constructor(props: any) {
        super(props);
        this.state = {
            isCollapsed: true
        };
    }

    onToggleDetails = () => {
        this.setState({ isCollapsed: !this.state.isCollapsed });
    }

    render() {
        let className = 'pending-request-json';
        if (this.state.isCollapsed)
            className += ' hidden';

        return <li className="list-group-item">
            <div className="pending-request-header">
                <span>{this.props.request.invokeType}</span>
                <button className="btn btn-info btn-sm" onClick={this.onToggleDetails}>{this.state.isCollapsed ? 'Show' : 'Hide'}</button>
                <button className="btn btn-primary btn-sm">Replay</button>
                <button className="btn btn-danger btn-sm">Delete</button>
            </div>
            <div className={className}>
                <pre>{JSON.stringify(this.props.request, null, 4)}</pre>
            </div>
        </li>;
    }
};
