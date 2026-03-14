import prisma from '@/lib/prisma';

export type AuditAction = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'ASSESSMENT_CREATED'
  | 'ASSESSMENT_VIEWED'
  | 'ASSESSMENT_DELETED'
  | 'REPORT_VIEWED'
  | 'REPORT_DOWNLOADED'
  | 'COHORT_CREATED'
  | 'COHORT_UPDATED'
  | 'COHORT_DELETED'
  | 'EMAIL_SENT'
  | 'ADMIN_ACTION';

export interface AuditLogParams {
  action: AuditAction;
  entityType?: 'user' | 'assessment' | 'cohort' | 'report';
  entityId?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Create an audit log entry
 */
export async function auditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        userId: params.userId,
        userEmail: params.userEmail,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: params.metadata || {},
      },
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('[Audit] Failed to create audit log:', error);
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(options: {
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  
  if (options.action) where.action = options.action;
  if (options.entityType) where.entityType = options.entityType;
  if (options.userId) where.userId = options.userId;
  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) where.createdAt.gte = options.startDate;
    if (options.endDate) where.createdAt.lte = options.endDate;
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit || 50,
    skip: options.offset || 0,
  });

  return logs;
}
