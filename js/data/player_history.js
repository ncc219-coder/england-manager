/**
 * player_history.js — Per-player match history
 *
 * The raw data for this already existed: campaign.matchHistory2 stores a
 * full snapshot of ratings and playerStats for every player who appeared
 * in each match, going back up to 200 matches (with tournament matches
 * protected from trimming). Nothing needed to be persisted that wasn't
 * already there — this just extracts a single player's own slice of it,
 * in one shared place so the squad screen's profile panel and the
 * players/scouting screen's profile panel both read from the same logic
 * instead of two similar-but-different implementations drifting apart.
 */
window.PlayerHistory = (function () {

  // Returns matches newest-first, each: date, opp, comp, compType, score,
  // outcome, rating, and that player's own stat line for the match.
  // `limit` caps how many are returned (most recent first); omit for all.
  function getMatches(playerId, limit) {
    const history = State.get('campaign.matchHistory2') || [];
    const matches = [];
    for (let i = history.length - 1; i >= 0; i--) {
      const h = history[i];
      if (!h.playerStats || !(playerId in h.playerStats)) continue;
      matches.push({
        date: h.date,
        opp: h.opp,
        comp: h.comp,
        compType: h.compType,
        score: h.score,
        outcome: h.outcome,
        rating: h.ratings ? h.ratings[playerId] : undefined,
        stats: h.playerStats[playerId],
      });
      if (limit && matches.length >= limit) break;
    }
    return matches;
  }

  // Lightweight summary for a quick glance (used where full rows are too
  // much) — total appearances found in the retained history, plus goals
  // and assists across them. Not the same as career caps/goals (which can
  // predate the retained 200-match window) — deliberately labelled
  // "played and recorded" rather than career totals to avoid the two
  // numbers looking like a contradiction.
  function summarize(playerId) {
    const matches = getMatches(playerId);
    let goals = 0, assists = 0, ratingSum = 0, ratingCount = 0;
    matches.forEach(m => {
      goals += m.stats?.goals || 0;
      assists += m.stats?.assists || 0;
      if (typeof m.rating === 'number') { ratingSum += m.rating; ratingCount++; }
    });
    return {
      appearances: matches.length,
      goals, assists,
      avgRating: ratingCount ? ratingSum / ratingCount : null,
    };
  }

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return { getMatches, summarize, fmtDate };

})();
