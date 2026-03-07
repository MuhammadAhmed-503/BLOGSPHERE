/**
 * MongoDB Connection with Connection Pooling
 * Production-ready singleton pattern for MongoDB connection
 */

import mongoose from 'mongoose';
import { env } from './env';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global mongoose instance to prevent multiple connections in development
 * due to hot reloading
 */
// eslint-disable-next-line prefer-const
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB with connection pooling and proper error handling
 */
async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000, // Increased timeout
      heartbeatFrequencyMS: 10000,
      family: 4,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    
    // Enhanced error handling with specific guidance
    console.error('❌ MongoDB connection error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('IP') || errorMessage.includes('whitelist') || errorMessage.includes('not allowed')) {
      console.error('\n🔒 IP WHITELIST ERROR DETECTED\n');
      console.error('Your IP address is not whitelisted in MongoDB Atlas.');
      console.error('\nTo fix this:');
      console.error('1. Go to https://cloud.mongodb.com');
      console.error('2. Select your cluster');
      console.error('3. Go to Network Access (Security → Network Access)');
      console.error('4. Click "Add IP Address"');
      console.error('5. Add your current IP or use 0.0.0.0/0 for all IPs (dev only)');
      console.error('6. Save and wait 1-2 minutes for changes to apply\n');
      
      throw new Error(
        'MongoDB Atlas IP Whitelist Error: Your IP address is not allowed to connect. ' +
        'Please add your IP to the Atlas whitelist at https://cloud.mongodb.com'
      );
    }
    
    if (errorMessage.includes('authentication failed') || errorMessage.includes('auth')) {
      console.error('\n🔑 AUTHENTICATION ERROR DETECTED\n');
      console.error('Check your MongoDB credentials in .env.local');
      console.error('- Verify MONGODB_URI has correct username and password');
      console.error('- Ensure special characters in password are URL-encoded\n');
      
      throw new Error('MongoDB Authentication Error: Invalid credentials in MONGODB_URI');
    }
    
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
      console.error('\n🌐 DNS/NETWORK ERROR DETECTED\n');
      console.error('Cannot resolve MongoDB hostname.');
      console.error('- Check your internet connection');
      console.error('- Verify the MongoDB URI is correct');
      console.error('- Ensure you\'re not behind a restrictive firewall\n');
      
      throw new Error('MongoDB Network Error: Cannot reach database server. Check connection and URI.');
    }
    
    throw error;
  }

  return cached.conn;
}

/**
 * Disconnect from MongoDB (useful for testing or graceful shutdown)
 */
async function disconnectDB(): Promise<void> {
  if (!cached.conn) {
    return;
  }

  await mongoose.disconnect();
  cached.conn = null;
  cached.promise = null;
  console.log('❌ MongoDB disconnected');
}

/**
 * Check MongoDB connection status
 */
function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Get MongoDB connection stats
 */
function getConnectionStats() {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.connection.models),
  };
}

// Increase max listeners to prevent EventEmitter warning
mongoose.connection.setMaxListeners(20);

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  const errorMessage = err instanceof Error ? err.message : String(err);
  
  if (errorMessage.includes('IP') || errorMessage.includes('whitelist')) {
    console.error('⚠️ This appears to be an IP whitelist issue. Check MongoDB Atlas Network Access settings.');
  }
  
  cached.promise = null;
  cached.conn = null;
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
  });
}

export { connectDB, disconnectDB, isConnected, getConnectionStats };
export default connectDB;
