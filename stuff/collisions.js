

module.exports = function(players,projectiles){
    projectiles.forEach(projectile => {
            for (const id in players) {
                var player = players[id];
                //only other players bullets can hurt you
                if(projectile.id != player.socketId){
                    //if the projectile collides with a live player
                    if(collide(projectile,player) && player.alive){
                        //decrement player health when hit and remove projectile from array
                        player.health--;
                        player.changeColourRandom();
                        projectiles.splice(projectiles.indexOf(projectile),1);

                        //deletes the projectile from the array on the player who shot it
                        var index2 = players[projectile.id].projectiles.indexOf(projectile);
                        players[projectile.id].projectiles.splice(index2,1)

                        //if the player being shot has no more health
                        if(player.health === 0){
                            //add a kill to the player who shot them
                            players[projectile.id].kills++;
                            //add a death to killed player
                            player.deaths++;
                            player.alive = false;
                            // delete players[player.socketId];
                        }

                    }else{
                        // console.log("no collision");
                    }
                }
            }
        
    });
}

function collide(projectile,player){
    //vector for distance between radii
    var radiiVector = {
        x: projectile.location.x - player.location.x,
        y: projectile.location.y - player.location.y
    }

    //pythagoras to find distance between radii of player and projectile
    var distBetweenRadii = Math.sqrt((radiiVector.x ** 2)+ (radiiVector.y **2));
    //hardcoded for now, bullet radii = 5, player radii = 10
    var sumOfRadii = 5 + 10;

    /**
     * if the distance between the radii of the objects
     * is less than the sum of the radii they collide
     * return true in this case
     */
    if(distBetweenRadii <= sumOfRadii){
        return true;
    }else{
        return false;
    }
    
}
