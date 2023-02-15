import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'tv-show-search',
  description: 'Obter informações sobre programas de TV',
  preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class TVShowSearchCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const query = interaction.options.getString('query', true);

    try {
      var data = await this.getData(query);
    } catch (error: any) {
      return await interaction.reply(error);
    }

    const PaginatedEmbed = new PaginatedMessage();

    for (let i = 0; i < data.length; i++) {
      const showInfo = this.constructInfoObject(data[i].show);

      PaginatedEmbed.addPageEmbed(embed =>
        embed
          .setTitle(showInfo.name)
          .setURL(showInfo.url)
          .setColor('#17a589')
          .setThumbnail(showInfo.thumbnail)
          .setDescription(showInfo.summary)
          .addFields(
            { name: 'Language', value: showInfo.language, inline: true },
            {
              name: 'Genre(s)',
              value: showInfo.genres,
              inline: true
            },
            {
              name: 'Show Type',
              value: showInfo.type,
              inline: true
            },
            {
              name: 'Premiered',
              value: showInfo.premiered,
              inline: true
            },
            { name: 'Network', value: showInfo.network, inline: true },

            { name: 'Runtime', value: showInfo.runtime, inline: true },
            { name: 'Average Rating', value: showInfo.rating }
          )
          .setFooter({
            text: `(Página ${i}/${data.length}) fornecida pela tvmaze.com`,
            iconURL: 'https://static.tvmaze.com/images/favico/favicon-32x32.png'
          })
      );
    }

    await interaction.reply('Mostrar informações');
    return PaginatedEmbed.run(interaction);
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
<<<<<<< HEAD
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'query',
          description: 'Qual programa de TV você quer procurar?',
          type: 'STRING',
          required: true
        }
      ]
    });
=======
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('query')
            .setDescription('What TV show do you want to look up?')
            .setRequired(true)
        )
    );
>>>>>>> upgrade-to-v14
  }

  private getData(query: string): Promise<ResponseData> {
    return new Promise(async function (resolve, reject) {
      const url = `http://api.tvmaze.com/search/shows?q=${encodeURI(query)}`;
      try {
        const response = await axios.get(url);
        if (response.status == 429) {
          reject(':x: Limite de Taxa excedido. Tente novamente em alguns minutos.');
        }
        if (response.status == 503) {
          reject(
            ':x: O serviço está indisponível no momento. Tente novamente mais tarde.'
          );
        }
        if (response.status !== 200) {
          reject(
            'O serviço está indisponível no momento. Tente novamente mais tarde.'
          );
        }
        const data = response.data;
        if (!data.length) {
          reject(
            'O serviço está indisponível no momento. Tente novamente mais tarde.'
          );
        }
        resolve(data);
      } catch (e) {
        Logger.error(e);
        reject(
          'O serviço está indisponível no momento. Tente novamente mais tarde.'
        );
      }
    });
  }

  private constructInfoObject(show: any): InfoObject {
    return {
      name: show.name,
      url: show.url,
      summary: this.filterSummary(show.summary),
      language: this.checkIfNull(show.language),
      genres: this.checkGenres(show.genres),
      type: this.checkIfNull(show.type),
      premiered: this.checkIfNull(show.premiered),
      network: this.checkNetwork(show.network),
      runtime: show.runtime ? show.runtime + ' Minutes' : 'None Listed',
      rating: show.ratings ? show.rating.average : 'None Listed',
      thumbnail: show.image
        ? show.image.original
        : 'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png'
    };
  }

  private filterSummary(summary: string) {
    return summary
      .replace(/<(\/)?b>/g, '**')
      .replace(/<(\/)?i>/g, '*')
      .replace(/<(\/)?p>/g, '')
      .replace(/<br>/g, '\n')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'");
  }

  private checkGenres(genres: Genres) {
    if (Array.isArray(genres)) {
      if (genres.join(' ').trim().length == 0) return 'None Listed';
      return genres.join(' ');
    } else if (!genres.length) {
      return 'None Listed';
    }
    return genres;
  }

  private checkIfNull(value: string) {
    if (!value) {
      return 'None Listed';
    }
    return value;
  }

  private checkNetwork(network: any) {
    if (!network) return 'None Listed';
    return `(**${network.country.code}**) ${network.name}`;
  }
}

type InfoObject = {
  name: string;
  url: string;
  summary: string;
  language: string;
  genres: string;
  type: string;
  premiered: string;
  network: string;
  runtime: string;
  rating: string;
  thumbnail: string;
};

type Genres = string | Array<string>;

type ResponseData = string | Array<any>;
