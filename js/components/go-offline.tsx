/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.GoOffline = class GoOffline extends React.Component<any, any> {

    displayName = 'Go-Offline';

    constructor(props: any) {
        super(props);
        this.state = {
            status: 'Caching Data',
            progress: 0,
            isProgressVisible: false,
            isDismissEnabled: false
        };
    }

    onClick = (e) => {
        const tenantId = manywho.utils.extractTenantId(this.props.flowKey);
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(stateId);

        this.setState({ isProgressVisible: true });

        manywho.offline.initialize();
        manywho.offline.cacheObjectData(stateId, tenantId, authenticationToken, this.onProgress);
    }

    onProgress = (current, total) => {
        this.setState({ progress: Math.min((current / total) * 100, 100) });

        if (current >= total) {
            manywho.settings.initialize({
                offline: {
                    isOnline: false
                }
            });
            this.setState({ progress: 100, isDismissEnabled: true });
        }
    }

    onDismiss = () => {
        this.props.onOffline();
    }

    render() {
        const style = {
            width: `${this.state.progress}%`
        };

        let progress = null;
        if (this.state.isProgressVisible)
            progress = <div className="offline-status">
                <div className="panel panel-default">
                    <div className="panel-body">
                        <h4>{this.state.status}</h4>
                        <div className="progress">
                            <div className="progress-bar progress-bar-striped active" style={style} />
                        </div>
                        <button className="btn btn-success" disabled={!this.state.isDismissEnabled} onClick={this.onDismiss}>Continue Offline</button>
                    </div>
                </div>
            </div>;

        return <div className="offline">
            <button className="btn btn-primary" onClick={this.onClick} disabled={!manywho.offline.metadata}>
                <span className="glyphicon glyphicon-import" aria-hidden="true"/>Go Offline
            </button>
            {progress}
        </div>;
    }
};
