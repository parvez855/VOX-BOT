const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, generateDependencyReport } = require('@discordjs/voice');
const User = require('../models/User');
const googleTTS = require('google-tts-api');
const { getAudioUrl } = require('../speak'); // If you have a speak helper, else use google-tts-api directly

console.log(generateDependencyReport()); // ডিপেন্ডেন্সি রিপোর্ট দেখাও (ডিবাগের জন্য)

const activePlayers = new Map(); // গিল্ড অনুযায়ী এক্টিভ প্লেয়ার ট্র্যাক করার জন্য

module.exports = async (oldState, newState) => {
  // বট নিজে কোনো ভিসিতে গেলে বাদ দিবে
  if ((oldState.member?.user.bot) || (newState.member?.user.bot)) return;

  const member = newState.member || oldState.member;
  if (!member) return;

  const guildId = newState.guild.id;
  const userId = member.id;

  const userData = await User.findOne({ userId });
  const lang = userData?.language || 'en';

  // Join announce
  if (!oldState.channel && newState.channel) {
    const text = userData?.joinPhrase || `${member.displayName} has joined the channel`;

    // Join voice channel with the bot
    const connection = joinVoiceChannel({
      channelId: newState.channel.id,
      guildId: guildId,
      adapterCreator: newState.guild.voiceAdapterCreator,
      selfDeaf: false,  // তুমি চাইলে true করো, বট নিজে শোনার দরকার নাই
      selfMute: false,
    });

    // Prepare audio player
    const player = createAudioPlayer();

    // Get TTS URL from google-tts-api
    let url;
    try {
      url = googleTTS.getAudioUrl(text, {
        lang: lang,
        slow: false,
        host: 'https://translate.google.com',
      });
    } catch (err) {
      console.error('TTS URL error:', err);
      return;
    }

    const resource = createAudioResource(url);

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      // Play finished, destroy connection & cleanup
      connection.destroy();
      activePlayers.delete(guildId);
    });

    player.on('error', error => {
      console.error('Audio player error:', error);
      connection.destroy();
      activePlayers.delete(guildId);
    });

    activePlayers.set(guildId, player);
  }

  // Leave announce
  else if (oldState.channel && !newState.channel) {
    const text = userData?.leavePhrase || `${member.displayName} has left the channel`;

    // Join old voice channel with bot
    const connection = joinVoiceChannel({
      channelId: oldState.channel.id,
      guildId: guildId,
      adapterCreator: oldState.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    const player = createAudioPlayer();

    let url;
    try {
      url = googleTTS.getAudioUrl(text, {
        lang: lang,
        slow: false,
        host: 'https://translate.google.com',
      });
    } catch (err) {
      console.error('TTS URL error:', err);
      return;
    }

    const resource = createAudioResource(url);

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
      activePlayers.delete(guildId);
    });

    player.on('error', error => {
      console.error('Audio player error:', error);
      connection.destroy();
      activePlayers.delete(guildId);
    });

    activePlayers.set(guildId, player);
  }
};
