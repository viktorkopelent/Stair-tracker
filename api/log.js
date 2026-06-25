// api/log.js — POST: add floors to one player.
// Body: { playerId: string, amount: number }
import { loadState, saveState, send } from './_redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  try {
    const { playerId, amount } = req.body || {};
    const amt = parseInt(amount, 10);

    if (!playerId) return send(res, 400, { error: 'Missing playerId' });
    if (!amt || amt === 0) return send(res, 400, { error: 'Amount must be non-zero' });
    if (amt < -50) return send(res, 400, { error: 'Max correction is -50 floors' });
    if (amt > 500) return send(res, 400, { error: 'Max 500 floors per entry' });

    const MAX_FLOORS = 2366;

    const state = await loadState();
    const player = state.players.find((p) => p.id === playerId);
    if (!player) return send(res, 404, { error: 'Player not found' });

    const current = player.floors || 0;
    if (current >= MAX_FLOORS && amt > 0) return send(res, 400, { error: `Already at the summit — ${MAX_FLOORS} floors reached!` });

    player.floors = Math.min(Math.max(0, current + amt), MAX_FLOORS);
    player.lastLog = Date.now();
    await saveState(state);

    return send(res, 200, state);
  } catch (e) {
    return send(res, 500, { error: 'Failed to log floors' });
  }
}
