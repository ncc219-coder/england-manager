/**
 * 2008.js — England squad era, Euro 2008
 * England failed to qualify under Steve McClaren (the umbrella manager).
 * This squad represents what was available during the qualifying campaign.
 */
window.ALL_PLAYERS = window.ALL_PLAYERS || {};
window.PLAYERS_2008 = [
  { id:'robinson_p08', name:'Paul Robinson', dob:'1979-10-15', pos:'GK', posG:'GK', club:'Blackburn', rat:79, age:28, caps:41, goals:0, nat:'England', height:193, weight:90, foot:'right',
    attrs:{ han:16, ref:15, kic:10, aer:16, thw:14, onv:14, sta:14, com:13, dec:13, bra:14, lea:12, pos:14 },
    bio:'Badly affected by that infamous back-pass goal vs Croatia. His international career never recovers. Good shot-stopper.', traits:['Shot Stopper'], weaknesses:['Distribution','Concentration','Confidence'] },
  { id:'terry_j08', name:'John Terry', dob:'1980-12-07', pos:'CB', posG:'DEF', club:'Chelsea', rat:88, age:27, caps:52, goals:5, nat:'England', height:187, weight:86, foot:'right',
    attrs:{ fin:7, sho:10, hea:18, pas:13, lng:11, cro:7, dri:8, tec:11, fre:9, pac:12, acc:11, sta:15, str:18, jum:18, agi:10, vis:13, dec:15, com:15, pos:17, wor:16, bra:18, lea:18, tac:17, mar:18, int:15 },
    bio:'The best centre back in England. At his Chelsea peak. Should be England captain — dominant in every area.', traits:['Aerial Dominant','Leader','Physical','World Class'], weaknesses:['Pace','Agility'] },
  { id:'ferdinand_r08', name:'Rio Ferdinand', dob:'1978-11-07', pos:'CB', posG:'DEF', club:'Man Utd', rat:87, age:29, caps:75, goals:3, nat:'England', height:188, weight:82, foot:'right',
    attrs:{ fin:5, sho:7, hea:16, pas:15, lng:14, cro:7, dri:10, tec:13, fre:7, pac:14, acc:13, sta:13, str:16, jum:16, agi:12, vis:14, dec:17, com:15, pos:17, wor:13, bra:15, lea:16, tac:17, mar:17, int:16 },
    bio:'World class ball-playing defender. Man United\'s Champions League winner this season. Read the game at the highest level.',
    traits:['World Class','Ball Playing','Composed'], weaknesses:['Concentration'] },
  { id:'cole_a08', name:'Ashley Cole', dob:'1980-12-20', pos:'LB', posG:'DEF', club:'Chelsea', rat:88, age:27, caps:80, goals:0, nat:'England', height:176, weight:68, foot:'left',
    attrs:{ fin:8, sho:11, hea:12, pas:14, lng:12, cro:14, dri:16, tec:15, fre:9, pac:18, acc:18, sta:17, str:14, jum:13, agi:17, vis:14, dec:15, com:14, pos:16, wor:17, bra:16, lea:14, tac:17, mar:16, int:15 },
    bio:'Arguably the best left back in world football at this moment. What England might have achieved if they\'d qualified.',
    traits:['World Class','Best in World','Pace','Left Foot'], weaknesses:['Final Ball'] },
  { id:'lampard_f08', name:'Frank Lampard', dob:'1978-06-20', pos:'CM', posG:'MID', club:'Chelsea', rat:87, age:29, caps:72, goals:22, nat:'England', height:184, weight:84, foot:'right',
    attrs:{ fin:17, sho:18, hea:13, pas:16, lng:15, cro:12, dri:13, tec:15, fre:16, pac:13, acc:12, sta:17, str:14, jum:13, agi:13, vis:16, dec:16, com:16, pos:16, wor:18, bra:15, lea:15, tac:14, mar:13, int:14 },
    bio:'Machine-like consistency. 20+ goals a season from midfield. One of England\'s greatest ever midfielders.', traits:['Goals From Midfield','Engine','Technical','Consistent'], weaknesses:['Playing with Gerrard','Pace'] },
  { id:'gerrard_s08', name:'Steven Gerrard', dob:'1980-05-30', pos:'CM', posG:'MID', club:'Liverpool', rat:89, age:27, caps:72, goals:17, nat:'England', height:183, weight:84, foot:'right',
    attrs:{ fin:15, sho:17, hea:15, pas:17, lng:16, cro:13, dri:14, tec:16, fre:16, pac:15, acc:14, sta:17, str:17, jum:14, agi:14, vis:17, dec:16, com:16, pos:15, wor:18, bra:18, lea:18, tac:15, mar:13, int:15 },
    bio:'Complete midfielder at his very best. Leader, scorer, creator. Failure to qualify with this squad is a national embarrassment.', traits:['Complete Midfielder','Captain','Leader','Engine','World Class'], weaknesses:['Playing with Lampard'] },
  { id:'rooney_w08', name:'Wayne Rooney', dob:'1985-10-24', pos:'ST', posG:'FWD', club:'Man Utd', rat:88, age:22, caps:45, goals:19, nat:'England', height:178, weight:83, foot:'right',
    attrs:{ fin:18, sho:17, hea:14, pas:15, lng:12, cro:9, dri:18, tec:17, fre:14, pac:16, acc:16, sta:17, str:18, jum:14, agi:15, vis:17, dec:15, com:13, pos:16, wor:18, bra:18, lea:14, tac:10, mar:9, int:11 },
    bio:'Champion with United. At his devastating best — physical, skilled, relentless. Should be leading England at the Euros.', traits:['Complete Forward','Physical','Dribbler','Engine'], weaknesses:['Composure','Discipline'] },
  { id:'owen_m08', name:'Michael Owen', dob:'1979-12-14', pos:'ST', posG:'FWD', club:'Newcastle', rat:80, age:28, caps:89, goals:40, nat:'England', height:173, weight:68, foot:'right',
    attrs:{ fin:18, sho:16, hea:10, pas:10, lng:7, cro:5, dri:14, tec:14, fre:8, pac:16, acc:17, sta:12, str:9, jum:10, agi:15, vis:12, dec:14, com:13, pos:16, wor:11, bra:12, lea:12, tac:3, mar:3, int:4 },
    bio:'Still capable but injury-prone. England\'s record scorer. 40 goals from 89 caps is remarkable.', traits:['Clinical Finisher','Record Scorer'], weaknesses:['Injury Prone','Tracking Back'] },
];
window.PLAYERS_2008.forEach(p => window.ALL_PLAYERS[p.id] = p);


