
const axios = require('axios');

async function getPlayers(clanTag) {
    const config = { headers: {'Authorization': `Bearer ${process.env.API_KEY}`}};
    const url = `https://api.clashroyale.com/v1/clans/%23${clanTag}/members`;
    const res = axios.get(url, config)
        .then(response => {
            return response.data.items;
        })
        .catch(error => {
            throw("Error getting players from clan: " + error);
        });
    return res;
}

function rankPlayers(players) {
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

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const clanTag = req.query.clanTag;
    try {
        let players = await getPlayers(clanTag);
        context.res = {
            body: {
                ranks: rankPlayers(players),
            }
        };
    } catch(e) {
        console.error(e);
        context.res = {
            status: 500,
            body: "Failed to get clan data."
        }
    }
}