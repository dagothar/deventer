define(['jquery', 'deventer', 'threejs', 'orbit', 'axes', 'grid'], function($, deventer, THREE, orbit, axes, grid) {

  const CONFIG = {

  };


  function App() {
    this.axes = new axes.Axes(1.0, 0.01);
    this.grid = new grid.Grid(2.0, 0.25);

    this.maze = new deventer.Deventer(5, 5, 5);
    this.maze.rebuild();
  };


  App.prototype._initialize = function() {
    var self = this;

    this.canvas = $('#view').get(0);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    this.camera = new THREE.OrthographicCamera(-this.canvas.width/200, this.canvas.width/200, this.canvas.height/200, -this.canvas.height/200, -100, 100);
    //this.camera = new THREE.PerspectiveCamera(45, this.canvas.width / this.canvas.height, 0.01, 1000);
    this.camera.position.set(10, -10, 10);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setClearColor(0xffffff);

    this.controls = new THREE.OrbitControls(this.camera, this.canvas);
    this.controls.addEventListener('change', function() { self._update(); });
    this.controls.zoom0 = 1;
    this.controls.position0 = new THREE.Vector3(5, -5, 5);
    this.controls.reset();
    this.controls.enablePan = false;
  };


  App.prototype._bindUIActions = function() {
    var self = this;

  };


  App.prototype._update = function() {
    this.renderer.render(this.scene, this.camera);
  };


  App.prototype.run = function() {
    this._initialize();
    //while (this.scene.children.length)
    //{
    //  this.scene.remove(this.scene.children[0]);
    //}

    this.maze.render(this.scene, this.renderer);
    this.axes.render(this.scene, this.renderer);
    this.grid.render(this.scene, this.renderer);
    this._update();
  };


  return {
    App: App
  };
});
