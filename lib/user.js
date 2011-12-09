// Test Data
// http://blyph.com/booklist/0a8b345ddcfc5401f578c850442f1e1b
(function () {
  "use strict";

  var request = require('ahr2')
    , EventEmitter = require('events').EventEmitter
    , MD5 = require('md5')
    , Future = require('future')
    , Booklist = require('./booklist')
    , targetInfo = require('./target-info')
    , cache = require('./cache')
    ;

  function User() {
    var self = this
      , saved
      ;

    self.events = new EventEmitter();
    // TODO why is this of type Object rather than Booklist?
    self.booklist = Booklist.create(self);

    saved = cache.get('user');

    if (saved) {
      Object.keys(saved).forEach(function (key) {
        self[key] = saved[key];
      });
    }

    if (!saved || !saved.email || !saved.school) {
      return;
    }

    self.login(saved.email, saved.school);
  }

  User.prototype.login = function (email, school) {
    var err
      , self = this
      , future = Future()
      ;

    self.email = email.trim().toLowerCase();
    self.nickname = self.email.replace(/@.*/, '');
    self.school = school || self.school;

    if (/@/.exec(self.email)) {
      self.userToken = MD5.digest_s(self.email);
    } else {
      self.error = new Error('Invalid User Token');
    }

    self.gravatar = 'http://www.gravatar.com/avatar/' + self.userToken + '?s=50&r=pg&d=identicon';

    if (self.isLoggedIn) {
      console.warn('Why are you trying to login again?');
      future.fulfill(null, self);
      return future;
    }
    self.isLoggedIn = true;

    self.save().when(future.fulfill);

    return future;
  };

  User.prototype.destroy = function () {
    cache.set('user', null);
    // TODO booklist destroy
  };

  User.prototype.logout = function () {
    self.destroy()
  };

  User.prototype.save = function () {
    var self = this
      , future = Future()
      ;

    cache.set('user', self);

    if (!self.email) {
      future.fulfill(null, self);
      return future;
    }

    // TODO rename /subscribe
    request.post(targetInfo() + '/subscribe', null, self).when(function (err, ahr, data) {
      console.log('user.save', data);
      Object.keys(data.couchdb).forEach(function (key) {
        self[key] = data.couchdb[key];
      });

      future.fulfill(err, self);
    });

    return future;
  };


  User.create = function (email) {
    return new User(email);
  };

  module.exports = User;
}());
