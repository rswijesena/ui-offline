/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.state = class State {

    values = null;

    constructor(values) {
        this.values = values;
    }

    getValue(id, typeElementId, contentType) {
        if (this.values[id.id]) {
            let value = null;

            if (manywho.utils.isNullOrEmpty(typeElementId))
                value = {
                    contentValue: this.values[id.id]
                };
            else {
                value = this.values[id.id];

                if (manywho.utils.isEqual(contentType, manywho.component.contentTypes.object, true) && value.objectData && value.objectData.length > 1) {
                    // TODO: log error;
                }

                if (id.typeElementPropertyId && value.objectData) {
                    const property = value.objectData[0].properties.find(prop => prop.typeElementPropertyId === id.typeElementPropertyId);
                    value.contentValue = property.contentValue;
                    value.objectData = property.objectData;
                }
            }

            return value;
        }

        return null;
    }

    setValue(id, typeElementId, value) {
        // TODO: support setting properties
        this.values[id.id] = JSON.parse(JSON.stringify(value));
    }

    update(inputs, mapElement, snapshot) {
        inputs.forEach(input => {
            const page = snapshot.metadata.pageElements.find(pageElement => pageElement.id === mapElement.pageElementId);
            const component = page.pageComponents.find(pageComponent => pageComponent.id === input.pageComponentId);

            if (component.valueElementValueBindingReferenceId) {
                const value = snapshot.getValue(component.valueElementValueBindingReferenceId);
                this.setValue(component.valueElementValueBindingReferenceId, value.typeElementId, input);
            }
        });
    }

};
