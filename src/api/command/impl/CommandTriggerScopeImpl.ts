import { Client } from '/deps/harmony.ts';
import CommandInfo from '/api/command/CommandInfo.ts';
import { CommandTriggerScope } from '/api/command/CommandScopes.ts';
import CommandManager from '/api/command/CommandManager.ts';

export default class CommandTriggerScopeImpl implements CommandTriggerScope {
  constructor(public client: Client, public manager: CommandManager) {}

  runCommand<T>(command: CommandInfo<T>, parameters: Record<string, unknown>): Promise<T> {
    return this.manager.invokeCommand(command, parameters);
  }
}
