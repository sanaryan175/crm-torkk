import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { validate } from '../middleware/validate';
import { createVendorSchema, updateVendorSchema } from '../validations/vendor.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',        requirePermission('procurement.read'),   VendorController.getVendors);
router.post('/',       requirePermission('procurement.create'), validate(createVendorSchema), VendorController.createVendor);
router.get('/:id',     requirePermission('procurement.read'),   VendorController.getVendorById);
router.put('/:id',     requirePermission('procurement.update'), validate(updateVendorSchema), VendorController.updateVendor);
router.delete('/:id',  requirePermission('procurement.delete'), VendorController.deleteVendor);

export default router;
