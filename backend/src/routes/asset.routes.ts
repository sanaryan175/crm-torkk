import { Router } from 'express';
import { AssetController } from '../controllers/asset.controller';
import { validate } from '../middleware/validate';
import { createAssetSchema, updateAssetSchema } from '../validations/asset.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',       requirePermission('asset.read'),   AssetController.getAssets);
router.post('/',      requirePermission('asset.create'), validate(createAssetSchema), AssetController.createAsset);
router.get('/:id',    requirePermission('asset.read'),   AssetController.getAssetById);
router.put('/:id',    requirePermission('asset.update'), validate(updateAssetSchema), AssetController.updateAsset);
router.delete('/:id', requirePermission('asset.delete'), AssetController.deleteAsset);

export default router;
