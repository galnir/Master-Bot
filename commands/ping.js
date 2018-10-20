module.exports = {
    name: 'ping',
    cooldown: 5,
    description: 'Ping!',
    execute(message, args) {
        message.channel.send('Pong.');
    },
};