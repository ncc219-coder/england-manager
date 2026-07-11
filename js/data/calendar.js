/**
 * calendar.js
 * Defines the management task calendar for each season.
 * Tasks are triggered by date relative to the next fixture.
 *
 * Task types:
 *   SQUAD_ANNOUNCEMENT  — Pick 23-man squad to announce to media
 *   TRAINING_SESSION    — Choose training focus for the squad
 *   PRESS_CONFERENCE    — Pre/post match media questions
 *   SCOUTING_TRIP       — Choose a club match to scout
 *   CONTRACT_REVIEW     — Review player availability / fitness
 *   BOARD_MEETING       — Objectives set by FA board
 */
window.TASK_TYPES = {
  SQUAD_ANNOUNCEMENT: 'SQUAD_ANNOUNCEMENT',
  TRAINING_SESSION:   'TRAINING_SESSION',
  PRESS_CONFERENCE:   'PRESS_CONFERENCE',
  SCOUTING_TRIP:      'SCOUTING_TRIP',
  BOARD_MEETING:      'BOARD_MEETING',
};

/**
 * Generate tasks for a given fixture index.
 * Called when the player reaches the dashboard between fixtures.
 */
window.generateTasksForFixture = function(fixtureIdx) {
  const fix     = window.ALL_FIXTURES[fixtureIdx];
  const prevFix = fixtureIdx > 0 ? window.ALL_FIXTURES[fixtureIdx - 1] : null;
  const tasks   = [];
  const T       = window.TASK_TYPES;

  // Always: board meeting at start of season (first fixture)
  if (fixtureIdx === 0) {
    tasks.push({
      id:       'board_season_start',
      type:     T.BOARD_MEETING,
      title:    'Board Meeting — Season Objectives',
      desc:     'The FA chairman wants to discuss expectations for the coming season.',
      priority: 'medium',
      icon:     '🏛️',
      done:     false,
    });
  }

  // Always: post-match press conference (if previous fixture played)
  if (prevFix) {
    tasks.push({
      id:       `press_post_${fixtureIdx}`,
      type:     T.PRESS_CONFERENCE,
      title:    'Post-Match Press Conference',
      desc:     `Face the media following the ${window.getOppName(prevFix)} fixture.`,
      priority: 'medium',
      icon:     '🎙️',
      done:     false,
    });
  }

  // Always: pre-match press conference
  tasks.push({
    id:       `press_pre_${fixtureIdx}`,
    type:     T.PRESS_CONFERENCE,
    title:    'Pre-Match Press Conference',
    desc:     `Meet the press ahead of ${fix.homeTeam === 'England' ? 'England vs ' + fix.awayTeam : fix.homeTeam + ' vs England'}.`,
    priority: 'medium',
    icon:     '🎙️',
    done:     false,
  });

  // For qualifying / major fixtures: squad announcement
  if (fix.importance === 'high' || fix.importance === 'major') {
    tasks.push({
      id:       `squad_${fixtureIdx}`,
      type:     T.SQUAD_ANNOUNCEMENT,
      title:    'Announce Match Squad',
      desc:     `Select and announce your 23-man squad for the upcoming ${fix.comp}.`,
      priority: 'medium',
      icon:     '📋',
      done:     false,
    });
  }

  // Training session (always)
  tasks.push({
    id:       `training_${fixtureIdx}`,
    type:     T.TRAINING_SESSION,
    title:    'Training Session',
    desc:     'Choose a focus for this week\'s training at the national centre.',
    priority: 'medium',
    icon:     '⚽',
    done:     false,
  });

  // Scouting trip (every 2 fixtures, offset by 1)
  if (fixtureIdx % 2 === 1) {
    tasks.push({
      id:       `scout_${fixtureIdx}`,
      type:     T.SCOUTING_TRIP,
      title:    'Scouting Assignment',
      desc:     'Send your scouts to observe potential England players in club action.',
      priority: 'low',
      icon:     '🔭',
      done:     false,
    });
  }

  return tasks;
};

/**
 * Scouting targets — club fixtures the manager can choose to attend.
 * Grouped by era.
 */
