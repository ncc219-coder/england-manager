window.MenuUI = {
  init() {
    document.getElementById('screen-menu').innerHTML = this._render();
  },

  _render() {
    const fixes = window.ALL_FIXTURES.slice(0,10);
    return `
      <div class="menu-hero">
        <div class="menu-hero-bg"></div>
        <div class="menu-hero-grid"></div>
        <div class="menu-hero-vignette"></div>
        <div class="menu-hero-accent"></div>
        <div class="menu-hero-content">
          <div class="menu-eyebrow">
            <div class="menu-eyebrow-dot"></div>
            <span class="menu-eyebrow-text">The Football Association · Official Historical Simulation</span>
          </div>
          <div class="menu-title">
            <span class="menu-title-sm">England</span>
            <span class="menu-title-lg">Manager</span>
          </div>
          <div class="menu-subtitle">1986 — Present Day</div>
          <p class="menu-desc">Take charge of the England national team across four decades. Every qualifier, every friendly, every major tournament — played with real squads, authentic tactics and live match action.</p>
          <div class="menu-cta">
            <button class="btn btn-primary" onclick="MenuUI.openNewGame()">▶ &nbsp; New Career</button>
            <button class="btn btn-ghost" onclick="MenuUI.load()">Continue</button>
            <button class="btn btn-ghost" style="margin-top:6px" onclick="SettingsUI.open()">⚙ Settings</button>
            <button class="btn btn-ghost" style="margin-top:6px" onclick="TournamentJump.open()">🏆 Jump to Tournament</button>
          </div>
          <div class="menu-meta">v1.0.0 &nbsp;·&nbsp; England Manager &nbsp;·&nbsp; 1986–Present</div>
        </div>
      </div>
      <div class="menu-sidebar">
        <div class="menu-sidebar-head">
          <span class="label">1986 Season Fixtures</span>
          <span class="menu-sidebar-season">Bobby Robson Era</span>
        </div>
        <div class="fixture-list">${fixes.map(f => this._row(f)).join('')}</div>
        <div class="menu-sidebar-footer">
          <button class="btn btn-primary btn-primary-full" onclick="MenuUI.openNewGame()">▶ &nbsp; Start New Career</button>
        </div>
      </div>`;
  },

  _row(f) {
    const isHome = f.homeTeam === 'England';
    const match  = isHome ? `England vs ${f.awayTeam}` : `${f.homeTeam} vs England`;
    const cls    = f.compShort.includes('WC') ? 'tag-red' : f.compShort.includes('EC')||f.compShort.includes('EURO') ? 'tag-blue' : 'tag-gray';
    const d = new Date(f.date);
    const ds = d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}) + '<br>' + d.getFullYear();
    return `<div class="fixture-row">
      <div class="fr-comp"><span class="tag ${cls}">${f.compShort}</span></div>
      <div class="fr-teams"><div class="fr-match">${match}</div><div class="fr-venue">${f.venue} · ${f.venueCity}</div></div>
      <div class="fr-date">${ds}</div>
    </div>`;
  },

  openNewGame() {
    const old = document.getElementById('newgame-overlay');
    if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'newgame-overlay';
    el.className = 'newgame-overlay';
    el.innerHTML = `
      <div class="newgame-box">
        <div class="newgame-header">
          <div class="newgame-title">New Career</div>
          <div class="newgame-sub">Set up your management career</div>
        </div>
        <div class="newgame-body">
          <div class="newgame-field">
            <label class="newgame-label">Your Name</label>
            <input class="newgame-input" id="ng-name" type="text" placeholder="e.g. Neil Curtis" maxlength="30">
          </div>
          <div class="newgame-field">
            <label class="newgame-label">Starting Year</label>
            <div class="era-picker">
              <input type="range" id="ng-year-slider" class="era-slider"
                     min="1986" max="2022" step="1" value="1986"
                     oninput="MenuUI.selectEra(+this.value)">
              <div class="era-slider-ticks">
                <span>1986</span><span>1998</span><span>2010</span><span>2022</span>
              </div>
              <div class="era-preview" id="era-preview"></div>
            </div>
          </div>
          <div class="newgame-field">
            <label class="newgame-label">Difficulty</label>
            <div class="diff-grid">
              ${[
                {id:'Amateur',       desc:'Forgiving AI, low pressure'},
                {id:'Professional',  desc:'Balanced, realistic'},
                {id:'International', desc:'Tough, board impatient'},
                {id:'World Class',   desc:'One bad run ends you'},
              ].map((d,i) => `<div class="diff-card${i===1?' selected':''}" data-diff="${d.id}" onclick="MenuUI.selectDiff('${d.id}')">
                <div class="diff-name">${d.id}</div>
                <div class="diff-desc">${d.desc}</div>
              </div>`).join('')}
            </div>
          </div>
        </div>
        <div class="newgame-footer">
          <button class="btn btn-ghost" onclick="document.getElementById('newgame-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="MenuUI.startNewGame()">Start Career ▶</button>
        </div>
      </div>`;
    el.addEventListener('click', e => { if (e.target === el) el.remove(); });
    document.body.appendChild(el);
    document.getElementById('ng-name').focus();
    this.selectEra(1986);
  },

  // Generates the year-preview card content dynamically for ANY year in
  // range, rather than relying on hand-written flavor text — derived from
  // the real England managers list (managers_by_year.js) and the existing
  // qualifying/tournament cycle schedule (CampaignPhase._cycles), both of
  // which already cover the full 1986-2024 span.
  selectEra(year) {
    const slider = document.getElementById('ng-year-slider');
    if (slider && +slider.value !== year) slider.value = year;

    const mgr = window.getEnglandManagerForYear ? window.getEnglandManagerForYear(year) : null;
    const mgrName = mgr ? mgr.name : 'England';

    const cycles = (window.CampaignPhase && window.CampaignPhase._cycles) || [];
    // The cycle already underway at this starting point (if any) vs the
    // next one yet to begin — these read very differently ("qualifying
    // starts fresh today" vs "you're joining a cycle already in motion").
    const current = cycles.filter(c => c.startYear <= year).pop();
    const label = (c) => {
      const t = window.TOURNAMENTS && window.TOURNAMENTS[c.tournKey];
      return t ? `${t.name || c.tournKey} ${t.year || c.tournYear}` : `the ${c.tournYear} tournament`;
    };

    let blurb;
    if (!current) {
      blurb = `Before England's qualifying campaigns in this game begin — the very start of the story.`;
    } else if (current.startYear === year) {
      blurb = `A fresh start — qualifying begins now for ${label(current)}.`;
    } else {
      blurb = `Qualifying already underway for ${label(current)}. Join the campaign in progress.`;
    }

    const preview = document.getElementById('era-preview');
    if (preview) {
      preview.innerHTML = `
        <div class="era-year">${year}</div>
        <div class="era-name">${mgrName} Era</div>
        <div class="era-desc">${blurb}</div>
      `;
    }
  },

  selectDiff(diff) {
    document.querySelectorAll('.diff-card').forEach(c => c.classList.toggle('selected', c.dataset.diff === diff));
  },

  startNewGame() {
    const name = (document.getElementById('ng-name').value || '').trim();
    if (!name) { document.getElementById('ng-name').focus(); return; }

    const yearSlider = document.getElementById('ng-year-slider');
    const diffEl = document.querySelector('.diff-card.selected');
    const era    = yearSlider ? +yearSlider.value : 1986;
    const diff   = diffEl ? diffEl.dataset.diff   : 'Professional';

    // Use dynamic player engine if available, fallback to static pools
    const getEraPool = (year) => {
      if (window.PlayerEngine && window.PLAYER_MASTER) {
        return window.PlayerEngine.getPool(year);
      }
      const static_ = {
        1986: window.PLAYERS_1986, 1990: window.PLAYERS_1990,
        1994: window.PLAYERS_1994, 1996: window.PLAYERS_1996,
        1998: window.PLAYERS_1998, 2000: window.PLAYERS_2000,
        2002: window.PLAYERS_2002, 2004: window.PLAYERS_2004,
        2006: window.PLAYERS_2006, 2008: window.PLAYERS_2008,
        2010: window.PLAYERS_2010, 2014: window.PLAYERS_2014,
        2018: window.PLAYERS_2018, 2022: window.PLAYERS_2022,
      };
      return static_[year] || window.PLAYERS_1986 || [];
    };

    // Find the first fixture matching this era
    const firstFixIdx = window.ALL_FIXTURES.findIndex(f => parseInt(f.date) >= era || f.date.startsWith(String(era)));

    State.reset();
    State.set('meta.manager',    name);
    State.set('meta.era',        era);
    State.set('meta.difficulty', diff);
    State.set('campaign.season', era);
    const startDate = window.getEraStartDate ? window.getEraStartDate(era) : era+'-01-01';
    State.set('campaign.campaignDate', startDate);
    State.set('campaign.seasonYear', era);
    State.set('campaign.completedFixtureIds', []);
    State.set('campaign.phase', 'qualifying');
    State.set('campaign.record', {w:0,d:0,l:0,gf:0,ga:0});
    State.set('campaign.boardConfidence', 60);
    State.set('campaign.playerStats', {});
    State.set('campaign.playerMorale', {});
    State.set('campaign.injuries', []);
    // Initialise qualifying cycle for this era
    if (window.CampaignPhase) {
      // mexico86 has no qualifying — start in 'between' so first fixture is World Cup
      if (era === 1986) {
        State.set('campaign.phase', 'between');
      } else {
        const cycle = window.CampaignPhase.getCurrentCycle();
        if (cycle) window.CampaignPhase.startQualifyingCycle(cycle);
      }
    }
    const startDate2 = window.getEraStartDate ? window.getEraStartDate(era) : era+'-01-01';
    const startIdx = window.getFirstFixtureIndex ? window.getFirstFixtureIndex(startDate2) : 0;
    State.set('campaign.fixtureIdx', startIdx);

    // Initialize qualifying cycle for this era
    if (window.CampaignPhase) {
      const cycle = window.CampaignPhase._cycles.find(c => c.startYear === era);
      if (cycle) {
        window.CampaignPhase.startQualifyingCycle(cycle);
      }
    }
    State.set('squad.pool', getEraPool(era));

    // Now initialise player stats from historical era data (pool must be set first)
    const eraPool = State.get('squad.pool') || [];
    const initStats = {};
    eraPool.forEach(p => {
      initStats[p.id] = {
        caps:  p.historicalCaps  || 0,
        goals: p.historicalGoals || 0,
        form:  [],
      };
    });
    State.set('campaign.playerStats', initStats);

    document.getElementById('newgame-overlay').remove();
    window.DashboardUI.init();
    UI.show('screen-dashboard');
  },

  load() {
    if (State.load()) {
      window.DashboardUI.init();
      UI.show('screen-dashboard');
    } else {
      alert('No saved game found.');
    }
  },
};
