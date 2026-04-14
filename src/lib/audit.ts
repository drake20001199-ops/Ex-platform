import { prisma } from "@/lib/db";

interface AuditParams {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
}

export async function createAuditLog(params: AuditParams) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue != null ? JSON.parse(JSON.stringify(params.oldValue)) : undefined,
      newValue: params.newValue != null ? JSON.parse(JSON.stringify(params.newValue)) : undefined,
      ipAddress: params.ipAddress,
    },
  });
}

interface ActivityParams {
  eventType: string;
  userId: string;
  entityId?: string;
  description: string;
}

export async function createActivityEvent(params: ActivityParams) {
  return prisma.activityEvent.create({
    data: {
      eventType: params.eventType,
      userId: params.userId,
      entityId: params.entityId,
      description: params.description,
    },
  });
}
