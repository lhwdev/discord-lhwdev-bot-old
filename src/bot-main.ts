import { Client, GatewayIntents } from './deps.ts'





const client = new Client();

client.on('ready', () => {
    console.log('ready!');
})

client.on("messageCreate", async (msg) => {
    await msg.reply('hello!')
})

client.connect('super secret token comes here', [
    GatewayIntents.DIRECT_MESSAGES,
    GatewayIntents.GUILDS,
    GatewayIntents.GUILD_MESSAGES
])
