/**
 * 2004.js — England squad, Sven-Goran Eriksson, Euro 2004
 * Quarter-finalists. Lost on penalties to Portugal. Rooney breaks through. 
 */
window.ALL_PLAYERS = window.ALL_PLAYERS || {};
window.PLAYERS_2004 = [
  { id:'james_d04', name:'David James', dob:'1970-08-01', pos:'GK', posG:'GK', club:'Man City', rat:80, age:33, caps:40, goals:0, nat:'England', height:193, weight:93, foot:'right',
    attrs:{ han:15, ref:16, kic:13, aer:15, thw:13, onv:14, sta:13, com:12, dec:13, bra:14, lea:12, pos:14 },
    bio:'Athletic shot-stopper. Makes some vital saves in Portugal. Prone to errors but this tournament he\'s excellent.', traits:['Shot Stopper','Athletic'], weaknesses:['Errors','Distribution'] },
  { id:'neville_g04', name:'Gary Neville', dob:'1975-02-18', pos:'RB', posG:'DEF', club:'Man Utd', rat:83, age:29, caps:72, goals:0, nat:'England', height:178, weight:74, foot:'right',
    attrs:{ fin:6, sho:9, hea:12, pas:13, lng:11, cro:12, dri:12, tec:12, fre:7, pac:13, acc:13, sta:16, str:13, jum:12, agi:13, vis:13, dec:16, com:15, pos:16, wor:18, bra:16, lea:15, tac:17, mar:16, int:15 },
    bio:'Dependable and experienced. England\'s automatic first choice right back throughout this era.', traits:['Reliable','Organised','High Work Rate'], weaknesses:['Pace','Creativity'] },
  { id:'terry_j04', name:'John Terry', dob:'1980-12-07', pos:'CB', posG:'DEF', club:'Chelsea', rat:87, age:23, caps:17, goals:4, nat:'England', height:187, weight:86, foot:'right',
    attrs:{ fin:7, sho:10, hea:18, pas:13, lng:11, cro:7, dri:8, tec:11, fre:9, pac:12, acc:11, sta:15, str:18, jum:18, agi:10, vis:13, dec:15, com:16, pos:17, wor:16, bra:18, lea:18, tac:17, mar:18, int:15 },
    bio:'Emerging as the best centre back in England. Dominant, commanding, born leader. Misses the vital penalty.', traits:['Aerial Dominant','Leader','Physical','Captain Material'], weaknesses:['Pace','Penalties'] },
  { id:'campbell_s04', name:'Sol Campbell', dob:'1974-09-18', pos:'CB', posG:'DEF', club:'Arsenal', rat:86, age:29, caps:65, goals:1, nat:'England', height:188, weight:87, foot:'right',
    attrs:{ fin:5, sho:9, hea:18, pas:12, lng:10, cro:6, dri:8, tec:11, fre:6, pac:14, acc:13, sta:15, str:19, jum:18, agi:12, vis:12, dec:15, com:14, pos:16, wor:14, bra:17, lea:15, tac:17, mar:17, int:14 },
    bio:'Invincible. At the peak of his powers after Arsenal\'s unbeaten season. Dominant, physical, commanding.', traits:['Physical Presence','Aerial','World Class'], weaknesses:['Distribution'] },
  { id:'cole_a04', name:'Ashley Cole', dob:'1980-12-20', pos:'LB', posG:'DEF', club:'Arsenal', rat:87, age:23, caps:30, goals:0, nat:'England', height:176, weight:68, foot:'left',
    attrs:{ fin:8, sho:11, hea:12, pas:14, lng:12, cro:14, dri:16, tec:15, fre:9, pac:18, acc:18, sta:17, str:13, jum:12, agi:17, vis:13, dec:15, com:14, pos:16, wor:17, bra:15, lea:14, tac:17, mar:16, int:15 },
    bio:'Best left back in the world. Part of the Invincibles back four. Pace, defending, going forward — total package.', traits:['World Class','Pace','Left Foot','Best in World at Position'], weaknesses:['Final Ball'] },
  { id:'beckham_d04', name:'David Beckham', dob:'1975-05-02', pos:'RM', posG:'MID', club:'Real Madrid', rat:87, age:28, caps:75, goals:14, nat:'England', height:183, weight:75, foot:'right',
    attrs:{ fin:12, sho:15, hea:12, pas:17, lng:17, cro:19, dri:13, tec:16, fre:19, pac:13, acc:12, sta:14, str:11, jum:12, agi:13, vis:15, dec:15, com:15, pos:14, wor:16, bra:14, lea:17, tac:10, mar:9, int:10 },
    bio:'Captain at the Bernabeu. Misses his penalty against Portugal. The delivery and crossing are still the best in world football.', traits:['World Class Delivery','Free Kick Specialist','Captain'], weaknesses:['Pace','Dribbling','Penalties'] },
  { id:'lampard_f04', name:'Frank Lampard', dob:'1978-06-20', pos:'CM', posG:'MID', club:'Chelsea', rat:87, age:25, caps:32, goals:7, nat:'England', height:184, weight:84, foot:'right',
    attrs:{ fin:17, sho:17, hea:14, pas:16, lng:14, cro:12, dri:13, tec:15, fre:15, pac:14, acc:13, sta:17, str:14, jum:14, agi:13, vis:16, dec:16, com:16, pos:16, wor:18, bra:15, lea:15, tac:14, mar:13, int:15 },
    bio:'Goals from midfield, physical, technically excellent. His best seasons at Chelsea. Cannot play alongside Gerrard.', traits:['Goals From Midfield','Engine','Technical'], weaknesses:['Playing with Gerrard','Pace'] },
  { id:'gerrard_s04', name:'Steven Gerrard', dob:'1980-05-30', pos:'CM', posG:'MID', club:'Liverpool', rat:89, age:23, caps:30, goals:6, nat:'England', height:183, weight:84, foot:'right',
    attrs:{ fin:15, sho:17, hea:15, pas:17, lng:16, cro:13, dri:15, tec:16, fre:16, pac:16, acc:15, sta:17, str:17, jum:14, agi:15, vis:17, dec:16, com:16, pos:15, wor:18, bra:18, lea:18, tac:15, mar:13, int:15 },
    bio:'A force of nature. Arguably at his very best here. Complete midfielder — scores, assists, wins tackles, leads.', traits:['Complete Midfielder','Captain','Goals From Midfield','Engine','Leader'], weaknesses:['Playing with Lampard'] },
  { id:'rooney_w04', name:'Wayne Rooney', dob:'1985-10-24', pos:'ST', posG:'FWD', club:'Everton', rat:84, age:18, caps:9, goals:4, nat:'England', height:178, weight:83, foot:'right',
    attrs:{ fin:17, sho:16, hea:13, pas:14, lng:11, cro:8, dri:18, tec:17, fre:13, pac:16, acc:16, sta:16, str:17, jum:13, agi:15, vis:16, dec:14, com:11, pos:15, wor:18, bra:18, lea:12, tac:10, mar:9, int:11 },
    bio:'18 years old and the best player in the tournament until his metatarsal injury changes everything. Raw talent that will define English football for a decade.',
    traits:['Genius Young Talent','Physical','Dribbler','Engine','Complete Forward'], weaknesses:['Composure','Injury','Discipline'] },
  { id:'owen_m04', name:'Michael Owen', dob:'1979-12-14', pos:'ST', posG:'FWD', club:'Real Madrid', rat:85, age:24, caps:71, goals:34, nat:'England', height:173, weight:68, foot:'right',
    attrs:{ fin:18, sho:16, hea:11, pas:10, lng:8, cro:5, dri:16, tec:15, fre:8, pac:19, acc:19, sta:13, str:9, jum:10, agi:17, vis:13, dec:15, com:14, pos:16, wor:12, bra:12, lea:13, tac:3, mar:3, int:4 },
    bio:'At Real Madrid. Scores against Croatia with a superb goal. Still one of the most dangerous strikers when fit.', traits:['Clinical','Explosive Pace','Big Game Player'], weaknesses:['Hold-Up Play','Physical Strength'] },
  { id:'crouch_p04', name:'Peter Crouch', dob:'1981-01-30', pos:'ST', posG:'FWD', club:'Aston Villa', rat:74, age:23, caps:1, goals:0, nat:'England', height:201, weight:88, foot:'right',
    attrs:{ fin:12, sho:11, hea:18, pas:10, lng:8, cro:6, dri:9, tec:11, fre:8, pac:10, acc:9, sta:13, str:13, jum:19, agi:8, vis:11, dec:12, com:12, pos:13, wor:14, bra:13, lea:11, tac:5, mar:5, int:6 },
    bio:'Tall aerial option. Different kind of threat. Will eventually score 22 international goals.', traits:['Aerial Dominant','Target Man'], weaknesses:['Pace','Ground Level Play'] },
];
window.PLAYERS_2004.forEach(p => window.ALL_PLAYERS[p.id] = p);


