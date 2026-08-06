import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { validate } from '../middleware/validate';
import { createMessageSchema } from '../validations/chat.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',                 requirePermission('chat.read'),   ChatController.getMessages);
router.post('/',                requirePermission('chat.create'), validate(createMessageSchema), ChatController.createMessage);
router.get('/conversations',    requirePermission('chat.read'),   ChatController.getConversations);
router.get('/:id',              requirePermission('chat.read'),   ChatController.getMessageById);
router.delete('/:id',           requirePermission('chat.delete'), ChatController.deleteMessage);

export default router;
