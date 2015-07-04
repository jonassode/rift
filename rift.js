var rift = {};
rift.tile_map = undefined;
rift.blocker_tiles = new jaws.SpriteList();
rift.workers = new jaws.SpriteList();
rift.units = new jaws.SpriteList();
rift.jobs = new jaws.SpriteList();
rift.bars = new jaws.SpriteList();
rift.buildings = new jaws.SpriteList();
rift.blocks = new jaws.SpriteList();
rift.action_menu = undefined;

// How far is default view
rift.view = 10;

// Directions
var directions = new Array();
directions.push( {row: 0, col: -1 } );
directions.push( {row: 0, col: 1 } );
directions.push( {row: -1, col: 0 } );
directions.push( {row: 1, col: 0 } );

// The Javascript Matrix to Use
jslos.blocker_values.push("0");

// Random methods, will move later
// Show not be global, should extend tilemap
function calculate_line_of_sight(){

    // Clear Fog Of War
    rift.blocker_tiles = new jaws.SpriteList();
    
    var m = exportTileMapToPathMatrix();

    jslos.reset_merged_tiles(rift.tile_map.size[1], rift.tile_map.size[0]);
    
    rift.workers.forEach(
        function( worker ){
            jslos.calculate_line_of_sight(m, worker.location(), rift.view);
        }
    );

    var losmatrix = jslos.merged_visible_tiles;
    
    for( row = 0; row < losmatrix.length; row++) {
        for( col = 0; col < losmatrix[row].length; col++) {
            if ( losmatrix[row][col] === jslos.BLOCKED ){
                var x = col*rift.cell_size;
                var y = row*rift.cell_size;
                rift.blocker_tiles.push( new Sprite({image: "images/dark.png", x: x, y: y }) )
            }
        }
    }
}

