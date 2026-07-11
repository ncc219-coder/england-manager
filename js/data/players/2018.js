/**
 * 2018.js — England squad, Gareth Southgate, Russia 2018
 * Semi-finalists. It's Coming Home. Lost to Croatia in extra time.
 */
window.ALL_PLAYERS = window.ALL_PLAYERS || {};
window.PLAYERS_2018 = [
  { id:'pickford_j18', name:'Jordan Pickford', dob:'1994-03-07', pos:'GK', posG:'GK', club:'Everton', rat:84, age:24, caps:10, goals:0, nat:'England', height:185, weight:78, foot:'right',
    attrs:{ han:16, ref:17, kic:15, aer:15, thw:15, onv:17, sta:14, com:15, dec:15, bra:16, lea:14, pos:16 },
    bio:'Agile, athletic, brave. Saves Trippier-like quality in the Colombia penalty shootout. England\'s bright young keeper.', traits:['Agile','Shot Stopper','Penalty Stopper'], weaknesses:['Aerial Dominance','Concentration'] },
  { id:'trippier_k', name:'Kieran Trippier', dob:'1990-09-19', pos:'RB', posG:'DEF', club:'Tottenham', rat:82, age:27, caps:7, goals:0, nat:'England', height:175, weight:73, foot:'right',
    attrs:{ fin:9, sho:11, hea:11, pas:14, lng:13, cro:17, dri:12, tec:13, fre:17, pac:13, acc:13, sta:16, str:12, jum:11, agi:13, vis:14, dec:14, com:14, pos:14, wor:16, bra:14, lea:13, tac:14, mar:13, int:13 },
    bio:'Scores the free kick in the semi-final against Croatia. England\'s most dangerous player. Delivery and crossing are exceptional.', traits:['Crosser','Free Kick Specialist','Set Piece Deliverer'], weaknesses:['Pace','Defending Against Pace'] },
  { id:'maguire_h', name:'Harry Maguire', dob:'1993-03-05', pos:'CB', posG:'DEF', club:'Leicester', rat:81, age:25, caps:10, goals:1, nat:'England', height:194, weight:100, foot:'right',
    attrs:{ fin:6, sho:9, hea:18, pas:13, lng:12, cro:6, dri:8, tec:11, fre:8, pac:12, acc:11, sta:14, str:18, jum:18, agi:8, vis:13, dec:14, com:13, pos:16, wor:14, bra:16, lea:15, tac:16, mar:17, int:14 },
    bio:'Massive physical presence. Headers goals at set pieces — scores against Sweden in the quarters. Big Slabhead. Imposing aerial defender.', traits:['Aerial Dominant','Set Piece Threat','Physical Presence'], weaknesses:['Pace','Agility','Ball Carrying'] },
  { id:'stones_j', name:'John Stones', dob:'1994-05-28', pos:'CB', posG:'DEF', club:'Man City', rat:82, age:23, caps:28, goals:3, nat:'England', height:188, weight:80, foot:'right',
    attrs:{ fin:6, sho:8, hea:15, pas:15, lng:14, cro:7, dri:11, tec:14, fre:7, pac:14, acc:13, sta:14, str:15, jum:15, agi:13, vis:14, dec:15, com:14, pos:16, wor:14, bra:15, lea:14, tac:15, mar:15, int:14 },
    bio:'Elegant, ball-playing defender developed under Guardiola at City. Comfortable in possession, composed under pressure.', traits:['Ball Playing Defender','Composed Under Pressure','Technical'], weaknesses:['Concentration','Aerial Against Physicality'] },
  { id:'young_a', name:'Ashley Young', dob:'1985-07-09', pos:'LB', posG:'DEF', club:'Man Utd', rat:77, age:32, caps:39, goals:7, nat:'England', height:175, weight:73, foot:'right',
    attrs:{ fin:9, sho:12, hea:11, pas:12, lng:11, cro:14, dri:13, tec:13, fre:12, pac:14, acc:13, sta:14, str:11, jum:11, agi:14, vis:13, dec:13, com:13, pos:14, wor:15, bra:13, lea:13, tac:13, mar:13, int:12 },
    bio:'Versatile option who plays left back for England. Experienced, reliable, good delivery.', traits:['Versatile','Experienced','Set Piece Delivery'], weaknesses:['Consistency','Defensive Positioning'] },
  { id:'henderson_j', name:'Jordan Henderson', dob:'1990-06-17', pos:'CM', posG:'MID', club:'Liverpool', rat:82, age:27, caps:46, goals:0, nat:'England', height:182, weight:74, foot:'right',
    attrs:{ fin:9, sho:12, hea:13, pas:14, lng:13, cro:11, dri:12, tec:12, fre:11, pac:14, acc:13, sta:17, str:14, jum:13, agi:13, vis:14, dec:14, com:14, pos:14, wor:18, bra:15, lea:16, tac:14, mar:13, int:14 },
    bio:'The engine of England\'s midfield. Massive work rate, organises the team, high stamina. Underrated but absolutely vital.', traits:['Engine','Leader','High Work Rate','Organiser'], weaknesses:['Creative Output','Goals'] },
  { id:'alli_d', name:'Dele Alli', dob:'1996-04-11', pos:'CM', posG:'MID', club:'Tottenham', rat:83, age:22, caps:37, goals:3, nat:'England', height:188, weight:76, foot:'right',
    attrs:{ fin:16, sho:15, hea:14, pas:14, lng:12, cro:11, dri:15, tec:16, fre:13, pac:14, acc:13, sta:14, str:14, jum:14, agi:14, vis:15, dec:14, com:14, pos:15, wor:14, bra:15, lea:13, tac:11, mar:10, int:12 },
    bio:'Wonderfully gifted late-arriving midfielder. Goals from midfield, dribbling ability, physical. Still finding consistency.', traits:['Goals From Midfield','Late Runner','Technically Gifted','Physical'], weaknesses:['Consistency','Decision Making'] },
  { id:'bellingham_j18', name:'Jesse Lingard', dob:'1992-12-15', pos:'CM', posG:'MID', club:'Man Utd', rat:77, age:25, caps:18, goals:4, nat:'England', height:174, weight:71, foot:'right',
    attrs:{ fin:13, sho:12, hea:10, pas:12, lng:10, cro:11, dri:14, tec:14, fre:11, pac:15, acc:14, sta:14, str:10, jum:10, agi:15, vis:12, dec:13, com:13, pos:13, wor:16, bra:12, lea:11, tac:10, mar:9, int:10 },
    bio:'Energetic, direct, scores a stunning volley vs Panama. Not the most technical but energy and enthusiasm carry him.', traits:['Energy','Direct','Goal of the Tournament'], weaknesses:['Technical Quality','Decision Making'] },
  { id:'kane_h', name:'Harry Kane', dob:'1993-07-28', pos:'ST', posG:'FWD', club:'Tottenham', rat:90, age:24, caps:26, goals:17, nat:'England', height:188, weight:86, foot:'right',
    attrs:{ fin:19, sho:18, hea:18, pas:13, lng:10, cro:7, dri:13, tec:15, fre:15, pac:15, acc:14, sta:16, str:17, jum:17, agi:13, vis:15, dec:17, com:17, pos:17, wor:15, bra:17, lea:17, tac:7, mar:6, int:8 },
    bio:'The new Shearer. Clinical, powerful, brilliant in the air, takes penalties with ice in his veins. Top scorer at the tournament with 6. World class.', traits:['World Class','Clinical Finisher','Aerial Dominant','Penalty Specialist','Tournament Player'],
    weaknesses:['Tracking Back','Dribbling Past Players'] },
  { id:'sterling_r18', name:'Raheem Sterling', dob:'1994-12-08', pos:'LM', posG:'MID', club:'Man City', rat:86, age:23, caps:48, goals:14, nat:'England', height:170, weight:69, foot:'right',
    attrs:{ fin:15, sho:14, hea:10, pas:14, lng:11, cro:13, dri:18, tec:17, fre:11, pac:19, acc:18, sta:15, str:9, jum:9, agi:18, vis:15, dec:14, com:13, pos:14, wor:16, bra:14, lea:13, tac:9, mar:8, int:10 },
    bio:'Outstanding for City under Guardiola. Direct, fast, technically excellent. Frustrates fans with end product but his movement and running create huge problems.', traits:['Explosive Pace','Dribbler','Direct Runner','Technical'], weaknesses:['Final Product','Aerial Work','Physical Strength'] },
  { id:'rashford_m18', name:'Marcus Rashford', dob:'1997-10-31', pos:'ST', posG:'FWD', club:'Man Utd', rat:83, age:20, caps:24, goals:6, nat:'England', height:180, weight:70, foot:'right',
    attrs:{ fin:16, sho:15, hea:11, pas:12, lng:10, cro:9, dri:16, tec:15, fre:13, pac:18, acc:18, sta:14, str:12, jum:11, agi:16, vis:14, dec:13, com:12, pos:15, wor:15, bra:14, lea:12, tac:5, mar:5, int:6 },
    bio:'Explosive, direct, young. Scores penalties in the Colombia shootout. Still raw but huge potential.', traits:['Explosive Pace','Young Talent','Direct','Penalty Taker'], weaknesses:['Consistency','Decision Making','Hold-Up Play'] },
];
window.PLAYERS_2018.forEach(p => window.ALL_PLAYERS[p.id] = p);

