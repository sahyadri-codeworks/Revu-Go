const hits = new Map<string, number[]>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (hits.get(key) || []).filter((t) => t > windowStart);
  if (timestamps.length >= maxRequests) return false;
  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}
