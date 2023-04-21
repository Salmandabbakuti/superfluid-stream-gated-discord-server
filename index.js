const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', msg => {
  console.log("a new message...", msg);
  if (msg.author.bot) return;
  switch (msg.content) {
    case 'ping':
      msg.reply('pong');
      break;
    case 'pong':
      msg.reply('ping');
      break;
    case 'ping pong':
      msg.reply('pong ping');
      break;
    case 'time':
      msg.reply(`The time is ${new Date().toLocaleTimeString()}`);
      break;
    case 'date':
      msg.reply(`The date is ${new Date().toLocaleDateString()}`);
      break;
    case 'time date':
      msg.reply(`The time is ${new Date().toLocaleTimeString()} and the date is ${new Date().toLocaleDateString()}`);
      break;
    default:
      msg.reply('I don\'t know what you mean');
  }
});
