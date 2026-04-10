import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../utils/appError';

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      next(new AppError('Validation failed', 400, parsed.error.flatten()));
      return;
    }

    req.body = parsed.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.query);

    if (!parsed.success) {
      next(new AppError('Invalid query parameters', 400, parsed.error.flatten()));
      return;
    }

    req.query = parsed.data as typeof req.query;
    next();
  };
}