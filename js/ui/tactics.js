/**
 * tactics.js — Full tactics screen with formation, team shape,
 * and individual player instructions based on scouting/caps knowledge.
 */
window.TacticsUI = {
  _activeSlot: null,   // index of selected formation slot
  _formation:  null,   // current formation name

  // How much we know about a player (0-3)
  // 0 = unknown, 1 = basic, 2 = scouted, 3 = well known (many caps)
  _knowledgeLevel(player) {
    if (!player) return 0;
    // Real in-game accumulated caps live in campaign.playerStats, NOT on
    // the static pool object (which only carries career-start caps,
    // always 0) — and scout visit count lives in campaign.playerScoutCount,
    // not on the player object at all. Reading the wrong fields here meant
    // every player silently showed as "Unknown" regardless of actual
    // caps or scouting history.
    const caps = (State.get('campaign.playerStats')||{})[player.id]?.caps ?? player.historicalCaps ?? 0;
    const scoutCount = (State.get('campaign.playerScoutCount')||{})[player.id] || 0;
    if (caps >= 20 || scoutCount >= 3) return 3;
    if (caps >= 8  || scoutCount >= 2) return 2;
    if (caps >= 2  || scoutCount >= 1) return 1;
    return 0;
  },

  init(returnTo) {
    this._returnTo = returnTo || 'dashboard';
    const el = document.getElementById('screen-tactics');
    if (!el) return;
    this._formation = State.get('campaign.tactics.formation') || window.DEFAULT_FORMATION;
    el.innerHTML = this._shell();
    this._renderPitch();
    this._renderTeamTactics();
    this._renderPlayerList();
  },

  _shell() {
    return `
      <div class="topbar">
        <div class="topbar-cell">
          <span class="label">Tactics</span>
          <span class="value">England — ${this._formation}</span>
        </div>
        <div class="topbar-cell">
          <span class="label">Manager</span>
          <span class="value gold">${State.get('meta.manager')}</span>
        </div>
        <div class="topbar-cell" style="margin-left:auto;border-left:1px solid var(--border);border-right:none;flex-direction:row;gap:12px;padding:0 22px">
          <button class="btn btn-ghost" onclick="TacticsUI.back()">← Back</button>
          <button class="btn btn-primary" onclick="TacticsUI.save()">Save Tactics ▶</button>
        </div>
      </div>
      <div class="tactics-body">
        <div class="tac-pitch-panel">
          <div class="tac-formation-bar" id="tac-form-bar"></div>
          <div class="tac-pitch-wrap" id="tac-pitch-wrap">
            <svg viewBox="0 0 320 440" preserveAspectRatio="none">
              <rect width="320" height="440" fill="#1b3d1b"/>
              <rect x="12" y="12" width="296" height="416" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
              <line x1="12" y1="220" x2="308" y2="220" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>
              <circle cx="160" cy="220" r="46" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>
              <circle cx="160" cy="220" r="4" fill="rgba(255,255,255,.3)"/>
              <rect x="12" y="158" width="90" height="124" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>
              <rect x="218" y="158" width="90" height="124" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>
              <rect x="12" y="184" width="40" height="72" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1"/>
              <rect x="268" y="184" width="40" height="72" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1"/>
              <circle cx="78" cy="220" r="3" fill="rgba(255,255,255,.25)"/>
              <circle cx="242" cy="220" r="3" fill="rgba(255,255,255,.25)"/>
              <rect x="0" y="198" width="12" height="44" rx="2" fill="rgba(255,255,255,.35)"/>
              <rect x="308" y="198" width="12" height="44" rx="2" fill="rgba(255,255,255,.35)"/>
            </svg>
            <div class="tac-pitch-slots" id="tac-pitch-slots"></div>
          </div>
        </div>
        <div class="tac-centre">
          <div class="tac-centre-scroll" id="tac-centre-scroll"></div>
        </div>
        <div class="tac-instruct-panel">
          <div class="tac-instruct-head">
            <div class="tac-instruct-title">Player Instructions</div>
            <div class="tac-instruct-sub" id="tac-instruct-sub">Select a player from the pitch</div>
          </div>
          <div class="tac-instruct-body" id="tac-player-list"></div>
          <div id="tac-instr-detail"></div>
        </div>
      </div>`;
  },

  // ── FORMATION BAR ─────────────────────────────────────────────────────────
  _renderFormationBar() {
    const bar = document.getElementById('tac-form-bar');
    if (!bar) return;
    const formations = Object.keys(window.FORMATIONS);
    bar.innerHTML = formations.map(f =>
      `<button class="tac-form-btn${f===this._formation?' active':''}" onclick="TacticsUI.setFormation('${f}')">${f}</button>`
    ).join('');
  },

  setFormation(f) {
    this._formation = f;
    this._activeSlot = null;
    State.upd('campaign.tactics', t => ({...t, formation:f}));
    this._renderFormationBar();
    this._renderPitch();
    this._renderPlayerList();
    document.getElementById('tac-instr-detail').innerHTML = '';
    document.getElementById('tac-instruct-sub').textContent = 'Select a player from the pitch';
  },

  // ── PITCH ─────────────────────────────────────────────────────────────────
  _renderPitch() {
    this._renderFormationBar();
    const slots   = State.get('squad.slots');
    const form    = window.FORMATIONS[this._formation];
    const roleAssignments = State.get('campaign.tactics.roles') || {};
    const wrap    = document.getElementById('tac-pitch-slots');
    if (!wrap || !form) return;

    const rows = [...new Set(form.map(s=>s.row))].sort((a,b)=>b-a);
    wrap.innerHTML = rows.map(r => {
      const rowSlots = form.map((sl,i) => ({...sl,i})).filter(sl => sl.row===r);
      return `<div class="tac-p-row">${rowSlots.map(sl => {
        const p    = slots[sl.i];
        const isAc = this._activeSlot === sl.i;
        const assignment = roleAssignments[sl.i] || {};
        const roleId = assignment.role || (window.Roles ? window.Roles.defaultRoleForSlot(sl.pos) : null);
        const dutyId = assignment.duty || 'Support';
        const roleLabel = window.Roles?.ROLES[roleId]?.label;
        const hasCustomRole = !!assignment.role; // explicitly chosen, not just the default
        return `<div class="tac-slot${p?' filled':''}${isAc?' active-slot':''}" onclick="TacticsUI.selectSlot(${sl.i})">
          ${hasCustomRole ? '<div class="tac-slot-instr"></div>' : ''}
          <div class="tac-slot-circle">${p ? (p.name.split(' ').pop().substring(0,3).toUpperCase()) : sl.pos}</div>
          <div class="tac-slot-name">${p ? p.name.split(' ').pop() : ''}</div>
          ${roleLabel ? `<div class="tac-slot-role">${roleLabel} ${dutyId!=='Support'?`(${dutyId[0]})`:''}</div>` : ''}
          ${p ? `<div class="tac-slot-rat">${p.rat}</div>` : ''}
        </div>`;
      }).join('')}</div>`;
    }).join('');
  },

  selectSlot(i) {
    this._activeSlot = i;
    this._renderPitch();
    const slots = State.get('squad.slots');
    const p = slots[i];
    if (p) {
      this._showPlayerInstructions(p, i);
    } else {
      document.getElementById('tac-instr-detail').innerHTML = '';
      document.getElementById('tac-instruct-sub').textContent = 'No player in this slot';
    }
    // Highlight in player list
    document.querySelectorAll('.tac-player-tab').forEach((el,idx) => {
      el.classList.toggle('active', idx === i);
    });
  },

  // ── TEAM TACTICS ──────────────────────────────────────────────────────────
  _renderTeamTactics() {
    const scroll = document.getElementById('tac-centre-scroll');
    const tac    = State.get('campaign.tactics') || {};
    const mt     = tac.mentality   || 'Balanced';
    const pr     = tac.press       || 'Mid';
    const te     = tac.tempo       || 'Normal';
    const wi     = tac.width       || 'Normal';
    const sp     = tac.setpieces   || 'Mixed';
    const li     = tac.defensive_line || 'Normal';
    const tr     = tac.transition  || 'Counter';

    const group = (label, key, opts, current, desc) => `
      <div class="tac-row">
        <span class="tac-row-label">${label}</span>
        <div class="tac-row-sub">${desc}</div>
        <div class="tac-group">${opts.map(o =>
          `<button class="tac-opt${o===current?' active':''}" onclick="TacticsUI.setTactic('${key}','${o}',this)">${o}</button>`
        ).join('')}</div>
      </div>`;

    scroll.innerHTML = `
      <div class="tac-section">
        <div class="tac-section-title">Attacking Shape</div>
        ${group('Mentality','mentality',['Defensive','Cautious','Balanced','Positive','Attack'],mt,'How aggressively England push forward.')}
        ${group('Tempo','tempo',['Slow','Normal','Fast'],te,'The speed at which England circulate the ball.')}
        ${group('Width','width',['Narrow','Normal','Wide'],wi,'How wide England stretch the play.')}
        ${group('Set Pieces','setpieces',['Short','Mixed','Long'],sp,'Delivery preference for corners and free kicks.')}
      </div>
      <div class="tac-section">
        <div class="tac-section-title">Defensive Shape</div>
        ${group('Press','press',['None','Low','Mid','High','Intense'],pr,'How aggressively England press out of possession.')}
        ${group('Def. Line','defensive_line',['Deep','Normal','High'],li,'Where the back line holds their shape.')}
        ${group('Transition','transition',['Counter','Build Up','Direct'],tr,'How England look to attack after winning the ball.')}
      </div>`;
  },

  setTactic(key, val) {
    State.upd('campaign.tactics', t => ({...t, [key]:val}));
  },

  // ── PLAYER LIST ───────────────────────────────────────────────────────────
  _renderPlayerList() {
    const list   = document.getElementById('tac-player-list');
    const slots  = State.get('squad.slots');
    const form   = window.FORMATIONS[this._formation];
    const roleAssignments = State.get('campaign.tactics.roles') || {};
    if (!list) return;
    list.innerHTML = slots.map((p,i) => {
      if (!p) return '';
      const sl  = form[i];
      const pos = sl ? sl.pos : p.pos;
      const pc  = UI.posClass(p.posG);
      const kl  = this._knowledgeLevel(p);
      const assignment = roleAssignments[i] || {};
      const hasCustomRole = !!assignment.role;
      const instrSummary = this._instrSummary(p, i, sl);
      return `<div class="tac-player-tab${this._activeSlot===i?' active':''}" onclick="TacticsUI.selectSlot(${i})">
        <span class="tac-pt-pos pos-badge ${pc}">${pos}</span>
        <div style="flex:1">
          <div class="tac-pt-name">${p.name}</div>
          <div class="tac-pt-instr">${instrSummary}</div>
        </div>
        <div class="tac-pt-dot${hasCustomRole?' set':''}"></div>
      </div>`;
    }).join('');
  },

  _instrSummary(p, slotIdx, sl) {
    const roleAssignments = State.get('campaign.tactics.roles') || {};
    const assignment = roleAssignments[slotIdx] || {};
    const roleId = assignment.role || (window.Roles ? window.Roles.defaultRoleForSlot(sl?.pos) : null);
    const dutyId = assignment.duty || 'Support';
    const roleLabel = window.Roles?.ROLES[roleId]?.label;
    if (!roleLabel) return '';
    return `${roleLabel}${dutyId!=='Support'?` (${dutyId})`:''}`;
  },

  // ── PLAYER INSTRUCTIONS ───────────────────────────────────────────────────
  _showPlayerInstructions(player, slotIdx) {
    const detail = document.getElementById('tac-instr-detail');
    const sub    = document.getElementById('tac-instruct-sub');
    const kl     = this._knowledgeLevel(player);
    const form   = window.FORMATIONS[this._formation];
    const sl     = form[slotIdx];
    const pos    = sl ? sl.pos : player.pos;

    const roleAssignments = State.get('campaign.tactics.roles') || {};
    const assignment = roleAssignments[slotIdx] || {};
    // Ranked by genuine fit for THIS player's attributes, not just listed
    // in whatever order the role catalogue happens to define them.
    const availableRoles = window.Roles ? window.Roles.rankRolesForPlayer(player, pos) : [];
    // Attach a knowledge-aware fit RANGE to each role — an unscouted
    // player's role suitability is genuinely uncertain, not a confident-
    // looking exact number the manager hasn't earned yet.
    if (window.ScoutingRanges) {
      availableRoles.forEach(r => { r.fitRange = window.ScoutingRanges.roleFitRange(player, r.id, kl); });
      // Re-sort by what's actually DISPLAYED (the range midpoint) rather
      // than the hidden true score — otherwise the order itself would
      // silently leak more certainty than the numbers on screen admit to.
      availableRoles.sort((a, b) => {
        const am = a.fitRange?.exact ? a.fit.score : (a.fitRange.low + a.fitRange.high) / 2;
        const bm = b.fitRange?.exact ? b.fit.score : (b.fitRange.low + b.fitRange.high) / 2;
        return bm - am;
      });
    }
    const currentRoleId = assignment.role || (window.Roles ? window.Roles.defaultRoleForSlot(pos) : null);
    const currentDutyId = assignment.duty || 'Support';
    const currentRole = window.Roles?.ROLES[currentRoleId];

    sub.textContent = player.name;

    const knowledgeBadge = ['Unknown','Familiar','Scouted','Well Known'][kl];
    const knowledgeColor = ['var(--t3)','var(--t2)','var(--gold)','var(--green)'][kl];
    const scoutText = this._getScoutInsight(player, kl);

    detail.innerHTML = `
      <div class="instr-detail">
        <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px">
          <div class="instr-player-name">${player.name}</div>
          <span style="font-family:var(--font-ui);font-size:13px;font-weight:700;color:${knowledgeColor};letter-spacing:.08em">${knowledgeBadge}</span>
        </div>
        <div class="instr-player-meta">${pos} · ${player.club} · ${(State.get('campaign.playerStats')||{})[player.id]?.caps ?? player.historicalCaps ?? 0} caps · ${(State.get('campaign.playerScoutCount')||{})[player.id] || 0} scout visits</div>

        ${scoutText ? `<div class="instr-scout-reveal">
          <div class="instr-scout-lbl">Scout Intelligence</div>
          <div class="instr-scout-text">${scoutText}</div>
        </div>` : `<div style="background:var(--bg4);border:1px solid var(--border);padding:14px 16px;margin-bottom:16px;font-size:14px;color:var(--t3);font-style:italic">
          Scout this player or cap them more to unlock tactical insights.
        </div>`}

        <div class="instr-group">
          <div class="instr-group-title">Role <span style="font-weight:400;color:var(--t3);text-transform:none;letter-spacing:0">— ranked by fit for ${player.name.split(' ').pop()}</span></div>
          <div class="instr-opts">
            ${availableRoles.map(r => {
              const range = r.fitRange;
              const isExact = !range || range.exact;
              const fitScore = isExact ? (r.fit?.score ?? 50) : Math.round((range.low + range.high) / 2);
              const fitColor = fitScore>=75?'var(--green)':fitScore>=55?'var(--gold)':fitScore>=40?'var(--t3)':'var(--red)';
              const fitLabel = fitScore>=75?'Excellent fit':fitScore>=55?'Good fit':fitScore>=40?'Average fit':'Poor fit';
              const why = window.TacticsUI._roleFitReason(r);
              // Display: an exact number once the manager genuinely knows
              // this player, a range while they're still finding out —
              // the range itself communicates "we're not sure yet" far
              // more honestly than a confident-looking single figure.
              const fitDisplay = isExact ? `${fitScore}` : `${range.low}–${range.high}`;
              const fitSubLabel = isExact ? fitLabel : 'Still finding out';
              const barFillStyle = isExact
                ? `width:${fitScore}%;background:${fitColor}`
                : `left:${range.low}%;width:${Math.max(4, range.high - range.low)}%;background:${fitColor};opacity:.55`;
              return `
              <div class="instr-opt${currentRoleId===r.id?' active':''}"
                   onclick="TacticsUI.setRole('${player.id}',${slotIdx},'${r.id}')">
                <div class="instr-opt-radio"></div>
                <div style="flex:1">
                  <div style="display:flex;justify-content:space-between;align-items:baseline">
                    <div class="instr-opt-text">${r.label}</div>
                    <div style="text-align:right">
                      <div style="font-family:var(--font-ui);font-weight:800;font-size:${isExact?'15px':'13px'};color:${fitColor}">${fitDisplay}</div>
                      <div style="font-size:10px;color:${fitColor};text-transform:uppercase;letter-spacing:.04em">${fitSubLabel}</div>
                    </div>
                  </div>
                  <div class="fit-bar-track" style="position:relative">
                    ${isExact
                      ? `<div class="fit-bar-fill" style="${barFillStyle}"></div>`
                      : `<div class="fit-bar-fill" style="position:absolute;${barFillStyle}"></div>`}
                  </div>
                  <div class="instr-opt-desc">${r.desc}</div>
                  ${isExact && why ? `<div style="font-size:12px;color:${fitColor};margin-top:4px;font-weight:600">${why}</div>` : ''}
                  ${!isExact ? `<div style="font-size:11px;color:var(--t4);margin-top:4px;font-style:italic">Scout this player or give them more caps to know exactly how well this suits them.</div>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <div class="instr-group">
          <div class="instr-group-title">Duty</div>
          <div class="instr-opts" style="flex-direction:row;gap:8px">
            ${Object.entries(window.Roles?.DUTIES||{}).map(([id,d]) => `
              <div class="instr-opt duty-opt${currentDutyId===id?' active':''}" style="flex:1;flex-direction:column;text-align:center"
                   onclick="TacticsUI.setDuty('${player.id}',${slotIdx},'${id}')">
                <div class="instr-opt-text">${d.label}</div>
              </div>`).join('')}
          </div>
          <div class="instr-opt-desc" style="margin-top:6px">${window.Roles?.DUTIES[currentDutyId]?.desc||''}</div>
        </div>

        ${currentRole ? `<div class="instr-group">
          <div class="instr-group-title">What This Means On The Pitch</div>
          <div style="font-size:13px;color:var(--t3);line-height:1.6">
            ${currentRole.label} (${window.Roles.DUTIES[currentDutyId]?.label}) genuinely reshapes ${player.name.split(' ').pop()}'s contribution this match — not just a label.
            ${currentRole.posBias === 'wide' ? ' Stays wide, prioritises width and crossing.' : currentRole.posBias === 'central' ? ' Drifts infield, prioritises central combination play.' : ''}
          </div>
        </div>` : ''}
      </div>`;
  },

  // Translates a role's fit breakdown into one short, concrete sentence
  // naming the actual attribute driving the score — turning a bare number
  // into something the manager can act on without already knowing the
  // role/attribute mappings by heart.
  _roleFitReason(rankedRole) {
    const breakdown = rankedRole.fit?.breakdown;
    if (!breakdown || !breakdown.length) return '';
    const labels = {
      finishing:'finishing', heading:'heading', crossing:'crossing',
      longPassing:'long passing', shortPass:'short passing', dribbling:'dribbling',
      defending:'defending', heading_def:'heading', strength:'strength',
      pace:'pace', handling:'handling', positioning:'positioning', workrate:'work rate',
    };
    const top = breakdown[0];
    const label = labels[top.key] || top.key;
    if (top.type === 'boost' && top.contribution > 0.08) {
      return `Built around their ${label} — a real strength for this role.`;
    }
    if (top.type === 'boost' && top.contribution < 0.04) {
      return `This role leans on ${label}, which isn't their strongest area.`;
    }
    if (top.type === 'cost' && Math.abs(top.contribution) > 0.05) {
      return `Costs you some of their ${label} — a genuine strength this role asks them to set aside.`;
    }
    return '';
  },

  setRole(playerId, slotIdx, roleId) {
    const roles = JSON.parse(JSON.stringify(State.get('campaign.tactics.roles') || {}));
    if (!roles[slotIdx]) roles[slotIdx] = {};
    roles[slotIdx].role = roleId;
    State.set('campaign.tactics.roles', roles);
    const slots = State.get('squad.slots');
    if (slots[slotIdx]) this._showPlayerInstructions(slots[slotIdx], slotIdx);
    this._renderPitch();
  },

  setDuty(playerId, slotIdx, dutyId) {
    const roles = JSON.parse(JSON.stringify(State.get('campaign.tactics.roles') || {}));
    if (!roles[slotIdx]) roles[slotIdx] = {};
    roles[slotIdx].duty = dutyId;
    State.set('campaign.tactics.roles', roles);
    const slots = State.get('squad.slots');
    if (slots[slotIdx]) this._showPlayerInstructions(slots[slotIdx], slotIdx);
    this._renderPitch();
  },

  _getScoutInsight(player, kl) {
    if (kl === 0) return '';
    const a = player.attrs || {};
    const insights = [];

    if (kl >= 1) {
      // Basic: position and obvious trait
      if (a.pac >= 16) insights.push('Exceptional pace — can exploit space in behind.');
      else if (a.pac <= 9) insights.push('Lacks pace — needs positional cover.');
      if (player.posG === 'GK' && a.ref >= 17) insights.push('Outstanding reflexes — reliable under pressure.');
      if (player.posG === 'FWD' && a.sho >= 17) insights.push('Clinical finisher — must be found in the box.');
    }
    if (kl >= 2) {
      // Scouted: tactical tendencies
      if (a.dri >= 17) insights.push('Exceptional on the ball — thrives with freedom to run at defenders.');
      if (a.def >= 17) insights.push('Excellent defensive work rate — can be trusted to press and win the ball back.');
      if (a.pas >= 17) insights.push('Elite passing range — should be given time on the ball to dictate play.');
      if (a.men >= 16) insights.push('Mentally strong — responds well under pressure, big game performer.');
    }
    if (kl >= 3) {
      // Well known: detailed tactical profile
      if (a.sta >= 17) insights.push('Extraordinary stamina — can play box-to-box for 90 minutes.');
      if (a.phy >= 17) insights.push('Physically dominant — aerial threat and good in tight spaces.');
      if (player.bio) insights.push(player.bio);
    }

    if (!insights.length) {
      if (kl >= 1) insights.push(`${player.name} is a reliable international player at ${player.club}.`);
    }
    return insights.slice(0,3).join(' ');
  },

  back() {
    if (this._returnTo === 'squad') {
      window.SquadUI.init();
      UI.show('screen-squad');
    } else {
      window.DashboardUI.init();
      UI.show('screen-dashboard');
    }
  },

  save() {
    State.save();
    this.back();
  },
};
