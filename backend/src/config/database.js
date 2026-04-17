"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
let isConnected = false;
async function connectDatabase() {
    if (isConnected || mongoose_1.default.connection.readyState === 1) {
        isConnected = true;
        console.log('MongoDB connected successfully for backend');
        return;
    }
    const connection = await mongoose_1.default.connect(env_1.env.mongoUri);
    isConnected = true;
    const host = connection.connection.host || 'unknown-host';
    const databaseName = connection.connection.name || 'unknown-database';
    console.log(`MongoDB connected successfully for backend (${host}/${databaseName})`);
}
