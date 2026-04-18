"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { createApp } = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const { env, getEnvHealthReport } = require('./src/config/env');
const { bootstrapData } = require('./src/services/bootstrap');

let initPromise;

async function initialize() {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDatabase();
      await bootstrapData();
    })().catch((error) => {
      initPromise = undefined;
      throw error;
    });
  }

  return initPromise;
}

const app = createApp();

async function serverlessHandler(req, res) {
  try {
    await initialize();
    return app(req, res);
  } catch (error) {
    console.error('Serverless initialization failed', error);
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
    });
  }
}

module.exports = serverlessHandler;

async function start() {
  const envHealth = getEnvHealthReport();
  console.log('Environment integrations:', envHealth.configured);

  if (envHealth.checks.optionalMissing.length > 0) {
    console.log('Optional env not configured:', envHealth.checks.optionalMissing.join(' | '));
  }

  await initialize();

  const server = app.listen(env.port, () => {
    console.log(`Backend API running on http://localhost:${env.port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${env.port} is already in use. Stop the existing server or change PORT.`);
      process.exit(1);
      return;
    }

    console.error('Failed to start backend server', error);
    process.exit(1);
  });
}

if (require.main === module) {
  void start().catch((error) => {
    console.error('Failed to start backend', error);
    process.exit(1);
  });
}