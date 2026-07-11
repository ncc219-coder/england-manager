/**
 * buildup.js — Realistic pre-match build-up sequencing
 *
 * Replaces the old flat, unordered task list with a genuine staged
 * sequence that mirrors how a real international week actually unfolds:
 *
 *   Squad Announcement  (the call-up — locks in who's even available)
 *   Training Camp        (preparation — choose focus, manage fitness)
 *   Pre-Match Press       (media scrutiny — scaled by stakes)
 *   Final Squad Confirmation (trim the announced squad down to your XI+bench
 *                              pool — the last word before kickoff)
 *
 * Each stage carries a `dayOffset` — how many days before the fixture it
 * notionally happens — purely for framing/display ("3 days to go"), NOT a
 * real-time gate. The actual gate is sequential completion: you cannot
 * jump ahead to a later stage until the one before it is resolved, and
 * Kick Off is blocked until every stage for this fixture is done. There
 * is no auto-pick or penalty for taking your time — the deadline is a
 * pacing device, not a punishment.
 *
 * The INTENSITY of the sequence — how many stages exist, and how much
 * media scrutiny the press stage carries — scales with both the fixture's
 * base importance AND the current stakes (e.g. a qualifier that's already
 * a dead rubber gets a light touch regardless of its nominal importance).
 */

