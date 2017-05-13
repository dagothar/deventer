define(['threejs'], function(THREE) {

  function Grid(size, offset, color, lineWidth) {

    var _size = typeof size !== 'undefined' ? size : 2.0;
    var _offset = typeof offset !== 'undefined' ? offset : 1.0;
    var _color = typeof color !== 'undefined' ? color : '#cccccc';
    var _lineWidth = typeof lineWidth !== 'undefined' ? lineWidth : 1;


    this.render = function(scene, renderer) {

      var material = new THREE.LineBasicMaterial({ color: _color, linewidth: _lineWidth });

      // y lines
      for (var t = -_size/2.0; t <= _size/2.0; t += _offset) {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(t, -_size/2.0, 0.0));
        geometry.vertices.push(new THREE.Vector3(t, _size/2.0, 0.0));
        var line = new THREE.Line(geometry, material);
        line.name = "grid";

        scene.add(line);
      }

      // x lines
      for (var t = -_size/2.0; t <= _size/2.0; t += _offset) {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-_size/2.0, t, 0.0));
        geometry.vertices.push(new THREE.Vector3(_size/2.0, t, 0.0));
        var line = new THREE.Line(geometry, material);
        line.name = "grid";

        scene.add(line);
      }
    };

  };


  return {
    Grid: Grid
  };
});
