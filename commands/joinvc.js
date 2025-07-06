const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  data: {
    name: 'joinvc',
    description: 'Bot joins your current voice channel',
  },

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply('❌ তুমি প্রথমে কোনো ভয়েস চ্যানেলে থাকতে হবে!');
    }

    try {
      joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      await interaction.reply('✅ আমি তোমার ভয়েস চ্যানেলে যোগ দিলাম!');
    } catch (error) {
      console.error('ভয়েস চ্যানেল যোগ দিতে সমস্যা:', error);
      await interaction.reply('❌ ভয়েস চ্যানেলে যোগ দিতে পারছি না।');
    }
  },
};
