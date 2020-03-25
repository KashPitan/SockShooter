const Projectile = require("./projectile");
//function for creating a new player object
var Player = function(name,socketId){
    var self = {
      socketId: socketId,
      health: 3,
      name : name,
      location:{x:300,y:300},
      projectiles :[],
      //creates a projectile
      shoot: function(destination){
        if(this.projectiles.length < 3){
          
          var projectile = Projectile(this.socketId,
            this.location,this.calcProjectileVector(destination));
          
          this.projectiles.push(projectile);
        }
      },
      //function for normalising vector of projectile
      calcProjectileVector(destination){
        var vector = {
          x: destination.x - this.location.x,
          y: destination.y - this.location.y
        }
        //pythagoras to find out vector length
        var vectorLength = Math.sqrt((vector.x ** 2)+ (vector.y **2));
        //normalise vector created earlier
        var updateVector = {
          x: vector.x/vectorLength,
          y: vector.y/vectorLength
        }
        return updateVector
      },
      //update projectile position so they fly
      projectileUpdate: function(){
        this.projectiles.forEach(element => {
          element.update();
          if(((element.location.x || element.location.y) < 0)
            || ((element.location.x || element.location.y) > 400)){
              var index = this.projectiles.indexOf(element);
              this.projectiles.splice(index,1);
              console.log("projectile deleted")
          }
        });
      }
    }
    return self;
  }

  module.exports = Player;