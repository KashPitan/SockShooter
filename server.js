const Express = require("express");
const Socket = require("socket.io");
// const UUID = require("node-uuid");

const Dotenv = require("dotenv");
Dotenv.config();

const App = Express();

const Server = App.listen(process.env.PORT, function(){
    console.log("Listening on port " + process.env.PORT);
});

App.use(Express.static("public"));

var IO = Socket(Server);

//array of player objects
var players = {};

//function for creating a new player object
var Player = function(name){
  var self = {
    health: 3,
    name : name,
    x: 300,
    y: 300,
    projectiles :[]
  }
  return self;
}

//function for creating projectiles
var Projectile = function(id,x,y){
  var self = {
    id : id,
    x : x,
    y : y,
    speedx:0,
    speedy:0,
    angle:0,
  }
}

//functions to run when a user has made a connection
IO.on("connection", function(socket){
    console.log("socket connection made", socket.id);

    //when a new player message is sent
    socket.on("new player", function(data){
        console.log("new player added " + socket.id)
        //a new player is added to the array and spawned at coordinates below
        players[socket.id] = Player(data);
    });

    //when a movement message is received updates the players position
    socket.on("movement", function(data){
        var player = players[socket.id] || {};
        if (data.left) {
            player.x -= 2;
          }
          if (data.up) {
            player.y -= 2;
          }
          if (data.right) {
            player.x += 2;
          }
          if (data.down) {
            player.y += 2;
          }
          console.log(player.name,player.x,player.y)
    });

    //when the user sends a shoot message
    socket.on("shoot", function(){
      //only allows a bullet to be spawned if the user has spawned
      if(players[socket.id] != undefined){
        var player = players[socket.id];
        var bullet = Projectile(socket.id,player.x,player.y);
        player.projectiles.push(bullet);
        console.log("bullet");
      }else{
        console.log("spawn before shooting")
      }
    });

    //function that constantly runs to update stuff
    setInterval(function(){
        //constantly emits all the player data to all the other players
        IO.sockets.emit("state",players,projectiles);       
        // IO.sockets.emit("state",projectiles);
    },1000/60);

    //listens for "game events"
    socket.on("game",function(data){
        console.log(data,socket.id)
    });

    
    //removes the player from the array when they disconnect
    socket.on("disconnect",function(){
      delete players[socket.id];
    });
})

