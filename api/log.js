// api/log.js — POST: add floors to one player.
// Body: { playerId: string, amount: number }
import { loadState, saveState, send } from './_redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  try {
    const { playerId, amount } = req.body || {};
    const amt = parseInt(amount, 10);

    if (!playerId) return send(res, 400, { error: 'Missing playerId' });
    if (!amt || amt < 1) return send(res, 400, { error: 'Amount must be at least 1' });
    if (amt > 500) return send(res, 400, { error: 'Max 500 floors per entry' });

    const state = await loadState();
    const player = state.players.find((p) => p.id === playerId);
    if (!player) return send(res, 404, { error: 'Player not found' });

    player.floors = (player.floors || 0) + amt;
    player.lastLog = Date.now();
    await saveState(state);

    return send(res, 200, state);
  } catch (e) {
    return send(res, 500, { error: 'Failed to log floors' });
  }
}
