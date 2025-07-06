const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const play = require('play-dl');  // npm install play-dl
const googleTTS = require('google-tts-api'); // npm install google-tts-api

async function speak(text, voiceChannel, lang = 'en') {
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  try {
    // google-tts-api দিয়ে স্পিচ URL নেয়া
    const url = googleTTS.getAudioUrl(text, {
      lang,
      slow: false,
      host: 'https://translate.google.com',
    });

    // play-dl দিয়ে ইউটিউব অথবা mp3 URL থেকে স্ট্রিম তৈরি
    const stream = await play.stream(url);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);

    player.on('error', console.error);

    player.on('idle', () => {
      connection.destroy();
    });

  } catch (error) {
    console.error('TTS Error:', error);
    connection.destroy();
  }
}

module.exports = speak;
