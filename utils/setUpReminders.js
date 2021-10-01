const Reminder = require("./models/Reminder");

const setUpReminders = (reminders, client) => {

    if (reminders.length == 0) return;

    reminders.forEach((remind) => {

        const time = (remind.createdAt + remind.time * 60000) - new Date();

        if ( time < 0 ) { //In case for some reason it was not deleted from the database.
            setTimeout(async () => {

                client.channels.cache.find((channel) => {
                    
                    if (channel.id == remind.channelId) {
                        channel.send(`<@${remind.author}> :alarm_clock: Reminder: ${remind.text}`);
                    
                        Reminder.deleteOne({ _id: remind._id });
                    
                    }
                })
    
            }, time)
        }

        console.log((remind.createdAt + remind.time * 60000) - new Date());
        
    });

}

module.exports = setUpReminders;