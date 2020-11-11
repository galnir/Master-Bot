const { Command } = require("discord.js-commando");
const covid = require("novelcovid");
const { MessageEmbed } = require("discord.js");
const { default: Axios } = require("axios");

module.exports = class CovidCommand extends Command {
  constructor(client) {
    super(client, {
      name: "covid",
      aliases: ["corona", "covid19"],
      group: "other",
      memberName: "covid",
      description: "Show worldwide corona cases or by country.",
      examples: ["covid United States", "covid UK"],
      throttling: {
        duration: 10,
        usages: 2,
      },
      args: [
        {
          key: "country",
          type: "string",
          prompt: "Which country's cases do you want to see?",
          default: "",
        },
      ],
    });
  }
  async run(message, { country }) {
    if (country) {
      const stats = await covid.countries({ country });
      if (stats.message) {
        message.say("i can't seem to find that country-");
      } else {
        const image = await this.getWikiPicture(stats.country);

        const embed = new MessageEmbed()
          .setTitle(`${stats.country}'s Covid-19 stats`)
          .setColor("RED")
          .setThumbnail(stats.countryInfo.flag)
          .setImage(image)
          .addField("Confirmed cases", stats.cases, true)
          .addField("Confirmed cases today", stats.todayCases, true)
          .addField("Deaths today", stats.todayDeaths, true)
          .addField(
            "Active",
            `${stats.active.toLocaleString()} (${(
              (stats.active / stats.cases) *
              100
            ).toFixed(2)}%)`,
            true
          )
          .addField(
            "Recovered",
            `${stats.recovered.toLocaleString()} (${(
              (stats.recovered / stats.cases) *
              100
            ).toFixed(2)}%)`,
            true
          )
          .addField(
            "Deaths",
            `${stats.deaths.toLocaleString()} (${(
              (stats.deaths / stats.cases) *
              100
            ).toFixed(2)}%)`,
            true
          )
          .addField("Tests", `${stats.tests.toLocaleString()}`, true)
          .addField(
            "Cases Per Mil",
            `${stats.casesPerOneMillion.toLocaleString()}`,
            true
          )
          .addField(
            "Deaths Per Mil",
            `${stats.deathsPerOneMillion.toLocaleString()}`,
            true
          )
          .setFooter("Last updated")
          .setTimestamp(stats.updated);

        message.embed(embed);
      }
    } else {
      const total = await covid.all();

      const embed = new MessageEmbed()
        .setTitle("Global Covid-19 Stats")
        .setColor("RED")
        .addField("Confirmed cases", total.cases, true)
        .addField("Confirmed cases today", total.todayCases, true)
        .addField("Deaths today", total.todayDeaths, true)
        .addField(
          "Active",
          `${total.active.toLocaleString()} (${(
            (total.active / total.cases) *
            100
          ).toFixed(2)}%)`,
          true
        )
        .addField(
          "Recovered",
          `${total.recovered.toLocaleString()} (${(
            (total.recovered / total.cases) *
            100
          ).toFixed(2)}%)`,
          true
        )
        .addField(
          "Deaths",
          `${total.deaths.toLocaleString()} (${(
            (total.deaths / total.cases) *
            100
          ).toFixed(2)}%)`,
          true
        )
        .addField("Tests", `${total.tests.toLocaleString()}`, true)
        .addField(
          "Cases Per Mil",
          `${total.casesPerOneMillion.toLocaleString()}`,
          true
        )
        .addField(
          "Deaths Per Mil",
          `${total.deathsPerOneMillion.toLocaleString()}`,
          true
        )
        .setFooter("Last updated")
        .setTimestamp(total.updated);

      message.embed(embed);
    }
  }

  wikipediaBaseURL =
    "https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_";

  async getWikiPicture(country) {
    // If the country is the united states, return this URL
    if (country == "USA") {
      return `https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/COVID-19_Outbreak_Cases_in_the_United_States_%28Density%29.svg/640px-COVID-19_Outbreak_Cases_in_the_United_States_%28Density%29.svg.png?date=${Date.now()}`;
    } else {
      // Get the wikipedia page with the function
      const wikipediaName = this.genWikipediaName(country);
      // Then fetch the wikipedia page
      const wikipediaPage = await Axios.get(
        `${this.wikipediaBaseURL}${wikipediaName}`
      );
      // Define the image meta tag regex
      const ImageRegex = /<meta property="og:image" content="([^<]*)"\/>/;
      // Search for the meta tag
      const imageLink = ImageRegex.exec(wikipediaPage.data);
      // Return the image link if one is found, otherwise return an empty string
      if (imageLink) {
        return imageLink[1] + `?date=${Date.now()}`;
      } else return "";
    }
  }

  genWikipediaName(country) {
    // If country has a prefix on Wikipedia, add it
    const prefix = country == "Netherlands" ? "the_" : "";
    // Define countries that are aliased in covid API, but not on Wikipedia
    const aliasedCountries = {
      "S. Korea": "South Korea",
      UK: "United Kingdom",
      USA: "United States",
    };
    // If a country is aliased, unalias it
    if (aliasedCountries[country]) country = aliasedCountries[country];
    // Replace all spaces with a "_"
    country = country.replace(/\s/g, "_");
    // Return the country name with it's prefix
    return prefix + country;
  }
};
