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
    CURSOR_RADIUS: 0.075,
    CURSOR_LENGTH: 20.0,
    CURSOR_X_ID: '#cursor-x',
    CURSOR_Y_ID: '#cursor-y',
    CURSOR_Z_ID: '#cursor-z',
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

    this.cursor = null;
    this.xcursor = null;
    this.ycursor = null;
    this.zcursor = null;
    this.cursorPosition = this.lastPos;
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
    $(CONFIG.WIDTH_ID).on('input change', function() {
      var width = $(this).val();
      if (width > 0) self.width = width; else $(this).val(1);
    });
    $(CONFIG.HEIGHT_ID).on('input change', function() {
      var height = $(this).val();
      if (height > 0) self.height = height; else $(this).val(1);
    });
    $(CONFIG.DEPTH_ID).on('input change', function() {
      var depth = $(this).val();
      if (depth > 0) self.depth = depth; else $(this).val(1);
    });
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
    $(window).keypress(function(e) {
      var x = self.cursorPosition.x;
      var y = self.cursorPosition.y;
      var z = self.cursorPosition.z;
      var cell = self.maze.maze.get(x, y, z);

      var keycode = event.keyCode || event.which;
      if (keycode == 119) { // W
        var target = {x: x+1, y: y, z: z};
        if (target.x >= self.maze.width) return;
        if (self.maze.connected(self.maze.maze, cell.position, target))
          ++self.cursorPosition.x;
      }
      if (keycode == 115) { // S
        var target = {x: x-1, y: y, z: z};
        if (target.x < 0) return;
        if (self.maze.connected(self.maze.maze, cell.position, target))
          --self.cursorPosition.x;
      }
      if (keycode == 97) { // A
        var target = {x: x, y: y+1, z: z};
        if (target.y >= self.maze.height) return;
        if (self.maze.connected(self.maze.maze, cell.position, target))
          ++self.cursorPosition.y;
      }
      if (keycode == 100) { // D
        var target = {x: x, y: y-1, z: z};
        if (target.y < 0) return;
        if (self.maze.connected(self.maze.maze, cell.position, target))
          --self.cursorPosition.y;
      }
      if (keycode == 113) { // Q
        var target = {x: x, y: y, z: z-1};
        if (target.z < 0) return;
        if (self.maze.connected(self.maze.maze, cell.position, target))
          --self.cursorPosition.z;
      }
      if (keycode == 101) { // E
        var target = {x: x, y: y, z: z+1};
        if (target.z >= self.maze.depth) return;
        if (self.maze.connected(self.maze.maze, cell.position, target))
          ++self.cursorPosition.z;
      }
      self._update();
    });
    $(CONFIG.CURSOR_X_ID).on('input change', function() {
      var x = $(this).val();
      if (x >= 0 && x < self.maze.width) self.cursorPosition.x = x;
      self._update();
    });
    $(CONFIG.CURSOR_Y_ID).on('input change', function() {
      var y = $(this).val();
      if (y >= 0 && y < self.maze.height) self.cursorPosition.y = y;
      self._update();
    });
    $(CONFIG.CURSOR_Z_ID).on('input change', function() {
      var z = $(this).val();
      if (z >= 0 && z < self.maze.depth) self.cursorPosition.z = z;
      self._update();
    });
  };


  App.prototype._update = function() {
    var maxDim = this.maze.width > this.maze.height ? (this.maze.width > this.maze.depth ? this.maze.width : this.maze.depth) : (this.maze.height > this.maze.depth ? this.maze.height : this.maze.depth);
    var scale = 10.0 / maxDim;

    this.maze.render(this.scene, this.renderer, scale);
    this._updateCursor();
    this._render();

    $('.connected').text((this.maze.allCorners ? 'YES' : 'NO') + ' / ' + this.maze.maxCorners);
    $('.components').text(this.maze.unconnected);
    $('.largest').text(this.maze.largest + ' / ' + this.maze.ncells);
    $('.links').text(this.maze.links + ' / ' + this.maze.ncells);

    $(CONFIG.CURSOR_X_ID).val(this.cursorPosition.x);
    $(CONFIG.CURSOR_Y_ID).val(this.cursorPosition.y);
    $(CONFIG.CURSOR_Z_ID).val(this.cursorPosition.z);
  };


  App.prototype._render = function() {
    this.renderer.render(this.scene, this.camera);
  };


  App.prototype.run = function() {
    this._initialize();
    this._bindUIActions();
    this._generateMaze();
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
    if (this.cursorPosition == null) this.cursorPosition = this.maze.startPosition;
    this._update();
  };


  App.prototype._generateMaze = function() {
    while (this.scene.children.length) {
     this.scene.remove(this.scene.children[0]);
    }
    this.pointer = null;
    this.cursor = null;

    var self = this;
    clearInterval(this._moveModeInt);

    this.maze = new deventer.Deventer(this.width, this.height, this.depth);

    if (!this.animate) {
      this.maze.rebuild();
      this.cursorPosition = this.maze.startPosition;
      this._update();
    } else {
      clearInterval(this.animateInt);
      this.lastPos = undefined;
      this.cursorPosition = null;
      this.animateInt = setInterval(function() { self._generateStep(); }, this.speed);
    }

  };


  App.prototype._updateCursor = function() {
    if (this.cursor == null) {
      var geometry = new THREE.Geometry();
      var geo1 = new THREE.CylinderGeometry(CONFIG.CURSOR_RADIUS, CONFIG.CURSOR_RADIUS, CONFIG.CURSOR_LENGTH, 32);
      var mesh1 = new THREE.Mesh(geo1);
      mesh1.updateMatrix();
      var geo2 = new THREE.CylinderGeometry(CONFIG.CURSOR_RADIUS, CONFIG.CURSOR_RADIUS, CONFIG.CURSOR_LENGTH, 32);
      var mesh2 = new THREE.Mesh(geo2);
      mesh2.rotation.x = THREE.Math.degToRad(90);
      mesh2.updateMatrix();
      var geo3 = new THREE.CylinderGeometry(CONFIG.CURSOR_RADIUS, CONFIG.CURSOR_RADIUS, CONFIG.CURSOR_LENGTH, 32);
      var mesh3 = new THREE.Mesh(geo3);
      mesh3.rotation.z = THREE.Math.degToRad(90);
      mesh3.updateMatrix();

      geometry.merge(mesh1.geometry, mesh1.matrix);
      geometry.merge(mesh2.geometry, mesh2.matrix);
      geometry.merge(mesh3.geometry, mesh3.matrix);

      var material = new THREE.MeshBasicMaterial({color: 0x000000});

      this.cursor = new THREE.Mesh(geometry, material);
      this.cursor.name = 'cursor';
      this.scene.add(this.cursor);

      var xgeo = new THREE.SphereGeometry(2*CONFIG.CURSOR_RADIUS, 32, 32);
      var xmaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
      this.xcursor = new THREE.Mesh(xgeo, xmaterial);
      this.scene.add(this.xcursor);

      var ygeo = new THREE.SphereGeometry(2*CONFIG.CURSOR_RADIUS, 32, 32);
      var ymaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
      this.ycursor = new THREE.Mesh(ygeo, ymaterial);
      this.scene.add(this.ycursor);

      var zgeo = new THREE.SphereGeometry(2*CONFIG.CURSOR_RADIUS, 32, 32);
      var zmaterial = new THREE.MeshBasicMaterial({color: 0x0000ff});
      this.zcursor = new THREE.Mesh(zgeo, zmaterial);
      this.scene.add(this.zcursor);
    }

    var maxDim = this.maze.width > this.maze.height ? (this.maze.width > this.maze.depth ? this.maze.width : this.maze.depth) : (this.maze.height > this.maze.depth ? this.maze.height : this.maze.depth);
    var scale = 10.0 / maxDim;
    this.cursor.position.set(scale*(this.cursorPosition.x-this.maze.width/2+0.5), scale*(this.cursorPosition.y-this.maze.height/2+0.5), scale*(this.cursorPosition.z-this.maze.depth/2+0.5));
    this.xcursor.position.set(scale*0.5-6, scale*(this.cursorPosition.y-this.maze.height/2+0.5), scale*(this.cursorPosition.z-this.maze.depth/2+0.5));
    this.ycursor.position.set(scale*(this.cursorPosition.x-this.maze.width/2+0.5), scale*0.5-6, scale*(this.cursorPosition.z-this.maze.depth/2+0.5));
    this.zcursor.position.set(scale*(this.cursorPosition.x-this.maze.width/2+0.5), scale*(this.cursorPosition.y-this.maze.height/2+0.5), scale*0.5-6);
  };


  App.prototype.test = function() {
  };


  return {
    App: App
  };
});
