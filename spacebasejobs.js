rift.JOB_WALK = {type: 1};

rift.JOB_WALK.work = function(job, worker){
    // Release the worker
    worker.state = rift.STATE_IDLE;
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

rift.JOB_BUILD = {type: 2};
rift.JOB_BUILD.work = function(job, worker){
    // Release the worker
    worker.state = rift.STATE_BUILDING;
    // Change image
    job.setImage( job.anim_build.next() )
}
rift.JOB_BUILD.legal = function(job){
    if ( rift.tile_map.check(job.col, job.row, "blocking", false )){
        return true;
    } else {
        return false;
    }
}

rift.job = function(type, target, col, row){

    var object = {};

    object = new jaws.Sprite({x:col*rift.cell_size, y:row*rift.cell_size, scale: 1})
    object.started = false;
    object.type = type;
    object.col = col;
    object.row = row;
    object.target = target;

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

    object.start = function() {
        var goal = {col: this.col, row: this.row }
        var worker = getAvailableWorker(goal);

        if ( worker !== undefined ) {
            var path = worker.find_path(goal);

            if ( path.length > 0 ){
                worker.set_path(path);
                worker.state = rift.STATE_WALKING;
                worker.job = this;
                this.worker = worker;
                this.started = true;
            }
        }
    }

    return object;
};

