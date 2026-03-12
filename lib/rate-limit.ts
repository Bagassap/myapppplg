type LimitEntry = {
    count: number;
    resetAt: number;
};

class RateLimiter {
    private store = new Map<string, LimitEntry>();

    /**
     * @param key
     * @param limit
     * @param windowMs 
     * @returns { allowed, remaining, resetIn }
     */
    check(
        key: string,
        limit: number,
        windowMs: number
    ): { allowed: boolean; remaining: number; resetIn: number } {
        const now = Date.now();
        const entry = this.store.get(key);

        if (!entry || now > entry.resetAt) {
            this.store.set(key, { count: 1, resetAt: now + windowMs });
            return { allowed: true, remaining: limit - 1, resetIn: windowMs };
        }

        if (entry.count >= limit) {
            return {
                allowed: false,
                remaining: 0,
                resetIn: entry.resetAt - now,
            };
        }

        entry.count++;
        return {
            allowed: true,
            remaining: limit - entry.count,
            resetIn: entry.resetAt - now,
        };
    }

    reset(key: string): void {
        this.store.delete(key);
    }
}

export const rateLimiter = new RateLimiter();
export function checkAbsenLimit(userId: string) {
    return rateLimiter.check(`absen:${userId}`, 3, 10_000);
}

export function checkLoginLimit(ip: string) {
    return rateLimiter.check(`login:${ip}`, 10, 5 * 60_000);
}

export function checkApiLimit(userId: string) {
    return rateLimiter.check(`api:${userId}`, 60, 60_000);
}