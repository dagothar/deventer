define(['array3d', 'threejs'], function(array3d, threejs) {

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
      cell = new Cell({ x: x, y: y, z: z });
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
    var currentCell = this.maze.get(currentPosition.x, currentPosition.y, currentPosition.z);
    currentCell.visited = true;

    while (1) {
      var neighbours = this.findNeighbours(currentPosition);

      if (neighbours.length > 0) {
        /* pick random neighbour */
        var nextPosition = neighbours[Math.floor(neighbours.length * Math.random())];
        var nextCell = this.maze.get(currentPosition.x, currentPosition.y, currentPosition.z);

        /* connect 3d cells */
        nextCell.parent = currentPosition;
        currentCell.connections.push(nextPosition);
        nextCell.connections.push(currentPosition);
        nextCell.visited = true;

        /* connect 2d cells */
        /* ... */
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
      /* ... */

      neighbours.push(candidate);
    }

    return neighbours;
  };


  Deventer.prototype.render = function(scene, renderer) {

  };


  return {
    Deventer: Deventer
  };
});
