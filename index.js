
  // Returns the selected worker
  function getSelectedWorker( ){
      return rift.selected_worker;
  }

  // Checks if we are clicking anywhere within the tilemap
  function withinTileMap( col, row ){

        if ( col >= 0 && col < rift.tile_map.size[0] && row >= 0 && row < rift.tile_map.size[1] ){
            return true;
        } else {
            return false;
        }
    }

    // This is called when you add a new job, you will delete all old ongoing jobs.
    // Likely I can 
	function deleteJobs( worker ){
        rift.jobs.forEach(function(job){
            // delete job
			if ( job.worker == worker){
				job.die();
			}
        });		
	}

    // Called when we click anywhere on the canvas
	function clickTile(){
        // Get Coordinates
        var col = getTileNoFromCord(jaws.mouse_x);
        var row = getTileNoFromCord(jaws.mouse_y);

        // Check for TileMap
        if ( withinTileMap(col, row)){
			// Check for Unit
			var unit = rift.tile_map.unit(col, row);
			if ( unit ) {
				unit.select_item();
			} else {
				// Create Job
				createJob(col, row);
			}
			
		} else {
        	// Check click for menu.
        	rift.action_menu.select_item(jaws.mouse_x, jaws.mouse_y);
    	}
	}

    // Creates a new job
    function createJob(col, row){

            // Check if there is a job at this place.
            var job = rift.tile_map.job(col, row);
            
            // Job exists on this place we remove it
            if ( job ){
				job.die();
            // Else we create one
            } else if ( rift.selection.item && getSelectedWorker() !== undefined ){
				
                // Only create a job if we have action points left
                var worker = getSelectedWorker();
                
                if ( worker.action_points > 0 ){
                    addJob( rift.job(rift.selection.item.jobtype, col, row), worker);
                } else {
                    alert('not enough action points!');
                }
            }
    }
	
	function addJob(job, worker){
        // Add Job to jobs list
        if ( job.type.legal(job) ){
            job.add();
			// Kill other jobs
			deleteJobs( worker );
			// Start job
			job.start( worker );
        }		
	}

    function getTileNoFromCord(cord){
        return Math.floor(cord / rift.tile_map.cell_size[0]);
    }

    function exportTileMapToPathMatrix(){
        var cols = rift.tile_map.size[0];
        var rows = rift.tile_map.size[1];
        var matrix = jspath.create_matrix(rows,cols);
        //Todo remove this line
        //var cell_size = rift.tile_map.cell_size[0];

        for( row = 0; row < matrix.length; row++) {
            for( col = 0; col < matrix[row].length; col++) {
                // Set it to walkable ( 1 ) by default
                matrix[row][col] = 1;            
                
                if ( rift.tile_map.check(col,row, "blocking", true)) {
                    matrix[row][col] = 0;
                }
            }
        }
        return matrix;
    }
    
