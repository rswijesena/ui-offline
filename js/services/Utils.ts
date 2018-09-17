declare const manywho: any;

/**
 * @param items
 * @param parent
 * @param result
 * @param childKey
 * @param parentKey
 */
export const flatten = (items: any[], parent: any, result: any[], childKey: string, parentKey: string) => {
    if (items) {
        for (let index = 0; index < items.length; index += 1) {
            const item = items[index];

            if (parent && parentKey) {
                item.parentKey = parent.id;
            }

            result.push(item);
            flatten(item[childKey], item, result, childKey, parentKey);
        }
    }

    return result;
};

/**
 * @param object
 */
export const clone = (object: Object) => {
    return !isNullOrUndefined(object) ? JSON.parse(JSON.stringify(object)) : object;
};

export const guid = () => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

const isNullOrUndefined = (value: any): boolean => {
    return typeof value === 'undefined' || value === null;
};
