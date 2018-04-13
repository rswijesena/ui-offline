import React from 'react';

declare var manywho: any;

class RequestFault extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    render() {
        const rootFaults = this.props.response.mapElementInvokeResponses[0].rootFaults || [];

        return <div className="request-fault">
            <h4>Faults</h4>
            <button className="btn btn-sm btn-primary" onClick={this.props.onJoin}>Join and fix</button>
            <ul>
                {rootFaults.map(fault => <li className="text-danger">{fault}</li>)}
            </ul>
        </div>;
    }
};

export default RequestFault;
