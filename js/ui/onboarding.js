/**
 * onboarding.js — First-time player walkthrough
 *
 * A lightweight spotlight tour that runs once, on the player's first
 * visit to the Dashboard after starting a new career. Highlights real
 * UI elements in place (no separate modal screens to click through
 * blind) and explains what each part of the management loop does.
 *
 * Skippable at any point. Never reappears once completed or skipped —
 * tracked via campaign.onboardingDone in State.
 */

window.Onboarding = (function () {

  const STEPS = [
    {
      selector: '.sidebar-card',
      title: 'Your Command Centre',
      body: 'Your next fixture, board confidence, and media mood — always visible while you manage. Confidence drops if results go badly and can cost you the job, separate from each individual player\'s own confidence.',
      placement: 'left',
    },
    {
      selector: '.task-scroll',
      title: 'Before Matchday',
      body: 'Press conferences, training focus, and — when there\'s been a real gap since your last match — scouting trips, all need attention before you can kick off. Training focus genuinely changes how your team plays on the pitch, and scouting is a real, limited choice: you only get a handful of trips, so pick who actually matters.',
      placement: 'right',
    },
    {
      selector: '[data-tab="squad"]',
      title: 'Pick Your XI',
      body: 'Build your matchday squad here — formation, starting XI, bench. Watch player fitness: someone who played every match with no rest will visibly tire faster and is a genuinely worse pick than a fresher squad player, even at a lower rating.',
      placement: 'bottom',
    },
    {
      selector: '[data-tab="tactics"]',
      title: 'Tactics & Roles',
      body: 'Formation, mentality, pressing, tempo, and individual player roles all change the match engine\'s actual behaviour. Assigning a real role (Poacher, Target Man, Ball-Playing Defender, etc.) shows you a genuine fit score for that player — and a settled partnership that\'s played together repeatedly performs better as a unit, not just as individuals.',
      placement: 'bottom',
    },
    {
      selector: '[data-tab="scouting"]',
      title: 'Scouting',
      body: 'Every eligible England player, browsable by position and rating. Watch closely and you\'ll notice attributes show as a range, not an exact number, until you genuinely know a player — scouting trips and caps narrow that range over time.',
      placement: 'bottom',
    },
    {
      selector: '[data-tab="tournaments"]',
      title: 'Tournaments',
      body: 'When a major tournament arrives, you\'ll get a real squad announcement and media build-up before a ball is kicked. Once it\'s underway, the Stats tab tracks top scorers, assists, average ratings, and clean sheets — all genuinely earned from matches you actually played.',
      placement: 'bottom',
    },
    {
      selector: '[data-tab="matchcentre"]',
      title: 'Match Centre',
      body: 'Your qualifying group table lives here once a campaign starts — every team\'s results, not just yours, are simulated and tracked.',
      placement: 'bottom',
    },
    {
      selector: '.play-match-cta',
      title: 'Kick Off',
      body: 'Once you are ready, head into Squad Selection and hit Kick Off. During the match you\'ll see live commentary and player movement on the pitch — or fast-forward through anything you do not want to watch minute-by-minute using the Skip button on the scoreboard.',
      placement: 'top',
    },
  ];

  let _step = 0;
  let _els  = { overlay: null, box: null, hole: null };

  function _isDone() {
    return !!State.get('campaign.onboardingDone');
  }

  function _markDone() {
    State.set('campaign.onboardingDone', true);
  }

  function maybeStart() {
    if (_isDone()) return;
    // Only run once the dashboard has actually rendered its panels
    setTimeout(() => _tryStep(0), 350);
  }

  function _tryStep(i) {
    if (i >= STEPS.length) { _finish(); return; }
    const step = STEPS[i];
    const target = document.querySelector(step.selector);
    if (!target) {
      // Element not present on this tab/state — skip to next step
      _tryStep(i + 1);
      return;
    }
    _step = i;
    _render(target, step);
  }

  function _render(target, step) {
    _teardown();

    const rect = target.getBoundingClientRect();

    // Dim overlay with a cut-out "hole" around the target via box-shadow trick
    const hole = document.createElement('div');
    hole.id = 'onb-hole';
    hole.style.cssText = `
      position:fixed; z-index:900; pointer-events:none;
      top:${rect.top - 6}px; left:${rect.left - 6}px;
      width:${rect.width + 12}px; height:${rect.height + 12}px;
      border-radius:8px;
      box-shadow:0 0 0 6000px rgba(6,6,10,0.78);
      border:2px solid var(--gold, #E8B84B);
      transition:all .25s ease;
    `;
    document.body.appendChild(hole);
    _els.hole = hole;

    // Tooltip box positioned relative to the target
    const box = document.createElement('div');
    box.id = 'onb-box';
    box.style.cssText = `
      position:fixed; z-index:901; max-width:340px;
      background:var(--bg2); border:1px solid var(--border2); border-radius:10px;
      padding:18px 20px; box-shadow:0 12px 32px rgba(0,0,0,.5);
      font-family:var(--font-body);
    `;

    const isLast = _step === STEPS.length - 1;
    box.innerHTML = `
      <div style="font-size:11px;font-family:var(--font-ui);letter-spacing:.12em;text-transform:uppercase;color:var(--gold,#E8B84B);margin-bottom:6px">
        Step ${_step + 1} of ${STEPS.length}
      </div>
      <div style="font-family:var(--font-ui);font-size:17px;font-weight:800;color:var(--t1);margin-bottom:8px">${step.title}</div>
      <div style="font-size:14px;color:var(--t2);line-height:1.55;margin-bottom:16px">${step.body}</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <button id="onb-skip" style="background:none;border:none;color:var(--t3);font-size:12px;cursor:pointer;text-decoration:underline">Skip tour</button>
        <button id="onb-next" style="background:var(--red);color:#fff;border:none;border-radius:6px;padding:8px 18px;font-family:var(--font-ui);font-size:13px;font-weight:700;cursor:pointer;letter-spacing:.04em">
          ${isLast ? 'Got it ▶' : 'Next ▶'}
        </button>
      </div>`;

    document.body.appendChild(box);
    _els.box = box;

    // Position the box relative to target + placement preference, then clamp to viewport
    const margin = 14;
    let top, left;
    const boxRect = box.getBoundingClientRect();

    switch (step.placement) {
      case 'left':
        top = rect.top; left = rect.left - boxRect.width - margin; break;
      case 'right':
        top = rect.top; left = rect.right + margin; break;
      case 'top':
        top = rect.top - boxRect.height - margin; left = rect.left; break;
      default: // bottom
        top = rect.bottom + margin; left = rect.left;
    }
    // Clamp within viewport with 12px padding
    top  = Math.max(12, Math.min(top, window.innerHeight - boxRect.height - 12));
    left = Math.max(12, Math.min(left, window.innerWidth  - boxRect.width  - 12));
    box.style.top  = top + 'px';
    box.style.left = left + 'px';

    // Scroll target into view if needed (sidebar/tasks can be tall)
    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    document.getElementById('onb-next').addEventListener('click', () => {
      if (isLast) { _finish(); } else { _tryStep(_step + 1); }
    });
    document.getElementById('onb-skip').addEventListener('click', _finish);
  }

  function _teardown() {
    if (_els.hole) { _els.hole.remove(); _els.hole = null; }
    if (_els.box)  { _els.box.remove();  _els.box  = null; }
  }

  function _finish() {
    _teardown();
    _markDone();
  }

  // Allow replaying from Settings if the player wants a refresher
  function restart() {
    State.set('campaign.onboardingDone', false);
    _tryStep(0);
  }

  return { maybeStart, restart };

})();
