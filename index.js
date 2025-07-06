const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();

// Load slash commands
const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Handle interaction
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (command) await command.execute(interaction);
});

// Voice event
const voiceUpdate = require('./events/voiceUpdate');
client.on('voiceStateUpdate', voiceUpdate);

// MongoDB connection + bot login
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  client.login(process.env.TOKEN);
});
