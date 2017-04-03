/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.components = manywho.offline.components || {};

manywho.offline.components.offline = class Offline extends React.Component<any, any> {

    displayName = 'Offline';

    constructor(props: any) {
        super(props);
        this.state = {
            isOnline: true,
            view: null,
            offlineState: null
        };
    }

    onOfflineClick = (e) => {
        this.setState({ view: 0 });
    }

    onOffline = (state) => {
        this.setState({ isOnline: false });

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
        this.setState({ isOnline: true, view: null, requests: null });

        manywho.offline.storage.set(flow)
            .then(() => manywho.offline.rejoin(this.props.flowKey));
    }

    render() {
        let button = <button className="btn btn-primary" onClick={this.onOfflineClick}><span className="glyphicon glyphicon-import" aria-hidden="true"/>Go Offline</button>;
        if (!this.state.isOnline)
            button = <button className="btn btn-info" onClick={this.onOnlineClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/>Go Online</button>;

        let view = null;

        switch (this.state.view) {
            case 0:
                view = <manywho.offline.components.goOffline onOffline={this.onOffline} flowKey={this.props.flowKey} />;
                break;

            case 1:
                view = <manywho.offline.components.goOnline onOnline={this.onOnline} flowKey={this.props.flowKey} />;
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
