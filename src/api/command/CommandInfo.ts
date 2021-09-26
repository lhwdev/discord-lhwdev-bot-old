import Command, { CommandId } from './Command.ts';
import { ParametersDeclaration } from './CommandScopes.ts';

type CommandInfo<T> = {
  id: CommandId;
  command: Command<T>;
  entry: CommandEntry;
};
export default CommandInfo;

export type CommandEntry = {
  parameters: ParametersDeclaration;
  subcommands: Record<string, CommandEntry>;
};
