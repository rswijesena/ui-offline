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
                isRequired: component.isRequired,
                pageComponentId: component.id,
                contentValue: null,
                objectData: null,
                contentType: manywho.component.contentTypes.string,
                isValid: true,
            };

            if (pageElement.pageConditions) {

                // Check component is listening for page condition
                // and return the page condition metadata if exists
                const assocCondition = PageConditions.checkForCondition(
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

                if (assocCondition !== undefined) {

                    // This is the value associated to the component that
                    // triggers the page condition
                    const leftValueElementToReference = assocCondition.pageRules[0].left.valueElementToReferenceId;

                    // This is the value that is used for checking equality
                    // against the current value of the trigger component
                    // (so when a scalar page condition is performed)
                    const rightValueElementToReference = assocCondition.pageRules[0].right.valueElementToReferenceId;
                    const leftpageObjectReferenceId = assocCondition.pageRules[0].left.pageObjectReferenceId;

                    let leftValueElementContentValue = null;
                    let rightValueElementContentValue = null;
                    let leftpageObjectReferenceValue = null;

                    if (assocCondition.pageRules.length === 1) {

                        if (request.invokeType === 'SYNC') {

                            // Get the values content value from state
                            leftValueElementContentValue = leftValueElementToReference ? getStateValue(
                                { id: leftValueElementToReference.id },
                                null,
                                'Boolean',
                                '',
                            ).contentValue
                            : null;

                            // However, the pageComponentInputResponses may
                            // contain a null content value for the value we want,
                            // in which case we will need to extract the
                            // default content value from our snapshot
                            if (leftValueElementContentValue === null) {
                                leftValueElementContentValue = leftValueElementToReference ? snapshot.getValue(
                                    { id: leftValueElementToReference.id },
                                ).defaultContentValue
                                : null;
                            }

                            rightValueElementContentValue = rightValueElementToReference ? snapshot.getValue(
                                { id: rightValueElementToReference.id },
                            ).defaultContentValue
                            : null;

                            leftpageObjectReferenceValue = request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses.find(
                                component => component.pageComponentId === leftpageObjectReferenceId,
                            ).contentValue;
                        } else {

                            // This is for handling when the user has gone into offline
                            // mode before hitting the page. We have no idea what the pageComponentInputResponses
                            // are so have to extract the value id from the metadata in our snapshot
                            leftValueElementContentValue = leftValueElementToReference ? snapshot.getValue(
                                { id: leftValueElementToReference.id },
                            ).defaultContentValue
                            : null;

                            rightValueElementContentValue = rightValueElementToReference ? snapshot.getValue(
                                { id: rightValueElementToReference.id },
                            ).defaultContentValue
                            : null;

                            const extractComponentValue = pageElement.pageComponents.find(
                                component => component.id === leftpageObjectReferenceId,
                            ).valueElementValueBindingReferenceId.id;
                            leftpageObjectReferenceValue = snapshot.getValue({ id: extractComponentValue });
                        }

                        try {

                            // Handling boolean page conditions
                            if (
                                typeof(leftValueElementContentValue) === 'boolean' ||
                                leftValueElementContentValue === 'False' ||
                                leftValueElementContentValue === 'false' ||
                                leftValueElementContentValue === 'true' ||
                                leftValueElementContentValue === 'True'
                            ) {
                                value = PageConditions.applyBooleanCondition(
                                    assocCondition,
                                    leftValueElementContentValue,
                                    snapshot,
                                    value,
                                );

                            // Handling scalar page conditions
                            } else if (
                                typeof(rightValueElementContentValue) === 'string' ||
                                typeof(rightValueElementContentValue) === 'number'
                            ) {

                                value = PageConditions.applyScalarCondition(
                                    assocCondition,
                                    leftpageObjectReferenceValue,
                                    rightValueElementContentValue,
                                    value,
                                );

                            // We will for now assume that any other content value type
                            // represents a more complex page condition
                            // TODO - perform further checks on page condition metadata
                            // to determine if is more advanced
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
