import MacroPropertyMethods from '../../../js/services/macros/MacroPropertyMethods';
import { CONTENT_TYPES } from '../../../js/constants';
import { getProperty, setProperty } from '../../../js/services/macros/MacroUtils';

const mockContentValue = 'test content value';

jest.mock('../../../js/services/macros/MacroUtils', () => ({
    getProperty: jest.fn(() => {
        return mockContentValue;
    }),
    setProperty: jest.fn(),
}));

describe('Macro value property methods behaviour', () => {
    const mockTypeId = 'test id';
    const mockValue = 'test value';

    MacroPropertyMethods.initPropertyMethods(mockValue);

    test('Getter methods call getProperty', () => {
        let result = null;

        result = MacroPropertyMethods.getPropertyStringValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.STRING, mockValue);
        expect(result).toEqual(mockContentValue);

        result = MacroPropertyMethods.getPropertyContentValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.CONTENT, mockValue);
        expect(result).toEqual(mockContentValue);

        result = MacroPropertyMethods.getPropertyPasswordValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.PASSWORD, mockValue);
        expect(result).toEqual(mockContentValue);

        result = MacroPropertyMethods.getPropertyNumberValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.NUMBER, mockValue);
        expect(result).toEqual(mockContentValue);

        result = MacroPropertyMethods.getPropertyDateTimeValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.DATETIME, mockValue);
        expect(result).toEqual(mockContentValue);

        result = MacroPropertyMethods.getPropertyBooleanValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.BOOLEAN, mockValue);
        expect(result).toEqual(mockContentValue);

        result = MacroPropertyMethods.getPropertyArray(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.LIST, mockValue);
        expect(result).toEqual(mockContentValue);

        result = MacroPropertyMethods.getPropertyObject(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.OBJECT, mockValue);
        expect(result).toEqual(mockContentValue);
    });
    test('Setter methods call setProperty', () => {
        MacroPropertyMethods.setPropertyStringValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.STRING, mockContentValue, mockValue);

        MacroPropertyMethods.setPropertyContentValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.CONTENT, mockContentValue, mockValue);

        MacroPropertyMethods.setPropertyPasswordValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.PASSWORD, mockContentValue, mockValue);

        MacroPropertyMethods.setPropertyNumberValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.NUMBER, mockContentValue, mockValue);

        MacroPropertyMethods.setPropertyDateTimeValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.DATETIME, mockContentValue, mockValue);

        MacroPropertyMethods.setPropertyBooleanValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.BOOLEAN, mockContentValue, mockValue);

        MacroPropertyMethods.setPropertyArray(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.LIST, mockContentValue, mockValue);

        MacroPropertyMethods.setPropertyObject(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.OBJECT, mockContentValue, mockValue);
    });
});
