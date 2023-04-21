const { Client, GatewayIntentBits } = require("discord.js");
const { getAddress } = require("@ethersproject/address");
const { JsonRpcProvider } = require("@ethersproject/providers");
const { Framework } = require("@superfluid-finance/sdk-core");
const cron = require("node-cron");
require("dotenv").config();

const START_HERE_CHANNEL_ID = "1098594000585379934";
const SERVER_GUILD_ID = "1098594000115597353";
const SERVER_ADMIN_ADDRESS = "0x7348943c8d263ea253c0541656c36b88becd77b9";
const SUPER_DAI_ADDRESS = "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00";

const provider = new JsonRpcProvider(process.env.RPC_URL);
// Create a new Superfluid SDK instance

const isAddressValid = (address) => {
  try {
    getAddress(address);
    return true;
  } catch (error) {
    return false;
  }
};

const getStreamFlowRate = async (sender, receiver) => {
  try {
    const sf = await Framework.create({
      provider,
      chainId: 5
    });
    const { flowRate } = await sf.cfaV1.getFlow({
      superToken: SUPER_DAI_ADDRESS,
      sender,
      receiver,
      providerOrSigner: provider,

    });
    return flowRate;
  } catch (error) {
    console.log("err getting flow info", error);
    return 0;
  }
};

cron.schedule("0 0 * * *", async () => {
  // code to check streams and remove role goes here
  console.log("running cron job to check streams and remove roles if stream is not active");
  const guild = client.guilds.cache.get(SERVER_GUILD_ID);
  const streamerRole = guild.roles.cache.find((role) => role.name === "streamer");
  // console.log("streamer role", streamerRole);
  const membersWithRole = guild.members.cache.filter((member) => member.roles.cache.has(streamerRole.id));
  console.log("membersWithRole", membersWithRole);

  for (const [memberID, member] of membersWithRole) {
    const userAddress = "0x..."; // get user address from member object
    const streamFlowRate = await getStreamFlowRate(
      userAddress.toLowerCase(),
      SERVER_ADMIN_ADDRESS
    );
    if (streamFlowRate === 0) {
      await member.roles.remove(streamerRole);
    }
  }

});


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.login(process.env.BOT_TOKEN);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  console.log("msg", msg);
  if (msg.author.bot || msg.channel.type === "DM") return;

  if (msg.channelId === START_HERE_CHANNEL_ID) {
    if (msg.content.toLowerCase().startsWith("!address")) {
      const userAddress = msg.content.split(" ")[1];
      if (!userAddress || !isAddressValid(userAddress)) {
        return msg.reply("Invalid address provided.");
      }
      const streamFlowRate = await getStreamFlowRate(
        userAddress.toLowerCase(),
        SERVER_ADMIN_ADDRESS
      );
      console.log(streamFlowRate);
      if (streamFlowRate > 0) {
        const streamerRole = msg.guild.roles.cache.find(
          (role) => role.name === "streamer"
        );
        await msg.member.roles.add(streamerRole);
        msg.reply(`Your address is: ${userAddress}\nYou now have access to the superfluid-exclusive channel!`);
      } else {
        msg.reply("You do not have a stream between your address and the server admin address to access the #superfluid-exclusive channel.");
      }
    } else {
      const commands = [
        ["ping", "pong"],
        ["pong", "ping"],
        ["ping pong", "pong ping"],
        ["time", new Date().toLocaleTimeString()],
        ["date", new Date().toLocaleDateString()],
        ["time date", `The time is ${new Date().toLocaleTimeString()} and the date is ${new Date().toLocaleDateString()}`],
      ];
      const command = commands.find((c) => c[0] === msg.content.toLowerCase());
      if (command) {
        msg.reply(command[1]);
      } else {
        msg.reply(`I don't know what you mean. I can only respond to the following commands: ${commands.map((c) => c[0]).join(", ")}`);
      }
    };
  }
});
