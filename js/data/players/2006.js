/**
 * 2006.js — England squad, Sven-Goran Eriksson, Germany World Cup
 * Rooney sent off vs Portugal. Lost on penalties. The Golden Generation falls again.
 */
window.ALL_PLAYERS = window.ALL_PLAYERS || {};
window.PLAYERS_2006 = [
  { id:'robinson_p06', name:'Paul Robinson', dob:'1979-10-15', pos:'GK', posG:'GK', club:'Tottenham', rat:82, age:26, caps:31, goals:0, nat:'England', height:193, weight:90, foot:'right',
    attrs:{ han:16, ref:16, kic:11, aer:16, thw:14, onv:15, sta:14, com:13, dec:14, bra:14, lea:13, pos:15 },
    bio:'England\'s number one. Shot-stopping quality is excellent but distribution and concentration can falter. Misses in penalties.', traits:['Shot Stopper','Commanding'], weaknesses:['Distribution','Concentration'] },
  { id:'neville_g06', name:'Gary Neville', dob:'1975-02-18', pos:'RB', posG:'DEF', club:'Man Utd', rat:82, age:31, caps:80, goals:0, nat:'England', height:178, weight:74, foot:'right',
    attrs:{ fin:6, sho:9, hea:12, pas:13, lng:11, cro:11, dri:11, tec:12, fre:7, pac:13, acc:12, sta:16, str:13, jum:12, agi:13, vis:13, dec:16, com:15, pos:16, wor:17, bra:16, lea:16, tac:16, mar:16, int:15 },
    bio:'Winding down but still England\'s most reliable right back. Experience and reading of the game remain superb.', traits:['Experienced','Organised','Leader'], weaknesses:['Pace','Age'] },
  { id:'ferdinand_r06', name:'Rio Ferdinand', dob:'1978-11-07', pos:'CB', posG:'DEF', club:'Man Utd', rat:88, age:27, caps:55, goals:1, nat:'England', height:188, weight:82, foot:'right',
    attrs:{ fin:5, sho:7, hea:16, pas:15, lng:14, cro:7, dri:10, tec:14, fre:7, pac:15, acc:14, sta:14, str:16, jum:16, agi:13, vis:14, dec:17, com:15, pos:17, wor:14, bra:15, lea:16, tac:17, mar:17, int:16 },
    bio:'One of the best centre backs in the world. Misses the start through injury. Elegant, composed, reads the game at the highest level.', traits:['World Class','Ball Playing Defender','Composed','Reading the Game'], weaknesses:['Concentration','Injury Prone'] },
  { id:'terry_j', name:'John Terry', dob:'1980-12-07', pos:'CB', posG:'DEF', club:'Chelsea', rat:88, age:25, caps:33, goals:6, nat:'England', height:187, weight:86, foot:'right',
    attrs:{ fin:7, sho:10, hea:18, pas:13, lng:11, cro:7, dri:8, tec:11, fre:9, pac:12, acc:11, sta:15, str:18, jum:18, agi:10, vis:13, dec:15, com:16, pos:17, wor:16, bra:18, lea:18, tac:17, mar:18, int:15 },
    bio:'The most dominant centre back in England. Aerial colossus, total commitment. Born leader — should be captain.', traits:['Aerial Dominant','Leader','Physical Presence','Captain Material'], weaknesses:['Pace','Agility'] },
  { id:'cole_a06', name:'Ashley Cole', dob:'1980-12-20', pos:'LB', posG:'DEF', club:'Arsenal', rat:88, age:25, caps:52, goals:0, nat:'England', height:176, weight:68, foot:'left',
    attrs:{ fin:8, sho:11, hea:12, pas:14, lng:12, cro:14, dri:16, tec:15, fre:9, pac:18, acc:18, sta:17, str:14, jum:13, agi:17, vis:14, dec:15, com:14, pos:16, wor:17, bra:16, lea:14, tac:17, mar:16, int:15 },
    bio:'The best left back on the planet. Pace, defending, going forward — complete full back.', traits:['World Class','Best in World at Position','Pace','Left Foot'], weaknesses:['Final Ball'] },
  { id:'beckham_d06', name:'David Beckham', dob:'1975-05-02', pos:'RM', posG:'MID', club:'Real Madrid', rat:86, age:30, caps:92, goals:17, nat:'England', height:183, weight:75, foot:'right',
    attrs:{ fin:12, sho:14, hea:12, pas:17, lng:17, cro:19, dri:13, tec:16, fre:19, pac:13, acc:12, sta:14, str:11, jum:12, agi:13, vis:15, dec:15, com:16, pos:14, wor:16, bra:14, lea:17, tac:10, mar:9, int:10 },
    bio:'Playing for his country one last time after recovering from metatarsal. The dead-ball delivery remains world class. Substituted on to score against Ecuador.', traits:['Free Kick Specialist','Crosser','Captain','World Class Delivery'], weaknesses:['Pace','Dribbling'] },
  { id:'lampard_f', name:'Frank Lampard', dob:'1978-06-20', pos:'CM', posG:'MID', club:'Chelsea', rat:88, age:27, caps:49, goals:14, nat:'England', height:184, weight:84, foot:'right',
    attrs:{ fin:17, sho:17, hea:14, pas:16, lng:14, cro:12, dri:13, tec:15, fre:15, pac:14, acc:13, sta:17, str:14, jum:14, agi:13, vis:16, dec:16, com:16, pos:16, wor:18, bra:15, lea:15, tac:14, mar:13, int:15 },
    bio:'Goals from midfield machine. One of the most prolific midfielders in Europe. Strong, technical, great stamina. Cannot gel with Gerrard.', traits:['Goals From Midfield','Engine','Technical','Physical'], weaknesses:['Compatibility with Gerrard'] },
  { id:'gerrard_s', name:'Steven Gerrard', dob:'1980-05-30', pos:'CM', posG:'MID', club:'Liverpool', rat:90, age:25, caps:42, goals:11, nat:'England', height:183, weight:84, foot:'right',
    attrs:{ fin:15, sho:17, hea:15, pas:17, lng:17, cro:13, dri:15, tec:16, fre:16, pac:16, acc:15, sta:17, str:17, jum:14, agi:15, vis:17, dec:16, com:16, pos:15, wor:18, bra:18, lea:18, tac:15, mar:13, int:15 },
    bio:'One of the finest complete midfielders of his generation. Power, vision, goals, leadership — does everything. Cannot gel with Lampard.', traits:['Complete Midfielder','Leader','Captain','Goals From Midfield','Engine'], weaknesses:['Playing with Lampard'] },
  { id:'rooney_w', name:'Wayne Rooney', dob:'1985-10-24', pos:'ST', posG:'FWD', club:'Man Utd', rat:89, age:20, caps:30, goals:11, nat:'England', height:178, weight:83, foot:'right',
    attrs:{ fin:18, sho:17, hea:15, pas:15, lng:12, cro:9, dri:18, tec:17, fre:14, pac:16, acc:16, sta:17, str:17, jum:14, agi:15, vis:17, dec:15, com:12, pos:16, wor:18, bra:18, lea:14, tac:10, mar:9, int:11 },
    bio:'Sent off against Portugal after a clash with Ronaldo. England\'s most complete striker — power, skill, vision, work rate. Brilliant when not suspended or injured.', traits:['Complete Forward','Power','Dribbler','Work Rate','Temper'], weaknesses:['Discipline','Composure'] },
  { id:'owen_m06', name:'Michael Owen', dob:'1979-12-14', pos:'ST', posG:'FWD', club:'Newcastle', rat:83, age:26, caps:89, goals:40, nat:'England', height:173, weight:68, foot:'right',
    attrs:{ fin:18, sho:16, hea:11, pas:10, lng:8, cro:5, dri:14, tec:14, fre:8, pac:18, acc:19, sta:13, str:10, jum:11, agi:16, vis:13, dec:15, com:14, pos:16, wor:12, bra:13, lea:13, tac:3, mar:3, int:4 },
    bio:'Tears his cruciate against Sweden in the group stage. England\'s all-time leading scorer in World Cups. Desperately unlucky.', traits:['Clinical Finisher','Explosive Pace'], weaknesses:['Injury Prone','Hold-Up Play'] },
  { id:'crouch_p', name:'Peter Crouch', dob:'1981-01-30', pos:'ST', posG:'FWD', club:'Liverpool', rat:78, age:25, caps:15, goals:6, nat:'England', height:201, weight:88, foot:'right',
    attrs:{ fin:13, sho:12, hea:19, pas:11, lng:9, cro:7, dri:9, tec:12, fre:9, pac:11, acc:10, sta:15, str:14, jum:18, agi:9, vis:12, dec:13, com:13, pos:14, wor:15, bra:14, lea:12, tac:6, mar:6, int:7 },
    bio:'The original giant target man. Extraordinary in the air, surprisingly technical for his size. Scores with a spectacular scissors kick.', traits:['Aerial Dominant','Target Man','Technical for Height'], weaknesses:['Pace','Ground Play'] },
];
window.PLAYERS_2006.forEach(p => window.ALL_PLAYERS[p.id] = p);

