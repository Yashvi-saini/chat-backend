import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import { env } from '../../config/env.js';

export interface TokenPayload {
  userId: string;
  applicationId: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}

export function generateRefreshToken(): { token: string; tokenHash: string } {
  const token = randomBytes(40).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
