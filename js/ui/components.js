window.UI = {
  show(id) {
    const ALL_SCREENS = ['screen-menu','screen-dashboard','screen-squad','screen-match',
     'screen-result','screen-tournament','screen-tactics','screen-settings','screen-players'];
    // Hide all screens via direct style - no classList, no CSS dependency
    ALL_SCREENS.forEach(sid => {
      const s = document.getElementById(sid);
      if (s) { s.style.display = 'none'; s.classList.remove('active'); }
    });
    // Show the target screen
    const el = document.getElementById(id);
    if (!el) { console.error('[UI.show] Element not found:', id); return; }
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.width = '100%';
    el.style.height = '100vh';
    el.style.overflow = 'hidden';
    el.classList.add('active');
    console.log('[UI.show] Showing:', id);
  },
  posClass(posG) {
    return {GK:"gk",DEF:"def",MID:"mid",FWD:"fwd"}[posG] || "mid";
  },
  ratClass(rat) {
    if (rat >= 88) return "elite";
    if (rat >= 80) return "good";
    if (rat >= 72) return "avg";
    return "poor";
  },
  surname(name) { return name.split(" ").pop(); },
  fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {day:"numeric",month:"short",year:"numeric"});
  },
  tacGroup(options, active, key) {
    return `<div class="tac-group">${options.map(o=>`<button class="tac-opt${o===active?" active":""}" onclick="MatchUI.setTactic('${key}','${o}',this)">${o}</button>`).join("")}</div>`;
  },
};
