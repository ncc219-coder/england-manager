/**
 * training.js — Multi-layered training system
 *
 * Three layers, all genuinely affecting the match engine:
 *
 *  1. TEAM FOCUS + INTENSITY  — the weekly theme (Attack/Defence/Set
 *     Pieces/Fitness/Tactics) at a chosen intensity (Light/Standard/
 *     Intense). Higher intensity = bigger effect but real injury risk.
 *
 *  2. INDIVIDUAL DRILLS — up to 3 players each assigned a specific
 *     attribute-targeted drill (Finishing, Crossing, Tackling, Passing,
 *     Fitness) on top of the team focus. Each carries its own smaller
 *     injury risk, scaled by the same intensity setting.
 *
 *  3. CUMULATIVE SHARPNESS — sticking with the same team focus across
 *     consecutive matches builds a compounding bonus (capped); switching
 *     focus decays it back down. Rewards a settled, consistent plan over
 *     constantly chasing the "best" focus for each specific opponent.
 *
 * All risk is informational/expected-value only at selection time — the
 * actual injury roll happens once, when the session is confirmed, exactly
 * like a real training-ground injury announcement.
 */

window.Training = (function () {

  const TEAM_FOCUS = {
    attack:    { label: 'Attacking Play',   desc: 'Movement, finishing, and combination play in the final third.', icon: '⚔️' },
    defence:   { label: 'Defensive Shape',  desc: 'Compactness, pressing triggers, and defensive organisation.',   icon: '🛡️' },
    setpieces: { label: 'Set Pieces',       desc: 'Dead ball delivery, near-post runs, and free kick routines.',   icon: '🎯' },
    fitness:   { label: 'Fitness & Conditioning', desc: 'Stamina work and recovery — less sharp, more durable.',   icon: '🏃' },
    tactics:   { label: 'Team Shape',       desc: 'Formation discipline and pressing structure as a unit.',       icon: '📐' },
  };

  const INTENSITY = {
    light:    { label: 'Light',    mult: 0.6,  injuryBase: 0.005, desc: 'Low-impact. Smaller gains, players stay fresh.' },
    standard: { label: 'Standard', mult: 1.0,  injuryBase: 0.012, desc: 'Normal training-ground intensity.' },
    intense:  { label: 'Intense',  mult: 1.5,  injuryBase: 0.030, desc: 'Maximum effort. Real gains, real risk of a knock.' },
  };

  const DRILLS = {
    finishing: { label: 'Finishing Drill',  attrs: ['fin','sho'],       icon: '⚽' },
    crossing:  { label: 'Crossing Drill',   attrs: ['cro'],             icon: '🎯' },
    tackling:  { label: 'Tackling Drill',   attrs: ['tac','mar'],       icon: '🛡️' },
    passing:   { label: 'Passing Drill',    attrs: ['pas','vis'],       icon: '🔄' },
    fitness:   { label: 'Fitness Work',     attrs: ['sta','wor'],       icon: '🏃' },
  };

  const MAX_INDIVIDUAL_DRILLS = 3;
  const SHARPNESS_CAP = 5;          // max consecutive-match streak that counts
  const SHARPNESS_BONUS_PER_LEVEL = 0.012; // +1.2% per sharpness level, compounding into the existing trn*Bonus multipliers

  // ── Sharpness tracking ───────────────────────────────────────────────────
  // Called once per confirmed training session. Builds a streak counter for
  // the chosen focus; any OTHER focus's streak decays toward zero instead
  // of resetting instantly, so switching once doesn't erase weeks of work,
  // but sustained inconsistency still costs you the bonus.
  function recordSession(focusId) {
    const sharpness = State.get('campaign.trainingSharpness') || {};
    Object.keys(TEAM_FOCUS).forEach(id => {
      if (id === focusId) {
        sharpness[id] = Math.min(SHARPNESS_CAP, (sharpness[id] || 0) + 1);
      } else {
        sharpness[id] = Math.max(0, (sharpness[id] || 0) - 1);
      }
    });
    State.set('campaign.trainingSharpness', sharpness);
  }

  function getSharpness(focusId) {
    const sharpness = State.get('campaign.trainingSharpness') || {};
    return sharpness[focusId] || 0;
  }

  function sharpnessBonus(focusId) {
    return 1 + getSharpness(focusId) * SHARPNESS_BONUS_PER_LEVEL;
  }

  // ── Injury risk resolution ───────────────────────────────────────────────
  // Rolls injury chance for the team session and each individual drill
  // independently, using the SAME campaign.injuries structure that match
  // injuries use — a training knock costs you selection exactly like a
  // match injury would, no separate system to track.
  function resolveInjuryRisk(intensityId, individualPlayerIds) {
    const intensity = INTENSITY[intensityId] || INTENSITY.standard;
    const newlyInjured = [];
    const pool = State.get('squad.pool') || [];
    const squadIds = new Set(State.get('squad.englandSquad') || []);

    // Team session risk applies to a random handful of the full squad
    // (not literally everyone — training ground injuries are individual
    // accidents, not a squad-wide event).
    const squadPlayers = pool.filter(p => squadIds.has(p.id));
    squadPlayers.forEach(p => {
      if (Math.random() < intensity.injuryBase) {
        newlyInjured.push({ id: p.id, name: p.name, cause: 'team training' });
      }
    });

    // Individual drills carry their own additional risk on top, since
    // that player is doing focused extra work beyond the team session.
    (individualPlayerIds || []).forEach(pid => {
      if (newlyInjured.some(i => i.id === pid)) return; // already caught above
      if (Math.random() < intensity.injuryBase * 0.8) {
        const p = pool.find(x => x.id === pid);
        if (p) newlyInjured.push({ id: p.id, name: p.name, cause: 'individual drill' });
      }
    });

    if (newlyInjured.length) {
      const injuries = State.get('campaign.injuries') || [];
      newlyInjured.forEach(inj => {
        if (!injuries.some(i => i.id === inj.id)) {
          const out = 1 + Math.floor(Math.random() * 2); // training knocks are typically shorter than match injuries
          injuries.push({ id: inj.id, name: inj.name, matchesOut: out, cause: inj.cause });
        }
      });
      State.set('campaign.injuries', injuries);
    }

    return newlyInjured;
  }

  // ── Engine integration data ──────────────────────────────────────────────
  // Packages everything the match engine needs to read: which team focus
  // is active (with its sharpness-compounded strength), and which specific
  // players get an individual attribute boost and by how much.
  function getActiveTrainingState() {
    const focusId    = State.get('campaign.trainingFocus') || 'tactics';
    const intensityId= State.get('campaign.trainingIntensity') || 'standard';
    const individual = State.get('campaign.individualDrills') || {}; // { playerId: drillId }
    const intensity  = INTENSITY[intensityId] || INTENSITY.standard;

    return {
      focusId,
      intensityMult: intensity.mult,
      sharpnessMult: sharpnessBonus(focusId),
      individual,   // { playerId: drillId }
    };
  }

  // Apply an individual drill's attribute boost directly onto an attrs
  // object (mutates a COPY the caller provides — never the source pool
  // data). Called from match2.js's _buildPlayers() for each player.
  function applyIndividualBoost(attrs, playerId, intensityMult) {
    const individual = State.get('campaign.individualDrills') || {};
    const drillId = individual[playerId];
    if (!drillId) return attrs;
    const drill = DRILLS[drillId];
    if (!drill) return attrs;
    // Modest, attribute-specific bump — scaled by intensity. A single
    // drill should feel like sharpening a real skill, not transforming
    // the player; capped well below what real talent/rating provides.
    const bump = 1 + 0.06 * intensityMult;
    drill.attrs.forEach(k => {
      if (attrs[k] !== undefined) attrs[k] = Math.min(20, Math.round(attrs[k] * bump));
    });
    return attrs;
  }

  return {
    TEAM_FOCUS, INTENSITY, DRILLS,
    MAX_INDIVIDUAL_DRILLS,
    recordSession, getSharpness, sharpnessBonus,
    resolveInjuryRisk,
    getActiveTrainingState, applyIndividualBoost,
  };

})();
