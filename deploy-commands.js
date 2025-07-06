const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands');

// Load all commands with safety checks
for (const file of commandFiles) {
  if (!file.endsWith('.js')) continue;
  const command = require(`./commands/${file}`);

  // Ensure command.data exists and has required properties
  if (!command.data || !command.data.name || !command.data.description) {
    console.warn(`Skipping invalid command file: ${file}`);
    continue;
  }

  commands.push({
    name: command.data.name,
    description: command.data.description,
    options: command.data.options || [],
  });
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // Required for guild commands (dev/testing)

const isDev = process.env.NODE_ENV === 'dev';

const route = isDev
  ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
  : Routes.applicationCommands(CLIENT_ID);

(async () => {
  try {
    console.log(`🚀 Deploying ${isDev ? 'DEV (guild)' : 'GLOBAL'} commands...`);
    await rest.put(route, { body: commands });
    console.log('✅ Commands deployed successfully!');
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
