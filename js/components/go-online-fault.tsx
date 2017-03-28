/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;
declare var ReactCollapse: any;
declare var ReactMotion: any;

manywho.offline.components = manywho.offline.components || {};

manywho.offline.components.goOnlineFault = class GoOnlineFault extends React.Component<any, any> {

    displayName = 'Go-Online-Fault';

    constructor(props: any) {
        super(props);
        this.state = { isCollapsed: true };
    }

    onToggleCollapse = () => {
        this.setState({ isCollapsed: !this.state.isCollapsed });
    }

    render() {
        const rootFaults = this.props.response.mapElementInvokeResponses[0].rootFaults || [];
        const toggleIcon = (this.state.isCollapsed) ? 'plus' : 'minus';

        let responseClassName = 'offline-faults-response';
        if (this.state.isCollapsed)
            responseClassName += ' hidden';

        return <div className="offline-faults">
            <h4>Faults</h4>
            <div className="offline-faults-faults">
                <ul>
                    {rootFaults.map(fault => <li className="text-danger">{fault}</li>)}
                </ul>
                <button className="btn btn-primary" onClick={this.props.onJoin}>Join and Fix</button>
            </div>
            <h5 onClick={this.onToggleCollapse}><span className={`glyphicon glyphicon-${toggleIcon}`} /> Response</h5>
            <div className={responseClassName}>
                <pre>{JSON.stringify(this.props.response, null, 4)}</pre>
            </div>
        </div>;
    }
};
