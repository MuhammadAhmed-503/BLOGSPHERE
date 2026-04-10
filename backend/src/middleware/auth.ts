import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError';
import { verifyToken } from '../utils/jwt';

export function authenticateRequest(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401));
    return;
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth || req.auth.role !== 'admin') {
    next(new AppError('Admin access required', 403));
    return;
  }

  next();
}