(function () {
  "use strict";

  function delayKeyUp(params) {
    var key_timeout = 0
      , ignore_me = false
      , lastData
      , wait = params.timeout
      , getData = params.getter
      , shouldWait = params.validater
      , cb = params.callback
      ;

    return {
      keyup: function (ev) {
        ev.preventDefault();

        if (ignore_me) {
          ignore_me = false;
          return;
        }

        var data = getData();
        if (lastData === data) {
          return;
        }
        lastData = data;

        clearTimeout(key_timeout);
        if (shouldWait(data)) {
          key_timeout = 0;
          cb(data);
        } else {
          key_timeout = setTimeout(cb, wait, data);
        }
      },
      submit: function (ev) {
        ev.preventDefault();
        clearTimeout(key_timeout);

        var data = getData();
        /*
        if (lastData === data) {
          return;
        }
        lastData = data;
        */

        ignore_me = true;
        cb(data);
      }
    };
  }

  module.exports = delayKeyUp;
}());
