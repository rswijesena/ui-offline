import { clone } from '../services/Utils';
import Rules from './Rules';
import { errorComparator } from 'tslint/lib/verify/lintError';
import { IFlow } from '../interfaces/IModels';

/**
 * Support for filtering through cached object data
 */
const ObjectData = {

    /**
     * Execute filtering on object data. Currently supports searching
     * across every properties `contentValue`.
     * @param objectData
     * @param filter
     */
    filter: (objectData: any, filter: any, typeElementId: string, flow: IFlow) => {
        if (!filter || !objectData) {
            return {
                objectData,
                hasMoreResults: false,
            };
        }

        let filteredObjectData = clone(objectData);

        if (filter.where) {
            filteredObjectData = filteredObjectData.filter((item) => {
                const comparer = filter.comparisonType === 'OR' ? 'some' : 'every';

                return filter.where[comparer]((where) => {
                    const property = item.properties.find(property => property.typeElementPropertyId === where.columnTypeElementPropertyId);

                    if (!property) {
                        return true;
                    }

                    const value = flow.state.getStateValue(filter.valueElementToReferenceId, typeElementId, property.contentType, null);

                    if (!value) {
                        return true;
                    }

                    return Rules.compareValues(property, value, property.contentType, where.criteriaType);
                });
            });
        } else if (filter.filterId) {
            filteredObjectData = filteredObjectData.filter((item) => {
                const value = flow.state.getStateValue(filter.filterId, null, 'CONTENTSTRING', null);
                return value ? item.externalId === value.contentValue : false;
            });
        }

        if (filter.search) {
            filteredObjectData = filteredObjectData.filter((item) => {
                return item.properties.filter((property) => {
                    return property.contentValue && property.contentValue.toLowerCase().indexOf(filter.search.toLowerCase()) !== -1;
                }).length > 0;
            });
        }

        filter.offset = filter.offset || 0;
        const page = Math.ceil(filter.offset / filter.limit);

        return {
            hasMoreResults: ((page * filter.limit) + filter.limit + 1) <= filteredObjectData.length,
            objectData: filteredObjectData.slice(page * filter.limit, (page * filter.limit) + filter.limit),
        };
    },
};

export default ObjectData;
