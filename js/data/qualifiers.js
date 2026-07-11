/**
 * qualifiers.js — Qualifier group definitions and simulation
 *
 * Each qualifier group has: all fixtures (not just England's),
 * team ratings for simulation, and the qualification rule.
 *
 * After each England qualifier result, the other fixtures
 * in that matchday are simulated so the table is always live.
 */
window.QUALIFIER_GROUPS = window.QUALIFIER_GROUPS || {};

// ── Helper ────────────────────────────────────────────────────────────────
function _qf(id, date, home, away, groupKey, hist) {
  return { id, date, home, away, groupKey, historicResult: hist, played: false };
}

// ══════════════════════════════════════════════════════════════════════════
// EURO 88 QUALIFYING — Group 7
// ══════════════════════════════════════════════════════════════════════════
window.QUALIFIER_GROUPS['ECQ_EURO88_7'] = {
  key:   'ECQ_EURO88_7',
  comp:  'UEFA Euro 1988 Qualifier',
  group: 'Group 7',
  qualifies: 1,   // top team qualifies
  teams: [
    { name:'England',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rating:83 },
    { name:'Yugoslavia',  flag:'🇾🇺', rating:78 },
    { name:'N. Ireland',  flag:'🇬🇧', rating:72 },
    { name:'Turkey',      flag:'🇹🇷', rating:68 },
  ],
  fixtures: [
    _qf('q88_1','1986-09-10','Sweden',    'England',   'ECQ_EURO88_7',{home:1,away:0}),
    _qf('q88_2','1986-10-15','England',   'N. Ireland','ECQ_EURO88_7',{home:3,away:0}),
    _qf('q88_3','1986-11-12','Yugoslavia','England',   'ECQ_EURO88_7',{home:2,away:0}),
    _qf('q88_4','1987-04-01','N. Ireland','England',   'ECQ_EURO88_7',{home:0,away:2}),
    _qf('q88_5','1987-04-29','Turkey',    'England',   'ECQ_EURO88_7',{home:0,away:0}),
    _qf('q88_6','1987-10-14','England',   'Turkey',    'ECQ_EURO88_7',{home:8,away:0}),
    _qf('q88_7','1987-11-11','England',   'Yugoslavia','ECQ_EURO88_7',{home:4,away:1}),
    // Non-England fixtures
    _qf('q88_8','1986-09-10','N. Ireland','Turkey',    'ECQ_EURO88_7',{home:2,away:0}),
    _qf('q88_9','1986-10-15','Yugoslavia','Turkey',    'ECQ_EURO88_7',{home:3,away:0}),
    _qf('q88_10','1987-04-01','Turkey',   'Yugoslavia','ECQ_EURO88_7',{home:0,away:4}),
    _qf('q88_11','1987-11-11','N. Ireland','Yugoslavia','ECQ_EURO88_7',{home:0,away:1}),
    _qf('q88_12','1987-10-14','Turkey',   'N. Ireland','ECQ_EURO88_7',{home:0,away:0}),
  ],
};

// ══════════════════════════════════════════════════════════════════════════
// WCQ 1990 — Group 2
// ══════════════════════════════════════════════════════════════════════════
window.QUALIFIER_GROUPS['WCQ_1990_2'] = {
  key:   'WCQ_1990_2',
  comp:  '1990 World Cup Qualifier',
  group: 'Group 2',
  qualifies: 1,
  teams: [
    { name:'England', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rating:84 },
    { name:'Sweden',  flag:'🇸🇪', rating:77 },
    { name:'Poland',  flag:'🇵🇱', rating:74 },
    { name:'Albania', flag:'🇦🇱', rating:62 },
  ],
  fixtures: [
    _qf('wc90_1','1988-10-19','Sweden', 'England', 'WCQ_1990_2',{home:0,away:0}),
    _qf('wc90_2','1989-03-08','Albania','England', 'WCQ_1990_2',{home:0,away:2}),
    _qf('wc90_3','1989-04-26','England','Albania', 'WCQ_1990_2',{home:5,away:0}),
    _qf('wc90_4','1989-06-03','Poland', 'England', 'WCQ_1990_2',{home:0,away:3}),
    _qf('wc90_5','1989-09-06','Sweden', 'England', 'WCQ_1990_2',{home:0,away:0}),
    _qf('wc90_6','1989-10-11','England','Poland',  'WCQ_1990_2',{home:0,away:0}),
    // Non-England
    _qf('wc90_7','1988-10-19','Poland', 'Albania', 'WCQ_1990_2',{home:1,away:0}),
    _qf('wc90_8','1989-04-26','Sweden', 'Poland',  'WCQ_1990_2',{home:2,away:1}),
    _qf('wc90_9','1989-06-03','Albania','Sweden',  'WCQ_1990_2',{home:0,away:3}),
    _qf('wc90_10','1989-09-06','Poland','Albania', 'WCQ_1990_2',{home:3,away:0}),
    _qf('wc90_11','1989-10-11','Albania','Sweden', 'WCQ_1990_2',{home:0,away:3}),
    _qf('wc90_12','1988-09-14','Sweden','Poland',  'WCQ_1990_2',{home:2,away:1}),
  ],
};

// ══════════════════════════════════════════════════════════════════════════
// EURO 92 QUALIFYING — Group 7
// ══════════════════════════════════════════════════════════════════════════
window.QUALIFIER_GROUPS['ECQ_EURO92_7'] = {
  key:   'ECQ_EURO92_7',
  comp:  'UEFA Euro 1992 Qualifier',
  group: 'Group 7',
  qualifies: 1,
  teams: [
    { name:'England',            flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rating:82 },
    { name:'Republic of Ireland',flag:'🇮🇪', rating:78 },
    { name:'Turkey',             flag:'🇹🇷', rating:67 },
    { name:'Poland',             flag:'🇵🇱', rating:73 },
  ],
  fixtures: [
    _qf('ec92_1','1990-10-17','England',            'Poland',             'ECQ_EURO92_7',{home:2,away:0}),
    _qf('ec92_2','1990-11-14','England',            'Republic of Ireland','ECQ_EURO92_7',{home:1,away:1}),
    _qf('ec92_3','1991-05-01','England',            'Turkey',             'ECQ_EURO92_7',{home:1,away:0}),
    _qf('ec92_4','1991-10-16','Turkey',             'England',            'ECQ_EURO92_7',{home:0,away:1}),
    _qf('ec92_5','1991-11-13','Poland',             'England',            'ECQ_EURO92_7',{home:1,away:1}),
    _qf('ec92_6','1991-03-27','Republic of Ireland','England',            'ECQ_EURO92_7',{home:1,away:1}),
    // Non-England
    _qf('ec92_7','1990-10-17','Republic of Ireland','Turkey',             'ECQ_EURO92_7',{home:5,away:0}),
    _qf('ec92_8','1991-05-01','Republic of Ireland','Poland',             'ECQ_EURO92_7',{home:0,away:0}),
    _qf('ec92_9','1991-10-16','Republic of Ireland','Poland',             'ECQ_EURO92_7',{home:3,away:1}),
    _qf('ec92_10','1991-11-13','Turkey',            'Poland',             'ECQ_EURO92_7',{home:0,away:1}),
    _qf('ec92_11','1990-11-14','Turkey',            'Poland',             'ECQ_EURO92_7',{home:1,away:0}),
    _qf('ec92_12','1991-03-27','Turkey',            'Republic of Ireland','ECQ_EURO92_7',{home:0,away:3}),
  ],
};

