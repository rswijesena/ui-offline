/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.components = manywho.offline.components || {};

enum OnlineStatus {
    None,
    Online,
    Offline
}

manywho.offline.components.offline = class Offline extends React.Component<any, any> {

    displayName = 'Offline';

    constructor(props: any) {
        super(props);
        this.state = {
            status: OnlineStatus.None,
            view: null
        };
    }

    onOfflineClick = (e) => {
        this.setState({ view: 0 });
    }

    onOffline = () => {
        this.setState({ status: OnlineStatus.Offline, view: null });

        manywho.settings.initialize({
            offline: {
                isOnline: false
            }
        });
    }

    onOnlineClick = (e) => {
        this.setState({ view: 1 });
    }

    onOnline = (flow) => {
        this.setState({ status: OnlineStatus.Online, view: null, requests: null });

        manywho.offline.storage.set(flow)
            .then(() => manywho.offline.rejoin(this.props.flowKey));
    }

    onCloseOnline = () => {
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
                else {
                    this.setState({ status: OnlineStatus.Online });
                    manywho.settings.initialize({
                        offline: {
                            isOnline: true
                        }
                    });
                }
            });
    }

    render() {
        let button = null;

        switch (this.state.status) {
            case OnlineStatus.Offline:
                button = <button className="btn btn-info" onClick={this.onOnlineClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/>Go Online</button>;
                break;

            case OnlineStatus.Online:
                button = <button className="btn btn-primary" onClick={this.onOfflineClick}><span className="glyphicon glyphicon-import" aria-hidden="true"/>Go Offline</button>;
                break;
        }

        let view = null;

        switch (this.state.view) {
            case 0:
                view = <manywho.offline.components.goOffline onOffline={this.onOffline} flowKey={this.props.flowKey} />;
                break;

            case 1:
                view = <manywho.offline.components.goOnline onOnline={this.onOnline} onClose={this.onCloseOnline} flowKey={this.props.flowKey} />;
                break;
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

manywho.settings.initialize({
    components: {
        static: [
            manywho.offline.components.offline
        ]
    }
});
