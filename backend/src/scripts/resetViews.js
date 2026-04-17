"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const Post_1 = require("../models/Post");
async function run() {
    await (0, database_1.connectDatabase)();
    const result = await Post_1.PostModel.updateMany({}, { $set: { views: 0 } });
    console.log(`Reset views for ${result.modifiedCount} posts.`);
    process.exit(0);
}
void run().catch((error) => {
    console.error(error);
    process.exit(1);
});
