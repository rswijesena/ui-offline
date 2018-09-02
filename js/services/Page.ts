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

                // PAGE CONDITIONS OVERHAUL
                const CRITERIA = {
                    isEmpty: 'IS_EMPTY',
                    isEqual: 'EQUAL',
                    isNotEqual: 'NOT_EQUAL',
                };

                // First check to see if this component is a component
                // listening for a condition i.e. has an operation
                // associated to it
                const assocCondition = PageConditions.checkForCondition(
                    pageElement.pageConditions,
                    component.id,
                );

                // If it does then do the following:
                if (assocCondition !== undefined && assocCondition.pageRules.length === 1 && assocCondition.pageOperations.length === 1) {
                    const pageRule = assocCondition.pageRules[0];
                    const pageOperation = assocCondition.pageOperations[0];

                    // Get the criteria type
                    const criteriaType = pageRule.criteriaType;

                    // Get the metadata type
                    const metaDataType = pageOperation.assignment.assignee.metadataType;

                    if (!criteriaType || !metaDataType) {
                        throw new Error('Check you have added a criteria and/or a metadata type value');
                    }

                    // Find the value of the trigger component
                    // This is the value that we want to update in state
                    // First check if it alreasdy exists in state,
                    // if it doesnt retreive content value from snapshot
                    const triggerComponentValueId = pageRule.left.valueElementToReferenceId.id;
                    let triggerComponentValueObject = null;
                    const triggerComponentValueFromState = getStateValue(
                        triggerComponentValueId,
                        null,
                        null,
                        null,
                    );

                    if (triggerComponentValueFromState) {
                        triggerComponentValueObject = triggerComponentValueFromState.contentValue;
                    } else {
                        triggerComponentValueObject = snapshot.getValue(
                            triggerComponentValueId,
                        );
                    }

                    if (!triggerComponentValueObject) {
                        throw new Error(`Cannot find a value for component - ${component.developerName}`);
                    }

                    // We also want the value that we are comparing it too
                    // (the "right" property of the page rule)
                    // This is static so we always extract the content value
                    // from the snapshot
                    const valueComparableId = pageRule.right.valueElementToReferenceId.id;
                    const valueComparable = snapshot.getValue(
                        valueComparableId,
                    );

                    if (!valueComparable) {
                        throw new Error(`Cannot find a value to compare`);
                    }

                    // Now compare the two values for equality
                    // Update the trigger components value in state
                    // Then send the result to the "page operation"
                    let pageRuleResult = undefined;

                    switch (criteriaType) {

                    case CRITERIA.isEqual:
                        if (triggerComponentValueObject.contentValue === valueComparable.contentValue) {
                            pageRuleResult = true;
                        } else {
                            pageRuleResult = false;
                        }
                        break;
                    case CRITERIA.isNotEqual:
                        if (triggerComponentValueObject.contentValue !== valueComparable.contentValue) {
                            pageRuleResult = true;
                        } else {
                            pageRuleResult = false;
                        }
                        break;
                    }

                    // TODO - set value in state to new content value

                    // PERFORM THE OPERATION
                    // We need the assignor value, this should be extracted from
                    // the snapshot
                    // Now we need to compare the equality of the result from the page
                    // rule equality check with the assignor value
                    // The result of which (true or false)
                    // we then apply to the assignee components relevant metadata property
                    // based on the metadata type e.g isVisible etc
                }
                // PAGE CONDITIONS OVERHAUL FINISH

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

                // It's possible to have multiple page rules,
                // but offline will only support conditions
                // with one rule to start with
                if (assocCondition !== undefined && assocCondition.pageRules.length === 1) {

                    // Theres a bunch of component/value ID's and metadata
                    // that need to be extracted from the page condition metadata/flow snapshot/state,
                    // we do this here and return everything needed as key value pairs
                    const conditionMeta: any = PageConditions.extractPageConditionValues(
                        assocCondition,
                        pageElement,
                        request,
                        snapshot,
                    );

                    try {

                        // Handling boolean page conditions
                        if (
                            typeof(conditionMeta.leftValueElementContentValue) === 'boolean' ||
                            conditionMeta.leftValueElementContentValue === 'False' ||
                            conditionMeta.leftValueElementContentValue === 'false' ||
                            conditionMeta.leftValueElementContentValue === 'true' ||
                            conditionMeta.leftValueElementContentValue === 'True'
                        ) {
                            value = PageConditions.applyBooleanCondition(
                                assocCondition,
                                conditionMeta.leftValueElementContentValue,
                                snapshot,
                                value,
                                request.invokeType,
                                conditionMeta.metaDataType,
                                conditionMeta.pageOpAssigeeComponent,
                                conditionMeta.pageOpAssigneeValue,
                            );

                        // Handling scalar page conditions
                        } else if (
                            typeof(conditionMeta.rightValueElementContentValue) === 'string' ||
                            typeof(conditionMeta.rightValueElementContentValue) === 'number'
                        ) {

                            value = PageConditions.applyScalarCondition(
                                conditionMeta.leftpageObjectReferenceValue,
                                conditionMeta.rightValueElementContentValue,
                                value,
                                request.invokeType,
                                conditionMeta.metaDataType,
                                conditionMeta.criteria,
                                conditionMeta.pageOpAssigeeComponent,
                                conditionMeta.pageOpAssigneeValue,
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
