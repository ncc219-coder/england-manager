/**
 * campaign_phase.js — Campaign phase state machine
 *
 * Manages the flow: qualifying → tournament → next qualifying cycle
 * 
 * Campaign phases:
 *   'qualifying'   — playing qualifier fixtures for next tournament
 *   'qualified'    — qualified, preparing for tournament
 *   'tournament'   — inside a tournament
 *   'failed_qual'  — failed to qualify, preparing for next cycle
 *   'between'      — between cycles (friendlies only)
 */

window.CampaignPhase = {

  // Map era start year → tournament key → qualifier key
  _cycles: [
    { tournKey:'euro88',        qualKey:'ECQ_EURO88_7',    startYear:1986, tournYear:1988 },
    { tournKey:'italia90',      qualKey:'WCQ_1990_2',      startYear:1988, tournYear:1990 },
    { tournKey:'euro92',        qualKey:'ECQ_EURO92_7',    startYear:1990, tournYear:1992 },
    { tournKey:'usa94',         qualKey:'WCQ_1994_2',      startYear:1992, tournYear:1994 },
    { tournKey:'euro96',        qualKey:'ECQ_EURO96_8',    startYear:1994, tournYear:1996 },
    { tournKey:'france98',      qualKey:'WCQ_1998_2',      startYear:1996, tournYear:1998 },
    { tournKey:'euro2000',      qualKey:'ECQ_EURO2000_5',  startYear:1998, tournYear:2000 },
    { tournKey:'korea02',       qualKey:'WCQ_2002_9',      startYear:2000, tournYear:2002 },
    { tournKey:'euro2004',      qualKey:'ECQ_EURO2004_7',  startYear:2002, tournYear:2004 },
    { tournKey:'euro2008',      qualKey:'ECQ_EURO2008_3',  startYear:2006, tournYear:2008 },
    { tournKey:'southafrica10', qualKey:'WCQ_2010_6',      startYear:2008, tournYear:2010 },
    { tournKey:'euro2012',      qualKey:'ECQ_EURO2012_G',  startYear:2010, tournYear:2012 },
    { tournKey:'brazil14',      qualKey:'WCQ_2014_H',      startYear:2012, tournYear:2014 },
    { tournKey:'euro2016',      qualKey:'ECQ_EURO2016_E',  startYear:2014, tournYear:2016 },
    { tournKey:'russia18',      qualKey:'WCQ_2018_F',      startYear:2016, tournYear:2018 },
    { tournKey:'euro2020',      qualKey:'ECQ_EURO2020_A',  startYear:2018, tournYear:2021 },
    { tournKey:'qatar22',       qualKey:'WCQ_2022_I',      startYear:2021, tournYear:2022 },
    { tournKey:'euro2024',      qualKey:'ECQ_EURO2024_C',  startYear:2022, tournYear:2024 },
  ],

  // Get the current cycle based on campaign date
  getCurrentCycle() {
    const yr = parseInt(State.get('campaign.campaignDate') || State.get('meta.era') || '1986');
    // Find the cycle whose qualifying period contains this year
    for (let i = this._cycles.length - 1; i >= 0; i--) {
      if (yr >= this._cycles[i].startYear) return this._cycles[i];
    }
    return this._cycles[0];
  },

  // Get the qualifier group for a given cycle
  getQualifierGroup(cycle) {
    return window.QUALIFIER_GROUPS && window.QUALIFIER_GROUPS[cycle.qualKey];
  },

  // Initialise qualifier state for a new cycle
  startQualifyingCycle(cycle) {
    const grp = this.getQualifierGroup(cycle);
    if (!grp) return false;

    // Reset qualifier table
    const table = {};
    grp.teams.forEach(t => {
      table[t.name] = { p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 };
    });

    State.set('campaign.qualifier', {
      key:        cycle.qualKey,
      tournKey:   cycle.tournKey,
      tournYear:  cycle.tournYear,
      qualified:  false,
      failed:     false,
      table:      table,
      completedFixtureIds: [],
    });
    State.set('campaign.phase', 'qualifying');
    return true;
  },

  // Simulate all non-England fixtures in the group up to the given date
  _simFixturesUpTo(qual, grp, upToDate) {
    const completed = new Set(qual.completedFixtureIds || []);
    grp.fixtures
      .filter(f => f.date <= upToDate && !completed.has(f.id) &&
                   f.home !== 'England' && f.away !== 'England')
      .forEach(f => {
        const result = (f.historicResult && Math.random() < 0.70)
          ? f.historicResult
          : this._simQualifierMatch(grp, f.home, f.away);
        if (!qual.results) qual.results = {};
      qual.results[f.id] = result;
      this._applyResult(qual.table, f.home, f.away, result.home, result.away);
      qual.completedFixtureIds.push(f.id);
      });
  },

  // Process a qualifier result — update table, sim other fixtures on same matchday
  processQualifierResult(fixtureId, engScore, oppScore) {
    const qual = State.get('campaign.qualifier');
    if (!qual) return;
    const grp = window.QUALIFIER_GROUPS[qual.key];
    if (!grp) return;

    // Find fixture by ID first, then fall back to date+teams matching
    const allFix = (window.ALL_FIXTURES || []).find(f => f.id === fixtureId);
    const thisFixture = allFix
      ? grp.fixtures.find(f =>
          f.date === allFix.date &&
          ((f.home === allFix.homeTeam && f.away === allFix.awayTeam) ||
           (f.home === allFix.awayTeam && f.away === allFix.homeTeam) ||
           (f.home === 'England' && allFix.homeTeam === 'England' && f.date === allFix.date) ||
           (f.away === 'England' && allFix.awayTeam === 'England' && f.date === allFix.date))
        )
      : grp.fixtures.find(f => f.id === fixtureId);
    if (!thisFixture) return;
    const matchday = thisFixture.date;
    const sameDayFixtures = grp.fixtures.filter(f => f.date === matchday && f.id !== fixtureId);

    // Simulate ALL non-England fixtures up to and including this matchday first
    this._simFixturesUpTo(qual, grp, matchday);

    // Apply England result
    if (!qual.results) qual.results = {};
    const engTeam = thisFixture.home === 'England' ? 'home' : 'away';
    const homeScore = engTeam === 'home' ? engScore : oppScore;
    const awayScore = engTeam === 'home' ? oppScore : engScore;
    qual.results[fixtureId] = { home: homeScore, away: awayScore };
    this._applyResult(qual.table, thisFixture.home, thisFixture.away, homeScore, awayScore);

    // Simulate other same-day fixtures
    sameDayFixtures.forEach(f => {
      if (qual.completedFixtureIds.includes(f.id)) return;
      const result = f.historicResult && Math.random() < (State.get('meta.settings.historicRealism') ?? 70) / 100
        ? f.historicResult
        : this._simQualifierMatch(grp, f.home, f.away);
      this._applyResult(qual.table, f.home, f.away, result.home, result.away);
      qual.completedFixtureIds.push(f.id);
    });

    qual.completedFixtureIds.push(fixtureId);

    // Check qualification status
    const sorted = this._sortTable(qual.table, grp.teams);
    const engPos = sorted.findIndex(r => r.name === 'England') + 1;
    const remaining = grp.fixtures.filter(f =>
      (f.home === 'England' || f.away === 'England') &&
      !qual.completedFixtureIds.includes(f.id)
    ).length;

    if (remaining === 0) {
      // Campaign over — check if qualified
      qual.qualified = engPos <= (grp.qualifies || 1);
      qual.failed    = !qual.qualified;
      State.set('campaign.phase', qual.qualified ? 'qualified' : 'failed_qual');

      // Update FA confidence based on result
      if (qual.qualified) {
        State.upd('campaign.boardConfidence', c => Math.min(100, (c||60) + 15));
      } else {
        State.upd('campaign.boardConfidence', c => Math.max(0, (c||60) - 25));
      }
    }

    State.set('campaign.qualifier', qual);
  },

  _applyResult(table, home, away, hg, ag) {
    if (!table[home] || !table[away]) return;
    table[home].p++; table[away].p++;
    table[home].gf += hg; table[home].ga += ag;
    table[away].gf += ag; table[away].ga += hg;
    if (hg > ag)       { table[home].w++; table[home].pts+=3; table[away].l++; }
    else if (hg < ag)  { table[away].w++; table[away].pts+=3; table[home].l++; }
    else               { table[home].d++; table[home].pts++; table[away].d++; table[away].pts++; }
  },

  _simQualifierMatch(grp, home, away) {
    const ht = grp.teams.find(t => t.name === home);
    const at = grp.teams.find(t => t.name === away);
    const hR = ht ? ht.rating : 72;
    const aR = at ? at.rating : 72;
    const diff = (hR - aR) / 20;
    const hExp = Math.max(0.3, 1.1 + diff * 0.3);
    const aExp = Math.max(0.3, 0.9 - diff * 0.3);
    const poisson = (l) => {
      let L=Math.exp(-l),k=0,p=1;
      do{k++;p*=Math.random();}while(p>L);
      return k-1;
    };
    return { home: poisson(hExp), away: poisson(aExp) };
  },

  _sortTable(table, teams) {
    return Object.entries(table)
      .map(([name, row]) => ({ name, ...row, gd: row.gf - row.ga }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  },

  getSortedTable() {
    const qual = State.get('campaign.qualifier');
    if (!qual) return [];
    const grp = window.QUALIFIER_GROUPS[qual.key];
    if (!grp) return [];
    return this._sortTable(qual.table, grp.teams);
  },

  // Render qualifier table HTML
  renderTable() {
    const rows = this.getSortedTable();
    if (!rows.length) return '<p>No qualifier data</p>';
    const qual = State.get('campaign.qualifier');
    const grp = window.QUALIFIER_GROUPS[qual?.key];
    const qualPlaces = grp?.qualifies || 1;

    return `<table class="qual-table">
      <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead>
      <tbody>
      ${rows.map((r, i) => `
        <tr class="${r.name==='England'?'eng-row':''} ${i<qualPlaces?'qual-zone':''}">
          <td>${r.name}</td>
          <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
          <td>${r.gd>0?'+'+r.gd:r.gd}</td>
          <td><strong>${r.pts}</strong></td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  },

  // Get next qualifier fixture for England
  getNextQualifierFixture() {
    const qual = State.get('campaign.qualifier');
    if (!qual) return null;
    const grp = window.QUALIFIER_GROUPS[qual.key];
    if (!grp) return null;
    const completed = new Set(qual.completedFixtureIds || []);
    return grp.fixtures.find(f =>
      (f.home === 'England' || f.away === 'England') && !completed.has(f.id)
    );
  },

  // Get next cycle after current tournament
  getNextCycle(tournKey) {
    const idx = this._cycles.findIndex(c => c.tournKey === tournKey);
    if (idx < 0 || idx >= this._cycles.length - 1) return null;
    return this._cycles[idx + 1];
  },

  // Start the next qualifying cycle after a tournament ends
  startNextCycle(completedTournKey) {
    // Special case: mexico86 starts the euro88 qualifying cycle
    if (completedTournKey === 'mexico86') {
      const euro88Cycle = this._cycles.find(c => c.tournKey === 'euro88');
      if (euro88Cycle) return this.startQualifyingCycle(euro88Cycle);
    }
    const next = this.getNextCycle(completedTournKey);
    if (!next) {
      State.set('campaign.phase', 'complete');
      // Trigger career summary
      if (window.DashboardUI && window.DashboardUI.showCareerSummary) {
        setTimeout(() => window.DashboardUI.showCareerSummary(), 500);
      }
      return false;
    }
    // Update campaign date to after the tournament
    const currentCycle = this._cycles.find(c => c.tournKey === completedTournKey);
    if (currentCycle) {
      // Set date to September of the tournament year (qualifying starts then)
      State.set('campaign.campaignDate', `${currentCycle.tournYear}-09-01`);
    }
    return this.startQualifyingCycle(next);
  },

  // Called when a tournament result screen shows "campaign complete" or "eliminated"
  onTournamentEnd(tournKey, result) {
    // result: { reached: 'final'|'sf'|'qf'|'r16'|'group', winner: bool }
    const history = State.get('campaign.tournamentHistory') || [];
    history.push({
      tournKey,
      year: this._cycles.find(c=>c.tournKey===tournKey)?.tournYear,
      ...result,
      boardConfidence: State.get('campaign.boardConfidence') || 60,
    });
    State.set('campaign.tournamentHistory', history);

    // Confidence boost/hit based on result
    const confBonus = result.winner ? 20
      : result.reached === 'final' ? 12
      : result.reached === 'sf'    ? 7
      : result.reached === 'qf'    ? 3
      : result.reached === 'r16'   ? 0
      : -10; // group stage exit
    State.upd('campaign.boardConfidence', c => Math.max(0, Math.min(100, (c||60) + confBonus)));

    // Start next qualifying cycle
    return this.startNextCycle(tournKey);
  },

  // Is England currently in a qualifying phase?
  isQualifying() {
    const phase = State.get('campaign.phase');
    return phase === 'qualifying';
  },

  // Should tournament be triggered now?
  shouldTriggerTournament() {
    const phase = State.get('campaign.phase');
    if (phase !== 'qualified') return null;
    const qual = State.get('campaign.qualifier');
    return qual?.tournKey || null;
  },

  // ── SACKING CHECK ──────────────────────────────────────────────────────────
  // Realistic reasons a national team manager loses their job — checked
  // after the events that would plausibly trigger board scrutiny, not on a
  // fixed timer. Returns a reason object if a sacking is warranted, or null
  // if the manager's job is safe. Never sacks mid-tournament — the board
  // doesn't change manager between a quarter-final and a semi-final; the
  // reckoning comes once the campaign concludes one way or another.
  checkSackingRisk() {
    const conf = State.get('campaign.boardConfidence') ?? 60;
    const phase = State.get('campaign.phase');

    // Never check while a tournament is actually in progress — only at
    // natural breakpoints (after qualifying fails, after a tournament ends,
    // after a run of results during qualifying).
    if (phase === 'tournament') return null;

    // 1. Failed to qualify outright — the clearest, most realistic firing
    //    offence in international football. Missing a major tournament
    //    entirely ends careers (Graham Taylor, 1994).
    if (phase === 'failed_qual') {
      return {
        reason: 'failed_qualification',
        headline: 'Failed to Qualify',
        detail: "England have failed to reach the tournament. The FA board see no way to justify your continued position after missing out on a major finals.",
      };
    }

    // 2. Sustained poor run — not one bad result, a genuine slump. Five
    //    results without a win, OR three straight defeats, mirrors the kind
    //    of run that ends international reigns (Sven, Capello-era pressure
    //    points). Checked on the most recent matches regardless of
    //    competition type.
    const history = State.get('campaign.matchHistory2') || [];
    const recent5 = history.slice(-5);
    const recent3 = history.slice(-3);
    const winlessRun = recent5.length === 5 && recent5.every(m => m.outcome !== 'win');
    const lossRun3   = recent3.length === 3 && recent3.every(m => m.outcome === 'loss');

    if ((winlessRun || lossRun3) && conf < 35) {
      return {
        reason: 'poor_run',
        headline: 'Results Have Collapsed',
        detail: lossRun3
          ? "Three defeats in a row, and patience has run out. The board no longer believe results will turn around under your management."
          : "Five games without a win has eroded what little faith remained. The board have seen enough.",
      };
    }

    // 3. Humiliating tournament exit while already under pressure — a
    //    group-stage exit on its own gets a confidence hit (handled in
    //    onTournamentEnd) but doesn't automatically end a reign; it's the
    //    combination of going out early AND already being on thin ice
    //    that realistically costs a manager their job (Roy Hodgson after
    //    Iceland 2016, when pressure was already building).
    const tHistory = State.get('campaign.tournamentHistory') || [];
    const lastTourn = tHistory[tHistory.length - 1];
    if (lastTourn && lastTourn.reached === 'group' && lastTourn.boardConfidence < 40) {
      return {
        reason: 'humiliating_exit',
        headline: 'A Tournament Too Far',
        detail: "A group-stage exit was bad enough on its own — coming after months of mounting doubt, it has proven fatal. The board have decided a change is needed.",
      };
    }

    // 4. Confidence bottomed out completely — the catch-all, but requires
    //    it to actually hit rock bottom rather than just dipping low, since
    //    0 should mean something specific.
    if (conf <= 0) {
      return {
        reason: 'confidence_zero',
        headline: 'No Confidence Remains',
        detail: "The relationship between you and the board has broken down completely. There is nothing left to salvage.",
      };
    }

    return null;
  },
};

// Initialise phase system on campaign start if not already set
(function() {
  // Hook into State to auto-init phase when era is set
  const origSet = State.set.bind(State);
  // Phase will be initialised by menu.js when starting a new campaign
})();
