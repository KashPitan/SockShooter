const Express = require("express");
const Socket = require("socket.io");
// const UUID = require("node-uuid");

const Dotenv = require("dotenv");
Dotenv.config();

const Projectile = require("./stuff/projectile");
const Player = require("./stuff/player");
const Movement = require("./stuff/movement");

const SharedConsts = require("./shared/constants");

const App = Express();

const Server = App.listen(process.env.PORT, function(){
    console.log("Listening on port " + process.env.PORT);
});

App.use(Express.static("public"));

var IO = Socket(Server);

var FPS = 30;

//function to call for updating game state
function update(){
  
  for (var id in players) {
    var player = players[id];
    player.projectileUpdate();
  }
  //constantly emits all the player data to all the other players
  IO.sockets.emit("state",players);  
}

//array of player objects
var players = {};

//functions to run when a user has made a connection
IO.on("connection", function(socket){
    console.log("socket connection made", socket.id);

    //game loop
    setInterval(function(){
      update();
    },1000/FPS);

    //when a new player message is sent
    socket.on("new player", function(data){
        players[socket.id] = Player(data,socket.id);
        // console.log("new player added " + socket.id)
        //a new player is added to the array and spawned at coordinates below
    });

    //when a movement message is received updates the players position
    socket.on("movement", function(data){
        var player = players[socket.id] || {};

        //distance for player to be moved
        var xval = 0;
        var yval = 0;
        var moveDist = 2;        
        
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
         player.shoot(data);
         console.log(player.location);
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

