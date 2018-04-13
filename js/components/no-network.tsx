import * as React from 'react';

declare const manywho: any;

class NoNetwork extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    render() {
        return <div className="offline-status">
            <div className="panel panel-default">
                <div className="panel-body">
                    <h4>No network connection is available, please make sure you are connected to the internet</h4>
                    <button className="btn btn-primary" onClick={this.props.onClose}>Close</button>
                </div>
            </div>
        </div>;
    }
};

export default NoNetwork;
