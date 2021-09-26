import { CommandId } from './Command.ts';
import CommandInfo from './CommandInfo.ts';

export default abstract class CommandManager {
  abstract loadCommand(id: CommandId): Promise<CommandInfo<unknown>>;

  abstract invokeCommand<T>(
    command: CommandInfo<T>,
    parameters: Record<string, unknown>,
  ): Promise<T>;
}
