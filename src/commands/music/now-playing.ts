import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { MessageActionRow, MessageButton } from 'discord.js';
import { container } from '@sapphire/framework';
import { NowPlayingEmbed } from '../../lib/utils/music/NowPlayingEmbed';
import type { Song } from '../../lib/utils/queue/Song';
import prisma from '../../lib/prisma';

@ApplyOptions<CommandOptions>({
  name: 'now-playing',
  description: 'Display an embed detailing the song playing',
  preconditions: [
    'inVoiceChannel',
    'musicTriviaPlaying',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class NowPlayingCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(interaction.guild!.id);

    const NowPlaying = new NowPlayingEmbed(
      player?.queue.current as Song,
      player?.accuratePosition,
      player?.queue.current?.length as number,
      player?.volume as number,
      player?.queue.tracks,
      player?.queue.last!,
      player?.paused
    );

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`${interaction.id}-playPause`)
        .setLabel('Play/Pause')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId(`${interaction.id}-stop`)
        .setLabel('Stop')
        .setStyle('DANGER'),
      new MessageButton()
        .setCustomId(`${interaction.id}-next`)
        .setLabel('Next')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId(`${interaction.id}-volumeUp`)
        .setLabel('Vol+')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId(`${interaction.id}-volumeDown`)
        .setLabel('Vol-')
        .setStyle('PRIMARY')
    );

    const maxLimit: number = 1.8e6; // 30 minutes
    let timeLimit: number =
      (player?.queue.current?.length as number) > maxLimit
        ? maxLimit
        : (((player?.queue.current?.length as number) -
            player?.accuratePosition!) as number);
    player?.queue.current?.isStream == true ? (timeLimit = maxLimit) : null;
    const filter = (i: any) =>
      i.member.voice.channel?.id === player?.queue.player.channelId; // only available to members in the same voice channel
    const collector = interaction.channel!.createMessageComponentCollector({
      filter,
      time: timeLimit
    });
    const timer: NodeJS.Timer = setTimeout(async () => {
      await interaction.deleteReply().catch(error => {
        console.log(error);
      });
    }, timeLimit);
    if (player) {
      try {
        collector.on('collect', async i => {
          if (i.customId === `${interaction.id}-playPause`) {
            let paused;
            if (player?.queue.player.paused) {
              player?.queue.player.resume();
              paused = false;
            } else {
              player?.queue.player.pause();
              paused = true;
            }
            const NowPlaying = new NowPlayingEmbed(
              player?.queue.current as Song,
              player?.accuratePosition,
              player?.queue.current!.length as number,
              player?.volume as number,
              player?.queue.tracks!,
              player?.queue.last!,
              paused
            );
            collector.empty();
            await i.update({
              embeds: [NowPlaying.NowPlayingEmbed()]
            });
          }
          if (i.customId === `${interaction.id}-stop`) {
            await i.update('Leaving');

            player?.disconnect();
            client.music.destroyPlayer(player!.guildId);
            clearTimeout(timer);
            collector.stop();
            await interaction.deleteReply();
          }
          if (i.customId === `${interaction.id}-next`) {
            await i.update('Skipping');
            player?.queue.next();
            clearTimeout(timer);
            collector.stop();
            await interaction.deleteReply();
          }
          if (i.customId === `${interaction.id}-volumeUp`) {
            const volume =
              (player?.volume as number) + 10 > 200
                ? 200
                : (player?.volume as number) + 10;
            await player?.queue.player.setVolume(volume);
            const NowPlaying = new NowPlayingEmbed(
              player?.queue.current as Song,
              player?.accuratePosition,
              player?.queue.current!.length as number,
              player?.volume as number,
              player?.queue.tracks!,
              player?.queue.last!,
              player?.queue.player.paused
            );
            prisma;
            collector.empty();
            await prisma.guild.upsert({
              where: { id: interaction.guild!.id },
              create: {
                id: interaction.guild!.id,
                volume: volume
              },
              update: { volume: volume }
            });
            await i.update({
              embeds: [NowPlaying.NowPlayingEmbed()]
            });
          }
          if (i.customId === `${interaction.id}-volumeDown`) {
            const volume =
              (player?.volume as number) - 10 < 0
                ? 0
                : (player?.volume as number) - 10;
            await player?.setVolume(volume);
            const NowPlaying = new NowPlayingEmbed(
              player?.queue.current as Song,
              player?.accuratePosition,
              player?.queue.current!.length as number,
              player?.volume as number,
              player?.queue.tracks!,
              player?.queue.last!,
              player?.queue.player.paused
            );
            collector.empty();
            await prisma.guild.upsert({
              where: { id: interaction.guild!.id },
              create: {
                id: interaction.guild!.id,
                volume: volume
              },
              update: { volume: volume }
            });
            await i.update({ embeds: [NowPlaying.NowPlayingEmbed()] });
          }
        });
      } catch (e) {
        console.log(e);
      }
    } else {
      await interaction.deleteReply();
    }
    timer;
    // });
    return await interaction.reply({
      embeds: [NowPlaying.NowPlayingEmbed()],
      components: [row],
      fetchReply: true
    });
    return await interaction.reply({ embeds: [NowPlaying.NowPlayingEmbed()] });
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
