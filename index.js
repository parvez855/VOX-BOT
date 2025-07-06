// index.js
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config(); // Load .env locally

// Debug environment variables
console.log('TOKEN:', process.env.TOKEN ? 'Present' : 'Missing');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('MONGO_URI starts with mongodb+srv://:', process.env.MONGO_URI?.startsWith('mongodb+srv://'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

// Load slash commands from ./commands folder
const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Interaction handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (command) {
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error('Error executing command:', err);
      await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
    }
  }
});

// Voice event
const voiceUpdate = require('./events/voiceUpdate');
client.on('voiceStateUpdate', voiceUpdate);

// Connect to MongoDB and then login Discord bot
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    client.login(process.env.TOKEN);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
