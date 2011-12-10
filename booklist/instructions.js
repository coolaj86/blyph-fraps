(function () {
  "use strict";

  var $ = require('jQuery')
    , url = require('url')
    , MD5 = require('md5')
    ;

  $.domReady = $;

  function onDomReady() {
    var hashStr = location.hash
      , queryObj = url.parse(hashStr.substr(1), true).query || {}
      , userToken = (queryObj.userToken || queryObj.token).trim()
      , origin = location.protocol + '//' + location.host
      , textarea = $('#text-area')
      , uidTpl = 'TOKEN_TPL'
      , originTpl = 'http://TPL.EXAMPLE.COM'
      ;

    location.hash = '';

    textarea.val(textarea.val().replace(originTpl, origin));

    // dev
    if ('http://blyph.com' !== origin) {
      textarea.val(textarea.val().replace("avascript:", "avascript:window.ORIGIN='" + origin + "';").replace(originTpl, origin));
    }

    function validateToken(userToken) {
      return userToken && userToken.length === 32;
    }

    setTimeout(function () {
      var email;
      while (!validateToken(userToken)) {
        email = prompt("email address: ", "");
        if (/@/.exec(email)) {
          userToken = MD5.digest_s(email.trim().toLowerCase());
        }
      }
      textarea.val(textarea.val().replace(uidTpl, userToken));
    }, 300);
  }

  $.domReady(onDomReady);
}());      
