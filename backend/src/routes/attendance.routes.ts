import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { validate } from '../middleware/validate';
import { createAttendanceSchema, updateAttendanceSchema } from '../validations/attendance.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',    requirePermission('hr.read'),   AttendanceController.getAttendance);
router.post('/',   requirePermission('hr.create'), validate(createAttendanceSchema), AttendanceController.createAttendance);
router.get('/:id', requirePermission('hr.read'),   AttendanceController.getAttendanceById);
router.put('/:id', requirePermission('hr.update'), validate(updateAttendanceSchema), AttendanceController.updateAttendance);
router.delete('/:id', requirePermission('hr.delete'), AttendanceController.deleteAttendance);

export default router;
