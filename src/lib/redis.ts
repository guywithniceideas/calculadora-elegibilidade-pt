import { Redis } from '@upstash/redis'

interface RedisLike {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: unknown, opts?: { nx?: boolean }): Promise<unknown>
  rpush(key: string, value: string): Promise<number>
}

function createMemoryRedis(): RedisLike {
  const store = new Map<string, unknown>()
  const lists = new Map<string, string[]>()
  return {
    async get<T>(key: string) {
      return store.has(key) ? (store.get(key) as T) : null
    },
    async set(key: string, value: unknown, opts?: { nx?: boolean }) {
      if (opts?.nx && store.has(key)) return null
      store.set(key, value)
      return 'OK'
    },
    async rpush(key: string, value: string) {
      const list = lists.get(key) ?? []
      list.push(value)
      lists.set(key, list)
      return list.length
    },
  }
}

let client: RedisLike | null = null

export function getRedis(): RedisLike {
  if (!client) {
    const url = process.env.KV_REST_API_URL
    const token = process.env.KV_REST_API_TOKEN
    if (!url || !token) {
      // Local dev without Vercel KV credentials: fall back to an in-memory
      // store so auth/profile flows still work. Data does not persist across
      // server restarts and this path is never reachable when the real
      // KV_REST_API_URL/TOKEN are set (e.g. on Vercel).
      console.warn('[redis] KV_REST_API_URL/TOKEN not set — using in-memory store for local dev.')
      client = createMemoryRedis()
    } else {
      client = new Redis({ url, token })
    }
  }
  return client
}
