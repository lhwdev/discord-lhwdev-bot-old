import CommandParameter, { WrongParameterError } from '/api/command/CommandParameter.ts';

/////// localizations
const intlWrongNumber = {
  localized: {
    ko: '잘못된 숫자입니다.',
    en: 'Malformed number',
  },
};
///////

export default new class NumberParameter implements CommandParameter<number> {
  parse(str: string): number {
    try {
      return parseFloat(str);
    } catch (_) {
      throw new WrongParameterError('form', intlWrongNumber);
    }
  }

  defaultValue = 0;
}();
