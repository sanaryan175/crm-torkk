import { Router } from 'express';
import { QuoteController } from '../controllers/quote.controller';
import { validate } from '../middleware/validate';
import { createQuoteSchema, updateQuoteSchema, convertQuoteSchema } from '../validations/quote.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',           requirePermission('quote.read'),   QuoteController.getQuotes);
router.post('/',          requirePermission('quote.create'), validate(createQuoteSchema), QuoteController.createQuote);
router.get('/:id',       requirePermission('quote.read'),   QuoteController.getQuoteById);
router.put('/:id',       requirePermission('quote.update'), validate(updateQuoteSchema), QuoteController.updateQuote);
router.post('/:id/convert', requirePermission('quote.update'), validate(convertQuoteSchema), QuoteController.convertQuote);
router.delete('/:id',    requirePermission('quote.delete'), QuoteController.deleteQuote);

export default router;
