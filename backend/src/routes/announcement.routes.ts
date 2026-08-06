import { Router } from 'express';
import { AnnouncementController } from '../controllers/announcement.controller';
import { validate } from '../middleware/validate';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from '../validations/announcement.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',       requirePermission('announcement.read'),   AnnouncementController.getAnnouncements);
router.post('/',      requirePermission('announcement.create'), validate(createAnnouncementSchema), AnnouncementController.createAnnouncement);
router.get('/:id',    requirePermission('announcement.read'),   AnnouncementController.getAnnouncementById);
router.put('/:id',    requirePermission('announcement.update'), validate(updateAnnouncementSchema), AnnouncementController.updateAnnouncement);
router.delete('/:id', requirePermission('announcement.delete'), AnnouncementController.deleteAnnouncement);

export default router;
