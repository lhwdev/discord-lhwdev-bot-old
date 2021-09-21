import { globalObserver, ReadState, WriteState } from './global.ts';

export function mutableStateOf<T>(initialValue: T): MutableState<T> {
  return new MutableStateImpl(initialValue);
}

export type UnsubscribeHandle = () => void;

export interface State<T> {
  get value(): T;

  readonly decorator: PropertyDecorator;

  onDependencyUpdated(from: State<unknown>): void;
  subscribe(from: State<unknown>): UnsubscribeHandle;
}

export abstract class StateBase<T> implements State<T> {
  protected dependants: (WeakRef<State<unknown>> | undefined)[] = [];

  protected cleanUpDependants() {
    const deps = this.dependants;

    if (deps.length > 30) {
      const newArray: WeakRef<State<unknown>>[] = [];
      for (const item of this.dependants) {
        if (item !== undefined && item.deref() !== null) newArray.push(item);
      }
      this.dependants = newArray;
    }
  }

  protected abstract get mValue(): T;

  get value(): T {
    let read: ReadState<T> = { state: this, value: this.mValue };
    read = globalObserver().onRead(read) as ReadState<T>;
    read = this.onRead(read);

    return read.value;
  }

  decorator: PropertyDecorator = (target, propertyKey) => {
    Object.defineProperty(target, propertyKey, {
      get: () => this.value,
    });
  };

  protected onRead(read: ReadState<T>): ReadState<T> {
    return read;
  }

  protected onUpdated() {
    let clean = false;
    for (const dependant of this.dependants) {
      const ref = dependant?.deref();
      if (ref === undefined) {
        clean = true;
      } else {
        ref.onDependencyUpdated(this);
      }
    }
    if (clean) this.cleanUpDependants();
  }

  onDependencyUpdated(_from: State<unknown>): void {
    throw Error('This state does not have any dependencies.');
  }

  subscribe(from: State<unknown>): UnsubscribeHandle {
    const ref = new WeakRef(from);
    const deps = this.dependants;

    deps.push(ref);

    return () => {
      const index = deps.indexOf(ref);
      if (index !== -1) {
        delete deps[index];
        this.cleanUpDependants();
      }
    };
  }
}

export interface MutableState<T> extends State<T> {
  set value(value: T);
}

export abstract class MutableStateBase<T> extends StateBase<T>
  implements MutableState<T> {
  protected abstract override get mValue(): T;
  protected abstract override set mValue(value: T);

  override set value(value: T) {
    let write: WriteState<T> = {
      state: this,
      fromValue: this.mValue,
      toValue: value,
    };

    write = globalObserver().onWrite(write) as WriteState<T>;
    if (write == null) return;

    write = this.onWrite(write);
    if (write == null) return;

    this.mValue = write.toValue;

    this.onUpdated();
  }

  override decorator: PropertyDecorator = (target, propertyKey) => {
    Object.defineProperty(target, propertyKey, {
      get: () => this.value,
      set: (v) => {
        this.value = v;
      },
    });
  };

  protected onWrite(write: WriteState<T>): WriteState<T> {
    return write;
  }
}

export class MutableStateImpl<T> extends MutableStateBase<T> {
  constructor(protected override mValue: T) {
    super();
  }

  override onDependencyUpdated(_from: State<unknown>) {}
}
