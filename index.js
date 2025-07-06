const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config(); // Only once at the top

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

// Load slash commands
const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Handle interaction
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (command) await command.execute(interaction);
});

// Voice event
const voiceUpdate = require('./events/voiceUpdate');
client.on('voiceStateUpdate', voiceUpdate);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    // Login the Discord bot only after successful DB connection
    client.login(process.env.TOKEN);
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
