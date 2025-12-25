import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
// Create a PostgreSQL connection pool for transaction pooling
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
// Initialize Prisma Client with the adapter
const prisma = new PrismaClient({ adapter });
export default prisma;
