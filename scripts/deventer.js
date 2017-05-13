define(['array3d', 'threejs'], function(array3d, threejs) {

  function Cell(position) {
    this.position = position || { x: 0, y: 0, z: 0 };
    this.visited = false;
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


  Deventer.prototype.build = function() {
    
  };


  return {
    Deventer: Deventer
  };
});
