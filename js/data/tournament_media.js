/**
 * tournament_media.js — In-Tournament Media Arc
 *
 * The squad announcement / press conference build-up (see
 * tournament_buildup.js) gives the tournament a strong opening beat, but
 * previously nothing followed it up — the narrative energy went quiet the
 * moment the group stage started and never came back until elimination or
 * victory. This gives the tournament screen a "story so far" line that
 * actually reacts to recent form and escalates as the rounds get bigger,
 * so the back pages feel alive between matches, not just at the start and
 * the very end.
 */

window.TournamentMedia = (function () {

  const BEATS = {
    perfect: [
      'The press can barely find a bad word to say. Won every game, conceded almost nothing — the back pages are calling this the real deal.',
      'Three from three and the doubters have gone quiet. Even the more cautious pundits are starting to sound the tiniest bit excited.',
      'Perfect record intact. The word "favourites" is starting to appear in print, whether the dressing room wants it there or not.',
    ],
    flying: [
      'Two wins on the bounce and the mood around the camp has shifted — cautious optimism is turning into something closer to belief.',
      'The performances have done the talking. Pundits who wrote this squad off before a ball was kicked are having to eat their words.',
      'Confidence is visibly growing. The manager keeps talking about "one game at a time" — nobody outside the building is listening.',
    ],
    steady: [
      'A mixed bag so far, but enough there to keep the tournament alive. The coverage is measured rather than glowing.',
      'Nothing spectacular, nothing disastrous. The papers are saving judgement for the games that actually matter.',
      'Solid, if unspectacular. The phrase "knockout football" is already being used, and everyone knows what that means.',
    ],
    scare: [
      'A nervy result has the phone-ins buzzing. Nothing fatal yet, but the concern is starting to creep into the coverage.',
      'That was closer than anyone wanted. The manager\'s team selection is under scrutiny for the first time this tournament.',
      'A stumble, not a collapse — but the tone has changed. Yesterday\'s praise has curdled into pointed questions.',
    ],
    crisis: [
      'The reaction has been brutal. Former players are queuing up on television to say what\'s wrong, and none of it is subtle.',
      'The back pages are merciless this morning. One bad result and suddenly every decision from the last month is being relitigated.',
      'There is a genuine sense of alarm building. This tournament can still be saved, but the margin for error is gone.',
    ],
    knockout_tension: [
      'Knockout football now — lose and it\'s over. The whole country feels it, and so, visibly, does the squad.',
      'One game, no second chances. The build-up has that particular tightness that only single-elimination football produces.',
      'Every training-ground rumour is now a back-page story. This is the stage where reputations are actually made.',
    ],
  };

  // Determine which narrative band best fits where the tournament stands
  // right now — recent form matters more than the overall record, since a
  // team that scraped through a bad group but is now flying reads very
  // differently to the press than the reverse.
  function _band(path, phase) {
    if (!path.length) return null;
    if (['r16', 'qf', 'sf', 'final'].includes(phase)) return 'knockout_tension';

    const last = path[path.length - 1];
    const lastWasLoss = last.engScore < last.oppScore;
    const lastWasDraw = last.engScore === last.oppScore;
    const wins = path.filter(r => r.engScore > r.oppScore).length;
    const goalsAgainst = path.reduce((s, r) => s + r.oppScore, 0);

    if (lastWasLoss) return 'crisis';
    if (lastWasDraw) return 'scare';
    if (wins === path.length && wins >= 2 && goalsAgainst === 0) return 'perfect';
    if (wins === path.length) return 'flying';
    return 'steady';
  }

  // Returns { band, text } or null if there's nothing to report yet
  // (before a ball's been kicked — the buildup module already owns that
  // moment).
  function generate(path, phase) {
    const band = _band(path, phase);
    if (!band) return null;
    const pool = BEATS[band] || BEATS.steady;
    return { band, text: pool[Math.floor(Math.random() * pool.length)] };
  }

  // Real head-to-head history against the specific opponent coming up —
  // only ever returns something for the handful of tournament files that
  // actually model per-opponent historicalNotes (Mexico 86, Italia 90,
  // Euro 88, Euro 96, France 98 — tournaments where England's real run
  // produced a genuine rivalry moment against a named side). Most
  // tournament files use a flat group/knockout summary shape instead,
  // which has no per-opponent breakdown to draw from — this returns null
  // for those rather than fabricating a rivalry note that isn't backed
  // by anything in the data.
  function rivalryNote(historicalNotes, opponentName) {
    if (!historicalNotes || !opponentName) return null;
    return historicalNotes[opponentName] || null;
  }

  return { generate, rivalryNote };

})();
