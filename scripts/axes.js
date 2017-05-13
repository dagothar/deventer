define (['threejs'], function(THREE) {

  function Axes(size, radius) {

    var _size = typeof size !== 'undefined' ? size : 1.0;
    var _radius = typeof radius !== 'undefined' ? radius : 0.01;


    this.render = function(scene, renderer) {
      var material_r = new THREE.MeshBasicMaterial({ color: '#ff0000' });
      var material_g = new THREE.MeshBasicMaterial({ color: '#00ff00' });
      var material_b = new THREE.MeshBasicMaterial({ color: '#0000ff' });

      var axis = new THREE.CylinderGeometry(_radius, _radius, 0.9*_size, 100);
      var arrow = new THREE.CylinderGeometry(0.0, 2.5*_radius, 0.1*_size, 100);

      /* X AXIS */
      var x_axis = new THREE.Mesh(axis, material_r);
      x_axis.position.x = 0.9*_size/2;
      x_axis.rotation.z = -Math.PI/2
      scene.add(x_axis);
      var x_arrow = new THREE.Mesh(arrow, material_r);
      x_arrow.position.x = 0.95*_size;
      x_arrow.rotation.z = -Math.PI/2
      scene.add(x_arrow);

      /* Y AXIS */
      var y_axis = new THREE.Mesh(axis, material_g);
      y_axis.position.y = 0.9*_size/2;
      y_axis.rotation.z = 0;
      scene.add(y_axis);
      var y_arrow = new THREE.Mesh(arrow, material_g);
      y_arrow.position.y = 0.95*_size;
      y_arrow.rotation.z = 0;
      scene.add(y_arrow);

      /* Z AXIS */
      var z_axis = new THREE.Mesh(axis, material_b);
      z_axis.position.z = 0.9*_size/2;
      z_axis.rotation.x = Math.PI/2;
      scene.add(z_axis);
      var z_arrow = new THREE.Mesh(arrow, material_b);
      z_arrow.position.z = 0.95*_size;
      z_arrow.rotation.x = Math.PI/2;
      scene.add(z_arrow);
    };

  };


  return {
    Axes: Axes
  };
});
