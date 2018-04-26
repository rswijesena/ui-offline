import { clone } from '../services/Utils';

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
    filter: (objectData: any, filter: any) => {
        if (!filter || !objectData) {
            return {
                objectData,
                hasMoreResults: false,
            };
        }

        let filteredObjectData = clone(objectData);

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
