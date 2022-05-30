import { createCanvas, Image } from '@napi-rs/canvas';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
  container
} from '@sapphire/framework';
import axios from 'axios';
import {
  CommandInteraction,
  MessageAttachment,
  MessageEmbed,
  MessageReaction,
  User,
  Message,
  MessageButton,
  MessageActionRow
} from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'connect-4',
  description: 'Play a game of Connect-4 with another Person.',
  detailedDescription: ` **The Rules**
            Players must connect 4 of the same colored discs in a row to win.
            Only one piece is played at a time.
            Players can be on the offensive or defensive.
            The game ends when there is a 4-in-a-row or a stalemate.
            The starter of the previous game goes second on the next game.
            Use the emojis 1️⃣, 2️⃣, 3️⃣, etc... to place your colored disc in that column.
            You have 1 minute per turn or it's an automatic forfeit.
            Incase of invisible board click 🔄 (may take more than one click).`,
  preconditions: ['GuildOnly']
})
export class Connect4Command extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const player1 = interaction.user;
    const player2 = interaction.options.getUser('user', true);

    if (client.gameData.connect4Players.has(player1.id)) {
      interaction.reply("You can't play more than 1 game at a time");
      return;
    }
    if (client.gameData.connect4Players.has(player2.id)) {
      interaction.reply(`${player2.username} is already playing`);
      return;
    }

    if (player1.id === player2.id) {
      return interaction.reply("Sorry can't play against yourself");
    }
    if (player2.bot) {
      return interaction.reply("Sorry can't play against a bot user");
    }

    client.gameData.connect4Players.set(player1.id, player1);
    client.gameData.connect4Players.set(player2.id, player2);
    const player1Avatar = player1.displayAvatarURL({
      format: 'jpg'
    });
    const player1Image = await axios.request({
      responseType: 'arraybuffer',
      url: player1Avatar
    });

    const player1Piece = new Image();
    player1Piece.src = Buffer.from(await player1Image.data);

    const player2Avatar = player2.displayAvatarURL({
      format: 'jpg'
    });

    const player2Image = await axios.request({
      responseType: 'arraybuffer',
      url: player2Avatar
    });
    const player2Piece = new Image();
    player2Piece.src = Buffer.from(await player2Image.data);

    // Ask Player 2 if they want to play before filling the channel with Large Embeds
    let acceptedInvite = false;
    const gameInvite = new MessageEmbed()
      .setAuthor({
        name: player1.username,
        iconURL: interaction.user.avatar
          ? interaction.user.displayAvatarURL({ dynamic: true })
          : interaction.user.defaultAvatarURL
      })
      .setTitle('Connect 4 - Game Invitation')
      .setColor('YELLOW')
      .setThumbnail(player2Avatar ?? interaction.user.defaultAvatarURL)
      .setDescription(
        `${player1} would like to play a game of Connect-4 against ${player2}, Do you accept ${player2}?`
      )
      .setFooter({ text: 'Invite will expire in 60 seconds' })
      .setTimestamp();

    const gameInviteButtons = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`${player2.id}-Yes`)
        .setLabel('Yes')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId(`${player2.id}-No`)
        .setLabel('No')
        .setStyle('DANGER')
    );

    await interaction
      .reply({
        content: `Connect 4 - ${player1} vs ${player2}`,
        allowedMentions: { users: [player2.id] },
        embeds: [gameInvite],
        components: [gameInviteButtons]
      })
      .then(() => {
        const inviteCollector =
          interaction.channel?.createMessageComponentCollector({
            time: 60 * 1000
          });
        inviteCollector?.on('collect', async response => {
          if (response.user === player1) return;

          if (response.user !== player2) {
            await response.reply({
              content: `:x: Invite is for ${player2}.`,
              ephemeral: true
            });
            return inviteCollector.empty();
          }
          if (
            response.user.id === player2.id &&
            response.customId === `${player2.id}-No`
          ) {
            client.gameData.connect4Players.delete(player1.id);
            client.gameData.connect4Players.delete(player2.id);
            await interaction.followUp({
              content: `${player2} has declined your game invitation.`,
              ephemeral: true,
              target: player1
            });
            acceptedInvite = false;
            return inviteCollector.stop('declined');
          }
          if (
            response.user.id === player2.id &&
            response.customId === `${player2.id}-Yes`
          ) {
            acceptedInvite = true;
            inviteCollector.stop();
            return connect4(player1, player2);
          }
        });
        inviteCollector?.on('end', async (collected, reason) => {
          await interaction.deleteReply()!;
          if (acceptedInvite === false || reason === 'declined') {
            client.gameData.connect4Players.delete(player1.id);
            client.gameData.connect4Players.delete(player2.id);
            if (reason === 'time')
              await interaction.followUp({
                content: `:x: ${player2} did not respond to your invitation.`,
                ephemeral: true,
                target: player1
              });
            return;
          }
        });
        async function connect4(player1: User, player2: User) {
          let gameBoard: number[][] = [
            [0, 0, 0, 0, 0, 0, 0], // row 6
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0] // row 1
            // column ->
          ];

          const row: { [key: number]: number[] } = {
            0: [1, 2, 3, 4, 5, 6], // column 1
            1: [1, 2, 3, 4, 5, 6],
            2: [1, 2, 3, 4, 5, 6],
            3: [1, 2, 3, 4, 5, 6],
            4: [1, 2, 3, 4, 5, 6],
            5: [1, 2, 3, 4, 5, 6],
            6: [1, 2, 3, 4, 5, 6] // column 7
            // row ->
          };

          let currentPlayer = player1.id;
          let boardImageURL: string | null = null;

          let currentTurn = 0;
          await createBoard();
          ++currentTurn;

          const Embed = new MessageEmbed()
            .setThumbnail(player1Avatar)
            .setColor('RED')
            .setTitle(`Connect 4 - Player 1's Turn`)
            .setDescription(
              `Incase of invisible board click 🔄.
         Use 1️⃣, 2️⃣, 3️⃣, etc... to place your colored disc in that column.
         Thumbnail and Title indicate current players turn.
         You have 1 minute per turn or it's an automatic forfeit.`
            )
            .setImage(boardImageURL!)
            .setFooter({ text: 'Incase of invisible board click 🔄' })
            .setTimestamp();

          await interaction.channel
            ?.send({ embeds: [Embed] })
            .then(async (message: Message) => {
              try {
                await message.react('1️⃣');
                await message.react('2️⃣');
                await message.react('3️⃣');
                await message.react('4️⃣');
                await message.react('5️⃣');
                await message.react('6️⃣');
                await message.react('7️⃣');
                await message.react('🔄');
              } catch (error) {
                console.error(
                  'Connect 4 - Failed to Add Reactions to Embed\n',
                  error
                );
              }

              const filter = (reaction: MessageReaction) => {
                return (
                  reaction.emoji.name === '1️⃣' ||
                  reaction.emoji.name === '2️⃣' ||
                  reaction.emoji.name === '3️⃣' ||
                  reaction.emoji.name === '4️⃣' ||
                  reaction.emoji.name === '5️⃣' ||
                  reaction.emoji.name === '6️⃣' ||
                  reaction.emoji.name === '7️⃣' ||
                  reaction.emoji.name === '🔄'
                );
              };

              const gameCollector = message.createReactionCollector({
                filter: filter,
                idle: 60000
              });

              gameCollector.on(
                'collect',
                async (reaction: MessageReaction, user: User) => {
                  if (user.id !== interaction.applicationId)
                    await reaction.users.remove(user).catch(error => {
                      console.error(
                        `Connect 4 - Failed to reset reactions\n`,
                        error
                      );
                    });

                  // Refresh Image
                  if (
                    reaction.emoji.name === '🔄' &&
                    (user.id === player1.id || user.id === player2.id)
                  ) {
                    message.embeds[0].setImage(boardImageURL!);
                    await message.edit({
                      embeds: [message.embeds[0]]
                    });
                  }

                  if (user.id !== currentPlayer) {
                    return;
                  }

                  // Column 1
                  if (reaction.emoji.name === '1️⃣')
                    await playerMove(0, user, message.embeds[0]);

                  // Column 2
                  if (reaction.emoji.name === '2️⃣')
                    await playerMove(1, user, message.embeds[0]);

                  // Column 3
                  if (reaction.emoji.name === '3️⃣')
                    await playerMove(2, user, message.embeds[0]);

                  // Column 4
                  if (reaction.emoji.name === '4️⃣')
                    await playerMove(3, user, message.embeds[0]);

                  // Column 5
                  if (reaction.emoji.name === '5️⃣')
                    await playerMove(4, user, message.embeds[0]);

                  // Column 6
                  if (reaction.emoji.name === '6️⃣')
                    await playerMove(5, user, message.embeds[0]);

                  // Column 7
                  if (reaction.emoji.name === '7️⃣')
                    await playerMove(6, user, message.embeds[0]);

                  await message.edit({ embeds: [message.embeds[0]] });
                }
              );

              gameCollector.on('end', async () => {
                client.gameData.connect4Players.delete(player1.id);
                client.gameData.connect4Players.delete(player2.id);
                return await message.reactions
                  .removeAll()
                  .catch((error: string) =>
                    console.error(
                      'Connect 4 - Failed to Remove All Reactions\n',
                      error
                    )
                  );
              });
            });

          async function createBoard() {
            // Set asset sizes
            const boardHeight = 600;
            const boardWidth = 700;
            const pieceSize = 75 / 2;
            const offset = 25 / 2;

            // Set Image size
            const canvas = createCanvas(boardWidth, boardHeight);
            const ctx = canvas.getContext('2d');

            // Get Center to Center measurements for grid spacing
            const positionX = boardWidth / 7;
            const positionY = boardHeight / 6;

            // Connect 4 Board
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, boardWidth, boardHeight);

            // Build the Game Board
            for (let columnIndex = 0; columnIndex < 7; ++columnIndex) {
              for (let rowIndex = 0; rowIndex < 6; ++rowIndex) {
                // Empty Spaces
                if (gameBoard[rowIndex][columnIndex] === 0) {
                  ctx.beginPath();
                  ctx.shadowColor = 'white';
                  ctx.shadowBlur = 7;
                  ctx.shadowOffsetX = 2;
                  ctx.shadowOffsetY = 2;
                  ctx.arc(
                    offset + (pieceSize + positionX * columnIndex),
                    offset + (pieceSize + positionY * rowIndex),
                    pieceSize,
                    0,
                    Math.PI * 2,
                    true
                  );
                  ctx.fillStyle = 'grey';
                  ctx.fill();
                }
                // Player 1 Pieces
                if (gameBoard[rowIndex][columnIndex] === 1) {
                  ctx.beginPath();
                  ctx.shadowColor = 'grey';
                  ctx.shadowBlur = 7;
                  ctx.shadowOffsetX = 2;
                  ctx.shadowOffsetY = 2;
                  if (player1Piece) {
                    ctx.save();
                    ctx.arc(
                      offset + (pieceSize + positionX * columnIndex),
                      offset + (pieceSize + positionY * rowIndex),
                      pieceSize,
                      0,
                      Math.PI * 2,
                      true
                    );
                    ctx.fillStyle = 'grey';
                    ctx.fill();
                    ctx.clip();
                    ctx.drawImage(
                      player1Piece,
                      offset + positionX * columnIndex,
                      offset + positionY * rowIndex,
                      pieceSize * 2,
                      pieceSize * 2
                    );
                    ctx.restore();
                  } else {
                    ctx.arc(
                      offset + (pieceSize + positionX * columnIndex),
                      offset + (pieceSize + positionY * rowIndex),
                      pieceSize,
                      0,
                      Math.PI * 2,
                      true
                    );
                    ctx.fillStyle = 'red';
                    ctx.fill();
                  }
                }
                // Player 2 Pieces
                if (gameBoard[rowIndex][columnIndex] === 2) {
                  ctx.beginPath();
                  ctx.shadowColor = 'grey';
                  ctx.shadowBlur = 7;
                  ctx.shadowOffsetX = 2;
                  ctx.shadowOffsetY = 2;
                  if (player2Piece) {
                    ctx.save();
                    ctx.arc(
                      offset + (pieceSize + positionX * columnIndex),
                      offset + (pieceSize + positionY * rowIndex),
                      pieceSize,
                      0,
                      Math.PI * 2,
                      true
                    );
                    ctx.fillStyle = 'grey';
                    ctx.fill();
                    ctx.clip();
                    ctx.drawImage(
                      player2Piece,
                      offset + positionX * columnIndex,
                      offset + positionY * rowIndex,
                      pieceSize * 2,
                      pieceSize * 2
                    );
                    ctx.restore();
                  } else {
                    ctx.arc(
                      offset + (pieceSize + positionX * columnIndex),
                      offset + (pieceSize + positionY * rowIndex),
                      pieceSize,
                      0,
                      Math.PI * 2,
                      true
                    );
                    ctx.fillStyle = 'blue';
                    ctx.fill();
                  }
                }
              }
            }

            return await interaction.channel
              ?.send({
                files: [
                  new MessageAttachment(
                    canvas.toBuffer('image/png'),
                    `connect4Game${player1.id}-${player2.id}${currentTurn}.png`
                  )
                ]
              })
              .then(async (result: Message) => {
                boardImageURL = await result.attachments.entries().next()
                  .value[1].url;

                result.delete();
              })
              .catch((error: string) => {
                console.error(
                  'Connect 4 - Failed to Delete previous Image\n',
                  error
                );
              });
          }

          async function playerMove(
            index: number,
            user: User,
            instance: MessageEmbed
          ) {
            if (currentPlayer === 'Game Over' || row[index].length === 0) {
              return;
            }
            if (currentPlayer === user.id) {
              row[index].pop();
              if (currentPlayer === player1.id) {
                gameBoard[row[index].length][index] = 1;
                currentPlayer = player2.id;
                instance
                  .setThumbnail(player2Avatar!)
                  .setTitle(`Connect 4 - Player 2's Turn`)
                  .setColor('BLUE')
                  .setTimestamp();
              } else {
                gameBoard[row[index].length][index] = 2;
                currentPlayer = player1.id;
                instance
                  .setThumbnail(player1Avatar)
                  .setTitle(`Connect 4 - Player 1's Turn`)
                  .setColor('RED')
                  .setTimestamp();
              }
              await createBoard();
              ++currentTurn;
            }

            if (checkWinner(gameBoard) === 0) {
              currentPlayer = 'Game Over';
              // No More Possible Moves
              if (!emptySpaces(gameBoard)) {
                instance
                  .setTitle(`Connect 4 - Game Over`)
                  .setColor('GREY')
                  .setThumbnail('');
              }
              client.gameData.connect4Players.delete(player1.id);
              client.gameData.connect4Players.delete(player2.id);
              return instance.setImage(boardImageURL!).setTimestamp();
            } else {
              instance
                .setImage(boardImageURL!)
                .setTitle(
                  `Connect 4 - 👑 Player ${checkWinner(gameBoard)} Wins! 👑`
                )
                .setTimestamp();

              if (currentPlayer === player1.id) {
                instance.setThumbnail(player2Avatar!).setColor('BLUE');
              } else {
                instance.setThumbnail(player1Avatar).setColor('RED');
              }
              client.gameData.connect4Players.delete(player1.id);
              client.gameData.connect4Players.delete(player2.id);
              return;
            }
          }

          // Check for available spaces
          function emptySpaces(board: number[][]) {
            let result = false;
            for (let columnIndex = 0; columnIndex < 7; ++columnIndex) {
              for (let rowIndex = 0; rowIndex < 6; ++rowIndex) {
                if (board[rowIndex][columnIndex] == 0) {
                  result = true;
                }
              }
            }
            return result;
          }

          // Reference https://stackoverflow.com/questions/15457796/four-in-a-row-logic/15457826#15457826

          // Check for Win Conditions
          function checkLine(a: number, b: number, c: number, d: number) {
            // Check first cell non-zero and all cells match
            return a != 0 && a == b && a == c && a == d;
          }

          function checkWinner(board: number[][]) {
            // Check down
            for (let r = 0; r < 3; r++)
              for (let c = 0; c < 7; c++)
                if (
                  checkLine(
                    board[r][c],
                    board[r + 1][c],
                    board[r + 2][c],
                    board[r + 3][c]
                  )
                )
                  return board[r][c];

            // Check right
            for (let r = 0; r < 6; r++)
              for (let c = 0; c < 4; c++)
                if (
                  checkLine(
                    board[r][c],
                    board[r][c + 1],
                    board[r][c + 2],
                    board[r][c + 3]
                  )
                )
                  return board[r][c];

            // Check down-right
            for (let r = 0; r < 3; r++)
              for (let c = 0; c < 4; c++)
                if (
                  checkLine(
                    board[r][c],
                    board[r + 1][c + 1],
                    board[r + 2][c + 2],
                    board[r + 3][c + 3]
                  )
                )
                  return board[r][c];

            // Check down-left
            for (let r = 3; r < 6; r++)
              for (let c = 0; c < 4; c++)
                if (
                  checkLine(
                    board[r][c],
                    board[r - 1][c + 1],
                    board[r - 2][c + 2],
                    board[r - 3][c + 3]
                  )
                )
                  return board[r][c];

            return 0;
          }
        }
      });
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: 'USER',
          required: true,
          name: 'user',
          description: `Who would you like to play against?`
        }
      ]
    });
  }
}
