import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import { validate } from '../middleware/validate';
import { createCampaignSchema, updateCampaignSchema, sendCampaignSchema } from '../validations/campaign.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',              requirePermission('marketing.read'),     CampaignController.getCampaigns);
router.post('/',             requirePermission('marketing.create'),   validate(createCampaignSchema), CampaignController.createCampaign);
router.get('/:id',           requirePermission('marketing.read'),     CampaignController.getCampaignById);
router.put('/:id',           requirePermission('marketing.update'),   validate(updateCampaignSchema), CampaignController.updateCampaign);
router.post('/:id/send',     requirePermission('marketing.update'),   validate(sendCampaignSchema),   CampaignController.sendCampaign);
router.delete('/:id',        requirePermission('marketing.delete'),   CampaignController.deleteCampaign);

export default router;
