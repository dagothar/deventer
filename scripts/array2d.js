define([], function() {

	function Array2d(width, height, value) {
		this.width = width;
		this.height = height;

		this.cells = [];
		for (var x = 0; x < this.width; ++x) {
			this.cells.push([]);
			for (var y = 0; y < this.height; ++y) {
				this.cells[x].push(typeof(value) === "undefined" ? 0.0 : value);
			};
		};
	};


	Array2d.prototype.get = function(x, y) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) throw "Array2d: index out of bounds";
		return this.cells[x][y];
	};


	Array2d.prototype.set = function(x, y, value) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) throw "Array2d: index out of bounds";
		this.cells[x][y] = value;
	};


	Array2d.prototype.getWidth = function() { return this.width; };
	Array2d.prototype.getHeight = function() { return this.height; };
	Array2d.prototype.getCells = function() { return this.cells; };


	Array2d.prototype.print = function() {
		for (var y = 0; y < this.height; ++y) {
			console.log(this.cells[y].join(" "));
		}
	};


	Array2d.prototype.clone = function() {
		var clone = new Array2d(this.width, this.height);

		for (var x = 0; x < this.width; ++x) {
			for (var y = 0; y < this.height; ++y) {
				clone.set(x, y, this.cells[x][y]);
			};
		};

		return clone;
	};


	Array2d.prototype.forEach = function(fun) {
		for (var x = 0; x < this.width; ++x) {
			for (var y = 0; y < this.height; ++y) {
				fun(this.cells[x][y], x, y);
			};
		};
	};


	return {
		Array2d: Array2d
	};
});
