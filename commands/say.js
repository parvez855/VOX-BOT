const speak = require('../speak');

module.exports = {
  data: {
    name: 'say',
    description: 'Make the bot speak a message',
    options: [{
      name: 'text',
      type: 3,
      description: 'Text to speak',
      required: true
    }]
  },
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const member = interaction.member;
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) return interaction.reply('❌ You must be in a VC.');

    await interaction.deferReply();
    await speak(text, voiceChannel, 'bn');
    await interaction.editReply('✅ Message spoken in VC.');
  }
};
