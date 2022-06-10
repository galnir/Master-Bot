import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import axios from 'axios';
import { CommandInteraction, MessageEmbed, Constants } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'speedrun',
  description: 'Look for the world record of a game!'
})
export class SpeedRunCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const query = interaction.options.getString('game', true);
    let queryCat = interaction.options.getString('category', false);

    let initialRaw;

    try {
      initialRaw = await axios.get(
        `https://www.speedrun.com/api/v1/games?name=${query}`
      );
    } catch {
      return await interaction.reply(
        'Something went wrong, please try again later'
      );
    }
    const initial = initialRaw.data;

    if (!initial.data.length) {
      return await interaction.reply('No game was found.');
    }

    let gameID: string = initial.data[0].id;

    let response;
    try {
      response = await axios.get(
        `https://www.speedrun.com/api/v1/games/${gameID}/records?miscellaneous=no&scope=full-game&top=10&embed=game,category,players,platforms,regions`
      );
    } catch {
      return await interaction.reply(
        'Something went wrong, please try again later'
      );
    }
    const body = response.data;

    if (!body.data.length) {
      const gameNameArr: string[] = [];
      initial.data.slice(0, 6).forEach((id: any) => {
        gameNameArr.push(id.names.international);
      });
      let gameName = new MessageEmbed()
        .setColor('#3E8657')
        .setTitle(':mag: Search Results')
        .setThumbnail(initial.data[0].assets['cover-medium'].uri)
        .addField(
          ':x: Try searching again with the following suggestions.',
          initial.data[0].names.international + ` doesn't have any runs.`
        )
        .setTimestamp()
        .setFooter({ text: 'Powered by www.speedrun.com' });

      gameNameArr.forEach((game, i) => {
        gameName.addField(`:video_game: Result ${i + 1}`, game);
      });

      interaction.reply({ embeds: [gameName] });
    } else {
      const categories = body.data;
      queryCat = !queryCat ? categories[0].category.data.name : queryCat;
      for (let i = 0; i <= categories.length; ++i) {
        if (
          categories[i]?.category.data.name.toLowerCase() ==
          queryCat?.toLowerCase()
        ) {
          break;
        } else if (i == categories.length)
          queryCat = categories[0].category.data.name;
      }
      await interaction
        .reply({
          embeds: [
            new MessageEmbed()
              .setColor('#3E8657')
              .setDescription('Getting Data')
          ],
          fetchReply: true
        })
        .then(async () => {
          SpeedRunCommand.embedGenerator(
            categories,
            queryCat ?? categories[0].category.data.name
          )
            .setIdle(30 * 1000)
            .setIndex(0)
            .run(interaction);
        });
    }
  }

  static myButtons(
    message: PaginatedMessage,
    categories: any,
    queryCat: string
  ) {
    categories.forEach((value: null, index: number) => {
      message.addAction({
        style:
          categories[index].category.data.name.toLowerCase() ==
          queryCat.toLowerCase()
            ? 'SUCCESS'
            : 'PRIMARY',
        customId: `Category-${index}`,
        label: categories[index].category.data.name,
        type: Constants.MessageComponentTypes.BUTTON,
        run: async ({ interaction }) => {
          // message = new PaginatedMessage();
          queryCat = categories[index].category.data.name;
          message = SpeedRunCommand.embedGenerator(categories, queryCat);
          try {
            SpeedRunCommand.myButtons(
              message.setIndex(0).setIdle(30 * 1000),
              categories,
              queryCat
            );
          } catch (error: any) {
            new PaginatedMessage()
              .addPageEmbed(
                new MessageEmbed()
                  .setColor('RED')
                  .setTitle('Error')
                  .setDescription(error.toString())
              )
              .run(interaction);
          }
          await interaction
            .update({
              embeds: [
                new MessageEmbed()
                  .setColor('#3E8657')
                  .setDescription('Getting Data')
              ],
              fetchReply: true
            })
            .then(async () => {
              message.run(interaction);
            });
        }
      });
    });
    return message;
  }
  static embedGenerator(categories: any, queryCat: string) {
    const PaginatedEmbed = new PaginatedMessage();
    try {
      categories.forEach((category: any) => {
        if (
          category.category.data.name.toLowerCase() == queryCat?.toLowerCase()
        ) {
          const catRules = new MessageEmbed()
            .setDescription(
              category.category.data.rules.toString().length
                ? `**${category.category.data.name} Rules**:\n` +
                    category.category.data.rules.toString()
                : 'No Data'
            )
            .setColor('#3E8657')
            .setThumbnail(category.game.data.assets['cover-medium'].uri)
            .setAuthor({
              name:
                category.game.data.names.international +
                ' - ' +
                category.category.data.name,
              url: 'http://speedrun.com/'
            });
          PaginatedEmbed.addPageEmbed(catRules);
          for (let i = 0; i <= category.players.data.length; ++i) {
            const platform: string =
              category.platforms.data.length > 0
                ? category.platforms.data[0].name
                : '';
            const region: string =
              category.regions.data.length > 0
                ? ' - ' + category.regions.data[0].name
                : '';
            let emu: string = 'No Data';
            let runnerName: string = 'No Data';
            let trophyIcon: string = '';
            if (category.runs[i]) {
              emu = category.runs[i].run.system.emulated ? ' [EMU]' : '';
              runnerName =
                category.players.data[i].rel === 'user'
                  ? category.players.data[i].names.international
                  : category.players.data[i].name;

              if (i == 0) trophyIcon = '🏆 WR: ';
              if (i == 1) trophyIcon = '🥈 2nd: ';
              if (i == 2) trophyIcon = '🥉 3rd: ';
              if (i >= 3) trophyIcon = `${i + 1}th: `;
            }
            if (category.runs[i]) {
              PaginatedEmbed.addPageEmbed(embeds =>
                embeds
                  .setColor('#3E8657')
                  .setTitle(
                    category.runs[i]
                      ? trophyIcon +
                          SpeedRunCommand.convertTime(
                            category.runs[i].run.times.primary_t
                          ) +
                          ' by ' +
                          runnerName
                      : 'No Data'
                  )
                  .setThumbnail(category.game.data.assets['cover-medium'].uri)
                  .setURL(
                    category.runs[i]
                      ? category.runs[i].run.weblink
                      : category.weblink
                  )
                  .setAuthor({
                    name:
                      category.game.data.names.international +
                      ' - ' +
                      category.category.data.name,
                    url: 'http://speedrun.com/'
                  })
                  .addField(
                    ':calendar_spiral: Date Played:',
                    category.runs[i] ? category.runs[i].run.date : 'No Data'
                  )
                  .addField(':video_game: Played On:', platform + region + emu)
                  .setFooter({
                    text: 'Powered by www.speedrun.com',
                    iconURL: 'https://i.imgur.com/PpxR9E1.png'
                  })
              );
            }
          }
        }
      });
      PaginatedEmbed.setIdle(30 * 1000).setIndex(0);
      if (PaginatedEmbed.actions.size > 0)
        PaginatedEmbed.actions.delete('@sapphire/paginated-messages.goToPage');

      SpeedRunCommand.myButtons(PaginatedEmbed, categories, queryCat);

      return PaginatedEmbed;
    } catch (error: any) {
      return new PaginatedMessage().addPageEmbed(
        new MessageEmbed()
          .setColor('RED')
          .setTitle('Error')
          .setDescription(error.toString())
      );
    }
  }

  static convertTime(time: number) {
    let str, hr, min: any, sec, ms: number | string | undefined;
    let parts = time.toString().split('.');
    ms = parts.length > 1 ? parseInt((parts[1] + '00').slice(0, 3)) : undefined;
    sec = parseInt(parts[0]);
    if (sec >= 60) {
      min = Math.floor(sec / 60);
      sec = sec % 60;
      sec = sec < 10 ? '0' + sec : sec;
    }
    if (min >= 60) {
      hr = Math.floor(min / 60);
      min = min % 60;
      min = min < 10 ? '0' + min : min;
    }
    if (ms && ms < 10) ms = '00' + ms;
    else if (ms && ms < 100) ms = '0' + ms;
    if (min == undefined) {
      str =
        ms == undefined
          ? sec.toString() + 's'
          : sec.toString() + 's ' + ms.toString() + 'ms';
    } else if (hr === undefined) {
      str =
        ms === undefined
          ? min.toString() + 'm ' + sec.toString() + 's'
          : min.toString() +
            'm ' +
            sec.toString() +
            's ' +
            ms.toString() +
            'ms';
    } else {
      str =
        ms === undefined
          ? hr.toString() + 'h ' + min.toString() + 'm ' + sec.toString() + 's'
          : hr.toString() +
            'h ' +
            min.toString() +
            'm ' +
            sec.toString() +
            's ' +
            ms.toString() +
            'ms';
    }
    return str;
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: 'STRING',
          required: true,
          name: 'game',
          description: 'Video Game Title?'
        },
        {
          type: 'STRING',
          required: false,
          name: 'category',
          description: 'speed run Category?'
        }
      ]
    });
  }
}
