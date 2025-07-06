const User = require('../models/User');

module.exports = {
  data: {
    name: 'setlang',
    description: 'Set language for TTS',
    options: [{
      name: 'language',
      type: 3,
      description: 'Language code (en or bn)',
      required: true
    }]
  },
  async execute(interaction) {
    const lang = interaction.options.getString('language');
    if (!['en', 'bn'].includes(lang)) {
      return interaction.reply('❌ Invalid language. Use "en" or "bn".');
    }
    await User.findOneAndUpdate(
      { userId: interaction.user.id },
      { $set: { language: lang } },
      { upsert: true }
    );
    await interaction.reply(`✅ Language set to: ${lang}`);
  }
};
