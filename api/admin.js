// api/admin.js — POST: admin actions (PIN-protected on the server).
// Body: { pin: string, action: 'add'|'remove'|'reset'|'setFloors', name?, playerId?, floors? }
import { loadState, saveState, uid, send } from './_redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  const ADMIN_PIN = process.env.ADMIN_PIN;
  if (!ADMIN_PIN) return send(res, 500, { error: 'Server missing ADMIN_PIN env var' });

  try {
    const { pin, action, name, playerId, floors } = req.body || {};

    if (pin !== ADMIN_PIN) return send(res, 401, { error: 'Wrong PIN' });

    // PIN-only check used by the frontend to unlock admin mode.
    if (action === 'verify') return send(res, 200, { ok: true });

    const state = await loadState();

    if (action === 'add') {
      const clean = (name || '').trim();
      if (!clean) return send(res, 400, { error: 'Name required' });
      if (clean.length > 30) return send(res, 400, { error: 'Name too long' });
      if (state.players.some((p) => p.name.toLowerCase() === clean.toLowerCase()))
        return send(res, 409, { error: 'Name already exists' });
      state.players.push({ id: uid(), name: clean, floors: 0, lastLog: null });

    } else if (action === 'remove') {
      if (!playerId) return send(res, 400, { error: 'playerId required' });
      state.players = state.players.filter((p) => p.id !== playerId);

    } else if (action === 'reset') {
      state.players.forEach((p) => { p.floors = 0; p.lastLog = null; });

    } else if (action === 'setFloors') {
      if (!playerId) return send(res, 400, { error: 'playerId required' });
      const exact = parseInt(floors, 10);
      if (isNaN(exact) || exact < 0) return send(res, 400, { error: 'Floor count must be 0 or more' });
      if (exact > 2366) return send(res, 400, { error: 'Cannot exceed 2366 floors' });
      const player = state.players.find((p) => p.id === playerId);
      if (!player) return send(res, 404, { error: 'Player not found' });
      player.floors = exact;
      player.lastLog = Date.now();

    } else {
      return send(res, 400, { error: 'Unknown action' });
    }

    await saveState(state);
    return send(res, 200, state);
  } catch (e) {
    return send(res, 500, { error: 'Admin action failed' });
  }
}