// ══════════════════════════════════════════════════════════════════════════
// WCQ 1994 — Group 2
// ══════════════════════════════════════════════════════════════════════════
window.QUALIFIER_GROUPS['WCQ_1994_2'] = {
  key:   'WCQ_1994_2',
  comp:  '1994 World Cup Qualifier',
  group: 'Group 2',
  qualifies: 1,
  teams: [
    { name:'Netherlands', flag:'🇳🇱', rating:85 },
    { name:'England',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rating:80 },
    { name:'Norway',      flag:'🇳🇴', rating:76 },
    { name:'Poland',      flag:'🇵🇱', rating:73 },
    { name:'Turkey',      flag:'🇹🇷', rating:68 },
    { name:'San Marino',  flag:'🇸🇲', rating:40 },
  ],
  fixtures: [
    _qf('wc94_1','1992-09-09','Spain',       'England',     'WCQ_1994_2',{home:0,away:1}),
    _qf('wc94_2','1992-10-14','England',      'Norway',      'WCQ_1994_2',{home:1,away:1}),
    _qf('wc94_3','1992-11-18','England',      'Turkey',      'WCQ_1994_2',{home:4,away:0}),
    _qf('wc94_4','1993-02-17','England',      'San Marino',  'WCQ_1994_2',{home:6,away:0}),
    _qf('wc94_5','1993-03-31','Turkey',       'England',     'WCQ_1994_2',{home:0,away:2}),
    _qf('wc94_6','1993-05-29','Poland',       'England',     'WCQ_1994_2',{home:1,away:1}),
    _qf('wc94_7','1993-09-08','England',      'Poland',      'WCQ_1994_2',{home:3,away:0}),
    _qf('wc94_8','1993-10-13','Netherlands',  'England',     'WCQ_1994_2',{home:2,away:0}),
    _qf('wc94_9','1993-11-17','San Marino',   'England',     'WCQ_1994_2',{home:1,away:7}),
    // Non-England key
    _qf('wc94_10','1992-09-09','Norway',      'Netherlands', 'WCQ_1994_2',{home:2,away:1}),
    _qf('wc94_11','1993-10-13','Poland',      'Norway',      'WCQ_1994_2',{home:1,away:3}),
    _qf('wc94_12','1993-10-13','Turkey',      'San Marino',  'WCQ_1994_2',{home:4,away:0}),
  ],
};

// ══════════════════════════════════════════════════════════════════════════
// EURO 96 QUALIFYING — Group 8
// ══════════════════════════════════════════════════════════════════════════
window.QUALIFIER_GROUPS['ECQ_EURO96_8'] = {
  key:   'ECQ_EURO96_8',
  comp:  'UEFA Euro 1996 Qualifier',
  group: 'Group 8',
  qualifies: 1,
  teams: [
    { name:'England', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rating:83 },
    { name:'Norway',  flag:'🇳🇴', rating:77 },
    { name:'Ukraine', flag:'🇺🇦', rating:74 },
    { name:'Romania', flag:'🇷🇴', rating:79 },
  ],
  fixtures: [
    _qf('ec96_1','1994-12-07','England', 'Ukraine', 'ECQ_EURO96_8',{home:1,away:0}),
    _qf('ec96_2','1995-10-11','Norway',  'England', 'ECQ_EURO96_8',{home:0,away:0}),
    _qf('ec96_3','1995-09-06','Colombia','England', 'ECQ_EURO96_8',{home:0,away:0}),
    _qf('ec96_4','1995-06-03','England', 'Sweden',  'ECQ_EURO96_8',{home:3,away:3}),
    // Non-England
    _qf('ec96_5','1994-12-07','Norway',  'Romania', 'ECQ_EURO96_8',{home:1,away:1}),
    _qf('ec96_6','1995-06-03','Ukraine', 'Norway',  'ECQ_EURO96_8',{home:0,away:1}),
    _qf('ec96_7','1995-10-11','Romania', 'Ukraine', 'ECQ_EURO96_8',{home:2,away:1}),
    _qf('ec96_8','1995-11-15','Ukraine', 'Romania', 'ECQ_EURO96_8',{home:1,away:0}),
  ],
};

// ══════════════════════════════════════════════════════════════════════════
// WCQ 1998 — Group 2
// ══════════════════════════════════════════════════════════════════════════
window.QUALIFIER_GROUPS['WCQ_1998_2'] = {
  key:   'WCQ_1998_2',
  comp:  '1998 World Cup Qualifier',
  group: 'Group 2',
  qualifies: 1,
  teams: [
    { name:'England', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rating:85 },
    { name:'Italy',   flag:'🇮🇹', rating:88 },
    { name:'Poland',  flag:'🇵🇱', rating:73 },
    { name:'Georgia', flag:'🇬🇪', rating:70 },
    { name:'Moldova', flag:'🇲🇩', rating:62 },
  ],
  fixtures: [
    _qf('wc98_1','1996-10-01','Moldova', 'England', 'WCQ_1998_2',{home:0,away:3}),
    _qf('wc98_2','1996-11-09','England', 'Georgia', 'WCQ_1998_2',{home:2,away:0}),
    _qf('wc98_3','1997-02-12','England', 'Italy',   'WCQ_1998_2',{home:0,away:1}),
    _qf('wc98_4','1997-04-30','Georgia', 'England', 'WCQ_1998_2',{home:0,away:2}),
    _qf('wc98_5','1997-06-01','England', 'Poland',  'WCQ_1998_2',{home:2,away:0}),
    _qf('wc98_6','1997-09-10','Moldova', 'England', 'WCQ_1998_2',{home:0,away:4}),
    _qf('wc98_7','1997-10-11','Italy',   'England', 'WCQ_1998_2',{home:0,away:0}),
    // Non-England
    _qf('wc98_8','1996-10-01','Italy',   'Georgia', 'WCQ_1998_2',{home:1,away:0}),
    _qf('wc98_9','1997-02-12','Poland',  'Georgia', 'WCQ_1998_2',{home:2,away:1}),
    _qf('wc98_10','1997-06-01','Italy',  'Poland',  'WCQ_1998_2',{home:3,away:0}),
    _qf('wc98_11','1997-09-10','Italy',  'Moldova', 'WCQ_1998_2',{home:3,away:0}),
    _qf('wc98_12','1997-10-11','Georgia','Moldova', 'WCQ_1998_2',{home:2,away:0}),
  ],
};

