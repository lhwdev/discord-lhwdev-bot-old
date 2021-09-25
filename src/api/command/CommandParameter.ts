import { LText } from '../localization/localization.ts';

export default interface CommandParameter<T> {
  parse(str: string): T;

  get defaultValue(): T;
}

////////

export type WrongParameterErrorType = 'form';

export class WrongParameterError {
  constructor(public type: WrongParameterErrorType, public message: LText) {}
}
