const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const sodium = require('libsodium-wrappers');  // এনক্রিপশন জন্য দরকার

async function speak(text, voiceChannel, lang = 'en') {
  try {
    await sodium.ready;  // Ensure libsodium is ready (important)

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const url = googleTTS.getAudioUrl(text, {
      lang,
      slow: false,
      host: 'https://translate.google.com',
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(url);

    player.play(resource);
    connection.subscribe(player);

    player.on('error', error => {
      console.error('Audio Player Error:', error);
      connection.destroy();
    });

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

  } catch (error) {
    console.error('TTS speak error:', error);
  }
}

module.exports = speak;