// ══════════════════════════════════════════════════════════════════════════
// GROUP TABLE ENGINE
// ══════════════════════════════════════════════════════════════════════════
window.QualifierEngine = {

  // Get the active qualifier group for a fixture
  getGroupForFixture(fixId) {
    for (const [key, grp] of Object.entries(window.QUALIFIER_GROUPS)) {
      if (grp.fixtures.some(f => f.id === fixId || this._matchesMainFixture(f, fixId))) {
        return grp;
      }
    }
    return null;
  },

  _matchesMainFixture(qf, mainFixId) {
    // Link qualifier fixtures to main fixture list by home/away and approximate date
    const mainFix = window.ALL_FIXTURES?.find(f => f.id === mainFixId);
    if (!mainFix) return false;
    return qf.home === (mainFix.homeTeam || mainFix.home) &&
           qf.away === (mainFix.awayTeam || mainFix.away) &&
           qf.date === mainFix.date;
  },

  // Initialise a blank table for a group
  initTable(groupKey) {
    const grp = window.QUALIFIER_GROUPS[groupKey];
    if (!grp) return {};
    const table = {};
    grp.teams.forEach(t => {
      table[t.name] = { p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 };
    });
    return table;
  },

  // Apply a result to the table
  applyResult(table, home, away, homeGoals, awayGoals) {
    if (!table[home]) table[home] = { p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 };
    if (!table[away]) table[away] = { p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 };
    table[home].p++; table[away].p++;
    table[home].gf += homeGoals; table[home].ga += awayGoals;
    table[away].gf += awayGoals; table[away].ga += homeGoals;
    if (homeGoals > awayGoals) { table[home].w++; table[home].pts+=3; table[away].l++; }
    else if (homeGoals < awayGoals) { table[away].w++; table[away].pts+=3; table[home].l++; }
    else { table[home].d++; table[home].pts++; table[away].d++; table[away].pts++; }
    return table;
  },

  // Sort table: pts, gd, gf
  sortTable(table) {
    return Object.entries(table).sort(([,a],[,b]) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      const gdA = a.gf-a.ga, gdB = b.gf-b.ga;
      if (gdB !== gdA) return gdB - gdA;
      return b.gf - a.gf;
    });
  },

  // Simulate non-England fixtures using historical results (weighted) or ratings
  simulateNonEngland(groupKey, upToDate) {
    const grp = window.QUALIFIER_GROUPS[groupKey];
    if (!grp) return;
    const qualState = State.get('campaign.qualifierState') || {};
    if (!qualState[groupKey]) qualState[groupKey] = { results:{}, table: this.initTable(groupKey) };
    const qs = qualState[groupKey];

    grp.fixtures
      .filter(f => f.home !== 'England' && f.away !== 'England')
      .filter(f => !qs.results[f.id])
      .filter(f => !upToDate || f.date <= upToDate)
      .forEach(f => {
        // Use historical result 75% of time, simulate 25%
        let result;
        const realism = (State.get('meta.settings.historicRealism') ?? 70) / 100;
        if (f.historicResult && Math.random() < realism) {
          result = { home: f.historicResult.home, away: f.historicResult.away };
        } else {
          const homeTeam = grp.teams.find(t => t.name === f.home) || { rating:72 };
          const awayTeam = grp.teams.find(t => t.name === f.away) || { rating:72 };
          result = this._simulateMatch(homeTeam.rating, awayTeam.rating);
        }
        qs.results[f.id] = result;
        this.applyResult(qs.table, f.home, f.away, result.home, result.away);
      });

    State.set('campaign.qualifierState', qualState);
  },

  // Record England's qualifier result
  recordEnglandResult(groupKey, home, away, engGoals, oppGoals) {
    const qualState = State.get('campaign.qualifierState') || {};
    if (!qualState[groupKey]) qualState[groupKey] = { results:{}, table: this.initTable(groupKey) };
    const qs = qualState[groupKey];
    const homeGoals = home === 'England' ? engGoals : oppGoals;
    const awayGoals = home === 'England' ? oppGoals : engGoals;
    const fixId = `q_${home}_${away}_${Date.now()}`;
    qs.results[fixId] = { home: homeGoals, away: awayGoals };
    this.applyResult(qs.table, home, away, homeGoals, awayGoals);
    State.set('campaign.qualifierState', qualState);
    // Simulate other group fixtures that should have happened by now
    const fix = window.ALL_FIXTURES?.find(f =>
      (f.homeTeam===home||f.homeTeam===away) && (f.awayTeam===home||f.awayTeam===away)
    );
    if (fix) this.simulateNonEngland(groupKey, fix.date);
  },

  // Get live table for a group
  getTable(groupKey) {
    const qs = (State.get('campaign.qualifierState') || {})[groupKey];
    if (!qs) {
      // Not started yet — return blank table
      return this.sortTable(this.initTable(groupKey));
    }
    return this.sortTable(qs.table);
  },

  // England's current position in the group
  englandPosition(groupKey) {
    const table = this.getTable(groupKey);
    const pos = table.findIndex(([name]) => name === 'England');
    const grp = window.QUALIFIER_GROUPS[groupKey];
    return {
      position: pos + 1,
      qualifying: pos < (grp?.qualifies || 1),
      points: table[pos]?.[1]?.pts || 0,
      played:  table[pos]?.[1]?.p  || 0,
    };
  },

  // Which qualifier group does the current fixture belong to?
  getCurrentGroup() {
    const fix = window.ALL_FIXTURES[State.get('campaign.fixtureIdx') || 0];
    if (!fix) return null;
    for (const [key, grp] of Object.entries(window.QUALIFIER_GROUPS)) {
      const isEnglandFix = grp.fixtures.some(f =>
        (f.home === 'England' || f.away === 'England') &&
        f.date === fix.date &&
        (f.home === (fix.homeTeam||fix.home) || f.away === (fix.awayTeam||fix.away))
      );
      if (isEnglandFix) return key;
    }
    // Also check by compShort from the fixture
    if (fix.compShort === 'ECQ') {
      const era = State.get('meta.era') || 1986;
      if (era <= 1987) return 'ECQ_EURO88_7';
      if (era <= 1991) return 'ECQ_EURO92_7';
      if (era <= 1995) return 'ECQ_EURO96_8';
    }
    if (fix.compShort === 'WCQ') {
      const era = State.get('meta.era') || 1986;
      if (era <= 1989) return 'WCQ_1990_2';
      if (era <= 1993) return 'WCQ_1994_2';
      if (era <= 1997) return 'WCQ_1998_2';
    }
    return null;
  },

  _simulateMatch(homeRat, awayRat) {
    const diff  = (homeRat - awayRat) / 10;
    const hExp  = Math.max(0.3, 1.1 + diff * 0.18 + 0.2);
    const aExp  = Math.max(0.3, 1.0 - diff * 0.18);
    return { home: this._poisson(hExp), away: this._poisson(aExp) };
  },
  _poisson(lambda) {
    let L=Math.exp(-lambda), k=0, p=1;
    do { k++; p*=Math.random(); } while(p>L);
    return k-1;
  },
};

