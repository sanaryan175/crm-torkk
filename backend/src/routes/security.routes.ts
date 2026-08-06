import { Router } from 'express';
import { SecurityController } from '../controllers/security.controller';
import { validate } from '../middleware/validate';
import { authenticate, requirePermission } from '../middleware/auth';
import {
  createApiKeySchema,
  updateTwoFactorSchema,
  verifyTwoFactorSchema,
  loginHistoryQuerySchema,
} from '../validations/security.validation';

const router = Router();

router.use(authenticate);

router.get('/api-keys',           requirePermission('security.read'),     SecurityController.listApiKeys);
router.post('/api-keys',          requirePermission('security.create'),   validate(createApiKeySchema),      SecurityController.createApiKey);
router.delete('/api-keys/:id',    requirePermission('security.delete'),   SecurityController.revokeApiKey);

router.get('/two-factor',         requirePermission('security.read'),     SecurityController.getTwoFactorSetting);
router.put('/two-factor',         requirePermission('security.update'),   validate(updateTwoFactorSchema),   SecurityController.updateTwoFactorSetting);
router.post('/two-factor/verify', requirePermission('security.update'),   validate(verifyTwoFactorSchema),   SecurityController.verifyTwoFactor);

router.get('/login-history',      requirePermission('security.read'),     validate(loginHistoryQuerySchema), SecurityController.getLoginHistory);

export default router;
