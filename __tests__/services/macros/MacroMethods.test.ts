import { default as MacroMethods, bindValuePropertyFunctions } from '../../../js/services/macros/MacroMethods';
import { setMacroState } from '../../../js/services/macros/MacroState';
import MacroPropertyMethods from '../../../js/services/macros/MacroPropertyMethods';
import * as utils from '../../../js/services/macros/MacroUtils';

const mockMetaData = {
    valueElements: [
        { id: 'test1', developerName: 'booleanTest', defaultContentValue: false },
        { id: 'test2', developerName: 'contentTest', defaultContentValue: 'content' },
        { id: 'test3', developerName: 'dateTimeTest', defaultContentValue: '00-00-0000Z00:00:00' },
        { id: 'test4', developerName: 'numberTest', defaultContentValue: '0' },
        { id: 'test5', developerName: 'objectTest', defaultObjectData: [] },
        { id: 'test6', developerName: 'passwordTest', defaultContentValue: 'password' },
        { id: 'test7', developerName: 'valueTest', defaultContentValue: 'value' },
        { id: 'test8', developerName: 'arrayTest', defaultObjectData: [] },
    ],
};

describe('Macro value methods behaviour', () => {
    test('Getter functions throw an error if the value does not exist in state', () => {

        const mockState = {
            values: {},
        };

        setMacroState(mockState);
        MacroMethods.initMethods(mockMetaData);

        expect(() => {
            MacroMethods.getBooleanValue('{![' + mockMetaData.valueElements[0].developerName + ']}');
        }).toThrow('A value with name: ' + mockMetaData.valueElements[0].developerName + ', has not been set in state');

        expect(() => {
            MacroMethods.getContentValue('{![' + mockMetaData.valueElements[1].developerName + ']}');
        }).toThrow('A value with name: ' + mockMetaData.valueElements[1].developerName + ', has not been set in state');

        expect(() => {
            MacroMethods.getDateTimeValue('{![' + mockMetaData.valueElements[2].developerName + ']}');
        }).toThrow('A value with name: ' + mockMetaData.valueElements[2].developerName + ', has not been set in state');

        expect(() => {
            MacroMethods.getNumberValue('{![' + mockMetaData.valueElements[3].developerName + ']}');
        }).toThrow('A value with name: ' + mockMetaData.valueElements[3].developerName + ', has not been set in state');

        expect(() => {
            MacroMethods.getObject('{![' + mockMetaData.valueElements[4].developerName + ']}');
        }).toThrow('A value with name: ' + mockMetaData.valueElements[4].developerName + ', has not been set in state');

        expect(() => {
            MacroMethods.getPasswordValue('{![' + mockMetaData.valueElements[5].developerName + ']}');
        }).toThrow('A value with name: ' + mockMetaData.valueElements[5].developerName + ', has not been set in state');

        expect(() => {
            MacroMethods.getValue('{![' + mockMetaData.valueElements[6].developerName + ']}');
        }).toThrow('A value with name: ' + mockMetaData.valueElements[6].developerName + ', has not been set in state');
    });

    test('Getter functions return a values content value if the value does exist in state', () => {

        const mockState = {
            values: {
                test1: { id: 'test1', developerName: 'booleanTest', contentValue: false },
                test2: { id: 'test2', developerName: 'contentTest', contentValue: 'content' },
                test3: { id: 'test3', developerName: 'dateTimeTest', contentValue: '00-00-0000Z00:00:00' },
                test4: { id: 'test4', developerName: 'numberTest', contentValue: '0' },
                test5: { id: 'test5', developerName: 'objectTest', objectData: [] },
                test6: { id: 'test6', developerName: 'passwordTest', contentValue: 'password' },
                test7: { id: 'test7', developerName: 'valueTest', contentValue: 'value' },
                test8: { id: 'test8', developerName: 'arrayTest', objectData: [] },
            },
        };

        const macroFunctions: any = bindValuePropertyFunctions(mockState.values.test5);
        for (const key of Object.keys(macroFunctions)) {
            mockState.values.test5[key] = macroFunctions[key];
        }

        setMacroState(mockState);
        MacroMethods.initMethods(mockMetaData);

        const booleanResult = MacroMethods.getBooleanValue('{![' + mockMetaData.valueElements[0].developerName + ']}');
        expect(booleanResult).toEqual(mockState.values['test1'].contentValue);

        const contentResult = MacroMethods.getContentValue('{![' + mockMetaData.valueElements[1].developerName + ']}');
        expect(contentResult).toEqual(mockState.values['test2'].contentValue);

        const dateResult = MacroMethods.getDateTimeValue('{![' + mockMetaData.valueElements[2].developerName + ']}');
        expect(dateResult).toEqual(mockState.values['test3'].contentValue);

        const numberResult = MacroMethods.getNumberValue('{![' + mockMetaData.valueElements[3].developerName + ']}');
        expect(numberResult).toEqual(mockState.values['test4'].contentValue);

        const objectResult = MacroMethods.getObject('{![' + mockMetaData.valueElements[4].developerName + ']}');
        expect(objectResult).toEqual(mockState.values['test5']);

        const passwordResult = MacroMethods.getPasswordValue('{![' + mockMetaData.valueElements[5].developerName + ']}');
        expect(passwordResult).toEqual(mockState.values['test6'].contentValue);

        const valueResult = MacroMethods.getValue('{![' + mockMetaData.valueElements[6].developerName + ']}');
        expect(valueResult).toEqual(mockState.values['test7'].contentValue);
    });
    test('Setter functions insert passed value into macro state', () => {

        const mockState = {
            values: {
                test1: { id: 'test1', developerName: 'booleanTest', contentValue: false },
                test2: { id: 'test2', developerName: 'contentTest', contentValue: 'content' },
                test3: { id: 'test3', developerName: 'dateTimeTest', contentValue: '00-00-0000Z00:00:00' },
                test4: { id: 'test4', developerName: 'numberTest', contentValue: '0' },
                test5: { id: 'test5', developerName: 'objectTest', objectData: [] },
                test6: { id: 'test6', developerName: 'passwordTest', contentValue: 'password' },
                test7: { id: 'test7', developerName: 'valueTest', contentValue: 'value' },
                test8: { id: 'test8', developerName: 'arrayTest', objectData: [] },
            },
        };

        const spy = jest.spyOn(utils, 'setStateValue');

        setMacroState(mockState);
        MacroMethods.initMethods(mockMetaData);

        const mockBoolContentValue = true;
        MacroMethods.setBooleanValue(
            '{![' + mockState.values.test1.developerName + ']}',
            mockBoolContentValue,
        );
        const mockBoolProps = {
            contentValue: mockBoolContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockState.values.test1.id,
            mockBoolProps,
        );

        const mockContentContentValue = 'test';
        MacroMethods.setContentValue(
            '{![' + mockState.values.test2.developerName + ']}',
            mockContentContentValue,
        );
        const mockContentProps = {
            contentValue: mockContentContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockState.values.test2.id,
            mockContentProps,
        );

        const mockDateTimeContentValue = 'date';
        MacroMethods.setDateTimeValue(
            '{![' + mockState.values.test3.developerName + ']}',
            mockDateTimeContentValue,
        );
        const mockDateTimeProps = {
            contentValue: mockDateTimeContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockState.values.test3.id,
            mockDateTimeProps,
        );

        const mockNumberContentValue = '1';
        MacroMethods.setNumberValue(
            '{![' + mockState.values.test4.developerName + ']}',
            mockNumberContentValue,
        );
        const mockNumberProps = {
            contentValue: mockNumberContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockState.values.test4.id,
            mockNumberProps,
        );

        const mockObjectContentValue = { objectData: [] };
        MacroMethods.setObject(
            '{![' + mockState.values.test5.developerName + ']}',
            mockObjectContentValue,
        );
        const mockObjectProps = {
            contentValue: null,
            objectData: mockObjectContentValue.objectData,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockState.values.test5.id,
            mockObjectProps,
        );

        const mockPasswordContentValue = 'password';
        MacroMethods.setPasswordValue(
            '{![' + mockState.values.test6.developerName + ']}',
            mockPasswordContentValue,
        );
        const mockPasswordProps = {
            contentValue: mockPasswordContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockState.values.test6.id,
            mockPasswordProps,
        );

        const mockValueContentValue = 'value';
        MacroMethods.setValue(
            '{![' + mockState.values.test6.developerName + ']}',
            mockValueContentValue,
        );
        const mockValueProps = {
            contentValue: mockValueContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockState.values.test6.id,
            mockValueProps,
        );

        const mockArrayContentValue = [1, 2, 3];
        MacroMethods.setArray(
            '{![' + mockState.values.test8.developerName + ']}',
            mockArrayContentValue,
        );
        const mockArrayProps = {
            contentValue: null,
            objectData: mockArrayContentValue,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockState.values.test8.id,
            mockArrayProps,
        );
    });
    test.skip('Function for getting list values should return an object with property methods', () => {
    });
    test('Function for getting object values should return an object with property methods', () => {
        const mockState = {
            values: {
                test5: { id: 'test5', developerName: 'objectTest', objectData: [] },
            },
        };
        setMacroState(mockState);
        MacroMethods.initMethods(mockMetaData);
        const objectResult = MacroMethods.getObject('{![' + mockMetaData.valueElements[4].developerName + ']}');
        for (const key in MacroPropertyMethods) {
            if (MacroPropertyMethods.hasOwnProperty(key)) {
                const func = MacroPropertyMethods[key];
                if (func.name !== 'initPropertyMethods') {
                    expect(objectResult[func.name]).toEqual(MacroPropertyMethods[key]);
                }
            }
        }
    });
    test('Binding property methods should return an object with values mapping to property methods', () => {
        const result = bindValuePropertyFunctions({});
        for (const key in MacroPropertyMethods) {
            if (MacroPropertyMethods.hasOwnProperty(key)) {
                const func = MacroPropertyMethods[key];
                if (func.name !== 'initPropertyMethods') {
                    expect(result[func.name]).toEqual(MacroPropertyMethods[key]);
                }
            }
        }
    });
});
