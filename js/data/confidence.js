/**
 * confidence.js — Confidence (bundles morale + big-match composure)
 *
 * One stat, 0-100, stored exactly where the existing morale system already
 * stores it (campaign.playerMorale) — this is that system finally getting
 * a real downstream effect, not a second parallel stat. It already had
 * real inputs (team talks, match results, goals scored) and a real
 * display (squad screen); this module is what makes it actually matter
 * in a match, plus the "thrown in too soon" risk for inexperienced
 * players in high-pressure fixtures.
 *
 * 50 = neutral, no effect either way. The curve is gentle near the
 * middle (an ordinary so-so week shouldn't visibly change anything) and
 * steepens toward the extremes — a player in real confidence trouble, or
 * playing with total conviction, should visibly look like it.
 */

window.Confidence = (function () {

  const NEUTRAL = 50;

  // Converts a 0-100 confidence value into a multiplier centred on 1.0.
  // Quadratic-ish curve: small deviations from neutral barely matter,
  // large ones matter much more — matches how a slightly-off day is
  // basically invisible but a genuine crisis of confidence is not.
  function multiplier(confidence0to100) {
    const c = Math.max(0, Math.min(100, confidence0to100));
    const delta = (c - NEUTRAL) / 50; // -1 to +1
    const curved = Math.sign(delta) * Math.pow(Math.abs(delta), 1.4);
    // Cap the real swing at roughly ±12% — a real, noticeable effect,
    // never enough to turn a top player average or an average player
    // world-class on confidence alone.
    return 1 + curved * 0.12;
  }

  // Applies the multiplier to every derived score on a built player
  // object — same pattern as roles.js's applyToDerivedScores, so the
  // effect flows through to _teamStats() automatically without any
  // other engine code needing to know confidence exists.
  const SCALED_KEYS = [
    'finishing','heading','crossing','longPassing','shortPass','dribbling',
    'defending','heading_def','strength','pace','handling','positioning',
    'leadership','workrate',
  ];

  function applyToDerivedScores(playerObj, confidence0to100) {
    const mult = multiplier(confidence0to100);
    SCALED_KEYS.forEach(key => {
      if (playerObj[key] !== undefined) {
        playerObj[key] = Math.max(0.15, Math.min(1.0, playerObj[key] * mult));
      }
    });
    return playerObj;
  }

  // ── "Too soon" risk ───────────────────────────────────────────────────────
  // A young, inexperienced player thrown into a genuinely high-pressure
  // fixture carries a real risk of a confidence hit regardless of the
  // match result — this is deliberately separate from the normal
  // result-based swing in result.js, which already rewards/punishes
  // actual performance. This is about the WEIGHT of the occasion itself.
  //
  // Resolved once, at kickoff (not per-tick) — a real young player either
  // rises to a daunting occasion or visibly isn't ready for it; that's a
  // single moment of truth, not something that should re-roll 90 times.
  function resolveTooSoonRisk(player, caps, age, fixtureImportance, currentConfidence) {
    const isYoung = age !== undefined && age <= 21;
    const isInexperienced = (caps || 0) < 5;
    const isHighPressure = fixtureImportance === 'major' || fixtureImportance === 'high';
    if (!isYoung || !isInexperienced || !isHighPressure) return null;

    // Risk scales with HOW inexperienced and HOW low their confidence
    // already is going in — a composed, confident 19-year-old debutant
    // is a much smaller risk than a shaky one with caps in single digits
    // and confidence already below par.
    const capsRisk = caps === 0 ? 0.30 : caps <= 2 ? 0.20 : 0.10;
    const confidenceRisk = currentConfidence < 45 ? 0.15 : currentConfidence < 60 ? 0.05 : 0;
    const importanceRisk = fixtureImportance === 'major' ? 0.10 : 0.04;
    const riskChance = Math.min(0.55, capsRisk + confidenceRisk + importanceRisk);

    if (Math.random() < riskChance) {
      // A real hit — they weren't ready for the occasion. Bigger than a
      // routine bad-result swing, since this is about the player
      // themselves, not the scoreline.
      return { hit: true, delta: -(8 + Math.round(Math.random() * 7)) }; // -8 to -15
    }
    // Didn't crack under it — a confidence-building moment, rising to a
    // big occasion is exactly the kind of thing that should help a young
    // player settle into international football.
    return { hit: false, delta: 4 + Math.round(Math.random() * 4) }; // +4 to +8
  }

  function applyTooSoonRisk(playerId, caps, age, fixtureImportance) {
    const morale = State.get('campaign.playerMorale') || {};
    const current = morale[playerId] ?? 50;
    const result = resolveTooSoonRisk({ }, caps, age, fixtureImportance, current);
    if (!result) return null;
    morale[playerId] = Math.max(15, Math.min(100, current + result.delta));
    State.set('campaign.playerMorale', morale);
    return { ...result, playerId, before: current, after: morale[playerId] };
  }

  return {
    NEUTRAL, multiplier, applyToDerivedScores, SCALED_KEYS,
    resolveTooSoonRisk, applyTooSoonRisk,
  };

})();
