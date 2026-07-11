/**
 * commentary.js — Rich match commentary
 * Player-specific, era-aware, situational — 160+ unique strings
 */
window.Commentary = {

  traitLines: {
    'Clinical Finisher':      ['{name} — ice in his veins. Absolutely clinical.', '{name} with the cold-blooded finish. Ruthless.', 'That is what separates {name} — composure when it matters.'],
    'Natural Goalscorer':     ['Pure instinct from {name}. He was always scoring that.', '{name} — the natural. Different class.', 'Goalscorers find a way. {name} has found a way.'],
    'Poacher':                ['{name} in the right place at the right time — that is his gift.', "Poacher's goal from {name}. Anticipation.", '{name} — predatory. He has that sixth sense.'],
    'Free Kick Specialist':   ['{name} steps up — you back him every time from that position.', 'Dead ball master {name} delivers.', 'The wall goes up. {name} is going for goal. Here it comes...'],
    'Aerial Dominant':        ['{name} wins everything in the air. Colossal header.', 'Dominated in the air — {name} is unplayable.', 'Nobody outjumps {name} when he is at full pace.'],
    'Explosive Pace':         ['{name} just burns past the full back — nobody catches him.', 'Electric acceleration from {name}!', 'He leaves him for dead. {name} is simply too quick.'],
    'Dribbling Genius':       ['{name} dancing through — beats one, beats two — GOAL!', 'Takes on three men and wins — {name} is on fire.', '{name} with the elastic feet — twists, turns and away!'],
    'World Class':            ['That is what {name} does on the biggest stages.', 'This is world class. Pure and simple. {name}.', 'What a player. What a moment. {name}.'],
    'Never Gives Up':         ['{name} tracking back — 90 minutes, never stops. That is the standard.', 'Still running, still pressing — {name} sets the tone.'],
    'Captain':                ['{name} demanding more from everyone — he wants this badly.', 'The captain leads. {name} out there fighting for every ball.'],
    'Leader':                 ['The skipper drives them forward. {name} leading the charge.', '{name} commands this team. His influence is immense.'],
    'Engine':                 ['{name} covering every blade of grass. Incredible engine.', 'The stamina of {name} — still going at the same pace late on.'],
    'Technical Genius':       ['Exquisite touch from {name}. Nobody does it quite like him.', '{name} with a touch of brilliance — the crowd love it.'],
    'Passing Master':         ['The vision from {name} — that pass opens up everything.', '{name} with the incisive ball — threading the needle.'],
    'Warrior':                ['{name} putting his body on the line. Committed every minute.', 'Hard as nails. {name} makes that challenge like it means everything.'],
    'Penalty Specialist':     ['{name} has never missed a penalty. Not one. Steps up now.', 'Calm. Composed. {name} from the spot — this is his domain.'],
    'Shot Stopper':           ['Incredible reflexes — {name} just will not be beaten.', '{name} down to his left — how did he get there?'],
    'Visionary':              ['The vision of {name} — only he sees that pass.', 'Eyes in the back of his head. {name} is the quarterback.'],
    'Commanding':             ['{name} commands that area — complete authority.', 'Big voice, big presence. {name} organises everything.'],
  },

  situation: {
    leading_big:   [
      'England are in total control. Professional performance.',
      'This is what we want to see. Dominant England.',
      'The job is almost done. Keep it tight now.',
      'England could add more here. The floodgates could open.',
    ],
    trailing:      [
      'England need to find a way back into this. Heads must stay up.',
      'Come on England — there is still time.',
      'The manager will be making changes. Something has to shift.',
      'England chasing the game now — looking increasingly desperate.',
      'Do not panic. Stay disciplined. There is time.',
    ],
    last_minute_eq: ['LAST MINUTE — and England have equalised! The drama of football!', 'STOPPAGE TIME GOAL! England snatch the draw!'],
    last_minute_w:  ['LATE WINNER! England snatch it in injury time! The nation goes wild!', 'UNBELIEVABLE! A goal in stoppage time wins it for England!'],
    nil_nil_60:     [
      'Still goalless — both managers frustrated on the touchline.',
      'England need to find a breakthrough. Running out of time.',
      'Cagey affair — neither side willing to commit.',
      'The game needs a moment of quality. Who will provide it?',
    ],
    big_lead:       [
      'England putting on a show here. The fans are loving this.',
      'Could be a memorable evening. England out of sight.',
      'History in the making — this could be a record scoreline.',
    ],
    pressure:       [
      'England under the cosh — need to dig deep.',
      'The back four being tested — must hold firm.',
      'The pressure is building. England need to ride this out.',
      'Nervy times — England cannot afford to switch off.',
    ],
    comeback:       [
      'England pulling level! The belief flooding back!',
      'Two goals? Why not? England have found something here.',
    ],
  },

  bigGame: {
    'Germany':     ['England vs Germany — the rivalry that never loses its edge.',
                    'This fixture always finds a way to create history.',
                    'Two great footballing nations. This is what the sport is about.',
                    "Sixty years of hurt? Or sixty years of character? England won't blink."],
    'Argentina':   ['England vs Argentina — there is always history here. Always tension.',
                    'Laden with history, this fixture. Both sides know exactly what is at stake.',
                    'Hand of God. Golden Goal. And now this. More history to be written.'],
    'Brazil':      ['The most beautiful football nation on earth. England must match them technically.',
                    'Playing Brazil — the benchmark. How do England measure up tonight?',
                    'Samba football versus English steel. A classic confrontation.'],
    'France':      ['World class opposition. Every generation they produce a great player.',
                    'Les Bleus at full strength. England need a perfect performance.',
                    'France — the masters of the modern game. England must be fearless.'],
    'Italy':       ['The Azzurri — defensively brilliant. England will have to work for everything.',
                    'Italian discipline and organisation. England must be patient.',
                    'Rome. Milan. England in Italy. The drama is built in.'],
    'Scotland':    ['The oldest international fixture in the world. Never a dull moment.',
                    'England vs Scotland — pride on the line. No such thing as a friendly here.',
                    'Every tackle a block tackle. Every ball contested. This is British football.'],
    'Portugal':    ['Portugal always produce a great player — from Eusébio to Ronaldo.',
                    'Portugal play attractive football. This should be a good game.',
                    'Flair versus steel. Warm nights. European football at its finest.'],
    'Spain':       ['Masters of possession football. England need to press high.',
                    'Spain — technically the best in the world for a generation.',
                    'England will not see much of the ball. They must use it wisely when they do.'],
    'Netherlands': ['Total football. The Dutch always produce something special.',
                    'Clockwork orange — organised, technical, relentless.',
                    'England vs Holland — always a test of European credentials.'],
    'Croatia':     ['Croatia — technically exceptional. Every player comfortable on the ball.',
                    'A tough draw. Croatia will cause problems if England switch off.',
                    'Modric and company. England must win the midfield battle.'],
    'Russia':      ['Luzhniki, Sochi — Russia as hosts means a hostile atmosphere.',
                    'England have history in Russia. This will not be straightforward.'],
    'United States':['USA growing as a footballing nation. Not to be underestimated.',],
    'Mexico':      ['A World Cup specialist. Mexico in tournaments are never easy.'],
    'Republic of Ireland':['A fiercely competitive fixture. Every ball contested.'],
    'Sweden':      ['Disciplined Swedish defending. England must be patient.'],
    'Poland':      ['Poland with a point to prove. History between these nations.'],
    'Turkey':      ['Turkey — technically gifted and dangerous on the break.'],
    'Denmark':     ['Denmark — efficient, organised, dangerous set pieces.'],
  },

  era: {
    1986: ['The opening chapter — a new generation takes shape under Bobby Robson.',
           'Mexico 86 — altitude, heat, and England trying to find their feet.',
           "The World Cup in Mexico. Maradona's tournament. Can England keep up?"],
    1990: ['Italia 90 — the tournament that made the nation fall back in love with football.',
           'The semi-final nights of Turin. Can England go one step further?',
           'Gazza tears. Nessun Dorma. A generation defined by a tournament.'],
    1992: ["Graham Taylor's England — under huge pressure after Italia 90 heroics.",
           'Do I Not Like That. England need performances, not excuses.'],
    1994: ["USA 94 — England didn't qualify historically. History rewritten here.",
           'Shearer, Beardsley, Platt — the squad has genuine quality. Make it count.'],
    1996: ["Euro 96 — it's coming home. Wembley roars. The nation believes.",
           "Football's Coming Home. The pressure is immense. The belief is real.",
           "Three Lions. Pearce's penalty. The wounds from Turin finally healed."],
    1998: ['France 98 — a young squad growing into a World Cup.',
           "Owen's goal against Argentina. That is England at their absolute best.",
           'The Golden Generation is emerging. Can they go all the way?'],
    2000: ["Kevin Keegan's England — entertaining but fragile.",
           'Euro 2000 — England have the talent. Do they have the mentality?'],
    2002: ["Sven-Göran Eriksson's England — calm, methodical, occasionally brilliant.",
           "Beckham's metatarsal. The nation held its breath. Now: the World Cup.",
           'Korea and Japan. A different World Cup. England must adapt.'],
    2004: ['Rooney is here. The most exciting English talent in a generation.',
           'A settled squad, a clear system. Portugal wait in the quarter-finals.'],
    2006: ['Germany 2006 — the Golden Generation at their peak.',
           "Rooney's red card. A squad's best chance, perhaps, gone.",
           'Beckham, Lampard, Gerrard, Terry. On paper, this is England\'s best squad.'],
    2008: ['The post-Golden Generation rebuild. A new England taking shape.',
           'Capello brought discipline. Now they need inspiration.'],
    2010: ["The Golden Generation's last stand. South Africa. Vuvuzelas.",
           "Lampard's ghost goal. The handball. England's nemesis: Germany.",
           'Capello rigid. The nation frustrated. But the talent is there.'],
    2012: ["Hodgson's first tournament. The system is functional. The football, less so.",
           'Euro 2012 — England grind through and lose to Italy on penalties. Again.'],
    2014: ['Brazil 2014 — the group of death. Italy, Uruguay, Costa Rica.',
           "The World Cup in Brazil. Spectacular setting. Painful exit.",
           'A new generation is waiting. Sterling, Barkley, Shaw — the future is here.'],
    2016: ["Roy Hodgson's farewell. Iceland await in the last sixteen.",
           'England have quality. But do they have leaders on the pitch?'],
    2018: ["Russia 2018 — Southgate's transformation begins. Young, energetic, together.",
           "It's coming home. The nation dares to dream again.",
           'Kane, Trippier, Maguire — less baggage, more belief.'],
    2020: ['Euro 2020 — played in 2021, at Wembley, with a full crowd returning.',
           "Wembley roars for the semi-final. England closest since '66.",
           "Southgate's steady hand. England have a plan. Can they execute it?"],
    2022: ['Qatar 2022 — the winter World Cup. Something different.',
           'Bellingham is the story. Nineteen years old. Running the show.',
           "Kane needs goals. England's captain must deliver when it matters."],
    2024: ['Euro 2024 in Germany — the squad to bring it home at last.',
           "England have been building to this. Bellingham. Kane. Saka. Now or never.",
           'Berlin hosts the final. Can England finally end decades of hurt?'],
  },

  get(type, vars) {
    const arr = this.situation[type];
    if (!arr) return 'An important moment here.';
    let line = arr[Math.floor(Math.random() * arr.length)];
    if (vars) Object.entries(vars).forEach(([k,v]) => { line = line.replace('{'+k+'}', v); });
    return line;
  },

  forPlayer(player) {
    if (!player?.traits?.length) return null;
    for (const trait of player.traits) {
      const lines = this.traitLines[trait];
      if (lines && Math.random() < 0.4) {
        const line = lines[Math.floor(Math.random() * lines.length)];
        return line.replace('{name}', player.name);
      }
    }
    return null;
  },

  forOpponent(oppName) {
    const lines = this.bigGame[oppName];
    if (lines) return lines[Math.floor(Math.random() * lines.length)];
    return null;
  },

  forEra(year) {
    const eraYears = Object.keys(this.era).map(Number).sort((a,b)=>a-b);
    let best = eraYears[0];
    for (const y of eraYears) { if (year >= y) best = y; }
    const lines = this.era[best];
    if (lines) return lines[Math.floor(Math.random() * lines.length)];
    return null;
  },

  preMatch(fix, engSquad, era) {
    if (!fix) return '';
    const opp = fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam;
    const venue = fix.venue || 'Wembley';
    const comp = fix.comp || '';
    const bigGameLine = this.forOpponent(opp) || '';
    const eraLine = this.forEra(parseInt(era)) || '';
    const topPlayer = (engSquad||[]).sort((a,b)=>b.rat-a.rat)[0];
    const lines = [
      `${opp ? 'England take on ' + opp : 'England take the field'} at ${venue}${comp ? ' — ' + comp : ''}.`,
      bigGameLine || (opp ? `${opp} will be dangerous — England cannot afford a slow start.` : ''),
      topPlayer ? `${topPlayer.name} leads the line — ${parseInt(era) > 2000 ? 'the crowd expect him to deliver' : "England's talisman"}.` : '',
      eraLine,
    ];
    return lines.filter(Boolean).join(' ');
  },
};
