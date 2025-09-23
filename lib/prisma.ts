// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

// Extiende el objeto global para incluir prisma
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'], // opcional, útil en desarrollo
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma;