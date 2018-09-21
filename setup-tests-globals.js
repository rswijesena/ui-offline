window.metaData = {};

window.localforage = {
    setDriver: jest.fn(),
    removeItem: jest.fn(() => {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }),
    getItem: jest.fn(() => {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }),
    setItem: jest.fn(() => {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }),
    createInstance: jest.fn(() => {
        return new Promise((resolve, reject) => {
            resolve(true);
        });       
    })
}

window.manywho = {
    ajax: {
        dispatchObjectDataRequest: jest.fn(() => Promise.resolve({objectData: []})),
    },
    settings: {
        initialize: jest.fn(),
        global: jest.fn((a) => {
            if (a === 'offline.cache.requests.limit') {
                return 250;
            }

            if (a === 'offline.cache.requests.pageSize') {
                return 10;
            }

            return 'https://example.com';
        })
    },
    utils: {
        extractFlowId: jest.fn(),
        extractStateId: jest.fn(),
        extractFlowVersionId: jest.fn(),
        extractTenantId: jest.fn(),
        getFlowKey: jest.fn(),
    },
    state: {
        getAuthenticationToken: jest.fn(),
        getState: jest.fn(() => {
            return {token: ''};
        })
    },
    component: {
        contentTypes: {
            string: ''
        }
    },
    model: {
        addNotification: jest.fn()
    },
    pollInterval: 1000,
}