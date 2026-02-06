import type { FastifyReply } from 'fastify';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Handle 400 Bad Request errors
 */
export function badRequest(
  reply: FastifyReply,
  message: string,
  code: string = 'BAD_REQUEST',
  details?: Record<string, any>
): any {
  return reply.status(400).send({
    status: 400,
    code,
    message,
    details: details || undefined,
  });
}

/**
 * Handle 401 Unauthorized errors
 */
export function unauthorized(
  reply: FastifyReply,
  message: string = 'Missing authorization token',
  code: string = 'UNAUTHORIZED'
): any {
  return reply.status(401).send({
    status: 401,
    code,
    message,
  });
}

/**
 * Handle 403 Forbidden errors
 */
export function forbidden(
  reply: FastifyReply,
  message: string,
  code: string = 'FORBIDDEN'
): any {
  return reply.status(403).send({
    status: 403,
    code,
    message,
  });
}

/**
 * Handle 404 Not Found errors
 */
export function notFound(
  reply: FastifyReply,
  message: string,
  code: string = 'NOT_FOUND'
): any {
  return reply.status(404).send({
    status: 404,
    code,
    message,
  });
}

/**
 * Handle 409 Conflict errors (e.g., duplicate resource)
 */
export function conflict(
  reply: FastifyReply,
  message: string,
  code: string = 'CONFLICT'
): any {
  return reply.status(409).send({
    status: 409,
    code,
    message,
  });
}

/**
 * Handle 422 Unprocessable Entity errors (validation failed)
 */
export function unprocessableEntity(
  reply: FastifyReply,
  message: string,
  code: string = 'VALIDATION_ERROR',
  details?: Record<string, any>
): any {
  return reply.status(422).send({
    status: 422,
    code,
    message,
    details: details || undefined,
  });
}

/**
 * Handle 429 Too Many Requests errors
 */
export function tooManyRequests(
  reply: FastifyReply,
  message: string = 'Too many requests',
  code: string = 'RATE_LIMITED'
): any {
  return reply.status(429).send({
    status: 429,
    code,
    message,
  });
}

/**
 * Handle 500 Internal Server Error
 */
export function internalError(
  reply: FastifyReply,
  message: string = 'Internal server error',
  code: string = 'INTERNAL_ERROR'
): any {
  return reply.status(500).send({
    status: 500,
    code,
    message,
  });
}

/**
 * Validation helper - check required fields
 */
export function validateRequired(
  body: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(field => !body[field]);
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Validation helper - check field types
 */
export function validateTypes(
  body: Record<string, any>,
  typeMap: Record<string, string>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  Object.entries(typeMap).forEach(([field, expectedType]) => {
    if (body[field] !== undefined) {
      const actualType = typeof body[field];
      if (actualType !== expectedType) {
        errors[field] = `Expected ${expectedType}, got ${actualType}`;
      }
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validation helper - check enum values
 */
export function validateEnum(
  value: any,
  allowedValues: string[]
): { valid: boolean; message?: string } {
  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      message: `Value must be one of: ${allowedValues.join(', ')}`,
    };
  }
  return { valid: true };
}
