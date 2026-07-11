/**
 * ratings.js — Per-player match ratings engine
 *
 * Ratings are grounded in:
 * - The player's actual attribute profile
 * - Their position (defenders rated on defensive actions, etc.)
 * - Events during the match (goals, assists, yellow cards)
 * - Team result
 */
window.RatingsEngine = {

  // ── Initialise match ratings from player attributes ────────────────────────
  init(squad) {
    const r = {};
    squad.forEach(p => {
      const a = p.attrs || {};
      // Base rating from position-relevant attributes
      let base;
      if (p.posG === 'GK') {
        base = ((a.ref || 12) + (a.pos || 12) + (a.han || 12)) / 3;
      } else if (p.posG === 'DEF') {
        base = ((a.def || 12) * 1.5 + (a.phy || 12) + (a.men || 12)) / 3.5;
      } else if (p.posG === 'MID') {
        base = ((a.pas || 12) + (a.dri || 12) + (a.sta || 12) + (a.men || 12)) / 4;
      } else { // FWD
        base = ((a.sho || 12) * 1.5 + (a.pac || 12) + (a.men || 12)) / 3.5;
      }
      // Map 1-20 attribute scale to 5.5-7.5 rating base
      const normalised = 5.5 + ((base - 8) / 12) * 2.0;
      // Small random variance (form)
      const variance = (Math.random() - 0.5) * 0.4;
      r[p.id] = parseFloat(Math.min(7.5, Math.max(5.2, normalised + variance)).toFixed(1));
    });
    return r;
  },

  // ── Goal scored: +1.1, higher if striker with good shooting ───────────────
  applyGoal(r, id, player) {
    if (r[id] === undefined) return r;
    const a = player?.attrs || {};
    const bonus = player?.posG === 'FWD' ? 1.0 + (a.sho || 12) * 0.015 : 1.2;
    r[id] = parseFloat(Math.min(10, r[id] + bonus).toFixed(1));
    return r;
  },

  // ── Assist: +0.6 ─────────────────────────────────────────────────────────
  applyAssist(r, id) {
    if (r[id] === undefined) return r;
    r[id] = parseFloat(Math.min(10, r[id] + 0.6).toFixed(1));
    return r;
  },

  // ── Yellow card: -0.35 ────────────────────────────────────────────────────
  applyYellow(r, id) {
    if (r[id] === undefined) return r;
    r[id] = parseFloat(Math.max(3.5, r[id] - 0.35).toFixed(1));
    return r;
  },

  // ── Substitution: new entrant gets neutral rating ─────────────────────────
  applySub(r, id) {
    r[id] = parseFloat((6.0 + Math.random() * 0.5).toFixed(1));
    return r;
  },

  // ── Apply result across all players ───────────────────────────────────────
  applyResult(r, squad, diff) {
    const bump = diff > 0 ? 0.2 : diff < 0 ? -0.25 : 0.05;
    squad.forEach(p => {
      if (r[p.id] !== undefined) {
        r[p.id] = parseFloat(Math.min(10, Math.max(3.5, r[p.id] + bump)).toFixed(1));
      }
    });
    return r;
  },

  // ── Rating display class ──────────────────────────────────────────────────
  cls(rat) {
    if (rat >= 8.5) return 'a';
    if (rat >= 7.5) return 'b';
    if (rat >= 6.5) return 'c';
    if (rat >= 5.5) return 'd';
    return 'e';
  },

  matchCls(rat) {
    if (rat >= 7.5) return 'hi';
    if (rat >= 6.5) return 'md';
    if (rat >= 5.5) return '';
    return 'lo';
  },
};