window.SCOUTING_FIXTURES_1986 = [
  { id:'sc_1', date:'1986-10-04', homeTeam:'Everton',         awayTeam:'Arsenal',       venue:'Goodison Park',      players:['lineker_g','steven_t','adams_t'] },
  { id:'sc_2', date:'1986-10-11', homeTeam:'Tottenham',       awayTeam:'Man Utd',        venue:'White Hart Lane',    players:['waddle_c','hoddle_g','robson_b'] },
  { id:'sc_3', date:'1986-10-18', homeTeam:'Liverpool',       awayTeam:'Watford',        venue:'Anfield',            players:['barnes_j'] },
  { id:'sc_4', date:'1986-10-25', homeTeam:'Nott\'m Forest',  awayTeam:'Chelsea',        venue:'City Ground',        players:['pearce_s','walker_d','hodge_s'] },
  { id:'sc_5', date:'1986-11-01', homeTeam:'Arsenal',         awayTeam:'Nott\'m Forest', venue:'Highbury',           players:['rocastle_d','adams_t'] },
  { id:'sc_6', date:'1986-11-08', homeTeam:'Man Utd',         awayTeam:'Coventry',       venue:'Old Trafford',       players:['robson_b','webb_n'] },
  { id:'sc_7', date:'1986-11-15', homeTeam:'Newcastle',       awayTeam:'Oxford Utd',     venue:'St James\'s Park',   players:['gascoigne_p','beardsley_p'] },
  { id:'sc_8', date:'1986-11-22', homeTeam:'Southampton',     awayTeam:'Everton',        venue:'The Dell',           players:['shilton_p','wright_m'] },
  { id:'sc_9', date:'1986-12-06', homeTeam:'Middlesbrough',   awayTeam:'Ipswich Town',   venue:'Ayresome Park',      players:['pallister_g'] },
  { id:'sc_10',date:'1986-12-13', homeTeam:'Tottenham',       awayTeam:'Liverpool',      venue:'White Hart Lane',    players:['waddle_c','hoddle_g'] },
];

window.SCOUTING_FIXTURES_1990 = [
  { id:'sc90_1', date:'1990-09-01', homeTeam:'Arsenal',     awayTeam:'Liverpool',    venue:'Highbury',           players:['seaman_d','adams_t','dixon_l'] },
  { id:'sc90_2', date:'1990-09-15', homeTeam:'Tottenham',   awayTeam:'Man Utd',      venue:'White Hart Lane',    players:['gascoigne_p','lineker_g'] },
  { id:'sc90_3', date:'1990-10-06', homeTeam:'Liverpool',   awayTeam:'Everton',      venue:'Anfield',            players:['beardsley_p','barnes_j'] },
  { id:'sc90_4', date:'1990-10-20', homeTeam:'Man Utd',     awayTeam:'Arsenal',      venue:'Old Trafford',       players:['robson_b','webb_n','pallister_g'] },
  { id:'sc90_5', date:'1990-11-03', homeTeam:'Chelsea',     awayTeam:'Leeds',        venue:'Stamford Bridge',    players:['dorigo_t'] },
  { id:'sc90_6', date:'1990-11-17', homeTeam:'Newcastle',   awayTeam:'Coventry',     venue:"St James's Park",   players:['gascoigne_p'] },
  { id:'sc90_7', date:'1990-12-01', homeTeam:'Everton',     awayTeam:'Tottenham',    venue:'Goodison Park',      players:['lineker_g','steven_t'] },
  { id:'sc90_8', date:'1990-12-15', homeTeam:'Wimbledon',   awayTeam:'Luton',        venue:'Plough Lane',        players:['fashanu_j'] },
];

