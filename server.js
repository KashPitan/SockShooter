const Express = require("express");
const Socket = require("socket.io");
// const UUID = require("node-uuid");

const Dotenv = require("dotenv");
Dotenv.config();

const Projectile = require("./stuff/projectile");
const Player = require("./stuff/player");
const Movement = require("./stuff/movement");

// const SharedConsts = require("./shared/constants");
const Collisions = require("./stuff/collisions");

const App = Express();

const Server = App.listen(process.env.PORT, function(){
    console.log("Listening on port " + process.env.PORT);
});

App.use(Express.static("public"));

var IO = Socket(Server);

//updates per ssecond
var FPS = 30;

//array of player objects
var players = {};
var projectiles = [];
// var projectiles2 = new Map();

//function to call for updating game state
function update(){
  projectileUpdate();
  Collisions(players,projectiles);
  //constantly emits all the player and projectile data to all the other players
  IO.sockets.emit("state",players,projectiles);  
}

//For setting random Colour of user(maybe move to player class)
function getRandomColour(){
  var red = Math.floor(Math.random()* 255);
  var green = Math.floor(Math.random() * 255);
  var blue = Math.floor(Math.random() * 255);

  return "rgb("+red+","+green+"," +blue+" )";  
};

//updates projectile locations
function projectileUpdate(){
  projectiles.forEach(element => {
    // console.log(element);
    element.update();
    //checks whether projectile collides with edge of map
    if((element.location.x < 0 || element.location.y < 0)
    || (element.location.x > 400 || element.location.y > 400)){
      //index of element in array on server
      var index = projectiles.indexOf(element);
      projectiles.splice(index,1);     
      // console.log(element.projectileId);

      //index of element in array on player object
      var index2 = players[element.id].projectiles.indexOf(element);
      players[element.id].projectiles.splice(index2,1)
      
    } 
  });
}

//functions to run when a user has made a connection
IO.on("connection", function(socket){
    console.log("socket connection made", socket.id);
    //create player upon connection
    players[socket.id] = Player("",socket.id,getRandomColour());

    //game loop
    setInterval(function(){
      update();
    },1000/FPS);

    //when a new player message is sent
    socket.on("spawn", function(data){
      //add a new player to the game
        players[socket.id].name = data;
        players[socket.id].respawn();
        // console.log("new player added " + socket.id)
    });

    //when a movement message is received updates the players position
    socket.on("movement", function(data){
      //if the user hasnt spawned in exit the function to prevent crashing
        if((players[socket.id]===undefined)|| !players[socket.id].alive){
          return;
        }
        var player = players[socket.id] || {};

        //distance for player to be moved
        var xval = 0;
        var yval = 0;
        //basically velocity?
        var moveDist = 6;        

        //if the user is pressing a direction key
        //then checks if user is at edge of map before updating location
          if (data.left) {
            xval += -moveDist;
          }
          if (data.up) {
            yval += -moveDist;
          }
          if (data.right) {
            xval += moveDist;       
          }
          if (data.down) {
            yval += moveDist;  
          }
          
          //use normalised vectors to even out diagonal movement speed
          function normaliseMovement(){
            var vector = {
              x: xval,
              y: yval
            }
            //pythagoras to find out vector length
            var vectorLength = Math.sqrt((vector.x ** 2)+ (vector.y **2));
            //normalise vector created earlier
            xval = vector.x/vectorLength;
            yval = vector.y/vectorLength;

            //returns 0 if value is NaN (when opposing directions are pressed)
            xval = (xval * moveDist) || 0;
            yval = (yval * moveDist) || 0;
            // console.log(xval,yval);
          }

          //my own "algorithm" to even out diagonal movement speed
          function normaliseMovement2(){
            if((xval && yval) != 0){
              xval *= 0.5;
              yval *= 0.5;
            }
            //temporary fix for input speed stacking issue
            if(data.left && data.right){
              yval *= 0.5;
              // console.log(xval,yval);
            }
          }

          normaliseMovement2();

          //collision detection for edge of map(hardcoded for now)
          function mapEdgeCollision(){
            if(((player.location.x + xval) <= 0) || ((player.location.x + xval) >= 400)){
              console.log("off x");
              xval = 0;
            }
            if(((player.location.y + yval) >= 400) || ((player.location.y + yval) <= 0)){
              console.log("off y");
              yval = 0;
            }    
          }          
          mapEdgeCollision();
          //updates player location
          player.location.x += xval;
          player.location.y += yval;
          
    });

    //when the user sends a shoot message(receives mouse location as data)
    socket.on("shoot", function(data){
      //only allows a bullet to be spawned if the user has spawned
      if((players[socket.id] != undefined)
       && players[socket.id].alive){
        var player = players[socket.id];
        //creates a projectile and adds it to server side projectile array
        //only spawns a bullet if the player has less than 3 on screen already
        console.log(players[socket.id].alive);
        if(player.projectiles.length < 4){
          projectiles.push(player.shoot(data));
          // console.log("spawning projectile");
          // console.log(projectiles);
        }
      }else{
        console.log("spawn before shooting")
      }
    });

    //listens for "game events"
    socket.on("game",function(data){
        console.log(data,socket.id)
    });

    //removes the player from the array when they disconnect
    socket.on("disconnect",function(){
      delete players[socket.id];
    });
})

