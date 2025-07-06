const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands');

// Load all commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push({
    name: command.data.name,
    description: command.data.description,
    options: command.data.options
  });
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Choose route based on environment
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // only needed for dev

const route =
  process.env.NODE_ENV === "dev"
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);

(async () => {
  try {
    console.log(`🚀 Deploying ${process.env.NODE_ENV === "dev" ? "DEV" : "GLOBAL"} commands...`);
    await rest.put(route, { body: commands });
    console.log("✅ Commands deployed.");
  } catch (err) {
    console.error("❌ Error deploying:", err);
  }
})();
