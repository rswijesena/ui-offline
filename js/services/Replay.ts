import Snapshot from './Snapshot';
import { generateObjectData } from './cache/ObjectDataCaching';
import { cacheObjectData, getFlowModel, getObjectData } from '../models/Flow';
import { IFlow } from '../interfaces/IModels';

declare const manywho;
// let inputResponseTotal = null;

/**
 * @param inputResponses page input responses from requests being replayed
 * @param responseIndex current index in array of input responses
 * @param flow the flow model in state
 * @param requests objectdata requests extracted from snapshot
 * @description
 */
/*const processInputResponse = (inputResponses: any, responseIndex: number, flow: IFlow, requests: any) => {
    const objectDataRequests = [];
    const responseToProcess = inputResponses[responseIndex];

    if (inputResponseQueue >= inputResponseTotal) {
        return Promise.resolve(requests);
    }

    if (responseToProcess.objectData && responseToProcess.objectData.length > 0 && responseToProcess.objectData[0].externalId === null) {

        const getObjectData = (requestIndex: number) => {
            if (requestIndex >= requests.length) {
                return;
            }

            requests[requestIndex].stateId = flow.state.id;
            objectDataRequests.push(manywho.ajax.dispatchObjectDataRequest(
                requests[requestIndex], flow.tenantId, flow.state.id, flow.authenticationToken, requests[requestIndex].listFilter.limit)

                .then((response) => {
                    if (response.objectData) {
                        cacheObjectData(response.objectData, requests[requestIndex].objectDataType.typeElementId);
                    }
                    return response;
                })
                .then(() => {
                    const newIndex = requestIndex + 1;
                    getObjectData(newIndex);
                })
                .fail(() => {
                    console.log('Failed!');
                }));
        };

        getObjectData(0);

        return Promise.all(objectDataRequests).then(() => {

            // The input responses object data can be modified
            // now that the object data memory cache has been fully updated
            const updatedFlowModel = getFlowModel();
            updatedFlowModel.objectData.forEach((obj) => {
                if (obj.internalId === responseToProcess.objectData[0].internalId) {
                    responseToProcess.objectData[0].externalId = obj.externalId;
                }
            });

            const newInputResponseIndex = inputResponseQueue + 1;
            processInputResponse(inputResponses, newInputResponseIndex, flow, requests);
        });
    }
};*/

/**
 * @param request the request being replayed
 * @description
 */
const Replay = (request: any, tenantId: string, authenticationToken: string, stateId: string) => {

    const url = `${manywho.settings.global('platform.uri')}/api/run/1/state/${stateId}/values/2cdb838d-24e7-4687-8a31-e24f7985d535`;
    const valueRequest = {
        headers: {
            ManyWhoTenant: tenantId,
        },
    };
    if (authenticationToken) {
        valueRequest.headers['Authorization'] = authenticationToken;
    }
    return fetch(url, valueRequest)
        .then((response) => {
            console.log(response);
            return response.json();
        })
        .then((response) => {
            return request;
        })
        .catch(response => console.error(response));

    /*return Promise.all(objectDataRequests).then(() => {
        const updatedFlowModel = getFlowModel();
        console.log(updatedFlowModel);
        console.log(request);
        inputResponses.forEach((inputResponse) => {
            if (inputResponse.objectData && inputResponse.objectData.length > 0 && inputResponse.objectData[0].externalId === null) {
                console.log(inputResponse);
                objectDataFromEngine.forEach((obj) => {
                    const currentInternalID = inputResponse.objectData[0].internalId;
                    if (obj.internalId === currentInternalID) {
                        inputResponse.objectData[0].externalId = obj.externalId;
                        console.log(currentInternalID + ' is equal to ' + obj.internalId);
                    }
                });
                console.log(inputResponse);
            }
        });
        console.log(request);
        return Promise.resolve(request);*/
        // The input responses object data can be modified
        // now that the object data memory cache has been fully updated
        /* const updatedFlowModel = getFlowModel();
        updatedFlowModel.objectData.forEach((obj) => {
            if (obj.internalId === responseToProcess.objectData[0].internalId) {
                responseToProcess.objectData[0].externalId = obj.externalId;
            }
        });

        const newInputResponseIndex = inputResponseQueue + 1;
        processInputResponse(inputResponses, newInputResponseIndex, flow, requests);
    });*/
};

export default Replay;
