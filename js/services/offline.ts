/// <reference path="../../typings/index.d.ts" />

import Flow from '../models/flow';
import {get, remove, set} from './storage';

declare var manywho: any;
declare var localforage: LocalForage;

function getObjectDataRequest(request) {
    const objectDataRequest: any = {
        authorization: null,
        configurationValues: null,
        command: null,
        culture: {
            'id': null,
            'developerName': null,
            'developerSummary': null,
            'brand': null,
            'language': 'EN',
            'country': 'USA',
            'variant': null
        },
        stateId: '00000000-0000-0000-0000-000000000000',
        token: null,
        listFilter: request.listFilter || {}
    };

    objectDataRequest.listFilter.limit = manywho.settings.global('offline.cache.requests.limit', null, 250);

    const typeElement = manywho.offline.metadata.typeElements.find(element => element.id === request.typeElementId);

    objectDataRequest.typeElementBindingId = typeElement.bindings[0].id;
    objectDataRequest.objectDataType = {
        typeElementId: typeElement.id,
        developerName: typeElement.developerName,
        properties: typeElement.properties.map(property => {
            return {
                developerName: property.developerName
            };
        })
    };

    return objectDataRequest;
}

function getChunkedObjectDataRequests(request) {
    const pageSize = manywho.settings.global('offline.cache.requests.pageSize', null, 10);
    const iterations = Math.ceil(request.listFilter.limit / pageSize);
    const pages = [];

    for (let i = 0; i < iterations; i++) {
        const page = manywho.utils.clone(request);
        page.listFilter.limit = pageSize;
        page.listFilter.offset = i * pageSize;
        pages.push(page);
    }

    return pages;
}

manywho.settings.initialize({
    offline: {
        isEnabled: true,
        cache: {
            requests: {
                limit: 250,
                pageSize: 10
            }
        },
        storage: {
            drivers: ['asyncStorage', 'webSQLStorage']
        }
    }
});

class Offline {

    static metadata: any = null;
    static requests = null;
    static isOffline = false;

    static initialize(tenantId, stateId, stateToken, authenticationToken) {
        if (!manywho.offline.metadata)
            return;

        let objectDataRequests = {};

        if (manywho.offline.metadata.pageElements)
            manywho.offline.metadata.pageElements.forEach(page => {
                (page.pageComponents || [])
                    .filter(component => component.objectDataRequest)
                    .forEach(component => objectDataRequests[component.objectDataRequest.typeElementId] = component.objectDataRequest);
            });

        if (manywho.offline.metadata.mapElements)
            manywho.offline.metadata.mapElements.forEach(element => {
                (element.dataActions || [])
                    .filter(action => manywho.utils.isEqual(action.crudOperationType, 'load', true) && action.objectDataRequest)
                    .forEach(action => objectDataRequests[action.objectDataRequest.typeElementId] = action.objectDataRequest);
            });

        manywho.offline.requests = Object.keys(objectDataRequests)
            .map(key => objectDataRequests[key])
            .map(getObjectDataRequest)
            .map(getChunkedObjectDataRequests);

        manywho.offline.requests = manywho.offline.requests.concat.apply([], manywho.offline.requests);

        const flow = {
            authenticationToken,
            tenantId,
            state: {
                id: stateId,
                token: stateToken
            },
            id: manywho.offline.metadata.id
        };

        return remove(stateId)
            .then(() => set(flow))
            .then(() => new Flow(flow));
    }

