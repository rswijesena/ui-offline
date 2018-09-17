import { getStateValue } from '../models/State';

interface IMapElement {
    developerName: string;
    id: string;
    outcomes: Object;
    userContent: string;
}

/**
 * Support for flow steps whilst flow is offline
 */
const Step = {

    /**
     * @param mapElement
     * @param snapshot
     */
    generate(mapElement: IMapElement, snapshot) {

        /**
         * @param content text that a builder has added into the step
         * @description for replacing value references inside a step with
         * the value content values
         */
        const checkContentForValues = (content: string) => {
            let contentCopy = content;

            // Check for any value references (these are wrapped in square brackets)
            const valueNames = content.match(/{([^}]*)}/g);
            if (valueNames && valueNames.length > 0) {

                // For every value reference, retrieve the value
                // from the flow snaphot
                valueNames.forEach((valueName) => {
                    const valueObject = snapshot.getValueByName(
                        valueName.split('.')[0].replace(/[^a-zA-Z0-9 ]/g, ''), // this is for when a value property is referenced
                    );
                    const currentValue = getStateValue(
                        { id: valueObject.id },
                        null,
                        valueObject.contentType,
                        '',
                    );
                    if (valueObject.contentType === 'ContentObject') {

                        // If an object value is being referenced then the
                        // correct property content value needs to be extracted
                        const property = currentValue.objectData[0].properties.find(
                            property => property.developerName === valueName.split('.')[1].replace(/[^a-zA-Z0-9 ]/g, ''),
                        );
                        contentCopy = contentCopy.replace(valueName, property.contentValue);
                    }
                    contentCopy = contentCopy.replace(valueName, currentValue.contentValue);
                });
                if (contentCopy.indexOf('undefined') !== -1) {
                    return '';
                }
                return contentCopy;
            }

            return content;
        };

        const containerId = '09c5cb4f-3e7e-4f76-98a7-f6287a33043f';
        const componentId = '98a76ab7-4852-4093-9472-fc1c44283510';

        return {
            developerName: mapElement.developerName,
            mapElementId: mapElement.id,
            outcomeResponses: mapElement.outcomes,
            pageResponse: {
                pageContainerResponses: [
                    {
                        containerType: 'VERTICAL_FLOW',
                        developerName: 'Step',
                        id: containerId,
                    },
                ],
                pageComponentResponses: [
                    {
                        componentType: 'PRESENTATION',
                        developerName: 'Step Content',
                        id: componentId,
                        pageContainerId: containerId,
                        pageContainerDeveloperName: 'Step',
                    },
                ],
                pageContainerDataResponses: [
                    {
                        pageContainerId: containerId,
                        isEnabled: true,
                        isVisible: true,
                        isEditable: true,
                    },
                ],
                pageComponentDataResponses: [
                    {
                        pageComponentId: componentId,
                        isVisible: true,
                        isEnabled: true,
                        content: checkContentForValues(mapElement.userContent),
                    },
                ],
            },
        };
    },
};

export default Step;
