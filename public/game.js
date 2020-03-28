
var socket = io.connect();

//document elements
var joinButton = document.getElementById("joinButton");
var nameInput = document.getElementById("nameInput");
var canvas = document.getElementById("canvas");

var userName;
var mousePos;
var playerTable = document.createElement("table");
//failed attempt at a shared constants file between client and server
// const SharedConsts = require("../shared/constants");

//adds the player stats html element
var playerStats = document.createElement("p");

//store individual player stats
var kills;
var deaths;

//array for storing the top 5 killers
var topKills = [];

// import leadboard, { leaderboard } from "./leaderboard";

function leaderboard(...players){
  // players.sort(compare);
  return players.sort(compare);
}

function compare(a,b){
  var playerKillsA = a.kills;
  var playersKillsB = b.kills;
  if(playersKillsA > playersKillsB){
      return 1;
  }
  if(playersKillsB > playersKillsA){
      return -1;
  }
  return 0;
}

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = true;
        break;
      case 87: // W
        movement.up = true;
        break;
      case 68: // D
        movement.right = true;
        break;
      case 83: // S
        movement.down = true;
        break;
    }
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});

document.addEventListener("mousemove",function(event){
  mousePos = getMousePos(canvas,event);
  //console.log(mousePos);
});


//shoot a bullet when the spacebar is pressed
document.addEventListener("keydown", function(event){
  if(event.keyCode === 32 ){
    socket.emit("shoot", mousePos);
  }
});

//add a new player when join button is clicked
joinButton.addEventListener("click", function(){
  userName = nameInput.value;
  console.log(userName);
    if(userName === ""){
      userName = "anon"
    }
  //sends message to server down new player path
  socket.emit("spawn",userName);
  
  joinButton.blur();
  //clears name input field once username has been entered
  nameInput.value = "";
});
 
  //output key inputs to console
setInterval(function(){
    for (const key in movement) {
        if(movement[key] === true){
            socket.emit("movement", movement);
        }
    }
},1000/30);

//listening for game messages
socket.on("game",function(data){
    // console.log(data);
});
var socketId;
socket.on("connect",function(){
  socketId = socket.id;
  console.log(socketId);
});

//creates the canvas using the html element
canvas.width = 400;
canvas.height = 400;

// var row = playerTable.insertRow();
// var cell = row.insertCell();

//creates a drawing object
var context = canvas.getContext("2d");

/*whenever a state message is receieved from the server
updates the whole canvas*/
socket.on("state", function(players,projectiles){
  
  //context.  draws stuff to canvas
  //this clears the canvas within the given coordinates before the next update
  context.clearRect(0,0,400,400);
  
  //draw each projectile the player has spawned
  projectiles.forEach(element => {
    context.fillStyle = players[element.id].colour;
    context.beginPath();
    context.arc(element.location.x,element.location.y,5,0,2*Math.PI);
    context.fill();
    // context.stroke();
});
  //updates all player locations
  for (var id in players) {
    var player = players[id];
    if(player.alive){
      context.fillStyle = player.colour;
      //simply put this creates a circle
      context.beginPath();
      context.arc(player.location.x,player.location.y,10,0,2*Math.PI);
      context.fill();

      //player name centered
      context.fillStyle = "black"
      context.fillText(player.name + " (" + player.health + ")",player.location.x-player.name.length*2.5,player.location.y-12);
    }
    
  }
  // var node = "kills " + players[socketId].kills
  // + " deaths"  + players[socketId].deaths;
  // playerStats.
  // topKills = leaderboard(players);
  // console.log(topKills);

  document.getElementById("playerStats").innerHTML = "Kills: " + players[socketId].kills
   + " Deaths: "  + players[socketId].deaths;  
})
