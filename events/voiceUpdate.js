const User = require('../models/User');
const speak = require('../speak');

module.exports = async (oldState, newState) => {
  if ((oldState.member?.user.bot) || (newState.member?.user.bot)) return;

  const member = newState.member || oldState.member;
  if (!member) return;

  const userId = member.id;
  const userData = await User.findOne({ userId });
  const lang = userData?.language || 'en';

  // Join event
  if (!oldState.channel && newState.channel) {
    const text = userData?.joinPhrase || `${member.displayName} has joined the channel`;
    await speak(text, newState.channel, lang);
  }

  // Leave event
  if (oldState.channel && !newState.channel) {
    const text = userData?.leavePhrase || `${member.displayName} has left the channel`;
    await speak(text, oldState.channel, lang);
  }
};
