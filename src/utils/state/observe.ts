import { State, UnsubscribeHandle } from './state.ts';
import StubState from './stubState.ts';

export function observeState<T>(state: State<T>): StateObserver<T> {
  return new StateObserver(state);
}

export class StateObserver<T> implements AsyncIterable<T> {
  handle!: UnsubscribeHandle

  constructor(private state: State<T>) {}

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    const state = this.state;

    const stubState = new StubState(() => yield state.value);
    this.handle = state.subscribe(stubState);
  }
}
