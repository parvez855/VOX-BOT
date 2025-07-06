// speak.js
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const gTTS = require('gtts'); // টেক্সট থেকে স্পিচ স্ট্রিম তৈরি করে
const { PassThrough } = require('stream');

async function speak(text, voiceChannel, lang = 'en') {
  // বট ভয়েস চ্যানেলে জয়েন করবে
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  // gTTS দিয়ে স্পিচ স্ট্রিম তৈরি
  const tts = new gTTS(text, lang);
  const stream = new PassThrough();
  tts.stream().pipe(stream);

  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
  });

  const player = createAudioPlayer();
  player.play(resource);
  connection.subscribe(player);

  player.on('error', error => {
    console.error('Audio player error:', error);
  });

  player.on('idle', () => {
    connection.destroy();
  });
}

module.exports = speak;
