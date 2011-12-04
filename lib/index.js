(function () {
  "use strict";

  var User = require('./user')
    , Booklist = require('./booklist')
    , targetInfo = require('./target-info')
    , $ = require('ender')
    , serializeForm = require('serialize-form').serializeFormObject
    , user = User.create()
    , booklist = Booklist.create(user)
    ;

  function createOrGetUser(ev) {
    ev.preventDefault();

    var values = serializeForm('form#email_form')
      ;

    console.log('login', values);

    user.login(values.email, values.school).when(function (err) {
      if (err) {
        alert(err.message);
        return;
      }

      $('#saveyourinfo').hide();
      $('#logout').show();
    });
  }

  function logout(ev) {
    ev.preventDefault();

    user.logout();
    user = User.create();

    $('#saveyourinfo').hide();
    $('#logout').show();
  }

  function attachHandlers() {
    $('body').delegate('form#email_form', 'submit', createOrGetUser);
    $('body').delegate('#logout a', 'click', logout);

    console.log('user.booklist', user.booklist);
    booklist.get().when(function (err, list) {
      console.log('booklist', list);
    });

    if (user.isLoggedIn) {
      $('#saveyourinfo').hide();
    }
  }

  $.domReady(attachHandlers);
}());
