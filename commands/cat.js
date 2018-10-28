const snekfetch = require('snekfetch');

module.exports = {
    name: 'cat',
    cooldown: 5,
    description: 'random cat image!',
    async execute(message, args) {
        try {
            const { body } = await snekfetch.get('https://aws.random.cat/meow');
            message.channel.send(body.file);
    }
    catch (err) {
        message.channel.send('Request to find a kitty failed :(');
        return Promise.reject(new Error(400));
    }
    },
};