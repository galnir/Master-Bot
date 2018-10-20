
module.exports = {
	name: 'kick',
	description: 'Tag a member and kick them.',
	cooldown: 5,
    guildOnly: true,
	execute(message) {
		if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("No permission!");
        if(bannedUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send('This person is too important to be banned');
		message.channel.send('kick command still not implemented');
		if (!message.mentions.users.size) {
			return message.reply('you need to tag a user in order to kick them!');
		}

		const taggedUser = message.mentions.users.first();

		member.kick().then(() => console.log('Kicked ${member.displayName}')).catch(console.error);
	},
};