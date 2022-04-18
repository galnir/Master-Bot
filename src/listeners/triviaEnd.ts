import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import type { TriviaQueue } from '../lib/utils/trivia/TriviaQueue';
import { getLeaderBoard } from '../lib/utils/trivia/utilFunctions';

@ApplyOptions<ListenerOptions>({
  event: 'triviaEnd'
})
export class TriviaEndListener extends Listener {
  public override async run(queue: TriviaQueue): Promise<void> {
    const sortedScoreMap = new Map(
      [...queue.score.entries()].sort(function (a, b) {
        return b[1] - a[1];
      })
    );

    const embed = new MessageEmbed()
      .setColor('#ff7373')
      .setTitle('Music Quiz Results:')
      .setDescription(getLeaderBoard(Array.from(sortedScoreMap.entries())));

    queue.channel?.send({ embeds: [embed] });

    queue.player.disconnect();
    queue.client.music.destroyPlayer(queue.player.guildId);
    return;
  }
}
