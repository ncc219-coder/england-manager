/**
 * settings.js — SettingsUI
 *
 * A modal overlay accessible from any screen.
 * Settings are stored in State.get('meta.settings') and persist via localStorage.
 */
window.SettingsUI = {

  open() {
    const old = document.getElementById('settings-overlay');
    if (old) old.remove();
    const el = document.createElement('div');
    el.id        = 'settings-overlay';
    el.className = 'settings-overlay';
    el.innerHTML = this._render();
    el.addEventListener('click', e => { if (e.target === el) this.close(); });
    document.body.appendChild(el);
    this._bindEvents();
  },

  close() {
    const el = document.getElementById('settings-overlay');
    if (el) el.remove();
    State.save();
  },

  _s() {
    // Return settings with defaults
    const saved = State.get('meta.settings') || {};
    return {
      historicRealism: saved.historicRealism ?? 70,
      matchSpeed:      saved.matchSpeed      ?? 300,
      showRatings:     saved.showRatings     ?? true,
      autoSave:        saved.autoSave        ?? true,
      soundEnabled:    saved.soundEnabled    ?? true,
    };
  },

  _render() {
    const s = this._s();
    const realismPct  = s.historicRealism;
    const realismDesc = this._realismDesc(realismPct);
    const speedLabel  = { 150:'Fast', 300:'Normal', 600:'Slow' }[s.matchSpeed] || 'Normal';

    return `
      <div class="settings-modal">
        <div class="settings-head">
          <div class="settings-title">Settings</div>
          <button class="settings-close" onclick="SettingsUI.close()">✕</button>
        </div>
        <div class="settings-body">

          <!-- ── SIMULATION ─────────────────────────────── -->
          <div class="settings-section">
            <div class="settings-section-head">Simulation</div>

            <div class="setting-row">
              <div class="setting-label-row">
                <span class="setting-label">Historical Realism</span>
                <span class="setting-value" id="realism-val">${realismPct}%</span>
              </div>
              <div class="setting-desc">
                Controls how likely non-England fixtures are to follow real-life results.
                At 0% everything is simulated from team ratings. At 100% all other results
                match history exactly.
              </div>
              <div class="setting-slider-wrap">
                <span class="slider-end-label">Simulated</span>
                <input type="range" class="setting-slider realism" id="realism-slider"
                  min="0" max="100" step="5" value="${realismPct}"
                  style="--fill:${realismPct}%"
                  oninput="SettingsUI._onRealism(this.value)">
                <span class="slider-end-label">Historical</span>
              </div>
              <div class="realism-indicator" id="realism-indicator">
                ${realismDesc}
              </div>
            </div>
          </div>

          <!-- ── MATCH EXPERIENCE ───────────────────────── -->
          <div class="settings-section">
            <div class="settings-section-head">Match Experience</div>

            <div class="setting-row">
              <div class="setting-label-row">
                <span class="setting-label">Match Speed</span>
              </div>
              <div class="setting-desc">How fast each minute of the match ticks by.</div>
              <div class="setting-seg">
                <button class="seg-btn${s.matchSpeed===150?' active':''}"
                  onclick="SettingsUI._setSpeed(150,this)">Fast</button>
                <button class="seg-btn${s.matchSpeed===300?' active':''}"
                  onclick="SettingsUI._setSpeed(300,this)">Normal</button>
                <button class="seg-btn${s.matchSpeed===600?' active':''}"
                  onclick="SettingsUI._setSpeed(600,this)">Slow</button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-toggle-row">
                <div class="toggle-info">
                  <div class="setting-label">Show Live Ratings</div>
                  <div class="setting-desc" style="margin-top:3px">
                    Display player match ratings in the XI panel during the game.
                  </div>
                </div>
                <div class="toggle-switch${s.showRatings?' on':''}" id="toggle-ratings"
                  onclick="SettingsUI._toggle('showRatings','toggle-ratings')"></div>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-toggle-row">
                <div class="toggle-info">
                  <div class="setting-label">Sound Effects</div>
                  <div class="setting-desc" style="margin-top:3px">
                    Crowd ambience, whistle, goal sting and UI sounds during matches.
                  </div>
                </div>
                <div class="toggle-switch${s.soundEnabled?' on':''}" id="toggle-sound"
                  onclick="SettingsUI._toggle('soundEnabled','toggle-sound')"></div>
              </div>
            </div>
          </div>

          <!-- ── SAVE ────────────────────────────────────── -->
          <div class="settings-section">
            <div class="settings-section-head">Help</div>

            <div class="setting-row">
              <div class="setting-toggle-row">
                <div class="toggle-info">
                  <div class="setting-label">Replay Tutorial</div>
                  <div class="setting-desc" style="margin-top:3px">
                    Run through the dashboard walkthrough again from the start.
                  </div>
                </div>
                <button onclick="SettingsUI.close();window.Onboarding&&window.Onboarding.restart()"
                  style="padding:8px 16px;background:var(--bg4);border:1px solid var(--border2);color:var(--t1);font-family:var(--font-ui);font-size:12px;font-weight:700;cursor:pointer;border-radius:6px">
                  Start Tour
                </button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <div class="settings-section-head">Appearance</div>

            <div class="setting-row">
              <div class="setting-label-row">
                <span class="setting-label">Dark Mode</span>
                <label class="toggle-switch" style="cursor:pointer;display:flex;align-items:center;gap:8px">
                  <input type="checkbox" id="dark-mode-toggle" 
                    ${document.documentElement.getAttribute('data-theme')==='dark' ? 'checked' : ''}
                    onchange="SettingsUI._setDarkMode(this.checked)"
                    style="width:36px;height:20px;cursor:pointer;accent-color:var(--blue,#378ADD)">
                  <span class="setting-value" id="dark-mode-label">${document.documentElement.getAttribute('data-theme')==='dark'?'On':'Off'}</span>
                </label>
              </div>
              <div class="setting-desc">Switch between light and dark interface.</div>
            </div>

          </div>

          <div class="settings-section">
            <div class="settings-section-head">Save</div>

            <div class="setting-row">
              <div class="setting-toggle-row">
                <div class="toggle-info">
                  <div class="setting-label">Auto-Save</div>
                  <div class="setting-desc" style="margin-top:3px">
                    Automatically save your campaign after each match result.
                  </div>
                </div>
                <div class="toggle-switch${s.autoSave?' on':''}" id="toggle-autosave"
                  onclick="SettingsUI._toggle('autoSave','toggle-autosave')"></div>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-label" style="margin-bottom:6px">Campaign Data</div>
              <div class="setting-desc" style="margin-bottom:10px">
                Save and load your campaign from browser storage.
                Clearing will permanently delete your current save.
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-ghost" style="height:40px;font-size:13px;flex:1"
                  onclick="SettingsUI._saveGame()">Save Now</button>
                <button class="btn btn-ghost" style="height:40px;font-size:13px;flex:1"
                  onclick="SettingsUI._loadGame()">Load Save</button>
                <button class="btn btn-ghost" style="height:40px;font-size:13px;color:var(--red);border-color:rgba(200,16,46,.3)"
                  onclick="SettingsUI._clearSave()">Clear Save</button>
              </div>
              <div id="settings-save-msg" style="font-size:13px;color:var(--green);margin-top:6px;min-height:18px"></div>
            </div>
          </div>

        </div>
        <div class="settings-foot">
          <button class="btn btn-ghost" onclick="SettingsUI.close()">Close</button>
          <button class="btn btn-primary" onclick="SettingsUI._applyAndClose()">Apply & Close</button>
        </div>
      </div>`;
  },

  _bindEvents() {
    // Slider track fill on init
    const sl = document.getElementById('realism-slider');
    if (sl) this._updateSliderFill(sl);
  },

  _onRealism(val) {
    val = parseInt(val);
    const el  = document.getElementById('realism-val');
    const ind = document.getElementById('realism-indicator');
    const sl  = document.getElementById('realism-slider');
    if (el)  el.textContent = val + '%';
    if (ind) ind.innerHTML  = this._realismDesc(val);
    if (sl)  this._updateSliderFill(sl);
    State.upd('meta.settings', s => ({ ...s, historicRealism: val }));
  },

  _updateSliderFill(slider) {
    const val = parseInt(slider.value);
    const pct = ((val - parseInt(slider.min)) / (parseInt(slider.max) - parseInt(slider.min))) * 100;
    slider.style.setProperty('--fill', pct + '%');
  },

  _realismDesc(val) {
    if (val === 0)   return '<strong>Full Simulation.</strong> Every non-England result is generated entirely from team ratings. History is gone — anything can happen.';
    if (val <= 20)   return '<strong>Almost Simulated.</strong> Upsets are common. Lower-rated teams regularly beat favourites. The tournament landscape will feel unfamiliar.';
    if (val <= 40)   return '<strong>Loosely Historical.</strong> Real results occur occasionally but major upsets and surprises happen often.';
    if (val <= 60)   return '<strong>Balanced.</strong> A mix of historical and simulated results. Familiar names progress most of the time but the tournament can diverge.';
    if (val <= 80)   return '<strong>Mostly Historical.</strong> Most non-England results follow real life. Occasional surprises keep it fresh. <em>Recommended.</em>';
    if (val < 100)   return '<strong>Near-Historical.</strong> Only rare deviations from the real timeline. Argentina will almost always be in the quarter-final.';
    return '<strong>Fully Historical.</strong> Every non-England result is exactly as it happened. Only your results change the story.';
  },

  _setDarkMode(on) {
    document.documentElement.setAttribute('data-theme', on ? 'dark' : 'light');
    localStorage.setItem('em_theme', on ? 'dark' : 'light');
    const lbl = document.getElementById('dark-mode-label');
    if (lbl) lbl.textContent = on ? 'On' : 'Off';
    State.upd('meta.settings', s => ({ ...(s||{}), darkMode: on }));
  },

  _setSpeed(val, btn) {
    document.querySelectorAll('.setting-seg .seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    State.upd('meta.settings', s => ({ ...s, matchSpeed: val }));
  },

  _toggle(key, elId) {
    const el  = document.getElementById(elId);
    const cur = State.get('meta.settings.' + key) ?? true;
    const nxt = !cur;
    State.upd('meta.settings', s => ({ ...s, [key]: nxt }));
    if (el) el.classList.toggle('on', nxt);
  },

  _saveGame() {
    const ok = State.save();
    const msg = document.getElementById('settings-save-msg');
    if (msg) {
      msg.textContent = ok ? '✓ Saved successfully.' : '✗ Save failed.';
      msg.style.color = ok ? 'var(--green)' : 'var(--red)';
      setTimeout(() => { if (msg) msg.textContent = ''; }, 3000);
    }
  },

  _loadGame() {
    const ok = State.load();
    const msg = document.getElementById('settings-save-msg');
    if (msg) {
      msg.textContent = ok ? '✓ Save loaded.' : '✗ No save found.';
      msg.style.color = ok ? 'var(--green)' : 'var(--red)';
      setTimeout(() => { if (msg) msg.textContent = ''; }, 3000);
    }
    if (ok) this.close();
  },

  _clearSave() {
    if (!confirm('Clear your saved campaign? This cannot be undone.')) return;
    try { localStorage.removeItem('em_v1'); } catch(e) {}
    const msg = document.getElementById('settings-save-msg');
    if (msg) { msg.textContent = '✓ Save cleared.'; msg.style.color = 'var(--t3)'; }
  },

  _applyAndClose() {
    State.save();
    this.close();
  },
};
