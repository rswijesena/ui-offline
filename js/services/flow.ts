/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.flow = class Flow {

    authenticationToken = null;
    objectData = null;
    requests = null;
    state = null;
    tenantId = null;

    constructor(flow) {
        this.authenticationToken = flow.authenticationToken;
        this.objectData = flow.objectData || {};
        this.requests = flow.requests || [];
        this.tenantId = flow.tenantId;
        this.state = new manywho.offline.state(flow.state);
    }

    addRequest(request, snapshot) {
        request.key = this.requests.length;
        request.currentMapElementDeveloperName = snapshot.metadata.mapElements.find(element => element.id === request.currentMapElementId).developerName;
        this.requests.push(request);
    }

    removeRequest(request) {
        const index = this.requests.indexOf(request);
        this.requests.splice(index, 1);
    }

    removeRequests() {
        this.requests = [];
    }

    getObjectData(typeElementId) {
        return this.objectData[typeElementId];
    }

    cacheObjectData(objectData, typeElementId) {
        if (this.objectData[typeElementId])
            this.objectData[typeElementId] = this.objectData[typeElementId].concat(objectData);
        else
            this.objectData[typeElementId] = objectData;
    }

};
