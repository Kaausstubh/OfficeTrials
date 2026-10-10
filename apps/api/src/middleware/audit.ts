import { Request } from 'express';
import { prisma } from '../db/prisma';

export const logAuditEvent = async (
  req: Request,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> => {
  try {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Never log passwords, tokens, or raw document file binaries
    const sanitizedDetails = details ? { ...details } : {};
    delete sanitizedDetails.password;
    delete sanitizedDetails.token;
    delete sanitizedDetails.mfaSecret;

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id || null,
        action,
        resourceType,
        resourceId: resourceId || null,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.slice(0, 45) : 'unknown',
        userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 255) : 'unknown',
        details: JSON.stringify(sanitizedDetails),
      },
    });
  } catch (err) {
    console.error('Audit log failure:', err);
    // Non-blocking so main operation is not interrupted
  }
};
