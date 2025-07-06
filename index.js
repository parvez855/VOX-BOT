const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');

// Debug environment variables to verify Render is loading them correctly
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

// Load slash commands
const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Error executing command:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error executing this command.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  }
});

// Voice state update event
const voiceUpdate = require('./events/voiceUpdate');
client.on('voiceStateUpdate', voiceUpdate);

// Connect to MongoDB using environment variable set on Render
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    // Login Discord bot only after MongoDB connection is successful
    client.login(process.env.TOKEN);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
