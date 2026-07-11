window.DashboardUI = {
  _currentTab: 'calendar',
  _selectedSquadPlayer: null,
  _squadDetailTab: 'attributes',
  _addFilters: { search:'', pos:'ALL', minRating:0, maxAge:99, sort:'rating' },
  _scoutSelectedId: null,
  _tasks: [],

  init() {
    this._ensureState();
    this._tasks = this._buildTaskList();
    const el = document.getElementById('screen-dashboard');
    if (!el) return;
    el.innerHTML = this._shell();
    this.tab('calendar');
    // A pending sacking decision takes priority over everything else,
    // including the onboarding tour — the player needs to resolve this
    // before doing anything else with the dashboard.
    const pendingSacking = State.get('campaign.pendingSackingCheck');
    if (pendingSacking) {
      this._showSackingDecision(pendingSacking);
    } else if (window.Onboarding) {
      window.Onboarding.maybeStart();
    }
  },

  _ensureState() {
    let pool = State.get('squad.pool') || [];
    let poolRefreshed = false;
    // If using dynamic engine, refresh pool for current year
    if ((!pool.length || DashboardUI._shouldRefreshPool()) && window.PlayerEngine && window.PLAYER_MASTER) {
      const campaignYear = parseInt(State.get('campaign.campaignDate') || State.get('meta.era') || 1986);
      pool = window.PlayerEngine.getPool(campaignYear);
      State.set('squad.pool', pool);
      poolRefreshed = true;
    } else if (!pool.length && window.PLAYERS_1986) {
      State.set('squad.pool', window.PLAYERS_1986);
      pool = window.PLAYERS_1986;
    }
    if (!Array.isArray(State.get('squad.englandSquad'))) {
      State.set('squad.englandSquad', (State.get('squad.pool')||[]).slice(0,23).map(p=>p.id));
    } else if (poolRefreshed) {
      // The pool just moved to a new campaign year — some previously-saved
      // squad members may have aged out (retired). Drop anyone no longer
      // eligible, then top the squad back up with the best available
      // replacements by position so it never silently shrinks below a
      // playable size as a career progresses through many seasons.
      this._refreshSquadEligibility(pool);
    }
    if (!Array.isArray(State.get('squad.slots'))) State.set('squad.slots', new Array(11).fill(null));
    if (!Array.isArray(State.get('squad.bench')))  State.set('squad.bench', []);
    if (State.get('campaign.fixtureIdx') === undefined) State.set('campaign.fixtureIdx', 0);
    if (!State.get('campaign.media')) State.set('campaign.media', {trust:58,fanMood:64,pressure:52});
    if (!State.get('campaign.fa'))    State.set('campaign.fa', {confidence:65,expectation:'Qualify',meetingHistory:[]});
  },

  _shell() {
    const meta = State.get('meta');
    const rec  = State.get('campaign.record') || {};
    const tabs = [
      ['calendar','Dashboard'],['results','Results'],['squad','Squad'],['morale','Morale'],
      ['tactics','Tactics'],['scouting','Scouting'],['matchcentre','Match Centre'],
      ['tournaments','Tournaments'],['media','Media'],['fa','FA'],['archive','Archive']
    ];
    return `
      <div class="dash-nav">
        <div class="dash-nav-brand">
          <div class="dash-nav-brand-title">England<span>Manager</span></div>
        </div>
        <nav class="dash-nav-tabs" style="overflow-x:auto;white-space:nowrap">
          ${tabs.map(([id,lbl])=>`<button class="dash-nav-tab" data-tab="${id}" onclick="DashboardUI.tab('${id}',this)">${lbl}</button>`).join('')}
        </nav>
        <div class="dash-nav-right">
          <div class="dash-record">
            <div class="dash-record-chip"><div class="dash-record-num w">${rec.won||0}</div><div class="dash-record-lbl">W</div></div>
            <div class="dash-record-chip"><div class="dash-record-num d">${rec.drawn||0}</div><div class="dash-record-lbl">D</div></div>
            <div class="dash-record-chip"><div class="dash-record-num l">${rec.lost||0}</div><div class="dash-record-lbl">L</div></div>
          </div>
          <div>
            <div class="dash-mgr-name">${meta.manager}</div>
            <div class="dash-mgr-sub">${meta.difficulty||'Professional'} · ${meta.era||1986}</div>
          </div>
          <button onclick="TournamentJump.open()" title="Jump to Tournament" style="background:transparent;border:1px solid var(--border);color:var(--t3);width:36px;height:36px;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all .14s;flex-shrink:0" onmouseover="this.style.borderColor='var(--border3)';this.style.color='var(--t1)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--t3)'">🏆</button>
          <button onclick="SettingsUI.open()" title="Settings" style="background:transparent;border:1px solid var(--border);color:var(--t3);width:36px;height:36px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .14s;flex-shrink:0" onmouseover="this.style.borderColor='var(--border3)';this.style.color='var(--t1)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--t3)'">⚙</button>
        </div>
      </div>
      <div class="dash-body">
        <div class="dash-main" id="dash-main">
          ${['calendar','results','squad','morale','tactics','scouting','matchcentre','tournaments','media','fa','archive'].map(id=>`<div class="dash-panel" id="dp-${id}" style="display:none"></div>`).join('')}
        </div>
        <aside class="dash-sidebar" id="dash-sidebar"></aside>
      </div>`;
  },

  tab(name, btn) {
    this._currentTab = name || 'calendar';
    document.querySelectorAll('.dash-nav-tab').forEach(b => b.classList.toggle('active', b.dataset.tab===this._currentTab));
    document.querySelectorAll('.dash-panel').forEach(p => { p.classList.remove('active'); p.style.display='none'; });
    const panel = document.getElementById('dp-'+this._currentTab);
    if (panel) { panel.classList.add('active'); panel.style.display='flex'; panel.style.flexDirection='column'; panel.style.overflow='hidden'; panel.style.minHeight='0'; }
    const map = {
      calendar:'_renderCalendar', squad:'_renderSquad', morale:'_renderMorale',
      tactics:'_renderTactics', scouting:'_renderScouting', results:'_renderResults',matchcentre:'_renderMatchCentre',
      tournaments:'_renderTournaments', media:'_renderMedia',
      fa:'_renderFA', archive:'_renderArchive'
    };
    try {
      const m = map[this._currentTab];
      if (m && typeof this[m]==='function') this[m]();
      else this._renderFallback(this._currentTab);
    } catch(e) {
      console.error('Tab error:', this._currentTab, e);
      const p = document.getElementById('dp-'+this._currentTab);
      if (p) p.innerHTML = `<div style="padding:32px;color:var(--red);font-family:var(--font-ui)">${e.message}</div>`;
    }
    this._renderSidebar();
  },

  // ── HELPERS ──────────────────────────────────────────────────────────────
  _pool() {
    const pool = State.get('squad.pool') || [];
    // Many panels in this file read pl.caps / pl.goals directly off the
    // pool object rather than going through campaign.playerStats — that's
    // fine AS LONG AS the pool object itself always carries the correct,
    // current numbers. Sync them here, once, at the source, rather than
    // patching every individual read site (there are 16+ of them across
    // this file). campaign.playerStats holds the authoritative in-game
    // accumulated total once a player has actually played; historicalCaps
    // /historicalGoals (computed by PlayerEngine from real career data)
    // is the correct value before that — never 0 just because the game
    // hasn't started recording yet.
    const stats = State.get('campaign.playerStats') || {};
    pool.forEach(p => {
      const tracked = stats[p.id];
      p.caps  = tracked?.caps  ?? p.historicalCaps  ?? 0;
      p.goals = tracked?.goals ?? p.historicalGoals ?? 0;
    });
    return pool;
  },
  // Drop retired players from the saved squad and top it back up with the
  // best available eligible replacements, position by position, so a long
  // career never silently degrades to a half-empty squad with no warning.
  _refreshSquadEligibility(pool) {
    const validIds = new Set(pool.map(p => p.id));
    let squadIds = State.get('squad.englandSquad') || [];
    const before = squadIds.length;
    squadIds = squadIds.filter(id => validIds.has(id));
    const dropped = before - squadIds.length;

    const TARGET = { GK: 3, DEF: 8, MID: 9, FWD: 6 }; // mirrors _ensureSquad's own targets
    const used = new Set(squadIds);
    Object.entries(TARGET).forEach(([posG, target]) => {
      const current = squadIds.filter(id => {
        const p = pool.find(x => x.id === id);
        return p && p.posG === posG;
      }).length;
      if (current >= target) return;
      const candidates = pool
        .filter(p => p.posG === posG && !used.has(p.id))
        .sort((a, b) => b.rat - a.rat);
      for (let i = 0; i < target - current && i < candidates.length; i++) {
        squadIds.push(candidates[i].id);
        used.add(candidates[i].id);
      }
    });

    State.set('squad.englandSquad', squadIds);

    // Also drop any now-ineligible players sitting directly in the XI/bench
    // slots, so a retired player never appears as still "selected" on the
    // pitch view after a season turnover.
    const slots = State.get('squad.slots');
    if (Array.isArray(slots)) {
      State.set('squad.slots', slots.map(p => (p && validIds.has(p.id)) ? p : null));
    }
    const bench = State.get('squad.bench');
    if (Array.isArray(bench)) {
      State.set('squad.bench', bench.filter(p => p && validIds.has(p.id)));
    }

    if (dropped > 0) {
      // Surface this gently rather than silently — store a note the
      // calendar/dashboard can show on next render.
      State.set('campaign.squadTurnoverNote',
        `${dropped} player${dropped!==1?'s':''} retired from international football this season. Your squad has been refreshed with new call-ups.`);
    }
  },

  _dismissSquadTurnoverNote() {
    State.set('campaign.squadTurnoverNote', null);
    const el = document.getElementById('dp-squad-turnover');
    if (el) el.innerHTML = '';
  },

  _shouldRefreshPool() {
    // Refresh pool if the campaign has moved to a different year than the pool was built for
    const pool = State.get('squad.pool') || [];
    if (!pool.length) return true;
    const campaignYear = parseInt(State.get('campaign.campaignDate') || State.get('meta.era') || 1986);
    const poolYear = State.get('squad.poolYear') || 0;
    return Math.abs(campaignYear - poolYear) >= 1;
  },
  _refreshPool() {
    if (!window.PlayerEngine || !window.PLAYER_MASTER) return;
    // Check for new high-rated young players entering the pool
    const prevPool = new Set((State.get('squad.pool') || []).map(p => p.id));
    const campaignYear = parseInt(State.get('campaign.campaignDate') || State.get('meta.era') || 1986);
    const pool = window.PlayerEngine.getPool(campaignYear);
    State.set('squad.pool', pool);
    State.set('squad.poolYear', campaignYear);

    // ── Young player emergence notifications ─────────────────────────────
    const newEntrants = pool.filter(p => !prevPool.has(p.id) && p.age && p.age <= 21 && p.rat >= 82);
    if (newEntrants.length) {
      const alerts = State.get('campaign.emergenceAlerts') || [];
      newEntrants.forEach(p => {
        if (!alerts.find(a => a.id === p.id)) {
          alerts.push({ id: p.id, name: p.name, rat: p.rat, age: p.age, year: campaignYear });
        }
      });
      State.set('campaign.emergenceAlerts', alerts);
    }

    // Preserve existing caps/goals/morale for players already in pool
    const stats  = State.get('campaign.playerStats') || {};
    const morale = State.get('campaign.playerMorale') || {};
    pool.forEach(p => {
      if (stats[p.id]) {
        p.caps  = stats[p.id].caps  || 0;
        p.goals = stats[p.id].goals || 0;
      }
      // Morale: players not selected for 3+ matches get unhappy
      const lastSel = stats[p.id]?.lastSelected || 0;
      const totalMatches = Object.values(stats).reduce((s,v) => Math.max(s, v.caps||0), 0);
      if (totalMatches > 0 && p.caps === 0 && p.rat >= 80) {
        // High-rated player never picked — low morale
        morale[p.id] = Math.max(30, (morale[p.id] || 70) - 2);
      }
      p.morale = morale[p.id] || 65;
    });
    State.set('campaign.playerMorale', morale);
  },
  _squad()   { const ids=State.get('squad.englandSquad')||[]; return ids.map(id=>this._pool().find(p=>p.id===id)).filter(Boolean); },
  _fix()     { return (window.ALL_FIXTURES||[])[State.get('campaign.fixtureIdx')||0]; },
  _opp(f)    { return f ? (window.getOppName ? window.getOppName(f) : (f.homeTeam==='England'?f.awayTeam:f.homeTeam)) : 'TBC'; },
  _fmtDate(d){ try{ return UI.fmtDate(d); }catch(e){ return d||''; } },

  _personality(p) {
    const s=[...(p?.id||p?.name||'')].reduce((a,c)=>a+c.charCodeAt(0),0);
    const t=[['Leader',86,72,88,'Thrives'],['Professional',68,80,64,'Reliable'],['Maverick',45,55,74,'Unpredictable'],
             ['Confidence Player',48,46,58,'Fragile'],['Warrior',76,62,79,'Combative'],
             ['Quiet Talent',42,70,52,'Steady'],['Media Magnet',60,50,82,'Volatile']][s%7];
    return {type:t[0],leadership:t[1],temperament:t[2],influence:t[3],pressure:t[4]};
  },
  _morale(p) {
    const saved=State.get('campaign.playerMorale')||{};
    if (p&&saved[p.id]!==undefined) return saved[p.id];
    const per=this._personality(p);
    return Math.max(25,Math.min(95,Math.round(58+(per.temperament-55)*.25+((p?.rat||70)-70)*.1)));
  },
  _squadMorale() { const s=this._squad(); return s.length?Math.round(s.reduce((a,p)=>a+this._morale(p),0)/s.length):58; },
  _moraleClass(v){ return v>=70?'high':v>=45?'mid':'low'; },
  _readiness(p)  { if(!p) return 0; const age=p.age||25; const adj=age<21?-5:age>32?-3:3; return Math.max(35,Math.min(99,Math.round((p.rat||70)+Math.min(12,Math.floor((p.caps||0)/7))+adj-4))); },
  _form(p) {
    if (!p) return 55;
    const st = State.get('campaign.playerStats') || {};
    const fm = st[p.id]?.form || [];
    if (fm.length === 0) return Math.max(40, Math.min(99, Math.round((p.rat||70) - 3)));
    const avg = fm.reduce((a,v)=>a+v,0)/fm.length;   // -1..+1
    return Math.max(40, Math.min(99, Math.round((p.rat||70) + avg * 8)));
  },
  _potential(p)  { const age=p?.age||26; const g=age<=20?12:age<=23?8:age<=26?4:age<=30?1:-3; return Math.max(40,Math.min(99,Math.round((p?.rat||70)+g))); },
  _knowledgeLevel(p) {
    if (!p) return 0;
    const sc = (State.get('campaign.playerScoutCount')||{})[p.id] || p.scoutCount || 0;
    const caps = p.caps||0;
    if (caps>=20||sc>=3) return 3; if (caps>=8||sc>=2) return 2; if (caps>=2||sc>=1) return 1; return 0;
  },
  _bar(label,v)  { v=Math.max(1,Math.min(99,Math.round(v||0))); return `<div class="attribute-row"><span>${label}</span><div><i style="width:${v}%"></i></div><strong>${v}</strong></div>`; },
  _statCard(l,v) { return `<div class="squad-stat-card"><span>${l}</span><strong>${v}</strong></div>`; },
  _reportBar(label,v,max=100){ return `<div class="report-bar-row"><span>${label}</span><div><i style="width:${Math.round(v/max*100)}%"></i></div><strong>${v}</strong></div>`; },

  // ── SIDEBAR ──────────────────────────────────────────────────────────────
  _renderSidebar() {
    const side = document.getElementById('dash-sidebar');
    if (!side) return;
    const fix = this._fix();
    const rec = State.get('campaign.record')||{};
    const conf = State.get('campaign.boardConfidence')||60;
    const cc = conf>=70?'var(--green)':conf>=45?'var(--gold)':'var(--red)';
    const cq = conf>=70?'"Full support from the board."':conf>=50?'"Results acceptable so far."':conf>=35?'"Improvement expected soon."':'"Position under serious review."';
    const idx = State.get('campaign.fixtureIdx')||0;
    const campaignDate2 = State.get('campaign.campaignDate') || '1986-04-01';
    const completedIds2 = State.get('campaign.completedFixtureIds') || [];
    const allVisible = window.getVisibleFixtures
      ? window.getVisibleFixtures(campaignDate2, completedIds2)
      : (window.ALL_FIXTURES||[]);
    const _allUpcoming = allVisible.filter(f => !(completedIds2.includes(f.id)));
    const upcoming = _allUpcoming.slice(1, 7); // skip first — shown in Next Match card
    side.innerHTML = `
      <div class="sidebar-card">
        <div class="sidebar-date" style="font-size:11px;color:var(--t3);margin-bottom:4px;letter-spacing:0.06em;text-transform:uppercase">${(()=>{const d=new Date(State.get('campaign.campaignDate')||'1986-01-01');return d.toLocaleDateString('en-GB',{month:'long',year:'numeric'});})()}</div>
        <div class="sidebar-media" style="margin-bottom:10px">
          ${DashboardUI._mediaLine()}
        </div>
        <div class="sidebar-confidence" style="margin-bottom:12px">
          ${(()=>{
            const conf = State.get('campaign.boardConfidence') || 60;
            const col = conf >= 70 ? '#1D9E75' : conf >= 40 ? '#EF9F27' : '#E24B4A';
            const label = conf >= 80 ? 'Strong backing' : conf >= 60 ? 'Secure position' : conf >= 40 ? 'Under pressure' : 'Job at risk';
            return `<div style="font-size:11px;color:var(--t3);margin-bottom:4px;display:flex;justify-content:space-between">
              <span>FA Confidence</span><span style="color:${col};font-weight:700">${conf}%</span>
            </div>
            <div style="background:var(--bg2);border-radius:4px;height:6px;overflow:hidden">
              <div style="width:${conf}%;height:100%;background:${col};border-radius:4px;transition:width .4s ease"></div>
            </div>
            <div style="font-size:10px;color:${col};margin-top:3px">${label}</div>`;
          })()}
        </div>
        <div class="sidebar-title">Next Match</div>
        <div class="sidebar-fixture" style="font-family:var(--font-ui);font-size:17px;font-weight:700;color:var(--t1);margin:6px 0">${fix?`${fix.homeTeam} v ${fix.awayTeam}`:'No fixture'}</div>
        <div class="sidebar-sub" style="font-size:13px;color:var(--t3);margin-bottom:12px">${fix?`${fix.comp} · ${this._fmtDate(fix.date)}`:''}</div>
        <button class="btn btn-primary btn-primary-full" onclick="DashboardUI.tab('matchcentre')">Match Centre</button>
      </div>
      <div style="border-bottom:1px solid var(--border)">
        <div class="sidebar-head">After That</div>
        ${upcoming.map((f,i)=>{
          const isHome=f.homeTeam==='England';
          const opp=window.getOppName(f);
          const cls=f.compShort?.includes('WC')||f.compShort?.includes('EC')?'tag-red':'tag-gray';
          const d=new Date(f.date);
          return `<div class="ufix-row${i===0?' next-up':''}">
            <div class="ufix-comp"><span class="tag ${cls}">${f.compShort||'FRI'}</span></div>
            <div class="ufix-teams">
              <div class="ufix-match">${isHome?`<strong>England</strong> vs ${opp}`:`${f.homeTeam} vs <strong>England</strong>`}</div>
              <div class="ufix-venue">${f.venue||''}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="board-section">
        <div class="board-title">FA Board Confidence</div>
        <div class="board-conf-row"><span class="board-conf-label">Standing</span><span class="board-conf-num" style="color:${cc}">${conf}%</span></div>
        <div class="board-bar"><div class="board-bar-fill" style="width:${conf}%;background:${cc}"></div></div>
        <div class="board-quote">${cq}</div>
      </div>`;
  },

  // ── CALENDAR / DASHBOARD ─────────────────────────────────────────────────
  // ── QUALIFIER STATUS ──────────────────────────────────────────────────────
  _renderQualifierStatus() {
    const phase = State.get('campaign.phase') || 'between';
    const qual  = State.get('campaign.qualifier');
    if (!qual || phase === 'between') return '';
    if (phase === 'tournament') return '';  // already in tournament, handled by tournament UI

    const grp = window.QUALIFIER_GROUPS && window.QUALIFIER_GROUPS[qual.key];
    if (!grp) return '';

    const rows   = window.CampaignPhase ? window.CampaignPhase.getSortedTable() : [];
    const engRow = rows.find(r => r.name === 'England');
    const engPos = rows.findIndex(r => r.name === 'England') + 1;
    const qualPlaces = grp.qualifies || 1;
    const nextQFix = window.CampaignPhase ? window.CampaignPhase.getNextQualifierFixture() : null;
    const remaining = grp.fixtures.filter(f =>
      (f.home==='England'||f.away==='England') &&
      !(qual.completedFixtureIds||[]).includes(f.id)
    ).length;

    const posColor = engPos <= qualPlaces ? 'var(--green)' : 'var(--red)';
    const posLabel = engPos <= qualPlaces ? `P${engPos} — in qualification zone` : `P${engPos} — outside qualification`;

    return `<div class="dashboard-card qualifier-card" style="margin:0 24px 16px">
      <div class="card-title-row">
        <span>${grp.comp || 'Qualifier'} — ${grp.group}</span>
        <strong style="color:${posColor}">${posLabel}</strong>
      </div>
      <table class="qual-table" style="width:100%;font-size:13px;border-collapse:collapse">
        <thead><tr style="color:var(--t3)"><th style="text-align:left;padding:4px 8px">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th style="padding-right:8px">Pts</th></tr></thead>
        <tbody>
          ${rows.map((r,i)=>`<tr style="background:${r.name==='England'?'rgba(255,255,255,0.06)':'transparent'};border-top:1px solid var(--border)${i<qualPlaces?';border-left:3px solid var(--green)':''}">
            <td style="padding:5px 8px;font-weight:${r.name==='England'?'700':'400'}">${r.name}</td>
            <td style="text-align:center">${r.p}</td>
            <td style="text-align:center">${r.w}</td>
            <td style="text-align:center">${r.d}</td>
            <td style="text-align:center">${r.l}</td>
            <td style="text-align:center;color:${r.gf-r.ga>=0?'var(--green)':'var(--red)'}">${r.gf-r.ga>0?'+':''}${r.gf-r.ga}</td>
            <td style="text-align:center;font-weight:700;padding-right:8px">${r.pts}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top:12px;font-size:13px;color:var(--t3)">
        ${remaining} qualifier${remaining!==1?'s':''} remaining
        ${nextQFix?` · Next: <strong>${nextQFix.home} vs ${nextQFix.away}</strong> (${nextQFix.date})`:''}
      </div>
      ${phase==='qualified'?`<div style="margin-top:8px;padding:16px;background:rgba(29,158,117,0.1);border:1px solid rgba(29,158,117,0.3);border-radius:8px">
        <div style="font-family:var(--font-ui);font-size:18px;font-weight:900;color:var(--green);margin-bottom:4px">✓ England have qualified!</div>
        <div style="font-size:13px;color:var(--t2);margin-bottom:12px">England are through to the ${window.TOURNAMENTS?.[qual.tournKey]?.fullName||'tournament'}. The nation is behind you.</div>
        <button onclick="DashboardUI._enterTournament('${qual.tournKey||''}')"
          style="padding:10px 24px;background:var(--green);color:#fff;border:none;border-radius:6px;font-family:var(--font-ui);font-size:14px;font-weight:800;cursor:pointer;letter-spacing:.06em;text-transform:uppercase">
          Enter Tournament ▶
        </button>
      </div>`:''}
      ${phase==='failed_qual'?`<div style="margin-top:8px;padding:8px 12px;background:rgba(200,50,50,0.12);border-radius:6px;font-size:13px;color:var(--red)">
        <div style="font-weight:700;margin-bottom:6px">✗ England failed to qualify. ${State.get('campaign.boardConfidence')>40?'The board are disappointed.':'Pressure is mounting.'}</div>
        <button onclick="DashboardUI._nextQualCycle()" style="margin-top:4px;padding:6px 16px;background:var(--red);color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer">Continue to Next Campaign →</button>
      </div>`:''}
    </div>`;
  },

  _renderCalendar() {
    // Check if we should be entering tournament mode
    const campaignDateT = State.get('campaign.campaignDate') || '1986-01-20';
    const triggerKey   = window.TournamentEngine ? TournamentEngine.checkTrigger(campaignDateT) : null;
    if (triggerKey && !TournamentEngine.isActive()) {
      // Show a tournament start notification in the dashboard
      this._tournamentKey = triggerKey;
    }
    const p = document.getElementById('dp-calendar');
    const fix = this._fix();
    const tasks = this._tasks || [];
    const pending = tasks.filter(t=>!t.done);
    const done    = tasks.filter(t=>t.done);
    const canPlay = pending.filter(t=>t.type!=='FINAL_CONFIRM').length===0;
    const rec = State.get('campaign.record')||{};
    const campaignDate = State.get('campaign.campaignDate') || (fix ? fix.date : '1986-04-01');
    const d = new Date(campaignDate);
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const isHome = fix && fix.homeTeam==='England';
    const opp = fix ? this._opp(fix) : '';
    const compCls = fix?.compShort?.includes('WC')||fix?.compShort?.includes('EC')?'tag-red':'tag-gray';

    p.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;min-height:0';

    // Show a one-time note if the squad was just topped up due to retirements
    const turnoverNote = State.get('campaign.squadTurnoverNote');
    if (turnoverNote) {
      const noteDiv = document.getElementById('dp-squad-turnover') || (() => {
        const d = document.createElement('div');
        d.id = 'dp-squad-turnover';
        p.parentNode.insertBefore(d, p);
        return d;
      })();
      noteDiv.innerHTML = `<div class="dashboard-card" style="margin:0 24px 12px;background:rgba(232,184,75,0.08);border:1px solid rgba(232,184,75,0.25)">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:18px">🔄</span>
          <div style="flex:1;font-size:13px;color:var(--t2)">${turnoverNote}</div>
          <button onclick="DashboardUI._dismissSquadTurnoverNote()" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:16px;padding:4px">✕</button>
        </div>
      </div>`;
    } else {
      const existing = document.getElementById('dp-squad-turnover');
      if (existing) existing.innerHTML = '';
    }

    // Inject qualifier status above calendar
    const qualHtml = this._renderQualifierStatus();
    if (qualHtml) {
      const qualDiv = document.getElementById('dp-qualifier-status') || (() => {
        const d = document.createElement('div');
        d.id = 'dp-qualifier-status';
        p.parentNode.insertBefore(d, p);
        return d;
      })();
      qualDiv.innerHTML = qualHtml;
    }
    const tournBanner = (this._tournamentKey && window.TOURNAMENTS && window.TOURNAMENTS[this._tournamentKey])
      ? this._tournamentBanner(this._tournamentKey)
      : '';

    // Young player emergence alerts
    const emergenceAlerts = State.get('campaign.emergenceAlerts') || [];
    const unshownAlerts = emergenceAlerts.filter(a => !a.shown);
    const emergenceBanner = unshownAlerts.length ? `
      <div style="margin:8px 24px 0;padding:10px 14px;background:rgba(55,138,221,0.12);border-radius:8px;border-left:3px solid var(--blue)">
        <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:4px">🌟 New talent available</div>
        ${unshownAlerts.slice(0,3).map(a=>`<div style="font-size:13px;color:var(--t1);padding:2px 0">
          <strong>${a.name}</strong> — age ${a.age}, rated <strong>${a.rat}</strong>. Now available for selection.
        </div>`).join('')}
        <button onclick="DashboardUI._dismissEmergence()" style="margin-top:6px;font-size:11px;background:none;border:0.5px solid var(--blue);border-radius:4px;padding:2px 8px;cursor:pointer;color:var(--blue)">Dismiss</button>
      </div>` : '';
    p.innerHTML = `
      ${emergenceBanner}
      ${tournBanner}
      <div class="calendar-header">
        <div class="cal-date-block">
          <div class="cal-date-month">${months[d.getMonth()]} ${d.getFullYear()}</div>
          <div class="cal-date-day">${d.getDate()}</div>
        </div>
        <div class="cal-header-info">
          <div class="cal-header-label">Next Fixture</div>
          <div class="cal-next-match">${fix?(isHome?`<span>England</span> vs ${opp}`:`${fix.homeTeam} vs <span>England</span>`):'No fixture loaded'}</div>
          <div class="cal-next-info">${fix?`${fix.venue} · ${fix.venueCity} <span class="tag ${compCls}" style="margin-left:8px">${fix.comp}</span>`:''}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0">
          <div class="dash-record" style="align-self:flex-end">
            <div class="dash-record-chip"><div class="dash-record-num w">${rec.won||0}</div><div class="dash-record-lbl">W</div></div>
            <div class="dash-record-chip"><div class="dash-record-num d">${rec.drawn||0}</div><div class="dash-record-lbl">D</div></div>
            <div class="dash-record-chip"><div class="dash-record-num l">${rec.lost||0}</div><div class="dash-record-lbl">L</div></div>
          </div>
        </div>
      </div>
      <div class="task-scroll">
        ${pending.length?`
          <div class="task-section-head"><span>Before Matchday</span><span>${pending.length} remaining</span></div>
          ${pending.map(t=>{
            const dayLabel = t.dayOffset > 0 ? `${t.dayOffset} day${t.dayOffset!==1?'s':''} out` : 'Matchday';
            return `<div class="task-card priority-${t.priority}${t.locked?' task-locked':''}" onclick="DashboardUI._openTask('${t.id}')" style="${t.locked?'opacity:.45;cursor:default':''}">
            <div class="task-icon">${t.locked?'🔒':t.icon}</div>
            <div class="task-body"><div class="task-title">${t.title}</div><div class="task-desc">${t.locked?'Complete the previous step first.':t.desc}</div></div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
              <div class="task-badge ${t.priority}">${t.priority}</div>
              <div style="font-size:10px;color:var(--t4);letter-spacing:.04em">${dayLabel}</div>
            </div>
          </div>`;
          }).join('')}
        `:''}
        ${done.length?`
          <div class="task-section-head" style="margin-top:${pending.length?'20px':'0'}"><span>Completed</span><span>${done.length} done</span></div>
          ${done.map(t=>`<div class="task-card done">
            <div class="task-icon">${t.icon}</div>
            <div class="task-body"><div class="task-title">${t.title}</div><div class="task-desc">${t.done_summary||t.desc}</div></div>
            <div class="task-badge done-badge">✓ Done</div>
          </div>`).join('')}
        `:''}
      </div>
      <div class="play-match-cta">
        <div class="pmc-fixture">
          <div class="pmc-title">${canPlay?'Ready for matchday':`Next: ${(pending.find(t=>t.type!=='FINAL_CONFIRM')||{}).title||'Complete build-up'}`}</div>
          <div class="pmc-match">${fix?(isHome?`England vs ${opp}`:`${fix.homeTeam} vs England`):'No fixture'}</div>
          <div class="pmc-info">${fix?`${fix.venue} · ${d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`:''}</div>
        </div>
        <button class="btn btn-primary" style="height:56px;font-size:16px;padding:0 36px" onclick="${canPlay?'DashboardUI.goToSquad()':'DashboardUI._openTask((DashboardUI._tasks.find(t=>!t.done&&!t.locked)||{}).id)'}">${canPlay?'Select Squad ▶':'Continue Build-Up ▶'}</button>
      </div>`;
  },

  // ── TASK SYSTEM ──────────────────────────────────────────────────────────

  // Builds the real staged build-up sequence for the current fixture, using
  // BuildUp.buildSequence() (stakes-aware, day-offset windows) and merging
  // in which stages have already been completed — persisted in State so
  // progress survives navigating away from the dashboard and back, and
  // even a save/reload mid-build-up.
  _buildTaskList() {
    const fixtureIdx = State.get('campaign.fixtureIdx') || 0;
    const sequence = window.BuildUp ? window.BuildUp.buildSequence(fixtureIdx) : [];
    const completedKey = `campaign.completedBuildUp.${fixtureIdx}`;
    const completed = new Set(State.get(completedKey) || []);
    return sequence.map((t, i) => ({
      ...t,
      done: completed.has(t.id),
      // Sequential gate: a stage can only be opened once every stage
      // before it in the sequence is done. The very first stage is
      // always open.
      locked: i > 0 && !completed.has(sequence[i-1].id),
    }));
  },

  // Marks a build-up stage as permanently complete for this fixture.
  _markStageComplete(taskId) {
    const fixtureIdx = State.get('campaign.fixtureIdx') || 0;
    const completedKey = `campaign.completedBuildUp.${fixtureIdx}`;
    const completed = new Set(State.get(completedKey) || []);
    completed.add(taskId);
    State.set(completedKey, [...completed]);
  },
  _openTask(id) {
    const t = this._tasks.find(x=>x.id===id);
    if (!t||t.done) return;
    if (t.locked) {
      // Sequential gate — nudge the player toward the stage that's
      // actually next, rather than silently doing nothing.
      const nextOpen = this._tasks.find(x => !x.done && !x.locked);
      if (nextOpen) this._openTask(nextOpen.id);
      return;
    }
    if (!window.TASK_TYPES && t.type !== 'FINAL_CONFIRM') { this._completeTask(id,'Done.'); return; }
    const T = window.TASK_TYPES || {};
    switch(t.type) {
      case T.PRESS_CONFERENCE:   this._openPress(t);    break;
      case T.TRAINING_SESSION:   this._openTraining(t); break;
      case T.SCOUTING_TRIP:      this._openScoutTask(t);break;
      case 'SCOUTING_PHASE':     this._openScoutingPhase(t); break;
      case T.SQUAD_ANNOUNCEMENT: this._openSquadAnnounce(t); break;
      case T.BOARD_MEETING:      this._openBoardMeeting(t);  break;
      case 'FINAL_CONFIRM':      this.goToSquad(); break;
      default: this._completeTask(id,'Task completed.'); break;
    }
  },
  _completeTask(id, summary) {
    const t = this._tasks.find(x=>x.id===id);
    if (t) {
      t.done = true;
      t.done_summary = summary || t.desc;
      this._markStageComplete(id);
      // Unlock whatever comes immediately next in the sequence.
      const idx = this._tasks.indexOf(t);
      if (this._tasks[idx+1]) this._tasks[idx+1].locked = false;
    }
    this._closeModal();
    this._renderCalendar();
  },
  _openModal(html) {
    const old=document.getElementById('task-modal'); if(old) old.remove();
    const el=document.createElement('div'); el.id='task-modal'; el.className='modal-overlay';
    el.innerHTML=html;
    el.addEventListener('click',e=>{ if(e.target===el) this._closeModal(); });
    document.body.appendChild(el);
  },
  _closeModal() { const el=document.getElementById('task-modal'); if(el) el.remove(); },

  _openPress(task) {
    const fix=this._fix(); const opp=this._opp(fix);
    const rec=State.get('campaign.record')||{};
    const conf=State.get('campaign.boardConfidence')||60;
    const isPost=task.id?.startsWith('press_post');
    const lastMatch=(State.get('campaign.matchHistory2')||[]).slice(-1)[0];
    const lastScore=lastMatch?.score;
    const lastDiff=lastScore?(lastScore.eng-lastScore.opp):null;

    // Build contextual question pool
    const qs=[];
    if(isPost && lastScore !== null && lastDiff !== null) {
      if(lastDiff>0) qs.push({ q:`England won ${lastScore?.eng}-${lastScore?.opp}. Was this a convincing display?`,
        answers:[{t:'"Exactly what we asked for. The performance was outstanding."',e:4},{t:'"We are pleased but there is more to come from this group."',e:2},{t:'"A professional job. We will enjoy it briefly and move on."',e:1},{t:'"The result is positive but some aspects require attention."',e:0}] });
      else if(lastDiff<0) qs.push({ q:`England lost ${lastScore?.eng}-${lastScore?.opp}. The nation wants answers.`,
        answers:[{t:'"Fully accountable. Changes will be made."',e:2},{t:'"Disappointed, but I trust this group to respond."',e:1},{t:'"The effort was there — the execution was not good enough today."',e:0},{t:'"The players let themselves and the country down."',e:-3}] });
      else qs.push({ q:`A ${lastScore?.eng}-${lastScore?.opp} draw. Is that good enough?`,
        answers:[{t:'"A hard-earned point. We take it and push on."',e:2},{t:'"Frustrated not to win but I respect the opponent."',e:1},{t:'"We left points on the pitch. That is the honest truth."',e:0},{t:'"Not acceptable. We need to be more clinical."',e:-2}] });
    } else if(conf<45) {
      qs.push({ q:'Reports suggest the board have lost confidence. What is your message?',
        answers:[{t:'"My job is to deliver results. That is what I will do."',e:3},{t:'"I remain fully committed to this project."',e:2},{t:'"Results must improve and they will."',e:1},{t:'"I understand the pressure. It motivates me."',e:0}] });
    }
    // Always include a pre-match question
    qs.push({ q:opp?`England face ${opp}. How do you see the game?`:'How do you assess the squad ahead of this match?',
      answers:[{t:'"We are in excellent shape. The squad is ready."',e:3},{t:'"It will be a tough contest. We are well prepared."',e:2},{t:'"We respect our opponents and will approach this carefully."',e:1},{t:'"There are challenges but I have full faith in the players."',e:0}] });
    qs.push({ q:'Some in the media have questioned your selection. Your response?',
      answers:[{t:'"I pick on merit and form. My choices are fully justified."',e:3},{t:'"Selection is always debated. I stand by every decision."',e:2},{t:'"It is part of the job. I focus on what I can control."',e:1},{t:'"Perhaps the critics have a point. Competition is healthy."',e:-1}] });

    const q=qs[isPost&&qs.length>1?0:(State.get('campaign.fixtureIdx')||0)%qs.length];
    this._pressEffect=0; this._pressChosen=null;
    this._openModal(`<div class="modal-box">
      <div class="modal-header"><div class="modal-icon">🎙️</div><div><div class="modal-title">${task.title}</div><div class="modal-sub">${fix?.venue||'Wembley'} · ${this._fmtDate(fix?.date)}</div></div></div>
      <div class="modal-body">
        <div class="press-question"><div class="pq-q">"${q.q}"</div>
          <div class="pq-answers">${q.answers.map((a,i)=>`<div class="pq-answer" id="pqa-${i}" onclick="DashboardUI._selectAnswer(${i},${a.e},'${task.id}')">${a.t}</div>`).join('')}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="DashboardUI._closeModal()">Cancel</button>
        <button class="btn btn-primary" id="press-confirm" disabled onclick="DashboardUI._confirmPress('${task.id}')">Confirm</button>
      </div>
    </div>`);
  },
  _selectAnswer(idx,effect,taskId){
    document.querySelectorAll('.pq-answer').forEach((el,i)=>el.classList.toggle('chosen',i===idx));
    this._pressChosen=idx; this._pressEffect=effect;
    const btn=document.getElementById('press-confirm'); if(btn) btn.disabled=false;
  },
  _confirmPress(taskId){
    if(this._pressChosen===null) return;
    State.upd('campaign.boardConfidence',c=>Math.min(100,Math.max(0,c+this._pressEffect)));
    State.upd('campaign.media',m=>({...m,pressure:Math.max(0,Math.min(100,m.pressure-(this._pressEffect*2)))}));
    this._completeTask(taskId,this._pressEffect>0?'Confident response — positive reaction.':'Cautious tone noted by the press.');
  },

  // ── TRAINING SESSION — three steps in one modal: team focus + intensity,
  //    individual drills, then a confirm screen showing real injury-risk
  //    numbers and sharpness standing before the session is locked in. ──────
  _openTraining(task){
    this._trainStep = 'focus';
    this._trainFocus = State.get('campaign.trainingFocus') || null;
    this._trainIntensity = State.get('campaign.trainingIntensity') || 'standard';
    this._trainDrills = { ...(State.get('campaign.individualDrills') || {}) };
    this._trainTaskId = task.id;
    this._renderTrainingModal();
  },

  _renderTrainingModal() {
    const T = window.Training;
    if (!T) { this._completeTask(this._trainTaskId, 'Training session completed.'); return; }

    if (this._trainStep === 'focus') {
      const sharpnessRows = Object.entries(T.TEAM_FOCUS).map(([id, f]) => {
        const sharp = T.getSharpness(id);
        const bars = Array.from({length:5}, (_,i) => i < sharp ? '●' : '○').join('');
        const selected = this._trainFocus === id;
        return `<div class="option-card${selected?' selected':''}" id="train-${id}" onclick="DashboardUI._selectTrainFocus('${id}')" style="padding:14px 16px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">${f.icon}</span>
            <div style="flex:1">
              <div class="option-label">${f.label}</div>
              <div class="option-desc">${f.desc}</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:12px">
            <span style="color:var(--t3)">Sharpness</span>
            <span style="color:${sharp>0?'var(--green)':'var(--t4)'};letter-spacing:2px;font-size:11px">${bars}</span>
          </div>
        </div>`;
      }).join('');

      const intensityRow = Object.entries(T.INTENSITY).map(([id, i]) => {
        const selected = this._trainIntensity === id;
        return `<button class="seg-btn${selected?' active':''}" onclick="DashboardUI._selectTrainIntensity('${id}')" style="flex:1">
          ${i.label}<br><span style="font-size:10px;opacity:.7">${Math.round(i.injuryBase*1000)/10}% risk</span>
        </button>`;
      }).join('');

      this._openModal(`<div class="modal-box wide">
        <div class="modal-header"><div class="modal-icon">⚽</div><div><div class="modal-title">Training Camp</div><div class="modal-sub">Choose this week's team focus at St George's Park.</div></div></div>
        <div class="modal-body">
          <div class="option-grid">${sharpnessRows}</div>
          <div style="margin-top:18px">
            <div style="font-size:12px;color:var(--t3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em">Session Intensity</div>
            <div style="display:flex;gap:6px">${intensityRow}</div>
            <div style="font-size:12px;color:var(--t3);margin-top:8px">${T.INTENSITY[this._trainIntensity]?.desc || ''}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="DashboardUI._closeModal()">Cancel</button>
          <button class="btn btn-primary" id="train-next" ${this._trainFocus?'':'disabled'} onclick="DashboardUI._trainStep='drills';DashboardUI._renderTrainingModal()">Next: Individual Drills ▶</button>
        </div>
      </div>`);
      return;
    }

    if (this._trainStep === 'drills') {
      const squad = this._squad();
      const assignedCount = Object.keys(this._trainDrills).length;
      const drillRows = squad.slice(0, 30).map(p => {
        const current = this._trainDrills[p.id];
        const options = Object.entries(T.DRILLS).map(([id,d]) =>
          `<option value="${id}" ${current===id?'selected':''}>${d.icon} ${d.label}</option>`).join('');
        return `<div class="mini-player-row" style="align-items:center">
          <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
          <div style="flex:1"><strong>${p.name}</strong></div>
          <select onchange="DashboardUI._setIndividualDrill('${p.id}', this.value)"
            style="background:var(--bg3);border:1px solid var(--border2);color:var(--t1);font-size:12px;padding:4px 8px;border-radius:5px">
            <option value="">— No drill —</option>
            ${options}
          </select>
        </div>`;
      }).join('');

      this._openModal(`<div class="modal-box wide">
        <div class="modal-header"><div class="modal-icon">🎯</div><div><div class="modal-title">Individual Drills</div><div class="modal-sub">Assign up to ${T.MAX_INDIVIDUAL_DRILLS} players a specific focus on top of the team session. (${assignedCount}/${T.MAX_INDIVIDUAL_DRILLS} assigned)</div></div></div>
        <div class="modal-body" style="max-height:50vh;overflow-y:auto">${drillRows}</div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="DashboardUI._trainStep='focus';DashboardUI._renderTrainingModal()">◀ Back</button>
          <button class="btn btn-primary" onclick="DashboardUI._trainStep='confirm';DashboardUI._renderTrainingModal()">Next: Review ▶</button>
        </div>
      </div>`);
      return;
    }

    if (this._trainStep === 'confirm') {
      const focus = T.TEAM_FOCUS[this._trainFocus];
      const intensity = T.INTENSITY[this._trainIntensity];
      const drillCount = Object.keys(this._trainDrills).length;
      const sharpAfter = Math.min(T.getSharpness(this._trainFocus) + 1, 5);
      const teamRiskPct = Math.round(intensity.injuryBase * 1000) / 10;
      const drillRiskPct = Math.round(intensity.injuryBase * 0.8 * 1000) / 10;

      const drillSummary = Object.entries(this._trainDrills).map(([pid, did]) => {
        const p = this._pool().find(x=>x.id===pid);
        const d = T.DRILLS[did];
        return p && d ? `<div class="briefing-row"><span>${p.name}</span><strong>${d.icon} ${d.label}</strong></div>` : '';
      }).join('');

      this._openModal(`<div class="modal-box">
        <div class="modal-header"><div class="modal-icon">${focus.icon}</div><div><div class="modal-title">Confirm Session</div><div class="modal-sub">${focus.label} · ${intensity.label} intensity</div></div></div>
        <div class="modal-body">
          <div class="briefing-row"><span>Team focus</span><strong>${focus.label}</strong></div>
          <div class="briefing-row"><span>Intensity</span><strong>${intensity.label}</strong></div>
          <div class="briefing-row"><span>Sharpness after this session</span><strong>${sharpAfter}/5</strong></div>
          <div class="briefing-row"><span>Team injury risk</span><strong style="color:${teamRiskPct>2?'var(--orange)':'var(--t2)'}">${teamRiskPct}% per player</strong></div>
          ${drillCount?`<div class="briefing-row"><span>Individual drill risk</span><strong style="color:${drillRiskPct>2?'var(--orange)':'var(--t2)'}">+${drillRiskPct}% for assigned players</strong></div>`:''}
          ${drillCount?`<div style="margin-top:10px;font-size:12px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em">Individual Drills</div>${drillSummary}`:''}
          <p style="font-size:12px;color:var(--t3);margin-top:14px">Intense sessions build sharpness fastest but carry the highest chance of a training knock — exactly the trade-off a real coaching staff faces in an international week.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="DashboardUI._trainStep='drills';DashboardUI._renderTrainingModal()">◀ Back</button>
          <button class="btn btn-primary" onclick="DashboardUI._confirmTraining('${this._trainTaskId}')">Run Session</button>
        </div>
      </div>`);
      return;
    }
  },

  _selectTrainFocus(id) {
    this._trainFocus = id;
    this._renderTrainingModal();
  },
  _selectTrainIntensity(id) {
    this._trainIntensity = id;
    this._renderTrainingModal();
  },
  _setIndividualDrill(playerId, drillId) {
    const T = window.Training;
    if (!drillId) { delete this._trainDrills[playerId]; this._renderTrainingModal(); return; }
    const currentCount = Object.keys(this._trainDrills).filter(k => k !== playerId).length;
    if (currentCount >= T.MAX_INDIVIDUAL_DRILLS) {
      // Already at the cap and this is a NEW assignment — ignore silently,
      // the dropdown will just revert to nothing on next render.
      delete this._trainDrills[playerId];
      this._renderTrainingModal();
      return;
    }
    this._trainDrills[playerId] = drillId;
    this._renderTrainingModal();
  },

  _confirmTraining(taskId){
    const T = window.Training;
    if (!T || !this._trainFocus) return;

    State.set('campaign.trainingFocus', this._trainFocus);
    State.set('campaign.trainingIntensity', this._trainIntensity);
    State.set('campaign.individualDrills', this._trainDrills);

    // Build sharpness for this focus, decay the others.
    T.recordSession(this._trainFocus);

    // Resolve injury risk ONCE, right now, exactly like a real
    // training-ground injury announcement — not a hidden background roll.
    const injured = T.resolveInjuryRisk(this._trainIntensity, Object.keys(this._trainDrills));

    const focus = T.TEAM_FOCUS[this._trainFocus];
    let summary = `${focus.label} (${T.INTENSITY[this._trainIntensity].label} intensity).`;
    if (injured.length) {
      summary += ` ⚠ ${injured.map(i=>i.name).join(', ')} ${injured.length>1?'were':'was'} injured in training.`;
    }
    this._completeTask(taskId, summary);

    if (injured.length) {
      // Surface this distinctly — a training injury is bad news the
      // manager should clearly register, not just a quiet log entry.
      setTimeout(() => {
        alert(`Training injury: ${injured.map(i=>`${i.name} (${i.cause})`).join(', ')}.\nThey will be unavailable for the next match.`);
      }, 50);
    }
  },

  // ── BUILD-UP SCOUTING PHASE ──────────────────────────────────────────────
  // A real, limited choice — the manager picks up to `task.scoutSlots` club
  // fixtures to attend out of whatever's actually on, scouting whichever
  // players are tagged to that match. This is what makes "who do I
  // scout" an actual decision rather than something unlimited: every
  // fixture you don't attend is real opportunity cost, and the slot count
  // itself is set by buildup.js from the genuine calendar gap since your
  // last match — you only get this phase at all when there's been enough
  // real time for the manager to plausibly go and watch club football.
  _openScoutingPhase(task) {
    this._scoutPhaseSelected = this._scoutPhaseSelected || [];
    this._scoutPhaseTaskId = task.id;
    this._renderScoutingPhase();
  },

  _renderScoutingPhase() {
    const task = this._tasks.find(t => t.id === this._scoutPhaseTaskId) || {};
    const slots = task.scoutSlots || 1;
    const fixtures = window.getScoutingFixtures ? window.getScoutingFixtures() : [];
    const pool = this._pool();
    const selected = this._scoutPhaseSelected;

    this._openModal(`<div class="modal-box wide">
      <div class="modal-header"><div class="modal-icon">🔍</div><div>
        <div class="modal-title">Scouting Trips</div>
        <div class="modal-sub">Pick up to ${slots} club fixture${slots>1?'s':''} to attend before the squad is announced. (${selected.length}/${slots} selected)</div>
      </div></div>
      <div class="modal-body" style="max-height:55vh;overflow-y:auto">
        ${fixtures.length ? fixtures.map(m => {
          const isSel = selected.includes(m.id);
          const d = new Date(m.date);
          const ds = isNaN(d) ? m.date : d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
          const targets = (m.players||[]).map(pid => pool.find(p=>p.id===pid)).filter(Boolean);
          const alreadyKnown = targets.filter(p => (State.get('campaign.playerScoutCount')||{})[p.id] >= 3);
          return `<div class="scout-card${isSel?' selected':''}" id="stask-${m.id}" onclick="DashboardUI._toggleScoutPhasePick('${m.id}')">
            <div class="scout-match">${m.homeTeam} vs ${m.awayTeam}</div>
            <div class="scout-info">${m.venue||''} · ${ds}</div>
            <div class="scout-targets"><span style="font-size:13px;color:var(--t3);margin-right:6px">Watch:</span>
              ${targets.map(p => `<span class="scout-chip${alreadyKnown.includes(p)?' known':''}">${p.name}${alreadyKnown.includes(p)?' ★':''}</span>`).join('') || '<span style="color:var(--t4);font-size:12px">No notable prospects in this one.</span>'}
            </div>
          </div>`;
        }).join('') : `<p style="color:var(--t3);padding:20px;text-align:center">No club fixtures available to scout this window.</p>`}
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="DashboardUI._skipScoutingPhase()">Skip This Time</button>
        <button class="btn btn-primary" onclick="DashboardUI._confirmScoutingPhase()">Confirm ${selected.length?`(${selected.length})`:''}</button>
      </div>
    </div>`);
  },

  _toggleScoutPhasePick(matchId) {
    const task = this._tasks.find(t => t.id === this._scoutPhaseTaskId) || {};
    const slots = task.scoutSlots || 1;
    const idx = this._scoutPhaseSelected.indexOf(matchId);
    if (idx >= 0) {
      this._scoutPhaseSelected.splice(idx, 1);
    } else {
      if (this._scoutPhaseSelected.length >= slots) {
        this._scoutPhaseSelected.shift();
      }
      this._scoutPhaseSelected.push(matchId);
    }
    this._renderScoutingPhase();
  },

  _skipScoutingPhase() {
    this._scoutPhaseSelected = [];
    this._completeTask(this._scoutPhaseTaskId, 'No scouting trips taken this window.');
  },

  _knowledgeLabel(kl) { return ['Unknown','Familiar','Scouted','Well Known'][kl] || 'Unknown'; },

  // Compares a player's knowledge tier before/after a scouting action and
  // describes exactly what became newly visible — reads the same tiers
  // the profile UI itself gates on (see _knowledgeLevel, _detailTab),
  // so the report can never claim something was "unlocked" that the
  // profile screens don't actually show yet.
  _scoutingUnlocks(before, after, pl) {
    const unlocks = [];
    if (before < 1 && after >= 1) unlocks.push('Player bio unlocked');
    if (before < 2 && after >= 2) unlocks.push(pl.traits?.length ? `Traits revealed: ${pl.traits.slice(0,3).join(', ')}` : 'Traits revealed');
    if (before < 3 && after >= 3) unlocks.push(pl.weaknesses?.length ? `Weaknesses identified: ${pl.weaknesses.join(', ')}` : 'Full attribute profile unlocked');
    return unlocks;
  },

  // Shared by the "Scouting Trips" build-up task and the Scouting
  // Centre's "Commission Report" button — previously neither gave any
  // real feedback beyond a one-line summary text (trips) or nothing at
  // all (commissioned reports); the underlying knowledge tier silently
  // changed with no visibility into what a manager had actually learned.
  _renderScoutingReport(entries, onClose) {
    const anyChange = entries.some(e => e.after > e.before);
    this._openModal(`<div class="modal-box">
      <div class="modal-header"><div class="modal-icon">🔍</div><div>
        <div class="modal-title">Scouting Report</div>
        <div class="modal-sub">${anyChange ? "Here's what your scouts found out." : 'No new ground broken this time — the file is unchanged.'}</div>
      </div></div>
      <div class="modal-body" style="max-height:55vh;overflow-y:auto">
        ${entries.map(e => {
          const unlocks = this._scoutingUnlocks(e.before, e.after, e.player);
          const leveledUp = e.after > e.before;
          return `<div class="scout-report-row">
            <div class="scout-report-row-head">
              <strong>${e.player.name}</strong>
              <span class="scout-report-level">${this._knowledgeLabel(e.before)}${leveledUp ? ` → <b class="scout-report-level-up">${this._knowledgeLabel(e.after)}</b>` : ' (no change)'}</span>
            </div>
            ${unlocks.length
              ? `<ul class="scout-report-unlocks">${unlocks.map(u=>`<li>${u}</li>`).join('')}</ul>`
              : `<p class="scout-report-none">Watched again — nothing new to report yet.</p>`}
          </div>`;
        }).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="DashboardUI._closeScoutingReport()">Continue</button>
      </div>
    </div>`);
    this._pendingScoutReportClose = onClose;
  },

  _closeScoutingReport() {
    const cb = this._pendingScoutReportClose;
    this._pendingScoutReportClose = null;
    this._closeModal();
    if (cb) cb();
  },

  _confirmScoutingPhase() {
    const fixtures = window.getScoutingFixtures ? window.getScoutingFixtures() : [];
    const sc = JSON.parse(JSON.stringify(State.get('campaign.playerScoutCount') || {}));
    const reports = JSON.parse(JSON.stringify(State.get('campaign.scoutReports') || {}));
    const pool = this._pool();

    // Capture each targeted player's knowledge tier BEFORE anything
    // changes, so the report afterward can show exactly what moved —
    // not just that a scouting trip "happened."
    const targetIds = new Set();
    this._scoutPhaseSelected.forEach(matchId => {
      const m = fixtures.find(f => f.id === matchId);
      (m?.players || []).forEach(pid => targetIds.add(pid));
    });
    const before = {};
    targetIds.forEach(pid => {
      const p = pool.find(x => x.id === pid);
      if (p) before[pid] = this._knowledgeLevel(p);
    });

    const scoutedNames = [];
    this._scoutPhaseSelected.forEach(matchId => {
      const m = fixtures.find(f => f.id === matchId);
      if (!m) return;
      (m.players || []).forEach(pid => {
        sc[pid] = (sc[pid] || 0) + 1;
        const p = pool.find(x => x.id === pid);
        if (p) {
          reports[pid] = { notes: p.bio || `Watched live at ${m.homeTeam} vs ${m.awayTeam}.`, date: State.get('campaign.campaignDate') };
          scoutedNames.push(p.name);
        }
      });
    });

    State.set('campaign.playerScoutCount', sc);
    State.set('campaign.scoutReports', reports);

    const summary = scoutedNames.length
      ? `Attended ${this._scoutPhaseSelected.length} fixture(s), learned more about: ${[...new Set(scoutedNames)].join(', ')}.`
      : 'No scouting trips taken this window.';
    const taskId = this._scoutPhaseTaskId;
    this._scoutPhaseSelected = [];

    if (!targetIds.size) {
      this._completeTask(taskId, summary);
      return;
    }

    // Knowledge levels are re-read fresh here (now that playerScoutCount
    // has actually been updated above), then the report is shown — the
    // underlying task only completes once the manager dismisses it.
    const entries = [...targetIds].map(pid => {
      const p = pool.find(x => x.id === pid);
      return p ? { player: p, before: before[pid] ?? 0, after: this._knowledgeLevel(p) } : null;
    }).filter(Boolean);

    this._renderScoutingReport(entries, () => this._completeTask(taskId, summary));
  },

  _openScoutTask(task){
    const pool=window.getScoutingFixtures ? window.getScoutingFixtures() : (window.SCOUTING_FIXTURES_1986||[]);
    this._scoutTaskSelected=null;
    this._openModal(`<div class="modal-box wide">
      <div class="modal-header"><div class="modal-icon">🔭</div><div><div class="modal-title">${task.title}</div><div class="modal-sub">Choose a club fixture to attend and observe England players.</div></div></div>
      <div class="modal-body">
        ${pool.map(m=>{
          const d=new Date(m.date); const ds=d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
          const targets=m.players.map(pid=>{const p=window.ALL_PLAYERS?.[pid]; return p?p.name:pid;});
          return `<div class="scout-card" id="stask-${m.id}" onclick="DashboardUI._selectScoutTask('${m.id}')">
            <div class="scout-match">${m.homeTeam} vs ${m.awayTeam}</div>
            <div class="scout-info">${m.venue} · ${ds}</div>
            <div class="scout-targets"><span style="font-size:13px;color:var(--t3);margin-right:6px">Watch:</span>
              ${targets.map(n=>`<span class="scout-chip">${n}</span>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="DashboardUI._closeModal()">Cancel</button>
        <button class="btn btn-primary" id="scout-task-confirm" disabled onclick="DashboardUI._confirmScoutTask('${task.id}')">Attend Match</button>
      </div>
    </div>`);
  },
  _selectScoutTask(id){
    document.querySelectorAll('.scout-card').forEach(el=>el.classList.remove('selected'));
    const el=document.getElementById('stask-'+id); if(el) el.classList.add('selected');
    this._scoutTaskSelected=id;
    const btn=document.getElementById('scout-task-confirm'); if(btn) btn.disabled=false;
  },
  _confirmScoutTask(taskId){
    const m=(window.SCOUTING_FIXTURES_1986||[]).find(x=>x.id===this._scoutTaskSelected);
    if(m){
      const sc=JSON.parse(JSON.stringify(State.get('campaign.playerScoutCount')||{}));
      m.players.forEach(pid=>{
        sc[pid]=(sc[pid]||0)+1;
        if(window.ALL_PLAYERS?.[pid]){window.ALL_PLAYERS[pid].scouted=true; window.ALL_PLAYERS[pid].scoutCount=(window.ALL_PLAYERS[pid].scoutCount||0)+1;}
      });
      State.set('campaign.playerScoutCount',sc);
    }
    this._completeTask(taskId,m?`Scouted ${m.homeTeam} vs ${m.awayTeam} at ${m.venue}.`:'Scouting complete.');
  },

  _openSquadAnnounce(task){
    const pool=this._pool(); const squadIds=State.get('squad.englandSquad')||[];
    let sel=new Set(squadIds);
    const MAX=23;
    const render=()=>{
      const body=document.getElementById('squad-ann-body'); if(!body) return;
      body.innerHTML=pool.map(p=>{
        const s=sel.has(p.id);
        const pc=UI.posClass(p.posG); const rc=UI.ratClass(p.rat);
        return `<div class="option-card" style="padding:12px 16px;${s?'border-color:var(--red);background:rgba(200,16,46,.08)':''}" onclick="DashboardUI._toggleAnn('${p.id}')">
          <span class="pos-badge ${pc}">${p.pos}</span>
          <div style="flex:1;font-family:var(--font-ui);font-size:15px;font-weight:600;color:var(--t1)">${p.name}</div>
          <span style="font-size:13px;color:var(--t3);margin-right:10px">${p.club||''}</span>
          <span class="rating ${rc}">${p.rat}</span>
          ${s?'<span style="color:var(--green);font-size:18px;margin-left:8px">✓</span>':''}
        </div>`;
      }).join('');
      const btn=document.getElementById('ann-confirm'); const cnt=document.getElementById('ann-count');
      if(btn) btn.disabled=sel.size<11||sel.size>MAX;
      if(cnt) cnt.textContent=`${sel.size} / ${MAX} selected`;
    };
    this._annSel=sel;
    this._openModal(`<div class="modal-box wide">
      <div class="modal-header"><div class="modal-icon">📋</div><div><div class="modal-title">${task.title}</div><div class="modal-sub">Select up to 23 players for the squad announcement.</div></div></div>
      <div class="modal-body">
        <div style="font-family:var(--font-ui);font-size:14px;color:var(--t3);margin-bottom:14px" id="ann-count">${sel.size} / ${MAX} selected</div>
        <div id="squad-ann-body" class="option-grid"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="DashboardUI._closeModal()">Cancel</button>
        <button class="btn btn-primary" id="ann-confirm" disabled onclick="DashboardUI._confirmAnnounce('${task.id}')">Announce Squad</button>
      </div>
    </div>`);
    this._annRender=render; render();
  },
  _toggleAnn(id){ if(!this._annSel) return; if(this._annSel.has(id)) this._annSel.delete(id); else if(this._annSel.size<23) this._annSel.add(id); if(this._annRender) this._annRender(); },
  _confirmAnnounce(taskId){ State.set('squad.englandSquad',[...this._annSel]); this._completeTask(taskId,`Squad of ${this._annSel.size} players announced.`); },

  _openBoardMeeting(task){
    this._openModal(`<div class="modal-box">
      <div class="modal-header"><div class="modal-icon">🏛️</div><div><div class="modal-title">FA Board Meeting</div><div class="modal-sub">Lancaster Gate, London</div></div></div>
      <div class="modal-body">
        <p class="info-copy">The chairman outlines the board\'s expectations for the coming season.</p>
        <div class="expectation-card"><span>Primary Objective</span><h3>Tournament Qualification</h3><p>The FA expects England to qualify from the group stage of all competitions entered.</p></div>
        <div class="expectation-card"><span>Secondary Objective</span><h3>Positive Results</h3><p>Maintain a win rate above 50% across all matches, including friendlies.</p></div>
        <div class="expectation-card" style="border-left-color:var(--t3)"><span>Development</span><h3>Blood Young Talent</h3><p>Give opportunities to emerging players like Gascoigne, Adams and Walker.</p></div>
      </div>
      <div class="modal-footer"><button class="btn btn-primary" onclick="DashboardUI._completeTask('${task.id}','Board objectives received.')">Understood</button></div>
    </div>`);
  },

  // ── SQUAD TAB ────────────────────────────────────────────────────────────
  // NOTE: _renderSquad/_selectPlayer are defined again later in this file
  // (the "v21" squad tab, near the bottom) — that later definition is the
  // one that actually runs, since a plain JS object literal silently keeps
  // whichever same-named key comes last. The helpers below (_addXI,
  // _addBench, _removeSquad, etc.) are still genuinely shared and live,
  // called from both the add-player modal and the v21 squad tab.
  _addXI(id){
    const pl=this._pool().find(p=>p.id===id); if(!pl) return;
    let slots=(State.get('squad.slots')||new Array(11).fill(null)).map(p=>p&&p.id===id?null:p);
    while(slots.length<11) slots.push(null);
    let bench=(State.get('squad.bench')||[]).filter(p=>p&&p.id!==id);
    const empty=slots.findIndex(x=>!x);
    slots[empty>=0?empty:10]=pl;
    this._ensureSquadId(id);
    State.set('squad.slots',slots.slice(0,11)); State.set('squad.bench',bench.slice(0,5));
    this._renderSquad();
  },
  _addBench(id){
    const pl=this._pool().find(p=>p.id===id); if(!pl) return;
    let slots=(State.get('squad.slots')||[]).map(p=>p&&p.id===id?null:p);
    let bench=(State.get('squad.bench')||[]).filter(p=>p&&p.id!==id);
    if(bench.length<5) bench.push(pl); else bench[4]=pl;
    this._ensureSquadId(id);
    State.set('squad.slots',slots); State.set('squad.bench',bench);
    this._renderSquad();
  },
  _removeSquad(id){
    State.set('squad.englandSquad',(State.get('squad.englandSquad')||[]).filter(x=>x!==id));
    State.set('squad.slots',(State.get('squad.slots')||[]).map(p=>p&&p.id===id?null:p));
    State.set('squad.bench',(State.get('squad.bench')||[]).filter(p=>p&&p.id!==id));
    this._renderSquad();
  },
  _ensureSquadId(id){ const ids=State.get('squad.englandSquad')||[]; if(!ids.includes(id)) State.set('squad.englandSquad',ids.concat(id)); },

  _openAddModal(){ this._renderAddModal(); },
  _renderAddModal(){
    const root=document.getElementById('add-player-modal-root'); if(!root) return;
    const squadIds=State.get('squad.englandSquad')||[];
    const f=this._addFilters;
    let list=this._pool().filter(p=>!squadIds.includes(p.id));
    const q=(f.search||'').toLowerCase();
    if(q) list=list.filter(p=>(p.name||'').toLowerCase().includes(q)||(p.club||'').toLowerCase().includes(q));
    if(f.pos!=='ALL') list=list.filter(p=>p.posG===f.pos||p.pos===f.pos);
    if(+f.minRating) list=list.filter(p=>(p.rat||0)>= +f.minRating);
    if(+f.maxAge<99) list=list.filter(p=>(p.age||99)<= +f.maxAge);
    list.sort((a,b)=>f.sort==='age'?(a.age||99)-(b.age||99):f.sort==='readiness'?this._readiness(b)-this._readiness(a):(b.rat||0)-(a.rat||0));
    root.innerHTML=`<div class="modal-overlay" onclick="DashboardUI._closeAddModal()"><div class="modal-box wide" onclick="event.stopPropagation()" style="max-height:88vh">
      <div class="modal-header"><div class="modal-icon">➕</div><div><div class="modal-title">Add Players to Squad</div><div class="modal-sub">Search eligible England players</div></div><button class="btn btn-ghost" style="margin-left:auto;height:36px;font-size:12px" onclick="DashboardUI._closeAddModal()">✕ Close</button></div>
      <div style="padding:14px 20px;border-bottom:1px solid var(--border);background:var(--bg3);display:flex;gap:10px;flex-wrap:wrap">
        <input style="flex:1;min-width:160px;height:38px;background:var(--bg4);border:1px solid var(--border);color:var(--t1);font-family:var(--font-body);font-size:15px;padding:0 12px;outline:none" placeholder="Search name or club..." value="${f.search||''}" oninput="DashboardUI._addFilters.search=this.value;DashboardUI._renderAddModal()">
        <select style="height:38px;background:var(--bg4);border:1px solid var(--border);color:var(--t1);font-family:var(--font-ui);padding:0 10px;outline:none" onchange="DashboardUI._addFilters.pos=this.value;DashboardUI._renderAddModal()">${['ALL','GK','DEF','MID','FWD'].map(x=>`<option ${f.pos===x?'selected':''}>${x}</option>`).join('')}</select>
        <select style="height:38px;background:var(--bg4);border:1px solid var(--border);color:var(--t1);font-family:var(--font-ui);padding:0 10px;outline:none" onchange="DashboardUI._addFilters.minRating=this.value;DashboardUI._renderAddModal()">${[0,65,70,75,80,85,90].map(x=>`<option value="${x}" ${+f.minRating===x?'selected':''}>${x?'Rating '+x+'+':'Any rating'}</option>`).join('')}</select>
        <select style="height:38px;background:var(--bg4);border:1px solid var(--border);color:var(--t1);font-family:var(--font-ui);padding:0 10px;outline:none" onchange="DashboardUI._addFilters.sort=this.value;DashboardUI._renderAddModal()">${[['rating','Sort: Rating'],['readiness','Sort: Readiness'],['age','Sort: Age']].map(([v,l])=>`<option value="${v}" ${f.sort===v?'selected':''}>${l}</option>`).join('')}</select>
      </div>
      <div style="flex:1;overflow-y:auto;max-height:480px">
        <div style="display:grid;grid-template-columns:36px 36px 1fr 120px 50px 50px 70px 60px;align-items:center;padding:10px 20px;background:var(--bg3);border-bottom:1px solid var(--border);font-family:var(--font-ui);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--t3)">
          <span></span><span>Pos</span><span>Player</span><span>Club</span><span>Age</span><span>Caps</span><span>Rating</span><span>Ready</span>
        </div>
        ${list.slice(0,150).map(pl=>`<div style="display:grid;grid-template-columns:36px 36px 1fr 120px 50px 50px 70px 60px;align-items:center;padding:11px 20px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .1s" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''">
          <span style="font-family:var(--font-ui);font-size:12px;color:var(--gold)">${(pl.scouted||pl.scoutCount)?'★':''}</span>
          <span class="pos-badge ${UI.posClass(pl.posG)}">${pl.pos}</span>
          <div><div style="font-family:var(--font-ui);font-size:16px;font-weight:600;color:var(--t1)">${pl.name}</div><div style="font-size:13px;color:var(--t3)">${pl.bio?pl.bio.substring(0,50)+'…':pl.club||''}</div></div>
          <span style="font-size:14px;color:var(--t2)">${pl.club||'—'}</span>
          <span style="font-family:var(--font-ui);font-size:14px;color:var(--t3);text-align:center">${pl.age||'?'}</span>
          <span style="font-family:var(--font-ui);font-size:14px;color:var(--t3);text-align:center">${pl.caps||0}</span>
          <span style="font-family:var(--font-ui);font-size:16px;font-weight:800;color:var(--gold);text-align:center">${pl.rat||'—'}</span>
          <button style="background:var(--red);color:#fff;border:none;padding:6px 12px;font-family:var(--font-ui);font-size:12px;font-weight:700;cursor:pointer;letter-spacing:.05em" onclick="DashboardUI._ensureSquadId('${pl.id}');DashboardUI._selectedSquadPlayer='${pl.id}';DashboardUI._renderSquad();DashboardUI._renderAddModal()">Add</button>
        </div>`).join('')}
      </div>
    </div></div>`;
  },
  _closeAddModal(){ const r=document.getElementById('add-player-modal-root'); if(r) r.innerHTML=''; },

  // ── MORALE ───────────────────────────────────────────────────────────────
  _renderMorale(){
    const p=document.getElementById('dp-morale');
    if(p){p.style.display='flex';p.style.flexDirection='column';p.style.overflow='hidden';p.style.minHeight='0';}
    const squad=this._squad(); const morale=this._squadMorale();
    const mc=morale>=70?'var(--green)':morale>=45?'var(--gold)':'var(--red)';
    p.innerHTML=`
      <div class="match-centre-hero" style="margin:18px 24px 0">
        <div><div class="office-kicker">Dressing Room</div>
          <div class="office-match" style="font-size:52px">Squad Morale: <span style="color:${mc}">${morale}</span></div>
          <p class="office-detail">The dressing room is <strong>${morale>=70?'positive and unified':morale>=45?'stable but watchful':'fragile and needs attention'}</strong>.</p>
        </div>
      </div>
      <div class="panel-scroll"><div class="mgmt-grid two" style="padding:16px 24px">
        <div class="dashboard-card">
          <div class="card-title-row"><span>Player Morale</span></div>
          ${squad.map(pl=>{const m=this._morale(pl);const per=this._personality(pl);return `<div class="mini-player-row">
            <span class="pos-badge ${UI.posClass(pl.posG)}">${pl.pos}</span>
            <div><strong>${pl.name}</strong><em>${per.type} · ${pl.club||''}</em></div>
            <div style="text-align:right"><strong style="font-family:var(--font-ui);font-size:18px;font-weight:800;color:${m>=70?'var(--green)':m>=45?'var(--gold)':'var(--red)'}">${m}</strong></div>
          </div>`}).join('')}
        </div>
        <div class="dashboard-card">
          <div class="card-title-row"><span>Dressing Room Actions</span></div>
          <p style="font-size:13px;color:var(--t2);margin-bottom:12px">Intervene to protect team cohesion before the next match.</p>
          ${[{t:'Individual Conversation',d:'Speak privately with the lowest-morale player. +8 for them, +1 squad.',fn:'_moraleConv()'},{t:'Team Meeting',d:'Address the squad collectively. Everyone +4 morale.',fn:'_moraleTeam()'},{t:'Rest Day',d:'Give the squad a day off. Everyone +3, tired players benefit most.',fn:'_moraleRest()'}]
          .map(a=>`<div onclick="DashboardUI.${a.fn}" style="padding:10px 14px;border:1px solid var(--border);border-radius:6px;cursor:pointer;margin-bottom:8px;transition:background .1s" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''">
            <div style="font-weight:700;color:var(--t1);margin-bottom:2px">${a.t}</div>
            <div style="font-size:12px;color:var(--t3)">${a.d}</div>
          </div>`).join('')}
          <div id="morale-feedback" style="font-size:13px;color:var(--green);margin-top:8px"></div>
        </div>
      </div></div>`;
  },

  _moraleConv(){
    const squad=this._squad();
    const morale=State.get('campaign.playerMorale')||{};
    const lowest=squad.slice().sort((a,b)=>(morale[a.id]||65)-(morale[b.id]||65))[0];
    if(lowest){ morale[lowest.id]=Math.min(100,(morale[lowest.id]||65)+8); squad.forEach(p=>{if(p.id!==lowest.id) morale[p.id]=Math.min(100,(morale[p.id]||65)+1);}); State.set('campaign.playerMorale',morale); }
    State.upd('campaign.boardConfidence',c=>Math.min(100,c+1));
    const fb=document.getElementById('morale-feedback');
    if(fb&&lowest) fb.textContent=`Conversation with ${lowest.name.split(' ').pop()} — morale improved.`;
  },
  _moraleTeam(){
    const squad=this._squad(); const morale=State.get('campaign.playerMorale')||{};
    squad.forEach(p=>{morale[p.id]=Math.min(100,(morale[p.id]||65)+4);}); State.set('campaign.playerMorale',morale);
    State.upd('campaign.boardConfidence',c=>Math.min(100,c+1));
    const fb=document.getElementById('morale-feedback'); if(fb) fb.textContent='Team meeting — squad cohesion improved.';
  },
  _moraleRest(){
    const squad=this._squad(); const morale=State.get('campaign.playerMorale')||{};
    squad.forEach(p=>{const boost=morale[p.id]<55?5:3; morale[p.id]=Math.min(100,(morale[p.id]||65)+boost);}); State.set('campaign.playerMorale',morale);
    const fb=document.getElementById('morale-feedback'); if(fb) fb.textContent='Rest day — the squad looks refreshed.';
  },

  // ── TACTICS ──────────────────────────────────────────────────────────────
  _renderTactics(){
    const p=document.getElementById('dp-tactics');
    if(p){p.style.display='flex';p.style.flexDirection='column';p.style.overflow='hidden';p.style.minHeight='0';}
    p.innerHTML=`<div class="panel-scroll"><div style="padding:24px"><h2 style="font-family:var(--font-ui);font-size:28px;font-weight:800;color:var(--t1);margin-bottom:8px">Tactics</h2>
      <p style="font-size:15px;color:var(--t2);margin-bottom:20px">Formation, team shape and individual player instructions.</p>
      <button class="btn btn-primary" onclick="TacticsUI.init();UI.show('screen-tactics')">Open Full Tactics Screen ▶</button>
      <div style="margin-top:24px;background:var(--bg2);border:1px solid var(--border);padding:20px">
        <div style="font-family:var(--font-ui);font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);margin-bottom:14px">Current Setup</div>
        ${[['Formation',State.get('campaign.tactics.formation')||'4-4-2'],['Mentality',State.get('campaign.tactics.mentality')||'Balanced'],['Pressing',State.get('campaign.tactics.press')||'Mid'],['Tempo',State.get('campaign.tactics.tempo')||'Normal'],['Width',State.get('campaign.tactics.width')||'Normal'],['Def. Line',State.get('campaign.tactics.defensive_line')||'Normal'],['Set Pieces',State.get('campaign.tactics.setpieces')||'Mixed']].map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)"><span style="font-size:15px;color:var(--t2)">${k}</span><strong style="font-family:var(--font-ui);font-size:16px;font-weight:700;color:var(--t1)">${v}</strong></div>`).join('')}
      </div>
    </div></div>`;
  },

  // ── SCOUTING ─────────────────────────────────────────────────────────────
  _renderScouting(){
    const p=document.getElementById('dp-scouting');
    if(p){p.style.display='flex';p.style.flexDirection='column';p.style.overflow='hidden';p.style.minHeight='0';}
    const pool=this._pool();
    const watchlist=State.get('campaign.watchlist')||[];
    const scoutReports=State.get('campaign.scoutReports')||{};
    const squadIds=new Set(State.get('squad.englandSquad')||[]);
    const topWatch = watchlist.map(id=>pool.find(x=>x.id===id)).filter(Boolean).sort((a,b)=>(b.rat||0)-(a.rat||0)).slice(0,6);
    const reportCount = Object.keys(scoutReports).length;

    p.innerHTML = `
      <div class="section-header" style="padding:18px 0 14px"><h2>Scouting Centre</h2><p>Search, scout, and call up players from the full player database.</p></div>
      <div class="scouting-summary-grid">
        <div class="dashboard-card" style="text-align:center;padding:20px">
          <div style="font-family:var(--font-ui);font-size:30px;font-weight:900;color:var(--t1)">${pool.length}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:4px">Eligible Players</div>
        </div>
        <div class="dashboard-card" style="text-align:center;padding:20px">
          <div style="font-family:var(--font-ui);font-size:30px;font-weight:900;color:var(--gold)">${watchlist.length}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:4px">On Watchlist</div>
        </div>
        <div class="dashboard-card" style="text-align:center;padding:20px">
          <div style="font-family:var(--font-ui);font-size:30px;font-weight:900;color:var(--green)">${reportCount}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:4px">Scout Reports Filed</div>
        </div>
        <div class="dashboard-card" style="text-align:center;padding:20px">
          <div style="font-family:var(--font-ui);font-size:30px;font-weight:900;color:var(--t1)">${squadIds.size}/26</div>
          <div style="font-size:12px;color:var(--t3);margin-top:4px">Squad Called Up</div>
        </div>
      </div>

      <button class="btn btn-primary" style="width:100%;height:52px;font-size:15px;margin:18px 0" onclick="PlayersUI.init('dashboard');UI.show('screen-players')">
        🔍 Open Player Database — Search, Filter, Compare, Call Up
      </button>

      <div class="dashboard-card">
        <div class="card-title-row"><span>Watchlist</span><strong>${watchlist.length}</strong></div>
        ${topWatch.length ? topWatch.map(pl=>`<div class="prospect-row" onclick="PlayersUI.init('dashboard');UI.show('screen-players');PlayersUI._selectPlayer('${pl.id}')">
          <span class="pos-badge ${UI.posClass(pl.posG)}">${pl.pos}</span>
          <div><strong>${pl.name}</strong><em>${pl.club||''}</em></div>
          <span class="rating ${UI.ratClass(pl.rat)}">${pl.rat}</span>
        </div>`).join('') : `<p style="color:var(--t3);padding:12px 0;font-size:14px;font-style:italic">No players on your watchlist yet. Open the database and click ☆ on a player to add them.</p>`}
      </div>`;
  },

  _scoutProfile(pl,reports){
    const kl=this._knowledgeLevel(pl);
    const klLabel=['Unknown','Familiar','Scouted','Well Known'][kl];
    const klColor=['var(--t3)','var(--t2)','var(--gold)','var(--green)'][kl];
    const a=pl.attrs||{}; const r=this._readiness(pl); const f=this._form(pl);
    const report=reports[pl.id];
    return `<div class="dashboard-card">
      <div class="scout-profile-top">
        <div><div class="office-kicker" style="color:${klColor}">${klLabel}</div><h2>${pl.name}</h2><p>${pl.pos} · ${pl.club||''} · Age ${pl.age||'?'} · ${pl.caps||0} caps</p></div>
        <div class="scout-grade">${pl.rat}</div>
      </div>
      <div class="scout-metrics">
        <div class="scout-metric"><div class="scout-metric-label">Readiness</div><div class="scout-metric-value">${r}</div><div class="scout-metric-bar"><i style="width:${r}%"></i></div></div>
        <div class="scout-metric"><div class="scout-metric-label">Form</div><div class="scout-metric-value">${f}</div><div class="scout-metric-bar"><i style="width:${f}%"></i></div></div>
        <div class="scout-metric"><div class="scout-metric-label">Potential</div><div class="scout-metric-value">${this._potential(pl)}</div><div class="scout-metric-bar"><i style="width:${this._potential(pl)}%"></i></div></div>
        <div class="scout-metric"><div class="scout-metric-label">Morale</div><div class="scout-metric-value">${this._morale(pl)}</div><div class="scout-metric-bar"><i style="width:${this._morale(pl)}%"></i></div></div>
      </div>
      ${kl>=1&&pl.bio?`<div class="scout-verdict"><strong>Scout Intelligence</strong><p>${pl.bio}</p></div>`:''}
      ${report?`<div class="completed-report"><strong>✓ Scout Report Filed</strong><p>${report.notes||'Report available.'}</p></div>`:`<div class="scout-actions"><button class="btn btn-primary btn-primary-sm" onclick="DashboardUI._commissionReport('${pl.id}')">Commission Report</button><button class="btn btn-ghost" style="height:40px;font-size:12px;padding:0 14px" onclick="DashboardUI._toggleWatch('${pl.id}')">Watchlist ★</button></div>`}
    </div>`;
  },

  _selectScout(id){ this._scoutSelectedId=id; this._renderScouting(); },
  _toggleWatch(id){
    const wl=State.get('campaign.watchlist')||[];
    State.set('campaign.watchlist',wl.includes(id)?wl.filter(x=>x!==id):[...wl,id]);
    this._renderScouting();
  },
  _commissionReport(id){
    const pl=this._pool().find(p=>p.id===id); if(!pl) return;
    const before = this._knowledgeLevel(pl);
    const reports=JSON.parse(JSON.stringify(State.get('campaign.scoutReports')||{}));
    const sc=JSON.parse(JSON.stringify(State.get('campaign.playerScoutCount')||{}));
    reports[id]={date:new Date().toISOString(),notes:`${pl.name} was observed closely. ${pl.bio||'A capable international player.'} Readiness: ${this._readiness(pl)}/99.`};
    sc[id]=(sc[id]||0)+1;
    if(pl) { pl.scouted=true; pl.scoutCount=(pl.scoutCount||0)+1; }
    if(window.ALL_PLAYERS?.[id]) { window.ALL_PLAYERS[id].scouted=true; window.ALL_PLAYERS[id].scoutCount=(window.ALL_PLAYERS[id].scoutCount||0)+1; }
    State.set('campaign.scoutReports',reports);
    State.set('campaign.playerScoutCount',sc);
    const after = this._knowledgeLevel(pl);
    this._renderScoutingReport([{ player: pl, before, after }], () => this._renderScouting());
  },
  _scoutFilter(){ this._renderScouting(); },
  _scoutMinRat(){ this._renderScouting(); },

  // ── MATCH CENTRE ─────────────────────────────────────────────────────────
  _renderMatchCentre(){
    const p=document.getElementById('dp-matchcentre');
    if(p){p.style.display='flex';p.style.flexDirection='column';p.style.overflow='hidden';p.style.minHeight='0';}
    const fix=this._fix(); const opp=this._opp(fix);
    const slots=State.get('squad.slots')||[];
    const bench=State.get('squad.bench')||[];
    const xiCount=slots.filter(Boolean).length;
    const oppRat=fix?window.getOppRating(opp,State.get('campaign.season')||1986):72;
    const readiness=Math.round(xiCount/11*50 + Math.min(50,(State.get('campaign.playerScoutCount')?(Object.values(State.get('campaign.playerScoutCount')).reduce((a,b)=>a+b,0)*3):0)));
    const tac=State.get('campaign.tactics')||{};
    const teamTalk=State.get('campaign.lastTeamTalk');
    p.innerHTML=`
      <div class="match-centre-hero" style="margin:18px 24px 0">
        <div class="upgraded-match-centre">
          <div>
            <div class="office-kicker">Match Centre</div>
            <div class="office-match">${fix?(fix.homeTeam==='England'?`<span>England</span> vs ${opp}`:`${fix.homeTeam} vs <span>England</span>`):'No fixture'}</div>
            <p class="office-detail">${fix?`${fix.comp} · ${fix.venue} · ${this._fmtDate(fix.date)}`:''}</p>
          </div>
          <div class="readiness-block">
            <div class="readiness-label">Readiness</div>
            <div class="readiness-score">${Math.min(99,readiness)}%</div>
            <div class="readiness-bar"><div style="width:${Math.min(99,readiness)}%"></div></div>
          </div>
          ${(()=>{
            const fix = window.ALL_FIXTURES[State.get('campaign.fixtureIdx')];
            if (!fix) return '';
            const opp = fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam;
            const oppRat = fix.oppRating || 75;
            const isHome = fix.homeTeam === 'England';
            const diffLabel = oppRat >= 85 ? '🔴 Very Strong' : oppRat >= 78 ? '🟠 Strong' : oppRat >= 70 ? '🟡 Mid-table' : '🟢 Weaker side';
            const hist = fix.historicResult;
            const histLine = hist ? `Historical result: ${fix.homeTeam} ${hist.home}-${hist.away} ${fix.awayTeam}` : 'First encounter';
            return `<div style="background:var(--bg2);border-radius:8px;padding:12px 14px;margin-bottom:12px;font-size:13px">
              <div style="font-weight:700;color:var(--t1);margin-bottom:6px">📋 Scout Report</div>
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="color:var(--t3)">Opposition</span>
                <span style="font-weight:600">${opp}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="color:var(--t3)">Strength</span>
                <span>${diffLabel} (${oppRat})</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="color:var(--t3)">Venue</span>
                <span>${isHome ? '🏟 Home' : '✈ Away'} — ${fix.venue || 'TBC'}</span>
              </div>
              <div style="font-size:11px;color:var(--t3);margin-top:6px;font-style:italic">${histLine}</div>
            </div>`;
          })()}
          <button class="btn btn-primary match-kickoff-btn" onclick="DashboardUI.goToSquad()">Select XI ▶</button>
        </div>
      </div>
      <div class="match-prep-grid">
        <div class="dashboard-card">
          <div class="card-title-row"><span>Opposition Report</span><strong>${opp}</strong></div>
          <div class="opponent-summary">
            <div class="opponent-rating">${oppRat}</div>
            <div><h3>${opp}</h3><p>${this._oppDescription(opp,oppRat)}</p></div>
          </div>
          <div class="opponent-bars">
            ${this._reportBar('Attack',Math.round(oppRat*.95))}
            ${this._reportBar('Defence',Math.round(oppRat*.9))}
            ${this._reportBar('Pace',Math.round(oppRat*.85))}
          </div>
        </div>
        <div class="dashboard-card">
          <div class="card-title-row"><span>Starting XI</span><strong>${xiCount}/11</strong></div>
          <div class="match-lineup-list">
            ${Array.from({length:11}).map((_,i)=>{const pl=slots[i]; return `<div class="${pl?'':'missing'}"><span>${i+1}</span><strong>${pl?pl.name:'Empty slot'}</strong><em>${pl?pl.pos:''}</em></div>`}).join('')}
          </div>
        </div>
        <div class="dashboard-card">
          <div class="card-title-row"><span>Tactical Briefing</span></div>
          <div class="briefing-board">
            ${[['Formation',tac.formation||'4-4-2'],['Mentality',tac.mentality||'Balanced'],['Press',tac.press||'Mid'],['Tempo',tac.tempo||'Normal'],['Def. Line',tac.defensive_line||'Normal'],
               ['Training',(() => {
                 const fId = State.get('campaign.trainingFocus');
                 if (!fId || !window.Training) return 'Not set';
                 const f = window.Training.TEAM_FOCUS[fId];
                 const sharp = window.Training.getSharpness(fId);
                 const intensity = window.Training.INTENSITY[State.get('campaign.trainingIntensity')||'standard'];
                 return `${f?.label||fId} · ${intensity?.label||''}${sharp>0?` · Sharpness ${sharp}/5`:''}`;
               })()]].map(([k,v])=>`<div class="briefing-row"><span>${k}</span><strong>${v}</strong></div>`).join('')}
          </div>
          <div class="briefing-actions">
            <button class="btn btn-ghost" style="height:38px;font-size:12px" onclick="TacticsUI.init();UI.show('screen-tactics')">Edit Tactics</button>
          </div>
        </div>
      </div>
      <div class="match-prep-grid lower">
        <div class="dashboard-card">
          <div class="card-title-row"><span>Team Talk</span></div>
          <div class="teamtalk-options">
            ${[{id:'inspire',t:'Inspire',d:'Fire them up. High energy, expect maximum effort.'},
               {id:'calm',t:'Stay Calm',d:'Focused and disciplined. Trust the preparation.'},
               {id:'tactical',t:'Tactical',d:'Detailed instructions. Every player knows their job.'},
               {id:'freedom',t:'Express Yourselves',d:'Play with freedom. Enjoy the occasion.'}
            ].map(o=>`<button class="teamtalk-card${teamTalk===o.id?' selected':''}" onclick="DashboardUI._teamTalk('${o.id}')"><strong>${o.t}</strong><span>${o.d}</span></button>`).join('')}
          </div>
        </div>
        <div class="dashboard-card">
          <div class="card-title-row"><span>Bench</span><strong>${bench.length}/5</strong></div>
          ${bench.map(pl=>`<div class="mini-player-row"><span class="pos-badge ${UI.posClass(pl.posG)}">${pl.pos}</span><div><strong>${pl.name}</strong><em>${pl.club||''}</em></div><span class="rating ${UI.ratClass(pl.rat)}">${pl.rat}</span></div>`).join('')}
          ${!bench.length?`<p style="color:var(--t3);font-size:14px;padding:12px 0">No bench players selected.</p>`:''}
        </div>
      </div>
      ${(()=>{
        const qual=State.get('campaign.qualifier');
        const grp=qual&&window.QUALIFIER_GROUPS&&window.QUALIFIER_GROUPS[qual.key];
        if(!grp) return '';
        const completed=new Set(qual.completedFixtureIds||[]);
        const rows=grp.fixtures.map(f=>{
          const isDone=completed.has(f.id);
          const isEng=f.home==='England'||f.away==='England';
          const qualRes=qual.results&&qual.results[f.id];
          let scoreStr='';
          if(qualRes){
            scoreStr=`${qualRes.home}–${qualRes.away}`;
          } else {
            const d=new Date(f.date);scoreStr=d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
          }
          return `<div style="display:flex;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;${isEng?'font-weight:700;':'font-weight:400;'}color:${isEng?'var(--t1)':'var(--t2)'}">
            <span style="flex:1;text-align:right;padding-right:8px">${f.home}</span>
            <span style="min-width:60px;text-align:center;color:var(--t3);font-size:12px">${scoreStr}</span>
            <span style="flex:1;padding-left:8px">${f.away}</span>
          </div>`;
        }).join('');
        return `<div class="dashboard-card" style="margin:0 0">
          <div class="card-title-row"><span>Group Fixtures — ${grp.group}</span></div>
          ${rows}
        </div>`;
      })()}
      `;
  },

  _oppDescription(opp,rat){
    if(rat>=90) return `${opp} are a world class side. Expect to be under pressure for large parts of the match.`;
    if(rat>=80) return `${opp} are a strong opposition. They will be organised and dangerous on the break.`;
    if(rat>=70) return `${opp} are a solid side. England should be confident but not complacent.`;
    return `${opp} are expected to defend deep. England must be patient and creative to break them down.`;
  },
  _renderResults() {
    const el = document.getElementById('dp-results');
    if (!el) return;
    const history = State.get('campaign.matchHistory2') || [];

    if (!history.length) {
      el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--t3)">
        <div style="font-size:32px;margin-bottom:12px">📋</div>
        <div style="font-size:15px">No matches played yet</div>
        <div style="font-size:13px;margin-top:6px">Results will appear here after your first match</div>
      </div>`;
      return;
    }

    const rows = [...history].reverse().map((m, i) => {
      const outcomeColor = {win:'var(--green)',draw:'var(--gold)',loss:'var(--red)'}[m.outcome];
      const outcomeChar  = {win:'W',draw:'D',loss:'L'}[m.outcome];
      const date = m.date ? new Date(m.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '';
      return `
        <div class="result-row" onclick="DashboardUI._viewResult(${history.length-1-i})" style="cursor:pointer">
          <div class="rr-outcome" style="background:${outcomeColor}">${outcomeChar}</div>
          <div class="rr-info">
            <div class="rr-teams">England vs ${m.opp||'Unknown'}</div>
            <div class="rr-meta">${m.comp||''} · ${date}</div>
          </div>
          <div class="rr-score">${m.score?.eng ?? 0} – ${m.score?.opp ?? 0}</div>
          <div class="rr-chevron">›</div>
        </div>`;
    }).join('');

    // Season record
    const rec = State.get('campaign.record') || {};
    el.innerHTML = `
      <div class="results-record">
        <div class="rr-stat"><div class="rr-num" style="color:var(--green)">${rec.w||0}</div><div class="rr-lbl">Won</div></div>
        <div class="rr-stat"><div class="rr-num" style="color:var(--gold)">${rec.d||0}</div><div class="rr-lbl">Drawn</div></div>
        <div class="rr-stat"><div class="rr-num" style="color:var(--red)">${rec.l||0}</div><div class="rr-lbl">Lost</div></div>
        <div class="rr-stat"><div class="rr-num">${rec.gf||0}</div><div class="rr-lbl">GF</div></div>
        <div class="rr-stat"><div class="rr-num">${rec.ga||0}</div><div class="rr-lbl">GA</div></div>
      </div>
      <div class="results-list">${rows}</div>`;
  },

  _viewResult(idx) {
    const history = State.get('campaign.matchHistory2') || [];
    const match = history[idx];
    if (!match) return;
    const fix = window.ALL_FIXTURES[match.fixIdx] || {};
    window.ResultUI.init({
      fix, opp: match.opp,
      score: match.score || {eng:0,opp:0},
      scorers: match.scorers || {eng:[],opp:[]},
      stats: match.stats || {},
      ratings: match.ratings || {},
      outcome: match.outcome,
    });
  },

  _nextQualCycle() {
    // Start the next qualifying cycle after a failed qualification
    const qual = State.get('campaign.qualifier');
    if (!qual) return;
    if (window.CampaignPhase) {
      State.upd('campaign.boardConfidence', c => Math.max(0, (c||60) - 15));
      const result = window.CampaignPhase.startNextCycle(qual.tournKey);
      if (!result) {
        State.set('campaign.phase', 'complete');
      }
    }
    this.init();
  },

  _mediaLine() {
    const record = State.get('campaign.record') || {};
    const history = State.get('campaign.matchHistory') || [];
    const recent5 = history.slice(-5);
    const conf = State.get('campaign.boardConfidence') || 60;

    // Last 5 results
    const wins   = recent5.filter(r=>r==='W').length;
    const losses = recent5.filter(r=>r==='L').length;

    let sentiment, colour, headline;
    if (recent5.length === 0) {
      sentiment = 'neutral'; colour = 'var(--t3)';
      headline = 'The nation waits to see what this manager can do.';
    } else if (wins >= 4) {
      sentiment = 'very positive'; colour = '#1D9E75';
      headline = conf >= 80
        ? 'England unstoppable — manager hailed as a genius.'
        : 'Brilliant run of form — England looking like contenders.';
    } else if (wins >= 3) {
      sentiment = 'positive'; colour = '#1D9E75';
      headline = 'England in fine form — supporters in good spirits.';
    } else if (losses >= 3) {
      sentiment = 'very negative'; colour = '#E24B4A';
      headline = conf < 30
        ? 'CRISIS — calls for manager to resign grow louder.'
        : 'Under pressure — question marks over the manager\u2019s future.';
    } else if (losses >= 2) {
      sentiment = 'negative'; colour = '#E24B4A';
      headline = 'Disappointing run — the media are circling.';
    } else {
      sentiment = 'mixed'; colour = 'var(--t2)';
      headline = 'Inconsistent England — fans divided on direction.';
    }

    // Form icons
    const formIcons = recent5.map(r =>
      `<span style="width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;background:${r==='W'?'rgba(29,158,117,0.2)':r==='L'?'rgba(226,75,74,0.2)':'rgba(130,130,130,0.2)'};color:${r==='W'?'#1D9E75':r==='L'?'#E24B4A':'var(--t2)'}">${r}</span>`
    ).join('');

    return `<div style="font-size:12px;color:${colour};line-height:1.4">
      <div style="font-style:italic;margin-bottom:4px">"${headline}"</div>
      ${recent5.length ? `<div style="display:flex;gap:3px;margin-top:2px">${formIcons}</div>` : ''}
    </div>`;
  },

  // ── SACKING DECISION ──────────────────────────────────────────────────────
  _showSackingDecision(risk) {
    const manager = State.get('meta.manager') || 'Manager';
    const record  = State.get('campaign.record') || {};
    const played  = (record.w||0)+(record.d||0)+(record.l||0);

    const old = document.getElementById('sacking-overlay');
    if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'sacking-overlay';
    // Deliberately not dismissable by clicking outside — this decision
    // needs a deliberate choice, not an accidental dismissal.
    el.style.cssText = 'position:fixed;inset:0;background:rgba(8,8,10,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    el.innerHTML = `<div style="background:var(--bg);border:1px solid var(--border2);border-radius:16px;padding:36px;max-width:480px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,.6);text-align:center">
      <div style="font-size:36px;margin-bottom:10px">📰</div>
      <div style="font-family:var(--font-ui);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--red);margin-bottom:10px">FA Statement</div>
      <div style="font-size:22px;font-weight:800;color:var(--t1);margin-bottom:14px">${risk.headline}</div>
      <p style="font-size:14px;color:var(--t2);line-height:1.6;margin-bottom:8px">${risk.detail}</p>
      <p style="font-size:13px;color:var(--t3);margin-bottom:22px">${manager} leaves the role after ${played} games in charge.</p>
      <div id="sacking-successor-form" style="display:none;text-align:left;margin-bottom:18px">
        <label style="font-size:12px;color:var(--t3);display:block;margin-bottom:6px">New manager's name</label>
        <input id="sacking-new-name" type="text" maxlength="40" placeholder="Enter a name"
          onkeydown="if(event.key==='Enter')DashboardUI._sackingContinueAsSuccessor()"
          style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--bg2);color:var(--t1);font-size:14px;box-sizing:border-box">
      </div>
      <div id="sacking-decision-buttons" style="display:flex;flex-direction:column;gap:10px">
        <button onclick="DashboardUI._sackingShowSuccessorForm()"
          style="padding:14px;background:var(--red);color:#fff;border:none;border-radius:8px;font-family:var(--font-ui);font-size:14px;font-weight:800;cursor:pointer;letter-spacing:.04em">
          Appoint a Successor — Continue This Career
        </button>
        <button onclick="DashboardUI._sackingQuitToMenu()"
          style="padding:14px;background:transparent;color:var(--t3);border:1px solid var(--border2);border-radius:8px;font-family:var(--font-ui);font-size:13px;font-weight:700;cursor:pointer">
          End Career — Return to Main Menu
        </button>
      </div>
      <p style="font-size:11px;color:var(--t4);margin-top:18px">Appointing a successor keeps your squad and history intact — only the manager and board relationship are reset.</p>
    </div>`;
    document.body.appendChild(el);
  },

  _sackingShowSuccessorForm() {
    const form = document.getElementById('sacking-successor-form');
    const buttons = document.getElementById('sacking-decision-buttons');
    if (form) form.style.display = 'block';
    if (buttons) buttons.innerHTML = `
      <button onclick="DashboardUI._sackingContinueAsSuccessor()"
        style="padding:14px;background:var(--red);color:#fff;border:none;border-radius:8px;font-family:var(--font-ui);font-size:14px;font-weight:800;cursor:pointer;letter-spacing:.04em">
        Confirm New Manager
      </button>
      <button onclick="DashboardUI._sackingQuitToMenu()"
        style="padding:14px;background:transparent;color:var(--t3);border:1px solid var(--border2);border-radius:8px;font-family:var(--font-ui);font-size:13px;font-weight:700;cursor:pointer">
        End Career — Return to Main Menu
      </button>`;
    const input = document.getElementById('sacking-new-name');
    if (input) input.focus();
  },

  _sackingContinueAsSuccessor() {
    const overlay = document.getElementById('sacking-overlay');
    const input = document.getElementById('sacking-new-name');
    const newName = (input && input.value.trim()) || 'New Manager';
    if (overlay) overlay.remove();

    State.set('meta.manager', newName);

    // Reset the board relationship completely — a new manager starts with
    // a clean slate of trust, that's the whole point of a succession.
    State.set('campaign.boardConfidence', 60);
    State.set('campaign.pendingSackingCheck', null);

    // Squad, tournament history, match history, player stats, caps/goals —
    // all of it persists deliberately. The team's achievements and depth
    // were built by the previous manager's work and the players themselves;
    // none of that should evaporate just because the man in the dugout has
    // changed, exactly like a real international set-up.

    // If qualifying had failed, a successor needs the next cycle started —
    // mirrors the existing "Continue to Next Campaign" recovery path.
    const phase = State.get('campaign.phase');
    if (phase === 'failed_qual') {
      const qual = State.get('campaign.qualifier');
      if (qual && window.CampaignPhase) {
        window.CampaignPhase.startNextCycle(qual.tournKey);
      }
    }

    this.init();
  },

  _sackingQuitToMenu() {
    const overlay = document.getElementById('sacking-overlay');
    if (overlay) overlay.remove();
    State.set('campaign.pendingSackingCheck', null);
    // A clean break — the career genuinely ends here. Show the existing
    // career summary screen first so the reign's record is acknowledged,
    // then return to the menu when the player closes it.
    this.showCareerSummary(true);
  },

  showCareerSummary(returnToMenu) {
    const history  = State.get('campaign.tournamentHistory') || [];
    const stats    = State.get('campaign.playerStats') || {};
    const record   = State.get('campaign.record') || {};
    const manager  = State.get('meta.manager') || 'Manager';
    const pool     = State.get('squad.pool') || [];

    const topScorer = pool.map(p => ({
      name: p.name, goals: stats[p.id]?.goals || 0
    })).sort((a,b) => b.goals - a.goals)[0];

    const topCapped = pool.map(p => ({
      name: p.name, caps: stats[p.id]?.caps || 0
    })).sort((a,b) => b.caps - a.caps)[0];

    const wins = history.filter(h => h.winner).length;
    const finals = history.filter(h => h.reached === 'final').length;
    const totalPlayed = (record.w||0)+(record.d||0)+(record.l||0);
    const reachLabels = {winner:'🏆 Champions',final:'Runner-up',sf:'Semi-final',qf:'Quarter-final',r16:'Round of 16',group:'Group stage'};

    const verdict = wins >= 2 ? 'A legendary reign — England conquered Europe and the world.' :
                    wins >= 1 ? 'A golden era — you brought the trophy home.' :
                    finals >= 2 ? 'So close, so many times. A generation defined by near-misses.' :
                    finals >= 1 ? 'A final appearance — the nation dared to dream.' :
                    record.w > record.l ? 'Steady progress — England are moving in the right direction.' :
                    'A difficult tenure. The next man inherits a rebuilding job.';

    const el = document.createElement('div');
    el.id = 'career-summary-overlay';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    el.innerHTML = `<div style="background:var(--bg);border-radius:16px;padding:32px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.5)">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:32px;margin-bottom:8px">🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
        <div style="font-size:24px;font-weight:800;color:var(--t1);margin-bottom:4px">${manager}</div>
        <div style="font-size:14px;color:var(--t3)">End of Career Summary</div>
      </div>
      <div style="font-size:15px;font-style:italic;color:var(--t2);text-align:center;margin-bottom:20px;padding:12px;background:var(--bg2);border-radius:8px">"${verdict}"</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
        ${[
          ['Tournaments', `${history.length} played`],
          ['Trophies', wins + (wins===1?' title':' titles')],
          ['Finals reached', finals],
          ['Matches managed', totalPlayed],
          ['Wins', record.w||0],
          ['Win rate', totalPlayed ? Math.round((record.w||0)/totalPlayed*100)+'%' : '—'],
          ['Top scorer', topScorer?.name || '—'],
          ['Most capped', topCapped?.name || '—'],
        ].map(([l,v])=>`<div style="background:var(--bg2);border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:11px;color:var(--t3);margin-bottom:3px">${l}</div>
          <div style="font-size:16px;font-weight:700;color:var(--t1)">${v}</div>
        </div>`).join('')}
      </div>
      ${history.length ? `<div style="margin-bottom:20px">
        <div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:8px">Tournament record</div>
        ${history.map(h=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px">
          <span>${window.TOURNAMENTS?.[h.tournKey]?.name||h.tournKey} ${h.year||''}</span>
          <span style="color:${h.winner?'var(--gold)':h.reached==='final'?'var(--green)':'var(--t3)'}">${h.winner?'🏆 Champions':reachLabels[h.reached]||h.reached}</span>
        </div>`).join('')}
      </div>` : ''}
      <button onclick="DashboardUI._closeCareerSummary(${returnToMenu ? 'true' : 'false'})" style="width:100%;padding:12px;background:var(--blue,#378ADD);color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer">${returnToMenu ? 'Return to Main Menu' : 'Close'}</button>
    </div>`;
    document.body.appendChild(el);
    el.addEventListener('click', e => { if(e.target===el && !returnToMenu) el.remove(); });
  },

  _closeCareerSummary(returnToMenu) {
    const el = document.getElementById('career-summary-overlay');
    if (el) el.remove();
    if (returnToMenu && window.MenuUI) {
      window.MenuUI.init();
      UI.show('screen-menu');
    }
  },

  _tournamentBanner(key) {
    const t = window.TOURNAMENTS?.[key];
    if (!t) return '';
    return `<div style="margin:0 0 8px;padding:10px 14px;background:rgba(55,138,221,0.08);border-radius:8px;border-left:3px solid var(--blue,#378ADD);display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--blue,#378ADD);margin-bottom:2px">Current Tournament</div>
        <div style="font-size:14px;font-weight:700;color:var(--t1)">${t.fullName||t.name}</div>
      </div>
      <button onclick="DashboardUI._enterTournament('${key}')" style="font-size:12px;padding:5px 12px;background:var(--blue,#378ADD);color:#fff;border:none;border-radius:6px;cursor:pointer">View →</button>
    </div>`;
  },

  // ── Tournament entry — squad announcement & media build-up ───────────────
  // The first time the player enters a tournament, this replaces the old
  // "click View, land straight on the tournament screen" flow with a real
  // ceremonial moment: confirm/adjust the touring squad against the real
  // era-accurate squad-size cap, then a substantial media build-up
  // sequence with fresh written content. Re-entering the tournament on a
  // later dashboard visit (mid-group-stage, etc.) skips straight through
  // since this is a once-per-tournament occasion, not a per-match one.
  _enterTournament(key) {
    State.set('campaign.phase', 'tournament');
    // Only load() if this tournament isn't already the active one —
    // load() completely resets tournament.* (phase, results, tables,
    // everything), so calling it unconditionally on every re-entry would
    // wipe all progress and the squad-announced flag the instant the
    // player returned to the dashboard mid-tournament and clicked back
    // in. This was a real, pre-existing bug, not something specific to
    // the new squad-announcement gate — it just becomes far more visible
    // now that there's a real "have we already announced" flag for it
    // to silently destroy.
    if (State.get('tournament.key') !== key) {
      window.TournamentEngine.load(key);
    }
    const alreadyAnnounced = State.get('tournament.squadAnnounced');
    if (alreadyAnnounced) {
      window.TournamentUI.init();
      UI.show('screen-tournament');
      return;
    }
    this._openTournamentSquadAnnouncement(key);
  },

  _openTournamentSquadAnnouncement(key) {
    const tData = window.TOURNAMENTS?.[key];
    if (!tData) { window.TournamentUI.init(); UI.show('screen-tournament'); return; }
    this._tournKeyPending = key;
    this._renderTournamentSquadModal();
  },

  _renderTournamentSquadModal() {
    const key = this._tournKeyPending;
    const tData = window.TOURNAMENTS?.[key];
    const required = window.TournamentEngine.squadSizeFor(tData.year);
    const ids = State.get('squad.englandSquad') || [];
    const pool = this._pool();
    const squad = ids.map(id => pool.find(p => p.id === id)).filter(Boolean);
    const status = window.TournamentBuildup.squadSizeStatus(squad.length, required);

    const order = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
    const sorted = [...squad].sort((a, b) => order[a.posG] - order[b.posG] || (b.rat || 0) - (a.rat || 0));

    this._openModal(`<div class="modal-box wide">
      <div class="modal-header"><div class="modal-icon">📋</div><div>
        <div class="modal-title">Squad for ${tData.fullName || tData.name}</div>
        <div class="modal-sub">${tData.host ? `Hosted in ${tData.host}` : ''} — confirm your touring party of ${required} before the press get hold of it.</div>
      </div></div>
      <div class="modal-body" style="max-height:50vh;overflow-y:auto">
        <div style="padding:10px 14px;margin-bottom:10px;border-radius:8px;background:${status.ok ? 'rgba(60,180,100,0.08)' : 'rgba(220,80,60,0.08)'};border-left:3px solid ${status.ok ? 'var(--green,#3CB464)' : 'var(--red,#DC503C)'}">
          <strong style="color:${status.ok ? 'var(--green,#3CB464)' : 'var(--red,#DC503C)'}">${squad.length}/${required}</strong> &nbsp; ${status.message}
        </div>
        ${sorted.map(p => `
          <div class="scout-card" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;margin-bottom:6px">
            <div style="display:flex;align-items:center;gap:10px">
              <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
              <strong>${p.name}</strong>
              <span style="font-size:12px;color:var(--t3)">${p.club||''}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-weight:700;font-family:var(--font-ui);color:var(--gold)">${p.rat||70}</span>
              <button class="btn btn-ghost" style="padding:4px 10px;font-size:12px" onclick="DashboardUI._removeFromTournamentSquad('${p.id}')">Remove</button>
            </div>
          </div>`).join('')}
        ${squad.length < required ? `
          <button class="btn btn-ghost" style="width:100%;margin-top:6px" onclick="DashboardUI._openTournamentSquadAdd()">+ Add a player</button>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="DashboardUI._closeModal();window.TournamentUI.init();UI.show('screen-tournament')">Decide Later</button>
        <button class="btn btn-primary" ${status.ok ? '' : 'disabled'} onclick="DashboardUI._confirmTournamentSquad()">Confirm Squad for ${tData.name}</button>
      </div>
    </div>`);
  },

  _removeFromTournamentSquad(playerId) {
    const ids = (State.get('squad.englandSquad') || []).filter(id => id !== playerId);
    State.set('squad.englandSquad', ids);
    this._renderTournamentSquadModal();
  },

  _openTournamentSquadAdd() {
    const tData = window.TOURNAMENTS?.[this._tournKeyPending];
    const required = window.TournamentEngine.squadSizeFor(tData.year);
    const ids = new Set(State.get('squad.englandSquad') || []);
    const pool = this._pool().filter(p => !ids.has(p.id));
    const order = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
    const sorted = [...pool].sort((a, b) => order[a.posG] - order[b.posG] || (b.rat || 0) - (a.rat || 0));

    this._openModal(`<div class="modal-box wide">
      <div class="modal-header"><div class="modal-icon">➕</div><div>
        <div class="modal-title">Add to Squad</div>
        <div class="modal-sub">Pick a player to bring into the touring party.</div>
      </div></div>
      <div class="modal-body" style="max-height:50vh;overflow-y:auto">
        ${sorted.map(p => `
          <div class="scout-card" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;margin-bottom:6px;cursor:pointer" onclick="DashboardUI._addToTournamentSquad('${p.id}')">
            <div style="display:flex;align-items:center;gap:10px">
              <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
              <strong>${p.name}</strong>
              <span style="font-size:12px;color:var(--t3)">${p.club||''}</span>
            </div>
            <span style="font-weight:700;font-family:var(--font-ui);color:var(--gold)">${p.rat||70}</span>
          </div>`).join('') || '<p style="color:var(--t3);padding:20px;text-align:center">No more eligible players in the pool.</p>'}
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="DashboardUI._renderTournamentSquadModal()">Back</button>
      </div>
    </div>`);
  },

  _addToTournamentSquad(playerId) {
    const ids = State.get('squad.englandSquad') || [];
    if (!ids.includes(playerId)) ids.push(playerId);
    State.set('squad.englandSquad', ids);
    this._renderTournamentSquadModal();
  },

  _confirmTournamentSquad() {
    State.set('tournament.squadAnnounced', true);
    this._openTournamentPress();
  },

  // ── Media build-up: fresh written content + a press question ────────────
  _openTournamentPress() {
    const key = this._tournKeyPending;
    const tData = window.TOURNAMENTS?.[key];
    const content = window.TournamentBuildup.generateContent(tData);
    this._pendingPressQuestion = content.question;

    this._openModal(`<div class="modal-box wide">
      <div class="modal-header"><div class="modal-icon">🎙️</div><div>
        <div class="modal-title">Media Build-Up</div>
        <div class="modal-sub">${tData.name}</div>
      </div></div>
      <div class="modal-body">
        <p style="color:var(--t2);line-height:1.6;margin-bottom:18px">${content.copy}</p>
        <div style="padding:14px;border-radius:8px;background:var(--bg3);border-left:3px solid var(--gold)">
          <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:8px">A reporter asks:</div>
          <div style="font-size:15px;color:var(--t1);font-style:italic;margin-bottom:14px">"${content.question.q}"</div>
          ${content.question.options.map((opt, i) => `
            <button class="btn btn-ghost" style="width:100%;text-align:left;margin-bottom:6px;padding:10px 14px" onclick="DashboardUI._answerTournamentPress(${i})">${opt.label}</button>
          `).join('')}
        </div>
      </div>
    </div>`);
  },

  _answerTournamentPress(optionIdx) {
    const opt = this._pendingPressQuestion.options[optionIdx];
    const conf = State.get('campaign.boardConfidence') ?? 60;
    State.set('campaign.boardConfidence', Math.max(0, Math.min(100, conf + (opt.confDelta || 0))));
    // Pressure delta nudges every called-up player's confidence slightly —
    // a real media moment that sets the tone before a ball's kicked,
    // using the same Confidence system the rest of the game relies on.
    if (window.Confidence) {
      const ids = State.get('squad.englandSquad') || [];
      const morale = State.get('campaign.playerMorale') || {};
      ids.forEach(id => {
        const cur = morale[id] ?? 50;
        morale[id] = Math.max(15, Math.min(100, cur + (opt.pressureDelta || 0)));
      });
      State.set('campaign.playerMorale', morale);
    }
    this._closeModal();
    window.TournamentUI.init();
    UI.show('screen-tournament');
  },

  _dismissEmergence() {
    const alerts = State.get('campaign.emergenceAlerts') || [];
    alerts.forEach(a => { a.shown = true; });
    State.set('campaign.emergenceAlerts', alerts);
    this._renderCalendar();
  },

  _teamTalk(id){ State.set('campaign.lastTeamTalk',id); this._renderMatchCentre(); },

  // ── TOURNAMENTS ──────────────────────────────────────────────────────────
  _renderTournaments(){
    const p=document.getElementById('dp-tournaments');
    if(p){p.style.display='flex';p.style.flexDirection='column';p.style.overflow='hidden';p.style.minHeight='0';}
    const phase=State.get('campaign.phase')||'qualifying';
    const qual=State.get('campaign.qualifier');
    const rec=State.get('campaign.record')||{};
    const conf=State.get('campaign.boardConfidence')||60;
    const pts=(rec.won||0)*3+(rec.drawn||0);

    // Build qualifier table if in qualifying
    let tableHtml='';
    if(qual && window.QUALIFIER_GROUPS){
      const grp=window.QUALIFIER_GROUPS[qual.key];
      if(grp && qual.table){
        const table=window.CampaignPhase?.getSortedTable?window.CampaignPhase.getSortedTable():[];
        if(table.length){
          tableHtml=`<div class="dashboard-card"><div class="card-title-row"><span>Qualifying Group — ${grp.group||qual.key}</span></div>
            <div class="group-table">
              <div class="group-head"><span style="flex:2">Team</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span></div>
              ${table.map((r,i)=>{
                const isEng=r.name==='England';
                const qualifies=i<(grp.qualifies||1);
                const gd=(r.gf||0)-(r.ga||0);
                const gdStr=(gd>0?'+':'')+gd;
                return `<div class="group-row${isEng?' england':''}${qualifies?' qualify':''}">
                  <strong style="flex:2">${r.name}</strong><span>${r.p||0}</span><span>${r.w||0}</span><span>${r.d||0}</span><span>${r.l||0}</span><span>${gdStr}</span><span><strong>${r.pts||0}</strong></span>
                </div>`;
              }).join('')}
            </div>
            ${phase==='qualified'?'<div style="margin-top:10px;padding:8px;background:rgba(29,158,117,0.1);border-radius:4px;font-size:13px;color:var(--green)">✓ England have qualified</div>':''}
            ${phase==='failed_qual'?'<div style="margin-top:10px;padding:8px;background:rgba(200,16,46,0.1);border-radius:4px;font-size:13px;color:var(--red)">✗ England failed to qualify</div>':''}
          </div>`;
        }
      }
    }

    // Upcoming fixtures in group
    let fixturesHtml='';
    if(qual && window.QUALIFIER_GROUPS){
      const grp=window.QUALIFIER_GROUPS[qual.key];
      const completed=new Set(qual.completedFixtureIds||[]);
      const remaining=(grp?.fixtures||[]).filter(f=>!completed.has(f.id)&&(f.home==='England'||f.away==='England'));
      if(remaining.length){
        fixturesHtml=`<div class="dashboard-card"><div class="card-title-row"><span>Remaining England Fixtures</span></div>
          ${remaining.slice(0,5).map(f=>{
            const d=new Date(f.date);
            return `<div class="timeline-row"><span>${d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
              <div><strong>${f.home==='England'?'England vs '+f.away:f.home+' vs England'}</strong></div></div>`;
          }).join('')}
        </div>`;
      }
    }

    const qualName=qual?.key?.replace(/_/g,' ')||'Qualifying Campaign';
    const compDesc=phase==='qualified'?'England have qualified for the tournament!':phase==='failed_qual'?'England did not qualify.':qual?`Group stage ongoing · ${pts} points`:'';

    p.innerHTML=`
      <div class="tournament-hero">
        <div><div class="office-kicker">Tournament Tracker</div>
          <h2>${qualName}</h2>
          <p>${compDesc||'England preparing for qualification.'}</p></div>
        <div class="tournament-status">
          <span>Record</span>
          <strong>${rec.played?`${rec.won||0}W ${rec.drawn||0}D ${rec.lost||0}L`:'Not started'}</strong>
          <em>${pts} pts · ${rec.gf||0} GF · ${rec.ga||0} GA</em>
        </div>
      </div>
      <div class="tournament-grid">
        ${tableHtml||'<div class="dashboard-card"><p style="color:var(--t3);padding:16px">Start qualifying to see the group table here.</p></div>'}
        ${fixturesHtml}
        <div class="dashboard-card">
          <div class="card-title-row"><span>Campaign Status</span></div>
          <div class="england-hub">
            <div><span>Goals Scored</span><strong>${rec.gf||0}</strong></div>
            <div><span>Goals Against</span><strong>${rec.ga||0}</strong></div>
            <div><span>Win Rate</span><strong>${rec.played?Math.round((rec.won||0)/rec.played*100):0}%</strong></div>
            <div><span>FA Confidence</span><strong style="color:${conf>=70?'var(--green)':conf>=45?'var(--gold)':'var(--red)'}">${conf}%</strong></div>
          </div>
        </div>
      </div>`;
  },

  // ── MEDIA ────────────────────────────────────────────────────────────────
  _renderMedia(){
    const p=document.getElementById('dp-media');
    if(p){p.style.display='flex';p.style.flexDirection='column';p.style.overflow='hidden';p.style.minHeight='0';}
    const media=State.get('campaign.media')||{trust:58,fanMood:64,pressure:52};
    const rec=State.get('campaign.record')||{};
    const pundits=[{n:'G.Lineker',av:'GL',q:rec.won?'England are showing real character. Results are coming.':'The manager needs to find more consistency.'},{n:'A.Shearer',av:'AS',q:'The squad depth is a concern but the talent is undeniable.'},{n:'J.Barnes',av:'JB',q:'Quality football will come. Give the manager time.'}];
    p.innerHTML=`
      <div class="media-hero">
        <div><div class="office-kicker">National Mood</div><h2>${media.fanMood>=70?'England Fans Optimistic':media.fanMood>=45?'Mixed Feelings':'Unrest Growing'}</h2>
          <p>The nation watches every selection, every result. Manage the narrative.</p></div>
        <div class="media-meters">
          ${[['Media Trust',media.trust],['Fan Mood',media.fanMood],['Pressure Level',media.pressure]].map(([l,v])=>`<div class="media-meter"><div><span>${l}</span><strong>${v}%</strong></div><i><b style="width:${v}%"></b></i></div>`).join('')}
        </div>
      </div>
      <div class="media-grid">
        <div class="dashboard-card">
          <div class="card-title-row"><span>Headlines</span></div>
          <div class="headline-stack">
            <div class="headline-card"><span>England</span><strong>${rec.played?`${rec.won||0} wins from ${rec.played||0} games`:'New era begins'}</strong><p>${rec.played?`England have scored ${rec.gf||0} goals. ${media.fanMood>=60?'The mood is positive.':'Questions are being asked.'}`:''}</p></div>
            <div class="headline-card"><span>Selection</span><strong>Squad management in focus</strong><p>The manager must balance experience with emerging talent.</p></div>
          </div>
        </div>
        <div class="dashboard-card">
          <div class="card-title-row"><span>Press Conference</span></div>
          <div class="press-question"><span>The Media</span><strong>"How do you assess England\'s progress so far?"</strong></div>
          <div class="press-options">
            ${[{t:'Positive',d:'Highlight progress and back the squad',e:3},{t:'Honest',d:'Acknowledge challenges, back the process',e:1},{t:'Deflect',d:'Focus on the next fixture',e:0},{t:'Critical',d:'Call for higher standards',e:-1}].map(o=>`<button class="press-answer" onclick="DashboardUI._mediaPress(${o.e})"><strong>${o.t}</strong><span>${o.d}</span></button>`).join('')}
          </div>
          ${media.lastAnswer?`<div class="last-answer"><strong>Last Answer</strong><p>${media.lastAnswer}</p></div>`:''}
        </div>
        <div class="dashboard-card">
          <div class="card-title-row"><span>Pundits</span></div>
          ${pundits.map(pu=>`<div class="pundit-line"><div class="pundit-avatar">${pu.av}</div><div><strong>${pu.n}</strong><p>${pu.q}</p></div></div>`).join('')}
        </div>
      </div>`;
  },
  _mediaPress(effect){
    const answers=['Highlighted the positives and backed the squad.','Gave an honest assessment of where England stand.','Focused attention on the next fixture.','Called for higher standards from the group.'];
    const idx=effect===3?0:effect===1?1:effect===0?2:3;
    State.upd('campaign.media',m=>({...m,trust:Math.min(100,Math.max(0,(m.trust||58)+effect)),fanMood:Math.min(100,Math.max(0,(m.fanMood||64)+effect)),lastAnswer:answers[idx]}));
    State.upd('campaign.boardConfidence',c=>Math.min(100,Math.max(0,c+Math.round(effect*.5))));
    this._renderMedia();
  },

  // ── NEWS ─────────────────────────────────────────────────────────────────
  _renderNews(){
    const p=document.getElementById('dp-news');
    if(p){p.style.display='flex';p.style.flexDirection='column';p.style.overflow='hidden';p.style.minHeight='0';}
    const fix=this._fix(); const rec=State.get('campaign.record')||{};
    const squad=this._squad();
    const star=squad.slice().sort((a,b)=>(b.rat||0)-(a.rat||0))[0];
    const media=State.get('campaign.media')||{};
    p.innerHTML=`
      <div class="news-layout">
        <div class="lead-story">
          <span>Lead Story</span>
          <h2>${rec.played?`England ${rec.won?'in Winning Ways':'Looking for Form'}`:'England Campaign Begins'}</h2>
          <p>${rec.played?`After ${rec.played} matches, England have ${rec.won||0} wins, ${rec.drawn||0} draws and ${rec.lost||0} defeats. ${media.fanMood>=60?'The nation is behind the team.':'Patience is being tested.'}`:'A new chapter for the Three Lions. The manager faces the nation with ambition and purpose.'}</p>
        </div>
        <div class="news-feed">
          ${star?`<div class="news-item"><span>Star Player</span><strong>${star.name} — In Focus</strong><p>${star.bio||`${star.name} is one of England's key players this campaign.`}</p></div>`:''}
          <div class="news-item"><span>Squad News</span><strong>${squad.length} Players in Current Squad</strong><p>The England squad is ${squad.length>=20?'at full strength':'building towards a full complement'}.</p></div>
          ${fix?`<div class="news-item"><span>Next Match</span><strong>${fix.homeTeam} v ${fix.awayTeam}</strong><p>${fix.comp} · ${this._fmtDate(fix.date)} · ${fix.venue}</p></div>`:''}
          <div class="news-item"><span>Scouting</span><strong>Watchlist Growing</strong><p>${(State.get('campaign.watchlist')||[]).length} players currently under observation by the scouting team.</p></div>
        </div>
        <div class="fixture-watch">
          <div class="card-title-row" style="padding:0 0 10px"><span>Fixtures to Watch</span></div>
          ${(window.ALL_FIXTURES||[]).slice(State.get('campaign.fixtureIdx')||0,((State.get('campaign.fixtureIdx')||0)+4)).map(f=>{const isHome=f.homeTeam==='England';return `<div><span>${f.compShort}</span><strong>${isHome?'England vs '+f.awayTeam:f.homeTeam+' vs England'}</strong></div>`;}).join('')}
        </div>
      </div>`;
  },

  // ── STORYLINES ───────────────────────────────────────────────────────────
  _renderStorylines(){
    const p=document.getElementById('dp-storylines');
    if(p){p.style.display='flex';p.style.flexDirection='column';p.style.overflow='hidden';p.style.minHeight='0';}
    const squad=this._squad(); const rec=State.get('campaign.record')||{};
    const star=squad.slice().sort((a,b)=>(b.rat||0)-(a.rat||0))[0];
    const young=squad.filter(x=>(x.age||99)<=22).sort((a,b)=>(b.rat||0)-(a.rat||0))[0];
    p.innerHTML=`
      <div class="match-centre-hero" style="margin:18px 24px 0">
        <div><div class="office-kicker">Career Narrative</div>
          <div class="office-match" style="font-size:36px">${rec.played?`${rec.played} Matches Written into History`:'The Story Begins'}</div>
          <p class="office-detail">Your decisions are creating the narrative of this England reign.</p>
        </div>
      </div>
      <div class="management-grid three" style="padding:18px 24px">
        ${star?`<div class="dashboard-card"><div class="card-title-row"><span>Star Player</span></div><div class="storyline-row"><strong>${star.name}: England\'s Talisman</strong><p>${star.bio||`${star.name} leads the line with quality and experience.`}</p></div></div>`:'<div class="dashboard-card"><div class="card-title-row"><span>Star Player</span></div><p style="color:var(--t3);padding:12px 0">Select players to reveal storylines.</p></div>'}
        ${young?`<div class="dashboard-card"><div class="card-title-row"><span>Emerging Talent</span></div><div class="storyline-row"><strong>${young.name}: The Next Generation</strong><p>At just ${young.age}, ${young.name} has the potential to define a generation of English football.</p></div></div>`:'<div class="dashboard-card"><div class="card-title-row"><span>Emerging Talent</span></div><p style="color:var(--t3);padding:12px 0">Add young players to unlock youth storylines.</p></div>'}
        <div class="dashboard-card"><div class="card-title-row"><span>The England Project</span></div><div class="storyline-row"><strong>Building Something</strong><p>${rec.played?`${rec.played} matches in, the identity of this England team is taking shape.`:'Every great England story starts with a plan. This is yours.'}</p></div></div>
      </div>`;
  },

  // ── FA ───────────────────────────────────────────────────────────────────
  _renderFA(){
    const p=document.getElementById('dp-fa');
    if(p){p.style.display='flex';p.style.flexDirection='column';p.style.overflow='hidden';p.style.minHeight='0';}
    const conf=State.get('campaign.boardConfidence')||60;
    const fa=State.get('campaign.fa')||{confidence:65,expectation:'Qualify',meetingHistory:[]};
    const cc=conf>=70?'var(--green)':conf>=45?'var(--gold)':'var(--red)';
    const status=conf>=70?'safe':conf>=45?'watch':'danger';
    const rec=State.get('campaign.record')||{};
    const legacy=Math.round((rec.won||0)*5+(rec.drawn||0)*2+(State.get('campaign.reputation')||50)*.3+(conf*.2));
    p.innerHTML=`
      <div class="fa-hero">
        <div><div class="office-kicker">FA Headquarters</div>
          <h2>Board Confidence: <span style="color:${cc}">${conf}%</span></h2>
          <p>The Football Association is monitoring results, media pressure and squad management closely.</p></div>
        <div class="fa-confidence-ring"><div style="color:${cc}">${conf}</div><span>Confidence</span></div>
      </div>
      <div class="fa-grid">
        <div class="dashboard-card">
          <div class="card-title-row"><span>FA Factors</span></div>
          <div class="fa-factor-list">
            ${[['Results',Math.min(100,(rec.played?Math.round((rec.won||0)/rec.played*100):50)),'Based on win rate'],['Media',Math.max(0,100-(State.get('campaign.media')?.pressure||52)),'Media pressure impact'],['Squad Prep',Math.min(100,(State.get('squad.slots')||[]).filter(Boolean).length*9),'Teamsheet readiness'],['Scouting',(Object.keys(State.get('campaign.scoutReports')||{}).length*12)+'%'.replace('%',''),'Scouting activity']].map(([l,v,d])=>`<div class="fa-factor"><div><span>${l}</span><strong>${v}%</strong></div><i><b style="width:${v}%"></b></i><p>${d}</p></div>`).join('')}
          </div>
        </div>
        <div class="dashboard-card">
          <div class="expectation-card"><span>FA Expectation</span><h3>${fa.expectation||'Qualify'}</h3><p>The minimum requirement for maintaining board confidence.</p></div>
          <div class="fa-warning ${status}"><strong>${status==='safe'?'Position Secure':status==='watch'?'Under Scrutiny':'Position at Risk'}</strong>
            <p>${status==='safe'?'The board are fully behind the manager. Results justify the appointment.':status==='watch'?'The board are monitoring closely. A strong run of results is needed.':'The board are considering alternatives. Immediate improvement is essential.'}</p>
          </div>
        </div>
        <div class="dashboard-card">
          <div class="legacy-board"><div class="legacy-score">${legacy}</div><p>Legacy Score — based on results, confidence and reputation.</p></div>
          <div class="fa-meeting-options">
            ${[{t:'FA Meeting',d:'Speak directly with the board',e:3},{t:'Issue Statement',d:'Address concerns publicly',e:2},{t:'Focus on Football',d:'Let results speak',e:1},{t:'No Comment',d:'Remain tight-lipped',e:-1}].map(o=>`<button class="fa-meeting-btn" onclick="DashboardUI._faMeeting(${o.e})"><strong>${o.t}</strong><span>${o.d}</span></button>`).join('')}
          </div>
        </div>
      </div>`;
  },
  _faMeeting(e){ State.upd('campaign.boardConfidence',c=>Math.min(100,Math.max(0,c+e))); this._renderFA(); },

  // ── ARCHIVE ──────────────────────────────────────────────────────────────
  _renderArchive(){
    const p=document.getElementById('dp-archive');
    if(p){p.style.display='flex';p.style.flexDirection='column';p.style.overflow='hidden';p.style.minHeight='0';}
    const res=State.get('campaign.matchHistory2')||[];
    const rec=State.get('campaign.record')||{};
    const wr=rec.played?Math.round((rec.won||0)/rec.played*100):0;
    const results=[...res].reverse().slice(0,10);
    p.innerHTML=`
      <div class="match-centre-hero" style="margin:18px 24px 0">
        <div class="office-status-grid">
          ${[['Played',rec.played||0],['Won',rec.won||0],['Drawn',rec.drawn||0],['Lost',rec.lost||0],['Goals For',rec.gf||0],['Goals Against',rec.ga||0],['Win Rate',wr+'%'],['Goal Diff',(rec.gf||0)-(rec.ga||0)]].map(([l,v])=>`<div class="office-status"><div class="os-label">${l}</div><div class="os-value">${v}</div></div>`).join('')}
        </div>
      </div>
      <div class="panel-scroll"><div class="mgmt-grid two" style="padding:16px 24px">
        <div class="dashboard-card">
          <div class="card-title-row"><span>Match Archive</span></div>
          ${results.length?[...results].reverse().slice(0,20).map(r=>{
            const diff=r.score.eng-r.score.opp; const oc=diff>0?'W':diff<0?'L':'D';
            const dateStr=r.date?this._fmtDate(r.date):'';
            const isTourn=r.compType==='tournament';
            return `<div class="timeline-row"><span style="min-width:60px">${dateStr}</span><div><strong>${isTourn?'🏆 ':''}England vs ${r.opp||'Opponent'}</strong><em>${r.comp||''}</em></div><div style="text-align:right;font-family:var(--font-ui);font-size:18px;font-weight:800;color:${oc==='W'?'var(--green)':oc==='L'?'var(--red)':'var(--gold)'}">${r.score.eng}–${r.score.opp}</div></div>`;}).join(''):`<p style="color:var(--t3);padding:12px 0">No results yet.</p>`}
        </div>
        <div class="dashboard-card">
          <div class="card-title-row"><span>England Records</span></div>
          ${[['Most Caps (This Reign)',this._squad().slice().sort((a,b)=>(b.caps||0)-(a.caps||0))[0]?.name||'—'],['Top Rated',this._squad().slice().sort((a,b)=>(b.rat||0)-(a.rat||0))[0]?.name||'—'],['Youngest',this._squad().slice().sort((a,b)=>(a.age||99)-(b.age||99))[0]?.name||'—'],['Most Scouted',(() => {const sc=State.get('campaign.playerScoutCount')||{}; const top=Object.entries(sc).sort((a,b)=>b[1]-a[1])[0]; if(!top) return '—'; const pl=this._pool().find(p=>p.id===top[0]); return pl?pl.name:'—';})()]].map(([l,v])=>`<div class="timeline-row"><span style="width:140px;flex-shrink:0">${l}</span><strong>${v}</strong></div>`).join('')}
        </div>
      </div>`;
  },

  // ── MUSEUM ───────────────────────────────────────────────────────────────
  _renderMuseum(){
    const p=document.getElementById('dp-museum');
    if(p){p.style.display='flex';p.style.flexDirection='column';p.style.overflow='hidden';p.style.minHeight='0';}
    const rec=State.get('campaign.record')||{};
    const conf=State.get('campaign.boardConfidence')||60;
    const legacy=Math.round((rec.won||0)*5+(rec.drawn||0)*2+(conf*.3));
    const squad=this._squad();
    const legends=squad.filter(pl=>(pl.caps||0)>=20).sort((a,b)=>(b.rat||0)-(a.rat||0)).slice(0,5);
    p.innerHTML=`
      <div class="match-centre-hero" style="margin:18px 24px 0">
        <div><div class="office-kicker">England Museum</div>
          <div class="office-match" style="font-size:42px">Legacy Score: <span style="color:var(--gold)">${legacy}</span></div>
          <p class="office-detail">The England story being written by your decisions.</p>
        </div>
      </div>
      <div class="panel-scroll"><div class="mgmt-grid two" style="padding:16px 24px">
        <div class="dashboard-card">
          <div class="card-title-row"><span>Trophy Room</span></div>
          ${(rec.won||0)>5?`<div style="text-align:center;padding:24px"><div style="font-size:64px">🏆</div><div style="font-family:var(--font-ui);font-size:18px;font-weight:700;color:var(--gold);margin-top:8px">${rec.won} Victories</div></div>`:`<div style="padding:24px;text-align:center;color:var(--t3)"><div style="font-size:48px;margin-bottom:12px">🏟️</div><p>The trophy cabinet awaits. Win matches to fill it.</p></div>`}
        </div>
        <div class="dashboard-card">
          <div class="card-title-row"><span>Hall of Fame</span></div>
          ${legends.length?legends.map(pl=>`<div class="timeline-row"><span class="pos-badge ${UI.posClass(pl.posG)}">${pl.pos}</span><div><strong>${pl.name}</strong><em>${pl.caps||0} caps · ${pl.club||''}</em></div><span class="rating ${UI.ratClass(pl.rat)}">${pl.rat}</span></div>`).join(''):`<p style="color:var(--t3);padding:12px 0">Players with 20+ caps will appear here.</p>`}
        </div>
      </div>`;
  },

  _renderFallback(id){
    const p=document.getElementById('dp-'+id);
    if(p) p.innerHTML=`<div style="padding:32px"><h2 style="font-family:var(--font-ui);font-size:28px;color:var(--t1)">${id.charAt(0).toUpperCase()+id.slice(1)}</h2><p style="color:var(--t3);margin-top:8px">This section is coming soon.</p></div>`;
  },

  goToSquad(){ window.SquadUI.init(); UI.show('screen-squad'); },
  openTactics(){ window.TacticsUI.init(); UI.show('screen-tactics'); },

  // ── Intel scoring methods ──────────────────────────────────────────────
_intelScore(pl, kind){
      const rat = Number(pl.rat || 70), caps = Number(pl.caps || 0), age = Number(pl.age || 26);
      const pos = pl.posG || 'MID';
      const name = (pl.name || '').toLowerCase();
      const capBonus = Math.min(10, caps / 10);
      const youth = age <= 23 ? 6 : age <= 27 ? 4 : age <= 31 ? 2 : -2;
      const experience = Math.min(10, caps / 8);
      const keeperPenalty = pos === 'GK' ? -8 : 0;
      let v = rat;
      if (kind === 'fit') v = rat * .72 + capBonus + youth + (pos === 'MID' ? 4 : 0) + (pos === 'FWD' ? 2 : 0);
      if (kind === 'form') v = rat * .65 + ((pl.form || pl.morale || 70) * .25) + youth;
      if (kind === 'tournament') v = rat * .58 + experience * 2.4 + (age >= 28 ? 4 : 0);
      if (kind === 'leadership') v = rat * .42 + experience * 3.2 + (pos === 'GK' || pos === 'DEF' ? 5 : 0);
      if (kind === 'pace') v = rat * .60 + (pos === 'FWD' ? 15 : pos === 'DEF' ? 4 : 8) + (age < 28 ? 5 : -4);
      if (kind === 'creative') v = rat * .62 + (pos === 'MID' ? 18 : pos === 'FWD' ? 10 : keeperPenalty);
      if (kind === 'press') v = rat * .60 + (pos === 'MID' ? 14 : pos === 'FWD' ? 10 : pos === 'DEF' ? 6 : -10) + (age < 30 ? 4 : -3);
      if (kind === 'aerial') v = rat * .55 + (pos === 'DEF' ? 20 : pos === 'GK' ? 14 : pos === 'FWD' ? 9 : 2);
      if (kind === 'future') v = rat * .50 + Math.max(0, 30 - age) * 2.1;
      if (kind === 'selection') v = this._intelScore(pl,'fit')*.32 + this._intelScore(pl,'form')*.22 + this._intelScore(pl,'tournament')*.18 + this._intelScore(pl,'leadership')*.10 + this._intelRoleFit(pl)*.18;
      if (name.includes('robson') || name.includes('lineker') || name.includes('shilton')) v += 4;
      return Math.max(1, Math.min(99, Math.round(v)));
    },

    _intelGrade(score){
      if (score >= 88) return ['Elite','var(--green)'];
      if (score >= 78) return ['Excellent','var(--gold)'];
      if (score >= 68) return ['Good','var(--red)'];
      if (score >= 55) return ['Mixed','var(--t2)'];
      return ['Concern','var(--t3)'];
    },

    _intelRoleFit(pl){
      const r = Number(pl.rat || 70), pos = pl.posG || 'MID', age = Number(pl.age || 26), caps = Number(pl.caps || 0);
      let v = r * .68 + Math.min(12, caps/9);
      if (pos === 'GK') v += 8;
      if (pos === 'DEF') v += age >= 25 ? 8 : 3;
      if (pos === 'MID') v += 10;
      if (pos === 'FWD') v += 7;
      return Math.max(1, Math.min(99, Math.round(v)));
    },

  // ── Squad tab v21 methods ─────────────────────────────────────────────
  _squadListTab: 'overview',
    _playerDrawerTab: 'overview',

    _renderSquad(){
      const p = document.getElementById('dp-squad');
      if (!p) return;
      p.style.display = 'flex';
      p.style.flexDirection = 'column';
      p.style.overflow = 'hidden';
      p.style.minHeight = '0';

      const squad = this._squad();
      const pool = this._pool();
      const slots = State.get('squad.slots') || [];
      const bench = State.get('squad.bench') || [];
      const selected = squad.find(x => x.id === this._selectedSquadPlayer) || null;
      const tab = this._squadListTab || 'overview';
      const byGroup = g => squad.filter(p => p.posG === g).length;
      const xiCount = slots.filter(Boolean).length;
      const benchCount = bench.filter(Boolean).length;

      p.innerHTML = `
        <div class="clean-squad-screen">
          <header class="clean-squad-header">
            <div>
              <div class="clean-kicker">England Squad</div>
              <h2>${squad.length} selected players</h2>
            </div>
            <div class="clean-squad-counts">
              <span><b>${byGroup('GK')}</b> GK</span>
              <span><b>${byGroup('DEF')}</b> DEF</span>
              <span><b>${byGroup('MID')}</b> MID</span>
              <span><b>${byGroup('FWD')}</b> FWD</span>
              <span><b>${xiCount}</b>/11 XI</span>
              <span><b>${benchCount}</b>/5 Bench</span>
            </div>
            <div class="clean-squad-actions">
              <button class="btn btn-ghost clean-action" onclick="DashboardUI._openAddModal()">+ Add Players</button>
              <button class="btn btn-primary clean-action" onclick="DashboardUI.goToSquad()">Matchday XI ▶</button>
            </div>
          </header>

          <div class="clean-squad-tabs">
            ${[
              ['overview','Overview'],
              ['attributes','Attributes'],
              ['international','International Stats'],
              ['form','Form & Fitness'],
              ['selection','Selection Status']
            ].map(([id,label]) => `<button class="clean-squad-tab ${tab===id?'active':''}" onclick="DashboardUI._squadListTab='${id}';DashboardUI._renderSquad()">${label}</button>`).join('')}
          </div>

          <main class="clean-squad-main">
            <section class="clean-squad-list-wrap">
              ${this._cleanSquadTable(squad, slots, bench, tab)}
            </section>
          </main>

          ${this._cleanPlayerDrawer(selected)}
          <div id="add-player-modal-root"></div>
        </div>`;
    },

    _cleanSquadTable(squad, slots, bench, tab){
      const header = this._cleanTableHeader(tab);
      const rows = squad.map(pl => this._cleanSquadRow(pl, slots, bench, tab)).join('');
      return `<div class="clean-table clean-table-${tab}">
        <div class="clean-table-head">${header}</div>
        <div class="clean-table-body">${rows || '<div class="clean-empty">No players selected. Use Add Players to build the England squad.</div>'}</div>
      </div>`;
    },

    _cleanTableHeader(tab){
      const common = `<span>Status</span><span>Pos</span><span>Player</span>`;
      if (tab === 'attributes') return `${common}<span>OVR</span><span>Att</span><span>Cre</span><span>Phy</span><span>Men</span><span>Def</span>`;
      if (tab === 'international') return `${common}<span>Age</span><span>Caps</span><span>Goals</span><span>Club</span><span>England Role</span>`;
      if (tab === 'form') return `${common}<span>Form</span><span>Morale</span><span>Readiness</span><span>Fitness</span><span>Risk</span>`;
      if (tab === 'selection') return `${common}<span>Fit</span><span>Role</span><span>XI</span><span>Bench</span><span>Actions</span>`;
      return `${common}<span>Age</span><span>Caps</span><span>Rating</span><span>Form</span><span>Club</span>`;
    },

    _cleanSquadRow(pl, slots, bench, tab){
      const inXI = slots.filter(Boolean).some(x => x.id === pl.id);
      const inBench = bench.filter(Boolean).some(x => x.id === pl.id);
      const status = inXI ? 'XI' : inBench ? 'Bench' : 'Squad';
      const selected = this._selectedSquadPlayer === pl.id;
      const attrs = pl.attrs || {};
      const val = v => Number(v || 0);
      const rating = Number(pl.rat || 0);
      const morale = this._morale ? this._morale(pl) : (pl.morale || 70);
      const form = this._form ? this._form(pl) : (pl.form || morale);
      const readiness = this._readiness ? this._readiness(pl) : Math.round((rating + morale) / 2);
      const role = this._intelRoleFit ? this._intelRoleFit(pl) : readiness;
      const fit = this._intelScore ? this._intelScore(pl, 'fit') : readiness;
      const risk = (pl.age || 26) > 33 ? 'Ageing' : readiness < 65 ? 'Low sharpness' : 'OK';
      const statusClass = inXI ? 'xi' : inBench ? 'bench' : 'squad';
      let cells = '';
      if (tab === 'attributes') {
        const isGK = pl.posG === 'GK';
        const avgAtt  = isGK ? Math.round(((attrs.han||12)+(attrs.ref||12))/2) : Math.round(((attrs.fin||attrs.sho||10)+(attrs.pac||12)+(attrs.dri||12))/3);
        const avgCre  = isGK ? (attrs.kic||12) : Math.round(((attrs.pas||12)+(attrs.lng||attrs.pas||10)+(attrs.vis||attrs.men||11))/3);
        const avgPhy  = Math.round(((attrs.pac||12)+(attrs.str||attrs.phy||11)+(attrs.sta||12))/3);
        const avgMen  = Math.round(((attrs.dec||attrs.men||12)+(attrs.com||attrs.men||11)+(attrs.wor||attrs.sta||12))/3);
        const avgDef  = isGK ? Math.round(((attrs.onv||attrs.pos||12)+(attrs.aer||attrs.han||12))/2) : Math.round(((attrs.tac||attrs.def||10)+(attrs.mar||attrs.def||10)+(attrs.int||attrs.men||10))/3);
        const col = v => v>=16?'color:var(--green)':v>=13?'color:#88d44a':v>=9?'':'color:var(--orange)';
        cells = `<span style="${col(rating/5)}">${rating}</span><span style="${col(avgAtt)}">${avgAtt}</span><span style="${col(avgCre)}">${avgCre}</span><span style="${col(avgPhy)}">${avgPhy}</span><span style="${col(avgMen)}">${avgMen}</span><span style="${col(avgDef)}">${avgDef}</span>`;
      } else if (tab === 'international') {
        cells = `<span>${pl.age || '—'}</span><span>${pl.caps || 0}</span><span>${pl.goals || 0}</span><span class="wide-cell">${pl.club || '—'}</span><span>${this._cleanEnglandRole(pl)}</span>`;
      } else if (tab === 'form') {
        cells = `<span>${form}</span><span>${morale}</span><span>${readiness}</span><span>${this._cleanFitness(pl)}</span><span>${risk}</span>`;
      } else if (tab === 'selection') {
        cells = `<span>${fit}</span><span>${role}</span><span>${inXI ? 'Yes' : '—'}</span><span>${inBench ? 'Yes' : '—'}</span><span class="row-actions"><button onclick="event.stopPropagation();DashboardUI._addXI('${pl.id}')">XI</button><button onclick="event.stopPropagation();DashboardUI._addBench('${pl.id}')">Bench</button><button class="danger" onclick="event.stopPropagation();DashboardUI._removeSquad('${pl.id}')">Remove</button></span>`;
      } else {
        cells = `<span>${pl.age || '—'}</span><span>${pl.caps || 0}</span><span>${rating}</span><span>${form}</span><span class="wide-cell">${pl.club || '—'}</span>`;
      }
      return `<div class="clean-table-row ${selected?'selected':''}" onclick="DashboardUI._openPlayerDrawer('${pl.id}')">
        <span class="status-pill ${statusClass}">${status}</span>
        <span class="pos-badge ${UI.posClass(pl.posG)}">${pl.pos}</span>
        <span class="player-name-cell"><b>${pl.name}</b><em>${pl.club || ''}</em></span>
        ${cells}
      </div>`;
    },

    _openPlayerDrawer(id){
      this._selectedSquadPlayer = id;
      this._playerDrawerTab = this._playerDrawerTab || 'overview';
      this._renderSquad();
    },

    _closePlayerDrawer(){
      this._selectedSquadPlayer = null;
      this._renderSquad();
    },

    _setPlayerDrawerTab(tab){
      this._playerDrawerTab = tab || 'overview';
      this._renderSquad();
    },

    _selectPlayer(id){ this._openPlayerDrawer(id); },

    _cleanPlayerDrawer(pl){
      if (!pl) return '';
      const tab = this._playerDrawerTab || 'overview';
      return `<aside class="player-slide-drawer open">
        <div class="drawer-backdrop" onclick="DashboardUI._closePlayerDrawer()"></div>
        <div class="drawer-panel">
          <div class="drawer-player-head">
            <div>
              <div class="clean-kicker">Selected Player</div>
              <h2>${pl.name}</h2>
              <p>${pl.club || '—'} · ${pl.pos} · Age ${pl.age || '?'} · ${pl.caps || 0} caps</p>
            </div>
            <button class="drawer-x" onclick="DashboardUI._closePlayerDrawer()">×</button>
          </div>
          <div class="drawer-player-tabs">
            ${[
              ['overview','Overview'],
              ['attributes','Attributes'],
              ['england','England'],
              ['form','Form'],
              ['analytics','Analytics']
            ].map(([id,label]) => `<button class="drawer-tab ${tab===id?'active':''}" onclick="DashboardUI._setPlayerDrawerTab('${id}')">${label}</button>`).join('')}
          </div>
          <div class="drawer-player-body">${this._cleanDrawerContent(pl, tab)}</div>
          <div class="drawer-player-actions">
            <button class="btn btn-primary btn-primary-sm" onclick="DashboardUI._addXI('${pl.id}')">Add to XI</button>
            <button class="btn btn-ghost clean-action" onclick="DashboardUI._addBench('${pl.id}')">Bench</button>
            <button class="btn btn-ghost clean-action danger-text" onclick="DashboardUI._removeSquad('${pl.id}')">Remove</button>
          </div>
        </div>
      </aside>`;
    },

    _cleanDrawerContent(pl, tab){
      const a = pl.attrs || {};
      const morale = this._morale ? this._morale(pl) : 70;
      const form   = this._form   ? this._form(pl)   : morale;
      const fit    = this._intelScore ? this._intelScore(pl,'fit') : pl.rat||70;
      const tour   = this._intelScore ? this._intelScore(pl,'tournament') : pl.rat||70;
      const role   = this._intelRoleFit ? this._intelRoleFit(pl) : fit;

      // Stat tile helper
      const tile = (label, val, sub='', hi=false) =>
        `<div class="pc-tile${hi?' pc-tile--hi':''}"><span class="pc-tile-label">${label}</span><strong class="pc-tile-val">${val}</strong>${sub?`<em class="pc-tile-sub">${sub}</em>`:''}</div>`;

      // Attribute bar with colour coding
      const attrBar = (label, val, max=20, group='') => {
        const pct = Math.round(Math.max(0,Math.min(100,(val||0)/max*100)));
        const cls = val>=17?'elite':val>=14?'good':val>=10?'mid':'low';
        return `<div class="pc-attr-row">
          <span class="pc-attr-label">${label}</span>
          <div class="pc-attr-bar"><div class="pc-attr-fill pc-attr-${cls}" style="width:${pct}%"></div></div>
          <span class="pc-attr-num pc-attr-${cls}">${val||'—'}</span>
        </div>`;
      };

      // Radar/polygon hexagon for 6 key attributes
      const radarHex = (vals) => {
        const cx=80, cy=80, r=60, pts=vals.length;
        const poly = vals.map((v,i) => {
          const angle = (Math.PI*2/pts)*i - Math.PI/2;
          const d = (v/20)*r;
          return `${cx+Math.cos(angle)*d},${cy+Math.sin(angle)*d}`;
        }).join(' ');
        const grid = [0.33,0.66,1.0].map(f=>{
          const gpts = vals.map((_,i) => {
            const angle = (Math.PI*2/pts)*i - Math.PI/2;
            return `${cx+Math.cos(angle)*r*f},${cy+Math.sin(angle)*r*f}`;
          }).join(' ');
          return `<polygon points="${gpts}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>`;
        }).join('');
        const spokes = vals.map((_,i) => {
          const angle = (Math.PI*2/pts)*i - Math.PI/2;
          return `<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(angle)*r}" y2="${cy+Math.sin(angle)*r}" stroke="rgba(255,255,255,.08)" stroke-width="1"/>`;
        }).join('');
        return `<svg viewBox="0 0 160 160" class="pc-radar">
          ${grid}${spokes}
          <polygon points="${poly}" fill="rgba(200,16,46,.25)" stroke="var(--red)" stroke-width="2"/>
        </svg>`;
      };

      if (tab === 'attributes') {
        const isGK = pl.posG === 'GK';
        if (isGK) {
          const radarVals = [a.han||12, a.ref||12, a.onv||a.pos||12, a.aer||a.han||12, a.kic||12, a.thw||12];
          const radarLbls = ['Handling','Reflexes','1v1','Aerial','Kicking','Throwing'];
          return `
            <div class="pc-attr-layout">
              <div class="pc-radar-wrap">
                ${radarHex(radarVals)}
                <div class="pc-radar-labels">
                  ${radarLbls.map((l,i)=>`<span class="pc-rl pc-rl-${i}">${l}</span>`).join('')}
                </div>
              </div>
              <div class="pc-attr-groups">
                <div class="pc-attr-group-head">Goalkeeping</div>
                ${['han','ref','onv','aer','kic','thw'].map(k=>{
                  const labels={han:'Handling',ref:'Reflexes',onv:'One v One',aer:'Aerial',kic:'Kicking',thw:'Throwing'};
                  return attrBar(labels[k]||k, a[k]||a.han||12);
                }).join('')}
                <div class="pc-attr-group-head" style="margin-top:12px">Mental</div>
                ${['com','dec','bra','lea','pos','sta'].map(k=>{
                  const labels={com:'Composure',dec:'Decisions',bra:'Bravery',lea:'Leadership',pos:'Positioning',sta:'Stamina'};
                  return attrBar(labels[k]||k, a[k]||12);
                }).join('')}
              </div>
            </div>`;
        }
        // Outfield - show all 4 groups with hexagon
        const grpAttrs = {
          technical: {keys:['fin','sho','hea','pas','lng','cro','dri','tec','fre'], labels:{fin:'Finishing',sho:'Shot Power',hea:'Heading',pas:'Short Pass',lng:'Long Pass',cro:'Crossing',dri:'Dribbling',tec:'Technique',fre:'Free Kicks'}},
          physical:  {keys:['pac','acc','sta','str','jum','agi'], labels:{pac:'Pace',acc:'Acceleration',sta:'Stamina',str:'Strength',jum:'Jumping',agi:'Agility'}},
          mental:    {keys:['vis','dec','com','pos','wor','bra','lea'], labels:{vis:'Vision',dec:'Decisions',com:'Composure',pos:'Positioning',wor:'Work Rate',bra:'Bravery',lea:'Leadership'}},
          defending: {keys:['tac','mar','int'], labels:{tac:'Tackling',mar:'Marking',int:'Interceptions'}},
        };
        const isPrimary = g => (pl.posG==='DEF'&&(g==='defending'||g==='physical'))||(pl.posG==='MID'&&(g==='technical'||g==='mental'))||(pl.posG==='FWD'&&(g==='technical'||g==='physical'));
        const radarV = [
          (a.fin||a.sho||10), (a.pas||12), (a.dri||12),
          (a.tac||a.def||10), (a.pac||12), (a.sta||12)
        ];
        const radarL = ['Finishing','Passing','Dribbling','Defending','Pace','Stamina'];
        return `
          <div class="pc-attr-layout">
            <div class="pc-radar-wrap">
              ${radarHex(radarV)}
              <div class="pc-radar-labels">
                ${radarL.map((l,i)=>`<span class="pc-rl pc-rl-${i}">${l}</span>`).join('')}
              </div>
            </div>
            <div class="pc-attr-groups">
              ${Object.entries(grpAttrs).map(([grp,{keys,labels}])=>`
                <div class="pc-attr-group-head${isPrimary(grp)?' pc-primary-grp':''}">${grp.charAt(0).toUpperCase()+grp.slice(1)}</div>
                ${keys.map(k=>attrBar(labels[k]||k, a[k]||0)).join('')}
              `).join('')}
            </div>
          </div>`;
      }

      if (tab === 'england') {
        const tracked = (State.get('campaign.playerStats')||{})[pl.id]||{};
        const tCaps = tracked.caps||0, tGoals = tracked.goals||0;
        const traits = (pl.traits||[]);
        const weaknesses = (pl.weaknesses||[]);
        return `
          <div class="pc-tiles-4">
            ${tile('Caps', pl.caps||0, pl.caps>=50?'Veteran':pl.caps>=20?'Experienced':pl.caps>=5?'Established':'Emerging')}
            ${tile('Int\'l Goals', pl.goals||0)}
            ${tile('England Fit', fit, fit>=80?'Strong selection':fit>=65?'Squad option':'Fringe', fit>=80)}
            ${tile('Tournament', tour, tour>=80?'Big game player':tour>=65?'Reliable':'Needs proving', tour>=80)}
          </div>
          ${tCaps>0?`<div class="pc-tiles-4">
            ${tile('England Caps (This Save)',tCaps)}
            ${tile('England Goals (This Save)',tGoals)}
          </div>`:''}
          ${traits.length?`<div class="pc-tags-section">
            <div class="pc-tags-label">Strengths</div>
            <div class="pc-tags">${traits.map(t=>`<span class="pc-tag pc-tag--good">${t}</span>`).join('')}</div>
          </div>`:''}
          ${weaknesses.length?`<div class="pc-tags-section">
            <div class="pc-tags-label">Weaknesses</div>
            <div class="pc-tags">${weaknesses.map(t=>`<span class="pc-tag pc-tag--weak">${t}</span>`).join('')}</div>
          </div>`:''}
          <div class="pc-bio">${pl.bio||'No profile available.'}</div>`;
      }

      if (tab === 'form') {
        const formCls = form>=80?'elite':form>=70?'good':form>=55?'mid':'low';
        const moraleCls = morale>=75?'elite':morale>=55?'good':morale>=40?'mid':'low';
        const fmBar = (l,v) => `<div class="pc-fm-row"><span>${l}</span><div class="pc-fm-track"><div class="pc-fm-fill pc-attr-${v>=75?'elite':v>=60?'good':v>=45?'mid':'low'}" style="width:${v}%"></div></div><b>${v}</b></div>`;
        return `
          <div class="pc-form-hero pc-form-${formCls}">
            <div class="pc-form-num">${form}</div>
            <div class="pc-form-label">Current Form</div>
          </div>
          <div class="pc-fm-bars">
            ${fmBar('Morale', morale)}
            ${fmBar('England Fit', fit)}
            ${fmBar('Role Suitability', role)}
            ${fmBar('Tournament Reliability', tour)}
          </div>
          <div class="pc-tiles-2">
            ${tile('Age', pl.age||'—', (pl.age||26)>=34?'Veteran management':(pl.age||26)<=23?'Young talent':'Peak years')}
            ${tile('Fitness', (pl.age||26)>=34?'Managed':(morale<45?'Watch':'Good'))}
          </div>`;
      }

      // Overview (default)
      const posLabels = {GK:'Goalkeeper',RB:'Right Back',LB:'Left Back',CB:'Centre Back',CM:'Central Midfielder',DM:'Defensive Mid',AM:'Attacking Mid',LM:'Left Midfielder',RM:'Right Midfielder',ST:'Striker',CF:'Centre Forward',SS:'Second Striker'};
      const posLabel = posLabels[pl.pos] || pl.pos || pl.posG;
      return `
        <div class="pc-overview-head">
          <div class="pc-ov-rat">${pl.rat||'—'}</div>
          <div>
            <div class="pc-ov-pos">${posLabel}</div>
            <div class="pc-ov-club">${pl.club||'—'} · ${pl.nat||'England'}</div>
            <div class="pc-ov-meta">${pl.height?pl.height+'cm':''}${pl.foot?' · '+(pl.foot.charAt(0).toUpperCase()+pl.foot.slice(1))+' foot':''}</div>
          </div>
        </div>
        <div class="pc-tiles-4">
          ${tile('Caps', pl.caps||0)}
          ${tile('Int\'l Goals', pl.goals||0)}
          ${tile('Form', form, form>=75?'In form':form>=55?'Average':'Below par', form>=75)}
          ${tile('England Fit', fit, '', fit>=80)}
        </div>
        <div class="pc-bio">${pl.bio||'No profile available.'}</div>
        ${(pl.traits||[]).length?`<div class="pc-tags-section"><div class="pc-tags-label">Key Traits</div><div class="pc-tags">${(pl.traits||[]).map(t=>`<span class="pc-tag pc-tag--good">${t}</span>`).join('')}</div></div>`:''}`;
    },

    _cleanEnglandRole(pl){
      if (pl.posG === 'GK') return 'Goalkeeper';
      if (pl.posG === 'DEF') return (pl.pos || '').includes('B') ? 'Defensive core' : 'Defender';
      if (pl.posG === 'MID') return 'Midfield option';
      if (pl.posG === 'FWD') return 'Attacking option';
      return 'Squad option';
    },

    _cleanFitness(pl){
      const age = pl.age || 26;
      if (age >= 34) return 'Managed';
      if ((this._morale ? this._morale(pl) : 70) < 45) return 'Watch';
      return 'Good';
    },

    _cleanSquadStatus(pl){
      const slots = State.get('squad.slots') || [];
      const bench = State.get('squad.bench') || [];
      if (slots.filter(Boolean).some(x => x.id === pl.id)) return 'Starting XI';
      if (bench.filter(Boolean).some(x => x.id === pl.id)) return 'Bench';
      return 'Squad';
    },

    _cleanPlayerReport(pl){
      const fit = this._intelScore ? this._intelScore(pl,'fit') : (pl.rat || 70);
      if (fit >= 85) return `${pl.name} profiles as a very strong England fit and should be considered seriously for major fixtures.`;
      if (fit >= 72) return `${pl.name} is a credible squad option with useful qualities for the current England setup.`;
      return `${pl.name} may need the right tactical context to justify selection.`;
    }


};