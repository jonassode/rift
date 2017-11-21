rift.load_buildings = function(){

    var arr = [];

    arr.wall     = {image:"images/building_wall.png",    blocking: true};
    arr.floor     = {image:"images/building_floor.png",    blocking: false};
    arr.solarpanel = {image:"images/building_solarpanel.png",    blocking: true};

    return arr;
};

rift.buildingtypes = rift.load_buildings();

rift.building = function(type, col, row){

    var building = rift.buildingtypes[type];

    var object = new Sprite({image: building.image, x: col * rift.cell_size, y: row * rift.cell_size, blocking: building.blocking});

    return object;
};

