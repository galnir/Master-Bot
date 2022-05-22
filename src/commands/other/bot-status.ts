import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as os from 'os';
// @ts-ignore
import pkg from '../../../package.json';

@ApplyOptions<CommandOptions>({
  name: 'bot-status',
  description: `Shows the current system status`
})
export class BotStatusCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const ping = Date.now() - interaction.createdTimestamp;
    const apiPing = Math.round(interaction.client.ws.ping);

    const admin = await interaction.guild?.fetchOwner();
    const isAdmin = admin?.id == interaction.user.id ? true : false;

    await interaction.client.application?.fetch();
    const owner = interaction.client.application?.owner;
    const isOwner = owner?.id == interaction.user.id ? true : false;

    function cpuAverage() {
      let totalIdle: number = 0,
        totalTick: number = 0,
        cpus: os.CpuInfo[] = os.cpus();

      // Loop through CPU cores
      for (let i = 0; i < cpus.length; i++) {
        let cpu: os.CpuInfo = cpus[i];

        totalTick +=
          cpu.times.nice +
          cpu.times.user +
          cpu.times.irq +
          cpu.times.sys +
          cpu.times.idle;

        totalIdle += cpu.times.idle;
      }

      //Return the average Idle and Tick times
      return {
        idle: totalIdle / cpus.length,
        total: totalTick / cpus.length
      };
    }

    // function to calculate average of array
    const arrAvg = function (arr: number[]) {
      if (arr && arr.length >= 1) {
        const sumArr = arr.reduce((a: number, b: number) => a + b, 0);
        return sumArr / arr.length;
      }
      return;
    };

    // load average for the past 250 milliseconds calculated every 100
    function getCPULoadAVG(avgTime = 250, delay = 100) {
      return new Promise((resolve, reject) => {
        const n = ~~(avgTime / delay);
        if (n <= 1) {
          reject('Error: interval to small');
        }

        let i = 0;
        let samples: number[] = [];
        const avg1 = cpuAverage();

        let interval = setInterval(() => {
          if (i >= n) {
            clearInterval(interval);
            resolve(~~(arrAvg(samples)! * 100));
          }

          const avg2 = cpuAverage();
          const totalDiff = avg2.total - avg1.total;
          const idleDiff = avg2.idle - avg1.idle;

          samples[i] = 1 - idleDiff / totalDiff;

          i++;
        }, delay);
      });
    }

    const commandTotal = interaction.client.application?.commands.cache.size;
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
      .replace(/:/g, ': ');

    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const duration = process.uptime();

    let days = Math.floor((duration % 31536000) / 86400),
      hours = Math.floor((duration / 3600) % 24),
      minutes = Math.floor((duration / 60) % 60),
      seconds = Math.floor(duration % 60);

    const upTime = `${days > 0 ? days + ' D ' : ''}${
      hours > 0 ? hours + ' H ' : ''
    }${minutes > 0 ? minutes + ' M ' : ''}${seconds} S`;

    const guildCacheMap = interaction.client.guilds.cache;
    const guildCacheArray = Array.from(guildCacheMap, ([name, value]) => ({
      name,
      value
    }));
    let memberCount = 0;
    for (let i = 0; i < guildCacheArray.length; i++) {
      memberCount = memberCount + guildCacheArray[i].value.memberCount;
    }
    const PaginatedEmbed = new PaginatedMessage();

    const StatusEmbed = new MessageEmbed()
      .setThumbnail(interaction.client.user?.avatarURL()!)
      .setTitle(`${interaction.client.user?.username} - Status`)
      .setColor('GREY');

    StatusEmbed.addField(
      'Ping',
      `Interaction: ${ping}ms.
      Heartbeat: ${apiPing}ms.
      Round-trip: ${ping + apiPing}ms.`
    )
      .addField(`Uptime`, `${upTime}`)
      .addField('Available Commands', `${commandTotal} Commands Available`)
      .addField(
        'Servers, Users',
        `On ${interaction.client.guilds.cache.size} servers, with a total of ${memberCount} users.`
      )

      .setFooter({ text: 'Created', iconURL: interaction.user.avatarURL()! })
      .setTimestamp(interaction.client.application?.createdTimestamp);

    PaginatedEmbed.addPageEmbed(StatusEmbed);

    if (isAdmin && !isOwner) {
      const adminEmbed = new MessageEmbed();
      adminEmbed
        .setThumbnail(interaction.client.user?.avatarURL()!)
        .setTitle(`Status of ${interaction.client.user?.username} - Info`)
        .setColor('DARKER_GREY')
        .addField(`Memory Usage`, `${Math.round(used * 100) / 100}MB`, true)
        .addField(`Platform`, `${platform} ${archInfo}`, true)
        .addField(
          'Dependency List',
          `node: ${process.version.replace(/v/, '')}
        ${libList}`
        )
        .setFooter({ text: 'Created', iconURL: interaction.user.avatarURL()! })
        .setTimestamp(interaction.client.application?.createdTimestamp);

      PaginatedEmbed.addPageEmbed(adminEmbed);
    }
    // Show CPU Info to the Bot Maintainer Only
    if (isOwner) {
      const adminEmbed = new MessageEmbed();
      adminEmbed
        .setThumbnail(interaction.client.user?.avatarURL()!)
        .setTitle(`${interaction.client.user?.username} - Info`)
        .setColor('DARKER_GREY')
        .addField('CPU Load', (await getCPULoadAVG()) + '%', true)
        .addField(`Memory Usage`, `${Math.round(used * 100) / 100}MB`, true)
        .addField(`Platform`, `${platform} ${archInfo}`, true)
        .addField(
          'Dependency List',
          `node: ${process.version.replace(/v/, '')}
        ${libList}`
        )
        .setFooter({
          text: 'Created',
          iconURL: interaction.user.avatarURL()!
        })
        .setTimestamp(interaction.client.application?.createdTimestamp);

      PaginatedEmbed.addPageEmbed(adminEmbed);
    }

    // Removes the unwanted Menu Selection Row From Embed
    if (PaginatedEmbed.actions.size > 0)
      PaginatedEmbed.actions.delete('@sapphire/paginated-messages.goToPage');

    PaginatedEmbed.run(interaction);
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
