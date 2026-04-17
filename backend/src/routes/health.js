"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const env_1 = require("../config/env");
const healthRouter = (0, express_1.Router)();
healthRouter.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Blog SaaS API is running',
        timestamp: new Date().toISOString(),
    });
});
healthRouter.get('/env', (_req, res) => {
    const report = (0, env_1.getEnvHealthReport)();
    res.json({
        success: true,
        message: 'Environment health report',
        data: {
            configured: report.configured,
            checks: report.checks,
            healthy: report.checks.requiredMissing.length === 0,
        },
    });
});
exports.default = healthRouter;
