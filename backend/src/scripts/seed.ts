import { connectDatabase } from '../config/database';
import { bootstrapData } from '../services/bootstrap';

async function run() {
  await connectDatabase();
  await bootstrapData();
  console.log('Seed data is ready');
}

void run().catch((error) => {
  console.error(error);
  process.exit(1);
});