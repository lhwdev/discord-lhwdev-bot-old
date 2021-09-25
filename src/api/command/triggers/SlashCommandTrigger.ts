import { Interaction } from '/deps/harmony.ts';
import { CommandTriggerScope } from '/api/command/CommandScopes.ts';
import CommandTrigger from '/api/command/CommandTrigger.ts';

export default new class SlashCommandTrigger extends CommandTrigger {
  register(s: CommandTriggerScope) {
    const listener = (interaction: Interaction) => {
      interaction.respond({});
    };
    s.client.on('interactionCreate', listener);

    return () => s.client.off('interactionCreate', listener);
  }
}();
