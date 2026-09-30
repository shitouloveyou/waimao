type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function clientAddress(request: Request) {
  return (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = buckets.get(key);
  const entry = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing;
  entry.count += 1;
  buckets.set(key, entry);
  if (buckets.size > 5000) for (const [name, value] of buckets) if (value.resetAt <= now) buckets.delete(name);
  return { allowed: entry.count <= limit, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
}
