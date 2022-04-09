
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

async function getPlayer(tag) {
    const config = { headers: {'Authorization': `Bearer ${process.env.API_KEY}`}};
    tag = tag.replace("#", "%23");
    const url = `https://api.clashroyale.com/v1/players/${tag}`;

    const res = axios.get(url, config)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error getting players from player tag" + error);
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
    //Sorting by donations recieved
    players = players.sort((a, b) => {
        return a.donationsRecieved - b.donationsRecieved;
        
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

// trophy only ranking for possible cross reference and graphs?
//let playerTrophyScores = new Map();
//          if so TODO - return final rankings as either an array of both rankings or as an object containing both.
//


// TODO create a function that will go through each player in a clan and return the overall favourite card 
// of the clan in case of ties highest trophy player gets their favourite card set as clan favourite

async function clanFavouriteCard(players){
    
    let favRank = [];
    
    {
        let playerPromises = [];
        let tag = 0;
        for(let i = 0; i < players.length; i++) {
            tag = players[i].tag;
            playerPromises[i] = getPlayer(tag);
        }

        for(let i = 0; i < playerPromises.length; i++) {
            let player = await playerPromises[i];
            favRank[i] = {playerTag: tag, favouriteCard: player.currentFavouriteCard.id, activityRank: i, favouriteCardName: player.currentFavouriteCard.name};
        }

    }


    favRank = favRank.sort((a,b) => {
        return a.favouriteCard - b.favouriteCard;
    });


    //let currentfavourite = 0;
    let count = 0;
    let value = 0;
    //let topfavouriteCard = 0;
    let topCount = 0;
    let topValue = 0;
    let favName = "";

    for(let j = 0; j < players.length; j++) {
        //console.log(`${favRank[j].favouriteCardName} -- ${j} -- ${favRank[j].activityRank}`);
        if(j == 0){
            currentfavourite = favRank[j].favouriteCard;
            count++;
            value += favRank[j].activityRank;
        } else if(favRank[j].favouriteCard == favRank[j - 1].favouriteCard){
            count++;
            value += favRank[j].activityRank;
        } else{
            if(count > topCount){
                topCount = count;
                topValue = value;
                favName = favRank[j-1].favouriteCardName;
                count = 1;
            } else if(count == topCount && value < topValue){
                topCount = count;
                topValue = value;
                favName = favRank[j-1].favouriteCardName;
                count = 1;
            } else{
                count = 1;
                value = favRank[j].activityRank;
            }      
            
            
        }
    }

    return favName;
}



// TODO use role in clan to recommend promotions / demotions;
//          if so determine requirements for rank change

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const clanTag = req.query.clanTag;
    try {
        let players = await getPlayers(clanTag);
        let favCard = await clanfavouriteCard(players);
        context.res = {
            body: {
                ranks: rankPlayers(players),
                favouriteCard: favCard
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