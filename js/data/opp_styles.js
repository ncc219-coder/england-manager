/**
 * opp_styles.js — Opponent Tactical Identity
 *
 * Gives the AI opponent a genuine tactical character instead of a single
 * flat rating number. A curated table covers nations with a widely
 * recognised footballing identity (Brazil's flair, Germany's efficiency,
 * Italy's defensive organisation, etc.) — every other nation gets a
 * sensible default derived from their rating tier, so the system scales
 * to all ~100+ nations in the database without requiring bespoke entries
 * for each one.
 *
 * Each style carries:
 *   attBias / midBias / defBias — multipliers on the opponent's own
 *     attack/midfield/defense aggregate (on top of their player-level
 *     stats) — this is what makes "Brazil" feel more dangerous in
 *     attack than their raw rating alone would suggest, and "Italy"
 *     harder to break down.
 *   press / tempo / mentality — fed into the SAME zone-bias mechanism
 *     already used for England's own tactics (_applyFormationBias),
 *     so a high-press, fast-tempo opponent genuinely plays differently
 *     from a deep, patient one — not just a number, a visible style.
 */

window.OppStyles = (function () {

  const STYLES = {
    'Brazil':        { attBias:1.10, midBias:1.05, defBias:0.95, press:'Mid',  tempo:'Fast', mentality:'Attack' },
    'Argentina':     { attBias:1.08, midBias:1.05, defBias:0.97, press:'Mid',  tempo:'Normal', mentality:'Attack' },
    'Germany':       { attBias:1.02, midBias:1.05, defBias:1.05, press:'High', tempo:'Fast', mentality:'Balanced' },
    'West Germany':  { attBias:1.02, midBias:1.05, defBias:1.05, press:'High', tempo:'Fast', mentality:'Balanced' },
    'Italy':         { attBias:0.95, midBias:1.0,  defBias:1.15, press:'Low',  tempo:'Slow', mentality:'Defend' },
    'France':        { attBias:1.06, midBias:1.05, defBias:1.0,  press:'Mid',  tempo:'Normal', mentality:'Balanced' },
    'Spain':         { attBias:1.02, midBias:1.12, defBias:0.98, press:'High', tempo:'Normal', mentality:'Balanced' },
    'Netherlands':   { attBias:1.06, midBias:1.08, defBias:0.95, press:'High', tempo:'Fast', mentality:'Attack' },
    'Portugal':      { attBias:1.04, midBias:1.02, defBias:1.0,  press:'Mid',  tempo:'Normal', mentality:'Balanced' },
    'Belgium':       { attBias:1.05, midBias:1.04, defBias:0.98, press:'Mid',  tempo:'Fast', mentality:'Attack' },
    'Croatia':       { attBias:0.98, midBias:1.08, defBias:1.0,  press:'Mid',  tempo:'Normal', mentality:'Balanced' },
    'Uruguay':       { attBias:0.96, midBias:0.98, defBias:1.12, press:'Low',  tempo:'Slow', mentality:'Defend' },
    'Switzerland':   { attBias:0.92, midBias:1.0,  defBias:1.10, press:'Low',  tempo:'Slow', mentality:'Defend' },
    'Sweden':        { attBias:0.90, midBias:0.96, defBias:1.10, press:'Low',  tempo:'Slow', mentality:'Defend' },
    'Greece':        { attBias:0.85, midBias:0.92, defBias:1.18, press:'Low',  tempo:'Slow', mentality:'Defend' },
    'Iceland':       { attBias:0.85, midBias:0.92, defBias:1.15, press:'Low',  tempo:'Slow', mentality:'Defend' },
    'Soviet Union':  { attBias:0.98, midBias:1.05, defBias:1.05, press:'Mid',  tempo:'Normal', mentality:'Balanced' },
    'Scotland':      { attBias:0.95, midBias:0.98, defBias:1.08, press:'High', tempo:'Fast', mentality:'Balanced' },
    'USA':           { attBias:0.92, midBias:0.95, defBias:1.08, press:'High', tempo:'Fast', mentality:'Balanced' },
    'Senegal':       { attBias:1.0,  midBias:0.98, defBias:1.05, press:'High', tempo:'Fast', mentality:'Balanced' },
    'Japan':         { attBias:0.95, midBias:1.08, defBias:1.0,  press:'High', tempo:'Fast', mentality:'Balanced' },
    'South Korea':   { attBias:0.95, midBias:1.05, defBias:1.0,  press:'High', tempo:'Fast', mentality:'Balanced' },
    'Denmark':       { attBias:0.98, midBias:1.0,  defBias:1.05, press:'Mid',  tempo:'Normal', mentality:'Balanced' },
    'Poland':        { attBias:0.96, midBias:0.96, defBias:1.05, press:'Low',  tempo:'Slow', mentality:'Defend' },
    'Turkey':        { attBias:1.0,  midBias:0.98, defBias:1.0,  press:'High', tempo:'Fast', mentality:'Attack' },
    'Colombia':      { attBias:1.02, midBias:1.0,  defBias:0.98, press:'Mid',  tempo:'Normal', mentality:'Attack' },
  };

  // Fallback default for any nation not explicitly profiled — derived
  // purely from their rating, since that's the one piece of data every
  // single nation in the database already has. Higher-rated sides lean
  // slightly more expansive (they can afford to); weaker sides default
  // to a more pragmatic, defensively-organised setup, which is also the
  // realistic real-world pattern for a side facing a stronger opponent.
  function _defaultStyle(rating) {
    if (rating >= 85) return { attBias:1.04, midBias:1.02, defBias:1.0, press:'Mid', tempo:'Normal', mentality:'Balanced' };
    if (rating >= 72) return { attBias:1.0,  midBias:1.0,  defBias:1.0, press:'Mid', tempo:'Normal', mentality:'Balanced' };
    return { attBias:0.92, midBias:0.94, defBias:1.08, press:'Low', tempo:'Slow', mentality:'Defend' };
  }

  function getStyle(nationName, rating) {
    return STYLES[nationName] || _defaultStyle(rating || 75);
  }

  return { STYLES, getStyle };

})();
