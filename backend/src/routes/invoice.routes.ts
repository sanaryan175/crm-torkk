import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { validate } from '../middleware/validate';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  sendInvoiceSchema,
  recordPaymentSchema,
} from '../validations/invoice.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',           requirePermission('invoice.read'),   InvoiceController.getInvoices);
router.post('/',          requirePermission('invoice.create'), validate(createInvoiceSchema), InvoiceController.createInvoice);
router.get('/:id',       requirePermission('invoice.read'),   InvoiceController.getInvoiceById);
router.put('/:id',       requirePermission('invoice.update'), validate(updateInvoiceSchema), InvoiceController.updateInvoice);
router.put('/:id/send',  requirePermission('invoice.update'), validate(sendInvoiceSchema), InvoiceController.sendInvoice);
router.post('/:id/payments', requirePermission('invoice.create'), validate(recordPaymentSchema), InvoiceController.recordPayment);
router.delete('/:id',    requirePermission('invoice.delete'), InvoiceController.deleteInvoice);

router.get('/payments',           requirePermission('invoice.read'),   InvoiceController.getPayments);
router.get('/payments/:id',       requirePermission('invoice.read'),   InvoiceController.getPaymentById);

export default router;
