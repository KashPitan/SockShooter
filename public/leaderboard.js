var leaderboard = document.getElementById("leaderboard");

//array for storing the top 5 killers
var topKills = [];

export function leaderboardFunction(players){  
    var arr = [];
    var leaderboardHtml = "";
    // console.log(playersList[0]);
    // console.log(playersList[1]);
  
    for (var id in players) {
      var player = players[id];
      arr.push(player);
    }
    console.log(arr);
    if(arr.length>1){
      topKills = arr.sort(compare);
      // console.log(topKills);
       //string to print top 5 players
      for(i = 0;i<arr.length;i++){
        leaderboardHtml += "<li>" + topKills[i].name + " Kills: " + topKills[i].kills + " Deaths: " + topKills[i].deaths + "<li>";   
      }
    }
    leaderboard.innerHTML = leaderboardHtml;
  }
  
  function compare(a,b){
    var playerKillsA = a.kills;
    var playerKillsB = b.kills;
    if(playerKillsA > playerKillsB){
        return -1;
    }
    if(playerKillsB > playerKillsA){
        return 1;
    }
    return 0;
  }