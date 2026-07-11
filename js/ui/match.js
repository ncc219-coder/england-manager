/**
 * match.js — Live Match UI
 *
 * Drives the pitch visualisation and event feed.
 * Subscribes to MatchEngine2 events.
 * Ball moves smoothly between zones on an SVG pitch.
 */

window.MatchUI = {

  // Every visual transition duration in this screen is derived from this
  // single source rather than hardcoded — previously the ball/player
  // animations used a fixed 500ms transition regardless of how fast the
  // engine was actually ticking (400ms by default), meaning a new
  // position update reliably arrived BEFORE the previous transition had
  // finished, every single tick, all match. The old code then cancelled
  // the in-flight animation and snapped toward the new target instead,
  // which is exactly what reads as jittery, barely-moving players and a
  // ball that never settles into a clean, readable path. Capping at 85%
  // of the real tick interval (with a sane floor/ceiling) guarantees a
  // transition always finishes with real margin before the next one
  // starts, at whatever speed the player has actually configured.
  _visualDuration() {
    const tickMs = State.get('meta.settings.matchSpeed') || 400;
    return Math.max(120, Math.min(900, tickMs * 0.85));
  },

  init() {
    this._didSkip = false;
    const fixIdx = State.get('campaign.fixtureIdx');
    const fix    = window.ALL_FIXTURES[fixIdx];
    const squad  = (State.get('squad.slots') || []).filter(Boolean);

    if (!fix) {
      console.error('[MatchUI] No fixture at index', fixIdx);
      alert('Could not start the match — no fixture found. Returning to the dashboard.');
      window.DashboardUI.init();
      UI.show('screen-dashboard');
      return;
    }
    if (squad.length < 11) {
      console.error('[MatchUI] Need 11 players, got', squad.length);
      // Try one automatic recovery before giving up: pull from the full
      // squad pool to fill out the XI, exactly like kickOff()'s own
      // fallback does — covers the case where this got called directly
      // with an incomplete squad.slots array.
      const englandIds = new Set(State.get('squad.englandSquad') || []);
      const pool = (State.get('squad.pool') || []).filter(p => englandIds.has(p.id));
      const used = new Set(squad.map(p => p.id));
      const extras = pool.filter(p => !used.has(p.id));
      const filled = [...squad];
      while (filled.length < 11 && extras.length) filled.push(extras.shift());
      if (filled.length < 11) {
        alert(`Could not start the match — only ${filled.length} eligible players are available for selection. Open Squad Selection and check your England squad has enough players, then try again.`);
        window.DashboardUI.init();
        UI.show('screen-dashboard');
        return;
      }
      State.set('squad.slots', filled);
    }

    const screenEl = document.getElementById('screen-match');
    if (!screenEl) { console.error('[MatchUI] screen-match not found'); return; }

    // Cache which player ids are England's, for the pitch renderer to
    // colour-code dots correctly without calling into the live engine on
    // every single tick. Refreshed in the substitution handler below.
    this._engIds = new Set((State.get('squad.slots') || []).filter(Boolean).map(p => p.id));
    this._lastCarrierId = null;
    this._ballAnimTimers = [];

    const opp = window.getOppName ? window.getOppName(fix) : 'Opponent';
    screenEl.innerHTML = this._shell(fix, squad, opp);

    this._bindEngine();
    State.set('match.tactics', State.get('campaign.tactics') || {});

    // Short delay so DOM renders before engine starts
    setTimeout(() => window.MatchEngine2.start(), 80);
    if (window.Sound) { window.Sound.startCrowd(); window.Sound.play('whistle', 0.6); }
  },

  // ── SHELL ─────────────────────────────────────────────────────────────────

  _shell(fix, squad, opp) {
    const tac = State.get('campaign.tactics') || {};
    return `
    <div class="match-screen">

      <!-- Scoreboard -->
      <div class="match-sb">
        <div class="msb-left">
          <div class="msb-comp">${fix.comp || 'International'}</div>
          <div class="msb-venue">${fix.venue || ''}</div>
        </div>
        <div class="msb-score">
          <span class="msb-team">England</span>
          <span class="msb-num" id="s-eng">0</span>
          <span class="msb-sep">–</span>
          <span class="msb-num" id="s-opp">0</span>
          <span class="msb-team">${opp}</span>
        </div>
        <div class="msb-right">
          <div class="msb-clock" id="m-clock">0′</div>
          <div class="msb-period" id="m-period">Kick Off</div>
          <div class="msb-speed-controls" id="msb-speed-controls">
            <button class="msb-speed-btn" id="msb-speed-1x" onclick="MatchUI.setSpeed(300)" title="Normal speed">1×</button>
            <button class="msb-speed-btn" id="msb-speed-2x" onclick="MatchUI.setSpeed(120)" title="Fast">2×</button>
            <button class="msb-skip-btn" id="msb-skip-btn" onclick="MatchUI.skipToResult()" title="Skip to full time">Skip ▶▶</button>
          </div>
        </div>
      </div>
      <!-- Live scorers + cards strip -->
      <div class="match-meta-strip" id="match-meta-strip" style="display:flex;justify-content:space-between;align-items:center;padding:3px 14px;background:rgba(0,0,0,0.4);font-size:11px;min-height:18px">
        <span id="ms-scorers-eng" style="color:rgba(255,255,255,0.75);flex:1"></span>
        <span id="ms-cards" style="color:#f5c518;letter-spacing:0.05em"></span>
        <span id="ms-scorers-opp" style="color:rgba(255,255,255,0.55);flex:1;text-align:right"></span>
      </div>

      <!-- Main area: pitch + feed -->
      <div class="match-main">

        <!-- SVG Pitch -->
        <div class="match-pitch-wrap">
          <svg class="match-pitch" id="match-pitch-svg" viewBox="0 0 340 520" preserveAspectRatio="xMidYMid meet">
            <!-- Pitch background -->
            <rect width="340" height="520" fill="#2d5a1b" rx="4"/>
            <!-- Pitch stripes -->
            ${[0,1,2,3,4,5,6,7,8,9].map(i=>`<rect x="0" y="${i*52}" width="340" height="52" fill="${i%2===0?'#2d5a1b':'#315f1e'}" opacity="0.6"/>`).join('')}
            <!-- Pitch lines -->
            <rect x="20" y="20" width="300" height="480" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" rx="2"/>
            <!-- Centre circle -->
            <circle cx="170" cy="260" r="46" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <circle cx="170" cy="260" r="2" fill="rgba(255,255,255,0.6)"/>
            <!-- Halfway line -->
            <line x1="20" y1="260" x2="320" y2="260" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <!-- England penalty area (bottom) -->
            <rect x="85" y="390" width="170" height="110" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <rect x="125" y="440" width="90" height="60" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
            <!-- Opponent penalty area (top) -->
            <rect x="85" y="20" width="170" height="110" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <rect x="125" y="20" width="90" height="60" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
            <!-- Goal lines -->
            <rect x="130" y="10" width="80" height="12" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
            <rect x="130" y="498" width="80" height="12" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
            <!-- Team labels -->
            <text x="170" y="490" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="11" font-family="sans-serif">ENGLAND</text>
            <text x="170" y="38" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="11" font-family="sans-serif">${opp.toUpperCase()}</text>
            <!-- Player dots — populated/updated by _renderPlayerDots(), one
                 <g> per player created once then repositioned every tick -->
            <g id="pitch-players"></g>
            <!-- Ball -->
            <circle id="pitch-ball" cx="170" cy="260" r="7" fill="white" stroke="#333" stroke-width="1">
              <animate attributeName="opacity" values="1;0.7;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>
            <!-- Ball glow -->
            <circle id="pitch-ball-glow" cx="170" cy="260" r="13" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
            <!-- Carrier name label, follows the ball -->
            <text id="pitch-carrier-label" x="170" y="245" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="9" font-weight="700" font-family="sans-serif"></text>
            <!-- Goal flash overlay -->
            <rect id="pitch-goal-flash" x="0" y="0" width="340" height="520" fill="rgba(255,215,0,0.25)" opacity="0" rx="4"/>
          </svg>
          <!-- Possession bar -->
          <div class="match-poss-bar">
            <span class="mpb-label eng">ENG <span id="poss-eng">50</span>%</span>
            <div class="mpb-track">
              <div class="mpb-fill" id="poss-fill" style="width:50%"></div>
            </div>
            <span class="mpb-label opp"><span id="poss-opp">50</span>% ${opp}</span>
          </div>
        </div>

        <!-- Right panel: feed + controls -->
        <div class="match-panel">
          <!-- Tabs -->
          <div class="match-tabs">
            <button class="tab-btn active" onclick="MatchUI.tab('feed',this)">Feed</button>
            <button class="tab-btn" onclick="MatchUI.tab('xi',this)">XI</button>
            <button class="tab-btn" onclick="MatchUI.tab('subs',this)">Subs</button>
            <button class="tab-btn" onclick="MatchUI.tab('tac',this)">Tactics</button>
          </div>
          <div class="tab-panels">
            <div class="tab-panel active" id="tp-feed"></div>
            <div class="tab-panel" id="tp-xi"></div>
            <div class="tab-panel" id="tp-subs"></div>
            <div class="tab-panel" id="tp-tac"></div>
          </div>
        </div>

      </div>

      <!-- Goal overlay -->
      <div class="goal-overlay" id="goal-overlay">
        <div class="goal-word" id="g-word">GOAL!</div>
        <div class="goal-scorer" id="g-scorer"></div>
      </div>

    </div>`;
  },

  // ── ENGINE BINDING ────────────────────────────────────────────────────────

  _bindEngine() {
    const safe = fn => { try { fn(); } catch(e) { console.warn('[MatchUI]', e.message); } };

    // Clear any listeners a previous match left registered — the event
    // system genuinely accumulates multiple handlers per event now
    // (the fix for commentary never rendering), so without this, a
    // second match played in the same session would end up running
    // every one of the first match's listeners too.
    if (window.MatchEngine2.offAll) window.MatchEngine2.offAll();

    window.MatchEngine2.on('start', () => safe(() => {
      this._rebuildXI();
      this._rebuildSubs();
      this._rebuildTactics();
    }));

    window.MatchEngine2.on('tick', d => safe(() => {
      const clock = document.getElementById('m-clock');
      const period = document.getElementById('m-period');
      if (clock) clock.textContent = d.minute + '′';
      if (period) period.textContent = d.minute <= 45 ? '1st Half' : '2nd Half';
      this._updatePossBar(d.possession);
    }));

    window.MatchEngine2.on('ball', d => safe(() => {
      this._renderPlayerDots(d.positions);
      this._animateBall(d);
    }));

    window.MatchEngine2.on('event', d => safe(() => {
      this._addFeedItem(d);
      if (window.Sound && (d.type === 'booking_eng' || d.type === 'booking_opp')) {
        window.Sound.play('card', 0.4);
      }
    }));

    window.MatchEngine2.on('goal_eng', d => safe(() => {
      const score = State.get('match.score');
      const se = document.getElementById('s-eng');
      if (se) { se.textContent = score.eng; se.classList.add('goal-flash'); setTimeout(()=>se.classList.remove('goal-flash'),1200); }
      this._showGoalOverlay(false, d.scorer);
      this._flashPitch();
      this._updateMetaStrip();
      if (window.Sound) { window.Sound.duckCrowd(1800); window.Sound.play('goal', 0.8); }
    }));

    window.MatchEngine2.on('goal_opp', d => safe(() => {
      const score = State.get('match.score');
      const so = document.getElementById('s-opp');
      if (so) { so.textContent = score.opp; so.classList.add('goal-flash-opp'); setTimeout(()=>so.classList.remove('goal-flash-opp'),1200); }
      this._showGoalOverlay(true, null);
      this._updateMetaStrip();
      if (window.Sound) { window.Sound.duckCrowd(1200); window.Sound.play('goal', 0.45); }
    }));

    window.MatchEngine2.on('halftime', () => safe(() => {
      const p = document.getElementById('m-period');
      if (p) p.textContent = 'Half Time';
      if (window.Sound) window.Sound.play('whistle', 0.55);
      this._showHalfTimeOverlay();
    }));

    window.MatchEngine2.on('substitution', d => safe(() => {
      this._rebuildXI();
      this._rebuildSubs();
      this._engIds = new Set((State.get('squad.slots') || []).filter(Boolean).map(p => p.id));
      // Remove the substituted-off player's now-stale pitch dot so it
      // doesn't linger as an unmoving ghost for the rest of the match.
      if (d.off) { const ghost = document.getElementById('pdot-' + d.off.id); if (ghost) ghost.remove(); }
    }));

    window.MatchEngine2.on('event', d => safe(() => {
      if (d.type === 'booking_eng' || d.type === 'booking_opp' ||
          d.type === 'goal_eng_foot' || d.type === 'goal_eng_header' ||
          d.type === 'goal_opp_foot'  || d.type === 'goal_opp_header') {
        this._updateMetaStrip();
      }
    }));

    window.MatchEngine2.on('fulltime', () => safe(() => {
      const p = document.getElementById('m-period');
      if (p) p.textContent = 'Full Time';
      if (window.Sound) { window.Sound.play('whistle', 0.6); window.Sound.stopCrowd(); }
      // Skip the dead-wait if the player fast-forwarded to get here
      const wasSkipped = !!document.getElementById('skip-overlay') || this._didSkip;
      const pens = State.get('match.penalties');
      if (pens && pens.kicks && pens.kicks.length) {
        // A real shootout happened — reveal it kick by kick rather than
        // jumping straight to the result screen with just a final score.
        this._showShootoutOverlay(pens, wasSkipped);
      } else {
        setTimeout(() => window.ResultUI.init(), wasSkipped ? 200 : 1800);
      }
    }));
  },

  // ── PENALTY SHOOTOUT REVEAL ─────────────────────────────────────────────
  // match.penalties.kicks is the full, already-simulated kick list (see
  // MatchEngine2._simulatePenaltyShootout) — this just reveals it
  // progressively instead of dumping the final score on the player
  // instantly, which is the whole point of a shootout being dramatic.
  _showShootoutOverlay(pens, wasSkipped) {
    const screen = document.getElementById('screen-match');
    if (!screen) { window.ResultUI.init(); return; }
    const kicks = pens.kicks || [];
    const fix = window.ALL_FIXTURES[State.get('campaign.fixtureIdx')] || {};
    const oppLabel = (fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam) || 'Opponent';

    const engKicks = kicks.filter(k => k.side === 'eng');
    const oppKicks = kicks.filter(k => k.side === 'opp');
    const maxRows = Math.max(engKicks.length, oppKicks.length, 5);

    const dotsHtml = (list, align) => Array.from({ length: maxRows }, (_, i) => {
      const k = list[i];
      if (!k) return `<div class="so-dot so-dot-empty"></div>`;
      return `<div class="so-dot so-dot-hidden" data-order="${k.order}"></div>`;
    }).join('');

    const overlay = document.createElement('div');
    overlay.id = 'shootout-overlay';
    overlay.style.cssText = [
      'position:fixed;inset:0;z-index:600;background:rgba(6,10,8,0.97)',
      'display:flex;flex-direction:column;align-items:center;justify-content:center',
      'padding:24px',
    ].join(';');

    overlay.innerHTML = `
      <div style="max-width:460px;width:100%;text-align:center">
        <div style="font-family:var(--font-ui);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--t3);margin-bottom:8px">Penalty Shootout</div>
        <div id="so-score" style="font-family:var(--font-ui);font-size:56px;font-weight:900;color:var(--t1);margin-bottom:22px;letter-spacing:-.02em">0 – 0</div>
        <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:10px">
          <div style="flex:1;text-align:left;font-family:var(--font-ui);font-size:12px;letter-spacing:.1em;color:var(--t3);font-weight:700">ENGLAND</div>
          <div style="flex:1;text-align:right;font-family:var(--font-ui);font-size:12px;letter-spacing:.1em;color:var(--t3);font-weight:700">${oppLabel.toUpperCase()}</div>
        </div>
        <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:22px">
          <div id="so-eng" style="flex:1;display:flex;gap:6px;justify-content:flex-start">${dotsHtml(engKicks)}</div>
          <div id="so-opp" style="flex:1;display:flex;gap:6px;justify-content:flex-end">${dotsHtml(oppKicks)}</div>
        </div>
        <div id="so-current" style="min-height:24px;font-size:15px;color:var(--t2);font-style:italic;margin-bottom:22px"></div>
        <button id="so-continue-btn" onclick="window.ResultUI.init()"
          style="display:none;width:100%;padding:14px;background:var(--red);color:#fff;border:none;border-radius:10px;
                 font-family:var(--font-ui);font-size:15px;font-weight:800;cursor:pointer;letter-spacing:.06em;text-transform:uppercase">
          Continue ▶
        </button>
      </div>`;
    screen.appendChild(overlay);

    let engGoals = 0, oppGoals = 0;
    const delay = wasSkipped ? 120 : 650;
    kicks.forEach((k, i) => {
      setTimeout(() => {
        const dot = screen.querySelector(`[data-order="${k.order}"]`);
        if (dot) {
          dot.classList.remove('so-dot-hidden');
          dot.classList.add(k.scored ? 'so-dot-scored' : 'so-dot-missed');
          dot.textContent = k.scored ? '●' : '✕';
        }
        if (k.scored) { if (k.side === 'eng') engGoals++; else oppGoals++; }
        const scoreEl = document.getElementById('so-score');
        if (scoreEl) scoreEl.textContent = `${engGoals} – ${oppGoals}`;
        const curEl = document.getElementById('so-current');
        if (curEl) curEl.textContent = `${k.name} ${k.scored ? 'scores!' : 'misses!'}`;
        if (window.Sound) window.Sound.play(k.scored ? 'goal' : 'miss', 0.35);

        if (i === kicks.length - 1) {
          setTimeout(() => {
            const engWon = engGoals > oppGoals;
            if (curEl) curEl.textContent = engWon ? 'England win the shootout!' : `${oppLabel} win the shootout.`;
            const btn = document.getElementById('so-continue-btn');
            if (btn) btn.style.display = 'block';
          }, Math.max(delay, 500));
        }
      }, delay * (i + 1));
    });
  },

  // ── LIVE META STRIP ──────────────────────────────────────────────────────

  _updateMetaStrip() {
    const scorers = State.get('match.scorers') || {eng:[],opp:[]};
    const stats   = State.get('match.stats')   || {};
    const yEng = stats.yellowCards?.eng || 0;
    const yOpp = stats.yellowCards?.opp || 0;

    const engEl  = document.getElementById('ms-scorers-eng');
    const oppEl  = document.getElementById('ms-scorers-opp');
    const cardsEl = document.getElementById('ms-cards');

    if (engEl)   engEl.textContent  = scorers.eng.length ? '⚽ ' + scorers.eng.join(', ') : '';
    if (oppEl)   oppEl.textContent  = scorers.opp.length ? scorers.opp.join(', ') + ' ⚽' : '';
    if (cardsEl) cardsEl.textContent = (yEng > 0 ? '🟨'.repeat(Math.min(yEng,3)) + ' ENG' : '') +
                                       (yEng > 0 && yOpp > 0 ? '  ' : '') +
                                       (yOpp > 0 ? 'OPP ' + '🟨'.repeat(Math.min(yOpp,3)) : '');
  },

  // ── HALF-TIME OVERLAY ────────────────────────────────────────────────────

  _showHalfTimeOverlay() {
    const screen = document.getElementById('screen-match');
    if (!screen) return;
    const score = State.get('match.score') || {eng:0, opp:0};
    const fix   = window.ALL_FIXTURES[State.get('campaign.fixtureIdx')] || {};
    const opp   = fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam;
    const diff  = score.eng - score.opp;
    const situation = diff > 0 ? 'leading' : diff < 0 ? 'losing' : 'level';

    const talks = {
      inspire: {
        label: "Inspire",
        leading:  "We are leading — this game is won in the second half. Leave everything on that pitch.",
        level:    "It is level at half-time. Go out there and show what you are made of. No fear.",
        losing:   "We are better than this. Dig deep. I believe in every one of you.",
        effect: { momentum: 2.0 }
      },
      calm: {
        label: "Stay Calm",
        leading:  "Keep your shape. Do not give anything away. We control this from the back.",
        level:    "Stay disciplined. The goal will come. Trust the system.",
        losing:   "No panic. We execute the plan and the result will follow.",
        effect: { momentum: 0.5 }
      },
      tactical: {
        label: "Tactical",
        leading:  "Their right side is exposed. Win the second balls in midfield. Press higher.",
        level:    "Push the full-backs on. Work the width. We need to create overloads.",
        losing:   "Drop the line. Hit them on the counter. Be ruthless when the chance comes.",
        effect: { momentum: 1.2 }
      },
      freedom: {
        label: "Express Yourselves",
        leading:  "You have earned the right to play. Enjoy it. Play your natural game.",
        level:    "Do not overthink it. Play what is in front of you. Express yourselves.",
        losing:   "Forget the score. Play without fear. Give the fans something to remember.",
        effect: { momentum: 1.5 }
      },
    };

    const talkId  = State.get('campaign.lastTeamTalk') || 'calm';
    const talk    = talks[talkId] || talks.calm;
    const quote   = talk[situation];
    const ratings = State.get('match.ratings') || {};
    const slots   = (State.get('squad.slots') || []).filter(Boolean);
    const best    = slots.slice().sort((a,b)=>(ratings[b.id]||6.5)-(ratings[a.id]||6.5))[0];
    const worst   = slots.slice().sort((a,b)=>(ratings[a.id]||6.5)-(ratings[b.id]||6.5))[0];

    const overlay = document.createElement('div');
    overlay.id = 'ht-overlay';
    overlay.style.cssText = [
      'position:fixed;inset:0;z-index:500;background:rgba(8,8,14,0.96)',
      'display:flex;flex-direction:column;align-items:center;justify-content:center',
      'padding:24px;animation:fadeIn .4s ease',
    ].join(';');

    overlay.innerHTML = `
      <div style="max-width:480px;width:100%;text-align:center">
        <div style="font-family:var(--font-ui);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--t3);margin-bottom:8px">Half Time</div>
        <div style="font-family:var(--font-ui);font-size:54px;font-weight:900;color:var(--t1);letter-spacing:-.02em;margin-bottom:4px">
          <span style="color:var(--red)">${score.eng}</span>
          <span style="color:var(--t3);font-size:32px;margin:0 8px">–</span>
          <span>${score.opp}</span>
        </div>
        <div style="font-size:13px;color:var(--t3);margin-bottom:28px">England vs ${opp}</div>

        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:24px;text-align:left">
          <div style="font-family:var(--font-ui);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);margin-bottom:10px">Manager's Team Talk · ${talk.label}</div>
          <div style="font-size:15px;color:var(--t1);line-height:1.6;font-style:italic">${quote}</div>
        </div>

        ${best && worst && best.id !== worst.id ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
          <div style="background:rgba(29,158,117,0.12);border:1px solid rgba(29,158,117,0.25);border-radius:8px;padding:12px">
            <div style="font-size:11px;color:var(--t3);margin-bottom:4px">Top performer</div>
            <div style="font-weight:700;color:var(--t1)">${best.name}</div>
            <div style="font-family:var(--font-ui);font-size:18px;font-weight:800;color:#1D9E75">${(ratings[best.id]||6.5).toFixed(1)}</div>
          </div>
          <div style="background:rgba(220,50,50,0.08);border:1px solid rgba(220,50,50,0.2);border-radius:8px;padding:12px">
            <div style="font-size:11px;color:var(--t3);margin-bottom:4px">Needs more</div>
            <div style="font-weight:700;color:var(--t1)">${worst.name}</div>
            <div style="font-family:var(--font-ui);font-size:18px;font-weight:800;color:var(--red)">${(ratings[worst.id]||6.5).toFixed(1)}</div>
          </div>
        </div>` : ''}

        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:24px">
          ${Object.entries(talks).map(([id, t]) => `
            <button onclick="window.MatchUI._selectHalfTimeTalk('${id}')"
              style="background:${talkId===id?'var(--red)':'var(--bg3)'};border:1px solid ${talkId===id?'var(--red)':'var(--border)'};
                     color:${talkId===id?'#fff':'var(--t2)'};border-radius:8px;padding:10px 14px;
                     font-family:var(--font-ui);font-size:13px;font-weight:700;cursor:pointer;text-align:left">
              ${t.label}
            </button>`).join('')}
        </div>

        <button onclick="window.MatchUI._resumeFromHalfTime()"
          style="width:100%;padding:14px;background:var(--red);color:#fff;border:none;border-radius:10px;
                 font-family:var(--font-ui);font-size:15px;font-weight:800;cursor:pointer;letter-spacing:.06em;text-transform:uppercase">
          Second Half ▶
        </button>
      </div>`;

    screen.appendChild(overlay);
  },

  _selectHalfTimeTalk(id) {
    State.set('campaign.lastTeamTalk', id);
    // Re-render the overlay with updated selection
    const old = document.getElementById('ht-overlay');
    if (old) old.remove();
    this._showHalfTimeOverlay();
  },

  _resumeFromHalfTime() {
    const overlay = document.getElementById('ht-overlay');
    if (overlay) overlay.remove();
    // Apply momentum boost to engine state based on team talk
    const talkBoosts = { inspire:2.0, calm:0.5, tactical:1.2, freedom:1.5 };
    const talkId = State.get('campaign.lastTeamTalk') || 'calm';
    window.MatchEngine2.applyMomentumBoost(talkBoosts[talkId] || 0.5);
    window.MatchEngine2.resumeSecondHalf();
    if (window.Sound) { window.Sound.play('whistle', 0.5); window.Sound.startCrowd(); }
  },

  // ── BALL MOVEMENT ─────────────────────────────────────────────────────────

  // Coordinate mapping shared by all pitch rendering — normalised (0-1)
  // positions to the actual SVG viewBox (340x520, with a 20px margin on
  // every side matching the pitch boundary rect).
  _toSvgX(x) { return 20 + x * 300; },
  _toSvgY(y) { return 20 + y * 480; },

  // Draws/updates all 22 player dots. Created once per player id (so the
  // browser just repositions existing elements on subsequent ticks rather
  // than re-creating the whole pitch every second), colour-coded by side,
  // with the ball carrier highlighted distinctly.
  _renderPlayerDots(positions) {
    if (!positions) return;
    const g = document.getElementById('pitch-players');
    if (!g) return;
    const engIds = this._engIds || new Set();
    const carrierId = this._lastCarrierId;

    Object.entries(positions).forEach(([id, pos]) => {
      const isEng = engIds.has(id);
      let dot = document.getElementById('pdot-' + id);
      if (!dot) {
        dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.id = 'pdot-' + id;
        dot.setAttribute('r', '6');
        dot.style.transition = `cx ${this._visualDuration()}ms linear, cy ${this._visualDuration()}ms linear, r 0.2s, stroke-width 0.2s`;
        g.appendChild(dot);
      }
      dot.setAttribute('cx', this._toSvgX(pos.x));
      dot.setAttribute('cy', this._toSvgY(pos.y));
      dot.setAttribute('fill', isEng ? '#c8102e' : '#3a3a3a');
      dot.setAttribute('stroke', isEng ? '#fff' : '#ccc');
      const isCarrier = id === carrierId;
      dot.setAttribute('stroke-width', isCarrier ? '2.5' : '1');
      dot.setAttribute('r', isCarrier ? '7.5' : '6');
    });
  },

  // Steps the ball (and its glow + name label) through every waypoint in
  // the engine's pass sequence for this tick, each hop getting an even
  // share of the time before the next engine tick arrives — this is what
  // actually shows "defender to midfielder to striker" as a real visible
  // sequence rather than the ball jumping straight to the final zone.
  _animateBall(d) {
    const zone = d.zone;
    if (!zone) return;
    const ball  = document.getElementById('pitch-ball');
    const glow  = document.getElementById('pitch-ball-glow');
    const label = document.getElementById('pitch-carrier-label');
    if (!ball) return;

    const sequence = (d.passSequence && d.passSequence.length)
      ? d.passSequence
      : [{ x: zone.x, y: zone.y, playerId: null, playerName: null }];

    // Clear any in-flight animation timers from a previous tick so rapid
    // ticking (or fast-forward) doesn't pile up overlapping animations.
    if (this._ballAnimTimers) this._ballAnimTimers.forEach(t => clearTimeout(t));
    this._ballAnimTimers = [];

    const totalBudget = this._visualDuration();
    const hopDuration = Math.max(80, totalBudget / sequence.length); // ms per hop — the full sequence now genuinely fits within one real tick interval, with margin, at whatever speed is configured
    sequence.forEach((hop, i) => {
      const timer = setTimeout(() => {
        const svgX = this._toSvgX(hop.x);
        const svgY = this._toSvgY(hop.y);
        ball.style.transition = `cx ${hopDuration}ms linear, cy ${hopDuration}ms linear`;
        ball.setAttribute('cx', svgX);
        ball.setAttribute('cy', svgY);
        if (glow) { glow.setAttribute('cx', svgX); glow.setAttribute('cy', svgY); }
        if (label) {
          label.setAttribute('x', svgX);
          label.setAttribute('y', svgY - 12);
          label.textContent = hop.playerName ? hop.playerName.split(' ').pop() : '';
        }
        this._lastCarrierId = hop.playerId;
      }, i * hopDuration);
      this._ballAnimTimers.push(timer);
    });
  },

  _flashPitch() {
    const flash = document.getElementById('pitch-goal-flash');
    if (!flash) return;
    flash.setAttribute('opacity', '1');
    setTimeout(() => {
      flash.style.transition = 'opacity 1s';
      flash.setAttribute('opacity', '0');
    }, 400);
  },

  // ── FEED ──────────────────────────────────────────────────────────────────

  _addFeedItem(d) {
    const feed = document.getElementById('tp-feed');
    if (!feed) return;
    const div = document.createElement('div');
    div.className = `feed-item feed-${d.type || 'event'}`;
    div.innerHTML = `<span class="feed-min">${d.minute||d.min||0}′</span><span class="feed-icon">${d.icon||''}</span><span class="feed-text">${d.text||''}</span>`;
    feed.insertBefore(div, feed.firstChild); // newest at top
    // Limit feed length
    while (feed.children.length > 60) feed.removeChild(feed.lastChild);
  },

  // ── POSSESSION BAR ────────────────────────────────────────────────────────

  _updatePossBar(engPct) {
    const fill   = document.getElementById('poss-fill');
    const labEng = document.getElementById('poss-eng');
    const labOpp = document.getElementById('poss-opp');
    if (fill)   fill.style.width = engPct + '%';
    if (labEng) labEng.textContent = engPct;
    if (labOpp) labOpp.textContent = 100 - engPct;
  },

  // ── GOAL OVERLAY ──────────────────────────────────────────────────────────

  _showGoalOverlay(isOpp, scorer) {
    const ov = document.getElementById('goal-overlay');
    const gw = document.getElementById('g-word');
    const gs = document.getElementById('g-scorer');
    if (!ov) return;
    if (gw) gw.textContent = isOpp ? 'GOAL!' : 'GOAL!';
    if (gw) gw.style.color = isOpp ? '#E24B4A' : '#fff';
    if (gs) gs.textContent = scorer || '';
    ov.classList.remove('show');
    void ov.offsetWidth;
    ov.classList.add('show');
  },

  // ── XI / SUBS PANELS ──────────────────────────────────────────────────────

  // Mid-match tactics: shows the FULL picture as read-only (this is what
  // was actually set up pre-match, including roles/duties) plus a
  // deliberately limited set of emergency in-game overrides — the things
  // a real manager could plausibly shout from the touchline (mentality,
  // press intensity, tempo) rather than redesigning the whole system
  // live. Formation and individual roles stay fixed once kickoff happens;
  // changing the shape of a team mid-90-minutes isn't a quick shout.
  _rebuildTactics() {
    const el = document.getElementById('tp-tac');
    if (!el) return;
    const tac = State.get('match.tactics') || State.get('campaign.tactics') || {};
    const roleAssignments = tac.roles || {};
    const slots = State.get('squad.slots') || [];
    const formation = window.FORMATIONS?.[tac.formation] || [];

    const roleSummary = slots.map((p, i) => {
      if (!p) return '';
      const sl = formation[i];
      const assignment = roleAssignments[i] || {};
      const roleId = assignment.role || (window.Roles ? window.Roles.defaultRoleForSlot(sl?.pos) : null);
      const dutyId = assignment.duty || 'Support';
      const roleLabel = window.Roles?.ROLES[roleId]?.label || sl?.pos || '';
      return `<div class="tac-readonly-row"><span>${p.name.split(' ').pop()}</span><strong>${roleLabel}${dutyId!=='Support'?` (${dutyId})`:''}</strong></div>`;
    }).join('');

    const mentalities = ['Defensive','Cautious','Balanced','Positive','Attack'];
    const pressOpts   = ['None','Low','Mid','High','Intense'];
    const tempoOpts   = ['Slow','Normal','Fast'];

    el.innerHTML = `
      <div class="tac-readonly-block">
        <div class="tac-label">Set-Up (locked once the match has started)</div>
        <div class="tac-readonly-row"><span>Formation</span><strong>${tac.formation||'4-4-2'}</strong></div>
        <div class="tac-readonly-row"><span>Width</span><strong>${tac.width||'Normal'}</strong></div>
        <div class="tac-readonly-row"><span>Def. Line</span><strong>${tac.defensive_line||'Normal'}</strong></div>
        <div class="tac-readonly-row"><span>Set Pieces</span><strong>${tac.setpieces||'Mixed'}</strong></div>
        <div class="tac-readonly-row"><span>Transition</span><strong>${tac.transition||'Counter'}</strong></div>
      </div>
      <div class="tac-readonly-block" style="max-height:160px;overflow-y:auto">
        <div class="tac-label">Roles On The Pitch</div>
        ${roleSummary || '<div style="font-size:12px;color:var(--t4);padding:6px 0">No squad set.</div>'}
      </div>
      <div class="tac-section">
        <div class="tac-label">⚡ Emergency: Mentality</div>
        <div class="tac-opts">
          ${mentalities.map(m=>`<button class="tac-btn${tac.mentality===m?' active':''}"
            onclick="MatchUI._setTac('mentality','${m}')">${m}</button>`).join('')}
        </div>
      </div>
      <div class="tac-section">
        <div class="tac-label">⚡ Emergency: Press</div>
        <div class="tac-opts">
          ${pressOpts.map(p=>`<button class="tac-btn${tac.press===p?' active':''}"
            onclick="MatchUI._setTac('press','${p}')">${p}</button>`).join('')}
        </div>
      </div>
      <div class="tac-section">
        <div class="tac-label">⚡ Emergency: Tempo</div>
        <div class="tac-opts">
          ${tempoOpts.map(t=>`<button class="tac-btn${tac.tempo===t?' active':''}"
            onclick="MatchUI._setTac('tempo','${t}')">${t}</button>`).join('')}
        </div>
      </div>
      <div class="tac-applied" id="tac-applied"></div>`;
  },

  _setTac(key, val) {
    State.upd('match.tactics', t => ({ ...t, [key]: val }));
    State.upd('campaign.tactics', t => ({ ...t, [key]: val }));
    // Trigger engine to rebuild team stats
    if (window.MatchEngine2?.setTactic) {
      window.MatchEngine2.setTactic(key, val);
    }
    const fb = document.getElementById('tac-applied');
    if (fb) { fb.textContent = `${key.charAt(0).toUpperCase()+key.slice(1)} changed to ${val}`; }
    this._rebuildTactics();
  },

  _rebuildXI() {
    const el = document.getElementById('tp-xi');
    if (!el) return;
    const slots = (State.get('squad.slots') || []).filter(Boolean);
    el.innerHTML = slots.map(p => `
      <div class="xi-row">
        <span class="pos-badge ${p.posG?.toLowerCase()||'mid'}">${p.pos||p.posG}</span>
        <span class="xi-name">${p.name}</span>
        <span class="xi-rat">${p.rat||''}</span>
      </div>`).join('');
  },

  _rebuildSubs() {
    const el = document.getElementById('tp-subs');
    if (!el) return;
    const bench   = State.get('squad.bench') || [];
    const slots   = (State.get('squad.slots') || []).filter(Boolean);
    const subsUsed = State.get('match.subsUsed') || 0;

    if (!bench.length) { el.innerHTML = '<div class="subs-empty">No bench players</div>'; return; }

    el.innerHTML = `
      <div class="subs-used">${subsUsed}/3 substitutions used</div>
      <div class="subs-hint">Tap a bench player to bring on</div>
      <div class="subs-bench">
        ${bench.map(p => `
          <div class="sub-row" onclick="MatchUI._selectSub('${p.id}')" data-id="${p.id}">
            <span class="pos-badge ${p.posG?.toLowerCase()||'mid'}">${p.pos||p.posG}</span>
            <span class="sub-name">${p.name}</span>
            <span class="sub-rat">${p.rat||''}</span>
          </div>`).join('')}
      </div>
      <div class="subs-on">
        <div class="subs-on-label">Replace:</div>
        <div class="subs-xi">
          ${slots.map(p => `
            <div class="sub-row sub-xi-row" onclick="MatchUI._confirmSub('${p.id}')" data-id="${p.id}">
              <span class="pos-badge ${p.posG?.toLowerCase()||'mid'}">${p.pos||p.posG}</span>
              <span class="sub-name">${p.name}</span>
            </div>`).join('')}
        </div>
      </div>`;
  },

  _selectedSubIn: null,

  _selectSub(id) {
    this._selectedSubIn = id;
    document.querySelectorAll('.sub-row').forEach(r => r.classList.remove('selected'));
    const el = document.querySelector(`.sub-row[data-id="${id}"]`);
    if (el) el.classList.add('selected');
    // Show XI section for selecting who goes off
    const onEl = document.querySelector('.subs-on');
    if (onEl) onEl.style.display = 'block';
  },

  _confirmSub(offId) {
    if (!this._selectedSubIn) return;
    const success = window.MatchEngine2.makeSub(offId, this._selectedSubIn);
    if (success) {
      this._selectedSubIn = null;
      this._rebuildSubs();
    }
  },

  // ── TABS ──────────────────────────────────────────────────────────────────

  tab(name, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const panel = document.getElementById('tp-' + name);
    if (panel) panel.classList.add('active');
    if (name === 'tac') this._rebuildTactics();
  },

  // ── SPEED / SKIP CONTROLS ───────────────────────────────────────────────────

  setSpeed(ms) {
    State.upd('meta.settings', s => ({ ...(s||{}), matchSpeed: ms }));
    document.getElementById('msb-speed-1x')?.classList.toggle('active', ms === 300);
    document.getElementById('msb-speed-2x')?.classList.toggle('active', ms === 120);
  },

  skipToResult() {
    this._didSkip = true;
    const btn = document.getElementById('msb-skip-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Simulating…'; }

    // Show a brief overlay so the jump doesn't feel jarring
    const screen = document.getElementById('screen-match');
    if (screen && !document.getElementById('skip-overlay')) {
      const ov = document.createElement('div');
      ov.id = 'skip-overlay';
      ov.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(8,8,14,0.92);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px';
      ov.innerHTML = `
        <div style="font-family:var(--font-ui);font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--t3)">Simulating Remaining Minutes</div>
        <div class="skip-spinner"></div>`;
      screen.appendChild(ov);
    }

    setTimeout(() => {
      window.MatchEngine2.skipToEnd();
      const ov = document.getElementById('skip-overlay');
      if (ov) ov.remove();
    }, 350); // brief pause so the overlay is visible, not instant/jarring
  },

};
