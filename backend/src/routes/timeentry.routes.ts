import { Router } from 'express';
import { TimeEntryController } from '../controllers/timeentry.controller';
import { validate } from '../middleware/validate';
import { createTimeEntrySchema, updateTimeEntrySchema } from '../validations/timeentry.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',    requirePermission('project.read'),   TimeEntryController.getTimeEntries);
router.post('/',   requirePermission('project.create'), validate(createTimeEntrySchema), TimeEntryController.createTimeEntry);
router.get('/:id', requirePermission('project.read'),   TimeEntryController.getTimeEntryById);
router.put('/:id', requirePermission('project.update'), validate(updateTimeEntrySchema), TimeEntryController.updateTimeEntry);
router.delete('/:id', requirePermission('project.delete'), TimeEntryController.deleteTimeEntry);

export default router;
