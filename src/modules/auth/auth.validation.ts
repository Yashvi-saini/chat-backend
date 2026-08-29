import { z } from 'zod';

export const registerSchema = z.object({
  applicationId: z.string().uuid('applicationId must be a valid UUID'),
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  avatarUrl: z.string().url().optional(),
});

export type RegisterBody = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  applicationId: z.string().uuid('applicationId must be a valid UUID'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginBody = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenBody = z.infer<typeof refreshTokenSchema>;
