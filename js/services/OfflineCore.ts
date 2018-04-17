import Flow from '../models/Flow';
import { metaData } from '../services/metadata';
import DataActions from './DataActions';
import ObjectData from './ObjectData';
import Operation from './Operation';
import Page from './Page';
import Rules from './Rules';
import Snapshot from './Snapshot';
import Step from './Step';
import { getOfflineData, removeOfflineData, setOfflineData } from './Storage';

import { clone, flatten, guid } from '../services/Utils';

declare const manywho: any;
declare const localforage: any;
declare const $: any;

function getObjectDataRequest(request) {
    const objectDataRequest: any = {
        authorization: null,
        configurationValues: null,
        command: null,
        culture: {
            id: null,
            developerName: null,
            developerSummary: null,
            brand: null,
            language: 'EN',
            country: 'USA',
            variant: null,
        },
        stateId: '00000000-0000-0000-0000-000000000000',
        token: null,
        listFilter: request.listFilter || {},
    };

    objectDataRequest.listFilter.limit = manywho.settings.global('offline.cache.requests.limit', null, 250);

    const typeElement = metaData.typeElements.find(element => element.id === request.typeElementId);

    objectDataRequest.typeElementBindingId = typeElement.bindings[0].id;
    objectDataRequest.objectDataType = {
        typeElementId: typeElement.id,
        developerName: typeElement.developerName,
        properties: typeElement.properties.map((property) => {
            return {
                developerName: property.developerName,
            };
        }),
    };

    return objectDataRequest;
}

function getChunkedObjectDataRequests(request) {
    const pageSize = manywho.settings.global('offline.cache.requests.pageSize', null, 10);
    const iterations = Math.ceil(request.listFilter.limit / pageSize);
    const pages = [];

    for (let i = 0; i < iterations; i += 1) {
        const page = clone(request);
        page.listFilter.limit = pageSize;
        page.listFilter.offset = i * pageSize;
        pages.push(page);
    }

    return pages;
}

manywho.settings.initialize({
    offline: {
        cache: {
            requests: {
                limit: 250,
                pageSize: 10,
            },
        },
    },
});

class OfflineCore {

    static requests = null;
    static isOffline = false;

    static initialize(tenantId, stateId, stateToken, authenticationToken) {
        if (!metaData) {
            return;
        }

        const objectDataRequests = {};

        if (metaData.pageElements) {
            metaData.pageElements.forEach((page) => {
                (page.pageComponents || [])
                    .filter(component => component.objectDataRequest)
                    .forEach(component => objectDataRequests[component.objectDataRequest.typeElementId] = component.objectDataRequest);
            });
        }

        if (metaData.mapElements) {
            metaData.mapElements.forEach((element) => {
                (element.dataActions || [])
                    .filter(action => manywho.utils.isEqual(action.crudOperationType, 'load', true) && action.objectDataRequest)
                    .forEach(action => objectDataRequests[action.objectDataRequest.typeElementId] = action.objectDataRequest);
            });
        }

        const requests = Object.keys(objectDataRequests)
            .map(key => objectDataRequests[key])
            .map(getObjectDataRequest)
            .map(getChunkedObjectDataRequests);

        this.requests = requests.concat.apply([], this.requests);

        const flow = {
            authenticationToken,
            tenantId,
            state: {
                id: stateId,
                token: stateToken,
            },
            id: metaData.id,
        };

        return removeOfflineData(stateId)
            .then(() => setOfflineData(flow))
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
        if (!this.requests || this.requests.length === 0) {
            return false;
        }

        const executeRequest = function (req, reqIndex, flow, currentTypeElementId, onProgress, onDone) {
            let requests = req;
            const index = reqIndex;

            if (index >= requests.length) {
                return setOfflineData(flow)
                    .then(onDone);
            }

            const request = requests[index];
            request.stateId = flow.state.id;

            return manywho.ajax.dispatchObjectDataRequest(request, flow.tenantId, flow.state.id, flow.authenticationToken, request.listFilter.limit)
                .then((response) => {
                    if (response.objectData) {
                        flow.cacheObjectData(response.objectData, request.objectDataType.typeElementId);
                    } else {
                        requests = requests.filter(item => !item.objectDataType.typeElementId === currentTypeElementId);
                    }

                    return response;
                })
                .then((response) => {
                    index + 1;
                    onProgress(index, requests.length);
                    executeRequest(requests, index, flow, currentTypeElementId, onProgress, onDone);
                });
        };
        executeRequest(this.requests, 0, flow, null, onProgress, onDone);
        return true;
    }

    static getResponse(context, event, urlPart, request, tenantId, stateId) {
        let flowStateId = stateId;
        if (request && request.stateId) {
            flowStateId = request.stateId;
        } else if (manywho.utils.isEqual(event, 'join', true)) {
            flowStateId = urlPart.substr(urlPart.lastIndexOf('/') + 1);
        } else if (manywho.utils.isEqual(event, 'initialization', true)) {
            flowStateId = '00000000-0000-0000-0000-000000000000';
        }

        return getOfflineData(flowStateId)
            .then((response) => {
                if (manywho.utils.isEqual(event, 'initialization')) {
                    const flow = new Flow({
                        tenantId,
                        state: {
                            currentMapElementId: metaData.mapElements.find(element => element.elementType === 'START').id,
                            id: stateId,
                            token: guid(),
                        },
                    });

                    return setOfflineData(flow)
                        .then(() => flow);
                }
                return new Flow(response);
            })
            .then((flow) => {
                if (manywho.utils.isEqual(event, 'join', true)) {
                    return this.getMapElementResponse(
                        {
                            invokeType: 'JOIN',
                            currentMapElementId: flow.state.currentMapElementId,
                        }, 
                        flow,
                        context,
                    );
                }
                if (manywho.utils.isEqual(event, 'initialization', true)) {
                    return this.getInitializationResponse(request, flow, context);
                }
                if (request.mapElementInvokeRequest) {
                    return this.getMapElementResponse(request, flow, context);
                }
                if (request.navigationElementId) {
                    return this.getNavigationResponse(request, flow, context);
                }
                return this.getObjectDataResponse(request, flow, context);
            });
    }

