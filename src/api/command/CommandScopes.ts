import CommandParameter from './CommandParameter.ts';
import { State } from '../../utils/state/state.ts';
import CommandInvocation from './CommandInvocation.ts';
import { AllMessageOptions, Client, Message } from '../../deps/harmony.ts';
import CommandLoader from './loader/CommandLoader.ts';
import CommandInfo, { CommandEntry } from './CommandInfo.ts';

type UnwrapCommandParameter<P extends CommandParameter<unknown>> = ReturnType<P['parse']>;

export type ParametersDeclaration = Record<string, CommandParameter<unknown>>;

export type ParameterValues<P extends ParametersDeclaration> =
  & { [T in keyof P]: UnwrapCommandParameter<P[T]> }
  & { states: { [T in keyof P]: State<UnwrapCommandParameter<P[T]>> } };

export interface BotScope {
  client: Client;
}

export interface DeclareScope<T> extends BotScope {
  parameters<P extends ParametersDeclaration>(parameters: () => P): ParameterValues<P>;

  onInvoke(block: (s: InvokeScope<T>) => Promise<T>): void;
  subcommand<ST>(id: string, block: (s: DeclareScope<ST>) => void): void;
}

export interface InvokeScope<T> extends BotScope {
  command: CommandEntry;
  invocation: State<CommandInvocation>;

  reply(
    block: (
      reply: (content?: string | AllMessageOptions, option?: AllMessageOptions) => void,
    ) => void,
  ): Promise<State<Message>>;
}

export interface CommandTriggerScope extends BotScope {
  loader: CommandLoader;
  runCommand<T>(command: CommandInfo<T>, parameters: Record<string, unknown>): T;
}
