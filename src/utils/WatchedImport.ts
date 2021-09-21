import {
  ObservedFileState,
  observedFileStateOf,
} from './fs-state/fileState.ts';
import { Logger } from './log.ts';
import { blue } from '../deps/color.ts';

const logger = new Logger('WatchedImport', blue);

/////

let importId = 0;

export class WatchedImport {
  private watcher: Deno.FsWatcher;
  private isValid = false;
  public cache: unknown;
  private task?: Promise<unknown>;

  constructor(
    public path: string,
    private onImport: (path: string) => Promise<unknown>,
    private options?: { hot?: boolean; flushFast?: boolean },
  ) {
    this.watcher = Deno.watchFs(this.path);
    this.watch();

    if (options?.hot) this.get();
  }

  private async watch() {
    for await (const event of this.watcher) this.onChanged(event);
  }

  private async onChanged(event: Deno.FsEvent) {
    if (event.kind == 'access') return;

    this.isValid = false;
    this.task = undefined;
    if (this.options?.flushFast) this.cache = undefined;
    if (this.options?.hot) await this.get();
  }

  get(): Promise<unknown> {
    if (this.isValid) return Promise.resolve(this.cache);
    if (this.task) return this.task;
    const task = this.getValue();
    this.task = task;
    return task;
  }

  private async getValue(): Promise<unknown> {
    try {
      const result = await this.onImport(this.path);
      this.isValid = true;
      this.cache = result;
      this.task = undefined;
      return result;
    } catch (e) {
      logger.error(`failed to reload ${this.path}`, e);
      this.task = undefined;
      return this.cache; // fallback
    }
  }
}

/////

const statesKey = Symbol('statesKey');

export class WatchedImportObjectBuilder {
  private states: Map<string, ObservedFileState<unknown>> = new Map();

  constructor(
    private onImport: (path: string) => Promise<unknown>,
    private pathTransformer: (oldPath: string) => string,
    // deno-lint-ignore no-explicit-any
    public object: any,
  ) {
    Object.defineProperty(object, statesKey, { enumerable: false });
  }

  import(key: PropertyKey, path: string): Promise<unknown> {
    const actualPath = this.pathTransformer(path) + '#' + importId++; // prevent not reloaded
    const state = this.states.get(path) ?? observedFileStateOf(
      actualPath,
      () => this.onImport(actualPath),
      {
        hot: true,
        filterEvent: (event) => event.kind == 'modify',
      },
    );
    this.states.set(path, state);

    Object.defineProperty(this.object, key, {
      // deno-lint-ignore no-explicit-any
      get: () => (state.cache as any)?.default,
      enumerable: true,
    });

    return state.value;
  }
}
