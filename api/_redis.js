// api/_redis.js — shared helpers used by all API routes.
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv(); // reads UPSTASH_REDIS_REST_URL + _TOKEN

export const DATA_KEY = 'ascent:state';

// Load the full state object { players: [...] }.
export async function loadState() {
  const data = await redis.get(DATA_KEY);
  if (!data) return { players: [] };
  // Upstash auto-parses JSON; guard against string just in case.
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function saveState(state) {
  await redis.set(DATA_KEY, JSON.stringify(state));
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Small CORS/JSON helper.
export function send(res, status, body) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
