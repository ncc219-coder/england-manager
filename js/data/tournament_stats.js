/**
 * tournament_stats.js — Tournament-Scoped Player Statistics
 *
 * campaign.playerStats is a career-long cumulative tracker (caps, goals,
 * form across the WHOLE career) — exactly right for things like a
 * player's all-time cap count, but wrong for "who's this tournament's
 * top scorer," since that needs to start fresh at zero the moment the
 * tournament begins and only count goals/assists/ratings from matches
 * actually played within it, not bleed in totals from qualifiers or
 * friendlies played months earlier in the same career.
 *
 * Storage: tournament.playerStats = {
 *   [playerId]: { goals, assists, apps, ratingSum, cleanSheets, yellowCards, redCards, motm }
 * }
 * Reset every time TournamentEngine.load() runs (a fresh tournament).
 * Accumulated once per match, right after the engine records the
 * career-long stats, reading the exact same per-match data
 * (match.playerStats, match.ratings, match.score) so there's no
 * duplicate simulation — just a second, differently-scoped place to add
 * the same real numbers up.
 */

window.TournamentStats = (function () {

  function reset() {
    State.set('tournament.playerStats', {});
  }

  // Call once per match, right after the engine's own per-match stats
  // and ratings are finalised — only does anything if a tournament is
  // genuinely active right now (this module stays completely silent
  // for regular qualifiers/friendlies, which have no tournament context
  // to aggregate into).
  function recordMatch() {
    if (!window.TournamentEngine || !window.TournamentEngine.isActive()) return;

    const pool    = State.get('squad.pool') || [];
    const msMatch = State.get('match.playerStats') || {};
    const ratings = State.get('match.ratings') || {};
    const score   = State.get('match.score') || {};
    const events  = State.get('match.events') || [];
    const cleanSheet = (score.opp || 0) === 0;

    const tStats = State.get('tournament.playerStats') || {};

    // Iterate everyone who actually appeared (match.playerStats is now
    // keyed by every player who was on the pitch at any point, not just
    // squad.slots — which only reflects the FINAL XI after substitutions
    // and previously meant a player subbed off got no appearance
    // credited here at all, even after 80 genuine minutes on the pitch).
    Object.keys(msMatch).forEach(id => {
      const p = pool.find(pp => pp.id === id); if (!p) return;
      if (!tStats[id]) {
        tStats[id] = { goals: 0, assists: 0, apps: 0, ratingSum: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, motm: 0 };
      }
      const entry = tStats[id];
      const ms = msMatch[id] || {};
      entry.apps += 1;
      entry.goals += ms.goals || 0;
      entry.assists += ms.assists || 0;
      entry.ratingSum += ratings[id] || 0;
      // Clean sheet only counts for outfield defenders/keepers who
      // actually played — a striker on the pitch for a 0-0 doesn't
      // "keep a clean sheet" in the way the stat is meant to read.
      if (cleanSheet && (p.posG === 'GK' || p.posG === 'DEF')) entry.cleanSheets += 1;
    });

    // Cards — read directly from the real player id now carried on each
    // match event (see match2.js's _pushEvent), rather than parsing the
    // commentary text for a name. Text parsing was fragile: booking
    // lines don't consistently lead with the player's name ("Yellow
    // card for Gascoigne" doesn't start with "Gascoigne" at all), so it
    // silently failed to attribute most cards.
    events.forEach(e => {
      if (e.type !== 'booking_eng' && e.type !== 'redcard_eng') return;
      if (!e.playerId) return;
      if (!tStats[e.playerId]) tStats[e.playerId] = { goals: 0, assists: 0, apps: 0, ratingSum: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, motm: 0 };
      if (e.type === 'booking_eng') tStats[e.playerId].yellowCards += 1;
      if (e.type === 'redcard_eng') tStats[e.playerId].redCards += 1;
    });

    // Man of the match — whoever had the single highest rating in THIS
    // match, tallied across the tournament (a real, earned "MOTM count"
    // stat rather than something invented).
    let bestId = null, bestRating = -1;
    Object.entries(ratings).forEach(([id, r]) => {
      if (r > bestRating && tStats[id]) { bestRating = r; bestId = id; }
    });
    if (bestId) tStats[bestId].motm += 1;

    State.set('tournament.playerStats', tStats);
  }

  // ── Leaderboards ──────────────────────────────────────────────────────────
  // Each returns an array of { player, ...statFields } sorted best-first,
  // resolving real player objects from the live pool so names/positions/
  // clubs are always current, not a stale snapshot.
  function _withPlayers(entries) {
    const pool = State.get('squad.pool') || [];
    return entries
      .map(([id, stats]) => ({ player: pool.find(p => p.id === id), ...stats }))
      .filter(e => e.player);
  }

  function topScorers(limit) {
    const tStats = State.get('tournament.playerStats') || {};
    return _withPlayers(Object.entries(tStats))
      .filter(e => e.goals > 0)
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      .slice(0, limit || 10);
  }

  function topAssists(limit) {
    const tStats = State.get('tournament.playerStats') || {};
    return _withPlayers(Object.entries(tStats))
      .filter(e => e.assists > 0)
      .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
      .slice(0, limit || 10);
  }

  function topRated(limit) {
    const tStats = State.get('tournament.playerStats') || {};
    return _withPlayers(Object.entries(tStats))
      .filter(e => e.apps > 0)
      .map(e => ({ ...e, avgRating: e.ratingSum / e.apps }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit || 10);
  }

  function topCleanSheets(limit) {
    const tStats = State.get('tournament.playerStats') || {};
    return _withPlayers(Object.entries(tStats))
      .filter(e => e.cleanSheets > 0)
      .sort((a, b) => b.cleanSheets - a.cleanSheets)
      .slice(0, limit || 10);
  }

  function mostAppearances(limit) {
    const tStats = State.get('tournament.playerStats') || {};
    return _withPlayers(Object.entries(tStats))
      .sort((a, b) => b.apps - a.apps)
      .slice(0, limit || 10);
  }

  function mostMOTM(limit) {
    const tStats = State.get('tournament.playerStats') || {};
    return _withPlayers(Object.entries(tStats))
      .filter(e => e.motm > 0)
      .sort((a, b) => b.motm - a.motm)
      .slice(0, limit || 10);
  }

  function mostCards(limit) {
    const tStats = State.get('tournament.playerStats') || {};
    return _withPlayers(Object.entries(tStats))
      .filter(e => (e.yellowCards + e.redCards) > 0)
      .sort((a, b) => (b.yellowCards + b.redCards * 2) - (a.yellowCards + a.redCards * 2))
      .slice(0, limit || 10);
  }

  // A single summary card for one player — used on player profile screens
  // to show "this tournament: 3 goals, 2 assists, 7.4 avg rating" etc.
  function forPlayer(playerId) {
    const tStats = State.get('tournament.playerStats') || {};
    const entry = tStats[playerId];
    if (!entry) return null;
    return { ...entry, avgRating: entry.apps ? entry.ratingSum / entry.apps : 0 };
  }

  return {
    reset, recordMatch,
    topScorers, topAssists, topRated, topCleanSheets, mostAppearances, mostMOTM, mostCards,
    forPlayer,
  };

})();
