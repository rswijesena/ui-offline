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
    })
}

window.manywho = {
    settings: {
        initialize: jest.fn(),
    },
    utils: {
        extractFlowId: jest.fn(),
        extractStateId: jest.fn(),
        extractFlowVersionId: jest.fn(),
        extractTenantId: jest.fn()
    },
    state: {
        getAuthenticationToken: jest.fn(),
        getState: jest.fn(() => {
            return {token: ''};
        })
    }
} 