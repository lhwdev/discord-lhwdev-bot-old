import { shallowArrayEquals } from '../utils.ts';
import { observeReadAsync } from './global.ts';
import { State, StateBase } from './state.ts';

export function asyncDerivedStateOf<T>(
  calculation: () => Promise<T>,
): State<Promise<T>> {
  return new AsyncDerivedState(calculation);
}

const NOT_INITIALIZED = {};

export default class AsyncDerivedState<T> extends StateBase<Promise<T>> {
  constructor(private init: () => Promise<T>) {
    super();
  }

  private cache: T | typeof NOT_INITIALIZED = NOT_INITIALIZED;
  private dependencies: State<unknown>[] = [];
  private dependencyHandles!: (() => void)[];

  protected get mValue(): Promise<T> {
    return this.getValue();
  }

  private async getValue(): Promise<T> {
    const v = this.cache;
    if (v === NOT_INITIALIZED) {
      const deps: State<unknown>[] = [];
      const v = await observeReadAsync(() => this.init(), (read) => {
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
    return v as T;
  }

  override onDependencyUpdated(_from: State<unknown>): void {
    this.cache = NOT_INITIALIZED;
  }
}