    static getInitializationResponse(request, flow, context) {
        const snapshot: any = new Snapshot(metaData);

        return {
            currentMapElementId: metaData.mapElements.find(element => element.elementType === 'START').id,
            currentStreamId: null,
            navigationElementReferences : snapshot.getNavigationElementReferences(),
            stateId: flow.state.id,
            stateToken: flow.state.token,
            statusCode: '200',
        };
    }

    static getMapElementResponse(request, flow, context) {
        if (!metaData) {
            return;
        }

        const deferred = $.Deferred();

        const mapElement: any = request.currentMapElementId ?
            metaData.mapElements.find(element => element.id === request.currentMapElementId) :
            metaData.mapElements.find(element => element.elementType === 'START');
        let nextMapElement = null;

        switch (request.invokeType.toUpperCase()) {
        case 'FORWARD':
            let nextMapElementId = null;
            let outcome = null;

            if (request.mapElementInvokeRequest.selectedOutcomeId) {
                outcome = mapElement.outcomes.find(item => item.id === request.mapElementInvokeRequest.selectedOutcomeId);
            } else if (request.selectedMapElementId) {
                nextMapElementId = request.selectedMapElementId;
            } else {
                outcome = mapElement.outcomes[0];
            }

            if (outcome) {
                nextMapElementId = outcome.nextMapElementId;
            }

            nextMapElement = metaData.mapElements.find(element => element.id === nextMapElementId);
            break;

        case 'NAVIGATE':
            const navigation = metaData.navigationElements.find(element => element.id === request.navigationElementId);
            const navigationItem = navigation.navigationItems.find(item => item.id === request.selectedNavigationItemId);
            nextMapElement = metaData.mapElements.find(element => element.id === navigationItem.locationMapElementId);
            break;

        case 'JOIN':
            nextMapElement = mapElement;
            break;
        }

        const snapshot: any = new Snapshot(metaData);
        let pageResponse = null;

        if (manywho.utils.isEqual(mapElement.elementType, 'input', true) || manywho.utils.isEqual(mapElement.elementType, 'step', true)) {
            flow.addRequest(request, snapshot);
        }

        if (mapElement.elementType === 'input'
            && request.mapElementInvokeRequest
            && request.mapElementInvokeRequest.pageRequest
            && request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses) {
            flow.state.update(request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses, mapElement, snapshot);
        }

        if (nextMapElement.dataActions) {
            nextMapElement.dataActions
                .filter(action => !action.disabled)
                .sort((a, b) => a.order - b.order)
                .forEach((action) => {
                    DataActions.execute(action, flow, snapshot);
                });
        }

        if (nextMapElement.operations) {
            nextMapElement.operations
                .sort((a, b) => a.order - b.order)
                .forEach((operation) => {
                    Operation.execute(operation, flow.state, snapshot);
                });
        }

        if (nextMapElement.elementType === 'step') {
            pageResponse = Step.generate(nextMapElement);
        } else if (nextMapElement.elementType === 'input') {
            pageResponse = Page.generate(request, nextMapElement, flow.state, snapshot);
        } else if (!nextMapElement.outcomes || nextMapElement.outcomes.length === 0) {
            pageResponse = {
                developerName: 'done',
                mapElementId: nextMapElement.id,
            };
        }

        if (nextMapElement.outcomes && !pageResponse) { 
            return setOfflineData(flow)
                .then(() => {
                    return OfflineCore.getResponse(
                        context,null, null,
                        {
                            currentMapElementId: nextMapElement.id,
                            mapElementInvokeRequest: {
                                selectedOutcomeId: Rules.getOutcome(nextMapElement.outcomes, flow.state, snapshot).id,
                            },
                            invokeType: 'FORWARD',
                            stateId: request.stateId,
                        }, 
                        request.tenantId, 
                        request.stateId,
                    );
                });
        }

        flow.state.currentMapElementId = nextMapElement.id;
        setOfflineData(flow);

        return {
            currentMapElementId: nextMapElement.id,
            invokeType: nextMapElement.outcomes ? 'FORWARD' : 'DONE',
            mapElementInvokeResponses: [pageResponse],
            navigationElementReferences: snapshot.getNavigationElementReferences(),
            stateId: request.stateId,
            stateToken: request.stateToken,
            statusCode: '200',
        };
    }

    static getObjectDataResponse(request, flow, context) {
        return ObjectData.filter(flow.getObjectData(request.objectDataType.typeElementId), request.listFilter);
    }

    static getNavigationResponse(request, flow, context) {
        if (!metaData) {
            return;
        }

        const navigation = metaData.navigationElements[0];
        return {
            developerName: navigation.developerName,
            isEnabled: true,
            isVisible: true,
            label: navigation.label,
            navigationItemResponses: navigation.navigationItems,
            navigationItemDataResponses: flatten(navigation.navigationItems, null, [], 'navigationItems', null).map((item) => {
                return {
                    navigationItemId: item.id,
                    navigationItemDeveloperName: item.developerName,
                    isActive: false,
                    isCurrent: item.locationMapElementId === flow.currentMapElementId,
                    isEnabled: true,
                    isVisible: true,
                    locationMapElementId: item.locationMapElementId,
                };
            }),
        };
    }
}

export default OfflineCore;
