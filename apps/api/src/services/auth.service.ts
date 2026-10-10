import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { config } from '../config';
import { UserRole } from '@prisma/client';

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateToken(userId: string, role: UserRole): string {
    return jwt.sign({ userId, role }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN as any,
    });
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        advocateProfile: true,
        clientProfile: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new Error('Your account is deactivated. Contact administrator.');
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(user.id, user.role);

    // Create session record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.userSession.create({
      data: {
        userId: user.id,
        tokenHash: token.slice(-20), // store safe slice/hash
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt,
      },
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isMfaEnabled: user.isMfaEnabled,
        advocateProfile: user.advocateProfile,
        clientProfile: user.clientProfile,
      },
    };
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: UserRole;
    barCouncilNumber?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await this.hashPassword(data.password);
    const role = data.role || UserRole.ADVOCATE;

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role,
        ...(role === UserRole.ADVOCATE && {
          advocateProfile: {
            create: {
              barCouncilNumber: data.barCouncilNumber || 'MAH/1234/2020',
              enrollmentYear: 2020,
            },
          },
        }),
        ...(role === UserRole.CLIENT && {
          clientProfile: {
            create: {
              preferredLang: 'en',
            },
          },
        }),
      },
      include: {
        advocateProfile: true,
        clientProfile: true,
      },
    });

    const token = this.generateToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}

export const authService = new AuthService();
