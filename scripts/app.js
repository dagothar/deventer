define(['jquery', 'deventer', 'threejs', 'axes', 'grid'], function($, deventer, THREE, axes, grid) {

  const CONFIG = {

  };


  function App() {
  };


  App.prototype._initialize = function() {
    this.canvas = $('#view').get(0);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    this.camera = new THREE.OrthographicCamera(-this.canvas.width/200, this.canvas.width/200, this.canvas.height/200, -this.canvas.height/200, -10, 10);
    this.camera.position.set(1, -1, 1);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setClearColor(0xffffff);

    this.axes = new axes.Axes(1.0, 0.01);
    this.grid = new grid.Grid(2.0, 0.25);
  };


  App.prototype._bindUIActions = function() {
    var self = this;

  };


  App.prototype._update = function() {
    while (this.scene.children.length)
    {
      this.scene.remove(this.scene.children[0]);
    }

    this.axes.render(this.scene, this.renderer);
    this.grid.render(this.scene, this.renderer);

    this.renderer.render(this.scene, this.camera);
  };


  App.prototype.run = function() {
    this._initialize();
    this._update();
  };


  return {
    App: App
  };
});
