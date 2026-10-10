import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config(); // fallback to local .env

const envSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('postgresql://advocate_user:advocate_pass@localhost:5432/advocate_desk?schema=public'),
  JWT_SECRET: z.string().default('advocate-case-desk-super-secure-production-jwt-secret-key-32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('./storage/documents'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  USE_REDIS_QUEUE: z.string().default('false').transform(val => val === 'true'),
  OCR_ENGINE: z.string().default('tesseract'),
  OCR_DEFAULT_LANGUAGES: z.string().default('eng+hin+mar'),
  AI_PROVIDER: z.enum(['fallback', 'openai', 'gemini', 'anthropic']).default('fallback'),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
