import CommandManager from '/api/command/CommandManager.ts';
import CommandInfo from '/api/command/CommandInfo.ts';
import { CommandId } from '/api/command/Command.ts';
import { InvokeScope } from '/api/command/CommandScopes.ts';
import CommandLoader from '/api/command/impl/loader/CommandLoader.ts';
import LoadedCommand from '/api/command/impl/LoadedCommand.ts';
import { Client } from '/deps/harmony.ts';
import { DeclareScopeImpl, ParametersValueHelper } from './DeclareScopeImpl.ts';
import InvokeScopeImpl from './InvokeScopeImpl.ts';
import CommandInvocation from '../CommandInvocation.ts';
import { mutableStateOf, State } from '/utils/state/state.ts';
import AsyncLock from '/deps/async-lock.ts';

export default class CommandManagerImpl extends CommandManager {
  private loader: CommandLoader<LoadedCommandImpl<unknown>>;

  constructor(public client: Client, public basePath: string) {
    super();
    this.loader = new CommandLoader(
      client,
      basePath,
      (info, scope) => new LoadedCommandImpl(info, scope),
    );
  }

  async loadCommand(id: CommandId): Promise<CommandInfo<unknown>> {
    const loaded = await this.loader.load(id);
    return loaded.info;
  }

  async invokeCommand<T>(command: CommandInfo<T>, parameters: Record<string, unknown>): Promise<T> {
    const loaded = this.loader.getCache(command.id);
    if (!loaded) {
      throw new Error(
        `invokeCommand: command ${command.id.identifier} was not loaded or not loaded by this loaded`,
      );
    }

    return await loaded.invoke(this.client, parameters) as T;
  }
}

class LoadedCommandImpl<T> implements LoadedCommand<T> {
  private onInvoke: (s: InvokeScope) => Promise<T>;
  private invocation: State<CommandInvocation>;
  private parameters: ParametersValueHelper;
  private lock = new AsyncLock();

  constructor(public info: CommandInfo<T>, declareScope: DeclareScopeImpl<T>) {
    this.onInvoke = declareScope.onInvokeBlock;
    this.parameters = declareScope.parameterValues;
    this.invocation = mutableStateOf(new CommandInvocation());
  }

  invoke(client: Client, parameters: Record<string, unknown>): Promise<T> {
    return this.lock.withLock(async () => {
      this.parameters.params = parameters;
      const scope = new InvokeScopeImpl(client, this.info.entry, this.invocation);
      return await this.onInvoke(scope);
    });
  }
}
