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
        // delete container.pageContainers;
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

                let pageRuleResult = undefined;
                let pageOperationResult = undefined;
                let triggerComponentContentValue = undefined;

                // PAGE CONDITIONS OVERHAUL
                const CRITERIA = {
                    isEmpty: 'IS_EMPTY',
                    isEqual: 'EQUAL',
                    isNotEqual: 'NOT_EQUAL',
                };

                const METADATA_TYPES = {
                    visible: 'METADATA.VISIBLE',
                    required: 'METADATA.REQUIRED',
                    enabled: 'METADATA.ENABLED',
                };

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
                    const criteriaType = pageRule.criteriaType;
                    const metaDataType = pageOperation.assignment.assignee.metadataType;

                    if (!criteriaType || !metaDataType) {
                        throw new Error('Check you have added a criteria and/or a metadata type value');
                    }

                    // First check to see if the most upda to date contnent value for
                    // the trigger component can be found in the offline state
                    const triggerComponent = pageElement.pageComponents.find(component => component.id === pageRule.left.pageObjectReferenceId);
                    const triggerComponentValueObject = getStateValue(
                        { id: triggerComponent.valueElementValueBindingReferenceId.id },
                        null,
                        null,
                        null,
                    );

                    // If is in state then grab the content value property
                    if (triggerComponentValueObject) {
                        triggerComponentContentValue = triggerComponentValueObject.contentValue;
                    }

                    // If value was not found in state then extract the default
                    // content value from the flow snapshot
                    if (typeof triggerComponentContentValue === 'undefined' || triggerComponentContentValue === null) {
                        const snapshotValue = snapshot.getValue(
                            { id: triggerComponent.valueElementValueBindingReferenceId.id },
                        );
                        triggerComponentContentValue = snapshotValue.defaultContentValue;
                    }

                    // If the components value has object data then we want to extract
                    // the appropriate propertiesw content value and use that for comparing
                    if (
                        triggerComponentValueObject &&
                        triggerComponentValueObject.objectData &&
                        triggerComponentValueObject.objectData.length > 0
                    ) {
                        triggerComponentContentValue = triggerComponentValueObject.objectData[0].properties.find(
                            property => property.typeElementPropertyId ===
                            pageRule.left.valueElementToReferenceId.typeElementPropertyId,
                        ).contentValue;
                    }

                    if (typeof triggerComponentContentValue === 'undefined') {
                        throw new Error(`Cannot find a trigger component content value`);
                    }

                    // We also want the value that we are comparing it too
                    // (the "right" property of the page rule)
                    // This is static so we always extract the content value
                    // from the snapshot
                    const valueComparableId = pageRule.right.valueElementToReferenceId.id;
                    const valueComparable = snapshot.getValue(
                        { id: valueComparableId },
                    );

                    if (!valueComparable) {
                        throw new Error(`Cannot find a value to compare`);
                    }

                    // Now compare the two values (so this is the left and the right values)
                    switch (criteriaType) {

                    case CRITERIA.isEqual:
                        if (
                            String(triggerComponentContentValue).toUpperCase() ===
                            String(valueComparable.defaultContentValue).toUpperCase()
                        ) {
                            pageRuleResult = true;
                        } else {
                            pageRuleResult = false;
                        }
                        break;
                    case CRITERIA.isNotEqual:
                        if (
                            String(triggerComponentContentValue).toUpperCase() !==
                            String(valueComparable.defaultContentValue).toUpperCase()
                        ) {
                            pageRuleResult = true;
                        } else {
                            pageRuleResult = false;
                        }
                        break;
                    }

                    // We need the assignor value, this should be
                    // extracted from the snapshot
                    const assignorValueId = pageOperation.assignment.assignor.valueElementToReferenceId.id;
                    const assignorValue = snapshot.getValue(
                        { id: assignorValueId },
                    );

                    if (!assignorValue) {
                        throw new Error(`Cannot find an assignor value value for operation`);
                    }

                    // Now we need to compare the equality of the result from the page
                    // rule equality check with the assignor value
                    // The result of which should be a boolean
                    if (typeof pageRuleResult !== 'undefined') {
                        if (
                            assignorValue.defaultContentValue.toUpperCase() ===
                            String(pageRuleResult).toUpperCase()
                        ) {
                            pageOperationResult = true;
                        } else {
                            pageOperationResult = false;
                        }

                        const newProps = {
                            isVisible: value.isVisible,
                            isRequired: value.isRequired,
                            isEnabled: value.isEnabled,
                        };

                        // Now the appropriate component key value can
                        // be modified (this is based on the page conditions metadatatype)
                        switch (metaDataType) {

                        case METADATA_TYPES.visible:
                            newProps.isVisible = pageOperationResult;
                            value = Object.assign(value, newProps);

                        case METADATA_TYPES.required:
                            newProps.isRequired = pageOperationResult;
                            value = Object.assign(value, newProps);

                        case METADATA_TYPES.enabled:
                            newProps.isEnabled = pageOperationResult;
                            value = Object.assign(value, newProps);
                        }
                    }
                }
                // PAGE CONDITIONS OVERHAUL FINISH
            }

            let selectedValue = null;
            let sourceValue = null;
            let selectedSnapshotValue = undefined;

            if (component.valueElementValueBindingReferenceId) {
                selectedSnapshotValue = snapshot.getValue(component.valueElementValueBindingReferenceId);
                selectedValue = selectedSnapshotValue;
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
                if (typeof selectedValue.contentValue === undefined || selectedValue.contentValue === null) {
                    value.contentValue = selectedSnapshotValue.defaultContentValue;
                } else {
                    value.contentValue = selectedValue.contentValue;
                }
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
