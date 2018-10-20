module.exports = {
    name: 'user-info',
    cooldown: 5,
    description: 'gives the user info about himself!',
    execute(message, args) {
        message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    },
};