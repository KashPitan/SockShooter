const Projectile = require("./projectile");
//function for creating a new player object
var Player = function(name,socketId,colour){
    var self = {
      socketId: socketId,
      health: 3,
      name : name,
      maxShots: 3,
      alive: false,
      colour: colour,
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
      changeColourRandom(){  
        var red = Math.floor(Math.random()* 255);
        var green = Math.floor(Math.random() * 255);
        var blue = Math.floor(Math.random() * 255);
      
        this.colour = "rgb("+red+","+green+"," +blue+" )";  
      },
      //needed?
      respawn(){
        this.location = {
          x:Math.floor(Math.random()*400)+1,
          y:Math.floor(Math.random()*400)+1
        }
        this.health = 3; 
        this.alive = true;
      }
    }
    return self;
  }

  module.exports = Player;