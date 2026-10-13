// Caché ligera para lecturas de Supabase: memoria + localStorage con TTL
// y deduplicación de peticiones simultáneas a la misma clave.

type Entry<T> = { data: T; ts: number };

const STORAGE_PREFIX = 'rol:cache:';
const memory = new Map<string, Entry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

function storageGet<T>(key: string): Entry<T> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as Entry<T>) : null;
  } catch {
    return null;
  }
}

function storageSet<T>(key: string, entry: Entry<T>) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Sin espacio o storage no disponible: nos quedamos con la caché en memoria
  }
}

// Devuelve el valor cacheado si sigue vigente (síncrono)
export function readCache<T>(key: string, ttlMs: number): T | null {
  let entry = memory.get(key) as Entry<T> | undefined;
  if (!entry) {
    const stored = storageGet<T>(key);
    if (stored) {
      entry = stored;
      memory.set(key, stored);
    }
  }
  if (entry && Date.now() - entry.ts < ttlMs) return entry.data;
  return null;
}

export function invalidateCache(key: string) {
  memory.delete(key);
  inFlight.delete(key);
  try {
    window.localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // ignore
  }
}

export async function cachedQuery<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  options: { force?: boolean } = {}
): Promise<T> {
  if (!options.force) {
    const cached = readCache<T>(key, ttlMs);
    if (cached !== null) return cached;
    const pending = inFlight.get(key) as Promise<T> | undefined;
    if (pending) return pending;
  }

  const promise = fetcher()
    .then((data) => {
      const entry = { data, ts: Date.now() };
      memory.set(key, entry);
      storageSet(key, entry);
      return data;
    })
    .finally(() => {
      if (inFlight.get(key) === promise) inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}
