const { createAudioResource, createAudioPlayer, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = async function speak(text, voiceChannel, lang = 'bn') {
  const url = googleTTS.getAudioUrl(text, {
    lang: lang,
    slow: false,
    host: 'https://translate.google.com',
  });

  const filename = path.join(__dirname, 'voice.mp3');

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          });

          const resource = createAudioResource(filename);
          const player = createAudioPlayer();

          player.play(resource);
          connection.subscribe(player);

          player.on(AudioPlayerStatus.Idle, () => {
            fs.unlinkSync(filename);
            connection.destroy();
            resolve();
          });
        });
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => reject(err));
    });
  });
};
