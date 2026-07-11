/**
 * 2000.js — England squad, Kevin Keegan, UEFA Euro 2000
 * Group stage exit after losing to Romania. Beaten by Portugal 3-2, drew Germany.
 */
window.ALL_PLAYERS = window.ALL_PLAYERS || {};
window.PLAYERS_2000 = [
  { id:'seaman_d00', name:'David Seaman', dob:'1963-09-19', pos:'GK', posG:'GK', club:'Arsenal', rat:86, age:36, caps:72, goals:0, nat:'England', height:191, weight:90, foot:'right',
    attrs:{ han:17, ref:17, kic:14, aer:17, thw:14, onv:17, sta:12, com:17, dec:16, bra:15, lea:15, pos:18 },
    bio:'Still England\'s number one at 36. Commanding, experienced, exceptional positioning.', traits:['Commanding Presence','Shot Stopper','Experienced'], weaknesses:['Age','Distribution'] },
  { id:'neville_g00', name:'Gary Neville', dob:'1975-02-18', pos:'RB', posG:'DEF', club:'Man Utd', rat:83, age:25, caps:40, goals:0, nat:'England', height:178, weight:74, foot:'right',
    attrs:{ fin:6, sho:9, hea:12, pas:13, lng:11, cro:12, dri:12, tec:12, fre:7, pac:14, acc:14, sta:17, str:13, jum:12, agi:13, vis:13, dec:16, com:15, pos:16, wor:18, bra:16, lea:15, tac:17, mar:16, int:15 },
    bio:'England\'s first choice right back. Disciplined, organised, good attacking contribution.', traits:['Organised','High Work Rate','Consistent'], weaknesses:['Creative Play'] },
  { id:'adams_t00', name:'Tony Adams', dob:'1966-10-10', pos:'CB', posG:'DEF', club:'Arsenal', rat:85, age:33, caps:62, goals:5, nat:'England', height:188, weight:85, foot:'right',
    attrs:{ fin:6, sho:9, hea:18, pas:13, lng:11, cro:7, dri:7, tec:11, fre:7, pac:9, acc:8, sta:13, str:17, jum:17, agi:8, vis:13, dec:16, com:17, pos:17, wor:14, bra:19, lea:19, tac:17, mar:18, int:16 },
    bio:'Captaining England in one of his last tournaments. Authority, leadership, still the dominant defensive personality in English football.', traits:['Captain','Leader','Aerial','Organiser'], weaknesses:['Pace','Age'] },
  { id:'campbell_s00', name:'Sol Campbell', dob:'1974-09-18', pos:'CB', posG:'DEF', club:'Tottenham', rat:85, age:25, caps:30, goals:1, nat:'England', height:188, weight:87, foot:'right',
    attrs:{ fin:5, sho:9, hea:18, pas:12, lng:10, cro:6, dri:8, tec:11, fre:6, pac:15, acc:14, sta:15, str:19, jum:18, agi:12, vis:12, dec:15, com:15, pos:16, wor:15, bra:18, lea:16, tac:17, mar:17, int:14 },
    bio:'Physical, dominant. Among the best defenders in Europe. About to make his controversial move to Arsenal.', traits:['Physical Presence','Aerial Dominant','Pace','World Class'], weaknesses:['Distribution'] },
  { id:'cole_a00', name:'Ashley Cole', dob:'1980-12-20', pos:'LB', posG:'DEF', club:'Arsenal', rat:79, age:19, caps:1, goals:0, nat:'England', height:176, weight:68, foot:'left',
    attrs:{ fin:7, sho:10, hea:11, pas:13, lng:11, cro:13, dri:15, tec:14, fre:8, pac:17, acc:17, sta:15, str:12, jum:11, agi:16, vis:13, dec:13, com:13, pos:14, wor:15, bra:14, lea:11, tac:15, mar:14, int:13 },
    bio:'Bursting onto the scene at 19. Already pace and defensive quality evident. The future of English left back play.', traits:['High Potential','Pace','Left Foot'], weaknesses:['Experience','Decision Making'] },
  { id:'beckham_d00', name:'David Beckham', dob:'1975-05-02', pos:'RM', posG:'MID', club:'Man Utd', rat:85, age:24, caps:38, goals:5, nat:'England', height:183, weight:75, foot:'right',
    attrs:{ fin:12, sho:14, hea:11, pas:17, lng:17, cro:19, dri:13, tec:16, fre:19, pac:14, acc:13, sta:14, str:11, jum:12, agi:13, vis:15, dec:14, com:14, pos:14, wor:16, bra:14, lea:15, tac:10, mar:9, int:10 },
    bio:'The best crosser in the world. Three Lions captain in waiting. Free kick quality is immaculate.', traits:['World Class Crosser','Free Kick Specialist','Set Piece Deliverer'], weaknesses:['Pace','Dribbling'] },
  { id:'scholes_p00', name:'Paul Scholes', dob:'1974-11-16', pos:'CM', posG:'MID', club:'Man Utd', rat:86, age:25, caps:35, goals:14, nat:'England', height:170, weight:72, foot:'right',
    attrs:{ fin:16, sho:16, hea:12, pas:18, lng:17, cro:11, dri:14, tec:18, fre:15, pac:13, acc:13, sta:16, str:12, jum:11, agi:14, vis:18, dec:17, com:16, pos:15, wor:15, bra:13, lea:13, tac:12, mar:11, int:14 },
    bio:'One of the finest midfielders in world football. But played out of position — and makes a mistake against Romania. England\'s exit.',
    traits:['Vision','Technical Genius','Goals From Midfield'], weaknesses:['Tackling','Playing Out of Position','Aerial'] },
  { id:'shearer_a00', name:'Alan Shearer', dob:'1970-08-13', pos:'ST', posG:'FWD', club:'Newcastle', rat:88, age:29, caps:60, goals:30, nat:'England', height:183, weight:82, foot:'right',
    attrs:{ fin:19, sho:19, hea:18, pas:11, lng:9, cro:7, dri:12, tec:13, fre:14, pac:14, acc:13, sta:16, str:18, jum:17, agi:12, vis:13, dec:16, com:16, pos:17, wor:14, bra:17, lea:17, tac:7, mar:6, int:7 },
    bio:'One last shot at international glory. Scores the winner against Germany. Retires from international football after the tournament.', traits:['Power Striker','Aerial','Clinical','Penalty Specialist'], weaknesses:['Link-Up Play'] },
  { id:'owen_m00', name:'Michael Owen', dob:'1979-12-14', pos:'ST', posG:'FWD', club:'Liverpool', rat:85, age:20, caps:20, goals:9, nat:'England', height:173, weight:68, foot:'right',
    attrs:{ fin:18, sho:16, hea:11, pas:10, lng:8, cro:5, dri:15, tec:15, fre:8, pac:19, acc:19, sta:13, str:10, jum:11, agi:16, vis:13, dec:14, com:14, pos:16, wor:12, bra:13, lea:12, tac:3, mar:3, int:4 },
    bio:'20 years old and already world class. Rapid, clinical, makes opponents look slow. The golden boy of English football.', traits:['Explosive Pace','Clinical Finisher','Young Talent'], weaknesses:['Hold-Up Play','Heading'] },
  { id:'figo_k00', name:'Kevin Phillips', dob:'1973-07-25', pos:'ST', posG:'FWD', club:'Sunderland', rat:80, age:26, caps:7, goals:0, nat:'England', height:170, weight:65, foot:'right',
    attrs:{ fin:17, sho:16, hea:12, pas:9, lng:7, cro:6, dri:13, tec:14, fre:9, pac:16, acc:16, sta:13, str:10, jum:12, agi:15, vis:12, dec:14, com:14, pos:16, wor:13, bra:12, lea:11, tac:3, mar:3, int:4 },
    bio:'European Golden Boot winner this season. Clinical, direct, prolific. Underused by England.', traits:['Clinical','Prolific','Pace'], weaknesses:['Height','Hold-Up Play','Physical Duels'] },
];
window.PLAYERS_2000.forEach(p => window.ALL_PLAYERS[p.id] = p);


