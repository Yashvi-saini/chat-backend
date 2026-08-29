import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler } from './middleware/notFound.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import applicationRouter from './modules/applications/application.routes.js';
import authRouter from './modules/auth/auth.routes.js';
import conversationRouter from './modules/conversations/conversation.routes.js';



const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    credentials: true,
  }),
);

app.use(requestIdMiddleware);


app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api/v1', apiRateLimiter);

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      version: 'v1',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/v1/applications', applicationRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/conversations', conversationRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;