window.SCOUTING_FIXTURES_1994 = [
  { id:'sc94_1', date:'1994-09-10', homeTeam:'Blackburn',   awayTeam:'Man Utd',      venue:'Ewood Park',         players:['shearer_a','sutton_c'] },
  { id:'sc94_2', date:'1994-09-24', homeTeam:'Arsenal',     awayTeam:'Chelsea',      venue:'Highbury',           players:['adams_t','seaman_d','parlour_r'] },
  { id:'sc94_3', date:'1994-10-08', homeTeam:'Tottenham',   awayTeam:'Blackburn',    venue:'White Hart Lane',    players:['anderton_d','sheringham_t'] },
  { id:'sc94_4', date:'1994-10-22', homeTeam:'Nottm Forest',awayTeam:'Leeds',        venue:'City Ground',        players:['collymore_s','pearce_s'] },
  { id:'sc94_5', date:'1994-11-05', homeTeam:'Aston Villa', awayTeam:'Liverpool',    venue:'Villa Park',         players:['platt_d'] },
  { id:'sc94_6', date:'1994-11-19', homeTeam:'Newcastle',   awayTeam:'QPR',          venue:"St James's Park",   players:['beardsley_p','lee_r'] },
  { id:'sc94_7', date:'1994-12-03', homeTeam:'Leeds',       awayTeam:'Man Utd',      venue:'Elland Road',        players:['batty_d'] },
  { id:'sc94_8', date:'1994-12-17', homeTeam:'Everton',     awayTeam:'Arsenal',      venue:'Goodison Park',      players:['southgate_g','unsworth_d'] },
];

window.SCOUTING_FIXTURES_1996 = [
  { id:'sc96_1', date:'1996-08-17', homeTeam:'Newcastle',   awayTeam:'Man Utd',      venue:"St James's Park",   players:['shearer_a','ferdinand_l','lee_r'] },
  { id:'sc96_2', date:'1996-08-24', homeTeam:'Liverpool',   awayTeam:'Arsenal',      venue:'Anfield',            players:['fowler_r','mcmanaman_s','wright_i'] },
  { id:'sc96_3', date:'1996-09-07', homeTeam:'Chelsea',     awayTeam:'Coventry',     venue:'Stamford Bridge',    players:['wise_d'] },
  { id:'sc96_4', date:'1996-09-21', homeTeam:'Man Utd',     awayTeam:'Tottenham',    venue:'Old Trafford',       players:['beckham_d','scholes_p','butt_n'] },
  { id:'sc96_5', date:'1996-10-05', homeTeam:'Arsenal',     awayTeam:'Leeds',        venue:'Highbury',           players:['adams_t','seaman_d','platt_d'] },
  { id:'sc96_6', date:'1996-10-19', homeTeam:'Aston Villa', awayTeam:'Everton',      venue:'Villa Park',         players:['southgate_g','ehiogu_u'] },
  { id:'sc96_7', date:'1996-11-02', homeTeam:'Tottenham',   awayTeam:'Blackburn',    venue:'White Hart Lane',    players:['anderton_d','sheringham_t'] },
  { id:'sc96_8', date:'1996-11-23', homeTeam:'Liverpool',   awayTeam:'Newcastle',    venue:'Anfield',            players:['fowler_r','owen_m','mcmanaman_s'] },
];

window.SCOUTING_FIXTURES_2000 = [
  { id:'sc00_1', date:'2000-08-19', homeTeam:'Arsenal',     awayTeam:'Sunderland',   venue:'Highbury',           players:['cole_a','campbell_s'] },
  { id:'sc00_2', date:'2000-09-09', homeTeam:'Man Utd',     awayTeam:'Chelsea',      venue:'Old Trafford',       players:['beckham_d','scholes_p','cole_a_j'] },
  { id:'sc00_3', date:'2000-09-23', homeTeam:'Leeds',       awayTeam:'Liverpool',    venue:'Elland Road',        players:['fowler_r','smith_a','mills_d'] },
  { id:'sc00_4', date:'2000-10-07', homeTeam:'Liverpool',   awayTeam:'Arsenal',      venue:'Anfield',            players:['owen_m','heskey_e','gerrard_s'] },
  { id:'sc00_5', date:'2000-10-21', homeTeam:'Chelsea',     awayTeam:'Man Utd',      venue:'Stamford Bridge',    players:['terry_j','lampard_f'] },
  { id:'sc00_6', date:'2000-11-04', homeTeam:'Newcastle',   awayTeam:'Leeds',        venue:"St James's Park",   players:['dyer_k','shearer_a'] },
  { id:'sc00_7', date:'2000-11-18', homeTeam:'Ipswich',     awayTeam:'Sunderland',   venue:'Portman Road',       players:['wright_d','venus_m'] },
  { id:'sc00_8', date:'2000-12-02', homeTeam:'Man Utd',     awayTeam:'Arsenal',      venue:'Old Trafford',       players:['beckham_d','neville_g','ferdinand_r'] },
];

