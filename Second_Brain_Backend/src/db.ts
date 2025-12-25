import { PrismaClient } from '@prisma/client';

// Prisma Client will use the DATABASE_URL from .env automatically
const prisma = new PrismaClient();

export default prisma;