// ══════════════════════════════════════════════════════════════════════════
// WCQ 1998 — Group 2 (already existed, adding missing ones below)
// ECQ EURO 2000 — Group 5
// ══════════════════════════════════════════════════════════════════════════
window.QUALIFIER_GROUPS['ECQ_EURO2000_5'] = {
  key:'ECQ_EURO2000_5', comp:'UEFA Euro 2000 Qualifier', group:'Group 5', qualifies:1,
  playoffSpot:1,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:82},
    {name:'Poland',flag:'🇵🇱',rating:74},
    {name:'Sweden',flag:'🇸🇪',rating:77},
    {name:'Bulgaria',flag:'🇧🇬',rating:73},
    {name:'Luxembourg',flag:'🇱🇺',rating:48},
  ],
  fixtures:[
    _qf('q00_1','1998-09-05','Sweden','England','ECQ_EURO2000_5',{home:2,away:1}),
    _qf('q00_2','1998-10-10','England','Bulgaria','ECQ_EURO2000_5',{home:0,away:0}),
    _qf('q00_3','1998-10-14','Luxembourg','England','ECQ_EURO2000_5',{home:0,away:3}),
    _qf('q00_4','1999-03-27','England','Poland','ECQ_EURO2000_5',{home:3,away:1}),
    _qf('q00_5','1999-06-05','England','Sweden','ECQ_EURO2000_5',{home:0,away:0}),
    _qf('q00_6','1999-09-04','Bulgaria','England','ECQ_EURO2000_5',{home:1,away:1}),
    _qf('q00_7','1999-10-09','England','Luxembourg','ECQ_EURO2000_5',{home:6,away:0}),
    _qf('q00_8','1999-10-13','Poland','England','ECQ_EURO2000_5',{home:0,away:0}),
    _qf('q00_9','1998-09-05','Poland','Bulgaria','ECQ_EURO2000_5',{home:3,away:0}),
    _qf('q00_10','1998-10-10','Luxembourg','Sweden','ECQ_EURO2000_5',{home:0,away:2}),
    _qf('q00_11','1999-03-27','Sweden','Bulgaria','ECQ_EURO2000_5',{home:1,away:1}),
    _qf('q00_12','1999-06-05','Bulgaria','Poland','ECQ_EURO2000_5',{home:1,away:0}),
    _qf('q00_13','1999-09-08','Poland','Luxembourg','ECQ_EURO2000_5',{home:6,away:0}),
    _qf('q00_14','1999-10-09','Sweden','Poland','ECQ_EURO2000_5',{home:2,away:0}),
    _qf('q00_15','1999-10-13','Bulgaria','Luxembourg','ECQ_EURO2000_5',{home:2,away:0}),
  ],
};

// WCQ 2002 — Group 9
window.QUALIFIER_GROUPS['WCQ_2002_9'] = {
  key:'WCQ_2002_9', comp:'2002 World Cup Qualifier', group:'Group 9', qualifies:1, playoffSpot:1,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:83},
    {name:'Germany',flag:'🇩🇪',rating:85},
    {name:'Finland',flag:'🇫🇮',rating:70},
    {name:'Greece',flag:'🇬🇷',rating:72},
    {name:'Albania',flag:'🇦🇱',rating:56},
  ],
  fixtures:[
    _qf('q02_1','2000-10-07','England','Germany','WCQ_2002_9',{home:0,away:1}),
    _qf('q02_2','2000-10-11','Finland','England','WCQ_2002_9',{home:0,away:0}),
    _qf('q02_3','2001-03-24','Albania','England','WCQ_2002_9',{home:1,away:3}),
    _qf('q02_4','2001-03-28','England','Finland','WCQ_2002_9',{home:2,away:1}),
    _qf('q02_5','2001-06-06','Greece','England','WCQ_2002_9',{home:0,away:2}),
    _qf('q02_6','2001-09-01','Germany','England','WCQ_2002_9',{home:1,away:5}),
    _qf('q02_7','2001-10-06','England','Greece','WCQ_2002_9',{home:2,away:2}),
    _qf('q02_8','2001-10-10','England','Albania','WCQ_2002_9',{home:2,away:0}),
    _qf('q02_9','2000-10-07','Greece','Finland','WCQ_2002_9',{home:1,away:0}),
    _qf('q02_10','2000-10-11','Germany','Albania','WCQ_2002_9',{home:2,away:0}),
    _qf('q02_11','2001-03-24','Finland','Greece','WCQ_2002_9',{home:2,away:1}),
    _qf('q02_12','2001-06-06','Germany','Finland','WCQ_2002_9',{home:0,away:2}),
    _qf('q02_13','2001-09-01','Albania','Greece','WCQ_2002_9',{home:0,away:2}),
    _qf('q02_14','2001-10-06','Finland','Germany','WCQ_2002_9',{home:0,away:0}),
    _qf('q02_15','2001-10-10','Greece','Albania','WCQ_2002_9',{home:2,away:0}),
  ],
};

