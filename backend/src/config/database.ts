import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    console.log('MongoDB connected successfully for backend');
    return;
  }

  const connection = await mongoose.connect(env.mongoUri);
  isConnected = true;

  const host = connection.connection.host || 'unknown-host';
  const databaseName = connection.connection.name || 'unknown-database';
  console.log(`MongoDB connected successfully for backend (${host}/${databaseName})`);
}