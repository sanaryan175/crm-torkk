import { Router } from 'express';
import { TaxRateController } from '../controllers/taxrate.controller';
import { validate } from '../middleware/validate';
import { createTaxRateSchema, updateTaxRateSchema } from '../validations/taxrate.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',        requirePermission('finance.read'),   TaxRateController.getTaxRates);
router.post('/',       requirePermission('finance.create'), validate(createTaxRateSchema),  TaxRateController.createTaxRate);
router.get('/:id',     requirePermission('finance.read'),   TaxRateController.getTaxRateById);
router.put('/:id',     requirePermission('finance.update'), validate(updateTaxRateSchema),  TaxRateController.updateTaxRate);
router.delete('/:id',  requirePermission('finance.delete'), TaxRateController.deleteTaxRate);

export default router;
