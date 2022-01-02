const { SlashCommandBuilder } = require('@discordjs/builders');
const { LoopType } = require('@lavaclient/queue');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Loop the playing song')
    .addStringOption(option => {
      return option
        .setName('loop-type')
        .setDescription('Loop the queue or the song?')
        .setRequired(true)
        .addChoice('queue', 'queue')
        .addChoice('song', 'song');
    }),
  execute(interaction) {
    const option = interaction.options.get('loop-type').value;
    const client = interaction.client;

    if (client.triviaMap.has(interaction.guildId)) {
      return interaction.reply(
        'You cannot use this command while a music trivia is playing!'
      );
    }

    const player = client.music.players.get(interaction.guildId);
    if (!player) {
      return interaction.reply('There is nothing playing at the moment!');
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel || voiceChannel.id !== player.channelId) {
      return interaction.reply('Join my voice channel and try again!');
    }

    switch (player.queue.loop.type) {
      case LoopType.None: // None (loop not enabled)
        if (option == 'queue') {
          player.queue.setLoop(LoopType.Queue);
          interaction.reply('The entire queue is now playing on loop');
          break;
        }
        player.queue.setLoop(LoopType.Song);
        interaction.reply(
          `**${player.queue.current.title}** is now playing on loop`
        );
        break;
      case LoopType.Queue: // Queue
        if (option == 'queue') {
          player.queue.setLoop(LoopType.None);
          interaction.reply('The queue is no longer playing on loop');
          break;
        }
        interaction.reply(
          'The current song is not on loop, the queue is. If you want to stop the queue from looping, use this command again and pick the queue option'
        );
        break;
      case LoopType.Song: // Song
        if (option == 'queue') {
          interaction.reply(
            'The queue is not on loop, the playing song is. If you want to stop the queue from looping, use this command again and pick the queue option'
          );
          break;
        }
        player.queue.setLoop(LoopType.None);
        interaction.reply(
          `**${player.queue.current.title}** is no longer playing on loop`
        );
    }
  }
};
