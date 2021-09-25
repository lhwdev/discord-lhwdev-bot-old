import { CommandTriggerScope } from './CommandScopes.ts';

export default abstract class CommandTrigger {
  abstract register(s: CommandTriggerScope): (() => void);
}
