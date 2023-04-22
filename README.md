# Superfluid Stream Gated Discord Server

This project aims to gate Discord server/channels with Superfluid streams. Exclusive channel content and perks can be accessed by users who are streaming super tokens to the server admin account through the Superfluid protocol.

### Prerequisites

1. A Discord account
2. Understanding of the Superfluid protocol and how to stream tokens
3. An Ethereum wallet with some tokens to stream. You can get some test tokens from the [Superfluid faucet](https://app.superfluid.finance/).
4. Stream a minimum of `0.5DAIx/month` to the server admin account `0x7348943c8d263ea253c0541656c36b88becd77b9` on `goerli` testnet. You can use the [Superfluid app](https://app.superfluid.finance/) to do this.

### Steps:

1. Join the [TechNow Discord Server](https://discord.gg/JEMFf5ux5M)

2. Make sure you are streaming a minimum of `0.5 DAIx/month` to `0x7348943c8d263ea253c0541656c36b88becd77b9` on `goerli`.

3. Open the `#⁠start-here` channel on discord server.

4. Type the command `/verify` in the channel.

5. Our bot will send you a link to connect your wallet and sign a message.

6. After you sign the message, the bot will verify if a minimum of `0.5 DAIx/month` stream is present between your wallet address and the server admin address.

7. If the stream is present, you will be assigned the `streamer` role and gain access to the exclusive channels and perks on the server.

## Getting Started (as Developer)

### Prerequisites

1. A Discord account
2. A Discord server where you have permissions to manage roles and channels and add bots.
3. An Ethereum wallet with some tokens to stream. You can get some test tokens from the [Superfluid faucet](https://app.superfluid.finance/).

### Steps:

1. Create a new Discord server and create the necessary channels(`#start-here`, `#superfluid-exclusive`) and roles(`streamer`, `member`). `#start-here` channel should be the first channel in the server. `#superfluid-exclusive` is the channel where we want to gate the server. so make sure in the channel `settings` > `permisions`, the `@everyone` role does not have access to the channel. only the `streamer` role should have access to the channel.

![sf-exclusive-permissions](https://user-images.githubusercontent.com/29351207/233772777-4ca61378-8406-4a09-b9a9-35f051fb284f.png)

2. Create a new Discord bot [Discord Developer Portal](https://discord.com/developers/applications) with necessary permissions and invite it to the server.

![sf-bot-intents](https://user-images.githubusercontent.com/29351207/233772853-9c023857-2fe8-4461-8916-d160b9cbb9fa.png)

![sf-bot-permissions](https://user-images.githubusercontent.com/29351207/233772866-b3376cdf-c27f-4e43-824e-c8a1f38af1cf.png)

3. Replace `.env.example` with `.env` and fill in the environment variables.

4. Deploy slash commands by running `npm run commands:deploy` in the root directory

5. Start the bot by running `npm start` in the root directory

6. Test the bot by typing `/verify` in the `#start-here` channel.

7. If the bot is working correctly, you should see the `streamer` role being assigned to users(ofcourse only if they stream required amount) and the `#superfluid-exclusive` channel being unlocked.

### Troubleshooting

If you encounter any issues with the bot, please do the following:

1. Check that the bot has the necessary permissions in the server (Manage Roles, Manage Channels, Manage Messages)
2. Check that the environment variables have been set up correctly in the .env file
3. Check the logs for any error messages

## Built With

- [Superfluid](https://docs.superfluid.finance/) - A revolutionary asset streaming protocol that brings subscriptions, salaries, vesting, and rewards to DAOs and crypto-native businesses worldwide.
- [Discord](https://discord.com/) - A free communications app that lets you share voice, video, and text chat with friends, game communities, and developers.
- [Discord.js](https://discord.js.org/) - A powerful Node.js module that allows you to interact with the Discord API very easily.

## Credits & Resources:

- [Superfluid Wavepool ideas](https://superfluidhq.notion.site/Superfluid-Wave-Project-Ideas-7e8c792758004bd2ae452d1f9810cc58)
- [Discord.js](https://discordjs.guide/)
- [Superfluid Guides](https://docs.superfluid.finance/superfluid/resources/integration-guides)

## Safety

This is experimental software and subject to change over time.

This package is not audited and has not been tested for security. Use at your own risk.
I do not give any warranties and will not be liable for any loss incurred through any use of this codebase.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
