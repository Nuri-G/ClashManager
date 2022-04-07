const fs = require("fs");
const apiKey = fs.readFileSync("./token.txt").toString();

const https = require('https');
const options = {
    hostname: 'api.clashroyale.com',
    port: 443,
    path: '/v1/players/#220P8YYGJ',
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + apiKey,
    }
};

let data = [];

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let data = [];

    res.on('data', d => {
        data.push(d);
    });
    res.on('end', function() {
        console.log(JSON.parse(data.join()));
    })
});

req.on('error', error => {
    console.error(error);
});

req.end();