window.PLAYERS_2000_EXT = [
  { id:'james_d00b', name:'David James', dob:'1970-08-01', pos:'GK', posG:'GK', club:'Aston Villa', rat:79, age:29, caps:15, goals:0, nat:'England', height:193, weight:93, foot:'right',
    attrs:{ han:14, ref:16, kic:13, aer:15, thw:13, onv:14, sta:14, com:11, dec:12, bra:13, lea:11, pos:14 },
    bio:"Athletic keeper with occasional lapses. Solid alternative to Seaman.", traits:['Shot Stopper','Athletic'], weaknesses:['Errors','Concentration'] },
  { id:'martyn_n', name:'Nigel Martyn', dob:'1966-08-11', pos:'GK', posG:'GK', club:'Leeds Utd', rat:80, age:33, caps:17, goals:0, nat:'England', height:183, weight:82, foot:'right',
    attrs:{ han:16, ref:16, kic:14, aer:15, thw:14, onv:15, sta:13, com:15, dec:15, bra:14, lea:14, pos:15 },
    bio:"Outstanding keeper who has never got the credit he deserves. Better than his cap total suggests.", traits:['Reliable','Consistent','Underrated'], weaknesses:['Opportunities Given'] },
  { id:'southgate_g00', name:'Gareth Southgate', dob:'1970-09-03', pos:'CB', posG:'DEF', club:'Aston Villa', rat:79, age:29, caps:45, goals:1, nat:'England', height:180, weight:77, foot:'right',
    attrs:{ fin:6, sho:8, hea:15, pas:13, lng:11, cro:7, dri:9, tec:12, fre:8, pac:12, acc:11, sta:14, str:14, jum:14, agi:12, vis:13, dec:14, com:13, pos:15, wor:14, bra:14, lea:14, tac:15, mar:15, int:14 },
    bio:"Composed, technically solid. Has overcome the penalty miss to become a senior figure in the squad.", traits:['Composed','Experienced','Resilient'], weaknesses:['Pace','Aerial Dominance'] },
  { id:'keown_m00', name:'Martin Keown', dob:'1966-07-24', pos:'CB', posG:'DEF', club:'Arsenal', rat:81, age:33, caps:40, goals:0, nat:'England', height:183, weight:77, foot:'right',
    attrs:{ fin:5, sho:7, hea:15, pas:12, lng:10, cro:6, dri:7, tec:11, fre:6, pac:12, acc:11, sta:14, str:15, jum:15, agi:12, vis:12, dec:14, com:14, pos:16, wor:16, bra:17, lea:14, tac:16, mar:18, int:15 },
    bio:"Double-winning Arsenal defender. Relentless marker. Part of the most miserly defence in England.", traits:['Tenacious Marker','Double Winner'], weaknesses:['Age','Ball Playing'] },
  { id:'dyer_k00', name:'Kieron Dyer', dob:'1978-12-29', pos:'CM', posG:'MID', club:'Newcastle', rat:77, age:21, caps:6, goals:0, nat:'England', height:170, weight:61, foot:'right',
    attrs:{ fin:11, sho:12, hea:9, pas:13, lng:11, cro:12, dri:17, tec:15, fre:10, pac:18, acc:18, sta:13, str:9, jum:9, agi:18, vis:13, dec:12, com:11, pos:12, wor:14, bra:12, lea:10, tac:9, mar:8, int:10 },
    bio:"Explosive Newcastle midfielder. Devastating pace and dribbling.", traits:['Explosive Pace','Dribbler','Young Talent'], weaknesses:['Injury Prone','Finishing'] },
  { id:'batty_d00', name:'David Batty', dob:'1968-12-02', pos:'CM', posG:'MID', club:'Leeds Utd', rat:79, age:31, caps:42, goals:0, nat:'England', height:172, weight:74, foot:'right',
    attrs:{ fin:6, sho:10, hea:12, pas:13, lng:11, cro:8, dri:11, tec:12, fre:8, pac:13, acc:12, sta:17, str:14, jum:10, agi:12, vis:12, dec:14, com:14, pos:15, wor:19, bra:16, lea:13, tac:16, mar:14, int:15 },
    bio:"Still England's midfield terrier. Relentless, combative. Missed in the penalty shootout in France 98 but keeps getting recalled.", traits:['Ball Winner','Engine','Tireless'], weaknesses:['Goals','Creativity','Penalties'] },
  { id:'fowler_r00', name:'Robbie Fowler', dob:'1975-04-09', pos:'ST', posG:'FWD', club:'Liverpool', rat:84, age:25, caps:20, goals:7, nat:'England', height:180, weight:77, foot:'right',
    attrs:{ fin:18, sho:17, hea:13, pas:10, lng:8, cro:6, dri:14, tec:16, fre:11, pac:15, acc:15, sta:13, str:12, jum:12, agi:14, vis:13, dec:15, com:14, pos:16, wor:12, bra:13, lea:12, tac:4, mar:4, int:5 },
    bio:"God. One of the best natural goalscorers in Europe. Should be starting for England.", traits:['Natural Goalscorer','Clinical','God'], weaknesses:['Hold-Up Play','Injuries'] },
  { id:'cole_a00b', name:'Andy Cole', dob:'1971-10-15', pos:'ST', posG:'FWD', club:'Man Utd', rat:83, age:28, caps:15, goals:1, nat:'England', height:178, weight:74, foot:'right',
    attrs:{ fin:17, sho:16, hea:13, pas:10, lng:8, cro:6, dri:14, tec:14, fre:9, pac:17, acc:16, sta:14, str:13, jum:12, agi:15, vis:13, dec:15, com:14, pos:16, wor:14, bra:13, lea:12, tac:3, mar:3, int:4 },
    bio:"Treble winner with United. Clinical and explosive. One of the best strikers in Europe yet bizarrely underused by England.", traits:['Clinical','Explosive','Prolific','Treble Winner'], weaknesses:['Hold-Up Play','International Opportunity'] },
];
window.PLAYERS_2000 = [...window.PLAYERS_2000, ...window.PLAYERS_2000_EXT];
window.PLAYERS_2000_EXT.forEach(p => window.ALL_PLAYERS[p.id] = p);


