rift.load_buildings = function(){

    var arr = new Array();

    arr["wall"]     = {image:"images/building_wall.png",    blocking:true}
    arr["floor"]     = {image:"images/building_floor.png",    blocking:false}
    arr["solarpanel"]= {image:"images/building_solarpanel.png",    blocking:true}

    return arr;
}

rift.buildingtypes = rift.load_buildings();

rift.building = function(type, col, row){

    var type = rift.buildingtypes[type];

    var object = new Sprite({image: type.image, x: col * rift.cell_size, y: row * rift.cell_size, blocking: type.blocking})

    return object;
};

