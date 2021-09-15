import { State } from './state.ts'


export type ReadState<T> = {
  state: State<T>,
  value: T
}

export type WriteState<T> = {
  state: State<T>,
  fromValue: T,
  toValue: T
}


export type GlobalObserver = {
  onRead: (operation: ReadState<unknown>) => ReadState<unknown>,
  onWrite: (operation: WriteState<unknown>) => WriteState<unknown>
}


let observer: GlobalObserver = {
  onRead(operation) {
    return operation
  },

  onWrite(operation) {
    return operation
  }
}

function transparentObserver(from: GlobalObserver, layer: GlobalObserver): GlobalObserver {
  return {
    onRead: o => from.onRead(layer.onRead(o)),
    onWrite: o => from.onWrite(layer.onWrite(o))
  }
}

export function globalObserver(): GlobalObserver {
  return observer
}


export function observeRead<R>(
  block: () => R,
  onRead?: (operation: ReadState<unknown>) => ReadState<unknown>
): R {
  return observeWrite(
    block,
    onRead,
    () => { throw new Error('cannot write state inside observeRead scope') }
  )
}

export function observeWrite<R>(
  block: () => R,
  onRead?: (operation: ReadState<unknown>) => ReadState<unknown>,
  onWrite?: (operation: WriteState<unknown>) => WriteState<unknown>
): R {
  const last = observer
  const newObserver = transparentObserver(last, {
    onRead: onRead ?? (o => o),
    onWrite: onWrite ?? (o => o)
  })
  observer = newObserver
  try {
    return block()
  } finally {
    observer = last
  }
}
