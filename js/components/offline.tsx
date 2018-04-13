import React from 'react';
import {clone, flatten, guid} from '../services/utils';

declare var manywho: any;

enum OfflineView {
    cache = 0,
    replay = 1,
    noNetwork = 2
}

class Offline extends React.Component<any, any> {

    displayName = 'Offline';

    constructor(props: any) {
        super(props);
        this.state = {
            view: null
        };
    }

    onOfflineClick = (e) => {
        this.setState({ view: 0 });
    }

    onOffline = () => {
        this.setState({ view: null });
        manywho.offline.isOffline = true;
        this.forceUpdate();
    }

    onOnlineClick = (e) => {
        manywho.connection.hasNetwork()
            .then(response => {
                response ? this.setState({ view: OfflineView.replay }) : this.setState({ view: OfflineView.noNetwork });
            });
    }

    onOnline = (flow) => {
        this.setState({ view: null, requests: null });
        manywho.offline.isOffline = false;

        manywho.offline.storage.set(flow)
            .then(() => manywho.offline.rejoin(this.props.flowKey))
            .then(() => manywho.offline.storage.remove(flow.state.id));
    }

    onCloseOnline = () => {
        this.setState({ view: null });
    }

    onCloseNoNetwork = () => {
        this.setState({ view: null });
    }

    componentWillMount() {
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const id = manywho.utils.extractFlowId(this.props.flowKey);
        const versionId = manywho.utils.extractFlowVersionId(this.props.flowKey);

        manywho.offline.storage.get(stateId, id, versionId)
            .then(flow => {
                if (flow)
                    this.onOffline();
            });
    }

    render() {
        let button = manywho.offline.isOffline ?
            <button className="btn btn-info" onClick={this.onOnlineClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/>Go Online</button> :
            <button className="btn btn-primary" onClick={this.onOfflineClick}><span className="glyphicon glyphicon-import" aria-hidden="true"/>Go Offline</button>;

        let view = null;

        switch (this.state.view) {
            case OfflineView.cache:
                view = <manywho.offline.components.goOffline onOffline={this.onOffline} flowKey={this.props.flowKey} />;
                break;

            case OfflineView.replay:
                view = <manywho.offline.components.goOnline onOnline={this.onOnline} onClose={this.onCloseOnline} flowKey={this.props.flowKey} />;
                break;

            case OfflineView.noNetwork:
                view = <manywho.offline.components.noNetwork onClose={this.onCloseNoNetwork} />;
        }

        if (manywho.offline.metadata && manywho.settings.global('offline.isEnabled', this.props.flowKey))
            return <div className="offline">
                <div className="offline-options">
                    {button}
                </div>
                {view}
            </div>;

        return null;
    }
};

export default Offline;

manywho.settings.initialize({
    components: {
        static: [
            Offline
        ]
    }
});
