declare const manywho: any;

export const flatten = (items, parent, result, childKey, parentKey) => {
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

export const clone = (object) => {
    return !manywho.utils.isNullOrUndefined(object) ? JSON.parse(JSON.stringify(object)) : object;
};

export const guid = () => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};
