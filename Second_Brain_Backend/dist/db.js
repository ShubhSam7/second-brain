"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Prisma Client will use the DATABASE_URL from .env automatically
const prisma = new client_1.PrismaClient();
exports.default = prisma;
