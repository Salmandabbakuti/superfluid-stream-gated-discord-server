const { REST, Routes } = require("discord.js");
const { BOT_TOKEN, SERVER_GUILD_ID, SERVER_APPLICATION_ID } = require("./config.js");
require("dotenv").config();

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
    async execute(interaction) {
      await interaction.reply("Pong!");
    }
  },
  {
    name: "verify",
    description:
      "allows you to verify your wallet with stream and join the server"
  }
];
// Grab all the command folders from the commands directory you created earlier
for (const command of commands) {
  console.log(command);
  console.log(`[INFO] Loaded command ${command.name}.`);
  // if name or execute is missing, throw an error
  if (!command.description || !command.execute) {
    console.log(
      `[WARNING] The command ${command.name} is missing a required "description" or "execute" property.`
    );
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(BOT_TOKEN);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(SERVER_APPLICATION_ID, SERVER_GUILD_ID),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error("Error while refreshing application (/) commands:", error);
  }
})();
