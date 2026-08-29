import { randomBytes, createHash } from 'crypto';
import { applicationRepository } from './application.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { ApplicationResponse, CreateApplicationInput } from './application.types.js';

function generateApiKey(): { rawKey: string; keyHash: string } {
  const rawKey = `chatapp_${randomBytes(32).toString('hex')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  return { rawKey, keyHash };
}

async function createApplication(
  input: CreateApplicationInput,
): Promise<ApplicationResponse & { apiKey: string }> {
  const { rawKey, keyHash } = generateApiKey();

  const application = await applicationRepository.create({
    name: input.name.trim(),
    apiKeyHash: keyHash,
  });

  return { ...application, apiKey: rawKey };
}

async function getApplicationById(id: string): Promise<ApplicationResponse> {
  const application = await applicationRepository.findById(id);

  if (!application) {
    throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
  }

  return application;
}

export const applicationService = {
  createApplication,
  getApplicationById,
};
