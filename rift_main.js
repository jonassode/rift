function Main() {
    var fps

    // Setup Workers
    rift.workers.push(new rift.robot(0,128))
    rift.action_menu = rift.menu(641, 0);

    /* Called once when a game state is activated. Use it for one-time setup code. */
    this.setup = function() {
        fps = document.getElementById("fps")
        
        var tilemap_width = 20;
        var tilemap_height = 15;
        rift.cell_size = 32;

        // Get some Random terrain
        for ( var j = 0; j < tilemap_height; j++){
            for ( var i = 0; i <tilemap_width; i++){
                var x = i*rift.cell_size;
                var y = j*rift.cell_size;

                if ( Math.floor((Math.random()*10)+1) > 8 && x != 0 ){
                    rift.blocks.push( new Sprite({image: "images/block.png", x: x, y: y, blocking: true }) )
                } else {
                    rift.blocks.push( new Sprite({image: "images/dirt.png", x: x, y: y, blocking: false}) )
                }
            }
        }

        rift.action_menu.add( new Sprite({image: "images/button_walk.png" }), rift.JOB_BUILD, "floor");
        rift.action_menu.add( new Sprite({image: "images/button_wall.png" }), rift.JOB_BUILD, "wall");
        rift.action_menu.add( new Sprite({image: "images/button_solarpanel.png" }), rift.JOB_BUILD, "solarpanel");
        rift.action_menu.add( new Sprite({image: "images/button_end_turn.png" }), rift.END_TURN, "end_turn");

        // A tilemap, each cell is 32x32 pixels. There's 10 such cells across and 10 downwards.
        rift.tile_map = new jaws.TileMap({size: [tilemap_width,tilemap_height], cell_size: [32,32], scale: 0.5})

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
        }

        rift.tile_map.job = function(col, row){
            var found_job;
            rift.jobs.forEach(function(item){
                if ( item.col == col && item.row == row ){
                    found_job = item;
                }
            });
            return found_job;
        }

        rift.tile_map.find_free_neighbour = function(col, row){
            var y;
            $.each(directions, function(){
                var xrow = row + this.row;
                var xcol = col + this.col;
                if ( xcol >= 0 && xrow >= 0 && rift.tile_map.check(xcol, xrow, "blocking", false) ){
                    y = {row:xrow, col:xcol}
                }
            });
            return y;
        }

        // Fit all items in array blocks into correct cells in the tilemap
        // Later on we can look them up really fast (see player.move)
        rift.tile_map.push(rift.blocks)

        jaws.context.mozImageSmoothingEnabled = false;  // non-blurry, blocky retro scaling
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);

        // For Debugging
        jaws.on_keydown("r", function(){rift.workers.push(new rift.robot(0,0))})
        jaws.on_keydown("e", function(){rift.units.push(new rift.enemy(0,0))})
        
        // Activate line of sight
        calculate_line_of_sight();
    }

    /* update() will get called each game tick with your specified FPS. Put game logic here. */
    this.update = function() {

        rift.workers.forEach(function(worker){
            worker.act();
        });

        rift.units.forEach(function(unit){
            unit.act();
        });

        rift.jobs.forEach(function(job){
            // Start job
            if ( job.started == false ) {
                // Only look at the jobs if there are at least one available worker
                if ( getAvailableWorker() != undefined ){
                    job.start();
                }
            }
        });

        //jaws.forceInsideCanvas(player)
        fps.innerHTML = jaws.game_loop.fps
    }

    /* Directly after each update draw() will be called. Put all your on-screen operations here. */
    this.draw = function() {
        jaws.clear()
        rift.blocks.draw()
        rift.buildings.draw()
        rift.jobs.draw()
        // Disabling bars until we need them again
        //rift.bars.draw()
        rift.workers.draw()
        rift.units.draw()
        rift.action_menu.draw()
        rift.blocker_tiles.draw()

        if ( rift.selection.item != undefined ){
            rift.selection.draw();
        }
    }
}