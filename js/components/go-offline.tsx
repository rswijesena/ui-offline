/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.GoOffline = class GoOffline extends React.Component<any, any> {

    displayName = 'Go-Offline';

    constructor(props: any) {
        super(props);
        this.state = {
            progress: 0,
            isProgressVisible: false,
            isDismissVisible: false
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
            this.setState({ progress: 100, isDismissVisible: true });
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
            progress = <div className="go-offline-status">
                <div className="wait-spinner" />
                <div className="progress">
                    <div className="progress-bar progress-bar-striped active" style={style} />
                </div>
                {this.state.isDismissVisible ? <button className="btn btn-success" onClick={this.onDismiss}>Continue Offline</button> : <h4>Fetching Data...</h4>}
            </div>;

        return <div className="go-offline">
            <button className="btn btn-primary" onClick={this.onClick}>Go Offline</button>
            {progress}
        </div>;
    }
};
