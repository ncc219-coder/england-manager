const StateManager = (() => {
  const DEFAULTS = {
    meta: { manager:'Neil Curtis', era:1986, difficulty:'Professional', version:'1.0.0',
      settings: {
        historicRealism: 70,   // 0=fully simulated, 100=fully historical (non-England games)
        matchSpeed:      300,  // ms per minute tick: 150 (fast) / 300 (normal) / 600 (slow)
        showRatings:     true, // show player ratings during match
        autoSave:        true, // save after each result
      }
    },
    campaign: {
      season:1986, fixtureIdx:0, results:[], 
      record:{played:0,won:0,drawn:0,lost:0,gf:0,ga:0},
      reputation:50, boardConfidence:60,
      announcedSquad:[], trainingFocus:null,
      campaignDate:'1986-04-01',
      completedFixtureIds:[],
      playerStats: {},        // { playerId: {caps,goals,assists,yellows,totalRating,appearances,form:[],lastOpponent} }
      opponentHistory: {},    // { oppKey: {played,won,drawn,lost,gf,ga,rating} }
      qualifierState: {},    // { groupKey: {results:{}, table:{}} }
      seasonYear:1986,
      // Tactics state
      tactics:{
        formation:'4-4-2', mentality:'Balanced', press:'Mid',
        tempo:'Normal', width:'Normal', setpieces:'Mixed',
        defensive_line:'Normal', transition:'Counter', instructions:{}
      },
      // Squad management
      englandSquad: [],   // Array of player IDs in 26-man squad
      // Player state
      playerMorale: {},   // { playerId: 0-100 }
      playerScoutCount: {},  // { playerId: number }
      watchlist: [],      // Array of player IDs
      scoutReports: {},   // { playerId: { date, notes } }
      // Media & FA
      media: { trust:58, fanMood:64, pressure:52, lastAnswer:null },
      fa: { confidence:65, expectation:'Qualify', meetingHistory:[] },
      // Tournament tracking
      groupTable: {},     // { teamName: {p,w,d,l,gf,ga,pts} }
      // Team talks
      lastTeamTalk: null,
      prepChecklist: [],
    },
    tournament: {
      key:null, phase:null, englandPath:[], tables:{}, results:{},
      bracket:{}, englandElim:false, currentMatchId:null,
    },
    squad: {
      slots: new Array(11).fill(null),
      bench: [],
      pool: [],
    },
    match: {
      running:false, minute:0,
      score:{eng:0,opp:0}, scorers:{eng:[],opp:[]}, events:[],
      stats:{
        shots:{eng:0,opp:0}, shotsOT:{eng:0,opp:0},
        possession:50, fouls:{eng:0,opp:0},
        corners:{eng:0,opp:0}, yellows:{eng:0,opp:0},
      },
      tactics:{mentality:'Balanced',press:'Mid',tempo:'Normal',width:'Normal',setpieces:'Mixed'},
      ratings:{}, subsUsed:0, subOff:null, subOn:null, fixture:null,
    },
  };

  let _s = JSON.parse(JSON.stringify(DEFAULTS));
  const _L = {};

  const get  = p  => p ? p.split('.').reduce((o,k) => o?.[k], _s) : _s;
  const set  = (p,v) => {
    const ks = p.split('.'), l = ks.pop();
    const t  = ks.reduce((o,k) => (o[k] && typeof o[k] === 'object') ? o[k] : (o[k] = {}), _s);
    t[l] = v;
    _emit(p,v);
  };
  const upd  = (p,fn) => set(p, fn(get(p)));
  const reset= () => { _s = JSON.parse(JSON.stringify(DEFAULTS)); };
  const on   = (e,fn) => { (_L[e]||(_L[e]=[])).push(fn); };
  const off  = (e,fn) => { if(_L[e]) _L[e]=_L[e].filter(f=>f!==fn); };
  function _emit(p,v){ (_L[p]||[]).forEach(f=>f(v)); (_L['*']||[]).forEach(f=>f(p,v)); }
  const save = () => {
    try {
      localStorage.setItem('em_v1', JSON.stringify(_s));
      return true;
    } catch (e) {
      _warnSaveFailed();
      return false;
    }
  };

  // Surface a save failure to the player even when the calling code doesn't
  // check save()'s return value (most call sites don't — autosave after a
  // match, after team-talk choices, etc.). Without this, a player whose
  // browser blocks storage (private mode, full disk, disabled storage) would
  // believe their career was saving normally and could lose hours of
  // progress on reload with zero warning.
  let _lastSaveWarnAt = 0;
  function _warnSaveFailed() {
    const now = Date.now();
    if (now - _lastSaveWarnAt < 10000) return; // don't spam — once every 10s max
    _lastSaveWarnAt = now;
    try {
      if (typeof document === 'undefined') return;
      const old = document.getElementById('em-save-warning');
      if (old) old.remove();
      const el = document.createElement('div');
      el.id = 'em-save-warning';
      el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
        'z-index:9999;background:#3a1212;border:1px solid #c8102e;color:#fff;' +
        'padding:12px 20px;border-radius:8px;font-family:system-ui,sans-serif;' +
        'font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.5);max-width:360px;text-align:center';
      el.textContent = "⚠ Couldn't save your progress — check your browser's storage settings.";
      document.body.appendChild(el);
      setTimeout(() => { const e2 = document.getElementById('em-save-warning'); if (e2) e2.remove(); }, 6000);
    } catch (e2) { /* never throw from a warning about a failed save */ }
  }
  const load = () => { try{ const d=localStorage.getItem('em_v1'); if(d){_s=JSON.parse(d);return true;} return false; }catch(e){return false;} };

  return { get, set, upd, reset, on, off, save, load };
})();
window.State = StateManager;
