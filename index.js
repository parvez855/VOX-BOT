require('dotenv').config();
const http = require('http');
const fs = require('fs');
const mongoose = require('mongoose');
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => res.end('Bot is running'));
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

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

const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

async function deployCommands() {
  const commands = client.commands.map(cmd => cmd.data);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    console.log('Refreshing global application commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Commands deployed!');
  } catch (err) {
    console.error('Deploy error:', err);
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await deployCommands();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error('Command error:', err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Error executing command.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
    }
  }
});

// Voice state update event (voiceUpdate.js)
const voiceUpdate = require('./events/voiceUpdate');
client.on('voiceStateUpdate', voiceUpdate);

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected!');
  client.login(process.env.TOKEN);
})
.catch(console.error);
