/**
 * _engine.js — TournamentEngine
 *
 * Manages tournament state: group tables, results simulation,
 * knockout bracket progression, and England's path through.
 *
 * State stored in: State.get('tournament.*')
 */
window.TournamentEngine = {

  // ── Load a tournament into state ─────────────────────────────────────────
  load(tournamentKey) {
    const data = window.TOURNAMENTS[tournamentKey];
    if (!data) { console.error('Unknown tournament:', tournamentKey); return; }

    // Initialise tables for every group
    const tables = {};
    data.groups.forEach(g => {
      tables[g.id] = {};
      g.teams.forEach(t => {
        tables[g.id][t.name] = { p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 };
      });
    });

    // Initialise all fixtures as unplayed
    const results = {};
    data.allFixtures.forEach(f => { results[f.id] = null; });

    State.set('tournament', {
      key:         tournamentKey,
      phase:       'group',        // 'group' | 'r16' | 'qf' | 'sf' | 'final' | 'eliminated' | 'complete'
      englandPath: [],             // which games England have played
      tables,
      results,
      bracket:     {},             // knockout bracket slots
      englandElim: false,
      currentMatchId: null,
    });

    if (window.TournamentStats) window.TournamentStats.reset();

    console.log(`Tournament loaded: ${data.name}`);
  },

  // ── Get the tournament data object ───────────────────────────────────────
  data() {
    const key = State.get('tournament.key');
    return key ? window.TOURNAMENTS[key] : null;
  },

  // ── Read a fixture's round, tolerating either `round` or `stage` field ────
  // (Tournament data files are inconsistent — some use one, some the other.)
  _round(fixture) {
    return fixture.round || fixture.stage || 'group';
  },

  // ── Resolved fixture lookup map — lets us mutate home/away once a slot is
  //    known, without touching the static TOURNAMENTS data structure itself.
  _resolvedMap() {
    return State.get('tournament.resolved') || {};
  },

  // ── Get a fixture's effective home/away, preferring any resolved value ────
  _effectiveTeams(fixture) {
    const resolved = this._resolvedMap()[fixture.id];
    return {
      home: resolved?.home || fixture.home,
      away: resolved?.away || fixture.away,
    };
  },

  // ── Find England's next unplayed fixture in this tournament ──────────────
  nextEnglandFixture() {
    const data  = this.data(); if (!data) return null;
    const phase = State.get('tournament.phase');
    const results = State.get('tournament.results') || {};

    // Only look for fixtures in the current phase (group, r16, qf, sf, final, 3rd)
    const phaseRounds = {
      group:      ['group'],
      r16:        ['r16'],
      qf:         ['qf'],
      sf:         ['sf'],
      final:      ['final'],
      complete:   [],
      eliminated: [],
    }[phase] || ['group'];

    const found = data.allFixtures.find(f => {
      if (!phaseRounds.includes(this._round(f))) return false;
      if (results[f.id] !== null && results[f.id] !== undefined) return false;
      const { home, away } = this._effectiveTeams(f);
      return home === 'England' || away === 'England';
    });

    if (!found) return null;
    // Return a copy with resolved home/away so callers always see real team names
    const { home, away } = this._effectiveTeams(found);
    return { ...found, home, away };
  },

  // ── Simulate all non-England fixtures in a given round ───────────────────
  simulateOtherResults(upToRound) {
    const data    = this.data(); if (!data) return;
    const results = { ...State.get('tournament.results') };
    const tables  = JSON.parse(JSON.stringify(State.get('tournament.tables') || {}));

    data.allFixtures
      .filter(f => this._round(f) === upToRound)
      .forEach(f => {
        if (results[f.id] !== null && results[f.id] !== undefined) return; // already played
        const { home, away } = this._effectiveTeams(f);
        if (home === 'England' || away === 'England') return; // England's own result is recorded separately
        if (home === 'TBD' || away === 'TBD' || !home || !away) return; // slot not resolved yet — skip for now

        const result = this._simulateMatch({ ...f, home, away });
        results[f.id] = result;
        if (f.group) this._applyToTable(tables, f.group, home, away, result);
      });

    State.set('tournament.results', results);
    State.set('tournament.tables', tables);
  },

  // ── Record an England result and apply to table ──────────────────────────
  recordEnglandResult(fixtureId, engScore, oppScore, penaltyInfo) {
    const data = this.data(); if (!data) return;
    const fix  = data.allFixtures.find(f => f.id === fixtureId);
    if (!fix) {
      console.warn('TournamentEngine: fixture not found:', fixtureId);
      return;
    }
    // Skip if already recorded
    const existingResults = State.get('tournament.results') || {};
    if (existingResults[fixtureId] !== null && existingResults[fixtureId] !== undefined) {
      // Already recorded — don't double-count
      return;
    }

    const { home, away } = this._effectiveTeams(fix);
    const homeGoals = home === 'England' ? engScore : oppScore;
    const awayGoals = home === 'England' ? oppScore : engScore;
    const resultEntry = { home: homeGoals, away: awayGoals };
    // Persist penalty shootout info directly on the result record — this
    // is what _resolveSlot() actually reads to determine the winner of a
    // drawn knockout tie for LATER rounds' bracket resolution. Previously
    // the UI layer (tournament.js) correctly used match.penalties to
    // decide immediate elimination/advancement, but never wrote it back
    // here — meaning any later round that needed to chain off "who won
    // this tie" would see a tied scoreline with no way to resolve it,
    // and silently fall through to an incorrect default.
    if (penaltyInfo && penaltyInfo.engWon !== undefined) {
      resultEntry.penalties = true;
      resultEntry.penWinner = penaltyInfo.engWon ? 'England' : (home === 'England' ? away : home);
    }
    const results = { ...existingResults, [fixtureId]: resultEntry };

    const tables = JSON.parse(JSON.stringify(State.get('tournament.tables') || {}));
    if (fix.group) {
      this._applyToTable(tables, fix.group, home, away, { home:homeGoals, away:awayGoals });
    }

    State.set('tournament.results', results);
    State.set('tournament.tables', tables);
    State.upd('tournament.englandPath', p => [
      ...p.filter(x => x.fixtureId !== fixtureId), // remove any duplicate
      { fixtureId, engScore, oppScore, round: this._round(fix), opponent: home === 'England' ? away : home }
    ]);
  },

  // ── Check if England qualified from their group ──────────────────────────
  englandGroupPosition() {
    const data  = this.data(); if (!data) return null;
    const group = data.groups.find(g => g.teams.some(t => t.name === 'England'));
    if (!group) return null;
    const table = State.get(`tournament.tables.${group.id}`) || {};
    const sorted = this._sortTable(table);
    const pos = sorted.findIndex(([name]) => name === 'England');
    return { position: pos + 1, qualified: pos < group.qualified, group: group.id };
  },

  // ── Adapt a group-position slot ('D_1', 'D_2', ...) that refers to
  //    England's OWN group to whichever position they actually finished
  //    in ─────────────────────────────────────────────────────────────────
  // Several tournament files hardcode a single knockout-round fixture
  // that only anticipates ONE specific finishing position — usually
  // whatever position England topped their group with historically (e.g.
  // brazil14's R16 is fixed as 'D_1 vs C_2'). Finishing 2nd instead is an
  // entirely ordinary, common outcome (arguably MORE likely than a random
  // simulation reproducing the exact historical position) — without this,
  // a legitimately qualified England could reference a slot that resolves
  // to a completely different team, leaving no fixture anywhere that
  // actually contains England despite them having genuinely advanced.
  _adaptEnglandSlot(slot, data) {
    if (!slot || typeof slot !== 'string') return slot;
    const m = slot.match(/^([A-Za-z0-9]+)_(\d+)$/);
    if (!m) return slot;
    const [, groupId] = m;
    const pos = this.englandGroupPosition();
    if (!pos || !pos.qualified || pos.group !== groupId) return slot;
    return `${groupId}_${pos.position}`;
  },

  // ── Sort table ────────────────────────────────────────────────────────────
  _sortTable(table) {
    return Object.entries(table).sort(([,a], [,b]) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      const gdA = a.gf - a.ga, gdB = b.gf - b.ga;
      if (gdB !== gdA) return gdB - gdA;
      return b.gf - a.gf;
    });
  },

  getSortedTable(groupId) {
    const table = State.get(`tournament.tables.${groupId}`) || {};
    return this._sortTable(table);
  },

  // ── Simulate a single match ───────────────────────────────────────────────
  _simulateMatch(fixture) {
    const data = this.data();
    const homeTeam = data.teams[fixture.home] || { rating: 75 };
    const awayTeam = data.teams[fixture.away] || { rating: 75 };
    const diff = (homeTeam.rating - awayTeam.rating) / 10;
    const homeAdv = fixture.neutral ? 0 : 0.3;

    // Expected goals based on rating diff
    const homeExp = Math.max(0.4, 1.15 + diff * 0.18 + homeAdv);
    const awayExp = Math.max(0.4, 1.05 - diff * 0.18);

    const homeGoals = this._poisson(homeExp);
    const awayGoals = this._poisson(awayExp);

    // Use historical result if available (weighted 70% history, 30% simulation)
    const realism = (State.get('meta.settings.historicRealism') ?? 70) / 100;
    let result;
    if (fixture.historicResult && Math.random() < realism) {
      result = { home: fixture.historicResult.home, away: fixture.historicResult.away };
    } else {
      result = { home: homeGoals, away: awayGoals };
    }

    // Knockout matches: if draw, simulate extra time then penalties
    const isKnockout = fixture.stage && !['group'].includes(fixture.stage);
    if (isKnockout && result.home === result.away) {
      // Extra time — small chance of goal
      const etGoal = Math.random() < 0.25;
      if (etGoal) {
        if (Math.random() < 0.5) result.home++;
        else result.away++;
        result.aet = true;
      } else {
        // Penalties — roughly 50/50 with slight home advantage
        const engInvolved = fixture.home === 'England' || fixture.away === 'England';
        // England historically bad at penalties
        const engWinChance = engInvolved ? 0.42 : 0.50;
        const homeIsEng = fixture.home === 'England';
        const homeWins = Math.random() < (homeIsEng ? engWinChance : 1 - engWinChance);
        result.penWinner = homeWins ? fixture.home : fixture.away;
        result.penalties = true;
        // Simulate penalty scores (5 each, sudden death if level)
        const homePens = Math.floor(Math.random() * 3) + 3; // 3-5
        const awayPens = homeWins ? Math.max(0, homePens - Math.ceil(Math.random() * 2)) : homePens + Math.ceil(Math.random() * 2);
        result.penScore = { home: homePens, away: Math.min(awayPens, homePens + (homeWins?-1:1)) };
      }
    }
    return result;
  },

  _poisson(lambda) {
    // Knuth algorithm
    let L = Math.exp(-lambda), k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  },

  // ── Apply result to group table ───────────────────────────────────────────
  _applyToTable(tables, groupId, home, away, result) {
    if (!groupId || !tables[groupId]) return;
    const hRow = tables[groupId][home];
    const aRow = tables[groupId][away];
    if (!hRow || !aRow) return;

    hRow.p++; aRow.p++;
    hRow.gf += result.home; hRow.ga += result.away;
    aRow.gf += result.away; aRow.ga += result.home;

    if (result.home > result.away) { hRow.w++; hRow.pts += 3; aRow.l++; }
    else if (result.home < result.away) { aRow.w++; aRow.pts += 3; hRow.l++; }
    else { hRow.d++; hRow.pts++; aRow.d++; aRow.pts++; }
  },

  // ── Round order used to figure out "what comes next" generically ─────────
  _roundOrder() { return ['group','r16','qf','sf','final']; },

  // Real tournament squad sizes have changed over the decades — using a
  // flat 26 for every era (the club-season squad cap this game uses
  // elsewhere) would be historically wrong for, say, 1986 or 1996, where
  // the real limit was 22. UEFA expanded to 23 from 2002, then to 26
  // specifically for Euro 2020 (pandemic-era squad rotation allowance)
  // and kept it for Euro 2024 and the most recent World Cups.
  squadSizeFor(year) {
    if (!year) return 23;
    if (year >= 2020) return 26;
    if (year >= 2002) return 23;
    return 22;
  },

  // ── Resolve a single slot descriptor to a team name ───────────────────────
  // Handles:
  //   'A_1'        → Group A, 1st place
  //   'A_2'        → Group A, 2nd place
  //   'best3_1'    → 1st-ranked among all 3rd-placed teams across groups
  //   'e00_QF1_W'  → winner of fixture e00_QF1 (any previous round)
  //   'England'    → literal team name, returned as-is
  // Pick a plausible opponent for bracket slots that can't be resolved from
  // real fixture data (the "other side of the bracket" in tournaments that
  // only model England's own historical path). Picks a team rated close to
  // what a deep tournament run would realistically produce, avoiding teams
  // already eliminated or already used elsewhere in the resolved bracket.
  _fillerOpponent(data, tables, results, inProgressResolved) {
    // Use the in-progress resolved map (updated live during the current
    // buildKnockoutBracket() pass) when available, falling back to the
    // last-saved State snapshot otherwise. Without this, two slots resolved
    // in the SAME pass (e.g. SF and Final both becoming resolvable once an
    // SF result is recorded) would both see the same stale "used" set and
    // could pick the identical filler opponent for both rounds.
    const source = inProgressResolved || this._resolvedMap();
    const used = new Set(Object.values(source).flatMap(r => [r.home, r.away]));
    used.add('England');
    const candidates = Object.entries(data.teams || {})
      .filter(([name]) => !used.has(name) && name !== 'TBD')
      .sort((a, b) => b[1].rating - a[1].rating);
    // Weighted toward the upper-middle of the remaining pool — a team good
    // enough to have plausibly reached this stage, not necessarily the best.
    const pick = candidates[Math.floor(Math.random() * Math.min(4, candidates.length))];
    return pick ? pick[0] : 'TBD';
  },

  _resolveSlot(slot, tables, results, data, inProgressResolved) {
    if (!slot || slot === 'TBD') return 'TBD';
    if (slot === 'filler') return this._fillerOpponent(data, tables, results, inProgressResolved);

    // Winner-of-fixture chain: '<fixtureId>_W'
    if (slot.endsWith('_W')) {
      const refId = slot.slice(0, -2);
      const refFix = data.allFixtures.find(f => f.id === refId);

      // The referenced fixture doesn't exist in this tournament's data at
      // all — common for the "other side of the bracket" in tournament
      // files that only model England's specific historical path in full.
      // Rather than leave this as a permanent TBD (which breaks England's
      // own progression), generate a plausible unused opponent so the
      // bracket can still resolve and the game can continue.
      if (!refFix) return this._fillerOpponent(data, tables, results, inProgressResolved);

      const r = results[refId];
      if (!r) return 'TBD';
      const { home, away } = this._effectiveTeams(refFix);
      if (home === 'TBD' || away === 'TBD') return 'TBD';
      if (r.penalties && r.penWinner) return r.penWinner;
      return r.home > r.away ? home : away;
    }

    // Best-third-placed slot, ranked: 'best3_N' (1st/2nd/3rd best 3rd-place team)
    if (slot.startsWith('best3_')) {
      const n = parseInt(slot.split('_')[1]) - 1;
      const thirds = data.groups
        .map(g => this._sortTable(tables[g.id] || {})[2])
        .filter(Boolean)
        .sort((a, b) => b[1].pts - a[1].pts || (b[1].gf - b[1].ga) - (a[1].gf - a[1].ga));
      return thirds[n]?.[0] || this._fillerOpponent(data, tables, results, inProgressResolved);
    }

    // Best-third-placed slot, unranked: 'best3rd' (just "the best available
    // third-place team" — used by 24-team Euro formats where the exact
    // qualifying third gets matched to this slot via a separate UEFA table
    // we don't fully model; the single best-ranked third works as a stand-in).
    if (slot === 'best3rd') {
      const thirds = data.groups
        .map(g => this._sortTable(tables[g.id] || {})[2])
        .filter(Boolean)
        .sort((a, b) => b[1].pts - a[1].pts || (b[1].gf - b[1].ga) - (a[1].gf - a[1].ga));
      return thirds[0]?.[0] || this._fillerOpponent(data, tables, results, inProgressResolved);
    }

    // Either-or third-place slot: 'A_3_or_C_3' (the actual qualifying side
    // depends on cross-group third-place rankings; we don't model that full
    // UEFA/FIFA table, so just resolve to whichever of the two groups'
    // third-placed team is statistically stronger — a reasonable stand-in).
    if (/^[A-Z]_3_or_[A-Z]_3$/.test(slot)) {
      const [gA, , , gB] = slot.split('_');
      const thirdA = this._sortTable(tables[gA] || {})[2];
      const thirdB = this._sortTable(tables[gB] || {})[2];
      const candidates = [thirdA, thirdB].filter(Boolean);
      if (!candidates.length) return this._fillerOpponent(data, tables, results, inProgressResolved);
      candidates.sort((a, b) => b[1].pts - a[1].pts || (b[1].gf - b[1].ga) - (a[1].gf - a[1].ga));
      return candidates[0][0];
    }

    // Group position slot: 'A_1', 'B_2', etc.
    if (/^[A-Z]_\d+$/.test(slot)) {
      const [gId, pos] = slot.split('_');
      const groupTable = tables[gId] || {};
      const sorted = this._sortTable(groupTable);
      // Some tournament data files only model the groups England actually
      // played in fully — other groups' fixtures don't exist at all, so
      // their tables stay at zero played games forever. Detect that case
      // and use a plausible filler rather than an arbitrary zero-played
      // "ranking" that has no real basis.
      const anyPlayed = Object.values(groupTable).some(row => row.p > 0);
      if (!anyPlayed) return this._fillerOpponent(data, tables, results, inProgressResolved);
      return sorted[parseInt(pos) - 1]?.[0] || 'TBD';
    }

    // "Whichever position England actually finished" slot: 'ENG_OF_C'
    // (read: "England, whichever position they're in, within Group C").
    // Built specifically for hardcoded knockout fixtures where the real
    // historical opponent is known and fixed, but England's own exact
    // finishing position (1st vs 2nd) is genuinely close enough in real
    // standings — or different enough across a simulated playthrough —
    // that hardcoding a single position slot (e.g. always 'C_1') can
    // silently stop resolving to England at all the moment their actual
    // simulated position differs from whatever the data file assumed.
    if (/^ENG_OF_[A-Z]$/.test(slot)) {
      const gId = slot.split('_')[2];
      const groupTable = tables[gId] || {};
      const anyPlayed = Object.values(groupTable).some(row => row.p > 0);
      if (!anyPlayed) return this._fillerOpponent(data, tables, results, inProgressResolved);
      const sorted = this._sortTable(groupTable);
      const engEntry = sorted.find(([name]) => name === 'England');
      return engEntry ? 'England' : (sorted[0]?.[0] || 'TBD');
    }

    // Literal team name (used for the 4 hardcoded-bracket tournaments we
    // convert to dynamic slots — see _buildSyntheticBracket)
    return slot;
  },

  // ── Resolve every round's slots into real team names, mutating the
  //    resolved-fixture map so lookups always reflect current reality.
  //    Called after the group stage AND after every subsequent knockout
  //    round completes — not just once.
  // Resolves every knockout slot's real team names from current group
  // tables and results, and refreshes the simple bracket display map for
  // the CURRENTLY SET phase. Does not change `tournament.phase` itself —
  // the caller (tournament.js, after recording a result) is responsible
  // for deciding and setting the next phase via _roundOrder(), since only
  // the caller knows which round was just completed. This call should run
  // immediately after that phase is set, so the new round's opponent is
  // ready before the player is shown it.
  buildKnockoutBracket() {
    const data = this.data(); if (!data) return;
    let ks = data.knockoutStructure;

    // 4 tournaments ship with no knockoutStructure at all (hardcoded history).
    // Build one on the fly from their allFixtures, ONCE per tournament run,
    // and cache it — _buildSyntheticBracket() mutates allFixtures (it can
    // append synthetic fixtures), so calling it again on a later round
    // would see its own previous output as "real" data and produce
    // nonsense. The cached copy is the single source of truth from here on.
    if (!ks) {
      ks = State.get('tournament.syntheticKS');
      if (!ks) {
        ks = this._buildSyntheticBracket(data);
        if (ks) State.set('tournament.syntheticKS', ks);
      }
    }
    if (!ks) {
      // Last-resort fallback for malformed data — don't silently freeze
      // the player; assume the very first knockout round.
      if (!State.get('tournament.phase') || State.get('tournament.phase') === 'group') {
        State.set('tournament.phase', 'qf');
      }
      return;
    }

    const tables  = State.get('tournament.tables') || {};
    const results = State.get('tournament.results') || {};
    const resolved = { ...this._resolvedMap() };

    const order = this._roundOrder();
    order.forEach(round => {
      let entries = ks[round];
      if (!entries) return;
      if (!Array.isArray(entries)) entries = [entries]; // 'final' is a single object, not an array

      // Count how many slot references across THIS round's fixtures point
      // at England's own group. If the bracket already models BOTH
      // possible finishing positions via separate fixtures (e.g.
      // russia18's R1: 'G_1 vs H_2' and R2: 'H_1 vs G_2' — either
      // position naturally resolves to the right team on its own),
      // adapting would duplicate England into the wrong fixture on top
      // of the one that's already correct. Adaptation should only kick
      // in for a genuine gap: exactly one fixture ever references this
      // group, meaning the OTHER finishing position was simply never
      // modelled at all.
      const engGroup = this.englandGroupPosition()?.group;
      let engGroupRefs = 0;
      if (engGroup) {
        entries.forEach(slot => {
          const fix = data.allFixtures.find(f => f.id === slot.fixtureId);
          if (!fix) return;
          [slot.home || fix.home, slot.away || fix.away].forEach(v => {
            if (typeof v === 'string' && v.startsWith(`${engGroup}_`)) engGroupRefs++;
          });
        });
      }
      const shouldAdapt = engGroupRefs === 1;

      entries.forEach(slot => {
        const fix = data.allFixtures.find(f => f.id === slot.fixtureId);
        if (!fix) return;

        // Once both sides of a slot are resolved to real teams (no TBD
        // remaining), lock it — re-resolving on every call would re-roll
        // any filler opponent and could change a settled fixture under
        // the player's feet between rounds.
        const existing = resolved[fix.id];
        if (existing && existing.home !== 'TBD' && existing.away !== 'TBD') return;

        // Prefer explicit slot.home/slot.away if the structure provides them;
        // otherwise fall back to whatever is already on the fixture itself
        // (used for the synthetic brackets built from hardcoded data).
        const rawHome = slot.home || fix.home;
        const rawAway = slot.away || fix.away;
        const homeSlot = shouldAdapt ? this._adaptEnglandSlot(rawHome, data) : rawHome;
        const awaySlot = shouldAdapt ? this._adaptEnglandSlot(rawAway, data) : rawAway;
        const home = this._resolveSlot(homeSlot, tables, results, data, resolved);
        const away = this._resolveSlot(awaySlot, tables, results, data, resolved);
        resolved[fix.id] = { home, away };
      });
    });

    State.set('tournament.resolved', resolved);

    // Refresh the simple bracket display map for whichever phase is
    // currently set (the caller already advanced it before calling this).
    const phase = State.get('tournament.phase') || 'group';
    const bracket = {};
    let curEntries = ks[phase];
    if (curEntries) {
      if (!Array.isArray(curEntries)) curEntries = [curEntries];
      curEntries.forEach(slot => {
        const r = resolved[slot.fixtureId];
        if (r) bracket[slot.fixtureId] = r;
      });
    }
    State.set('tournament.bracket', bracket);
  },

  // ── Build a dynamic knockoutStructure for tournaments that hardcode
  //    history directly into allFixtures (euro88, euro96, france98,
  //    italia90). Uses the group composition to express the *first*
  //    knockout round as resolvable group-position slots; rounds after
  //    that are expressed as winner-chains off the previous round's
  //    fixture ids, so the bracket plays out dynamically from there on,
  //    rather than always reproducing the historical opponent.
  _buildSyntheticBracket(data) {
    const rounds = ['r16', 'qf', 'sf', 'final'];
    const byRound = {};
    rounds.forEach(r => {
      byRound[r] = data.allFixtures.filter(f => this._round(f) === r);
    });

    // Find the first round that has fixtures involving England specifically
    // — not just any fixtures. Some tournament files (euro88) only model
    // the real knockout fixtures for context/flavour, and England never
    // actually appears in any of them (because historically England didn't
    // get out of the group). If the player's England DOES get out of the
    // group in this game, there's nothing in the data to slot them into —
    // we need to treat every knockout round as a genuine gap and
    // synthesize all of them for England's own path.
    const firstRoundWithEngland = rounds.find(r =>
      byRound[r].some(f => f.home === 'England' || f.away === 'England')
    );
    const firstRoundAny = rounds.find(r => byRound[r].length > 0);
    const firstRound = firstRoundWithEngland || firstRoundAny;
    if (!firstRound) return null;

    const ks = {};
    // Synthetic fixtures we create for rounds that have no real data at
    // all (e.g. france98 only defines R16 and Final for England's branch —
    // there's a genuine gap at QF/SF since England lost in the R16
    // historically). These get appended to allFixtures so the rest of the
    // engine can look them up exactly like any other fixture.
    const synthesizedFixtures = [];

    const groupIds = data.groups.map(g => g.id);
    const n = groupIds.length;
    // If no round actually involves England, the "first round" fixtures we
    // found are irrelevant to England's path — synthesize a fresh one
    // instead of trying to wire England into someone else's match.
    const firstFixtures = firstRoundWithEngland ? byRound[firstRound] : [];

    // First knockout round: only derive group-position slots ('A_1' v 'B_2')
    // for fixtures that don't already have a literal home/away team name —
    // some tournament files (france98, italia90) hardcode England's actual
    // historical first-round opponent directly onto the fixture (e.g.
    // 'England' vs 'Argentina'), and that intentional match-up should be
    // respected as-is rather than overwritten with an arbitrary group slot.
    const isLiteralTeam = (v) => v && v !== 'TBD' && !/^[A-Z]_\d+$/.test(v) && data.teams && (v in data.teams || v === 'England');

    if (firstFixtures.length) {
      ks[firstRound] = firstFixtures.map((f, i) => {
        if (isLiteralTeam(f.home) && isLiteralTeam(f.away)) {
          // Keep the fixture's own real team names — nothing to synthesize.
          return { fixtureId: f.id, home: f.home, away: f.away };
        }
        const gA = groupIds[i % n];
        const gB = groupIds[(i + 1) % n];
        return { fixtureId: f.id, home: `${gA}_1`, away: `${gB}_2` };
      });
    } else {
      // England never appears in this round's real fixtures at all (e.g.
      // euro88, where England didn't escape the group historically) —
      // synthesize a brand-new fixture for England's own entry into this
      // round, with the opponent resolved as a filler since there's
      // nothing in the data to determine who it should "really" be.
      const synthId = `synth_${data.key}_${firstRound}_eng`;
      const synthFixture = {
        id: synthId, group: null, round: firstRound, home: 'England', away: 'TBD',
        venue: '', date: '', neutral: true,
      };
      synthesizedFixtures.push(synthFixture);
      // APPEND, don't replace — byRound[firstRound] may already contain
      // real fixtures for this round that just don't involve England
      // (e.g. Euro 88's real SF1/SF2). The NEXT round's chain-tracing
      // below needs those real fixtures still present in prevFixtures to
      // correctly trace "Netherlands" and "Soviet Union" back to which
      // semi-final they actually came from — overwriting this array
      // entirely used to erase that trail, so the final always fell back
      // to the fixed historical fixture (Netherlands vs Soviet Union)
      // instead of a winner-chain that could ever include England.
      byRound[firstRound] = [...byRound[firstRound], synthFixture];
      ks[firstRound] = [{ fixtureId: synthId, home: 'England', away: 'filler' }];
    }

    // Every round AFTER firstRound: winner-chains off the immediately
    // preceding round that actually has fixtures. If a round in between
    // has NO real fixture defined at all (a genuine data gap — the
    // tournament file only modelled England's actual historical path,
    // which didn't go that far), synthesize a single fixture for England's
    // own progression so the chain doesn't break.
    //
    // englandChainId tracks whichever fixture currently represents
    // England's OWN advancing path — real or synthetic — round by round.
    // It's the key piece that was missing before: without it, a round
    // whose literal historical fixture doesn't mention England at all
    // (because real history never got that far) had no way to represent
    // "one of these two slots is now England, having won a step no real
    // fixture data ever modelled" — the fixture just stayed frozen at its
    // static historical pairing forever, and a genuinely won knockout run
    // hit a dead end with no fixture to advance into.
    const firstIdx = rounds.indexOf(firstRound);
    let prevRound = firstRound;
    let englandChainId = firstRoundWithEngland
      ? (ks[firstRound].find(s => s.home === 'England' || s.away === 'England')?.fixtureId || null)
      : ks[firstRound][0].fixtureId;

    for (let i = firstIdx + 1; i < rounds.length; i++) {
      const round = rounds[i];
      let fixtures = byRound[round];

      if (!fixtures.length) {
        // No real fixture for this round at all — synthesize one so
        // England (if they keep winning) has somewhere to go, chaining
        // explicitly off England's own path rather than off array
        // position (which breaks the moment a real fixture from a
        // different, unrelated part of the bracket sits at the same
        // index).
        const synthId = `synth_${data.key}_${round}`;
        const synthFixture = {
          id: synthId, group: null, round, home: 'TBD', away: 'TBD',
          venue: '', date: '', neutral: true,
        };
        synthesizedFixtures.push(synthFixture);
        byRound[round] = [synthFixture];
        fixtures = byRound[round];
        ks[round] = [{ fixtureId: synthId, home: englandChainId ? `${englandChainId}_W` : 'filler', away: 'filler' }];
        englandChainId = synthId;
        prevRound = round;
        continue;
      }

      const prevFixtures = byRound[prevRound];
      ks[round] = fixtures.map((f, idx) => {
        // If this fixture's real data already names BOTH teams literally
        // (e.g. euro96's SF1 is hardcoded as England vs Germany — the
        // genuine historical pairing, which does NOT simply chain "QF1
        // winner vs QF2 winner" by array position, since real brackets
        // cross over in ways that don't follow naive sequential order),
        // find which PREVIOUS-ROUND FIXTURE each named team actually came
        // from and store a slot-chain reference to THAT fixture instead
        // of the literal name itself. This way the existing _resolveSlot()
        // machinery resolves it live from whatever's actually happened in
        // this specific playthrough every time the bracket is rebuilt —
        // if results have diverged from history (the "expected" team was
        // eliminated by someone else), the correct current opponent
        // naturally resolves instead, with no separate divergence check
        // needed and no risk of a stale, pre-divergence decision getting
        // cached and never revisited.
        if (isLiteralTeam(f.home) && isLiteralTeam(f.away)) {
          // If England's knockout run from firstRound onward is entirely
          // fictional (no real fixture at ANY round ever actually
          // involved them — euro88, where they didn't escape the group),
          // trace-back is actively the wrong tool here: it will happily
          // resolve both of this fixture's literal names, because
          // they're both real historical fixtures elsewhere in the same
          // round (e.g. the real Netherlands-West Germany and Soviet
          // Union-Italy semis) — just fixtures that have nothing to do
          // with England's own invented path. Left alone, that "success"
          // wires the final to the wrong, unrelated bracket branch and
          // England's own synthetic semi-final winner has no slot to
          // advance into at all. Force one slot to chain off England's
          // own path instead of trusting a trace-back that can only ever
          // find the wrong answer here.
          if (!firstRoundWithEngland && englandChainId) {
            return { fixtureId: f.id, home: `${englandChainId}_W`, away: f.away };
          }
          const findSourceFixtureId = (teamName) => {
            const src = prevFixtures.find(pf => pf.home === teamName || pf.away === teamName);
            return src ? src.id : null;
          };
          // Resolved independently rather than requiring BOTH to trace —
          // real tournament files routinely model only England's own
          // side of the bracket in full (italia90's SF is a real England
          // fixture, but the final's OTHER finalist, Argentina, never
          // played any modelled semi-final at all). One side successfully
          // tracing shouldn't be thrown away just because the other side
          // has no modelled source — the literal name stands in fine for
          // "the other side of the bracket" on its own.
          const homeSrc = findSourceFixtureId(f.home);
          const awaySrc = findSourceFixtureId(f.away);
          if (homeSrc || awaySrc) {
            return {
              fixtureId: f.id,
              home: homeSrc ? `${homeSrc}_W` : f.home,
              away: awaySrc ? `${awaySrc}_W` : f.away,
            };
          }
          // NEITHER literal name traces back to a previous-round fixture
          // at all (france98: the real final is hardcoded as France vs
          // Brazil, and England's entire knockout run from R16 onward is
          // synthetic — neither literal finalist has anything to do with
          // any fixture England's path passed through). Left alone, this
          // fixture would stay frozen at its static historical pairing
          // forever, and a genuinely won run has no fixture to advance
          // into. Redirect one side to chain off England's own path
          // instead — the specific literal name being displaced (here,
          // France) is unimportant flavour text for a hypothetical branch
          // that was never going to be historically accurate anyway once
          // England diverged from their real elimination point.
          if (englandChainId) {
            return { fixtureId: f.id, home: `${englandChainId}_W`, away: f.away };
          }
          return { fixtureId: f.id, home: f.home, away: f.away };
        }
        return {
          fixtureId: f.id,
          home: prevFixtures[idx * 2]     ? `${prevFixtures[idx * 2].id}_W`     : 'filler',
          away: prevFixtures[idx * 2 + 1] ? `${prevFixtures[idx * 2 + 1].id}_W` : 'filler',
        };
      });

      // Update England's chain pointer to whichever entry in THIS round
      // now actually represents their path forward — either a literal
      // 'England' slot (real historical data caught up again) or a slot
      // we just wired to chain off the previous englandChainId.
      const advancing = ks[round].find(s =>
        s.home === 'England' || s.away === 'England' ||
        s.home === `${englandChainId}_W` || s.away === `${englandChainId}_W`
      );
      if (advancing) englandChainId = advancing.fixtureId;

      prevRound = round;
    }

    if (synthesizedFixtures.length) {
      // Append once, idempotently — don't duplicate on repeated calls.
      const existingIds = new Set(data.allFixtures.map(f => f.id));
      synthesizedFixtures.forEach(f => {
        if (!existingIds.has(f.id)) data.allFixtures.push(f);
      });
    }

    return ks;
  },

  // ── Check if we're in a tournament right now ─────────────────────────────
  isActive() {
    const key = State.get('tournament.key');
    if (!key) return false;
    const phase = State.get('tournament.phase');
    return phase && phase !== 'complete' && phase !== 'eliminated';
  },

  // ── Check if today's date triggers a tournament ───────────────────────────
  checkTrigger(campaignDate) {
    if (this.isActive()) return null;
    const all = Object.entries(window.TOURNAMENTS || {});
    const era = State.get('meta.era') || 1986;

    // Tournaments that England didn't appear in — never trigger
    const noQualify = ['euro92']; // 1994 WC also but not built

    // Find the tournament whose dates overlap the current campaign date
    for (const [key, t] of all) {
      if (noQualify.includes(key)) continue;
      if (campaignDate >= t.startDate && campaignDate <= t.endDate) {
        // If tournament requires qualifying, check England actually earned their place
        if (t.qualifyingRequired) {
          // Check qualifier was completed (simplified: always true for now unless
          // we later track failed qualification)
          const failed = (State.get('campaign.qualificationFailed') || []).includes(key);
          if (failed) continue;
        }
        return key;
      }
    }
    return null;
  },

  // ── Determine England's result from current tournament state ──────────────
  getEnglandResult() {
    const tState = State.get('tournament') || {};
    const phase = tState.phase;

    // Eliminated — use the actual round recorded at the moment of defeat,
    // not the generic 'eliminated' phase string (which carries no round
    // information by itself).
    if (phase === 'eliminated') {
      return { reached: tState.eliminatedAt || 'group', winner: false };
    }
    // Won the whole tournament — recorded explicitly when the final is won.
    if (phase === 'complete' && tState.winner === 'England') {
      return { reached: 'final', winner: true };
    }
    // Tournament ended some other way (shouldn't normally happen, but
    // don't silently misreport a deep run as a group-stage exit).
    if (phase === 'complete') {
      return { reached: 'final', winner: false };
    }
    // Still in progress — report furthest stage reached so far.
    const order = this._roundOrder();
    const idx = order.indexOf(phase);
    const reached = idx >= 0 ? phase : 'group';
    return { reached, winner: false };
  },

  // Called by ResultUI after every tournament match. This used to be a
  // two-line stub (record result + simulate the round) while the REAL
  // progression logic — group qualification checks, knockout advancement,
  // elimination/victory detection, bracket building — lived in a
  // TournamentUI.handleMatchResult() that nothing ever actually called.
  // On top of that, ResultUI passes the CAMPAIGN fixture id (e.g.
  // 'f860603'), which doesn't exist in this tournament's own fixture list
  // (ids like 'm86_F1') — recordEnglandResult() silently no-opped on the
  // mismatch every single time. Combined, this meant tournament.results
  // never actually recorded England's own matches, phase never advanced
  // past 'group', and the tournament screen just showed "Awaiting next
  // fixture" forever once the group games ran out. `tournament.currentMatchId`
  // (set correctly by TournamentUI.playMatch() right before kickoff) is
  // the one reliable source of truth for which tournament fixture this
  // actually was — used here instead of trusting the passed-in id.
  handleMatchResult(fixtureId, engScore, oppScore) {
    const realId = State.get('tournament.currentMatchId') || fixtureId;
    // A drawn knockout match already has its shootout resolved by the
    // match engine before this ever runs — pull that result in now so
    // both the result record (for later rounds' bracket resolution) and
    // the advancement check below use it.
    const penaltyInfo = engScore === oppScore ? State.get('match.penalties') : null;
    this.recordEnglandResult(realId, engScore, oppScore, penaltyInfo);

    const data = this.data(); if (!data) return;
    const fix  = data.allFixtures.find(f => f.id === realId); if (!fix) return;
    const round = this._round(fix);
    this.simulateOtherResults(round);

    if (round === 'group') {
      const engGrp = data.groups.find(g => g.teams.some(t => t.name === 'England'));
      const grpFix = data.allFixtures.filter(f => {
        const { home, away } = this._effectiveTeams(f);
        return f.group === engGrp?.id && (home === 'England' || away === 'England');
      });
      const res = State.get('tournament.results') || {};
      if (grpFix.every(f => res[f.id] !== null && res[f.id] !== undefined)) {
        data.groups.forEach(() => this.simulateOtherResults('group'));
        const pos = this.englandGroupPosition();
        if (!pos?.qualified) {
          State.set('tournament.phase', 'eliminated');
          State.set('tournament.eliminatedAt', 'group');
        } else {
          // Determine the actual first knockout round from this
          // tournament's structure (r16 if it has one, otherwise qf,
          // etc.), synthesizing and caching one for tournaments whose
          // hardcoded-history data doesn't define knockoutStructure.
          const order = this._roundOrder();
          let ks = data.knockoutStructure;
          if (!ks) {
            ks = State.get('tournament.syntheticKS');
            if (!ks) {
              ks = this._buildSyntheticBracket(data);
              if (ks) State.set('tournament.syntheticKS', ks);
            }
          }
          const firstKO = order.slice(1).find(r => ks && ks[r]) || 'qf';
          State.set('tournament.phase', firstKO);
          this.buildKnockoutBracket();
        }
      }
    } else {
      // Knockout round — use resolved teams to determine who actually
      // won, since fix.home/away may still be unresolved slot strings.
      const res = State.get('tournament.results') || {};
      const r = res[realId]; if (!r) return;
      const { home, away } = this._effectiveTeams(fix);

      let won;
      if (r.home === r.away) {
        const pens = State.get('match.penalties');
        won = pens ? (home === 'England' ? pens.engWon : !pens.engWon) : Math.random() < 0.5;
        // Persist the actual decisive winner back onto the stored result
        // record — previously this decision only drove the IMMEDIATE
        // advance/eliminate check below, while _resolveSlot()'s winner-
        // chain (used by ANY later round to figure out who came out of
        // this tie) had its own completely separate tie-break that just
        // defaulted to the away team, with no knowledge of what was
        // actually decided here. The two could disagree — a chain
        // further down the bracket could conclude someone other than
        // the team that was actually recorded as advancing, leaving
        // England (if they were the actual winner) with no fixture to
        // advance into at all. Recording it here once, explicitly,
        // means every future read agrees with this decision.
        const winnerName = won ? 'England' : (home === 'England' ? away : home);
        const resultsNow = { ...State.get('tournament.results') };
        resultsNow[realId] = { ...resultsNow[realId], penalties: true, penWinner: winnerName };
        State.set('tournament.results', resultsNow);
      } else {
        won = home === 'England' ? r.home > r.away : r.away > r.home;
      }

      if (!won) {
        State.set('tournament.phase', 'eliminated');
        State.set('tournament.eliminatedAt', round);
      } else {
        const order = this._roundOrder();
        const idx   = order.indexOf(round);
        const next  = order[idx + 1] || 'complete';
        if (next === 'complete') {
          State.set('tournament.phase', 'complete');
          State.set('tournament.winner', 'England');
        } else {
          State.set('tournament.phase', next);
          this.buildKnockoutBracket();
        }
      }
    }
    // Safety net: England may have legitimately advanced (qualified from
    // the group, or won a knockout tie) into a round that this specific
    // tournament's hardcoded data simply never modelled a fixture for —
    // several different shapes of this have turned up (a single R16 slot
    // that only anticipates topping the group, a QF fixture that only
    // chains off ONE of two modelled R16 branches, etc.), and patching
    // each one individually in the data files is a losing battle against
    // however many more exist. Rather than leave the tournament screen
    // stuck on "Awaiting next fixture" forever, detect the gap directly —
    // active, not eliminated, but genuinely nothing to play — and
    // synthesize a fixture on the spot so the run can continue.
    if (this.isActive() && !this.nextEnglandFixture()) {
      this._rescueMissingFixture(State.get('tournament.phase'));
    }
    State.set('tournament.currentMatchId', null);
  },

  // Creates an ad-hoc fixture for England's current round when no real or
  // synthesized fixture in the data actually contains them, despite them
  // having genuinely qualified/advanced this far. See handleMatchResult's
  // safety-net check above for why this is needed.
  _rescueMissingFixture(round) {
    const data = this.data(); if (!data || !round) return;
    const synthId = `rescue_${data.key}_${round}`;
    if (data.allFixtures.some(f => f.id === synthId)) return; // already rescued this round once

    const synthFixture = { id: synthId, group: null, round, home: 'England', away: 'TBD', venue: '', date: '', neutral: true };
    data.allFixtures.push(synthFixture);

    const tables  = State.get('tournament.tables') || {};
    const results = State.get('tournament.results') || {};
    const resolved = { ...this._resolvedMap() };
    const filler = this._fillerOpponent(data, tables, results, resolved);
    resolved[synthId] = { home: 'England', away: filler };
    State.set('tournament.resolved', resolved);
  },
};
