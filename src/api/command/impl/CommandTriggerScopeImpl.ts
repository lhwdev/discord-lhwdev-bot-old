import { Client } from '../../../deps/harmony.ts';
import CommandInfo from '../../command/CommandInfo.ts';
import {
  CommandTriggerScope,
  DeclareScope,
  InvokeScope,
  ParametersDeclaration,
  ParameterValues,
} from '../../command/CommandScopes.ts';
import CommandLoader from '../../command/loader/CommandLoader.ts';
import InvokeScopeImpl from "../../impl/InvokeScopeImpl.ts";
import CommandInvocation from "../CommandInvocation.ts";

export default class CommandTriggerScopeImpl implements CommandTriggerScope {
  constructor(public client: Client, public loader: CommandLoader) {}

  runCommand<T>(command: CommandInfo<T>, parameters: Record<string, unknown>): T {
    const scope = new DeclareScopeForInvoke(this.client, command, parameters);
    command.command.declare(scope);
    scope.invoke();
  }
}

class DeclareScopeForInvoke<T> implements DeclareScope<T> {
  private onInvokeBlock!: (s: InvokeScope<T>) => Promise<T>;

  constructor(
    public client: Client,
    public info: CommandInfo<T>,
    public params: Record<string, unknown>,
  ) {}

  parameters<P extends ParametersDeclaration>(_parameters: () => P): ParameterValues<P> {
  }

  onInvoke(_block: (s: InvokeScope<T>) => Promise<T>) {
    this.onInvokeBlock = _block;
  }

  subcommand<ST>(_id: string, _block: (s: DeclareScope<ST>) => void): void {}

  async invoke(): Promise<T> {
    const invocation = new CommandInvocation();
    const scope = new InvokeScopeImpl<T>(this.client, this.info.command, invocation);
    return await this.onInvokeBlock(scope);
  }
}
