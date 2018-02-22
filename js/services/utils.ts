
declare var manywho: any;

/**
 * Flattening an array
 */
export const flatten = function(items, parent, result, childKey, parentKey) {
    if (items) {
        for (let index = 0; index < items.length; index++) {
            const item = items[index];

            if (parent && parentKey)
                item.parentKey = parent.id;

            result.push(item);
            flatten(item[childKey], item, result, childKey, parentKey);
        }
    }

    return result;
};

/**
 * Return a copy of an object
 */
export const clone = function(object) {
    return !manywho.utils.isNullOrUndefined(object) ? JSON.parse(JSON.stringify(object)) : object;
};

/**
 * Generate an GUID
 */
export const guid = function() {
    const s4 = function() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};
