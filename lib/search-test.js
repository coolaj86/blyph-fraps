(function () {
  "use strict";

  var searchForBooks = require('./search')
    ;

  searchForBooks(function () {
    console.log(arguments);
  }, 'art history');
}());
