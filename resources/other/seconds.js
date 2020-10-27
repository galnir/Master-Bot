module.exports = {
  convert: function(time) {
    let str, hr, min, sec, ms;
    let parts = time.toString().split('.');
    ms =
      parts.length > 1 ? parseInt((parts[1] + '00').substr(0, 3)) : undefined;
    sec = parseInt(parts[0]);
    if (sec >= 60) {
      min = Math.floor(sec / 60);
      sec = sec % 60;
      sec = sec < 10 ? '0' + sec : sec;
    }
    if (min >= 60) {
      hr = Math.floor(min / 60);
      min = min % 60;
      min = min < 10 ? '0' + min : min;
    }
    if (ms < 10) ms = '00' + ms;
    else if (ms < 100) ms = '0' + ms;
    if (min === undefined) {
      str =
        ms === undefined
          ? sec.toString() + 's'
          : sec.toString() + 's ' + ms.toString() + 'ms';
    } else if (hr === undefined) {
      str =
        ms === undefined
          ? min.toString() + 'm ' + sec.toString() + 's'
          : min.toString() +
            'm ' +
            sec.toString() +
            's ' +
            ms.toString() +
            'ms';
    } else {
      str =
        ms === undefined
          ? hr.toString() + 'h ' + min.toString() + 'm ' + sec.toString() + 's'
          : hr.toString() +
            'h ' +
            min.toString() +
            'm ' +
            sec.toString() +
            's ' +
            ms.toString() +
            'ms';
    }
    return str;
  }
};
