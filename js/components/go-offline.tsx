/// <reference path="../../typings/index.d.ts" />

import Offline from '../services/offline';

declare var manywho: any;

class GoOffline extends React.Component<any, any> {

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
    }

    onCached = () => {
        this.setState({ progress: 100, isDismissEnabled: true });
    }

    onDismiss = () => {
        this.props.onOffline();
    }

    componentWillMount() {
        const tenantId = manywho.utils.extractTenantId(this.props.flowKey);
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(this.props.flowKey);
        const stateToken = manywho.state.getState(this.props.flowKey).token;

        Offline.initialize(tenantId, stateId, stateToken, authenticationToken)
            .then(flow => {
                if (Offline.cacheObjectData(flow, this.onProgress, this.onCached))
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
                        <button className="btn btn-success continue-offline" disabled={!this.state.isDismissEnabled} onClick={this.onDismiss}>Continue Offline</button>
                    </div>
                </div>
            </div>;

        return null;
    }
};

export default GoOffline;
