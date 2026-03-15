/**
 * Request de-duplication helper
 *
 * Prevents duplicate API calls caused by rapid re-renders (e.g. React StrictMode)
 * by reusing in-flight promises and optional short-lived response cache.
 */

type CacheEntry = {
    value: unknown;
    expiresAt: number;
};

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

interface DedupeOptions {
    cacheMs?: number;
    force?: boolean;
}

export const dedupeRequest = async <T>(
    key: string,
    requestFactory: () => Promise<T>,
    options: DedupeOptions = {}
): Promise<T> => {
    const { cacheMs = 0, force = false } = options;

    if (!force) {
        const cached = responseCache.get(key);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.value as T;
        }

        const inFlight = inFlightRequests.get(key);
        if (inFlight) {
            return inFlight as Promise<T>;
        }
    }

    const request = requestFactory()
        .then((result) => {
            if (cacheMs > 0) {
                responseCache.set(key, {
                    value: result,
                    expiresAt: Date.now() + cacheMs,
                });
            }
            return result;
        })
        .finally(() => {
            inFlightRequests.delete(key);
        });

    inFlightRequests.set(key, request as Promise<unknown>);
    return request;
};

export const invalidateDedupedRequest = (key: string): void => {
    responseCache.delete(key);
    inFlightRequests.delete(key);
};

export const invalidateDedupedRequestsByPrefix = (prefix: string): void => {
    for (const cacheKey of responseCache.keys()) {
        if (cacheKey.startsWith(prefix)) {
            responseCache.delete(cacheKey);
        }
    }

    for (const inFlightKey of inFlightRequests.keys()) {
        if (inFlightKey.startsWith(prefix)) {
            inFlightRequests.delete(inFlightKey);
        }
    }
};