// ECQ EURO 2004 — Group 7
window.QUALIFIER_GROUPS['ECQ_EURO2004_7'] = {
  key:'ECQ_EURO2004_7', comp:'UEFA Euro 2004 Qualifier', group:'Group 7', qualifies:1, playoffSpot:1,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:84},
    {name:'Turkey',flag:'🇹🇷',rating:78},
    {name:'Slovakia',flag:'🇸🇰',rating:70},
    {name:'Macedonia',flag:'🇲🇰',rating:62},
    {name:'Liechtenstein',flag:'🇱🇮',rating:40},
  ],
  fixtures:[
    _qf('q04_1','2002-10-12','England','Slovakia','ECQ_EURO2004_7',{home:2,away:2}),
    _qf('q04_2','2002-10-16','Macedonia','England','ECQ_EURO2004_7',{home:2,away:2}),
    _qf('q04_3','2003-02-12','Australia','England','ECQ_EURO2004_7',null),
    _qf('q04_4','2003-04-02','England','Turkey','ECQ_EURO2004_7',{home:2,away:0}),
    _qf('q04_5','2003-06-11','Slovakia','England','ECQ_EURO2004_7',{home:1,away:2}),
    _qf('q04_6','2003-09-06','Macedonia','England','ECQ_EURO2004_7',{home:1,away:2}),
    _qf('q04_7','2003-10-11','England','Liechtenstein','ECQ_EURO2004_7',{home:2,away:0}),
    _qf('q04_8','2003-11-15','Turkey','England','ECQ_EURO2004_7',{home:0,away:0}),
    _qf('q04_9','2002-10-12','Turkey','Liechtenstein','ECQ_EURO2004_7',{home:5,away:0}),
    _qf('q04_10','2002-10-16','Slovakia','Liechtenstein','ECQ_EURO2004_7',{home:4,away:0}),
    _qf('q04_11','2003-04-02','Slovakia','Macedonia','ECQ_EURO2004_7',{home:2,away:0}),
    _qf('q04_12','2003-10-11','Turkey','Slovakia','ECQ_EURO2004_7',{home:1,away:0}),
  ],
};

// WCQ 2006 — Group 6
window.QUALIFIER_GROUPS['WCQ_2006_6'] = {
  key:'WCQ_2006_6', comp:'2006 World Cup Qualifier', group:'Group 6', qualifies:1, playoffSpot:1,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:84},
    {name:'Poland',flag:'🇵🇱',rating:76},
    {name:'Austria',flag:'🇦🇹',rating:72},
    {name:'Wales',flag:'🏴󠁧󠁢󠁷󠁬󠁳󠁿',rating:69},
    {name:'Northern Ireland',flag:'🇬🇧',rating:66},
    {name:'Azerbaijan',flag:'🇦🇿',rating:48},
  ],
  fixtures:[
    _qf('q06_1','2004-09-04','Austria','England','WCQ_2006_6',{home:2,away:2}),
    _qf('q06_2','2004-09-08','England','Poland','WCQ_2006_6',{home:2,away:1}),
    _qf('q06_3','2004-10-13','Wales','England','WCQ_2006_6',{home:0,away:2}),
    _qf('q06_4','2004-10-17','Azerbaijan','England','WCQ_2006_6',{home:0,away:1}),
    _qf('q06_5','2005-03-26','England','Northern Ireland','WCQ_2006_6',{home:4,away:0}),
    _qf('q06_6','2005-03-30','England','Azerbaijan','WCQ_2006_6',{home:2,away:0}),
    _qf('q06_7','2005-09-03','England','Wales','WCQ_2006_6',{home:1,away:0}),
    _qf('q06_8','2005-10-08','England','Austria','WCQ_2006_6',{home:1,away:0}),
    _qf('q06_9','2005-10-12','Poland','England','WCQ_2006_6',{home:1,away:2}),
    _qf('q06_10','2004-09-04','Poland','Wales','WCQ_2006_6',{home:3,away:2}),
    _qf('q06_11','2004-10-13','Northern Ireland','Austria','WCQ_2006_6',{home:3,away:3}),
    _qf('q06_12','2005-10-12','Austria','Wales','WCQ_2006_6',{home:1,away:0}),
  ],
};

// ECQ EURO 2008 — Group 3
window.QUALIFIER_GROUPS['ECQ_EURO2008_3'] = {
  key:'ECQ_EURO2008_3', comp:'UEFA Euro 2008 Qualifier', group:'Group 3', qualifies:1, playoffSpot:1,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:82},
    {name:'Russia',flag:'🇷🇺',rating:78},
    {name:'Croatia',flag:'🇭🇷',rating:80},
    {name:'Israel',flag:'🇮🇱',rating:68},
    {name:'Estonia',flag:'🇪🇪',rating:58},
    {name:'Andorra',flag:'🇦🇩',rating:38},
    {name:'Macedonia',flag:'🇲🇰',rating:60},
  ],
  fixtures:[
    _qf('q08_1','2006-10-07','England','Macedonia','ECQ_EURO2008_3',{home:0,away:0}),
    _qf('q08_2','2006-10-11','Croatia','England','ECQ_EURO2008_3',{home:2,away:0}),
    _qf('q08_3','2007-03-24','England','Andorra','ECQ_EURO2008_3',{home:3,away:0}),
    _qf('q08_4','2007-03-28','England','Israel','ECQ_EURO2008_3',{home:0,away:0}),
    _qf('q08_5','2007-06-06','Estonia','England','ECQ_EURO2008_3',{home:0,away:3}),
    _qf('q08_6','2007-09-08','England','Russia','ECQ_EURO2008_3',{home:3,away:0}),
    _qf('q08_7','2007-10-13','England','Estonia','ECQ_EURO2008_3',{home:3,away:0}),
    _qf('q08_8','2007-11-21','Croatia','England','ECQ_EURO2008_3',{home:3,away:2}),
    _qf('q08_9','2006-10-07','Russia','Croatia','ECQ_EURO2008_3',{home:0,away:0}),
    _qf('q08_10','2007-06-06','Russia','Andorra','ECQ_EURO2008_3',{home:4,away:0}),
    _qf('q08_11','2007-09-08','Israel','Russia','ECQ_EURO2008_3',{home:2,away:1}),
    _qf('q08_12','2007-10-13','Russia','Israel','ECQ_EURO2008_3',{home:2,away:1}),
    _qf('q08_13','2007-11-17','Russia','England','ECQ_EURO2008_3',{home:2,away:1}),
  ],
};

