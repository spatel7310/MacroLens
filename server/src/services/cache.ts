import NodeCache from 'node-cache'

const cache = new NodeCache({ checkperiod: 120 })

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key)
}

export function setCache<T>(key: string, value: T, ttlSeconds: number): void {
  cache.set(key, value, ttlSeconds)
}

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = getCached<T>(key)
  if (cached !== undefined) return cached
  const value = await fetcher()
  setCache(key, value, ttlSeconds)
  return value
}
