import AsyncStorage from "@react-native-async-storage/async-storage";

type CacheEntry<T> = { value: T; expiresAt: number };
type StoredEntry<T> = { value: T; expiresAt: number | null };

const STORAGE_PREFIX = "cache:";

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function isFresh(expiresAt: number): boolean {
  return expiresAt > Date.now();
}

/**
 * Returns the cached value for `key` if still fresh, otherwise runs `fetcher`
 * once (de-duping concurrent callers) and caches the result in memory for
 * `ttlMs`. Lost on app restart — use for data that mutates often (user
 * progress) or isn't JSON-serializable (e.g. a Set).
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = Infinity
): Promise<T> {
  const cached = store.get(key);
  if (cached && isFresh(cached.expiresAt)) {
    return cached.value as T;
  }

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = fetcher()
    .then((value) => {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      inflight.delete(key);
      return value;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

/**
 * Same as getCached but also persists the value to AsyncStorage, so it
 * survives app restarts (no refetch/spinner on cold start). Only use for
 * JSON-serializable, rarely-changing data such as quiz content.
 */
export async function getCachedPersistent<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = Infinity
): Promise<T> {
  const cached = store.get(key);
  if (cached && isFresh(cached.expiresAt)) {
    return cached.value as T;
  }

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_PREFIX + key);
      if (raw) {
        const stored = JSON.parse(raw) as StoredEntry<T>;
        if (stored.expiresAt === null || isFresh(stored.expiresAt)) {
          store.set(key, { value: stored.value, expiresAt: stored.expiresAt ?? Infinity });
          return stored.value;
        }
      }
    } catch {
      // 손상된 캐시는 무시하고 네트워크에서 다시 받아온다.
    }

    const value = await fetcher();
    const expiresAt = ttlMs === Infinity ? null : Date.now() + ttlMs;
    store.set(key, { value, expiresAt: expiresAt ?? Infinity });
    AsyncStorage.setItem(
      STORAGE_PREFIX + key,
      JSON.stringify({ value, expiresAt } satisfies StoredEntry<T>)
    ).catch(() => {});
    return value;
  })().finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

/** Clears a cached entry (or every key sharing a `prefix:` namespace), memory + storage. */
export function invalidateCache(prefix: string): void {
  store.delete(prefix);
  for (const key of store.keys()) {
    if (key.startsWith(`${prefix}:`)) store.delete(key);
  }

  AsyncStorage.getAllKeys()
    .then((keys) => {
      const toRemove = keys.filter(
        (k) =>
          k === STORAGE_PREFIX + prefix || k.startsWith(STORAGE_PREFIX + prefix + ":")
      );
      if (toRemove.length) return AsyncStorage.multiRemove(toRemove);
    })
    .catch(() => {});
}
