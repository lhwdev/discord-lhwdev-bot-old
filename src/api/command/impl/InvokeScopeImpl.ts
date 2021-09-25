import { Client, Message } from '../../../deps/harmony.ts';
import { mutableStateOf, State } from '../../../utils/state/state.ts';
import { CommandEntry } from '../../command/CommandInfo.ts';
import CommandInvocation from '../../command/CommandInvocation.ts';
import { InvokeScope } from '../../command/CommandScopes.ts';

export default class InvokeScopeImpl<T> implements InvokeScope<T> {
  constructor(public client: Client, public command: CommandEntry) {}

  invocation: State<CommandInvocation> = mutableStateOf(new CommandInvocation());

  reply(
    block: (
      reply: (content?: string | ReplyOptions) => void,
    ) => void,
  ): Promise<State<Message>> {
    throw new Error('Method not implemented.');
  }
}