window.SCOUTING_FIXTURES_2004 = [
  { id:'sc04_1', date:'2004-08-14', homeTeam:'Arsenal',     awayTeam:'Everton',      venue:'Highbury',           players:['cole_a','campbell_s'] },
  { id:'sc04_2', date:'2004-08-28', homeTeam:'Man Utd',     awayTeam:'Bolton',       venue:'Old Trafford',       players:['rooney_w','scholes_p','ronaldo_cr'] },
  { id:'sc04_3', date:'2004-09-11', homeTeam:'Liverpool',   awayTeam:'Man City',     venue:'Anfield',            players:['gerrard_s','owen_m'] },
  { id:'sc04_4', date:'2004-09-25', homeTeam:'Chelsea',     awayTeam:'Spurs',        venue:'Stamford Bridge',    players:['lampard_f','terry_j','cole_j'] },
  { id:'sc04_5', date:'2004-10-16', homeTeam:'Everton',     awayTeam:'Arsenal',      venue:'Goodison Park',      players:['cahill_t','rooney_w'] },
  { id:'sc04_6', date:'2004-10-30', homeTeam:'Birmingham',  awayTeam:'Villa',        venue:'St Andrews',         players:['heskey_e'] },
  { id:'sc04_7', date:'2004-11-13', homeTeam:'Bolton',      awayTeam:'Man City',     venue:'Reebok Stadium',     players:['nolan_k'] },
  { id:'sc04_8', date:'2004-12-04', homeTeam:'Tottenham',   awayTeam:'Arsenal',      venue:'White Hart Lane',    players:['defoe_j','king_l'] },
];

window.SCOUTING_FIXTURES_2008 = [
  { id:'sc08_1', date:'2008-08-16', homeTeam:'Man Utd',     awayTeam:'Newcastle',    venue:'Old Trafford',       players:['rooney_w','ferdinand_r','neville_g'] },
  { id:'sc08_2', date:'2008-08-30', homeTeam:'Chelsea',     awayTeam:'Man Utd',      venue:'Stamford Bridge',    players:['lampard_f','terry_j','cole_j'] },
  { id:'sc08_3', date:'2008-09-13', homeTeam:'Liverpool',   awayTeam:'Man Utd',      venue:'Anfield',            players:['gerrard_s','crouch_p','johnson_g'] },
  { id:'sc08_4', date:'2008-09-27', homeTeam:'Arsenal',     awayTeam:'Hull',         venue:'Emirates',           players:['walcott_t','bendtner_n'] },
  { id:'sc08_5', date:'2008-10-18', homeTeam:'Spurs',       awayTeam:'Arsenal',      venue:'White Hart Lane',    players:['woodgate_j','lennon_a'] },
  { id:'sc08_6', date:'2008-11-01', homeTeam:'Man City',    awayTeam:'Chelsea',      venue:'Eastlands',          players:['bridge_w','barry_g'] },
  { id:'sc08_7', date:'2008-11-22', homeTeam:'Everton',     awayTeam:'Spurs',        venue:'Goodison Park',      players:['cahill_t','lescott_j'] },
  { id:'sc08_8', date:'2008-12-06', homeTeam:'Man Utd',     awayTeam:'Arsenal',      venue:'Old Trafford',       players:['rooney_w','ferdinand_r','hargreaves_o'] },
];

