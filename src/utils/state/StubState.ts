import { AbstractState, State } from './state.ts';

export default class StubState extends AbstractState<unknown> {
  constructor(
    public override onDependencyUpdated: ((from: State<unknown>) => void),
  ) {
    super();
  }

  get value(): unknown {
    throw new Error('stub state');
  }
}
