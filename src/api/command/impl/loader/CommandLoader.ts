import Command, { CommandId } from '/api/command/Command.ts';
import { join, resolve } from '/deps/path.ts';
import CommandInfo from '/api/command/CommandInfo.ts';
import { DeclareScopeImpl } from '/api/command/impl/DeclareScopeImpl.ts';
import { Client } from '/deps/harmony.ts';
import LoadedCommand from '/api/command/impl/LoadedCommand.ts';

export default class CommandLoader<LC extends LoadedCommand<unknown>> {
  constructor(
    public client: Client,
    public basePath: string,
    private createLoadedCommand: (
      info: CommandInfo<unknown>,
      scope: DeclareScopeImpl<unknown>,
    ) => LC,
  ) {
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

  private cache: Map<string, LC> = new Map();

  async load(id: CommandId): Promise<LC> {
    const realPath = resolve(join(this.basePath, id.path));
    const key = id.identifier;
    const previous = this.cache.get(key);
    if (previous) return previous;

    const value = await import(`file://${realPath}`);
    const command = value.default as Command<unknown>;

    const scope = new DeclareScopeImpl(this.client);
    command.declare(scope);

    const entry = scope.getEntry();
    const info: CommandInfo<unknown> = {
      id,
      command,
      entry,
    };
    const loaded = this.createLoadedCommand(info, scope);

    this.cache.set(key, loaded);
    return loaded;
  }

  getCache(id: CommandId): LC | null {
    return this.cache.get(id.identifier) ?? null;
  }
}
