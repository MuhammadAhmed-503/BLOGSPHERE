import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env, getEnvHealthReport } from './config/env';
import { bootstrapData } from './services/bootstrap';

async function start() {
  const envHealth = getEnvHealthReport();
  console.log('Environment integrations:', envHealth.configured);

  if (envHealth.checks.optionalMissing.length > 0) {
    console.log('Optional env not configured:', envHealth.checks.optionalMissing.join(' | '));
  }

  await connectDatabase();
  await bootstrapData();

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`Backend API running on http://localhost:${env.port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${env.port} is already in use. Stop the existing server or change PORT.`);
      process.exit(1);
      return;
    }

    console.error('Failed to start backend server', error);
    process.exit(1);
  });
}

void start().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});