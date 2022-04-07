const fs = require('fs');
const axios = require('axios');


async function getPlayers(apiKey, clanTag) {
    const config = { headers: {'Authorization': `Bearer ${apiKey}`}};
    const url = `https://api.clashroyale.com/v1/clans/${clanTag}/members`;
    const res = await axios.get(url, config)
        .then(response => {
            return response.data.items;
        })
        .catch(error => {
            console.error("Error getting players from clan: " + error);
        });
    return res;
}


// TODO - Dehardcode clan tag --- Will it come from ui or from a file?
async function main() {
    const apiKey = fs.readFileSync("./token.txt").toString();
    let res = await getPlayers(apiKey, "%239YQQQ98");
    console.log(res);
}

if (require.main === module) {
    main();
}