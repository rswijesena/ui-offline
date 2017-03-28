/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.components = manywho.offline.components || {};

manywho.offline.components.offline = class Offline extends React.Component<any, any> {

    displayName = 'Offline';

    constructor(props: any) {
        super(props);
        this.state = {
            isOnline: true
        };
    }

    onOffline = () => {
        this.setState({ isOnline: false });

        manywho.settings.initialize({
            offline: {
                isOnline: false
            }
        });
    }

    onOnline = () => {
        this.setState({ isOnline: true });
        manywho.offline.rejoin(this.props.flowKey);
    }

    render() {
        return this.state.isOnline ?
            <manywho.offline.components.goOffline onOffline={this.onOffline} flowKey={this.props.flowKey} /> :
            <manywho.offline.components.goOnline onOnline={this.onOnline} flowKey={this.props.flowKey} />;
    }
};

manywho.settings.initialize({
    components: {
        static: [
            manywho.offline.components.offline
        ]
    }
});
