const { Command } = require('discord.js-commando');
const parseString = require('xml2js').parseString;
const fetch = require('node-fetch');

module.exports = class Rule34Command extends Command {
  constructor(client) {
    super(client, {
      name: 'rule34',
      group: 'gifs',
      aliases: ['r34'],
      memberName: 'rule34',
      description: 'Dawaj obraz z rule34!',
      throttling: {
        usages: 1,
        duration: 4
      },
      args: [
        {
          key: 'text',
          prompt: 'Jaki spicy obrazek chcesz zobaczyć?',
          type: 'string',
          validate: text => text.length < 50
        }
      ]
    });
  }

    run(message, { text }) {/*
        async function getLewd(message, { text }) {

            const url = `https://rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${text}`;
            try {
                const response = await fetch(url)
                const apiData = await response.text()
                parseString(apiData, function (error, result) {
                let postCount = result.posts.$.count - 1;
                if(postCount > 100) {
                    postCount = 100;
                }
                if(postCount > 0) {
                    var picNum = Math.floor(Math.random() * postCount) + 0;
                    var r34Pic = result.posts.post[picNum].$.file_url;
                    message.channel.send({
                      files: [{
                        attachment: r34Pic,
                        name: 'SPOILER_NAME.jpg'
                      }],
                    });
                } else {
                    message.channel.send("Nie znaleziono nic z tym tagiem! Spróbuj inaczej (przykład: tagu 'Asuna' nie wyszukuje, natomiast 'Yuuki_Asuna już tak).");
                }
                })
            } catch (error) {
                console.log(error)
                message.channel.send("Problem z hostingiem rule34")
            }
        }
        getLewd(message, { text })*/
        fetch(`https://api.tenor.com/v1/random?key=${tenorAPI}&q=cat&limit=1`)
        .then(res => res.json())
        .then(json => {
          message.say("Jebać władze.")
          message.say(json.results[0].url)})
        .catch(err => {
          message.say('Nie znaleziono kitku.');
          return console.error(err);
        });
    }
}
