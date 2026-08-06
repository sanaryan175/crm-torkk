import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AttendeeStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const CALENDAR_EVENT_INCLUDE = {
  attendees: true,
} as const;

const REMINDER_MODEL = 'CalendarEvent';

interface EventAttendeeInput {
  userId: string;
  status?: string;
}

interface EventReminderInput {
  userId?: string;
  remindAt: Date;
}

interface EventData {
  title?: string;
  description?: string | null;
  startDate?: Date;
  endDate?: Date | null;
  allDay?: boolean;
  type?: any;
  location?: string | null;
  relatedModel?: string | null;
  relatedId?: string | null;
  attendees?: EventAttendeeInput[];
  reminders?: EventReminderInput[];
}

export class CalendarService {
  private static async attachReminders(events: any[], organizationId: string) {
    if (events.length === 0) return events;
    const ids = events.map((e) => e.id);
    const reminders = await prisma.reminder.findMany({
      where: {
        organizationId,
        relatedModel: REMINDER_MODEL,
        relatedId: { in: ids },
      },
      orderBy: { remindAt: 'asc' },
    });
    const byEvent = new Map<string, any[]>();
    for (const r of reminders) {
      const key = r.relatedId ?? '';
      const list = byEvent.get(key) ?? [];
      list.push(r);
      byEvent.set(key, list);
    }
    return events.map((e) => ({ ...e, reminders: byEvent.get(e.id) ?? [] }));
  }

  static async getEvents(
    organizationId: string,
    filters?: { from?: string; to?: string; userId?: string; type?: string }
  ) {
    const where: any = { organizationId };
    const startRange: any = {};
    if (filters?.from) {
      const from = new Date(filters.from);
      if (!isNaN(from.getTime())) startRange.gte = from;
    }
    if (filters?.to) {
      const to = new Date(filters.to);
      if (!isNaN(to.getTime())) startRange.lte = to;
    }
    if (Object.keys(startRange).length > 0) where.startDate = startRange;
    if (filters?.type) where.type = filters.type;
    if (filters?.userId) where.attendees = { some: { userId: filters.userId } };

    const events = await prisma.calendarEvent.findMany({
      where,
      include: CALENDAR_EVENT_INCLUDE,
      orderBy: { startDate: 'asc' },
    });
    return this.attachReminders(events, organizationId);
  }

  static async getEventById(id: string, organizationId: string) {
    const event = await prisma.calendarEvent.findFirst({
      where: { id, organizationId },
      include: CALENDAR_EVENT_INCLUDE,
    });
    if (!event) throw new NotFoundError('Calendar event not found');
    const [withReminders] = await this.attachReminders([event], organizationId);
    return withReminders;
  }

  static async createEvent(
    organizationId: string,
    createdById: string,
    data: EventData,
    req?: any
  ) {
    if (!data.title || !data.startDate) {
      throw new BadRequestError('Title and startDate are required');
    }
    const event = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        allDay: data.allDay,
        type: data.type,
        location: data.location,
        relatedModel: data.relatedModel,
        relatedId: data.relatedId,
        organizationId,
        createdById,
      },
      include: CALENDAR_EVENT_INCLUDE,
    });

    if (data.attendees?.length) {
      await prisma.eventAttendee.createMany({
        data: data.attendees.map((a) => ({
          organizationId,
          eventId: event.id,
          userId: a.userId,
          status: (a.status ?? AttendeeStatus.pending) as AttendeeStatus,
        })),
      });
    }

    if (data.reminders?.length) {
      await prisma.reminder.createMany({
        data: data.reminders.map((r) => ({
          organizationId,
          title: event.title,
          remindAt: r.remindAt,
          relatedModel: REMINDER_MODEL,
          relatedId: event.id,
          userId: r.userId ?? createdById,
        })),
      });
    }

    await AuditService.created(organizationId, createdById, 'calendar_event', event.id, undefined, req);
    return this.getEventById(event.id, organizationId);
  }

  static async updateEvent(
    id: string,
    organizationId: string,
    actorId: string,
    data: EventData,
    req?: any
  ) {
    await this.getEventById(id, organizationId);
    const updated = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        allDay: data.allDay,
        type: data.type,
        location: data.location,
        relatedModel: data.relatedModel,
        relatedId: data.relatedId,
      },
      include: CALENDAR_EVENT_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'calendar_event', id, data, req);
    const [withReminders] = await this.attachReminders([updated], organizationId);
    return withReminders;
  }

  static async deleteEvent(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getEventById(id, organizationId);
    await prisma.calendarEvent.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'calendar_event', id, undefined, req);
    return { success: true };
  }

  static async addAttendee(
    eventId: string,
    organizationId: string,
    actorId: string,
    data: { userId: string; status?: string },
    req?: any
  ) {
    await this.getEventById(eventId, organizationId);
    const attendee = await prisma.eventAttendee.create({
      data: {
        organizationId,
        eventId,
        userId: data.userId,
        status: (data.status ?? AttendeeStatus.pending) as AttendeeStatus,
      },
    });
    await AuditService.created(organizationId, actorId, 'event_attendee', attendee.id, undefined, req);
    return attendee;
  }

  static async removeAttendee(
    eventId: string,
    attendeeId: string,
    organizationId: string,
    actorId: string,
    req?: any
  ) {
    await this.getEventById(eventId, organizationId);
    const attendee = await prisma.eventAttendee.findFirst({
      where: { id: attendeeId, eventId, organizationId },
    });
    if (!attendee) throw new NotFoundError('Event attendee not found');
    await prisma.eventAttendee.delete({ where: { id: attendeeId } });
    await AuditService.deleted(organizationId, actorId, 'event_attendee', attendeeId, undefined, req);
    return { success: true };
  }

  static async addReminder(
    eventId: string,
    organizationId: string,
    actorId: string,
    data: { userId?: string; remindAt: Date },
    req?: any
  ) {
    const event = await this.getEventById(eventId, organizationId);
    const reminder = await prisma.reminder.create({
      data: {
        organizationId,
        title: event.title,
        remindAt: data.remindAt,
        relatedModel: REMINDER_MODEL,
        relatedId: event.id,
        userId: data.userId ?? actorId,
      },
    });
    await AuditService.created(organizationId, actorId, 'reminder', reminder.id, undefined, req);
    return reminder;
  }
}
