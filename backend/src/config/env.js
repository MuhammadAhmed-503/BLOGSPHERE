"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.getEnvHealthReport = getEnvHealthReport;
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
const moduleDir = node_path_1.default.dirname(require.main?.filename || process.argv[1]);
const backendRoot = node_path_1.default.resolve(moduleDir, '..', '..');
const repoRoot = node_path_1.default.resolve(backendRoot, '..');
const envFiles = [
    node_path_1.default.resolve(backendRoot, '.env.local'),
    node_path_1.default.resolve(backendRoot, '.env'),
    node_path_1.default.resolve(repoRoot, '.env.local'),
    node_path_1.default.resolve(repoRoot, '.env'),
    node_path_1.default.resolve(process.cwd(), '.env.local'),
    node_path_1.default.resolve(process.cwd(), '.env'),
    node_path_1.default.resolve(process.cwd(), '..', '.env.local'),
    node_path_1.default.resolve(process.cwd(), '..', '.env'),
];
for (const envFile of envFiles) {
    dotenv_1.default.config({ path: envFile, override: false });
}
function requiredValue(name, fallback) {
    const value = process.env[name] ?? fallback;
    if (!value || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
function optionalBoolean(value, defaultValue = false) {
    if (value === undefined) {
        return defaultValue;
    }
    return value === 'true' || value === '1';
}
function optionalNumber(value, defaultValue) {
    if (value === undefined || value.trim() === '') {
        return defaultValue;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
}
function hasValue(value) {
    return Boolean(value && value.trim() !== '');
}
function getEnvHealthReport() {
    const mongodbConfigured = hasValue(process.env.MONGODB_URI);
    const jwtConfigured = hasValue(process.env.JWT_SECRET) || hasValue(process.env.NEXTAUTH_SECRET);
    const adminConfigured = hasValue(process.env.ADMIN_EMAIL) && hasValue(process.env.ADMIN_PASSWORD);
    const cloudinaryConfigured = hasValue(process.env.CLOUDINARY_CLOUD_NAME) &&
        hasValue(process.env.CLOUDINARY_API_KEY) &&
        hasValue(process.env.CLOUDINARY_API_SECRET);
    const smtpConfigured = hasValue(process.env.SMTP_HOST) &&
        hasValue(process.env.SMTP_USER) &&
        hasValue(process.env.SMTP_PASSWORD) &&
        hasValue(process.env.SMTP_FROM);
    const googleConfigured = hasValue(process.env.GOOGLE_CLIENT_ID) && hasValue(process.env.GOOGLE_CLIENT_SECRET);
    const vapidConfigured = (hasValue(process.env.VAPID_PUBLIC_KEY) || hasValue(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)) &&
        hasValue(process.env.VAPID_PRIVATE_KEY) &&
        hasValue(process.env.VAPID_SUBJECT);
    const requiredMissing = [];
    const optionalMissing = [];
    if (!mongodbConfigured) {
        requiredMissing.push('MONGODB_URI');
    }
    if (!jwtConfigured) {
        requiredMissing.push('JWT_SECRET or NEXTAUTH_SECRET');
    }
    if (!adminConfigured) {
        requiredMissing.push('ADMIN_EMAIL and ADMIN_PASSWORD');
    }
    if (!cloudinaryConfigured) {
        optionalMissing.push('CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET');
    }
    if (!smtpConfigured) {
        optionalMissing.push('SMTP_HOST/SMTP_USER/SMTP_PASSWORD/SMTP_FROM');
    }
    if (!googleConfigured) {
        optionalMissing.push('GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET');
    }
    if (!vapidConfigured) {
        optionalMissing.push('VAPID_PUBLIC_KEY or NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT');
    }
    return {
        configured: {
            mongodb: mongodbConfigured,
            jwt: jwtConfigured,
            admin: adminConfigured,
            cloudinary: cloudinaryConfigured,
            smtp: smtpConfigured,
            googleAuth: googleConfigured,
            webPush: vapidConfigured,
        },
        checks: {
            requiredMissing,
            optionalMissing,
        },
    };
}
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: optionalNumber(process.env.PORT, 5000),
    mongoUri: requiredValue('MONGODB_URI'),
    jwtSecret: requiredValue('JWT_SECRET', process.env.NEXTAUTH_SECRET),
    adminEmail: requiredValue('ADMIN_EMAIL'),
    adminPassword: requiredValue('ADMIN_PASSWORD'),
    appUrl: process.env.APP_URL ?? process.env.FRONTEND_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:5173',
    frontendUrl: process.env.FRONTEND_URL ?? process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:5173',
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    smtp: {
        host: process.env.SMTP_HOST,
        port: optionalNumber(process.env.SMTP_PORT, 587),
        secure: optionalBoolean(process.env.SMTP_SECURE, false),
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    vapid: {
        publicKey: process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        privateKey: process.env.VAPID_PRIVATE_KEY,
        subject: process.env.VAPID_SUBJECT,
    },
};
