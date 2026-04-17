import { createApp } from '../backend/src/app';
import { connectDatabase } from '../backend/src/config/database';
import { bootstrapData } from '../backend/src/services/bootstrap';
import type { Request, Response } from 'express';

const app = createApp();
let bootstrapPromise: Promise<void> | null = null;

async function ensureInitialized() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await connectDatabase();
      await bootstrapData();
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  await bootstrapPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    await ensureInitialized();
    return app(req, res);
  } catch (error) {
    console.error('Failed to initialize API handler', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        message: 'Server initialization failed',
      })
    );
  }
}
