window.TOURNAMENTS = window.TOURNAMENTS || {};
window.TOURNAMENTS['france98'] = {
  key:'france98', name:'FIFA World Cup', fullName:'1998 FIFA World Cup',
  year:1998, host:'France', startDate:'1998-06-10', endDate:'1998-07-12',
  tagline:"Beckham's red card. Owen's wonder goal. Argentina in Saint-Étienne.",
  qualifyingRequired:true,qualifierGroup:'WCQ_1998_2',
  badgeSvg:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="f98bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#002395"/><stop offset="100%" stop-color="#001a6e"/>
    </linearGradient></defs>
    <circle cx="60" cy="60" r="58" fill="url(#f98bg)" stroke="#ed2939" stroke-width="3"/>
    <text x="60" y="35" font-size="10" text-anchor="middle" fill="white" font-weight="700" font-family="Arial" letter-spacing="1">FIFA WORLD CUP</text>
    <text x="60" y="58" font-size="22" text-anchor="middle" fill="white" font-weight="900" font-family="Arial">FRANCE</text>
    <text x="60" y="80" font-size="24" text-anchor="middle" fill="#ed2939" font-weight="900" font-family="Arial">1998</text>
    <text x="60" y="108" font-size="8" text-anchor="middle" fill="rgba(255,255,255,.5)" font-family="Arial">COUPE DU MONDE</text>
  </svg>`,
  colours:{primary:'#002395',secondary:'#ed2939',accent:'#ffffff',text:'#ffffff',bg:'#000a1f',bgCard:'#001133'},
  atmosphere:{stadiumSound:'French crowds, summer heat, the world\'s greatest players on the biggest stage.',context:"Hoddle's England arrive having qualified from a tough group including Italy. Owen is only 18 but already electrifying. Beckham is at the peak of his powers. Can England finally go deep in a World Cup?",pressureLevel:'high',mediaExpectation:'Quarter-final minimum. The Golden Generation should be delivering.'},
  groups:[
    {id:'A',name:'Group A',qualified:2,teams:[{name:'Brazil',flag:'🇧🇷',rating:94},{name:'Norway',flag:'🇳🇴',rating:76},{name:'Morocco',flag:'🇲🇦',rating:74},{name:'Scotland',flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',rating:74}]},
    {id:'B',name:'Group B',qualified:2,teams:[{name:'Italy',flag:'🇮🇹',rating:88},{name:'Chile',flag:'🇨🇱',rating:77},{name:'Cameroon',flag:'🇨🇲',rating:75},{name:'Austria',flag:'🇦🇹',rating:73}]},
    {id:'C',name:'Group C',qualified:2,teams:[{name:'France',flag:'🇫🇷',rating:92},{name:'Denmark',flag:'🇩🇰',rating:78},{name:'South Africa',flag:'🇿🇦',rating:70},{name:'Saudi Arabia',flag:'🇸🇦',rating:69}]},
    {id:'D',name:'Group D',qualified:2,teams:[{name:'Spain',flag:'🇪🇸',rating:85},{name:'Nigeria',flag:'🇳🇬',rating:78},{name:'Paraguay',flag:'🇵🇾',rating:73},{name:'Bulgaria',flag:'🇧🇬',rating:75}]},
    {id:'E',name:'Group E',qualified:2,teams:[{name:'Netherlands',flag:'🇳🇱',rating:88},{name:'Belgium',flag:'🇧🇪',rating:78},{name:'South Korea',flag:'🇰🇷',rating:71},{name:'Mexico',flag:'🇲🇽',rating:78}]},
    {id:'F',name:'Group F',qualified:2,teams:[{name:'Germany',flag:'🇩🇪',rating:88},{name:'Yugoslavia',flag:'🇾🇺',rating:80},{name:'Iran',flag:'🇮🇷',rating:68},{name:'USA',flag:'🇺🇸',rating:74}]},
    {id:'G',name:'Group G',qualified:2,teams:[{name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',rating:85},{name:'Romania',flag:'🇷🇴',rating:80},{name:'Colombia',flag:'🇨🇴',rating:79},{name:'Tunisia',flag:'🇹🇳',rating:68}]},
    {id:'H',name:'Group H',qualified:2,teams:[{name:'Argentina',flag:'🇦🇷',rating:87},{name:'Croatia',flag:'🇭🇷',rating:82},{name:'Jamaica',flag:'🇯🇲',rating:67},{name:'Japan',flag:'🇯🇵',rating:70}]},
  ],
  teams:{
    'England':{rating:85,style:'direct',formation:'4-4-2'},'Romania':{rating:80,style:'counter',formation:'4-4-2',note:'Hagi and Moldovan. Lost to England in 1998 historically.'},'Colombia':{rating:79,style:'technical',formation:'4-4-2'},'Tunisia':{rating:68,style:'defensive',formation:'5-4-1'},
    'France':{rating:92,style:'technical',formation:'4-2-3-1',note:'Zidane, Desailly, Deschamps, Henry, Trezeguet. The greatest France team ever assembled.'},'Brazil':{rating:94,style:'attacking',formation:'4-3-3',note:'Ronaldo, Rivaldo, Ronaldinho. World Cup holders.'},'Germany':{rating:88,style:'disciplined',formation:'4-3-3'},'Argentina':{rating:87,style:'technical',formation:'4-3-3',note:'Batistuta, Ortega, Veron. England face them in the R16.'},'Italy':{rating:88,style:'defensive',formation:'5-3-2'},'Netherlands':{rating:88,style:'attacking',formation:'4-3-3'},'Croatia':{rating:82,style:'technical',formation:'4-3-3',note:'Third place. Suker\'s Golden Boot. A wonderful side.'},'Yugoslavia':{rating:80,style:'technical',formation:'4-3-3'},'Nigeria':{rating:78,style:'athletic',formation:'4-4-2'},'Spain':{rating:85,style:'technical',formation:'4-3-3'},'Denmark':{rating:78,style:'direct',formation:'4-4-2'},'Belgium':{rating:78,style:'balanced',formation:'4-4-2'},'Norway':{rating:76,style:'physical',formation:'4-4-2'},'Mexico':{rating:78,style:'counter',formation:'4-4-2'},'Paraguay':{rating:73,style:'defensive',formation:'5-4-1'},'Scotland':{rating:74,style:'direct',formation:'4-4-2'},'Chile':{rating:77,style:'counter',formation:'4-4-2'},'Cameroon':{rating:75,style:'physical',formation:'4-4-2'},'Morocco':{rating:74,style:'defensive',formation:'5-4-1'},'Bulgaria':{rating:75,style:'counter',formation:'4-5-1'},'South Korea':{rating:71,style:'physical',formation:'4-4-2'},'South Africa':{rating:70,style:'physical',formation:'4-4-2'},'USA':{rating:74,style:'physical',formation:'4-4-2'},'Austria':{rating:73,style:'balanced',formation:'4-4-2'},'Jamaica':{rating:67,style:'direct',formation:'4-4-2'},'Japan':{rating:70,style:'technical',formation:'4-4-2'},'Saudi Arabia':{rating:69,style:'counter',formation:'5-4-1'},'Iran':{rating:68,style:'defensive',formation:'5-4-1'},'Tunisia':{rating:68,style:'defensive',formation:'5-4-1'},
  },
  squads:{
    'France':[{name:'Fabien Barthez',pos:'GK',rating:88},{name:'Marcel Desailly',pos:'CB',rating:89},{name:'Zinedine Zidane',pos:'AM',rating:96,note:'Two headers in the final. Carried France on his back.'},{name:'Didier Deschamps',pos:'CM',rating:84},{name:'Thierry Henry',pos:'ST',rating:86},{name:'David Trezeguet',pos:'ST',rating:83},{name:'Emmanuel Petit',pos:'CM',rating:83,note:'Scored in the final.'}],
    'Brazil':[{name:'Taffarel',pos:'GK',rating:84},{name:'Ronaldo',pos:'ST',rating:97,note:'The phenomenon. Despite the mystery before the final, still the best player.'},{name:'Rivaldo',pos:'AM',rating:92},{name:'Roberto Carlos',pos:'LB',rating:89},{name:'Cafu',pos:'RB',rating:87}],
    'Argentina':[{name:'Carlos Roa',pos:'GK',rating:83,note:'Saved penalties vs England.'},{name:'Gabriel Batistuta',pos:'ST',rating:90},{name:'Ariel Ortega',pos:'AM',rating:83},{name:'Juan Sebastian Veron',pos:'CM',rating:85},{name:'Diego Simeone',pos:'CM',rating:82,note:'Won the free kick that led to Beckham\'s red card.'}],
    'Croatia':[{name:'Drazen Ladic',pos:'GK',rating:80},{name:'Davor Suker',pos:'ST',rating:87,note:'Golden Boot with 6 goals.'},{name:'Robert Prosinecki',pos:'CM',rating:82},{name:'Zvonimir Boban',pos:'CM',rating:87}],
  },
  venues:{
    'Stade de France':{city:'Paris',capacity:80000,alt:30},'Stade Vélodrome':{city:'Marseille',capacity:60000,alt:10},
    'Stade de Toulouse':{city:'Toulouse',capacity:37000,alt:141},'Stade Félix Bollaert':{city:'Lens',capacity:41000,alt:40},
    'Stade Geoffroy-Guichard':{city:'Saint-Étienne',capacity:36000,alt:446},
  },
  allFixtures:[
    {id:'f98_G1',group:'G',round:'group',home:'England',away:'Tunisia',venue:'Stade Vélodrome',date:'1998-06-15',neutral:true,historicResult:{home:2,away:0}},
    {id:'f98_G2',group:'G',round:'group',home:'England',away:'Romania',venue:'Stade de Toulouse',date:'1998-06-22',neutral:true,historicResult:{home:1,away:2}},
    {id:'f98_G3',group:'G',round:'group',home:'England',away:'Colombia',venue:'Stade Félix Bollaert',date:'1998-06-26',neutral:true,historicResult:{home:2,away:0}},
    {id:'f98_G4',group:'G',round:'group',home:'Romania',away:'Colombia',venue:'Stade de Toulouse',date:'1998-06-15',neutral:true,historicResult:{home:1,away:0}},
    {id:'f98_G5',group:'G',round:'group',home:'Romania',away:'Tunisia',venue:'Stade de Toulouse',date:'1998-06-26',neutral:true,historicResult:{home:1,away:1}},
    {id:'f98_G6',group:'G',round:'group',home:'Colombia',away:'Tunisia',venue:'Stade Félix Bollaert',date:'1998-06-22',neutral:true,historicResult:{home:1,away:0}},
    {id:'f98_R16',group:null,round:'r16',home:'England',away:'Argentina',venue:'Stade Geoffroy-Guichard',date:'1998-06-30',neutral:true,historicResult:{home:2,away:2}},
    {id:'f98_FN',group:null,round:'final',home:'France',away:'Brazil',venue:'Stade de France',date:'1998-07-12',neutral:true,historicResult:{home:3,away:0}},
  ],
  knockoutStructure:null,
  commentary:{context:['France in summer — perfect conditions, extraordinary venues.','Owen is only 18 but playing without fear. His pace is a constant threat.','Beckham and Scholes in midfield — the creativity is there to hurt any team.','The Argentina match in the R16 is the game everyone is talking about.'],groupStage:['England should qualify from this group. Romania could be the tricky one.'],goodResult:['England are through. The nation celebrates.'],badResult:['Heartbreak. Beckham\'s red card cost England the match.']},
  historicalNotes:{'Argentina':'England lost on penalties after a 2-2 draw. Beckham was sent off for a flick at Simeone. Owen scored a wonder goal.','Romania':'England lost 2-1 in the group stage. Dan Petrescu scored the winner.','final':'France beat Brazil 3-0. Zidane headed two goals. Ronaldo was mysteriously ill.'},
};
