"use strict";

requirejs.config({
  baseUrl: 'scripts',
  paths: {
    jquery: '../vendor/jquery/jquery-3.2.0.min',
    threejs: '../vendor/threejs/three.min',
    underscore: '../vendor/underscore/underscore.min'
  },
  shim: {
    jquery: {
      exports: '$'
    },
    underscore: {
      exports: '_'
    }
  }
});


requirejs(['app'], function(app) {

  $(document).ready(function() {
    var application = new app.App();
    application.run();
  });

});
