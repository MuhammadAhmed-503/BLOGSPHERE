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
      console.log('Initializing backend...');
      await connectDatabase();
      console.log('Database connected');
      await bootstrapData();
      console.log('Bootstrap completed');
    })().catch((error) => {
      console.error('Initialization error:', error);
      initPromise = undefined;
      throw error;
    });
  }
  return initPromise;
}

const app = createApp();

// Serverless handler - THIS IS THE DEFAULT EXPORT
async function handler(req, res) {
  try {
    await initialize();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
}

// Export the handler as default AND named export
module.exports = handler;
module.exports.default = handler;

// Local development server
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
      console.error(`Port ${env.port} is already in use.`);
      process.exit(1);
    }
    console.error('Server error:', error);
    process.exit(1);
  });
}

if (require.main === module) {
  void start().catch((error) => {
    console.error('Failed to start:', error);
    process.exit(1);
  });
}