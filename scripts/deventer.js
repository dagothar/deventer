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
    this.xmaze = makeMaze(height, depth, 1);
    this.ymaze = makeMaze(width, depth, 1);
    this.zmaze = makeMaze(width, height, 1);
  };


  Deventer.prototype.rebuild = function(startPosition) {
    var currentPosition = startPosition || { x: 0, y: 0, z: 0 };

    while (1) {
      var currentCell = this.maze.get(currentPosition.x, currentPosition.y, currentPosition.z);
      currentCell.visited = true;
      var neighbours = this.findNeighbours(currentPosition);

      if (neighbours.length > 0) {
        /* pick random neighbour */
        var nextPosition = neighbours[Math.floor(neighbours.length * Math.random())];
        var nextCell = this.maze.get(nextPosition.x, nextPosition.y, nextPosition.z);

        /* connect 3d cells */
        nextCell.parent = currentPosition;
        currentCell.connections.push(nextPosition);
        //nextCell.connections.push(currentPosition);
        nextCell.visited = true;

        /* connect 2d cells */
        var currxcell = this.xmaze.get(currentPosition.y, currentPosition.z, 0);
        var nextxcell = this.xmaze.get(nextPosition.y, nextPosition.z, 0);
        currxcell.connections.push({ x: nextPosition.y, y: nextPosition.z, z: 0 });
        nextxcell.connections.push({ x: currentPosition.y, y: currentPosition.z, z: 0 });
        currxcell.visited = true;
        nextxcell.visited = true;
        var currycell = this.ymaze.get(currentPosition.x, currentPosition.z, 0);
        var nextycell = this.ymaze.get(nextPosition.x, nextPosition.z, 0);
        currycell.connections.push({ x: nextPosition.x, y: nextPosition.z, z: 0 });
        nextycell.connections.push({ x: currentPosition.x, y: currentPosition.z, z: 0 });
        currycell.visited = true;
        nextycell.visited = true;
        var currzcell = this.zmaze.get(currentPosition.x, currentPosition.y, 0);
        var nextzcell = this.zmaze.get(nextPosition.x, nextPosition.y, 0);
        currzcell.connections.push({ x: nextPosition.x, y: nextPosition.y, z: 0 });
        nextzcell.connections.push({ x: currentPosition.x, y: currentPosition.y, z: 0 });
        currzcell.visited = true;
        nextzcell.visited = true;

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
    }

  };


  Deventer.prototype.connected = function(maze, pos1, pos2) {
    var connected = false;

    var cell = maze.get(pos1.x, pos1.y, pos1.z);
    for (var i = 0, n = cell.connections.length; i < n; ++i) {
      var conn = cell.connections[i];
      if (conn.x == pos2.x && conn.y == pos2.y && conn.z == pos2.z) return true;
    }

    return connected;
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

      /* check if visited and if already connected on the sides */
      if (this.maze.get(candidate.x, candidate.y, candidate.z).visited) continue;
      if (this.xmaze.get(candidate.y, candidate.z, 0).visited && !this.connected(this.xmaze, {x: position.y, y: position.z, z: 0}, {x: candidate.y, y: candidate.z, z: 0})) continue;
      if (this.ymaze.get(candidate.x, candidate.z, 0).visited && !this.connected(this.ymaze, {x: position.x, y: position.z, z: 0}, {x: candidate.x, y: candidate.z, z: 0})) continue;
      //if (this.zmaze.get(candidate.x, candidate.y, 0).visited && !this.connected(this.zmaze, {x: position.x, y: position.y, z: 0}, {x: candidate.x, y: candidate.y, z: 0})) continue;

      neighbours.push(candidate);
    }

    return neighbours;
  };


  Deventer.prototype.render = function(scene, renderer, scale) {
    var dx = this.width / 2;
    var dy = this.height / 2;
    var dz = this.depth / 2;
    var scale = scale || 0.1;

    var material = new THREE.LineBasicMaterial({ color: '#333333', linewidth: 1 });

    for (var x = 0; x < this.width; ++x)
      for (var y = 0; y < this.height; ++y)
        for (var z = 0; z < this.depth; ++z) {
          var cell = this.maze.get(x, y, z);
          for (var i = 0; i < cell.connections.length; ++i) {
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(scale*(cell.position.x-dx), scale*(cell.position.y-dy), scale*(cell.position.z-dz)));
            geometry.vertices.push(new THREE.Vector3(scale*(cell.connections[i].x-dx), scale*(cell.connections[i].y-dy), scale*(cell.connections[i].z-dz)));
            var line = new THREE.Line(geometry, material);
            line.name = "maze";
            scene.add(line);
          }
        }


  };


  return {
    Deventer: Deventer
  };
});
