const User = require('../models/User');

module.exports = {
  data: {
    name: 'setleave',
    description: 'Set custom leave phrase',
    options: [{
      name: 'phrase',
      type: 3,
      description: 'The phrase to say when you leave',
      required: true
    }]
  },
  async execute(interaction) {
    const phrase = interaction.options.getString('phrase');
    await User.findOneAndUpdate(
      { userId: interaction.user.id },
      { $set: { leavePhrase: phrase } },
      { upsert: true }
    );
    await interaction.reply(`✅ Leave phrase set to: "${phrase}"`);
  }
};