// WCQ 2010 — Group 6
window.QUALIFIER_GROUPS['WCQ_2010_6'] = {
  key:'WCQ_2010_6', comp:'2010 World Cup Qualifier', group:'Group 6', qualifies:1, playoffSpot:1,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:83},
    {name:'Ukraine',flag:'🇺🇦',rating:76},
    {name:'Croatia',flag:'🇭🇷',rating:79},
    {name:'Belarus',flag:'🇧🇾',rating:64},
    {name:'Kazakhstan',flag:'🇰🇿',rating:52},
    {name:'Andorra',flag:'🇦🇩',rating:38},
  ],
  fixtures:[
    _qf('q10_1','2008-09-06','England','Andorra','WCQ_2010_6',{home:2,away:0}),
    _qf('q10_2','2008-09-10','Croatia','England','WCQ_2010_6',{home:1,away:4}),
    _qf('q10_3','2008-10-11','England','Kazakhstan','WCQ_2010_6',{home:5,away:1}),
    _qf('q10_4','2008-10-15','Belarus','England','WCQ_2010_6',{home:1,away:3}),
    _qf('q10_5','2009-04-01','England','Ukraine','WCQ_2010_6',{home:2,away:1}),
    _qf('q10_6','2009-06-10','Kazakhstan','England','WCQ_2010_6',{home:0,away:4}),
    _qf('q10_7','2009-09-05','England','Croatia','WCQ_2010_6',{home:5,away:1}),
    _qf('q10_8','2009-09-09','Andorra','England','WCQ_2010_6',{home:0,away:3}),
    _qf('q10_9','2009-10-10','Ukraine','England','WCQ_2010_6',{home:1,away:0}),
    _qf('q10_10','2009-10-14','England','Belarus','WCQ_2010_6',{home:3,away:0}),
    _qf('q10_11','2008-09-06','Ukraine','Belarus','WCQ_2010_6',{home:1,away:0}),
    _qf('q10_12','2008-10-11','Croatia','Ukraine','WCQ_2010_6',{home:0,away:0}),
    _qf('q10_13','2009-04-01','Kazakhstan','Belarus','WCQ_2010_6',{home:2,away:0}),
    _qf('q10_14','2009-09-09','Ukraine','Croatia','WCQ_2010_6',{home:0,away:0}),
  ],
};

// ECQ EURO 2012 — Group G
window.QUALIFIER_GROUPS['ECQ_EURO2012_G'] = {
  key:'ECQ_EURO2012_G', comp:'UEFA Euro 2012 Qualifier', group:'Group G', qualifies:1, playoffSpot:1,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:82},
    {name:'Montenegro',flag:'🇲🇪',rating:68},
    {name:'Switzerland',flag:'🇨🇭',rating:76},
    {name:'Wales',flag:'🏴󠁧󠁢󠁷󠁬󠁳󠁿',rating:70},
    {name:'Bulgaria',flag:'🇧🇬',rating:66},
  ],
  fixtures:[
    _qf('q12_1','2010-09-03','Bulgaria','England','ECQ_EURO2012_G',{home:0,away:4}),
    _qf('q12_2','2010-09-07','England','Switzerland','ECQ_EURO2012_G',{home:3,away:1}),
    _qf('q12_3','2010-10-08','Montenegro','England','ECQ_EURO2012_G',{home:0,away:0}),
    _qf('q12_4','2010-10-12','England','Bulgaria','ECQ_EURO2012_G',{home:0,away:0}),
    _qf('q12_5','2011-03-26','England','Wales','ECQ_EURO2012_G',{home:2,away:0}),
    _qf('q12_6','2011-06-04','Switzerland','England','ECQ_EURO2012_G',{home:2,away:2}),
    _qf('q12_7','2011-09-02','Wales','England','ECQ_EURO2012_G',{home:0,away:1}),
    _qf('q12_8','2011-10-07','England','Montenegro','ECQ_EURO2012_G',{home:2,away:2}),
    _qf('q12_9','2010-09-03','Montenegro','Wales','ECQ_EURO2012_G',{home:1,away:0}),
    _qf('q12_10','2011-03-26','Switzerland','Bulgaria','ECQ_EURO2012_G',{home:3,away:1}),
    _qf('q12_11','2011-09-06','Montenegro','Bulgaria','ECQ_EURO2012_G',{home:2,away:1}),
    _qf('q12_12','2011-10-11','Bulgaria','Switzerland','ECQ_EURO2012_G',{home:0,away:1}),
  ],
};

// WCQ 2014 — Group H
window.QUALIFIER_GROUPS['WCQ_2014_H'] = {
  key:'WCQ_2014_H', comp:'2014 World Cup Qualifier', group:'Group H', qualifies:1, playoffSpot:1,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:82},
    {name:'Montenegro',flag:'🇲🇪',rating:70},
    {name:'Ukraine',flag:'🇺🇦',rating:75},
    {name:'Poland',flag:'🇵🇱',rating:74},
    {name:'San Marino',flag:'🇸🇲',rating:30},
    {name:'Moldova',flag:'🇲🇩',rating:54},
  ],
  fixtures:[
    _qf('q14_1','2012-09-07','England','San Marino','WCQ_2014_H',{home:5,away:0}),
    _qf('q14_2','2012-10-12','Poland','England','WCQ_2014_H',{home:1,away:1}),
    _qf('q14_3','2012-10-16','England','San Marino','WCQ_2014_H',{home:5,away:0}),
    _qf('q14_4','2013-03-22','England','Montenegro','WCQ_2014_H',{home:1,away:1}),
    _qf('q14_5','2013-03-26','England','Moldova','WCQ_2014_H',{home:4,away:0}),
    _qf('q14_6','2013-05-29','Republic of Ireland','England','WCQ_2014_H',null),
    _qf('q14_7','2013-09-06','England','Moldova','WCQ_2014_H',{home:4,away:0}),
    _qf('q14_8','2013-09-10','Ukraine','England','WCQ_2014_H',{home:0,away:0}),
    _qf('q14_9','2013-10-15','England','Poland','WCQ_2014_H',{home:2,away:0}),
    _qf('q14_10','2013-10-11','Montenegro','England','WCQ_2014_H',{home:1,away:4}),
    _qf('q14_11','2012-09-07','Moldova','Montenegro','WCQ_2014_H',{home:0,away:2}),
    _qf('q14_12','2012-10-12','Ukraine','Moldova','WCQ_2014_H',{home:2,away:0}),
    _qf('q14_13','2013-03-22','Moldova','Ukraine','WCQ_2014_H',{home:0,away:2}),
    _qf('q14_14','2013-10-11','Ukraine','Poland','WCQ_2014_H',{home:1,away:0}),
  ],
};

