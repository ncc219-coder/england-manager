/**
 * roles.js — Player Roles & Duties
 *
 * The FM-style layer that makes formation choice mean something beyond a
 * label. Every slot in a formation gets a ROLE (what kind of player plays
 * there — e.g. "Inverted Wing-Back" vs "Wing-Back") and a DUTY (how
 * aggressively they approach the game — Defend / Support / Attack).
 *
 * Each role+duty combination produces a real multiplier set applied
 * directly to the player's already-computed derived scores in
 * match2.js's _buildPlayers() — the same mechanism already used for
 * injury penalties and individual training drills. No other engine code
 * needs to change: _teamStats() already consumes these derived scores,
 * so a role's effect flows through automatically into attack/mid/def
 * ratings, crossing threat, through-ball threat, etc.
 *
 * Roles are scoped by position group (GK/DEF/MID/FWD) — you can only
 * assign a role that's actually available for where a player lines up
 * in the chosen formation slot.
 */

window.Roles = (function () {

  // ── Role catalogue ─────────────────────────────────────────────────────────
  // Each role has: label, the position groups it's valid for, a short
  // description, and a `mods` object — multipliers applied to specific
  // derived scores on _buildPlayers() output. `posBias` nudges where on
  // the pitch their actions are weighted (left/right/central) for the
  // crossing/through-ball aggregation that already exists.
  const ROLES = {
    // ── Goalkeeper ──
    gk_traditional: { label:'Goalkeeper', posG:['GK'], desc:'Stays on the line, focuses purely on shot-stopping.',
      mods:{ handling:1.10, positioning:0.95, shortPass:0.85 },
      movement:{ forwardRange:0.04, lateralRange:0.08, roamBias:0 } },
    gk_sweeper:     { label:'Sweeper Keeper', posG:['GK'], desc:'Comes off his line, comfortable with the ball at his feet.',
      mods:{ handling:0.97, positioning:1.08, shortPass:1.15, pace:1.05 },
      movement:{ forwardRange:0.14, lateralRange:0.14, roamBias:0 } },

    // ── Defenders ──
    cb_stopper:    { label:'Stopper', posG:['DEF'], desc:'Aggressive, steps out to meet attackers head-on.',
      mods:{ defending:1.10, heading_def:1.10, strength:1.08, pace:0.92 },
      movement:{ forwardRange:0.16, lateralRange:0.12, roamBias:0 } },
    cb_cover:      { label:'Cover', posG:['DEF'], desc:'Sits deeper, reads the game, sweeps up behind a stopper.',
      mods:{ defending:1.08, positioning:1.10, pace:1.05, strength:0.95 },
      movement:{ forwardRange:0.08, lateralRange:0.16, roamBias:0.10 } }, // sweeps sideways to cover, doesn't step up
    cb_ballplaying:{ label:'Ball-Playing Defender', posG:['DEF'], desc:'Comfortable bringing the ball out and starting attacks.',
      mods:{ shortPass:1.18, longPassing:1.12, defending:0.95, dribbling:1.08 },
      movement:{ forwardRange:0.20, lateralRange:0.14, roamBias:0 } }, // happy to carry it out of the back
    fb_standard:   { label:'Full-Back', posG:['DEF'], desc:'Balanced — defends first, supports the attack when it\'s on.',
      mods:{ defending:1.05, crossing:1.0, pace:1.0 },
      movement:{ forwardRange:0.30, lateralRange:0.10, roamBias:0 } },
    fb_wingback:   { label:'Wing-Back', posG:['DEF'], desc:'Bombs forward relentlessly, provides width and crosses.',
      mods:{ crossing:1.22, pace:1.10, dribbling:1.10, defending:0.85 }, posBias:'wide',
      movement:{ forwardRange:0.55, lateralRange:0.06, roamBias:0 } }, // genuinely gets into the final third hugging the line
    fb_inverted:   { label:'Inverted Wing-Back', posG:['DEF'], desc:'Tucks infield to overload central midfield.',
      mods:{ shortPass:1.18, longPassing:1.10, defending:0.95, crossing:0.75 }, posBias:'central',
      movement:{ forwardRange:0.40, lateralRange:0.30, roamBias:0.20 } }, // drifts infield rather than staying on the touchline

    // ── Midfielders ──
    mid_holding:   { label:'Holding Midfielder', posG:['MID'], desc:'Screens the back four, breaks up opposition play.',
      mods:{ defending:1.20, shortPass:1.05, workrate:1.10, finishing:0.7 },
      movement:{ forwardRange:0.14, lateralRange:0.18, roamBias:0 } }, // anchored, covers side to side not forward
    mid_deeplying: { label:'Deep-Lying Playmaker', posG:['MID'], desc:'Dictates tempo from deep with range of passing.',
      mods:{ longPassing:1.22, shortPass:1.15, defending:0.90, finishing:0.7 },
      movement:{ forwardRange:0.16, lateralRange:0.22, roamBias:0 } },
    mid_box2box:   { label:'Box-to-Box', posG:['MID'], desc:'Covers every blade of grass, contributes at both ends.',
      mods:{ workrate:1.20, defending:1.05, finishing:1.08, pace:1.05 },
      movement:{ forwardRange:0.50, lateralRange:0.22, roamBias:0 } }, // genuinely the largest range of any role
    mid_advanced:  { label:'Advanced Playmaker', posG:['MID'], desc:'The creative spark — operates between the lines.',
      mods:{ shortPass:1.18, dribbling:1.10, finishing:1.05, defending:0.80 },
      movement:{ forwardRange:0.30, lateralRange:0.24, roamBias:-0.15 } }, // drifts to find pockets between the lines
    wing_winger:   { label:'Winger', posG:['MID'], desc:'Stays high and wide, delivers crosses into the box.',
      mods:{ crossing:1.25, pace:1.12, dribbling:1.10, defending:0.75 }, posBias:'wide',
      movement:{ forwardRange:0.45, lateralRange:0.05, roamBias:0 } }, // hugs the touchline, minimal drift inward
    wing_inside:   { label:'Inside Forward', posG:['MID'], desc:'Cuts inside from a wide start to shoot or combine centrally.',
      mods:{ finishing:1.18, dribbling:1.15, crossing:0.80, defending:0.75 }, posBias:'central',
      movement:{ forwardRange:0.45, lateralRange:0.28, roamBias:0.25 } }, // starts wide, cuts infield toward goal
    am_classic:    { label:'Attacking Midfielder', posG:['MID'], desc:'Operates just behind the striker, looking to create or score.',
      mods:{ shortPass:1.12, finishing:1.12, dribbling:1.08, defending:0.70 },
      movement:{ forwardRange:0.32, lateralRange:0.18, roamBias:-0.10 } },

    // ── Forwards ──
    st_advanced:   { label:'Advanced Forward', posG:['FWD'], desc:'Pure penalty-box predator, lives off service.',
      mods:{ finishing:1.22, heading:1.05, pace:1.08, shortPass:0.80 },
      movement:{ forwardRange:0.10, lateralRange:0.14, roamBias:-0.30 } }, // pushes onto the last shoulder, stays highest
    st_target:     { label:'Target Man', posG:['FWD'], desc:'A focal point — wins aerial duels, holds the ball up.',
      mods:{ heading:1.25, strength:1.15, finishing:1.0, pace:0.85 },
      movement:{ forwardRange:0.06, lateralRange:0.08, roamBias:-0.25 } }, // genuinely holds the highest line of anyone, barely drops
    st_poacher:    { label:'Poacher', posG:['FWD'], desc:'Lives for one chance, exceptional in the six-yard box.',
      mods:{ finishing:1.28, pace:1.05, shortPass:0.75, dribbling:0.85 },
      movement:{ forwardRange:0.08, lateralRange:0.10, roamBias:-0.28 } }, // minimal movement, lurks for the half-chance
    st_deeplying:  { label:'Deep-Lying Forward', posG:['FWD'], desc:'Drops short to link play and bring others into the game.',
      mods:{ shortPass:1.18, dribbling:1.10, finishing:1.0, heading:0.85 },
      movement:{ forwardRange:0.22, lateralRange:0.20, roamBias:0.30 } }, // genuinely drops deep to collect, the opposite of a Target Man
    st_pressing:   { label:'Pressing Forward', posG:['FWD'], desc:'Leads the press relentlessly, harries defenders into mistakes.',
      mods:{ workrate:1.25, defending:1.10, finishing:0.95, pace:1.05 },
      movement:{ forwardRange:0.10, lateralRange:0.22, roamBias:0.15 } }, // covers far more lateral ground chasing defenders than other strikers
  };

  // Which roles are selectable for a GIVEN formation slot (by posG + the
  // slot's nominal position label, so e.g. only wide MID slots offer
  // Winger/Wing-Back-style roles, not central ones).
  const SLOT_ROLE_MAP = {
    GK:  ['gk_traditional','gk_sweeper'],
    CB:  ['cb_stopper','cb_cover','cb_ballplaying'],
    RB:  ['fb_standard','fb_wingback','fb_inverted'],
    LB:  ['fb_standard','fb_wingback','fb_inverted'],
    RWB: ['fb_wingback','fb_standard'],
    LWB: ['fb_wingback','fb_standard'],
    DM:  ['mid_holding','mid_deeplying'],
    CM:  ['mid_box2box','mid_holding','mid_deeplying','mid_advanced'],
    RM:  ['wing_winger','wing_inside','mid_box2box'],
    LM:  ['wing_winger','wing_inside','mid_box2box'],
    RAM: ['wing_winger','wing_inside','am_classic'],
    LAM: ['wing_winger','wing_inside','am_classic'],
    CAM: ['am_classic','mid_advanced'],
    ST:  ['st_advanced','st_target','st_poacher','st_deeplying','st_pressing'],
    RW:  ['wing_winger','wing_inside'],
    LW:  ['wing_winger','wing_inside'],
  };

  const DEFAULT_ROLE = {
    GK:'gk_traditional', CB:'cb_stopper', RB:'fb_standard', LB:'fb_standard',
    RWB:'fb_wingback', LWB:'fb_wingback', DM:'mid_holding', CM:'mid_box2box',
    RM:'wing_winger', LM:'wing_winger', RAM:'wing_winger', LAM:'wing_winger',
    CAM:'am_classic', ST:'st_advanced', RW:'wing_winger', LW:'wing_winger',
  };

  // ── Duties ───────────────────────────────────────────────────────────────
  // Layered ON TOP of the role's own mods — a duty shifts the same role
  // further toward defensive solidity or attacking risk. Applied as a
  // second multiplier pass, so "Wing-Back on Attack" and "Wing-Back on
  // Defend" feel meaningfully different even though the role is identical.
  const DUTIES = {
    Defend:  { label:'Defend',  desc:'Prioritise positional discipline over forward runs.',
      mods:{ defending:1.10, workrate:1.05, finishing:0.85, crossing:0.90, dribbling:0.88 } },
    Support: { label:'Support', desc:'Balanced — contribute to both phases as the situation demands.',
      mods:{} }, // baseline, no change
    Attack:  { label:'Attack',  desc:'Push forward aggressively, prioritise the final third.',
      mods:{ finishing:1.12, crossing:1.10, dribbling:1.08, defending:0.85, workrate:1.05 } },
  };

  function rolesForSlot(slotPos) {
    return (SLOT_ROLE_MAP[slotPos] || []).map(id => ({ id, ...ROLES[id] }));
  }

  function defaultRoleForSlot(slotPos) {
    return DEFAULT_ROLE[slotPos] || Object.keys(ROLES)[0];
  }

  // Combine a role's mods with a duty's mods into one multiplier set per
  // derived-score key. Multiplicative, not additive — a key with no entry
  // in either defaults to 1.0 (no change).
  function combinedMods(roleId, dutyId) {
    const role = ROLES[roleId];
    const duty = DUTIES[dutyId] || DUTIES.Support;
    if (!role) return {};
    const out = {};
    const keys = new Set([...Object.keys(role.mods||{}), ...Object.keys(duty.mods||{})]);
    keys.forEach(k => {
      out[k] = (role.mods?.[k] ?? 1.0) * (duty.mods?.[k] ?? 1.0);
    });
    return out;
  }

  // Apply a player's role+duty multiplier set directly onto their already-
  // computed derived scores (called from match2.js's _buildPlayers(),
  // AFTER finishing/crossing/defending/etc. are calculated from raw attrs).
  function applyToDerivedScores(scores, roleId, dutyId) {
    const mods = combinedMods(roleId, dutyId);
    Object.keys(mods).forEach(k => {
      if (scores[k] !== undefined) {
        scores[k] = Math.max(0.15, Math.min(1.0, scores[k] * mods[k]));
      }
    });
    return scores;
  }

  // ── Role fit scoring (for the UI) ───────────────────────────────────────
  // Mirrors match2.js's _a() derived-score formula exactly — same raw
  // attribute groupings, same averaging, same 0.2-1.0 clamp — so the fit
  // score shown to the manager is a genuine reflection of what the role
  // will actually do to THIS player in a real match, not a guess. This is
  // the single source of truth both the engine and the UI read from for
  // "what does role X actually reward."
  const DERIVED_SCORE_KEYS = {
    finishing:   ['fin','sho'],
    heading:     ['hea','jum'],
    crossing:    ['cro','tec','pas'],
    longPassing: ['lng','vis','pas'],
    shortPass:   ['pas','tec','vis'],
    dribbling:   ['dri','pac','agi'],
    defending:   ['tac','mar','int'],
    heading_def: ['hea','jum','str'],
    strength:    ['str','phy','bra'],
    pace:        ['pac','acc'],
    handling:    ['han','ref','onv'],
    positioning: ['pos','com','dec'],
    workrate:    ['wor','sta','str'],
  };

  function _derivedScore(attrs, key, fallback) {
    const keys = DERIVED_SCORE_KEYS[key];
    if (!keys) return fallback ?? 0.65;
    const vals = keys.map(k => attrs[k]).filter(v => v !== undefined && v !== null);
    if (!vals.length) return fallback ?? 0.65;
    return Math.max(0.2, Math.min(1.0, vals.reduce((s,v) => s+v, 0) / vals.length / 20));
  }

  // Computes a single 0-100 "fit" score for one player in one role: how
  // much that role's attribute weighting actually suits THIS player.
  //
  // The key insight: a role's BOOSTED attributes (mod > 1) are what
  // actually matter most — does the player excel at the things this role
  // leans on? A role's SUPPRESSED attributes (mod < 1) only matter if the
  // player happens to be unusually strong there too — that's a genuine
  // cost (wasting a real strength), not a generic penalty for having an
  // ordinary, unremarkable level in something the role doesn't ask for.
  // An average score in a de-emphasised attribute is not a problem; only
  // an ELITE one being suppressed is.
  function roleFit(player, roleId) {
    const role = ROLES[roleId];
    if (!role || !player?.attrs) return { score: 50, breakdown: [] };
    const attrs = player.attrs;
    const mods = role.mods || {};
    const keys = Object.keys(mods);
    if (!keys.length) return { score: 60, breakdown: [] };

    let boostSum = 0, boostWeight = 0;
    let costSum = 0, costWeight = 0;
    const breakdown = [];

    keys.forEach(key => {
      const baseScore = _derivedScore(attrs, key); // 0.2-1.0, this player's natural standing
      const mod = mods[key];
      if (mod > 1.0) {
        // Boosted attribute: reward proportional to how strong the
        // player actually is here, weighted by how much the role leans
        // on it. This is the dominant signal — "does this role play to
        // their actual strengths."
        const amp = mod - 1.0;
        boostSum += baseScore * amp;
        boostWeight += amp;
        breakdown.push({ key, baseScore, mod, contribution: baseScore * amp, type: 'boost' });
      } else if (mod < 1.0) {
        // Suppressed attribute: only a real cost if the player is
        // genuinely elite there (above ~0.75) — losing access to an
        // above-average-but-not-special attribute isn't a meaningful
        // sacrifice. Scaled so this can meaningfully hurt the score but
        // never dominate it the way a genuine boost-match does.
        const suppression = 1.0 - mod;
        const eliteExcess = Math.max(0, baseScore - 0.75);
        const cost = eliteExcess * suppression;
        costSum += cost;
        costWeight += suppression;
        breakdown.push({ key, baseScore, mod, contribution: -cost, type: 'cost' });
      }
    });

    const boostAvg = boostWeight > 0 ? boostSum / boostWeight : 0.5; // 0-1, how well boosted attrs are covered
    const costAvg  = costWeight > 0 ? costSum / costWeight : 0;     // 0-1, how much elite-attribute waste

    // Final score: boosted-attribute coverage is the primary driver
    // (centred so 0.5 baseline coverage = score 50), reduced by genuine
    // elite-attribute waste.
    const score = Math.max(0, Math.min(100, Math.round((boostAvg * 100) - (costAvg * 35))));
    return { score, breakdown: breakdown.sort((a,b) => Math.abs(b.contribution) - Math.abs(a.contribution)) };
  }

  // Ranks every available role for a slot against a specific player —
  // this is the actual answer to "should this player be a Poacher or a
  // Target Man," computed from their real attributes rather than left for
  // the manager to guess from a flavour-text description.
  function rankRolesForPlayer(player, slotPos) {
    const available = rolesForSlot(slotPos);
    return available
      .map(r => ({ ...r, fit: roleFit(player, r.id) }))
      .sort((a, b) => b.fit.score - a.fit.score);
  }

  return {
    ROLES, SLOT_ROLE_MAP, DUTIES,
    rolesForSlot, defaultRoleForSlot, combinedMods, applyToDerivedScores,
    roleFit, rankRolesForPlayer, DERIVED_SCORE_KEYS,
  };

})();
