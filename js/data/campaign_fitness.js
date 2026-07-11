/**
 * campaign_fitness.js — Persistent Squad Fitness
 *
 * The missing half of the in-match stamina system (match2.js): a player
 * who just played a gruelling 90 minutes doesn't simply reset to 100%
 * fresh the instant the next fixture loads. Recovery is computed lazily
 * from real calendar days elapsed since their last match — a week
 * between fixtures (typical international break) is enough for a full
 * recovery; a player risked again after just 2-3 days carries real
 * fatigue into the next game.
 *
 * Storage: campaign.playerFitness[id] = 0-100, set to the player's final
 * in-match stamina the moment a match ends (match2.js's
 * _recordCampaignStats). This module is what ages that number forward
 * day-by-day whenever the squad screen actually needs a CURRENT fitness
 * reading — there's no background timer, recovery is computed on demand
 * from the gap between campaign.playerStats[id].lastPlayedDate and
 * whatever campaign.campaignDate currently is.
 */

window.CampaignFitness = (function () {

  const RECOVERY_PER_DAY = 12; // a week (7 days) recovers a player fully from even a totally spent 0%
  const FULL = 100;

  function _daysBetween(dateA, dateB) {
    if (!dateA || !dateB) return 999; // unknown gap — treat as fully recovered
    const a = new Date(dateA), b = new Date(dateB);
    if (isNaN(a) || isNaN(b)) return 999;
    return Math.max(0, Math.round((b - a) / 86400000));
  }

  // The CURRENT, recovery-adjusted fitness for a player — this is what
  // every UI surface and the match engine itself should call, never the
  // raw stored value directly, since the raw value is a snapshot from
  // whenever they last played, not "right now."
  function currentFitness(playerId) {
    const fitness = State.get('campaign.playerFitness') || {};
    const stats = State.get('campaign.playerStats') || {};
    const stored = fitness[playerId];
    if (stored === undefined) return FULL; // never played yet — fully fresh
    const lastPlayed = stats[playerId]?.lastPlayedDate;
    const today = State.get('campaign.campaignDate');
    const days = _daysBetween(lastPlayed, today);
    return Math.max(0, Math.min(FULL, Math.round(stored + days * RECOVERY_PER_DAY)));
  }

  // A short, honest label for the squad screen — translates the number
  // into something a manager reads at a glance rather than parsing a
  // percentage every time.
  function fitnessLabel(fitnessValue) {
    if (fitnessValue >= 90) return { label: 'Fresh', color: 'var(--green)' };
    if (fitnessValue >= 70) return { label: 'Good', color: 'var(--green)' };
    if (fitnessValue >= 50) return { label: 'Tiring', color: 'var(--gold)' };
    if (fitnessValue >= 30) return { label: 'Jaded', color: 'var(--orange)' };
    return { label: 'Exhausted', color: 'var(--red)' };
  }

  // How many real days until this player would be back to fully fresh —
  // genuinely useful for "should I rest him for the next match" planning.
  function daysToFull(playerId) {
    const current = currentFitness(playerId);
    if (current >= FULL) return 0;
    return Math.ceil((FULL - current) / RECOVERY_PER_DAY);
  }

  return { currentFitness, fitnessLabel, daysToFull, RECOVERY_PER_DAY, FULL };

})();