// ECQ EURO 2016 — Group E
window.QUALIFIER_GROUPS['ECQ_EURO2016_E'] = {
  key:'ECQ_EURO2016_E', comp:'UEFA Euro 2016 Qualifier', group:'Group E', qualifies:2, playoffSpot:0,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:82},
    {name:'Switzerland',flag:'🇨🇭',rating:76},
    {name:'Slovenia',flag:'🇸🇮',rating:70},
    {name:'Estonia',flag:'🇪🇪',rating:60},
    {name:'San Marino',flag:'🇸🇲',rating:30},
    {name:'Lithuania',flag:'🇱🇹',rating:56},
  ],
  fixtures:[
    _qf('q16_1','2014-09-07','England','Switzerland','ECQ_EURO2016_E',{home:2,away:0}),
    _qf('q16_2','2014-10-09','San Marino','England','ECQ_EURO2016_E',{home:0,away:5}),
    _qf('q16_3','2014-10-12','England','Estonia','ECQ_EURO2016_E',{home:1,away:0}),
    _qf('q16_4','2014-11-15','England','Slovenia','ECQ_EURO2016_E',{home:3,away:1}),
    _qf('q16_5','2015-03-27','Lithuania','England','ECQ_EURO2016_E',{home:0,away:3}),
    _qf('q16_6','2015-06-14','England','San Marino','ECQ_EURO2016_E',{home:6,away:0}),
    _qf('q16_7','2015-09-05','England','Switzerland','ECQ_EURO2016_E',{home:2,away:0}),
    _qf('q16_8','2015-10-09','Estonia','England','ECQ_EURO2016_E',{home:0,away:2}),
    _qf('q16_9','2015-10-12','England','Lithuania','ECQ_EURO2016_E',{home:3,away:0}),
    _qf('q16_10','2015-11-15','Slovenia','England','ECQ_EURO2016_E',{home:2,away:3}),
    _qf('q16_11','2014-09-07','Slovenia','Switzerland','ECQ_EURO2016_E',{home:1,away:0}),
    _qf('q16_12','2014-10-12','Switzerland','Estonia','ECQ_EURO2016_E',{home:4,away:0}),
    _qf('q16_13','2015-03-27','Switzerland','Slovenia','ECQ_EURO2016_E',{home:3,away:2}),
    _qf('q16_14','2015-10-12','Switzerland','Lithuania','ECQ_EURO2016_E',{home:3,away:0}),
  ],
};

// WCQ 2018 — Group F
window.QUALIFIER_GROUPS['WCQ_2018_F'] = {
  key:'WCQ_2018_F', comp:'2018 World Cup Qualifier', group:'Group F', qualifies:1, playoffSpot:1,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:83},
    {name:'Slovakia',flag:'🇸🇰',rating:74},
    {name:'Slovenia',flag:'🇸🇮',rating:70},
    {name:'Scotland',flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',rating:72},
    {name:'Lithuania',flag:'🇱🇹',rating:56},
    {name:'Malta',flag:'🇲🇹',rating:44},
  ],
  fixtures:[
    _qf('q18_1','2016-09-04','Slovakia','England','WCQ_2018_F',{home:0,away:1}),
    _qf('q18_2','2016-10-08','England','Malta','WCQ_2018_F',{home:2,away:0}),
    _qf('q18_3','2016-10-11','England','Slovenia','WCQ_2018_F',{home:1,away:0}),
    _qf('q18_4','2016-11-11','England','Scotland','WCQ_2018_F',{home:3,away:0}),
    _qf('q18_5','2017-03-26','Lithuania','England','WCQ_2018_F',{home:0,away:1}),
    _qf('q18_6','2017-06-10','England','Scotland','WCQ_2018_F',{home:2,away:2}),
    _qf('q18_7','2017-08-31','England','Malta','WCQ_2018_F',{home:4,away:0}),
    _qf('q18_8','2017-09-04','Slovakia','England','WCQ_2018_F',{home:1,away:2}),
    _qf('q18_9','2017-10-05','England','Slovenia','WCQ_2018_F',{home:1,away:0}),
    _qf('q18_10','2017-10-08','Lithuania','England','WCQ_2018_F',{home:0,away:1}),
    _qf('q18_11','2016-09-04','Scotland','Lithuania','WCQ_2018_F',{home:1,away:0}),
    _qf('q18_12','2016-10-11','Slovenia','Slovakia','WCQ_2018_F',{home:0,away:0}),
    _qf('q18_13','2017-03-26','Scotland','Slovenia','WCQ_2018_F',{home:1,away:0}),
    _qf('q18_14','2017-10-08','Slovenia','Lithuania','WCQ_2018_F',{home:2,away:0}),
  ],
};

// ECQ EURO 2020 — Group A
window.QUALIFIER_GROUPS['ECQ_EURO2020_A'] = {
  key:'ECQ_EURO2020_A', comp:'UEFA Euro 2020 Qualifier', group:'Group A', qualifies:2, playoffSpot:0,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:84},
    {name:'Czech Republic',flag:'🇨🇿',rating:74},
    {name:'Bulgaria',flag:'🇧🇬',rating:66},
    {name:'Kosovo',flag:'🇽🇰',rating:60},
    {name:'Montenegro',flag:'🇲🇪',rating:66},
  ],
  fixtures:[
    _qf('q20_1','2019-03-22','Czech Republic','England','ECQ_EURO2020_A',{home:1,away:5}),
    _qf('q20_2','2019-03-25','England','Montenegro','ECQ_EURO2020_A',{home:5,away:1}),
    _qf('q20_3','2019-06-07','England','Bulgaria','ECQ_EURO2020_A',{home:4,away:0}),
    _qf('q20_4','2019-09-07','Kosovo','England','ECQ_EURO2020_A',{home:0,away:4}),
    _qf('q20_5','2019-09-10','England','Kosovo','ECQ_EURO2020_A',{home:5,away:3}),
    _qf('q20_6','2019-10-14','Bulgaria','England','ECQ_EURO2020_A',{home:0,away:6}),
    _qf('q20_7','2019-10-18','England','Czech Republic','ECQ_EURO2020_A',{home:0,away:0}),
    _qf('q20_8','2019-11-14','Montenegro','England','ECQ_EURO2020_A',{home:1,away:7}),
    _qf('q20_9','2019-03-22','Montenegro','Bulgaria','ECQ_EURO2020_A',{home:1,away:1}),
    _qf('q20_10','2019-06-07','Kosovo','Czech Republic','ECQ_EURO2020_A',{home:2,away:1}),
    _qf('q20_11','2019-09-07','Czech Republic','Kosovo','ECQ_EURO2020_A',{home:2,away:1}),
    _qf('q20_12','2019-10-14','Montenegro','Kosovo','ECQ_EURO2020_A',{home:1,away:1}),
  ],
};

