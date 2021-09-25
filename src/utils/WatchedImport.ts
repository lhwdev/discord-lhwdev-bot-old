import { resolve } from '../deps/path.ts';
import { FileStateOptions, ObservedFileState, observedFileStateOf } from './fs-state/fileState.ts';
import { Logger } from './log.ts';

const logger = new Logger('WatchedImport', 0x2222aa);

/////

let importId = 0;

export function WatchedImport<T>(
  path: string,
  options?: FileStateOptions & { onImport?: (path: string) => Promise<T> },
): ObservedFileState<T> {
  const actualPath = resolve(path);
  const onImport = options?.onImport ?? ((path) => import(path));

  return observedFileStateOf(
    actualPath,
    (lastValue) => {
      try {
        return onImport(`${actualPath}$#${importId++}`);
      } catch (e) {
        logger.error(`failed to reload ${path}`, e);
        return Promise.resolve(lastValue as T);
      }
    },
    options,
  );
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
