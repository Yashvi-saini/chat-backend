import { authRepository } from './auth.repository.js';
import { applicationRepository } from '../applications/application.repository.js';
import { hashPassword, comparePassword } from '../../shared/utils/password.js';
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../../shared/utils/jwt.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { RegisterBody, LoginBody, RefreshTokenBody } from './auth.validation.js';
import type { AuthSuccessResponse, AuthTokens } from './auth.types.js';

// Refresh token valid for 7 days
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

async function register(input: RegisterBody): Promise<AuthSuccessResponse> {
  // 1. Verify that target Application exists and is ACTIVE
  const app = await applicationRepository.findById(input.applicationId);
  if (!app || app.status !== 'ACTIVE') {
    throw new AppError('Application not found or inactive', 404, 'APPLICATION_NOT_FOUND');
  }

  // 2. Check if user email already exists in this application
  const existingUser = await authRepository.findByEmail(input.applicationId, input.email);
  if (existingUser) {
    throw new AppError('User with this email already exists in this application', 409, 'USER_EXISTS');
  }

  // 3. Hash password
  const passwordHash = await hashPassword(input.password);

  // 4. Create user
  const user = await authRepository.createUser({
    applicationId: input.applicationId,
    name: input.name,
    email: input.email,
    passwordHash,
    avatarUrl: input.avatarUrl,
  });

  // 5. Generate tokens
  const tokens = await issueTokens(user.id, user.applicationId);

  return { user, tokens };
}

async function login(input: LoginBody): Promise<AuthSuccessResponse> {
  // 1. Find user by applicationId + email
  const user = await authRepository.findByEmail(input.applicationId, input.email);
  if (!user || !user.passwordHash) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // 2. Check user status
  if (user.status !== 'ACTIVE') {
    throw new AppError('User account suspended', 403, 'ACCOUNT_SUSPENDED');
  }

  // 3. Verify password
  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // 4. Issue fresh tokens
  const tokens = await issueTokens(user.id, user.applicationId);

  const userResponse = {
    id: user.id,
    applicationId: user.applicationId,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    status: user.status as 'ACTIVE' | 'SUSPENDED',
    createdAt: user.createdAt.toISOString(),
  };

  return { user: userResponse, tokens };
}

async function refreshToken(input: RefreshTokenBody): Promise<{ accessToken: string }> {
  const tokenHash = hashRefreshToken(input.refreshToken);
  const storedToken = await authRepository.findRefreshToken(tokenHash);

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  if (storedToken.user.status !== 'ACTIVE') {
    throw new AppError('User account suspended', 403, 'ACCOUNT_SUSPENDED');
  }

  const accessToken = signAccessToken({
    userId: storedToken.userId,
    applicationId: storedToken.user.applicationId,
  });

  return { accessToken };
}

/* Helper function to issue access and refresh tokens */
async function issueTokens(userId: string, applicationId: string): Promise<AuthTokens> {
  const accessToken = signAccessToken({ userId, applicationId });
  const { token: rawRefreshToken, tokenHash } = generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await authRepository.createRefreshToken({
    userId,
    tokenHash,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
  };
}

export const authService = {
  register,
  login,
  refreshToken,
};
