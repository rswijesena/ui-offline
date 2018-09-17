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
    settings: {
        initialize: jest.fn(),
        global: jest.fn(() => 'https://example.com')
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