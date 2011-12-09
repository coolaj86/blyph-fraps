(function () {
  "use strict";

  module.exports = function () {
    return location.protocol + '//' + location.host + location.pathname;
  };
}());
