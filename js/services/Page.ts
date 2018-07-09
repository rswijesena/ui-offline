import { getStateValue } from '../models/State';
import { IState } from '../interfaces/IModels';

declare const manywho: any;

/**
 * Extract page container objects into new array
 * @param container
 */
export const getPageContainers = (container: any) => {
    if (container.pageContainers) {
        container.pageContainerResponses = container.pageContainers.map(getPageContainers);
        delete container.pageContainers;
    }
    return container;
};

/**
 * Create a new flattened array of page containers
 * @param containers
 * @param parent
 * @param result
 * @param propertyName
 */
export const flattenContainers = (containers: any[], parent: any, result: any[], propertyName: string) => {
    if (containers != null) {
        for (let index = 0; index < containers.length; index += 1) {
            const item = containers[index];

            if (parent) {
                item.parent = parent.id;
                parent.childCount = containers.length;
            }

            result.push(item);
            flattenContainers(item[propertyName], item, result, propertyName);
        }
    }

    return result;
};

/**
 * @param request 
 * @param mapElement 
 * @param state 
 * @param snapshot 
 */
export const generatePage = (request: any, mapElement: any, state: IState, snapshot: any) => {
    const pageElement = snapshot.metadata.pageElements.find(page => mapElement.pageElementId === page.id);

    let pageContainerDataResponses = [];
    if (pageElement.pageContainers) {
        pageContainerDataResponses = flattenContainers(pageElement.pageContainers, null, [], 'pageContainers').map((container) => {
            return {
                isEditable: true,
                isEnabled: true,
                isVisible: true,
                pageContainerId: container.id,
            };
        });
    }

    let pageComponentDataResponses = [];
    if (pageElement.pageComponents) {
        pageComponentDataResponses = pageElement.pageComponents.map((component) => {

            // TODO: Encapsulate into module
            if (request.invokeType === 'SYNC' && pageElement.pageConditions) {
                pageElement.pageConditions.forEach((pageCondition) => {
                    const hasCondition = pageCondition.pageOperations.find(
                        operation => operation.assignment.assignee.pageObjectReferenceId === component.id,
                    );
                    
                    if (hasCondition !== undefined) {
                        if (pageCondition.pageRules.length === 1) {
                            const booleanComponent = pageCondition.pageRules[0].left.pageObjectReferenceId;
                            const booleanComponentValue = request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses.find(
                                component => component.id === booleanComponent,
                            ).contentValue;
                            if (
                                typeof(booleanComponentValue) === 'boolean' ||
                                booleanComponentValue === 'false' // Engine returns false as a string...
                            ) {
                                // Nows we need to find the value to compare against
                                // which I think will always be a system bool value
                            }
                        }
                    }
                });

            }

            let selectedValue = null;
            let sourceValue = null;
            const value: any = {
                pageComponentId: component.id,
                contentValue: null,
                objectData: null,
                contentType: manywho.component.contentTypes.string,
                isVisible: true,
                isValid: true,
            };

            if (component.valueElementValueBindingReferenceId) {
                selectedValue = snapshot.getValue(component.valueElementValueBindingReferenceId);
                value.contentType = snapshot.getContentTypeForValue(component.valueElementValueBindingReferenceId);

                const stateValue = getStateValue(
                    component.valueElementValueBindingReferenceId,
                    selectedValue.typeElementId,
                    selectedValue.contentType,
                    '',
                );

                if (stateValue) {
                    selectedValue = stateValue;
                }
            }

            if (component.columns) {
                let typeElementId = null;
                if (component.objectDataRequest) {
                    typeElementId = component.objectDataRequest.typeElementId;
                } else if (component.valueElementDataBindingReferenceId) {
                    sourceValue = snapshot.getValue(component.valueElementDataBindingReferenceId);
                    typeElementId = sourceValue.typeElementId;

                    const stateValue = getStateValue(
                        component.valueElementDataBindingReferenceId,
                        sourceValue.typeElementId,
                        sourceValue.contentType,
                        '',
                    );
                    if (stateValue) {
                        sourceValue = stateValue;
                    }
                }

                if (typeElementId) {
                    const typeElement = snapshot.metadata.typeElements.find(element => element.id === typeElementId);
                    component.columns = component.columns.map((column) => {
                        column.developerName = typeElement.properties.find(prop => prop.id === column.typeElementPropertyId).developerName;
                        return column;
                    });
                }
            }

            if (selectedValue) {
                value.contentValue = selectedValue.contentValue || selectedValue.defaultContentValue;
            }

            if (sourceValue) {
                value.objectData = sourceValue.objectData || sourceValue.defaultObjectData;

                if (selectedValue.objectData && (sourceValue.objectData || sourceValue.defaultObjectData)) {
                    value.objectData = (sourceValue.objectData || sourceValue.defaultObjectData).map((objectData) => {
                        objectData.isSelected = !!selectedValue.objectData.find(
                            item => item.externalId === objectData.externalId && item.isSelected,
                        );
                        return objectData;
                    });
                }

            }

            return Object.assign(value, component, { attributes: component.attributes || {} });
        });
    }

    return {
        developerName: mapElement.developerName,
        mapElementId: mapElement.id,
        outcomeResponses: mapElement.outcomes,
        pageResponse: {
            pageContainerDataResponses,
            pageComponentDataResponses,
            pageContainerResponses: pageElement.pageContainers.map(getPageContainers),
            pageComponentResponses: pageElement.pageComponents,
        },
    };
};
