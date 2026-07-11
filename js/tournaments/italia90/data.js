window.TOURNAMENTS = window.TOURNAMENTS || {};
window.TOURNAMENTS['italia90'] = {
  key:'italia90', name:'FIFA World Cup', fullName:'1990 FIFA World Cup',
  year:1990, host:'Italy', startDate:'1990-06-08', endDate:'1990-07-08',
  tagline:"Gazza's tears. Pearce's penalty. The semi-final that broke a nation's heart.",
  qualifyingRequired:true,qualifierGroup:'WCQ_1990_2',
  badgeSvg:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="i90bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4a0080"/><stop offset="100%" stop-color="#7700cc"/>
    </linearGradient></defs>
    <circle cx="60" cy="60" r="58" fill="url(#i90bg)" stroke="#d4af37" stroke-width="3"/>
    <text x="60" y="40" font-size="11" text-anchor="middle" fill="#d4af37" font-weight="700" font-family="Arial" letter-spacing="1">FIFA WORLD CUP</text>
    <text x="60" y="65" font-size="30" text-anchor="middle" fill="white" font-weight="900" font-family="Arial">ITALIA</text>
    <text x="60" y="85" font-size="22" text-anchor="middle" fill="#d4af37" font-weight="900" font-family="Arial">90</text>
    <text x="60" y="108" font-size="9" text-anchor="middle" fill="rgba(255,255,255,.6)" font-family="Arial">ITALY</text>
  </svg>`,
  colours:{primary:'#4a0080',secondary:'#d4af37',accent:'#cc0000',text:'#fff8f0',bg:'#110022',bgCard:'#1a0033'},
  atmosphere:{stadiumSound:'Italian stadiums, passionate tifosi, stunning venues across the country.',context:"England reach Italia 90 after topping their qualifying group. Robson faces the tournament knowing this could be his last. Gascoigne is finally on the world stage.",pressureLevel:'high',mediaExpectation:'Semi-finals minimum. England have the squad to go all the way.'},
  groups:[
    {id:'A',name:'Group A',qualified:2,teams:[{name:'Italy',flag:'🇮🇹',rating:90},{name:'Czechoslovakia',flag:'🇨🇿',rating:80},{name:'Austria',flag:'🇦🇹',rating:76},{name:'USA',flag:'🇺🇸',rating:70}]},
    {id:'B',name:'Group B',qualified:2,teams:[{name:'Argentina',flag:'🇦🇷',rating:88},{name:'Cameroon',flag:'🇨🇲',rating:79},{name:'Soviet Union',flag:'🇷🇺',rating:84},{name:'Romania',flag:'🇷🇴',rating:76}]},
    {id:'C',name:'Group C',qualified:2,teams:[{name:'Brazil',flag:'🇧🇷',rating:90},{name:'Costa Rica',flag:'🇨🇷',rating:70},{name:'Scotland',flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',rating:74},{name:'Sweden',flag:'🇸🇪',rating:77}]},
    {id:'D',name:'Group D',qualified:2,teams:[{name:'West Germany',flag:'🇩🇪',rating:91},{name:'Yugoslavia',flag:'🇾🇺',rating:82},{name:'Colombia',flag:'🇨🇴',rating:78},{name:'UAE',flag:'🇦🇪',rating:60}]},
    {id:'E',name:'Group E',qualified:2,teams:[{name:'Spain',flag:'🇪🇸',rating:84},{name:'Belgium',flag:'🇧🇪',rating:79},{name:'South Korea',flag:'🇰🇷',rating:69},{name:'Uruguay',flag:'🇺🇾',rating:77}]},
    {id:'F',name:'Group F',qualified:2,teams:[{name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:84},{name:'Republic of Ireland',flag:'🇮🇪',rating:78},{name:'Netherlands',flag:'🇳🇱',rating:88},{name:'Egypt',flag:'🇪🇬',rating:70}]},
  ],
  teams:{
    'England':{rating:84,style:'direct',formation:'4-4-2'},'Netherlands':{rating:88,style:'attacking',formation:'4-3-3'},'Republic of Ireland':{rating:78,style:'direct',formation:'4-4-2'},'Egypt':{rating:70,style:'defensive',formation:'5-4-1'},
    'West Germany':{rating:91,style:'disciplined',formation:'4-3-3',note:'Will win the tournament. Matthaus, Klinsmann, Rummenigge — a formidable side.'},'Argentina':{rating:88,style:'defensive',formation:'4-4-2',note:'World champions defending their title. Maradona, but not the free-flowing 1986 side.'},'Italy':{rating:90,style:'defensive',formation:'5-3-2',note:'Host nation. Schillaci the surprise star.'},'Brazil':{rating:90,style:'attacking',formation:'4-2-4'},'Cameroon':{rating:79,style:'physical',formation:'4-4-2',note:'The tournament sensation. Roger Milla at 38 years old!'},'Yugoslavia':{rating:82,style:'technical',formation:'4-3-3'},'Belgium':{rating:79,style:'balanced',formation:'4-4-2'},'Czechoslovakia':{rating:80,style:'technical',formation:'4-3-3'},'Soviet Union':{rating:84,style:'physical',formation:'4-4-2'},'Spain':{rating:84,style:'technical',formation:'4-3-3'},'Colombia':{rating:78,style:'technical',formation:'4-3-3'},'Romania':{rating:76,style:'counter',formation:'4-4-2'},'Sweden':{rating:77,style:'physical',formation:'4-4-2'},'Uruguay':{rating:77,style:'defensive',formation:'4-4-2'},'Scotland':{rating:74,style:'direct',formation:'4-4-2'},'Austria':{rating:76,style:'balanced',formation:'4-4-2'},'Costa Rica':{rating:70,style:'defensive',formation:'5-4-1'},'South Korea':{rating:69,style:'physical',formation:'4-4-2'},'Egypt':{rating:70,style:'defensive',formation:'5-4-1'},'USA':{rating:70,style:'physical',formation:'4-4-2'},'UAE':{rating:60,style:'defensive',formation:'5-4-1'},
  },
  squads:{
    'West Germany':[{name:'Bodo Illgner',pos:'GK',rating:84},{name:'Lothar Matthaus',pos:'CM',rating:93,note:'Tournament player of the tournament. Utterly dominant.'},{name:'Juergen Klinsmann',pos:'ST',rating:86},{name:'Rudi Voller',pos:'ST',rating:84},{name:'Andreas Brehme',pos:'LB',rating:83,note:'Scored the winning penalty in the final.'},{name:'Pierre Littbarski',pos:'MID',rating:82}],
    'Cameroon':[{name:'Thomas Nkono',pos:'GK',rating:78},{name:'Roger Milla',pos:'ST',rating:80,note:'Came out of retirement at 38. Scored 4 goals and danced around the corner flag.'}],
    'Argentina':[{name:'Sergio Goycochea',pos:'GK',rating:82,note:'Penalty shoot-out hero in both QF and SF.'},{name:'Diego Maradona',pos:'AM',rating:90},{name:'Claudio Caniggia',pos:'ST',rating:84,note:'Scored the equaliser against Brazil.'}],
  },
  venues:{
    'Stadio Sant\'Elia':{city:'Cagliari',capacity:40000,alt:0},'Stadio Renato Dall\'Ara':{city:'Bologna',capacity:39000,alt:54},
    'Stadio San Paolo':{city:'Naples',capacity:74000,alt:17},'Stadio delle Alpi':{city:'Turin',capacity:69000,alt:239},
    'Stadio Olimpico':{city:'Rome',capacity:73000,alt:13},
  },
  allFixtures:[
    // Group F — England
    {id:'i90_F1',group:'F',round:'group',home:'England',away:'Republic of Ireland',venue:'Stadio Sant\'Elia',date:'1990-06-11',neutral:true,historicResult:{home:1,away:1}},
    {id:'i90_F2',group:'F',round:'group',home:'Netherlands',away:'England',venue:'Stadio Sant\'Elia',date:'1990-06-16',neutral:true,historicResult:{home:0,away:0}},
    {id:'i90_F3',group:'F',round:'group',home:'England',away:'Egypt',venue:'Stadio Sant\'Elia',date:'1990-06-21',neutral:true,historicResult:{home:1,away:0}},
    {id:'i90_F4',group:'F',round:'group',home:'Netherlands',away:'Republic of Ireland',venue:'Stadio Sant\'Elia',date:'1990-06-21',neutral:true,historicResult:{home:1,away:1}},
    {id:'i90_F5',group:'F',round:'group',home:'Netherlands',away:'Egypt',venue:'Stadio Sant\'Elia',date:'1990-06-17',neutral:true,historicResult:{home:3,away:1}},
    {id:'i90_F6',group:'F',round:'group',home:'Republic of Ireland',away:'Egypt',venue:'Stadio Sant\'Elia',date:'1990-06-17',neutral:true,historicResult:{home:0,away:0}},
    // Knockout — England's path
    {id:'i90_R16',group:null,round:'r16',home:'England',away:'Belgium',venue:'Stadio Renato Dall\'Ara',date:'1990-06-26',neutral:true,historicResult:{home:1,away:0}},
    {id:'i90_QF',group:null,round:'qf',home:'Cameroon',away:'England',venue:'Stadio San Paolo',date:'1990-07-01',neutral:true,historicResult:{home:2,away:3}},
    {id:'i90_SF',group:null,round:'sf',home:'West Germany',away:'England',venue:'Stadio delle Alpi',date:'1990-07-04',neutral:true,historicResult:{home:1,away:1}},
    {id:'i90_3P',group:null,round:'3rd',home:'Italy',away:'England',venue:'Stadio Olimpico',date:'1990-07-07',neutral:true,historicResult:{home:2,away:1}},
    // Other notable fixtures
    {id:'i90_B1',group:'B',round:'group',home:'Argentina',away:'Cameroon',venue:'Stadio San Siro',date:'1990-06-08',neutral:true,historicResult:{home:0,away:1}},
    {id:'i90_FN',group:null,round:'final',home:'West Germany',away:'Argentina',venue:'Stadio Olimpico',date:'1990-07-08',neutral:true,historicResult:{home:1,away:0}},
  ],
  knockoutStructure:null,
  commentary:{context:['Italia 90 is being played under intense summer heat across multiple stunning venues.','Gascoigne is the heartbeat of this England side — his energy and creativity are vital.','The penalty shoot-out looms. England have never won one.','This England side has character. They\'ve come from behind before.'],groupStage:['England must avoid defeat here. The Republic of Ireland will make it hard.'],goodResult:['England march on. The nation dares to dream.'],badResult:['A painful result. The manager faces questions.']},
  historicalNotes:{'West Germany':'Beat England 4-3 on penalties in the semi-final after a 1-1 draw. Pearce and Waddle missed.','Belgium':'England beat them 1-0 in the R16 with David Platt\'s last-minute volley.','Cameroon':'England came from 2-1 down to win 3-2 in the quarter-final. Two Gary Lineker penalties.','final':'West Germany beat Argentina 1-0 in the final. Brehme\'s penalty the only goal.'},
};