window.PLAYERS_2004_EXT = [
  { id:'green_r', name:'Robert Green', dob:'1980-01-18', pos:'GK', posG:'GK', club:'Norwich', rat:74, age:24, caps:0, goals:0, nat:'England', height:188, weight:83, foot:'right',
    attrs:{ han:14, ref:15, kic:12, aer:14, thw:13, onv:14, sta:14, com:13, dec:13, bra:13, lea:12, pos:14 },
    bio:"Norwich keeper making his name. Good shot-stopper who will go on to earn England caps — and one infamous error.", traits:['Shot Stopper','Consistent'], weaknesses:['Errors','Decision Making'] },
  { id:'martyn_n04', name:'Nigel Martyn', dob:'1966-08-11', pos:'GK', posG:'GK', club:'Everton', rat:79, age:37, caps:23, goals:0, nat:'England', height:183, weight:82, foot:'right',
    attrs:{ han:15, ref:15, kic:14, aer:15, thw:14, onv:14, sta:11, com:15, dec:15, bra:14, lea:14, pos:15 },
    bio:"Still performing well at Everton in his late 30s. Reliable veteran backup.", traits:['Reliable','Experienced'], weaknesses:['Age'] },
  { id:'king_l04', name:'Ledley King', dob:'1980-10-12', pos:'CB', posG:'DEF', club:'Tottenham', rat:82, age:23, caps:7, goals:2, nat:'England', height:188, weight:84, foot:'right',
    attrs:{ fin:6, sho:8, hea:16, pas:14, lng:13, cro:7, dri:9, tec:13, fre:7, pac:14, acc:13, sta:12, str:16, jum:16, agi:12, vis:14, dec:16, com:15, pos:17, wor:13, bra:15, lea:14, tac:17, mar:16, int:16 },
    bio:"The most naturally gifted centre back in England. Reads the game like no other. Chronic knee problems mean he cannot train — only plays matches.", traits:['Natural Talent','Reading the Game','Technical','When Fit World Class'], weaknesses:['Cannot Train','Stamina','Injury'] },
  { id:'hargreaves_o04', name:'Owen Hargreaves', dob:'1981-01-20', pos:'CM', posG:'MID', club:'Bayern Munich', rat:79, age:23, caps:28, goals:0, nat:'England', height:181, weight:76, foot:'right',
    attrs:{ fin:9, sho:12, hea:12, pas:13, lng:12, cro:10, dri:12, tec:13, fre:12, pac:14, acc:13, sta:17, str:14, jum:12, agi:13, vis:13, dec:14, com:14, pos:15, wor:18, bra:15, lea:12, tac:16, mar:14, int:16 },
    bio:"Engine and ball winner at Bayern Munich. Underused by England despite his quality in Germany.", traits:['Engine','Ball Winner','Champions League Experience'], weaknesses:['Goals','Creativity'] },
  { id:'carrick_m04', name:'Michael Carrick', dob:'1981-07-28', pos:'CM', posG:'MID', club:'West Ham', rat:79, age:22, caps:2, goals:0, nat:'England', height:188, weight:80, foot:'right',
    attrs:{ fin:9, sho:11, hea:12, pas:16, lng:16, cro:10, dri:11, tec:15, fre:10, pac:12, acc:11, sta:15, str:12, jum:12, agi:11, vis:16, dec:15, com:14, pos:16, wor:14, bra:12, lea:12, tac:14, mar:12, int:14 },
    bio:"Elegantly gifted West Ham midfielder. Passing and positional intelligence are elite. Should be in every England squad.", traits:['Passing Master','Positional Intelligence','Technical','Vision'], weaknesses:['Pace','Goals','Recognition'] },
  { id:'wright_phillips_s04', name:'Shaun Wright-Phillips', dob:'1981-10-25', pos:'RM', posG:'MID', club:'Man City', rat:79, age:22, caps:4, goals:0, nat:'England', height:165, weight:62, foot:'right',
    attrs:{ fin:12, sho:13, hea:8, pas:12, lng:10, cro:13, dri:16, tec:15, fre:11, pac:17, acc:17, sta:14, str:8, jum:8, agi:17, vis:13, dec:12, com:12, pos:12, wor:14, bra:12, lea:10, tac:8, mar:7, int:9 },
    bio:"Tiny, electric winger at Man City. Pace and dribbling are devastating. Chelsea will pay big money soon.", traits:['Explosive Pace','Dribbler','Direct'], weaknesses:['Physical Strength','Final Product'] },
  { id:'heskey_e04', name:'Emile Heskey', dob:'1978-01-11', pos:'ST', posG:'FWD', club:'Birmingham', rat:79, age:26, caps:45, goals:7, nat:'England', height:188, weight:86, foot:'right',
    attrs:{ fin:12, sho:12, hea:16, pas:11, lng:9, cro:6, dri:12, tec:12, fre:7, pac:15, acc:14, sta:16, str:18, jum:16, agi:12, vis:11, dec:12, com:12, pos:13, wor:16, bra:15, lea:12, tac:5, mar:5, int:5 },
    bio:"Physical, powerful foil for Owen and Rooney. Creates space and holds ball up brilliantly.", traits:['Hold-Up Play','Physical','Team Player'], weaknesses:['Finishing','Goals'] },
];
window.PLAYERS_2004 = [...window.PLAYERS_2004, ...window.PLAYERS_2004_EXT];
window.PLAYERS_2004_EXT.forEach(p => window.ALL_PLAYERS[p.id] = p);


