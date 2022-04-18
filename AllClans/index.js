const df = require("durable-functions");

module.exports = df.entity(function(context) {
    const clanTags = context.df.getState(() => []);
    switch (context.df.operationName) {
        case "add":
            let tagSet = new Set(clanTags);
            const tag = context.df.getInput();
            tagSet.add(tag);
            context.df.setState([...tagSet]);
            break;
        case "update":
            clanTags.forEach(async tag => {
                const entityId = new df.EntityId("clanhistory", tag);
                context.df.signalEntity(entityId, "update");
            });
            
            break;
    }
});