window.PLAYERS_2000 = window.PLAYERS_2000.concat([
  { id:'martyn_n00', name:'Nigel Martyn', dob:'1966-08-11', pos:'GK', posG:'GK', club:'Leeds Utd', rat:81, age:33, caps:15, goals:0, nat:'England', height:183, weight:82, foot:'right',
    attrs:{ han:16, ref:15, kic:14, aer:15, thw:13, onv:15, sta:13, com:15, dec:15, bra:14, lea:14, pos:15 },
    bio:"Still performing at the highest level at Leeds. Many feel Seaman should be given competition for the shirt.", traits:['Consistent','Underrated'], weaknesses:['Recognition'] },
  { id:'keown_m00b', name:'Gareth Southgate', dob:'1970-09-03', pos:'CB', posG:'DEF', club:'Aston Villa', rat:79, age:29, caps:40, goals:1, nat:'England', height:180, weight:77, foot:'right',
    attrs:{ fin:6, sho:8, hea:15, pas:13, lng:11, cro:7, dri:9, tec:12, fre:8, pac:12, acc:11, sta:14, str:14, jum:14, agi:12, vis:13, dec:14, com:13, pos:15, wor:14, bra:14, lea:14, tac:15, mar:15, int:14 },
    bio:"Composed central defender. Bounced back from the Euro 96 miss to become a senior England figure.", traits:['Composed','Experienced','Resilient'], weaknesses:['Pace','Aerial Dominance'] },
  { id:'campbell_s00b', name:'Martin Keown', dob:'1966-07-24', pos:'CB', posG:'DEF', club:'Arsenal', rat:81, age:33, caps:40, goals:0, nat:'England', height:183, weight:77, foot:'right',
    attrs:{ fin:5, sho:7, hea:15, pas:12, lng:10, cro:6, dri:7, tec:11, fre:6, pac:12, acc:11, sta:14, str:15, jum:15, agi:12, vis:12, dec:14, com:14, pos:16, wor:16, bra:17, lea:14, tac:16, mar:18, int:15 },
    bio:"Invincible. Still England's most relentless marker. Defensive discipline of the very highest order.", traits:['Tenacious Marker','Double Winner'], weaknesses:['Age','Ball Playing'] },
  { id:'barry_g00', name:'Gareth Barry', dob:'1981-02-23', pos:'CM', posG:'MID', club:'Aston Villa', rat:74, age:19, caps:0, goals:0, nat:'England', height:181, weight:79, foot:'left',
    attrs:{ fin:9, sho:11, hea:12, pas:14, lng:13, cro:11, dri:10, tec:12, fre:11, pac:12, acc:11, sta:16, str:13, jum:12, agi:12, vis:13, dec:13, com:13, pos:15, wor:16, bra:13, lea:13, tac:13, mar:12, int:13 },
    bio:"Young Aston Villa midfielder developing under John Gregory. Left-footed, good range of passing, will go on to be England's most-capped outfield player.", traits:['High Potential','Left Foot','Stamina'], weaknesses:['Age','Creativity'] },
  { id:'dyer_k00b', name:'Kieron Dyer', dob:'1978-12-29', pos:'CM', posG:'MID', club:'Newcastle', rat:77, age:21, caps:6, goals:0, nat:'England', height:170, weight:61, foot:'right',
    attrs:{ fin:11, sho:12, hea:9, pas:13, lng:11, cro:12, dri:17, tec:15, fre:10, pac:18, acc:18, sta:13, str:9, jum:9, agi:18, vis:13, dec:12, com:11, pos:12, wor:14, bra:12, lea:10, tac:9, mar:8, int:10 },
    bio:"Explosive pace and directness. Will be central to England's midfield for the next few years.", traits:['Explosive Pace','Dribbler'], weaknesses:['Injury Prone','Finishing'] },
  { id:'heskey_e00', name:'Emile Heskey', dob:'1978-01-11', pos:'ST', posG:'FWD', club:'Liverpool', rat:78, age:22, caps:10, goals:0, nat:'England', height:188, weight:86, foot:'right',
    attrs:{ fin:12, sho:12, hea:16, pas:11, lng:8, cro:6, dri:12, tec:12, fre:7, pac:16, acc:15, sta:16, str:18, jum:16, agi:12, vis:11, dec:12, com:12, pos:13, wor:16, bra:15, lea:12, tac:5, mar:5, int:5 },
    bio:"Powerful striker just signed by Liverpool. Pace, strength, aerial ability — physical attributes are exceptional.", traits:['Physical','Hold-Up Play','Pace'], weaknesses:['Finishing','Goals'] },
  { id:'cole_a00c', name:'Andy Cole', dob:'1971-10-15', pos:'ST', posG:'FWD', club:'Man Utd', rat:83, age:28, caps:15, goals:1, nat:'England', height:178, weight:74, foot:'right',
    attrs:{ fin:17, sho:16, hea:13, pas:10, lng:8, cro:6, dri:14, tec:14, fre:9, pac:17, acc:16, sta:14, str:13, jum:12, agi:15, vis:12, dec:15, com:14, pos:16, wor:14, bra:13, lea:13, tac:3, mar:3, int:4 },
    bio:"Treble winner. Clinical, explosive, relentlessly prolific. England's most overlooked striker.", traits:['Prolific','Clinical','Treble Winner'], weaknesses:['Hold-Up Play','International Recognition'] },
  { id:'sutton_c00', name:'Chris Sutton', dob:'1973-03-10', pos:'ST', posG:'FWD', club:'Chelsea', rat:79, age:26, caps:1, goals:0, nat:'England', height:188, weight:83, foot:'right',
    attrs:{ fin:15, sho:14, hea:16, pas:11, lng:9, cro:6, dri:11, tec:12, fre:9, pac:13, acc:12, sta:14, str:17, jum:16, agi:11, vis:13, dec:13, com:13, pos:14, wor:15, bra:15, lea:13, tac:5, mar:5, int:5 },
    bio:"Big, strong, powerful. Fell out with the FA after refusing a call-up to an Under-21 squad. Effective foil for a technical striker.", traits:['Physical','Aerial','Hold-Up Play'], weaknesses:['Technical','International Relations'] },
]);
window.PLAYERS_2000.forEach(p => window.ALL_PLAYERS[p.id] = p);
