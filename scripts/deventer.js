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


  var positionEqual = function(pos1, pos2) {
    return (pos1.x == pos2.x && pos1.y == pos2.y && pos1.z == pos2.z);
  };


  function Connection(position) {
    this.x = position.x;
    this.y = position.y;
    this.z = position.z;
    this.drawn = false;
  };


  function Deventer(width, height, depth) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.ncells = this.width * this.height * this.depth;

    this.unvisited = this.width * this.depth * this.height;
    this.unconnected = 1;
    this.links = 0;
    this.largest = 0;
    this.corners = 0;
    this.allCorners = false;

    this.maze = makeMaze(width, height, depth);
    this.xmaze = makeMaze(1, height, depth);
    this.ymaze = makeMaze(width, 1, depth);
    this.zmaze = makeMaze(width, height, 1);
  };


  Deventer.prototype.rebuild = function(startPosition, steps) {
    var currentPosition = startPosition || {
      x: Math.floor(this.width*Math.random()),
      y: Math.floor(this.height*Math.random()),
      z: Math.floor(this.depth*Math.random())
    };
    var steps = steps || Number.MAX_SAFE_INTEGER;

    while (steps > 0) {
      var currentCell = this.maze.get(currentPosition.x, currentPosition.y, currentPosition.z);
      var currentCellX = this.xmaze.get(0, currentPosition.y, currentPosition.z);
      var currentCellY = this.ymaze.get(currentPosition.x, 0, currentPosition.z);
      var currentCellZ = this.zmaze.get(currentPosition.x, currentPosition.y, 0);

      var neighbours = this.findNeighbours(currentPosition);

      /* check if it is a corner */
      if (!currentCell.visited && positionEqual(currentPosition, {x: 0, y: 0, z: 0})) ++this.corners;
      if (!currentCell.visited && positionEqual(currentPosition, {x: this.width-1, y: 0, z: 0})) ++this.corners;
      if (!currentCell.visited && positionEqual(currentPosition, {x: 0, y: this.height-1, z: 0})) ++this.corners;
      if (!currentCell.visited && positionEqual(currentPosition, {x: this.width-1, y: this.height-1, z: 0})) ++this.corners;
      if (!currentCell.visited && positionEqual(currentPosition, {x: 0, y: 0, z: this.depth-1})) ++this.corners;
      if (!currentCell.visited && positionEqual(currentPosition, {x: this.width-1, y: 0, z: this.depth-1})) ++this.corners;
      if (!currentCell.visited && positionEqual(currentPosition, {x: 0, y: this.height-1, z: this.depth-1})) ++this.corners;
      if (!currentCell.visited && positionEqual(currentPosition, {x: this.width-1, y: this.height-1, z: this.depth-1})) ++this.corners;
      if (this.corners == 8) this.allCorners = true;

      currentCell.visited = true;
      currentCellX.visited = true;
      currentCellY.visited = true;
      currentCellZ.visited = true;

      if (neighbours.length > 0) {
        /* pick random neighbour */
        var nextPosition = neighbours[Math.floor(neighbours.length * Math.random())];
        var nextCell = this.maze.get(nextPosition.x, nextPosition.y, nextPosition.z);

        /* connect 3d cells */
        nextCell.parent = currentPosition;
        currentCell.connections.push(nextPosition);
        nextCell.connections.push(currentPosition);
        currentCell.visited = true;
        --this.unvisited;
        ++this.links;
        if (this.links > this.largest) this.largest = this.links;

        /* connect 2d cells */
        var nextCellX = this.xmaze.get(0, nextPosition.y, nextPosition.z);
        currentCellX.connections.push(new Connection({ x: 0, y: nextPosition.y, z: nextPosition.z }));
        currentCellX.connections.push(new Connection({ x: 0, y: currentPosition.y, z: currentPosition.z }));
        nextCellX.connections.push(new Connection({ x: 0, y: currentPosition.y, z: currentPosition.z }));

        var nextCellY = this.ymaze.get(nextPosition.x, 0, nextPosition.z);
        currentCellY.connections.push(new Connection({ x: nextPosition.x, y: 0, z: nextPosition.z }));
        currentCellY.connections.push(new Connection({ x: currentPosition.x, y: 0, z: currentPosition.z }));
        nextCellY.connections.push(new Connection({ x: currentPosition.x, y: 0, z: currentPosition.z }));

        var nextCellZ = this.zmaze.get(nextPosition.x, nextPosition.y, 0);
        currentCellZ.connections.push(new Connection({ x: nextPosition.x, y: nextPosition.y, z: 0 }));
        currentCellZ.connections.push(new Connection({ x: currentPosition.x, y: currentPosition.y, z: 0 }));
        nextCellZ.connections.push(new Connection({ x: currentPosition.x, y: currentPosition.y, z: 0 }));

        currentPosition = nextPosition;
        currentCell = nextCell;
      } else {
        if (currentCell.parent === null) {
          var unvisited = this.findUnvisited();
          if (unvisited) {
            currentPosition = unvisited;
            this.unconnected++;
            this.links = 0;
            this.corners = 0;
          } else return null;
        } else {
          currentPosition = currentCell.parent;
        }
      }

      --steps;
    }

    return currentPosition;
  };


  Deventer.prototype.findUnvisited = function() {
    var unvisited = null;

    for (var x = 0; x < this.width; ++x) {
      for (var y = 0; y < this.height; ++y) {
        for (var z = 0; z < this.depth; ++z) {
          var cell = this.maze.get(x, y, z);
          if (!cell.visited) return cell.position;
        }
      }
    }

    return unvisited;
  };


  Deventer.prototype.connected = function(maze, pos1, pos2) {
    var cell = maze.get(pos1.x, pos1.y, pos1.z);
    for (var i = 0, n = cell.connections.length; i < n; ++i) {
      var conn = cell.connections[i];
      if (positionEqual(pos2, conn)) return true;
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

      /* check if visited and if already connected on the sides */
      if (this.maze.get(candidate.x, candidate.y, candidate.z).visited) continue;
      if (
        this.xmaze.get(0, candidate.y, candidate.z).visited
        && !this.connected(this.xmaze, {x: 0, y: position.y, z: position.z}, {x: 0, y: candidate.y, z: candidate.z})
      ) continue;
      if (
        this.ymaze.get(candidate.x, 0, candidate.z).visited
        && !this.connected(this.ymaze, {x: position.x, y: 0, z: position.z}, {x: candidate.x, y: 0, z: candidate.z})
      ) continue;
      if (
        this.zmaze.get(candidate.x, candidate.y, 0).visited
        && !this.connected(this.zmaze, {x: position.x, y: position.y, z: 0}, {x: candidate.x, y: candidate.y, z: 0})
      ) continue;

      neighbours.push(candidate);
    }

    return neighbours;
  };


  Deventer.prototype.renderMaze = function(scene, maze, px, py, pz, scale, color, weight) {
    var px = px || 0.0;
    var py = py || 0.0;
    var pz = pz || 0.0;
    var scale = scale || 1.0;
    var color = color || '#000000';
    var weight = weight || 1;

    var material = new THREE.LineBasicMaterial({ color: color, linewidth: weight });

    for (var x = 0; x < maze.width; ++x) {
      for (var y = 0; y < maze.height; ++y) {
        for (var z = 0; z < maze.depth; ++z) {
          var cell = maze.get(x, y, z);
          for (var i = 0; i < cell.connections.length; ++i) {
            var connection = cell.connections[i];
            if (connection.drawn) continue;
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(scale*(cell.position.x+0.5)+px, scale*(cell.position.y+0.5)+py, scale*(cell.position.z+0.5)+pz));
            geometry.vertices.push(new THREE.Vector3(scale*(connection.x+0.5)+px, scale*(connection.y+0.5)+py, scale*(connection.z+0.5)+pz));
            var line = new THREE.Line(geometry, material);
            line.name = "maze";
            scene.add(line);
            connection.drawn = true;
          }
        }
      }
    }
  };


  Deventer.prototype.render = function(scene, renderer, scale, sideOffset) {
    var dx = scale*(this.width / 2.0);
    var dy = scale*(this.height / 2.0);
    var dz = scale*(this.depth / 2.0);
    var scale = scale || 1.0;
    var sideOffset = 6.0 || sideOffset;

    this.renderMaze(scene, this.maze, -dx, -dy, -dz, scale, '#eeeeee');
    this.renderMaze(scene, this.xmaze, -sideOffset, -dy, -dz, scale, '#ff0000', 2);
    this.renderMaze(scene, this.ymaze, -dx, -sideOffset, -dz, scale, '#00ff00', 2);
    this.renderMaze(scene, this.zmaze, -dx, -dy, -sideOffset, scale, '#0000ff', 2);
  };


  return {
    Deventer: Deventer
  };
});
