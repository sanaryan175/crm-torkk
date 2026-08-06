import { z } from 'zod';

const attendeeInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  status: z.enum(['pending', 'accepted', 'declined', 'tentative']).optional(),
});

const reminderInputSchema = z.object({
  userId: z.string().min(1).optional(),
  remindAt: z.coerce.date(),
});

const baseEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  allDay: z.boolean().optional(),
  type: z.enum(['meeting', 'interview', 'event', 'reminder', 'task', 'training']).optional(),
  location: z.string().nullable().optional(),
  relatedModel: z.string().nullable().optional(),
  relatedId: z.string().nullable().optional(),
});

export const createCalendarEventSchema = z.object({
  body: baseEventSchema.extend({
    attendees: z.array(attendeeInputSchema).optional(),
    reminders: z.array(reminderInputSchema).optional(),
  }),
});

export const updateCalendarEventSchema = z.object({
  body: baseEventSchema.partial(),
});

export const addAttendeeSchema = z.object({
  body: attendeeInputSchema,
});

export const addReminderSchema = z.object({
  body: reminderInputSchema,
});
