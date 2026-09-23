import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-meeting-room-key-2026';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      res.status(400).json({ message: 'Email already registered.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: 'USER',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0].message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isValid = await bcrypt.compare(validated.password, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0].message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/google
router.get('/google', (req: Request, res: Response): void => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!clientId || !clientSecret) {
    res.redirect(`${frontendUrl}?oauth_error=${encodeURIComponent('ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET ใน server/.env')}&provider=google`);
    return;
  }

  const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email&access_type=online&prompt=select_account`;
  res.redirect(googleAuthUrl);
});

// GET /api/auth/google/callback
router.get('/google/callback', async (req: Request, res: Response): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const { code, error } = req.query;

  if (error || !code) {
    res.redirect(`${frontendUrl}?oauth_error=${encodeURIComponent('การเข้าสู่ระบบด้วย Google ถูกยกเลิกหรือไม่สำเร็จ')}`);
    return;
  }

  try {
    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to obtain access token from Google');
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = (await userRes.json()) as any;

    if (!googleUser.email) {
      throw new Error('Google did not provide an email address');
    }

    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await prisma.user.create({
        data: {
          name: googleUser.name || googleUser.email.split('@')[0],
          email: googleUser.email,
          password: dummyPassword,
          role: 'USER',
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${frontendUrl}?token=${token}&provider=google`);
  } catch (err: any) {
    console.error('Google OAuth callback error:', err);
    res.redirect(`${frontendUrl}?oauth_error=${encodeURIComponent(err.message || 'Google authentication failed')}`);
  }
});

// GET /api/auth/github
router.get('/github', (req: Request, res: Response): void => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!clientId || !clientSecret) {
    res.redirect(`${frontendUrl}?oauth_error=${encodeURIComponent('ยังไม่ได้ตั้งค่า GITHUB_CLIENT_ID และ GITHUB_CLIENT_SECRET ใน server/.env')}&provider=github`);
    return;
  }

  const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email`;
  res.redirect(githubAuthUrl);
});

// GET /api/auth/github/callback
router.get('/github/callback', async (req: Request, res: Response): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const { code, error } = req.query;

  if (error || !code) {
    res.redirect(`${frontendUrl}?oauth_error=${encodeURIComponent('การเข้าสู่ระบบด้วย GitHub ถูกยกเลิกหรือไม่สำเร็จ')}`);
    return;
  }

  try {
    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`;
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code: code as string,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to obtain access token from GitHub');
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'meeting-room-booking',
      },
    });
    const githubUser = (await userRes.json()) as any;

    let email = githubUser.email;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'meeting-room-booking',
        },
      });
      const emailsData = (await emailsRes.json()) as any;
      if (Array.isArray(emailsData)) {
        const primary = emailsData.find((e: any) => e.primary && e.verified) || emailsData[0];
        if (primary) email = primary.email;
      }
    }

    if (!email) {
      email = `${githubUser.login || 'user'}@users.noreply.github.com`;
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await prisma.user.create({
        data: {
          name: githubUser.name || githubUser.login || email.split('@')[0],
          email,
          password: dummyPassword,
          role: 'USER',
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${frontendUrl}?token=${token}&provider=github`);
  } catch (err: any) {
    console.error('GitHub OAuth callback error:', err);
    res.redirect(`${frontendUrl}?oauth_error=${encodeURIComponent(err.message || 'GitHub authentication failed')}`);
  }
});

// GET /api/auth/demo-oauth?provider=google|github
router.get('/demo-oauth', async (req: Request, res: Response): Promise<void> => {
  const provider = (req.query.provider as string) || 'google';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const mockUser = provider === 'github' ? {
    name: 'GitHub Developer (Demo)',
    email: 'dev.github@company.com',
    role: 'USER',
  } : {
    name: 'Google User (Demo)',
    email: 'user.google@gmail.com',
    role: 'USER',
  };

  try {
    let user = await prisma.user.findUnique({
      where: { email: mockUser.email },
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash('demo-oauth-password', 10);
      user = await prisma.user.create({
        data: {
          name: mockUser.name,
          email: mockUser.email,
          password: dummyPassword,
          role: mockUser.role,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${frontendUrl}?token=${token}&provider=${provider}`);
  } catch (err: any) {
    res.redirect(`${frontendUrl}?oauth_error=${encodeURIComponent('Demo OAuth failed')}`);
  }
});

export default router;
