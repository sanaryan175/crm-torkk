import { Router } from 'express';
import { StockMovementController } from '../controllers/stockmovement.controller';
import { validate } from '../middleware/validate';
import { createStockMovementSchema } from '../validations/stockmovement.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',        requirePermission('inventory.read'),   StockMovementController.getStockMovements);
router.post('/',       requirePermission('inventory.create'), validate(createStockMovementSchema), StockMovementController.createStockMovement);
router.get('/:id',     requirePermission('inventory.read'),   StockMovementController.getStockMovementById);
router.delete('/:id',  requirePermission('inventory.delete'), StockMovementController.deleteStockMovement);

export default router;
