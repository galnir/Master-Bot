const { Command } = require('discord.js-commando');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const Pagination = require('discord-paginationembed');
const Canvas = require('canvas');

module.exports = class Connect4Command extends Command {
  constructor(client) {
    super(client, {
      name: 'connect4',
      memberName: 'connect4',
      group: 'other',
      description: `Play a game of Connect 4 against another player.`,
      details: ` **The Rules**
            Players must connect 4 of the same colored discs in a row to win.
            Only one piece is played at a time.
            Players can be on the offensive or defensive.
            The game ends when there is a 4-in-a-row or a stalemate.
            The starter of the previous game goes second on the next game.
            Use the emojis 1️⃣, 2️⃣, 3️⃣, etc... to place your colored disc in that column.
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
      return message.channel.send("Sorry can't play against yourself");
    }
    if (player2.bot) {
      return message.channel.send("Sorry can't play against a bot user");
    }

    const player1Avatar = player1.displayAvatarURL({
      format: 'jpg'
    });
    const player2Avatar = player2.avatarURL({
      format: 'jpg'
    });
    let gameBoard = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]
    ];
    const row = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: []
    };
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
      .setTitle(`Connect 4 - Player 1's Turn`)
      .setDescription(
        `Incase of invisible board click 🔄.
         Use 1️⃣, 2️⃣, 3️⃣, etc... to place your colored disc in that column.
         Thumbnail and Title indicate current players turn.
         You have 1 minute per turn or it's an automatic forfeit.`
      )
      .setImage(boardImageURL)
      .setFooter('Incase of invisible board click 🔄')
      .setTimestamp()
      .setTimeout(60000)
      .setDisabledNavigationEmojis(['all'])
      //.setDeleteOnTimeout(true)
      .setFunctionEmojis({
        // Column 1
        '1️⃣': async function(user, instance) {
          await playerMove(0, user, instance);
        },
        // Column 2
        '2️⃣': async function(user, instance) {
          await playerMove(1, user, instance);
        },
        // Column 3
        '3️⃣': async function(user, instance) {
          await playerMove(2, user, instance);
        },
        // Column 4
        '4️⃣': async function(user, instance) {
          await playerMove(3, user, instance);
        },
        // Column 5
        '5️⃣': async function(user, instance) {
          await playerMove(4, user, instance);
        },
        // Column 6
        '6️⃣': async function(user, instance) {
          await playerMove(5, user, instance);
        },
        // Column 7
        '7️⃣': async function(user, instance) {
          await playerMove(6, user, instance);
        },
        // Refresh Image
        '🔄': function(_, instance) {
          instance.setImage(boardImageURL);
        }
      })
      .build();

    function createBoard(message) {
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
      for (let rowIndex = 0; rowIndex < 7; ++rowIndex) {
        for (let columnIndex = 0; columnIndex < 6; ++columnIndex) {
          ctx.beginPath();
          ctx.arc(
            offset + (pieceSize + positionX * rowIndex),
            offset + (pieceSize + positionY * columnIndex),
            pieceSize,
            0,
            Math.PI * 2,
            true
          );
          // Empty Spaces
          if (gameBoard[rowIndex][columnIndex] === 0) {
            ctx.fillStyle = 'grey';
            ctx.fill();
          }
          // Player 1 Pieces
          if (gameBoard[rowIndex][columnIndex] === 1) {
            ctx.fillStyle = 'red';
            ctx.fill();
          }
          // Player 2 Pieces
          if (gameBoard[rowIndex][columnIndex] === 2) {
            ctx.fillStyle = 'blue';
            ctx.fill();
          }
        }
      }

      // Need to Flip the image Vertically
      // Save current canvas state
      ctx.save();
      // Multiply the y value by -1 to flip vertically
      ctx.scale(1, -1);
      // Start at (0, -height), which is now the bottom-left corner
      ctx.drawImage(canvas, 0, -canvas.height);
      ctx.restore();

      const attachment = new MessageAttachment(
        canvas.toBuffer(),
        `connect4Game${player1.id}-${player2.id}${currentTurn}.png` // to prevent cross-talk when multiple games are running at the same time in the same channel
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
    async function playerMove(index, user, instance) {
      if (row[index].length === 6 || currentPlayer === 'Game Over') {
        return; // Ignore Columns that are full or if the game is over
      }

      if (currentPlayer === user.id) {
        if (currentPlayer === player1.id) {
          gameBoard[index][row[index].length] = 1;
          row[index].push(1);
          currentPlayer = player2.id;
          instance
            .setThumbnail(player2Avatar)
            .setTitle(`Connect 4 - Player 2's Turn`)
            .setColor('BLUE');
        } else {
          gameBoard[index][row[index].length] = 2;
          row[index].push(2);
          currentPlayer = player1.id;
          instance
            .setThumbnail(player1Avatar)
            .setTitle(`Connect 4 - Player 1's Turn`)
            .setColor('RED');
        }
        await createBoard(message);
        ++currentTurn;
      }
      if (checkWinner(gameBoard) === 0) {
        return instance.setImage(boardImageURL).setTimestamp();
      } else {
        instance
          .setImage(boardImageURL)
          .setTitle(`Connect 4 - 👑 Player ${checkWinner(gameBoard)} Wins! 👑`)
          .setTimestamp();
        if (currentPlayer === player1.id) {
          instance.setThumbnail(player2Avatar).setColor('BLUE');
        } else {
          instance.setThumbnail(player1Avatar).setColor('RED');
        }
        currentPlayer = 'Game Over';
        return;
      }
    }

    // Reference https://stackoverflow.com/questions/15457796/four-in-a-row-logic/15457826#15457826

    // Check for Win Conditions
    function checkLine(a, b, c, d) {
      // Check first cell non-zero and all cells match
      return a != 0 && a == b && a == c && a == d;
    }

    function checkWinner(board) {
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
};
