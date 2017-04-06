/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.state = class State {

    currentMapElementId = null;
    id = null;
    token = null;
    values = null;

    constructor(state) {
        this.currentMapElementId = state.currentMapElementId;
        this.id = state.id;
        this.token = state.token;
        this.values = state.values || {};
    }

    getValue(id, typeElementId, contentType, command) {
        if (this.values[id.id]) {
            let value = null;

            if (manywho.utils.isNullOrEmpty(typeElementId))
                value = manywho.utils.clone(this.values[id.id]);
            else {
                value = manywho.utils.clone(this.values[id.id]);

                if (manywho.utils.isEqual(contentType, manywho.component.contentTypes.object, true) && value.objectData && value.objectData.length > 1) {
                    // TODO: log error;
                }

                if (id.typeElementPropertyId && value.objectData && value.objectData.length > 0) {
                    const property = value.objectData[0].properties.find(prop => prop.typeElementPropertyId === id.typeElementPropertyId);
                    value.contentValue = property.contentValue;
                    value.objectData = property.objectData;
                    value.index = 0;
                }

                if (manywho.utils.isEqual(command, 'GET_FIRST', true) && value.objectData) {
                    value.objectData = [value.objectData[0]];
                    value.index = 0;
                }
                else if (manywho.utils.isEqual(command, 'GET_NEXT', true) && value.objectData) {
                    value.index++;
                    value.objectData = value.index < value.objectData.length ? [value.objectData[value.index]] : [];
                }
            }

            return value;
        }

        return null;
    }

    setValue(id, typeElementId, snapshot, value) {
        if (id.typeElementPropertyId) {
            if (!this.values[id.id])
                this.values[id.id] = {
                    objectData: manywho.utils.clone(snapshot.metadata.typeElements.find(type => type.id === typeElementId))
                };

            if (this.values[id.id].objectData && this.values[id.id].objectData.length > 0) {
                const property = this.values[id.id].objectData[0].properties.find(prop => prop.typeElementPropertyId === id.typeElementPropertyId);
                property.contentValue = value.contentValue;
                property.objectData = value.objectData;
            }
        }
        else
            this.values[id.id] = manywho.utils.clone(value);
    }

    update(inputs, mapElement, snapshot) {
        inputs.forEach(input => {
            const page = snapshot.metadata.pageElements.find(pageElement => pageElement.id === mapElement.pageElementId);
            const component = page.pageComponents.find(pageComponent => pageComponent.id === input.pageComponentId);

            if (component.valueElementValueBindingReferenceId) {
                const value = snapshot.getValue(component.valueElementValueBindingReferenceId);
                this.setValue(component.valueElementValueBindingReferenceId, value.typeElementId, snapshot, input);
            }
        });
    }
};
