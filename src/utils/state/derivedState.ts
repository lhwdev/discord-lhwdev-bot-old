import { shallowArrayEquals } from '/utils/utils.ts';
import { observeRead } from './global.ts';
import { State, StateBase } from './state.ts';

export function derivedStateOf<T>(calculation: () => T): State<T> {
  return new DerivedState(calculation);
}

const NOT_INITIALIZED = {};

export default class DerivedState<T> extends StateBase<T> {
  constructor(private init: () => T) {
    super();
  }

  private cache: T | typeof NOT_INITIALIZED = NOT_INITIALIZED;
  private dependencies: State<unknown>[] = [];
  private dependencyHandles!: (() => void)[];

  protected get mValue(): T {
    if (this.cache !== NOT_INITIALIZED) return this.cache as T;

    const deps: State<unknown>[] = [];
    const v = observeRead(() => this.init(), (read) => {
      const s = read.state;
      if (!deps.includes(s)) {
        deps.push(s);
      }

      return read;
    });
    if (!shallowArrayEquals(this.dependencies, deps)) {
      for (const handle of this.dependencyHandles) {
        handle();
      }
      const handles = deps.map((d) => d.subscribe(this));
      this.dependencies = deps;
      this.dependencyHandles = handles;
    }
    this.cache = v;

    return v;
  }

  override onDependencyUpdated(_from: State<unknown>): void {
    this.cache = NOT_INITIALIZED;
  }
}
