const df = require("durable-functions");

module.exports = async function (context, myTimer) {
    const client = df.getClient(context);
    const entityId = new df.EntityId("AllClans", "default");
    client.signalEntity(entityId, "update")
};