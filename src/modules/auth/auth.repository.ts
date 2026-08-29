import prisma from '../../config/prisma.js';
import type { AuthUserResponse } from './auth.types.js';

function toUserResponse(user: {
  id: string;
  applicationId: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: Date;
}): AuthUserResponse {
  return {
    id: user.id,
    applicationId: user.applicationId,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    status: user.status as 'ACTIVE' | 'SUSPENDED',
    createdAt: user.createdAt.toISOString(),
  };
}

async function findByEmail(
  applicationId: string,
  email: string,
) {
  return prisma.user.findFirst({
    where: {
      applicationId,
      email: email.toLowerCase(),
    },
  });
}

async function createUser(data: {
  applicationId: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
}): Promise<AuthUserResponse> {
  const user = await prisma.user.create({
    data: {
      applicationId: data.applicationId,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      avatarUrl: data.avatarUrl,
    },
  });

  return toUserResponse(user);
}

async function createRefreshToken(data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  return prisma.refreshToken.create({
    data: {
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    },
  });
}

async function findRefreshToken(tokenHash: string) {
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
}

async function revokeRefreshToken(id: string) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export const authRepository = {
  findByEmail,
  createUser,
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
};
