const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const config = require('./config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands');

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push({
    name: command.data.name,
    description: command.data.description,
    options: command.data.options
  });
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Deploying commands...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('Commands deployed.');
  } catch (err) {
    console.error(err);
  }
})();
