rift.STATE_IDLE = 0;
rift.STATE_WALKING = 1;
rift.STATE_BUILDING = 2;



rift.missile = function(x, y){
    var object = {};
        object = new jaws.Sprite({x:x, y:y, anchor:"center"})

    object.damage = 40;

        var anim = new jaws.Animation({sprite_sheet: "images/missile_plasma.png", frame_size: [11,11], frame_duration: 100})
        object.anim_default = anim.slice(0,3)
    object.anim_default.next()

    object.act = function(){
        this.setImage( this.anim_default.next() )
            this.y += 2

        var collisions = jaws.collideOneWithMany(object, rift.workers);
        if ( collisions.length > 0 ){
            var damage = this.damage;
            collisions.forEach(function(item){
                item.damage(damage);
            })
            this.die();
        }
        
        if ( this.y > (rift.tile_map.size[1] * rift.tile_map.cell_size[1]) ){
            this.die();
        }
    }

    object.die = function(){
        this.parent.missile = undefined;
        rift.units.remove(this);
    }

    return object;

}

rift.bar = function(x, y){
    var object = new jaws.Sprite({x:x, y:y});

    var anim = new jaws.Animation({sprite_sheet: "images/health_bar.png", frame_size: [32,4], frame_duration: 100})
    object.anim_default = anim.slice(0,10);
    object.setImage( object.anim_default.next() );

    object.update = function(percentage){

        var frame = 10 - Math.round(percentage/10);
        if ( frame < 0 ) { frame = 0; }
        if ( frame > 10 ) { frame = 10; }
        this.setImage(this.anim_default.frames[frame]);
    }

    return object;
}

rift.unit = function(x, y){
    var object = {};
    object = new jaws.Sprite({x:x, y:y})
    
    object.health = 100;
    object.bar = new rift.bar(x, y);

    rift.bars.push(object.bar);

    object.move = function(x, y) {
        // Increment X an Y        
        this.x += x
        this.y += y

        // Update Damage Bar
        this.bar.x = this.x;
        this.bar.y = this.y;
    }
    
    object.location = function(){
        return { row:this.row(), col:this.col() };
    }

    object.damage = function(damage){
        this.health -= damage;
        if ( this.health < 0 ){
            this.die();
            rift.bars.remove(this.bar);
            rift.bar = undefined;
        } else {
            this.bar.update(this.health);
        }
    }

    object.die = function(){
        this.list.remove(this);
    }

    return object;
}

rift.enemy = function(x, y){
    var object = new rift.unit(x,y);

        var anim = new jaws.Animation({sprite_sheet: "images/enemy_ball.png", frame_size: [32,32], frame_duration: 100})
        object.anim_default = anim.slice(0,5)
    object.setImage( object.anim_default.next() );

    object.list = rift.units;    
    object.missile = undefined;

    object.shoot = function(){
        object.missile = new rift.missile(this.x+(this.width/2),this.y+(this.height/2));
        object.missile.parent = this;
        rift.units.push(object.missile);
    }

    object.act = function(){
        this.setImage( this.anim_default.next() )
        if ( ! object.missile ){
            this.shoot();
        }
    }

    return object;
}


rift.robot = function(x, y){

    var object = new rift.unit(x,y);

    // Used for keeping track of actions, e.g. building stuff
    object.progress = 0;
    object.state = rift.STATE_IDLE;
    object.list = rift.workers;    

        var anim = new jaws.Animation({sprite_sheet: "images/ranger_32x32.png", frame_size: [32,32], frame_duration: 300})
        object.anim_default = anim.slice(0,5)
        object.anim_up = anim.slice(6,8)
        object.anim_down = anim.slice(8,10)
        object.anim_left = anim.slice(10,12)
        object.anim_right = anim.slice(12,14)
        object.anim_build = anim.slice(15,17)

        object.setImage( object.anim_default.next() );

    object.act = function(){
        switch(this.state)
        {
        case rift.STATE_IDLE:
          this.idle();
          break;
        case rift.STATE_WALKING:
          this.walk();
          break;
        case rift.STATE_BUILDING:
          this.build();
          break;
        default:
          jaws.log("ROBOT IN UNKNWON STATE! " + worker.state);
        }
    }

    object.col = function(){
        return getTileNoFromCord(this.rect().x);
    }

    object.row = function(){
        return getTileNoFromCord(this.rect().y);
    }

    object.calculate_line_of_sight = function(){
        alert(1);

        var matrix = exportTileMapToPathMatrix();

    }
    
    object.find_path = function(goal){

        var matrix = exportTileMapToPathMatrix();
        var start = {col: this.col(), row: this.row() }

        matrix[start.row][start.col] = 1;

        var path = jspath.find_path(matrix, start, goal);
        return path;
    }

    object.set_path = function(path){
        this.path = path;
        if ( path != undefined ){
            this.path_index = path.length-2;
        } else {
            this.path_index = undefined;
        }
    }

    object.stop_working = function(){
        this.set_path(undefined);
        this.state = rift.STATE_IDLE;
        this.job.started = false;
        this.job = undefined;
        this.progress = 0;
    }

    object.walk = function(){
        if ( this.state == rift.STATE_WALKING ){
            if ( this.path_index < 0 ){
                this.set_path(path);
                this.job.work(this);
            } else {
                var next_cell = this.path[this.path_index];

                if ( rift.tile_map.check(next_cell.col, next_cell.row, "blocking", true)) {
                    var goal = {col: this.job.col, row: this.job.row }
                    var path = this.find_path(goal);
                    if ( path.length > 0 ){
                        this.set_path(path);
                    } else {
                        // Stop working
                        this.stop_working();
                    }
                }
            }

            if ( this.path != undefined ) {
                var x = this.rect().x;
                var y = this.rect().y;
                var next_x = next_cell.col * rift.cell_size
                var next_y = next_cell.row * rift.cell_size

                var direction;

                if ( next_x > x ) { direction = "right" }
                if ( next_x < x ) { direction = "left" }
                if ( next_y < y ) { direction = "up" }
                if ( next_y > y ) { direction = "down" }

                if(direction === "left"  ) { this.move(-1,0);  this.setImage(this.anim_left.next()) }
                if(direction === "right" ) { this.move(1,0);   this.setImage(this.anim_right.next()) }
                if(direction === "up"    ) { this.move(0, -1); this.setImage(this.anim_up.next()) }
                if(direction === "down"  ) { this.move(0, 1);  this.setImage(this.anim_down.next()) }

                // If we are at the next square index.
                // Update index
                if ( next_x === x && next_y === y ){
                    calculate_line_of_sight()
                    this.path_index--;
                }
            }
        }
    }

    object.idle = function(){
        this.setImage( this.anim_default.next() )
    }

    object.build = function(){
            this.setImage( this.anim_build.next() )
        this.progress++;
        if ( this.progress % 10 === 0 ){
            this.job.setImage( this.job.anim_build.next() )
        }
        if ( this.progress == 70 ){
            var building = rift.building(this.job.target, this.job.col, this.job.row);
            rift.buildings.push(building);
            rift.tile_map.push(building);
            this.job.die();
        }
    }

    return object;
};

