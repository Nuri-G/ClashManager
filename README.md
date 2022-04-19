# ClashManager
A set of Azure Functions to collect clan data from the Clash Royale API

## Purpose
- The in-game clan management features for ClashRoyale can be difficult
    - Important stats are spread across several different windows
    - Not every possible ranking category is equally important
    - Clan progress cannot be tracked
- ClashManager solves these problems
    - One place for clan member stats
    - Starts tracking clan history as soon as the clan is viewed

## Technologies Used
- Azure Functions
    - Used for interacting with the Clash Royale API and sending data to users
- Azure Durable Functions
    - Used to keep track of any data that needs to be stored
        - Regular Azure Functions are stateless so they do not work for this.
- JavaScript with NodeJS
    - Language used for both Azure Functions and UI
    - Packages
        - Axios - Used for HTTPS requests, much easier than the built-in modules.
        - React - Used for [clash-manager-ui](https://github.com/Nuri-G/clash-manager-ui)
        - react-google-charts - Used for data visualizations
        

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

### With a UI (recommended):
See [clash-manager-ui](https://github.com/Nuri-G/clash-manager-ui).

### With HTTP requests:
 If running locally, simply make an HTTP get request to `http://localhost:7071/api/ClanStats?clanTag=YOURCLANTAG`. ClashManager will return the most recent data for the clan and start tracking its history every 15 minutes. A clan tag you can test with is `9YQQQ98`.

## Deploying ClashManager
We had planned on deploying ClashManager to Azure, but the Clash Royale API limits each API key to 5 IP adresses. Unfortunately, Azure Functions can use more than 5 IP adresses. To solve this problem we would need to either set up a more expensive App Service Plan for ClashManager, or route the outbound traffic through a static IP adress somehow. These would both cost money, so we might deploy the Functions if we set up a donation page or advertisements on the website.
