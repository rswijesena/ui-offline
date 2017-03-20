/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.GoOnline = class GoOnline extends React.Component<any, any> {

    displayName = 'Go-Online';

    constructor(props: any) {
        super(props);
        this.state = {
            status: 'Syncing Data',
            progress: 0,
            isDismissVisible: false
        };
    }

    onClick = (e) => {
        this.setState({ isProgressVisible: true });

        manywho.settings.initialize({
            offline: {
                isOnline: true
            }
        });

        const tenantId = manywho.utils.extractTenantId(this.props.flowKey);
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(stateId);

        manywho.offline.replay(tenantId, stateId, authenticationToken, this.onDone, null, this.onProgress);
    }

    onProgress = (current, total) => {
        this.setState({ progress: Math.min((current / total) * 100, 100) });
    }

    onDone = () => {
        this.setState({ progress: 100 });

        manywho.offline.storage.clearRequests()
            .then(() => this.setState({ isDismissVisible: true }));
    }

    onDismiss = () => {
        this.props.onOnline();
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
                        {this.state.isDismissVisible ? <button className="btn btn-success" onClick={this.onDismiss}>Continue Online</button> : null}
                    </div>
                </div>
            </div>;

        return <div className="offline">
            <button className="btn btn-info" onClick={this.onClick}>
                <span className="glyphicon glyphicon-export" aria-hidden="true"/>Go Online
            </button>
            {progress}
        </div>;
    }
};
