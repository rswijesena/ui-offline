/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.components = manywho.offline.components || {};

manywho.offline.components.goOffline = class GoOffline extends React.Component<any, any> {

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

    onProgress = (current, total) => {
        this.setState({ progress: Math.min((current / total) * 100, 100) });

        if (current >= total)
            this.setState({ progress: 100, isDismissEnabled: true });
    }

    onDismiss = () => {
        this.props.onOffline();
    }

    componentWillMount() {
        manywho.offline.initialize(this.props.stateToken)
            .then(() => {
                if (manywho.offline.cacheObjectData(this.props.stateId, this.props.tenantId, this.props.authenticationToken, this.onProgress))
                    this.setState({ isProgressVisible: true });
                else
                    this.props.onOffline();
            });
    }

    render() {
        const style = {
            width: `${this.state.progress}%`
        };

        if (this.state.isProgressVisible)
            return <div className="offline-status">
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

        return null;
    }
};
