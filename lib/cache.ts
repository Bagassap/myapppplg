type CacheEntry<T> = {
    data: T;
    expiresAt: number;
};

class SimpleCache {
    private store = new Map<string, CacheEntry<unknown>>();

    get<T>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.data as T;
    }

    set<T>(key: string, data: T, ttlSeconds = 30): void {
        this.store.set(key, {
            data,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
        if (this.store.size > 500) this.cleanup();
    }

    invalidate(pattern: string): void {
        for (const key of this.store.keys()) {
            if (key.startsWith(pattern)) this.store.delete(key);
        }
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store) {
            if (now > entry.expiresAt) this.store.delete(key);
        }
    }
}

export const cache = new SimpleCache();
export async function cachedQuery<T>(
    key: string,
    ttlSeconds: number,
    queryFn: () => Promise<T>
): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached !== null) return cached;

    const data = await queryFn();
    cache.set(key, data, ttlSeconds);
    return data;
}
