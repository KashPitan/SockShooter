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
  // for (var id in players) {
  //   var player = players[id];
  //   player.projectileUpdate();
  // }
  //constantly emits all the player and projectile data to all the other players
  IO.sockets.emit("state",players,projectiles);  
}


//updates projectile locations
function projectileUpdate(){
  projectiles.forEach(element => {
    // console.log(element);
    element.update();
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

    //game loop
    setInterval(function(){
      update();
    },1000/FPS);

    //when a new player message is sent
    socket.on("new player", function(data){
      //add a new player to the game
        players[socket.id] = Player(data,socket.id);
        // console.log("new player added " + socket.id)
    });

    //when a movement message is received updates the players position
    socket.on("movement", function(data){
      //if the user hasnt spawned in exit the function to prevent crashing
        if(players[socket.id]===undefined){
          return;
        }
        var player = players[socket.id] || {};

        //distance for player to be moved
        var xval = 0;
        var yval = 0;
        var moveDist = 2;        

        //if the user is pressing a direction key
        //then checks if user is at edge of map before updating location
          if (data.left) {
            if(player.location.x === 0){
              xval = 0;
            }else{
              xval += -moveDist;
            }
          }
          if (data.up) {
            if(player.location.y === 0){
              yval = 0;
            }else{
              yval += -moveDist;
            }
          }
          if (data.right) {
            if(player.location.x === 400){
              xval = 0;
            }else{
              xval += moveDist;
            }          
          }
          if (data.down) {
            if(player.location.y === 400){
              yval = 0;
            }else{
              yval += moveDist;
            }    
          }
          
          // console.log("before",xval,yval);
          if((xval && yval) != 0){
            xval *= 0.5;
            yval *= 0.5;
          }

          //updates player location
          player.location.x += xval;
          player.location.y += yval;
          // console.log(moveDist)
          // console.log(yval);
          // console.log(player.name,player.x,player.y)
    });

    //when the user sends a shoot message(receives mouse location as data)
    socket.on("shoot", function(data){
      //only allows a bullet to be spawned if the user has spawned
      if((players[socket.id] != undefined)){
        var player = players[socket.id];
        //creates a projectile and adds it to server side projectile array
        //only spawns a bullet if the player has less than 3 on screen already
        if(player.projectiles.length < 5){
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

