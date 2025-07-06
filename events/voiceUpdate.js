const { joinVoiceChannel, getVoiceConnection, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const User = require('../models/User');
const speak = require('../speak');

module.exports = async (oldState, newState) => {
  if ((oldState.member?.user.bot) || (newState.member?.user.bot)) return;

  const member = newState.member || oldState.member;
  if (!member) return;

  const userId = member.id;
  const userData = await User.findOne({ userId });
  const lang = userData?.language || 'en';

  const oldChannel = oldState.channel;
  const newChannel = newState.channel;

  if (!oldChannel && newChannel) {
    // ইউজার ভিসিতে যোগ দিলো

    let connection = getVoiceConnection(newState.guild.id);
    if (!connection) {
      connection = joinVoiceChannel({
        channelId: newChannel.id,
        guildId: newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });

      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 20000);
      } catch (error) {
        console.error('Error connecting bot to voice channel:', error);
        connection.destroy();
        return;
      }
    }

    // joinPhrase থাকলে সেটি নাও, না হলে ইউজারের নাম + "has joined the channel" বলো
    const text = userData?.joinPhrase || `${member.displayName} has joined the channel`;
    await speak(text, newChannel, lang);
  }

  if (oldChannel && !newChannel) {
    // ইউজার ভিসি থেকে বেরিয়েছে

    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
      // leavePhrase থাকলে সেটি নাও, না হলে ইউজারের নাম + "has left the channel" বলো
      const text = userData?.leavePhrase || `${member.displayName} has left the channel`;
      await speak(text, oldChannel, lang);

      // ভিসি খালি কিনা চেক করো, খালি হলে বট ডিসকানেক্ট করো (তুমি চাইলে)
      const nonBotMembers = oldChannel.members.filter(m => !m.user.bot);
      if (nonBotMembers.size === 0) {
        // connection.destroy();  // ডিসকানেক্ট করতে চাইলে আনকমেন্ট করো
      }
    }
  }
};