window.PLAYERS_2004 = window.PLAYERS_2004.concat([
  { id:'robinson_p04', name:'Paul Robinson', dob:'1979-10-15', pos:'GK', posG:'GK', club:'Leeds Utd', rat:79, age:24, caps:9, goals:0, nat:'England', height:193, weight:90, foot:'right',
    attrs:{ han:15, ref:16, kic:12, aer:15, thw:13, onv:14, sta:14, com:13, dec:13, bra:14, lea:12, pos:14 },
    bio:"Big, athletic keeper establishing himself at Leeds. Has taken over from Martyn as England's number two.", traits:['Shot Stopper','Athletic'], weaknesses:['Distribution','Experience'] },
  { id:'neville_p04', name:'Phil Neville', dob:'1977-01-21', pos:'LB', posG:'DEF', club:'Man Utd', rat:76, age:27, caps:52, goals:0, nat:'England', height:178, weight:74, foot:'right',
    attrs:{ fin:6, sho:8, hea:11, pas:12, lng:10, cro:11, dri:11, tec:11, fre:7, pac:13, acc:12, sta:15, str:12, jum:11, agi:13, vis:11, dec:14, com:13, pos:14, wor:16, bra:13, lea:12, tac:15, mar:14, int:13 },
    bio:"Versatile and dependable. Can play either full-back position. Never exciting but rarely costs you.", traits:['Versatile','Reliable'], weaknesses:['Creativity','Pace'] },
  { id:'bridge_w04', name:'Wayne Bridge', dob:'1980-08-05', pos:'LB', posG:'DEF', club:'Chelsea', rat:80, age:23, caps:26, goals:1, nat:'England', height:174, weight:73, foot:'left',
    attrs:{ fin:7, sho:9, hea:10, pas:13, lng:11, cro:14, dri:14, tec:13, fre:10, pac:17, acc:16, sta:15, str:11, jum:10, agi:15, vis:13, dec:14, com:13, pos:14, wor:16, bra:14, lea:12, tac:15, mar:14, int:13 },
    bio:"Chelsea left back competing with Ashley Cole. Pace and technical quality are excellent going forward.", traits:['Pace','Technical','Left Foot','Overlapping'], weaknesses:['Aerial','Second to Cole'] },
  { id:'southgate_g04', name:'Gareth Southgate', dob:'1970-09-03', pos:'CB', posG:'DEF', club:'Middlesbrough', rat:77, age:33, caps:57, goals:1, nat:'England', height:180, weight:77, foot:'right',
    attrs:{ fin:6, sho:8, hea:15, pas:13, lng:11, cro:7, dri:8, tec:12, fre:8, pac:10, acc:9, sta:12, str:14, jum:14, agi:11, vis:13, dec:15, com:14, pos:15, wor:13, bra:14, lea:15, tac:15, mar:15, int:14 },
    bio:"Senior defensive option. Experienced, composed. Near the end of his England career.", traits:['Experienced','Composed','Leader'], weaknesses:['Pace','Age'] },
  { id:'barry_g04', name:'Gareth Barry', dob:'1981-02-23', pos:'CM', posG:'MID', club:'Aston Villa', rat:78, age:22, caps:12, goals:0, nat:'England', height:181, weight:79, foot:'left',
    attrs:{ fin:9, sho:11, hea:12, pas:15, lng:14, cro:11, dri:11, tec:13, fre:12, pac:12, acc:11, sta:17, str:13, jum:12, agi:12, vis:14, dec:15, com:14, pos:15, wor:17, bra:13, lea:14, tac:14, mar:13, int:14 },
    bio:"Becoming a reliable central midfielder. Left foot, passing range, excellent stamina.", traits:['Stamina','Left Foot','Reliable'], weaknesses:['Creativity','Pace'] },
  { id:'cole_j', name:'Joe Cole', dob:'1981-11-08', pos:'CM', posG:'MID', club:'Chelsea', rat:81, age:22, caps:18, goals:1, nat:'England', height:176, weight:76, foot:'right',
    attrs:{ fin:12, sho:14, hea:10, pas:15, lng:13, cro:13, dri:17, tec:17, fre:13, pac:15, acc:14, sta:14, str:10, jum:10, agi:17, vis:15, dec:14, com:13, pos:13, wor:14, bra:13, lea:12, tac:9, mar:8, int:10 },
    bio:"The most naturally gifted of his generation. Sublime technique, can do things no one else can. Developing under Mourinho at Chelsea.", traits:['Technical Genius','Dribbler','Creative','Natural Talent'], weaknesses:['Consistency','Physical Strength','Work Rate'] },
  { id:'johnson_g04', name:'Glen Johnson', dob:'1984-08-23', pos:'RB', posG:'DEF', club:'Chelsea', rat:76, age:19, caps:3, goals:0, nat:'England', height:182, weight:77, foot:'right',
    attrs:{ fin:7, sho:10, hea:11, pas:12, lng:10, cro:12, dri:12, tec:12, fre:7, pac:16, acc:15, sta:14, str:12, jum:11, agi:14, vis:12, dec:12, com:12, pos:13, wor:14, bra:13, lea:11, tac:13, mar:13, int:12 },
    bio:"Young Chelsea right back. Bright, athletic, goes forward well. Will be England's first choice right back.", traits:['Pace','High Potential','Attacking Full Back'], weaknesses:['Experience','Defensive Positioning'] },
  { id:'smith_a04', name:'Alan Smith', dob:'1980-10-28', pos:'ST', posG:'FWD', club:'Leeds Utd', rat:78, age:23, caps:19, goals:7, nat:'England', height:178, weight:76, foot:'right',
    attrs:{ fin:14, sho:14, hea:14, pas:11, lng:9, cro:6, dri:12, tec:12, fre:10, pac:14, acc:13, sta:15, str:15, jum:14, agi:13, vis:12, dec:13, com:12, pos:14, wor:17, bra:17, lea:13, tac:8, mar:8, int:10 },
    bio:"Passionate, aggressive, direct. Scores important goals for England. The terrace hero who gives everything.", traits:['Passionate','Work Rate','Bravery','Terrace Favourite'], weaknesses:['Technical Quality','Composure','Temperament'] },
]);
window.PLAYERS_2004.forEach(p => window.ALL_PLAYERS[p.id] = p);
