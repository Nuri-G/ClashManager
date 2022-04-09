const fs = require('fs');
const axios = require('axios');


async function getPlayers(apiKey, clanTag) {
    const config = { headers: {'Authorization': `Bearer ${apiKey}`}};
    const url = `https://api.clashroyale.com/v1/clans/${clanTag}/members`;
    const res = axios.get(url, config)
        .then(response => {
            return response.data.items;
        })
        .catch(error => {
            console.error("Error getting players from clan: " + error);
        });
    return res;
}

async function rankPlayers(players) {
    let playerScores = new Map();
    //Default sorted by trophies
    for(let i = 0; i < players.length; i++) {
        let player = players[i];
        playerScores.set(player.tag, {name: player.name, score: i});
    }

    //Sorting by donations
    players = players.sort((a, b) => {
        return b.donations - a.donations;
    });
    for(let i = 0; i < players.length; i++) {
        let player = players[i];
        // console.log(player.donations);
        playerScores.get(player.tag).score += i;
    }

    //Sorting by lastSeen
    players = players.sort((a, b) => {
        if(a.lastSeen >= b.lastSeen) {
            return -1;
        } else {
            return 1;
        }
    });
    for(let i = 0; i < players.length; i++) {
        let player = players[i];
        playerScores.get(player.tag).score += i;
    }

    //Sorting final rankings
    let finalRanks = [...playerScores.entries()].sort((a, b) => {
        return a[1].score - b[1].score;
    });
    return finalRanks;
}


// TODO - Dehardcode clan tag --- Will it come from ui or from a file?
// Also need to handle players no longer in clan
async function main() {
    const apiKey = fs.readFileSync("./token.txt").toString();

    let ranksOverTime = new Map();

    getPlayers(apiKey, "%239YQQQ98")
        .then(players => {
            rankPlayers(players).then(finalRanks => {
                for(let i = 0; i < finalRanks.length; i++) {
                    let player = finalRanks[i]; //This not done!!
                }
                for(let player of finalRanks) {
                    console.log(player);
                }
            });
        })
        .catch(error => {
            console.error(error);
        });
}

if (require.main === module) {
    main();
}