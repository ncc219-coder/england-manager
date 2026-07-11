/**
 * Mexico 1986 — FIFA World Cup
 * 31 May – 29 June 1986, Mexico
 *
 * Design identity: warm terracotta, orange, Aztec geometry
 */
window.TOURNAMENTS = window.TOURNAMENTS || {};
window.TOURNAMENTS['mexico86'] = {
  key:        'mexico86',
  name:       'FIFA World Cup',
  fullName:   '1986 FIFA World Cup',
  year:       1986,
  host:       'Mexico',
  startDate:  '1986-05-31',
  endDate:    '1986-06-29',
  tagline:    'The tournament of Maradona. The Hand of God. The Goal of the Century.',
  qualifyingRequired: false, // England pre-qualified before game starts

  // Visual identity — SVG badge drawn entirely in code
  badgeSvg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mg86bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c8410a"/>
        <stop offset="100%" stop-color="#e8821a"/>
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="58" fill="url(#mg86bg)" stroke="#f4c842" stroke-width="3"/>
    <!-- Aztec sun pattern -->
    <circle cx="60" cy="60" r="32" fill="none" stroke="#f4c842" stroke-width="2"/>
    <circle cx="60" cy="60" r="18" fill="#f4c842" opacity=".9"/>
    <circle cx="60" cy="60" r="10" fill="#c8410a"/>
    <!-- Sun rays -->
    ${Array.from({length:12},(_,i)=>{
      const a=i*30*Math.PI/180, r1=22, r2=30;
      const x1=60+r1*Math.cos(a), y1=60+r1*Math.sin(a);
      const x2=60+r2*Math.cos(a), y2=60+r2*Math.sin(a);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#f4c842" stroke-width="2.5"/>`;
    }).join('')}
    <!-- Football -->
    <text x="60" y="67" font-size="20" text-anchor="middle" fill="white" font-weight="900">⚽</text>
    <!-- Text -->
    <text x="60" y="100" font-size="8" text-anchor="middle" fill="#f4c842" font-weight="700" letter-spacing="2" font-family="Arial">MEXICO 1986</text>
    <text x="60" y="112" font-size="7" text-anchor="middle" fill="rgba(255,255,255,.7)" font-family="Arial">FIFA WORLD CUP</text>
  </svg>`,

  // Theme colours
  colours: {
    primary:   '#c8410a',
    secondary: '#f4c842',
    accent:    '#1a6b2a',
    text:      '#fff8f0',
    bg:        '#1a0a04',
    bgCard:    '#2d1205',
  },

  // Atmosphere
  atmosphere: {
    stadiumSound: 'Mariachi bands, a wall of noise, thin air at altitude.',
    context: 'Bobby Robson\'s England arrive in Mexico having qualified comfortably. The nation expects a quarter-final at least. Diego Maradona\'s Argentina are the team to beat.',
    pressureLevel: 'high',
    mediaExpectation: 'At least the last eight. The group should be winnable.',
  },

  // ── GROUPS ───────────────────────────────────────────────────────────────
  groups: [
    { id:'A', name:'Group A', qualified:2, teams:[
      {name:'Bulgaria',  flag:'🇧🇬', rating:72},
      {name:'Argentina', flag:'🇦🇷', rating:91},
      {name:'South Korea',flag:'🇰🇷',rating:68},
      {name:'Italy',     flag:'🇮🇹', rating:88},
    ]},
    { id:'B', name:'Group B', qualified:2, teams:[
      {name:'Mexico',    flag:'🇲🇽', rating:78},
      {name:'Belgium',   flag:'🇧🇪', rating:79},
      {name:'Paraguay',  flag:'🇵🇾', rating:72},
      {name:'Iraq',      flag:'🇮🇶', rating:62},
    ]},
    { id:'C', name:'Group C', qualified:2, teams:[
      {name:'France',    flag:'🇫🇷', rating:86},
      {name:'Canada',    flag:'🇨🇦', rating:65},
      {name:'USSR',      flag:'🇷🇺', rating:86},
      {name:'Hungary',   flag:'🇭🇺', rating:72},
    ]},
    { id:'D', name:'Group D', qualified:2, teams:[
      {name:'Brazil',    flag:'🇧🇷', rating:90},
      {name:'Spain',     flag:'🇪🇸', rating:83},
      {name:'N. Ireland',flag:'🇬🇧', rating:72},
      {name:'Algeria',   flag:'🇩🇿', rating:70},
    ]},
    { id:'E', name:'Group E', qualified:2, teams:[
      {name:'West Germany',flag:'🇩🇪',rating:90},
      {name:'Uruguay',   flag:'🇺🇾', rating:76},
      {name:'Scotland',  flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', rating:74},
      {name:'Denmark',   flag:'🇩🇰', rating:76},
    ]},
    { id:'F', name:'Group F', qualified:2, teams:[
      {name:'England',   flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rating:83},
      {name:'Portugal',  flag:'🇵🇹', rating:78},
      {name:'Poland',    flag:'🇵🇱', rating:76},
      {name:'Morocco',   flag:'🇲🇦', rating:70},
    ]},
  ],

  // ── TEAM RATINGS (for simulation) ────────────────────────────────────────
  teams: {
    'England':     {rating:83, style:'direct', formation:'4-4-2'},
    'Argentina':   {rating:91, style:'technical', formation:'4-3-3', note:'Maradona. Enough said.'},
    'West Germany':{rating:90, style:'disciplined', formation:'4-3-3', note:'Clinical, organised, dangerous.'},
    'Brazil':      {rating:90, style:'attacking', formation:'4-2-4'},
    'France':      {rating:86, style:'technical', formation:'4-3-3', note:'Platini in his prime.'},
    'USSR':        {rating:86, style:'physical', formation:'4-4-2'},
    'Italy':       {rating:88, style:'defensive', formation:'5-3-2'},
    'Spain':       {rating:83, style:'technical', formation:'4-3-3'},
    'Mexico':      {rating:78, style:'counter', formation:'4-4-2', note:'Home advantage is massive at altitude.'},
    'Portugal':    {rating:78, style:'technical', formation:'4-3-3'},
    'Belgium':     {rating:79, style:'balanced', formation:'4-4-2'},
    'Denmark':     {rating:76, style:'direct', formation:'4-3-3'},
    'Poland':      {rating:76, style:'physical', formation:'4-4-2'},
    'Uruguay':     {rating:76, style:'defensive', formation:'4-4-2'},
    'Scotland':    {rating:74, style:'direct', formation:'4-4-2'},
    'Hungary':     {rating:72, style:'technical', formation:'4-3-3'},
    'Bulgaria':    {rating:72, style:'physical', formation:'4-4-2'},
    'Paraguay':    {rating:72, style:'counter', formation:'4-5-1'},
    'N. Ireland':  {rating:72, style:'physical', formation:'4-4-2'},
    'Algeria':     {rating:70, style:'counter', formation:'4-5-1'},
    'Morocco':     {rating:70, style:'defensive', formation:'5-4-1', note:'First African side to top a World Cup group.'},
    'Canada':      {rating:65, style:'physical', formation:'4-4-2'},
    'South Korea': {rating:68, style:'physical', formation:'4-4-2'},
    'Iraq':        {rating:62, style:'defensive', formation:'4-5-1'},
  },

  // ── SQUADS (selected players per team, used for team profile screens) ────
  squads: {
    'Argentina': [
      {name:'Nery Pumpido',    pos:'GK', rating:82}, {name:'Oscar Ruggeri',   pos:'CB', rating:83},
      {name:'José Brown',      pos:'CB', rating:80}, {name:'Sergio Batista',  pos:'CM', rating:80},
      {name:'Ricardo Giusti',  pos:'CM', rating:78}, {name:'Jorge Valdano',   pos:'ST', rating:84},
      {name:'Diego Maradona',  pos:'AM', rating:98, note:'Best player on the planet. The tournament belongs to him.'},
      {name:'Jorge Burruchaga', pos:'CM',rating:82, note:'Scored the winner in the final.'},
      {name:'Claudio Caniggia',pos:'ST', rating:82},
    ],
    'West Germany': [
      {name:'Harald Schumacher',pos:'GK',rating:84}, {name:'Hans-Peter Briegel',pos:'LB',rating:80},
      {name:'Karlheinz Förster',pos:'CB',rating:82}, {name:'Felix Magath',    pos:'CM', rating:80},
      {name:'Lothar Matthäus',  pos:'CM',rating:88, note:'Will become the defining German player of his generation.'},
      {name:'Karl-Heinz Rummenigge',pos:'ST',rating:86}, {name:'Rudi Völler',pos:'ST',rating:83},
      {name:'Andreas Brehme',  pos:'LB', rating:82},
    ],
    'Brazil': [
      {name:'Carlos',          pos:'GK', rating:82}, {name:'Júnior',         pos:'LB', rating:83},
      {name:'Edinho',          pos:'CB', rating:79}, {name:'Falcão',         pos:'CM', rating:84},
      {name:'Sócrates',        pos:'CM', rating:86, note:'Captain, philosopher, one of the greatest players never to win the World Cup.'},
      {name:'Zico',            pos:'AM', rating:87, note:'Near-genius. Injury hampered him here.'},
      {name:'Careca',          pos:'ST', rating:85},
    ],
    'Portugal': [
      {name:'Manuel Bento',    pos:'GK', rating:76}, {name:'Fernando Chalana',pos:'LM',rating:78},
      {name:'Paulo Futre',     pos:'RM', rating:80, note:'Brilliant young talent from Porto.'},
      {name:'Diamantino',      pos:'ST', rating:76},
    ],
    'Poland': [
      {name:'Józef Młynarczyk',pos:'GK',rating:76}, {name:'Zbigniew Boniek', pos:'ST', rating:82, note:'One of Europe\'s finest. Rapid, direct, deadly.'},
      {name:'Waldemar Matysik',pos:'CB',rating:74},
    ],
    'Morocco': [
      {name:'Zaki',            pos:'GK', rating:74}, {name:'Krimau',         pos:'CM', rating:70},
      {name:'Timoumi',         pos:'AM', rating:71, note:'Morocco became the first African side to top a World Cup group.'},
    ],
  },

  // ── VENUES ────────────────────────────────────────────────────────────────
  venues: {
    'Estadio Azteca':         {city:'Mexico City', capacity:114600, alt:2240, note:'The cathedral of football. Where the Hand of God happened.'},
    'Estadio Tecnológico':    {city:'Monterrey',   capacity:32750,  alt:538},
    'Estadio Universitario':  {city:'Monterrey',   capacity:29000,  alt:538},
    'Estadio Jalisco':        {city:'Guadalajara', capacity:56000,  alt:1566},
    'Estadio Nou Camp':       {city:'León',        capacity:31000,  alt:1820},
    'Estadio Luis Dosal':     {city:'Toluca',      capacity:26000,  alt:2660, note:'Highest venue — extreme altitude affects stamina.'},
  },

  // ── ALL FIXTURES (group stage + historical knockout results) ─────────────
  allFixtures: [
    // Group A
    {id:'m86_A1', group:'A', round:'group', home:'Bulgaria',   away:'Italy',       venue:'Estadio Azteca',      date:'1986-06-05', neutral:true, historicResult:{home:1,away:1}},
    {id:'m86_A2', group:'A', round:'group', home:'Argentina',  away:'South Korea', venue:'Estadio Olímpico',    date:'1986-06-02', neutral:true, historicResult:{home:3,away:1}},
    {id:'m86_A3', group:'A', round:'group', home:'Italy',      away:'Argentina',   venue:'Estadio Azteca',      date:'1986-06-05', neutral:true, historicResult:{home:1,away:1}},
    {id:'m86_A4', group:'A', round:'group', home:'Bulgaria',   away:'South Korea', venue:'Estadio Azteca',      date:'1986-06-09', neutral:true, historicResult:{home:1,away:1}},
    {id:'m86_A5', group:'A', round:'group', home:'Argentina',  away:'Bulgaria',    venue:'Estadio Azteca',      date:'1986-06-13', neutral:true, historicResult:{home:2,away:0}},
    {id:'m86_A6', group:'A', round:'group', home:'Italy',      away:'South Korea', venue:'Estadio Azteca',      date:'1986-06-10', neutral:true, historicResult:{home:3,away:2}},
    // Group B
    {id:'m86_B1', group:'B', round:'group', home:'Mexico',     away:'Belgium',     venue:'Estadio Azteca',      date:'1986-06-03', neutral:false, historicResult:{home:2,away:1}},
    {id:'m86_B2', group:'B', round:'group', home:'Paraguay',   away:'Iraq',        venue:'Estadio Azteca',      date:'1986-06-04', neutral:true,  historicResult:{home:1,away:0}},
    {id:'m86_B3', group:'B', round:'group', home:'Mexico',     away:'Paraguay',    venue:'Estadio Azteca',      date:'1986-06-07', neutral:false, historicResult:{home:1,away:1}},
    {id:'m86_B4', group:'B', round:'group', home:'Belgium',    away:'Iraq',        venue:'Estadio Azteca',      date:'1986-06-08', neutral:true,  historicResult:{home:2,away:1}},
    {id:'m86_B5', group:'B', round:'group', home:'Mexico',     away:'Iraq',        venue:'Estadio Azteca',      date:'1986-06-11', neutral:false, historicResult:{home:1,away:0}},
    {id:'m86_B6', group:'B', round:'group', home:'Belgium',    away:'Paraguay',    venue:'Estadio Azteca',      date:'1986-06-11', neutral:true,  historicResult:{home:2,away:2}},
    // Group C
    {id:'m86_C1', group:'C', round:'group', home:'France',     away:'Canada',      venue:'Estadio Jalisco',     date:'1986-06-01', neutral:true,  historicResult:{home:1,away:0}},
    {id:'m86_C2', group:'C', round:'group', home:'USSR',       away:'Hungary',     venue:'Estadio Jalisco',     date:'1986-06-02', neutral:true,  historicResult:{home:6,away:0}},
    {id:'m86_C3', group:'C', round:'group', home:'France',     away:'USSR',        venue:'Estadio Jalisco',     date:'1986-06-05', neutral:true,  historicResult:{home:0,away:2}},
    {id:'m86_C4', group:'C', round:'group', home:'Hungary',    away:'Canada',      venue:'Estadio Jalisco',     date:'1986-06-06', neutral:true,  historicResult:{home:2,away:0}},
    {id:'m86_C5', group:'C', round:'group', home:'France',     away:'Hungary',     venue:'Estadio Jalisco',     date:'1986-06-09', neutral:true,  historicResult:{home:3,away:0}},
    {id:'m86_C6', group:'C', round:'group', home:'USSR',       away:'Canada',      venue:'Estadio Jalisco',     date:'1986-06-09', neutral:true,  historicResult:{home:2,away:0}},
    // Group D
    {id:'m86_D1', group:'D', round:'group', home:'Brazil',     away:'Spain',       venue:'Estadio Jalisco',     date:'1986-06-01', neutral:true,  historicResult:{home:1,away:0}},
    {id:'m86_D2', group:'D', round:'group', home:'N. Ireland', away:'Algeria',     venue:'Estadio Tecnológico', date:'1986-06-03', neutral:true,  historicResult:{home:1,away:1}},
    {id:'m86_D3', group:'D', round:'group', home:'Brazil',     away:'Algeria',     venue:'Estadio Jalisco',     date:'1986-06-06', neutral:true,  historicResult:{home:1,away:0}},
    {id:'m86_D4', group:'D', round:'group', home:'Spain',      away:'N. Ireland',  venue:'Estadio Tecnológico', date:'1986-06-07', neutral:true,  historicResult:{home:2,away:1}},
    {id:'m86_D5', group:'D', round:'group', home:'Brazil',     away:'N. Ireland',  venue:'Estadio Jalisco',     date:'1986-06-12', neutral:true,  historicResult:{home:3,away:0}},
    {id:'m86_D6', group:'D', round:'group', home:'Spain',      away:'Algeria',     venue:'Estadio Tecnológico', date:'1986-06-12', neutral:true,  historicResult:{home:3,away:0}},
    // Group E
    {id:'m86_E1', group:'E', round:'group', home:'West Germany',away:'Uruguay',    venue:'Estadio Universitario',date:'1986-06-04',neutral:true,  historicResult:{home:1,away:1}},
    {id:'m86_E2', group:'E', round:'group', home:'Scotland',   away:'Denmark',     venue:'Estadio Nou Camp',    date:'1986-06-04', neutral:true,  historicResult:{home:0,away:1}},
    {id:'m86_E3', group:'E', round:'group', home:'West Germany',away:'Scotland',   venue:'Estadio Universitario',date:'1986-06-08',neutral:true,  historicResult:{home:2,away:1}},
    {id:'m86_E4', group:'E', round:'group', home:'Denmark',    away:'Uruguay',     venue:'Estadio Nou Camp',    date:'1986-06-08', neutral:true,  historicResult:{home:6,away:1}},
    {id:'m86_E5', group:'E', round:'group', home:'West Germany',away:'Denmark',    venue:'Estadio Universitario',date:'1986-06-13',neutral:true,  historicResult:{home:0,away:2}},
    {id:'m86_E6', group:'E', round:'group', home:'Scotland',   away:'Uruguay',     venue:'Estadio Nou Camp',    date:'1986-06-13', neutral:true,  historicResult:{home:0,away:0}},
    // Group F — ENGLAND'S GROUP
    {id:'m86_F1', group:'F', round:'group', home:'Portugal',   away:'England',     venue:'Estadio Tecnológico', date:'1986-06-03', neutral:true,  historicResult:{home:1,away:0}},
    {id:'m86_F2', group:'F', round:'group', home:'England',    away:'Morocco',     venue:'Estadio Tecnológico', date:'1986-06-06', neutral:true,  historicResult:{home:0,away:0}},
    {id:'m86_F3', group:'F', round:'group', home:'Poland',     away:'Morocco',     venue:'Estadio Universitario',date:'1986-06-02',neutral:true,  historicResult:{home:0,away:0}},
    {id:'m86_F4', group:'F', round:'group', home:'England',    away:'Poland',      venue:'Estadio Universitario',date:'1986-06-11',neutral:true,  historicResult:{home:3,away:0}},
    {id:'m86_F5', group:'F', round:'group', home:'Morocco',    away:'Portugal',    venue:'Estadio Tecnológico', date:'1986-06-11', neutral:true,  historicResult:{home:3,away:1}},
    {id:'m86_F6', group:'F', round:'group', home:'Poland',     away:'Portugal',    venue:'Estadio Universitario',date:'1986-06-07',neutral:true,  historicResult:{home:1,away:0}},
    // R16
    {id:'m86_R1', group:null, round:'r16', home:'USSR',       away:'Belgium',      venue:'Estadio Azteca',      date:'1986-06-15', neutral:true,  historicResult:{home:3,away:4}},
    {id:'m86_R2', group:null, round:'r16', home:'Mexico',     away:'Bulgaria',     venue:'Estadio Azteca',      date:'1986-06-15', neutral:false, historicResult:{home:2,away:0}},
    {id:'m86_R3', group:null, round:'r16', home:'Brazil',     away:'Poland',       venue:'Estadio Jalisco',     date:'1986-06-16', neutral:true,  historicResult:{home:4,away:0}},
    {id:'m86_R4', group:null, round:'r16', home:'Argentina',  away:'Uruguay',      venue:'Estadio Azteca',      date:'1986-06-16', neutral:true,  historicResult:{home:1,away:0}},
    {id:'m86_R5', group:null, round:'r16', home:'France',     away:'Italy',        venue:'Estadio Azteca',      date:'1986-06-17', neutral:true,  historicResult:{home:2,away:0}},
    {id:'m86_R6', group:null, round:'r16', home:'West Germany',away:'Morocco',     venue:'Estadio Universitario',date:'1986-06-17',neutral:true,  historicResult:{home:1,away:0}},
    {id:'m86_R7', group:null, round:'r16', home:'England',    away:'Paraguay',     venue:'Estadio Azteca',      date:'1986-06-18', neutral:true,  historicResult:{home:3,away:0}},
    {id:'m86_R8', group:null, round:'r16', home:'Spain',      away:'Denmark',      venue:'Estadio Nou Camp',    date:'1986-06-18', neutral:true,  historicResult:{home:5,away:1}},
    // QF
    {id:'m86_Q1', group:null, round:'qf',  home:'France',     away:'Brazil',       venue:'Estadio Jalisco',     date:'1986-06-21', neutral:true,  historicResult:{home:1,away:1}},
    {id:'m86_Q2', group:null, round:'qf',  home:'West Germany',away:'Mexico',      venue:'Estadio Universitario',date:'1986-06-21',neutral:false, historicResult:{home:0,away:0}},
    {id:'m86_Q3', group:null, round:'qf',  home:'Argentina',  away:'England',      venue:'Estadio Azteca',      date:'1986-06-22', neutral:true,  historicResult:{home:2,away:1}},
    {id:'m86_Q4', group:null, round:'qf',  home:'Belgium',    away:'Spain',        venue:'Estadio Azteca',      date:'1986-06-22', neutral:true,  historicResult:{home:1,away:1}},
    // SF
    {id:'m86_S1', group:null, round:'sf',  home:'France',     away:'West Germany', venue:'Estadio Jalisco',     date:'1986-06-25', neutral:true,  historicResult:{home:0,away:2}},
    {id:'m86_S2', group:null, round:'sf',  home:'Argentina',  away:'Belgium',      venue:'Estadio Azteca',      date:'1986-06-25', neutral:true,  historicResult:{home:2,away:0}},
    // 3rd place
    {id:'m86_3P', group:null, round:'3rd', home:'France',     away:'Belgium',      venue:'Estadio Universitario',date:'1986-06-28',neutral:true,  historicResult:{home:4,away:2}},
    // Final
    {id:'m86_FN', group:null, round:'final',home:'Argentina', away:'West Germany', venue:'Estadio Azteca',      date:'1986-06-29', neutral:true,  historicResult:{home:3,away:2}},
  ],

  // ── Knockout structure ────────────────────────────────────────────────────
  knockoutStructure: {
    // Each entry: fixtureId, home slot (groupId_position), away slot
    r16: [
      { fixtureId:'m86_R7', home:'F_1', away:'E_2' },  // England's potential R16 (actual: F2 vs E1)
      { fixtureId:'m86_R8', home:'E_1', away:'F_2' },
      { fixtureId:'m86_R1', home:'C_1', away:'D_2' },
      { fixtureId:'m86_R2', home:'B_1', away:'A_2' },
      { fixtureId:'m86_R3', home:'A_1', away:'B_2' },
      { fixtureId:'m86_R4', home:'D_1', away:'C_2' },
      { fixtureId:'m86_R5', home:'best3_1', away:'best3_2' },
      { fixtureId:'m86_R6', home:'best3_3', away:'best3_4' },
    ],
    // QF fixtures (m86_Q1-4) are left unlisted here deliberately — they
    // already carry literal, correct team names in allFixtures (England's
    // QF is hardcoded as Argentina vs England), so they resolve fine with
    // no slot needed. SF and Final, however, were previously MISSING
    // entirely: if England actually won their QF (a real, playable
    // outcome this game exists to let happen), there was no slot mapping
    // to place them into the semi-final at all — the SF fixtures
    // (m86_S1/S2) hardcode France/West Germany/Argentina/Belgium
    // literally, none of which is 'England', so nextEnglandFixture()
    // found nothing and the tournament screen got stuck showing
    // "Awaiting next fixture" forever. Winner-chains off the QF results
    // (already simulated for the non-England QF ties by the time this
    // resolves) fix that without touching the QF fixtures themselves.
    sf: [
      { fixtureId:'m86_S1', home:'m86_Q1_W', away:'m86_Q2_W' },
      { fixtureId:'m86_S2', home:'m86_Q3_W', away:'m86_Q4_W' },
    ],
    final: { fixtureId:'m86_FN', home:'m86_S1_W', away:'m86_S2_W' },
  },

  // ── Tournament-specific commentary ───────────────────────────────────────
  commentary: {
    context: [
      'The heat and altitude of Mexico are a challenge for every European side.',
      'Matches at altitude above 2000m are noticeably slower — stamina is everything.',
      'Maradona is untouchable. Every team is building their game around stopping him.',
      'The Azteca is the greatest stadium in world football. The noise is extraordinary.',
      'England have never won a World Cup outside England. Mexico could change that.',
    ],
    groupStage: [
      'A point here would be solid — England need to stay patient in the heat.',
      'The heat in Monterrey is sapping — hydration and discipline are crucial.',
      'Three points against Poland would effectively secure qualification.',
      'Morocco have surprised everyone. Portugal can\'t be underestimated.',
    ],
    goodResult: ['The nation goes wild back home.','Wembley in the living rooms of England tonight.'],
    badResult:  ['The papers will be brutal tomorrow.','Questions being asked in the dressing room.'],
  },

  // ── Historical highlights ─────────────────────────────────────────────────
  historicalNotes: {
    'Argentina': 'Beat England 2-1 in the quarter-final. Maradona scored both — the Hand of God and the Goal of the Century — within four minutes.',
    'Portugal':  'England lost their opening game 1-0 to a Bryan Robson injury-hit side.',
    'Morocco':   'Topped the group, eliminating Portugal and Poland.',
    'Poland':    'England beat them 3-0 in the final group game with Lineker hat-trick.',
    'Paraguay':  'England beat them 3-0 in the R16 — Lineker scored twice.',
    'final':     'Argentina beat West Germany 3-2 in a classic final at the Azteca.',
  },
};
