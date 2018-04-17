import * as React from 'react';
import Request from './Request';

import { getOfflineData, removeOfflineData, setOfflineData } from '../services/Storage';

import Flow from '../models/Flow';

declare const manywho: any;

class GoOnline extends React.Component<any, any> {

    flow = null;

    constructor(props: any) {
        super(props);
        this.state = {
            isReplayingAll: false,
        };
    }

    onDeleteRequest = (request) => {
        this.flow.removeRequest(request);
        setOfflineData(this.flow);
        this.forceUpdate();
    }

    onReplayDone = (request) => {
        const index = this.flow.requests.indexOf(request);

        if (index === this.flow.requests.length - 1 && this.state.isReplayAll) {
            this.onDeleteRequest(request);
            this.props.onOnline(this.flow);
        } else {
            this.onDeleteRequest(request);
        }
    }

    onReplayAll = () => {
        this.setState({ isReplayAll: true });
    }

    onDeleteAll = () => {
        this.flow.removeRequests();

        setOfflineData(this.flow)
            .then(this.props.onOnline);
    }

    onClose = () => {
        manywho.settings.initialize({
            offline: {
                isOnline: false,
            },
        });

        this.props.onClose(this.flow);
    }

    componentWillMount() {
        manywho.settings.initialize({
            offline: {
                isOnline: true,
            },
        });

        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const id = manywho.utils.extractFlowId(this.props.flowKey);
        const versionId = manywho.utils.extractFlowVersionId(this.props.flowKey);

        getOfflineData(stateId, id, versionId)
            .then((flow) => {
                this.flow = new Flow(flow);

                if (!this.flow.requests || this.flow.requests.length === 0) {
                    this.props.onOnline(this.flow);
                } else {
                    this.forceUpdate();
                }
            });
    }

    render() {
        let requests = null;
        if (this.flow) {
            requests = this.flow.requests.map((request, index) => {
                request.stateId = this.flow.state.id;
                request.stateToken = this.flow.state.token;

                return <Request request={request}
                    tenantId={this.flow.tenantId}
                    authenticationToken={this.flow.authenticationToken}
                    isDisabled={this.state.isReplayingAll}
                    onDelete={this.onDeleteRequest}
                    onReplayDone={this.onReplayDone}
                    replayNow={index === 0 && this.state.isReplayAll}
                    flowKey={this.props.flowKey}
                    key={request.key} />;
            });
        }

        return <div className="offline-status">
            <div className="panel panel-default">
                <div className="panel-body sync-pending-requests">
                    <h4>Go Online</h4>
                    <div className="pending-requests">
                        <ul className="list-group">
                            {requests}
                        </ul>
                    </div>
                </div>
                <div className="panel-footer">
                    <button className="btn btn-danger pull-left" onClick={this.onDeleteAll}>Delete All</button>
                    <button className="btn btn-default pull-right" onClick={this.onClose}>Close</button>
                    <button className="btn btn-primary pull-right pending-requests-replay-all" onClick={this.onReplayAll}>Replay All</button>
                </div>
            </div>
        </div>;
    }
}

export default GoOnline;
