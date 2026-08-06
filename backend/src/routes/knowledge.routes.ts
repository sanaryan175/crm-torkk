import { Router } from 'express';
import { KnowledgeController } from '../controllers/knowledge.controller';
import { validate } from '../middleware/validate';
import { createArticleSchema, updateArticleSchema } from '../validations/knowledge.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:id',   requirePermission('ticket.read'),    KnowledgeController.getArticleById);
router.put('/:id',   requirePermission('ticket.update'),  validate(updateArticleSchema), KnowledgeController.updateArticle);
router.delete('/:id', requirePermission('ticket.delete'),  KnowledgeController.deleteArticle);
router.get('/',      requirePermission('ticket.read'),    KnowledgeController.getArticles);
router.post('/',     requirePermission('ticket.create'),  validate(createArticleSchema), KnowledgeController.createArticle);

export default router;
