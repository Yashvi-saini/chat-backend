import 'dotenv/config';
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.error(`[config] FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value.trim();
}

function optionalEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value.trim() : fallback;
}

export const env = {
  nodeEnv:     optionalEnv('NODE_ENV', 'development'),
  port:        Number(optionalEnv('PORT', '3000')),
  databaseUrl: requireEnv('DATABASE_URL'),
  corsOrigin:  optionalEnv('CORS_ORIGIN', 'http://localhost:3001'),
  jwtSecret:   requireEnv('JWT_SECRET'),
  jwtExpiresIn: optionalEnv('JWT_EXPIRES_IN', '15m'),
} as const;
