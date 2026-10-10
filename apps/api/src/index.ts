import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './db/prisma';

const app = express();

// Security and utility middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // allow inline scripts in dev
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost or frontend origin
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      service: 'Advocate Case Desk API',
      timestamp: new Date().toISOString(),
      database: 'connected (PostgreSQL)',
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
    });
  }
});

// Mount API routes
app.use(config.API_PREFIX, apiRoutes);

// Central error handler
app.use(errorHandler);

const server = app.listen(config.PORT, () => {
  console.log(`⚖️  Advocate Case Desk API running on http://localhost:${config.PORT}`);
  console.log(`📌 API Base: http://localhost:${config.PORT}${config.API_PREFIX}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected, process exiting');
  });
});

export default app;
