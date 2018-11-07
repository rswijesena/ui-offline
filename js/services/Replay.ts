import Snapshot from './Snapshot';
import { generateObjectData } from './cache/ObjectDataCaching';
import { cacheObjectData, getFlowModel, getObjectData } from '../models/Flow';
import { IFlow } from '../interfaces/IModels';

declare const manywho;
declare let inputResponseQueue;
declare let inputResponseTotal;

const processInputResponse = (inputResponses, responseIndex, flow: IFlow, requests) => {
    const objectDataRequests = [];
    const responseToProcess = inputResponses[responseIndex];

    if (inputResponseQueue >= inputResponseTotal) {
        return Promise.resolve(requests);
    }

    if (responseToProcess.objectData && responseToProcess.objectData.length > 0) {

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

        Promise.all(objectDataRequests).then(() => {

            // The input responses object data can be modified
            // now that the object data cache has been fully updated
            const updatedFlowModel = getFlowModel();
            updatedFlowModel.objectData.forEach((obj) => {
                if (obj.internalId === responseToProcess.objectData[0].internalId) {
                    responseToProcess.objectData[0].externalId = obj.externalId;
                }
            });
            processInputResponse(inputResponses, inputResponseQueue + 1, flow, requests);
        });
    }
};

/**
 * @param request
 * @param stateId
 * @param tenantId
 * @param token
 * @description
 */
const Replay = (request: any) => {

    const flow = getFlowModel();
    const requests = generateObjectData();

    const inputResponses = request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses;
    inputResponseTotal = inputResponses.length;
    inputResponseQueue = 0;

    return processInputResponse(inputResponses, inputResponseQueue, flow, requests)
        .then((response) => {
            return Promise.resolve(request);
        });
};

export default Replay;
