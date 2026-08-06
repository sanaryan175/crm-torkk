import { Router } from 'express';
import { QuoteController } from '../controllers/quote.controller';
import { validate } from '../middleware/validate';
import { createQuoteSchema, updateQuoteSchema, convertQuoteSchema } from '../validations/quote.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/quotes',           requirePermission('quote.read'),   QuoteController.getQuotes);
router.post('/quotes',          requirePermission('quote.create'), validate(createQuoteSchema), QuoteController.createQuote);
router.get('/quotes/:id',       requirePermission('quote.read'),   QuoteController.getQuoteById);
router.put('/quotes/:id',       requirePermission('quote.update'), validate(updateQuoteSchema), QuoteController.updateQuote);
router.post('/quotes/:id/convert', requirePermission('quote.update'), validate(convertQuoteSchema), QuoteController.convertQuote);
router.delete('/quotes/:id',    requirePermission('quote.delete'), QuoteController.deleteQuote);

export default router;
