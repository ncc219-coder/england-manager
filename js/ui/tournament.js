/**
 * tournament.js — TournamentUI
 *
 * Full immersive tournament experience.
 * Each tournament has its own visual identity, splash, and atmosphere.
 */
window.TournamentUI = {
  _tab: 'overview',
  _splashShown: false,

  // ── init() alias — called by result.js after tournament match ─────────────
  init() {
    const key = State.get('tournament.key');
    if (key) this.enter(key);
    else this._render();
  },

  // ── Entry point ───────────────────────────────────────────────────────────
  enter(tournamentKey) {
    // init() is called by ResultUI after EVERY tournament match, not just
    // the very first one — this used to unconditionally reset and replay
    // the full cinematic splash every single time, which meant a group
    // game against Poland got the same "grand entrance" treatment as
    // walking into the tournament for the first time. Checking against
    // tournament.key (not isActive()) is deliberate: isActive() is ALSO
    // false the instant the tournament has just concluded (won or lost),
    // which is exactly the moment we need to show that result — reloading
    // here would wipe the just-finished state right before displaying it.
    const alreadyLoaded = State.get('tournament.key') === tournamentKey;
    if (!alreadyLoaded) TournamentEngine.load(tournamentKey);
    this._applyTheme();
    if (!alreadyLoaded) {
      this._splashShown = false;
      this._showSplash();
    } else {
      this._render();
      UI.show('screen-tournament');
    }
  },

  _applyTheme() {
    const data = TournamentEngine.data(); if (!data) return;
    const el = document.getElementById('screen-tournament'); if (!el) return;
    const c = data.colours;
    if (el.style.setProperty) {
      el.style.setProperty('--t-primary',   c.primary);
      el.style.setProperty('--t-secondary', c.secondary);
      el.style.setProperty('--t-accent',    c.accent   || c.primary);
      el.style.setProperty('--t-text',      c.text     || '#fff');
      el.style.setProperty('--t-bg',        c.bg       || '#0e0e12');
      el.style.setProperty('--t-bg-card',   c.bgCard   || '#1a1a20');
      el.style.setProperty('--t-bg-card2',  c.bgCard2  || c.bgCard || '#22222a');
      el.style.setProperty('--t-border',    c.border   || 'rgba(255,255,255,.08)');
    }
  },

  // Get the best available logo SVG for a tournament
  _logo(data) {
    return (window.TOURNAMENT_LOGOS && window.TOURNAMENT_LOGOS[data.key])
      || data.badgeSvg || '';
  },

  _mascot(key) {
    if (!window.TOURNAMENT_ASSETS) return '';
    const asset = window.TOURNAMENT_ASSETS['mascots/' + key];
    if (!asset) return '';
    return asset.replace('class="t-asset-img"', 'class="t-mascot-img"');
  },

  _trophy(key) {
    if (!window.TOURNAMENT_ASSETS) return '';
    const isEuro = key && key.startsWith('euro');
    const asset  = window.TOURNAMENT_ASSETS[isEuro ? 'trophies/euro' : 'trophies/world_cup'];
    if (!asset) return '';
    return asset.replace('class="t-asset-img"', 'class="t-trophy-img"');
  },

  // ── Splash ────────────────────────────────────────────────────────────────
  _showSplash() {
    const data = TournamentEngine.data(); if (!data) return;
    const el = document.getElementById('screen-tournament'); if (!el) return;
    UI.show('screen-tournament');
    el.innerHTML = TournamentSplash.render(data);
    this._splashShown = true;
  },

  _enterFromSplash() {
    TournamentEngine.simulateOtherResults('group');
    this._render();
  },

  // ── Main shell ────────────────────────────────────────────────────────────
  _render() {
    const data = TournamentEngine.data(); if (!data) return;
    const el   = document.getElementById('screen-tournament'); if (!el) return;
    const phase = State.get('tournament.phase');
    el.innerHTML = `
      ${this._header(data, phase)}
      <div class="t-body">
        <div class="t-main">
          ${['overview','groups','bracket','teams','results','stats'].map(id =>
            `<div class="t-panel${id===this._tab?' active':''}" id="tp-${id}"></div>`
          ).join('')}
        </div>
        <aside class="t-sidebar" id="t-sidebar"></aside>
      </div>`;
    this._renderTab(this._tab);
    this._renderSidebar();
  },

  _header(data, phase) {
    const phaseLabel = {
      group:'Group Stage', r16:'Round of 16', qf:'Quarter-Finals',
      sf:'Semi-Finals', final:'Final', '3rd':'Third Place',
      eliminated:'Eliminated', complete:'Complete'
    }[phase] || 'Group Stage';
    const tabs = [['overview','Overview'],['groups','Groups'],['bracket','Bracket'],['teams','Teams'],['results','Results'],['stats','Stats']];
    return `
      <header class="t-header">
        <div class="t-header-badge">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS[data.key])||data.badgeSvg||""}</div>
        <div class="t-header-titles">
          <div class="t-header-name">${data.fullName}</div>
          <div class="t-header-host">${data.host} · ${data.year}</div>
        </div>
        <nav class="t-nav">
          ${tabs.map(([id,lbl]) => `
            <button class="t-nav-btn${id===this._tab?' active':''}" onclick="TournamentUI.tab('${id}',this)">${lbl}</button>
          `).join('')}
        </nav>
        <div class="t-header-right">
          <span class="t-phase-pill">${phaseLabel}</span>
          <button class="t-exit-btn" onclick="TournamentUI.exitToDashboard()">← Dashboard</button>
        </div>
      </header>`;
  },

  tab(name, btn) {
    this._tab = name;
    document.querySelectorAll('.t-nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.t-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('tp-'+name);
    if (panel) panel.classList.add('active');
    this._renderTab(name);
  },

  _renderTab(name) {
    const m = {overview:'_renderOverview',groups:'_renderGroups',bracket:'_renderBracket',teams:'_renderTeams',results:'_renderResults',stats:'_renderStats'}[name];
    if (m && this[m]) this[m]();
  },

  // ── OVERVIEW ─────────────────────────────────────────────────────────────
  _renderOverview() {
    const p = document.getElementById('tp-overview'); if (!p) return;
    const data = TournamentEngine.data(); if (!data) return;
    const phase = State.get('tournament.phase');
    if (phase === 'complete') { this._renderVictory(p); return; }
    if (phase === 'eliminated') { this._renderElimination(p); return; }
    const next = TournamentEngine.nextEnglandFixture();
    const engGroup = data.groups.find(g => g.teams.some(t => t.name === 'England'));
    p.innerHTML = `
      ${next ? this._matchHero(next, data) : this._awaitingHero(data)}
      <div class="t-scroll">
        ${this._mediaWatchPanel()}
        ${engGroup ? this._englandGroupPanel(engGroup) : ''}
        ${this._otherResultsPanel(data)}
      </div>`;
  },

  // ── MEDIA WATCH ─────────────────────────────────────────────────────────
  // A "story so far" beat that reacts to recent form and round pressure —
  // the squad announcement press conference gave the tournament a strong
  // opening beat, but nothing followed it up match to match. Regenerated
  // fresh each time the player returns to this screen (i.e. once per
  // match), so it always reflects the very latest result.
  _mediaWatchPanel() {
    if (!window.TournamentMedia) return '';
    const path = State.get('tournament.englandPath') || [];
    const phase = State.get('tournament.phase');
    const beat = window.TournamentMedia.generate(path, phase);

    // Real head-to-head history against whoever's up next — a genuinely
    // different, rarer callout to the generic form-based Media Watch
    // beat above, so it's rendered as its own distinct block rather than
    // folded into the same rotating text.
    const data = TournamentEngine.data();
    const next = TournamentEngine.nextEnglandFixture();
    const nextOpp = next ? (next.home === 'England' ? next.away : next.home) : null;
    const rivalry = data && nextOpp ? window.TournamentMedia.rivalryNote(data.historicalNotes, nextOpp) : null;

    if (!beat && !rivalry) return '';
    return `
      ${beat ? `
      <div class="t-media-watch t-media-${beat.band}">
        <div class="t-media-label">Media Watch</div>
        <p class="t-media-text">${beat.text}</p>
      </div>` : ''}
      ${rivalry ? `
      <div class="t-media-watch t-media-rivalry">
        <div class="t-media-label">History vs ${nextOpp}</div>
        <p class="t-media-text">${rivalry}</p>
      </div>` : ''}`;
  },

  _matchHero(fix, data) {
    const opp = fix.home === 'England' ? fix.away : fix.home;
    const oppInfo = data.teams[opp] || {};
    const oppGroup = data.groups.find(g => g.teams.some(t => t.name === opp));
    const oppFlagEmoji = oppGroup?.teams.find(t => t.name === opp)?.flag || '🌍';
    const oppFlag = (window.FLAG_SVGS && window.FLAG_SVGS[opp])
      ? `<span class="t-real-flag">${window.FLAG_SVGS[opp]}</span>`
      : oppFlagEmoji;
    const engFlag = (window.FLAG_SVGS && window.FLAG_SVGS['England'])
      ? `<span class="t-real-flag">${window.FLAG_SVGS['England']}</span>`
      : '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
    const venue = data.venues?.[fix.venue] || {};
    const d = new Date(fix.date);
    const ds = d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const roundLabel = {group:'Group Stage',r16:'Round of 16',qf:'Quarter-Final',sf:'Semi-Final',final:'Final','3rd':'Third Place Play-off'}[fix.round] || fix.round;
    return `
      <div class="t-match-hero">
        <div class="t-match-kicker">${roundLabel} &nbsp;·&nbsp; ${ds}</div>
        <div class="t-match-teams">
          <div class="t-team-block">
            <div class="t-team-flag">${fix.home==='England'?engFlag:oppFlag}</div>
            <div class="t-team-name">${fix.home}</div>
          </div>
          <div class="t-match-vs">
            <div class="t-match-vs-text">VS</div>
            <div class="t-match-venue">${venue.city||fix.venue}</div>
            ${venue.alt ? `<div class="t-match-alt">${venue.alt}m altitude</div>` : ''}
          </div>
          <div class="t-team-block">
            <div class="t-team-flag">${fix.home==='England'?oppFlag:engFlag}</div>
            <div class="t-team-name">${fix.away}</div>
          </div>
        </div>
        ${oppInfo.note ? `<div class="t-match-note">${oppInfo.note}</div>` : ''}
        <div class="t-match-cta">
          <button class="t-play-btn" onclick="TournamentUI.playMatch()">
            <span>Prepare &amp; Play</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M6 4l8 5-8 5V4z"/></svg>
          </button>
        </div>
      </div>`;
  },

  _awaitingHero(data) {
    return `<div class="t-match-hero t-match-hero--awaiting">
      <div class="t-match-kicker">Tournament</div>
      <div class="t-awaiting-msg">Awaiting next fixture</div>
    </div>`;
  },

  _englandGroupPanel(group) {
    const sorted = TournamentEngine.getSortedTable(group.id);
    const data = TournamentEngine.data();
    return `
      <div class="t-section">
        <div class="t-section-head">
          <span>England's Group · ${group.name}</span>
        </div>
        <div class="t-group-table">
          <div class="t-gt-head">
            <span class="t-gt-pos">#</span>
            <span class="t-gt-team">Team</span>
            <span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span>
          </div>
          ${sorted.map(([name, row], i) => {
            const teamInfo = group.teams.find(t => t.name === name);
            const isEng = name === 'England';
            const qual  = i < group.qualified;
            const gd    = row.gf - row.ga;
            return `<div class="t-gt-row${isEng?' t-gt-england':''}${qual?' t-gt-qualify':''}">
              <span class="t-gt-pos">${i+1}</span>
              <span class="t-gt-team">${teamInfo?.flag||''} <b>${name}</b></span>
              <span>${row.p}</span><span>${row.w}</span><span>${row.d}</span><span>${row.l}</span>
              <span class="${gd>0?'t-pos':gd<0?'t-neg':''}">${gd>0?'+':''}${gd}</span>
              <span class="t-gt-pts">${row.pts}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="t-qualify-note">Top ${group.qualified} team${group.qualified>1?'s':''} qualify</div>
      </div>`;
  },

  _otherResultsPanel(data) {
    const results = State.get('tournament.results') || {};
    const recent = data.allFixtures
      .filter(f => {
        if (results[f.id] === null || results[f.id] === undefined) return false;
        const { home, away } = TournamentEngine._effectiveTeams(f);
        return home !== 'England' && away !== 'England' && home !== 'TBD' && away !== 'TBD';
      })
      .slice(-8).reverse();
    if (!recent.length) return '';
    return `
      <div class="t-section">
        <div class="t-section-head"><span>Latest Results</span></div>
        <div class="t-results-list">
          ${recent.map(f => {
            const r = results[f.id];
            const { home, away } = TournamentEngine._effectiveTeams(f);
            const label = f.group ? `Group ${f.group}` : TournamentEngine._round(f).toUpperCase();
            return `<div class="t-result-row">
              <span class="t-result-label">${label}</span>
              <span class="t-result-home">${home}</span>
              <span class="t-result-score">${r.home} – ${r.away}</span>
              <span class="t-result-away">${away}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  },

  // ── GROUPS ───────────────────────────────────────────────────────────────
  _renderGroups() {
    const p = document.getElementById('tp-groups'); if (!p) return;
    const data = TournamentEngine.data(); if (!data) return;
    p.innerHTML = `
      <div class="t-scroll">
        <div class="t-groups-grid">
          ${data.groups.map(g => this._groupCard(g)).join('')}
        </div>
      </div>`;
  },

  _groupCard(group) {
    const sorted = TournamentEngine.getSortedTable(group.id);
    const hasEng = group.teams.some(t => t.name === 'England');
    return `
      <div class="t-group-card${hasEng?' t-group-card--eng':''}">
        <div class="t-group-card-head">
          ${group.name}
          ${hasEng ? '<span class="t-eng-badge">England</span>' : ''}
        </div>
        <div class="t-gt-head t-gt-head--sm">
          <span class="t-gt-pos">#</span><span class="t-gt-team">Team</span>
          <span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span>
        </div>
        ${sorted.map(([name, row], i) => {
          const teamInfo = group.teams.find(t => t.name === name);
          const isEng = name === 'England';
          const qual  = i < group.qualified;
          const gd    = row.gf - row.ga;
          return `<div class="t-gt-row${isEng?' t-gt-england':''}${qual?' t-gt-qualify':''}">
            <span class="t-gt-pos">${i+1}</span>
            <span class="t-gt-team">${teamInfo?.flag||''} <b>${name}</b></span>
            <span>${row.p}</span><span>${row.w}</span><span>${row.d}</span><span>${row.l}</span>
            <span class="${gd>0?'t-pos':gd<0?'t-neg':''}">${gd>0?'+':''}${gd}</span>
            <span class="t-gt-pts">${row.pts}</span>
          </div>`;
        }).join('')}
      </div>`;
  },

  // ── BRACKET ──────────────────────────────────────────────────────────────
  _renderBracket() {
    const p = document.getElementById('tp-bracket'); if (!p) return;
    const data = TournamentEngine.data(); if (!data) return;
    const results = State.get('tournament.results') || {};
    const rounds = ['r16','qf','sf','final'];
    const roundLabels = {r16:'R16',qf:'QF',sf:'SF',final:'Final'};
    const hasKO = data.allFixtures.some(f => rounds.includes(TournamentEngine._round(f)));
    if (!hasKO) {
      p.innerHTML = `<div class="t-scroll"><div class="t-bracket-locked">
        <div class="t-bracket-locked-icon">🏆</div>
        <div>Knockout bracket unlocked after group stage</div>
      </div></div>`;
      return;
    }
    const renderRound = (roundId) => {
      const fixes = data.allFixtures.filter(f => TournamentEngine._round(f) === roundId);
      if (!fixes.length) return '';
      return `
        <div class="t-bracket-col">
          <div class="t-bracket-col-head">${roundLabels[roundId]||roundId.toUpperCase()}</div>
          ${fixes.map(f => {
            const r = results[f.id];
            const { home, away } = TournamentEngine._effectiveTeams(f);
            const eng = home==='England'||away==='England';
            const hw = r && r.home > r.away, aw = r && r.away > r.home;
            return `<div class="t-bracket-match${eng?' t-bracket-match--eng':''}">
              <div class="t-bracket-team${hw?' t-bracket-winner':''}${home==='England'?' t-bracket-england':''}">
                <span>${home||'TBD'}</span>
                ${r?`<b>${r.home}</b>`:''}
              </div>
              <div class="t-bracket-team${aw?' t-bracket-winner':''}${away==='England'?' t-bracket-england':''}">
                <span>${away||'TBD'}</span>
                ${r?`<b>${r.away}</b>`:''}
              </div>
            </div>`;
          }).join('')}
        </div>`;
    };
    p.innerHTML = `
      <div class="t-scroll">
        <div class="t-bracket-wrap">
          <div class="t-bracket">
            ${rounds.map(r => renderRound(r)).join('')}
          </div>
        </div>
      </div>`;
  },

  // ── TEAMS ────────────────────────────────────────────────────────────────
  _renderTeams() {
    const p = document.getElementById('tp-teams'); if (!p) return;
    const data = TournamentEngine.data(); if (!data) return;
    const teams = Object.entries(data.teams).sort((a,b) => b[1].rating - a[1].rating);
    p.innerHTML = `
      <div class="t-scroll">
        <div class="t-teams-grid">
          ${teams.map(([name, team]) => {
            const grp = data.groups.find(g => g.teams.some(t => t.name === name));
            const info = grp?.teams.find(t => t.name === name);
            const realFlag = window.FLAG_SVGS?.[name];
            const squads = (data.squads||{})[name]||[];
            const star = [...squads].sort((a,b) => b.rating-a.rating)[0];
            const isEng = name==='England';
            return `<div class="t-team-card${isEng?' t-team-card--eng':''}">
              <div class="t-tc-head">
                <span class="t-tc-flag">${realFlag ? `<span class="t-real-flag-lg">${realFlag}</span>` : (info?.flag||'🌍')}</span>
                <div class="t-tc-info">
                  <b>${name}</b>
                  <span>${team.formation||'4-4-2'} · ${team.style||'Balanced'}</span>
                </div>
                <div class="t-tc-rating">${team.rating}</div>
              </div>
              ${team.note?`<div class="t-tc-note">${team.note}</div>`:''}
              ${star?`<div class="t-tc-star"><span>⭐ ${star.name}</span><b>${star.rating}</b></div>`:''}
            </div>`;
          }).join('')}
        </div>
      </div>`;
  },

  // ── RESULTS ──────────────────────────────────────────────────────────────
  _renderResults() {
    const p = document.getElementById('tp-results'); if (!p) return;
    const data = TournamentEngine.data(); if (!data) return;
    const results = State.get('tournament.results') || {};
    const played = data.allFixtures.filter(f => results[f.id] !== null && results[f.id] !== undefined).reverse();
    p.innerHTML = `
      <div class="t-scroll">
        <div class="t-results-full">
          ${played.length ? played.map(f => {
            const r = results[f.id];
            const { home, away } = TournamentEngine._effectiveTeams(f);
            const eng = home==='England'||away==='England';
            const es = eng?(home==='England'?r.home:r.away):null;
            const os = eng?(home==='England'?r.away:r.home):null;
            const oc = eng?(es>os?'win':es<os?'loss':'draw'):'';
            const label = f.group?`Group ${f.group}`:TournamentEngine._round(f).toUpperCase();
            return `<div class="t-result-row t-result-row--full${eng?' t-result-row--eng':''}${eng?' t-result-row--clickable':''}" ${eng?`onclick="TournamentUI._openMatchDetail('${f.id}')"`:''}>
              <span class="t-result-label">${label}</span>
              <span class="t-result-home${home==='England'?' t-result-eng-name':''}">${home}</span>
              <span class="t-result-score ${oc}">${r.home} – ${r.away}</span>
              <span class="t-result-away${away==='England'?' t-result-eng-name':''}">${away}</span>
              ${eng?'<span class="t-result-detail-hint">View →</span>':''}
            </div>`;
          }).join('') : '<div class="t-empty">No results yet.</div>'}
        </div>
      </div>`;
  },

  // ── Full match detail (England's own matches only) ───────────────────────
  // Other-group fixtures are resolved statistically by simulateOtherResults
  // and were never actually played by the engine — there's no real
  // commentary, ratings, or per-player breakdown to show for them, just a
  // final scoreline. England's own matches DO have all of that, saved
  // into campaign.matchHistory2 by ResultUI itself the moment the match
  // ended — this just finds that exact saved entry and reopens the same
  // full result screen (Summary/Stats/Players/Press tabs) used right
  // after the match, now as a historical replay.
  _openMatchDetail(fixtureId) {
    const history = State.get('campaign.matchHistory2') || [];
    const entry = history.find(h => h.tournamentFixtureId === fixtureId);
    if (!entry || !window.ResultUI) return;

    // _getData() reads a flat `fix.comp` / `fix.date` for the header line
    // — the saved history entry stores those as flat top-level fields
    // (comp, date, venue) rather than nested under `fix`, since that's
    // the shape matchHistory2 has always used. Reconstruct a minimal
    // fix-shaped object here rather than changing that storage shape,
    // which other history-reading code (squad screen, dashboard) already
    // depends on staying as-is.
    const matchData = {
      ...entry,
      fix: { comp: entry.comp, date: entry.date, venue: entry.venue },
      confBefore: entry.confBefore ?? State.get('campaign.boardConfidence') ?? 60,
      confAfter: entry.confAfter ?? State.get('campaign.boardConfidence') ?? 60,
    };
    this._returnToTournamentAfterResult = true;
    window.ResultUI.init(matchData);
  },


  // ── STATS ────────────────────────────────────────────────────────────────
  _renderStats() {
    const p = document.getElementById('tp-stats'); if (!p) return;
    if (!window.TournamentStats) { p.innerHTML = '<div class="t-empty">Stats unavailable.</div>'; return; }

    const anyApps = (State.get('tournament.playerStats') || {});
    if (!Object.keys(anyApps).length) {
      p.innerHTML = '<div class="t-empty">No matches played yet this tournament — stats will appear here once you\'ve taken the field.</div>';
      return;
    }

    const scorers   = window.TournamentStats.topScorers(8);
    const assists   = window.TournamentStats.topAssists(8);
    const rated     = window.TournamentStats.topRated(8);
    const sheets    = window.TournamentStats.topCleanSheets(8);
    const apps      = window.TournamentStats.mostAppearances(8);
    const motm      = window.TournamentStats.mostMOTM(8);
    const cards     = window.TournamentStats.mostCards(8);

    const leaderboard = (title, icon, rows, valueFn, emptyMsg) => `
      <div class="t-stats-card">
        <div class="t-stats-card-title">${icon} ${title}</div>
        ${rows.length ? rows.map((r, i) => `
          <div class="t-stats-row${i===0?' t-stats-row--first':''}">
            <span class="t-stats-rank">${i+1}</span>
            <span class="pos-badge ${UI.posClass(r.player.posG)}">${r.player.pos}</span>
            <span class="t-stats-name">${r.player.name}</span>
            <span class="t-stats-value">${valueFn(r)}</span>
          </div>`).join('') : `<div class="t-stats-empty">${emptyMsg}</div>`}
      </div>`;

    p.innerHTML = `
      <div class="t-scroll">
        <div class="t-stats-grid">
          ${leaderboard('Top Scorers', '⚽', scorers, r => r.goals, 'No goals yet.')}
          ${leaderboard('Top Assists', '🎯', assists, r => r.assists, 'No assists yet.')}
          ${leaderboard('Average Rating', '⭐', rated, r => r.avgRating.toFixed(2), 'No ratings yet.')}
          ${leaderboard('Clean Sheets', '🧱', sheets, r => r.cleanSheets, 'No clean sheets yet.')}
          ${leaderboard('Man of the Match', '🏅', motm, r => r.motm, 'Not awarded yet.')}
          ${leaderboard('Most Appearances', '👟', apps, r => r.apps, 'No appearances yet.')}
          ${leaderboard('Cards', '🟨', cards, r => r.redCards ? `${r.yellowCards}🟨 ${r.redCards}🟥` : `${r.yellowCards}🟨`, 'Nobody booked yet.')}
        </div>
      </div>`;
  },

  // ── SIDEBAR ──────────────────────────────────────────────────────────────
  _renderSidebar() {
    const side = document.getElementById('t-sidebar'); if (!side) return;
    const data = TournamentEngine.data(); if (!data) return;
    const path  = State.get('tournament.englandPath') || [];
    const results = State.get('tournament.results') || {};
    const nextFix  = TournamentEngine.nextEnglandFixture();
    // England's path: group fixtures are easy to find literally; knockout
    // fixtures need slot resolution since 'England' may not appear in the
    // raw home/away strings until the bracket has been built.
    const engFixes = data.allFixtures.filter(f => {
      const { home, away } = TournamentEngine._effectiveTeams(f);
      return home === 'England' || away === 'England';
    });
    const won=path.filter(r=>r.engScore>r.oppScore).length;
    const drawn=path.filter(r=>r.engScore===r.oppScore).length;
    const lost=path.filter(r=>r.engScore<r.oppScore).length;
    const gf=path.reduce((a,r)=>a+r.engScore,0);
    const ga=path.reduce((a,r)=>a+r.oppScore,0);
    const ctx = data.commentary.context[Math.floor(Math.random()*data.commentary.context.length)];
    side.innerHTML = `
      <div class="t-side-block">
        <div class="t-side-label">England ${data.year}</div>
        <div class="t-side-record">
          <div class="t-rec w"><b>${won}</b><span>W</span></div>
          <div class="t-rec d"><b>${drawn}</b><span>D</span></div>
          <div class="t-rec l"><b>${lost}</b><span>L</span></div>
        </div>
        <div class="t-side-goals">${gf} goals scored &nbsp;·&nbsp; ${ga} conceded</div>
      </div>
      <div class="t-side-block t-side-block--fixtures">
        <div class="t-side-label">England's Path</div>
        ${engFixes.map(f => {
          const r = results[f.id];
          const { home, away } = TournamentEngine._effectiveTeams(f);
          const opp = home==='England'?away:home;
          const isNext = nextFix?.id===f.id;
          const round = TournamentEngine._round(f);
          const rnd = {group:'Group',r16:'R16',qf:'QF',sf:'SF',final:'Final','3rd':'3rd'}[round]||round;
          if (opp === 'TBD') return `<div class="t-path-row">
            <span class="t-path-round">${rnd}</span>
            <span class="t-path-opp" style="color:var(--t4)">TBD</span>
            <span class="t-path-pending">—</span>
          </div>`;
          if (!r) return `<div class="t-path-row${isNext?' t-path-next':''}">
            <span class="t-path-round">${rnd}</span>
            <span class="t-path-opp">${opp}</span>
            ${isNext?`<span class="t-path-next-tag">NEXT</span>`:'<span class="t-path-pending">—</span>'}
          </div>`;
          const eng=home==='England'?r.home:r.away, osc=home==='England'?r.away:r.home;
          const oc=eng>osc?'win':eng<osc?'loss':'draw';
          return `<div class="t-path-row t-path-played">
            <span class="t-path-round">${rnd}</span>
            <span class="t-path-opp">${opp}</span>
            <span class="t-path-score ${oc}">${eng}–${osc}</span>
          </div>`;
        }).join('')}
      </div>
      <div class="t-side-block t-side-block--atmosphere">
        <div class="t-side-label">Atmosphere</div>
        <p class="t-atm-text">${ctx}</p>
      </div>
      <div class="t-side-block t-side-trophy">
        ${TournamentUI._trophy(data.key)}
      </div>`;
  },

  // ── ELIMINATION ──────────────────────────────────────────────────────────
  _renderElimination(panel) {
    const data = TournamentEngine.data(); if (!data) return;
    const path = State.get('tournament.englandPath') || [];
    const last = path[path.length-1];
    const phase = State.get('tournament.phase');
    // This screen only ever fires for phase === 'eliminated' now (a genuine
    // exit before/at the final) — 'complete' (won the whole thing) has its
    // own screen below, since the two moments call for opposite tone and
    // this pool of headlines was written purely for defeat.
    const roundName = {r16:'Round of 16',qf:'Quarter-Finals',sf:'Semi-Finals',final:'Final'}[phase]||'tournament';
    const hls = [`Heartbreak for England`,`The Dream is Over`,`England's ${data.year} Campaign Ends`];
    const hl  = hls[Math.floor(Math.random()*hls.length)];
    const note = this._eliminationNote(data, phase);
    panel.innerHTML = `
      <div class="t-elim">
        <div class="t-elim-badge">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS[data.key])||data.badgeSvg||""}</div>
        <div class="t-elim-round">${roundName}</div>
        ${last?`<div class="t-elim-score">${last.engScore} – ${last.oppScore}</div>`:''}
        <h2 class="t-elim-headline">${hl}</h2>
        <p class="t-elim-sub">England's ${data.year} campaign comes to an end.</p>
        ${note?`<blockquote class="t-elim-note">${note}</blockquote>`:''}
        ${this._awardHtml()}
        <button class="t-play-btn" onclick="TournamentUI.exitToDashboard()">Return to Dashboard</button>
      </div>`;
  },

  _eliminationNote(data, phase) {
    const notes = data.historicalNotes || {};
    if (phase==='qf') return notes['Argentina']||notes['Belgium']||notes['Cameroon']||'';
    if (phase==='sf') return notes['West Germany']||notes['Germany']||'';
    return notes['final']||'';
  },

  // ── ENGLAND PLAYER OF THE TOURNAMENT ───────────────────────────────────────
  // TournamentStats already tracks everything needed for this (goals,
  // assists, MOTM count, ratings) but nothing ever surfaced it as an
  // actual award — it just sat there as leaderboard data on the Stats
  // tab. A simple weighted score picks a genuine standout, real numbers
  // and all, rather than inventing a name.
  _tournamentAward() {
    const tStats = State.get('tournament.playerStats') || {};
    const pool   = State.get('squad.pool') || [];
    let best = null, bestScore = -1;
    Object.entries(tStats).forEach(([id, s]) => {
      if (!s.apps) return;
      const avgRating = s.ratingSum / s.apps;
      const score = s.goals*3 + s.assists*2 + s.motm*4 + (avgRating - 6)*2;
      if (score > bestScore) { bestScore = score; best = { id, ...s, avgRating }; }
    });
    if (!best) return null;
    const player = pool.find(p => p.id === best.id);
    return player ? { player, ...best } : null;
  },

  _awardHtml() {
    const award = this._tournamentAward(); if (!award) return '';
    const bits = [`${award.goals} goal${award.goals!==1?'s':''}`, `${award.assists} assist${award.assists!==1?'s':''}`, `${award.avgRating.toFixed(1)} avg rating`];
    if (award.motm) bits.push(`${award.motm} MOTM`);
    return `
      <div class="t-award">
        <div class="t-award-label">England Player of the Tournament</div>
        <div class="t-award-name">${award.player.name}</div>
        <div class="t-award-stats">${bits.join(' · ')}</div>
      </div>`;
  },

  // ── VICTORY ──────────────────────────────────────────────────────────────
  // Fires only when phase === 'complete', which TournamentEngine only ever
  // sets after England win the actual final — so this is unambiguously a
  // celebration screen, styled and written to feel like the opposite of
  // the elimination screen above, not a palette-swapped version of it.
  _renderVictory(panel) {
    const data = TournamentEngine.data(); if (!data) return;
    const path = State.get('tournament.englandPath') || [];
    const last = path[path.length-1];
    const isEuro = data.key && data.key.startsWith('euro');
    const hls = [
      `ENGLAND ARE CHAMPIONS!`,
      `IT'S COMING HOME`,
      `HISTORY IS MADE`,
      `ENGLAND CONQUER ${isEuro ? 'EUROPE' : 'THE WORLD'}`,
    ];
    const hl = hls[Math.floor(Math.random()*hls.length)];
    // Exact penalty-kick scoreline isn't persisted on the result record
    // (only the boolean `penalties` flag + eventual winner is, since
    // that's all later-round bracket resolution needs) — just note that
    // it went to penalties rather than inventing a score.
    const wentToPens = last && State.get('tournament.results')?.[last.fixtureId]?.penalties;
    const scoreLine = last
      ? `${last.engScore} – ${last.oppScore}${wentToPens ? ' <span class="t-victory-pens">(won on penalties)</span>' : ''}`
      : '';
    // The tournament's real historicalNotes.final describes what actually
    // happened in the real world's final — used here for a deliberate
    // alternate-history beat: "here's what really happened; not this time."
    const realFinal = (data.historicalNotes || {}).final;
    panel.innerHTML = `
      <div class="t-victory">
        <div class="t-victory-confetti">
          ${Array.from({length:14},(_,i)=>`<span class="t-confetti-piece" style="left:${(i*7+3)%100}%;animation-delay:${(i*0.31)%2.4}s;background:${i%3===0?'var(--gold,#EF9F27)':i%3===1?'#fff':'var(--t-secondary)'}"></span>`).join('')}
        </div>
        <div class="t-victory-badge">${this._trophy(data.key) || (window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS[data.key]) || data.badgeSvg || ''}</div>
        <div class="t-victory-round">CHAMPIONS · ${data.year}</div>
        ${scoreLine ? `<div class="t-victory-score">${scoreLine}</div>` : ''}
        <h2 class="t-victory-headline">${hl}</h2>
        <p class="t-victory-sub">England lift the ${data.name || 'trophy'} in ${data.host || data.year} — a genuine, era-defining triumph.</p>
        ${realFinal ? `<blockquote class="t-victory-note">In the history books, it read differently: “${realFinal}”<br><span class="t-victory-note-tag">Not this time.</span></blockquote>` : ''}
        ${this._awardHtml()}
        <button class="t-play-btn t-victory-btn" onclick="TournamentUI.exitToDashboard()">Return to Dashboard</button>
      </div>`;
  },

  // ── PLAY MATCH ───────────────────────────────────────────────────────────
  playMatch() {
    const fix = TournamentEngine.nextEnglandFixture(); if (!fix) return;
    State.set('tournament.currentMatchId', fix.id);
    const gFix = window.ALL_FIXTURES.find(f =>
      f.homeTeam===fix.home && f.awayTeam===fix.away &&
      Math.abs(new Date(f.date)-new Date(fix.date)) < 86400000*2
    );
    if (gFix) State.set('campaign.fixtureIdx', window.ALL_FIXTURES.indexOf(gFix));

    // Tournament matches now share the exact same pre-match build-up gate
    // as regular fixtures (training + press, see buildup.js) instead of
    // skipping straight to squad selection — previously a World Cup
    // final had less pre-match texture than a random Tuesday qualifier.
    // If those stages aren't done yet, hand off to the dashboard (the
    // same task-list UI regular matches use) rather than duplicating a
    // second modal system just for tournament matches.
    const fixtureIdx = State.get('campaign.fixtureIdx') || 0;
    if (window.BuildUp && window.DashboardUI) {
      const sequence = window.BuildUp.buildSequence(fixtureIdx);
      const completedKey = `campaign.completedBuildUp.${fixtureIdx}`;
      const completed = new Set(State.get(completedKey) || []);
      const outstanding = sequence.filter(t => t.type !== 'FINAL_CONFIRM' && !completed.has(t.id));
      if (outstanding.length) {
        window.DashboardUI.init();
        UI.show('screen-dashboard');
        return;
      }
    }
    window.SquadUI.init();
    UI.show('screen-squad');
  },

  exitToDashboard() {
    // If the tournament has actually concluded (won, eliminated, or
    // completed), process the result properly before leaving — this is
    // what records tournament history, applies the board confidence
    // swing, and most importantly starts the NEXT qualifying cycle. Without
    // this, campaign.phase stays stuck at 'tournament' forever and the
    // player's career has nowhere left to go after a single tournament.
    const tPhase = State.get('tournament.phase');
    if ((tPhase === 'eliminated' || tPhase === 'complete') && window.TournamentEngine) {
      const key = State.get('tournament.key');
      const result = window.TournamentEngine.getEnglandResult();
      if (window.CampaignPhase && key) {
        window.CampaignPhase.onTournamentEnd(key, result);
      }
      // Sacking risk depends on tournamentHistory, which onTournamentEnd()
      // above just updated — checking any earlier (e.g. back in result.js,
      // right after the final match itself) would miss a humiliating
      // group-stage exit entirely, since that history entry didn't exist
      // yet at that point in the flow.
      if (window.CampaignPhase?.checkSackingRisk) {
        const risk = window.CampaignPhase.checkSackingRisk();
        if (risk) State.set('campaign.pendingSackingCheck', risk);
      }
    }
    window.DashboardUI.init();
    UI.show('screen-dashboard');
  },
};

// ── Splash screens — unique per tournament ───────────────────────────────────
window.TournamentSplash = {
  render(data) {
    const key = data.key;
    if (this[key]) return this[key](data);
    return this._default(data);
  },

  mexico86(data) {
    return `<div class="splash splash-mexico86">
      <div class="splash-geo-bg"></div>
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS[data.key])||data.badgeSvg||""}</div>
        <div class="splash-year-band">MEXICO · 1986</div>
        <h1 class="splash-title">FIFA<br>World Cup</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <div class="splash-mascot-wrap">${TournamentUI._mascot('mexico86')}</div>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },

  euro88(data) {
    return `<div class="splash splash-euro88">
      <div class="splash-stars-bg"></div>
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS[data.key])||data.badgeSvg||""}</div>
        <div class="splash-year-band">WEST GERMANY · 1988</div>
        <h1 class="splash-title">UEFA<br>Euro 1988</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },

  italia90(data) {
    return `<div class="splash splash-italia90">
      <div class="splash-marble-bg"></div>
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS[data.key])||data.badgeSvg||""}</div>
        <div class="splash-year-band">ITALIA · 1990</div>
        <h1 class="splash-title">FIFA<br>World Cup</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },

  euro96(data) {
    return `<div class="splash splash-euro96">
      <div class="splash-lions-bg"></div>
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS[data.key])||data.badgeSvg||""}</div>
        <div class="splash-year-band">ENGLAND · 1996</div>
        <h1 class="splash-title">UEFA<br>Euro 1996</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta splash-cta--96" onclick="TournamentUI._enterFromSplash()">
          ⚽ Football's Coming Home
        </button>
      </div>
    </div>`;
  },

  france98(data) {
    return `<div class="splash splash-france98">
      <div class="splash-tri-bg"></div>
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS[data.key])||data.badgeSvg||""}</div>
        <div class="splash-year-band">FRANCE · 1998</div>
        <h1 class="splash-title">FIFA<br>World Cup</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },


  usa94(data) {
    return `<div class="splash splash-usa94">
      <div class="splash-usa-bg"></div>
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['usa94'])||''}</div>
        <div class="splash-year-band">USA · 1994</div>
        <h1 class="splash-title">FIFA<br>World Cup</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <div class="splash-mascot-wrap">${TournamentUI._mascot('usa94')}</div>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },

  korea02(data) {
    return `<div class="splash splash-korea02">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['korea02'])||''}</div>
        <div class="splash-year-band">KOREA · JAPAN · 2002</div>
        <h1 class="splash-title">FIFA<br>World Cup</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <div class="splash-mascot-wrap">${TournamentUI._mascot('korea02')}</div>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },

  southafrica10(data) {
    return `<div class="splash splash-southafrica10">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['southafrica10'])||''}</div>
        <div class="splash-year-band">SOUTH AFRICA · 2010</div>
        <h1 class="splash-title">FIFA<br>World Cup</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <div class="splash-mascot-wrap">${TournamentUI._mascot('southafrica10')}</div>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },

  brazil14(data) {
    return `<div class="splash splash-brazil14">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['brazil14'])||''}</div>
        <div class="splash-year-band">BRASIL · 2014</div>
        <h1 class="splash-title">FIFA<br>World Cup</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <div class="splash-mascot-wrap">${TournamentUI._mascot('brazil14')}</div>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },

  russia18(data) {
    return `<div class="splash splash-russia18">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['russia18'])||''}</div>
        <div class="splash-year-band">RUSSIA · 2018</div>
        <h1 class="splash-title">FIFA<br>World Cup</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <div class="splash-mascot-wrap">${TournamentUI._mascot('russia18')}</div>
        <button class="splash-cta splash-cta--18" onclick="TournamentUI._enterFromSplash()">⚽ It's Coming Home</button>
      </div>
    </div>`;
  },

  qatar22(data) {
    return `<div class="splash splash-qatar22">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['qatar22'])||''}</div>
        <div class="splash-year-band">QATAR · 2022</div>
        <h1 class="splash-title">FIFA<br>World Cup</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <div class="splash-mascot-wrap">${TournamentUI._mascot('qatar22')}</div>
        <button class="splash-cta splash-cta--qatar" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },

  euro92(data) {
    return `<div class="splash splash-euro92">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['euro92'])||''}</div>
        <div class="splash-year-band">SWEDEN · 1992</div>
        <h1 class="splash-title">UEFA<br>Euro 1992</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },
  euro2000(data) {
    return `<div class="splash splash-euro2000">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['euro2000'])||''}</div>
        <div class="splash-year-band">BELGIUM / NETHERLANDS · 2000</div>
        <h1 class="splash-title">UEFA<br>Euro 2000</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },
  euro2004(data) {
    return `<div class="splash splash-euro2004">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['euro2004'])||''}</div>
        <div class="splash-year-band">PORTUGAL · 2004</div>
        <h1 class="splash-title">UEFA<br>Euro 2004</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta splash-cta--euro2004" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },
  euro2008(data) {
    return `<div class="splash splash-euro2008">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['euro2008'])||''}</div>
        <div class="splash-year-band">AUSTRIA / SWITZERLAND · 2008</div>
        <h1 class="splash-title">UEFA<br>Euro 2008</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta splash-cta--euro2008" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },
  euro2012(data) {
    return `<div class="splash splash-euro2012">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['euro2012'])||''}</div>
        <div class="splash-year-band">POLAND / UKRAINE · 2012</div>
        <h1 class="splash-title">UEFA<br>Euro 2012</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },
  euro2016(data) {
    return `<div class="splash splash-euro2016">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['euro2016'])||''}</div>
        <div class="splash-year-band">FRANCE · 2016</div>
        <h1 class="splash-title">UEFA<br>Euro 2016</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta splash-cta--euro2016" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },
  euro2020(data) {
    return `<div class="splash splash-euro2020">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['euro2020'])||''}</div>
        <div class="splash-year-band">PAN-EUROPEAN · 2021</div>
        <h1 class="splash-title">UEFA<br>Euro 2020</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta splash-cta--euro2020" onclick="TournamentUI._enterFromSplash()">⚽ It's Coming Home</button>
      </div>
    </div>`;
  },
  euro2024(data) {
    return `<div class="splash splash-euro2024">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS['euro2024'])||''}</div>
        <div class="splash-year-band">GERMANY · 2024</div>
        <h1 class="splash-title">UEFA<br>Euro 2024</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta splash-cta--euro2024" onclick="TournamentUI._enterFromSplash()">Enter the Tournament</button>
      </div>
    </div>`;
  },
  _default(data) {
    return `<div class="splash splash-default">
      <div class="splash-content">
        <div class="splash-badge-wrap">${(window.TOURNAMENT_LOGOS&&window.TOURNAMENT_LOGOS[data.key])||data.badgeSvg||""}</div>
        <h1 class="splash-title">${data.fullName}</h1>
        <div class="splash-tagline">"${data.tagline}"</div>
        <p class="splash-context">${data.atmosphere.context}</p>
        <button class="splash-cta" onclick="TournamentUI._enterFromSplash()">Enter</button>
      </div>
    </div>`;
  },
};

// ── Jump-to-tournament modal ──────────────────────────────────────────────────
window.TournamentJump = {
  open() {
    const old = document.getElementById('jump-overlay'); if (old) old.remove();
    const tournaments = Object.values(window.TOURNAMENTS || {})
      .sort((a,b) => a.year - b.year);
    const el = document.createElement('div');
    el.id = 'jump-overlay';
    el.className = 'jump-overlay';
    el.addEventListener('click', e => { if (e.target === el) this.close(); });
    el.innerHTML = `
      <div class="jump-modal">
        <div class="jump-head">
          <div class="jump-head-text">
            <div class="jump-title">Jump to Tournament</div>
            <div class="jump-sub">Instantly enter any tournament to test or play. Your current campaign will be overwritten.</div>
          </div>
          <button class="jump-close" onclick="TournamentJump.close()">✕</button>
        </div>
        <div class="jump-list">
          ${tournaments.map(t => `
            <div class="jump-card" onclick="TournamentJump.jump('${t.key}')">
              <div class="jump-card-badge">${t.badgeSvg}</div>
              <div class="jump-card-info">
                <div class="jump-card-name">${t.fullName}</div>
                <div class="jump-card-detail">
                  ${t.host} · ${t.year}<br>
                  <em style="color:rgba(255,255,255,.3)">${t.tagline || t.atmosphere?.mediaExpectation || ''}</em>
                </div>
              </div>
              <div class="jump-card-action">Enter ▶</div>
            </div>
          `).join('')}
        </div>
        <div class="jump-foot">
          ℹ Jumping to a tournament sets England's squad to the correct era automatically.
        </div>
      </div>`;
    document.body.appendChild(el);
  },

  close() {
    const el = document.getElementById('jump-overlay'); if (el) el.remove();
  },

  jump(key) {
    const t = window.TOURNAMENTS[key]; if (!t) return;
    this.close();
    // Set era to tournament year
    const era = t.year;
    State.set('meta.era', era);
    State.set('campaign.season', era);
    State.set('campaign.campaignDate', t.startDate);
    // Load correct player pool
    // Use dynamic player engine for the jump year
    const pool = (window.PlayerEngine && window.PLAYER_MASTER)
      ? window.PlayerEngine.getPool(era)
      : (window[`PLAYERS_${era <= 1987 ? 1986 : era <= 1991 ? 1990 : era <= 1993 ? 1994 : era <= 1997 ? 1996 : era <= 1999 ? 1998 : era <= 2003 ? 2002 : era <= 2007 ? 2006 : era <= 2011 ? 2010 : era <= 2015 ? 2014 : era <= 2019 ? 2018 : 2022}`] || window.PLAYERS_1986 || []);
    State.set('squad.pool', pool);
    // Pre-select a default squad
    const gk  = pool.filter(p => p.posG === 'GK').slice(0,2);
    const def = pool.filter(p => p.posG === 'DEF').slice(0,6);
    const mid = pool.filter(p => p.posG === 'MID').slice(0,6);
    const fwd = pool.filter(p => p.posG === 'FWD').slice(0,4);
    const squad23 = [...gk,...def,...mid,...fwd].slice(0,23);
    State.set('squad.englandSquad', squad23.map(p => p.id));
    // Set XI from first 11 of squad
    const xi = [...pool.filter(p=>p.posG==='GK').slice(0,1),...pool.filter(p=>p.posG==='DEF').slice(0,4),...pool.filter(p=>p.posG==='MID').slice(0,4),...pool.filter(p=>p.posG==='FWD').slice(0,2)];
    State.set('squad.slots', [...xi, ...new Array(11-xi.length).fill(null)]);
    State.set('squad.bench', squad23.filter(p => !xi.some(x=>x&&x.id===p.id)).slice(0,5));
    State.set('campaign.record', {played:0,won:0,drawn:0,lost:0,gf:0,ga:0});
    State.set('campaign.boardConfidence', 65);
    State.set('campaign.playerStats', {});
    State.set('campaign.playerMorale', {});
    State.set('tournament', {key:null,phase:null,englandPath:[],tables:{},results:{},bracket:{},englandElim:false,currentMatchId:null});
    // Enter tournament
    TournamentUI.enter(key);
  },
};