window.PLAYERS_2018_EXT = [
  { id:'stones_j18', name:'Gary Cahill', dob:'1985-12-19', pos:'CB', posG:'DEF', club:'Chelsea', rat:80, age:32, caps:61, goals:5, nat:'England', height:190, weight:84, foot:'right',
    attrs:{ fin:6, sho:9, hea:17, pas:12, lng:10, cro:6, dri:7, tec:10, fre:7, pac:11, acc:10, sta:14, str:17, jum:17, agi:9, vis:11, dec:14, com:14, pos:15, wor:14, bra:16, lea:15, tac:16, mar:16, int:13 },
    bio:"Experienced centre back. Champions League winner. Good squad option as cover for the starters.", traits:['Experienced','Aerial','Physical'], weaknesses:['Pace','Ball Playing','Age'] },
  { id:'walker_k', name:'Kyle Walker', dob:'1990-05-28', pos:'RB', posG:'DEF', club:'Man City', rat:83, age:27, caps:38, goals:0, nat:'England', height:183, weight:76, foot:'right',
    attrs:{ fin:7, sho:10, hea:12, pas:13, lng:12, cro:13, dri:14, tec:13, fre:9, pac:19, acc:18, sta:16, str:14, jum:13, agi:15, vis:13, dec:14, com:13, pos:15, wor:16, bra:14, lea:13, tac:15, mar:14, int:13 },
    bio:"The fastest right back in the world. Guardiola turned him into a quality footballer as well as an explosive athlete.", traits:['Explosive Pace','Athletic','Guardiola-Developed'], weaknesses:['Crossing Quality','Concentration'] },
  { id:'dier_e', name:'Eric Dier', dob:'1994-01-15', pos:'CM', posG:'MID', club:'Tottenham', rat:78, age:24, caps:28, goals:3, nat:'England', height:188, weight:87, foot:'right',
    attrs:{ fin:9, sho:12, hea:14, pas:14, lng:13, cro:9, dri:10, tec:12, fre:11, pac:13, acc:12, sta:16, str:15, jum:14, agi:11, vis:13, dec:14, com:14, pos:16, wor:16, bra:15, lea:14, tac:15, mar:14, int:15 },
    bio:"Physical defensive midfielder or centre back. Screens the back four, wins headers, organises. Reliable if unspectacular.", traits:['Defensive Screen','Aerial','Versatile','Reliable'], weaknesses:['Creativity','Pace','Technical Level'] },
  { id:'oxlade_chamberlain_a', name:'Alex Oxlade-Chamberlain', dob:'1993-08-15', pos:'CM', posG:'MID', club:'Liverpool', rat:80, age:24, caps:35, goals:8, nat:'England', height:180, weight:77, foot:'right',
    attrs:{ fin:13, sho:14, hea:11, pas:13, lng:12, cro:12, dri:16, tec:15, fre:12, pac:16, acc:16, sta:15, str:13, jum:11, agi:16, vis:14, dec:13, com:13, pos:14, wor:16, bra:14, lea:12, tac:11, mar:10, int:12 },
    bio:"Athletic, direct, box-to-box threat. Has rebuilt his game at Liverpool under Klopp. Tears knee ligaments before the tournament.", traits:['Athletic','Direct','Box To Box'], weaknesses:['Injury','Final Product','Decision Making'] },
  { id:'lingard_j18', name:'Ruben Loftus-Cheek', dob:'1996-01-23', pos:'CM', posG:'MID', club:'Chelsea', rat:77, age:22, caps:8, goals:3, nat:'England', height:191, weight:89, foot:'right',
    attrs:{ fin:13, sho:14, hea:13, pas:13, lng:11, cro:10, dri:14, tec:15, fre:11, pac:14, acc:13, sta:15, str:17, jum:14, agi:13, vis:14, dec:13, com:13, pos:14, wor:15, bra:14, lea:12, tac:11, mar:10, int:11 },
    bio:"Powerful, tall midfielder. Physical presence, technical ability and athleticism. On loan at Crystal Palace where he has excelled.", traits:['Physical','Technical','Powerful'], weaknesses:['Injury Prone','Consistency','Experience'] },
  { id:'vardy_j', name:'Jamie Vardy', dob:'1987-01-11', pos:'ST', posG:'FWD', club:'Leicester', rat:83, age:31, caps:26, goals:7, nat:'England', height:179, weight:74, foot:'right',
    attrs:{ fin:16, sho:16, hea:12, pas:10, lng:8, cro:6, dri:14, tec:13, fre:10, pac:18, acc:18, sta:15, str:12, jum:12, agi:16, vis:13, dec:14, com:14, pos:16, wor:16, bra:14, lea:13, tac:4, mar:4, int:5 },
    bio:"Non-league to Premier League to World Cup. Explosive, clinical. Runs channels brilliantly. Chose not to join the squad.", traits:['Explosive Pace','Clinical','Counter Attack Specialist','Against All Odds Story'],
    weaknesses:['Aerial Work','Hold-Up Play','Involvement in Build-Up'] },
];
window.PLAYERS_2018 = [...window.PLAYERS_2018, ...window.PLAYERS_2018_EXT];
window.PLAYERS_2018_EXT.forEach(p => window.ALL_PLAYERS[p.id] = p);


