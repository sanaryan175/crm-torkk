import { Router } from 'express';
import { CommissionController } from '../controllers/commission.controller';
import { validate } from '../middleware/validate';
import { getCommissionsSchema } from '../validations/commission.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',        requirePermission('sale.read'), validate(getCommissionsSchema), CommissionController.getCommissions);
router.get('/:id',     requirePermission('sale.read'), CommissionController.getCommissionById);

export default router;
