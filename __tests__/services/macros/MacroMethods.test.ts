import { default as MacroMethods, bindValuePropertyFunctions } from '../../../js/services/macros/MacroMethods';
import { setMacroState } from '../../../js/services/macros/MacroState';
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
    test('Getter functions return a values default content value if the value does not exist in state', () => {

        const mockState = {
            values: {},
        };

        setMacroState(mockState);
        MacroMethods.initMethods(mockMetaData);

        const booleanResult = MacroMethods.getBooleanValue('{![' + mockMetaData.valueElements[0].developerName + ']}');
        expect(booleanResult).toEqual(mockMetaData.valueElements[0].defaultContentValue);

        const contentResult = MacroMethods.getContentValue('{![' + mockMetaData.valueElements[1].developerName + ']}');
        expect(contentResult).toEqual(mockMetaData.valueElements[1].defaultContentValue);

        const dateResult = MacroMethods.getDateTimeValue('{![' + mockMetaData.valueElements[2].developerName + ']}');
        expect(dateResult).toEqual(mockMetaData.valueElements[2].defaultContentValue);

        const numberResult = MacroMethods.getNumberValue('{![' + mockMetaData.valueElements[3].developerName + ']}');
        expect(numberResult).toEqual(mockMetaData.valueElements[3].defaultContentValue);

        const objectResult = MacroMethods.getObject('{![' + mockMetaData.valueElements[4].developerName + ']}');
        expect(objectResult).toEqual(mockMetaData.valueElements[4].defaultObjectData);

        const passwordResult = MacroMethods.getPasswordValue('{![' + mockMetaData.valueElements[5].developerName + ']}');
        expect(passwordResult).toEqual(mockMetaData.valueElements[5].defaultContentValue);

        const valueResult = MacroMethods.getValue('{![' + mockMetaData.valueElements[6].developerName + ']}');
        expect(valueResult).toEqual(mockMetaData.valueElements[6].defaultContentValue);
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
            },
        };

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
        expect(objectResult).toEqual(mockState.values['test5'].objectData);

        const passwordResult = MacroMethods.getPasswordValue('{![' + mockMetaData.valueElements[5].developerName + ']}');
        expect(passwordResult).toEqual(mockState.values['test6'].contentValue);

        const valueResult = MacroMethods.getValue('{![' + mockMetaData.valueElements[6].developerName + ']}');
        expect(valueResult).toEqual(mockState.values['test7'].contentValue);
    });
    test('Setter functions insert passed value into macro state', () => {

        const mockState = {
            values: {},
        };

        const spy = jest.spyOn(utils, 'setStateValue');

        setMacroState(mockState);
        MacroMethods.initMethods(mockMetaData);

        const mockBoolContentValue = true;
        MacroMethods.setBooleanValue(
            '{![' + mockMetaData.valueElements[0].developerName + ']}',
            mockBoolContentValue,
        );
        const mockBoolProps = {
            contentValue: mockBoolContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockMetaData.valueElements[0].id,
            mockBoolProps,
        );

        const mockContentContentValue = 'test';
        MacroMethods.setContentValue(
            '{![' + mockMetaData.valueElements[1].developerName + ']}',
            mockContentContentValue,
        );
        const mockContentProps = {
            contentValue: mockContentContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockMetaData.valueElements[1].id,
            mockContentProps,
        );

        const mockDateTimeContentValue = 'date';
        MacroMethods.setDateTimeValue(
            '{![' + mockMetaData.valueElements[2].developerName + ']}',
            mockDateTimeContentValue,
        );
        const mockDateTimeProps = {
            contentValue: mockDateTimeContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockMetaData.valueElements[2].id,
            mockDateTimeProps,
        );

        const mockNumberContentValue = '1';
        MacroMethods.setNumberValue(
            '{![' + mockMetaData.valueElements[3].developerName + ']}',
            mockNumberContentValue,
        );
        const mockNumberProps = {
            contentValue: mockNumberContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockMetaData.valueElements[3].id,
            mockNumberProps,
        );

        const mockObjectContentValue = [];
        MacroMethods.setObject(
            '{![' + mockMetaData.valueElements[4].developerName + ']}',
            mockObjectContentValue,
        );
        const mockObjectProps = {
            contentValue: null,
            objectData: mockObjectContentValue,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockMetaData.valueElements[4].id,
            mockObjectProps,
        );

        const mockPasswordContentValue = 'password';
        MacroMethods.setPasswordValue(
            '{![' + mockMetaData.valueElements[5].developerName + ']}',
            mockPasswordContentValue,
        );
        const mockPasswordProps = {
            contentValue: mockPasswordContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockMetaData.valueElements[5].id,
            mockPasswordProps,
        );

        const mockValueContentValue = 'value';
        MacroMethods.setValue(
            '{![' + mockMetaData.valueElements[6].developerName + ']}',
            mockValueContentValue,
        );
        const mockValueProps = {
            contentValue: mockValueContentValue,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockMetaData.valueElements[6].id,
            mockValueProps,
        );

        const mockArrayContentValue = [];
        MacroMethods.setArray(
            '{![' + mockMetaData.valueElements[7].developerName + ']}',
            mockArrayContentValue,
        );
        const mockArrayProps = {
            contentValue: null,
            objectData: mockArrayContentValue,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockMetaData.valueElements[7].id,
            mockArrayProps,
        );
    });
    test.skip('Function for getting list values should return an object with property methods', () => {
    });
    test.skip('Binding property methods should return an object with values mapping to property methods', () => {
    });
});
