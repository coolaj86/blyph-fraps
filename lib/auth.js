/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true unused:true undef:true*/
(function () {
  "use strict";

  var BAuth = module.exports
    , url = require('url')
    , MD5 = require('md5')
    , request = require('ahr2')
    , store
    ;

  function init(_store) {
    store = _store;

    var users = store.get('users')
      ;

    if ('object' !== typeof users) {
      users = {};
      store.set('users', users);
    }
  }

  function toUserToken(str) {
    if (!str) {
      return;
    }

    str = str.trim().toLowerCase();

    if (/@/.exec(str)) {
      str = MD5.digest_s(str);
      return str;
    }

    if (/^[a-f0-9]{32}$/.exec(str)) {
      return str;
    }
  }

  function transitionToUserToken(obj) {
    if (!obj || 'object' !== typeof obj) {
      return;
    }

    if (/@/.exec(obj.token)) {
      obj.userToken = toUserToken(obj.token.trim().toLowerCase());
      delete obj.token;
    }

    if (/@/.exec(obj.email)) {
      obj.userToken = toUserToken(obj.email.trim().toLowerCase());
      delete obj.email;
    }

    return obj;
  }

  function createUser(email, school, onSubscribe) {
    var users
      , user
      , result = {}
      ;

    // TODO this must be done on the application side as well!!!
    BAuth.user.email = email;
    BAuth.user.school = school;

    if (!BAuth.user.email || !/\w+@\w+.\w+/.exec(BAuth.user.email)) {
      result.error = new Error('bad email address');
      return result;
    }
    BAuth.user.nickname = BAuth.user.email.replace(/@.*/, '');
    BAuth.user.userToken = BAuth.toUserToken(BAuth.user.email);
    //delete BAuth.user.email;

    if (!BAuth.user.school || !/\w+\.(?:edu|gov)\s*$/i.exec(BAuth.user.school)) {
      result.error = new Error('Put a University url such as "byu.edu"');
      return result;
    }

    request({
        method: 'POST'
      , href: '/subscribe'
      , body: BAuth.user
    }).when(onSubscribe);

    users = store.get('users');
    user = users[BAuth.user.userToken] = users[BAuth.user.userToken];
    if ('object' === typeof user) {
      Object.keys(user).forEach(function (key) {
        BAuth.user[key] = user[key];
      });
    }
    BAuth.user.timestamp = new Date().valueOf();
    users[BAuth.user.userToken] = BAuth.user;
    store.set('users', users);
  }

  function attemptLogin(currentUser, onSuccessfulLogin) {
    // TODO move out
    var users
      , user
      ;

    user = transitionToUserToken(store.get('user'));
    users = store.get('users');
    if ('object' !== typeof users) {
      users = {};
    }

    transitionToUserToken(currentUser);

    Object.keys(users).forEach(function (key) {
      var _user = transitionToUserToken(users[key]);
      delete users[key];
      users[user.userToken] = _user;
    });

    if (!currentUser.userToken) {
      if (!user || !user.userToken) {
        // could check for most recent of `users`, but nah
        return;
      }

      currentUser.userToken = user.userToken;

      Object.keys(user).forEach(function (key) {
        currentUser[key] = user[key];
      });

    } else {
      user = users[currentUser.userToken] = users[currentUser.userToken] || currentUser;
    }

    if ('object' === typeof user) {
      Object.keys(user).forEach(function (key) {
        currentUser[key] = user[key];
      });
    }

    currentUser.timestamp = new Date().valueOf();

    users[currentUser.userToken] = currentUser;
    store.set('users', users);
    store.set('user', currentUser);

    if (currentUser.userToken) {
      onSuccessfulLogin();
    }
  }

  function parseHash(hashStr) {
    var urlObj
      , queryObj
      , referrerIdM = /referrerId=(.*)/.exec(hashStr)
      , currentUser = BAuth.user
      ;

    urlObj = url.parse(hashStr.substr(1), true);
    queryObj = urlObj.query || {};

    if (referrerIdM) {
      currentUser.referredBy = referrerIdM[1];
    } else {
      currentUser.referredBy = queryObj.referredBy;
    }

    currentUser.userToken = currentUser.userToken || toUserToken(queryObj.userToken) || toUserToken(queryObj.token) || toUserToken(queryObj.email);

    return currentUser;
  }

  BAuth.user = {};
  BAuth.init = init;
  BAuth.createUser = createUser;
  BAuth.parseHash = parseHash;
  BAuth.attemptLogin = attemptLogin;
  BAuth.toUserToken = toUserToken;
}());
