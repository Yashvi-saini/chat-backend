import { Router } from 'express';
import { sendMessage, getMessages } from './message.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { sendMessageSchema } from './message.validation.js';

// mergeParams: true ensures :conversationId from parent router is available in req.params!
const router = Router({ mergeParams: true });

// Protect all messaging endpoints with JWT authentication
router.use(authenticate);

router.post('/', validate(sendMessageSchema), sendMessage);
router.get('/', getMessages);

export default router;
