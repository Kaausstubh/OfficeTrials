import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../db/prisma';
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Bearer authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.query && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
      });
      return;
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      userId: string;
      role: UserRole;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        organizationId: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account is inactive or no longer exists.',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      organizationId: user.organizationId,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
};
