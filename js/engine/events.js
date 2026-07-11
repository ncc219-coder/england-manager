/**
 * events.js — Match event engine
 *
 * Every tick produces one event. Probabilities are driven by:
 *  - Individual player attributes (pac, sho, pas, dri, def, phy, sta, men)
 *  - Player instructions set in tactics
 *  - Team-level tactics (mentality, press, tempo)
 *  - Training focus for this fixture
 *  - Stamina decay after minute 65
 */
window.EventEngine = {

  tick(minute, state) {
    const { engAvg, oppAvg, tactics, possession, squad, instructions, trainBonus } = state;
    const r = Math.random();

    const ec = state.engChance || window.TacticsEngine.engAttackChance(possession, tactics);
    const oc = state.oppChance || window.TacticsEngine.oppAttackChance(possession, oppAvg, engAvg, tactics);

    if (r < ec) {
      const scorer = this._pickScorer(squad, tactics, instructions);
      const goalProb = window.TacticsEngine.engGoalProb(engAvg, oppAvg, tactics, instructions, squad)
        * (trainBonus?.engChanceMult || 1)
        * (trainBonus?.setPieceMult && minute > 85 ? 1.1 : 1);
      return Math.random() < goalProb
        ? { type:'goal_eng', scorer, minute, assist: this._pickAssist(squad, scorer) }
        : { type:'miss_eng', minute };
    }

    if (r < ec + oc) {
      const goalProb = window.TacticsEngine.oppGoalProb(oppAvg, engAvg, tactics)
        * (trainBonus?.oppChanceMult || 1);
      return Math.random() < goalProb
        ? { type:'goal_opp', minute }
        : { type:'miss_opp', minute };
    }

    // Secondary events
    const rr = Math.random();
    if (rr < 0.010) {
      // Yellow: more likely from high-press players and high-mentality games
      const candidate = this._pickYellowCandidate(squad, tactics);
      return { type:'yellow_eng', player:candidate, minute };
    }
    if (rr < 0.021) return { type:'yellow_opp', minute };
    if (rr < 0.030) return { type:'corner_eng', minute };
    if (rr < 0.038) return { type:'corner_opp', minute };
    return { type:'none', minute };
  },

  // ── Scorer selection weighted by position + individual attributes ──────────
  _pickScorer(squad, tactics, instructions) {
    if (!squad || !squad.length) return squad?.[0];
    const weights = squad.map(p => {
      const a = p.attrs || {};
      let w = 0.2; // baseline — anyone can score
      if (p.posG === 'FWD') w = 3.5 + (a.sho || 12) * 0.12;
      if (p.posG === 'MID') w = 1.2 + (a.sho || 12) * 0.06;
      if (p.posG === 'DEF') w = 0.25 + (a.phy || 12) * 0.02; // headers from set pieces
      if (p.posG === 'GK')  w = 0.02;
      // Instruction bonus
      const pi = instructions?.[p.id] || {};
      if (pi.runs === 'Get Forward') w *= 1.3;
      if (pi.shooting === 'Shoot On Sight') w *= 1.2;
      if (tactics?.mentality === 'Attack') w *= 1.15;
      return Math.max(0.05, w);
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < squad.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return squad[i];
    }
    return squad[0];
  },

  // ── Assist: pick a midfielder/forward who passed to the scorer ────────────
  _pickAssist(squad, scorer) {
    if (!squad || !scorer) return null;
    const candidates = squad.filter(p => p.id !== scorer.id && (p.posG === 'MID' || p.posG === 'FWD'));
    if (!candidates.length) return null;
    const weights = candidates.map(p => {
      const a = p.attrs || {};
      return Math.max(0.1, (a.pas || 12) * 0.3 + (a.dri || 12) * 0.1);
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < candidates.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return candidates[i];
    }
    return candidates[0];
  },

  // ── Yellow: more likely from aggressive players and pressing tactics ───────
  _pickYellowCandidate(squad, tactics) {
    if (!squad || !squad.length) return squad?.[0];
    const pressIntensity = { None:0.5, Low:0.7, Mid:1.0, High:1.3, Intense:1.7 }[tactics?.press] || 1.0;
    const weights = squad.map(p => {
      const a = p.attrs || {};
      // Low mentality = more disciplined; high physical = more bookings
      const aggression = (a.phy || 12) * 0.12 + Math.max(0, 16 - (a.men || 12)) * 0.1;
      return Math.max(0.1, aggression * pressIntensity);
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < squad.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return squad[i];
    }
    return squad[Math.floor(Math.random() * squad.length)];
  },
};
