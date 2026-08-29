import { Router } from 'express';
import { register, login, refreshToken, getMe } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation.js';

const router = Router();

// Apply stricter rate limit (10 attempts / 15 mins) to auth routes
router.use(authRateLimiter);

// Public Auth Endpoints
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Protected Auth Endpoint (requires Bearer JWT)
router.get('/me', authenticate, getMe);

export default router;
