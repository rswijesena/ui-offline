/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.utils.flatten = function(items, parent, result, childKey, parentKey) {
    if (items) {
        for (let index = 0; index < items.length; index++) {
            const item = items[index];

            if (parent && parentKey)
                item.parentKey = parent.id;

            result.push(item);
            manywho.utils.flatten(item[childKey], item, result, childKey, parentKey);
        }
    }

    return result;
};

manywho.utils.clone = function(object) {
    return JSON.parse(JSON.stringify(object));
};
