import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import type { MessageChannel } from '../..';
import searchSong from '../../lib/utils/music/searchSong';

@ApplyOptions<CommandOptions>({
  name: 'play',
  description: 'Play any song or playlist from YouTube and Spotify!',
  preconditions: [
    'inVoiceChannel',
    'musicTriviaPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class PlayCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    await interaction.deferReply();
    const { client } = container;
    const query = interaction.options.getString('query', true);

    // had a precondition make sure the user is infact in a voice channel
    const voiceChannel = interaction.guild?.voiceStates?.cache?.get(
      interaction.user.id
    )?.channel;

    const trackTuple = await searchSong(query);
    if (!trackTuple[1].length) {
      return await interaction.followUp({ content: trackTuple[0] as string });
    }

    let player = client.music.players.get(interaction.guild!.id);

    if (!player?.connected) {
      player ??= client.music.createPlayer(interaction.guild!.id);
      player.queue.channel = interaction.channel as MessageChannel;
      await player.connect(voiceChannel!.id, { deafened: true });
    }

    const started = player.playing || player.paused;

    await interaction.followUp({ content: trackTuple[0] as string });

    player.queue.add(trackTuple[1], { requester: interaction.user.id });
    if (!started) {
      await player.queue.start();
    }
    return;
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'query',
          description: 'What song or playlist would you like to listen to?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }
}
