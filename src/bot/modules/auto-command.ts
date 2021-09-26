// A entry point for all commands.
// This simply uses CommandLoader and CommandParser to locate and execute commands.
import { Client } from '/deps/harmony.ts';
import { observeState } from '/utils/state/observe.ts';
import { WatchedImport } from '/utils/WatchedImport.ts';
import CommandTrigger from '/api/command/CommandTrigger.ts';
import CommandTriggerScopeImpl from '/api/command/impl/CommandTriggerScopeImpl.ts';
import CommandManagerImpl from '/api/command/impl/CommandManagerImpl.ts';

export async function commandModule(client: Client) {
  const manager = new CommandManagerImpl(client, 'src/bot/commands');
  const triggersState = WatchedImport<CommandTrigger[]>('src/bot/modules/command/triggers.ts');

  let handles: (() => void)[] = [];
  const scope = new CommandTriggerScopeImpl(client, manager);

  for await (const triggers of observeState<Promise<CommandTrigger[]>>(triggersState)) {
    for (const handle of handles) handle();
    handles = [];

    for (const trigger of await triggers) {
      handles.push(trigger.register(scope));
    }
  }
}
