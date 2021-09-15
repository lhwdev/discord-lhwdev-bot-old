import { observeRead } from './global.ts'
import { State, StateBase } from './state.ts'


const NOT_INITIALIZED = {}


function shallowArrayEquals(a: unknown[], b: unknown[]): boolean {
  if(a.length !== b.length) return false
  for(let i = 0; i < a.length; i++) {
    if(a[i] !== b[i]) return false
  }
  return true
}


export default class DerivedState<T> extends StateBase<T> {
  constructor(private init: () => T) {
    super()
  }


  private cache: T | typeof NOT_INITIALIZED = NOT_INITIALIZED
  private dependencies: State<unknown>[] = []
  private dependencyHandles!: (() => void)[]


  protected get mValue(): T {
    if(this.cache !== NOT_INITIALIZED) return this.cache as T

    const deps: State<unknown>[] = []
    const v = observeRead(() => this.init(), read => {
      deps.push(read.state)
      return read
    })
    if(!shallowArrayEquals(this.dependencies, deps)) {
      for(const handle of this.dependencyHandles) {
        handle()
      }
      const handles = deps.map(d => d.subscribe(this))
      this.dependencies = deps
      this.dependencyHandles = handles
    }
    this.cache = v

    return v
  }
  

  onDependencyUpdated(_from: State<unknown>): void {
    this.cache = NOT_INITIALIZED
  }
}
