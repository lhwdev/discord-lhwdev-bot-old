import { AbstractState } from './state.ts';

export function immutableStateOf<T>(value: T): ImmutableState<T> {
  return new ImmutableState(value);
}

export class ImmutableState<T> extends AbstractState<T> {
  constructor(private mValue: T) {
    super();
  }

  get value(): T {
    return this.mValue;
  }
}
