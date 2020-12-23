const { Command } = require('discord.js-commando');
const { openWeatherKey } = require('../../config.json');
const { MessageEmbed } = require('discord.js');
const weather = require('openweather-apis');

// Skips loading if not found in config.json and posts console message
if (openWeatherKey == null)
  return console.log(
    'INFO: Weather command removed from the list. \nMake sure you have "openWeatherKey" in your config.json to use the Weather command!'
  );

module.exports = class WeatherCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'weather',
      memberName: 'weather',
      group: 'other',
      description: 'Get the current weather in a city.',
      throttling: {
        usages: 3,
        duration: 60
      },
      args: [
        {
          key: 'cityName',
          prompt: 'Which city are you interested in?.',
          type: 'string',
          validate: function isNumeric(cityName) {
            return /^\D+$/.test(cityName);
          }
        }
      ]
    });
  }

  run(message, { cityName }) {
    weather.setLang('en');
    weather.setCity(cityName);
    weather.setUnits('imperial');

    // check http://openweathermap.org/appid#get for get the APPID
    weather.setAPPID(openWeatherKey);

    // get all the JSON file returned from server (rich of info)
    try {
      weather.getAllWeather(function queryData(err, JSONObj) {
        if (JSONObj.cod == '404')
          return message.reply(':x: City was not found.');
        if (JSONObj.cod == '429')
          return message.reply(':x: Weather Api Limit Exceeded.');
        if (err) {
          message.reply(':x: There was a problem with your request.');
          return console.error(err);
        }

        // Compass Conversion
        function degToCompass(num) {
          var val = Math.floor(num / 22.5 + 0.5);
          var arr = [
            'N :arrow_upper_right:',
            'NNE :arrow_upper_right:',
            'NE :arrow_upper_right:',
            'ENE :arrow_upper_right:',
            'E :arrow_right:',
            'ESE :arrow_lower_right:',
            'SE :arrow_lower_right:',
            'SSE :arrow_lower_right:',
            'S :arrow_down:',
            'SSW :arrow_lower_left:',
            'SW :arrow_lower_left:',
            'WSW :arrow_lower_left:',
            'W :arrow_left:',
            'WNW :arrow_upper_left:',
            'NW :arrow_upper_left:',
            'NNW :arrow_upper_left:'
          ];
          return arr[val % 16];
        }
        console.log(JSONObj);

        //Weather Embed
        const embed = new MessageEmbed()
          .setAuthor(
            'Current Weather for ' + JSONObj.name + ', ' + JSONObj.sys.country,
            `https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/icons/logo_60x60.png`
          )
          .setDescription('**Description**\n' + JSONObj.weather[0].description)
          .setColor('#48484A')
          .setThumbnail(
            `http://openweathermap.org/img/wn/` +
              JSONObj.weather[0].icon +
              '@2x.png'
          )
          .addField(
            ':thermometer: Current Temp Info',
            JSONObj.main.temp +
              ' F (*' +
              (((JSONObj.main.temp - 32) * 5) / 9).toFixed(2) +
              ' C*)\n' +
              '**Feels Like**\n' +
              JSONObj.main.feels_like +
              ' F (*' +
              (((JSONObj.main.feels_like - 32) * 5) / 9).toFixed(2) +
              ' C*)\n' +
              '**Humidity**\n' +
              JSONObj.main.humidity +
              '%\n',
            true
          )
          .addField('\u200b', '\u200b', true)
          .addField(
            ':wind_blowing_face: Wind Info',
            JSONObj.wind.speed +
              ' mph' +
              ' (*' +
              (JSONObj.wind.speed * 1.609).toFixed(2) +
              ' kph*)\n**' +
              degToCompass(JSONObj.wind.deg) +
              '** ( deg: ' +
              JSONObj.wind.deg +
              '*)',
            true
          )
          .addField(
            'Barometer',
            (JSONObj.main.pressure * 0.02953).toFixed(2) +
              ' inHg (*' +
              JSONObj.main.pressure +
              ' hPa*)\n' +
              '**Cloud Coverage**\n' +
              JSONObj.clouds.all +
              '%'
          )
          .setFooter('Powered by openweathermap.org')
          .setTimestamp();

        // Send Embed
        message.say(embed);
      });
    } catch (e) {
      message.say(':x: Something went wrong!\n' + e);
    }
  }
};
