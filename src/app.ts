import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'error' }],
});

prisma.$on('error', (event: Prisma.LogEvent) => {
  console.error('Prisma error:', event.message);
});

const app: Application = express();
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
