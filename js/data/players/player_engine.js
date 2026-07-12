/**
 * player_engine.js
 *
 * Calculates player data dynamically for any given year.
 * Uses PLAYER_MASTER as the single source of truth.
 *
 * Age curve:
 *   Age 17-18  →  ~62% of peak (raw youngster)
 *   Age 19-20  →  ~72% of peak (emerging)
 *   Age 21-22  →  ~82% of peak (developing)
 *   Age 23-24  →  ~92% of peak (nearly there)
 *   Age 25     →  ~97% of peak
 *   Peak window (peakYear ± 2)  → 100% of peak
 *   Age 30     →  ~96% of peak
 *   Age 32     →  ~90% of peak
 *   Age 34     →  ~82% of peak
 *   Age 36     →  ~72% of peak (decline)
 *   Age 38+    →  ~62% of peak (veteran)
 *
 * Different attributes decline at different rates:
 *   Pace/Acceleration  — decline starts earliest (from ~28)
 *   Agility            — declines from ~29
 *   Stamina            — declines from ~31
 *   Strength/Heading   — peaks later, declines slower
 *   Technical/Mental   — most stable, decline late (33+)
 *   Experience attrs (com, dec, lea) — can actually improve with age
 */

window.PlayerEngine = {

  /**
   * Get the age of a player in a given year
   */
  getAge(player, year) {
    if (!player.dob) return 25;
    const birthYear = parseInt(player.dob.split('-')[0]);
    return year - birthYear;
  },

  /**
   * Check if a player is available for selection in a given year.
   * Available from eligibleFrom to eligibleTo.
   * Must be at least 16 years old.
   */
  isAvailable(player, year) {
    const age = this.getAge(player, year);
    if (age < 16) return false;
    if (year < player.eligibleFrom) return false;
    if (year > player.eligibleTo) return false;
    return true;
  },

  /**
   * Core age multiplier — overall rating scaling
   */
  _overallMultiplier(player, year) {
    const age = this.getAge(player, year);
    const peakYear = player.peakYear || (parseInt(player.dob.split('-')[0]) + 27);

    // Years from peak (negative = before peak, positive = after)
    const yearsFromPeak = year - peakYear;

    if (yearsFromPeak >= -2 && yearsFromPeak <= 2) {
      // Prime window
      return 1.0;
    } else if (yearsFromPeak < -2) {
      // Development phase (before peak)
      const yearsToPeak = -yearsFromPeak - 2; // years before prime window
      // Each year before prime, lose ~5.5% — gentler slope so youngsters are usable
      return Math.max(0.62, 1.0 - yearsToPeak * 0.055);
    } else {
      // Decline phase (after peak)
      const yearsAfterPeak = yearsFromPeak - 2;
      // Slower decline — 0.025 per year for first 4 years, then 0.04
      if (yearsAfterPeak <= 4) {
        return 1.0 - yearsAfterPeak * 0.025;
      } else {
        return (1.0 - 4 * 0.025) - (yearsAfterPeak - 4) * 0.045;
      }
    }
  },

  /**
   * Per-attribute multiplier — different attrs age differently
   */
  _attrMultiplier(attrKey, player, year) {
    const age = this.getAge(player, year);
    const base = this._overallMultiplier(player, year);

    // Physical attrs that decline early
    const earlyDecline = ['pac', 'acc', 'agi'];
    // Physical that decline mid
    const midDecline   = ['sta', 'jum'];
    // Strength peaks slightly later, declines slowly
    const latePhysical = ['str'];
    // Mental/experience attrs — stable or even improve
    const experience   = ['dec', 'com', 'lea', 'vis'];
    // Technical — very stable
    const technical    = ['tec', 'pas', 'lng', 'cro', 'fre', 'dri'];
    // GK attrs — similar to mental/technical
    const gkTech       = ['han', 'ref', 'onv', 'aer', 'thw', 'kic'];
    // Defending/positioning — stable
    const defending    = ['tac', 'mar', 'int', 'pos', 'wor', 'bra'];
    // Goals/finishing — mid
    const attacking    = ['fin', 'sho', 'hea'];

    if (earlyDecline.includes(attrKey)) {
      // Extra decline after 28
      if (age <= 28) return base;
      return base - (age - 28) * 0.025;
    }
    if (midDecline.includes(attrKey)) {
      if (age <= 30) return base;
      return base - (age - 30) * 0.02;
    }
    if (latePhysical.includes(attrKey)) {
      // Strength peaks slightly later, declines slower
      if (age <= 32) return Math.min(1.0, base * 1.02);
      return Math.max(0.5, base - (age - 32) * 0.015);
    }
    if (experience.includes(attrKey)) {
      // Improve until ~30, then very slow decline
      if (age <= 30) return Math.min(1.0, base + (age - 20) * 0.01);
      if (age <= 35) return 1.0; // stays at peak even if overall declining
      return 1.0 - (age - 35) * 0.02;
    }
    if (technical.includes(attrKey) || gkTech.includes(attrKey)) {
      // Very stable — only decline from 34
      if (age <= 34) return Math.max(base, base * 1.02);
      return base - (age - 34) * 0.015;
    }
    if (defending.includes(attrKey)) {
      if (age <= 32) return base;
      return base - (age - 32) * 0.015;
    }

    return base;
  },

  /**
   * Calculate a player's full attr set for a given year
   */
  getAttrs(player, year) {
    if (!player.peakAttrs) return {};
    const result = {};
    Object.entries(player.peakAttrs).forEach(([key, peakVal]) => {
      const mult = Math.max(0.4, Math.min(1.05, this._attrMultiplier(key, player, year)));
      result[key] = Math.max(1, Math.min(20, Math.round(peakVal * mult)));
    });
    return result;
  },

  /**
   * Calculate a player's overall rating for a given year
   */
  getRating(player, year) {
    const mult = Math.max(0.45, Math.min(1.0, this._overallMultiplier(player, year)));
    return Math.max(58, Math.min(99, Math.round(player.peakRat * mult)));
  },

  /**
   * Get the club a player is at in a given year.
   * Uses peakClub as approximation — could be extended with career history.
   */
  getClub(player, year) {
    return player.peakClub || 'Unknown';
  },

  /**
   * Build a full player object for a given year, ready for use in the game.
   * This is the main API used by the squad/pool system.
   */
  forYear(player, year) {
    const age  = this.getAge(player, year);
    const rat  = this.getRating(player, year);
    const attrs = this.getAttrs(player, year);

    return {
      id:       player.id,
      name:     player.name,
      dob:      player.dob,
      pos:      player.pos,
      posG:     player.posG,
      foot:     player.foot,
      height:   player.height,
      weight:   player.weight,
      nat:      player.nat,
      age:      age,
      rat:      rat,
      club:     this.getClub(player, year),
      caps:     0,   // accumulates during save
      goals:    0,   // accumulates during save
      attrs:    attrs,
      bio:      player.bio,
      traits:   player.traits || [],
      weaknesses: player.weaknesses || [],
      secondaryPos: player.secondaryPos || [],
      // Career context for UI
      peakRat:   player.peakRat,
      peakYear:  player.peakYear,
      historicalCaps:  player.historicalCaps  || 0,
      historicalGoals: player.historicalGoals || 0,
      eligibleFrom: player.eligibleFrom,
      eligibleTo:   player.eligibleTo,
      _masterRef: player,  // reference back to master record
    };
  },

  /**
   * Get all players available for selection in a given year, sorted by rating
   */
  getPool(year) {
    const pool = [];
    Object.values(window.PLAYER_MASTER || {}).forEach(player => {
      if (this.isAvailable(player, year)) {
        const p = this.forYear(player, year);
        // Attach historical caps/goals for this era
        const stats = this._historicalStats(player, year);
        p.historicalCaps  = stats.caps;
        p.historicalGoals = stats.goals;
        pool.push(p);
      }
    });
    pool.sort((a, b) => b.rat - a.rat);
    return pool;
  },

  /**
   * Get caps/goals a player had accumulated by a given year.
   * Uses CAREER_STATS exact data if available, otherwise interpolates.
   */
  _historicalStats(player, year) {
    const careerStats = window.CAREER_STATS?.[player.id];

    if (careerStats) {
      // Find the best bracket: highest year <= target year with data
      const years = Object.keys(careerStats).map(Number).sort((a,b)=>a-b);
      const before = years.filter(y => y <= year);
      const after  = years.filter(y => y >  year);

      if (before.length === 0) {
        // Player hasn't started England career yet at this year
        return { caps: 0, goals: 0 };
      }

      const lo = before[before.length - 1];
      const [loCaps, loGoals] = careerStats[lo];

      if (after.length === 0) {
        // At or past last data point — return that data point's values
        return { caps: loCaps, goals: loGoals };
      }

      // Interpolate between lo and hi proportionally
      const hi = after[0];
      const [hiCaps, hiGoals] = careerStats[hi];
      const t = (year - lo) / (hi - lo);
      return {
        caps:  Math.round(loCaps  + (hiCaps  - loCaps)  * t),
        goals: Math.round(loGoals + (hiGoals - loGoals) * t),
      };
    }

    // No career data — linear interpolation over career span
    const debut    = player.eligibleFrom || (parseInt(player.dob) + 18);
    const retire   = player.eligibleTo   || (parseInt(player.dob) + 36);
    const totalCaps  = player.historicalCaps  || 0;
    const totalGoals = player.historicalGoals || 0;

    if (year <= debut)  return { caps: 0, goals: 0 };
    if (year >= retire) return { caps: totalCaps, goals: totalGoals };

    const t = (year - debut) / (retire - debut);
    // Weight slightly toward peak — players earn more caps in prime years
    // Use sqrt curve so early career has fewer caps
    const wt = Math.sqrt(t);
    return {
      caps:  Math.round(totalCaps  * wt),
      goals: Math.round(totalGoals * wt),
    };
  },

  /**
   * Get pool filtered by position group
   */
  getPoolByPos(year, posG) {
    return this.getPool(year).filter(p => p.posG === posG);
  },

  /**
   * Diagnostic — show how a player evolves across years
   */
  career(playerId) {
    const p = window.PLAYER_MASTER[playerId];
    if (!p) return null;
    const rows = [];
    for (let y = p.eligibleFrom; y <= p.eligibleTo; y++) {
      const d = this.forYear(p, y);
      rows.push({ year: y, age: d.age, rat: d.rat });
    }
    return rows;
  }
};
