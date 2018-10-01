import * as React from 'react';
import { IRequestFaultProps } from '../interfaces/IRequestFault';

declare const manywho: any;

class RequestFault extends React.Component<IRequestFaultProps, any> {

    constructor(props: any) {
        super(props);
    }

    render() {
        if (this.props.response.mapElementInvokeResponses) {
            const rootFaults = this.props.response.mapElementInvokeResponses[0].rootFaults || [];

            return <div className="request-fault">
                <h4>Faults</h4>
                <button className="btn btn-sm btn-primary">Join and fix</button>
                <ul>
                    {rootFaults.map(fault => <li className="text-danger">{fault}</li>)}
                </ul>
            </div>;
        }

        return <div className="request-fault">
            <h4>Failed Request</h4>
            <div className="text-danger">{this.props.response}</div>
        </div>;
    }
}

export default RequestFault;
