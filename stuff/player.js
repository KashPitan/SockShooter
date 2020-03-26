const Projectile = require("./projectile");
//function for creating a new player object
var Player = function(name,socketId){
    var self = {
      socketId: socketId,
      health: 3,
      name : name,
      alive: false,
      location:{
        x:Math.floor(Math.random()*400)+1,
        y:Math.floor(Math.random()*400)+1
      },
      projectiles :[],
      kills: 0,
      deaths: 0,
      //creates a projectile
      shoot: function(destination){
        var projectile = Projectile(this.socketId,
          this.location,
          this.calcProjectileVector(destination),
          this.projectiles.length);
        
        this.projectiles.push(projectile);
        // console.log(projectile);
        return projectile;
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
      // projectileUpdate: function(){
      //   this.projectiles.forEach(element => {
      //     element.update();
      //     if((element.location.x < 0 || element.location.y < 0)
      //       || (element.location.x > 400 || element.location.y > 400)){
      //         var index = this.projectiles.indexOf(element);
      //         this.projectiles.splice(index,1);
      //     }
      //   });
      // }
    }
    return self;
  }

  module.exports = Player;