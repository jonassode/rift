function Main() {
    var fps;

	// Used for indicating selection of a unit
	rift.unit_selection = new Sprite({image: "images/unit_selector_red.png" });

    // Setup Rangers
    rift.workers.push(new rift.ranger(0,96));
    rift.workers.push(new rift.ranger(0,64));
    rift.workers.push(new rift.ranger(0,32));
    rift.workers.push(new rift.ranger(0,0));

	// Setup Civilians
    //rift.units.push(new rift.civilian(0,128));
	
	// Setup Aliens
    rift.units.push(new rift.alien(0,160));

	//rift.workers.at(0).select_item();

    rift.action_menu = rift.menu(641, 0);

    /* Called once when a game state is activated. Use it for one-time setup code. */
    this.setup = function() {
        fps = document.getElementById("fps");
        
        var tilemap_width = 20;
        var tilemap_height = 15;
        rift.cell_size = 32;

        // Get some Random terrain
        for ( var j = 0; j < tilemap_height; j++){
            for ( var i = 0; i <tilemap_width; i++){
                var x = i*rift.cell_size;
                var y = j*rift.cell_size;

                if ( Math.floor((Math.random()*20)+1) > 17 && x !== 0 ){
                    rift.blocks.push( new Sprite({image: "images/building_wall.png", x: x, y: y, blocking: true }) );
                } else {
                    rift.blocks.push( new Sprite({image: "images/building_floor.png", x: x, y: y, blocking: false}) );
                }
            }
        }

		// Populate the Action Menu
        rift.action_menu.add( new Sprite({image: "images/button_walk.png" }), rift.JOB_WALK, "walk");
        rift.action_menu.add( new Sprite({image: "images/button_shoot.png" }), rift.JOB_SHOOT, "shoot");

        // A tilemap, each cell is 32x32 pixels. There's 10 such cells across and 10 downwards.
        rift.tile_map = new jaws.TileMap({size: [tilemap_width,tilemap_height], cell_size: [32,32], scale: 0.5});

        // Extending Tilemap
        // Move these to a extend tilemap method
        rift.tile_map.check = function(col, row, option, value){
            var checked_value = false;
            this.cell(col,row).forEach(function(item){
                if ( item.options[option] == value){
                    checked_value = true;
                }
            });
            return checked_value;
        };

        rift.tile_map.job = function(col, row){
            var found_job;
            rift.jobs.forEach(function(item){
                if ( item.col == col && item.row == row ){
                    found_job = item;
					alert(found);
                }
            });
            return found_job;
        };

        rift.tile_map.unit = function(col, row){
            var found_unit;
            rift.workers.forEach(function(item){
                if ( item.col() == col && item.row() == row ){
                    found_unit = item;
                }
            });
            return found_unit;
        };

        rift.tile_map.find_free_neighbour = function(col, row){
            var y;
            $.each(directions, function(){
                var xrow = row + this.row;
                var xcol = col + this.col;
                if ( xcol >= 0 && xrow >= 0 && rift.tile_map.check(xcol, xrow, "blocking", false) ){
                    y = {row:xrow, col:xcol};
                }
            });
            return y;
        };

        // Fit all items in array blocks into correct cells in the tilemap
        // Later on we can look them up really fast (see player.move)
        rift.tile_map.push(rift.blocks);

        jaws.context.mozImageSmoothingEnabled = false;  // non-blurry, blocky retro scaling
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);

        // For Debugging
        jaws.on_keydown("r", function(){
            rift.workers.push(new rift.ranger(0,0));
            });
        jaws.on_keydown("e", function(){
            rift.units.push(new rift.enemy(0,0));
            });
        
        // Activate line of sight
        calculate_line_of_sight();
    };

    /* update() will get called each game tick with your specified FPS. Put game logic here. */
    this.update = function() {

        rift.workers.forEach(function(worker){
            worker.act();
        });

        rift.units.forEach(function(unit){
            unit.act();
        });

        //jaws.forceInsideCanvas(player)
        fps.innerHTML = jaws.game_loop.fps;
    };

    /* Directly after each update draw() will be called. Put all your on-screen operations here. */
    this.draw = function() {
        jaws.clear();
        rift.blocks.draw();
        rift.buildings.draw();
        rift.jobs.draw();
        // Disabling bars until we need them again
        //rift.bars.draw()
        rift.action_menu.draw();

        rift.units.draw();

        rift.blocker_tiles.draw();

        if ( rift.selection.item !== undefined ){
            rift.selection.draw();
        }

		
		// First draw selection and then unit on top
        if ( rift.unit_selection.item !== undefined ){
            rift.unit_selection.draw();
            
            // Update Action Points
            rift.update_html("action-points", rift.unit_selection.item.action_points);

        }
        rift.workers.draw();

    };
}