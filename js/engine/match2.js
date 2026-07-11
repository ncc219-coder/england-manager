/**
 * match2.js — Live Tick-by-Tick Match Engine v2
 *
 * Key design principles:
 *   - Every player has individual attributes that affect match outcomes
 *   - Ball movement reflects real football patterns (position, formation, style)
 *   - Per-player stats accumulated each tick (touches, shots, tackles, saves etc)
 *   - Match ratings derived from actual contributions, not random numbers
 *   - Tactical decisions (formation, mentality, subs) change real probabilities
 *   - Commentary uses player names contextually based on who's involved
 *
 * Extending:
 *   - Add commentary: find category key, add strings with {tokens}
 *   - Add player attribute effect: find relevant probability in _zoneEvent, add attr scaling
 *   - Add new event type: add case in _zoneEvent + _processEvent + COMMENTARY entry
 *   - Add new zone: extend ZONES + TRANSITIONS
 */

window.MatchEngine2 = (function () {

  // ─── PITCH ZONES ──────────────────────────────────────────────────────────
  // 21 zones: 7 rows × 3 cols (left / centre / right)
  // Row 0 = England GK end, Row 6 = Opponent goal
  // x/y = 0-1 coordinates for SVG ball rendering

  const ZONES = [
    { id:'eng_gk_l',  row:0, col:0, label:'England GK',           x:0.20, y:0.93 },
    { id:'eng_gk_c',  row:0, col:1, label:'England GK',           x:0.50, y:0.96 },
    { id:'eng_gk_r',  row:0, col:2, label:'England GK',           x:0.80, y:0.93 },
    { id:'eng_def_l', row:1, col:0, label:'England left back',     x:0.14, y:0.80 },
    { id:'eng_def_c', row:1, col:1, label:'England centre back',   x:0.50, y:0.80 },
    { id:'eng_def_r', row:1, col:2, label:'England right back',    x:0.86, y:0.80 },
    { id:'eng_mid_l', row:2, col:0, label:'England left mid',      x:0.14, y:0.65 },
    { id:'eng_mid_c', row:2, col:1, label:'England central mid',   x:0.50, y:0.65 },
    { id:'eng_mid_r', row:2, col:2, label:'England right mid',     x:0.86, y:0.65 },
    { id:'mid_l',     row:3, col:0, label:'left midfield',         x:0.14, y:0.50 },
    { id:'mid_c',     row:3, col:1, label:'central midfield',      x:0.50, y:0.50 },
    { id:'mid_r',     row:3, col:2, label:'right midfield',        x:0.86, y:0.50 },
    { id:'att_mid_l', row:4, col:0, label:'England left channel',  x:0.14, y:0.35 },
    { id:'att_mid_c', row:4, col:1, label:'England attacking mid', x:0.50, y:0.35 },
    { id:'att_mid_r', row:4, col:2, label:'England right channel', x:0.86, y:0.35 },
    { id:'att_l',     row:5, col:0, label:'England left flank',    x:0.11, y:0.22 },
    { id:'att_c',     row:5, col:1, label:'England attack',        x:0.50, y:0.22 },
    { id:'att_r',     row:5, col:2, label:'England right flank',   x:0.89, y:0.22 },
    { id:'box_l',     row:6, col:0, label:'left side of box',      x:0.20, y:0.11 },
    { id:'box_c',     row:6, col:1, label:'penalty area',          x:0.50, y:0.09 },
    { id:'box_r',     row:6, col:2, label:'right side of box',     x:0.80, y:0.11 },
  ];
  const ZONE = {};
  ZONES.forEach(z => ZONE[z.id] = z);

  // ─── ZONE TRANSITIONS ────────────────────────────────────────────────────
  // eng = England in possession transitions
  // opp = Opponent in possession transitions
  // Weights shaped by real football: wide play flows to flanks, 
  // central play flows through the middle, clearances go long

  const T = {
    eng_gk_l:  { eng:[ ['eng_def_l',5],['eng_def_c',3],['eng_mid_l',3],['mid_l',1]             ], opp:[ ['eng_def_l',4],['eng_def_c',3],['eng_gk_c',3]                          ] },
    eng_gk_c:  { eng:[ ['eng_def_c',5],['eng_def_l',2],['eng_def_r',2],['eng_mid_c',2]         ], opp:[ ['eng_def_c',4],['eng_def_l',2],['eng_def_r',2],['eng_gk_l',1],['eng_gk_r',1] ] },
    eng_gk_r:  { eng:[ ['eng_def_r',5],['eng_def_c',3],['eng_mid_r',3],['mid_r',1]             ], opp:[ ['eng_def_r',4],['eng_def_c',3],['eng_gk_c',3]                          ] },
    eng_def_l: { eng:[ ['eng_mid_l',4],['mid_l',3],['eng_mid_c',2],['eng_def_c',1],['eng_gk_l',1] ], opp:[ ['eng_gk_l',4],['eng_gk_c',2],['eng_def_c',2]                     ] },
    eng_def_c: { eng:[ ['eng_mid_c',4],['eng_mid_l',2],['eng_mid_r',2],['mid_c',2]             ], opp:[ ['eng_gk_c',5],['eng_gk_l',2],['eng_gk_r',2]                           ] },
    eng_def_r: { eng:[ ['eng_mid_r',4],['mid_r',3],['eng_mid_c',2],['eng_def_c',1],['eng_gk_r',1] ], opp:[ ['eng_gk_r',4],['eng_gk_c',2],['eng_def_c',2]                     ] },
    eng_mid_l: { eng:[ ['mid_l',5],['att_mid_l',3],['eng_mid_c',2],['eng_def_l',1]             ], opp:[ ['eng_def_l',5],['eng_mid_c',2],['eng_gk_l',2]                         ] },
    eng_mid_c: { eng:[ ['mid_c',5],['att_mid_c',2],['mid_l',1],['mid_r',1],['eng_mid_l',1],['eng_mid_r',1] ], opp:[ ['eng_def_c',4],['eng_mid_l',2],['eng_mid_r',2]           ] },
    eng_mid_r: { eng:[ ['mid_r',5],['att_mid_r',3],['eng_mid_c',2],['eng_def_r',1]             ], opp:[ ['eng_def_r',5],['eng_mid_c',2],['eng_gk_r',2]                         ] },
    mid_l:     { eng:[ ['att_mid_l',5],['att_l',2],['mid_c',2],['eng_mid_l',2]                 ], opp:[ ['eng_mid_l',5],['eng_def_l',3],['mid_c',1]                            ] },
    mid_c:     { eng:[ ['att_mid_c',5],['mid_l',1],['mid_r',1],['att_mid_l',1],['att_mid_r',1] ], opp:[ ['eng_mid_c',5],['eng_def_c',2],['mid_l',1],['mid_r',1]               ] },
    mid_r:     { eng:[ ['att_mid_r',5],['att_r',2],['mid_c',2],['eng_mid_r',2]                 ], opp:[ ['eng_mid_r',5],['eng_def_r',3],['mid_c',1]                            ] },
    att_mid_l: { eng:[ ['att_l',5],['att_c',2],['box_l',1],['mid_l',2]                         ], opp:[ ['mid_l',5],['eng_mid_l',3],['mid_c',1]                                ] },
    att_mid_c: { eng:[ ['att_c',4],['att_mid_l',1],['att_mid_r',1],['box_c',1],['att_l',1],['att_r',1] ], opp:[ ['mid_c',5],['eng_mid_c',3],['mid_l',1],['mid_r',1]          ] },
    att_mid_r: { eng:[ ['att_r',5],['att_c',2],['box_r',1],['mid_r',2]                         ], opp:[ ['mid_r',5],['eng_mid_r',3],['mid_c',1]                                ] },
    // att_l/c/r are where the bulk of real attacking-third buildup play
    // actually happens — probing, recycling possession, working an
    // opening — NOT a brief staging post before automatically entering
    // the box. Previously these zones sent the ball into a box zone on
    // 60-75% of all transitions, producing a heatmap where the box was
    // the single most-visited zone on the entire pitch; real football's
    // heat maps show the opposite — the box is reached relatively
    // rarely relative to total match time, since most attacking moves
    // get recycled, switched, or broken down by the defense well before
    // a team actually gets in. Rebalanced so att_c/l/r keep MORE of
    // their own possession (recycling backward/sideways, not just
    // forward) and only a modest share of transitions actually enter
    // the box.
    att_l:     { eng:[ ['box_l',2],['box_c',1],['att_mid_l',2],['att_c',2],['att_l',3]         ], opp:[ ['att_mid_l',5],['mid_l',3],['att_c',1]                                ] },
    att_c:     { eng:[ ['box_c',2],['box_l',1],['box_r',1],['att_l',3],['att_r',3],['att_c',2] ], opp:[ ['att_mid_c',5],['mid_c',3],['att_l',1],['att_r',1]                    ] },
    att_r:     { eng:[ ['box_r',2],['box_c',1],['att_mid_r',2],['att_c',2],['att_r',3]         ], opp:[ ['att_mid_r',5],['mid_r',3],['att_c',1]                                ] },
    // Once IN the box, real play resolves almost immediately — a shot,
    // a clearance, a tackle, a block — it doesn't linger there tick
    // after tick. Removed the self-loop entirely and heavily weighted
    // exits back out to the attacking third, so the box is correctly a
    // brief, high-stakes moment rather than a zone the ball settles
    // into and stays.
    box_l:     { eng:[ ['att_l',5],['box_c',2],['att_c',1]                                     ], opp:[ ['att_l',5],['att_mid_l',3],['mid_l',2]                                ] },
    box_c:     { eng:[ ['att_c',5],['box_l',1],['box_r',1],['att_l',1],['att_r',1]             ], opp:[ ['att_c',4],['att_mid_c',3],['mid_c',2]                                ] },
    box_r:     { eng:[ ['att_r',5],['box_c',2],['att_c',1]                                     ], opp:[ ['att_r',5],['att_mid_r',3],['mid_r',2]                                ] },
  };

  // ─── COMMENTARY ──────────────────────────────────────────────────────────
  // Tokens: {name} {gk} {opp} {min} {col} {side} {sub}
  // Add lines freely. Engine tracks last-4 used per category to avoid repeats.

  const C = {
    build_eng: [
      "{name} carries it forward through {col} midfield.",
      "England working it patiently. {name} on the ball.",
      "Good ball from {name}, finding space on the {side}.",
      "{name} switches it wide. England looking for a way through.",
      "Neat interchange in midfield. England looking comfortable.",
      "{name} with a lovely touch, turning away from the challenge.",
      "England controlling this. {name} dictating the tempo.",
      "The ball is being recycled well. Patient England build-up.",
      "{name} with a forward pass — England looking to break.",
      "England moving the ball quickly. {opp} defending deep.",
      "Space opens up on the {side}. {name} drives forward.",
      "{name} plays a neat one-two and continues the move.",
      "England are patient here — {name} keeping it ticking over.",
      "The tempo quickens. {name} picks up the ball and goes.",
      "{name} with a delightful turn in midfield. Good feet.",
      "England pressing the issue. {name} looking to thread the needle.",
      "{name} drops a shoulder and finds a yard of space.",
      "Crisp passing from England. {name} finds a team-mate with room.",
      "{name} switches the play beautifully — England in space.",
      "One touch, one pass. {name} making it look simple.",
      "England knock it about with real confidence. {name} unhurried.",
      "{name} surveys his options before picking out the pass.",
      "Patient stuff from England. {name} happy to wait for the opening.",
      "{name} checks his run and receives it cleanly.",
      "Good awareness from {name} — spots the gap and exploits it.",
      "England content to probe here. {name} shifting it side to side.",
      "{name} takes a touch, looks up, and plays it on.",
      "Sharp movement from {name} drags a defender out of position.",
      "{name} holds it up well, waiting for support to arrive.",
      "England's shape looks good. {name} finds the spare man.",
      "{name} feints one way and goes the other. Clever from him.",
      "Quietly effective from {name} — always available for the pass.",
      "{name} plays it first time. No wasted touches.",
      "England building through the {col} — {name} the conductor.",
      "{name} receives under pressure and still finds the pass.",
      "A composed spell of possession. {name} dictating where it goes.",
      "{name} threatens to run at the {opp} defence. Drops the shoulder.",
      "England working the ball into pockets of space. {name} involved again.",
      "{name} with a clever disguised pass — caught {opp} off guard.",
      "England's midfield trio linking well — {name} the latest to get on it.",
    ],
    // Two-player combination lines — only ever selected when a genuine
    // passer-to-receiver sequence exists this tick (see the build-up
    // commentary hook in _doStep), so {fromName} is always populated.
    // Kept separate from build_eng rather than mixed in, since _pick()
    // has no way to know which lines need which tokens satisfied.
    build_eng_combo: [
      "{fromName} slides it through to {name} — good understanding there.",
      "{name} shows for it and {fromName} finds him in stride.",
      "Lovely combination — {fromName} to {name} — England building well.",
      "{name} comes short to collect from {fromName}. Composed on the ball.",
      "{fromName} lays it off to {name}, who immediately looks forward.",
      "Good link-up — {fromName} finds {name} in space.",
      "{fromName} picks out {name} with a lovely pass.",
      "Smart movement from {name} gets him on the end of {fromName}'s pass.",
    ],
    build_opp: [
      "{opp} winning the ball back. England must reorganise.",
      "{oppPlayer} driving forward — England track back urgently.",
      "{opp} moving forward with purpose. England under real pressure.",
      "Danger. {oppPlayer} advancing through the {col} of the pitch.",
      "England pinned back. {opp} knocking on the door.",
      "{oppPlayer} with a direct ball — England's defence being tested.",
      "England scrambling. {opp} maintaining their pressure.",
      "That's a good move from {oppPlayer}. England giving ground.",
      "{oppPlayer} making a dangerous run. England's line holds tight.",
      "A burst of pace from {oppPlayer} — England caught in transition.",
      "{opp} spreading the play. England can't get close.",
      "Sustained pressure from {opp} here. England need a foothold.",
      "{oppPlayer} working the ball into the England half with purpose.",
      "England on the back foot. {opp} in the ascendancy.",
      "{oppPlayer} finding space behind the England midfield.",
      "{opp} moving it quickly — {oppPlayer} looks dangerous.",
      "England struggling to get a foothold. {oppPlayer} pulling the strings.",
      "{oppPlayer} probing patiently. England's defence well organised so far.",
      "{opp} content to build slowly here. England happy to let them.",
      "{oppPlayer} tries to force the issue but England stand firm.",
      "Good pressing from England forces {oppPlayer} backward.",
      "{opp} switch it across — England's shape shifts to match.",
      "England's defenders alert to the danger from {oppPlayer}.",
      "{oppPlayer} drops deep to collect, looking to start something.",
      "{opp} probing for an opening. {oppPlayer} the chief creator.",
      "England's press is forcing errors. {opp} struggling to settle.",
      "{oppPlayer} dictates the pace for {opp} in this spell.",
      "England well-drilled here, denying {oppPlayer} space to work.",
      "{opp} patient in their build-up. England matching them shape for shape.",
      "{oppPlayer} looking for the killer pass — England alert to it.",
      "A real test of England's discipline. {oppPlayer} probing again.",
      "{opp} have settled into this. England need to be wary.",
    ],
    clearance: [
      "{name} heads clear. Vital intervention.",
      "Cleared by {name} — but only to the edge of the box.",
      "{name} boots it long. Relief for England.",
      "Last-ditch clearance from {name}. England breathe.",
      "{name} with a crucial intervention. {opp} chance snuffed out.",
      "Towering header from {name}. That's authoritative defending.",
      "England defending doggedly. {name} with the clearance.",
      "Cleared off the line! {name} with an absolutely vital touch.",
      "{name} reads it perfectly. Ball cleared to safety.",
      "Brave defending from {name}. Gets his body in the way.",
      "{name} cuts out the danger. Excellent awareness.",
      "England survive the pressure. {name} clears first time.",
      "{name} hacks it clear under pressure. No time to be tidy there.",
      "Important block from {name} — that's smart defending.",
      "{name} gets there just in time. Vital touch to deny the danger.",
      "Good recovery run from {name} to make that clearance.",
      "{name} doesn't panic. Calm head, ball cleared.",
      "England's defence holding firm. {name} with the touch to safety.",
    ],
    tackle: [
      "{name} wins it cleanly. Excellent challenge.",
      "Crunching tackle from {name} — and he gets the ball!",
      "{name} times that to perfection. Ball recovered.",
      "England win possession through {name}. Good work.",
      "{name} dispossesses the {opp} player. Counter-attack on.",
      "A tenacious challenge from {name}. England back in control.",
      "Won cleanly by {name}. The crowd appreciates that.",
      "{name} snaps into the challenge. Ball is England's.",
      "{name} showing tremendous energy to win that back.",
      "{name} reads the pass and steps in front of his man.",
      "Smart positioning from {name} — intercepts before it's even a contest.",
      "{name} closes the space down quickly and forces the turnover.",
      "Good recovery tackle from {name} after being beaten initially.",
      "{name} times his challenge superbly. Not even a whisper of contact.",
      "Strong from {name} — wins the physical battle and the ball.",
    ],
    pass_forward: [
      "{name} plays it in behind. Looking for the run.",
      "Incisive ball from {name} — splitting the {opp} defence.",
      "{name} with a raking pass to the {side}.",
      "England moving forward. {name} finds the target.",
      "Quick thinking from {name}. Defence turned.",
      "A perfectly weighted through ball from {name}.",
      "{name} picks out the run with a lovely first-time pass.",
      "Brilliant vision from {name}. England in behind.",
      "That's a wonderful pass from {name}. Real quality.",
      "{name} sees the run and threads it through perfectly.",
      "{name} switches the play beautifully — England in space.",
      "One touch, one pass. {name} making it look simple.",
    ],
    cross_l: [
      "{name} whips it in from the left. Dangerous delivery.",
      "Deep cross from {name} on the left. Keeper coming.",
      "{name} drives to the byline — dangerous ball into the box.",
      "Left flank delivery from {name}. Can England get on the end?",
      "Ball swung in from the left by {name}. Heads in there!",
      "{name} cuts inside and delivers. Goal-mouth scramble.",
      "In-swinging cross from {name}. Keeper will have to be sharp.",
      "{name} with the whipped ball across — quality delivery.",
      "Great run and cross from {name} on the left side.",
      "{name} gets past the full-back and puts it in the box.",
    ],
    cross_r: [
      "{name} crosses from the right. Pinpoint delivery.",
      "Right-flank ball from {name} into the mixer.",
      "{name} cuts it back from the right. Good opportunity here.",
      "Excellent delivery from {name} on the right side.",
      "{name} with the cross — right-footed, finding the near post.",
      "Ball whipped in from the right. Somebody needs to attack it.",
      "{name} floats it to the back post. Dangerous.",
      "{name} with the outswinging cross. Quality ball in.",
      "Beckham-esque delivery from {name} on the right flank.",
      "{name} drives to the byline and pulls it back.",
    ],
    shot_on: [
      "{name} strikes it! {gk} down to his right to push it wide.",
      "Effort from {name} — straight at {gk}. Comfortable save.",
      "{name} fires one in — well struck but {gk} was equal to it.",
      "Shot from {name}! {gk} tips it over. Corner.",
      "{name} tries his luck — {gk} well-positioned.",
      "Fierce drive from {name}. {gk} holds with both hands.",
      "Deflected shot falls to {name}. {gk} does well.",
      "{name} gets a sight of goal from range — {gk} well-placed.",
      "Hit that hard, {name}. {gk} had it covered though.",
      "{name} bends it goalwards — {gk} palms it away.",
      "Shot on target from {name}. {gk} was never troubled.",
      "Low drive from {name} — {gk} smothers it well.",
      "{name} catches it sweet — but {gk} makes the save.",
      "Well saved by {gk}! {name} was furious it didn't go in.",
    ],
    shot_off: [
      "{name} blazes it wide! That had to be a goal.",
      "Over the bar from {name}. He'll be frustrated with that.",
      "{name} pulls it too wide. Nobody home at the far post.",
      "Strikes it over! {name} won't want to see that again.",
      "Just wide from {name}. So close — inches away.",
      "Off the post! {name} was unlucky — rattled the woodwork.",
      "{name} with a snap shot — curls just outside the far post.",
      "That nearly crept in at the near post. {name} inches away.",
      "{name} skied it. Poor technique from a good position.",
      "So close! {name} fires across the face of goal.",
      "{name} scuffs his shot. Should have done better.",
      "Hit the bar! {name} watches it bounce down and away.",
      "Too high from {name}. No power in that shot.",
      "Weak effort from {name}. {gk} didn't have to move.",
    ],
    chance_big: [
      "What a chance for {name}! One on one — and he's sidefooted wide!",
      "HUGE chance! {name} through on goal — {gk} pulls off an incredible save!",
      "{name} should have scored! Unmarked at the back post — headed over!",
      "Six yards out, {name} somehow miscues it. Incredible miss.",
      "{gk} to the rescue! Brilliant to deny {name} from point-blank range.",
      "You'll not get a better chance than that. {name} will be inconsolable.",
      "{name} with the ball in his feet! Loses his footing at the crucial moment!",
      "One-on-one with {gk} — and {name} can't find the finish! Unbelievable!",
      "The ball falls perfectly for {name}. He blazes it wide. Inexplicable.",
    ],
    save_routine: [
      "{gk} gathers comfortably. No danger there.",
      "Routine stop for {gk}. Holds it cleanly.",
      "{gk} deals with that without fuss. Good hands.",
      "Comfortable for {gk}. Good positioning.",
      "{gk} smothers it. England goalkeeper confident tonight.",
      "Positioned well — {gk} takes it cleanly.",
      "No danger. {gk} makes himself big and catches it.",
      "Straightforward for {gk}. Clutches it to his chest.",
    ],
    save_great: [
      "WHAT A SAVE from {gk}! Absolutely outstanding!",
      "Incredible stop from {gk}! Finger-tips it onto the post!",
      "{gk} has produced an absolute worldie. Unbelievable reflexes.",
      "Point-blank — and {gk} turns it over! Phenomenal.",
      "England kept in it by {gk}! That had goal written all over it.",
      "{gk} has pulled off the save of the season. Breathtaking.",
      "Full stretch from {gk} — turns it round the post. Outstanding.",
      "HOW has {gk} kept that out?! Instinctive. Brilliant.",
      "Reaction save from {gk}! He had no right to stop that.",
      "{gk} throws himself across goal — gets a hand to it!",
    ],
    corner_eng: [
      "Corner to England. {name} steps up to deliver.",
      "England win a corner. {name} swinging it in.",
      "Set piece for England. {name} with the delivery.",
      "England corner — {name} looking for the far post.",
      "In-swinging corner from {name}. Dangerous ball.",
      "Short corner. {name} plays it short — working an angle.",
      "England set piece. {name} will deliver this one.",
      "{name} standing over the corner. The box is packed.",
    ],
    corner_opp: [
      "Corner for {opp}. {name} organising England's defence.",
      "{opp} with a corner. England need to defend well.",
      "Dangerous delivery coming in for {opp}.",
      "{opp} corner. {name} calling the line.",
      "England under pressure from the corner. {name} marshalling.",
    ],
    freekick_eng: [
      "{name} standing over the free kick. Dangerous position.",
      "Set piece for England. {name} to deliver.",
      "{name} shaping up to strike it direct.",
      "Direct free kick. {name} steps up — the crowd hushed.",
      "England free kick — {name} bending it around the wall.",
      "{name} addresses the ball. Wall in position.",
    ],
    freekick_opp: [
      "{opp} free kick. Wall set. {gk} organising.",
      "Dangerous position for {opp}. {gk} marshalling the wall.",
      "{gk} setting his wall. {opp} could go direct.",
      "England wall forming. {gk} pointing, directing.",
    ],
    foul_eng: [
      "{name} caught the man. Free kick to {opp}.",
      "Cynical challenge from {name} — referee isn't happy.",
      "{name} goes in a bit late. {opp} free kick.",
      "England give away a dangerous free kick. {name} the culprit.",
      "Shirt pull from {name}. Referee spots it immediately.",
      "{name} with the professional foul. Referee has no choice.",
    ],
    foul_opp: [
      "Foul by {opp}. England with the free kick.",
      "{opp} bringing down {name}. Free kick to England.",
      "Good position for England after the foul on {name}.",
      "{opp} giving away a free kick in a dangerous area.",
      "{name} wins the foul with clever movement.",
      "{opp} player hacks {name} down. Referee points to the spot? No — free kick.",
    ],
    booking_eng: [
      "{name} goes into the book. One more and he's off.",
      "Yellow card for {name}. He'll need to be careful.",
      "Caution for {name}. England down to ten if he's reckless again.",
      "The referee produces the yellow for {name}.",
      "Rash challenge from {name}. Booked — lucky not to see red.",
    ],
    booking_opp: [
      "{opp} player cautioned. England can exploit the space.",
      "Yellow card for {opp}. Walking a tightrope now.",
      "The referee books an {opp} player. Cynical challenge.",
      "Second yellow territory if {opp} do that again.",
    ],
    redcard_eng: [
      "{name} — RED CARD. England down to ten men. This changes everything.",
      "Off goes {name}. Straight red. England will have to dig deep.",
      "The referee has seen enough. {name} is dismissed. Ten men.",
    ],
    redcard_opp: [
      "RED CARD for {opp}! Down to ten men! England have the advantage now!",
      "{opp} reduced to ten men! England should capitalise.",
      "Off! {opp} dismissed. England with the numerical advantage.",
    ],
    goal_eng_foot: [
      "GOAL! {name} drives it into the bottom corner! GET IN!",
      "GOAL! {name} — what a finish! Low and hard, no chance for the keeper!",
      "{name} — GOAL! He's put it away with real authority!",
      "GOAL! The net is bulging! {name} with a clinical finish!",
      "SCORED! {name} finding the corner from twenty yards!",
      "ENGLAND SCORE! {name} — composed in front of goal — buries it!",
      "{name} — GOAL! England are ahead!",
      "Into the net! {name} latches on and finishes emphatically!",
      "GOAL! Instinctive finish from {name}. He knew nothing about it!",
      "BRILLIANT GOAL! {name} cuts inside and curls it into the far corner!",
      "GOAL! {name} pulls the trigger first time — thunderous strike!",
      "What a goal! {name} with the composed finish under pressure!",
    ],
    goal_eng_header: [
      "GOAL! {name} meets the cross and POWERS it home!",
      "{name} — HEADER — GOAL! Climbed above the defence!",
      "Get in! {name} with a towering header! Unstoppable!",
      "GOAL! {name} times the run to perfection — back of the net!",
      "Magnificent header from {name}! Pure technique!",
      "{name} nods it in at the back post! England score!",
      "GOAL! {name} wins the aerial duel and buries it in the corner!",
      "HEADER! {name} rises highest and sends it past the keeper!",
    ],
    goal_eng_free: [
      "GOAL! FREE KICK — {name} bends it into the top corner! Sensational!",
      "{name} steps up — and SCORES direct from the free kick! What technique!",
      "GOAL! {name} curls it over the wall and into the net! Brilliant!",
      "{name} finds a way through! GOAL! Unbelievable free kick!",
      "GOAL FROM THE FREE KICK! {name} with a masterclass in dead-ball delivery!",
    ],
    goal_eng_pen: [
      "PENALTY — GOAL! {name} sends the keeper the wrong way!",
      "{name} steps up — cool as you like — SCORES! Penalty converted!",
      "GOAL from the spot! {name} with absolute ice in his veins!",
      "Penalty converted! {name} straight down the middle — keeper had no chance.",
    ],
    goal_opp_foot: [
      "GOAL. {oppPlayer} drives it home. Disappointing defending from England.",
      "{oppPlayer} finds the net. England caught out of position.",
      "A sucker punch from {oppPlayer}. England rocked.",
      "GOAL conceded — {oppPlayer} — England's defence was all at sea.",
      "The goalkeeper had no chance. {oppPlayer} finishes clinically.",
      "{oppPlayer} strikes — and it's in the back of the net! England stunned.",
      "A brilliant finish from {oppPlayer}. England punished for the error.",
      "{oppPlayer} with the instinctive finish. England can't believe it.",
      "Clinical from {oppPlayer}! {opp} take the lead.",
      "{oppPlayer} was in too much space there. England punished.",
    ],
    goal_opp_header: [
      "{oppPlayer} scores with a header. Poor marking from England.",
      "Headed in by {oppPlayer}. England's organisation was all wrong.",
      "England undone from a set piece. {oppPlayer} rises highest.",
      "Unmarked in the box — {oppPlayer} can't miss. And they don't.",
      "{oppPlayer} climbs above the England defence. Back of the net.",
      "Towering header from {oppPlayer}! England were outjumped there.",
    ],
    injury: [
      "{name} is down. The physio is on.",
      "Concern — {name} picking up a knock. He's in some discomfort.",
      "{name} stretching — looks like he's pulled something.",
      "Play stopped for {name}. England may need to make a change.",
      "{name} limping. The physio signals from the touchline.",
    ],
    sub_eng: [
      "{name} makes way for {sub}. Tactical change from England.",
      "England make a change. Off comes {name}, on comes {sub}.",
      "Substitution — {sub} introduced. {name} has done his job today.",
      "{sub} on for {name}. England looking to change the game.",
      "The manager makes his move. {name} off, {sub} on.",
    ],
    sub_opp: [
      "{opp} make a substitution. Fresh legs coming on.",
      "Change for {opp}. They're looking to affect the game.",
      "{opp} bringing fresh energy on from the bench.",
    ],
    pressing: [
      "England pressing high. {opp} struggling to play out.",
      "The intensity has gone up a notch. England winning the second balls.",
      "England suffocating {opp} in their own half.",
      "High press from England — {opp} keeper under pressure.",
      "England's energy is really affecting {opp}. Errors under pressure.",
    ],
    sitting_deep: [
      "England sitting in two banks of four. Defending the lead.",
      "Compact shape from England. Very hard to break down.",
      "England content to absorb pressure and hit on the counter.",
      "{opp} having the ball but England resolute.",
      "England defending well. Organised and disciplined.",
    ],
    momentum_eng: [
      "England on top here. This could be the period they find the goal.",
      "All the momentum with England right now.",
      "England in the ascendancy. {opp} on the back foot.",
      "This is a good spell for England. The crowd is lifting them.",
      "England pushing for more. Relentless pressure being applied.",
    ],
    momentum_opp: [
      "{opp} growing into this. England need to weather the storm.",
      "This is a dangerous spell for England. {opp} scenting an opening.",
      "{opp} on top right now. England need to ride this out.",
      "England under the cosh. Defending for their lives.",
      "{opp} threatening. Can England hold on?",
    ],
    halftime:          [ "The referee blows for half time.", "{manager} will have plenty to say in that dressing room.", "The whistle goes for the break. Forty-five minutes played.", "First half done. {manager}'s England head in." ],
    secondhalf_start:  [ "And we're back underway for the second half.", "The second forty-five gets started.", "England back out — second period begins.", "Kick off for the second half. England looking to build." ],
    last_ten:          [ "Ten minutes remaining. Nerves in the England camp.", "The clock ticking down. England digging in.", "Final ten minutes. This is where character counts.", "Can England see this out? Ten minutes to go." ],
    last_five:         [ "Five minutes left. Nail-biting stuff.", "The seconds are ticking. England need to hold on.", "Almost there. Five more minutes for England." ],
    opp_desperate:     [ "{opp} are throwing everyone forward now. Real desperation.", "{opp} have abandoned any pretence of caution. All-out attack.", "Backs to the wall stuff needed from England — {opp} are committing men forward in numbers.", "{opp} know they need a response, and quickly. Men pouring forward." ],
    opp_packed_in:     [ "{opp} happy to sit deep and protect what they have.", "{opp} content to let England have the ball in front of them.", "{opp} have packed men behind the ball. A defensive lockdown.", "{opp} in no rush to do anything but see this out." ],
    fulltime:          [ "Full time! The final whistle goes!", "The referee blows. {manager} will be pleased — or not.", "And that's the match! Full time!", "{manager}'s England — that is how it ends today." ],
    penalty_scored:    [ "PENALTY! {name} hammers it straight down the middle!", "GOAL from the spot! {name} with a composed finish!", "{name} sends the keeper the wrong way from the penalty spot!" ],
    penalty_missed:    [ "PENALTY MISSED! {name} blazes it over the bar!", "{gk} SAVES the penalty! Unbelievable!", "Off the post from {name}! The penalty is missed!" ],
    shot_opp: [
      "{oppPlayer} with a shot — {gk} down to make the save.",
      "Strike from {oppPlayer}! {gk} blocks it well.",
      "{oppPlayer} shoots from range — {gk} comfortable.",
      "Effort from {oppPlayer}. {gk} pushes it wide.",
      "{oppPlayer} gets a shot off — {gk} unconvincing but holds.",
      "Shot saved by {gk}! {oppPlayer} can't believe it.",
      "{oppPlayer} trying their luck from distance. {gk} makes the stop.",
      "Well struck by {oppPlayer} — {gk} tips it wide.",
    ],
  };

  // ─── STATE ────────────────────────────────────────────────────────────────

  let _state      = {};
  let _players    = {};   // England players
  let _oppPlayers = {};   // Opposition players
  let _handlers   = {}; // ev -> array of handler functions

  // on() now appends to a list rather than overwriting a single slot —
  // this was a real, severe bug: match.js registers two separate
  // listeners for the 'event' type (one for the commentary feed, one for
  // the meta-strip), and the old single-slot assignment meant only
  // whichever one registered LAST actually ever ran. The commentary
  // feed's handler was silently dead — never called once, all game.
  function on(ev, fn) {
    if (!_handlers[ev]) _handlers[ev] = [];
    _handlers[ev].push(fn);
  }

  // off() lets a screen cleanly remove its own listeners on teardown —
  // needed now that multiple handlers can accumulate; without this,
  // re-entering the match screen for a second match would keep adding
  // MORE listeners on top of the previous match's (which never got
  // cleared), eventually running the same commentary/render logic
  // multiple times per real event.
  function off(ev, fn) {
    if (!_handlers[ev]) return;
    _handlers[ev] = _handlers[ev].filter(h => h !== fn);
  }

  function offAll() { _handlers = {}; }
  let _tickTimer = null;
  let _recentC = {};   // category → [recent line indices]

  // Per-match player stats, keyed by player id, DELIBERATELY separate from
  // the `_players` map that _buildPlayers() rebuilds on every substitution.
  // Previously `ms` lived directly on the object _buildPlayers() created,
  // so every sub (tactical or injury) silently reset EVERY on-pitch
  // player's accumulated stats back to zero, and anyone subbed off simply
  // vanished from _players — meaning they got no rating, no stats, and no
  // minutes in the post-match report at all, while a player coming off the
  // bench in the 88th minute was recorded as having played all 90 (`mins`
  // was a hardcoded literal, never a real calculation). This object is the
  // fix: created once per player on their first appearance, referenced
  // (not copied) into every subsequent playerObj, and never reset.
  // { [playerId]: { ms: {...running totals}, enteredAt, exitedAt, snapshot } }
  let _matchStats = {};

  function _ensureMatchStats(id) {
    if (!_matchStats[id]) {
      _matchStats[id] = {
        ms: { touches:0, shots:0, shotsOT:0, goals:0, assists:0, keyPasses:0,
              tackles:0, interceptions:0, clearances:0, saves:0, foulsWon:0,
              foulsConceded:0, crosses:0, dribbles:0, aerialWon:0 },
        enteredAt: _state ? _state.min : 0,
        exitedAt: null,
        snapshot: null,
      };
    }
    return _matchStats[id];
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  function start() {
    _recentC = {};
    _ffActive = false;
    _htPaused = false;
    _injuryPenalty = {};
    _matchStats = {};
    _state   = _buildState();
    _players    = _buildPlayers();
    // Build opp squad
    const _ovr2 = State.get('match.oppOverride') || null;
    const fix2  = window.ALL_FIXTURES?.[State.get('campaign.fixtureIdx')||0] || {};
    const yr2   = _ovr2?.year || parseInt((fix2.date||'1990').slice(0,4));
    _oppPlayers = _buildOppPlayers(_state.oppName, yr2);
    _resetStamina(); // both rosters now exist — fresh stamina for everyone
    _initPositions();
    // Record this lineup for chemistry purposes — every genuine
    // partnership pair (CB+CB, CM+CM, ST+ST, DM+DM) gets credited with
    // one more appearance together, building toward the settled-
    // partnership bonus over subsequent matches.
    if (window.Chemistry) {
      const tacForChem = State.get('match.tactics') || State.get('campaign.tactics') || {};
      window.Chemistry.recordMatchLineup(tacForChem.formation || '4-4-2', State.get('squad.slots') || []);
    }
    _state.os   = _oppTeamStats();
    // Rebuild team stats now that players are populated
    _state.es = _teamStats();
    const or = _state.or;
    const es = _state.es;
    const engOverall = (es.att * 0.30 + es.mid * 0.35 + es.def * 0.25 + es.gk * 0.10) * 100;
    _state.dominance = _clamp(engOverall / (engOverall + or) - 0.5, -0.30, 0.30);
    _emit('start', { state: _state });
    _tick();
  }

  function stop() {
    _state.active = false;
    if (_tickTimer) { clearTimeout(_tickTimer); _tickTimer = null; }
  }

  function makeSub(offId, onId) {
    const slots = State.get('squad.slots') || [];
    const bench = State.get('squad.bench') || [];
    const used  = State.get('match.subsUsed') || 0;
    if (used >= 3) return false;
    const offIdx = slots.findIndex(p => p?.id === offId);
    const onIdx  = bench.findIndex(p => p?.id === onId);
    if (offIdx < 0 || onIdx < 0) return false;

    const off = slots[offIdx];
    const on  = bench[onIdx];
    const ns  = [...slots]; ns[offIdx] = on;
    const nb  = [...bench]; nb[onIdx]  = off;
    State.set('squad.slots', ns);
    State.set('squad.bench', nb);
    State.set('match.subsUsed', used + 1);

    // Freeze the outgoing player's exit minute now, before _buildPlayers()
    // below drops them from _players — this is what lets the full-time
    // compile step calculate their real minutes played instead of either
    // losing them entirely or crediting them with 90.
    if (_matchStats[off.id]) _matchStats[off.id].exitedAt = _state.min;

    // Rebuild player pool and team stats
    _players = _buildPlayers();
    _stamina[on.id] = 1.0; // fresh legs — the whole point of a substitution
    _initPositions(); // roster changed — rebuild slot index map and home shape
    _state.es = _teamStats();

    _pushEvent('sub', _state.min, '🔄', _pick('sub_eng', { name: _shortName(off), sub: _shortName(on) }), 'eng');
    _emit('substitution', { off, on });
    return true;
  }

  function setTactic(key, val) {
    const tac = State.get('match.tactics') || {};
    tac[key] = val;
    State.set('match.tactics', tac);
    _state.es = _teamStats();
    // Rebuild transitions if formation changed
    if (key === 'formation') {
      _state.formTransitions = _formationTransitions();
      _initPositions(); // home shape depends on formation — rebuild it
    }
  }

  function getState() { return _state; }
  function getPlayers() { return _players; }

  // ─── PLAYER POOL ──────────────────────────────────────────────────────────

  // Players who suffered an injury but had no substitution available — they
  // play on at reduced effectiveness for the rest of the match. Tracked
  // here (not just mutated onto the built player object) because
  // _buildPlayers() gets called again on every subsequent substitution,
  // which would otherwise silently restore them to full fitness.
  let _injuryPenalty = {}; // { playerId: multiplier 0-1 }

  function _buildPlayers() {
    const slots  = (State.get('squad.slots') || []).filter(Boolean);
    const morale = State.get('campaign.playerMorale') || {};
    const tac    = State.get('match.tactics') || State.get('campaign.tactics') || {};
    const formation = tac.formation || '4-4-2';
    const intensityId = State.get('campaign.trainingIntensity') || 'standard';
    const intensityMult = window.Training ? (window.Training.INTENSITY[intensityId]?.mult || 1.0) : 1.0;
    // Chemistry — a settled centre-back pair, midfield two, or strike
    // partnership that's played together repeatedly genuinely outplays
    // the same individuals freshly thrown together, regardless of their
    // individual ratings. Computed once for the whole XI here (it
    // depends on the full lineup, not any one player in isolation).
    const chemistryBonus = window.Chemistry ? window.Chemistry.chemistryForLineup(formation, slots) : {};

    const players = {};
    slots.forEach((p, slotIdx) => {
      let attrs  = { ...(p.attrs || {}) };
      const injMult = _injuryPenalty[p.id];
      if (injMult !== undefined) {
        ['fin','sho','hea','pas','dri','tac','mar','int','pac','acc','sta','str','jum','agi']
          .forEach(k => { if (attrs[k] !== undefined) attrs[k] = Math.round(attrs[k] * injMult); });
      }
      // Individual drill boost — a player specifically assigned a drill
      // (e.g. a winger doing extra crossing work) gets a modest, targeted
      // attribute bump for this match, on top of whatever the team-wide
      // training focus already provides.
      if (window.Training) attrs = window.Training.applyIndividualBoost(attrs, p.id, intensityMult);
      const m      = (morale[p.id] || 50) / 100;   // 0-1
      const rat100 = (p.rat || 70) / 100;           // 0-1

      // Role context from formation slot
      const fSlot = (window.FORMATIONS?.[formation] || [])[slotIdx];
      const role  = fSlot?.pos || p.pos || 'CM';

      // Assigned role+duty for this slot (set via the Tactics screen).
      // IMPORTANT: mods are only applied when the manager has EXPLICITLY
      // assigned a role — an unconfigured slot gets a sensible label for
      // display purposes only (handled in the UI), but contributes ZERO
      // multiplier here. Applying default-role mods unconditionally would
      // silently inflate every match's attacking output relative to the
      // baseline this engine was actually balanced against, since most
      // sensible "default" labels (Advanced Forward, Winger, Box-to-Box)
      // happen to carry net-positive attacking mods with no equivalent
      // defensive default to offset them.
      const roleAssignments = State.get('campaign.tactics.roles') || {};
      const assignment = roleAssignments[slotIdx] || {};
      const roleId = assignment.role || null;
      const dutyId = assignment.duty || 'Support';

      const rec = _ensureMatchStats(p.id);
      let playerObj = {
        p, role, attrs, roleId, dutyId,
        rat: rat100,
        morale: m,
        // Derived attribute scores (0–1 scale, 20 = max)
        finishing:  _a(attrs, ['fin','sho'], rat100),
        heading:    _a(attrs, ['hea','jum'], rat100),
        crossing:   _a(attrs, ['cro','tec','pas'], rat100),
        longPassing:_a(attrs, ['lng','vis','pas'], rat100),
        shortPass:  _a(attrs, ['pas','tec','vis'], rat100),
        dribbling:  _a(attrs, ['dri','pac','agi'], rat100),
        defending:  _a(attrs, ['tac','mar','int'], rat100),
        heading_def:_a(attrs, ['hea','jum','str'], rat100),
        strength:   _a(attrs, ['str','phy','bra'], rat100),
        pace:       _a(attrs, ['pac','acc'], rat100),
        // GK specific
        handling:   _a(attrs, ['han','ref','onv'], rat100),
        positioning:_a(attrs, ['pos','com','dec'], rat100),
        // Personality
        leadership: _a(attrs, ['lea','com','bra'], rat100),
        workrate:   _a(attrs, ['wor','sta','str'], rat100),
        // Per-match stats — a REFERENCE into the persistent store, not a
        // fresh literal, so goals/tackles/etc. accumulated before this
        // rebuild (e.g. from an earlier substitution elsewhere on the
        // pitch) survive rather than resetting to zero.
        ms: rec.ms,
      };

      // Apply role+duty multipliers to the derived scores we just built —
      // this is what makes "Wing-Back on Attack" genuinely different from
      // "Full-Back on Defend" rather than just a label on the pitch.
      if (window.Roles && roleId) {
        playerObj = window.Roles.applyToDerivedScores(playerObj, roleId, dutyId);
      }

      // Confidence — the single number covering both how settled/happy a
      // player is (raised by team talks, good recent results) and how
      // much they trust themselves under pressure. This used to be
      // computed (the `m` value above) and displayed on the squad screen,
      // but never actually touched a match — a player at 20 confidence
      // and a player at 95 performed identically. A real player visibly
      // plays with more conviction when they're confident and shrinks
      // from the moment when they're not, so this now genuinely scales
      // every derived score: neutral at 50 (no effect either way), a
      // gentle curve near the middle (an ordinary so-so week barely
      // registers), steepening toward the extremes (a player in real
      // crisis, or in the form of their life, visibly plays like it).
      if (window.Confidence) {
        playerObj = window.Confidence.applyToDerivedScores(playerObj, m * 100);
      }

      // Chemistry — settled partnerships get a real, modest boost to the
      // specific scores their on-pitch relationship actually depends on
      // (a centre-back pair's defending, a strike partnership's
      // finishing/heading, a midfield two's passing). Capped low (+6% at
      // most) deliberately — chemistry should reward consistency, not
      // let it substitute for actual quality.
      const chemMult = chemistryBonus[p.id];
      if (chemMult && chemMult !== 1.0) {
        ['defending','heading_def','shortPass','longPassing','finishing','heading'].forEach(key => {
          if (playerObj[key] !== undefined) {
            playerObj[key] = Math.max(0.15, Math.min(1.0, playerObj[key] * chemMult));
          }
        });
      }

      players[p.id] = playerObj;
      // Keep the frozen snapshot current while this player is actually on
      // the pitch — once they're subbed off, this stops being updated
      // (they're no longer in `slots`), which is exactly what preserves
      // their last real on-pitch state for the full-time compile step.
      rec.snapshot = playerObj;
    });
    return players;
  }

  // Average a set of attribute keys, fall back to overall rat if attrs missing
  function _a(attrs, keys, rat100) {
    const vals = keys.map(k => attrs[k]).filter(v => v !== undefined && v !== null);
    if (!vals.length) return rat100;
    return _clamp(vals.reduce((s,v) => s + v, 0) / vals.length / 20, 0.2, 1.0);
  }

  // ─── OPP SQUAD ───────────────────────────────────────────────────────────

  function _buildOppPlayers(oppName, year) {
    // Look up real squad data, fall back to generic
    let squad = window.getOppSquad ? window.getOppSquad(oppName, year) : null;
    if (!squad && window.generateGenericSquad) {
      squad = window.generateGenericSquad(oppName, _state.or, year);
    }
    if (!squad || !squad.length) return {};

    const players = {};
    squad.forEach((p, i) => {
      const attrs = p.attrs || {};
      const rat100 = (p.rat || 70) / 100;
      players['opp_' + i] = {
        p: { id:'opp_'+i, name:p.name, posG:p.posG, pos:p.pos, rat:p.rat||70, nat:'opp' },
        attrs, rat: rat100,
        finishing:   _a(attrs, ['fin','sho'], rat100),
        heading:     _a(attrs, ['hea','jum'], rat100),
        crossing:    _a(attrs, ['cro','tec','pas'], rat100),
        longPassing: _a(attrs, ['lng','vis','pas'], rat100),
        shortPass:   _a(attrs, ['pas','tec','vis'], rat100),
        dribbling:   _a(attrs, ['dri','pac','agi'], rat100),
        defending:   _a(attrs, ['tac','mar','int'], rat100),
        heading_def: _a(attrs, ['hea','jum','str'], rat100),
        strength:    _a(attrs, ['str','phy','bra'], rat100),
        pace:        _a(attrs, ['pac','acc'], rat100),
        handling:    _a(attrs, ['han','ref','onv'], rat100),
        positioning: _a(attrs, ['pos','com','dec'], rat100),
        workrate:    _a(attrs, ['wor','sta','str'], rat100),
        ms: { touches:0, shots:0, shotsOT:0, goals:0, saves:0 },
      };
    });
    return players;
  }

  function _oppTeamStats() {
    const pp = Object.values(_oppPlayers);
    if (!pp.length) return { att:_state.or/100, mid:_state.or/100, def:_state.or/100, gk:_state.or/100, gkName:_oppGKName(_state.oppName), gkId:null };

    const byPos = g => pp.filter(pl => pl.p.posG === g);
    const avg   = (arr, fn) => arr.length ? arr.reduce((s,pl) => s+fn(pl), 0)/arr.length : _state.or/100;

    const gks  = byPos('GK');
    const defs = byPos('DEF');
    const mids = byPos('MID');
    const fwds = byPos('FWD');
    const gk   = gks[0] || null;

    // Opponent tactical identity — a real, recognisable style for
    // historically distinctive footballing nations, a sensible
    // rating-derived default for everyone else.
    const style = window.OppStyles ? window.OppStyles.getStyle(_state.oppName, _state.or) : { attBias:1, midBias:1, defBias:1 };

    return {
      att: _clamp(avg(fwds.length?fwds:pp, pl => (pl.finishing*0.5+pl.heading*0.25+pl.workrate*0.25) * _fatigueMult(pl.p.id)) * style.attBias, 0.30, 1.0),
      mid: _clamp(avg(mids.length?mids:pp, pl => (pl.shortPass*0.35+pl.longPassing*0.25+pl.defending*0.20+pl.workrate*0.20) * _fatigueMult(pl.p.id)) * style.midBias, 0.30, 1.0),
      def: _clamp(avg(defs.length?defs:pp, pl => (pl.defending*0.50+pl.heading_def*0.30+pl.workrate*0.20) * _defensiveFatigueMult(pl.p.id)) * style.defBias, 0.30, 1.0),
      gk:  _clamp(gk ? gk.handling*0.5+gk.positioning*0.5 : _state.or/100, 0.30, 1.0),
      gkName: gk ? gk.p.name : _oppGKName(_state.oppName),
      gkId:   gk ? gk.p.id : null,
      fwdNames: fwds.map(pl => pl.p.name),
      midNames: mids.map(pl => pl.p.name),
      defNames: defs.map(pl => pl.p.name),
      allNames: pp.map(pl => pl.p.name),
    };
  }

  // ─── OPPONENT SCORELINE REACTION ──────────────────────────────────────────
  // The AI opponent adapts its approach based on the current scoreline and
  // how much time is left. Losing late = more attacking risk (and more
  // exposure at the back). Winning late = sit in, waste time, defend deeper.
  function _oppScorelineMod() {
    const s = _state;
    if (!s) return { attMod: 1.0, defMod: 1.0, possBias: 0 };
    const score = State.get('match.score') || { eng: 0, opp: 0 };
    const diff  = score.opp - score.eng;           // positive = opp winning
    const min   = s.min || 0;

    // Urgency scales with time left — biggest swing from 70' onward
    const urgency = min < 60 ? 0.3 : min < 75 ? 0.6 : min < 85 ? 0.85 : 1.0;

    let attMod = 1.0, defMod = 1.0, possBias = 0;

    if (diff < 0) {
      // Opponent losing — push forward, more risk, leave gaps at the back
      const desperation = Math.min(2, -diff) * urgency; // cap effect at 2-goal deficit
      attMod   = 1.0 + 0.18 * desperation;   // up to +36% attacking threat
      defMod   = 1.0 - 0.12 * desperation;   // up to -24% defensive solidity
      possBias = 0.05 * desperation;         // commits more men forward
    } else if (diff > 0) {
      // Opponent winning — sit in, manage the game, waste time
      const contentment = Math.min(2, diff) * urgency;
      attMod   = 1.0 - 0.10 * contentment;   // less interested in extending the lead
      defMod   = 1.0 + 0.14 * contentment;   // much harder to break down
      possBias = -0.04 * contentment;        // happy to give up the ball, sit deep
    }

    return {
      attMod:   Math.max(0.55, Math.min(1.45, attMod)),
      defMod:   Math.max(0.65, Math.min(1.35, defMod)),
      possBias: Math.max(-0.08, Math.min(0.10, possBias)),
    };
  }

  // ─── TEAM STATS (aggregated from players) ────────────────────────────────

  function _teamStats() {
    const pp    = Object.values(_players);
    const tac   = State.get('match.tactics') || State.get('campaign.tactics') || {};
    const form  = tac.formation  || '4-4-2';
    const ment  = tac.mentality  || 'Balanced';

    if (!pp.length) return { att:0.65, mid:0.65, def:0.65, gk:0.65, gkName:'Keeper', gkId:null };

    const byPos = g => pp.filter(pl => pl.p.posG === g);
    const avg   = (arr, fn) => arr.length ? arr.reduce((s,pl) => s + fn(pl), 0) / arr.length : 0.65;

    const gks  = byPos('GK');
    const defs = byPos('DEF');
    const mids = byPos('MID');
    const fwds = byPos('FWD');

    // Formation modifiers [att, mid, def]
    const FM = {
      '4-4-2':   [1.00,1.00,1.00], '4-3-3':   [1.08,0.96,0.96],
      '4-2-3-1': [1.05,1.03,0.97], '3-5-2':   [1.03,1.05,0.94],
      '4-5-1':   [0.90,1.07,1.05], '4-1-4-1': [0.96,1.05,1.03],
      '5-3-2':   [0.95,1.02,1.07], '5-4-1':   [0.88,1.05,1.09],
    };
    const [fA,fM,fD] = FM[form] || [1,1,1];

    // Mentality modifiers [att, mid, def]
    const MM = { 'Attack':[1.12,1.00,0.88], 'Balanced':[1.00,1.00,1.00], 'Defend':[0.88,1.00,1.12] };
    const [mA,mM,mD] = MM[ment] || [1,1,1];

    const gk   = gks[0] || null;
    const gkR  = gk ? gk.handling * 0.5 + gk.positioning * 0.5 : 0.65;

    // Training focus modifiers — applied before clamping. Sharpness from
    // Training.sharpnessBonus() compounds the longer the SAME focus has
    // been run across consecutive matches; switching focus decays it.
    const training = State.get('campaign.trainingFocus') || 'tactics';
    const sharpMult = window.Training ? window.Training.sharpnessBonus(training) : 1.0;
    const trnAttBonus = (training === 'attack'    ? 1.07 : training === 'setpieces' ? 1.03 : 1.0) * sharpMult;
    const trnDefBonus = (training === 'defence'   ? 1.06 : training === 'fitness'   ? 1.02 : 1.0) * sharpMult;
    const trnMidBonus = (training === 'tactics'   ? 1.04 : training === 'fitness'   ? 1.02 : 1.0) * sharpMult;
    const trnFitBonus = (training === 'fitness'   ? 1.05 : 1.0) * sharpMult;  // stamina → workrate scaling

    return {
      att: _clamp(avg(fwds.length ? fwds : pp, pl => (pl.finishing * 0.5 + pl.heading * 0.25 + pl.workrate * 0.25 * trnFitBonus) * _fatigueMult(pl.p.id)) * fA * mA * trnAttBonus, 0.30, 1.0),
      mid: _clamp(avg(mids.length ? mids : pp, pl => (pl.shortPass * 0.35 + pl.longPassing * 0.25 + pl.defending * 0.20 + pl.workrate * 0.20 * trnFitBonus) * _fatigueMult(pl.p.id)) * fM * mM * trnMidBonus, 0.30, 1.0),
      def: _clamp(avg(defs.length ? defs : pp, pl => (pl.defending * 0.50 + pl.heading_def * 0.30 + pl.workrate * 0.20 * trnFitBonus) * _defensiveFatigueMult(pl.p.id)) * fD * mD * trnDefBonus, 0.30, 1.0),
      gk:  _clamp(gkR, 0.30, 1.0),
      // Wide threat (Beckham's cro:19 → high cross score → boost wide attacks)
      // Wide threat scaled by each player's assigned ROLE, not just their
      // slot label — an Inside Forward nominally at LM contributes less
      // to wide crossing threat than a Winger in the same slot, because
      // their actual job is to cut infield rather than deliver crosses.
      crossingL: _clamp(avg(mids.filter(pl => pl.role?.includes('L') || pl.role==='LM' || pl.role==='LW'),
        pl => pl.crossing * ((window.Roles?.ROLES[pl.roleId]?.posBias === 'central') ? 0.55 : 1.0)) || 0.65, 0.30, 1.0),
      crossingR: _clamp(avg(mids.filter(pl => pl.role?.includes('R') || pl.role==='RM' || pl.role==='RW'),
        pl => pl.crossing * ((window.Roles?.ROLES[pl.roleId]?.posBias === 'central') ? 0.55 : 1.0)) || 0.65, 0.30, 1.0),
      // Through ball threat (Scholes pas:16, vis:15 → higher chance of incisive pass)
      throughBall: _clamp(avg(mids.length ? mids : pp, pl => pl.longPassing * 0.6 + pl.shortPass * 0.4), 0.30, 1.0),
      // Set piece quality (Beckham fre:19 → direct free kicks much more dangerous)
      // Boosted when training focus is set pieces
      // Set piece delivery preference (Short/Mixed/Long) — genuinely
      // rewards a squad whose profile suits the chosen approach: Short
      // delivery wants sharp passing/dribbling from midfield, Long wants
      // aerial presence and strength up front. Mixed is the safe,
      // unbiased default. Previously this slider was purely decorative.
      setPieceQ: (() => {
        const base = (avg([...mids,...fwds], pl => pl.crossing * 0.5 + pl.longPassing * 0.3 + pl.finishing * 0.2) || 0.65) * (training === 'setpieces' ? 1.12 * sharpMult : 1.0);
        const spPref = tac.setpieces || 'Mixed';
        let spFit = 1.0;
        if (spPref === 'Short') spFit = avg(mids.length?mids:pp, pl => pl.shortPass * 0.6 + pl.dribbling * 0.4) / 0.65;
        else if (spPref === 'Long') spFit = avg(fwds.length?fwds:pp, pl => pl.heading * 0.6 + pl.strength * 0.4) / 0.65;
        return _clamp(base * _clamp(spFit, 0.85, 1.15), 0.30, 1.0);
      })(),
      gkName: gk ? _shortName(gk.p) : 'Keeper',
      gkId:   gk ? gk.p.id : null,
      // Named lists for commentary
      fwdNames: fwds.map(pl => _shortName(pl.p)),
      midNames: mids.map(pl => _shortName(pl.p)),
      defNames: defs.map(pl => _shortName(pl.p)),
      allNames: pp.map(pl => _shortName(pl.p)),
    };
  }

  // ─── INITIAL STATE ────────────────────────────────────────────────────────

  function _buildState() {
    // Tournament matches can override the opponent via match.oppOverride
    const _ovr = State.get('match.oppOverride') || null;
    const fix  = window.ALL_FIXTURES?.[State.get('campaign.fixtureIdx') || 0] || {};
    const opp  = _ovr?.oppName || (fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam);
    const mgr  = State.get('meta.manager') || 'The Manager';

    // Home advantage: real, but modest — a roaring Wembley crowd helps,
    // it doesn't single-handedly win matches. Neutral tournament venues
    // (most knockout football) and away fixtures get no boost; a small
    // away-specific penalty also applies for genuinely difficult atmospheres
    // (high-stakes away qualifiers/cup ties at a hostile ground).
    const isHomeMatch = _ovr ? !!_ovr.isHome : (fix.homeTeam === 'England');
    const isNeutral   = _ovr ? !!_ovr.neutral : false;
    const isAwayMatch = !isHomeMatch && !isNeutral;

    // Sync match.tactics from campaign.tactics at the start of every match.
    // match.tactics carries hardcoded defaults in State's DEFAULTS object
    // (so it's never actually falsy), which means every "match.tactics ||
    // campaign.tactics" fallback read throughout this engine would
    // silently keep using STALE values from a previous match (or the
    // generic defaults, on the very first match of a session) unless
    // something explicitly overwrote match.tactics first. The match UI
    // does perform this sync correctly before kickoff — but the engine
    // itself shouldn't depend on the UI layer remembering to do that;
    // doing it here too makes correctness self-contained.
    const campaignTac = State.get('campaign.tactics');
    if (campaignTac) State.set('match.tactics', { ...campaignTac });

    State.set('match.score',    {eng:0, opp:0});
    State.set('match.events',   []);
    State.set('match.scorers',  {eng:[], opp:[]});
    State.set('match.injuries', []);
    State.set('match.bookings', {});
    State.set('match.redCards', []);
    State.set('match.subsUsed', 0);
    State.set('match.ratings',  {});
    State.set('match.playerStats', {});
    State.set('match.penalties', null);
    State.set('match.stats', {
      possession:50, shots:{eng:0,opp:0}, shotsOT:{eng:0,opp:0},
      corners:{eng:0,opp:0}, fouls:{eng:0,opp:0},
      yellowCards:{eng:0,opp:0}, xG:{eng:0,opp:0},
    });

    const es = _teamStats();   // will be set properly after _buildPlayers
    let or = _ovr?.oppRating || fix.oppRating || 75;

    // Apply the actual home/away adjustment to the opponent's effective
    // rating for this match — a modest, real swing rather than a token
    // gesture. Playing at Wembley shaves a little off how dangerous the
    // opponent effectively plays; a difficult away atmosphere adds a
    // little back. Capped so it can meaningfully matter against a closely
    // rated side without ever being able to flip a genuine mismatch.
    if (isHomeMatch) or = or * 0.93;
    else if (isAwayMatch) or = or * 1.05;

    // Match dominance: positive = England favoured
    const engOverall = (es.att * 0.30 + es.mid * 0.35 + es.def * 0.25 + es.gk * 0.10) * 100;
    const dominance  = _clamp(engOverall / (engOverall + or) - 0.5, -0.30, 0.30);

    return {
      min: 0, half: 1, active: true,
      poss: 'eng',          // who has the ball
      zone: 'mid_c',        // current zone id
      momentum: 0,          // -5 to +5
      dominance,
      or,                   // opp rating 0-100
      oppName: opp || 'Opponent',
      oppGK: _oppGKName(opp),
      manager: State.get('meta.manager') || 'The Manager',
      redCards: {eng:0, opp:0},
      possCount: {eng:0, opp:0}, // for possession %
      es,                   // team stats object
      isHomeMatch, isAwayMatch, isNeutral,
    };
  }

  // ─── FATIGUE / STAMINA ──────────────────────────────────────────────────
  // Tracks each player's CURRENT stamina (1.0 = fresh, drains toward 0 over
  // 90 minutes) separately from their static attributes — this is state
  // that changes every tick, unlike the derived scores in _buildPlayers()
  // which only get recomputed on subs/tactic changes. A tired player's
  // contribution to team strength genuinely drops as the match wears on,
  // and substituting them restores a fresh body in their slot.
  let _stamina = {}; // { playerId: 0-1 }

  function _resetStamina() {
    _stamina = {};
    // England players start at whatever their persistent campaign fitness
    // actually is RIGHT NOW (recovery-adjusted for real days elapsed
    // since their last match — see campaign_fitness.js), not always a
    // fresh 100% and not the stale snapshot from whenever they last
    // played either. Playing a tired player is a genuine in-match cost,
    // and resting them for a few real days is what actually fixes it.
    Object.values(_players).forEach(pl => {
      const fresh = window.CampaignFitness ? window.CampaignFitness.currentFitness(pl.p.id) : 100;
      _stamina[pl.p.id] = Math.max(0.4, fresh / 100);
    });
    // Opponents always start fresh — this game doesn't model the
    // opposition's own fixture congestion, only England's.
    Object.values(_oppPlayers || {}).forEach(pl => { _stamina[pl.p.id] = 1.0; });
  }

  // ─── LIVE POSITIONAL LAYER ──────────────────────────────────────────────
  // Purely visual — see js/engine/positions.js for the full rationale.
  // _posTracker holds the running (x,y) for all 22 players; _engSlotIdxById
  // lets the tracker map an England player id back to their formation
  // slot index (needed to find their "home" position).

  let _posTracker = null;
  let _engSlotIdxById = {};

  function _initPositions() {
    if (!window.PositionEngine) return;
    const tac = State.get('match.tactics') || State.get('campaign.tactics') || {};
    const formation = tac.formation || '4-4-2';
    const roleAssignments = tac.roles || {};

    const slots = (State.get('squad.slots') || []).filter(Boolean);
    _engSlotIdxById = {};
    const engList = slots.map((p, idx) => { _engSlotIdxById[p.id] = idx; return { id: p.id, slotIdx: idx, pl: p }; });

    const oppList = Object.values(_oppPlayers || {}).map(pl => ({ id: pl.p.id, posG: pl.p.posG, pace: pl.pace }));

    _posTracker = window.PositionEngine.createTracker();
    _posTracker.init(engList, oppList, formation, roleAssignments, null);
  }

  // Reusable attribute-weighted picker for pass-sequence waypoints — biases
  // toward whichever candidate's position group actually suits the
  // waypoint's location on the pitch (defenders for deep waypoints,
  // attackers for advanced ones), so a back-to-front move doesn't show a
  // centre-back finishing the sequence in the opponent's box.
  function _pickPassWaypoint(candidates, waypoint, side) {
    if (!candidates.length) return null;
    const pp = side === 'eng' ? _players : _oppPlayers;
    const scored = candidates.map(c => {
      const pl = pp[c.id];
      const posG = pl?.p?.posG || c.posG || 'MID';
      // How well does this player's natural position suit the waypoint's
      // vertical location? y near 1 = deep (defenders fit), y near 0 =
      // advanced (forwards fit), middle = midfielders.
      const wpDepth = side === 'eng' ? waypoint.y : 1 - waypoint.y; // normalise so 1=deep,0=advanced regardless of side
      let fit = 1.0;
      if (posG === 'DEF') fit = 1.0 - Math.abs(wpDepth - 0.8);
      else if (posG === 'MID') fit = 1.0 - Math.abs(wpDepth - 0.5);
      else if (posG === 'FWD') fit = 1.0 - Math.abs(wpDepth - 0.2);
      else fit = 0.5; // GK rarely a mid-sequence passer
      const rat = (pl?.p?.rat || 70) / 100;
      return { c, weight: Math.max(0.05, fit) * (0.6 + rat * 0.4) };
    });
    const total = scored.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    for (const s of scored) { r -= s.weight; if (r <= 0) return s.c; }
    return scored[scored.length - 1].c;
  }

  // Drain rate per minute, scaled by the player's own stamina attribute
  // (high `sta` players tire more slowly) and by how demanding the
  // current tactical setup is — high press and fast tempo cost more
  // energy than sitting deep and slowing the game down.
  function _drainStamina() {
    const tac = State.get('match.tactics') || State.get('campaign.tactics') || {};
    const press = tac.press || 'Mid';
    const tempo = tac.tempo || 'Normal';
    const pressMult = { None:0.55, Low:0.75, Mid:1.0, High:1.25, Intense:1.5 }[press] ?? 1.0;
    const tempoMult = { Slow:0.8, Normal:1.0, Fast:1.2 }[tempo] ?? 1.0;
    const demandMult = pressMult * tempoMult;

    Object.values(_players).forEach(pl => {
      const id = pl.p.id;
      if (_stamina[id] === undefined) _stamina[id] = 1.0;
      // GKs barely tire physically relative to outfield players covering
      // ground; everyone else drains based on their own stamina attribute
      // (attrs.sta, 1-20 scale) — a 20-stamina player drains roughly half
      // as fast as an 8-stamina one.
      const staAttr = (pl.attrs?.sta || 12) / 20; // 0-1
      const baseDrainPerMin = pl.p.posG === 'GK' ? 0.0015 : 0.0055;
      const drain = baseDrainPerMin * demandMult * (1.4 - staAttr); // higher sta = lower multiplier
      _stamina[id] = Math.max(0.25, _stamina[id] - drain);
    });
  }

  // The actual in-match performance penalty from accumulated tiredness.
  // Capped so a fully fatigued player is meaningfully worse, not
  // unplayable — real footballers slow down and make more errors late on,
  // they don't become incapable of kicking the ball.
  function _fatigueMult(playerId) {
    const st = _stamina[playerId];
    if (st === undefined) return 1.0;
    // st=1.0 -> mult=1.0, st=0.25 (fully gassed) -> mult≈0.78
    return 0.7 + st * 0.3;
  }

  // Defensive concentration fades FASTER than general output as players
  // tire — this is what actually produces football's well-known late-goal
  // bias. A tired striker still has the instinct to finish a half-chance;
  // a tired defender loses positional discipline and switches off for a
  // run or a far-post header. Applying the same flat multiplier to both
  // sides (as _fatigueMult does generally) cancels out in the attack-vs-
  // defense ratio that actually drives goal probability — this steeper
  // variant, used specifically for defensive scores, is what restores the
  // real-world pattern of more goals conceded in the final 20 minutes.
  function _defensiveFatigueMult(playerId) {
    const st = _stamina[playerId];
    if (st === undefined) return 1.0;
    // st=1.0 -> mult=1.0, st=0.25 (fully gassed) -> mult≈0.55 — a much
    // sharper drop-off than the general 0.78 floor.
    return 0.5 + st * 0.5;
  }

  function getStamina(playerId) { return _stamina[playerId] ?? 1.0; }

  function _rebuildStats() {
    _state.es = _teamStats();
    const or = _state.or;
    const es = _state.es;
    const engOverall = (es.att * 0.30 + es.mid * 0.35 + es.def * 0.25 + es.gk * 0.10) * 100;
    _state.dominance = _clamp(engOverall / (engOverall + or) - 0.5, -0.30, 0.30);
  }

  // ─── TICK ─────────────────────────────────────────────────────────────────

  let _ffActive = false; // fast-forward mode — skip remaining match instantly

  function _tick() {
    if (!_state.active) return;
    _state.min++;

    if (_state.min === 46 && _state.half === 1) {
      // Half time happened at 45, this is second half kick-off
    }
    if (_state.min === 45 && _state.half === 1) {
      if (_ffActive) { _runSecondHalf(); return; } // skip overlay during fast-forward
      _doHalfTime(); return;
    }
    // Normal full-time at 90 minutes; if extra time has already been
    // triggered (knockout match still level), play on to 120 instead.
    const fullTimeMark = _state.extraTimePlayed ? 120 : 90;
    if (_state.min > fullTimeMark) {
      _doFullTime(); return;
    }

    // Contextual commentary every 5 mins
    if (_state.min % 10 === 0) _doContextComm();

    // Fatigue: drain stamina every minute, refresh team strength every 5
    // minutes so tiredness actually feeds into the live simulation rather
    // than only mattering retroactively in post-match stats.
    _drainStamina();
    if (_state.min % 5 === 0) _rebuildStats();

    _doStep();

    if (!_ffActive) {
      _emit('tick', {
        minute: _state.min,
        score:  State.get('match.score'),
        poss:   _calcPoss(),
        zone:   ZONE[_state.zone],
      });
    }

    if (_ffActive) {
      _tick(); // recurse immediately, no delay
    } else {
      const speed = State.get('meta.settings.matchSpeed') || 400;
      _tickTimer = setTimeout(_tick, speed);
    }
  }

  function skipToEnd() {
    if (!_state || !_state.active) return;
    if (_tickTimer) { clearTimeout(_tickTimer); _tickTimer = null; }
    _ffActive = true;
    _htPaused = false; // never pause for half-time overlay during fast-forward
    _tick();
  }

  function _doStep() {
    const s   = _state;
    const prev= s.zone;

    // 1. Determine possession this tick
    _updatePoss();

    // 2. Move ball
    s.zone = _nextZone(prev, s.poss);
    const zone = ZONE[s.zone];

    // 3. Update momentum
    _updateMomentum(zone);

    // 4. Generate event
    const evt = _zoneEvent(zone, ZONE[prev]);
    if (evt) _processEvent(evt, zone, ZONE[prev]);

    // 5. Track possession
    s.possCount[s.poss]++;

    // 5b. Real dribble-attempt tracking — deliberately OUTSIDE the
    // fast-forward gate below, since most real matches get skipped
    // ahead rather than watched tick-by-tick, and ms.dribbles needs to
    // actually populate for the majority of real play, not just the
    // rare match someone watches at normal speed. Picks a plausible
    // on-the-ball England player (attribute-weighted toward attacking
    // positions, matching how the rest of the engine already favours
    // forwards/midfielders for on-the-ball moments) and rolls a real
    // dribble attempt chance from their actual dribbling attribute.
    if (s.poss === 'eng') {
      const carrier = _pickActor('chance_big', zone, ZONE[prev]);
      if (carrier) {
        const dribbleChance = _clamp((carrier.dribbling ?? 0.5) * 0.18, 0.04, 0.16);
        if (Math.random() < dribbleChance) carrier.ms.dribbles++;
      }
    }

    // 6. Live positional layer — purely visual, built on top of the zone
    // the simulation already decided on above. Skipped entirely during
    // fast-forward for the same reason the 'tick' event is: nothing is
    // rendering it, so generating pass sequences and drifting 22 players'
    // positions on every one of potentially 90 instantly-recursed ticks
    // would be pure wasted work.
    if (!_ffActive) {
      let passSequence = null;
      if (_posTracker && window.PositionEngine) {
        const fromXY = { x: ZONE[prev]?.x ?? 0.5, y: ZONE[prev]?.y ?? 0.5 };
        const toXY   = { x: zone.x, y: zone.y };
        const candidatePool = s.poss === 'eng'
          ? Object.values(_players).map(pl => ({ id: pl.p.id, name: pl.p.name }))
          : Object.values(_oppPlayers).map(pl => ({ id: pl.p.id, name: pl.p.name, posG: pl.p.posG }));
        passSequence = window.PositionEngine.buildPassSequence(
          s.poss, fromXY, toXY, candidatePool,
          (pool, waypoint) => _pickPassWaypoint(pool, waypoint, s.poss)
        );
        // Snap the ball carrier's tracked position to each waypoint as the
        // sequence resolves, then let everyone else drift toward the final
        // location — the renderer animates the hops, the engine just needs
        // the end state settled before the next tick.
        passSequence.forEach(hop => { if (hop.playerId) _posTracker.snapTo(hop.playerId, hop.x, hop.y); });
        _posTracker.driftTick(toXY.x, toXY.y, _engSlotIdxById, _stamina);
      }

      // 6b. Routine build-up commentary — fills the long gaps between
      // discrete events (shots, fouls, cards) with a line describing
      // what's ACTUALLY happening this tick, using the real pass
      // sequence's named players rather than a generic placeholder.
      // Only fires when nothing more eventful already happened (evt is
      // null) so it never competes with a shot/goal/card's own line,
      // and only some of the time even then — constant scrolling text
      // for literally every tick would be noise, not commentary.
      if (!evt && passSequence && Math.random() < 0.45) {
        const lastHop = passSequence[passSequence.length - 1];
        const firstHop = passSequence[0];
        const side = zone.col === 0 ? 'left' : zone.col === 2 ? 'right' : 'central';
        const hasRealCombo = firstHop?.playerName && lastHop?.playerName && firstHop.playerName !== lastHop.playerName;
        // Use the dedicated two-player combo pool roughly a third of the
        // time a genuine sequence exists — keeps it feeling like a nice
        // touch rather than the dominant phrasing every single tick.
        const useCombo = s.poss === 'eng' && hasRealCombo && Math.random() < 0.35;
        const buildCat = useCombo ? 'build_eng_combo' : (s.poss === 'eng' ? 'build_eng' : 'build_opp');
        const tokens = {
          name: lastHop?.playerName ? _shortName({name: lastHop.playerName}) : '',
          fromName: hasRealCombo ? _shortName({name: firstHop.playerName}) : '',
          oppPlayer: lastHop?.playerName ? _shortName({name: lastHop.playerName}) : '',
          opp: _state.oppName, col: side, side,
        };
        const text = _pick(buildCat, tokens);
        _emit('event', { type:'build', minute:s.min, text, icon: s.poss==='eng'?'⚽':'🔵', side:s.poss, zone, quiet:true });
      }

      // positions of all 22 players, not just the zone label.
      _emit('ball', {
        minute: s.min, zone, poss: s.poss, momentum: s.momentum,
        passSequence,
        positions: _posTracker ? _posTracker.getAll() : null,
      });
    }
  }

  // ─── POSSESSION ───────────────────────────────────────────────────────────

  function _updatePoss() {
    const s  = _state;
    const es = s.es;
    const or = s.or / 100;

    // Bias toward England: better midfield = more possession
    // Zone position: ball in opp half → likely England had it already
    const zoneRow   = ZONE[s.zone]?.row || 3;
    const zoneBias  = (zoneRow / 6 - 0.5) * 0.25;   // -0.125 to +0.125
    const midBias   = (es.mid - or) * 0.30;
    const domBias   = s.dominance * 0.25;
    const momBias   = s.momentum  * 0.04;

    // Mentality affects possession: Attack = press higher = more ball in opp half
    const tac2  = State.get('match.tactics') || State.get('campaign.tactics') || {};
    const ment2 = tac2.mentality || 'Balanced';
    const press = tac2.press || 'Mid';
    const mentBias = ment2 === 'Attack' ? 0.10 : ment2 === 'Defend' ? -0.10 : 0;
    // Press affects possession: High press wins ball higher up the pitch
    const pressBias = press === 'High' ? 0.06 : press === 'Low' ? -0.06 : 0;
    // Difficulty affects how much England dominate possession vs weak sides
    const _diffD = State.get('meta.difficulty') || 'Professional';
    const diffPosBias = _diffD === 'World Class' ? -0.10 : _diffD === 'International' ? -0.05 : _diffD === 'Amateur' ? 0.06 : 0;
    // Opponent scoreline reaction: losing late = commits players forward, contests
    // possession harder (England's share drops slightly); winning late = sits back,
    // happy to concede possession in unthreatening areas (England's share rises)
    const oppReactBias = -_oppScorelineMod().possBias;
    // Home advantage: a supportive crowd translates to a small, real edge
    // in winning the ball back and dictating tempo — not a swing big
    // enough to carry a weaker side, but enough to matter in a close game.
    const homeBias = s.isHomeMatch ? 0.03 : s.isAwayMatch ? -0.02 : 0;
    const engProb = _clamp(0.5 + zoneBias + midBias + domBias + momBias + mentBias + pressBias + diffPosBias + oppReactBias + homeBias, 0.20, 0.80);
    s.poss = Math.random() < engProb ? 'eng' : 'opp';
  }

  // ─── BALL MOVEMENT ────────────────────────────────────────────────────────

  function _nextZone(fromId, poss) {
    const transitions = T[fromId];
    if (!transitions) return 'mid_c';

    // Tunover check — can possession flip mid-movement?
    const es = _state.es;
    const or = _state.or / 100;
    const turnProb = poss === 'eng'
      ? _clamp(0.20 + or * 0.08 - es.mid * 0.10 - _state.momentum * 0.025, 0.08, 0.45)
      : _clamp(0.28 + es.mid * 0.10 - or * 0.08 + _state.momentum * 0.025, 0.10, 0.50);

    let activePoss = poss;
    if (Math.random() < turnProb) {
      activePoss = poss === 'eng' ? 'opp' : 'eng';
      _state.poss = activePoss;
    }

    // Formation shapes which column the ball goes to
    // e.g. 4-3-3 pushes more wide; 4-5-1 keeps it central
    let opts = transitions[activePoss] || transitions.eng;
    opts = _applyFormationBias(opts, activePoss);

    return _wPick(opts);
  }

  function _applyFormationBias(opts, poss) {
    if (poss !== 'eng') return _applyOppStyleBias(opts);
    const tac  = State.get('match.tactics') || State.get('campaign.tactics') || {};
    const form = tac.formation || '4-4-2';
    const ment = tac.mentality || 'Balanced';
    const width  = tac.width          || 'Normal';
    const tempo  = tac.tempo          || 'Normal';
    const defLine= tac.defensive_line || 'Normal';
    const transition = tac.transition || 'Counter';

    // Formation shapes the ball's preferred path
    // 4-3-3 / 4-2-3-1: more wide play, more att_l / att_r
    // 4-5-1 / 4-1-4-1: more central
    // Attack mentality: ball shifts forward faster

    const wideBoost   = form === '4-3-3' || form === '4-2-3-1' ? 1.5 : 1.0;
    const centBoost   = form === '4-5-1' || form === '4-1-4-1' ? 1.5 : 1.0;
    const attackBoost = ment === 'Attack' ? 1.6 : ment === 'Defend' ? 0.5 : 1.0;
    const defendBoost = ment === 'Defend' ? 1.8 : ment === 'Attack' ? 0.6 : 1.0;

    // Width setting: Wide pushes ball to flanks, Narrow keeps it central
    const widthWideBoost   = width === 'Wide'    ? 1.4 : width === 'Narrow' ? 0.7  : 1.0;
    const widthCentBoost   = width === 'Narrow'  ? 1.4 : width === 'Wide'   ? 0.75 : 1.0;
    // Tempo: Fast pushes ball forward more aggressively
    const tempoFwdBoost    = tempo === 'Fast'    ? 1.3 : tempo === 'Slow'   ? 0.8  : 1.0;
    // Transition style: Direct plays it forward fastest after winning the
    // ball, Counter is the balanced default, Build Up deliberately holds
    // possession through midfield before committing forward — a real
    // mechanical difference, not just a label, layered on top of tempo.
    const transitionFwdBoost = transition === 'Direct' ? 1.25 : transition === 'Build Up' ? 0.80 : 1.0;
    const transitionCentBoost = transition === 'Build Up' ? 1.25 : 1.0;
    // Defensive line: High line pushes the block up; Deep drops it
    const lineHighBoost    = defLine === 'High'  ? 1.5 : defLine === 'Deep' ? 0.7  : 1.0;  // fwd zones
    const lineDeepBoost    = defLine === 'Deep'  ? 1.5 : defLine === 'High' ? 0.7  : 1.0;  // def zones

    return opts.map(([id, w]) => {
      let nw = w;
      const z = ZONE[id];
      if (!z) return [id, w];
      if ((z.col === 0 || z.col === 2) && z.row >= 3) nw *= wideBoost * widthWideBoost;
      if (z.col === 1 && z.row >= 3) nw *= centBoost * widthCentBoost * transitionCentBoost;
      if (z.row >= 4) nw *= attackBoost * tempoFwdBoost * lineHighBoost * transitionFwdBoost;
      if (z.row <= 2) nw *= defendBoost * lineDeepBoost;
      return [id, nw];
    });
  }

  // Mirrors _applyFormationBias above, but for the OPPONENT's possession,
  // driven by their tactical identity (window.OppStyles) rather than a
  // player-configured setting. This is what makes a high-press, fast side
  // like Germany actually commit the ball forward quickly when they have
  // it, while a deep, patient side like Italy holds it and probes rather
  // than rushing — a visible behavioural difference, not just a different
  // flat rating number.
  function _applyOppStyleBias(opts) {
    const style = window.OppStyles ? window.OppStyles.getStyle(_state.oppName, _state.or) : null;
    if (!style) return opts;
    const press = style.press || 'Mid';
    const tempo = style.tempo || 'Normal';
    const ment  = style.mentality || 'Balanced';

    const attackBoost   = ment === 'Attack' ? 1.4 : ment === 'Defend' ? 0.65 : 1.0;
    const defendBoost    = ment === 'Defend' ? 1.5 : ment === 'Attack' ? 0.75 : 1.0;
    const tempoFwdBoost  = tempo === 'Fast'  ? 1.25 : tempo === 'Slow' ? 0.82 : 1.0;
    // High press sides commit forward faster once they win it back; low
    // press/deep sides are content to keep things compact behind the ball.
    const pressFwdBoost  = press === 'High' ? 1.15 : press === 'Low' ? 0.88 : 1.0;

    return opts.map(([id, w]) => {
      let nw = w;
      const z = ZONE[id];
      if (!z) return [id, w];
      if (z.row >= 4) nw *= attackBoost * tempoFwdBoost * pressFwdBoost;
      if (z.row <= 2) nw *= defendBoost;
      return [id, nw];
    });
  }

  // ─── MOMENTUM ─────────────────────────────────────────────────────────────

  function _updateMomentum(zone) {
    _state.momentum *= 0.93;
    if (_state.poss === 'eng' && zone.row >= 4) _state.momentum += 0.35;
    if (_state.poss === 'opp' && zone.row <= 2) _state.momentum -= 0.35;
    _state.momentum = _clamp(_state.momentum, -5, 5);
  }

  // ─── ZONE EVENTS ──────────────────────────────────────────────────────────

  // Single shared goal-probability formula used by BOTH sides — this is
  // what guarantees England and the opponent are held to the literal
  // same standard. Previously each side had its own independently-tuned
  // formula (England's at row 6, the opponent's at row 1), and across
  // several sessions of separate tuning they drifted into a genuine
  // structural asymmetry: different base coefficients, one side using a
  // flat opponent-rating proxy for goalkeeper resistance while the other
  // used the real goalkeeper score, and only one side's exponent curve.
  // Confirmed directly against a real, evenly-matched fixture (England
  // home vs Denmath, rating 78, dominance a near-coinflip 0.0045): the
  // old formulas produced a 2.9x scoring-rate gap with nothing to do
  // with either side's actual quality. This function takes the same
  // shape of inputs from both call sites so that can't happen again.
  //
  //   attackScore   — the attacking side's att-derived score (0.2-1.0)
  //   bestFinisher  — their best available finisher's finishing score
  //   oppDefScore   — the defending side's relevant defensive comparator
  //                   (attacking side's es.att vs opp keeper score, OR
  //                   opponent's os.att vs England's keeper score)
  //   keeperScore   — the DEFENDING side's actual goalkeeper score
  //   baseCoef      — overall scale for this formula (kept distinct per
  //                   side only because the surrounding event-probability
  //                   budget for each side's row differs slightly, NOT
  //                   because either side deserves an inherent edge)
  function _goalProbability(attackScore, bestFinisher, qualityGap, keeperScore, baseCoef) {
    const finBoost = _clamp(0.70 + bestFinisher * 0.60, 0.65, 1.35);
    const qGap = _clamp(qualityGap, 0.55, 1.60);
    return baseCoef * attackScore * qGap * finBoost * (1 - keeperScore * 0.35);
  }

  function _zoneEvent(zone, prevZone) {
    const r   = Math.random();
    const row = zone.row;
    const col = zone.col;
    const eng = _state.poss === 'eng';
    const es  = _state.es;
    const or  = _state.or / 100;
    const _zt = State.get('match.tactics') || State.get('campaign.tactics') || {};
    const press  = _zt.press          || 'Mid';
    const tempo  = _zt.tempo          || 'Normal';
    const defLine= _zt.defensive_line || 'Normal';

    // Row 0-1: England's defensive third
    if (row <= 1) {
      if (eng) {
        if (r < 0.04) return 'foul_opp';
        if (r < 0.08) return 'clearance';
        if (r < 0.11) return 'tackle';
        return null;
      } else {
        if (r < 0.09) return 'clearance';
        if (r < 0.17) return 'save_routine';
        if (r < 0.22) return 'save_great';
        if (r < 0.27) return 'corner_opp';
        if (r < 0.30) return 'foul_eng';
        // Opp shot — tracked in processEvent
        if (r < 0.36) return 'shot_opp';
        // Opp goal — scales with opp quality vs England def+gk
        // Use real opp stats (os.att) when available
        const _osm   = _oppScorelineMod();
        const osAtt  = (_state.os ? _state.os.att : or) * _osm.attMod;
        const oppGap = osAtt / Math.max(es.def, 0.5);
        // Difficulty modifier: World Class boosts opp, Amateur reduces
        const _diff  = State.get('meta.difficulty') || 'Professional';
        const diffMod = _diff === 'World Class' ? 1.55 : _diff === 'International' ? 1.28 : _diff === 'Amateur' ? 0.65 : 1.0;
        // High defensive line = more opp chances (caught on counter)
        const lineMod = defLine === 'High' ? 1.15 : defLine === 'Deep' ? 0.88 : 1.0;
        const oppBestFin = Math.max(...Object.values(_oppPlayers).filter(pl=>pl.p.posG==='FWD'||pl.p.posG==='MID').map(pl=>pl.finishing), 0.5);
        const gProb = _goalProbability(osAtt, oppBestFin, oppGap, es.gk, 0.14) * diffMod * lineMod;
        if (r < 0.36 + gProb) return Math.random() < 0.65 ? 'goal_opp_foot' : 'goal_opp_header';
        return null;
      }
    }

    // Row 2-3: Midfield
    if (row <= 3) {
      // High press = more tackles/fouls, more interceptions, slightly more injury risk
      const pressM = press === 'High' ? 1.5 : press === 'Low' ? 0.6 : 1.0;
      if (r < 0.015 * pressM) return 'injury';
      if (r < (0.015 + 0.040) * pressM) return eng ? 'foul_opp' : 'foul_eng';
      if (r < (0.055 + 0.030) * pressM) return 'tackle';
      if (r < 0.105) return eng ? 'pass_forward' : 'build_opp';
      if (r < 0.115) return eng ? 'booking_opp'  : 'booking_eng';
      return null;
    }

    // Row 4: Opponent midfield
    if (row === 4) {
      if (eng) {
        // Crossing boost from wide mids with high cro attribute
        const crossBoost = col === 0 ? es.crossingL : col === 2 ? es.crossingR : 0.5;
        if (r < 0.10 * crossBoost) return col === 0 ? 'cross_l' : col === 2 ? 'cross_r' : 'pass_forward';
        if (r < 0.14) return 'foul_opp';
        if (r < 0.16 * es.att) return 'shot_off';  // speculative shot from range
      } else {
        if (r < 0.05) return 'tackle';
        if (r < 0.09) return 'foul_eng';
      }
      return null;
    }

    // Row 5: Attacking third
    if (row === 5) {
      if (eng) {
        const crossBoost = col === 0 ? es.crossingL * 1.3 : col === 2 ? es.crossingR * 1.3 : 0.5;
        if (r < 0.14 * crossBoost) return col === 0 ? 'cross_l' : col === 2 ? 'cross_r' : 'pass_forward';
        if (r < 0.18) return 'freekick_eng';
        if (r < 0.22) return 'shot_off';
        if (r < 0.26) return 'shot_on';
        if (r < 0.29) return 'corner_eng';
        if (r < 0.31) return 'foul_opp';
        // Long-range goal: boosted by through-ball and finishing quality
        if (r < 0.31 + 0.06 * es.att * es.throughBall) return 'goal_eng_foot';
      } else {
        if (r < 0.05) return 'tackle';
        if (r < 0.09) return 'clearance';
        if (r < 0.12) return 'foul_eng';
      }
      return null;
    }

    // Row 6: Penalty box — highest event density
    if (row === 6) {
      if (eng) {
        const attB = es.att;
        // Suppression from the keeper England is actually facing — was
        // previously derived from the flat opponent OVERALL rating
        // (or*0.8) rather than their real goalkeeper score, while the
        // mirrored opponent-scoring formula (row 1, "else" branch above)
        // always used England's actual es.gk directly. Since goalkeeper
        // scores commonly run high (0.85-0.95) regardless of overall
        // team rating, that meant England's own scoring was suppressed
        // far less than the opponent's equivalent chance even when both
        // keepers were genuinely similar quality — confirmed directly:
        // es.gk and os.gk were 0.908 vs 0.913 (essentially identical)
        // for a real Denmark fixture, yet defR (0.580) was nowhere near
        // as suppressive as es.gk (0.908), producing roughly a 3x
        // scoring-rate gap that had nothing to do with finishing at all.
        const defR = _state.os ? _state.os.gk : or * 0.8;

        // Best finisher in XI boosts goal probability (Shearer fin:20 >> Batty fin:6)
        const bestFin  = Math.max(...Object.values(_players).filter(pl=>pl.p.posG==='FWD'||pl.p.posG==='MID').map(pl=>pl.finishing), 0.5);
        // Formation att modifier scales how often great finishers get chances
        const tac3   = State.get('match.tactics') || State.get('campaign.tactics') || {};
        const fMods  = {'4-4-2':1.00,'4-3-3':1.08,'4-2-3-1':1.05,'3-5-2':1.03,'4-5-1':0.90,'4-1-4-1':0.96,'5-3-2':0.95,'5-4-1':0.88};
        const attMod3 = fMods[tac3.formation||'4-4-2'] || 1.0;

        if (r < 0.22 * attB) return 'shot_on';
        if (r < 0.30 * attB) return 'shot_off';
        if (r < 0.32 * attB) return 'chance_big';
        if (r < 0.34)        return 'corner_eng';
        if (r < 0.36)        return 'freekick_eng';

        // Goal probability — routed through the SAME shared function the
        // opponent's formula uses (see _goalProbability above), with
        // England's own extra modifiers (formation finishing-chance
        // scaling, difficulty, high-stakes endgame push) applied as
        // separate multipliers afterward — exactly the same pattern as
        // the opponent's diffMod/lineMod, so neither side's "extra"
        // modifiers are baked into the shared base unevenly.
        const highStakes = or > 0.80 ? 1.12 : 1.0;
        const _diff2  = State.get('meta.difficulty') || 'Professional';
        const diffEngMod = _diff2 === 'World Class' ? 0.72 : _diff2 === 'International' ? 0.87 : _diff2 === 'Amateur' ? 1.18 : 1.0;
        const oppDefForGap = _state.os ? _state.os.def : or;
        const qGap = (es.att / Math.max(oppDefForGap, 0.45)) * highStakes;
        const fromWide = prevZone && (prevZone.col === 0 || prevZone.col === 2) && prevZone.row >= 4;
        const goalProb = _goalProbability(attB, bestFin, qGap, defR, 0.14) * attMod3 * diffEngMod;

        if (r < 0.36 + goalProb) {
          if (fromWide && Math.random() < 0.55) return 'goal_eng_header';
          const types = ['goal_eng_foot','goal_eng_foot','goal_eng_foot','goal_eng_free'];
          // Free kick more likely from a set piece position
          if (prevZone?.id?.includes('att')) types.push('goal_eng_foot');
          return types[Math.floor(Math.random() * types.length)];
        }
      } else {
        const _osm2 = _oppScorelineMod();
        const osG = (_state.os ? _state.os.att : or) * _osm2.attMod;
        if (r < 0.11 * osG) return 'save_great';
        if (r < 0.17 * osG) return 'save_routine';
        if (r < 0.19)      return 'clearance';
        const osAtt6 = (_state.os ? _state.os.att : or) * _osm2.attMod;
        const gP = 0.11 * Math.pow(osAtt6, 1.20) * (1 - es.def * 0.42 * _osm2.defMod) * (1 - es.gk * 0.35);
        if (r < 0.19 + gP) return Math.random() < 0.65 ? 'goal_opp_foot' : 'goal_opp_header';
      }
      return null;
    }

    return null;
  }

  // ─── OPP ACTOR SELECTION ─────────────────────────────────────────────────

  function _pickOppActor(type) {
    const pp = Object.values(_oppPlayers);
    if (!pp.length) return null;
    let pool, weightFn;
    if (type === 'goal_opp_foot') {
      pool = pp.filter(pl => pl.p.posG === 'FWD' || pl.p.posG === 'MID');
      weightFn = pl => pl.finishing * 2.0 + pl.rat * 0.5;
    } else if (type === 'goal_opp_header') {
      pool = pp.filter(pl => pl.p.posG === 'FWD' || pl.p.posG === 'DEF');
      weightFn = pl => pl.heading * 2.5;
    } else if (type === 'save_great' || type === 'save_routine') {
      pool = pp.filter(pl => pl.p.posG === 'GK');
      weightFn = pl => pl.handling;
    } else {
      pool = pp.filter(pl => pl.p.posG === 'MID' || pl.p.posG === 'FWD');
      weightFn = pl => pl.rat;
    }
    if (!pool.length) pool = pp;
    return _wPickObj(pool, weightFn);
  }

  // ─── EVENT PROCESSING ────────────────────────────────────────────────────

  function _processEvent(type, zone, prevZone) {
    const s   = _state;
    const es  = s.es;
    const col = ['left','centre','right'][zone.col];
    const side= col;

    // Pick player contextually (using actual attributes)
    const actor = _pickActor(type, zone, prevZone);
    const name  = actor ? _shortName(actor.p) : 'England';

    // Determine side first so tokens can reference it
    const _oppEventTypes = new Set(['goal_opp_foot','goal_opp_header','build_opp','corner_opp',
      'foul_eng','booking_eng','redcard_eng','save_great','save_routine','shot_opp',
      'sub_opp','booking_opp','redcard_opp','freekick_opp']);
    let evtSide = _oppEventTypes.has(type) ? 'opp' : 'eng';
    let icon    = '⚽';

    // Real opp player name for commentary tokens
    const _oppAct = evtSide === 'opp' ? _pickOppActor(type) : null;
    const _oppPN  = _oppAct ? _oppAct.p.name.split(' ').pop() : s.oppName;
    const _ossT   = _state.os || {};
    const tokens  = { name, gk: es.gkName, opp: s.oppName,
                      oppPlayer: _oppPN, oppGk: _ossT.gkName || s.oppGK,
                      min: s.min, col, side, manager: s.manager || 'The Manager' };
    const comm    = _pick(type, tokens);

    // Update player match stats
    if (actor) _applyMatchStat(actor, type);
    // GK stats on saves
    if ((type === 'save_great' || type === 'save_routine') && es.gkId) {
      const gkPl = _players[es.gkId];
      if (gkPl) { gkPl.ms.saves++; }
    }

    switch (type) {
      // ── ENGLAND GOALS ────────────────────────────────────────────────────
      case 'goal_eng_foot':
      case 'goal_eng_header':
      case 'goal_eng_free':
      case 'goal_eng_pen': {
        _scoreGoal('eng');
        _scoreGoalName('eng', name);
        if (actor) { actor.ms.goals++; actor.ms.shots++; actor.ms.shotsOT++; }
        // Assist attribution — a real, attribute-weighted pick of who set
        // up the goal, mirroring the same approach _pickActor already
        // uses for the scorer. Penalties get no assist (there's no
        // buildup pass that leads to a penalty award), and the scorer
        // themselves is excluded so nobody assists their own goal.
        let assister = null;
        if (type !== 'goal_eng_pen') {
          assister = _pickAssister(actor);
          if (assister) assister.ms.assists++;
        }
        icon = '⚽';
        s.momentum += 2.5;
        _emit('goal_eng', { minute: s.min, scorer: name, assister: assister ? _shortName(assister.p) : null, score: State.get('match.score') });
        break;
      }
      // ── OPP GOALS ───────────────────────────────────────────────────────
      case 'goal_opp_foot':
      case 'goal_opp_header': {
        const oppScorer = _pickOppActor(type);
        const oppScorerName = oppScorer ? oppScorer.p.name : s.oppName;
        _scoreGoal('opp');
        // Record opp scorer name for result screen
        const oppScorers = State.get('match.scorers') || {eng:[],opp:[]};
        oppScorers.opp = [...(oppScorers.opp||[]), oppScorerName.split(' ').pop()];
        State.set('match.scorers', oppScorers);
        icon = '🥅'; evtSide = 'opp'; s.momentum -= 2.5;
        _emit('goal_opp', { minute: s.min, scorer: oppScorerName, score: State.get('match.score') });
        break;
      }
      // ── SHOTS ────────────────────────────────────────────────────────────
      case 'shot_on': {
        _addStat('shots','eng'); _addStat('shotsOT','eng');
        { const st=State.get('match.stats')||{}; if(!st.xG) st.xG={eng:0,opp:0}; st.xG.eng=+(st.xG.eng+0.18).toFixed(2); State.set('match.stats',st); }
        icon = '🧤';
        break;
      }
      case 'shot_off': {
        _addStat('shots','eng');
        icon = '↗';
        break;
      }
      case 'shot_opp': {
        _addStat('shots','opp'); _addStat('shotsOT','opp');
        { const st=State.get('match.stats')||{}; if(!st.xG) st.xG={eng:0,opp:0}; st.xG.opp=+(st.xG.opp+0.18).toFixed(2); State.set('match.stats',st); }
        icon = '🧤'; evtSide = 'opp';
        break;
      }
      case 'chance_big':  { _addStat('shots','eng'); icon = '😱'; break; }
      case 'corner_eng':  { _addStat('corners','eng'); icon = '🚩'; break; }
      case 'corner_opp':  { _addStat('corners','opp'); icon = '🚩'; evtSide='opp'; break; }
      case 'foul_eng':    { _addStat('fouls','eng'); icon = '⚠'; break; }
      case 'foul_opp':    { _addStat('fouls','opp'); icon = '⚠'; evtSide='opp'; break; }
      case 'booking_eng': { _bookPlayer(name); _addStat('yellowCards','eng'); icon = '🟨'; break; }
      case 'booking_opp': { _addStat('yellowCards','opp'); icon = '🟨'; evtSide='opp'; break; }
      case 'redcard_eng': { s.redCards.eng++; icon = '🟥'; break; }
      case 'redcard_opp': { s.redCards.opp++; icon = '🟥'; evtSide='opp'; break; }
      case 'injury': {
        icon = '🚑';
        // Record injured player to match.injuries (this gates future-match
        // selection, handled elsewhere) and ALSO take immediate effect on
        // this match — previously an "injured" player kept playing at full
        // effectiveness for the rest of the 90 minutes, which read as a
        // bug (commentary saying someone went down, then they score the
        // winner unaffected ten minutes later).
        if (actor) {
          const injList = State.get('match.injuries') || [];
          if (!injList.some(i => i.id === actor.p.id)) {
            injList.push({ id: actor.p.id, name: actor.p.name, min: s.min });
            State.set('match.injuries', injList);

            const subsUsedNow = State.get('match.subsUsed') || 0;
            const bench = State.get('squad.bench') || [];
            // Prefer a like-for-like positional replacement; fall back to
            // any available bench player rather than leaving the slot
            // unfilled.
            const replacement = bench.find(p => p && p.posG === actor.p.posG) || bench.find(Boolean);

            if (subsUsedNow < 3 && replacement) {
              const subOk = makeSub(actor.p.id, replacement.id);
              if (subOk) {
                _pushEvent('injury_sub', s.min, '🚑',
                  `${_shortName(actor.p)} cannot continue and has to be replaced. A blow for England.`, 'eng');
              }
            } else {
              // No subs left, or no fit bench player — England play on with
              // a player carrying an injury. Track the penalty durably so
              // it survives any later _buildPlayers() rebuild (e.g. a
              // subsequent unrelated substitution), rather than mutating
              // the live player object directly.
              _injuryPenalty[actor.p.id] = 0.55;
              _players = _buildPlayers();
              _state.es = _teamStats();
              _pushEvent('injury_noswap', s.min, '🚑',
                `${_shortName(actor.p)} is struggling but England have no substitutions left. He plays on, clearly hampered.`, 'eng');
            }
          }
        }
        break;
      }
      case 'save_great':
      case 'save_routine':{
        _addStat('shots','opp'); _addStat('shotsOT','opp');
        icon = '🧤'; evtSide='opp'; break;
      }
      case 'clearance':   { icon = '👊'; break; }
      case 'tackle':      { icon = '⚡'; break; }
      default:            { icon = '⚽'; }
    }

    _pushEvent(type, s.min, icon, comm, evtSide, actor?.p?.id);
    _emit('event', { type, minute: s.min, text: comm, icon, side: evtSide, zone });
  }

  // ─── ACTOR SELECTION ─────────────────────────────────────────────────────
  // Picks the most appropriate player for an event using actual attributes.
  // Higher-attribute players appear in relevant events more often.

  // Picks who set up a goal — weighted toward passing/crossing ability,
  // the same attribute-weighted approach _pickActor uses for the scorer
  // itself, but for the player who supplied the final ball. Midfielders
  // and wide players are naturally favoured (their shortPass/crossing
  // scores tend to be higher), matching how real assists distribute, but
  // a creative forward or even a defender starting the move can still
  // come through on the right roll. The scorer is always excluded.
  function _pickAssister(scorer) {
    const pp = Object.values(_players).filter(pl => pl !== scorer);
    if (!pp.length) return null;
    const weightFn = pl => pl.shortPass * 1.4 + pl.crossing * 1.2 + pl.longPassing * 0.6 + (pl.p.rat || 70) * 0.01;
    const weights = pp.map(pl => ({ pl, w: Math.max(0.05, weightFn(pl)) }));
    const total = weights.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    for (const { pl, w } of weights) { r -= w; if (r <= 0) return pl; }
    return weights[weights.length - 1]?.pl || null;
  }

  function _pickActor(type, zone, prevZone) {
    const pp = Object.values(_players);
    if (!pp.length) return null;

    let pool;
    let weightFn;

    switch (type) {
      case 'goal_eng_foot':
      case 'shot_on':
      case 'shot_off':
      case 'chance_big':
        pool = pp.filter(pl => pl.p.posG === 'FWD' || pl.p.posG === 'MID');
        weightFn = pl => pl.finishing * 2.0 + pl.p.rat * 0.5;
        break;
      case 'goal_eng_header':
        pool = pp.filter(pl => pl.p.posG === 'FWD' || pl.p.posG === 'DEF');
        weightFn = pl => pl.heading * 2.5 + pl.strength * 0.5;
        break;
      case 'goal_eng_free':
        pool = pp.filter(pl => pl.p.posG === 'MID' || pl.p.posG === 'FWD');
        weightFn = pl => {
          const freeKick = (pl.attrs.fre || 0) / 20;
          return freeKick * 3.0 + pl.crossing * 1.0;
        };
        break;
      case 'cross_l':
        pool = pp.filter(pl => pl.p.posG === 'MID' && (pl.role?.includes('L') || pl.role==='LM' || pl.role==='LW' || pl.role==='LB'));
        if (!pool.length) pool = pp.filter(pl => pl.p.posG === 'MID');
        weightFn = pl => pl.crossing * 3.0 + pl.pace * 0.5;
        break;
      case 'cross_r':
        pool = pp.filter(pl => pl.p.posG === 'MID' && (pl.role?.includes('R') || pl.role==='RM' || pl.role==='RW' || pl.role==='RB'));
        if (!pool.length) pool = pp.filter(pl => pl.p.posG === 'MID');
        weightFn = pl => pl.crossing * 3.0 + pl.pace * 0.5;
        break;
      case 'pass_forward':
        pool = pp.filter(pl => pl.p.posG === 'MID');
        weightFn = pl => pl.longPassing * 2.0 + pl.shortPass * 1.0;
        break;
      case 'clearance':
        pool = pp.filter(pl => pl.p.posG === 'DEF' || pl.p.posG === 'GK');
        weightFn = pl => pl.heading_def * 2.0 + pl.defending * 1.0;
        break;
      case 'tackle':
        pool = pp.filter(pl => pl.p.posG === 'MID' || pl.p.posG === 'DEF');
        weightFn = pl => pl.defending * 2.5 + pl.workrate * 0.5;
        break;
      case 'booking_eng':
      case 'foul_eng':
        pool = pp.filter(pl => pl.p.posG === 'MID' || pl.p.posG === 'DEF');
        weightFn = pl => (1.5 - pl.defending) + pl.strength * 0.5;
        break;
      case 'freekick_eng':
      case 'corner_eng':
        pool = pp.filter(pl => pl.p.posG === 'MID' || pl.p.posG === 'FWD');
        weightFn = pl => {
          const fk = (pl.attrs.fre || 0) / 20;
          return fk * 2.5 + pl.crossing * 1.5;
        };
        break;
      default:
        pool = pp;
        weightFn = pl => pl.rat;
    }

    if (!pool.length) pool = pp;
    return _wPickObj(pool, weightFn);
  }

  // ─── PLAYER MATCH STATS ───────────────────────────────────────────────────

  function _applyMatchStat(actor, type) {
    const ms = actor.ms;
    ms.touches++;
    switch (type) {
      case 'shot_on':           ms.shots++; ms.shotsOT++; break;
      case 'shot_off':          ms.shots++; break;
      case 'chance_big':        ms.shots++; break;
      case 'cross_l':
      case 'cross_r':           ms.crosses++; ms.keyPasses++; break;
      case 'pass_forward':      ms.keyPasses++; break;
      case 'tackle': {
        // A genuine tackle is a physical challenge; an interception is
        // reading the pass and cutting it out before a duel even
        // happens. The engine only ever generated one event type for
        // both ("tackle"), which meant ms.interceptions was a dead
        // field — always zero on every player's match stats regardless
        // of how the match actually went. Split the same probability
        // mass here rather than adding new branching logic upstream: a
        // player with strong positioning relative to their tackling
        // is more likely to have actually read and cut out the pass.
        const posScore = actor.positioning ?? 0.6;
        const tacScore = actor.defending ?? 0.6;
        const interceptChance = _clamp(0.35 + (posScore - tacScore) * 0.5, 0.15, 0.75);
        if (Math.random() < interceptChance) ms.interceptions++; else ms.tackles++;
        break;
      }
      case 'clearance':         ms.clearances++; break;
      case 'goal_eng_header':   ms.aerialWon++; break;
      case 'foul_eng':          ms.foulsConceded++; break;
      case 'foul_opp':          ms.foulsWon++; break;
    }
  }

  // ─── RATINGS CALCULATION ──────────────────────────────────────────────────
  // Runs at full time. Derives a meaningful 0-10 rating from actual contributions.

  function _calcRatings() {
    const score   = State.get('match.score') || {};
    const diff    = (score.eng||0) - (score.opp||0);
    const teamBase= diff > 0 ? 7.0 : diff === 0 ? 6.5 : 6.0;
    const ratings = {};

    // Iterate everyone who appeared this match (starters + every sub who
    // came on), not just whoever's left in `_players` at the final
    // whistle — a player subbed off (injury or tactical) previously
    // vanished from the report entirely despite genuinely playing part
    // of the match. `_players[id]` covers anyone still on the pitch;
    // `_matchStats[id].snapshot` is the frozen last-known state for
    // anyone who's since been substituted off.
    Object.keys(_matchStats).forEach(id => {
      const actor = _players[id] || _matchStats[id].snapshot;
      if (!actor) return; // shouldn't happen, but don't let a rating crash the compile
      const ms  = actor.ms;
      const p   = actor.p;
      let r     = teamBase;

      if (p.posG === 'GK') {
        r += ms.saves * 0.40;
        r -= (State.get('match.score')?.opp||0) * 0.35;
        r += actor.positioning * 0.3;
      } else if (p.posG === 'DEF') {
        r += ms.clearances     * 0.30;
        r += ms.tackles        * 0.25;
        r += ms.aerialWon      * 0.20;
        r -= ms.foulsConceded  * 0.15;
        r += actor.defending   * 0.5;
      } else if (p.posG === 'MID') {
        r += ms.keyPasses      * 0.30;
        r += ms.crosses        * 0.20;
        r += ms.tackles        * 0.20;
        r += ms.goals          * 1.20;
        r += ms.assists        * 0.80;
        r += actor.shortPass   * 0.3;
        r -= ms.foulsConceded  * 0.15;
      } else if (p.posG === 'FWD') {
        r += ms.goals          * 1.50;
        r += ms.assists        * 0.90;
        r += ms.shots          * 0.15;
        r += ms.shotsOT        * 0.25;
        r += actor.finishing   * 0.4;
      }

      // Small contribution for being on the pitch
      r += ms.touches * 0.005;

      ratings[p.id] = _clamp(Math.round(r * 10) / 10, 4.0, 10.0);
    });

    // Sync player stats for result screen — everyone who appeared gets a
    // real minutes figure (exit minute, or full time if they never came
    // off, minus the minute they actually entered), not a flat 90.
    const finalMinute = _state.min;
    const playerStats = {};
    Object.keys(_matchStats).forEach(id => {
      const rec  = _matchStats[id];
      const exit = rec.exitedAt != null ? rec.exitedAt : finalMinute;
      const mins = Math.max(0, Math.round(exit - rec.enteredAt));
      playerStats[id] = { ...rec.ms, mins };
    });

    State.set('match.ratings', ratings);
    State.set('match.playerStats', playerStats);
  }

  // ─── HALF TIME / FULL TIME ────────────────────────────────────────────────

  let _htPaused = false;

  function _doHalfTime() {
    const s = _state;
    _pushEvent('halftime', 45, '⏱', _pick('halftime', {opp:s.oppName, manager:s.manager||'The Manager'}), 'eng');
    _emit('halftime', { score: State.get('match.score'), state: s });
    // In browser with UI: pause so overlay can show team talk
    // In headless/test: auto-resume second half immediately
    if (typeof window !== 'undefined' && window.MatchUI && document.getElementById('screen-match')) {
      _htPaused = true;
    } else {
      _runSecondHalf();
    }
  }

  function _runSecondHalf() {
    const s = _state;
    s.half = 2;
    s.momentum *= 0.5;   // momentum partially resets at half time
    _pushEvent('secondhalf', 46, '⏱', _pick('secondhalf_start', {opp:s.oppName, manager:s.manager||'The Manager'}), 'eng');
    if (_ffActive) {
      _tick(); // continue fast-forward immediately, no delay
    } else {
      const spd = State.get('meta.settings.matchSpeed') || 400;
      _tickTimer = setTimeout(_tick, spd);
    }
  }

  // ─── PENALTY SHOOTOUT ───────────────────────────────────────────────────
  // Real named takers, one kick at a time, each its own probability roll —
  // not a single weighted coin-flip with an invented scoreline afterward.
  // Returns { eng, opp, engWon, kicks: [{side, name, scored, order, sudden?}] }
  // so the UI can reveal it kick-by-kick instead of just showing the final
  // score.
  function _penTakerScore(pl) {
    // Leadership (existing proxy for temperament/composure) blended with
    // finishing — a composed player who can also actually strike a ball
    // well is who a real manager would put on the list, in that order.
    const composure = pl?.leadership ?? pl?.rat ?? 0.65;
    const finishing = pl?.finishing ?? pl?.rat ?? 0.65;
    return composure * 0.55 + finishing * 0.45;
  }

  function _penAttempt(taker, facingGkSkill) {
    const composure = taker?.leadership ?? taker?.rat ?? 0.65;
    const finishing = taker?.finishing ?? taker?.rat ?? 0.65;
    // 0.78 baseline mirrors real-world penalty conversion rates; composure
    // and finishing nudge it, a strong keeper pulls it back down.
    const chance = _clamp(
      0.78 + (composure - 0.65) * 0.25 + (finishing - 0.65) * 0.15 - ((facingGkSkill ?? 0.6) - 0.6) * 0.3,
      0.45, 0.94
    );
    return Math.random() < chance;
  }

  function _simulatePenaltyShootout() {
    // Only players still on the pitch at full time can take a kick — real
    // football rule, and also means anyone subbed off earlier (or sent
    // off) correctly can't be picked. GK excluded from the taker list
    // unless the outfield count has been reduced below 5 (red cards).
    const onPitch  = Object.values(_players);
    const outfield = onPitch.filter(pl => pl.p.posG !== 'GK');
    const engTakers = (outfield.length >= 5 ? outfield : onPitch)
      .slice().sort((a, b) => _penTakerScore(b) - _penTakerScore(a));

    const oppPool = Object.values(_oppPlayers);
    const oppOutfield = oppPool.filter(pl => pl.p.posG !== 'GK');
    const oppTakers = (oppOutfield.length ? oppOutfield : oppPool)
      .slice().sort((a, b) => (b.rat || 0.65) - (a.rat || 0.65));

    const engGkSkill = _state.es?.gk ?? 0.65;
    const oppGkSkill = _state.os?.gk ?? 0.65;
    const pick = (list, idx) => list.length ? list[idx % list.length] : null;

    const kicks = [];
    let engGoals = 0, oppGoals = 0, engLeft = 5, oppLeft = 5, order = 0;
    const decided = () => engGoals > oppGoals + oppLeft || oppGoals > engGoals + engLeft;

    while ((engLeft > 0 || oppLeft > 0) && !decided()) {
      if (engLeft > 0) {
        const taker = pick(engTakers, 5 - engLeft);
        const scored = _penAttempt(taker, oppGkSkill);
        engLeft--; if (scored) engGoals++;
        kicks.push({ side: 'eng', name: taker ? _shortName(taker.p) : 'England', scored, order: ++order });
        if (decided()) break;
      }
      if (oppLeft > 0) {
        const taker = pick(oppTakers, 5 - oppLeft);
        const scored = _penAttempt(taker, engGkSkill);
        oppLeft--; if (scored) oppGoals++;
        kicks.push({ side: 'opp', name: taker ? _shortName(taker.p) : _state.oppName, scored, order: ++order });
      }
    }

    // Sudden death — one kick each, repeat until someone misses and the
    // other doesn't. The safety cap exists only to bound worst-case
    // iterations; a shootout can never actually end level, so if we
    // somehow exhaust it (astronomically unlikely given the clamped
    // per-kick chance), force a decisive coin-flip rather than silently
    // returning a tied result no real shootout could produce.
    let sudden = 0;
    while (engGoals === oppGoals && sudden < 20) {
      const engTaker = pick(engTakers, 5 + sudden);
      const engScored = _penAttempt(engTaker, oppGkSkill);
      kicks.push({ side: 'eng', name: engTaker ? _shortName(engTaker.p) : 'England', scored: engScored, order: ++order, sudden: true });
      const oppTaker = pick(oppTakers, 5 + sudden);
      const oppScored = _penAttempt(oppTaker, engGkSkill);
      kicks.push({ side: 'opp', name: oppTaker ? _shortName(oppTaker.p) : _state.oppName, scored: oppScored, order: ++order, sudden: true });
      if (engScored) engGoals++;
      if (oppScored) oppGoals++;
      sudden++;
    }
    if (engGoals === oppGoals) {
      if (Math.random() < 0.5) engGoals++; else oppGoals++;
    }

    return { eng: engGoals, opp: oppGoals, engWon: engGoals > oppGoals, kicks };
  }

  function _doFullTime() {
    const score = State.get('match.score') || { eng: 0, opp: 0 };
    const tPhase = State.get('tournament.phase');
    const isKnockout = ['r16','qf','sf','final'].includes(tPhase);
    const isLevel = score.eng === score.opp;

    if (isKnockout && isLevel && !_state.extraTimePlayed) {
      // A draw in a knockout match cannot stand — real football goes to
      // extra time, then penalties if still level. Previously this branch
      // didn't exist at all: a tied knockout match just ended at 90
      // minutes and got incorrectly treated as an England elimination
      // regardless of which side they were actually on.
      _state.extraTimePlayed = true;
      _pushEvent('fulltime', 90, '🏁', `Full time. The scores are level — this one is going to extra time.`, 'eng');
      _state.min = 90; // tick loop will continue from here for 30 more mins
      _state.active = true;
      _emit('extratime', { score });
      // _doFullTime() is called FROM _tick(), which always returns right
      // after — nothing else will schedule the next tick unless we do it
      // here ourselves, exactly like the main tick loop does at the end
      // of every normal minute.
      if (_ffActive) {
        _tick();
      } else {
        const speed = State.get('meta.settings.matchSpeed') || 400;
        _tickTimer = setTimeout(_tick, speed);
      }
      return;
    }

    _state.active = false;
    _pushEvent('fulltime', _state.min, '🏁', _pick('fulltime', {opp:_state.oppName, manager:_state.manager||'The Manager'}), 'eng');
    State.set('match.phase', 'ft');

    // Final possession
    const tot = _state.possCount.eng + _state.possCount.opp || 1;
    const stats = State.get('match.stats') || {};
    stats.possession = Math.round(_state.possCount.eng / tot * 100);
    State.set('match.stats', stats);

    _calcRatings();
    _recordCampaignStats();
    if (window.TournamentStats) window.TournamentStats.recordMatch();

    // Still level after extra time in a knockout match — resolve with a
    // real kick-by-kick shootout: real named takers on both sides, each
    // kick its own probability roll, standard early-stop once the tie is
    // mathematically decided, and sudden death if still level after 5
    // each. Previously this was a single weighted coin-flip that just
    // invented a plausible-looking scoreline afterward — honest about
    // what it was, but with no actual drama or individual attribution.
    if (isKnockout && score.eng === score.opp && _state.extraTimePlayed) {
      const shootout = _simulatePenaltyShootout();
      State.set('match.penalties', shootout);
      _pushEvent('penalties', _state.min, '🥅',
        shootout.engWon
          ? `England win the shootout ${shootout.eng}-${shootout.opp}! Pandemonium.`
          : `Heartbreak. ${_state.oppName} win the shootout ${shootout.opp}-${shootout.eng}.`,
        'eng');
    }

    _emit('fulltime', State.get('match'));
  }

  // ─── CAMPAIGN STATS ───────────────────────────────────────────────────────

  function _recordCampaignStats() {
    // Resolve everyone who actually appeared (starters + subs) from the
    // full player pool, keyed off _matchStats — not `squad.slots`, which
    // only reflects the FINAL XI after any substitutions and previously
    // meant anyone subbed off got no cap, no goal credit, and no fitness
    // update for a match they genuinely played part of.
    const pool   = State.get('squad.pool') || [];
    const appeared = Object.keys(_matchStats).map(id => pool.find(p => p.id === id)).filter(Boolean);
    const cStats = State.get('campaign.playerStats') || {};
    const score  = State.get('match.score') || {};
    const scorers= (State.get('match.scorers') || {}).eng || [];
    const diff   = (score.eng||0) - (score.opp||0);
    const formV  = diff > 0 ? 1 : diff < 0 ? -1 : 0;

    appeared.forEach(p => {
      if (!cStats[p.id]) cStats[p.id] = { caps:0, goals:0, form:[] };
      cStats[p.id].caps  = (cStats[p.id].caps  || 0) + 1;
      const g = scorers.filter(n => n === _shortName(p)).length;
      cStats[p.id].goals = (cStats[p.id].goals || 0) + g;
      cStats[p.id].form  = [...(cStats[p.id].form||[]).slice(-4), formV];
      // Real date this match was actually played — the fitness recovery
      // system needs this to know how many real calendar days have
      // passed since a player last featured, which is what determines
      // how rested they are by the time the next fixture comes around.
      const curFix = window.ALL_FIXTURES?.[State.get('campaign.fixtureIdx')||0];
      if (curFix?.date) cStats[p.id].lastPlayedDate = curFix.date;
    });

    State.set('campaign.playerStats', cStats);

    // Persistent fitness — carries the toll of THIS match forward into
    // future ones, rather than every player starting fresh at 100% no
    // matter how many games in a row they've played. Players who were
    // actually on the pitch end the match at whatever their final
    // in-match stamina was (0.25-1.0); the campaign-level recovery system
    // (see campaign_fitness.js) handles the day-by-day rest between now
    // and the next fixture. Squad members who didn't play recover fully
    // regardless, since they had the match off.
    if (window.CampaignFitness) {
      const fitness = State.get('campaign.playerFitness') || {};
      appeared.forEach(p => {
        const finalStamina = _stamina[p.id] ?? 1.0; // 0.25-1.0 from this match
        fitness[p.id] = Math.round(finalStamina * 100);
      });
      State.set('campaign.playerFitness', fitness);
    }

    // Sync pool display objects
    pool.forEach(p => {
      if (cStats[p.id]) { p.caps = cStats[p.id].caps; p.goals = cStats[p.id].goals; }
    });
    State.set('squad.pool', pool);
  }

  // ─── CONTEXTUAL COMMENTARY ───────────────────────────────────────────────

  // Era-flavoured context lines keyed by era decade
  const ERA_LINES = {
    1986: ["The Bobby Robson generation — steel and belief.", "Mexico 86 lives long in the memory. England are building.", "A new chapter. A country watching and willing them on."],
    1990: ["Italia 90 — the tournament that remade a nation. This squad carries that spirit.", "Gazza's tears. Nessun Dorma. The heartbreak fuels them.", "Post-Italia 90 England. Hungry, hard-working, dangerous."],
    1996: ["It's coming home — the nation believes it.", "Shearer, Gascoigne, Seaman. This is England at their peak.", "Euro 96 was almost perfect. Almost isn't good enough now."],
    1998: ["Beckham's red card still stings. This squad has something to prove.", "Owen at 18 — the future is bright. The present is now.", "The Golden Generation is emerging. Can they deliver?"],
    2002: ["Beckham carried a nation's hope in his right boot. He delivered.", "Rooney is here. Gerrard, Lampard, Terry. The generation is ready.", "Every game a chance to write history. Every game."],
    2006: ["Germany 2006 — the Golden Generation at their peak. Surely this is it.", "Rooney. Lampard. Gerrard. Cole. On paper, England's best.", "A quarter-final is not enough. This squad knows it."],
    2010: ["Lampard's goal that wasn't. South Africa. The ghost goal haunts them.", "The Golden Generation's last stand. Now or never.", "Rebuilding after humiliation. Harder, hungrier, together."],
    2014: ["Costa Rica. Uruguay. A group stage exit that shocked the nation.", "Time for a new generation. Out with the old, in with the young.", "A clean slate. A nation demanding something different."],
    2018: ["It's coming home — again, maybe, just maybe.", "Kane's golden boot. A semi-final. Southgate's Lions believe.", "Less baggage. More belief. A new England."],
    2022: ["Bellingham. Saka. Foden. The most talented England squad in a generation.", "The Euros 2024 final was close. So close. They want more.", "A generational talent emerging. A nation daring to dream again."],
  };

  function _doContextComm() {
    const s   = _state;
    const m   = s.min;
    let type  = null;
    let forced = null;

    // Era flavour lines at minute 10, 30, 60 (once each)
    if (!_state._eraLineUsed && (m === 10 || m === 30 || m === 60)) {
      const era = parseInt(State.get('meta.era') || '1986');
      const decade = Object.keys(ERA_LINES).map(Number).filter(y => y <= era).pop() || 1986;
      const lines = ERA_LINES[decade] || ERA_LINES[1986];
      const usedIdx = _state._eraLineIdx || 0;
      if (usedIdx < lines.length) {
        forced = lines[usedIdx];
        _state._eraLineIdx = usedIdx + 1;
        if (usedIdx + 1 >= lines.length) _state._eraLineUsed = true;
      }
    }

    if (forced) {
      _pushEvent('context', m, '💬', forced, 'eng');
      _emit('event', { type:'context', minute:m, text:forced, icon:'💬', side:'eng', zone:ZONE[s.zone] });
      return;
    }

    const _scoreNow = State.get('match.score') || { eng:0, opp:0 };
    const _diffNow  = _scoreNow.opp - _scoreNow.eng; // positive = opp winning

    if (m >= 70 && _diffNow < 0 && Math.random() < 0.4) type = 'opp_desperate';
    else if (m >= 70 && _diffNow > 0 && Math.random() < 0.4) type = 'opp_packed_in';
    else if (m === 80) type = 'last_ten';
    else if (m === 85) type = 'last_five';
    else if (s.momentum >  3) type = 'momentum_eng';
    else if (s.momentum < -3) type = 'momentum_opp';
    else if (s.poss === 'eng' && m > 60) type = 'pressing';

    if (type) {
      const comm = _pick(type, { opp: s.oppName });
      _pushEvent(type, m, '💬', comm, 'eng');
      _emit('event', { type, minute: m, text: comm, icon: '💬', side: 'eng', zone: ZONE[s.zone] });
    }
  }

  // ─── STATE HELPERS ────────────────────────────────────────────────────────

  function _scoreGoal(side) {
    const score = State.get('match.score') || {eng:0,opp:0};
    score[side]++;
    State.set('match.score', score);
  }

  function _addStat(key, side) {
    const stats = State.get('match.stats') || {};
    if (!stats[key]) stats[key] = {eng:0, opp:0};
    stats[key][side]++;
    State.set('match.stats', stats);
  }

  function _bookPlayer(name) {
    const b = State.get('match.bookings') || {};
    b[name] = (b[name]||0) + 1;
    State.set('match.bookings', b);
  }

  function _calcPoss() {
    const tot = _state.possCount.eng + _state.possCount.opp || 1;
    return Math.round(_state.possCount.eng / tot * 100);
  }

  function _scoreGoalName(side, name) {
    if (side !== 'eng') return;
    const scorers = State.get('match.scorers') || {eng:[],opp:[]};
    scorers.eng = [...(scorers.eng||[]), name];
    State.set('match.scorers', scorers);
  }

  // ─── COMMENTARY PICKER ───────────────────────────────────────────────────

  function _pick(cat, tokens) {
    const lines = C[cat];
    if (!lines?.length) return `${tokens?.min||''}′ — ${(cat||'').replace(/_/g,' ')}`;

    if (!_recentC[cat]) _recentC[cat] = [];
    const recent = _recentC[cat];
    const avail  = lines.map((l,i) => i).filter(i => !recent.includes(i));
    const pool   = avail.length ? avail : lines.map((_,i)=>i);
    const idx    = pool[Math.floor(Math.random() * pool.length)];

    _recentC[cat] = [...recent, idx].slice(-5);

    let line = lines[idx];
    Object.entries(tokens||{}).forEach(([k,v]) => {
      line = line.replace(new RegExp(`\\{${k}\\}`, 'g'), v ?? '');
    });
    return line;
  }

  // ─── UTILS ────────────────────────────────────────────────────────────────

  function _clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function _shortName(p) { if (!p?.name) return ''; const parts = p.name.split(' '); return parts[parts.length-1]; }

  function _wPick(opts) {
    const total = opts.reduce((s,[,w]) => s+w, 0);
    let r = Math.random() * total;
    for (const [id,w] of opts) { r -= w; if (r <= 0) return id; }
    return opts[opts.length-1][0];
  }

  function _wPickObj(pool, weightFn) {
    if (!pool.length) return null;
    const weights = pool.map(pl => Math.max(0.01, weightFn(pl)));
    const total   = weights.reduce((s,w) => s+w, 0);
    let r = Math.random() * total;
    for (let i=0; i<pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length-1];
  }

  function _pushEvent(type, min, icon, text, side, playerId) {
    State.upd('match.events', evts => [...(evts||[]), { type, min, minute:min, icon, text, side, playerId }]);
  }

  function _emit(ev, data) {
    const list = _handlers[ev];
    if (!list) return;
    list.forEach(fn => { try { fn(data); } catch (e) {} });
  }

  function _oppGKName(oppKey) {
    const gks = {
      Germany:'Kahn', France:'Barthez', Italy:'Buffon', Spain:'Casillas',
      Brazil:'Taffarel', Argentina:'Roa', Netherlands:'van der Sar',
      Portugal:'Vitor Baia', Romania:'Stelea', 'Czech Republic':'Kouba',
      Croatia:'Ladic', Turkey:'Rustu', Denmark:'Schmeichel', Sweden:'Ravelli',
      Scotland:'Leighton', Ireland:'Given', Norway:'Thorstvedt',
    };
    return gks[oppKey] || 'the keeper';
  }

  // ─── PUBLIC ───────────────────────────────────────────────────────────────

  function applyMomentumBoost(amount) {
    if (_state) _state.momentum = Math.min(5, (_state.momentum || 0) + amount);
  }

  return { on, off, offAll, start, stop, makeSub, setTactic, getState, getPlayers, ZONES, ZONE, C,
           applyMomentumBoost, resumeSecondHalf: _runSecondHalf, skipToEnd, getStamina };

})();
