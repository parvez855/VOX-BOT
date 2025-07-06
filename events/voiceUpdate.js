// events/voiceUpdate.js
const { joinVoiceChannel, getVoiceConnection, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const User = require('../models/User');
const speak = require('../speak');

module.exports = async (oldState, newState) => {
  // বট নিজেই হলে কিছু না করো
  if ((oldState.member?.user.bot) || (newState.member?.user.bot)) return;

  const member = newState.member || oldState.member;
  if (!member) return;

  const userId = member.id;
  const userData = await User.findOne({ userId });
  const lang = userData?.language || 'en';

  const oldChannel = oldState.channel;
  const newChannel = newState.channel;

  if (!oldChannel && newChannel) {
    // ইউজার ভিসি তে যোগ দিলো

    // বট ইতোমধ্যে কানেক্টেড কি না চেক করো
    let connection = getVoiceConnection(newState.guild.id);
    if (!connection) {
      // যদি না থাকে, তাহলে বটকে ভিসিতে কানেক্ট করাও
      connection = joinVoiceChannel({
        channelId: newChannel.id,
        guildId: newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator,
        selfDeaf: false, // শুনতে পারবে
        selfMute: false, // নিজে মিউট নয়
      });

      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 20000);
        console.log('Bot connected to voice channel');
      } catch (error) {
        console.error('Error connecting bot to voice channel:', error);
        connection.destroy();
        return;
      }
    }

    // ইউজার join announce করো
    const text = userData?.joinPhrase || `${member.displayName} has joined the channel`;
    await speak(text, newChannel, lang);
  }

  if (oldChannel && !newChannel) {
    // ইউজার ভিসি থেকে বেরিয়েছে

    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
      // leave announce করো
      const text = userData?.leavePhrase || `${member.displayName} has left the channel`;
      await speak(text, oldChannel, lang);

      // চ্যানেলে আর ইউজার বাকি নেই কি না চেক করো
      const nonBotMembers = oldChannel.members.filter(m => !m.user.bot);
      if (nonBotMembers.size === 0) {
        // চ্যানেল খালি, কিন্তু বট ডিসকানেক্ট করবে না (এই লাইন কমেন্ট করে রেখেছি)
        // connection.destroy();
        // console.log('Bot disconnected because channel is empty');
      }
    }
  }
};
