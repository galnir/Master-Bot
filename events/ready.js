const { Collection } = require('discord.js');
const { mongo_URI } = require('../config.json');
const mongoose = require('mongoose');
const Reminder = require('../utils/models/Reminder');
const setUpReminders = require('../utils/setUpReminders');

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
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      .then(() => {
        console.log('Mongo is ready');
      })
      .catch(console.error);

    try {
      const reminders = await Reminder.find({});
      setUpReminders(reminders, client);
    } catch {
      console.log('no reminders found');
    }

    console.log('Ready!');
  }
};
