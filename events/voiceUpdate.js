const User = require('../models/User');
const speak = require('../speak');

module.exports = async (oldState, newState) => {
  const member = newState.member || oldState.member;
  if (!member || member.user.bot) return;

  const userId = member.id;
  const userData = await User.findOne({ userId });
  const lang = userData?.language || 'en';

  if (!oldState.channel && newState.channel) {
    console.log(`🎤 ${member.displayName} joined VC`);
    const text = userData?.joinPhrase || `${member.displayName} has joined the channel`;
    await speak(text, newState.channel, lang);
  }

  if (oldState.channel && !newState.channel) {
    console.log(`👋 ${member.displayName} left VC`);
    const text = userData?.leavePhrase || `${member.displayName} has left the channel`;
    await speak(text, oldState.channel, lang);
  }
};
