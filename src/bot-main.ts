import { Client, GatewayIntents } from '/deps/harmony.ts';
import { green } from '/deps/color.ts';
import getConfig from '/utils/config.ts';

const config = await getConfig();
const client = new Client();

client.on('ready', () => {
  console.log(green('ready!'));
});

client.on('messageCreate', async (msg) => {
  if (msg.content.startsWith('!hello')) {
    msg.addReaction('✅');
    await msg.reply('hello!', { allowedMentions: { users: [] } });
  }
});

client.connect(config.secret.discord.token, [
  GatewayIntents.DIRECT_MESSAGES,
  GatewayIntents.GUILDS,
  GatewayIntents.GUILD_MESSAGES,
]);
