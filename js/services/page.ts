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

        propertyName = propertyName || 'pageContainerResponses';

        if (containers != null) {

            for (let index = 0; index < containers.length; index++) {

                let item = containers[index];

                if (parent) {

                    item.parent = parent.id;

                    parent.childCount = containers.length;
                }

                result.push(item);
                flattenContainers(item[propertyName], item, result, propertyName);

            }
        }

        return result;

    }

manywho.offline.page = class Page {

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
                let value = null;
                if (component.valueElementValueBindingReferenceId) {
                    value = snapshot.getValue(component.valueElementValueBindingReferenceId);

                    const stateValue = state.getValue(component.valueElementValueBindingReferenceId, value.typeElementId, value.contentType);
                    if (stateValue)
                        value = stateValue;
                }

                if (component.columns) {
                    let typeElementId = null;
                    if (component.objectDataRequest)
                        typeElementId = component.objectDataRequest.typeElementId;
                    else if (component.valueElementDataBindingReferenceId) {
                        typeElementId = null;
                    }

                    if (typeElementId) {
                        const typeElement = snapshot.metadata.typeElements.find(element => element.id === typeElementId);
                        component.columns = component.columns.map(column => {
                            column.developerName = typeElement.properties.find(prop => prop.id === column.typeElementPropertyId).developerName;
                            return column;
                        });
                    }
                }

                // TODO: support getting objectdata and setting it as selected

                return Object.assign({
                    pageComponentId: component.id,
                    contentValue: value ? value.contentValue || value.defaultContentValue : null,
                    objectData: value ? value.objectData || value.defaultObjectData : null,
                    isVisible: true,
                    isValid: true
                },
                component,
                {
                    attributes: component.attributes || {}
                });
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
