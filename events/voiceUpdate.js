// events/voiceUpdate.js
const User = require('../models/User');
const speak = require('../speak');

module.exports = async (oldState, newState) => {
  // বটের নিজের মুভমেন্ট ইগনোর করো
  if ((oldState.member?.user.bot) || (newState.member?.user.bot)) return;

  const member = newState.member || oldState.member;
  if (!member) return;

  const userId = member.id;
  const userData = await User.findOne({ userId });
  const lang = userData?.language || 'en';

  // ইউজার ভিসি তে join করলে
  if (!oldState.channel && newState.channel) {
    const text = userData?.joinPhrase || `${member.displayName} has joined the channel`;
    await speak(text, newState.channel, lang);
  }

  // ইউজার ভিসি থেকে leave করলে
  if (oldState.channel && !newState.channel) {
    const text = userData?.leavePhrase || `${member.displayName} has left the channel`;
    await speak(text, oldState.channel, lang);
  }
};