window.BuildUp = (function () {

  // ── Stakes calculation ──────────────────────────────────────────────────
  // Combines the fixture's intrinsic importance with the CURRENT campaign
  // situation to produce one effective intensity level. A "major" away
  // qualifier still gets the full treatment if it's a must-win decider;
  // the same fixture becomes routine once qualification is already
  // mathematically settled either way.
  function _effectiveStakes(fix) {
    const base = { low: 1, medium: 2, high: 3, major: 4 }[fix.importance] || 2;

    let stakesModifier = 0;
    if (fix.compType === 'qualifier') {
      const qual = State.get('campaign.qualifier');
      if (qual) {
        if (qual.qualified) stakesModifier = -2;       // already through — dead rubber
        else if (qual.failed) stakesModifier = -2;      // already out — nothing left to play for
        else {
          // Still alive — check how close the race is using the actual
          // qualifying group's fixture list, not a guessed total.
          const grp = window.QUALIFIER_GROUPS?.[qual.key];
          const table = window.CampaignPhase?.getSortedTable?.() || [];
          const engRow = table.find(r => r.name === 'England');
          if (grp && engRow) {
            const engFixturesTotal = grp.fixtures.filter(f => f.home === 'England' || f.away === 'England').length;
            const gamesLeft = engFixturesTotal - (engRow.p || 0);
            const ptsBehind = (table[0]?.pts || 0) - (engRow.pts || 0);
            // Tight race with few games left = genuine pressure
            if (gamesLeft <= 2 && ptsBehind <= 3) stakesModifier = 2;
            else if (gamesLeft <= 4) stakesModifier = 1;
          }
        }
      }
    }
    if (fix.compType === 'tournament') {
      const phase = State.get('tournament.phase');
      // Knockout football is never a dead rubber
      if (['r16','qf','sf','final'].includes(phase)) stakesModifier = Math.max(stakesModifier, 2);
      if (phase === 'group') stakesModifier = Math.max(stakesModifier, 1);
    }
    // A manager already under serious board pressure faces sharper media
    // scrutiny on top of whatever the fixture itself carries.
    const conf = State.get('campaign.boardConfidence') ?? 60;
    if (conf < 35) stakesModifier += 1;

    return Math.max(1, Math.min(5, base + stakesModifier));
  }

  // ── Day-offset windows by stakes level ───────────────────────────────────
  // Higher stakes = a longer, more deliberate build-up (mirrors how a real
  // squad get-together for a big qualifier or tournament match runs over
  // most of a week, while a midweek dead-rubber friendly barely has any
  // lead-up at all).
  const WINDOWS = {
    1: { announce: 2, training: 1, press: 0 },  // low stakes — barely any build-up
    2: { announce: 4, training: 2, press: 1 },
    3: { announce: 6, training: 3, press: 1 },
    4: { announce: 8, training: 4, press: 2 },  // major / decisive — full international week
    5: { announce: 9, training: 4, press: 1 },  // maximum pressure — media circles fastest at the end
  };

  // ── Build the staged sequence for a fixture ──────────────────────────────
  // Returns an ordered array of stage descriptors. Stages before the
  // CURRENT one are implicitly skippable if their window has already
  // passed relative to today's simulated date — but since we don't gate on
  // real time, every stage always appears; dayOffset is informational.
  // Real days between this fixture and the previous one in the calendar
  // — this (not fixture stakes) is what actually governs scouting slot
  // availability: scouting represents the manager physically going to
  // watch players play for their clubs, which needs real calendar time
  // between international call-ups, not just "this match matters more."
  function _daysSincePrevious(fixtureIdx) {
    const fix = window.ALL_FIXTURES[fixtureIdx];
    const prevFix = window.ALL_FIXTURES[fixtureIdx - 1];
    if (!fix || !prevFix || !fix.date || !prevFix.date) return 0;
    const a = new Date(prevFix.date), b = new Date(fix.date);
    if (isNaN(a) || isNaN(b)) return 0;
    return Math.max(0, Math.round((b - a) / 86400000));
  }

  // Scouting slots scale with that real gap — nothing below a full week
  // (an international week itself doesn't leave time for club scouting
  // trips), then roughly one additional slot per extra week of gap,
  // capped so a long off-season doesn't hand over the whole player pool.
  function scoutingSlotsForGap(days) {
    if (days < 7) return 0;
    if (days < 14) return 1;
    if (days < 28) return 2;
    if (days < 56) return 3;
    return 4;
  }

  // ── Tournament fixture sequence ──────────────────────────────────────────
  // Tournament matches get their OWN sequence rather than the full regular
  // one — the squad is announced once at tournament entry (a bigger,
  // separate ceremonial moment handled by TournamentBuildup, not repeated
  // per match), and there's no club-scouting angle mid-tournament. But
  // every match still gets a real training + press beat scaled by round
  // stakes, using the exact same stage TYPES and the exact same
  // completion-gating mechanism as regular fixtures — this used to be a
  // completely separate system (a single one-time "squadAnnounced" flag,
  // then nothing at all for the remaining 6 matches of a deep run, not
  // even a group-stage press conference), which meant a World Cup final
  // had less pre-match texture than a random Tuesday qualifier, and any
  // fix to the shared gating logic had to be remembered in two places.
  function _buildTournamentSequence(fix, fixtureIdx) {
    const stakes = _effectiveStakes(fix);
    const opp = window.getOppName ? window.getOppName(fix) : (fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam);
    const matchLabel = fix.homeTeam === 'England' ? `England vs ${opp}` : `${opp} vs England`;
    const roundName = window.TournamentEngine?.isActive?.()
      ? ({ group:'Group Stage', r16:'Round of 16', qf:'Quarter-Final', sf:'Semi-Final', final:'Final' }[State.get('tournament.phase')] || 'Tournament')
      : 'Tournament';
    const isKnockout = ['r16','qf','sf','final'].includes(State.get('tournament.phase'));

    // Real head-to-head history against this specific opponent, if the
    // current tournament's data models one (see tournament_media.js —
    // only a handful of tournament files have this) — woven into the
    // press conference so a genuine rivalry match gets asked about
    // before kickoff, not just referenced after the tournament ends.
    const tData = window.TournamentEngine?.data?.();
    const rivalry = (tData && window.TournamentMedia)
      ? window.TournamentMedia.rivalryNote(tData.historicalNotes, opp)
      : null;
    const pressDesc = rivalry
      ? `The press want to talk about history: "${rivalry}"`
      : (isKnockout
          ? `Knockout football now — every question ahead of ${matchLabel} carries extra weight.`
          : `Face the press ahead of ${matchLabel}.`);

    return [
      {
        id: `bu_training_${fixtureIdx}`,
        stage: 'training',
        type: 'TRAINING_SESSION',
        dayOffset: 1,
        title: 'Training',
        desc: `A short session before the ${roundName.toLowerCase()} against ${opp}. Set today's training focus.`,
        icon: '⚽',
        priority: isKnockout ? 'high' : 'medium',
        stakes,
      },
      {
        id: `bu_press_${fixtureIdx}`,
        stage: 'press',
        type: 'PRESS_CONFERENCE',
        dayOffset: 0,
        title: isKnockout ? `${roundName} Press Conference` : 'Pre-Match Press Conference',
        desc: pressDesc,
        icon: '🎙️',
        priority: isKnockout ? 'high' : 'medium',
        stakes,
      },
      {
        id: `bu_confirm_${fixtureIdx}`,
        stage: 'confirm',
        type: 'FINAL_CONFIRM',
        dayOffset: 0,
        title: 'Confirm Starting XI',
        desc: `Pick your starting eleven and bench for ${matchLabel}.`,
        icon: '✅',
        priority: 'high',
        stakes,
      },
    ];
  }

  function buildSequence(fixtureIdx) {
    const fix = window.ALL_FIXTURES[fixtureIdx];
    if (!fix) return [];

    if (fix.compType === 'tournament') return _buildTournamentSequence(fix, fixtureIdx);

    const stakes = _effectiveStakes(fix);
    const win = WINDOWS[stakes];
    const oppName = window.getOppName ? window.getOppName(fix) : (fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam);
    const matchLabel = fix.homeTeam === 'England' ? `England vs ${fix.awayTeam}` : `${fix.homeTeam} vs England`;
    const dayGap = _daysSincePrevious(fixtureIdx);
    const scoutSlots = scoutingSlotsForGap(dayGap);

    const stages = [];

    // 0. SCOUTING — only appears when there's genuinely enough real time
    //    between fixtures for the manager to go and watch players play
    //    for their clubs (a week minimum; international weeks themselves
    //    don't leave room for this). Comes first in the sequence, before
    //    the squad is even announced, since who you've scouted recently
    //    should inform who you call up.
    if (scoutSlots > 0) {
      stages.push({
        id: `bu_scout_${fixtureIdx}`,
        stage: 'scouting',
        type: 'SCOUTING_PHASE',
        dayOffset: Math.min(dayGap - 3, win.announce + 3),
        title: `Scouting — ${scoutSlots} trip${scoutSlots>1?'s':''} available`,
        desc: `You've had ${dayGap} days since the last match — time to go and watch some players. Choose up to ${scoutSlots} player${scoutSlots>1?'s':''} to scout before announcing the squad for ${matchLabel}.`,
        icon: '🔍',
        priority: 'medium',
        stakes,
        scoutSlots,
      });
    }

    // 1. SQUAD ANNOUNCEMENT — only for fixtures that warrant a real call-up
    //    moment (stakes >= 2). A throwaway friendly doesn't get a press
    //    conference for picking the squad; you just pick your XI later.
    if (stakes >= 2) {
      stages.push({
        id: `bu_announce_${fixtureIdx}`,
        stage: 'announcement',
        type: 'SQUAD_ANNOUNCEMENT',
        dayOffset: win.announce,
        title: 'Announce the Squad',
        desc: `Name your squad for ${matchLabel}. The press and public will be watching who gets the call.`,
        icon: '📋',
        priority: stakes >= 4 ? 'high' : 'medium',
        stakes,
      });
    }

    // 2. TRAINING CAMP — always present, but a low-stakes friendly gets a
    //    single light session rather than a full training-ground week.
    stages.push({
      id: `bu_training_${fixtureIdx}`,
      stage: 'training',
      type: 'TRAINING_SESSION',
      dayOffset: win.training,
      title: stakes >= 3 ? 'Training Camp' : 'Training Session',
      desc: stakes >= 3
        ? `The squad gathers to prepare for ${matchLabel}. Set the focus for the week.`
        : `A short session before ${matchLabel}. Set today's training focus.`,
      icon: '⚽',
      priority: stakes >= 4 ? 'high' : 'medium',
      stakes,
    });

    // 3. PRESS CONFERENCE — scrutiny scales with stakes. Always present
    //    (even a friendly gets at least a token media moment), but the
    //    QUESTIONS asked (handled in dashboard._openPress) already read
    //    context like board confidence and recent form, so the tone
    //    naturally sharpens for bigger occasions without needing a
    //    separate question bank here.
    stages.push({
      id: `bu_press_${fixtureIdx}`,
      stage: 'press',
      type: 'PRESS_CONFERENCE',
      dayOffset: win.press,
      title: stakes >= 4 ? 'Pre-Match Press Conference — Full House' : 'Pre-Match Press Conference',
      desc: stakes >= 4
        ? `National media turn out in force ahead of ${matchLabel}. Every answer will be scrutinised.`
        : `Face the press ahead of ${matchLabel}.`,
      icon: '🎙️',
      priority: 'medium',
      stakes,
    });

    // 4. FINAL SQUAD CONFIRMATION — the actual XI/bench pick, always last,
    //    always required, always on matchday itself. This is what used to
    //    be the only step (SquadUI) — now it's framed as the final stage
    //    of a real build-up rather than the whole build-up.
    stages.push({
      id: `bu_confirm_${fixtureIdx}`,
      stage: 'confirm',
      type: 'FINAL_CONFIRM',
      dayOffset: 0,
      title: 'Confirm Starting XI',
      desc: `Pick your starting eleven and bench for ${matchLabel}.`,
      icon: '✅',
      priority: 'high',
      stakes,
    });

    return stages;
  }

  return { buildSequence, _effectiveStakes, _daysSincePrevious, scoutingSlotsForGap };

})();
