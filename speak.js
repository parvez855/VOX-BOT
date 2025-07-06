const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const playdl = require('play-dl');

module.exports = async function speak(text, voiceChannel, lang = 'bn') {
  try {
    const url = googleTTS.getAudioUrl(text, {
      lang,
      slow: false,
      host: 'https://translate.google.com',
    });

    const stream = await playdl.stream(url);

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    player.play(resource);
    connection.subscribe(player);

    return new Promise((resolve) => {
      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        resolve();
      });
    });
  } catch (err) {
    console.error("TTS Error:", err);
  }
};
