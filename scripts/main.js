"use strict";

requirejs.config({
  baseUrl: 'scripts',
  paths: {
    jquery: '../vendor/jquery/jquery-3.2.0.min',
    threejs: '../vendor/threejs/three.min',
    orbit: '../vendor/threejs/OrbitControls',
    underscore: '../vendor/underscore/underscore.min'
  },
  shim: {
    'jquery': {
      exports: '$'
    },
    'underscore': {
      exports: '_'
    },
    'threejs': {
      exports: 'THREE'
    },
    'orbit': {
      deps: ['threejs'],
      exports: 'THREE.OrbitControls'
    }
  }
});


requirejs(['app'], function(app) {

  $(document).ready(function() {
    var application = new app.App();
    application.run();
  });

});