window.PLAYERS_2006_EXT = [
  { id:'neville_p06', name:'Phil Neville', dob:'1977-01-21', pos:'LB', posG:'DEF', club:'Everton', rat:76, age:29, caps:59, goals:0, nat:'England', height:178, weight:74, foot:'right',
    attrs:{ fin:6, sho:8, hea:11, pas:12, lng:10, cro:11, dri:11, tec:11, fre:7, pac:13, acc:12, sta:15, str:12, jum:11, agi:13, vis:11, dec:14, com:13, pos:14, wor:16, bra:13, lea:13, tac:15, mar:14, int:13 },
    bio:"Versatile and reliable. Doesn't cost you goals but rarely wins you games. Dependable squad option.", traits:['Versatile','Reliable'], weaknesses:['Creativity','Pace'] },
  { id:'brown_w06', name:'Wes Brown', dob:'1979-10-13', pos:'CB', posG:'DEF', club:'Man Utd', rat:79, age:26, caps:21, goals:0, nat:'England', height:186, weight:80, foot:'right',
    attrs:{ fin:5, sho:7, hea:15, pas:12, lng:10, cro:6, dri:8, tec:11, fre:6, pac:15, acc:14, sta:14, str:15, jum:15, agi:13, vis:12, dec:14, com:13, pos:15, wor:14, bra:14, lea:13, tac:15, mar:15, int:14 },
    bio:"Composed, athletic United centre back. When injury-free he offers pace and quality.", traits:['Pace','Composed'], weaknesses:['Injury Prone'] },
  { id:'carragher_j', name:'Jamie Carragher', dob:'1978-01-28', pos:'CB', posG:'DEF', club:'Liverpool', rat:83, age:28, caps:34, goals:0, nat:'England', height:183, weight:76, foot:'right',
    attrs:{ fin:5, sho:7, hea:16, pas:12, lng:11, cro:6, dri:7, tec:11, fre:6, pac:12, acc:11, sta:16, str:15, jum:16, agi:10, vis:13, dec:16, com:15, pos:17, wor:16, bra:17, lea:16, tac:16, mar:16, int:16 },
    bio:"Champions League winner with Liverpool. Reading the game at the highest level. Better than his England opportunities suggest.", traits:['Reading the Game','Leader','Never Gives Up','Champions League Winner'], weaknesses:['Pace','Ball Playing'] },
  { id:'hargreaves_o', name:'Owen Hargreaves', dob:'1981-01-20', pos:'CM', posG:'MID', club:'Bayern Munich', rat:81, age:25, caps:42, goals:0, nat:'England', height:181, weight:76, foot:'right',
    attrs:{ fin:9, sho:12, hea:12, pas:13, lng:12, cro:10, dri:12, tec:13, fre:12, pac:14, acc:13, sta:17, str:14, jum:12, agi:13, vis:14, dec:14, com:14, pos:15, wor:18, bra:15, lea:13, tac:16, mar:14, int:16 },
    bio:"Best player in the tournament. Covers every blade of grass, wins tackles, distributes well. Playing Champions League football at Bayern Munich.", traits:['Engine','Ball Winner','Tournament Star','Champions League Experience'], weaknesses:['Goals','Creativity'] },
  { id:'lennon_a', name:'Aaron Lennon', dob:'1987-04-16', pos:'RM', posG:'MID', club:'Tottenham', rat:77, age:19, caps:5, goals:0, nat:'England', height:165, weight:63, foot:'right',
    attrs:{ fin:10, sho:11, hea:8, pas:11, lng:10, cro:12, dri:16, tec:14, fre:9, pac:19, acc:19, sta:14, str:8, jum:9, agi:18, vis:11, dec:12, com:11, pos:12, wor:14, bra:12, lea:10, tac:8, mar:7, int:9 },
    bio:"Lightning fast right winger. Causes defenders massive problems with pace alone. Crosses can be excellent.", traits:['Explosive Pace','Direct Runner','Young Talent'], weaknesses:['Final Product','Physical Strength','Aerial'] },
  { id:'downing_s', name:'Stewart Downing', dob:'1984-07-22', pos:'LM', posG:'MID', club:'Middlesbrough', rat:77, age:21, caps:5, goals:0, nat:'England', height:177, weight:68, foot:'left',
    attrs:{ fin:10, sho:12, hea:9, pas:14, lng:12, cro:16, dri:14, tec:14, fre:13, pac:15, acc:14, sta:14, str:9, jum:9, agi:14, vis:14, dec:13, com:12, pos:12, wor:13, bra:11, lea:10, tac:8, mar:7, int:9 },
    bio:"Left-footed wide midfielder with excellent crossing. Consistent Middlesbrough player who will earn many England caps.", traits:['Crosser','Left Foot','Consistent'], weaknesses:['Physical Strength','Goals'] },
  { id:'bent_d', name:'Darren Bent', dob:'1984-02-06', pos:'ST', posG:'FWD', club:'Charlton', rat:77, age:22, caps:0, goals:0, nat:'England', height:183, weight:79, foot:'right',
    attrs:{ fin:16, sho:15, hea:14, pas:9, lng:7, cro:5, dri:11, tec:12, fre:9, pac:16, acc:16, sta:13, str:13, jum:14, agi:13, vis:11, dec:14, com:13, pos:15, wor:13, bra:13, lea:11, tac:4, mar:4, int:5 },
    bio:"Prolific natural goalscorer at Charlton. 18 league goals. Deserves a chance at this level.", traits:['Natural Goalscorer','Pace','Clinical'], weaknesses:['Hold-Up Play','Link-Up'] },
];
window.PLAYERS_2006 = [...window.PLAYERS_2006, ...window.PLAYERS_2006_EXT];
window.PLAYERS_2006_EXT.forEach(p => window.ALL_PLAYERS[p.id] = p);


