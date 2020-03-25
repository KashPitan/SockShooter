
var socket = io.connect();

//document elements
var joinButton = document.getElementById("joinButton");
var nameInput = document.getElementById("nameInput");
var canvas = document.getElementById("canvas");

var userName;
var mousePos;
//failed attempt at a shared constatns file between client and server
// const SharedConsts = require("../shared/constants");


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
  // console.log(mousePos);
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
    socket.emit("new player",userName);
    
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
},1000/60);

//listening for game messages
socket.on("game",function(data){
    // console.log(data);
})

//creates the canvas using the html element
canvas.width = 400;
canvas.height = 400;

//creates a drawing object
var context = canvas.getContext("2d");

/*whenever a state message is receieved from the server
updates the whole canvas*/
socket.on("state", function(players){
    
    //context.  draws stuff to canvas

    //this clears the canvas within the given coordinates
    context.clearRect(0,0,400,400);

    //colour to fill objects on the canvas
    context.fillStyle = "blue";

    //loop used to draw each player to the canvas
    for (var id in players) {
        var player = players[id];
        // console.log(player.projectiles);

        //draw each projectile the player has spawned
        player.projectiles.forEach(element => {
            context.beginPath();
            context.arc(element.location.x,element.location.y,5,0,2*Math.PI);
            context.fill();
            // context.stroke();
        });

        //simply put this creates a circle
        context.beginPath();
        context.arc(player.location.x,player.location.y,10,0,2*Math.PI);
        context.fill();
        context.fillText(player.name,player.location.x-10,player.location.y-12);
    }
    
})
