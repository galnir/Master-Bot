const { Command, version } = require('discord.js-commando');
const Discord = require('discord.js');
const os = require('os');
const pkg = require('../../package.json');

module.exports = class BotStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bot-status',
      group: 'other',
      memberName: 'bot-status',
      description: 'Shows the current system status'
    });
  }

  async run(message) {
    // CPU information
    function cpuAverage() {
      var totalIdle = 0,
        totalTick = 0;
      var cpus = os.cpus();

      // Loop through CPU cores
      for (var i = 0, len = cpus.length; i < len; i++) {
        var cpu = cpus[i];

        for (var type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      }

      //Return the average Idle and Tick times
      return {
        idle: totalIdle / cpus.length,
        total: totalTick / cpus.length
      };
    }

    // function to calculate average of array
    const arrAvg = function(arr) {
      if (arr && arr.length >= 1) {
        const sumArr = arr.reduce((a, b) => a + b, 0);
        return sumArr / arr.length;
      }
    };

    // load average for the past 250 milliseconds calculated every 100
    function getCPULoadAVG(avgTime = 250, delay = 100) {
      return new Promise((resolve, reject) => {
        const n = ~~(avgTime / delay);
        if (n <= 1) {
          reject('Error: interval to small');
        }

        let i = 0;
        let samples = [];
        const avg1 = cpuAverage();

        let interval = setInterval(() => {
          if (i >= n) {
            clearInterval(interval);
            resolve(~~(arrAvg(samples) * 100));
          }

          const avg2 = cpuAverage();
          const totalDiff = avg2.total - avg1.total;
          const idleDiff = avg2.idle - avg1.idle;

          samples[i] = 1 - idleDiff / totalDiff;

          i++;
        }, delay);
      });
    }

    const commandTotal = this.client.registry.commands.keyArray();
    const platform = os
      .platform()
      .replace(/win32/, 'Windows')
      .replace(/darwin/, 'MacOS')
      .replace(/linux/, 'Linux');
    const archInfo = os.arch();
    const libList = JSON.stringify(pkg.dependencies)
      .replace(/,/g, '\n')
      .replace(/"/g, '')
      .replace(/{/g, '')
      .replace(/}/g, '')
      .replace(/\^/g, '')
      .replace(/github\:discordjs\/Commando/, `${version}`)
      .replace(/github\:discordjs\/discord.js#stable/, `${Discord.version}`)
      .replace(/:/g, ': ');

    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    let totalSeconds = process.uptime();
    let realTotalSecs = Math.floor(totalSeconds % 60);
    let days = Math.floor((totalSeconds % 31536000) / 86400);
    let hours = Math.floor((totalSeconds / 3600) % 24);
    let mins = Math.floor((totalSeconds / 60) % 60);

    const guildCacheMap = this.client.guilds.cache;
    const guildCacheArray = Array.from(guildCacheMap, ([name, value]) => ({
      name,
      value
    }));
    let memberCount = 0;
    for (let i = 0; i < guildCacheArray.length; i++) {
      memberCount = memberCount + guildCacheArray[i].value.memberCount;
    }

    const StatusEmbed = new Discord.MessageEmbed()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setTitle(`Status of ${this.client.user.username}`)
      .setColor('#ff0000')
      .addField('CPU Load', (await getCPULoadAVG()) + '%', true)
      .addField(`Memory Usage`, `${Math.round(used * 100) / 100}MB`, true)
      .addField(`Platform`, `${platform} ${archInfo}`, true)
      .addField(
        `Uptime`,
        `${days} D ${hours} H : ${mins} M : ${realTotalSecs} S`,
        true
      )
      .addField('Operated By', this.client.owners)
      .addField(
        'Available Commands',
        `${commandTotal.length} Commands Available`
      )
      .addField(
        'Servers, Users',
        `On ${this.client.guilds.cache.size} servers, with a total of ${memberCount} users.`
      )
      .addField(
        'Dependency List',
        `node: ${process.version.replace(/v/, '')}
        ${libList}`
      )
      .setFooter('Created', this.client.user.avatarURL())
      .setTimestamp(this.client.user.createdAt);

    message.channel.send(StatusEmbed);
  }
};
