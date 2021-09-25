import { Interaction } from '../../../deps/harmony.ts';
import { CommandTriggerScope } from '../CommandScopes.ts';
import CommandTrigger from '../CommandTrigger.ts';

export default new class SlashCommandTrigger extends CommandTrigger {
  register(s: CommandTriggerScope) {
    const listener = (interaction: Interaction) => {
      interaction.respond({});
    };
    s.client.on('interactionCreate', listener);

    return () => s.client.off('interactionCreate', listener);
  }
}();
