
// Used to hold the selection in the menu
rift.selection

// The Menu Object
rift.menu = function(x, y){

    rift.selection = new Sprite({image: "images/button__selector.png" });

    var object = {};
        object = new jaws.SpriteList()
    object.x = x;
    object.y = y;
    object.items = 0;

    object.add = function(item, jobtype, target){
        item.x = this.x + (rift.cell_size * this.items);
        item.y = this.y;
        item.target = target;    
        item.jobtype = jobtype;
        this.items++;
        this.push(item);

    }

    object.select_item = function(x,y){
        this.forEach(function(item){

            if ( x >= item.x && x <= (item.x + item.width) && y >= item.y && y <= (item.y + item.height) ){
                rift.selection.item = item;
                rift.selection.x = item.x;
                rift.selection.y = item.y;
            }
        })
    }
    
    return object;
};

