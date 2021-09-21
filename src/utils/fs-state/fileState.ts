import { StateBase } from '../state/state.ts';

export function observedFileStateOf<T>(
  path: string,
  calculation: () => Promise<T>,
  options?: {
    recursive?: boolean;
    hot?: boolean;
    filterEvent?: (event: Deno.FsEvent) => boolean;
    emptyFast?: boolean;
  },
): ObservedFileState<T> {
  const watcher = Deno.watchFs(
    path,
    options?.recursive ? { recursive: options?.recursive } : undefined,
  );

  return new ObservedFileState(
    watcher,
    calculation,
    options?.hot ?? false,
    options?.filterEvent,
    options?.emptyFast ?? false,
  );
}

export class ObservedFileState<T> extends StateBase<Promise<T>> {
  constructor(
    private watcher: Deno.FsWatcher,
    private calculation: () => Promise<T>,
    private hot: boolean,
    private filterEvent: ((event: Deno.FsEvent) => boolean) | undefined,
    private emptyFast: boolean,
  ) {
    super();

    if (hot) this.mValue;
    this.handler();
  }

  private isValid = false;
  public cache: T | undefined = undefined;

  private task?: Promise<T>;

  private async handler() {
    for await (const event of this.watcher) {
      if (this.filterEvent) {
        if (!this.filterEvent(event)) continue;

        this.isValid = false;
        if (this.emptyFast) this.cache = undefined;
        this.task = undefined;

        if (this.hot) {
          this.mValue;
        }
      }
    }
  }

  dispose() {
    this.watcher.close();
  }

  protected get mValue(): Promise<T> {
    if (this.isValid) return Promise.resolve(this.cache as T);
    if (this.task) return this.task;
    const task = this.taskContent();
    this.task = task;
    return task;
  }

  private async taskContent(): Promise<T> {
    const result = await this.calculation();
    this.isValid = true;
    this.cache = result;
    this.task = undefined;
    return result;
  }
}