window.SCOUTING_FIXTURES_2012 = [
  { id:'sc12_1', date:'2012-08-18', homeTeam:'Man City',    awayTeam:'Liverpool',    venue:'Etihad',             players:['hart_j','milner_j','barry_g'] },
  { id:'sc12_2', date:'2012-09-01', homeTeam:'Arsenal',     awayTeam:'Man Utd',      venue:'Emirates',           players:['walcott_t','oxlaide_chamberlain'] },
  { id:'sc12_3', date:'2012-09-15', homeTeam:'Chelsea',     awayTeam:'Arsenal',      venue:'Stamford Bridge',    players:['terry_j','lampard_f','cole_a'] },
  { id:'sc12_4', date:'2012-09-29', homeTeam:'Man Utd',     awayTeam:'Spurs',        venue:'Old Trafford',       players:['rooney_w','jones_p','cleverley_t'] },
  { id:'sc12_5', date:'2012-10-20', homeTeam:'Liverpool',   awayTeam:'Everton',      venue:'Anfield',            players:['gerrard_s','suarez_l','sturridge_d'] },
  { id:'sc12_6', date:'2012-11-03', homeTeam:'Everton',     awayTeam:'Man City',     venue:'Goodison Park',      players:['cahill_t','baines_l','osman_l'] },
  { id:'sc12_7', date:'2012-11-17', homeTeam:'Swansea',     awayTeam:'Chelsea',      venue:'Liberty Stadium',    players:['allen_j'] },
  { id:'sc12_8', date:'2012-12-01', homeTeam:'Man City',    awayTeam:'Man Utd',      venue:'Etihad',             players:['hart_j','milner_j','lescott_j'] },
];

window.SCOUTING_FIXTURES_2016 = [
  { id:'sc16_1', date:'2016-08-13', homeTeam:'Man Utd',     awayTeam:'Bournemouth',  venue:'Old Trafford',       players:['rashford_m','rooney_w','jones_p'] },
  { id:'sc16_2', date:'2016-08-27', homeTeam:'Chelsea',     awayTeam:'Burnley',      venue:'Stamford Bridge',    players:['cahill_g','ake_n'] },
  { id:'sc16_3', date:'2016-09-10', homeTeam:'Spurs',       awayTeam:'Sunderland',   venue:'White Hart Lane',    players:['kane_h','walker_k','dier_e'] },
  { id:'sc16_4', date:'2016-09-24', homeTeam:'Arsenal',     awayTeam:'Chelsea',      venue:'Emirates',           players:['walcott_t','oxlaide_chamberlain','bellerin_h'] },
  { id:'sc16_5', date:'2016-10-15', homeTeam:'Liverpool',   awayTeam:'Man Utd',      venue:'Anfield',            players:['lallana_a','sturridge_d','henderson_j'] },
  { id:'sc16_6', date:'2016-10-29', homeTeam:'Man City',    awayTeam:'Man Utd',      venue:'Etihad',             players:['stones_j','sterling_r'] },
  { id:'sc16_7', date:'2016-11-19', homeTeam:'Everton',     awayTeam:'Arsenal',      venue:'Goodison Park',      players:['pickford_j','barkley_r'] },
  { id:'sc16_8', date:'2016-12-03', homeTeam:'Spurs',       awayTeam:'Chelsea',      venue:'White Hart Lane',    players:['kane_h','dele_a','trippier_k'] },
];

window.SCOUTING_FIXTURES_2020 = [
  { id:'sc20_1', date:'2020-09-12', homeTeam:'Man Utd',     awayTeam:'Crystal Palace',venue:'Old Trafford',      players:['rashford_m','maguire_h','shaw_l'] },
  { id:'sc20_2', date:'2020-09-26', homeTeam:'Arsenal',     awayTeam:'Man City',     venue:'Emirates',           players:['saka_b','bellamy'] },
  { id:'sc20_3', date:'2020-10-03', homeTeam:'Liverpool',   awayTeam:'Arsenal',      venue:'Anfield',            players:['trippier_k','calvert_lewin_d'] },
  { id:'sc20_4', date:'2020-10-17', homeTeam:'Man City',    awayTeam:'Arsenal',      venue:'Etihad',             players:['sterling_r','stones_j','coady'] },
  { id:'sc20_5', date:'2020-10-31', homeTeam:'Chelsea',     awayTeam:'Burnley',      venue:'Stamford Bridge',    players:['mount_m','james_r','chilwell_b'] },
  { id:'sc20_6', date:'2020-11-21', homeTeam:'Spurs',       awayTeam:'Man City',     venue:'Tottenham Hotspur', players:['trippier_k','dier_e'] },
  { id:'sc20_7', date:'2020-12-05', homeTeam:'Liverpool',   awayTeam:'Wolves',       venue:'Anfield',            players:['henderson_j','oxlaide_chamberlain'] },
  { id:'sc20_8', date:'2020-12-19', homeTeam:'Man Utd',     awayTeam:'Leeds',        venue:'Old Trafford',       players:['rashford_m','greenwood_m','maguire_h'] },
];

