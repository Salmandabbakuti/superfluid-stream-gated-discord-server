const {
  Client,
  GatewayIntentBits,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require("discord.js");
const { recoverAddress } = require("@ethersproject/transactions");
const { arrayify } = require("@ethersproject/bytes");
const { hashMessage } = require("@ethersproject/hash");
const { JsonRpcProvider } = require("@ethersproject/providers");
const { Framework } = require("@superfluid-finance/sdk-core");
const cron = require("node-cron");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./prisma");
const {
  BOT_TOKEN,
  RPC_URL,
  JWT_SECRET,
  START_HERE_CHANNEL_ID,
  SERVER_GUILD_ID,
  SERVER_ADMIN_ADDRESS,
  SUPER_DAI_ADDRESS,
  REQUIRED_MINIMUM_FLOW_RATE,
  APP_URL
} = require("./config.js");

const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"]
  })
);

const provider = new JsonRpcProvider(RPC_URL);

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

// Periodic cron job to check streams and add/remove roles accordingly
cron.schedule("0 0 * * *", async () => {
  console.log(
    `Checking streams and adding/removing roles at ${new Date().toUTCString()}`
  );
  const guild = client.guilds.cache.get(SERVER_GUILD_ID);
  const streamerRole = guild.roles.cache.find(
    (role) => role.name === "streamer"
  );

  const members = await prisma.member.findMany();

  await Promise.all(
    members.map(async (member) => {
      const streamFlowRate = await getStreamFlowRate(
        member.walletAddress || "0x0",
        SERVER_ADMIN_ADDRESS
      );
      const guildMember = await guild.members.fetch(member.id);
      console.log(
        `Current flow rate for ${guildMember.user.tag} with wallet ${member.walletAddress} is ${streamFlowRate} DAIx/sec`
      );
      const currentRole = member.role;
      let updatedRole = currentRole;
      if (streamFlowRate >= REQUIRED_MINIMUM_FLOW_RATE) {
        if (currentRole !== "streamer") {
          // add streamer role
          await guildMember.roles
            .add(streamerRole)
            .catch((err) => console.log("failed to add role", err));
          updatedRole = "streamer";
          console.log("added streamer role to member", guildMember.user.tag);
        } else {
          console.log(
            `Stream is active for streamer: ${guildMember.user.tag}. No role changes required.`
          );
        }
      } else {
        if (currentRole !== "member") {
          // remove streamer role
          await guildMember.roles
            .remove(streamerRole)
            .catch((err) => console.log("failed to remove role", err));
          updatedRole = "member";
          console.log(
            "removed streamer role from member",
            guildMember.user.tag
          );
        } else {
          console.log(
            `Stream is not active for member: ${guildMember.user.tag}. No role changes required.`
          );
        }
      }
      // update role in db if changed
      if (updatedRole !== currentRole) {
        await prisma.member.update({
          where: {
            id: member.id
          },
          data: {
            role: updatedRole
          }
        });
      }
    })
  );
  console.log("Done checking streams and adding/removing roles");
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
client.login(BOT_TOKEN);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || msg.system || msg.channel.type === "DM") return;
  if (msg.channelId === START_HERE_CHANNEL_ID) {
    // Basic command handler
    const commands = {
      ping: "pong",
      pong: "ping",
      "ping pong": "pong ping",
      date: new Date().toUTCString()
    };

    const commandResponse = commands[msg.content.toLowerCase()];
    if (commandResponse) {
      msg.reply(commandResponse);
    } else {
      const possibleCommands = [
        "/ping",
        "/verify",
        ...Object.keys(commands)
      ].join(", ");
      msg.reply(
        `I don't know what you mean. I can only respond to the following commands: ${possibleCommands}`
      );
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand())
    return interaction.reply(
      "I don't know what you mean. I can only respond to the following commands: /verify, /ping"
    );
  if (interaction.commandName === "verify") {
    const jwtToken = jwt.sign(
      { guildId: interaction.guildId, memberId: interaction.member.id },
      JWT_SECRET,
      { expiresIn: "5m" } // 5 minutes
    );
    const greeting = "Hello there! Welcome to the server!";
    const steps = [
      `Please Click on Verify with Wallet to verify your wallet address.`,
      `Make sure you have a minimum of 0.5 DAIx/month stream to our server admin account: ${SERVER_ADMIN_ADDRESS} on goerli network`,
      "Once verified, you'll be automatically assigned the streamer role which will give you access to our exclusive channels and perks!"
    ];
    const outro =
      "If you have any questions or encounter any issues, please don't hesitate to reach out to us. Good luck and have fun!";
    const message = greeting + "\n\n" + steps.join("\n") + "\n\n" + outro;
    const verifyWithWalletButton = new ButtonBuilder()
      .setLabel("Verify with Wallet")
      .setStyle(ButtonStyle.Link)
      .setURL(`${APP_URL}?token=${jwtToken}`);
    const actionRow = new ActionRowBuilder().addComponents(
      verifyWithWalletButton
    );
    interaction.reply({
      content: message,
      components: [actionRow],
      ephemeral: true
    });
  } else if (interaction.commandName === "ping") {
    interaction.reply({
      content: "pong!",
      ephemeral: true
    });
  } else {
    interaction.reply({
      content:
        "I don't know what you mean. I can only respond to the following commands: /verify, /ping",
      ephemeral: true
    });
  }
});

client.on("guildMemberAdd", async (member) => {
  // Check if the member has a connected wallet
  console.log("a new member hopped into server");
});

const port = process.env.PORT || 3000;

// verify signature and add wallet address to the member object and then add role if stream is active
app.post("/verify", async (req, res) => {
  if (
    ["token", "address", "message", "signature"].some((key) => !req.body[key])
  )
    return res.status(400).json({
      code: "Bad Request",
      message: "Missing required fields: token/address/message/signature"
    });
  const { token, address, message, signature } = req.body;
  try {
    console.log("verifying signature and checking stream");
    const digest = arrayify(hashMessage(message));
    const recoveredAddress = recoverAddress(digest, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase())
      return res
        .status(401)
        .send({ code: "Unauthorized", message: "Invalid wallet signature" });
    // update member object with wallet address
    const { guildId, memberId } = jwt.verify(token, JWT_SECRET);
    console.log("decoded from token", { guildId, memberId });
    const guild = client.guilds.cache.get(guildId);
    const member = await guild.members.fetch(memberId);
    // member.walletAddress = address;
    await prisma.member.upsert({
      where: {
        id: memberId
      },
      update: {
        walletAddress: address,
        role: "streamer"
      },
      create: {
        id: memberId,
        walletAddress: address,
        role: "streamer"
      }
    });

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
        `Hey <@${memberId}>, your wallet address ${address} has been verified and you have been given the streamer role. You can now access the #superfluid-exclusive channel.`
      );
      return res.status(200).json({ code: "ok", message: "Success" });
    } else {
      // reply in discord channel that role has not been added
      startHereChannel.send(
        `Hey <@${memberId}>, your wallet address ${address} has been verified but You don't have enough stream to access #superfluid-exclusive channel. A minimum of 0.5 DAIx/month stream to ${SERVER_ADMIN_ADDRESS} on goerli network is required.`
      );
      return res.status(200).json({ code: "ok", message: "Success" });
    }
  } catch (err) {
    console.log("failed to verify user:", err);
    return res
      .status(500)
      .json({ code: "Internal Server Error", message: err.message });
  }
});

app.get("/", (req, res) => {
  res.send(__dirname + "/public/index.html");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
