import { DeclareScope } from '/api/command/CommandScopes.ts';
import CommandTrigger from './CommandTrigger.ts';

type Command<R> = {
  triggers: CommandTrigger[];
  updateable?: boolean;
  declare(s: DeclareScope<R>): void;
};

export default Command;

////////

export type CommandId = {
  path: string;
  identifier: string;
};
