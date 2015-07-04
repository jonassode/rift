// Constructor
rift.job = function(type, col, row){

    var object = {};

    object = new jaws.Sprite({x:col*rift.cell_size, y:row*rift.cell_size, scale: 1})
    object.started = false;
    object.type = type;
    object.col = col;
    object.row = row;

    var anim = new jaws.Animation({sprite_sheet: "images/job_default.png", frame_size: [rift.cell_size,rift.cell_size], frame_duration: 100})
    object.anim_default = anim.slice(0,1)
    object.anim_build = anim.slice(1,9)

    object.setImage( object.anim_default.next() );

    object.add = function(){
        rift.jobs.push(this);
    }

    object.die = function(){
        if ( this.worker ) {
            this.worker.stop_working();
        }
        rift.jobs.remove(this);
    }

    object.work = function(worker){
        object.type.work(this, worker);
    }

    object.start = function( worker ) {
        var goal = {col: this.col, row: this.row }

		if ( this.type.do_it(worker, goal) ){
            worker.job = this;
            this.worker = worker;
            this.started = true;
		}
    }

    return object;
};

// LIST OF JOBS BASED ON ID

// 1 - WALK
rift.JOB_WALK = {type: 1};
rift.JOB_WALK.work = function(job, worker){
    // Release the worker
    job.worker.state = rift.STATE_IDLE;
    // Remove myself from job list
    job.die();
}
rift.JOB_WALK.legal = function(job){
    if ( rift.tile_map.check(job.col, job.row, "blocking", false )){
        return true;
    } else {
        return false;
    }
}
rift.JOB_WALK.do_it = function(worker, goal){
    result = false;
	if ( worker !== undefined ) {
        var path = worker.find_path(goal);

        if ( path.length > 0 ){
            worker.set_path(path);
            worker.state = rift.STATE_WALKING;
			result = true;
        }
    }
	return result;
}


// 2 - BUILD
rift.JOB_BUILD = {type: 2};
rift.JOB_BUILD.work = function(job, worker){
    // Release the worker
    worker.state = rift.STATE_IDLE;
    // Kill Job
    job.die();
}
rift.JOB_BUILD.legal = function(job){
    if ( rift.tile_map.check(job.col, job.row, "blocking", false )){
        return true;
    } else {
        return false;
    }
}

// SHOOT
rift.JOB_SHOOT = {type: 3};
rift.JOB_SHOOT.work = function(job, worker){
    // Release the worker
    worker.state = rift.STATE_IDLE;
    // Kill Job
    job.die();
}
rift.JOB_SHOOT.legal = function(job){
    if ( rift.tile_map.check(job.col, job.row, "blocking", false )){
        return true;
    } else {
        return false;
    }
}
rift.JOB_SHOOT.do_it  = function(worker, goal){
	
	// To Do Check for Weapon and Ammo
	
	
	// Set State
    worker.state = rift.STATE_SHOOTING;
	
	// Return true to set job in motion
	// False if Weapon is out of ammo or no shootable weapon is available
	return true;
}



