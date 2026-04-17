"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = sendPushNotification;
const web_push_1 = __importDefault(require("web-push"));
const env_1 = require("../config/env");
let configured = false;
function configurePush() {
    if (configured) {
        return;
    }
    if (env_1.env.vapid.publicKey && env_1.env.vapid.privateKey && env_1.env.vapid.subject) {
        web_push_1.default.setVapidDetails(env_1.env.vapid.subject, env_1.env.vapid.publicKey, env_1.env.vapid.privateKey);
    }
    configured = true;
}
async function sendPushNotification(subscription, payload) {
    configurePush();
    if (!env_1.env.vapid.publicKey || !env_1.env.vapid.privateKey || !env_1.env.vapid.subject) {
        return { skipped: true };
    }
    await web_push_1.default.sendNotification(subscription, JSON.stringify(payload));
    return { skipped: false };
}
