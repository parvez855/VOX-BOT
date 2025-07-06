const User = require('../models/User');

module.exports = {
  data: {
    name: 'setjoin',
    description: 'Set custom join phrase',
    options: [{
      name: 'phrase',
      type: 3,
      description: 'The phrase to say when you join',
      required: true
    }]
  },
  async execute(interaction) {
    const phrase = interaction.options.getString('phrase');
    await User.findOneAndUpdate(
      { userId: interaction.user.id },
      { $set: { joinPhrase: phrase } },
      { upsert: true }
    );
    await interaction.reply(`✅ Join phrase set to: "${phrase}"`);
  }
};
