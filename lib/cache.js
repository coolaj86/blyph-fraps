(function () {
  "use strict";

  var localStorage = require('localStorage')
    , JsonStorage = require('json-storage')
    , jsonStorage = JsonStorage(localStorage)
    ;

  module.exports = jsonStorage;
}());
