/**
 * chemistry.js — Team Chemistry & Partnerships
 *
 * A settled centre-back pairing, a strike partnership that's played
 * together repeatedly, a midfield two who know each other's games inside
 * out — these are worth something a single player rating can never
 * capture on its own, and rewarding them is one of the clearest ways to
 * make "who's actually the best XI together" different from "who has
 * the highest individual numbers."
 *
 * Tracked ONLY for genuine partnership-relevant slot pairs — two players
 * sharing the same formation row AND position group (CB+CB, CM+CM,
 * ST+ST) — rather than all 55 possible pairs in an XI, since most pairs
 * (e.g. a left-back and a striker) don't have a meaningful on-pitch
 * relationship to build chemistry around.
 *
 * Storage: campaign.partnerships = { "idA|idB": appearancesTogether }
 * (ids always sorted so the same pair always hashes to the same key
 * regardless of which slot either player occupied).
 */

window.Chemistry = (function () {

  const MAX_BONUS_APPEARANCES = 15; // chemistry caps out — a pairing that's played 15+ times together is "fully bedded in", more appearances don't keep adding
  const MAX_BONUS = 0.06; // +6% at full chemistry — real, but a partnership's WORTH should come from the players themselves, not from chemistry alone

  function _pairKey(idA, idB) {
    return [idA, idB].sort().join('|');
  }

  // Finds every genuine partnership pair for a given formation + starting
  // XI (slots array, index-aligned to the formation's slot order).
  //
  // Deliberately NOT "everyone in the same row" — a right-back and a
  // left-back share a defensive line but barely interact on the pitch;
  // pairing them as a "partnership" the same way two centre-backs who
  // are constantly covering for each other are paired would be wrong.
  // Genuine partnerships are: centre-back pairs, central-midfield pairs,
  // and strike partnerships — positions that are actually adjacent and
  // co-dependent on the pitch, identified by the position LABEL itself
  // (CB, CM, DM, ST) rather than just row + position group.
  const PARTNERSHIP_LABELS = ['CB', 'CM', 'DM', 'ST'];

  function findPartnershipPairs(formationName, slots) {
    const formation = (window.FORMATIONS && window.FORMATIONS[formationName]) || [];
    const byLabel = {}; // "row|label" -> [playerIds] — row still included so e.g. a back-three CB group doesn't merge with an unrelated CB-labelled slot elsewhere
    formation.forEach((sl, i) => {
      const p = slots[i];
      if (!p || !PARTNERSHIP_LABELS.includes(sl.pos)) return;
      const key = `${sl.row}|${sl.pos}`;
      (byLabel[key] = byLabel[key] || []).push(p.id);
    });
    const pairs = [];
    Object.values(byLabel).forEach(ids => {
      if (ids.length < 2) return;
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) pairs.push([ids[i], ids[j]]);
      }
    });
    return pairs;
  }

  // Call once per match, after the starting XI is known (e.g. at
  // kickoff) — increments the appearances-together counter for every
  // genuine partnership pair in this lineup.
  function recordMatchLineup(formationName, slots) {
    const pairs = findPartnershipPairs(formationName, slots);
    const partnerships = State.get('campaign.partnerships') || {};
    pairs.forEach(([a, b]) => {
      const key = _pairKey(a, b);
      partnerships[key] = (partnerships[key] || 0) + 1;
    });
    State.set('campaign.partnerships', partnerships);
  }

  // Appearances together for a specific pair — what the UI shows.
  function appearancesTogether(idA, idB) {
    const partnerships = State.get('campaign.partnerships') || {};
    return partnerships[_pairKey(idA, idB)] || 0;
  }

  // The actual multiplier this pairing's chemistry contributes — applied
  // by the match engine to both players' relevant derived scores when
  // they're sharing a genuine partnership slot this match.
  function chemistryMultiplier(idA, idB) {
    const appearances = appearancesTogether(idA, idB);
    const ratio = Math.min(1, appearances / MAX_BONUS_APPEARANCES);
    return 1 + ratio * MAX_BONUS;
  }

  // For a full starting XI + formation, returns { playerId: multiplier }
  // — the combined chemistry bonus for every player from ALL their
  // partnership pairs this match (a CB with two settled partnerships,
  // e.g. with the other CB and a marauding full-back, gets both).
  function chemistryForLineup(formationName, slots) {
    const pairs = findPartnershipPairs(formationName, slots);
    const bonus = {}; // playerId -> multiplier, starts at 1.0 each
    pairs.forEach(([a, b]) => {
      const mult = chemistryMultiplier(a, b);
      // Multiple partnerships compound modestly rather than stacking
      // additively without limit — still capped by the per-pair max,
      // but a player who's part of two settled partnerships should
      // benefit a little more than one with only one.
      bonus[a] = (bonus[a] || 1.0) * (0.5 + mult * 0.5);
      bonus[b] = (bonus[b] || 1.0) * (0.5 + mult * 0.5);
    });
    return bonus;
  }

  return {
    MAX_BONUS_APPEARANCES, MAX_BONUS,
    findPartnershipPairs, recordMatchLineup, appearancesTogether,
    chemistryMultiplier, chemistryForLineup,
  };

})();
