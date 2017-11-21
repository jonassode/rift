rift.turn = 1;

rift.end_turn = function(){
    
    // Alien & Civilian AI
    
    rift.turn += 1;
    
    rift.workers.forEach(function(worker){
        worker.reset_action_points();
    });
    
     // Update Turn
    rift.update_html("turn",rift.turn);
    
    alert('new turn');  
};

