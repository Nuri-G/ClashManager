# ClashManager
A set of Azure Functions to collect clan data from the Clash Royale API

## Program Structure

![Chart](./chart.svg)

## Running locally on VSCode (recommended)
- Install the following extensions:
    - Azure Functions
    - Azurite
- Get an API key from [here](https://developer.clashroyale.com/)
- Clone this repository
- Make a file called local.settings.json in the root of the project with the following information:
```
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "API_KEY": "Your API Key Goes Here"
  },
  "Host": {
    "CORS": "*"
  }
}
```
- Start Azurite (f1 -> Azurite: Start)
- Run the program by pressing f5
- If prompted to use storage emulator, press OK

## Using ClashManager
### With HTTP rquests:
 If running locally, simply make an HTTP get request to `http://localhost:7071/api/ClanStats?clanTag=YOURCLANTAG`. ClashManager will return the most recent data for the clan and start tracking its history every 15 minutes. A clan tag you can test with is `9YQQQ98`.
### With a UI:
See [clash-manager-ui](https://github.com/Nuri-G/clash-manager-ui).

## Deploying ClashManager
We had planned on deploying ClashManager to Azure, but the Clash Royale API limits each API key to 5 IP adresses. Unfortunately, Azure Functions can use more than 5 IP adresses. To solve this problem we would need to either set up a more expensive App Service Plan for ClashManager, or route the outbound traffic through a static IP adress somehow. These would both cost money, so we might deploy the Functions if we set up a donation page or advertisements on the website.
