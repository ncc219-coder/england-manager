/**
 * managers_by_year.js — Real England managers and their tenures
 *
 * Used to generate a dynamic "era" label for an arbitrary starting year
 * (see menu.js's open year picker), rather than hand-writing flavor text
 * for all ~37 selectable years. Only the (small, factual, easy-to-keep-
 * correct) list of who managed England and when needs maintaining here;
 * the label/blurb generation is derived from it plus the existing
 * CampaignPhase._cycles tournament schedule.
 */
window.ENGLAND_MANAGERS = [
  { name: 'Bobby Robson',        start: '1982-07-01', end: '1990-07-08' },
  { name: 'Graham Taylor',       start: '1990-07-09', end: '1993-11-17' },
  { name: 'Terry Venables',      start: '1994-01-28', end: '1996-06-26' },
  { name: 'Glenn Hoddle',        start: '1996-06-27', end: '1999-02-01' },
  { name: 'Kevin Keegan',        start: '1999-02-14', end: '2000-10-07' },
  { name: 'Sven-Göran Eriksson', start: '2001-01-12', end: '2006-07-01' },
  { name: 'Steve McClaren',      start: '2006-08-01', end: '2007-11-22' },
  { name: 'Fabio Capello',       start: '2008-01-14', end: '2012-02-08' },
  { name: 'Roy Hodgson',         start: '2012-05-01', end: '2016-06-27' },
  { name: 'Sam Allardyce',       start: '2016-07-22', end: '2016-09-27' },
  { name: 'Gareth Southgate',    start: '2016-11-30', end: '2024-07-14' },
];

// Nearest-match lookup by calendar year — falls back to whichever
// manager's tenure the 1st of that year falls within, or the closest
// tenure if the exact date isn't covered (e.g. mid-transition years).
window.getEnglandManagerForYear = function(year) {
  const target = new Date(`${year}-06-01`).getTime();
  let best = window.ENGLAND_MANAGERS[0];
  let bestDist = Infinity;
  window.ENGLAND_MANAGERS.forEach(m => {
    const s = new Date(m.start).getTime();
    const e = new Date(m.end).getTime();
    if (target >= s && target <= e) { best = m; bestDist = 0; }
    else {
      const dist = target < s ? s - target : target - e;
      if (bestDist > 0 && dist < bestDist) { best = m; bestDist = dist; }
    }
  });
  return best;
};
