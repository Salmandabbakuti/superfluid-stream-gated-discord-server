const { Client, GatewayIntentBits } = require("discord.js");
const { getAddress } = require("@ethersproject/address");
const { Framework } = require("@superfluid-finance/sdk-core");
const { JsonRpcProvider } = require('@ethersproject/providers');
const { Contract } = require('@ethersproject/contracts');
require("dotenv").config();


const abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function getFlowRate(address sender, address receiver) view returns (int96)",
];

const SERVER_ADMIN_ADDRESS = "0x7348943c8d263ea253c0541656c36b88becd77b9";

const cfav1Address = "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00";



const getStreamFlowRate = async (sender, receiver) => {
  try {
    const flowRate = await cfav1.getFlowRate(sender, receiver);
    return flowRate;
  } catch (error) {
    return 0;
  }

};
const isAddress = address => {
  try {
    getAddress(address);
    return true;
  } catch (error) {
    return false;
  }
};

const provider = new JsonRpcProvider(process.env.RPC_URL);
console.log("provider", provider);

const cfav1 = new Contract(cfav1Address, abi, provider);
console.log("cfav1", cfav1);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
client.login(process.env.BOT_TOKEN);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || msg.channel.type === "DM") return;

  if (msg.channelId === "1098594000585379934") {
    // #superfluid-exclusive channel
    if (msg.content.toLowerCase().startsWith("!address")) {
      const userAddress = msg.content.split(" ")[1];
      if (!userAddress)
        return msg.reply("Please provide an address: !address <address>");
      if (!isAddress(userAddress)) return msg.reply("Invalid address provided.");
      // Check for a stream between the specified address and the admin address

      const streamFlowRate = await getStreamFlowRate(userAddress.toLowerCase(), SERVER_ADMIN_ADDRESS);
      console.log(streamFlowRate);

      if (streamFlowRate > 0) {
        // Assign the "streamer" role to the user
        const streamerRole = msg.guild.roles.cache.find(
          (role) => role.name === "streamer"
        );
        await msg.member.roles.add(streamerRole);

        // Send a message to the user letting them know they have access to the channel
        msg.reply("Your address is: " + userAddress);
        return msg.reply(
          "You now have access to the superfluid-exclusive channel!"
        );
      } else {
        // Send a message to the user letting them know they do not have access to the channel
        return msg.reply(
          "You do not have a stream between your address and the server admin address to access the #superfluid-exclusive channel."
        );
      }
    }

    // basic commands
    switch (msg.content.toLowerCase()) {
      case "ping":
        msg.reply("pong");
        break;
      case "pong":
        msg.reply("ping");
        break;
      case "ping pong":
        msg.reply("pong ping");
        break;
      case "time":
        msg.reply(`The time is ${new Date().toLocaleTimeString()}`);
        break;
      case "date":
        msg.reply(`The date is ${new Date().toLocaleDateString()}`);
        break;
      case "time date":
        msg.reply(
          `The time is ${new Date().toLocaleTimeString()} and the date is ${new Date().toLocaleDateString()}`
        );
        break;
      default:
        msg.reply(
          "I don't know what you mean. I can only respond to the following commands: ping, pong, ping pong, time, date, time date"
        );
        break;
    }
  }
});
