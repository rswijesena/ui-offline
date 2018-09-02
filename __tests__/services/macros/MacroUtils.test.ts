import { getProperty, setProperty } from '../../../js/services/macros/MacroUtils';
import { CONTENT_TYPES } from '../../../js/constants';

describe('Macro utilities behaviour', () => {
    // getProperty tests
    test('If property is found then returns the property contentValue', () => {
        const testTypeId = 'test id';
        const testContentValue = 'test content value';
        const value = {
            properties: [
                {
                    contentType: 'ContentString',
                    contentValue: testContentValue,
                    developerName: 'test name',
                    typeElementPropertyId: testTypeId,
                },
            ],
            developerName: 'test',
        };

        const result = getProperty(testTypeId, CONTENT_TYPES.STRING, value);
        expect(result).toEqual(testContentValue);
    });
    test('If property is found but is incorrect contentType then error is thrown', () => {
        const testTypeId = 'test id';
        const testContentValue = 'test content value';
        const value = {
            properties: [
                {
                    contentType: 'ContentString',
                    contentValue: testContentValue,
                    developerName: 'test name',
                    typeElementPropertyId: testTypeId,
                },
            ],
            developerName: 'test',
        };

        expect(() => {
            getProperty(testTypeId, CONTENT_TYPES.NUMBER, value);
        }).toThrow(Error);
    });
    test('If objectdata has no properties key throw an error', () => {
        const testTypeId = 'test id';
        const value = {
            developerName: 'test',
        };

        expect(() => {
            getProperty(testTypeId, CONTENT_TYPES.NUMBER, value);
        }).toThrow(Error);
    });
    test('If objectdata properties key is null then throw an error', () => {
        const testTypeId = 'test id';
        const value = {
            properties: null,
            developerName: 'test',
        };

        expect(() => {
            getProperty(testTypeId, CONTENT_TYPES.NUMBER, value);
        }).toThrow(Error);
    });

    // getValueByName tests
    test('If value is found in state then return values in state', () => {
    });
    test('If value is not found in state then return values in snapshot', () => {
    });

    // setStateValue tests
    test('State should get modified with passed value', () => {
    });

    // cloneStateValue tests
    test('Clone function returns argument', () => {
    });
});
