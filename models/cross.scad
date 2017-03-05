module cross(length, diameter) {
    union() {
        translate([0, 0, 0]) rotate([0, 0, 0]) cube([diameter, diameter, length], center=true);
        //translate([0, 0, 0]) rotate([0, 90, 0]) cube([diameter, diameter, length], center=true);
        //translate([0, 0, 0]) rotate([90, 0, 0]) cube([diameter, diameter, length], center=true);
    }
}

cross(2, 0.05);