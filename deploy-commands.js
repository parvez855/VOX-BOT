// deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
for (const file of fs.readdirSync('./commands')) {
  const cmd = require(`./commands/${file}`);
  if (cmd.data) commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
const CLIENT_ID = process.env.CLIENT_ID;

(async () => {
  try {
    console.log('🚀 Deploying GLOBAL slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Global commands deployed! ⚡ May take up to 60 min to show.');
  } catch (err) {
    console.error('❌ Failed to deploy commands:', err);
  }
})();
