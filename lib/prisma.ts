import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
    var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 25,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        allowExitOnIdle: false,
    });

    pool.on('error', (err) => {
        console.error('[PG Pool] Unexpected error:', err.message);
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development'
            ? ['warn', 'error']
            : ['error'],
    });
}

export const prisma = global.__prisma ?? createPrismaClient();
global.__prisma = prisma;