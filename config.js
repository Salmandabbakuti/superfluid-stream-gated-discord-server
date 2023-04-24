require("dotenv").config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  RPC_URL: process.env.RPC_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  SERVER_APPLICATION_ID: process.env.SERVER_APPLICATION_ID,
  START_HERE_CHANNEL_ID: process.env.START_HERE_CHANNEL_ID || "1098594000585379934",
  SERVER_GUILD_ID: process.env.SERVER_GUILD_ID || "1098594000115597353",
  SERVER_ADMIN_ADDRESS: process.env.SERVER_ADMIN_ADDRESS || "0x7348943c8d263ea253c0541656c36b88becd77b9",
  SUPER_TOKEN_CHAIN_ID: +process.env.SUPER_TOKEN_CHAIN_ID || 5,
  SUPER_TOKEN_ADDRESS: process.env.SUPER_TOKEN_ADDRESS || "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00",
  REQUIRED_MINIMUM_FLOW_RATE: 192901234567, // 192901234567 is 0.5 DAIx/month to consider access to the channel. we can think of it as a subscription to access channel content
  APP_URL: process.env.APP_URL || "http://localhost:8080"
};
