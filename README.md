# Superfluid Stream Gated Discord Server

This project aims to gate a Discord server/channels with Superfluid streams. Exclusive channel content and perks can be accessed by users who are streaming super tokens to the server admin account through the Superfluid protocol. This project also includes periodic checks to ensure that all users with the `streamer` role are actively streaming to our server admin. If a user's stream is terminated or their flow rate is reduced, The bot will automatically remove the `streamer` role from their account to prevent them from accessing our exclusive channels and perks until they start streaming again.

### Prerequisites

1. A Discord account
2. Understanding of the Superfluid protocol and how to stream tokens
3. An Ethereum wallet with some tokens to stream. You can get some test tokens from the [Superfluid faucet](https://app.superfluid.finance/).
4. Stream a minimum of `0.5DAIx/month` to the server admin account `0x7348943c8d263ea253c0541656c36b88becd77b9` on `goerli` testnet. You can use the [Superfluid app](https://app.superfluid.finance/) to do this.

### Steps:

1. Join the TechNow Discord Server: https://discord.gg/JEMFf5ux5M

2. Make sure you are streaming a minimum of `0.5 DAIx/month` to `0x7348943c8d263ea253c0541656c36b88becd77b9` on `goerli` if you wanted to access exclusive stream gated channels.

3. Open the `#⁠start-here` channel on discord server.

4. Type the command `/verify` in the channel.

5. Our bot will send you a link to connect your wallet and sign a message.

6. After you sign the message, the bot will verify if a minimum of `0.5 DAIx/month` stream is present between your wallet address and the server admin address.

7. If the stream is present, you will be assigned the `streamer` role and gain access to the exclusive channels and perks on the server. If the stream is not present, you will still be assigned the `member` role, which will allow you access to the general channels on the server.

### Demo

https://user-images.githubusercontent.com/29351207/234182032-b19f8dd1-48f3-4061-84f2-0135714c6fec.mp4

## Getting Started (as Developer)

### Prerequisites

1. A Discord account
2. A Discord server where you have permissions to manage roles and channels and add bots.
3. An Ethereum wallet with some tokens to stream. You can get some test tokens from the [Superfluid faucet](https://app.superfluid.finance/).

### Steps:

1. Create a new Discord server and create the necessary channels(`#start-here`, `#superfluid-exclusive`, `#general`) and roles(`streamer`, `member`). `#start-here` channel should be the first channel in the server. `#superfluid-exclusive` is the channel that we wanted to gate with stream. so make sure in the channel `settings` > `permisions`, the `@everyone` role does not have access to the channel. only the `streamer` role should have access to the channel. Also, Upon verifying with the wallet, regardless of whether a stream is present or not, a `member` role will be added to the user. This member role will allow them access to the general channels in the server. So make sure in `#general` channel `settings` > `permisions`, the `@everyone` role doesn't have access to the channel. only the `streamer` and `member` roles should have access to the channel.

![sf-exclusive-permissions](https://user-images.githubusercontent.com/29351207/233772777-4ca61378-8406-4a09-b9a9-35f051fb284f.png)

2. Create a new Discord bot at [Discord Developer Portal](https://discord.com/developers/applications) with necessary permissions and invite it to the server.

![sf-bot-intents](https://user-images.githubusercontent.com/29351207/233772853-9c023857-2fe8-4461-8916-d160b9cbb9fa.png)

![sf-bot-permissions](https://user-images.githubusercontent.com/29351207/233772866-b3376cdf-c27f-4e43-824e-c8a1f38af1cf.png)

3. Replace `.env.example` with `.env` and fill in the environment variables.

4. Install dependencies by running `npm install` in the root directory

5. Sync the local schema to database by running `npx prisma db push` in the root directory

6. Deploy slash commands by running `npm run commands:deploy` in the root directory

7. Start the bot by running `npm start` in the root directory

8. Test the bot by typing `/verify` in the `#start-here` channel.

9. If the bot is working correctly, you should see the `streamer` role being assigned to users(ofcourse only if they stream required amount) upon verifying wallet and the `#superfluid-exclusive` channel being unlocked.

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
- [Prisma](https://www.prisma.io/docs)

## Safety

This is experimental software and subject to change over time.

This is a proof of concept and is not ready for production use. It is not audited and has not been tested for security. Use at your own risk.
I do not give any warranties and will not be liable for any loss incurred through any use of this codebase.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
