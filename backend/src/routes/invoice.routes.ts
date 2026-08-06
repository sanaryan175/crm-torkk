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

router.get('/invoices',           requirePermission('invoice.read'),   InvoiceController.getInvoices);
router.post('/invoices',          requirePermission('invoice.create'), validate(createInvoiceSchema), InvoiceController.createInvoice);
router.get('/invoices/:id',       requirePermission('invoice.read'),   InvoiceController.getInvoiceById);
router.put('/invoices/:id',       requirePermission('invoice.update'), validate(updateInvoiceSchema), InvoiceController.updateInvoice);
router.put('/invoices/:id/send',  requirePermission('invoice.update'), validate(sendInvoiceSchema), InvoiceController.sendInvoice);
router.post('/invoices/:id/payments', requirePermission('invoice.create'), validate(recordPaymentSchema), InvoiceController.recordPayment);
router.delete('/invoices/:id',    requirePermission('invoice.delete'), InvoiceController.deleteInvoice);

router.get('/payments',           requirePermission('invoice.read'),   InvoiceController.getPayments);
router.get('/payments/:id',       requirePermission('invoice.read'),   InvoiceController.getPaymentById);

export default router;
