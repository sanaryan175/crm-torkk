import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller';
import { validate } from '../middleware/validate';
import { createWarehouseSchema, updateWarehouseSchema } from '../validations/warehouse.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',        requirePermission('inventory.read'),   WarehouseController.getWarehouses);
router.post('/',       requirePermission('inventory.create'), validate(createWarehouseSchema),  WarehouseController.createWarehouse);
router.get('/:id',     requirePermission('inventory.read'),   WarehouseController.getWarehouseById);
router.put('/:id',     requirePermission('inventory.update'), validate(updateWarehouseSchema),  WarehouseController.updateWarehouse);
router.delete('/:id',  requirePermission('inventory.delete'), WarehouseController.deleteWarehouse);

export default router;
