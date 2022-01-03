function getRandom(arr, n) {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError('getRandom: more elements taken than available!');
  while (n--) {
    var x = Math.floor(Math.random() * len);
    // prettier-ignore
    result[n] = arr[(x in taken) ? taken[x] : x];
    // prettier-ignore
    taken[x] = (--len in taken) ? taken[len] : len;
    // prettier-ignore-end
  }
  return result;
}

var normalizeValue = value =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^0-9a-zA-Z\s]/g, '') // remove non-alphanumeric characters
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase(); // remove duplicate spaces

var capitalizeWords = str => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

var getLeaderBoard = arr => {
  if (!arr) return;
  if (!arr[0]) return; // issue #422
  let leaderBoard = '';

  leaderBoard = `👑   **${arr[0][0]}:** ${arr[0][1]}  points`;

  if (arr.length > 1) {
    for (let i = 1; i < arr.length; i++) {
      leaderBoard =
        leaderBoard + `\n\n   ${i + 1}: ${arr[i][0]}: ${arr[i][1]}  points`;
    }
  }
  return leaderBoard;
};

module.exports = {
  getRandom,
  normalizeValue,
  capitalizeWords,
  getLeaderBoard
};