// WCQ 2022 — Group I
window.QUALIFIER_GROUPS['WCQ_2022_I'] = {
  key:'WCQ_2022_I', comp:'2022 World Cup Qualifier', group:'Group I', qualifies:1, playoffSpot:1,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:85},
    {name:'Poland',flag:'🇵🇱',rating:76},
    {name:'Albania',flag:'🇦🇱',rating:66},
    {name:'Hungary',flag:'🇭🇺',rating:70},
    {name:'Andorra',flag:'🇦🇩',rating:38},
    {name:'San Marino',flag:'🇸🇲',rating:30},
  ],
  fixtures:[
    _qf('q22_1','2021-03-25','England','San Marino','WCQ_2022_I',{home:5,away:0}),
    _qf('q22_2','2021-03-28','Albania','England','WCQ_2022_I',{home:0,away:2}),
    _qf('q22_3','2021-04-25','England','Albania','WCQ_2022_I',{home:2,away:0}),
    _qf('q22_4','2021-06-02','England','Andorra','WCQ_2022_I',{home:3,away:0}),
    _qf('q22_5','2021-09-02','Hungary','England','WCQ_2022_I',{home:0,away:4}),
    _qf('q22_6','2021-09-05','England','Andorra','WCQ_2022_I',{home:4,away:0}),
    _qf('q22_7','2021-10-09','England','Hungary','WCQ_2022_I',{home:1,away:1}),
    _qf('q22_8','2021-10-12','Andorra','England','WCQ_2022_I',{home:0,away:5}),
    _qf('q22_9','2021-11-12','England','Albania','WCQ_2022_I',{home:5,away:0}),
    _qf('q22_10','2021-11-15','San Marino','England','WCQ_2022_I',{home:0,away:10}),
    _qf('q22_11','2021-03-25','Poland','Hungary','WCQ_2022_I',{home:3,away:3}),
    _qf('q22_12','2021-06-02','Albania','San Marino','WCQ_2022_I',{home:2,away:0}),
    _qf('q22_13','2021-09-05','Poland','Albania','WCQ_2022_I',{home:4,away:1}),
    _qf('q22_14','2021-10-09','Poland','San Marino','WCQ_2022_I',{home:5,away:0}),
  ],
};

// ECQ EURO 2024 — Group C
window.QUALIFIER_GROUPS['ECQ_EURO2024_C'] = {
  key:'ECQ_EURO2024_C', comp:'UEFA Euro 2024 Qualifier', group:'Group C', qualifies:2, playoffSpot:0,
  teams:[
    {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:86},
    {name:'Italy',flag:'🇮🇹',rating:84},
    {name:'Ukraine',flag:'🇺🇦',rating:74},
    {name:'North Macedonia',flag:'🇲🇰',rating:64},
    {name:'Malta',flag:'🇲🇹',rating:44},
  ],
  fixtures:[
    _qf('q24_1','2023-03-23','Italy','England','ECQ_EURO2024_C',{home:1,away:2}),
    _qf('q24_2','2023-03-26','England','Ukraine','ECQ_EURO2024_C',{home:2,away:0}),
    _qf('q24_3','2023-06-17','England','Malta','ECQ_EURO2024_C',{home:4,away:0}),
    _qf('q24_4','2023-09-09','England','Ukraine','ECQ_EURO2024_C',{home:0,away:0}),
    _qf('q24_5','2023-10-17','Italy','England','ECQ_EURO2024_C',{home:1,away:3}),
    _qf('q24_6','2023-11-17','North Macedonia','England','ECQ_EURO2024_C',{home:1,away:7}),
    _qf('q24_7','2023-11-20','England','North Macedonia','ECQ_EURO2024_C',{home:2,away:0}),
    _qf('q24_8','2023-06-17','Ukraine','Malta','ECQ_EURO2024_C',{home:3,away:0}),
    _qf('q24_9','2023-03-23','England','Italy','ECQ_EURO2024_C',null),
    _qf('q24_10','2023-10-14','Ukraine','Italy','ECQ_EURO2024_C',{home:1,away:1}),
    _qf('q24_11','2023-06-16','North Macedonia','Italy','ECQ_EURO2024_C',{home:1,away:1}),
    _qf('q24_12','2023-10-13','Malta','Italy','ECQ_EURO2024_C',{home:0,away:2}),
  ],
};

// ── Tournament → Qualifier key mapping ─────────────────────────────────────
window.TOURNAMENT_QUALIFIER_MAP = {
  'euro88':        'ECQ_EURO88_7',
  'italia90':      'WCQ_1990_2',
  'euro92':        'ECQ_EURO92_7',
  'usa94':         'WCQ_1994_2',
  'euro96':        'ECQ_EURO96_8',
  'france98':      'WCQ_1998_2',
  'euro2000':      'ECQ_EURO2000_5',
  'korea02':       'WCQ_2002_9',
  'euro2004':      'ECQ_EURO2004_7',
  'euro2008':      'ECQ_EURO2008_3',
  'southafrica10': 'WCQ_2010_6',
  'euro2012':      'ECQ_EURO2012_G',
  'brazil14':      'WCQ_2014_H',
  'euro2016':      'ECQ_EURO2016_E',
  'russia18':      'WCQ_2018_F',
  'euro2020':      'ECQ_EURO2020_A',
  'qatar22':       'WCQ_2022_I',
  'euro2024':      'ECQ_EURO2024_C',
};
