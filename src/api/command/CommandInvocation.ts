import Command from './Command.ts';
import { ParameterValues } from './CommandScopes.ts';

export default class CommandInvocation {}

////////

export type CommandInvocationInfo<T> = {
  command: Command<T>;
  // deno-lint-ignore no-explicit-any
  parameters: () => ParameterValues<any>;
  subcommands: CommandInvocationInfo<unknown>[];
};