    static rejoin(flowKey) {
        const tenantId = manywho.utils.extractTenantId(flowKey);
        const flowId = manywho.utils.extractFlowId(flowKey);
        const flowVersionId = manywho.utils.extractFlowVersionId(flowKey);
        const element = manywho.utils.extractElement(flowKey);
        const stateId = manywho.utils.extractStateId(flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(stateId);

        return manywho.engine.join(tenantId, flowId, flowVersionId, element, stateId, authenticationToken, manywho.settings.flow(null, flowKey));
    }

    static cacheObjectData(flow, onProgress, onDone) {
        if (!manywho.offline.requests || manywho.offline.requests.length === 0)
            return false;

        const executeRequest = function(requests, index, flow, currentTypeElementId, onProgress, onDone) {
            if (index >= requests.length)
                return manywho.offline.storage.set(flow)
                    .then(onDone);

            let request = requests[index];
            request.stateId = flow.state.id;

            return manywho.ajax.dispatchObjectDataRequest(request, flow.tenantId, flow.state.id, flow.authenticationToken, request.listFilter.limit)
                .then(response => {
                    if (response.objectData)
                        flow.cacheObjectData(response.objectData, request.objectDataType.typeElementId);
                    else
                        requests = requests.filter(item => !item.objectDataType.typeElementId === currentTypeElementId);

                    return response;
                })
                .then(response => {
                    index++;
                    onProgress(index, requests.length);
                    executeRequest(requests, index, flow, currentTypeElementId, onProgress, onDone);
                });
        };

        executeRequest(manywho.offline.requests, 0, flow, null, onProgress, onDone);

        return true;
    }

    static getResponse(context, event, urlPart, request, tenantId, stateId) {
        if (request && request.stateId)
            stateId = request.stateId;
        else if (manywho.utils.isEqual(event, 'join', true))
            stateId = urlPart.substr(urlPart.lastIndexOf('/') + 1);
        else if (manywho.utils.isEqual(event, 'initialization', true))
            stateId = '00000000-0000-0000-0000-000000000000';

        return manywho.offline.storage.get(stateId)
            .then(response => {
                if (manywho.utils.isEqual(event, 'initialization')) {
                    const flow = new manywho.offline.flow({
                        tenantId: tenantId,
                        state: {
                            currentMapElementId: manywho.offline.metadata.mapElements.find(element => element.elementType === 'START').id,
                            id: stateId,
                            token: manywho.utils.guid()
                        }
                    });

                    return manywho.offline.storage.set(flow)
                        .then(() => flow);
                }
                else
                    return new manywho.offline.flow(response);
            })
            .then(flow => {
                if (manywho.utils.isEqual(event, 'join', true))
                    return manywho.offline.getMapElementResponse({
                        invokeType: 'JOIN',
                        currentMapElementId: flow.state.currentMapElementId,
                    }, flow, context);
                else if (manywho.utils.isEqual(event, 'initialization', true))
                    return manywho.offline.getInitializationResponse(request, flow, context);
                else if (request.mapElementInvokeRequest)
                    return manywho.offline.getMapElementResponse(request, flow, context);
                else if (request.navigationElementId)
                    return manywho.offline.getNavigationResponse(request, flow, context);
                else
                    return manywho.offline.getObjectDataResponse(request, flow, context);
            });
    }

    static getInitializationResponse(request, flow, context) {
        const snapshot = new manywho.offline.snapshot(manywho.offline.metadata);

        return {
            currentMapElementId: manywho.offline.metadata.mapElements.find(element => element.elementType === 'START').id,
            currentStreamId: null,
            navigationElementReferences : snapshot.getNavigationElementReferences(),
            stateId: flow.state.id,
            stateToken: flow.state.token,
            statusCode: '200'
        };
    }

    static getMapElementResponse(request, flow, context) {
        if (!manywho.offline.metadata)
            return;

        const deferred = $.Deferred();

        let mapElement = request.currentMapElementId ?
            manywho.offline.metadata.mapElements.find(element => element.id === request.currentMapElementId) :
            manywho.offline.metadata.mapElements.find(element => element.elementType === 'START');
        let nextMapElement = null;

        switch (request.invokeType.toUpperCase()) {
            case 'FORWARD':
                let nextMapElementId = null;
                let outcome = null;

                if (request.mapElementInvokeRequest.selectedOutcomeId)
                    outcome = mapElement.outcomes.find(item => item.id === request.mapElementInvokeRequest.selectedOutcomeId);
                else if (request.selectedMapElementId)
                    nextMapElementId = request.selectedMapElementId;
                else
                    outcome = mapElement.outcomes[0];

                if (outcome)
                    nextMapElementId = outcome.nextMapElementId;

                nextMapElement = manywho.offline.metadata.mapElements.find(element => element.id === nextMapElementId);
                break;

            case 'NAVIGATE':
                const navigation = manywho.offline.metadata.navigationElements.find(element => element.id === request.navigationElementId);
                const navigationItem = navigation.navigationItems.find(item => item.id === request.selectedNavigationItemId);
                nextMapElement = manywho.offline.metadata.mapElements.find(element => element.id === navigationItem.locationMapElementId);
                break;

            case 'JOIN':
                nextMapElement = mapElement;
                break;
        }

        let snapshot = new manywho.offline.snapshot(manywho.offline.metadata);
        let pageResponse = null;

        if (manywho.utils.isEqual(mapElement.elementType, 'input', true) || manywho.utils.isEqual(mapElement.elementType, 'step', true))
            flow.addRequest(request, snapshot);

        if (mapElement.elementType === 'input'
            && request.mapElementInvokeRequest
            && request.mapElementInvokeRequest.pageRequest
            && request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses)
            flow.state.update(request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses, mapElement, snapshot);

        if (nextMapElement.dataActions)
            nextMapElement.dataActions
                .filter(action => !action.disabled)
                .sort((a, b) => a.order - b.order)
                .forEach(action => {
                    manywho.offline.dataActions.execute(action, flow, snapshot);
                });

        if (nextMapElement.operations)
            nextMapElement.operations
                .sort((a, b) => a.order - b.order)
                .forEach(operation => {
                    manywho.offline.operation.execute(operation, flow.state, snapshot);
                });

        if (nextMapElement.elementType === 'step')
            pageResponse = manywho.offline.step.generate(nextMapElement);
        else if (nextMapElement.elementType === 'input')
            pageResponse = manywho.offline.page.generate(request, nextMapElement, flow.state, snapshot);
        else if (!nextMapElement.outcomes || nextMapElement.outcomes.length === 0)
            pageResponse = {
                developerName: 'done',
                mapElementId: nextMapElement.id,
            };

        if (nextMapElement.outcomes && !pageResponse)
            return manywho.offline.storage.set(flow)
                .then(() => {
                    return manywho.offline.getResponse(context, null, null, {
                        currentMapElementId: nextMapElement.id,
                        mapElementInvokeRequest: {
                            selectedOutcomeId: manywho.offline.rules.getOutcome(nextMapElement.outcomes, flow.state, snapshot).id
                        },
                        invokeType: 'FORWARD',
                        stateId: request.stateId
                    });
                });
        else {
            flow.state.currentMapElementId = nextMapElement.id;
            manywho.offline.storage.set(flow);

            return {
                currentMapElementId: nextMapElement.id,
                invokeType: nextMapElement.outcomes ? 'FORWARD' : 'DONE',
                mapElementInvokeResponses: [pageResponse],
                navigationElementReferences: snapshot.getNavigationElementReferences(),
                stateId: request.stateId,
                stateToken: request.stateToken,
                statusCode: '200'
            };
        }
    }

    static getObjectDataResponse(request, flow, context) {
        return manywho.offline.objectdata.filter(flow.getObjectData(request.objectDataType.typeElementId), request.listFilter);
    }

    static getNavigationResponse(request, flow, context) {
        if (!manywho.offline.metadata)
            return;

        const navigation = manywho.offline.metadata.navigationElements[0];
        return {
            developerName: navigation.developerName,
            isEnabled: true,
            isVisible: true,
            label: navigation.label,
            navigationItemResponses: navigation.navigationItems,
            navigationItemDataResponses: manywho.utils.flatten(navigation.navigationItems, null, [], 'navigationItems', null).map(item => {
                return {
                    navigationItemId: item.id,
                    navigationItemDeveloperName: item.developerName,
                    isActive: false,
                    isCurrent: item.locationMapElementId === flow.currentMapElementId,
                    isEnabled: true,
                    isVisible: true,
                    locationMapElementId: item.locationMapElementId
                };
            })
        };
    }
};

export default Offline;
