define([], function() {

	function Array3d(width, height, depth, value) {
		this.width = width;
		this.height = height;
		this.depth = depth;

		this.cells = [];
		for (var x = 0; x < this.width; ++x) {
			this.cells.push([]);
			for (var y = 0; y < this.height; ++y) {
				this.cells[x].push([]);
				for (var z = 0; z < this.depth; ++z) {
					this.cells[x][y].push(typeof(value) === "undefined" ? 0.0 : value);
				}
			}
		}
	};


	Array3d.prototype.get = function(x, y, z) {
		if (x < 0 || x >= this.width
			|| y < 0 || y >= this.height
			|| z < 0 || z >= this.depth)
				throw "Array3d: index out of bounds";
		return this.cells[x][y][z];
	};


	Array3d.prototype.set = function(x, y, z, value) {
		if (x < 0 || x >= this.width
			|| y < 0 || y >= this.height
			|| z < 0 || z >= this.depth)
				throw "Array3d: index out of bounds";
		this.cells[x][y] = value;
	};


	Array3d.prototype.getWidth = function() { return this.width; };
	Array3d.prototype.getHeight = function() { return this.height; };
	Array3d.prototype.getDepth = function() { return this.depth; };
	Array3d.prototype.getCells = function() { return this.cells; };


	/*Array2d.prototype.print = function() {
		for (var y = 0; y < this.height; ++y) {
			console.log(this.cells[y].join(" "));
		}
	};*/


	Array3d.prototype.clone = function() {
		var clone = new Array3d(this.width, this.height, this.depth);

		for (var x = 0; x < this.width; ++x) {
			for (var y = 0; y < this.height; ++y) {
				for (var z = 0; z < this.depth; ++z) {
					clone.set(x, y, z, this.cells[x][y][z]);
				}
			}
		}

		return clone;
	};


	Array3d.prototype.forEach = function(fun) {
		for (var x = 0; x < this.width; ++x) {
			for (var y = 0; y < this.height; ++y) {
				for (var z = 0; z < this.depth; ++z) {
					this.cells[x][y][z] = fun(this.cells[x][y][z], x, y, z);
				}
			}
		}
	};


	return {
		Array3d: Array3d
	};
});
