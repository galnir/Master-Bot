const { Collection } = require('discord.js');
const {
	mongo_URI,
	token,
	discord_owner_id,
	RuleMessage,
	botStatusChannel,
	welcomeChannel,
	ReactionMessage,
	ReactionChannel,
	twitterUserID,
	twitterDiscordChannel,
	twitterConsumerKey,
	twitterConsumerSecret,
	twitterAccessToken,
	twitterAccessSecret,
	youtubeDiscordChannel,
	youtubers,
	youtubeAPI
} = require('./config.json');
const mongoose = require('mongoose');
const Reminder = require('../utils/models/Reminder');
const setUpReminders = require('../utils/setUpReminders');

const RssFeedEmitter = require('rss-feed-emitter');
const feeder = new RssFeedEmitter({ skipFirstLoad: true });

const Youtube = require("simple-youtube-api");
const youtube = new Youtube(youtubeAPI);

const startAt = Date.now();
const lastVideos = {};

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

  //TWITTER
  const T = new Twit({
    consumer_key:         twitterConsumerKey,
    consumer_secret:      twitterConsumerSecret,
    access_token:         twitterAccessToken,
    access_token_secret:  twitterAccessSecret,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
  })
  var stream = T.stream('statuses/filter', { follow: [twitterUserID] })

  stream.on('tweet', function (tweet) {
    //...
	if(tweet.in_reply_to_user_id_str != null) return; //CANCELS REPLIES

    var url = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;

	let channel = client.channels.fetch(twitterDiscordChannel).then(channel => {
		//channel.send("**Mr. Jackson Undercover** hat etwas neues getwittert!");
		channel.send(url)
    }).catch(err => {
        console.log('Couldnt find the Twitter Channel')
    })
  })
  stream.on('error', function(err) {
	  //console.log('Twitter Error')
      console.log(err)
  });

  //YOUTUBE INIT
  feeder.on('error', function(err) {
	  console.log('Youtube Error')
      //console.log(err)
  });

  check();

  try {
	//REACTIONS
    let reactionCh = client.channels.fetch(ReactionChannel).then(reactionCh => {
	    reactionCh.messages.fetch(ReactionMessage, true); //NEEDS TO BE CACHED TO WORK
    }).catch(err => {
        console.log(err)
    })

  } catch (error) {
    console.error(error);
  }

    console.log('Ready!');
  }
};


feeder.on('newVideo', function(video) {
     let channel = client.channels.cache.get(youtubeDiscordChannel);
     if(!channel) return console.log("[ERR] | Channel not found");

    let description = video["media:group"]["media:description"]["#"];
    if(description == null)
        description = "";

    const newVidEmbed = new MessageEmbed()
        .setTitle(':new: ' + video.title)
        .setDescription(description.length > 200 ? description.substring(0, 200) + ' ...' : description)
        .setFooter(video.author + ' hat ein neues Video hochgeladen!')
        .setColor('#FF0040')
        .setAuthor(video.author)
        .setImage(video.image.url)
        .setURL(video.link)
        .setTimestamp(video.pubdate);

	channel.send(newVidEmbed);

	console.log("Youtube Notification sent!");
});
