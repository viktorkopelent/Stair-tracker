// api/state.js — GET: return the full leaderboard state.
import { loadState, send } from './_redis.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const state = await loadState();
    return send(res, 200, state);
  } catch (e) {
    return send(res, 500, { error: 'Failed to load state' });
  }
}
