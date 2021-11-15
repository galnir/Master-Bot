const selfRoles = require('./selfRoles.json');

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {

	if(reaction.message.id === ReactionMessage){
		if (selfRoles[reaction.emoji.name] != null){

			const selfRole = reaction.message.guild.roles.cache.find(
			  role => role.name === selfRoles[reaction.emoji.name]
			);

			if (!selfRole)
			  return console.error('Es ist ein Fehler mit den Self Roles aufgetreten.');

			var member = reaction.message.guild.member(user);

			if (member.roles.cache.some(role => role.name === selfRole.name)) {
				member.roles.remove(selfRole);
				member.send(`Du hast dir die Gruppe ${selfRole.name} weggenommen!`);
			}else{
				member.roles.add(selfRole);
				member.send(`Du hast dir die Gruppe ${selfRole.name} gegeben!`);
			}
		}
		reaction.users.remove(user);
	}
  }
};
