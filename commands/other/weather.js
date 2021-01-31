const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const Pagination = require('discord-paginationembed');

module.exports = class WeatherCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'weather',
      memberName: 'weather',
      group: 'other',
      description: 'Get a 6 day forecast of a city.',
      throttling: {
        usages: 3,
        duration: 60
      },
      args: [
        {
          key: 'cityName',
          prompt: 'Which city are you interested in?.',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { cityName }) {
    const respInitial = await fetch(
      `https://www.metaweather.com/api/location/search/?query=${cityName}`
    );

    const initial = await respInitial.json();
    if (initial.length === 0) {
      message.say(':x: No location data was found.');
    } else {
      const locationID = initial[0].woeid;

      const response = await fetch(
        `https://www.metaweather.com/api/location/${locationID}/`
      );
      const body = await response.json();
      const forecast = body.consolidated_weather;
      const forecastArray = [];

      for (let i = 1; i <= forecast.length; i++) {
        let icon = `https://www.metaweather.com/static/img/weather/png/64/${
          forecast[i - 1].weather_state_abbr
        }.png`;
        let embedTitle =
          initial[0].title +
          ': ' +
          new Date(forecast[i - 1].applicable_date).toDateString();
        if (i == 1) embedTitle = initial[0].title + ': Today';
        if (i == 2) embedTitle = initial[0].title + ': Tomorrow';

        forecastArray.push(
          new MessageEmbed()
            .setThumbnail(icon)
            .setTitle(embedTitle)
            .setDescription(
              '**Description**\n' + forecast[i - 1].weather_state_name
            )
            // Row 1
            .addField(
              `:thermometer: Temp`,
              `Avg: ${((forecast[i - 1].the_temp * 9) / 5 + 32).toFixed(
                2
              )} F *(${forecast[i - 1].the_temp.toFixed(2)} C)*
              Max: ${((forecast[i - 1].max_temp * 9) / 5 + 32).toFixed(
                2
              )} F *(${forecast[i - 1].max_temp.toFixed(2)} C)*
              Min: ${((forecast[i - 1].min_temp * 9) / 5 + 32).toFixed(
                2
              )} F *(${forecast[i - 1].min_temp.toFixed(2)} C)*
              Humidity: ${forecast[i - 1].humidity}%`,
              true
            )
            .addField('\u200b', '\u200b', true)
            .addField(
              ':wind_blowing_face: Wind',
              `${forecast[i - 1].wind_speed.toFixed(2)} mph *(${(
                forecast[i - 1].wind_speed * 1.609
              ).toFixed(2)} kph)*
                Direction: ${degToCompass(forecast[i - 1].wind_direction)}`,
              true
            )
            // Row 2
            .addField(
              ':white_sun_rain_cloud: Baro',
              `${(forecast[i - 1].air_pressure / 33.864).toFixed(2)} in/Hg *(${
                forecast[i - 1].air_pressure
              } mbar)*`,
              true
            )
            .addField('\u200b', '\u200b', true)
            .addField(
              ':eye: Visibility',
              `${forecast[i - 1].visibility.toFixed(2)} M *(${(
                forecast[i - 1].visibility * 1.609
              ).toFixed(2)} Km)*`,
              true
            )
        );
      }

      new Pagination.Embeds()
        .setArray(forecastArray)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .setURL(`https://www.metaweather.com/${locationID}/`)
        .setFooter(
          'Powered by MetaWeather.com!',
          'https://www.metaweather.com/static/img/icon-192.png'
        )
        .build();
    }

    // Compass Conversion
    function degToCompass(num) {
      let val = Math.floor(num / 22.5 + 0.5);
      let arr = [
        ':arrow_up: N',
        ':arrow_upper_right: NNE',
        ':arrow_upper_right: NE',
        ':arrow_upper_right: ENE',
        ':arrow_right: E',
        ':arrow_lower_right: ESE',
        ':arrow_lower_right: SE',
        ':arrow_lower_right: SSE',
        ':arrow_down: S',
        ':arrow_lower_left: SSW',
        ':arrow_lower_left: SW',
        ':arrow_lower_left: WSW',
        ':arrow_left: W',
        ':arrow_upper_left: WNW',
        ':arrow_upper_left: NW',
        ':arrow_upper_left: NNW'
      ];
      return arr[val % 16];
    }
  }
};
