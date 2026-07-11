window.TOURNAMENTS=window.TOURNAMENTS||{};
window.TOURNAMENTS['euro92']={
  key:'euro92',name:'UEFA European Championship',fullName:'UEFA Euro 1992',
  year:1992,host:'Sweden',startDate:'1992-06-10',endDate:'1992-06-26',
  tagline:"Taylor's England go out on goal difference. Agony in Sweden.",
  qualifyingRequired:true,qualifierGroup:'ECQ_EURO92_7',format:'euros_8',
  colours:{primary:'#006AA7',secondary:'#FECC02',accent:'#FFFFFF',text:'#fff',bg:'#00000A',bgCard:'#00001A'},
  atmosphere:{context:"Graham Taylor's England qualified but look short of ideas. Lineker dropped against Sweden. A desperate, uninspired showing.",pressureLevel:'high',mediaExpectation:'Semi-finals minimum.'},
  groups:[
  {id:'A',name:'Group A',qualified:2,teams:[{name:'Sweden',flag:'🇸🇪',rating:79}, {name:'France',flag:'🇫🇷',rating:77}, {name:'Denmark',flag:'🇩🇰',rating:79}, {name:'England',flag:'🏴U000e0067U000e0062U000e0065U000e006eU000e0067U000e007f',rating:79}]},
  {id:'B',name:'Group B',qualified:2,teams:[{name:'Germany',flag:'🇩🇪',rating:88}, {name:'Netherlands',flag:'🇳🇱',rating:86}, {name:'CIS',flag:'🇷🇺',rating:74}, {name:'Scotland',flag:'🏴U000e0067U000e0062U000e0073U000e0063U000e0074U000e007f',rating:72}]},
],
  teams:{
    England:{rating:79,manager:'Graham Taylor',style:'defensive'},Germany:{rating:88,manager:'Berti Vogts',style:'balanced'},
    Netherlands:{rating:86,manager:'Rinus Michels',style:'attacking'},Denmark:{rating:79,manager:'Richard Moller Nielsen',style:'balanced'},
    Sweden:{rating:79,manager:'Tommy Svensson',style:'balanced'},France:{rating:77,manager:'Michel Platini',style:'attacking'},
    Scotland:{rating:72,manager:'Andy Roxburgh',style:'defensive'},CIS:{rating:74,manager:'Anatoly Byshovets',style:'balanced'},
  },
  allFixtures:[
    {id:'e92_G1',home:'Denmark',away:'England',group:'A',stage:'group',date:'1992-06-11',neutral:true,historicResult:{home:0,away:0}},
    {id:'e92_G2',home:'Sweden',away:'France',group:'A',stage:'group',date:'1992-06-10',neutral:true,historicResult:{home:1,away:1}},
    {id:'e92_G3',home:'England',away:'France',group:'A',stage:'group',date:'1992-06-14',neutral:true,historicResult:{home:0,away:0}},
    {id:'e92_G4',home:'Sweden',away:'Denmark',group:'A',stage:'group',date:'1992-06-14',neutral:true,historicResult:{home:1,away:0}},
    {id:'e92_G5',home:'England',away:'Sweden',group:'A',stage:'group',date:'1992-06-17',neutral:true,historicResult:{home:1,away:2}},
    {id:'e92_G6',home:'Denmark',away:'France',group:'A',stage:'group',date:'1992-06-17',neutral:true,historicResult:{home:2,away:1}},
    {id:'e92_SF1',home:'A_1',away:'B_2',stage:'sf',date:'1992-06-21',neutral:true},
    {id:'e92_SF2',home:'B_1',away:'A_2',stage:'sf',date:'1992-06-22',neutral:true},
    {id:'e92_F',home:'e92_SF1_W',away:'e92_SF2_W',stage:'final',date:'1992-06-26',neutral:true},
  ],
  knockoutStructure:{sf:[{fixtureId:'e92_SF1'},{fixtureId:'e92_SF2'}],final:{fixtureId:'e92_F'}},
  squads:{
    England:['Gary Lineker','Alan Shearer','David Platt','Paul Gascoigne','Trevor Steven','Tony Adams','Des Walker','Stuart Pearce','Lee Dixon','David Seaman','Chris Woods','Andy Sinton','Carlton Palmer','Nigel Clough','Mark Wright','Keith Curle','Martin Keown','Alan Smith','Nigel Martyn'],
    Germany:["Karl-Heinz Riedle","Thomas Hassler","Jurgen Klinsmann","Andreas Brehme"],
    Denmark:["Peter Schmeichel","Brian Laudrup","Michael Laudrup","Kim Vilfort"],
    Netherlands:["Frank Rijkaard","Ronald Koeman","Marco van Basten","Dennis Bergkamp"],
  },
  commentary:{context:["Taylor's England. Gascoigne absent (knee). Can they perform?"],groupStage:["Denmark first — should win.","France — don't mess this up."],goodResult:["England looking solid."],badResult:["Taylor is overthinking everything."]},
  historicalNotes:{groupResult:'3rd in Group A — drew Denmark 0-0, drew France 0-0, lost to Sweden 1-2',knockoutRun:'Eliminated in group stage. Lineker substituted vs Sweden — his last England game.',topScorer:'None scored',keyMoment:"Lineker subbed off for Carlton Palmer vs Sweden. Taylor never recovered reputationally."},
};