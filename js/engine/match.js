/**
 * match.js — Live match engine
 *
 * Event-driven match simulation that:
 *  - Uses all 25 player attributes meaningfully
 *  - Respects formation shape (defensive / attacking balance)
 *  - Generates typed events (goals, saves, fouls, cards)
 *  - Tracks injuries during match
 *  - Feeds player ratings per-performance
 */

window.MatchEngine = (function () {

  let _handlers = {};
  let _timer     = null;
  let _interval  = 300; // ms per game tick (overridden by settings)

  const on  = (ev, fn) => { _handlers[ev] = fn; };
  const _emit = (ev, data) => { if (_handlers[ev]) _handlers[ev](data); };

  // ── Helpers ───────────────────────────────────────────────────────────────
  function _rand(min, max) { return Math.random() * (max - min) + min; }

  function _emitTick(minute, possession, score) {
    State.set('match.minute', minute);
    _emit('tick', { minute, possession, score: score || State.get('match.score') });
  }
  function _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function _clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function _poisson(lambda) {
    let L = Math.exp(-lambda), k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  }
  function _push(min, icon, text, side, type) {
    const ev = { min, icon, text, side, type: type || 'event' };
    State.upd('match.events', evs => [...(evs||[]), ev]);
    _emit('event', ev);
  }

  // ── Squad attr aggregation ────────────────────────────────────────────────
  function _squadAttr(squad, attr, posFilter) {
    const players = posFilter ? squad.filter(p => posFilter.includes(p.posG)) : squad;
    if (!players.length) return 10;
    return players.reduce((s, p) => s + ((p.attrs && p.attrs[attr]) || 10), 0) / players.length;
  }

  function _buildTeamStats(squad, formation) {
    // Formation shape directly modifies attPow/defPow (applied at end of _buildTeamStats)
    const formMods = {
      '4-4-2':   [1.00, 1.00],
      '4-3-3':   [1.07, 0.97],  // slight attacking bias
      '4-2-3-1': [1.04, 0.98],
      '3-5-2':   [1.03, 0.98],
      '4-5-1':   [0.91, 1.05],  // modestly defensive
      '4-1-4-1': [0.97, 1.03],
      '5-3-2':   [0.94, 1.05],
      '5-4-1':   [0.88, 1.07],
    };
    const [formAttMod, formDefMod] = formMods[formation] || [1.0, 1.0];
    const attWeight = 0.5;
    const defWeight = 0.5;

    const gks  = squad.filter(p => p.posG === 'GK');
    const defs = squad.filter(p => p.posG === 'DEF');
    const mids = squad.filter(p => p.posG === 'MID');
    const fwds = squad.filter(p => p.posG === 'FWD');

    // Goalkeeping — heavily weighted to actual GK attrs
    const gkPow = gks.length
      ? (_squadAttr(gks,'han',null) * 0.25 + _squadAttr(gks,'ref',null) * 0.35 +
         _squadAttr(gks,'onv',null) * 0.20 + _squadAttr(gks,'pos',null) * 0.20) / 20
      : 0.65;

    // Defensive strength
    const defPow = defs.length
      ? (_squadAttr(defs,'tac',null) * 0.25 + _squadAttr(defs,'mar',null) * 0.20 +
         _squadAttr(defs,'int',null) * 0.15 + _squadAttr(defs,'pos',null) * 0.15 +
         _squadAttr(defs,'str',null) * 0.15 + _squadAttr(defs,'pac',null) * 0.10) / 20
      : 0.65;

    // Midfield control (affects possession + chance creation)
    const midPow = mids.length
      ? (_squadAttr(mids,'pas',null) * 0.25 + _squadAttr(mids,'vis',null) * 0.20 +
         _squadAttr(mids,'dec',null) * 0.15 + _squadAttr(mids,'sta',null) * 0.20 +
         _squadAttr(mids,'tac',null) * 0.10 + _squadAttr(mids,'dri',null) * 0.10) / 20
      : 0.65;

    // Attacking threat
    const attPow = fwds.length
      ? (_squadAttr(fwds,'fin',null) * 0.30 + _squadAttr(fwds,'sho',null) * 0.20 +
         _squadAttr(fwds,'pac',null) * 0.15 + _squadAttr(fwds,'pos',null) * 0.15 +
         _squadAttr(fwds,'hea',null) * 0.10 + _squadAttr(fwds,'dri',null) * 0.10) / 20
      : 0.65;

    // Overall team rating (weighted)
    const overall = gkPow * 0.15 + defPow * 0.30 * defWeight * 2 +
                    midPow * 0.30 + attPow * 0.25 * attWeight * 2;

    // ── Trait bonuses ─────────────────────────────────────────────────────
    let traitAttBonus = 0, traitDefBonus = 0, traitMidBonus = 0;
    squad.forEach(p => {
      if (!p.traits) return;
      p.traits.forEach(t => {
        switch(t) {
          case 'Clinical Finisher':
          case 'Natural Goalscorer':
          case 'Poacher':          traitAttBonus += 0.015; break;
          case 'World Class':      traitAttBonus += 0.02; traitDefBonus += 0.01; break;
          case 'Free Kick Specialist': traitAttBonus += 0.01; break;
          case 'Aerial Dominant':
          case 'Aerial Target Man': traitAttBonus += 0.01; traitDefBonus += 0.01; break;
          case 'Warrior':
          case 'Tenacious Marker': traitDefBonus += 0.015; break;
          case 'Engine':
          case 'High Work Rate':   traitMidBonus += 0.012; break;
          case 'Leader':
          case 'Captain':          traitMidBonus += 0.01; traitDefBonus += 0.01; break;
          case 'Visionary':
          case 'Passing Master':   traitMidBonus += 0.015; break;
          case 'Dribbling Genius':
          case 'Dribbler':         traitAttBonus += 0.01; traitMidBonus += 0.01; break;
          case 'Technical Genius': traitAttBonus += 0.01; traitMidBonus += 0.01; break;
        }
      });
    });

    const capTraitBonus = (v, bonus) => _clamp(v + Math.min(bonus, 0.08), 0.3, 0.95);
    const attPowFinal = capTraitBonus(attPow, traitAttBonus);
    const defPowFinal = capTraitBonus(defPow, traitDefBonus);
    const midPowFinal = capTraitBonus(midPow, traitMidBonus);

    // Star player bonus — best attacker's individual rating boosts attack
    const fwdsSorted = squad.filter(p=>p.posG==='FWD'||p.posG==='MID').sort((a,b)=>(b.rat||70)-(a.rat||70));
    const starBonus = fwdsSorted.length ? Math.max(0, ((fwdsSorted[0].rat||70) - 75) / 500) : 0;
    const attPowStar = _clamp(attPowFinal + starBonus, 0.3, 0.98);

    const attPowForm = _clamp(attPowStar * formAttMod, 0.3, 0.98);
    const defPowForm = _clamp(defPowFinal * formDefMod, 0.3, 0.98);

    return { gkPow, defPow: defPowForm, midPow: midPowFinal, attPow: attPowForm,
             overall: _clamp(overall + (traitAttBonus+traitDefBonus+traitMidBonus)*0.15, 0.3, 0.95) };
  }

  // ── Commentary lines ───────────────────────────────────────────────────────
  const _comm = {
    goal_generic: [
      "Back of the net!", "It's there! What a goal!", "England score!", "A fine finish!",
      "They've done it!", "The net bulges!", "That's a beauty!", "England lead!",
    ],
    goal_header: [
      "{name} wins it in the air — powerful header into the corner!",
      "{name} meets the cross and plants it past the keeper — superb!",
      "Magnificent from {name} — he's risen above everyone!",
      "{name} with the towering header — unstoppable!",
      "That's why you pick {name} — dominant in the air!",
    ],
    goal_shot: [
      "{name} lets fly — and it's a goal!",
      "{name} pulls the trigger — the keeper has no chance!",
      "A clinical finish from {name}! England lead!",
      "{name} slots it home. Cool as you like.",
      "Low and hard from {name} — keeper rooted to the spot!",
      "{name} cuts inside and finds the far corner. Brilliant!",
      "What a strike from {name}! England fans going wild!",
      "{name} — right place, right time, right finish!",
      "The composure of {name}! Doesn't even look at the keeper.",
    ],
    goal_free: [
      "Free kick from {name} — bends round the wall and in — magnificent!",
      "{name} curls it beautifully over the wall. The keeper didn't move!",
      "You'd back {name} every time from that range — GOAL!",
      "Dead ball specialist {name} delivers. Unstoppable.",
    ],
    goal_pen: [
      "{name} steps up — composure personified — GOAL!",
      "Cool as you like from {name}. Penalty converted.",
      "{name} sends the keeper the wrong way. Clinical.",
      "No hesitation from {name}. Right down the middle.",
    ],
    save_great: [
      "{name} — what a save! Fingertips onto the bar!",
      "Brilliant from {name}! Down to his right — he's denied them!",
      "{name} with the reflex stop — incredible!",
      "Instinctive save from {name}! England breathe again.",
      "World class from {name} — that's why he's number one.",
      "{name} claws it away! Just in time!",
      "Somehow {name} gets down to it — point-blank range, still no goal!",
      "{name} at full stretch — his best yet! What a performance.",
      "The {name} save of the tournament — he has no right to keep that out.",
      "Palmed around the post — {name} reading the angles perfectly.",
      "The wall of {name} — England survive a dangerous moment.",
    ],
    save_routine: [
      "{name} comfortably collects.",
      "{name} deals with that well — no fuss.",
      "Keeper gathers safely. Straightforward.",
      "{name} smothers it.",
      "Simple enough for {name} — no danger there.",
      "{name} positions well — takes it cleanly.",
      "Regulation stop from {name}.",
    ],
    shot_on_target: [
      "Good effort — {name} forces a save!",
      "{name} tests the keeper — pushed wide!",
      "Fingertip save denies {name}!",
      "Stinging shot from {name} — keeper holds on!",
      "{name} shoots low — down to his left — corner!",
      "Brilliant save! {name} had the goal at his mercy.",
      "{name} gets the shot away — deflected behind!",
      "So close! {name} forces a world-class save.",
      "The keeper at full stretch — {name} will be frustrated.",
      "{name} curls it... the keeper tips it over the bar. Magnificent effort.",
    ],
    shot_off_target: [
      "Dragged wide by {name} — should have done better.",
      "{name} blazes over from a good position. Wasteful.",
      "Effort from {name} — drifts just past the post.",
      "Off target. {name} was stretching.",
      "High and wide. {name} disappointed with himself.",
      "That's gone over. {name} will want that back.",
      "Inches wide! So close from {name}.",
      "{name} got the direction wrong — straight at the keeper.",
      "Half-hit by {name} — comfortable for the goalkeeper.",
      "Skied it. {name} had time to control but rushed.",
    ],
    corner: [
      "England win a corner. {name} to deliver.",
      "Corner to England — {name} curling it in.",
      "Another set piece opportunity — {name} shapes to take it.",
      "Ball whipped into the box — dangerous delivery from {name}!",
      "{name} swinging it in — looking for a head.",
      "Short corner routine — England working it.",
      "The flags up for a corner — {name} over it.",
    ],
    opp_corner: [
      "Corner to {opp} — England defence needs to deal with this.",
      "The defence must stay organised here.",
      "{opp} earned a corner — all eyes on the box.",
      "England defending their box — clearance required.",
      "Delivery into the area — all eyes on the flight of the ball.",
    ],
    foul_eng: [
      "{name} goes in a bit too hard — free kick given.",
      "Referee stops play — foul by {name}.",
      "{name} catches him late — the ref's not happy.",
      "Cynical from {name} — halts a dangerous counter.",
      "Strong challenge from {name} — the referee has a word.",
      "Free kick conceded. {name} arrived a fraction late.",
      "Clumsy from {name} — he'll know that was over the line.",
    ],
    foul_opp: [
      "Foul on {name} — free kick to England in a dangerous position.",
      "{opp} brings down {name} — England free kick.",
      "Good position for England — {name} brought down.",
      "Foul on {name}. {opp} getting frustrated.",
      "Professional foul — stops the England counter.",
      "{name} rides the challenge but the ref blows. Free kick.",
      "Clear foul — England with an opportunity from this position.",
    ],
    booking: [
      "{name} is booked — one more and he's off.",
      "Yellow card for {name}. Has to be careful.",
      "The referee shows the yellow to {name}.",
      "Caution for {name} — that was late.",
    ],
    booking_opp: [
      "Yellow card shown to an {opp} player.",
      "{opp} have a man in the book.",
      "The referee acts — caution for {opp}.",
    ],
    injury: [
      "{name} goes down — he looks in trouble.",
      "Treatment needed for {name} — could be a substitution.",
      "{name} hobbles — manager might need to act.",
      "Worrying moment — {name} is down holding his hamstring.",
    ],
    dominant: [
      "England are in total control here.",
      "The press is relentless — {opp} can't breathe.",
      "England dominating every department.",
      "One-way traffic — this could get more comfortable.",
      "The crowd are loving this — England at their best.",
      "Stunning performance. {opp} have no answers.",
      "This is vintage England. Every pass finds a team-mate.",
      "The press, the movement, the quality — England clicking.",
      "Overwhelming — {opp} just cannot get out of their own half.",
    ],
    under_pressure: [
      "England under the cosh — need to dig deep.",
      "The back four being tested — must hold firm.",
      "{opp} sensing an equaliser here.",
      "England living dangerously — this is nervy.",
      "The pressure is building. England need to ride this out.",
      "Backs to the wall. England digging in.",
      "This is exactly the test of character they needed.",
      "Ride the storm. England need to stay disciplined.",
    ],
    possession: [
      "England patient — probing — looking for the opening.",
      "The ball is doing the talking. Crisp, confident passing.",
      "England working it from side to side. Looking for the gap.",
      "Good tempo from England — keeping {opp} on the move.",
      "Control and patience — England wait for the right moment.",
      "Methodical and precise — England not rushing this.",
      "Composed possession — England making {opp} run.",
    ],
    chance_missed: [
      "So close! Just over the bar.",
      "Off the post! England get away with it.",
      "Straight at the keeper — should have done better.",
      "The chance goes begging — that has to be a goal.",
      "Heads in hands — inches wide!",
    ],
    keeper_punches: [
      "{name} comes and punches clear — commanding.",
      "{name} wins his penalty area — good dealing.",
    ],
    var_check: [
      "Hold on — the referee is checking with VAR.",
      "VAR reviewing the incident now.",
    ],
    injury_time: [
      "Four minutes of added time shown.",
      "Five minutes of injury time — anything can happen.",
      "The fourth official holds up the board — three added minutes.",
    ],
    commentary_motm: [
      "Full time. {name} was outstanding — {rat} out of ten.",
      "Final whistle. {name} takes the man of the match — {rat}.",
      "And there it is. {name} the star turn today with a {rat} rating.",
    ],
  };
  function _line(key, vars) {
    const arr = _comm[key] || _comm.goal_generic;
    let s = _pick(arr);
    if (vars) Object.entries(vars).forEach(([k,v]) => { s = s.replace(`{${k}}`, v); });
    return s;
  }

  // ── Injury system ─────────────────────────────────────────────────────────
  function _checkInjury(player, minute) {
    // Base 0.3% per minute, higher for already tired players
    const stamina = (player.attrs && player.attrs.sta) || 12;
    const fatigue  = minute > 70 ? 1.5 : 1.0;
    const chance   = (0.003 * (20 - stamina) / 10) * fatigue;
    if (Math.random() < chance) {
      State.upd('match.injuries', inj => [...(inj||[]), {id:player.id, name:player.name, minute}]);
      return true;
    }
    return false;
  }

  // ── Simulate one half ──────────────────────────────────────────────────────
  function _simHalf(engStats, oppStats, halfStart, halfEnd, context) {
    const { engSquad, oppRating, formation } = context;
    let engGoals = State.get('match.score.eng') || 0;
    let oppGoals = State.get('match.score.opp') || 0;

    // Mentality modifier — attacking plays higher risk/reward
    const mentality = State.get('campaign.tactics.mentality') || 'Balanced';
    const mentalityMod = mentality === 'Attack' ? 1.2 : mentality === 'Defend' ? 0.75 : 1.0;
    const mentalityDef = mentality === 'Defend' ? 1.2 : mentality === 'Attack' ? 0.85 : 1.0;

    // Morale modifier — average squad morale affects performance
    const moraleData = State.get('campaign.playerMorale') || {};
    const squadMorales = engSquad.map(p => moraleData[p.id] || 65);
    const avgMorale = squadMorales.reduce((s,v)=>s+v,0) / (squadMorales.length||1);
    // Scale: morale 65 = 1.0, 100 = 1.08, 20 = 0.93
    const moraleMod = 0.93 + (avgMorale / 65) * 0.07;

    // Form streak bonus — players on a hot streak improve attack
    const playerStats2 = State.get('campaign.playerStats') || {};
    const hotPlayers = engSquad.filter(p => {
      const fm = playerStats2[p.id]?.form || [];
      return fm.length >= 3 && fm.slice(-3).every(v => v === 1);
    });
    const coldPlayers = engSquad.filter(p => {
      const fm = playerStats2[p.id]?.form || [];
      return fm.length >= 3 && fm.slice(-3).every(v => v === -1);
    });
    const formMod = 1.0 + (hotPlayers.length * 0.02) - (coldPlayers.length * 0.015);

    // Mismatch multiplier: when England vastly outclass opponents, suppress opp XG further
    const qualRatio = _clamp(engStats.attPow / Math.max(oppStats.attPow, 0.3), 0.7, 2.5);
    const mismatchBoost = _clamp(1.0 + (qualRatio - 1.0) * 0.2, 0.9, 1.25);
    const mismatchSupp  = _clamp(1.0 / mismatchBoost, 0.4, 1.1);

    // Expected goals per half — tuned for ~0.9-1.2 per half (~1.8-2.4 per match)
    const engXG = _clamp(
      (engStats.attPow * 2.0 + engStats.midPow * 0.45) * (1 - oppStats.defPow * 0.42) * 1.0 * mentalityMod * moraleMod * formMod * mismatchBoost,
      0.35, 2.2
    );
    const oppXG = _clamp(
      (oppStats.attPow * 1.9 + oppStats.midPow * 0.4) * (1 - engStats.defPow * 0.45 * mentalityDef) *
      (1 - engStats.gkPow * 0.30) * mismatchSupp,
      0.05, 1.8
    );

    const halfGoals = { eng: _poisson(engXG * 0.55), opp: _poisson(oppXG * 0.55) };

    // Generate goal events at random minutes in this half
    const goalsEng = [];
    for (let i = 0; i < halfGoals.eng; i++) {
      goalsEng.push(Math.floor(_rand(halfStart + 3, halfEnd - 2)));
    }
    const goalsOpp = [];
    for (let i = 0; i < halfGoals.opp; i++) {
      goalsOpp.push(Math.floor(_rand(halfStart + 3, halfEnd - 2)));
    }

    // Combine and sort by minute
    const allEvents = [
      ...goalsEng.map(m => ({ m, side:'eng', type:'goal' })),
      ...goalsOpp.map(m => ({ m, side:'opp', type:'goal' })),
    ].sort((a, b) => a.m - b.m);

    // Non-goal events (shots, fouls, cards)
    const shots  = { eng: Math.floor(_rand(3, 9)), opp: Math.floor(_rand(2, 7)) };
    const shotsOT = { eng: Math.floor(shots.eng * 0.4), opp: Math.floor(shots.opp * 0.35) };

    // ── Rich non-goal events ─────────────────────────────────────────────────
    // Opponent name for commentary
    const fix = window.ALL_FIXTURES[State.get('campaign.fixtureIdx')] || {};
    const oppName = (fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam) || 'Opposition';

    // GK name for saves
    const gk = engSquad.find(p => p.posG === 'GK') || engSquad[0];
    const gkName = gk ? gk.name : 'The keeper';

    // Outfield player pick helper
    const outfield = engSquad.filter(p => p.posG !== 'GK');
    const pickOut = () => _pick(outfield);

    // Generate timed events bucket — one event roughly every 5-7 mins
    const halfLen = halfEnd - halfStart;
    const numEvents = Math.floor(_rand(6, 10)); // 6-9 non-goal events per half
    const eventMinutes = [];
    for (let i = 0; i < numEvents; i++) {
      eventMinutes.push(Math.floor(_rand(halfStart + 2, halfEnd - 2)));
    }
    eventMinutes.sort((a,b) => a - b);

    eventMinutes.forEach((m, idx) => {
      // Don't overlap with goal minutes
      if (allEvents.some(e => Math.abs(e.m - m) < 2)) return;

      const roll = Math.random();
      const engLeading = State.get('match.score.eng') > State.get('match.score.opp');
      const tied = State.get('match.score.eng') === State.get('match.score.opp');
      const p = pickOut();

      if (roll < 0.13) {
        // Shot on target — England
        _push(m, '🎯', _line('shot_on_target', {name: p.name}), 'eng', 'chance');
        State.upd('match.ratings', r => ({...r, [p.id]: _clamp((r[p.id]||6.5)+0.1,5,10)}));
      } else if (roll < 0.22) {
        // Shot off target
        _push(m, '↗', _line('shot_off_target', {name: p.name}), 'eng', 'chance');
      } else if (roll < 0.30) {
        // Keeper save (GK gets rating boost)
        _push(m, '🧤', _line('save_great', {name: gkName}), 'eng', 'save');
        if (gk) State.upd('match.ratings', r => ({...r, [gk.id]: _clamp((r[gk.id]||6.5)+0.3,5,10)}));
      } else if (roll < 0.38) {
        // Corner — England
        const deliverer = engSquad.find(p2 => (p2.attrs?.cro||0) === Math.max(...engSquad.map(x=>x.attrs?.cro||0))) || p;
        _push(m, '🚩', _line('corner', {name: deliverer.name}), 'eng', 'corner');
      } else if (roll < 0.46) {
        // Foul on England player
        _push(m, '⚠', _line('foul_opp', {name: p.name, opp: oppName}), 'eng', 'foul');
      } else if (roll < 0.53) {
        // Foul by England
        const fouler = pickOut();
        _push(m, '⚠', _line('foul_eng', {name: fouler.name}), 'eng', 'foul');
        // Yellow card chance
        if (Math.random() < 0.25) {
          const bookings = State.get('match.bookings') || {};
          const yellows = (bookings[fouler.id] || 0) + 1;
          bookings[fouler.id] = yellows;
          State.set('match.bookings', bookings);

          if (yellows >= 2) {
            // Second yellow → red card
            _push(m, '🟥', `${fouler.name} receives a second yellow — RED CARD! England down to ten men!`, 'eng', 'redcard');
            State.upd('match.redCards', rc => [...(rc||[]), {id: fouler.id, name: fouler.name, minute: m}]);
            // Remove from squad for the rest of the match
            const slots = State.get('squad.slots') || [];
            const si = slots.findIndex(s => s && s.id === fouler.id);
            if (si >= 0) {
              const newSlots = [...slots];
              newSlots[si] = null;
              State.set('squad.slots', newSlots);
            }
            // Significant XG penalty — 10 men
            // We encode this as a morale drop for remaining players
            const remaining = (State.get('squad.slots')||[]).filter(Boolean);
            const moraleData = State.get('campaign.playerMorale') || {};
            remaining.forEach(p => { moraleData[p.id] = Math.max(20, (moraleData[p.id]||65) - 8); });
            State.set('campaign.playerMorale', moraleData);
            State.upd('match.ratings', r => ({...r, [fouler.id]: Math.max(3, (r[fouler.id]||6.5)-2)}));
          } else {
            _push(m, '🟨', _line('booking', {name: fouler.name}), 'eng', 'booking');
            State.upd('match.ratings', r => ({...r, [fouler.id]: _clamp((r[fouler.id]||6.5)-0.2,5,10)}));
          }
        }
      } else if (roll < 0.60) {
        // Dominant / under pressure commentary
        if (engLeading) {
          _push(m, '⚡', _line('dominant', {opp: oppName}), 'eng', 'comment');
        } else if (tied && m > halfStart + 20) {
          _push(m, '⚡', _line('possession', {opp: oppName}), 'eng', 'comment');
        } else {
          _push(m, '🛡️', _line('under_pressure', {opp: oppName}), 'eng', 'comment');
        }
      } else if (roll < 0.66) {
        // Opp corner / pressure
        _push(m, '🚩', _line('opp_corner', {opp: oppName}), 'opp', 'corner');
      } else if (roll < 0.72) {
        // Missed chance
        _push(m, '😤', _line('chance_missed'), 'eng', 'chance');
      } else if (roll < 0.76 && m > 80) {
        // Injury time announcement
        _push(m, '⏱', _line('injury_time'), 'eng', 'comment');
      } else if (roll < 0.785 && m > 55) {
        // Possible second yellow → red card (accumulated bookings)
        const existingBookings = State.get('match.bookings') || {};
        const alreadyBooked = (State.get('squad.slots')||[]).filter(p2 => p2 && existingBookings[p2.id]);
        if (alreadyBooked.length > 0 && Math.random() < 0.4) {
          const culprit = alreadyBooked[Math.floor(Math.random()*alreadyBooked.length)];
          _push(m, '🟥', `${culprit.name} goes in recklessly — SECOND YELLOW! RED CARD! England are down to ten men!`, 'eng', 'redcard');
          State.upd('match.redCards', rc => [...(rc||[]), {id: culprit.id, name: culprit.name, minute: m}]);
          const slots2 = State.get('squad.slots') || [];
          const si2 = slots2.findIndex(s => s && s.id === culprit.id);
          if (si2 >= 0) { const ns = [...slots2]; ns[si2] = null; State.set('squad.slots', ns); }
          const moraleData2 = State.get('campaign.playerMorale') || {};
          (State.get('squad.slots')||[]).filter(Boolean).forEach(p2 => { moraleData2[p2.id] = Math.max(20,(moraleData2[p2.id]||65)-6); });
          State.set('campaign.playerMorale', moraleData2);
        } else {
          _push(m, '🟨', _line('booking_opp', {opp: oppName}), 'opp', 'booking');
        }
      } else if (roll < 0.80) {
        // Opp booking
        _push(m, '🟨', _line('booking_opp', {opp: oppName}), 'opp', 'booking');
      } else {
        // Keeper routine save or possession
        _push(m, '🧤', _line('save_routine', {name: gkName}), 'eng', 'save');
      }
    });

    // Process goal events
    allEvents.forEach(ev => {
      if (ev.side === 'eng') {
        engGoals++;
        State.set('match.score.eng', engGoals);

        // Pick a scorer — weight by finishing/heading
        const fwds  = engSquad.filter(p => p.posG === 'FWD');
        const mids  = engSquad.filter(p => p.posG === 'MID');
        const scorerPool = [...fwds, ...fwds, ...mids]; // fwds twice = more likely
        const scorer = _pick(scorerPool.length ? scorerPool : engSquad);
        const assisterPool = engSquad.filter(p => p.id !== scorer?.id && p.posG !== 'GK');
        const assister = _pick(assisterPool);

        if (scorer) {
          // scorerToUse will be determined after set piece check — use scorer.name initially, update below
          if (assister) State.upd('match.assists.eng', a => [...(a||[]), assister.name]);

          // Set piece taker — use player with highest fre attr
          const setPieceTaker = engSquad.reduce((best, p) =>
            ((p.attrs?.fre||0) > (best?.attrs?.fre||0)) ? p : best, null);
          const isSetPiece = setPieceTaker && (setPieceTaker.attrs?.fre||0) > 14 && Math.random() < 0.15;

          // Type of goal based on attrs
          const goalType = isSetPiece ? 'free'
                         : scorer.attrs?.hea > 15 && Math.random() < 0.25 ? 'header'
                         : 'shot';
          // Override scorer for free kicks
          const actualScorer = isSetPiece ? setPieceTaker : scorer;
          const scorerToUse = actualScorer || scorer;
          // Record actual scorer (after set piece taker determination)
          State.upd('match.scorers.eng', s => [...(s||[]), scorerToUse.name]);
          const key = goalType === 'free' ? 'goal_free' : goalType === 'header' ? 'goal_header' : 'goal_shot';
          const line = _line(key, { name: scorerToUse.name, score: engGoals });
          _push(ev.m, '⚽', line, 'eng', 'goal');
          _emit('goal_eng', { minute: ev.m, scorer: scorerToUse, assister });
          _emit('tick', { minute: ev.m, possession: State.get('match.stats')?.possession || 50, score: State.get('match.score') });

          // Boost scorer rating
          State.upd('match.ratings', rats => ({
            ...rats,
            [scorerToUse.id]: _clamp((rats[scorerToUse.id] || 6.5) + _rand(0.5, 1.2), 5, 10)
          }));
          if (assister) {
            State.upd('match.ratings', rats => ({
              ...rats,
              [assister.id]: _clamp((rats[assister.id] || 6.5) + _rand(0.2, 0.6), 5, 10)
            }));
          }
        } else {
          _push(ev.m, '⚽', _line('goal_generic'), 'eng', 'goal');
        }
      } else {
        oppGoals++;
        State.set('match.score.opp', oppGoals);
        _push(ev.m, '🥅', `Goal conceded — ${oppGoals > 1 ? 'England are in trouble' : 'They\'ve pulled one back'}.`, 'opp', 'goal');
          _emit('goal_opp', { minute: ev.m });
          _emit('tick', { minute: ev.m, possession: State.get('match.stats')?.possession || 50, score: State.get('match.score') });

        // Penalise GK/DEF ratings slightly
        const gk = engSquad.find(p => p.posG === 'GK');
        if (gk) {
          State.upd('match.ratings', rats => ({...rats, [gk.id]: _clamp((rats[gk.id]||6.5)-0.3,4,10)}));
        }
      }
    });

    // Red card — reckless challenge (per half, ~4% chance → ~8% per match)
    if (halfStart > 1 && Math.random() < 0.04) {
      const candidates = engSquad.filter(p => p.posG !== 'GK');
      const culprit = _pick(candidates);
      if (culprit && !(State.get('match.redCards')||[]).find(rc => rc.id === culprit.id)) {
        const redMin = Math.floor(_rand(halfStart + 15, halfEnd - 5));
        _push(redMin, '🟥', `${culprit.name} — reckless challenge! The referee has no hesitation — RED CARD! England finish with ten men.`, 'eng', 'redcard');
        State.upd('match.redCards', rc => [...(rc||[]), {id: culprit.id, name: culprit.name, minute: redMin}]);
        // Remove from pitch
        const slots = State.get('squad.slots') || [];
        const si = slots.findIndex(s => s && s.id === culprit.id);
        if (si >= 0) { const ns = [...slots]; ns[si] = null; State.set('squad.slots', ns); }
        // Rating hit
        State.upd('match.ratings', r => ({...r, [culprit.id]: Math.max(3, (r[culprit.id]||6.5)-2.5)}));
      }
    }

    // Injury check — ~18% per half → ~33% per match
    if (Math.random() < 0.18) {
      const atRisk = engSquad.filter(p => p.posG !== 'GK');
      const victim = _pick(atRisk);
      if (victim) {
        const injMin = Math.floor(_rand(halfStart + 5, halfEnd - 2));
        State.upd('match.injuries', inj => {
          if ((inj||[]).find(i=>i.id===victim.id)) return inj;
          return [...(inj||[]), {id:victim.id, name:victim.name, minute:injMin}];
        });
        _push(injMin, '🩹', _line('injury', {name: victim.name}), 'eng', 'injury');
      }
    }

    // Update stats
    State.upd('match.stats', s => ({
      ...s,
      shots:   { eng:(s.shots.eng||0)+shots.eng,   opp:(s.shots.opp||0)+shots.opp },
      shotsOT: { eng:(s.shotsOT.eng||0)+shotsOT.eng, opp:(s.shotsOT.opp||0)+shotsOT.opp },
    }));

    return { eng: halfGoals.eng, opp: halfGoals.opp };
  }

  // ── Main start ─────────────────────────────────────────────────────────────
  const start = () => {
    _interval = State.get('meta.settings.matchSpeed') ?? 300;

    const slots    = State.get('squad.slots').filter(Boolean);
    const bench    = State.get('squad.bench') || [];
    const formName = State.get('campaign.tactics.formation') || window.DEFAULT_FORMATION || '4-4-2';
    const fix      = window.ALL_FIXTURES[State.get('campaign.fixtureIdx') || 0];

    // Determine opposition strength
    const oppKey    = fix ? (fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam) : 'Unknown';
    const oppRating = fix?.oppRating || 75;
    // Opposition strength: exponential curve so weak teams are genuinely weak
    // San Marino(30)→0.41, Wales(73)→0.77, France(87)→0.89, Brazil(90)→0.92
    const _oppBase = r => _clamp(Math.pow(r / 100, 0.65), 0.28, 0.95);
    const oppAttrs  = {
      gkPow:  _oppBase(oppRating),
      defPow: _oppBase(oppRating),
      midPow: _oppBase(oppRating),
      attPow: _oppBase(oppRating),
    };

    const engStats = _buildTeamStats(slots, formName);

    // Possession weighting (midfield battles)
    const possEng = _clamp(50 + (engStats.midPow - oppAttrs.midPow) * 25, 30, 70);

    // Initialise match state
    State.set('match.score',  { eng:0, opp:0 });
    State.set('match.events', []);
    State.set('match.bookings', {}); // track yellows per player id
    State.set('match.redCards', []); // players sent off
    State.set('match.stats',  {
      possession: Math.round(possEng),
      shots:   { eng:0, opp:0 },
      shotsOT: { eng:0, opp:0 },
      corners: { eng: Math.floor(_rand(2,7)), opp: Math.floor(_rand(1,6)) },
      fouls:   { eng: Math.floor(_rand(8,16)), opp: Math.floor(_rand(8,16)) },
    });
    State.set('match.injuries', []);
    State.set('match.scorers', { eng:[], opp:[] });
    State.set('match.assists', { eng:[], opp:[] });

    // Pre-match commentary context
    if (window.Commentary) {
      const fix = window.ALL_FIXTURES[State.get('campaign.fixtureIdx')] || {};
      const eraLine = window.Commentary.forEra(parseInt(State.get('meta.era') || 1986));
      const oppName = fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam;
      const bigGameLine = oppName ? window.Commentary.forOpponent(oppName) : null;
      if (eraLine) _push(0, '📋', eraLine, 'eng', 'prematch');
      if (bigGameLine) _push(0, '🎙', bigGameLine, 'eng', 'prematch');
    }

    // Initialise ratings at 6.5 for all starters
    const initRatings = {};
    slots.forEach(p => { initRatings[p.id] = 6.5; });
    // Slight attribute-based variance
    slots.forEach(p => {
      const base = ((p.attrs?.dec||10) + (p.attrs?.com||10)) / 40;
      initRatings[p.id] = _clamp(6.5 + base * 0.5, 5.5, 7.5);
    });
    State.set('match.ratings', initRatings);

    const context = { engSquad: slots, oppRating, formation: formName };

    // Simulate both halves
    _simHalf(engStats, oppAttrs, 1,  45, context);
    State.set('match.minute', 45);
    _emit('halftime', { score: State.get('match.score'), stats: State.get('match.stats') });
    // Update scoreboard at halftime
    _emitTick(45, Math.round(possEng), State.get('match.score'));
    _simHalf(engStats, oppAttrs, 46, 90, context);

    // Post-match rating adjustments
    // GK gets bonus for clean sheet
    const finalScore = State.get('match.score');
    if (finalScore.opp === 0) {
      const gk = slots.find(p => p.posG === 'GK');
      if (gk) {
        State.upd('match.ratings', rats => ({
          ...rats, [gk.id]: _clamp((rats[gk.id]||6.5) + 0.6, 5, 10)
        }));
        _push(88, '🧤', `${gk.name} — clean sheet. Outstanding.`, 'eng', 'comment');
      }
    }

    // Man of the match
    const rats = State.get('match.ratings');
    const motm = slots.reduce((best, p) =>
      (rats[p.id]||6.5) > (rats[best?.id]||0) ? p : best, null);
    if (motm) {
      const rating = (rats[motm.id]||6.5).toFixed(1);
      const motmLine = _line('commentary_motm', {name: motm.name, rat: rating});
      _push(90, '⭐', motmLine, 'eng', 'motm');
    }

    // Sort events by minute for clean display
    State.upd('match.events', evts => [...(evts||[])].sort((a,b) => a.min - b.min));

    // ── Record caps and goals at engine level (guaranteed, not UI-dependent) ──
    const _slots = State.get('squad.slots') || [];
    const _played = _slots.filter(Boolean);
    const _stats  = State.get('campaign.playerStats') || {};
    const _scorers = State.get('match.scorers.eng') || [];
    _played.forEach(p => {
      if (!_stats[p.id]) _stats[p.id] = { caps:0, goals:0, form:[] };
      _stats[p.id].caps = (_stats[p.id].caps || 0) + 1;
      const playerGoals = _scorers.filter(name => name === p.name).length;
      _stats[p.id].goals = (_stats[p.id].goals || 0) + playerGoals;
      const fd = (State.get('match.score.eng')||0) - (State.get('match.score.opp')||0);
      _stats[p.id].form = [...(_stats[p.id].form||[]).slice(-4), fd>0?1:fd<0?-1:0];
    });
    // Update pool objects so squad screen reflects new caps immediately
    const _pool = State.get('squad.pool') || [];
    _pool.forEach(p => {
      if (_stats[p.id]) {
        p.caps  = _stats[p.id].caps  || 0;
        p.goals = _stats[p.id].goals || 0;
      }
    });
    State.set('campaign.playerStats', _stats);
    State.set('squad.pool', _pool);

    State.set('match.phase', 'ft');
    _emitTick(90, Math.round(possEng), State.get('match.score'));
    _emit('fulltime', State.get('match'));
  };

  const stop = () => {
    if (_timer) { clearInterval(_timer); _timer = null; }
  };

  const makeSub = (offIdx, onIdx) => {
    const slots  = [...State.get('squad.slots')];
    const bench  = [...State.get('squad.bench')];
    const out    = slots[offIdx];
    const coming = bench[onIdx];
    if (!out || !coming) return false;
    slots[offIdx] = coming;
    bench.splice(onIdx, 1);
    State.set('squad.slots', slots);
    State.set('squad.bench', bench);
    State.upd('match.subsUsed', n => n + 1);
    State.set('match.ratings',
      window.RatingsEngine.applySub(State.get('match.ratings'), coming.id)
    );
    _push(State.get('match.minute') || 60, '🔄',
      `${coming.name} replaces ${out.name}`, 'eng', 'substitution');
    _emit('substitution', { out, coming });
    return true;
  };

  return { on, start, stop, makeSub };
})();
