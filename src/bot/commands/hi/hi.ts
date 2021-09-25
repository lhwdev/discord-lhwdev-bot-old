import Command from '../../../api/command/Command.ts';
import SlashCommandTrigger from '../../../api/command/triggers/SlashCommandTrigger.ts';
import StringParameter from '../../../api/command/parameter/string.ts';

export default {
  triggers: [SlashCommandTrigger],
  updateable: true,
  declare(s) {
    const p = s.parameters(() => ({
      name: StringParameter,
    }));

    s.onInvoke(async (s) => {
      await s.reply(() => `Hello, ${p.name}`);
      // 아직 reply까지만 있지만...
    });
  },
} as Command<void>;
