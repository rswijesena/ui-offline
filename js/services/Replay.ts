import Snapshot from './Snapshot';

declare const manywho;
declare const metaData;

/**
 * @param request
 * @param stateId
 * @param tenantId
 * @param token
 * @description
 */
const Replay = (request: any, stateId: string, tenantId: string, token: string) => {

    const snapshot = Snapshot(metaData);
    const valuesInSnapshot = snapshot.metadata.valueElements;

    request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses.forEach((inputResponse) => {
        if (inputResponse.objectData && inputResponse.objectData.length > 0) {

            const assocValue = valuesInSnapshot.filter(value => value.typeElementId === inputResponse.objectData[0].typeElementId);

            if (assocValue) {

                const url = `${manywho.settings.global('platform.uri')}/api/run/1/state/${stateId}/values`;

                const request = {
                    headers: {
                        ManyWhoTenant: tenantId,
                    },
                };

                if (token) {
                    request.headers['Authorization'] = token;
                }

                return fetch(url, request)
                    .then((response) => {
                        return response.json();
                    })
                    .then((response) => {
                        const matchingValue = response.filter(value => value.id === assocValue.id);
                        return request;
                    })
                    .catch(response => console.error(response));
            }

            return Promise.resolve(request);
        }
    });

    return Promise.resolve(request);
};

export default Replay;
