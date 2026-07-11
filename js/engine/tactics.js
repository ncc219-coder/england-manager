/**
 * tactics.js — Converts team + player tactics into match simulation modifiers.
 *
 * All probabilities are grounded in actual player attributes,
 * not just team averages.
 */
window.TacticsEngine = {

  // ── Squad attribute averages ───────────────────────────────────────────────
  _avgAttr(squad, attr, posGroups) {
    const filtered = posGroups
      ? squad.filter(p => posGroups.includes(p.posG))
      : squad;
    if (!filtered.length) return 12;
    return filtered.reduce((a, p) => a + ((p.attrs || {})[attr] || 12), 0) / filtered.length;
  },

  // ── Possession calculation ─────────────────────────────────────────────────
  calcPossession(engAvg, oppAvg, tactics, prev, squad) {
    const qBase = (engAvg - oppAvg) * 0.45;
    // Passing quality from midfielders affects possession
    const midPass = squad ? this._avgAttr(squad, 'pas', ['MID']) * 1.5 : 0;
    const mBonus  = { Defensive:-6, Cautious:-3, Balanced:0, Positive:3, Attack:6 }[tactics?.mentality] || 0;
    const pBonus  = { None:-4, Low:-2, Mid:0, High:4, Intense:6 }[tactics?.press] || 0;
    const tBonus  = { Slow:-2, Normal:0, Fast:2 }[tactics?.tempo] || 0;
    const n       = (Math.random() - 0.5) * 9;
    return Math.min(76, Math.max(24, Math.round(
      prev * 0.3 + (50 + qBase + midPass * 0.05 + mBonus + pBonus + tBonus + n) * 0.7
    )));
  },

  // ── England attack chance per minute ──────────────────────────────────────
  engAttackChance(poss, tactics, squad) {
    const base   = 0.052;
    const pBonus = (poss - 50) * 0.001;
    const mBonus = { Defensive:-.014, Cautious:-.007, Balanced:0, Positive:.01, Attack:.018 }[tactics?.mentality] || 0;
    const dBonus = { Deep:-.006, Normal:0, High:.004 }[tactics?.defensive_line] || 0;
    // Forward pace and dribbling increase transition chances
    const fwdPac = squad ? this._avgAttr(squad, 'pac', ['FWD','MID']) * 0.0008 : 0;
    return Math.max(0.015, base + pBonus + mBonus + dBonus + fwdPac);
  },

  // ── Opponent attack chance per minute ─────────────────────────────────────
  oppAttackChance(poss, oppAvg, engAvg, tactics, squad) {
    const base   = 0.038;
    const qBonus = (oppAvg - engAvg) * 0.001;
    const pBonus = ((100 - poss) - 50) * 0.001;
    const mPen   = { Defensive:.012, Cautious:.006, Balanced:0, Positive:-.004, Attack:-.01 }[tactics?.mentality] || 0;
    const prBonus= { None:.01, Low:.005, Mid:0, High:-.005, Intense:-.01 }[tactics?.press] || 0;
    // Defensive line depth: high line increases opp chances if they have pace
    const dlPen  = { Deep:-.004, Normal:0, High:.008 }[tactics?.defensive_line] || 0;
    // Good central defenders reduce opp chances
    const defCap = squad ? Math.min(0.006, this._avgAttr(squad, 'def', ['DEF']) * 0.0003) : 0;
    return Math.max(0.01, base + qBonus + pBonus + mPen + prBonus + dlPen - defCap);
  },

  // ── England goal probability when a chance is created ─────────────────────
  engGoalProb(engAvg, oppAvg, tactics, instructions, squad) {
    const base   = 0.27;
    const qBonus = (engAvg - oppAvg) * 0.007;
    const mBonus = { Defensive:-.04, Cautious:-.02, Balanced:0, Positive:.04, Attack:.07 }[tactics?.mentality] || 0;

    let instrBonus = 0;
    if (instructions && squad) {
      squad.forEach(p => {
        const pi = instructions[p.id] || {};
        const a  = p.attrs || {};
        // High shooting stat + shoot on sight instruction = bonus
        if (p.posG === 'FWD') instrBonus += (a.sho || 12) * 0.0006;
        if (pi.runs === 'Stay Forward') instrBonus += 0.006;
        if (pi.shooting === 'Shoot On Sight') instrBonus += 0.005;
        if (p.posG === 'MID' && pi.runs === 'Get Forward') instrBonus += 0.004;
      });
    }

    // Forward shooting average directly affects goal conversion
    const fwdSho = squad ? this._avgAttr(squad, 'sho', ['FWD']) * 0.003 : 0;

    return Math.max(0.08, Math.min(0.55, base + qBonus + mBonus + instrBonus + fwdSho));
  },

  // ── Opponent goal probability when a chance is created ────────────────────
  oppGoalProb(oppAvg, engAvg, tactics, squad) {
    const base   = 0.22;
    const qBonus = (oppAvg - engAvg) * 0.007;
    const mPen   = { Defensive:-.06, Cautious:-.03, Balanced:0, Positive:.02, Attack:.04 }[tactics?.mentality] || 0;
    const dlBonus= { Deep:-.03, Normal:0, High:.02 }[tactics?.defensive_line] || 0;
    // Goalkeeper rating reduces opp goal probability
    const gkBonus = squad ? (() => {
      const gk = squad.find(p => p.posG === 'GK');
      if (!gk) return 0;
      const a = gk.attrs || {};
      return ((a.ref || 12) + (a.pos || 12)) * 0.0008;
    })() : 0;
    // Defensive mentality of back four
    const defMen = squad ? this._avgAttr(squad, 'men', ['DEF']) * 0.001 : 0;
    return Math.max(0.06, Math.min(0.50, base + qBonus + mPen + dlBonus - gkBonus - defMen));
  },

  // ── Stamina penalty after minute 65 ───────────────────────────────────────
  staminaPenalty(minute, trainingFocus, squad) {
    if (minute < 65) return 0;
    const base = (minute - 65) * 0.0009;
    // Average stamina of the current XI reduces the penalty
    const avgSta = squad ? this._avgAttr(squad, 'sta') : 12;
    const staBonus = Math.max(0, (avgSta - 12) * 0.00005);
    const trainBonus = trainingFocus === 'fitness' ? 0.45 : 1.0;
    return Math.max(0, (base - staBonus) * trainBonus);
  },
};