window.PLAYERS_2008_EXT = [
  { id:'james_d08', name:'David James', dob:'1970-08-01', pos:'GK', posG:'GK', club:'Portsmouth', rat:78, age:37, caps:50, goals:0, nat:'England', height:193, weight:93, foot:'right',
    attrs:{ han:14, ref:14, kic:13, aer:15, thw:13, onv:13, sta:11, com:12, dec:13, bra:13, lea:12, pos:14 },
    bio:"Veteran keeper on his last England legs. Still capable but age showing.", traits:['Experienced'], weaknesses:['Age','Errors'] },
  { id:'martyn_n08', name:'Scott Carson', dob:'1985-09-03', pos:'GK', posG:'GK', club:'Aston Villa', rat:73, age:22, caps:4, goals:0, nat:'England', height:190, weight:87, foot:'right',
    attrs:{ han:14, ref:14, kic:12, aer:14, thw:13, onv:13, sta:14, com:12, dec:12, bra:13, lea:11, pos:13 },
    bio:"Young goalkeeper who allowed an 18-yard shot to fly through him against Croatia in qualifying — England failed to qualify as a result.", traits:['Young','Athletic'], weaknesses:['Errors','Catastrophic Moment','Experience'] },
  { id:'warnock_n', name:'Stephen Warnock', dob:'1981-12-12', pos:'LB', posG:'DEF', club:'Blackburn', rat:74, age:26, caps:2, goals:0, nat:'England', height:173, weight:70, foot:'left',
    attrs:{ fin:7, sho:9, hea:10, pas:12, lng:11, cro:13, dri:12, tec:12, fre:8, pac:15, acc:14, sta:15, str:11, jum:10, agi:14, vis:12, dec:12, com:12, pos:14, wor:15, bra:13, lea:11, tac:14, mar:13, int:12 },
    bio:"Blackburn left back. Quick, attacks well, decent option when Cole is unavailable.", traits:['Pace','Overlapping'], weaknesses:['Aerial','Consistency'] },
  { id:'king_l08', name:'Ledley King', dob:'1980-10-12', pos:'CB', posG:'DEF', club:'Tottenham', rat:84, age:27, caps:18, goals:2, nat:'England', height:188, weight:84, foot:'right',
    attrs:{ fin:6, sho:8, hea:16, pas:14, lng:13, cro:7, dri:9, tec:13, fre:7, pac:13, acc:12, sta:10, str:16, jum:16, agi:12, vis:14, dec:16, com:15, pos:17, wor:11, bra:15, lea:15, tac:17, mar:16, int:16 },
    bio:"World class when fit. Cannot train. The most gifted yet most fragile of England centre backs.", traits:['World Class When Fit','Reading the Game','Natural Talent'], weaknesses:['Cannot Train','Stamina','Fitness'] },
  { id:'ferdinand_r08b', name:'Joleon Lescott', dob:'1982-08-16', pos:'CB', posG:'DEF', club:'Everton', rat:79, age:25, caps:8, goals:1, nat:'England', height:188, weight:85, foot:'right',
    attrs:{ fin:6, sho:9, hea:16, pas:12, lng:11, cro:6, dri:7, tec:11, fre:7, pac:13, acc:12, sta:14, str:16, jum:16, agi:11, vis:12, dec:13, com:13, pos:15, wor:14, bra:15, lea:14, tac:15, mar:15, int:14 },
    bio:"Everton's powerful centre back. Strong in the air, physical, reliable.", traits:['Aerial Dominant','Physical','Reliable'], weaknesses:['Ball Playing','Pace'] },
  { id:'carrick_m08b', name:'Michael Carrick', dob:'1981-07-28', pos:'CM', posG:'MID', club:'Man Utd', rat:81, age:26, caps:12, goals:0, nat:'England', height:188, weight:80, foot:'right',
    attrs:{ fin:9, sho:11, hea:12, pas:17, lng:16, cro:10, dri:11, tec:15, fre:11, pac:12, acc:11, sta:15, str:12, jum:12, agi:11, vis:16, dec:16, com:15, pos:17, wor:14, bra:13, lea:13, tac:14, mar:12, int:15 },
    bio:"Champions League winner with United. The passing and positional intelligence is elite — consistently underplayed by McClaren.", traits:['Passing Master','Champions League Winner','Positional Intelligence'], weaknesses:['Pace','Goals','Under-recognised'] },
  { id:'lennon_a08', name:'Aaron Lennon', dob:'1987-04-16', pos:'RM', posG:'MID', club:'Tottenham', rat:78, age:20, caps:10, goals:0, nat:'England', height:165, weight:63, foot:'right',
    attrs:{ fin:10, sho:11, hea:8, pas:11, lng:9, cro:12, dri:17, tec:14, fre:9, pac:19, acc:19, sta:14, str:8, jum:9, agi:18, vis:11, dec:12, com:11, pos:12, wor:14, bra:12, lea:10, tac:8, mar:7, int:9 },
    bio:"Lightning quick right winger. Direct, causes problems with pace alone.", traits:['Explosive Pace','Direct Runner'], weaknesses:['Final Product','Physical Strength'] },
  { id:'bent_d08', name:'Darren Bent', dob:'1984-02-06', pos:'ST', posG:'FWD', club:'Tottenham', rat:79, age:23, caps:4, goals:2, nat:'England', height:183, weight:79, foot:'right',
    attrs:{ fin:17, sho:15, hea:15, pas:9, lng:7, cro:5, dri:12, tec:13, fre:10, pac:16, acc:16, sta:13, str:13, jum:14, agi:13, vis:11, dec:14, com:13, pos:15, wor:13, bra:13, lea:11, tac:4, mar:4, int:5 },
    bio:"Prolific club form deserves more England chances. Clinical and mobile.", traits:['Natural Goalscorer','Clinical','Prolific'], weaknesses:['Hold-Up Play','Link-Up'] },
];
window.PLAYERS_2008 = [...window.PLAYERS_2008, ...window.PLAYERS_2008_EXT];
window.PLAYERS_2008_EXT.forEach(p => window.ALL_PLAYERS[p.id] = p);


