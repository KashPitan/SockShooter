    export function leaderboard(players){
        // players.sort(compare);
        return players.concat().sort(compare);
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