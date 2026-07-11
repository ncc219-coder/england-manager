document.addEventListener("DOMContentLoaded", () => {
  // Restore dark mode preference
  try {
    const savedTheme = localStorage.getItem('em_theme');
    if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch(e) {}
  try {
    window.ALL_PLAYERS = window.ALL_PLAYERS || {};
    State.set("squad.pool", window.PLAYERS_1986 || []);
    window.MenuUI.init();
    if (window.Sound) window.Sound.attachUIClicks();
    // Hide loading screen
    const loader = document.getElementById("loading");
    if (loader) loader.style.display = "none";
  } catch(e) {
    const loader = document.getElementById("loading");
    if (loader) {
      document.getElementById("loading-sub").textContent = "Error: " + e.message;
      document.getElementById("loading-sub").style.color = "#c8102e";
    }
    console.error("Boot error:", e);
  }
});
