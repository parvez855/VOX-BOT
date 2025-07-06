const { createAudioResource, createAudioPlayer, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const gTTS = require('node-gtts'); // ✅ correct package

module.exports = async function speak(text, voiceChannel, lang = 'bn') {
  const filename = path.join(__dirname, 'voice.mp3');
  const tts = gTTS(lang);

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filename);
    tts.stream(text)
      .pipe(writeStream)
      .on('finish', () => {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator
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
      })
      .on('error', reject);
  });
};
