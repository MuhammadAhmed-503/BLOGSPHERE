"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const health_1 = __importDefault(require("./routes/health"));
const public_1 = __importDefault(require("./routes/public"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const contact_1 = __importDefault(require("./routes/contact"));
const push_1 = __importDefault(require("./routes/push"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const errorHandler_1 = require("./middleware/errorHandler");

function createApp() {
    const app = (0, express_1.default)();
    
    // ✅ Updated allowed origins with production frontend
    const allowedOrigins = new Set([
        'https://blogsphere-sj9b.vercel.app',  // Production frontend
        env_1.env.frontendUrl,
        env_1.env.appUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
    ]);
    
    const isAllowedOrigin = (origin) => {
        if (!origin) {
            return true;
        }
        if (allowedOrigins.has(origin)) {
            return true;
        }
        return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    };
    
    app.set('trust proxy', 1);
    
    // ✅ Updated Helmet configuration
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    
    // ✅ Updated CORS configuration
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }
            callback(null, false);  // Changed from Error to false
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['set-cookie'],
        optionsSuccessStatus: 204
    }));
    
    // ✅ Handle preflight requests
    app.options('*', (0, cors_1.default)());
    
    app.use(express_1.default.json({ limit: '2mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, morgan_1.default)(env_1.env.nodeEnv === 'production' ? 'combined' : 'dev'));
    
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false,
    }));
    
    app.get('/', (_req, res) => {
        res.json({
            success: true,
            message: 'Blog SaaS API',
            version: '1.0.0',
        });
    });
    
    app.use('/api/health', health_1.default);
    app.use('/api/public', public_1.default);
    app.use('/api/auth', auth_1.default);
    app.use('/api/admin', admin_1.default);
    app.use('/api/contact', contact_1.default);
    app.use('/api/push', push_1.default);
    app.use('/api/uploads', uploads_1.default);
    
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    
    return app;
}