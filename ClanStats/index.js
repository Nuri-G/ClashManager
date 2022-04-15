
const axios = require('axios');

async function getClan(clanTag) {
    const config = { headers: {'Authorization': `Bearer ${process.env.API_KEY}`}};
    const url = `https://api.clashroyale.com/v1/clans/%23${clanTag}`;
    const res = axios.get(url, config)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error getting players from clan: " + clanTag);
            throw error;
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
            console.error("Error getting players from player tag: " + tag);
            throw error;
        });
    return res;
}

function scorePlayers(players) {
    let playerScores = {};
    //Default sorted by trophies
    for(let i = 0; i < players.length; i++) {
        let player = players[i];

        playerScores[player.tag] = {name: player.name, role: player.role, scores: {trophies: i, donationsSent: 0, donationsReceived: 0, lastSeen: 0}};
    }
    players
    //Sorting by donations
    players = players.sort((a, b) => {
        return b.donations - a.donations;
    });
    for(let i = 0; i < players.length; i++) {
        let player = players[i];
        playerScores[player.tag].scores.donationsSent += i;
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
        playerScores[player.tag].scores.lastSeen += i;
    }
    //Sorting by donations recieved
    players = players.sort((a, b) => {
        if(a.donationsReceived < b.donationsReceived){
            return 1;
        } else{
            return -1;
        };
        
    });
    for(let i = 0; i < players.length; i++) {

        let player = players[i];
        
        playerScores[player.tag].scores.donationsReceived += i;
    }
    return playerScores;
}

async function clanFavouriteCard(players){
    
    let favRank = [];
    let favImage = "";
    {
        let playerPromises = [];
        let tag = 0;
        for(let i = 0; i < players.length; i++) {
            tag = players[i].tag;
            playerPromises[i] = getPlayer(tag);
        }

        for(let i = 0; i < playerPromises.length; i++) {
            let player = await playerPromises[i];
            favRank[i] = {playerTag: tag, favouriteCard: player.currentFavouriteCard.id, activityRank: i, favouriteCardName: player.currentFavouriteCard.name, picture: player.currentFavouriteCard.iconUrls.medium};
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
                favImage = favRank[j-1].picture;
                count = 1;
            } else if(count == topCount && value < topValue){
                topCount = count;
                topValue = value;
                favName = favRank[j-1].favouriteCardName;
                favImage = favRank[j-1].picture;
                count = 1;
            } else{
                count = 1;
                value = favRank[j].activityRank;
            }      
            
            
        }
    }
    return {name: favName, imageUri: favImage};
}



// TODO use role in clan to recommend promotions / demotions;
//          if so determine requirements for rank change

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const clanTag = req.query.clanTag;
    try {
        let clan = await getClan(clanTag);
        let players = clan.memberList;
        let favCard = await clanFavouriteCard(players);
        context.res = {
            body: {
                name: clan.name,
                trophies: clan.clanWarTrophies,
                score: clan.clanScore,
                favouriteCard: favCard,
                members: clan.members,
                players: scorePlayers(players)
            }
        };
    } catch(e) {
        context.res = {
            status: e.response.status,
            body: e.message
        }
    }
}