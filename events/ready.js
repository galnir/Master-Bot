const { Collection } = require('discord.js');
const { mongo_URI } = require('../config.json');
const mongoose = require('mongoose');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        client.playerManager = new Map();
        client.triviaManager = new Map();
        client.guildData = new Collection();
        client.user.setActivity('/', { type: 'WATCHING' });
        mongoose
          .connect(encodeURI(mongo_URI), {
            useNewUrlParser: true,
            useUnifiedTopology: true
          })
          .then(() => {
            console.log('Mongo is ready');
          })
          .catch(console.error);
      
        console.log('Ready!');

    }
  };
  