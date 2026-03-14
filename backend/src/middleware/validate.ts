import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/errors';

/**
 * Zod validation middleware factory.
 * Pass a Zod schema and it validates req.body against it.
 * On failure, returns 400 with detailed validation errors.
 */
export function validate(schema: ZodSchema<any>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      // Replace body with parsed (coerced/transformed) values
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));

        throw new AppError(
          400,
          `Validation failed: ${formatted.map((f) => `${f.field}: ${f.message}`).join('; ')}`,
          'VALIDATION_ERROR'
        );
      }
      throw err;
    }
  };
}

/**
 * Validate query parameters against a Zod schema.
 */
export function validateQuery(schema: ZodSchema<any>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      (req as any).validatedQuery = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        throw new AppError(
          400,
          `Query validation failed: ${formatted.map((f) => `${f.field}: ${f.message}`).join('; ')}`,
          'QUERY_VALIDATION_ERROR'
        );
      }
      throw err;
    }
  };
}

/**
 * Validate route parameters against a Zod schema.
 */
export function validateParams(schema: ZodSchema<any>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.params);
      (req as any).validatedParams = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        throw new AppError(
          400,
          `Params validation failed: ${formatted.map((f) => `${f.field}: ${f.message}`).join('; ')}`,
          'PARAMS_VALIDATION_ERROR'
        );
      }
      throw err;
    }
  };
}

export default validate;