window.PLAYERS_2006 = window.PLAYERS_2006.concat([
  { id:'robinson_p06b', name:'Scott Carson', dob:'1985-09-03', pos:'GK', posG:'GK', club:'Liverpool', rat:72, age:20, caps:0, goals:0, nat:'England', height:190, weight:87, foot:'right',
    attrs:{ han:14, ref:14, kic:12, aer:14, thw:12, onv:13, sta:14, com:12, dec:12, bra:13, lea:11, pos:13 },
    bio:"Young keeper developing at Liverpool. Loanee who shows promise.", traits:['Young','Athletic'], weaknesses:['Experience','Concentration'] },
  { id:'bridge_w06', name:'Wayne Bridge', dob:'1980-08-05', pos:'LB', posG:'DEF', club:'Chelsea', rat:79, age:25, caps:36, goals:1, nat:'England', height:174, weight:73, foot:'left',
    attrs:{ fin:7, sho:9, hea:10, pas:13, lng:11, cro:14, dri:14, tec:13, fre:10, pac:16, acc:15, sta:15, str:11, jum:10, agi:15, vis:13, dec:14, com:13, pos:14, wor:15, bra:14, lea:12, tac:15, mar:14, int:13 },
    bio:"Chelsea's backup left back behind Cole. Quick, technical, decent going forward.", traits:['Pace','Left Foot','Technical'], weaknesses:['Second Choice','Aerial'] },
  { id:'lescott_j', name:'Joleon Lescott', dob:'1982-08-16', pos:'CB', posG:'DEF', club:'Everton', rat:77, age:23, caps:0, goals:0, nat:'England', height:188, weight:85, foot:'right',
    attrs:{ fin:6, sho:9, hea:16, pas:12, lng:11, cro:6, dri:7, tec:11, fre:7, pac:13, acc:12, sta:14, str:16, jum:16, agi:11, vis:12, dec:13, com:13, pos:15, wor:14, bra:15, lea:14, tac:15, mar:15, int:14 },
    bio:"Powerful Everton centre back. Good in the air, physical, reliable. Deserves his first call-up.", traits:['Aerial Dominant','Physical','Reliable'], weaknesses:['Ball Playing','Pace'] },
  { id:'barry_g06', name:'Gareth Barry', dob:'1981-02-23', pos:'CM', posG:'MID', club:'Aston Villa', rat:80, age:24, caps:18, goals:2, nat:'England', height:181, weight:79, foot:'left',
    attrs:{ fin:10, sho:12, hea:12, pas:15, lng:14, cro:11, dri:11, tec:13, fre:13, pac:12, acc:11, sta:18, str:13, jum:12, agi:12, vis:14, dec:15, com:14, pos:16, wor:18, bra:14, lea:14, tac:15, mar:13, int:14 },
    bio:"Excellent central midfielder. Left foot, great range of passing, immense stamina. Hugely underrated.", traits:['Stamina','Left Foot','Passing Range','Underrated'], weaknesses:['Creativity','Pace'] },
  { id:'cole_j06', name:'Joe Cole', dob:'1981-11-08', pos:'CM', posG:'MID', club:'Chelsea', rat:83, age:24, caps:34, goals:6, nat:'England', height:176, weight:76, foot:'right',
    attrs:{ fin:13, sho:15, hea:10, pas:15, lng:13, cro:14, dri:17, tec:18, fre:14, pac:15, acc:14, sta:14, str:10, jum:10, agi:17, vis:16, dec:15, com:14, pos:14, wor:15, bra:13, lea:13, tac:9, mar:8, int:10 },
    bio:"Chelsea's creative spark. Sublime technique, bags of skill. Stars at this World Cup with a screamer against Sweden.", traits:['Technical Genius','Dribbler','Goals From Midfield','Big Game Player'], weaknesses:['Physical Strength','Aerial'] },
  { id:'defoe_j06', name:'Jermain Defoe', dob:'1982-10-07', pos:'ST', posG:'FWD', club:'Tottenham', rat:79, age:23, caps:18, goals:6, nat:'England', height:170, weight:67, foot:'right',
    attrs:{ fin:17, sho:15, hea:10, pas:9, lng:7, cro:5, dri:14, tec:14, fre:9, pac:17, acc:18, sta:13, str:10, jum:10, agi:17, vis:12, dec:14, com:13, pos:16, wor:13, bra:12, lea:11, tac:3, mar:3, int:4 },
    bio:"Electric poacher. Quick, sharp, clinical in the box. Doesn't always get the chance but always scores when he does.", traits:['Poacher','Explosive Acceleration','Clinical'], weaknesses:['Hold-Up Play','Physical','Heading'] },
]);
window.PLAYERS_2006.forEach(p => window.ALL_PLAYERS[p.id] = p);
