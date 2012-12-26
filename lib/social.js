/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true unused:true undef:true*/
(function () {
  "use strict";

  function init(bauth) {
    var document = require('window').document
      , fbScript
      , twScript
      , xfbml
      ;

    bauth.user.referrerId = bauth.user.userToken.substr(14, 8);

    // TODO we have to use #referrerId here due to some server parse error?
    xfbml = '<fb:send width="200" id="fb-unique-link" href="' + 'blyph.com/#referrerId=' + bauth.user.referrerId + '" font=""></fb:send>';
    document.getElementById('fbml').innerHTML = xfbml;

    fbScript = document.createElement('script');
    fbScript.src = 'http://connect.facebook.net/en_US/all.js#xfbml=1';
    fbScript.async = 'async';
    fbScript.defer = 'defer';
    setTimeout(function () {
      document.body.appendChild(fbScript);
    }, 100);

    twScript = document.createElement('script');
    twScript.src = 'http://platform.twitter.com/widgets.js';
    twScript.async = 'async';
    twScript.defer = 'defer';
    setTimeout(function () {
      document.body.appendChild(twScript);
    }, 100);
  }

  module.exports.init = init;
}());
