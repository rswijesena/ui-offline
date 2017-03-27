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
    return !manywho.utils.isNullOrUndefined(object) ? JSON.parse(JSON.stringify(object)) : object;
};

manywho.utils.guid = function() {
    const s4 = function() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};
