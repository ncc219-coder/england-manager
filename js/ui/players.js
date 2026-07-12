/**
 * players.js — PlayersUI
 *
 * A unified, full-screen player database — the single place to search,
 * filter, sort, scout, compare, and call up players, replacing both the
 * old cramped "Manage Squad" modal and the separate Scouting tab's
 * narrower list. Designed the way Football Manager's player search works:
 * a dense sortable table as the primary surface, a rich detail panel for
 * whoever's selected, and the ability to multi-select for side-by-side
 * comparison without leaving the screen.
 *
 * Reachable from two places — the Squad screen's "Manage Squad" button,
 * and the Dashboard's "Scouting" tab — both land here with the right
 * "Back" target remembered so navigation feels natural either way.
 */

window.PlayersUI = (function () {

  // ── State ──────────────────────────────────────────────────────────────────
  let _returnTo   = 'squad';     // 'squad' | 'dashboard' — where Back goes
  let _search     = '';
  let _posFilter  = 'ALL';
  let _ageMin     = 0, _ageMax = 45;
  let _ratMin     = 0;
  let _onlyWatch  = false;
  let _onlySquad  = false;
  let _footFilter = 'ALL';
  let _sortKey    = 'rat';
  let _sortDir    = -1;           // -1 desc, 1 asc
  let _selectedIds = [];          // up to 4, for the detail/compare panel

  const $ = id => document.getElementById(id);

  // ── Data helpers ───────────────────────────────────────────────────────────
  function _pool() { return State.get('squad.pool') || []; }
  function _squadIds() { return new Set(State.get('squad.englandSquad') || []); }
  function _watchlist() { return State.get('campaign.watchlist') || []; }
  function _isInjured(p) { return (State.get('campaign.injuries')||[]).some(i=>i.id===p.id); }
  function _caps(p) { return (State.get('campaign.playerStats')||{})[p.id]?.caps ?? p.historicalCaps ?? 0; }
  function _goals(p) { return (State.get('campaign.playerStats')||{})[p.id]?.goals ?? p.historicalGoals ?? 0; }
  function _form(p) {
    const fm = (State.get('campaign.playerStats')||{})[p.id]?.form || [];
    if (!fm.length) return null;
    const avg = fm.reduce((a,v)=>a+v,0)/fm.length;
    return avg > 0.3 ? 'hot' : avg < -0.3 ? 'cold' : 'ok';
  }
  function _knowledgeLevel(p) {
    const sc = (State.get('campaign.playerScoutCount')||{})[p.id] || 0;
    const caps = _caps(p);
    if (caps>=20||sc>=3) return 3; if (caps>=8||sc>=2) return 2; if (caps>=2||sc>=1) return 1; return 0;
  }

  // ── Open / close ────────────────────────────────────────────────────────────
  function init(returnTo) {
    _returnTo = returnTo || 'squad';
    _selectedIds = [];
    const el = $('screen-players');
    if (!el) return;
    el.innerHTML = _shell();
    _bindToolbar();
    _renderTable();
    _renderDetail();
  }

  function back() {
    if (_returnTo === 'dashboard') {
      window.DashboardUI.init();
      UI.show('screen-dashboard');
    } else {
      window.SquadUI.init();
      UI.show('screen-squad');
    }
  }

  // ── Shell ──────────────────────────────────────────────────────────────────
  function _shell() {
    return `
      <div class="pl-topbar">
        <button class="pl-back-btn" onclick="PlayersUI.back()">← Back</button>
        <div class="pl-title">
          <div class="pl-title-main">Player Database</div>
          <div class="pl-title-sub" id="pl-count-sub"></div>
        </div>
        <div class="pl-topbar-actions">
          <button class="pl-compare-btn" id="pl-compare-btn" onclick="PlayersUI._openCompare()" style="display:none">Compare Selected →</button>
        </div>
      </div>

      <div class="pl-filterbar">
        <input id="pl-search" class="pl-search" placeholder="Search name or club…" autocomplete="off">
        <div class="pl-filter-group">
          ${['ALL','GK','DEF','MID','FWD'].map(p=>`<button class="pl-pf${p==='ALL'?' active':''}" data-pos="${p}">${p}</button>`).join('')}
        </div>
        <div class="pl-filter-group">
          <label class="pl-flabel">Age</label>
          <input type="number" id="pl-age-min" class="pl-num" value="0" min="15" max="45"> – <input type="number" id="pl-age-max" class="pl-num" value="45" min="15" max="45">
        </div>
        <div class="pl-filter-group">
          <label class="pl-flabel">Min Rating</label>
          <input type="number" id="pl-rat-min" class="pl-num" value="0" min="0" max="99" step="5">
        </div>
        <div class="pl-filter-group">
          <select id="pl-foot" class="pl-select">
            <option value="ALL">Either Foot</option>
            <option value="left">Left Foot</option>
            <option value="right">Right Foot</option>
          </select>
        </div>
        <label class="pl-toggle"><input type="checkbox" id="pl-only-watch"> Watchlist only</label>
        <label class="pl-toggle"><input type="checkbox" id="pl-only-squad"> In squad only</label>
      </div>

      <div class="pl-body">
        <div class="pl-table-panel">
          <div class="pl-table-head" id="pl-table-head"></div>
          <div class="pl-table-rows" id="pl-table-rows"></div>
        </div>
        <div class="pl-detail-panel" id="pl-detail-panel"></div>
      </div>`;
  }

  // ── Toolbar bindings ─────────────────────────────────────────────────────────
  function _bindToolbar() {
    $('pl-search')?.addEventListener('input', e => { _search = e.target.value.toLowerCase(); _renderTable(); });
    document.querySelectorAll('.pl-pf').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pl-pf').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        _posFilter = btn.dataset.pos;
        _renderTable();
      });
    });
    $('pl-age-min')?.addEventListener('input', e => { _ageMin = +e.target.value || 0; _renderTable(); });
    $('pl-age-max')?.addEventListener('input', e => { _ageMax = +e.target.value || 45; _renderTable(); });
    $('pl-rat-min')?.addEventListener('input', e => { _ratMin = +e.target.value || 0; _renderTable(); });
    $('pl-foot')?.addEventListener('change', e => { _footFilter = e.target.value; _renderTable(); });
    $('pl-only-watch')?.addEventListener('change', e => { _onlyWatch = e.target.checked; _renderTable(); });
    $('pl-only-squad')?.addEventListener('change', e => { _onlySquad = e.target.checked; _renderTable(); });
  }

  // ── Filtering + sorting ───────────────────────────────────────────────────
  function _filteredSorted() {
    const squadIds = _squadIds();
    const watch = new Set(_watchlist());
    let list = _pool().filter(p => {
      if (_posFilter !== 'ALL' && p.posG !== _posFilter) return false;
      if (_search && !p.name.toLowerCase().includes(_search) && !(p.club||'').toLowerCase().includes(_search)) return false;
      const age = p.age || 0;
      if (age < _ageMin || age > _ageMax) return false;
      if ((p.rat||0) < _ratMin) return false;
      if (_footFilter !== 'ALL' && p.foot !== _footFilter) return false;
      if (_onlyWatch && !watch.has(p.id)) return false;
      if (_onlySquad && !squadIds.has(p.id)) return false;
      return true;
    });

    const keyFn = {
      name:  p => p.name,
      pos:   p => p.posG,
      age:   p => p.age || 0,
      club:  p => p.club || '',
      rat:   p => p.rat || 0,
      caps:  p => _caps(p),
      goals: p => _goals(p),
      form:  p => ({hot:1,ok:0,cold:-1,null:0}[_form(p)] ?? -2),
    }[_sortKey] || (p => p.rat||0);

    list.sort((a,b) => {
      const av = keyFn(a), bv = keyFn(b);
      if (typeof av === 'string') return av.localeCompare(bv) * _sortDir * -1;
      return (av - bv) * _sortDir * -1;
    });
    return list;
  }

  function setSort(key) {
    if (_sortKey === key) _sortDir *= -1;
    else { _sortKey = key; _sortDir = -1; }
    _renderTable();
  }

  // ── Table rendering ───────────────────────────────────────────────────────
  const COLUMNS = [
    { key:'name',  label:'Player',  flex:3 },
    { key:'pos',   label:'Pos',     flex:1 },
    { key:'age',   label:'Age',     flex:1 },
    { key:'club',  label:'Club',    flex:2 },
    { key:'caps',  label:'Caps',    flex:1 },
    { key:'goals', label:'Goals',   flex:1 },
    { key:'form',  label:'Form',    flex:1 },
    { key:'rat',   label:'Rating',  flex:1 },
  ];

  function _renderTable() {
    const head = $('pl-table-head');
    const rows = $('pl-table-rows');
    const sub  = $('pl-count-sub');
    if (!head || !rows) return;

    const list = _filteredSorted();
    if (sub) sub.textContent = `${list.length} player${list.length!==1?'s':''}`;

    head.innerHTML = `
      <span class="pl-th-check"></span>
      ${COLUMNS.map(c => `<span class="pl-th" style="flex:${c.flex}" onclick="PlayersUI.setSort('${c.key}')">
        ${c.label}${_sortKey===c.key?(_sortDir===-1?' ▼':' ▲'):''}
      </span>`).join('')}
      <span class="pl-th-actions"></span>`;

    const squadIds = _squadIds();
    const watch = new Set(_watchlist());

    rows.innerHTML = list.map(p => {
      const inSquad = squadIds.has(p.id);
      const isWatched = watch.has(p.id);
      const injured = _isInjured(p);
      const fm = _form(p);
      const fmIcon = fm==='hot' ? '<span style="color:var(--green)">▲</span>' : fm==='cold' ? '<span style="color:var(--red)">▼</span>' : fm ? '<span style="color:var(--t3)">→</span>' : '<span style="color:var(--t4)">·</span>';
      const ratCls = p.rat>=88?'elite':p.rat>=80?'good':p.rat>=72?'avg':'poor';
      const checked = _selectedIds.includes(p.id);

      return `<div class="pl-row${inSquad?' in-squad':''}${injured?' injured':''}" data-id="${p.id}" onclick="PlayersUI._selectPlayer('${p.id}')">
        <span class="pl-td-check" onclick="event.stopPropagation();PlayersUI._toggleCompareSelect('${p.id}')">
          <input type="checkbox" ${checked?'checked':''} onclick="event.stopPropagation();PlayersUI._toggleCompareSelect('${p.id}')">
        </span>
        <span class="pl-td" style="flex:3;display:flex;align-items:center;gap:8px;min-width:0">
          <span class="pos-badge ${UI.posClass(p.posG)}">${p.pos}</span>
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><strong>${p.name}</strong>${injured?' <span class="pl-inj-chip">INJ</span>':''}${isWatched?' ★':''}</span>
        </span>
        <span class="pl-td" style="flex:1">${p.posG}</span>
        <span class="pl-td" style="flex:1">${p.age||'—'}</span>
        <span class="pl-td" style="flex:2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.club||'—'}</span>
        <span class="pl-td" style="flex:1">${_caps(p)}</span>
        <span class="pl-td" style="flex:1">${_goals(p)}</span>
        <span class="pl-td" style="flex:1">${fmIcon}</span>
        <span class="pl-td pl-rat ${ratCls}" style="flex:1">${p.rat}</span>
        <span class="pl-td-actions">
          <button class="pl-action-btn" title="${isWatched?'Remove from watchlist':'Add to watchlist'}" onclick="event.stopPropagation();PlayersUI._toggleWatch('${p.id}')">${isWatched?'★':'☆'}</button>
          <button class="pl-action-btn ${inSquad?'remove':'add'}" onclick="event.stopPropagation();PlayersUI._toggleSquad('${p.id}')">${inSquad?'Drop':'Call Up'}</button>
        </span>
      </div>`;
    }).join('') || `<div style="padding:40px;text-align:center;color:var(--t3)">No players match these filters.</div>`;
  }

  // ── Detail / compare panel ───────────────────────────────────────────────
  function _selectPlayer(id) {
    if (!_selectedIds.includes(id)) _selectedIds = [id];
    _renderDetail();
    _renderTable();
  }

  function _toggleCompareSelect(id) {
    if (_selectedIds.includes(id)) {
      _selectedIds = _selectedIds.filter(x => x !== id);
    } else {
      if (_selectedIds.length >= 4) _selectedIds.shift(); // keep at most 4
      _selectedIds.push(id);
    }
    _renderDetail();
    _renderTable();
    const btn = $('pl-compare-btn');
    if (btn) btn.style.display = _selectedIds.length >= 2 ? 'inline-block' : 'none';
  }

  function _renderDetail() {
    const panel = $('pl-detail-panel');
    if (!panel) return;
    if (!_selectedIds.length) {
      panel.innerHTML = `<div class="pl-empty-detail">
        <div style="font-size:32px;margin-bottom:10px">🔍</div>
        <p>Select a player to view their profile.<br>Tick the checkbox on multiple players to compare them.</p>
      </div>`;
      return;
    }
    if (_selectedIds.length === 1) {
      panel.innerHTML = _playerProfile(_selectedIds[0]);
    } else {
      panel.innerHTML = _compareView(_selectedIds);
    }
  }

  // Shows a quick "this tournament" summary on a player's profile — only
  // when a tournament is genuinely active AND this specific player has
  // actually featured in it. Reads the tournament-scoped stats built
  // specifically to stay separate from career-long caps/goals, so a
  // player who hasn't played yet this tournament correctly shows
  // nothing here rather than stale numbers from an earlier campaign.
  function _matchHistorySection(playerId) {
    if (!window.PlayerHistory) return '';
    const matches = window.PlayerHistory.getMatches(playerId, 10);
    if (!matches.length) return '';
    const rows = matches.map(m => {
      const s = m.stats || {};
      const contrib = [s.goals ? `⚽×${s.goals}` : '', s.assists ? `🅰️×${s.assists}` : ''].filter(Boolean).join(' ');
      const ratCls = m.rating >= 8 ? 'elite' : m.rating >= 6.5 ? 'good' : m.rating != null ? 'poor' : '';
      return `<div class="pl-mh-row">
        <span class="pl-mh-dot pl-mh-${m.outcome}" title="${m.outcome}"></span>
        <div class="pl-mh-info">
          <div class="pl-mh-opp">vs ${m.opp}${m.compType==='tournament'?' 🏆':''}</div>
          <div class="pl-mh-meta">${window.PlayerHistory.fmtDate(m.date)} · ${m.score.eng}-${m.score.opp}${typeof s.mins==='number'?` · ${s.mins}'`:''}</div>
        </div>
        ${contrib ? `<div class="pl-mh-contrib">${contrib}</div>` : ''}
        <div class="pl-mh-rat ${ratCls}">${m.rating!=null?m.rating.toFixed(1):'—'}</div>
      </div>`;
    }).join('');
    return `<div class="pl-mh">
      <div class="pl-mh-title">Match History <span class="pl-mh-count">(last ${matches.length})</span></div>
      ${rows}
    </div>`;
  }

  function _tournamentStatsCard(playerId) {
    if (!window.TournamentEngine || !window.TournamentEngine.isActive() || !window.TournamentStats) return '';
    const stats = window.TournamentStats.forPlayer(playerId);
    if (!stats || !stats.apps) return '';
    const data = window.TournamentEngine.data();
    const parts = [
      `${stats.apps} app${stats.apps!==1?'s':''}`,
      stats.goals ? `${stats.goals} goal${stats.goals!==1?'s':''}` : null,
      stats.assists ? `${stats.assists} assist${stats.assists!==1?'s':''}` : null,
      `${stats.avgRating.toFixed(2)} avg rating`,
      stats.cleanSheets ? `${stats.cleanSheets} clean sheet${stats.cleanSheets!==1?'s':''}` : null,
      stats.motm ? `${stats.motm}× MOTM` : null,
      stats.yellowCards ? `${stats.yellowCards}🟨` : null,
      stats.redCards ? `${stats.redCards}🟥` : null,
    ].filter(Boolean);
    return `<div class="pl-tourn-stats">
      <div class="pl-tourn-stats-title">${data?.name || 'This tournament'}</div>
      <div class="pl-tourn-stats-line">${parts.join(' · ')}</div>
    </div>`;
  }

  function _playerProfile(id) {
    const p = _pool().find(x => x.id === id);
    if (!p) return '';
    const kl = _knowledgeLevel(p);
    const klLabel = ['Unknown','Familiar','Scouted','Well Known'][kl];
    const klColor = ['var(--t3)','var(--t2)','var(--gold)','var(--green)'][kl];
    const inSquad = _squadIds().has(p.id);
    const isWatched = _watchlist().includes(p.id);
    const injured = _isInjured(p);
    const a = p.attrs || {};
    const reports = State.get('campaign.scoutReports') || {};
    const report = reports[p.id];

    const groups = [
      { label:'Attack', keys:['fin','sho','hea','cro','dri','tec','fre'] },
      { label:'Physical', keys:['pac','acc','sta','str','jum','agi'] },
      { label:'Mental', keys:['vis','dec','com','pos','wor','bra','lea'] },
      { label:'Defending', keys:['tac','mar','int'] },
    ];

    return `<div class="pl-profile">
      <div class="pl-profile-top">
        <div>
          <div class="pl-profile-kicker" style="color:${klColor}">${klLabel}</div>
          <div class="pl-profile-name">${p.name}</div>
          <div class="pl-profile-sub">${p.pos}${p.secondaryPos&&p.secondaryPos.length?` (also ${p.secondaryPos.join('/')})`:''} · ${p.club||''} · Age ${p.age||'?'} · ${_caps(p)} caps · ${_goals(p)} goals</div>
          ${injured?'<div class="pl-profile-injured">⚠ Currently injured</div>':''}
        </div>
        <div class="pl-profile-rat">${p.rat}</div>
      </div>

      <div class="pl-profile-actions">
        <button class="pl-pbtn ${inSquad?'danger':'primary'}" onclick="PlayersUI._toggleSquad('${p.id}')">${inSquad?'Drop from Squad':'Call Up to Squad'}</button>
        <button class="pl-pbtn ghost" onclick="PlayersUI._toggleWatch('${p.id}')">${isWatched?'★ On Watchlist':'☆ Add to Watchlist'}</button>
        ${!report?`<button class="pl-pbtn ghost" onclick="PlayersUI._commissionReport('${p.id}')">Commission Scout Report</button>`:''}
      </div>

      ${_tournamentStatsCard(p.id)}

      ${_matchHistorySection(p.id)}

      ${kl>=1 && p.bio ? `<div class="pl-bio">${p.bio}</div>` : kl<1 ? `<div class="pl-bio dim">Scout this player or call them up to learn more.</div>` : ''}

      ${kl>=2 && p.traits?.length ? `<div class="pl-tags">${p.traits.slice(0,4).map(t=>`<span class="pl-tag good">${t}</span>`).join('')}</div>` : ''}
      ${kl>=3 && p.weaknesses?.length ? `<div class="pl-tags">${p.weaknesses.map(w=>`<span class="pl-tag bad">${w}</span>`).join('')}</div>` : ''}

      ${kl>=2 ? groups.map(g => {
        const present = g.keys.filter(k => k in a);
        if (!present.length) return '';
        return `<div class="pl-attr-group">
          <div class="pl-attr-group-label">${g.label}</div>
          <div class="pl-attr-grid">
            ${present.map(k => {
              const v = a[k]||0;
              const cls = v>=17?'elite':v>=14?'good':v>=10?'avg':'poor';
              return `<div class="pl-attr-cell ${cls}"><div class="pl-attr-val">${kl>=3?v:'★'}</div><div class="pl-attr-key">${k.toUpperCase()}</div></div>`;
            }).join('')}
          </div>
        </div>`;
      }).join('') : `<div class="pl-bio dim">Attributes are hidden until this player has been scouted at least once.</div>`}
    </div>`;
  }

  function _compareView(ids) {
    const players = ids.map(id => _pool().find(p => p.id === id)).filter(Boolean);
    if (players.length < 2) return _playerProfile(ids[0]);

    const allKeys = ['fin','sho','hea','cro','dri','tec','fre','pac','acc','sta','str','jum','agi','vis','dec','com','pos','wor','bra','lea','tac','mar','int'];
    const presentKeys = allKeys.filter(k => players.some(p => k in (p.attrs||{})));

    const statRow = (label, vals, higherBetter = true) => {
      const best = higherBetter ? Math.max(...vals) : Math.min(...vals);
      return `<div class="pl-cmp-row">
        <span class="pl-cmp-label">${label}</span>
        ${vals.map(v => `<span class="pl-cmp-val${v===best?' best':''}">${v}</span>`).join('')}
      </div>`;
    };

    return `<div class="pl-compare">
      <div class="pl-cmp-header">
        <span class="pl-cmp-label"></span>
        ${players.map(p => `<span class="pl-cmp-name">${p.name.split(' ').pop()}<button class="pl-cmp-remove" onclick="PlayersUI._toggleCompareSelect('${p.id}')">✕</button></span>`).join('')}
      </div>
      ${statRow('Rating', players.map(p=>p.rat||0))}
      ${statRow('Age', players.map(p=>p.age||0), false)}
      ${statRow('Caps', players.map(p=>_caps(p)))}
      ${statRow('Goals', players.map(p=>_goals(p)))}
      <div class="pl-cmp-divider"></div>
      ${presentKeys.map(k => statRow(k.toUpperCase(), players.map(p => (p.attrs||{})[k] || 0))).join('')}
    </div>`;
  }

  function _openCompare() {
    if (_selectedIds.length < 2) return;
    _renderDetail();
  }

  // ── Actions ──────────────────────────────────────────────────────────────
  function _toggleSquad(id) {
    let ids = [...(State.get('squad.englandSquad') || [])];
    if (ids.includes(id)) {
      ids = ids.filter(x => x !== id);
      // Also remove from active XI/bench if they were placed there
      const slots = State.get('squad.slots');
      if (Array.isArray(slots)) State.set('squad.slots', slots.map(p => (p && p.id===id) ? null : p));
      const bench = State.get('squad.bench');
      if (Array.isArray(bench)) State.set('squad.bench', bench.filter(p => p.id !== id));
    } else {
      if (ids.length >= 26) return; // squad cap
      ids.push(id);
    }
    State.set('squad.englandSquad', ids);
    _renderTable();
    _renderDetail();
  }

  function _toggleWatch(id) {
    const wl = State.get('campaign.watchlist') || [];
    State.set('campaign.watchlist', wl.includes(id) ? wl.filter(x=>x!==id) : [...wl, id]);
    _renderTable();
    _renderDetail();
  }

  function _commissionReport(id) {
    const reports = JSON.parse(JSON.stringify(State.get('campaign.scoutReports')||{}));
    const sc = JSON.parse(JSON.stringify(State.get('campaign.playerScoutCount')||{}));
    const p = _pool().find(x=>x.id===id);
    reports[id] = { notes: p?.bio || 'Scout report filed.', date: State.get('campaign.campaignDate') };
    sc[id] = (sc[id]||0) + 1;
    State.set('campaign.scoutReports', reports);
    State.set('campaign.playerScoutCount', sc);
    _renderDetail();
    _renderTable();
  }

  return {
    init, back, setSort,
    _selectPlayer, _toggleCompareSelect, _openCompare,
    _toggleSquad, _toggleWatch, _commissionReport,
  };

})();