window.PLAYERS_2018 = window.PLAYERS_2018.concat([
  { id:'pope_n', name:'Nick Pope', dob:'1992-04-19', pos:'GK', posG:'GK', club:'Burnley', rat:78, age:25, caps:1, goals:0, fut:'England', height:194, weight:88, foot:'right',
    attrs:{ han:15, ref:15, kic:13, aer:15, thw:13, onv:14, sta:14, com:13, dec:14, bra:14, lea:12, pos:14 },
    bio:"Burnley's consistent keeper who has earned his first cap. Commanding, solid shot-stopper. Will be Pickford's long-term competition.", traits:['Consistent','Commanding'], weaknesses:['Distribution','Experience'] },
  { id:'gomez_j', name:'Joe Gomez', dob:'1997-05-23', pos:'CB', posG:'DEF', club:'Liverpool', rat:78, age:20, caps:3, goals:0, nat:'England', height:188, weight:82, foot:'right',
    attrs:{ fin:5, sho:7, hea:14, pas:12, lng:11, cro:5, dri:9, tec:11, fre:6, pac:16, acc:15, sta:14, str:14, jum:14, agi:13, vis:12, dec:13, com:13, pos:14, wor:14, bra:14, lea:12, tac:14, mar:14, int:13 },
    bio:"Young Liverpool centre back with exceptional pace and athleticism. Will only get better under Klopp.", traits:['Pace','High Potential','Athletic','Modern Defender'], weaknesses:['Experience','Aerials Under Pressure'] },
  { id:'chilwell_b', name:'Ben Chilwell', dob:'1996-12-21', pos:'LB', posG:'DEF', club:'Leicester', rat:78, age:21, caps:2, goals:0, nat:'England', height:178, weight:77, foot:'left',
    attrs:{ fin:8, sho:11, hea:11, pas:13, lng:12, cro:14, dri:14, tec:13, fre:11, pac:16, acc:15, sta:15, str:12, jum:11, agi:15, vis:13, dec:13, com:13, pos:14, wor:15, bra:13, lea:12, tac:14, mar:13, int:13 },
    bio:"Left back at Leicester with genuine quality. Pace, directness, good delivery. Will challenge Shaw for the shirt.", traits:['Pace','Left Foot','Overlapping','High Potential'], weaknesses:['Experience','Aerial'] },
  { id:'winks_h', name:'Harry Winks', dob:'1996-02-02', pos:'CM', posG:'MID', club:'Tottenham', rat:75, age:22, caps:5, goals:0, nat:'England', height:177, weight:70, foot:'right',
    attrs:{ fin:8, sho:10, hea:9, pas:15, lng:13, cro:9, dri:12, tec:14, fre:10, pac:13, acc:12, sta:14, str:10, jum:9, agi:14, vis:14, dec:14, com:13, pos:15, wor:15, bra:12, lea:12, tac:12, mar:11, int:13 },
    bio:"Quietly excellent passer under Pochettino at Spurs. Technically clean, positionally intelligent.", traits:['Passing','Positional Intelligence','Technical'], weaknesses:['Physical Strength','Aerial','Experience'] },
  { id:'butland_j', name:'Jack Butland', dob:'1993-03-10', pos:'GK', posG:'GK', club:'Stoke', rat:78, age:24, caps:8, goals:0, nat:'England', height:196, weight:94, foot:'right',
    attrs:{ han:15, ref:16, kic:13, aer:15, thw:14, onv:15, sta:14, com:13, dec:14, bra:14, lea:12, pos:15 },
    bio:"Tall, commanding keeper at Stoke. Picked up a serious ankle injury in qualifying but has recovered. Good shot-stopper.", traits:['Commanding','Shot Stopper','Aerial'], weaknesses:['Concentration','Club Level'] },
  { id:'loftus_cheek_r', name:'Ruben Loftus-Cheek', dob:'1996-01-23', pos:'CM', posG:'MID', club:'Crystal Palace', rat:77, age:22, caps:8, goals:3, nat:'England', height:191, weight:89, foot:'right',
    attrs:{ fin:13, sho:14, hea:13, pas:13, lng:11, cro:10, dri:14, tec:15, fre:11, pac:14, acc:13, sta:15, str:17, jum:14, agi:13, vis:14, dec:13, com:13, pos:14, wor:15, bra:14, lea:12, tac:11, mar:10, int:11 },
    bio:"Powerful, physically imposing midfielder on loan at Palace. Has the tools to be an elite midfielder.", traits:['Physical','Technical','Power'], weaknesses:['Injury Prone','Consistency','Experience'] },
]);
window.PLAYERS_2018.forEach(p => window.ALL_PLAYERS[p.id] = p);
