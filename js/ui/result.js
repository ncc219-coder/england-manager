window.ResultUI = {

  init(matchData) {
    // Allow passing explicit match data for viewing old matches
    if (matchData) {
      this._viewingHistory = true;
      this._historyData = matchData;
      this._confBefore = matchData.confBefore;
    } else {
      this._viewingHistory = false;
      this._historyData = null;
      // Capture confidence BEFORE _processMatchResult() updates it, so the
      // Summary tab can show an accurate before/after delta.
      this._confBefore = State.get("campaign.boardConfidence") ?? 60;
      this._processMatchResult();
    }
    document.getElementById("screen-result").innerHTML = this._render();
    this._activateTab("summary");
    setTimeout(() => document.querySelectorAll(".stat-bar-fill[data-w]").forEach(el=>el.style.width=el.dataset.w+"%"), 120);
    UI.show("screen-result");
  },

  // Returns to wherever the player actually came from when viewing a
  // historical match. Most history views (the regular match-history
  // list, etc.) come from the dashboard, but a tournament result row
  // specifically wants to land back on the tournament screen's Results
  // tab, not bounce out to the dashboard — TournamentUI sets a flag
  // right before opening this screen so the right destination can be
  // chosen here.
  _backFromHistory() {
    if (window.TournamentUI && window.TournamentUI._returnToTournamentAfterResult) {
      window.TournamentUI._returnToTournamentAfterResult = false;
      window.TournamentUI._tab = 'results';
      window.TournamentUI.init();
      UI.show('screen-tournament');
      return;
    }
    DashboardUI.init();
    UI.show('screen-dashboard');
  },

  _activateTab(tab) {
    document.querySelectorAll(".res-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
    document.querySelectorAll(".res-tab-panel").forEach(p => p.classList.toggle("active", p.dataset.panel === tab));
  },

  _processMatchResult() {
    const match  = State.get("match");
    const fixIdx = State.get("campaign.fixtureIdx");
    const fix    = window.ALL_FIXTURES[fixIdx];
    const score  = match?.score || {eng:0,opp:0};
    const diff   = score.eng - score.opp;

    // Save to match history
    // match.oppOverride carries the REAL opponent for a tournament match
    // (set by SquadUI.kickOff() whenever a tournament is active) — the
    // regular calendar fixture at this index is unrelated once a dynamic
    // knockout opponent has been resolved, so checking it first is wrong
    // for every tournament match. This was a real, pre-existing bug:
    // tournament matches have always been saved to history under
    // whatever opponent happened to occupy that calendar slot, not the
    // team actually played.
    const oppOverride = State.get("match.oppOverride");
    const opp = oppOverride?.oppName || (window.getOppName ? window.getOppName(fix) : "Opponent");
    const history = State.get("campaign.matchHistory2") || [];
    // Tournament matches are identified by match.oppOverride (set by
    // SquadUI.kickOff() whenever a tournament is active) rather than
    // fix.compType — fix here is resolved from the regular calendar index,
    // which doesn't reliably reflect the actual tournament fixture once a
    // dynamic knockout opponent has been resolved.
    const isTournamentMatch = !!oppOverride;
    history.push({
      fixIdx,
      date: fix?.date,
      comp: isTournamentMatch ? (window.TOURNAMENTS?.[State.get('tournament.key')]?.fullName || fix?.comp) : fix?.comp,
      compType: isTournamentMatch ? 'tournament' : (fix?.compType || 'friendly'),
      tournamentFixtureId: isTournamentMatch ? State.get('tournament.currentMatchId') : null,
      venue: fix?.venue,
      opp,
      score: { ...score },
      scorers: { ...(State.get("match.scorers") || {}) },
      stats: { ...(match?.stats || {}) },
      ratings: { ...(match?.ratings || {}) },
      playerStats: { ...(match?.playerStats || {}) },
      events: [...(match?.events || [])],
      injuries: [...(match?.injuries || [])],
      outcome: diff>0?"win":diff<0?"loss":"draw",
    });
    // Cap at 200 matches, but protect tournament history first — a career
    // can run to hundreds of friendlies and qualifiers over many seasons,
    // and those are far less significant to look back on than an actual
    // World Cup or Euros match. When trimming is needed, drop the oldest
    // NON-tournament matches first; only fall back to trimming tournament
    // matches themselves if there are somehow more than the cap on their own.
    if (history.length > 200) {
      const overflow = history.length - 200;
      const nonTournamentIdx = [];
      history.forEach((h, i) => { if (h.compType !== 'tournament') nonTournamentIdx.push(i); });
      const dropIdx = new Set(nonTournamentIdx.slice(0, overflow));
      let trimmed = history.filter((h, i) => !dropIdx.has(i));
      // If protecting all tournament matches still leaves us over the cap
      // (an extremely long multi-tournament career), trim the oldest
      // tournament matches too rather than growing unbounded.
      if (trimmed.length > 200) trimmed = trimmed.slice(trimmed.length - 200);
      history.length = 0;
      history.push(...trimmed);
    }
    State.set("campaign.matchHistory2", history);

    // W/D/L record
    const rec = State.get("campaign.record") || {w:0,d:0,l:0,gf:0,ga:0};
    if (diff > 0) rec.w++; else if (diff < 0) rec.l++; else rec.d++;
    rec.gf = (rec.gf||0) + score.eng;
    rec.ga = (rec.ga||0) + score.opp;
    State.set("campaign.record", rec);

    // Update player morale from match outcome
    {
      const morale  = State.get('campaign.playerMorale') || {};
      const ratings = State.get('match.ratings') || {};
      const scorers = (State.get('match.scorers') || {}).eng || [];
      const slots   = (State.get('squad.slots')   || []).filter(Boolean);
      const diff2   = score.eng - score.opp;
      const baseDelta = diff2 > 0 ? 5 : diff2 === 0 ? 1 : -4;
      slots.forEach(p => {
        let delta = baseDelta;
        const rat = ratings[p.id] || 0;
        if (rat >= 7.5) delta += 3;
        else if (rat > 0 && rat < 6.0) delta -= 3;
        const goals = scorers.filter(n => n === p.name.split(' ').pop()).length;
        delta += goals * 5;
        morale[p.id] = Math.min(100, Math.max(20, (morale[p.id] || 65) + delta));
      });
      // Bench get a smaller boost/drop
      (State.get('squad.bench') || []).filter(Boolean).forEach(p => {
        const benDelta = diff2 > 0 ? 2 : diff2 === 0 ? 0 : -2;
        morale[p.id] = Math.min(100, Math.max(20, (morale[p.id] || 65) + benDelta));
      });
      State.set('campaign.playerMorale', morale);
    }

    // Decrement matchesOut for existing injuries; clear recovered ones
    let injuries = (State.get("campaign.injuries") || [])
      .map(inj => ({ ...inj, matchesOut: (inj.matchesOut || 1) - 1 }))
      .filter(inj => inj.matchesOut > 0);

    // Add new injuries from this match
    (State.get("match.injuries") || []).forEach(inj => {
      if (!injuries.some(i => i.id === inj.id)) {
        const out = 1 + Math.floor(Math.random() * 3); // 1–3 matches out
        injuries.push({ ...inj, matchesOut: out });
      }
    });
    State.set("campaign.injuries", injuries);

    // FA confidence
    const conf = State.get("campaign.boardConfidence") || 50;
    State.set("campaign.boardConfidence", Math.min(100, Math.max(0, conf + (diff>0?3:diff<0?-4:0))));

    // ── Qualifier result processing ──────────────────────────────────
    if (fix?.compType === 'qualifier' && window.CampaignPhase?.processQualifierResult) {
      window.CampaignPhase.processQualifierResult(fix.id, score.eng, score.opp);
    }

    // ── Tournament result processing ──────────────────────────────────
    if (fix?.compType === 'tournament' && window.TournamentEngine?.isActive?.()) {
      if (window.TournamentEngine.handleMatchResult) {
        window.TournamentEngine.handleMatchResult(fix.id, score.eng, score.opp);
      }
    }

    // ── Sacking risk check ──────────────────────────────────────────────
    // Runs AFTER qualifier/tournament processing above, so a qualifying
    // failure or tournament conclusion on this exact match is already
    // reflected in campaign.phase / campaign.tournamentHistory by the time
    // this checks them. Flagged for the dashboard to surface once the
    // player has seen this result — never interrupt the result screen
    // itself, the player needs to see their stats/ratings/press first.
    if (window.CampaignPhase?.checkSackingRisk) {
      const risk = window.CampaignPhase.checkSackingRisk();
      if (risk) State.set('campaign.pendingSackingCheck', risk);
    }

    // ── Campaign phase transition check ───────────────────────────────
    if (window.CampaignPhase?.checkPhaseTransition) {
      window.CampaignPhase.checkPhaseTransition();
    }

    // Advance fixture and campaign date
    const nextIdx = fixIdx + 1;
    State.set("campaign.fixtureIdx", nextIdx);
    // Update campaign date to the next fixture's date so sidebar stays current
    const nextFix = window.ALL_FIXTURES[nextIdx];
    if (nextFix && nextFix.date) {
      State.set('campaign.campaignDate', nextFix.date);
    }
    // Respect the Auto-Save setting — manual save still always available via Settings
    const autoSaveOn = State.get('meta.settings.autoSave') ?? true;
    if (autoSaveOn) State.save();
  },

  _getData() {
    if (this._historyData) return this._historyData;
    const match  = State.get("match") || {};
    const fixIdx = (State.get("campaign.fixtureIdx")||1) - 1;
    const fix    = window.ALL_FIXTURES[fixIdx] || {};
    const beforeConf = this._confBefore ?? State.get("campaign.boardConfidence") ?? 60;
    return {
      fix, fixIdx,
      opp: window.getOppName ? window.getOppName(fix) : "Opponent",
      score: match.score || {eng:0,opp:0},
      scorers: match.scorers || {eng:[],opp:[]},
      stats: match.stats || {},
      ratings: match.ratings || {},
      playerStats: match.playerStats || {},
      events: match.events || [],
      injuries: match.injuries || [],
      confBefore: beforeConf,
      confAfter: State.get("campaign.boardConfidence") ?? beforeConf,
      outcome: (()=>{ const d=(match.score?.eng||0)-(match.score?.opp||0); return d>0?"win":d<0?"loss":"draw"; })(),
    };
  },

  _render() {
    const d = this._getData();
    const { fix, opp, score, scorers, stats, ratings, playerStats, events, injuries, confBefore, confAfter, outcome } = d;
    const diff = score.eng - score.opp;

    const outcomeLabel = {win:"Victory",draw:"Draw",loss:"Defeat"}[outcome];
    const outcomeColor = {win:"var(--green)",draw:"var(--gold)",loss:"var(--red)"}[outcome];
    const headlines = {
      win:  ["Three Lions Roar","England Make a Statement","A Convincing England Win","Dominant Display"],
      draw: ["Stalemate — England Frustrated","Honours Even","England Share the Points","A Frustrating Draw"],
      loss: ["A Bitter Night for England","England Suffer Defeat","Dark Day for the Three Lions","Damaging Defeat"],
    };
    const hl = headlines[outcome][Math.floor(Math.random()*4)];

    const engScorers = (scorers.eng||[]).join(", ") || "—";
    const oppScorers = (scorers.opp||[]).join(", ") || "—";

    const s = stats || {};
    const mxSh = Math.max(s.shots?.eng||0, s.shots?.opp||0, 1);

    const statBar = (label, ev, ov, mx, unit="") => {
      const ePct = Math.round((ev/Math.max(mx,1))*100);
      const oPct = Math.round((ov/Math.max(mx,1))*100);
      return `<div class="rstat-row">
        <span class="rstat-val eng">${ev}${unit}</span>
        <span class="rstat-label">${label}</span>
        <span class="rstat-val opp">${ov}${unit}</span>
      </div>
      <div class="rstat-bars">
        <div class="rstat-bar eng"><div class="stat-bar-fill" data-w="${ePct}" style="width:0%;background:var(--red)"></div></div>
        <div class="rstat-bar opp"><div class="stat-bar-fill" data-w="${oPct}" style="width:0%;background:var(--t4)"></div></div>
      </div>`;
    };

    const pool = State.get("squad.pool") || [];
    const sortedRatings = Object.entries(ratings||{})
      .map(([id,r]) => { const p=pool.find(x=>x.id===id); return p?{id,name:p.name,pos:p.posG,rat:r}:null; })
      .filter(Boolean).sort((a,b)=>b.rat-a.rat);

    const motm = sortedRatings[0];

    return `
    <div class="res-screen">

      <!-- HERO -->
      <div class="res-hero" style="border-bottom:2px solid ${outcomeColor}">
        <div class="res-hero-left">
          <div class="res-comp">${fix.comp||""} · ${fix.date||""}</div>
          <div class="res-score-row">
            <div class="res-score">${score.eng} – ${score.opp}</div>
            <div class="res-badge" style="background:${outcomeColor}">${outcomeLabel}</div>
          </div>
          <div class="res-teams">England vs ${opp}</div>
          <div class="res-scorers">
            ${engScorers !== "—" ? `<span style="color:var(--red)">⚽ ${engScorers}</span>` : ""}
            ${oppScorers !== "—" ? `<span style="color:var(--t3);margin-left:12px">⚽ ${oppScorers}</span>` : ""}
          </div>
        </div>
        <div class="res-hero-right">
          <div class="res-headline">${hl}</div>
          ${motm ? `<div class="res-motm">⭐ MOTM: <strong>${motm.name}</strong> <span style="color:var(--gold)">${motm.rat?.toFixed(1)||"—"}</span></div>` : ""}
        </div>
      </div>

      <!-- TAB BAR -->
      <div class="res-tabs">
        <button class="res-tab" data-tab="summary" onclick="ResultUI._activateTab('summary')">📋 Summary</button>
        <button class="res-tab" data-tab="stats"   onclick="ResultUI._activateTab('stats')">📊 Stats</button>
        <button class="res-tab" data-tab="players" onclick="ResultUI._activateTab('players')">⭐ Players</button>
        <button class="res-tab" data-tab="press"   onclick="ResultUI._activateTab('press')">🎙 Press</button>
      </div>

      <!-- TAB PANELS -->
      <div class="res-panels">

        <!-- SUMMARY -->
        <div class="res-tab-panel" data-panel="summary">
          ${this._renderSummaryTab(d)}
        </div>

        <!-- STATS -->
        <div class="res-tab-panel" data-panel="stats">
          <div class="res-stat-labels"><span>England</span><span>${opp}</span></div>
          ${statBar("Possession", s.possession||50, 100-(s.possession||50), 100, "%")}
          ${statBar("Shots", s.shots?.eng||0, s.shots?.opp||0, mxSh)}
          ${statBar("On Target", s.shotsOT?.eng||0, s.shotsOT?.opp||0, Math.max(s.shotsOT?.eng||0,s.shotsOT?.opp||0,1))}
          ${(s.xG?.eng||s.xG?.opp) ? statBar("xG", (s.xG?.eng||0).toFixed(2), (s.xG?.opp||0).toFixed(2), Math.max(s.xG?.eng||0,s.xG?.opp||0,0.1)) : ''}
          ${statBar("Corners", s.corners?.eng||0, s.corners?.opp||0, Math.max(s.corners?.eng||0,s.corners?.opp||0,1))}
          ${statBar("Fouls", s.fouls?.eng||0, s.fouls?.opp||0, Math.max(s.fouls?.eng||0,s.fouls?.opp||0,1))}
          ${(s.yellowCards?.eng||s.yellowCards?.opp) ? statBar("Yellow Cards", s.yellowCards?.eng||0, s.yellowCards?.opp||0, Math.max(s.yellowCards?.eng||0,s.yellowCards?.opp||0,1)) : ''}
          ${injuries.length ? `<div class="res-injury-note">🚑 ${injuries.map(i=>i.name).join(', ')} ${injuries.length>1?'were':'was'} injured during the match.</div>` : ''}
        </div>

        <!-- PLAYERS -->
        <div class="res-tab-panel" data-panel="players" style="padding:0">
          ${this._renderPlayersTab(sortedRatings, playerStats, pool)}
        </div>

        <!-- PRESS -->
        <div class="res-tab-panel" data-panel="press">
          <div class="res-press-intro">How do you respond to the media?</div>
          <div class="res-press-options">
            <button class="res-press-btn" onclick="ResultUI._pressChoice('confident')">
              <div class="rpb-title">💪 Confident</div>
              <div class="rpb-desc">${outcome==="win"?"Praise the team's performance":"Backed us in tough conditions"}</div>
            </button>
            <button class="res-press-btn" onclick="ResultUI._pressChoice('diplomatic')">
              <div class="rpb-title">🤝 Diplomatic</div>
              <div class="rpb-desc">Measured and professional response</div>
            </button>
            <button class="res-press-btn" onclick="ResultUI._pressChoice('critical')">
              <div class="rpb-title">⚡ Critical</div>
              <div class="rpb-desc">${outcome==="win"?"Room for improvement":"Unacceptable — changes needed"}</div>
            </button>
          </div>
          <div id="press-feedback" class="res-press-feedback"></div>
        </div>

      </div>

      <!-- FOOTER -->
      <div class="res-footer">
        <button class="btn btn-ghost" onclick="MenuUI.init();UI.show('screen-menu')" style="padding:0 20px">Main Menu</button>
        ${this._viewingHistory
          ? `<button class="btn btn-primary" onclick="ResultUI._backFromHistory()" style="padding:0 32px">← Back</button>`
          : `<button class="btn btn-primary" id="continue-btn" onclick="ResultUI.continue()" style="padding:0 32px">Continue ▶</button>`
        }
      </div>

    </div>`;
  },

  // ── SUMMARY TAB: goal/event timeline + campaign context ───────────────────
  _renderSummaryTab(d) {
    const { events, score, opp, confBefore, confAfter, fix, outcome } = d;

    // Key moments: goals, cards, injuries — the things that actually
    // shaped the match, not every minor pass/tackle event.
    const keyTypes = ['goal_eng_foot','goal_eng_header','goal_opp_foot','goal_opp_header',
                       'booking_eng','booking_opp','redcard_eng','redcard_opp',
                       'injury_sub','injury_noswap','halftime'];
    const timeline = (events||[]).filter(e => keyTypes.includes(e.type) || e.type==='injury')
      .sort((a,b) => (a.minute||a.min||0) - (b.minute||b.min||0));

    const iconFor = (type) => ({
      goal_eng_foot:'⚽', goal_eng_header:'⚽', goal_opp_foot:'⚽', goal_opp_header:'⚽',
      booking_eng:'🟨', booking_opp:'🟨', redcard_eng:'🟥', redcard_opp:'🟥',
      injury_sub:'🚑', injury_noswap:'🚑', halftime:'⏱',
    }[type] || '•');

    const sideFor = (type) => type.includes('_opp') ? 'opp' : type.includes('_eng') ? 'eng' : 'mid';

    const timelineHtml = timeline.length ? timeline.map(e => {
      const minute = e.minute || e.min || 0;
      const side = sideFor(e.type);
      return `<div class="res-tl-row ${side}">
        <span class="res-tl-min">${minute}'</span>
        <span class="res-tl-icon">${iconFor(e.type)}</span>
        <span class="res-tl-text">${e.text}</span>
      </div>`;
    }).join('') : '<div class="res-tl-empty">A quiet game — no major incidents to report.</div>';

    // Campaign context: confidence swing, qualifying position, next fixture
    const confDelta = confAfter - confBefore;
    const confArrow = confDelta > 0 ? '▲' : confDelta < 0 ? '▼' : '—';
    const confColor = confDelta > 0 ? 'var(--green)' : confDelta < 0 ? 'var(--red)' : 'var(--t3)';

    const qual = State.get('campaign.qualifier');
    let qualHtml = '';
    if (qual && window.CampaignPhase?.getSortedTable) {
      const table = window.CampaignPhase.getSortedTable();
      const engRow = table.find(r => r.name === 'England');
      const engPos = table.findIndex(r => r.name === 'England') + 1;
      if (engRow) {
        qualHtml = `<div class="res-context-row">
          <span>Qualifying Position</span>
          <strong>${engPos}${engPos===1?'st':engPos===2?'nd':engPos===3?'rd':'th'} · ${engRow.pts} pts · ${engRow.w}W ${engRow.d}D ${engRow.l}L</strong>
        </div>`;
      }
    }

    const nextFixIdx = (State.get('campaign.fixtureIdx')||0);
    const nextFix = window.ALL_FIXTURES?.[nextFixIdx];
    const nextOpp = nextFix && window.getOppName ? window.getOppName(nextFix) : null;

    return `
      <div class="res-summary-grid">
        <div class="res-summary-block">
          <div class="res-summary-head">Match Timeline</div>
          <div class="res-timeline">${timelineHtml}</div>
        </div>
        <div class="res-summary-block">
          <div class="res-summary-head">What This Means</div>
          <div class="res-context-row">
            <span>Board Confidence</span>
            <strong style="color:${confColor}">${confAfter}% <span style="font-size:11px">${confArrow}${confDelta!==0?Math.abs(confDelta):''}</span></strong>
          </div>
          ${qualHtml}
          ${nextOpp ? `<div class="res-context-row">
            <span>Next Fixture</span>
            <strong>vs ${nextOpp} · ${nextFix.date?new Date(nextFix.date).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):''}</strong>
          </div>` : ''}
          <div class="res-context-note">${this._contextNote(outcome, d)}</div>
        </div>
      </div>`;
  },

  _contextNote(outcome, d) {
    const { confAfter } = d;
    if (outcome === 'win') {
      return confAfter >= 70 ? 'The board are firmly behind you. Keep the momentum going.'
           : 'A welcome result, though there is still work to do to fully win over the board.';
    }
    if (outcome === 'draw') {
      return 'A point gained, but the board will want to see more from the next fixture.';
    }
    return confAfter < 35 ? 'A damaging result. Pressure is mounting — the next match matters.'
         : 'A setback, but there is still time to put things right.';
  },

  // ── PLAYERS TAB: real per-player match stats, not just one rating number ──
  _renderPlayersTab(sortedRatings, playerStats, pool) {
    if (!sortedRatings.length) return `<div style="padding:30px;color:var(--t3);text-align:center">No player data available.</div>`;

    const rows = sortedRatings.map(p => {
      const ps = playerStats[p.id] || {};
      const ratColor = p.rat>=7.5?'var(--green)':p.rat>=6?'var(--gold)':'var(--red)';
      const keyStats = [];
      if (ps.goals)        keyStats.push(`⚽ ${ps.goals}`);
      if (ps.assists)      keyStats.push(`🅰 ${ps.assists}`);
      if (ps.tackles)      keyStats.push(`${ps.tackles} tkl`);
      if (ps.interceptions)keyStats.push(`${ps.interceptions} int`);
      if (ps.keyPasses)    keyStats.push(`${ps.keyPasses} KP`);
      if (ps.saves)        keyStats.push(`${ps.saves} sv`);
      if (ps.shotsOT)      keyStats.push(`${ps.shotsOT}/${ps.shots||ps.shotsOT} SoT`);
      const statLine = keyStats.slice(0,4).join(' · ') || `${ps.touches||0} touches`;

      return `<div class="res-player-row" onclick="ResultUI._togglePlayerDetail('${p.id}')">
        <span class="pos-badge ${(p.pos||'mid').toLowerCase()}">${p.pos||'?'}</span>
        <div class="res-player-mid">
          <div class="res-player-name">${p.name}</div>
          <div class="res-player-substats">${statLine}</div>
        </div>
        <span class="res-rating-val" style="color:${ratColor}">${p.rat?.toFixed(1)||"—"}</span>
        <div class="res-player-full" id="res-player-full-${p.id}" style="display:none">
          ${this._playerFullStatsGrid(ps)}
        </div>
      </div>`;
    }).join('');

    return `<div class="res-player-list">${rows}</div>`;
  },

  _playerFullStatsGrid(ps) {
    const cells = [
      ['Touches', ps.touches||0], ['Shots', ps.shots||0], ['On Target', ps.shotsOT||0],
      ['Goals', ps.goals||0], ['Assists', ps.assists||0], ['Key Passes', ps.keyPasses||0],
      ['Tackles', ps.tackles||0], ['Interceptions', ps.interceptions||0], ['Clearances', ps.clearances||0],
      ['Saves', ps.saves||0], ['Crosses', ps.crosses||0], ['Dribbles', ps.dribbles||0],
      ['Aerials Won', ps.aerialWon||0], ['Fouls Won', ps.foulsWon||0], ['Fouls Conceded', ps.foulsConceded||0],
      ['Minutes', ps.mins||90],
    ].filter(([label,val]) => !(val===0 && ['Saves','Aerials Won'].includes(label))); // hide irrelevant zero stats for outfielders' rare categories only when truly unused
    return `<div class="res-player-stat-grid">${cells.map(([l,v])=>`<div class="res-pstat"><div class="res-pstat-val">${v}</div><div class="res-pstat-label">${l}</div></div>`).join('')}</div>`;
  },

  _togglePlayerDetail(id) {
    const el = document.getElementById('res-player-full-'+id);
    if (!el) return;
    const isOpen = el.style.display !== 'none';
    document.querySelectorAll('.res-player-full').forEach(e => e.style.display = 'none');
    el.style.display = isOpen ? 'none' : 'block';
  },


  _pressChoice(choice) {
    const score  = State.get("match.score") || {};
    const diff   = (score.eng||0) - (score.opp||0);
    let confDelta=0, moraleDelta=0, feedback="";
    if (choice==="confident") {
      if (diff>0)      { confDelta=3;  moraleDelta=5;  feedback="The board and players appreciate the positive outlook."; }
      else if (diff===0){ confDelta=-1; moraleDelta=2;  feedback="Confident after a draw — the media raises eyebrows."; }
      else              { confDelta=-3; moraleDelta=-2; feedback="Confidence after defeat — the media is skeptical."; }
    } else if (choice==="diplomatic") {
      confDelta=1; moraleDelta=2; feedback="A measured response — the board nods approvingly.";
    } else {
      if (diff<0)  { confDelta=2; moraleDelta=-3; feedback="The players are stung, but the board appreciates honesty."; }
      else         { confDelta=-1; moraleDelta=-2; feedback="The team feel underappreciated after a positive result."; }
    }
    const el = document.getElementById("press-feedback");
    if (el) { el.textContent = feedback; el.style.color = confDelta>=0?"var(--green)":"var(--red)"; }
    State.set("campaign.boardConfidence", Math.min(100,Math.max(0,(State.get("campaign.boardConfidence")||50)+confDelta)));
    const morale = State.get("campaign.playerMorale") || {};
    (State.get("squad.slots")||[]).filter(Boolean).forEach(p => { morale[p.id] = Math.min(100,Math.max(0,(morale[p.id]||50)+moraleDelta)); });
    State.set("campaign.playerMorale", morale);
    State.set("campaign.lastPresser", choice);
    document.querySelectorAll(".res-press-btn").forEach(b => b.classList.add("used"));
  },

  continue() {
    // campaign.fixtureIdx has already been advanced to the NEXT fixture
    // by the processing step above by the time this runs — back up one
    // to check the compType of the match that was actually just played,
    // not whatever's scheduled next.
    const fixIdx = (State.get("campaign.fixtureIdx") || 1) - 1;
    const fix    = window.ALL_FIXTURES[fixIdx];
    // Route on whether the match just played WAS a tournament fixture,
    // not on TournamentEngine.isActive() — isActive() is deliberately
    // false the instant the tournament has just concluded (won or
    // eliminated), which is exactly the moment the tournament screen's
    // victory/elimination screen needs to be shown. Checking isActive()
    // here sent the player straight to the dashboard on the very match
    // that ends a tournament, skipping that screen entirely.
    if (fix?.compType === 'tournament' && window.TournamentUI) {
      window.TournamentUI.init();
      UI.show("screen-tournament");
    } else {
      window.DashboardUI.init();
      UI.show("screen-dashboard");
    }
  },

};
