const User = require('../models/User');
const speak = require('../speak');

module.exports = async (oldState, newState) => {
  const member = newState.member || oldState.member;
  const userId = member.id;

  const userData = await User.findOne({ userId });
  const lang = userData?.language || 'bn';

  if (!oldState.channel && newState.channel) {
    const text = userData?.joinPhrase || `${member.user.username} esheche`;
    speak(text, newState.channel, lang);
  }

  if (oldState.channel && !newState.channel) {
    const text = userData?.leavePhrase || `${member.user.username} chole geche`;
    speak(text, oldState.channel, lang);
  }
};
