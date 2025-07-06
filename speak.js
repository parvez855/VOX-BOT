const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
} = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const https = require('https');
const { Readable } = require('stream');

async function speak(text, voiceChannel, lang = 'en') {
  try {
    console.log(`🔊 Speaking in ${voiceChannel.name}: "${text}" [${lang}]`);

    const url = googleTTS.getAudioUrl(text, {
      lang,
      slow: false,
      host: 'https://translate.google.com',
    });

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
      selfDeaf: false,
    });

    connection.subscribe(player);

    player.on('error', error => {
      console.error('🔴 Player Error:', error);
    });

    player.on('idle', () => {
      console.log('⏹️ Playback done.');
      connection.destroy();
    });

  } catch (error) {
    console.error('TTS Error:', error);
  }
}

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
