import prisma from '../../config/prisma.js';
import type { ApplicationResponse } from './application.types.js';

function toResponse(app: {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): ApplicationResponse {
  return {
    id: app.id,
    name: app.name,
    status: app.status as 'ACTIVE' | 'SUSPENDED',
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

/*Creates a new Application row in the db */
async function create(data: {
  name: string;
  apiKeyHash: string;
}): Promise<ApplicationResponse> {
  const application = await prisma.application.create({
    data: {
      name: data.name,
      apiKeyHash: data.apiKeyHash,
    },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return toResponse(application);
}

async function findById(id: string): Promise<ApplicationResponse | null> {
  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!application) return null;
  return toResponse(application);
}

export const applicationRepository = {
  create,
  findById,
};
