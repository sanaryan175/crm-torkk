import { Router } from 'express';
import { TimelineController } from '../controllers/timeline.controller';
import { validate } from '../middleware/validate';
import { createTimelineEntrySchema } from '../validations/timeline.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',        requirePermission('activity.read'),   TimelineController.getTimeline);
router.post('/',       requirePermission('activity.create'), validate(createTimelineEntrySchema), TimelineController.createTimelineEntry);
router.delete('/:id',  requirePermission('activity.delete'), TimelineController.deleteTimelineEntry);

export default router;
