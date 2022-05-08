import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import Canvas from 'canvas';

import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import {
  CommandInteraction,
  MessageAttachment,
  MessageEmbed,
  GuildMember,
  MessageReaction
  //   Message,
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
            Incase of invisible board click 🔄 (may take more than one click).`
})
export class Connect4Command extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const player1 = interaction.user;
    const player2 = interaction.options.getUser('user', true);

    if (player1.id === player2.id) {
      return interaction.reply("Sorry can't play against yourself");
    }
    if (player2.bot) {
      return interaction.reply("Sorry can't play against a bot user");
    }

    const player1Avatar = player1.displayAvatarURL({
      format: 'jpg'
    });

    const player1Piece =
      player1Avatar.length > 0 ? await Canvas.loadImage(player1Avatar) : null;

    const player2Avatar = player2.avatarURL({
      format: 'jpg'
    });
    const player2Piece =
      player1Avatar.length > 0 ? await Canvas.loadImage(player2Avatar!) : null;

    let gameBoard: number[][] = [
      [0, 0, 0, 0, 0, 0, 0], // row 6
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0] // row 1
      // column ->
    ];

    const row: any = {
      0: [1, 2, 3, 4, 5, 6], // column 1
      1: [1, 2, 3, 4, 5, 6],
      2: [1, 2, 3, 4, 5, 6],
      3: [1, 2, 3, 4, 5, 6],
      4: [1, 2, 3, 4, 5, 6],
      5: [1, 2, 3, 4, 5, 6],
      6: [1, 2, 3, 4, 5, 6] // column 7
      // row ->
    };
    const PaginatedEmbed = new PaginatedMessage();
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

    await PaginatedEmbed.addPageEmbed(Embed)
      .run(interaction)

      .then(async (message: any) => {
        try {
          await message?.response?.react('1️⃣');
          await message.response?.react('2️⃣');
          await message.response?.react('3️⃣');
          await message.response?.react('4️⃣');
          await message.response?.react('5️⃣');
          await message.response?.react('6️⃣');
          await message.response?.react('7️⃣');
          await message.response?.react('🔄');
        } catch (error) {
          console.error('One of the emojis failed to react:', error);
        }

        const filter = (reaction: MessageReaction, user: GuildMember) => {
          return (
            (reaction.emoji.name === '1️⃣' ||
              reaction.emoji.name === '2️⃣' ||
              reaction.emoji.name === '3️⃣' ||
              reaction.emoji.name === '4️⃣' ||
              reaction.emoji.name === '5️⃣' ||
              reaction.emoji.name === '6️⃣' ||
              reaction.emoji.name === '7️⃣' ||
              reaction.emoji.name === '🔄') &&
            (user.id == player1.id || user.id == player2.id)
          );
        };

        const collector = message.response.createReactionCollector({
          filter,
          idle: 60000
        });

        collector.on(
          'collect',
          async (reaction: MessageReaction, user: GuildMember) => {
            // Column 1
            if (reaction.emoji.name === '1️⃣')
              await playerMove(0, user, message.messages[0].embeds[0]);

            // Column 2
            if (reaction.emoji.name === '2️⃣')
              await playerMove(1, user, message.messages[0].embeds[0]);

            // Column 3
            if (reaction.emoji.name === '3️⃣')
              await playerMove(2, user, message.messages[0].embeds[0]);

            // Column 4
            if (reaction.emoji.name === '4️⃣')
              await playerMove(3, user, message.messages[0].embeds[0]);

            // Column 5
            if (reaction.emoji.name === '5️⃣')
              await playerMove(4, user, message.messages[0].embeds[0]);

            // Column 6
            if (reaction.emoji.name === '6️⃣')
              await playerMove(5, user, message.messages[0].embeds[0]);

            // Column 7
            if (reaction.emoji.name === '7️⃣')
              await playerMove(6, user, message.messages[0].embeds[0]);

            // Refresh Image
            if (reaction.emoji.name === '🔄')
              await message.messages[0].embeds[0].setImage(boardImageURL);

            const userReactions = message.response.reactions.cache.filter(
              (reaction: MessageReaction) => reaction.users.cache.has(user.id)
            );

            try {
              for (const reaction of userReactions.values()) {
                await reaction.users.remove(user.id);
              }
            } catch (error) {
              console.error;
            }
            return await message.response.edit({
              embeds: [message.messages[0].embeds[0]]
            });
          }
        );

        collector.on('end', () => {
          message.response.reactions
            .removeAll()
            .catch((error: string) =>
              console.error('Failed to clear reactions:', error)
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
      const canvas = Canvas.createCanvas(boardWidth, boardHeight);
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
              canvas.toBuffer(),
              `connect4Game${player1.id}-${player2.id}${currentTurn}.png`
            )
          ]
        })
        .then(async (result: any) => {
          boardImageURL = await result.attachments.entries().next().value[1]
            .url;

          result.delete();
        })
        .catch((err: any) => {
          if (err) {
            console.log(err);
          }
        });
    }

    async function playerMove(
      index: number,
      user: GuildMember,
      instance: MessageEmbed
    ) {
      if (row[index].length === 0 || currentPlayer === 'Game Over') {
        return interaction.followUp({
          content: `:x: Game is over, 👑 ${checkWinner(gameBoard)} Won`,
          ephemeral: true,
          fetchReply: true,
          target: user
        });
      }
      if (currentPlayer !== user.id) {
        interaction.followUp({
          content: `:x: It is still ${user}'s turn`,
          ephemeral: true,
          fetchReply: true,
          target: user
        });
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
        // No More Possible Moves
        if (!emptySpaces(gameBoard)) {
          instance
            .setTitle(`Connect 4 - Game Over`)
            .setColor('GREY')
            .setThumbnail('');
          currentPlayer = 'Game Over';
        }
        return instance.setImage(boardImageURL!).setTimestamp();
      } else {
        instance
          .setImage(boardImageURL!)
          .setTitle(`Connect 4 - 👑 Player ${checkWinner(gameBoard)} Wins! 👑`)
          .setTimestamp();
        if (currentPlayer === player1.id) {
          instance.setThumbnail(player2Avatar!).setColor('BLUE');
        } else {
          instance.setThumbnail(player1Avatar).setColor('RED');
        }
        currentPlayer = 'Game Over';
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
          description: `Which user's avatar do you want to look at?`
        }
      ]
    });
  }
}
