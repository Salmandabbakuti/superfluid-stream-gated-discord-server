const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.login(process.env.BOT_TOKEN);

const ADMIN_ADDRESS = "";

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', msg => {
  console.log("a new message...", msg);
  if (msg.author.bot) return;
  if (msg.channelId === "1098594000585379934") {
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
        msg.reply('I don\'t know what you mean. I can only respond to the following commands: ping, pong, ping pong, time, date, time date');
    }

    // logic for the superfluid-exclusive channel
    if (msg.content.startsWith("!address")) {
      const userAddress = msg.content.split(" ")[1];
      if (!userAddress) return msg.reply("Please provide an address: !address <address>");
      // Check for a stream between the specified address and the admin address
      const isAdminAddress = true; // TODO: Implement stream check
      const hasStream = true; // TODO: Implement stream check

      if (isAdminAddress && hasStream) {
        // Assign the "streamer" role to the user
        const streamerRole = msg.guild.roles.cache.find(role => role.name === 'streamer');
        msg.member.roles.add(streamerRole);

        // Send a message to the user letting them know they have access to the channel
        msg.reply("Your address is: " + userAddress);
        return msg.reply('You now have access to the superfluid-exclusive channel!');
      }
    }
  }
});
