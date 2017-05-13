define(['array3d', 'threejs'], function(array3d, THREE) {

  const NEIGHBOURHOOD = [
    { x: -1, y:  0, z:  0 },
    { x:  1, y:  0, z:  0 },
    { x:  0, y: -1, z:  0 },
    { x:  0, y:  1, z:  0 },
    { x:  0, y:  0, z: -1 },
    { x:  0, y:  0, z:  1 }
  ];


  function Cell(position) {
    this.position = position || { x: 0, y: 0, z: 0 };
    this.visited = false;
    this.parent = null;
    this.connections = [];
  };


  var makeMaze = function(width, height, depth) {
    var maze = new array3d.Array3d(width, height, depth);
    maze.forEach(function(cell, x, y, z) {
      return new Cell({ x: x, y: y, z: z });
    });
    return maze;
  };


  function Deventer(width, height, depth) {
    this.width = width;
    this.height = height;
    this.depth = depth;

    this.maze = makeMaze(width, depth, height);
    this.xmaze = makeMaze(1, height, depth);
    this.ymaze = makeMaze(width, 1, depth);
    this.zmaze = makeMaze(width, height, 1);
  };


  Deventer.prototype.rebuild = function(startPosition, steps) {
    var currentPosition = startPosition || { x: 0, y: 0, z: 0 };
    var steps = steps || 9999999;

    while (steps > 0) {
      var currentCell = this.maze.get(currentPosition.x, currentPosition.y, currentPosition.z);
      currentCell.visited = true;
      var neighbours = this.findNeighbours(currentPosition);

      if (neighbours.length > 0) {
        /* pick random neighbour */
        var nextPosition = neighbours[Math.floor(neighbours.length * Math.random())];
        var nextCell = this.maze.get(nextPosition.x, nextPosition.y, nextPosition.z);

        console.log(currentPosition, nextPosition, neighbours);

        /* connect 3d cells */
        nextCell.parent = currentPosition;
        currentCell.connections.push(nextPosition);
        //nextCell.connections.push(currentPosition);
        currentCell.visited = true;

        /* connect 2d cells */
        var currxcell = this.xmaze.get(0, currentPosition.y, currentPosition.z);
        var nextxcell = this.xmaze.get(0, nextPosition.y, nextPosition.z);
        currxcell.connections.push({ x: 0, y: nextPosition.y, z: nextPosition.z });
        currxcell.connections.push({ x: 0, y: currentPosition.y, z: currentPosition.z });
        //nextxcell.connections.push({ x: 0, y: currentPosition.y, z: currentPosition.z });
        currxcell.visited = true;
        var currycell = this.ymaze.get(currentPosition.x, 0, currentPosition.z);
        var nextycell = this.ymaze.get(nextPosition.x, 0, nextPosition.z);
        currycell.connections.push({ x: nextPosition.x, y: 0, z: nextPosition.z });
        currycell.connections.push({ x: currentPosition.x, y: 0, z: currentPosition.z });
        //nextycell.connections.push({ x: currentPosition.x, y: 0, z: currentPosition.z });
        currycell.visited = true;
        var currzcell = this.zmaze.get(currentPosition.x, currentPosition.y, 0);
        var nextzcell = this.zmaze.get(nextPosition.x, nextPosition.y, 0);
        currzcell.connections.push({ x: nextPosition.x, y: nextPosition.y, z: 0 });
        currzcell.connections.push({ x: currentPosition.x, y: currentPosition.y, z: 0 });
        //nextzcell.connections.push({ x: currentPosition.x, y: currentPosition.y, z: 0 });
        currzcell.visited = true;

        currentPosition = nextPosition;
        currentCell = nextCell;
      } else {
        if (currentCell.parent === null) {
          break; // todo
        } else {
          currentPosition = currentCell.parent;
          currentCell = this.maze.get(currentPosition.x, currentPosition.y, currentPosition.z);
        }
      }

      --steps;
    }

    return currentPosition;
  };


  Deventer.prototype.connected = function(maze, pos1, pos2) {
    var cell = maze.get(pos1.x, pos1.y, pos1.z);
    for (var i = 0, n = cell.connections.length; i < n; ++i) {
      var conn = cell.connections[i];
      if (conn.x === pos2.x && conn.y === pos2.y && conn.z === pos2.z) return true;
    }

    return false;
  };


  Deventer.prototype.findNeighbours = function(position) {
    var neighbours = [];

    for (var i = 0, n = NEIGHBOURHOOD.length; i < n; ++i) {
      /* get candidate position */
      var candidate = {
        x: position.x + NEIGHBOURHOOD[i].x,
        y: position.y + NEIGHBOURHOOD[i].y,
        z: position.z + NEIGHBOURHOOD[i].z
      };

      /* check bounds */
      if (
        candidate.x < 0 || candidate.x >= this.width
        || candidate.y < 0 || candidate.y >= this.height
        || candidate.z < 0 || candidate.z >= this.depth
      ) continue;

      console.log('Trying', candidate);

      /* check if visited and if already connected on the sides */
      if (this.maze.get(candidate.x, candidate.y, candidate.z).visited) {
        console.log('visited');
        continue;
      }
      if (this.xmaze.get(0, candidate.y, candidate.z).visited && !this.connected(this.xmaze, {x: 0, y: position.y, z: position.z}, {x: 0, y: candidate.y, z: candidate.z})) {
        console.log('xmaze', this.xmaze.get(0, candidate.y, candidate.z).visited, this.connected(this.xmaze, {x: 0, y: position.y, z: position.z}, {x: 0, y: candidate.y, z: candidate.z}))
        continue;
      }
      if (this.ymaze.get(candidate.x, 0, candidate.z).visited && !this.connected(this.ymaze, {x: position.x, y: 0, z: position.z}, {x: candidate.x, y: 0, z: candidate.z})) {
        console.log('ymaze', this.ymaze.get(candidate.x, 0, candidate.z).visited, this.connected(this.ymaze, {x: position.x, y: 0, z: position.z}, {x: candidate.x, y: 0, z: candidate.z}));
        continue;
      }
      if (this.zmaze.get(candidate.x, candidate.y, 0).visited && !this.connected(this.zmaze, {x: position.x, y: position.y, z: 0}, {x: candidate.x, y: candidate.y, z: 0})) {
        console.log('zmaze', this.zmaze.get(candidate.x, candidate.y, 0).visited, this.connected(this.zmaze, {x: position.x, y: position.y, z: 0}, {x: candidate.x, y: candidate.y, z: 0}));
        continue;
      }

      console.log('pass');
      neighbours.push(candidate);
    }

    return neighbours;
  };


  Deventer.prototype.renderMaze = function(scene, maze, px, py, pz, scale, color) {
    var px = px || 0.0;
    var py = py || 0.0;
    var pz = pz || 0.0;
    var scale = scale || 1.0;
    var color = color || '#000000';

    var material = new THREE.LineBasicMaterial({ color: color, linewidth: 1 });

    for (var x = 0; x < maze.width; ++x) {
      for (var y = 0; y < maze.height; ++y) {
        for (var z = 0; z < maze.depth; ++z) {
          var cell = maze.get(x, y, z);
          for (var i = 0; i < cell.connections.length; ++i) {
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(scale*(cell.position.x+0.5)+px, scale*(cell.position.y+0.5)+py, scale*(cell.position.z+0.5)+pz));
            geometry.vertices.push(new THREE.Vector3(scale*(cell.connections[i].x+0.5)+px, scale*(cell.connections[i].y+0.5)+py, scale*(cell.connections[i].z+0.5)+pz));
            var line = new THREE.Line(geometry, material);
            line.name = "maze";
            scene.add(line);
          }
        }
      }
    }
  };


  Deventer.prototype.render = function(scene, renderer, scale) {
    var dx = this.width / 2.0;
    var dy = this.height / 2.0;
    var dz = this.depth / 2.0;
    var scale = scale || 1.0;

    this.renderMaze(scene, this.maze, -dx, -dy, -dz, scale, '#555555');
    this.renderMaze(scene, this.xmaze, -dx-scale, -dy, -dz, scale, '#ff0000');
    this.renderMaze(scene, this.ymaze, -dx, -dy-scale, -dz, scale, '#00ff00');
    this.renderMaze(scene, this.zmaze, -dx, -dy, -dz-scale, scale, '#0000ff');
  };


  return {
    Deventer: Deventer
  };
});