window.SCOUTING_FIXTURES_2023 = [
  { id:'sc23_1', date:'2023-08-12', homeTeam:'Man City',    awayTeam:'Burnley',      venue:'Etihad',             players:['stones_j','foden_p'] },
  { id:'sc23_2', date:'2023-08-26', homeTeam:'Arsenal',     awayTeam:'Fulham',       venue:'Emirates',           players:['saka_b','white_b','gabriel_m'] },
  { id:'sc23_3', date:'2023-09-02', homeTeam:'Chelsea',     awayTeam:'Nottm Forest', venue:'Stamford Bridge',    players:['palmer_c','gallagher_c','james_r'] },
  { id:'sc23_4', date:'2023-09-23', homeTeam:'Spurs',       awayTeam:'Liverpool',    venue:'Tottenham Hotspur', players:['maddison_j','dier_e','trippier_k'] },
  { id:'sc23_5', date:'2023-10-07', homeTeam:'Man Utd',     awayTeam:'Brentford',    venue:'Old Trafford',       players:['rashford_m','shaw_l','maguire_h'] },
  { id:'sc23_6', date:'2023-10-21', homeTeam:'Liverpool',   awayTeam:'Everton',      venue:'Anfield',            players:['trent_ah','henderson_j'] },
  { id:'sc23_7', date:'2023-11-04', homeTeam:'Man City',    awayTeam:'Bournemouth',  venue:'Etihad',             players:['foden_p','grealish_j','stones_j'] },
  { id:'sc23_8', date:'2023-11-25', homeTeam:'Arsenal',     awayTeam:'Brentford',    venue:'Emirates',           players:['saka_b','havertz_k','gabriel_m'] },
];

// Smart fixture selector — returns correct era based on campaign date
window.getScoutingFixtures = function() {
  const era = parseInt(State.get('meta.era') || 1986);
  if (era >= 2022) return window.SCOUTING_FIXTURES_2023 || [];
  if (era >= 2018) return window.SCOUTING_FIXTURES_2020 || [];
  if (era >= 2014) return window.SCOUTING_FIXTURES_2016 || [];
  if (era >= 2010) return window.SCOUTING_FIXTURES_2012 || [];
  if (era >= 2006) return window.SCOUTING_FIXTURES_2008 || [];
  if (era >= 2002) return window.SCOUTING_FIXTURES_2004 || [];
  if (era >= 1998) return window.SCOUTING_FIXTURES_2000 || [];
  if (era >= 1994) return window.SCOUTING_FIXTURES_1996 || [];
  if (era >= 1990) return window.SCOUTING_FIXTURES_1994 || [];
  if (era >= 1988) return window.SCOUTING_FIXTURES_1990 || [];
  return window.SCOUTING_FIXTURES_1986 || [];
};

/**
 * Training focus options and their effect on match simulation.
 */
window.TRAINING_OPTIONS = [
  { id:'attack',    label:'Attacking Play',    desc:'Focus on movement, finishing and combinations in the final third.',   effect:{ attackBonus:+0.06, defPenalty: 0 } },
  { id:'defence',   label:'Defensive Shape',   desc:'Work on compactness, pressing triggers and set piece defending.',    effect:{ attackBonus: 0,    defPenalty:-0.04 } },
  { id:'setpieces', label:'Set Pieces',        desc:'Practice delivery, runs and defensive organisation from dead balls.',effect:{ attackBonus:+0.03, setBonus:+0.08 } },
  { id:'fitness',   label:'Fitness & Stamina', desc:'Intensive conditioning to maintain high energy levels all game.',   effect:{ staminaBonus:+0.05 } },
  { id:'tactics',   label:'Team Shape',        desc:'Drills on the formation, pressing and transition.',                  effect:{ tacticsBonus:+0.04 } },
];
