const { Command } = require('discord.js-commando');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const Pagination = require('discord-paginationembed');
const Canvas = require('canvas');

module.exports = class TicTacToeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tic-tac-toe',
      memberName: 'tic-tac-toe',
      group: 'other',
      description: `Play a game of Tic Tac Toe against another player.`,
      details: ` **The Rules**
              Players must get 3 of the same colored squares in a row to win.
              Only one piece is played at a time.
              Players can be on the offensive or defensive.
              The game ends when there is a 3-in-a-row or a stalemate.
              The starter of the previous game goes second on the next game.
              Use the emojis 1️⃣, 2️⃣, 3️⃣ for columns and 🇦, 🇧, 🇨 for rows
              You must click both a number and a letter to place your colored square in that space.
              You have 1 minute per turn or it's an automatic forfeit.
              Incase of invisible board click 🔄 (may take more than one click).`,
      guildOnly: true,
      clientPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'player2',
          prompt: 'Who is your Opponent?',
          type: 'user'
        }
      ]
    });
  }
  async run(message, { player2 }) {
    const player1 = message.author;

    if (player1.id === player2.id) {
      message.reply("Sorry can't play against yourself");
      return;
    }
    if (player2.bot) {
      message.reply("Sorry can't play against a bot user");
      return;
    }
    if (message.guild.gameData.tictactoePlayers.has(player1.id)) {
      message.reply("You can't play more than 1 game at a time");
      return;
    }
    if (message.guild.gameData.tictactoePlayers.has(player2.id)) {
      message.reply(`${player2.username} is already playing`);
      return;
    }

    message.guild.gameData.tictactoePlayers.set(player1.id, player1);
    message.guild.gameData.tictactoePlayers.set(player2.id, player2);

    const player1Avatar = player1.displayAvatarURL({
      format: 'jpg'
    });

    const player1Piece =
      player1Avatar.length > 0 ? await Canvas.loadImage(player1Avatar) : null;

    const player2Avatar = player2.avatarURL({
      format: 'jpg'
    });
    const player2Piece =
      player1Avatar.length > 0 ? await Canvas.loadImage(player2Avatar) : null;

    let gameBoard = [
      [0, 0, 0], //row 1
      [0, 0, 0],
      [0, 0, 0]
      // column ->
    ];

    let rowChoice = null;
    let columnChoice = null;
    let currentPlayer = player1.id;
    let boardImageURL = null;

    let currentTurn = 0;
    await createBoard(message);
    ++currentTurn;

    new Pagination.Embeds()
      .setArray([new MessageEmbed()])
      .setAuthorizedUsers([player1.id, player2.id])
      .setThumbnail(player1Avatar)
      .setChannel(message.channel)
      .setColor('RED')
      .setTitle(`Tic Tac Toe - Player 1's Turn`)
      .setDescription(
        `Use the emojis 1️⃣, 2️⃣, 3️⃣ for columns and 🇦, 🇧, 🇨 for rows.\n
         You must click both a **Number** and a **Letter** to place your colored square in that space.\n
         You have 1 minute per turn or it's an automatic forfeit.
         Incase of invisible board click 🔄.`
      )
      .addField('Column', 'None', true)
      .addField('Row', 'None', true)
      .setImage(boardImageURL)
      .setFooter('Incase of invisible board click 🔄')
      .setTimestamp()
      .setTimeout(60000)
      .setDisabledNavigationEmojis(['all'])
      //.setDeleteOnTimeout(true)
      .setFunctionEmojis({
        // Column 1
        '1️⃣': async function(user, instance) {
          if (currentPlayer === user.id) {
            columnChoice = 0;
            instance.currentEmbed.fields[0].value = '1';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        // Column 2
        '2️⃣': async function(user, instance) {
          if (currentPlayer === user.id) {
            columnChoice = 1;
            instance.currentEmbed.fields[0].value = '2';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        // Column 3
        '3️⃣': async function(user, instance) {
          if (currentPlayer === user.id) {
            columnChoice = 2;
            instance.currentEmbed.fields[0].value = '3';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        // Row A
        '🇦': async function(user, instance) {
          if (currentPlayer === user.id) {
            rowChoice = 0;
            instance.currentEmbed.fields[1].value = 'A';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        '🇧': async function(user, instance) {
          if (currentPlayer === user.id) {
            rowChoice = 1;
            instance.currentEmbed.fields[1].value = 'B';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        // Row C
        '🇨': async function(user, instance) {
          if (currentPlayer === user.id) {
            rowChoice = 2;
            instance.currentEmbed.fields[1].value = 'C';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        // Refresh Image
        '🔄': function(_, instance) {
          instance.setImage(boardImageURL);
        }
      })
      .build();

    function createBoard(message) {
      // Set asset sizes
      const boardHeight = 700;
      const boardWidth = 700;
      const pieceSize = 150;

      // Set Image size
      const canvas = Canvas.createCanvas(boardWidth, boardHeight);
      const ctx = canvas.getContext('2d');

      // Get Center to Center measurements for grid spacing
      const positionX = 200;
      const positionY = 200;

      // Tic-Tac-Toe Board
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, boardWidth, boardHeight);

      ctx.font = '100px Open Sans Light';
      ctx.fillStyle = 'grey';
      // Add Shadows to indicators and empty spaces
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 2;
      // Column Numbers
      ctx.fillText('1', 40, 650);
      ctx.fillText('2', 250, 650);
      ctx.fillText('3', 450, 650);
      // Row Letters
      ctx.fillText('A', 575, 110);
      ctx.fillText('B', 575, 310);
      ctx.fillText('C', 575, 510);

      // Build the Game Board
      for (let columnIndex = 0; columnIndex < 3; ++columnIndex) {
        for (let rowIndex = 0; rowIndex < 3; ++rowIndex) {
          ctx.beginPath();

          // Empty Spaces
          if (gameBoard[rowIndex][columnIndex] === 0) {
            ctx.fillStyle = 'grey';
            ctx.fillRect(
              positionX * columnIndex,
              positionY * rowIndex,
              pieceSize,
              pieceSize
            );
          }

          // Player 1 Pieces
          if (gameBoard[rowIndex][columnIndex] === 1) {
            if (player1Piece) {
              ctx.drawImage(
                player1Piece,
                positionX * columnIndex,
                positionY * rowIndex,
                pieceSize,
                pieceSize
              );
            } else {
              ctx.fillStyle = 'red';
              ctx.shadowColor = 'grey';
              ctx.shadowBlur = 5;
              ctx.shadowOffsetX = 4;
              ctx.shadowOffsetY = 2;
              ctx.fillRect(
                positionX * columnIndex,
                positionY * rowIndex,
                pieceSize,
                pieceSize
              );
            }
          }
          // Player 2 Pieces
          if (gameBoard[rowIndex][columnIndex] === 2) {
            if (player2Piece) {
              ctx.drawImage(
                player2Piece,
                positionX * columnIndex,
                positionY * rowIndex,
                pieceSize,
                pieceSize
              );
            } else {
              ctx.fillStyle = 'blue';
              ctx.shadowColor = 'grey';
              ctx.shadowBlur = 5;
              ctx.shadowOffsetX = 4;
              ctx.shadowOffsetY = 2;
              ctx.fillRect(
                positionX * columnIndex,
                positionY * rowIndex,
                pieceSize,
                pieceSize
              );
            }
          }
        }
      }

      const attachment = new MessageAttachment(
        canvas.toBuffer(),
        `TicTacToe-${player1.id}-${player2.id}${currentTurn}.png` // to prevent cross-talk when multiple games are running at the same time in the same channel
      );

      return message.channel
        .send(attachment)
        .then(result => {
          boardImageURL = result.attachments.entries().next().value[1].url;
          result.delete();
        })
        .catch(err => {
          if (err) {
            console.log(err);
          }
        });
    }

    async function playerMove(row, column, user, instance) {
      // Wait for both
      if (row === null || column === null) {
        return;
      }

      // Reset 'Column' & 'Row' for next turn
      (columnChoice = null), (rowChoice = null);
      instance.currentEmbed.fields[0].value = 'None';
      instance.currentEmbed.fields[1].value = 'None';

      if (gameBoard[row][column] !== 0 || currentPlayer === 'Game Over') {
        return; // Ignore occupied spaces or if the game is over
      }
      if (currentPlayer === user.id) {
        if (currentPlayer === player1.id) {
          gameBoard[row][column] = 1;
          currentPlayer = player2.id;
          instance
            .setThumbnail(player2Avatar)
            .setTitle(`Tic Tac Toe - Player 2's Turn`)
            .setColor('BLUE')
            .setTimestamp();
        } else {
          gameBoard[row][column] = 2;
          currentPlayer = player1.id;
          instance
            .setThumbnail(player1Avatar)
            .setTitle(`Tic Tac Toe - Player 1's Turn`)
            .setColor('RED')
            .setTimestamp();
        }
        await createBoard(message);
        ++currentTurn;
      }

      if (checkWinner(gameBoard) === 0) {
        // No More Possible Moves
        if (!emptySpaces(gameBoard)) {
          instance
            .setTitle(`Tic Tac Toe - Game Over`)
            .setColor('GREY')
            .setThumbnail('');
          currentPlayer = 'Game Over';
          message.guild.gameData.tictactoePlayers.delete(player1.id);
          message.guild.gameData.tictactoePlayers.delete(player2.id);
        }
        instance.setImage(boardImageURL).setTimestamp();
        return;
      } else {
        instance
          .setImage(boardImageURL)
          .setTitle(
            `Tic Tac Toe - 👑 Player ${checkWinner(gameBoard)} Wins! 👑`
          )
          .setTimestamp();
        if (currentPlayer === player1.id) {
          instance.setThumbnail(player2Avatar).setColor('BLUE');
        } else {
          instance.setThumbnail(player1Avatar).setColor('RED');
        }
        currentPlayer = 'Game Over';
        message.guild.gameData.tictactoePlayers.delete(player1.id);
        message.guild.gameData.tictactoePlayers.delete(player2.id);
        return;
      }
    }

    // Check for available spaces
    function emptySpaces(board) {
      let result = false;
      for (let columnIndex = 0; columnIndex < 3; ++columnIndex) {
        for (let rowIndex = 0; rowIndex < 3; ++rowIndex) {
          if (board[columnIndex][rowIndex] == 0) {
            result = true;
          }
        }
      }
      return result;
    }

    // Check for Win Conditions
    function checkLine(a, b, c) {
      // Check first cell non-zero and all cells match
      return a != 0 && a == b && a == c;
    }

    function checkWinner(board) {
      // Check down
      for (let c = 0; c < 3; c++)
        if (checkLine(board[0][c], board[1][c], board[2][c]))
          return board[0][c];

      // Check right
      for (let r = 0; r < 3; r++)
        if (checkLine(board[r][0], board[r][1], board[r][2]))
          return board[r][0];

      // Check down-right
      if (checkLine(board[0][0], board[1][1], board[2][2])) return board[0][0];

      // Check down-left
      if (checkLine(board[0][2], board[1][1], board[2][0])) return board[0][2];

      return 0;
    }
  }
};
