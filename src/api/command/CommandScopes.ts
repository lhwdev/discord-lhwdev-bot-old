import { Client, Message } from '/deps/harmony.ts';
import { State } from '/utils/state/state.ts';
import CommandInfo, { CommandEntry } from './CommandInfo.ts';
import CommandParameter from './CommandParameter.ts';
import CommandInvocation from './CommandInvocation.ts';
import CommandManager from '/api/command/CommandManager.ts';
import { ReplyOptions } from '/api/message/reply.ts';

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

  onInvoke(block: (s: InvokeScope) => Promise<T>): void;
  subcommand<ST>(id: string, block: (s: DeclareScope<ST>) => void): void;
}

export interface InvokeScope extends BotScope {
  command: CommandEntry;
  invocation: State<CommandInvocation>;

  reply(
    block: (
      reply: (content: string | ReplyOptions) => void,
    ) => void,
  ): Promise<State<Message>>;
}

export interface CommandTriggerScope extends BotScope {
  manager: CommandManager;
  runCommand<T>(command: CommandInfo<T>, parameters: Record<string, unknown>): Promise<T>;
}
