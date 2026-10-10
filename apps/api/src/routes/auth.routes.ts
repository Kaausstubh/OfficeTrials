import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { logAuditEvent } from '../middleware/audit';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['ADVOCATE', 'ASSOCIATE_ADVOCATE', 'LEGAL_STAFF', 'CLIENT']).optional(),
  barCouncilNumber: z.string().optional(),
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];

    const result = await authService.login(data.email, data.password, ip, ua);

    // Set secure HttpOnly cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAuditEvent(req, 'LOGIN_SUCCESS', 'User', result.user.id, {
      email: result.user.email,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

router.post('/logout', authenticate, async (req, res) => {
  res.clearCookie('token');
  await logAuditEvent(req, 'LOGOUT', 'User', req.user?.id);
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

export default router;
