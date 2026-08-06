import { Router } from 'express';
import { AssetMaintenanceController } from '../controllers/assetmaintenance.controller';
import { validate } from '../middleware/validate';
import {
  createAssetMaintenanceSchema,
  updateAssetMaintenanceSchema,
} from '../validations/assetmaintenance.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',       requirePermission('asset.read'),   AssetMaintenanceController.getAssetMaintenances);
router.post('/',      requirePermission('asset.create'), validate(createAssetMaintenanceSchema), AssetMaintenanceController.createAssetMaintenance);
router.get('/:id',    requirePermission('asset.read'),   AssetMaintenanceController.getAssetMaintenanceById);
router.put('/:id',    requirePermission('asset.update'), validate(updateAssetMaintenanceSchema), AssetMaintenanceController.updateAssetMaintenance);
router.delete('/:id', requirePermission('asset.delete'), AssetMaintenanceController.deleteAssetMaintenance);

export default router;
