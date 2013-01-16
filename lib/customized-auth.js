/*jshint strict:true browser:true jquery:true node:true es5:true
onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var $ = window.jQuery
    , bauth = require('./auth')
    , onUserCreate
    ;

  $('body').delegate('form#js-email-form', 'submit', function (ev) {
    ev.preventDefault();

    var result
      ;

    result = bauth.createUser(
        $('input[name=email]').val().trim().toLowerCase()
      , $('input[name=school]').val().trim().toLowerCase()
      , onUserCreate
    ) || {};

    if (result.error) {
      window.alert(result.error.toString());
      return;
    }

    $('saveyourinfo').fadeTo(300, 0.3);
  });

  $('body').delegate('#js-logout a', 'click', function (ev) {
    ev.preventDefault();
    bauth.logout(bauth.user);
    $('#js-logout').hide();
    $('#js-saveyourinfo').slideDown();
    location.reload();
  });

  module.exports.init = function (_onUserCreate) {
    onUserCreate = _onUserCreate;
  };

  module.exports.bauth = bauth;
}());
