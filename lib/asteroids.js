/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true unused:true undef:true*/
(function () {
  "use strict";

  var window = require('window')
    , Asteroids = module.exports
    ;

  function init() {
    var s = window.document.createElement('script')
      ;

    s.type='text/javascript';
    window.document.body.appendChild(s);
    s.src='http://erkie.github.com/asteroids.min.js';
    return void(1);
  }

  if (/asteroids/.exec(window.location.hash)) {
    console.log('We shoud play asteroids!');
    Asteroids.shouldPlayAsteroids = true;
  }

  Asteroids.init = init;
}());
