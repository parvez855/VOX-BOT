const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  data: {
    name: 'joinvc',
    description: 'Make the bot join your voice channel',
  },
  async execute(interaction) {
    const member = interaction.member;
    const channel = member.voice.channel;
    if (!channel) return interaction.reply('❌ You must be in a voice channel.');

    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    await interaction.reply('✅ Joined your voice channel.');
  },
};
