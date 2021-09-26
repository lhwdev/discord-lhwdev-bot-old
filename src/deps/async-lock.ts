import AnAsyncLock from 'https://esm.sh/async-lock@1.3.0'


export default class AsyncLock {
  constructor() {}

  private lock = new AnAsyncLock()

  withLock<T>(block: () => Promise<T>): Promise<T> {
    return this.lock.acquire('', block)
  }

  get isBusy(): boolean {
    return this.lock.isBusy('')
  }
}
