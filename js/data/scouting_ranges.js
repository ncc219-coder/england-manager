/**
 * scouting_ranges.js — Attribute Uncertainty
 *
 * Knowledge of a player (the existing 0-3 scale already used for gating
 * what's shown at all) now also controls how PRECISELY each attribute is
 * shown — a wide range at low knowledge, narrowing toward the true value
 * as the manager scouts, caps, and works with the player, fully
 * resolving to the exact number at maximum knowledge. This is what makes
 * the new role-fit advice (built in roles.js) something that's EARNED
 * through getting to know a player, not handed over instantly and
 * perfectly the moment they appear in the squad pool.
 *
 * The true attribute value (used by the match engine) never changes —
 * this is purely a display-layer uncertainty band layered on top.
 */

window.ScoutingRanges = (function () {

  // Range half-width at each knowledge level, in raw attribute points
  // (attributes are 1-20). 0 = barely know them at all, wide band; 3 =
  // know them inside out, exact number.
  const HALF_WIDTH_BY_LEVEL = { 0: 4, 1: 2, 2: 1, 3: 0 };

  // A small, STABLE per-player-per-attribute bias so the shown range
  // doesn't centre exactly on the true value in a way that would let an
  // attentive manager reverse-engineer it from the midpoint alone — the
  // band is real uncertainty, not just "true value ± noise displayed
  // around the real number every time." Deterministic (seeded from the
  // player id + attribute key) so it's stable across renders rather than
  // jittering every time the screen redraws.
  function _seededBias(playerId, attrKey, maxBias) {
    let hash = 0;
    const s = (playerId || '') + '|' + attrKey;
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
    const normalized = (Math.abs(hash) % 100) / 100; // 0-1, stable per player+attr
    return (normalized - 0.5) * 2 * maxBias; // -maxBias to +maxBias
  }

  // Returns { low, high, exact } for one attribute at a given knowledge
  // level. At level 3, low===high===exact (fully resolved, no band).
  function getRange(trueValue, knowledgeLevel, playerId, attrKey) {
    const halfWidth = HALF_WIDTH_BY_LEVEL[knowledgeLevel] ?? HALF_WIDTH_BY_LEVEL[0];
    if (halfWidth === 0) {
      return { low: trueValue, high: trueValue, exact: true };
    }
    // Bias the band off-centre slightly and consistently, so it isn't
    // trivially "the true value is always exactly in the middle."
    const bias = _seededBias(playerId, attrKey, halfWidth * 0.4);
    const low  = Math.max(1, Math.round(trueValue - halfWidth + bias));
    const high = Math.min(20, Math.round(trueValue + halfWidth + bias));
    // Guarantee the true value always actually falls within the shown
    // band — the uncertainty should never be misleading, just imprecise.
    return {
      low: Math.min(low, trueValue),
      high: Math.max(high, trueValue),
      exact: false,
    };
  }

  // Display string for one attribute — "13-17" or, once fully known, "16".
  function formatAttr(trueValue, knowledgeLevel, playerId, attrKey) {
    const r = getRange(trueValue, knowledgeLevel, playerId, attrKey);
    return r.exact ? `${r.low}` : `${r.low}–${r.high}`;
  }

  // Builds a full attrs object where every value is replaced with its
  // display range — used anywhere attributes get shown to the manager
  // (squad screen, tactics screen, player database). The match engine
  // NEVER calls this; it always reads the real attrs object directly.
  function buildDisplayAttrs(trueAttrs, knowledgeLevel, playerId) {
    const out = {};
    Object.entries(trueAttrs || {}).forEach(([key, val]) => {
      out[key] = formatAttr(val, knowledgeLevel, playerId, key);
    });
    return out;
  }

  // Convenience: for role-fit purposes specifically, returns a fit score
  // RANGE rather than a single number when knowledge is incomplete — the
  // genuinely honest answer to "should this player be a Poacher or a
  // Target Man" before you've scouted them is "we're not sure yet,
  // somewhere in this range," not a confident-looking exact figure.
  function roleFitRange(player, roleId, knowledgeLevel) {
    if (!window.Roles) return null;
    const trueFit = window.Roles.roleFit(player, roleId);
    if (knowledgeLevel >= 3) return { low: trueFit.score, high: trueFit.score, exact: true, point: trueFit.score };

    // Perturb the player's attrs within their uncertainty bands (using
    // the worst-case and best-case ends of each relevant attribute's
    // range) to get a genuine low/high fit score, not just an arbitrary
    // +/- on the final number — this reflects real uncertainty about
    // WHICH attributes are driving the score, not just a vague fudge.
    const role = window.Roles.ROLES[roleId];
    const relevantKeys = new Set();
    Object.keys(role?.mods || {}).forEach(scoreKey => {
      (window.Roles.DERIVED_SCORE_KEYS[scoreKey] || []).forEach(k => relevantKeys.add(k));
    });

    const lowAttrs = { ...player.attrs }, highAttrs = { ...player.attrs };
    relevantKeys.forEach(k => {
      if (player.attrs[k] === undefined) return;
      const r = getRange(player.attrs[k], knowledgeLevel, player.id, k);
      lowAttrs[k] = r.low;
      highAttrs[k] = r.high;
    });

    const lowFit  = window.Roles.roleFit({ ...player, attrs: lowAttrs }, roleId).score;
    const highFit = window.Roles.roleFit({ ...player, attrs: highAttrs }, roleId).score;
    return {
      low: Math.min(lowFit, highFit, trueFit.score),
      high: Math.max(lowFit, highFit, trueFit.score),
      exact: false,
      point: trueFit.score, // for internal use only — UI should show the range, not this
    };
  }

  return { HALF_WIDTH_BY_LEVEL, getRange, formatAttr, buildDisplayAttrs, roleFitRange };

})();
