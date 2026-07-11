/**
 * tournament_buildup.js — Tournament Squad Announcement & Media Build-Up
 *
 * A genuine, ceremonial entry point into a tournament — replacing the
 * previous "click View → straight into squad selection" flow with a real
 * squad announcement (manager actively confirms/adjusts the touring
 * party against the real era-accurate squad-size cap) followed by a
 * substantial media build-up sequence with fresh, tournament-specific
 * written content, not a reuse of the existing tagline/atmosphere
 * fields (which stay as flavour text elsewhere) — built bigger and more
 * varied specifically for this moment.
 */

window.TournamentBuildup = (function () {

  // ── Press conference question banks ──────────────────────────────────────
  // Multiple genuinely different questions per pressure level, each with
  // 2-3 response options carrying a real confidence/expectation effect —
  // mirrors the structure of the regular pre-match press conference, but
  // written specifically for a tournament send-off rather than a single
  // fixture.
  const QUESTIONS = {
    extreme: [
      {
        q: "The whole country is talking about this tournament. Is this the year it finally comes home?",
        options: [
          { label: "Absolutely. We're here to win it.", confDelta: 6, pressureDelta: 2 },
          { label: "We respect every game. One at a time.", confDelta: 2, pressureDelta: -1 },
          { label: "Let's not get carried away before a ball's been kicked.", confDelta: -1, pressureDelta: -2 },
        ],
      },
      {
        q: "Some say this squad has no excuse not to win it all. Do you agree?",
        options: [
          { label: "I back this group to go all the way.", confDelta: 5, pressureDelta: 2 },
          { label: "Excuses don't win tournaments — performances do.", confDelta: 2, pressureDelta: 0 },
          { label: "Every tournament has surprises. We'll see.", confDelta: -1, pressureDelta: -2 },
        ],
      },
    ],
    high: [
      {
        q: "Expectation is high again. How do you keep the squad's feet on the ground?",
        options: [
          { label: "We embrace the expectation — it means people believe in us.", confDelta: 4, pressureDelta: 1 },
          { label: "We focus on the process, not the noise outside.", confDelta: 2, pressureDelta: -1 },
          { label: "Pressure is part of the job. We deal with it.", confDelta: 1, pressureDelta: 0 },
        ],
      },
      {
        q: "What's a realistic target for this tournament?",
        options: [
          { label: "Nothing less than the semi-finals.", confDelta: 4, pressureDelta: 1 },
          { label: "Get out of the group, then see how far we can go.", confDelta: 1, pressureDelta: -1 },
        ],
      },
    ],
    medium: [
      {
        q: "Not many are tipping England for this one. Does that suit you?",
        options: [
          { label: "We'll prove people wrong on the pitch.", confDelta: 3, pressureDelta: 1 },
          { label: "Low expectations can be freeing for a young group.", confDelta: 2, pressureDelta: -1 },
          { label: "We're just focused on our own performance.", confDelta: 1, pressureDelta: 0 },
        ],
      },
    ],
    low: [
      {
        q: "After a difficult qualifying campaign, what can fans expect?",
        options: [
          { label: "A team that fights for every point, every game.", confDelta: 3, pressureDelta: 0 },
          { label: "Realistically, just getting out of the group would be progress.", confDelta: 0, pressureDelta: -2 },
        ],
      },
    ],
  };

  // ── Fresh written build-up copy, genuinely new content per pressure
  //    level (not reused tagline/atmosphere flavour text) ────────────────
  const BUILDUP_COPY = {
    extreme: [
      "The build-up to this tournament has swallowed every back page for weeks. Pundits, former players, even politicians have weighed in on what this squad owes the nation.",
      "Training ground footage leaks daily. Every five-a-side rondo is analysed for clues about the starting XI. The circus has well and truly arrived.",
      "Bookmakers have shortened England's odds twice already this week, purely on the strength of public sentiment rather than any actual football played.",
    ],
    high: [
      "There's a real buzz building around this squad — not quite fever pitch, but the sense that something could be building here.",
      "The press pack travelling with the squad has doubled in size compared to the last cycle. Expectation, while not extreme, is unmistakably rising.",
      "Former internationals on television panels keep using the word 'potential' — the implicit suggestion being that potential finally needs to be realised.",
    ],
    medium: [
      "Coverage has been steady rather than feverish — pundits picking through the squad list for surprises more than demanding results.",
      "There's cautious optimism in the build-up, the kind that comes from a squad nobody's quite sure about yet.",
      "The mood travelling into the tournament is measured. Nobody's promising miracles, but nobody's writing the team off either.",
    ],
    low: [
      "It's been a quiet build-up by historical standards — the back pages have had other things to lead with.",
      "Expectation management has been the order of the week. Even the most optimistic pundits are talking about damage limitation.",
      "There's a sense that this tournament is viewed as a staging post rather than a genuine shot at silverware.",
    ],
  };

  function _pressureBand(tData) {
    return tData?.atmosphere?.pressureLevel || 'medium';
  }

  // Build the squad-size requirement message — what the manager needs to
  // do before they can confirm.
  function squadSizeStatus(currentCount, requiredSize) {
    if (currentCount === requiredSize) {
      return { ok: true, message: `Squad of ${requiredSize} confirmed and ready.` };
    }
    if (currentCount < requiredSize) {
      return { ok: false, message: `You need ${requiredSize - currentCount} more player${requiredSize - currentCount > 1 ? 's' : ''} to reach the required squad of ${requiredSize}.` };
    }
    return { ok: false, message: `You're ${currentCount - requiredSize} over the limit — trim the squad down to ${requiredSize} before you can confirm.` };
  }

  // Pick fresh build-up copy + a press question appropriate to this
  // tournament's real pressure level.
  function generateContent(tData) {
    const band = _pressureBand(tData);
    const copyPool = BUILDUP_COPY[band] || BUILDUP_COPY.medium;
    const questionPool = QUESTIONS[band] || QUESTIONS.medium;
    const copy = copyPool[Math.floor(Math.random() * copyPool.length)];
    const question = questionPool[Math.floor(Math.random() * questionPool.length)];
    return { band, copy, question };
  }

  return { squadSizeStatus, generateContent, QUESTIONS, BUILDUP_COPY };

})();
