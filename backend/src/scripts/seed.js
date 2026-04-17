"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const bootstrap_1 = require("../services/bootstrap");
async function run() {
    await (0, database_1.connectDatabase)();
    await (0, bootstrap_1.bootstrapData)();
    console.log('Seed data is ready');
}
void run().catch((error) => {
    console.error(error);
    process.exit(1);
});
