import { clone } from '../services/Utils';
import { IState } from '../interfaces/IModels';

declare var manywho: any;

class State {

    currentMapElementId = null;
    id = null;
    token = null;
    values = null;

    constructor(state: IState) {
        this.currentMapElementId = state.currentMapElementId;
        this.id = state.id;
        this.token = state.token;
        this.values = state.values || {};
    }

    getValue(id, typeElementId, contentType, command) {
        if (this.values[id.id]) {
            let value = null;

            if (manywho.utils.isNullOrEmpty(typeElementId)) {
                value = clone(this.values[id.id]);
            } else {
                value = clone(this.values[id.id]);

                if (manywho.utils.isEqual(
                    contentType, manywho.component.contentTypes.object, true) && value.objectData && value.objectData.length > 1) {
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
                } else if (manywho.utils.isEqual(command, 'GET_NEXT', true) && value.objectData) {
                    value.index + 1;
                    value.objectData = value.index < value.objectData.length ? [value.objectData[value.index]] : [];
                }
            }

            return value;
        }

        return null;
    }

    setValue(id, typeElementId, snapshot, value) {
        if (id.typeElementPropertyId) {
            if (!this.values[id.id] || !this.values[id.id].objectData || this.values[id.id].objectData.length === 0) {
                const typeElement = clone(snapshot.metadata.typeElements.find(type => type.id === typeElementId));

                typeElement.properties = typeElement.properties.map((property) => {
                    property.typeElementPropertyId = property.id;
                    delete property.id;
                    return property;
                });

                this.values[id.id] = {
                    objectData: [typeElement],
                };
            }

            const property = this.values[id.id].objectData[0].properties.find(prop => prop.typeElementPropertyId === id.typeElementPropertyId);
            property.contentValue = value.contentValue;
            property.objectData = value.objectData;
        } else {
            this.values[id.id] = clone(value);
        }
    }

    update(inputs, mapElement, snapshot) {
        inputs.forEach((input) => {
            const page = snapshot.metadata.pageElements.find(pageElement => pageElement.id === mapElement.pageElementId);
            const component = page.pageComponents.find(pageComponent => pageComponent.id === input.pageComponentId);

            if (component.valueElementValueBindingReferenceId) {
                const value = snapshot.getValue(component.valueElementValueBindingReferenceId);
                this.setValue(component.valueElementValueBindingReferenceId, value.typeElementId, snapshot, input);
            }
        });
    }
}

export default State;
