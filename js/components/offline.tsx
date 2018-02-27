/// <reference path="../../typings/index.d.ts" />

import {hasNetwork} from '../services/connection';
import Offline from '../services/offline';
import {get, remove, set} from '../services/storage';
import GoOffline from './go-offline';
import GoOnline from './go-online';
import NoNetwork from './no-network';

declare var require: any;
declare var manywho: any;

const metaData = require('../services/metadata.json');

enum OfflineView {
    cache = 0,
    replay = 1,
    noNetwork = 2
}

class OfflineBase extends React.Component<any, any> {

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
        Offline.isOffline = true;
        this.forceUpdate();
    }

    onOnlineClick = (e) => {
        hasNetwork()
            .then(response => {
                response ? this.setState({ view: OfflineView.replay }) : this.setState({ view: OfflineView.noNetwork });
            });
    }

    onOnline = (flow) => {
        this.setState({ view: null, requests: null });
        Offline.isOffline = false;

        set(flow)
            .then(() => Offline.rejoin(this.props.flowKey))
            .then(() => remove(flow.state.id));
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

        get(stateId, id, versionId)
            .then(flow => {
                if (flow)
                    this.onOffline();
            });
    }

    render() {
        let button = Offline.isOffline ?
            <button className="btn btn-info" onClick={this.onOnlineClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/>Go Online</button> :
            <button className="btn btn-primary" onClick={this.onOfflineClick}><span className="glyphicon glyphicon-import" aria-hidden="true"/>Go Offline</button>;

        let view = null;

        switch (this.state.view) {
            case OfflineView.cache:
                view = <GoOffline onOffline={this.onOffline} flowKey={this.props.flowKey} />;
                break;

            case OfflineView.replay:
                view = <GoOnline onOnline={this.onOnline} onClose={this.onCloseOnline} flowKey={this.props.flowKey} />;
                break;

            case OfflineView.noNetwork:
                view = <NoNetwork onClose={this.onCloseNoNetwork} />;
        }

        if (metaData && manywho.settings.global('offline.isEnabled', this.props.flowKey))
            return <div className="offline">
                <div className="offline-options">
                    {button}
                </div>
                {view}
            </div>;

        return null;
    }
};

export default OfflineBase;

manywho.settings.initialize({
    components: {
        static: [
            OfflineBase
        ]
    }
});
