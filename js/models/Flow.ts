import State from './State';
import { IFlow } from '../interfaces/IModels';

declare var manywho: any;

class Flow {
    authenticationToken = null;
    id = null;
    objectData = null;
    requests = null;
    state = null;
    tenantId = null;

    constructor(flow: IFlow) {
        this.authenticationToken = flow.authenticationToken;
        this.id = flow.id;
        this.objectData = flow.objectData || {};
        this.requests = flow.requests || [];
        this.tenantId = flow.tenantId;
        this.state = new State(flow.state);
    }

    addRequest(request: any, snapshot: any) {
        request.key = this.requests.length;
        request.currentMapElementDeveloperName = snapshot.metadata.mapElements.find(
            element => element.id === request.currentMapElementId,
        ).developerName;
        this.requests.push(request);
    }

    removeRequest(request: any) {
        const index = this.requests.indexOf(request);
        this.requests.splice(index, 1);
    }

    removeRequests() {
        this.requests = [];
    }

    getObjectData(typeElementId: string) {
        return this.objectData[typeElementId];
    }

    cacheObjectData(objectData: any, typeElementId: string) {
        if (this.objectData[typeElementId]) {
            this.objectData[typeElementId] = this.objectData[typeElementId].concat(objectData);
        } else {
            this.objectData[typeElementId] = objectData;
        }
    }
}

export default Flow;
