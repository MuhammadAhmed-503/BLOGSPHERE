import { Router } from 'express';
import { getEnvHealthReport } from '../config/env';

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Blog SaaS API is running',
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/env', (_req, res) => {
  const report = getEnvHealthReport();

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

export default healthRouter;