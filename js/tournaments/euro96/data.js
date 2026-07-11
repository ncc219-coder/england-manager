window.TOURNAMENTS = window.TOURNAMENTS || {};
window.TOURNAMENTS['euro96'] = {
  key:'euro96', name:'UEFA European Championship', fullName:'UEFA Euro 1996',
  year:1996, host:'England', startDate:'1996-06-08', endDate:'1996-06-30',
  tagline:"Football's coming home. The nation roars. And then Southgate steps up.",
  qualifyingRequired:false, // hosts
  badgeSvg:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="e96bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#cc0000"/><stop offset="100%" stop-color="#990000"/>
    </linearGradient></defs>
    <circle cx="60" cy="60" r="58" fill="url(#e96bg)" stroke="white" stroke-width="3"/>
    <text x="60" y="35" font-size="9" text-anchor="middle" fill="white" font-family="Arial" letter-spacing="1">UEFA</text>
    <text x="60" y="55" font-size="22" text-anchor="middle" fill="white" font-weight="900" font-family="Arial">EURO</text>
    <text x="60" y="78" font-size="26" text-anchor="middle" fill="white" font-weight="900" font-family="Arial">'96</text>
    <text x="60" y="100" font-size="9" text-anchor="middle" fill="rgba(255,255,255,.8)" font-family="Arial">ENGLAND</text>
    <text x="60" y="112" font-size="8" text-anchor="middle" fill="rgba(255,255,255,.5)" font-family="Arial">Three Lions</text>
  </svg>`,
  colours:{primary:'#cc0000',secondary:'#ffffff',accent:'#003399',text:'#ffffff',bg:'#0a0000',bgCard:'#1a0000'},
  atmosphere:{stadiumSound:'Wembley, Anfield, Old Trafford, Villa Park — England hosting for the first time.',context:"England are hosts. Venables has built a progressive team. Shearer and Sheringham up front, Gascoigne pulling the strings. The nation is gripped by 'Football's Coming Home'.",pressureLevel:'extreme',mediaExpectation:'Win the tournament. Nothing less. It\'s coming home.'},
  groups:[
    {id:'A',name:'Group A',qualified:2,teams:[{name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:85},{name:'Switzerland',flag:'🇨🇭',rating:76},{name:'Scotland',flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',rating:74},{name:'Netherlands',flag:'🇳🇱',rating:86}]},
    {id:'B',name:'Group B',qualified:2,teams:[{name:'Spain',flag:'🇪🇸',rating:84},{name:'Bulgaria',flag:'🇧🇬',rating:78},{name:'Romania',flag:'🇷🇴',rating:79},{name:'France',flag:'🇫🇷',rating:85}]},
    {id:'C',name:'Group C',qualified:2,teams:[{name:'Germany',flag:'🇩🇪',rating:89},{name:'Czech Republic',flag:'🇨🇿',rating:82},{name:'Italy',flag:'🇮🇹',rating:86},{name:'Russia',flag:'🇷🇺',rating:78}]},
    {id:'D',name:'Group D',qualified:2,teams:[{name:'Denmark',flag:'🇩🇰',rating:79},{name:'Portugal',flag:'🇵🇹',rating:82},{name:'Turkey',flag:'🇹🇷',rating:72},{name:'Croatia',flag:'🇭🇷',rating:80}]},
  ],
  teams:{
    'England':{rating:85,style:'direct',formation:'4-4-2'},'Netherlands':{rating:86,style:'attacking',formation:'4-3-3'},'Scotland':{rating:74,style:'direct',formation:'4-4-2',note:'McAllister, Laudrup. Will meet England at Wembley.'},'Switzerland':{rating:76,style:'defensive',formation:'4-4-2'},
    'Germany':{rating:89,style:'disciplined',formation:'4-3-3',note:'Matthäus, Klinsmann, Hassler. Relentlessly efficient.'}, 'Czech Republic':{rating:82,style:'technical',formation:'4-3-3',note:'Dark horses. Nedved and Poborsky are dangerous.'},'France':{rating:85,style:'technical',formation:'4-3-3',note:'Building toward the 1998 peak. Zidane is emerging.'},'Spain':{rating:84,style:'technical',formation:'4-3-3'},'Portugal':{rating:82,style:'technical',formation:'4-3-3'},'Croatia':{rating:80,style:'technical',formation:'4-3-3'},'Italy':{rating:86,style:'defensive',formation:'5-3-2'},'Denmark':{rating:79,style:'direct',formation:'4-4-2'},'Bulgaria':{rating:78,style:'counter',formation:'4-5-1'},'Romania':{rating:79,style:'counter',formation:'4-4-2'},'Turkey':{rating:72,style:'physical',formation:'4-4-2'},'Russia':{rating:78,style:'physical',formation:'4-4-2'},
  },
  squads:{
    'Germany':[{name:'Andreas Köpke',pos:'GK',rating:84},{name:'Matthias Sammer',pos:'CB',rating:88,note:'Won the Golden Ball.'},{name:'Jürgen Klinsmann',pos:'ST',rating:86},{name:'Dieter Eilts',pos:'CM',rating:78},{name:'Andy Möller',pos:'CM',rating:82,note:'Scored in the semi-final and the final.'}],
    'Czech Republic':[{name:'Petr Kouba',pos:'GK',rating:80},{name:'Karel Poborský',pos:'RM',rating:82,note:'That chip against Portugal was extraordinary.'},{name:'Patrik Berger',pos:'CM',rating:80},{name:'Pavel Kuka',pos:'ST',rating:78}],
    'Netherlands':[{name:'Edwin van der Sar',pos:'GK',rating:83},{name:'Clarence Seedorf',pos:'CM',rating:82},{name:'Patrick Kluivert',pos:'ST',rating:82},{name:'Dennis Bergkamp',pos:'AM',rating:90},{name:'Marc Overmars',pos:'LM',rating:85}],
  },
  venues:{
    'Wembley Stadium':{city:'London',capacity:76000,alt:25,note:'The home of football. The Gascoigne goal, the 4-1 against Holland.'},
    'Villa Park':{city:'Birmingham',capacity:40000,alt:145},
    'Old Trafford':{city:'Manchester',capacity:55000,alt:50},
    'Elland Road':{city:'Leeds',capacity:40000,alt:55},
    'City Ground':{city:'Nottingham',capacity:30000,alt:28},
    'Anfield':{city:'Liverpool',capacity:41000,alt:20},
  },
  allFixtures:[
    {id:'e96_A1',group:'A',round:'group',home:'England',away:'Switzerland',venue:'Wembley Stadium',date:'1996-06-08',neutral:false,historicResult:{home:1,away:1}},
    {id:'e96_A2',group:'A',round:'group',home:'England',away:'Scotland',venue:'Wembley Stadium',date:'1996-06-15',neutral:false,historicResult:{home:2,away:0}},
    {id:'e96_A3',group:'A',round:'group',home:'England',away:'Netherlands',venue:'Wembley Stadium',date:'1996-06-18',neutral:false,historicResult:{home:4,away:1}},
    {id:'e96_A4',group:'A',round:'group',home:'Scotland',away:'Switzerland',venue:'Villa Park',date:'1996-06-09',neutral:true,historicResult:{home:1,away:0}},
    {id:'e96_A5',group:'A',round:'group',home:'Scotland',away:'Netherlands',venue:'Villa Park',date:'1996-06-18',neutral:true,historicResult:{home:0,away:0}},
    {id:'e96_A6',group:'A',round:'group',home:'Netherlands',away:'Switzerland',venue:'Villa Park',date:'1996-06-13',neutral:true,historicResult:{home:2,away:0}},
    {id:'e96_QF1',group:null,round:'qf',home:'England',away:'Spain',venue:'Wembley Stadium',date:'1996-06-22',neutral:false,historicResult:{home:0,away:0}},
    {id:'e96_QF2',group:null,round:'qf',home:'France',away:'Netherlands',venue:'Anfield',date:'1996-06-22',neutral:true,historicResult:{home:0,away:0}},
    {id:'e96_QF3',group:null,round:'qf',home:'Germany',away:'Croatia',venue:'Old Trafford',date:'1996-06-23',neutral:true,historicResult:{home:2,away:1}},
    {id:'e96_QF4',group:null,round:'qf',home:'Czech Republic',away:'Portugal',venue:'Villa Park',date:'1996-06-23',neutral:true,historicResult:{home:1,away:0}},
    {id:'e96_SF1',group:null,round:'sf',home:'England',away:'Germany',venue:'Wembley Stadium',date:'1996-06-26',neutral:false,historicResult:{home:1,away:1}},
    {id:'e96_SF2',group:null,round:'sf',home:'France',away:'Czech Republic',venue:'Old Trafford',date:'1996-06-26',neutral:true,historicResult:{home:0,away:0}},
    {id:'e96_FN',group:null,round:'final',home:'Germany',away:'Czech Republic',venue:'Wembley Stadium',date:'1996-06-30',neutral:false,historicResult:{home:2,away:1}},
  ],
  knockoutStructure:null,
  commentary:{context:['Wembley is electric. The nation has not felt this way about England since 1966.','Sheringham and Shearer have been outstanding. This attack is formidable.','"Football\'s Coming Home" plays on every radio, in every pub.','The pressure of the host nation is enormous — but this England side seems to enjoy it.'],groupStage:['England are at home. This is their tournament to lose.'],goodResult:['Wembley erupts. The dream lives on.'],badResult:['Heartbreak. The dream is over.']},
  historicalNotes:{'Germany':'Beat England 6-5 on penalties after a 1-1 draw in the semi-final. Southgate missed.','Spain':'England beat Spain on penalties 4-2 in the QF after a 0-0 draw.','Scotland':'Gascoigne\'s flick and volley. One of Wembley\'s greatest ever goals.','Netherlands':'England 4-1 Netherlands. Shearer and Sheringham both scored twice.','final':'Germany beat Czech Republic 2-1 in the final after extra time. Golden goal by Bierhoff.'},
};
