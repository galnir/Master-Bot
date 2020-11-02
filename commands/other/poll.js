const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class PollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'poll',
            group: 'other',
            memberName: 'poll',
            description: 'Creates a poll with up to 10 choices.',
            args: [
                {
                    key: 'question',
                    prompt: 'What is the poll question?',
                    type: 'string',
                    validate: question => {
                        if (question.length < 101 && question.length > 11) return true;
                        return 'Polling questions must be between 10 and 100 characters in length.';
                    }  
                }, 
                {
                    key: 'options',
                    prompt: 'What options do you want for the poll?',
                    type: 'string',
                    validate: options => {
                        var optionsList = options.split(",");
                        if (optionsList.length > 1) return true;
                        return 'Polling options must be greater than one.';
                    }  
                },
                {
                    key: 'time',
                    prompt: 'How long should the poll last in minutes?',
                    type: 'integer',
                    default: 0,
                    validate: time => {
                        if (time >= 0 && time <= 60) return true;
                        return 'Polling time must be between 0 and 60.';
                    } 
                },
            ]
        });
    }
    
    run(msg, { question, options, time }) {
        var emojiList = ['1⃣','2⃣','3⃣','4⃣','5⃣','6⃣','7⃣','8⃣','9⃣','🔟'];
        var optionsList = options.split(",");
        
        var optionsText = "";
        for (var i = 0; i < optionsList.length; i++) { 
            optionsText += emojiList[i] + " " + optionsList[i] + "\n";
        }
        
        var embed = new MessageEmbed()
            .setTitle(question)
            .setDescription(optionsText)
            .setAuthor(msg.author.username, msg.author.displayAvatarURL)
            .setColor(`#FF0000`)
            .setTimestamp();
            
        if (time) {
            embed.setFooter(`The poll has started and will last ${time} minute(s)`);
        } else {
            embed.setFooter(`The poll has started and has no end time`);
        }
            
        //msg.delete(); // Remove the user's command message

        msg.channel.send({embed}) // Definitely use a 2d array here..
            .then(async function (message) {
                var reactionArray = [];
                for (var i = 0; i < optionsList.length; i++) { 
                    reactionArray[i] = await message.react(emojiList[i]);
                }
                
                if (time) {
                    setTimeout(() => {
                        // Re-fetch the message and get reaction counts
                        message.channel.fetchMessage(message.id)
                            .then(async function (message) {
                                var reactionCountsArray = [];
                                for (var i = 0; i < optionsList.length; i++) {
                                    reactionCountsArray[i] = message.reactions.get(emojiList[i]).count-1;
                                }

                                // Find winner(s)
                                var max = -Infinity, indexMax = [];
                                for(var i = 0; i < reactionCountsArray.length; ++i)
                                    if(reactionCountsArray[i] > max) max = reactionCountsArray[i], indexMax = [i];
                                    else if(reactionCountsArray[i] === max) indexMax.push(i);
                        
                                // Display winner(s)
                                console.log(reactionCountsArray); // Debugging votes
                                var winnersText = "";
                                if (reactionCountsArray[indexMax[0]] == 0) {
                                    winnersText = "No one voted!"
                                } else {
                                    for (var i = 0; i < indexMax.length; i++) {
                                        winnersText += 
                                            emojiList[indexMax[i]] + " " + optionsList[indexMax[i]] + 
                                            " (" + reactionCountsArray[indexMax[i]] + " vote(s))\n";
                                    }
                                }
                                
                                embed.addField("**Winner(s):**", winnersText);
                                embed.setFooter(`The poll is now closed! It lasted ${time} minute(s)`);
                                embed.setTimestamp();
                                
                                message.edit("", embed);
                            });
                    }, time * 60 * 1000);
                }
            }).catch(console.error);
                
        return;
    }
};