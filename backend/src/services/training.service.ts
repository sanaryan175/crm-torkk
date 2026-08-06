import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

const TRAINING_INCLUDE = {
  enrollments: { orderBy: { id: 'desc' as const } },
};

export class TrainingService {
  private static async ensureEmployee(organizationId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });
    if (!employee) throw new NotFoundError('Employee not found');
  }

  private static async getEnrollment(trainingId: string, enrollmentId: string, organizationId: string) {
    const enrollment = await prisma.trainingEnrollment.findFirst({
      where: { id: enrollmentId, trainingId, organizationId },
    });
    if (!enrollment) throw new NotFoundError('Training enrollment not found');
    return enrollment;
  }

  static async getTrainings(organizationId: string) {
    return prisma.training.findMany({
      where: { organizationId },
      include: TRAINING_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getTrainingById(id: string, organizationId: string) {
    const training = await prisma.training.findFirst({
      where: { id, organizationId },
      include: TRAINING_INCLUDE,
    });
    if (!training) throw new NotFoundError('Training not found');
    return training;
  }

  static async createTraining(
    organizationId: string,
    createdById: string,
    data: {
      title: string; description?: string | null; type?: string | null; startDate?: Date | null;
      endDate?: Date | null; status?: any;
    },
    req?: any
  ) {
    const training = await prisma.training.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        organizationId,
        createdById,
      },
      include: TRAINING_INCLUDE,
    });
    await AuditService.created(organizationId, createdById, 'training', training.id, undefined, req);
    return training;
  }

  static async updateTraining(
    id: string,
    organizationId: string,
    actorId: string,
    data: any,
    req?: any
  ) {
    await this.getTrainingById(id, organizationId);
    const updated = await prisma.training.update({
      where: { id },
      data,
      include: TRAINING_INCLUDE,
    });
    await AuditService.updated(organizationId, actorId, 'training', id, data, req);
    return updated;
  }

  static async enrollEmployee(
    trainingId: string,
    organizationId: string,
    actorId: string,
    employeeId: string,
    req?: any
  ) {
    await this.getTrainingById(trainingId, organizationId);
    await this.ensureEmployee(organizationId, employeeId);

    const existing = await prisma.trainingEnrollment.findFirst({
      where: { trainingId, employeeId, organizationId },
    });
    if (existing) return existing;

    const enrollment = await prisma.trainingEnrollment.create({
      data: {
        trainingId,
        employeeId,
        status: 'enrolled',
        organizationId,
      },
    });
    await AuditService.created(organizationId, actorId, 'trainingEnrollment', enrollment.id, { trainingId, employeeId }, req);
    return enrollment;
  }

  static async completeEnrollment(
    trainingId: string,
    enrollmentId: string,
    organizationId: string,
    actorId: string,
    req?: any
  ) {
    await this.getTrainingById(trainingId, organizationId);
    await this.getEnrollment(trainingId, enrollmentId, organizationId);
    const enrollment = await prisma.trainingEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'completed',
        completionDate: new Date(),
      },
    });
    await AuditService.updated(organizationId, actorId, 'trainingEnrollment', enrollmentId, { status: 'completed' }, req);
    return enrollment;
  }

  static async deleteTraining(id: string, organizationId: string, actorId: string, req?: any) {
    await this.getTrainingById(id, organizationId);
    await prisma.training.delete({ where: { id } });
    await AuditService.deleted(organizationId, actorId, 'training', id, undefined, req);
    return { success: true };
  }
}
