import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { validate } from '../middleware/validate';
import { createTicketSchema, updateTicketSchema, createTicketCommentSchema } from '../validations/ticket.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',              requirePermission('ticket.read'),    TicketController.getTickets);
router.post('/',             requirePermission('ticket.create'),  validate(createTicketSchema), TicketController.createTicket);
router.get('/:id',           requirePermission('ticket.read'),    TicketController.getTicketById);
router.put('/:id',           requirePermission('ticket.update'),  validate(updateTicketSchema), TicketController.updateTicket);
router.post('/:id/comments', requirePermission('ticket.create'),  validate(createTicketCommentSchema), TicketController.addComment);
router.delete('/:id',        requirePermission('ticket.delete'),  TicketController.deleteTicket);

export default router;
