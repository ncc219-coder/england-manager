/**
 * squad_new.js — Rebuilt team selection screen
 *
 * Two modes toggled by a tab in the top bar:
 *   PICK  — left: player list  |  right: pitch + bench + context strip
 *   PLAN  — left: player list  |  right: tabbed analytics panel
 *
 * Design principles:
 *   • No overlays or drawers sliding in over the main content
 *   • Context-sensitive info in the list depends on what slot is active
 *   • Single click to place, click again to remove
 *   • Everything visible at once; no hunting through tabs to find what matters
 */

window.SquadUI = (function () {

  // ── State ──────────────────────────────────────────────────────────────────
  let _mode       = 'pick';    // 'pick' | 'plan'
  let _filter     = 'ALL';
  let _search     = '';
  let _activeSlot = null;      // 0-10 or null
  let _selId      = null;      // selected player id for context strip
  let _planTab    = 'overview'; // overview | recommend | opponent | depth
  let _analysisMode = 'balanced';
  let _compareIds = []; // up to 2 player ids selected for comparison

  // ── List view / sort ─────────────────────────────────────────────────────
  // Three switchable column sets (FM-style "views"), each showing exactly
  // three value columns so the existing 8-column row grid never has to
  // change shape — only the labels and values in those three slots do.
  // Any column is click-to-sort; picking a new view resets to that view's
  // own sensible default sort rather than carrying over a sort key the
  // new columns don't even have.
  const VIEWS = {
    overview:  { label: 'Overview',   cols: [
      { key:'rat',     label:'Rat',  defaultDir:'desc' },
      { key:'form',    label:'Form', defaultDir:'desc' },
      { key:'caps',    label:'Cap',  defaultDir:'desc' },
    ]},
    condition: { label: 'Condition',  cols: [
      { key:'fitness', label:'Fit',  defaultDir:'desc' },
      { key:'morale',  label:'Mor',  defaultDir:'desc' },
      { key:'age',     label:'Age',  defaultDir:'asc'  },
    ]},
    attributes:{ label: 'Attributes', cols: [
      { key:'pac',     label:'Pac',  defaultDir:'desc' },
      { key:'wor',     label:'Wor',  defaultDir:'desc' },
      { key:'dec',     label:'Dec',  defaultDir:'desc' },
    ]},
  };
  let _view    = 'overview';
  let _sortKey = 'rat';
  let _sortDir = 'desc';

  // Resolves any sortable/displayable column key to a raw numeric value
  // for a given player — the single place that knows how to read each
  // stat, shared by both sorting and rendering so they can never disagree
  // with each other.
  function _colValue(p, key) {
    switch (key) {
      case 'rat':     return p.rat || 0;
      case 'caps':    return _caps(p) || 0;
      case 'age':     return p.age || 0;
      case 'fitness': return window.CampaignFitness ? window.CampaignFitness.currentFitness(p.id) : 100;
      case 'morale':  return _morale(p);
      case 'form': {
        const fm = _form(p);
        return fm === 'hot' ? 1 : fm === 'cold' ? -1 : 0;
      }
      default: {
        // Any raw attribute key (pac, wor, dec, etc.)
        const attrs = p.attrs || p.peakAttrs || {};
        return attrs[key] || 0;
      }
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  // Small standalone toast — used for things the manager should clearly
  // notice (e.g. a young player's confidence reacting to the occasion)
  // without interrupting flow the way alert() would. Auto-dismisses.
  function _showConfidenceToast(msg, isNegative) {
    try {
      if (typeof document === 'undefined') return;
      const old = document.getElementById('em-confidence-toast');
      if (old) old.remove();
      const el = document.createElement('div');
      el.id = 'em-confidence-toast';
      const accent = isNegative ? '#c8102e' : '#2e8b57';
      el.style.cssText = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);` +
        `z-index:9999;background:#1a1a1f;border:1px solid ${accent};color:#fff;` +
        `padding:12px 20px;border-radius:8px;font-family:system-ui,sans-serif;` +
        `font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.5);max-width:380px;text-align:center;line-height:1.4`;
      el.textContent = msg;
      document.body.appendChild(el);
      setTimeout(() => { const e2 = document.getElementById('em-confidence-toast'); if (e2) e2.remove(); }, 6000);
    } catch (e) { /* never let a notification crash the kickoff flow */ }
  }

  function _pool ()   { return State.get('squad.pool') || []; }
  function _slots ()  { return State.get('squad.slots') || Array(11).fill(null); }
  function _bench ()  { return State.get('squad.bench') || []; }
  function _tactics() { return State.get('campaign.tactics') || {}; }
  function _inUse ()  {
    return new Set([
      ..._slots().filter(Boolean).map(p=>p.id),
      ..._bench().map(p=>p.id),
    ]);
  }

  function _formation() {
    const name = _tactics().formation || window.DEFAULT_FORMATION || '4-4-2';
    return { name, slots: window.FORMATIONS[name] || window.FORMATIONS['4-4-2'] };
  }

  function _morale(p) {
    const m = (State.get('campaign.playerMorale') || {})[p.id];
    if (m !== undefined) return m;
    const s = [...(p.id||'')].reduce((a,c)=>a+c.charCodeAt(0),0);
    return Math.max(30, Math.min(95, Math.round(58 + (s % 17) - 8 + ((p.rat||70) - 70) * .1)));
  }

  function _form(p) {
    const fm = (State.get('campaign.playerStats')||{})[p.id]?.form || [];
    if (!fm.length) return null; // no history yet
    const avg = fm.reduce((a,v)=>a+v,0)/fm.length;
    return avg > 0.3 ? 'hot' : avg < -0.3 ? 'cold' : 'ok';
  }

  function _isInjured(p) {
    return (State.get('campaign.injuries')||[]).some(i=>i.id===p.id);
  }

  function _trainingDrill(p) {
    const drills = State.get('campaign.individualDrills') || {};
    const drillId = drills[p.id];
    if (!drillId || !window.Training) return null;
    return window.Training.DRILLS[drillId] || null;
  }

  function _caps(p) {
    return (State.get('campaign.playerStats')||{})[p.id]?.caps ?? p.historicalCaps ?? 0;
  }

  function _posCompat(player, slotPosG) {
    if (player.posG === slotPosG) return 'ok';
    const near = { MID:['DEF','FWD'], DEF:['MID'], FWD:['MID'] };
    return (near[player.posG]||[]).includes(slotPosG) ? 'warn' : 'bad';
  }

  function _squadPlayers() {
    const ids = new Set(State.get('squad.englandSquad') || []);
    return _pool().filter(p => ids.has(p.id));
  }

  function _ensureSquad() {
    const pool = _pool();
    let ids = State.get('squad.englandSquad') || [];
    const valid = new Set(pool.map(p=>p.id));
    ids = ids.filter(id => valid.has(id));
    if (!ids.length && pool.length) {
      const order = {GK:0,DEF:1,MID:2,FWD:3};
      // At true game start there's no form/morale/fitness history yet to
      // differentiate players on — but age still matters: a 30-year-old
      // and a 21-year-old at an identical rating are not equally good
      // long-term squad picks, so a small age-aware adjustment breaks
      // ties between similarly-rated players rather than defaulting to
      // pure rating alone.
      const ageAdjustedScore = p => (p.rat||70) + (p.age && p.age <= 23 ? 2 : p.age && p.age >= 31 ? -2 : 0);
      const sorted = [...pool].sort((a,b)=>(order[a.posG]-order[b.posG])||(ageAdjustedScore(b)-ageAdjustedScore(a)));
      ids = [...new Set([
        ...sorted.filter(p=>p.posG==='GK').slice(0,3),
        ...sorted.filter(p=>p.posG==='DEF').slice(0,8),
        ...sorted.filter(p=>p.posG==='MID').slice(0,9),
        ...sorted.filter(p=>p.posG==='FWD').slice(0,6),
      ].map(p=>p.id))].slice(0,26);
      State.set('squad.englandSquad', ids);
    }
    return ids;
  }

  function _ratClass(r) {
    return r >= 88 ? 'elite' : r >= 80 ? 'good' : r >= 72 ? 'avg' : 'poor';
  }

  // Shared fitness badge — same underlying value/label CampaignFitness
  // already computes for the squad screen's Condition view, reused here
  // so Plan mode's analysis is never quietly out of sync with what Pick
  // mode shows for the same player.
  function _fitBadge(p) {
    if (!window.CampaignFitness) return '';
    const val = window.CampaignFitness.currentFitness(p.id);
    const info = window.CampaignFitness.fitnessLabel(val);
    const cls = val>=90?'fresh':val>=70?'good':val>=50?'tiring':val>=30?'jaded':'exhausted';
    return `<span class="sq2-fit-badge ${cls}" title="${info.label}">${val}%</span>`;
  }

  function _selScore(p) {
    // Selection priority: adjusted rating + form + confidence + position
    // need + CURRENT fitness. A tired player is a genuinely worse pick
    // right now, not just something that quietly costs them mid-match —
    // the manager should see and weigh this BEFORE kicking off, exactly
    // the kind of real rotation decision that shouldn't be reducible to
    // "who has the highest rating."
    const slots = _slots().filter(Boolean);
    const counts = {GK:0,DEF:0,MID:0,FWD:0};
    slots.forEach(x=>{ if(counts[x.posG]!==undefined) counts[x.posG]++; });
    const targets = {GK:1,DEF:4,MID:4,FWD:2};
    const need = counts[p.posG] < targets[p.posG] ? 8 : 0;
    const fm = _form(p);
    const formBonus = fm === 'hot' ? 6 : fm === 'cold' ? -4 : 0;
    const moraleBonus = (_morale(p) - 65) * 0.1;
    const fitness = window.CampaignFitness ? window.CampaignFitness.currentFitness(p.id) : 100;
    // Below ~70% fitness starts costing real selection points; below 40%
    // it's a serious red flag a manager should notice, not a footnote.
    const fitnessBonus = fitness >= 90 ? 2 : fitness >= 70 ? 0 : fitness >= 50 ? -6 : fitness >= 30 ? -14 : -22;
    return (p.rat||70) + need + formBonus + moraleBonus + fitnessBonus;
  }

  function _fix() {
    const idx = State.get('campaign.fixtureIdx');
    return window.ALL_FIXTURES?.[idx] || {};
  }

  function _oppName() {
    const fix = _fix();
    return window.getOppName ? window.getOppName(fix)
      : (fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam) || 'Opponent';
  }

  // ── Shell ──────────────────────────────────────────────────────────────────
  function _shell() {
    const fix = _fix();
    const opp = _oppName();
    const matchStr = fix.homeTeam === 'England'
      ? `England vs ${opp}` : `${fix.homeTeam || opp} vs England`;

    return `
      <div class="sq2-topbar">
        <div class="sq2-match-info">
          <div class="sq2-mi-comp">${fix.comp || 'International'}</div>
          <div class="sq2-mi-fixture">${matchStr}</div>
          <div class="sq2-mi-sub">${fix.venue || ''} · ${fix.date ? new Date(fix.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : ''}</div>
        </div>
        <div class="sq2-mode-tabs">
          <button class="sq2-mode-tab active" id="sq2-tab-pick" onclick="SquadUI.setMode('pick')">
            <span class="sq2-tab-icon">◉</span> Pick XI
          </button>
          <button class="sq2-mode-tab" id="sq2-tab-plan" onclick="SquadUI.setMode('plan')">
            <span class="sq2-tab-icon">⊞</span> Plan
          </button>
        </div>
        <div class="sq2-topbar-actions">
          <div class="sq2-xi-status" id="sq2-xi-status">0 / 11</div>
          <button class="sq2-btn sq2-btn-ghost" onclick="SquadUI.autoFillXI()" title="Auto-pick best XI">⚡ Auto</button>
          <button class="sq2-btn sq2-btn-ghost" onclick="PlayersUI.init('squad');UI.show('screen-players')">Manage Squad</button>
          <button class="sq2-btn sq2-btn-ghost" onclick="TacticsUI.init('squad');UI.show('screen-tactics')">Roles & Tactics</button>
          <button class="sq2-btn sq2-btn-back" onclick="SquadUI.back()">← Back</button>
          <button class="sq2-btn sq2-btn-kick" id="sq2-kickoff" onclick="SquadUI.kickOff()">Kick Off ▶</button>
        </div>
      </div>

      <div class="sq2-body" id="sq2-body">

        <!-- LEFT: player list (always visible) -->
        <div class="sq2-list-panel">
          <div class="sq2-list-toolbar">
            <div class="sq2-pos-filters" id="sq2-pos-filters">
              ${['ALL','GK','DEF','MID','FWD'].map(p=>
                `<button class="sq2-pf${p==='ALL'?' active':''}" data-pos="${p}">${p}</button>`
              ).join('')}
            </div>
            <input class="sq2-search" id="sq2-search" placeholder="Search…" autocomplete="off">
          </div>

          <!-- View switcher: FM-style column sets, each with its own sort -->
          <div class="sq2-view-tabs" id="sq2-view-tabs">
            ${Object.keys(VIEWS).map(v =>
              `<button class="sq2-view-tab${v===_view?' active':''}" data-view="${v}" onclick="SquadUI.setView('${v}')">${VIEWS[v].label}</button>`
            ).join('')}
          </div>

          <!-- Context strip: shows relevant info about active slot or selected player -->
          <div class="sq2-context-strip" id="sq2-context-strip">
            <div class="sq2-cs-hint">Click a pitch slot to target it, then click a player to fill it</div>
          </div>

          <!-- Column header — sortable, populated by _renderColHead() -->
          <div class="sq2-col-head" id="sq2-col-head"></div>

          <div class="sq2-rows" id="sq2-rows"></div>
        </div>

        <!-- RIGHT PICK MODE: pitch + bench -->
        <div class="sq2-right-panel" id="sq2-right-pick">

          <!-- Formation bar -->
          <div class="sq2-form-bar" id="sq2-form-bar"></div>

          <!-- Pitch -->
          <div class="sq2-pitch-wrap">
            <div class="sq2-pitch-inner">
              <!-- Pitch markings SVG -->
              <svg class="sq2-pitch-svg" viewBox="0 0 320 240" preserveAspectRatio="none">
                <rect x="4" y="4" width="312" height="232" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>
                <line x1="4" y1="120" x2="316" y2="120" stroke="rgba(255,255,255,.2)" stroke-width="1"/>
                <circle cx="160" cy="120" r="34" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
                <circle cx="160" cy="120" r="3" fill="rgba(255,255,255,.3)"/>
                <!-- Pen boxes -->
                <rect x="4" y="86" width="52" height="68" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
                <rect x="264" y="86" width="52" height="68" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
                <!-- Goals -->
                <rect x="136" y="0" width="48" height="8" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.2)" stroke-width="1"/>
                <rect x="136" y="232" width="48" height="8" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.2)" stroke-width="1"/>
              </svg>
              <div class="sq2-slots" id="sq2-slots"></div>
            </div>
          </div>

          <!-- Bench -->
          <div class="sq2-bench-section">
            <div class="sq2-bench-header">
              <span class="sq2-bench-label">Bench</span>
              <span class="sq2-bench-count" id="sq2-bench-count">0 / 5</span>
            </div>
            <div class="sq2-bench-row" id="sq2-bench-row"></div>
          </div>

          <!-- Warnings -->
          <div class="sq2-warnings" id="sq2-warnings"></div>

        </div>

        <!-- RIGHT PLAN MODE: analytics tabs -->
        <div class="sq2-right-panel sq2-plan-panel hidden" id="sq2-right-plan">
          <div class="sq2-plan-tabs" id="sq2-plan-tabs">
            ${[['overview','Overview'],['recommend','Recommended XI'],['opponent','Opponent Prep'],['depth','Depth']]
              .map(([id,lbl])=>`<button class="sq2-plan-tab${id==='overview'?' active':''}" data-plan-tab="${id}">${lbl}</button>`).join('')}
          </div>
          <div class="sq2-plan-body" id="sq2-plan-body"></div>
        </div>

      </div>`;
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    const el = $('screen-squad');
    if (!el) return;
    _ensureSquad();
    // Reset active slot and compare tray when re-entering screen
    _activeSlot = null;
    _compareIds = [];
    el.innerHTML = _shell();
    _bindEvents();
    _refresh();
  }

  function _bindEvents() {
    // Position filters
    document.querySelectorAll('.sq2-pf').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sq2-pf').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        _filter = btn.dataset.pos;
        _renderList();
      });
    });

    // Search
    const s = $('sq2-search');
    if (s) s.addEventListener('input', e => { _search = e.target.value.toLowerCase(); _renderList(); });

    // Plan tabs
    document.querySelectorAll('.sq2-plan-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        _planTab = btn.dataset.planTab;
        document.querySelectorAll('.sq2-plan-tab').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        _renderPlanBody();
      });
    });
  }

  // ── Mode switch ────────────────────────────────────────────────────────────
  function setMode(m) {
    _mode = m;
    const pickPanel = $('sq2-right-pick');
    const planPanel = $('sq2-right-plan');
    const tabPick   = $('sq2-tab-pick');
    const tabPlan   = $('sq2-tab-plan');

    if (_mode === 'pick') {
      pickPanel?.classList.remove('hidden');
      planPanel?.classList.add('hidden');
      tabPick?.classList.add('active');
      tabPlan?.classList.remove('active');
    } else {
      pickPanel?.classList.add('hidden');
      planPanel?.classList.remove('hidden');
      tabPick?.classList.remove('active');
      tabPlan?.classList.add('active');
      _renderPlanBody();
    }
    _renderList(); // list info changes based on mode
  }

  // ── Full refresh ───────────────────────────────────────────────────────────
  function _refresh() {
    _renderFormBar();
    _renderPitch();
    _renderBench();
    _renderColHead();
    _renderList();
    _renderContextStrip();
    _renderWarnings();
    _updateStatus();
    if (_mode === 'plan') _renderPlanBody();
  }

  // ── Formation bar ──────────────────────────────────────────────────────────
  function _renderFormBar() {
    const el = $('sq2-form-bar');
    if (!el) return;
    const current = _formation().name;
    el.innerHTML = Object.keys(window.FORMATIONS || {}).map(f =>
      `<button class="sq2-form-btn${f===current?' active':''}" onclick="SquadUI.setFormation('${f}')">${f}</button>`
    ).join('');
  }

  // ── Pitch ──────────────────────────────────────────────────────────────────
  function _renderPitch() {
    const el = $('sq2-slots');
    if (!el) return;
    const slots = _slots();
    const { slots: form } = _formation();
    const capId = State.get('campaign.captainId');

    // Position slots on the pitch using row/col from formation
    const rows = [...new Set(form.map(s=>s.row))].sort((a,b)=>b-a);
    const rowCount = rows.length;

    // Pitch is 320×240, positions within the inner area (accounts for pitch markings)
    // We place attacker rows near top, GK at bottom (England attacks up)
    const yForRow = (rowIdx) => 28 + rowIdx * (188 / Math.max(rowCount-1, 1));
    const xForCol = (slotIdx, rowSlots) => {
      const count = rowSlots.length;
      return 160 + (slotIdx - (count-1)/2) * Math.min(72, 280/Math.max(count,1));
    };

    // Compute coordinates
    const coords = {};
    rows.forEach((r, ri) => {
      const rowSlots = form.map((sl,i)=>({...sl,i})).filter(sl=>sl.row===r).reverse();
      rowSlots.forEach((sl, si) => {
        coords[sl.i] = {
          x: xForCol(si, rowSlots),
          y: yForRow(ri),
        };
      });
    });

    el.innerHTML = form.map((sl, i) => {
      const p      = slots[i];
      const {x,y}  = coords[i] || {x:160,y:120};
      const isAct  = _activeSlot === i;
      const isCap  = p && p.id === capId;
      const isWarn = p ? _posCompat(p, sl.posG) === 'warn' : false;
      const isBad  = p ? _posCompat(p, sl.posG) === 'bad'  : false;
      const isInj  = p ? _isInjured(p) : false;
      const fm     = p ? _form(p) : null;
      const fitnessVal = (p && window.CampaignFitness) ? window.CampaignFitness.currentFitness(p.id) : 100;
      const fitnessTired = fitnessVal < 70;

      let cls = 'sq2-slot';
      if (p)     cls += ' filled';
      if (isAct) cls += ' active';
      if (isWarn) cls += ' warn';
      if (isBad)  cls += ' bad';
      if (isCap)  cls += ' captain';
      if (isInj)  cls += ' injured';

      const posLabel = sl.pos || sl.posG;
      const roleAssignments = State.get('campaign.tactics.roles') || {};
      const assignment = roleAssignments[i] || {};
      const roleId = assignment.role || (window.Roles ? window.Roles.defaultRoleForSlot(sl.pos) : null);
      const roleLabel = window.Roles?.ROLES[roleId]?.label;
      const dutyId = assignment.duty || 'Support';
      // Only flag a poor fit when the manager has EXPLICITLY chosen this
      // role — an unconfigured default carries no judgement, since the
      // engine doesn't even apply it (see match2.js's _buildPlayers()).
      const fitScore = (assignment.role && p && window.Roles) ? window.Roles.roleFit(p, roleId).score : null;
      const poorFit = fitScore !== null && fitScore < 40;

      return `<div class="${cls}" data-slot="${i}"
        style="left:${x}px;top:${y}px;transform:translate(-50%,-50%)"
        onclick="SquadUI._slotClick(${i})">
        ${p ? `
          <div class="sq2-slot-rat ${_ratClass(p.rat)}">${p.rat}</div>
          <div class="sq2-slot-abbr">${p.name.split(' ').pop().substring(0,5).toUpperCase()}</div>
          <div class="sq2-slot-name">${p.name.split(' ').pop()}</div>
          ${roleLabel ? `<div class="sq2-slot-role" style="${poorFit?'color:#ff8866':''}">${poorFit?'⚠ ':''}${roleLabel}${dutyId!=='Support'?` (${dutyId[0]})`:''}</div>` : ''}
          ${isCap ? '<div class="sq2-slot-cap">©</div>' : ''}
          ${fm === 'hot' ? '<div class="sq2-slot-form hot">▲</div>' : fm === 'cold' ? '<div class="sq2-slot-form cold">▼</div>' : ''}
          ${isInj ? '<div class="sq2-slot-inj">!</div>' : ''}
          ${!isInj && fitnessTired ? `<div class="sq2-slot-fitness" title="Fitness: ${fitnessVal}%">${fitnessVal<40?'🔴':'🟡'}</div>` : ''}
          <button class="sq2-slot-remove" onclick="event.stopPropagation();SquadUI._removeSlot(${i})">✕</button>
        ` : `
          <div class="sq2-slot-empty-pos">${posLabel}</div>
          <div class="sq2-slot-empty-hint">Click to target</div>
        `}
      </div>`;
    }).join('');
  }

  // ── Bench ──────────────────────────────────────────────────────────────────
  function _renderBench() {
    const el = $('sq2-bench-row');
    const cnt = $('sq2-bench-count');
    const bench = _bench();
    if (el) el.innerHTML = bench.map((p,i) => `
      <div class="sq2-bench-item${_selId===p.id?' sel':''}" onclick="SquadUI._benchClick('${p.id}')">
        <span class="sq2-bi-pos pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
        <span class="sq2-bi-name">${p.name}</span>
        <span class="sq2-bi-rat ${_ratClass(p.rat)}">${p.rat}</span>
        <button class="sq2-bi-remove" onclick="event.stopPropagation();SquadUI._removeBench(${i})">✕</button>
      </div>`).join('') +
      (bench.length < 5 ? '<div class="sq2-bench-empty">+ Add bench players from list</div>' : '');
    if (cnt) cnt.textContent = bench.length + ' / 5';
  }

  // ── Context strip ──────────────────────────────────────────────────────────
  function _renderContextStrip() {
    const el = $('sq2-context-strip');
    if (!el) return;

    // Priority: active slot → selected player → generic hint
    if (_activeSlot !== null) {
      const { slots: form } = _formation();
      const sl = form[_activeSlot];
      const existing = _slots()[_activeSlot];
      if (existing) {
        // Slot is filled and active — show player details + swap hint
        const p = existing;
        const m = _morale(p);
        const fm = _form(p);
        const fmStr = fm === 'hot' ? '🔥 Hot form' : fm === 'cold' ? '↓ Poor form' : '';
        el.innerHTML = `
          <div class="sq2-cs-active">
            <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
            <div class="sq2-cs-info">
              <strong>${p.name}</strong>
              <span>${p.club||''} · Age ${p.age||'—'} · ${_caps(p)} caps${fmStr?' · '+fmStr:''}</span>
            </div>
            <div class="sq2-cs-stat"><span>Rating</span><strong>${p.rat}</strong></div>
            <div class="sq2-cs-stat"><span>Morale</span><strong>${m}</strong></div>
            <div class="sq2-cs-swap">Click a player to swap ↔</div>
          </div>`;
      } else {
        // Empty slot — show what position is needed
        const posLabel = sl ? (sl.pos || sl.posG) : '?';
        el.innerHTML = `
          <div class="sq2-cs-empty-slot">
            <span class="sq2-cs-slot-target">Slot ${_activeSlot+1}</span>
            <strong class="sq2-cs-slot-pos">${posLabel}</strong>
            <span>Now click a ${sl?.posG||'player'} from the list to fill this slot</span>
            <button class="sq2-cs-clear" onclick="SquadUI._clearActive()">Clear</button>
          </div>`;
      }
    } else if (_selId) {
      const pool = _pool();
      const p = pool.find(x=>x.id===_selId);
      if (p) {
        const m   = _morale(p);
        const fm  = _form(p);
        const inj = _isInjured(p);
        const inXI    = _slots().some(s=>s&&s.id===p.id);
        const onBench = _bench().some(b=>b.id===p.id);
        const fmStr = fm === 'hot' ? '🔥 Hot' : fm === 'cold' ? '↓ Cold' : '→ Steady';
        el.innerHTML = `
          <div class="sq2-cs-player">
            <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
            <div class="sq2-cs-info">
              <strong>${p.name}</strong>
              <span>${p.club||''} · Age ${p.age||'—'} · ${_caps(p)} caps</span>
            </div>
            <div class="sq2-cs-stat"><span>Rating</span><strong class="${_ratClass(p.rat)}">${p.rat}</strong></div>
            <div class="sq2-cs-stat"><span>Morale</span><strong>${m}</strong></div>
            <div class="sq2-cs-stat"><span>Form</span><strong>${fmStr}</strong></div>
            ${inj ? '<div class="sq2-cs-inj">⚠ Injured</div>' : ''}
            <div class="sq2-cs-status">${inXI ? '✓ Starting' : onBench ? '✓ Bench' : 'Available'}</div>
          </div>`;
        if (p.bio) {
          el.innerHTML += `<div class="sq2-cs-bio">${p.bio.length > 120 ? p.bio.substring(0,120)+'…' : p.bio}</div>`;
        }
      }
    } else {
      const xi = _slots().filter(Boolean).length;
      const bench = _bench().length;
      el.innerHTML = `
        <div class="sq2-cs-hint">
          <span><strong>${xi}/11</strong> starters · <strong>${bench}/5</strong> bench</span>
          <span>·</span>
          <span>Click a pitch slot to target it, then a player to fill it</span>
          <span>·</span>
          <span>Or click any player in the list to auto-place</span>
        </div>`;
    }
  }

  // ── Player list ────────────────────────────────────────────────────────────
  function _renderList() {
    const el = $('sq2-rows');
    if (!el) return;

    const squad  = _squadPlayers();
    const inUse  = _inUse();
    const slots  = _slots();
    const { slots: form } = _formation();

    // Determine active slot posG for compatibility highlighting
    const activeSlotPosG = _activeSlot !== null ? (form[_activeSlot]?.posG || null) : null;

    const list = squad
      .filter(p => _filter === 'ALL' || p.posG === _filter)
      .filter(p => !_search ||
        p.name.toLowerCase().includes(_search) ||
        (p.club||'').toLowerCase().includes(_search));

    const ctx = { inUse, slots, activeSlotPosG };

    // Column-based sort the player controls (via clicking a header) — no
    // longer a fixed, unchangeable order. When targeting a pitch slot,
    // position-compatibility takes priority regardless of the chosen
    // sort, since "can this player even play here" matters more than
    // whatever column happens to be sorted in that specific moment.
    const sortFn = (a, b) => {
      if (activeSlotPosG) {
        const ca = _posCompat(a, activeSlotPosG), cb = _posCompat(b, activeSlotPosG);
        const rank = { ok:0, warn:1, bad:2 };
        if (rank[ca] !== rank[cb]) return rank[ca] - rank[cb];
      }
      if (_sortKey === 'name') {
        const diff = a.name.localeCompare(b.name);
        return _sortDir === 'asc' ? diff : -diff;
      }
      if (_sortKey === 'pos') {
        const posOrder = { GK:0, DEF:1, MID:2, FWD:3 };
        const diff = (posOrder[a.posG]||0) - (posOrder[b.posG]||0);
        return (_sortDir === 'asc' ? diff : -diff) || a.name.localeCompare(b.name);
      }
      const va = _colValue(a, _sortKey), vb = _colValue(b, _sortKey);
      const diff = _sortDir === 'asc' ? va - vb : vb - va;
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    };

    // Grouped-by-position view (with section headers) only makes sense
    // when actually looking at every position at once — filtering to one
    // position already IS a single group, and the active-slot-targeting
    // context wants a flat list ranked by fit, not broken up further.
    const grouped = _filter === 'ALL' && activeSlotPosG === null;

    if (!grouped) {
      const sorted = [...list].sort(sortFn);
      el.innerHTML = sorted.map(p => _renderRow(p, ctx)).join('');
      return;
    }

    const GROUPS = [
      { key:'GK',  label:'Goalkeepers' },
      { key:'DEF', label:'Defenders' },
      { key:'MID', label:'Midfielders' },
      { key:'FWD', label:'Forwards' },
    ];
    el.innerHTML = GROUPS.map(g => {
      const members = list.filter(p => p.posG === g.key).sort(sortFn);
      if (!members.length) return '';
      return `<div class="sq2-group-head">${g.label} <span class="sq2-group-count">${members.length}</span></div>`
        + members.map(p => _renderRow(p, ctx)).join('');
    }).join('');
  }

  function _renderRow(p, { inUse, slots, activeSlotPosG }) {
    const u      = inUse.has(p.id);
    const si     = slots.findIndex(s=>s&&s.id===p.id);
    const onB    = _bench().some(b=>b.id===p.id);
    const inj    = _isInjured(p);
    const drill  = _trainingDrill(p);
    const isSel  = _selId === p.id;

    // Compatibility with active slot
    let compatCls = '';
    if (activeSlotPosG && !u) {
      const c = _posCompat(p, activeSlotPosG);
      if (c === 'ok')   compatCls = ' sq2-compat-ok';
      if (c === 'warn') compatCls = ' sq2-compat-warn';
      if (c === 'bad')  compatCls = ' sq2-compat-bad';
    }

    const statusLabel = si >= 0 ? `XI` : onB ? `BN` : '';
    const statusCls   = si >= 0 ? 'sq2-status-xi' : onB ? 'sq2-status-bench' : '';

    // Context-dependent right-side info
    let rightCols = '';
    if (_activeSlot !== null && activeSlotPosG && !u) {
      // Targeting a pitch slot — position fit matters more than whatever
      // view/columns are currently selected, so this always overrides.
      const compat = _posCompat(p, activeSlotPosG);
      const compatLabel = compat === 'ok' ? '✓' : compat === 'warn' ? '~' : '✗';
      const compatColor = compat === 'ok' ? 'var(--green)' : compat === 'warn' ? 'var(--gold)' : 'var(--red)';
      rightCols = `
        <span class="sq2-col-c" style="font-size:18px;font-weight:700;color:${compatColor}">${compatLabel}</span>
        <span class="sq2-col-c sq2-rat ${_ratClass(p.rat)}">${p.rat}</span>
        <span class="sq2-col-c" style="color:var(--t3)">${_caps(p)}</span>`;
    } else {
      rightCols = VIEWS[_view].cols.map(c => _renderColCell(p, c.key)).join('');
    }

    return `<div class="sq2-row${u?' used':''}${isSel?' sel':''}${inj?' inj':''}${compatCls}"
      data-id="${p.id}" onclick="SquadUI._playerClick('${p.id}')">
      <span class="sq2-row-status ${statusCls}">${statusLabel}</span>
      <span class="pos-badge ${UI.posClass(p.posG)} sq2-row-pos">${p.pos}</span>
      <div class="sq2-row-info">
        <div class="sq2-row-name">
          ${p.name}
          ${inj ? '<span class="sq2-inj-tag">INJ</span>' : ''}
          ${drill ? `<span class="sq2-inj-tag" style="background:rgba(55,138,221,.15);color:#6688ff" title="${drill.label}">${drill.icon}</span>` : ''}
        </div>
        <div class="sq2-row-sub">${p.club||''} ${p.age ? '· '+p.age : ''}</div>
      </div>
      ${rightCols}
      <button class="sq2-row-compare-btn${_compareIds.includes(p.id)?' active':''}" onclick="event.stopPropagation();SquadUI._toggleCompare('${p.id}')" title="Compare">⇄</button>
        <button class="sq2-row-info-btn" onclick="event.stopPropagation();SquadUI._showBio('${p.id}')" title="Profile">▸</button>
      </div>`;
  }

  // Renders one of the three value cells for whichever view is active —
  // shared by sorting (_colValue) and display so a column always shows
  // exactly the number it's being sorted by, never a mismatched pair.
  function _renderColCell(p, key) {
    const val = _colValue(p, key);
    if (key === 'fitness') {
      const info = window.CampaignFitness ? window.CampaignFitness.fitnessLabel(val) : { color:'var(--t3)' };
      return `<span class="sq2-col-c" style="color:${info.color};font-weight:700" title="${info.label}">${val}</span>`;
    }
    if (key === 'morale') {
      const c = val >= 70 ? 'var(--green)' : val >= 45 ? 'var(--gold)' : 'var(--red)';
      return `<span class="sq2-col-c" style="color:${c};font-weight:700">${val}</span>`;
    }
    if (key === 'form') {
      const fm = _form(p);
      const icon = fm === 'hot' ? '<span style="color:var(--green)">▲</span>' :
                   fm === 'cold' ? '<span style="color:var(--red)">▼</span>' :
                   fm !== null ? '<span style="color:var(--t3)">→</span>' : '<span style="color:var(--t4)">·</span>';
      return `<span class="sq2-col-c">${icon}</span>`;
    }
    if (key === 'rat') {
      return `<span class="sq2-col-c sq2-rat ${_ratClass(p.rat)}">${p.rat}</span>`;
    }
    if (key === 'caps' || key === 'age') {
      return `<span class="sq2-col-c" style="color:var(--t3)">${val}</span>`;
    }
    // Raw attribute (Attributes view)
    const c = val>=17?'var(--green)':val>=14?'var(--gold)':val>=10?'var(--t2)':'var(--orange)';
    return `<span class="sq2-col-c" style="color:${c};font-weight:700">${val||'—'}</span>`;
  }

  // ── Column header (sortable, view-dependent) ────────────────────────────
  function _renderColHead() {
    const el = $('sq2-col-head');
    if (!el) return;
    const arrow = dir => dir === 'asc' ? ' ▲' : ' ▼';
    const nameArrow = _sortKey === 'name' ? arrow(_sortDir) : '';
    const cols = VIEWS[_view].cols.map(c => {
      const active = _sortKey === c.key;
      return `<span class="sq2-ch-c${active?' sq2-ch-active':''}" onclick="SquadUI._sortBy('${c.key}')">${c.label}${active?arrow(_sortDir):''}</span>`;
    }).join('');
    el.innerHTML = `
      <span></span>
      <span class="sq2-ch-sortable${_sortKey==='pos'?' sq2-ch-active':''}" onclick="SquadUI._sortBy('pos')">Pos</span>
      <span class="sq2-ch-name sq2-ch-sortable${_sortKey==='name'?' sq2-ch-active':''}" onclick="SquadUI._sortBy('name')">Player${nameArrow}</span>
      ${cols}
      <span></span><span></span>`;
  }

  // Sorting by name/pos needs its own comparator since _colValue() only
  // deals in numbers — kept here rather than bloating _colValue with
  // string cases it'd otherwise never need.
  function _sortBy(key) {
    if (key === 'name' || key === 'pos') {
      if (_sortKey === key) { _sortDir = _sortDir === 'asc' ? 'desc' : 'asc'; }
      else { _sortKey = key; _sortDir = 'asc'; }
    } else {
      const col = VIEWS[_view].cols.find(c => c.key === key);
      if (_sortKey === key) { _sortDir = _sortDir === 'asc' ? 'desc' : 'asc'; }
      else { _sortKey = key; _sortDir = col ? col.defaultDir : 'desc'; }
    }
    _renderColHead();
    _renderList();
  }

  function setView(view) {
    if (!VIEWS[view]) return;
    _view = view;
    const firstCol = VIEWS[view].cols[0];
    _sortKey = firstCol.key;
    _sortDir = firstCol.defaultDir;
    document.querySelectorAll('.sq2-view-tab').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    _renderColHead();
    _renderList();
  }

  // ── Warnings ───────────────────────────────────────────────────────────────
  function _renderWarnings() {
    const el = $('sq2-warnings');
    if (!el) return;
    const slots = _slots().filter(Boolean);
    const bench = _bench();
    const { slots: form } = _formation();
    const warnings = [];

    if (!slots.some(p=>p.posG==='GK'))
      warnings.push('No goalkeeper in the starting XI');
    if (!bench.some(p=>p.posG==='GK') && slots.some(p=>p.posG==='GK'))
      warnings.push('No backup goalkeeper on the bench');

    const badMismatch = slots.filter((p,i) => form[i] && _posCompat(p,form[i].posG) === 'bad');
    if (badMismatch.length)
      warnings.push(badMismatch.map(p=>p.name.split(' ').pop()).join(', ') + ' playing out of position');

    const injured = slots.filter(p => _isInjured(p));
    if (injured.length)
      warnings.push(injured.map(p=>p.name.split(' ').pop()).join(', ') + ' selected but injured');

    el.innerHTML = warnings.map(w=>`<div class="sq2-warning">⚠ ${w}</div>`).join('');
  }

  // ── Status ─────────────────────────────────────────────────────────────────
  function _updateStatus() {
    const xi = _slots().filter(Boolean).length;
    const status = $('sq2-xi-status');
    const kick   = $('sq2-kickoff');
    if (status) {
      status.textContent = xi + ' / 11';
      status.className = 'sq2-xi-status' + (xi === 11 ? ' ready' : '');
    }
    if (kick) kick.textContent = xi < 11 ? `Auto + Kick Off (${xi}/11)` : 'Kick Off ▶';
  }

  // ── Interactions ───────────────────────────────────────────────────────────
  function _slotClick(i) {
    const p = _slots()[i];
    if (_activeSlot === i) {
      // Clicking active slot again — deactivate
      _activeSlot = null;
    } else {
      _activeSlot = i;
      if (p) _selId = p.id;
    }
    _refresh();
  }

  function _clearActive() {
    _activeSlot = null;
    _refresh();
  }

  function _playerClick(id) {
    const pool = _pool();
    const p = pool.find(x=>x.id===id);
    if (!p || !_squadPlayers().some(x=>x.id===id)) return;

    if (_isInjured(p)) {
      // Flash the row, can't select
      const row = document.querySelector(`.sq2-row[data-id="${id}"]`);
      if (row) { row.style.opacity='0.4'; setTimeout(()=>row.style.opacity='',600); }
      return;
    }

    let slots  = [..._slots()];
    let bench  = [..._bench()];
    const { slots: form } = _formation();

    const si = slots.findIndex(s=>s&&s.id===id);
    const bi = bench.findIndex(b=>b.id===id);

    if (si >= 0) {
      // Already in XI — clicking removes and activates that slot
      slots[si] = null;
      _activeSlot = si;
      _selId = null;
    } else if (bi >= 0) {
      // Already on bench — remove
      bench.splice(bi, 1);
      _selId = id;
    } else {
      // Add player
      if (_activeSlot !== null) {
        // Drop into targeted slot
        const displaced = slots[_activeSlot];
        slots[_activeSlot] = p;
        if (displaced) {
          // Move displaced to bench if space
          if (bench.length < 5) bench.push(displaced);
        }
        _activeSlot = null;
      } else {
        // Auto-place: find best free slot for this posG
        const freeSlot = form.findIndex((sl,i) => !slots[i] && sl.posG === p.posG);
        if (freeSlot >= 0) {
          slots[freeSlot] = p;
        } else if (bench.length < 5) {
          bench.push(p);
        } else {
          return; // Full
        }
      }
      _selId = id;
    }

    State.set('squad.slots', slots);
    State.set('squad.bench', bench);

    // Auto-set captain if none
    const filledSlots = slots.filter(Boolean);
    if (filledSlots.length && !State.get('campaign.captainId')) {
      const best = [...filledSlots].sort((a,b)=>(b.caps||0)-(a.caps||0))[0];
      State.set('campaign.captainId', best.id);
    }

    _refresh();
  }

  function _benchClick(id) {
    _selId = id;
    _renderContextStrip();
    _renderList();
  }

  function _removeSlot(i) {
    const slots = [..._slots()];
    slots[i] = null;
    if (_activeSlot === i) _activeSlot = null;
    State.set('squad.slots', slots);
    _refresh();
  }

  function _removeBench(i) {
    const bench = [..._bench()];
    bench.splice(i, 1);
    State.set('squad.bench', bench);
    _refresh();
  }

  // ── Plan mode ──────────────────────────────────────────────────────────────
  function _renderPlanBody() {
    const el = $('sq2-plan-body');
    if (!el) return;

    const xi    = _slots().filter(Boolean);
    const squad = _squadPlayers();

    switch (_planTab) {
      case 'overview': el.innerHTML = _planOverview(xi, squad); break;
      case 'recommend': el.innerHTML = _planRecommend(squad); break;
      case 'opponent': el.innerHTML = _planOpponent(xi); break;
      case 'depth':    el.innerHTML = _planDepth(squad); break;
    }
  }

  function _planOverview(xi, squad) {
    const avgRat  = xi.length ? Math.round(xi.reduce((a,p)=>a+p.rat,0)/xi.length) : 0;
    const gkCount = xi.filter(p=>p.posG==='GK').length;
    const defCount = xi.filter(p=>p.posG==='DEF').length;
    const midCount = xi.filter(p=>p.posG==='MID').length;
    const fwdCount = xi.filter(p=>p.posG==='FWD').length;
    const bench    = _bench();
    const capId    = State.get('campaign.captainId');
    const captain  = xi.find(p=>p.id===capId);

    const avgFit = (xi.length && window.CampaignFitness)
      ? Math.round(xi.reduce((a,p)=>a+window.CampaignFitness.currentFitness(p.id),0)/xi.length)
      : null;

    // Top 3 by form/rating
    const inForm = [...xi].sort((a,b)=>_selScore(b)-_selScore(a)).slice(0,3);
    const injuredOrCold = xi.filter(p=>_isInjured(p)||_form(p)==='cold');
    // Tired legs is its own concern category, separate from injury/form —
    // a fresh-but-out-of-form player and an exhausted-but-in-form player
    // need genuinely different responses from the manager, so lumping
    // them into one undifferentiated "Concerns" list would hide which
    // problem is actually which.
    const tired = window.CampaignFitness
      ? xi.filter(p => !injuredOrCold.includes(p) && window.CampaignFitness.currentFitness(p.id) < 50)
      : [];

    return `
      <div class="sq2-plan-section">
        <div class="sq2-plan-kicker">Matchday Overview</div>
        <div class="sq2-overview-grid">
          <div class="sq2-ov-card">
            <div class="sq2-ovc-value ${avgRat>=82?'elite':avgRat>=76?'good':'avg'}">${xi.length?avgRat:'—'}</div>
            <div class="sq2-ovc-label">Avg Rating</div>
          </div>
          <div class="sq2-ov-card">
            <div class="sq2-ovc-value ${xi.length===11?'good':'avg'}">${xi.length}/11</div>
            <div class="sq2-ovc-label">Starters</div>
          </div>
          <div class="sq2-ov-card">
            <div class="sq2-ovc-value">${bench.length}/5</div>
            <div class="sq2-ovc-label">Bench</div>
          </div>
          <div class="sq2-ov-card">
            <div class="sq2-ovc-value">${gkCount}-${defCount}-${midCount}-${fwdCount}</div>
            <div class="sq2-ovc-label">Shape</div>
          </div>
          ${avgFit!==null ? `
          <div class="sq2-ov-card">
            <div class="sq2-ovc-value ${avgFit>=80?'good':avgFit>=55?'avg':'poor'}">${avgFit}%</div>
            <div class="sq2-ovc-label">Avg Fitness</div>
          </div>` : ''}
        </div>

        ${captain ? `
        <div class="sq2-plan-row">
          <span>Captain</span>
          <strong>${captain.name} <span class="sq2-captain-mark">©</span></strong>
          <button class="sq2-plan-change-btn" onclick="SquadUI._openCaptainPicker()">Change</button>
        </div>` : ''}

        ${inForm.length ? `
        <div class="sq2-plan-kicker sq2-plan-kicker-spaced">In-form starters</div>
        ${inForm.map(p=>`
          <div class="sq2-plan-row">
            <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
            <strong>${p.name}</strong>
            <span class="sq2-rat ${_ratClass(p.rat)}">${p.rat}</span>
            ${_fitBadge(p)}
            <span class="sq2-plan-row-meta">${_caps(p)} caps</span>
          </div>`).join('') }` : ''}

        ${injuredOrCold.length ? `
        <div class="sq2-plan-kicker sq2-plan-kicker-spaced sq2-plan-kicker-warn">Concerns</div>
        ${injuredOrCold.map(p=>`
          <div class="sq2-plan-row sq2-plan-row-dim">
            <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
            <strong>${p.name}</strong>
            ${_isInjured(p) ? '<span class="sq2-plan-flag bad">INJURED</span>' : '<span class="sq2-plan-flag warn">Poor form</span>'}
          </div>`).join('') }` : ''}

        ${tired.length ? `
        <div class="sq2-plan-kicker sq2-plan-kicker-spaced sq2-plan-kicker-warn">Tired legs</div>
        ${tired.map(p=>`
          <div class="sq2-plan-row sq2-plan-row-dim">
            <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
            <strong>${p.name}</strong>
            ${_fitBadge(p)}
            <span class="sq2-plan-row-meta">Consider resting or a fresher option</span>
          </div>`).join('') }` : ''}
      </div>`;
  }

  function _planRecommend(squad) {
    const { slots: form } = _formation();
    const chosen = [];
    const used   = new Set();
    form.forEach(sl => {
      const cands = squad.filter(p => !used.has(p.id) && _posCompat(p,sl.posG) !== 'bad')
        .sort((a,b) => _selScore(b) - _selScore(a));
      const pick = cands[0];
      if (pick) { chosen.push({p:pick,sl}); used.add(pick.id); }
    });

    // A short, honest reason tag per pick — the same selection score
    // already drives the ranking, this just surfaces the biggest single
    // factor behind it rather than asking the manager to trust an
    // unexplained number.
    const reason = p => {
      const fit = window.CampaignFitness ? window.CampaignFitness.currentFitness(p.id) : 100;
      const fm  = _form(p);
      if (fit < 50) return { label:'Tired', cls:'warn' };
      if (fm === 'hot') return { label:'In form', cls:'good' };
      if (p.rat >= 85) return { label:'Best available', cls:'good' };
      return null;
    };

    return `
      <div class="sq2-plan-section">
        <div class="sq2-plan-kicker">Recommended XI — ${_formation().name}</div>
        ${chosen.map(({p,sl}) => {
          const r = reason(p);
          return `
          <div class="sq2-plan-row">
            <span class="pos-badge ${UI.posClass(p.posG)}">${sl.pos||sl.posG}</span>
            <strong>${p.name}</strong>
            <span class="sq2-rat ${_ratClass(p.rat)}">${p.rat}</span>
            ${_fitBadge(p)}
            ${r ? `<span class="sq2-plan-flag ${r.cls}">${r.label}</span>` : ''}
          </div>`;
        }).join('')}
        <div class="sq2-plan-apply-wrap">
          <button onclick="SquadUI._applyRecommend()" class="sq2-btn sq2-btn-ghost sq2-plan-apply-btn">
            Apply this XI ▶
          </button>
        </div>
      </div>`;
  }

  function _planOpponent(xi) {
    const fix = _fix();
    const opp = _oppName();
    const rating = fix.oppRating || 75;
    const ratingLabel = rating >= 88 ? 'World class' : rating >= 82 ? 'Strong side'
      : rating >= 74 ? 'Solid mid-table' : 'Weaker opposition';
    const diffCls = rating >= 88 ? 'bad' : rating >= 82 ? 'warn' : rating >= 74 ? 'gold' : 'good';

    // Threat assessment from opposition squad
    let oppSquad = null;
    const campaignYear = parseInt(State.get('campaign.campaignDate')||State.get('meta.era')||1986);
    if (window.getOppSquad) oppSquad = window.getOppSquad(opp, campaignYear);
    const topOppPlayers = oppSquad ? oppSquad.sort((a,b)=>(b.rat||70)-(a.rat||70)).slice(0,3) : [];

    const historic = fix.historicResult;
    const histLine = historic
      ? `Historic result: ${fix.homeTeam} ${historic.eng??historic.home}–${historic.opp??historic.away} ${fix.awayTeam}`
      : 'No previous result on record';

    // This used to be labelled "best-matched players" but was really just
    // your XI re-sorted by raw rating a second time — no actual opponent-
    // specific reasoning behind it. Against a genuinely strong side, what
    // a manager actually wants to check is defensive solidity, not a
    // repeat of "who's good"; against a weaker side, attacking output is
    // the more useful thing to glance at. Small, honest difference rather
    // than a generic list dressed up as analysis.
    const strongOpponent = rating >= 82;
    const focusPlayers = strongOpponent
      ? [...xi].filter(p => p.posG === 'DEF' || p.posG === 'GK').sort((a,b)=>(b.rat||70)-(a.rat||70))
      : [...xi].filter(p => p.posG === 'MID' || p.posG === 'FWD').sort((a,b)=>(b.rat||70)-(a.rat||70));
    const focusTitle = strongOpponent ? 'Your defensive line' : 'Your attacking options';
    const focusNote  = strongOpponent
      ? `${opp} rate as ${ratingLabel.toLowerCase()} — defensive solidity matters more than usual here.`
      : `${opp} rate as ${ratingLabel.toLowerCase()} — a good chance to press the advantage going forward.`;

    return `
      <div class="sq2-plan-section">
        <div class="sq2-plan-kicker">Opponent: ${opp}</div>

        <div class="sq2-opp-rating-card">
          <div>
            <div class="sq2-opp-rating-num sq2-flag-${diffCls}">${rating}</div>
            <div class="sq2-opp-rating-sub">Rating</div>
          </div>
          <div>
            <div class="sq2-opp-rating-label sq2-flag-${diffCls}">${ratingLabel}</div>
            <div class="sq2-opp-rating-hist">${histLine}</div>
          </div>
        </div>

        ${topOppPlayers.length ? `
        <div class="sq2-plan-kicker">Key opposition players</div>
        ${topOppPlayers.map(p=>`
          <div class="sq2-plan-row">
            <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
            <strong>${p.name}</strong>
            <span class="sq2-rat ${_ratClass(p.rat||70)}">${p.rat||70}</span>
          </div>`).join('')}` : ''}

        ${xi.length ? `
        <div class="sq2-plan-kicker sq2-plan-kicker-spaced">${focusTitle}</div>
        <div class="sq2-plan-note">${focusNote}</div>
        ${focusPlayers.slice(0,4).map(p=>`
          <div class="sq2-plan-row">
            <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
            <strong>${p.name}</strong>
            <span class="sq2-rat ${_ratClass(p.rat)}">${p.rat}</span>
            ${_fitBadge(p)}
          </div>`).join('') }` : '<p class="sq2-plan-empty">Select your XI to see matchup analysis.</p>'}
      </div>`;
  }

  function _planDepth(squad) {
    const positions = [
      ['GK','Goalkeeper'],['DEF','Defence'],['MID','Midfield'],['FWD','Attack'],
    ];
    return `
      <div class="sq2-plan-section">
        <div class="sq2-plan-kicker">Depth Chart</div>
        ${positions.map(([posG,label]) => {
          const players = squad.filter(p=>p.posG===posG)
            .sort((a,b)=>_selScore(b)-_selScore(a));
          return `
            <div class="sq2-depth-group">
              <div class="sq2-depth-header">${label}</div>
              ${players.map((p,i) => {
                const inXI = _slots().some(s=>s&&s.id===p.id);
                const onB  = _bench().some(b=>b.id===p.id);
                const fm   = _form(p);
                return `
                  <div class="sq2-depth-row${i===0?' sq2-depth-first':''}" onclick="SquadUI._playerClick('${p.id}')">
                    <span class="sq2-depth-rank">${i+1}</span>
                    <span class="sq2-depth-name">${p.name}</span>
                    <span class="sq2-rat ${_ratClass(p.rat)} sq2-depth-rat">${p.rat}</span>
                    ${_fitBadge(p)}
                    ${inXI ? '<span class="sq2-plan-flag good">XI</span>' : onB ? '<span class="sq2-plan-flag">BN</span>' : ''}
                    ${fm==='hot'?'<span class="sq2-depth-form good">▲</span>':fm==='cold'?'<span class="sq2-depth-form bad">▼</span>':''}
                    ${_isInjured(p)?'<span class="sq2-plan-flag bad">INJ</span>':''}
                  </div>`;
              }).join('')}
            </div>`;
        }).join('')}
      </div>`;
  }

  // ── Apply recommended XI ───────────────────────────────────────────────────
  function _applyRecommend() {
    // An injured player should never be auto-selected regardless of how
    // highly rated they are — this is the single clearest case where
    // "highest number" and "right choice" diverge completely.
    const squad = _squadPlayers().filter(p => !_isInjured(p));
    const { slots: form } = _formation();
    const chosen = [];
    const used = new Set();
    form.forEach(sl => {
      const pick = squad.filter(p=>!used.has(p.id)&&_posCompat(p,sl.posG)!=='bad')
        .sort((a,b)=>_selScore(b)-_selScore(a))[0];
      if (pick) { chosen.push(pick); used.add(pick.id); }
    });
    State.set('squad.slots', chosen);
    const bench = squad.filter(p=>!used.has(p.id))
      .sort((a,b)=>_selScore(b)-_selScore(a)).slice(0,5);
    State.set('squad.bench', bench);
    if (chosen.length) {
      const cap = [...chosen].sort((a,b)=>(b.caps||0)-(a.caps||0))[0];
      State.set('campaign.captainId', cap.id);
    }
    _refresh();
  }

  // ── Auto fill XI ──────────────────────────────────────────────────────────
  function autoFillXI() {
    _applyRecommend();
  }

  // ── Bio panel ─────────────────────────────────────────────────────────────
  // ── Player comparison ──────────────────────────────────────────────────────

  function _toggleCompare(id) {
    if (_compareIds.includes(id)) {
      _compareIds = _compareIds.filter(x => x !== id);
    } else {
      if (_compareIds.length >= 2) _compareIds.shift(); // drop oldest, keep most recent 2
      _compareIds.push(id);
    }
    _renderList(); // refresh button active states
    if (_compareIds.length === 2) _showCompare();
  }

  function _showCompare() {
    const old = document.getElementById('sq2-compare-panel');
    if (old) old.remove();
    if (_compareIds.length < 2) return;

    const pool = _pool();
    const pA = pool.find(x => x.id === _compareIds[0]);
    const pB = pool.find(x => x.id === _compareIds[1]);
    if (!pA || !pB) return;

    const attrsA = pA.attrs || pA.peakAttrs || {};
    const attrsB = pB.attrs || pB.peakAttrs || {};
    const groups = [
      { label: 'Attack',     keys: ['fin','sho','hea','cro','dri','tec','fre'] },
      { label: 'Physical',   keys: ['pac','acc','sta','str','jum','agi'] },
      { label: 'Mental',     keys: ['vis','dec','com','pos','wor','bra','lea'] },
      { label: 'Defending',  keys: ['tac','mar','int'] },
    ];
    const allKeys = groups.flatMap(g => g.keys).filter(k => (k in attrsA) || (k in attrsB));

    const statRow = (label, vA, vB, higherIsBetter = true) => {
      const aWins = higherIsBetter ? vA > vB : vA < vB;
      const bWins = higherIsBetter ? vB > vA : vB < vA;
      return `<div style="display:grid;grid-template-columns:1fr 90px 1fr;align-items:center;padding:5px 0;border-bottom:1px solid var(--border)">
        <div style="text-align:right;padding-right:10px;font-weight:${aWins?'800':'500'};color:${aWins?'var(--green)':'var(--t2)'}">${vA}</div>
        <div style="text-align:center;font-size:10px;color:var(--t4);letter-spacing:.06em;text-transform:uppercase">${label}</div>
        <div style="text-align:left;padding-left:10px;font-weight:${bWins?'800':'500'};color:${bWins?'var(--green)':'var(--t2)'}">${vB}</div>
      </div>`;
    };

    const panel = document.createElement('div');
    panel.id = 'sq2-compare-panel';
    panel.style.cssText = 'position:fixed;inset:0;z-index:520;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:24px';
    panel.innerHTML = `
      <div style="width:560px;max-height:88vh;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;overflow:hidden;display:flex;flex-direction:column">
        <div style="padding:16px 20px;background:var(--bg3);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
          <div style="font-family:var(--font-ui);font-size:17px;font-weight:800;color:var(--t1)">Compare Players</div>
          <button id="sq2-compare-close" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--t3)">✕</button>
        </div>
        <div style="overflow-y:auto;flex:1;padding:18px 20px">
          <div style="display:grid;grid-template-columns:1fr 90px 1fr;align-items:start;margin-bottom:14px">
            <div style="text-align:right;padding-right:10px">
              <div style="font-family:var(--font-ui);font-size:16px;font-weight:800;color:var(--t1)">${pA.name}</div>
              <div style="font-size:11px;color:var(--t3)">${pA.pos} · ${pA.club||''}</div>
            </div>
            <div style="text-align:center;font-size:11px;color:var(--t4)">vs</div>
            <div style="text-align:left;padding-left:10px">
              <div style="font-family:var(--font-ui);font-size:16px;font-weight:800;color:var(--t1)">${pB.name}</div>
              <div style="font-size:11px;color:var(--t3)">${pB.pos} · ${pB.club||''}</div>
            </div>
          </div>

          ${statRow('Rating', pA.rat||0, pB.rat||0)}
          ${statRow('Age', pA.age||'—', pB.age||'—', false)}
          ${statRow('Caps', _caps(pA), _caps(pB))}
          ${statRow('Morale', _morale(pA), _morale(pB))}

          ${groups.map(g => {
            const present = g.keys.filter(k => (k in attrsA) || (k in attrsB));
            if (!present.length) return '';
            return `<div style="margin-top:16px">
              <div style="font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px;text-align:center">${g.label}</div>
              ${present.map(k => statRow(k.toUpperCase(), attrsA[k]||0, attrsB[k]||0)).join('')}
            </div>`;
          }).join('')}

          <div style="display:flex;gap:8px;margin-top:18px">
            <button onclick="SquadUI._playerClick('${pA.id}')" style="flex:1;padding:9px;background:var(--bg4);border:1px solid var(--border2);color:var(--t1);font-family:var(--font-ui);font-size:12px;font-weight:700;cursor:pointer;border-radius:5px">
              ${_inUse().has(pA.id) ? 'Remove ' + pA.name.split(' ').pop() : 'Select ' + pA.name.split(' ').pop()}
            </button>
            <button onclick="SquadUI._playerClick('${pB.id}')" style="flex:1;padding:9px;background:var(--bg4);border:1px solid var(--border2);color:var(--t1);font-family:var(--font-ui);font-size:12px;font-weight:700;cursor:pointer;border-radius:5px">
              ${_inUse().has(pB.id) ? 'Remove ' + pB.name.split(' ').pop() : 'Select ' + pB.name.split(' ').pop()}
            </button>
          </div>
        </div>
      </div>`;

    panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
    document.body.appendChild(panel);
    document.getElementById('sq2-compare-close')?.addEventListener('click', () => panel.remove());
  }

  // Match-by-match record, pulled from campaign.matchHistory2 (already
  // stores per-match ratings/playerStats for everyone who appeared — this
  // just surfaces one player's slice of it). Shows the most recent games
  // so the panel doesn't turn into an unbounded scroll for a long career.
  function _matchHistorySection(id) {
    if (!window.PlayerHistory) return '';
    const matches = window.PlayerHistory.getMatches(id, 10);
    if (!matches.length) {
      return `<div style="margin-bottom:12px">
        <div style="font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px">Match History</div>
        <div style="font-size:12px;color:var(--t4);font-style:italic">No appearances recorded yet this campaign.</div>
      </div>`;
    }
    const outcomeColor = { win:'var(--green)', draw:'var(--t3)', loss:'var(--red)' };
    const rows = matches.map(m => {
      const s = m.stats || {};
      const contrib = [s.goals ? `⚽×${s.goals}` : '', s.assists ? `🅰️×${s.assists}` : ''].filter(Boolean).join(' ');
      const ratColor = m.rating >= 8 ? 'var(--green)' : m.rating >= 6.5 ? 'var(--t2)' : m.rating != null ? 'var(--red)' : 'var(--t4)';
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
        <div style="width:8px;height:8px;border-radius:50%;background:${outcomeColor[m.outcome]||'var(--t4)'};flex-shrink:0" title="${m.outcome}"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">vs ${m.opp}${m.compType==='tournament'?' 🏆':''}</div>
          <div style="font-size:10px;color:var(--t4)">${window.PlayerHistory.fmtDate(m.date)} · ${m.score.eng}-${m.score.opp}${typeof s.mins==='number'?` · ${s.mins}'`:''}</div>
        </div>
        ${contrib ? `<div style="font-size:11px;color:var(--t2);flex-shrink:0">${contrib}</div>` : ''}
        <div style="font-size:13px;font-weight:700;color:${ratColor};flex-shrink:0;min-width:28px;text-align:right">${m.rating!=null?m.rating.toFixed(1):'—'}</div>
      </div>`;
    }).join('');
    return `<div style="margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px">Match History <span style="color:var(--t4);font-weight:400">(last ${matches.length})</span></div>
      <div>${rows}</div>
    </div>`;
  }

  function _showBio(id) {
    const p = _pool().find(x=>x.id===id);
    if (!p) return;
    const old = document.getElementById('sq2-bio-panel');
    if (old) { old.remove(); return; } // toggle

    const stats  = (State.get('campaign.playerStats')||{})[id] || {};
    const inj    = _isInjured(p);
    const attrs  = p.attrs || p.peakAttrs || {};
    const groups = [
      {label:'Attack', keys:['fin','sho','hea','cro','dri','tec','fre']},
      {label:'Physical', keys:['pac','acc','sta','str','jum','agi']},
      {label:'Mental', keys:['vis','dec','com','pos','wor','bra','lea']},
      {label:'Defending', keys:['tac','mar','int']},
    ];

    const panel = document.createElement('div');
    panel.id = 'sq2-bio-panel';
    panel.style.cssText='position:fixed;top:0;right:0;width:300px;height:100vh;background:var(--bg2);border-left:1px solid var(--border2);overflow-y:auto;z-index:300;padding:0;box-shadow:-4px 0 24px rgba(0,0,0,.5)';
    panel.innerHTML = `
      <div style="background:var(--bg3);padding:16px;border-bottom:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-size:18px;font-weight:700;color:var(--t1);font-family:var(--font-ui)">${p.name}</div>
            <div style="font-size:12px;color:var(--t3);margin-top:2px">${p.pos} · ${p.peakClub||''} · Peak ${p.peakYear||''}</div>
          </div>
          <button onclick="document.getElementById('sq2-bio-panel').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--t3);padding:4px">✕</button>
        </div>
        ${inj?'<div style="margin-top:8px;font-size:12px;color:var(--red);background:rgba(200,16,46,.1);padding:4px 8px;border-radius:3px">⚠ Currently injured</div>':''}
      </div>

      <div style="padding:12px 16px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
          ${[['Rating',p.rat||'—'],['Caps',stats.caps??p.historicalCaps??0],['Goals',stats.goals??p.historicalGoals??0],['Age',p.age||'—'],['Morale',_morale(p)]].map(([l,v])=>`
            <div style="background:var(--bg3);border-radius:5px;padding:8px;text-align:center">
              <div style="font-size:18px;font-weight:700;color:var(--t1);font-family:var(--font-ui)">${v}</div>
              <div style="font-size:11px;color:var(--t3)">${l}</div>
            </div>`).join('')}
        </div>

        ${p.bio?`<div style="font-size:13px;color:var(--t2);line-height:1.6;margin-bottom:12px;font-style:italic">"${p.bio}"</div>`:''}

        ${p.traits?.length?`
          <div style="margin-bottom:10px">
            <div style="font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:5px">Traits</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px">${p.traits.map(t=>`<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(55,138,221,.12);color:#6688ff">${t}</span>`).join('')}</div>
          </div>`:''}

        ${p.weaknesses?.length?`
          <div style="margin-bottom:12px">
            <div style="font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:5px">Concerns</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px">${p.weaknesses.map(w=>`<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(200,16,46,.1);color:var(--red)">${w}</span>`).join('')}</div>
          </div>`:''}

        ${_matchHistorySection(p.id)}

        ${Object.keys(attrs).length?`
          <div style="font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px">Attributes</div>
          ${groups.map(g=>{
            const present = g.keys.filter(k=>k in attrs);
            if (!present.length) return '';
            return `<div style="margin-bottom:8px">
              <div style="font-size:11px;color:var(--t3);margin-bottom:4px">${g.label}</div>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px">
                ${present.map(k=>{
                  const v=attrs[k]||0;
                  const c=v>=17?'var(--green)':v>=14?'var(--gold)':v>=10?'var(--t2)':'var(--orange)';
                  return `<div style="font-size:12px;text-align:center;background:var(--bg4);border-radius:3px;padding:3px">
                    <div style="font-weight:700;color:${c}">${v}</div>
                    <div style="font-size:10px;color:var(--t4)">${k.toUpperCase()}</div>
                  </div>`;
                }).join('')}
              </div>
            </div>`;
          }).join('')}` : ''}

        <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">
          <button onclick="SquadUI._playerClick('${p.id}');document.getElementById('sq2-bio-panel').remove()"
            style="padding:8px;background:var(--red);color:#fff;border:none;font-family:var(--font-ui);font-size:13px;font-weight:700;cursor:pointer;border-radius:4px">
            ${_inUse().has(p.id) ? 'Remove from Selection' : 'Add to Selection'}
          </button>
        </div>
      </div>`;

    document.body.appendChild(panel);
    setTimeout(()=>{
      document.addEventListener('click', function closer(e){
        const bio = document.getElementById('sq2-bio-panel');
        if (bio && !bio.contains(e.target) && !e.target.classList.contains('sq2-row-info-btn')) {
          bio.remove();
          document.removeEventListener('click', closer);
        }
      });
    }, 100);
  }

  // ── Captain picker ────────────────────────────────────────────────────────
  function _openCaptainPicker() {
    const slots = _slots().filter(Boolean);
    const capId = State.get('campaign.captainId');
    const old = document.getElementById('sq2-cap-modal');
    if (old) old.remove();
    const overlay = document.createElement('div');
    overlay.id = 'sq2-cap-modal';
    overlay.style.cssText='position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center';
    overlay.innerHTML=`
      <div style="width:380px;background:var(--bg2);border:1px solid var(--border2);border-radius:8px;overflow:hidden">
        <div style="padding:18px 20px;background:var(--bg3);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <strong style="font-family:var(--font-ui);font-size:18px;font-weight:800">Select Captain</strong>
          <button onclick="document.getElementById('sq2-cap-modal').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--t3)">✕</button>
        </div>
        <div style="max-height:400px;overflow-y:auto">
          ${slots.map(p=>`
            <div onclick="SquadUI._setCaptain('${p.id}')" style="display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid var(--border);cursor:pointer;background:${p.id===capId?'rgba(200,16,46,.07)':'transparent'}">
              <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
              <div style="flex:1">
                <div style="font-weight:600;color:var(--t1)">${p.name}</div>
                <div style="font-size:12px;color:var(--t3)">${_caps(p)} England caps</div>
              </div>
              ${p.id===capId?'<span style="color:var(--gold);font-size:20px">©</span>':''}
            </div>`).join('')}
        </div>
      </div>`;
    overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
    document.body.appendChild(overlay);
  }

  function _setCaptain(id) {
    State.set('campaign.captainId', id);
    const m = document.getElementById('sq2-cap-modal');
    if (m) m.remove();
    _refresh();
  }

  // ── Squad management modal ─────────────────────────────────────────────────
  function openSquadModal() {
    _ensureSquad();
    const old = document.getElementById('sq2-manage-modal');
    if (old) old.remove();
    const overlay = document.createElement('div');
    overlay.id = 'sq2-manage-modal';
    overlay.style.cssText='position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center';

    let mSearch = '', mFilter = 'ALL';
    const render = () => {
      const ids  = new Set(State.get('squad.englandSquad')||[]);
      const pool = _pool();
      const filtered = pool
        .filter(p => mFilter === 'ALL' || p.posG === mFilter)
        .filter(p => !mSearch || p.name.toLowerCase().includes(mSearch) || (p.club||'').toLowerCase().includes(mSearch))
        .sort((a,b)=>(ids.has(a.id)===ids.has(b.id)? b.rat-a.rat : ids.has(a.id)?-1:1));

      const gkC  = pool.filter(p=>ids.has(p.id)&&p.posG==='GK').length;
      const defC = pool.filter(p=>ids.has(p.id)&&p.posG==='DEF').length;
      const midC = pool.filter(p=>ids.has(p.id)&&p.posG==='MID').length;
      const fwdC = pool.filter(p=>ids.has(p.id)&&p.posG==='FWD').length;

      overlay.innerHTML=`
        <div style="width:560px;max-height:88vh;background:var(--bg2);border:1px solid var(--border2);border-radius:8px;display:flex;flex-direction:column;overflow:hidden">
          <div style="padding:18px 22px;background:var(--bg3);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
            <div>
              <div style="font-family:var(--font-ui);font-size:20px;font-weight:800">Manage England Squad</div>
              <div style="font-size:13px;color:var(--t3);margin-top:2px">${ids.size}/26 selected · GK ${gkC} · DEF ${defC} · MID ${midC} · FWD ${fwdC}</div>
            </div>
            <button id="sq2-mm-close" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--t3)">✕</button>
          </div>
          <div style="padding:10px 22px;border-bottom:1px solid var(--border);display:flex;gap:8px;flex-shrink:0">
            <input id="sq2-mm-search" value="${mSearch}" placeholder="Search…" style="flex:1;height:34px;background:var(--bg4);border:1px solid var(--border);color:var(--t1);font-family:var(--font-body);font-size:14px;padding:0 10px;outline:none">
            <select id="sq2-mm-filter" style="height:34px;background:var(--bg4);border:1px solid var(--border);color:var(--t1);font-family:var(--font-ui);font-size:13px;padding:0 8px;outline:none">
              ${['ALL','GK','DEF','MID','FWD'].map(f=>`<option value="${f}"${f===mFilter?' selected':''}>${f}</option>`).join('')}
            </select>
          </div>
          <div style="overflow-y:auto;flex:1">
            ${filtered.map(p=>{
              const inSquad = ids.has(p.id);
              return `
                <div style="display:flex;align-items:center;gap:10px;padding:10px 22px;border-bottom:1px solid var(--border);background:${inSquad?'rgba(200,16,46,.04)':'transparent'}">
                  <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
                  <div style="flex:1">
                    <div style="font-weight:600;color:var(--t1)">${p.name}</div>
                    <div style="font-size:12px;color:var(--t3)">${p.club||''} · Age ${p.age||'—'} · ${_caps(p)} caps</div>
                  </div>
                  <span style="font-family:var(--font-ui);font-weight:800;font-size:16px;color:${p.rat>=88?'var(--gold)':p.rat>=80?'#88d44a':'var(--t2)'}">${p.rat}</span>
                  <button onclick="SquadUI._toggleSquadMember('${p.id}')"
                    style="min-width:60px;padding:5px 10px;font-family:var(--font-ui);font-size:12px;font-weight:700;cursor:pointer;border-radius:3px;background:${inSquad?'transparent':'var(--red)'};border:1px solid ${inSquad?'var(--border3)':'var(--red)'};color:${inSquad?'var(--t3)':'#fff'}">
                    ${inSquad?'Remove':'Add'}
                  </button>
                </div>`;
            }).join('')}
          </div>
        </div>`;

      document.getElementById('sq2-mm-close')?.addEventListener('click',()=>overlay.remove());
      const si = document.getElementById('sq2-mm-search');
      const fi = document.getElementById('sq2-mm-filter');
      if (si) si.addEventListener('input', e=>{mSearch=e.target.value.toLowerCase();render();});
      if (fi) fi.addEventListener('change', e=>{mFilter=e.target.value;render();});
    };

    overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
    document.body.appendChild(overlay);
    render();
    window._sq2ModalRender = render; // expose for toggle
  }

  function _toggleSquadMember(id) {
    let ids = [...(State.get('squad.englandSquad')||[])];
    if (ids.includes(id)) {
      ids = ids.filter(x=>x!==id);
      State.set('squad.slots', _slots().map(p=>p&&p.id===id?null:p));
      State.set('squad.bench', _bench().filter(p=>p.id!==id));
    } else {
      if (ids.length >= 26) return; // squad full
      ids.push(id);
    }
    State.set('squad.englandSquad', ids);
    if (window._sq2ModalRender) window._sq2ModalRender();
    _refresh();
  }

  // ── Kick Off ──────────────────────────────────────────────────────────────
  function kickOff() {
    // Realistic build-up gate: every stage in the pre-match sequence
    // (squad announcement, training, press, final confirmation) must be
    // resolved before kickoff is allowed — mirrors how a real international
    // week actually works rather than letting the player skip straight to
    // the pitch. This is purely a pacing gate, not a punishment: there is
    // no auto-pick and no penalty, the player can take as long as they
    // like, they just can't kick off with stages outstanding.
    const fixtureIdx = State.get('campaign.fixtureIdx') || 0;
    if (window.BuildUp && window.DashboardUI) {
      const sequence = window.BuildUp.buildSequence(fixtureIdx);
      const completedKey = `campaign.completedBuildUp.${fixtureIdx}`;
      const completed = new Set(State.get(completedKey) || []);
      const outstanding = sequence.filter(t => t.type !== 'FINAL_CONFIRM' && !completed.has(t.id));
      if (outstanding.length) {
        alert(`You still need to complete pre-match preparations before kicking off: ${outstanding[0].title}. Taking you back to the dashboard to finish it.`);
        window.DashboardUI.init();
        UI.show('screen-dashboard');
        return;
      }
      // Mark the final confirmation stage complete now that we're
      // genuinely committing to kickoff.
      const finalStage = sequence.find(t => t.type === 'FINAL_CONFIRM');
      if (finalStage) {
        completed.add(finalStage.id);
        State.set(completedKey, [...completed]);
      }
    }

    let slots = _slots();
    if (slots.filter(Boolean).length < 11) {
      autoFillXI();
      slots = _slots();
    }
    const xi = slots.filter(Boolean);
    if (xi.length < 11) {
      const pool = _squadPlayers();
      const used = new Set(xi.map(p=>p.id));
      const extras = pool.filter(p=>!used.has(p.id));
      const filled = [...xi];
      while (filled.length < 11 && extras.length) filled.push(extras.shift());
      State.set('squad.slots', filled.concat(Array(11-filled.length).fill(null)));
    }

    // Tournament opponent override
    const tKey = State.get('tournament.key');
    let fixtureImportance = window.ALL_FIXTURES?.[fixtureIdx]?.importance || 'medium';
    if (tKey && window.TournamentEngine) {
      const tFix = window.TournamentEngine.nextEnglandFixture?.();
      if (tFix) {
        const tData   = window.TournamentEngine.data?.();
        const oppName = tFix.home === 'England' ? tFix.away : tFix.home;
        const oppTeam = tData?.teams?.[oppName] || {};
        const tYear   = tData?.year || parseInt((tKey || '').replace(/\D/g,'').slice(-4)) || 1996;
        const isHome  = !tFix.neutral && tFix.home === 'England';
        State.set('match.oppOverride', { oppName, oppRating: oppTeam.rating||75, year: tYear, fixtureId: tFix.id, isHome, neutral: !!tFix.neutral });
        // Tournament football is never a low-pressure occasion regardless
        // of what the underlying calendar fixture's importance says.
        fixtureImportance = 'major';
      }
    } else {
      State.set('match.oppOverride', null);
    }

    // "Too soon" confidence risk — a young, inexperienced player thrown
    // into a genuinely high-pressure fixture carries a real chance of a
    // confidence hit (or, if they rise to it, a real boost) regardless of
    // the eventual scoreline. Resolved once per player at kickoff, not
    // re-rolled every tick — this is about the weight of walking out for
    // this specific occasion, separate from result.js's normal post-match
    // performance-based swing.
    if (window.Confidence) {
      const finalXI = _slots().filter(Boolean);
      const stats = State.get('campaign.playerStats') || {};
      finalXI.forEach(p => {
        const caps = stats[p.id]?.caps ?? p.historicalCaps ?? 0;
        const outcome = window.Confidence.applyTooSoonRisk(p.id, caps, p.age, fixtureImportance);
        if (outcome) {
          // Surface this distinctly — whether a young player visibly
          // rose to the occasion or wasn't ready for it is news the
          // manager should register, not a silent background number
          // change they'd never notice.
          setTimeout(() => {
            const msg = outcome.hit
              ? `${p.name} looks overawed by the occasion in the build-up — his confidence has taken a knock before a ball's even been kicked.`
              : `${p.name} looks composed and ready for the big stage despite his inexperience — a real confidence boost ahead of kickoff.`;
            _showConfidenceToast(msg, outcome.hit);
          }, 60);
        }
      });
    }

    State.save();
    window.MatchUI.init();
    UI.show('screen-match');
  }

  function back() {
    window.DashboardUI.init();
    UI.show('screen-dashboard');
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    init,
    setMode,
    setFormation(name) {
      State.upd('campaign.tactics', t=>({...t,formation:name}));
      _activeSlot = null;
      _refresh();
    },
    _slotClick,
    _clearActive,
    _playerClick,
    _benchClick,
    _removeSlot,
    _removeBench,
    _applyRecommend,
    autoFillXI,
    kickOff,
    back,
    openSquadModal,
    _toggleSquadMember,
    _showBio,
    _toggleCompare,
    _showCompare,
    _openCaptainPicker,
    _setCaptain,
    setView,
    _sortBy,
    // Legacy compat aliases used in other files
    toggle(id) { _playerClick(id); },
    openCompareModal() {},
    modalAdd(id) { _toggleSquadMember(id); },
  };

})();
