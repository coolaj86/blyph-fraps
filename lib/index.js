(function () {
  "use strict";

  var User = require('./user')
    , Booklist = require('./booklist')
    , searchForBooks = require('./search')
    , targetInfo = require('./target-info')
    , DelayKeyUp = require('./delay-key-up')
    , $ = require('ender')
    , serializeForm = require('serialize-form').serializeFormObject
    , user = User.create()
    , booklist = Booklist.create(user)
    ;

  function login() {
    $('#saveyourinfo').hide();
    $('#logout').show();
  }

  function showBookResults(err, books) {
    if (err) {
      console.error(err);
    }
    if (!books || !books.length) {
      console.warn('no books found');
      return;
    }
    console.log(books);
  }

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

      login();
    });
  }

  function logout(ev) {
    ev.preventDefault();

    user.logout();
    user = User.create();

    $('#saveyourinfo').show();
    $('#logout').hide();
  }

  function attachHandlers() {
    $('body').delegate('form#email_form', 'submit', createOrGetUser);
    $('body').delegate('#logout a', 'click', logout);

    // TODO use booklist as part of user
    console.log('user.booklist', user.booklist);
    booklist.get().when(function (err, list) {
      console.log('booklist', list);
    });

    console.log('isLoggedIn', user.isLoggedIn);
    if (user.isLoggedIn) {
      $('#saveyourinfo').hide();
      $('#logout').show();
    } else {
      $('#saveyourinfo').show();
      $('#logout').hide();
    }

    (function () {
      var respondon
        ;

      respondon = DelayKeyUp({
          timeout: 500
        , getter: function () {
            return $('#search').val();
          }
        , validater: function (input) {
            if (!/\w$/.exec(input) && input.length >= 5) {
              return true;
            }
            return false;
          }
        , callback: function (input) {
            console.log("submit: " + input);
            searchForBooks(showBookResults, input);
          }
      });

      $("body").delegate("#search", "keyup", respondon.keyup);
      $("body").delegate("form#search_form", "submit", respondon.submit);
    }());
  }

  $.domReady(attachHandlers);
}());
