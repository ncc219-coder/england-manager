/**
 * positions.js — Live Positional Layer
 *
 * The 21-zone grid in match2.js remains the authoritative simulation —
 * it decides who does what (goals, tackles, cards) and stays untouched.
 * This module is a purely additive VISUAL layer: it gives all 22 outfield
 * players + 2 keepers real (x,y) coordinates, derives a believable named
 * pass sequence between the old ball zone and the new one each tick, and
 * smoothly drifts every player's position toward their tactical "home"
 * shape plus a pull toward wherever the ball currently is — so the match
 * screen shows actual shape of play instead of a dot teleporting between
 * fixed points.
 *
 * Coordinate system: x in [0,1] (0=left touchline, 1=right touchline),
 * y in [0,1] (0=top/opponent goal, 1=bottom/England's own goal) — matches
 * the existing pitch SVG orientation.
 *
 * This module holds NO reference to State or match2's internals — every
 * function takes exactly what it needs as arguments, so it's fully
 * testable in isolation and match2.js stays in control of when/how it's
 * called.
 */

window.PositionEngine = (function () {

  // ── Home shape ───────────────────────────────────────────────────────────

  function _rowY(row, maxRow) {
    if (maxRow <= 0) return 0.5;
    const t = row / maxRow;
    return 0.92 - t * 0.74; // row 0 (GK) deep near 0.92, highest row near 0.18
  }

  function _rowXs(count) {
    if (count <= 1) return [0.5];
    if (count === 2) return [0.34, 0.66];
    if (count === 3) return [0.22, 0.5, 0.78];
    if (count === 4) return [0.13, 0.37, 0.63, 0.87];
    if (count === 5) return [0.10, 0.28, 0.5, 0.72, 0.90];
    return Array.from({ length: count }, (_, i) => 0.1 + (0.8 * i) / (count - 1));
  }

  // Build home (x,y) for every England slot index in the active formation.
  // roleAssignments: { slotIdx: { role, duty } } — Attack duty nudges the
  // home position forward, Defend pulls it back, a real (if subtle)
  // visual difference between e.g. a Wing-Back on Attack vs on Defend.
  function buildEngHomePositions(formationName, roleAssignments) {
    const formation = (window.FORMATIONS && window.FORMATIONS[formationName]) || (window.FORMATIONS && window.FORMATIONS['4-4-2']) || [];
    if (!formation.length) return {};
    const maxRow = Math.max(...formation.map(s => s.row), 1);
    const byRow = {};
    formation.forEach((sl, i) => { (byRow[sl.row] = byRow[sl.row] || []).push({ ...sl, slotIdx: i }); });

    const positions = {};
    Object.entries(byRow).forEach(([row, slots]) => {
      const xs = _rowXs(slots.length);
      const y  = _rowY(+row, maxRow);
      slots.forEach((sl, i) => {
        const assignment = (roleAssignments || {})[sl.slotIdx] || {};
        const dutyShift = assignment.duty === 'Attack' ? -0.05 : assignment.duty === 'Defend' ? 0.04 : 0;
        positions[sl.slotIdx] = { x: xs[i], y: Math.max(0.06, Math.min(0.94, y + dutyShift)) };
      });
    });
    return positions;
  }

  // Opponent has no real formation string in this game (just a flat XI),
  // so approximate a back-line/mid-line/front-line shape from posG
  // grouping. They attack toward y=1 (England's goal), so their banding
  // is the mirror of England's.
  function buildOppHomePositions(oppPlayersList, mentality) {
    const byPos = { GK: [], DEF: [], MID: [], FWD: [] };
    oppPlayersList.forEach(pl => { (byPos[pl.posG] || byPos.MID).push(pl); });
    const bandY = { GK: 0.92, DEF: 0.74, MID: 0.52, FWD: 0.30 };
    const shift = mentality === 'Attack' ? -0.04 : mentality === 'Defend' ? 0.04 : 0;
    const positions = {}; // playerId -> {x,y}
    Object.entries(byPos).forEach(([posG, list]) => {
      const xs = _rowXs(Math.max(list.length, 1));
      list.forEach((pl, i) => {
        const y = Math.max(0.06, Math.min(0.94, 1 - bandY[posG] + shift));
        positions[pl.id] = { x: xs[i] ?? 0.5, y };
      });
    });
    return positions;
  }

  // ── Pass sequence generation ─────────────────────────────────────────────
  // Given the team currently in possession, the zone they're moving FROM
  // and TO, and a player-picker function (reusing match2's own attribute-
  // weighted selection so the SAME players who are statistically likely
  // to be on the ball are the ones shown carrying it), produce a short,
  // named sequence of 1-3 hops that visually explains how the ball got
  // from one zone to the other — not just a label, an actual list of
  // {playerId, playerName, x, y} waypoints to animate through.
  //
  // pickFn(candidateList) -> a chosen player object {id, name, x, y} from
  // the supplied candidates, weighted however match2.js wants (passing
  // ability, position proximity, etc.) — this module doesn't know about
  // attributes at all, it just orchestrates the hand-off.
  function buildPassSequence(possSide, fromZoneXY, toZoneXY, candidates, pickFn) {
    if (!candidates || !candidates.length) {
      return [{ x: toZoneXY.x, y: toZoneXY.y, playerId: null, playerName: null }];
    }
    // 1-3 hops depending on how far the zones are apart — a short central
    // exchange might be one pass, a length-of-the-pitch move plausibly
    // goes through 2-3 players.
    const dist = Math.hypot(toZoneXY.x - fromZoneXY.x, toZoneXY.y - fromZoneXY.y);
    const hops = dist > 0.5 ? 3 : dist > 0.25 ? 2 : 1;

    const sequence = [];
    const used = new Set();
    for (let i = 0; i < hops; i++) {
      const t = (i + 1) / hops;
      const waypoint = { x: fromZoneXY.x + (toZoneXY.x - fromZoneXY.x) * t, y: fromZoneXY.y + (toZoneXY.y - fromZoneXY.y) * t };
      const pool = candidates.filter(c => !used.has(c.id));
      const chosen = pickFn(pool.length ? pool : candidates, waypoint) || candidates[0];
      used.add(chosen.id);
      sequence.push({ x: waypoint.x, y: waypoint.y, playerId: chosen.id, playerName: chosen.name });
    }
    return sequence;
  }

  // ── Live drift state ─────────────────────────────────────────────────────
  // A thin position tracker — call init() once per match/substitution,
  // driftTick() every engine tick to gently move everyone toward their
  // home shape plus a pull toward the ball.

  function createTracker() {
    let current = {}; // playerId -> {x,y}
    let homeEng = {};
    let homeOpp = {};
    let profiles = {}; // playerId -> { forwardRange, lateralRange, roamBias, mobility (0-1 from pace+workrate) }

    // Resolve the actual movement profile for an England player: the
    // role's static range/bias (if a role's been explicitly assigned —
    // matching the same "explicit assignment only" rule the engine
    // already uses for attribute mods, so an unconfigured slot doesn't
    // get free movement-range credit it didn't earn) scaled by their
    // REAL pace and workrate attributes — a 20-pace winger genuinely
    // gets further up the pitch than a 9-pace one in the same role.
    function _resolveEngProfile(pl, roleId) {
      const role = (window.Roles && roleId) ? window.Roles.ROLES[roleId] : null;
      const base = role?.movement || { forwardRange: 0.25, lateralRange: 0.15, roamBias: 0 };
      const attrs = pl.attrs || {};
      const paceAttr = (attrs.pac || attrs.acc || 12) / 20;
      const workAttr = (attrs.wor || attrs.sta || 12) / 20;
      // Mobility multiplier centred on an average (12/20) player being
      // 1.0x their role's base range — a genuinely quick, tireless
      // player covers up to ~35% more ground than the role's baseline,
      // a sluggish one noticeably less, without ever erasing the role's
      // own fundamental shape (a slow Target Man still holds the line,
      // he just does it slightly less dynamically than a faster one).
      const mobility = 0.75 + (paceAttr * 0.5 + workAttr * 0.5) * 0.5;
      return {
        forwardRange: base.forwardRange * mobility,
        lateralRange: base.lateralRange * mobility,
        roamBias: base.roamBias,
      };
    }

    function init(engPlayersWithSlot, oppPlayersList, formationName, roleAssignments, mentality) {
      homeEng = buildEngHomePositions(formationName, roleAssignments);
      homeOpp = buildOppHomePositions(oppPlayersList, mentality);
      current = {};
      profiles = {};
      engPlayersWithSlot.forEach(({ id, slotIdx, pl }) => {
        const home = homeEng[slotIdx] || { x: 0.5, y: 0.6 };
        current[id] = { x: home.x, y: home.y };
        const assignment = (roleAssignments || {})[slotIdx] || {};
        profiles[id] = pl ? _resolveEngProfile(pl, assignment.role) : { forwardRange:0.25, lateralRange:0.15, roamBias:0 };
      });
      oppPlayersList.forEach(pl => {
        const home = homeOpp[pl.id] || { x: 0.5, y: 0.4 };
        current[pl.id] = { x: home.x, y: home.y };
        // Opponents don't carry assigned roles, but their own real pace
        // still matters — a fast opposing winger should still look
        // mobile even without the full role system applied to them.
        const paceAttr = (pl.pace || 0.6);
        profiles[pl.id] = { forwardRange: 0.30 * (0.75 + paceAttr*0.5), lateralRange: 0.15, roamBias: 0 };
      });
    }

    function homeFor(id, engSlotIdxById) {
      const slotIdx = engSlotIdxById[id];
      if (slotIdx !== undefined) return homeEng[slotIdx];
      return homeOpp[id];
    }

    // Each player now drifts according to THEIR OWN role-and-attribute
    // profile rather than one uniform formula — a winger's forwardRange
    // pulls them genuinely deep into the final third when the ball is
    // advanced there, a holding midfielder's tiny forwardRange keeps
    // them anchored regardless of how far forward the ball goes, and
    // roamBias shifts WHERE within their range they tend to drift
    // (e.g. an Inside Forward's positive roamBias pulls them centrally
    // even when their nominal slot is wide).
    function driftTick(ballX, ballY, engSlotIdxById, staminaMap) {
      Object.keys(current).forEach(id => {
        const home = homeFor(id, engSlotIdxById);
        if (!home) return;
        const prof = profiles[id] || { forwardRange:0.25, lateralRange:0.15, roamBias:0 };
        const cur = current[id];

        // Live fatigue shrinks effective range toward the home position
        // — a player at 100% stamina gets their full role-and-pace range,
        // one gassed at 40% late in the match noticeably stops covering
        // the ground they did in the first half, on top of (not instead
        // of) already performing worse on the ball from match2.js's own
        // fatigue multiplier on derived scores.
        const stamina = (staminaMap && staminaMap[id] !== undefined) ? staminaMap[id] : 1.0;
        const fatigueRangeMult = 0.55 + stamina * 0.45; // even fully spent, never drops below ~55% of their range

        // Forward/back pull: how far this specific player's home
        // position shifts toward the ball vertically, bounded by their
        // own forwardRange rather than one flat 10% for everyone.
        const vertPull = (ballY - home.y) * prof.forwardRange * fatigueRangeMult;
        const targetY = home.y + vertPull;

        // Lateral pull: how far they drift side-to-side toward the
        // ball's horizontal position, bounded by lateralRange, with
        // roamBias shifting the player's effective centre (positive =
        // drifts toward the middle of the pitch, negative = stays wide
        // or holds their line depending on the role).
        const biasedHomeX = home.x + (0.5 - home.x) * Math.max(0, prof.roamBias);
        const latPull = (ballX - biasedHomeX) * prof.lateralRange * fatigueRangeMult;
        const targetX = biasedHomeX + latPull;

        cur.x += (targetX - cur.x) * 0.30;
        cur.y += (targetY - cur.y) * 0.30;
      });
    }

    function snapTo(id, x, y) {
      if (current[id]) { current[id].x = x; current[id].y = y; }
    }

    function getAll() { return current; }
    function getHomeEng() { return homeEng; }
    function getHomeOpp() { return homeOpp; }

    return { init, driftTick, snapTo, getAll, getHomeEng, getHomeOpp };
  }

  return {
    buildEngHomePositions, buildOppHomePositions, buildPassSequence, createTracker,
  };

})();
