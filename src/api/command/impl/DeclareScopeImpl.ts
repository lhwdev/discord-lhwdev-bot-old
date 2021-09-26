import { Client } from '/deps/harmony.ts';
import { MutableState, mutableStateOf } from '/utils/state/state.ts';
import { CommandEntry } from '/api/command/CommandInfo.ts';
import {
  DeclareScope,
  InvokeScope,
  ParametersDeclaration,
  ParameterValues,
} from '/api/command/CommandScopes.ts';

////////

export class DeclareScopeImpl<T> implements DeclareScope<T> {
  public parameterValues!: ParametersValueHelper;
  private mParameters!: ParametersDeclaration;
  private mSubcommands: Record<string, DeclareScopeImpl<unknown>> = {};
  private entry?: CommandEntry;
  public onInvokeBlock!: (s: InvokeScope) => Promise<T>;

  constructor(public client: Client) {}

  parameters<P extends ParametersDeclaration>(parameters: () => P): ParameterValues<P> {
    if (this.mParameters) throw new Error('parameters(...) was already called.');
    const params = parameters();
    this.mParameters = params;
    const values = parametersValue(params, stubParameterInputs(params));
    this.parameterValues = values;
    return values.value as ParameterValues<P>;
  }

  onInvoke(block: (s: InvokeScope) => Promise<T>) {
    this.onInvokeBlock = block;
  }

  subcommand<ST>(id: string, block: (s: DeclareScope<ST>) => void): void {
    const subscope = new DeclareScopeImpl<ST>(this.client);
    block(subscope);

    this.mSubcommands[id] = subscope;
  }

  getEntry(): CommandEntry {
    if (this.entry) return this.entry;

    const subcommands = {};
    for (const [k, v] of Object.entries(this.mSubcommands)) {
      subcommands[k] = v.getEntry();
    }
    const entry = {
      parameters: this.mParameters ?? {},
      subcommands,
    };
    this.entry = entry;
    return entry;
  }
}

function stubParameterInputs(declaration: ParametersDeclaration) {
  return new Proxy({}, {
    get: (_target, p, _receiver) => declaration[p as string].defaultValue,
    has: (_target, p) => p in declaration,
    ownKeys: (_target) => Object.keys(declaration),
  });
}

export type ParametersValueHelper = {
  params: Record<string, unknown>;
  value: ParameterValues<ParametersDeclaration>;
};

function parametersValue(
  declaration: ParametersDeclaration,
  parameters: Record<string, unknown>,
): ParametersValueHelper {
  let params = parameters;
  const states: Record<string, MutableState<unknown>> = {};

  for (const [id, value] of Object.entries(params)) {
    states[id] = mutableStateOf(value);
  }

  return {
    get params() {
      return params;
    },
    set params(v) {
      params = v;
      for (const [id, value] of Object.entries(v)) {
        states[id].value = value;
      }
    },
    value: new Proxy({}, {
      get: (_target, p, _receiver) => params ? states[p as string].value : declaration,
      has: (_target, p) => typeof p == 'string' && p in params,
      ownKeys: (_target) => Object.keys(params),
    }) as ParameterValues<ParametersDeclaration>,
  };
}
