(function () {
  "use strict";

  var request = require('ahr2')
    , targetInfo = require('./target-info')
    , Future = require('future')
    , cache = require('./cache')
    ;

  function Booklist(user) {
    var self = this
      ;

    self.staletime = Date.now();

    // prevent circular reference to user
    // but still allow non-logged in users to work
    self.getUrl = function () {
      return user.userToken ? ('booklist/' + user.userToken) : null;
    }

    self.getUser = function () {
      return user;
    }

    self.list = (cache.get('booklist'));
  }

  Booklist.prototype.keepAlive = function () {
    // TODO setInterval to freshen by retrieval
    // 5 minutes from now
    self.staletime = Date.now() + (5 * 60 * 1000);
  };

  Booklist.prototype.get = function () {
    var self = this
      , future = Future()
      , url = self.getUrl()
      , saved
      ;

    // TODO grace period between stale data and useless data
    if (!url || (self.list && Date.now() < self.staletime)) {
      future.fulfill(null, self.list);;
      return future;
    }

    request.get(targetInfo() + url).when(function (err, ahr, data) {
      // TODO merge previous with new
      if (data.error) {
        alert(data.errors);
      }

      self.list = data.result.booklist
      cache.set('booklist', self.list);

      self.keepAlive();
      future.fulfill(err, self.list);
    });

    return future;
  };

  //Booklist.prototype.add
  //Booklist.prototype.remove

  Booklist.prototype.save = function (list, _future) {
    var self = this
      , future = _future || Future()
      , url = self.getUrl()
      ;

    if (!url) {
      cache.set('booklist', self.list);
      future.fulfill();
      return future;
    }

    if (self.pending) {
      clearTimeout(self.pending);

      self.pending = setTimeout(function () {
        self.pending = false;
        self.save(list || self.list, future);
      }, 5 * 1000);

      return future;
    }
    self.pending = true;

    request.post(targetInfo() + url, null, {
        booklist: JSON.stringify({
            userToken: self.getUser().userToken
          , timestamp: Date.now()
          // TODO add 'booklist' serverside
          , type: 'booklist'
          , booklist: self.list
        })
    }).when(function (err, ahr, data) {
      console.log('booklist post', data);
      setTimeout(function () {
        self.pending = false;
      }, 5 * 1000);
      // 5 minutes from now
      self.keepAlive();
      future.fulfill(err);
    });

    return future;
  };

  Booklist.create = function (user) {
    return new Booklist(user);
  };

  module.exports = Booklist;
}());
