import { Response, NextFunction } from 'express';
import { CalendarService } from '../services/calendar.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class CalendarController {
  static async getEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await CalendarService.getEvents(req.user!.organizationId, {
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        userId: req.query.userId as string | undefined,
        type: req.query.type as string | undefined,
      });
      sendSuccess(res, events);
    } catch (error) { next(error); }
  }

  static async getEventById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await CalendarService.getEventById(req.params.id, req.user!.organizationId);
      sendSuccess(res, event);
    } catch (error) { next(error); }
  }

  static async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await CalendarService.createEvent(
        req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, event, 'Calendar event created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await CalendarService.updateEvent(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, event, 'Calendar event updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CalendarService.deleteEvent(
        req.params.id, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Calendar event deleted successfully');
    } catch (error) { next(error); }
  }

  static async addAttendee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const attendee = await CalendarService.addAttendee(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, attendee, 'Attendee added successfully', 201);
    } catch (error) { next(error); }
  }

  static async removeAttendee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CalendarService.removeAttendee(
        req.params.id, req.params.attendeeId, req.user!.organizationId, req.user!.userId, req
      );
      sendSuccess(res, result, 'Attendee removed successfully');
    } catch (error) { next(error); }
  }

  static async addReminder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reminder = await CalendarService.addReminder(
        req.params.id, req.user!.organizationId, req.user!.userId, req.body, req
      );
      sendSuccess(res, reminder, 'Reminder added successfully', 201);
    } catch (error) { next(error); }
  }
}
