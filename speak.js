const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const https = require('https');
const { Readable } = require('stream');

async function speak(text, voiceChannel, lang = 'en') {
  try {
    // Google TTS থেকে MP3 URL তৈরি
    const url = googleTTS.getAudioUrl(text, {
      lang,
      slow: false,
      host: 'https://translate.google.com',
    });

    // MP3 স্ট্রিম ডাউনলোড
    const stream = await downloadStream(url);

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    const player = createAudioPlayer();
    player.play(resource);

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);

    player.on('error', (err) => {
      console.error('TTS Playback Error:', err);
    });

    player.on('idle', () => {
      connection.destroy();
    });
  } catch (error) {
    console.error('TTS Error:', error);
  }
}

// Helper function: download mp3 from URL and return a stream
function downloadStream(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const readable = new Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);
        resolve(readable);
      });
    }).on('error', reject);
  });
}

module.exports = speak;
