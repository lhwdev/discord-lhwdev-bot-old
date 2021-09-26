import { Client, Message } from '/deps/harmony.ts';
import { State } from '/utils/state/state.ts';
import { CommandEntry } from '/api/command/CommandInfo.ts';
import CommandInvocation from '/api/command/CommandInvocation.ts';
import { InvokeScope } from '/api/command/CommandScopes.ts';
import { ReplyOptions } from '../../message/reply.ts';

export default class InvokeScopeImpl implements InvokeScope {
  constructor(
    public client: Client,
    public command: CommandEntry,
    public invocation: State<CommandInvocation>,
  ) {}

  reply(
    block: (
      reply: (content?: string | ReplyOptions) => void,
    ) => void,
  ): Promise<State<Message>> {
    block((_c) => {});
    throw new Error('Method not implemented.');
  }
}
