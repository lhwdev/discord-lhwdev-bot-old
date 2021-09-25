import Command, { CommandId } from '/api/command/Command.ts';
import { join, resolve } from '/deps/path.ts';
import CommandInfo from '/api/command/CommandInfo.ts';
import { DeclareScopeImpl } from '/api/command/impl/DeclareScopeImpl.ts';
import { Client } from '/deps/harmony.ts';

export default class CommandLoader {
  constructor(public client: Client, public basePath: string) {
    const watcher = Deno.watchFs(basePath);
    (async () => {
      for await (const event of watcher) {
        if (event.kind == 'modify' || event.kind == 'remove') {
          for (const path of event.paths) {
            this.cache.delete(resolve(path));
          }
        }
      }
    })();
  }

  private cache: Map<string, CommandInfo<unknown>> = new Map();

  async load(id: CommandId): Promise<CommandInfo<unknown>> {
    const realPath = resolve(join(this.basePath, id.path));
    const key = realPath;
    const previous = this.cache.get(key);
    if (previous) return previous;

    const value = await import(`file://${realPath}`);
    const command = value.default as Command<unknown>;

    const scope = new DeclareScopeImpl(this.client);
    command.declare(scope);

    const info: CommandInfo<unknown> = {
      command,
      entry: scope.getEntry(),
    };

    this.cache.set(key, info);
    return info;
  }
}
