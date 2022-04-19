const df = require("durable-functions");
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
            // throw error;
        });
    return res;
}

module.exports = df.entity(async function(context) {
    let history = context.df.getState(() => new Array());
    switch (context.df.operationName) {
        case "update":
            let clan = await getClan(context.df.entityId.key);
            history.push({
                trophies: clan.clanWarTrophies,
                score: clan.clanScore,
                members: clan.members
            });
            while(history.length > 5040) {
                history.shift();
            }
            context.df.setState(history);
            break;
    }
});