window.PLAYERS_2008 = window.PLAYERS_2008.concat([
  { id:'green_r08', name:'Robert Green', dob:'1980-01-18', pos:'GK', posG:'GK', club:'West Ham', rat:76, age:27, caps:4, goals:0, nat:'England', height:188, weight:83, foot:'right',
    attrs:{ han:15, ref:15, kic:13, aer:14, thw:13, onv:14, sta:14, com:13, dec:13, bra:13, lea:12, pos:14 },
    bio:"West Ham keeper establishing himself at England level. Solid shot-stopper.", traits:['Shot Stopper','Consistent'], weaknesses:['Distribution','Errors'] },
  { id:'neville_p08', name:'Phil Neville', dob:'1977-01-21', pos:'LB', posG:'DEF', club:'Everton', rat:75, age:30, caps:59, goals:0, nat:'England', height:178, weight:74, foot:'right',
    attrs:{ fin:6, sho:8, hea:11, pas:12, lng:10, cro:11, dri:11, tec:11, fre:7, pac:13, acc:12, sta:14, str:12, jum:11, agi:13, vis:11, dec:14, com:13, pos:14, wor:15, bra:13, lea:13, tac:15, mar:14, int:13 },
    bio:"Experienced squad player. Versatile, reliable, never flashy but rarely costs you.", traits:['Versatile','Experienced','Reliable'], weaknesses:['Creativity','Pace'] },
  { id:'bridge_w08', name:'Wayne Bridge', dob:'1980-08-05', pos:'LB', posG:'DEF', club:'Chelsea', rat:78, age:27, caps:36, goals:1, nat:'England', height:174, weight:73, foot:'left',
    attrs:{ fin:7, sho:9, hea:10, pas:13, lng:11, cro:14, dri:13, tec:13, fre:10, pac:16, acc:15, sta:15, str:11, jum:10, agi:15, vis:13, dec:13, com:13, pos:14, wor:15, bra:13, lea:12, tac:15, mar:14, int:12 },
    bio:"Left back competing with Cole. Quick and capable going forward.", traits:['Pace','Left Foot','Overlapping'], weaknesses:['Second Choice','Aerial'] },
  { id:'barry_g08', name:'Gareth Barry', dob:'1981-02-23', pos:'CM', posG:'MID', club:'Aston Villa', rat:81, age:26, caps:30, goals:3, nat:'England', height:181, weight:79, foot:'left',
    attrs:{ fin:10, sho:12, hea:12, pas:15, lng:14, cro:11, dri:11, tec:13, fre:13, pac:12, acc:11, sta:18, str:13, jum:12, agi:12, vis:15, dec:15, com:14, pos:16, wor:18, bra:14, lea:14, tac:15, mar:13, int:15 },
    bio:"Villa's midfield lynchpin. Excellent left-footed passer, great stamina and positioning. Should be England regular.", traits:['Stamina','Left Foot','Passing','Positioning'], weaknesses:['Creativity','Pace'] },
  { id:'cole_j08', name:'Joe Cole', dob:'1981-11-08', pos:'CM', posG:'MID', club:'Chelsea', rat:81, age:26, caps:48, goals:9, nat:'England', height:176, weight:76, foot:'right',
    attrs:{ fin:13, sho:15, hea:10, pas:15, lng:13, cro:13, dri:17, tec:18, fre:14, pac:14, acc:14, sta:14, str:10, jum:10, agi:17, vis:16, dec:14, com:13, pos:13, wor:14, bra:13, lea:13, tac:9, mar:8, int:10 },
    bio:"England's most naturally talented wide/attacking midfielder. Technique is supreme. Underused by McClaren.", traits:['Technical Genius','Creative','Dribbler'], weaknesses:['Consistency','Physical Strength'] },
  { id:'defoe_j08', name:'Jermain Defoe', dob:'1982-10-07', pos:'ST', posG:'FWD', club:'Tottenham', rat:81, age:25, caps:24, goals:8, nat:'England', height:170, weight:67, foot:'right',
    attrs:{ fin:17, sho:15, hea:10, pas:9, lng:7, cro:5, dri:14, tec:14, fre:9, pac:17, acc:18, sta:13, str:10, jum:10, agi:17, vis:12, dec:14, com:13, pos:16, wor:13, bra:12, lea:11, tac:3, mar:3, int:4 },
    bio:"Prolific poacher at Spurs. Quick, sharp, instinctive. England should be using him more.", traits:['Poacher','Clinical','Acceleration'], weaknesses:['Hold-Up Play','Physical','Heading'] },
]);
window.PLAYERS_2008.forEach(p => window.ALL_PLAYERS[p.id] = p);
