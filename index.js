const http = require('http');
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

// Minimal HTTP server so Render detects a port
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.end('Bot is running');
});
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Handle unexpected errors globally
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});
process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});

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

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

async function deployCommands() {
  const commands = [];
  for (const command of client.commands.values()) {
    commands.push(command.data);
  }

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    console.log('Started refreshing global application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded global application (/) commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await deployCommands();
});

// Interaction handling
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Error executing command:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ There was an error executing this command.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ There was an error executing this command.', ephemeral: true });
    }
  }
});

// Voice state update event
const voiceUpdate = require('./events/voiceUpdate');
client.on('voiceStateUpdate', voiceUpdate);

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
