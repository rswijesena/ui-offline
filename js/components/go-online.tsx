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
        manywho.offline.replay(this.props.tenantId, this.props.stateId, this.props.authenticationToken, this.onFault, this.onDone, this.onFail, this.onProgress, index);
    }

    onFault = (request, response) => {
        this.setState({ fault: response });
    }

    onFail = (error) => {
        this.setState({ error});
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
        this.setState({ error: null });
        this.replay(this.state.requestIndex);
    }

    onDismiss = () => {
        this.props.onOnline();
    }

    componentWillMount() {
        this.setState({ isProgressVisible: true });

        manywho.settings.initialize({
            offline: {
                isOnline: true
            }
        });

        this.replay(null);
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

        return content ?
            <div className="offline-status">
                <div className="panel panel-default">
                    <div className="panel-body">
                        {content}
                    </div>
                </div>
            </div> :
            null;
    }
};
