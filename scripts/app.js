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
    SPEED_ID: '.speed',
    SPEED_SLIDER_ID: '#slider-speed',
  };


  function App() {
    this.width = CONFIG.START_WIDTH;
    this.height = CONFIG.START_HEIGHT;
    this.depth = CONFIG.START_DEPTH;
    this.maze = new deventer.Deventer(this.width, this.height, this.depth);
    this.lastPos = {x: CONFIG.START_X, y: CONFIG.START_Y, z: CONFIG.START_Z};

    this.animate = true;
    this.animateInt = undefined;
    this.speed = 10;
    this.generateSteps = 1;

    this.pointer = null;
    this.pointerPosition = this.lastPos;
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
    this.controls.position0 = new THREE.Vector3(-15, -15, -15);
    this.controls.reset();
    this.controls.enablePan = false;
  };


  App.prototype._bindUIActions = function() {
    var self = this;

    $(CONFIG.GENERATE_ID).click(function() { self._generateMaze(); });
    $(CONFIG.ANIMATE_ID).click(function() {
      self.animate ^= true;
      if (self.animate) {
        self.generateSteps = 1;
      } else {
        self.generateSteps = undefined;
      }
      $(this).text('Animate: ' + (self.animate ? 'ON' : 'OFF'));
    });
    $(CONFIG.WIDTH_ID).on('input change', function() { self.width = $(this).val(); });
    $(CONFIG.HEIGHT_ID).on('input change', function() { self.height = $(this).val(); });
    $(CONFIG.DEPTH_ID).on('input change', function() { self.depth = $(this).val(); });
    $(CONFIG.SPEED_ID).text(this.speed.toFixed(1) + ' [ms]');
    $(CONFIG.SPEED_SLIDER_ID).on('input change', function() {
      var val = parseInt($(this).val());
      self.speed = 1000 * Math.pow(1.047129, -val);
      $(CONFIG.SPEED_ID).text(self.speed.toFixed(1) + ' [ms]');
      if (self.animateInt) {
        clearInterval(self.animateInt);
        self.animateInt = setInterval(function() { self._generateStep(); }, self.speed);
      }
    });
  };


  App.prototype._update = function() {
    var maxDim = this.maze.width > this.maze.height ? (this.maze.width > this.maze.depth ? this.maze.width : this.maze.depth) : (this.maze.height > this.maze.depth ? this.maze.height : this.maze.depth);
    var scale = 10.0 / maxDim;

    this.maze.render(this.scene, this.renderer, scale);
    this._render();

    $('.connected').text((this.maze.allCorners ? 'YES' : 'NO') + ' / ' + this.maze.maxCorners);
    $('.components').text(this.maze.unconnected);
    $('.largest').text(this.maze.largest + ' / ' + this.maze.ncells);
    $('.links').text(this.maze.links + ' / ' + this.maze.ncells);
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
    this.lastPos = this.maze.rebuild(this.lastPos, this.generateSteps);
    if (this.lastPos == null) {
      clearInterval(this.animateInt);
      this.scene.remove(this.scene.getObjectByName('pointer'));
      this.pointer = null;
      this._update();
      return;
    }
    this.pointerPosition = this.lastPos;
    if (this.pointer == null) {
      var geometry = new THREE.SphereGeometry(0.1, 32, 32);
      var material = new THREE.MeshBasicMaterial({color: 0x000000});
      this.pointer = new THREE.Mesh(geometry, material);
      this.pointer.name = 'pointer';
      this.scene.add(this.pointer);
    }
    var maxDim = this.maze.width > this.maze.height ? (this.maze.width > this.maze.depth ? this.maze.width : this.maze.depth) : (this.maze.height > this.maze.depth ? this.maze.height : this.maze.depth);
    var scale = 10.0 / maxDim;
    this.pointer.position.set(scale*(this.pointerPosition.x-this.maze.width/2+0.5), scale*(this.pointerPosition.y-this.maze.height/2+0.5), scale*(this.pointerPosition.z-this.maze.depth/2+0.5));
    this._update();
  };


  App.prototype._generateMaze = function() {
    while (this.scene.children.length) {
     this.scene.remove(this.scene.children[0]);
    }
    this.pointer = null;

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
