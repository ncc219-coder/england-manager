window.TOURNAMENTS = window.TOURNAMENTS || {};
window.TOURNAMENTS['euro88'] = {
  key:'euro88', name:'UEFA European Championship', fullName:'UEFA Euro 1988',
  year:1988, host:'West Germany', startDate:'1988-06-10', endDate:'1988-06-25',
  tagline:'England arrive in West Germany as qualifiers — but leave after just three games.',
  qualifyingRequired:true,qualifierGroup:'ECQ_EURO88_7',
  badgeSvg:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="e88bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#003399"/><stop offset="100%" stop-color="#0055cc"/>
    </linearGradient></defs>
    <circle cx="60" cy="60" r="58" fill="url(#e88bg)" stroke="#ffcc00" stroke-width="3"/>
    <text x="60" y="52" font-size="28" text-anchor="middle" fill="#ffcc00" font-weight="900" font-family="Arial">UEFA</text>
    <text x="60" y="72" font-size="14" text-anchor="middle" fill="white" font-family="Arial">EURO</text>
    <text x="60" y="90" font-size="20" text-anchor="middle" fill="#ffcc00" font-weight="900" font-family="Arial">1988</text>
    <text x="60" y="108" font-size="9" text-anchor="middle" fill="rgba(255,255,255,.6)" font-family="Arial">WEST GERMANY</text>
  </svg>`,
  colours:{primary:'#003399',secondary:'#ffcc00',accent:'#cc0000',text:'#ffffff',bg:'#000d33',bgCard:'#001155'},
  atmosphere:{stadiumSound:'West German crowds, compact stadiums, intense atmosphere.',context:"England qualified from a tough group but face an immediate test. The Netherlands with Gullit and Van Basten are the tournament favourites.",pressureLevel:'medium',mediaExpectation:'Quarter-final at minimum. Anything less will be a disappointment.'},
  groups:[
    {id:'A',name:'Group A',qualified:2,teams:[{name:'West Germany',flag:'🇩🇪',rating:90},{name:'Italy',flag:'🇮🇹',rating:87},{name:'Spain',flag:'🇪🇸',rating:83},{name:'Denmark',flag:'🇩🇰',rating:78}]},
    {id:'B',name:'Group B',qualified:2,teams:[{name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:83},{name:'Republic of Ireland',flag:'🇮🇪',rating:78},{name:'Netherlands',flag:'🇳🇱',rating:91},{name:'Soviet Union',flag:'🇷🇺',rating:85}]},
  ],
  teams:{
    'England':{rating:83,style:'direct',formation:'4-4-2'},'Netherlands':{rating:91,style:'attacking',formation:'4-3-3',note:'Gullit, Van Basten, Rijkaard. The greatest Dutch side ever assembled.'},
    'Soviet Union':{rating:85,style:'technical',formation:'4-3-3'},'Republic of Ireland':{rating:78,style:'direct',formation:'4-4-2',note:'Jack Charlton\'s direct game — dangerous from set pieces.'},
    'West Germany':{rating:90,style:'disciplined',formation:'4-3-3'},'Italy':{rating:87,style:'defensive',formation:'5-3-2'},'Spain':{rating:83,style:'technical',formation:'4-3-3'},'Denmark':{rating:78,style:'balanced',formation:'4-3-3'},
  },
  squads:{
    'Netherlands':[{name:'Hans van Breukelen',pos:'GK',rating:84},{name:'Ronald Koeman',pos:'CB',rating:88,note:'Scored the penalty in the final.'},{name:'Frank Rijkaard',pos:'CM',rating:88},{name:'Ruud Gullit',pos:'AM',rating:93,note:'Golden Boot winner. Unstoppable.'},{name:'Marco van Basten',pos:'ST',rating:96,note:'Scored a hat-trick vs England. That volley in the final was otherworldly.'}],
    'Soviet Union':[{name:'Rinat Dasaev',pos:'GK',rating:84},{name:'Oleg Protasov',pos:'ST',rating:82},{name:'Alexei Mikhailichenko',pos:'CM',rating:80}],
    'Republic of Ireland':[{name:'Pat Bonner',pos:'GK',rating:78},{name:'Mick McCarthy',pos:'CB',rating:76},{name:'Ray Houghton',pos:'CM',rating:80,note:'Scored the opener vs England with a header.'}],
  },
  venues:{
    'Rheinstadion':{city:'Düsseldorf',capacity:68000,alt:40},'Waldstadion':{city:'Frankfurt',capacity:62000,alt:112},
    'Neckarstadion':{city:'Stuttgart',capacity:53200,alt:245},'Parkstadion':{city:'Gelsenkirchen',capacity:70000,alt:60},
    'Olympiastadion':{city:'Munich',capacity:74000,alt:519},'Müngersdorfer Stadion':{city:'Cologne',capacity:61000,alt:55},
  },
  allFixtures:[
    {id:'e88_B1',group:'B',round:'group',home:'Republic of Ireland',away:'England',venue:'Neckarstadion',date:'1988-06-12',neutral:true,historicResult:{home:1,away:0}},
    {id:'e88_B2',group:'B',round:'group',home:'Netherlands',away:'England',venue:'Rheinstadion',date:'1988-06-15',neutral:true,historicResult:{home:3,away:1}},
    {id:'e88_B3',group:'B',round:'group',home:'Soviet Union',away:'England',venue:'Waldstadion',date:'1988-06-18',neutral:true,historicResult:{home:3,away:1}},
    {id:'e88_B4',group:'B',round:'group',home:'Netherlands',away:'Republic of Ireland',venue:'Parkstadion',date:'1988-06-12',neutral:true,historicResult:{home:0,away:1}},
    {id:'e88_B5',group:'B',round:'group',home:'Soviet Union',away:'Netherlands',venue:'Müngersdorfer Stadion',date:'1988-06-15',neutral:true,historicResult:{home:1,away:0}},
    {id:'e88_B6',group:'B',round:'group',home:'Soviet Union',away:'Republic of Ireland',venue:'Parkstadion',date:'1988-06-18',neutral:true,historicResult:{home:1,away:1}},
    {id:'e88_A1',group:'A',round:'group',home:'West Germany',away:'Italy',venue:'Olympiastadion',date:'1988-06-10',neutral:false,historicResult:{home:1,away:1}},
    {id:'e88_A2',group:'A',round:'group',home:'Denmark',away:'Spain',venue:'Müngersdorfer Stadion',date:'1988-06-11',neutral:true,historicResult:{home:2,away:3}},
    {id:'e88_A3',group:'A',round:'group',home:'West Germany',away:'Denmark',venue:'Olympiastadion',date:'1988-06-14',neutral:false,historicResult:{home:2,away:0}},
    {id:'e88_A4',group:'A',round:'group',home:'Italy',away:'Spain',venue:'Neckarstadion',date:'1988-06-14',neutral:true,historicResult:{home:1,away:0}},
    {id:'e88_A5',group:'A',round:'group',home:'Italy',away:'Denmark',venue:'Neckarstadion',date:'1988-06-17',neutral:true,historicResult:{home:2,away:0}},
    {id:'e88_A6',group:'A',round:'group',home:'West Germany',away:'Spain',venue:'Olympiastadion',date:'1988-06-17',neutral:false,historicResult:{home:2,away:0}},
    {id:'e88_SF1',group:null,round:'sf',home:'West Germany',away:'Netherlands',venue:'Waldstadion',date:'1988-06-21',neutral:true,historicResult:{home:1,away:2}},
    {id:'e88_SF2',group:null,round:'sf',home:'Soviet Union',away:'Italy',venue:'Neckarstadion',date:'1988-06-22',neutral:true,historicResult:{home:2,away:0}},
    {id:'e88_FN',group:null,round:'final',home:'Netherlands',away:'Soviet Union',venue:'Olympiastadion',date:'1988-06-25',neutral:true,historicResult:{home:2,away:0}},
  ],
  knockoutStructure:null,
  commentary:{context:['West Germany in summer — perfect football weather.','Van Basten is simply unstoppable. Every defence is struggling to cope.','England need to be disciplined out of possession against this Dutch side.','Jack Charlton\'s Ireland will play direct — England must win the aerial battle.'],groupStage:['A point here would be a decent start — but England should be winning this group.'],goodResult:['The nation celebrates.'],badResult:['The back pages will be brutal.']},
  historicalNotes:{'Netherlands':'Beat England 3-1 with a Van Basten hat-trick. One of the great tournament performances.','Republic of Ireland':'Ray Houghton headed past Shilton to give Ireland a famous 1-0 win.','final':'Netherlands beat USSR 2-0 in the final. Van Basten\'s volley was perhaps the greatest goal in tournament history.'},
};
