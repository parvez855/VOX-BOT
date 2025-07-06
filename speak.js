const { createAudioResource, createAudioPlayer, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

module.exports = async function speak(text, voiceChannel, lang = 'bn') {
  const filename = path.join(__dirname, 'voice.mp3');
  const gtts = new gTTS(text, lang);

  return new Promise((resolve, reject) => {
    gtts.save(filename, function (err) {
      if (err) return reject(err);

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
    });
  });
};
