"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
let transporter = null;
function getTransporter() {
    if (!env_1.env.smtp.host || !env_1.env.smtp.user || !env_1.env.smtp.password) {
        return null;
    }
    if (!transporter) {
        transporter = nodemailer_1.default.createTransport({
            host: env_1.env.smtp.host,
            port: env_1.env.smtp.port,
            secure: env_1.env.smtp.secure,
            auth: {
                user: env_1.env.smtp.user,
                pass: env_1.env.smtp.password,
            },
        });
    }
    return transporter;
}
async function sendMail(options) {
    const mailer = getTransporter();
    if (!mailer) {
        return { skipped: true };
    }
    await mailer.sendMail({
        from: env_1.env.smtp.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    });
    return { skipped: false };
}
