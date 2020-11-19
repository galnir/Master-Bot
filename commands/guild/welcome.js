const { Command } = require("discord.js-commando");
const db = require('quick.db');

module.exports = class WecomeMessageCommand extends Command {
    constructor(client) {
        super(client, {
            name: "welcome",
            memberName: "welcome",
            group: "guild",
            guildOnly: true,
            clientPermissions: ['ADMINISTRATOR'],
            description: "Askes if you want your server to have Welcome messages.",
            args: [
                {
                    key: "choice",
                    prompt: "Do you want welcome new users with a custom messages? Type: Yes or No",
                    type: "string",
                    oneOf: ['yes', 'no' ]                                   
                }
            ]
        });
    }

 
    run(message, { choice }) {
        db.set(message.member.guild.id, { welcomeMsgStatus: choice.toLowerCase() });
        
        if (choice == 'yes')
            message.say(`Welcome Message Enabled on ${message.member.guild.name}`)
         
        if (choice == 'no')
            message.say(`Welcome Message Disabled on ${message.member.guild.name}`)
    }
}