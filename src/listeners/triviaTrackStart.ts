import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
//import { container } from '@sapphire/framework';
import type { Snowflake } from 'discord-api-types';
import { MessageCollector, MessageEmbed } from 'discord.js';
import type { TriviaQueue } from '../lib/utils/trivia/TriviaQueue';
import {
  capitalizeWords,
  getLeaderBoard,
  normalizeValue
} from '../lib/utils/trivia/utilFunctions';

@ApplyOptions<ListenerOptions>({
  event: 'triviaTrackStart'
})
export class TriviaTrackStartListener extends Listener {
  public override async run(queue: TriviaQueue): Promise<void> {
    const player = queue.player;

    // Randomize a number but one that won't be too close to the track ending timestamp
    const max = queue.current!.length - 40 * 1000; // milliseconds
    const min = 10 * 1000;
    const randomTime = Math.floor(Math.random() * (max - min + 1)) + min;

    await player.seek(randomTime);

    let songNameFound = false;
    let songSingerFound = false;

    const skippedArray: Snowflake[] = [];

    const collector = queue.channel?.createMessageCollector({
      time: 30 * 1000
    });

    queue.collector = collector as MessageCollector;

    // @ts-ignore
    collector?.on('collect', async msg => {
      if (!queue.score.has(msg.author.id)) return;
      let guess = normalizeValue(msg.content);
      let title = queue.currentTrackAnswers!.title.toLowerCase();
      let singers = queue.currentTrackAnswers!.singers;

      if (guess === 'skip') {
        if (skippedArray.includes(msg.author.id)) {
          return;
        }
        skippedArray.push(msg.author.id);
        if (skippedArray.length > queue.score.size * 0.6) {
          return collector.stop();
        }
        return;
      }

      // if user guessed both singer and song name
      if (
        singers.some(value => guess.includes(normalizeValue(value))) &&
        guess.includes(title)
      ) {
        if (
          (songSingerFound && !songNameFound) ||
          (songNameFound && !songSingerFound)
        ) {
          queue.setScore(msg.author.id, queue.getScore(msg.author.id) + 1);
          msg.react('☑');
          return collector.stop();
        }
        queue.setScore(msg.author.id, queue.getScore(msg.author.id) + 2);
        msg.react('☑');
        return collector.stop();
      }

      // if used guessed only the singer
      else if (singers.some(value => guess.includes(normalizeValue(value)))) {
        if (songSingerFound) return; // already been found

        songSingerFound = true;
        if (songNameFound && songSingerFound) {
          queue.setScore(msg.author.id, queue.getScore(msg.author.id) + 1);
          msg.react('☑');
          return collector.stop();
        }

        queue.setScore(msg.author.id, queue.getScore(msg.author.id) + 1);
        msg.react('☑');
      }
      // if user guessed song title
      else if (guess.includes(title)) {
        if (songNameFound) return; // already been guessed
        songNameFound = true;

        if (songNameFound && songSingerFound) {
          queue.setScore(msg.author.id, queue.getScore(msg.author.id) + 1);
          msg.react('☑');
          return collector.stop();
        }

        queue.setScore(msg.author.id, queue.getScore(msg.author.id) + 1);
        msg.react('☑');
      }
      // wrong answer
      else {
        return msg.react('❌');
      }
    });

    collector?.on('end', async () => {
      if (queue.wasTriviaEndCalled) {
        queue.player.disconnect();
        queue.client.music.destroyPlayer(queue.player.guildId);
        return;
      }

      const sortedScoreMap = new Map(
        [...queue.score.entries()].sort(function (a, b) {
          return b[1] - a[1];
        })
      );

      const song = `${capitalizeWords(
        queue.currentTrackAnswers!.singers[0]
      )}: ${capitalizeWords(queue.currentTrackAnswers!.title)}`;

      const embed = new MessageEmbed()
        .setColor('#ff7373')
        .setTitle(`:musical_note: The song was: ${song}`)
        .setDescription(getLeaderBoard(Array.from(sortedScoreMap.entries())));

      queue.channel?.send({ embeds: [embed] });

      await queue.next();
    });
  }
}
