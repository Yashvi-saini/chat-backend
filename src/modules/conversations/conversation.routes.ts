import { Router } from 'express';
import {
  createConversation,
  getConversations,
  getConversation,
} from './conversation.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { createConversationSchema } from './conversation.validation.js';

import messageRouter from '../messages/message.routes.js';

const router = Router();

// Protect ALL conversation routes with JWT authentication
router.use(authenticate);

router.post('/', validate(createConversationSchema), createConversation);
router.get('/', getConversations);
router.get('/:id', getConversation);

// Mount nested message routes: /api/v1/conversations/:conversationId/messages
router.use('/:conversationId/messages', messageRouter);

export default router;
