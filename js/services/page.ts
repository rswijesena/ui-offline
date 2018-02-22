/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

function getPageContainers(container) {
    if (container.pageContainers) {
        container.pageContainerResponses = container.pageContainers.map(getPageContainers);
        delete container.pageContainers;
    }
    return container;
}

function flattenContainers(containers, parent, result, propertyName) {
    if (containers != null)
        for (let index = 0; index < containers.length; index++) {
            const item = containers[index];

            if (parent) {
                item.parent = parent.id;
                parent.childCount = containers.length;
            }

            result.push(item);
            flattenContainers(item[propertyName], item, result, propertyName);
        }

    return result;
}

class Page {

    static generate(request, mapElement, state, snapshot) {
        const pageElement = snapshot.metadata.pageElements.find(page => mapElement.pageElementId === page.id);

        let pageContainerDataResponses = [];
        if (pageElement.pageContainers)
            pageContainerDataResponses = flattenContainers(pageElement.pageContainers, null, [], 'pageContainers').map(container => {
                return {
                    isEditable: true,
                    isEnabled: true,
                    isVisible: true,
                    pageContainerId: container.id
                };
            });

        let pageComponentDataResponses = [];
        if (pageElement.pageComponents)
            pageComponentDataResponses = pageElement.pageComponents.map(component => {
                let selectedValue = null;
                let sourceValue = null;
                const value: any = {
                    pageComponentId: component.id,
                    contentValue: null,
                    objectData: null,
                    contentType: manywho.component.contentTypes.string,
                    isVisible: true,
                    isValid: true
                };

                if (component.valueElementValueBindingReferenceId) {
                    selectedValue = snapshot.getValue(component.valueElementValueBindingReferenceId);
                    value.contentType = snapshot.getContentTypeForValue(component.valueElementValueBindingReferenceId);

                    const stateValue = state.getValue(component.valueElementValueBindingReferenceId, selectedValue.typeElementId, selectedValue.contentType);
                    if (stateValue)
                        selectedValue = stateValue;
                }

                if (component.columns) {
                    let typeElementId = null;
                    if (component.objectDataRequest)
                        typeElementId = component.objectDataRequest.typeElementId;
                    else if (component.valueElementDataBindingReferenceId) {
                        sourceValue = snapshot.getValue(component.valueElementDataBindingReferenceId);
                        typeElementId = sourceValue.typeElementId;

                        const stateValue = state.getValue(component.valueElementDataBindingReferenceId, sourceValue.typeElementId, sourceValue.contentType);
                        if (stateValue)
                            sourceValue = stateValue;
                    }

                    if (typeElementId) {
                        const typeElement = snapshot.metadata.typeElements.find(element => element.id === typeElementId);
                        component.columns = component.columns.map(column => {
                            column.developerName = typeElement.properties.find(prop => prop.id === column.typeElementPropertyId).developerName;
                            return column;
                        });
                    }
                }

                if (selectedValue)
                    value.contentValue = selectedValue.contentValue || selectedValue.defaultContentValue;

                if (sourceValue) {
                    value.objectData = sourceValue.objectData || sourceValue.defaultObjectData;

                    if (selectedValue.objectData && (sourceValue.objectData || sourceValue.defaultObjectData))
                        value.objectData = (sourceValue.objectData || sourceValue.defaultObjectData).map(objectData => {
                        objectData.isSelected = !!selectedValue.objectData.find(item => item.externalId === objectData.externalId && item.isSelected);
                        return objectData;
                    });
                }

                return Object.assign(value, component, { attributes: component.attributes || {} });
            });

        return {
            developerName: mapElement.developerName,
            mapElementId: mapElement.id,
            outcomeResponses: mapElement.outcomes,
            pageResponse: {
                pageContainerResponses: pageElement.pageContainers.map(getPageContainers),
                pageComponentResponses: pageElement.pageComponents,
                pageContainerDataResponses: pageContainerDataResponses,
                pageComponentDataResponses: pageComponentDataResponses
            }
        };
    }

};

export default Page;
