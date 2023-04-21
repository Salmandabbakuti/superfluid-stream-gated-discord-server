const { Client, GatewayIntentBits } = require("discord.js");
const { getAddress } = require("@ethersproject/address");
const { recoverAddress } = require("@ethersproject/transactions");
const { arrayify } = require("@ethersproject/bytes");
const { hashMessage } = require("@ethersproject/hash");
const { JsonRpcProvider } = require("@ethersproject/providers");
const { Framework } = require("@superfluid-finance/sdk-core");
const cron = require("node-cron");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"]
  })
);

const START_HERE_CHANNEL_ID = "1098594000585379934";
const SERVER_GUILD_ID = "1098594000115597353";
const SERVER_ADMIN_ADDRESS = "0x7348943c8d263ea253c0541656c36b88becd77b9";
const SUPER_DAI_ADDRESS = "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00";
const REQUIRED_MINIMUM_FLOW_RATE = 192901234567; // 192901234567 is 0.5 DAIx/month to consider access to the channel. we can think of it as a subscription to access channel content
const APP_URL = "http://localhost:8080";
const provider = new JsonRpcProvider(process.env.RPC_URL);

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
      providerOrSigner: provider
    });
    return flowRate;
  } catch (error) {
    console.log("err getting flow info", error);
    return 0;
  }
};

cron.schedule("0 0 * * *", async () => {
  // code to check streams and remove role goes here
  console.log(
    "running cron job to check streams and remove roles if stream is not active"
  );
  const guild = client.guilds.cache.get(SERVER_GUILD_ID);
  const streamerRole = guild.roles.cache.find(
    (role) => role.name === "streamer"
  );
  // console.log("streamer role", streamerRole);
  const membersWithRole = guild.members.cache.filter((member) =>
    member.roles.cache.has(streamerRole.id)
  );
  // console.log("membersWithRole", membersWithRole);

  for (const [memberID, member] of membersWithRole) {
    const userAddress = member.walletAddress;
    const streamFlowRate = await getStreamFlowRate(
      userAddress.toLowerCase(),
      SERVER_ADMIN_ADDRESS
    );
    if (streamFlowRate < REQUIRED_MINIMUM_FLOW_RATE) {
      await member.roles.remove(streamerRole);
    }
  }
});

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
  const joinCommandResponse = (msg) => {
    // prepare jwt token with guidid, memberid and user address
    console.log("ssss", msg.guildId, msg.member.id);
    const token = jwt.sign(
      { guildId: msg.guildId, memberId: msg.member.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // send message with link to app url with token
    return `Please visit ${APP_URL}/?token=${token} to verify your wallet address and join the server`;
  };
  if (msg.author.bot || msg.channel.type === "DM") return;

  if (msg.channelId === START_HERE_CHANNEL_ID) {
    // Basic command handler
    const commands = [
      ["ping", "pong"],
      ["pong", "ping"],
      ["ping pong", "pong ping"],
      ["time", new Date().toLocaleTimeString()],
      ["date", new Date().toLocaleDateString()],
      [
        "time date",
        `The time is ${new Date().toLocaleTimeString()} and the date is ${new Date().toLocaleDateString()}`
      ],
      ["/join", joinCommandResponse(msg)]
    ];
    const command = commands.find((c) => c[0] === msg.content.toLowerCase());
    if (command) {
      msg.reply(command[1]);
    } else {
      msg.reply(
        `I don't know what you mean. I can only respond to the following commands: ${commands
          .map((c) => c[0])
          .join(", ")}`
      );
    }
  }
});

client.on("guildMemberAdd", async (member) => {
  // Check if the member has a connected wallet
  console.log("member hopped into server", member);
});

const port = process.env.PORT || 3000;

// verify signature and add wallet address to the member object and then add role if stream is active
app.post("/verify", async (req, res) => {
  if (
    ["token", "address", "message", "signature"].some((key) => !req.body[key])
  )
    return res.status(400).send("Invalid request");
  const { token, address, message, signature } = req.body;
  try {
    const digest = arrayify(hashMessage(message));
    const recoveredAddress = recoverAddress(digest, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase())
      return res.status(401).send("Invalid signature");
    // update member object with wallet address
    const { guildId, memberId } = jwt.verify(token, process.env.JWT_SECRET);
    console.log("rrrr", guildId, memberId);
    const guild = client.guilds.cache.get(guildId);
    const member = await guild.members.fetch(memberId);
    console.log("member rrr", member);
    // console.log("streamerRole", streamerRole);
    member.walletAddress = address;
    // console.log("member", member);
    // console.log("streamerRole", streamerRole);
    // add wallet address to member object

    const streamFlowRate = await getStreamFlowRate(
      address.toLowerCase(),
      SERVER_ADMIN_ADDRESS
    );
    const startHereChannel = guild.channels.cache.get(START_HERE_CHANNEL_ID);
    if (streamFlowRate >= REQUIRED_MINIMUM_FLOW_RATE) {
      const streamerRole = guild.roles.cache.find(
        (role) => role.name === "streamer"
      );
      await member.roles.add(streamerRole);
      // reply in discord channel that role has been added
      startHereChannel.send(
        `Hey <@${memberId}>, your wallet address has been verified and you have been given the streamer role. You can now access the #superfluid-exclusive channel.`
      );
      return res.status(200).send("Success");
    } else {
      // reply in discord channel that role has not been added
      startHereChannel.send(
        `Hey <@${memberId}>, your wallet address has been verified but You don't have enough stream to access #superfluid-exclusive channel. A minimum of 0.5 DAIx/month stream to ${SERVER_ADMIN_ADDRESS} on goerli network is required.`
      );
      return res.status(200).send("Success");
    }
  } catch (err) {
    console.log("err", err);
    return res.status(500).send("Something went wrong");
  }
});
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
