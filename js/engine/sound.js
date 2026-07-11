/**
 * sound.js — Lightweight sound manager
 *
 * Plays short SFX (whistle, goal, click, card) and a looping ambient
 * crowd track during matches. Respects meta.settings.soundEnabled.
 * Designed to fail silently if audio can't play (autoplay restrictions,
 * missing files, etc.) — never throws, never blocks gameplay.
 */

window.Sound = (function () {

  const FILES = {
    whistle: 'audio/whistle.mp3',
    goal:    'audio/goal.mp3',
    click:   'audio/click.mp3',
    card:    'audio/card.mp3',
    crowd:   'audio/crowd_ambient.mp3',
  };

  const _cache = {};
  let _crowdEl = null;
  let _unlocked = false;

  // ── Synthesized effects (no audio file needed) ──────────────────────────
  // A couple of short cues are generated on the fly via the Web Audio API
  // rather than loaded from a file — this project has no real "miss" sound
  // asset, and the penalty shootout overlay was reusing "card" (a stern
  // buzzer meant for a foul) as a stand-in, which reads oddly for a missed
  // kick. Synthesizing a genuine descending "thud" here means a real,
  // purpose-built sound without needing a new audio file at all. Fails
  // silently exactly like the file-based path if AudioContext isn't
  // available for any reason.
  let _actx = null;
  function _audioCtx() {
    if (_actx) return _actx;
    try { _actx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
    return _actx;
  }

  function _synthMiss(volume) {
    const ctx = _audioCtx(); if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.28);
      gain.gain.setValueAtTime((volume ?? 0.5) * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.32);
    } catch (e) { /* never throw from sound */ }
  }

  function _synthKickoff(volume) {
    const ctx = _audioCtx(); if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [660, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime((volume ?? 0.4) * 0.35, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.08);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.09); osc.stop(now + i * 0.09 + 0.08);
      });
    } catch (e) { /* never throw from sound */ }
  }

  const SYNTH = { miss: _synthMiss, kickoff: _synthKickoff };

  function _enabled() {
    const s = State.get('meta.settings') || {};
    return s.soundEnabled !== false; // default ON
  }

  function _get(name) {
    if (_cache[name]) return _cache[name];
    try {
      const el = new Audio(FILES[name]);
      el.preload = 'auto';
      _cache[name] = el;
      return el;
    } catch (e) {
      return null;
    }
  }

  function play(name, volume) {
    if (!_enabled()) return;
    try {
      if (SYNTH[name]) { SYNTH[name](volume); return; }
      const base = _get(name);
      if (!base) return;
      // Clone so overlapping plays (e.g. rapid clicks) don't cut each other off
      const el = base.cloneNode();
      el.volume = volume !== undefined ? volume : 0.7;
      el.play().catch(() => {}); // swallow autoplay rejection silently
    } catch (e) { /* never throw from sound */ }
  }

  function startCrowd() {
    if (!_enabled()) return;
    try {
      if (!_crowdEl) {
        _crowdEl = new Audio(FILES.crowd);
        _crowdEl.loop = true;
      }
      _crowdEl.volume = 0.35;
      _crowdEl.play().catch(() => {});
    } catch (e) { /* noop */ }
  }

  function stopCrowd() {
    try {
      if (_crowdEl) { _crowdEl.pause(); _crowdEl.currentTime = 0; }
    } catch (e) { /* noop */ }
  }

  function duckCrowd(ms) {
    // Briefly lower crowd volume for a goal/whistle moment, then restore
    if (!_crowdEl) return;
    try {
      const orig = _crowdEl.volume;
      _crowdEl.volume = orig * 0.4;
      setTimeout(() => { try { _crowdEl.volume = orig; } catch(e){} }, ms || 1500);
    } catch (e) { /* noop */ }
  }

  // Attach a single global click-sound listener for buttons (delegated, lightweight)
  function attachUIClicks() {
    if (_unlocked) return;
    _unlocked = true;
    document.addEventListener('click', (e) => {
      const t = e.target.closest('button, .sq2-pf, .sq2-form-btn, .tac-btn, .pf-btn');
      if (t) play('click', 0.25);
    }, { passive: true });
  }

  return { play, startCrowd, stopCrowd, duckCrowd, attachUIClicks };

})();
