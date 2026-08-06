import { Router } from 'express';
import { CalendarController } from '../controllers/calendar.controller';
import { validate } from '../middleware/validate';
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
  addAttendeeSchema,
  addReminderSchema,
} from '../validations/calendar.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',                  requirePermission('calendar.read'),   CalendarController.getEvents);
router.post('/',                 requirePermission('calendar.create'), validate(createCalendarEventSchema), CalendarController.createEvent);
router.get('/:id',               requirePermission('calendar.read'),   CalendarController.getEventById);
router.put('/:id',               requirePermission('calendar.update'), validate(updateCalendarEventSchema), CalendarController.updateEvent);
router.delete('/:id',            requirePermission('calendar.delete'), CalendarController.deleteEvent);
router.post('/:id/attendees',    requirePermission('calendar.update'), validate(addAttendeeSchema), CalendarController.addAttendee);
router.delete('/:id/attendees/:attendeeId', requirePermission('calendar.update'), CalendarController.removeAttendee);
router.post('/:id/reminders',    requirePermission('calendar.update'), validate(addReminderSchema), CalendarController.addReminder);

export default router;
