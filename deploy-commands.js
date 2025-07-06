// deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands');

// Load all commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON()); // Important
}

const CLIENT_ID = process.env.CLIENT_ID;
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🚀 Deploying GLOBAL slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });
    console.log('✅ Global slash commands deployed successfully!');
    console.log('🕒 It may take 5–60 minutes to appear in all servers.');
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
