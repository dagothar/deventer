define(['jquery', 'deventer', 'threejs', 'orbit', 'axes', 'grid'], function($, deventer, THREE, orbit, axes, grid) {

  const CONFIG = {
    START_WIDTH: 10,
    START_HEIGHT: 10,
    START_DEPTH: 10,
    START_X: 0,
    START_Y: 0,
    START_Z: 0,
    VIEW_ID: '#view',
    FOG_COLOR: 0xcccccc,
    FOG_DENSITY: 0.02,
    BG_COLOR: 0xffffff,
    GENERATE_ID: '#button-generate',
    WIDTH_ID: '#width',
    HEIGHT_ID: '#height',
    DEPTH_ID: '#depth',
    ANIMATE_ID: '#button-animate',
  };


  function App() {
    this.width = CONFIG.START_WIDTH;
    this.height = CONFIG.START_HEIGHT;
    this.depth = CONFIG.START_DEPTH;
    this.maze = new deventer.Deventer(this.width, this.height, this.depth);
    this.lastPos = {x: CONFIG.START_X, y: CONFIG.START_Y, z: CONFIG.START_Z};

    this.animate = false;
    this.animateInt = undefined;
    this.speed = 10;
  };


  App.prototype._initialize = function() {
    var self = this;

    this.canvas = $(CONFIG.VIEW_ID).get(0);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(CONFIG.FOG_COLOR, CONFIG.FOG_DENSITY);

    // this.camera = new THREE.OrthographicCamera(-this.canvas.width/200, this.canvas.width/200, this.canvas.height/200, -this.canvas.height/200, -100, 100);
    this.camera = new THREE.PerspectiveCamera(45, this.canvas.width / this.canvas.height, 0.01, 1000);
    //this.camera.position.set(10, -10, 10);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setClearColor(CONFIG.BG_COLOR);

    this.controls = new THREE.OrbitControls(this.camera, this.canvas);
    this.controls.addEventListener('change', function() { self._render(); });
    this.controls.zoom0 = 1;
    this.controls.position0 = new THREE.Vector3(15, -15, 15);
    this.controls.reset();
    this.controls.enablePan = false;
  };


  App.prototype._bindUIActions = function() {
    var self = this;

    $(CONFIG.GENERATE_ID).click(function() { self._generateMaze(); });
    $(CONFIG.ANIMATE_ID).click(function() {
      self.animate ^= true;
      $(this).text('Animate: ' + (self.animate ? 'ON' : 'OFF'));
    });
    $(CONFIG.WIDTH_ID).on('input change', function() { self.width = $(this).val(); });
    $(CONFIG.HEIGHT_ID).on('input change', function() { self.height = $(this).val(); });
    $(CONFIG.DEPTH_ID).on('input change', function() { self.depth = $(this).val(); });
  };


  App.prototype._update = function() {
    var maxDim = this.width > this.height ? (this.width > this.depth ? this.width : this.depth) : (this.height > this.depth ? this.height : this.depth);
    var scale = 10.0 / maxDim;

    this.maze.render(this.scene, this.renderer, scale);
    this._render();
  };


  App.prototype._render = function() {
    this.renderer.render(this.scene, this.camera);
  };


  App.prototype.run = function() {
    this._initialize();
    this._bindUIActions();

    this._update();
  };


  App.prototype._generateStep = function() {
    this.lastPos = this.maze.rebuild(this.lastPos, 1);
    if (this.lastPos == null) {
      clearInterval(this.animateInt);
      this._update();
      return;
    }
    this._update();
  };


  App.prototype._generateMaze = function() {
    while (this.scene.children.length) {
     this.scene.remove(this.scene.children[0]);
    }

    var self = this;
    clearInterval(this._moveModeInt);

    this.maze = new deventer.Deventer(this.width, this.height, this.depth);

    if (!this.animate) {
      this.maze.rebuild();
      this._update();
    } else {
      clearInterval(this.animateInt);
      this.lastPos = undefined;
      this.animateInt = setInterval(function() { self._generateStep(); }, this.speed);
    }

  };


  App.prototype.test = function() {



  };


  return {
    App: App
  };
});
