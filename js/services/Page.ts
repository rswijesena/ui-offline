import { getStateValue } from '../models/State';
import { IState } from '../interfaces/IModels';
import PageConditions from './PageConditions';

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
 * @param tenantId
 */
export const generatePage = function (request: any, mapElement: any, state: IState, snapshot: any, tenantId: String) {
    const pageElement = snapshot.metadata.pageElements.find(page => mapElement.pageElementId === page.id);

    const flowKey = manywho.utils.getFlowKey(
        tenantId,
        snapshot.metadata.id.id,
        snapshot.metadata.id.versionId,
        state.id,
        'main',
    );

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

            let value: any = {
                isVisible: true,
                isEnabled: true,
                isRequired: true,
                pageComponentId: component.id,
                contentValue: null,
                objectData: null,
                contentType: manywho.component.contentTypes.string,
                isValid: true,
            };

            if (pageElement.pageConditions) {

                // Check component is listening for page condition
                const hasCondition = PageConditions.checkForCondition(
                    pageElement.pageConditions,
                    component.id,
                );

                // Check component triggers a page condition
                const hasEvents = PageConditions.checkForEvents(
                    pageElement.pageConditions,
                    component.id,
                );

                // If a component triggers a page condition
                // then the components metadata stored in state
                // needs to have the hasEvents property as a flag
                // so the ui knows to make a syncronisation call
                // to the engine.
                if (hasEvents !== undefined) {
                    component['hasEvents'] = true;
                } else {
                    component['hasEvents'] = false;
                }

                pageElement.pageConditions.forEach((pageCondition) => {

                    if (hasCondition !== undefined) {
                        if (pageCondition.pageRules.length === 1) {

                            let booleanComponentValue = null;
                            let booleanComponent = null;

                            if (request.invokeType === 'SYNC') {
                                booleanComponent = pageCondition.pageRules[0].left.pageObjectReferenceId;
                                booleanComponentValue = request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses.find(
                                    component => component.pageComponentId === booleanComponent,
                                ).contentValue;
                            } else {
                                // This is for handling when the user has gone into offline
                                // mode before hitting the page. We have no idea what the pageComponentInputResponses
                                // are so have to extract the value id from the metadata in our snapshot
                                booleanComponent = pageCondition.pageRules[0].left.valueElementToReferenceId.id;
                                booleanComponentValue = snapshot.getValue({ id:booleanComponent }).defaultContentValue;
                            }

                            try {
                                if (
                                    typeof(booleanComponentValue) === 'boolean' || // Currently, only boolean page conditions are supported
                                    booleanComponentValue === 'False' ||
                                    booleanComponentValue === 'false' ||
                                    booleanComponentValue === 'true' ||
                                    booleanComponentValue === 'True'
                                ) {
                                    value = PageConditions.applyBooleanCondition(
                                        pageCondition,
                                        booleanComponentValue,
                                        snapshot,
                                        value,
                                    );
                                } else {
                                    const errorMsg = `${component.developerName} has an unsupported page condition`;

                                    console.error(errorMsg);
                                    if (manywho.settings.isDebugEnabled(flowKey)) {
                                        throw new Error(errorMsg);
                                    }
                                }

                            } catch (error) {
                                manywho.model.addNotification(flowKey, {
                                    message: error.message,
                                    position: 'center',
                                    type: 'warning',
                                    timeout: 0,
                                    dismissible: true,
                                });
                            }
                        }
                    }
                });

            }

            let selectedValue = null;
            let sourceValue = null;

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

            return Object.assign(component, value, { attributes: component.attributes || {} });
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
