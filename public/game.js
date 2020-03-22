
var socket = io.connect();

//document elements
var joinButton = document.getElementById("joinButton");
var nameInput = document.getElementById("nameInput");
var userName;


var movement = {
    up: false,
    down: false,
    left: false,
    right: false
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
  
  //shoot a bullet when the spacebar is pressed
  document.addEventListener("keydown", function(event){
    if(event.keyCode === 32 ){
        socket.emit("shoot");
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
            // console.log(key)
            // socket.emit("game", key);
            socket.emit("movement", movement);
        }
    }
},1000/60);

//listening for game messages
socket.on("game",function(data){
    // console.log(data);
})

//creates the canvas using the html element
var canvas = document.getElementById("canvas");
canvas.width = 400;
canvas.height = 400;

//creates a drawing object
var context = canvas.getContext("2d");

/*whenever a state message is receieved from the server
updates the whole canvas*/
socket.on("state", function(players,projectiles){
    
    //context.  draws stuff to canvas

    //this clears the canvas within the given coordinates
    context.clearRect(0,0,400,400);

    //colour to fill objects on the canvas
    context.fillStyle = "blue";

    //loop used to draw each player to the canvas
    for (var id in players) {
        var player = players[id];
        context.beginPath();

        //simply put this creates a circle
        context.arc(player.x,player.y,10,0,2*Math.PI);
        context.fill();
        context.fillText(player.name,player.x-10,player.y-12);
    }
    console.log(projectiles);
    // console.log(players);
    projectiles.forEach(element => {
        console.log("project");
        // var projectile = projectiles[id];
        context.beginPath();
        context.arc(element.x,element.y,10,0,2*Math.PI);
        context.fill();
    });
    
    for(var id in projectiles){
        var projectile = projectiles[id];
        context.beginPath();
        context.arc(projectile.x,projectile.y,10,0,2*Math.PI);
        context.fill();
        // context.fillText(player.name,player.x-10,player.y-12);
    }
})
