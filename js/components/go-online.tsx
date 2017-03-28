/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.components = manywho.offline.components || {};

manywho.offline.components.goOnline = class GoOnline extends React.Component<any, any> {

    displayName = 'Go-Online';

    constructor(props: any) {
        super(props);
        this.state = {
            progress: 0,
            isDismissVisible: false
        };
    }

    replay = (index) => {
        const tenantId = manywho.utils.extractTenantId(this.props.flowKey);
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(stateId);

        manywho.offline.replay(tenantId, stateId, authenticationToken, this.onFault, this.onDone, this.onFail, this.onProgress, index);
    }

    onClick = (e) => {
        this.setState({ isProgressVisible: true });

        manywho.settings.initialize({
            offline: {
                isOnline: true
            }
        });

        this.replay(null);
    }

    onFault = (response, index) => {
        this.setState({ fault: response, requestIndex: index });
    }

    onFail = (error, index) => {
        this.setState({ error, requestIndex: index});
    }

    onProgress = (current, total) => {
        this.setState({ progress: Math.min((current / total) * 100, 100) });
    }

    onDone = () => {
        this.setState({ progress: 100 });

        manywho.offline.storage.clearRequests()
            .then(() => this.setState({ isDismissVisible: true }));
    }

    onRetry = () => {
        this.setState({ error: null, requestIndex: null });
        this.replay(this.state.requestIndex);
    }

    onDismiss = () => {
        this.props.onOnline();
    }

    render() {
        const style = {
            width: `${this.state.progress}%`
        };

        let content = null;

        if (this.state.error)
            content = <div className="offline-error">
                <div className="alert alert-danger">{this.state.error}</div>
                <button className="btn btn-primary" onClick={this.onRetry}>Retry</button>
            </div>;
        else if (this.state.fault)
            content = <manywho.offline.components.goOnlineFault response={this.state.fault} onJoin={this.props.onOnline} />;
        else if (this.state.isProgressVisible)
            content = <div className="offline-progress">
                <h4>Syncing Data</h4>
                <div className="progress">
                    <div className="progress-bar progress-bar-striped active" style={style} />
                </div>
                {this.state.isDismissVisible ? <button className="btn btn-success" onClick={this.onDismiss}>Continue Online</button> : null}
            </div>;

        return <div className="offline">
            <button className="btn btn-info" onClick={this.onClick}>
                <span className="glyphicon glyphicon-export" aria-hidden="true"/>Go Online
            </button>
            {
                content ?
                    <div className="offline-status">
                        <div className="panel panel-default">
                            <div className="panel-body">
                                {content}
                            </div>
                        </div>
                    </div> :
                    null
            }
        </div>;
    }
};
