import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import {
  CommandInteraction,
  GuildMember,
  MessageEmbed,
  VoiceChannel
} from 'discord.js';
import { container } from '@sapphire/framework';
import fs from 'fs';
import { getRandom } from '../../lib/utils/trivia/utilFunctions';
import type { MessageChannel } from '../..';
import prisma from '../../lib/prisma';

@ApplyOptions<CommandOptions>({
  name: 'music-trivia',
  description: 'Play a fun music trivia with your friends or by yourself!',
  preconditions: ['GuildOnly', 'inVoiceChannel', 'musicTriviaPlaying']
})
export class MusicTriviaCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const jsonSongs = fs.readFileSync(
      './src/resources/music-trivia/songs.json',
      'utf-8'
    );

    const songsArray = getRandom(JSON.parse(jsonSongs), 5);

    const tracks = [];
    for (let i = 0; i < 5; i++) {
      const result = await client.music.rest.loadTracks(songsArray[i].url);
      tracks.push(result.tracks[0]);
    }

    const player = client.music.createPlayer(interaction.guildId as string);
    player.triviaQueue.channel = interaction.channel as MessageChannel;
    player.triviaQueue.setTriviaSongs(songsArray);

    const voiceChannel = interaction.guild?.voiceStates?.cache?.get(
      interaction.user.id
    )?.channel as VoiceChannel;

    player.connect(voiceChannel.id, { deafened: true });

    player.triviaQueue.add(tracks);
    const channelDB = await prisma.guild.findFirst({
      where: {
        id: interaction.guild!.id
      },
      select: {
        volume: true
      }
    });
    if (channelDB?.volume) {
      await player.setVolume(channelDB.volume);
    } else {
      await player.setVolume(50);
    }
    const member = interaction.member as GuildMember;
    const membersInChannel = member!.voice!.channel!.members;
    membersInChannel.each((member: GuildMember) => {
      if (member.user.bot) return;
      player.triviaQueue.setScore(member.user.id, 0);
    });

    const startTriviaEmbed = new MessageEmbed()
      .setColor('#ff7373')
      .setTitle(':notes: Starting Music Quiz!')
      .setDescription(
        `:notes: Get ready! There are 5 songs, you have 30 seconds to guess either the singer/band or the name of the song. Good luck!
    Vote skip the song by entering the word 'skip'.
    You can end the trivia at any point by using the end-trivia command!`
      );
    await interaction.reply({ embeds: [startTriviaEmbed] });

    await player.triviaQueue.start();
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
