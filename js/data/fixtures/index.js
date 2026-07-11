/**
 * fixtures/index.js
 *
 * ARCHITECTURE:
 * Fixtures are grouped into SEASONS, each season is a self-contained object.
 * 
 * VISIBILITY RULES:
 *   'known'     — always visible (friendlies already arranged, cup draws made)
 *   'qualifier' — visible from season start (draw already done)
 *   'announced' — visible ~6 weeks before (squad announcement window)
 *   'tournament'— only added to schedule once qualified, one game at a time
 *
 * TOURNAMENT FIXTURES:
 *   Not pre-loaded. Generated dynamically when England qualify/progress.
 *   The system adds the NEXT round only after each result is confirmed.
 *
 * CAMPAIGN FIXTURE LIST:
 *   window.getVisibleFixtures(campaignDate) returns only what the manager
 *   would realistically know about on that date.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SEASON DEFINITIONS
// Each entry: { id, date, homeTeam, awayTeam, comp, compShort, compType,
//               venue, venueCity, oppKey, importance, visibleFrom,
//               historicResult, tournamentKey }
//
// compType: 'friendly' | 'qualifier' | 'tournament' | 'cup'
// visibleFrom: ISO date string — before this date the fixture is hidden
//              'always' — always visible once in the database
//              'qualified' — only shown when qualification confirmed
// ─────────────────────────────────────────────────────────────────────────────

// ── HELPERS ──────────────────────────────────────────────────────────────────
const _NAT_RATINGS = {
  'Germany':90,
  'West Germany':90,
  'France':87,
  'Brazil':90,
  'Spain':88,
  'Italy':87,
  'Argentina':87,
  'Netherlands':85,
  'Portugal':84,
  'Belgium':84,
  'Croatia':81,
  'Uruguay':81,
  'Czech Republic':78,
  'Poland':76,
  'Turkey':75,
  'Denmark':78,
  'Sweden':77,
  'Switzerland':77,
  'Russia':75,
  'Ukraine':76,
  'Romania':74,
  'Greece':73,
  'Serbia':75,
  'Slovakia':72,
  'Hungary':70,
  'Austria':74,
  'Norway':72,
  'Bulgaria':72,
  'Scotland':74,
  'Wales':73,
  'Rep of Ireland':73,
  'Republic of Ireland':73,
  'Northern Ireland':70,
  'N. Ireland':70,
  'USA':75,
  'Mexico':78,
  'Colombia':79,
  'Ecuador':72,
  'Chile':77,
  'Peru':73,
  'Paraguay':73,
  'Costa Rica':73,
  'Bolivia':65,
  'Honduras':66,
  'Panama':67,
  'Canada':72,
  'Trinidad and Tobago':66,
  'Jamaica':65,
  'Morocco':74,
  'Tunisia':70,
  'Algeria':70,
  'Senegal':76,
  'Nigeria':74,
  'Ghana':73,
  'Ivory Coast':76,
  'Cameroon':72,
  'Egypt':72,
  'South Africa':70,
  'Japan':74,
  'South Korea':74,
  'China':65,
  'Iran':70,
  'Saudi Arabia':68,
  'Qatar':67,
  'Australia':72,
  'New Zealand':65,
  'North Korea':62,
  'Iceland':73,
  'Andorra':40,
  'San Marino':30,
  'Liechtenstein':40,
  'Luxembourg':50,
  'Malta':46,
  'Azerbaijan':52,
  'Kazakhstan':54,
  'Moldova':55,
  'Latvia':60,
  'Lithuania':58,
  'Estonia':60,
  'Armenia':58,
  'Georgia':62,
  'Albania':65,
  'Kosovo':62,
  'North Macedonia':64,
  'Montenegro':68,
  'Slovenia':70,
  'Belarus':64,
  'Bosnia-Herzegovina':70,
  'Finland':68,
  'Cyprus':60,
  'Israel':70,
  'Macedonia':62
};
function _mkf(id, date, home, away, comp, cShort, cType, venue, city, oppKey, imp, vis, hist) {
  const opp = home === 'England' ? away : home;
  const oppRating = _NAT_RATINGS[opp] || 75;
  return { id, date, homeTeam:home, awayTeam:away, comp, compShort:cShort,
           compType:cType, venue, venueCity:city, oppKey, importance:imp,
           visibleFrom:vis, historicResult:hist, oppRating };
}
const E = 'England';
const W = 'Wembley Stadium';
const WC = 'London';

window.FIXTURE_SEASONS = {

  // ══════════════════════════════════════════════════════════════════════════
  // 1986 — Bobby Robson. Mexico 86 qualifying already done. Game starts here.
  // Mexico 1986 group stage is treated as tournament (dynamic).
  // After Mexico: 1988 Euro qualifying begins immediately.
  // ══════════════════════════════════════════════════════════════════════════
  1986: [
    // ── Pre-Mexico 86 ─────────────────────────────────────────────────────
    // Game starts January 1986. Bobby Robson is already in post (since 1982).
    // England qualified for Mexico in November 1985. These are the warmups.
    _mkf('f860129', '1986-01-29', 'Egypt',     E,    'International Friendly','Friendly','friendly', 'Cairo Stadium', 'Cairo',      'Egypt',       'low',  'always',    {eng:4,opp:0}),
    _mkf('f860226', '1986-02-26', 'Israel',    E,    'International Friendly','Friendly','friendly', 'Ramat Gan Stadium','Tel Aviv', 'Israel',      'low',  'always',    {eng:2,opp:1}),
    _mkf('f860326', '1986-03-26', 'USSR',      E,    'International Friendly','Friendly','friendly', 'Boris Paichadze','Tbilisi',   'USSR',        'medium','always',   {eng:1,opp:0}),
    _mkf('f860423', '1986-04-23', 'Scotland',  E,    'Rous Cup 1986',         'Rous Cup','cup',       'Hampden Park',  'Glasgow',    'Scotland',    'medium','always',    {eng:2,opp:1}),
    _mkf('f860517', '1986-05-17', E,      'Mexico',   'International Friendly','Friendly','friendly', W,               WC,           'Mexico',      'low',  'always',    {eng:3,opp:0}),
    _mkf('f860524', '1986-05-24', E,      'Canada',   'International Friendly','Friendly','friendly', W,               WC,           'Canada',      'low',  'always',    {eng:1,opp:0}),

    // Mexico 86 — TOURNAMENT (dynamic). These are the GROUP STAGE only.
    // Knockout rounds added dynamically after each result.
    _mkf('f860603', '1986-06-03', 'Portugal',  E,    'Mexico 86 Group F',     'WC 86',  'tournament', 'Estadio Tecnológico','Monterrey','Portugal',  'major','qualified', {eng:0,opp:1}),
    _mkf('f860606', '1986-06-06', E,      'Morocco',  'Mexico 86 Group F',     'WC 86',  'tournament', 'Estadio Tecnológico','Monterrey','Morocco',   'major','qualified', {eng:0,opp:0}),
    _mkf('f860611', '1986-06-11', E,      'Poland',   'Mexico 86 Group F',     'WC 86',  'tournament', 'Estadio Universitario','Monterrey','Poland',  'major','qualified', {eng:3,opp:0}),
    // R16 — added dynamically after group stage if qualified
    _mkf('f860618', '1986-06-18', E,      'Paraguay', 'Mexico 86 R16',         'WC 86',  'tournament', 'Estadio Azteca','Mexico City','Paraguay',   'major','qualified', {eng:3,opp:0}),
    // QF — added dynamically
    _mkf('f860622', '1986-06-22', E,      'Argentina','Mexico 86 QF',          'WC 86',  'tournament', 'Estadio Azteca','Mexico City','Argentina',  'major','qualified', {eng:1,opp:2}),

    // Post-Mexico — Euro 88 qualifying. Draw done before Mexico, so visible from season start.
    _mkf('f860910', '1986-09-10', 'Sweden',    E,    '1988 Euro Qualifier Grp 7','ECQ',  'qualifier', 'Råsunda Stadium','Solna',    'Sweden',      'high', 'always',    {eng:0,opp:1}),
    _mkf('f861015', '1986-10-15', E,      'N. Ireland','1988 Euro Qualifier Grp 7','ECQ','qualifier', W,               WC,           'N. Ireland',  'high', 'always',    {eng:3,opp:0}),
    _mkf('f861112', '1986-11-12', 'Yugoslavia',E,    '1988 Euro Qualifier Grp 7','ECQ',  'qualifier', 'Partizan Stadium','Belgrade','Yugoslavia',  'high', 'always',    {eng:2,opp:0}),
  ],

  1987: [
    _mkf('f870218', '1987-02-18', 'Spain',     E,    'International Friendly','Friendly','friendly', 'Estadio Bernabéu','Madrid',  'Spain',       'medium','always',    {eng:4,opp:2}),
    _mkf('f870401', '1987-04-01', 'N. Ireland',E,    '1988 Euro Qualifier Grp 7','ECQ',  'qualifier', 'Windsor Park',  'Belfast',    'N. Ireland',  'high', 'always',    {eng:2,opp:0}),
    _mkf('f870429', '1987-04-29', 'Turkey',    E,    '1988 Euro Qualifier Grp 7','ECQ',  'qualifier', 'Atatürk Stadium','Izmir',   'Turkey',      'high', 'always',    {eng:0,opp:0}),
    _mkf('f870519', '1987-05-19', E,      'Brazil',   'Rous Cup 1987',         'Rous Cup','cup',       W,               WC,           'Brazil',      'medium','always',    {eng:1,opp:1}),
    _mkf('f870523', '1987-05-23', E,      'Scotland', 'Rous Cup 1987',         'Rous Cup','cup',       W,               WC,           'Scotland',    'medium','always',    {eng:0,opp:0}),
    _mkf('f870909', '1987-09-09', 'West Germany',E,  'International Friendly','Friendly','friendly', 'Olympiastadion','Düsseldorf','West Germany','medium','always',    {eng:3,opp:1}),
    _mkf('f871014', '1987-10-14', E,      'Turkey',   '1988 Euro Qualifier Grp 7','ECQ',  'qualifier', W,               WC,           'Turkey',      'high', 'always',    {eng:8,opp:0}),
    _mkf('f871111', '1987-11-11', E,      'Yugoslavia','1988 Euro Qualifier Grp 7','ECQ', 'qualifier', W,               WC,           'Yugoslavia',  'high', 'always',    {eng:4,opp:1}),
  ],

  1988: [
    _mkf('f880223', '1988-02-23', E,      'Israel',   'International Friendly','Friendly','friendly', W,               WC,           'Israel',      'low',  'always',    {eng:0,opp:0}),
    _mkf('f880326', '1988-03-26', 'Hungary',   E,    'International Friendly','Friendly','friendly', 'Népstadion',    'Budapest',   'Hungary',     'low',  'always',    {eng:0,opp:0}),
    _mkf('f880421', '1988-04-21', E,      'Scotland', 'International Friendly','Friendly','friendly', W,               WC,           'Scotland',    'medium','always',    {eng:1,opp:0}),
    _mkf('f880524', '1988-05-24', E,      'Colombia', 'Rous Cup 1988',         'Rous Cup','cup',       W,               WC,           'Colombia',    'low',  'always',    {eng:1,opp:1}),
    _mkf('f880528', '1988-05-28', 'Switzerland',E,   'International Friendly','Friendly','friendly', 'St. Jakob-Park','Basel',      'Switzerland', 'low',  'always',    {eng:1,opp:0}),

    // EURO 88 — qualified. Group stage fully known once draw is made (Dec 1987).
    // visibleFrom = '1987-12-01' — the draw date
    _mkf('f880612', '1988-06-12', 'Republic of Ireland',E,'UEFA Euro 1988 Grp B','EURO 88','tournament','Neckarstadion','Stuttgart','Republic of Ireland','major','1987-12-01',{eng:0,opp:1}),
    _mkf('f880615', '1988-06-15', 'Netherlands',E,    'UEFA Euro 1988 Grp B','EURO 88',  'tournament', 'Rheinstadion',  'Düsseldorf', 'Netherlands', 'major','1987-12-01', {eng:1,opp:3}),
    _mkf('f880618', '1988-06-18', 'Soviet Union',E,   'UEFA Euro 1988 Grp B','EURO 88',  'tournament', 'Waldstadion',   'Frankfurt',  'Soviet Union','major','1987-12-01', {eng:1,opp:3}),
    // England eliminated at group stage — no knockout fixtures

    // WCQ 1990 qualifying draw made June 1988 — visible from then
    _mkf('f880914', '1988-09-14', E,      'Denmark',  'International Friendly','Friendly','friendly', W,               WC,           'Denmark',     'medium','always',    {eng:1,opp:0}),
    _mkf('f881019', '1988-10-19', 'Sweden',    E,    '1990 WC Qualifier Grp 2','WCQ',    'qualifier', 'Råsunda Stadium','Solna',    'Sweden',      'high', '1988-07-01', {eng:0,opp:0}),
    _mkf('f881116', '1988-11-16', 'Saudi Arabia',E,  'International Friendly','Friendly','friendly', 'King Fahd Stadium','Riyadh',  'Saudi Arabia','low',  'always',    {eng:1,opp:1}),
  ],

  1989: [
    _mkf('f890208', '1989-02-08', 'Greece',    E,    'International Friendly','Friendly','friendly', 'Olympic Stadium','Athens',    'Greece',      'low',  'always',    {eng:2,opp:1}),
    _mkf('f890308', '1989-03-08', 'Albania',   E,    '1990 WC Qualifier Grp 2','WCQ',    'qualifier', 'Qemal Stafa','Tirana',      'Albania',     'high', '1988-07-01', {eng:2,opp:0}),
    _mkf('f890426', '1989-04-26', E,      'Albania',  '1990 WC Qualifier Grp 2','WCQ',    'qualifier', W,               WC,           'Albania',     'high', '1988-07-01', {eng:5,opp:0}),
    _mkf('f890523', '1989-05-23', E,      'Chile',    'Rous Cup 1989',         'Rous Cup','cup',        W,               WC,           'Chile',       'low',  'always',    {eng:0,opp:0}),
    _mkf('f890527', '1989-05-27', 'Scotland',  E,    'Rous Cup 1989',         'Rous Cup','cup',        'Hampden Park',  'Glasgow',    'Scotland',    'medium','always',    {eng:2,opp:0}),
    _mkf('f890603', '1989-06-03', 'Poland',    E,    '1990 WC Qualifier Grp 2','WCQ',    'qualifier', 'Legia Stadium', 'Warsaw',     'Poland',      'high', '1988-07-01', {eng:3,opp:0}),
    _mkf('f890906', '1989-09-06', 'Sweden',    E,    '1990 WC Qualifier Grp 2','WCQ',    'qualifier', 'Råsunda Stadium','Solna',    'Sweden',      'high', '1988-07-01', {eng:0,opp:0}),
    _mkf('f891011', '1989-10-11', E,      'Poland',   '1990 WC Qualifier Grp 2','WCQ',    'qualifier', W,               WC,           'Poland',      'high', '1988-07-01', {eng:0,opp:0}),
    _mkf('f891115', '1989-11-15', E,      'Italy',    'International Friendly','Friendly','friendly', W,               WC,           'Italy',       'medium','always',    {eng:0,opp:0}),
  ],

  1990: [
    _mkf('f900328', '1990-03-28', E,      'Brazil',   'International Friendly','Friendly','friendly', W,               WC,           'Brazil',      'medium','always',    {eng:1,opp:0}),
    _mkf('f900425', '1990-04-25', 'Czechoslovakia',E, 'International Friendly','Friendly','friendly', 'Letná Stadium', 'Prague',     'Czechoslovakia','medium','always',   {eng:4,opp:2}),
    _mkf('f900515', '1990-05-15', 'Denmark',   E,    'International Friendly','Friendly','friendly', 'Idrætsparken',  'Copenhagen', 'Denmark',     'medium','always',    {eng:1,opp:0}),
    _mkf('f900522', '1990-05-22', E,      'Uruguay',  'International Friendly','Friendly','friendly', W,               WC,           'Uruguay',     'medium','always',    {eng:1,opp:2}),
    _mkf('f900602', '1990-06-02', 'Tunisia',   E,    'International Friendly','Friendly','friendly', 'Stade de Bizerte','Bizerte',  'Tunisia',     'low',  'always',    {eng:1,opp:1}),

    // Italia 90 — draw made Dec 1989, qualified as WCQ winners
    _mkf('f900611', '1990-06-11', E,      'Republic of Ireland','1990 FIFA World Cup Grp F','WC 90','tournament','Stadio Sant\'Elia','Cagliari','Republic of Ireland','major','1989-12-09',{eng:1,opp:1}),
    _mkf('f900616', '1990-06-16', 'Netherlands',E,   '1990 FIFA World Cup Grp F','WC 90','tournament','Stadio Sant\'Elia','Cagliari', 'Netherlands','major','1989-12-09', {eng:0,opp:0}),
    _mkf('f900621', '1990-06-21', E,      'Egypt',    '1990 FIFA World Cup Grp F','WC 90','tournament','Stadio Sant\'Elia','Cagliari', 'Egypt',      'major','1989-12-09', {eng:1,opp:0}),
    // R16 — added dynamically after group stage
    _mkf('f900626', '1990-06-26', E,      'Belgium',  '1990 FIFA World Cup R16','WC 90', 'tournament','Stadio R. Dall\'Ara','Bologna','Belgium',    'major','dynamic',   {eng:1,opp:0}),
    _mkf('f900701', '1990-07-01', 'Cameroon',  E,    '1990 FIFA World Cup QF','WC 90',   'tournament','Stadio San Paolo','Naples',   'Cameroon',   'major','dynamic',   {eng:3,opp:2}),
    _mkf('f900704', '1990-07-04', 'West Germany',E,  '1990 FIFA World Cup SF','WC 90',   'tournament','Stadio delle Alpi','Turin',   'West Germany','major','dynamic',   {eng:1,opp:1}),
    _mkf('f900707', '1990-07-07', 'Italy',     E,    '1990 FIFA World Cup 3rd Place','WC 90','tournament','Stadio Olimpico','Rome',   'Italy',      'major','dynamic',   {eng:1,opp:2}),

    // Euro 92 qualifying draw made Nov 1990 — not visible before then
    _mkf('f901017', '1990-10-17', E,      'Poland',   '1992 Euro Qualifier Grp 7','ECQ',  'qualifier', W,               WC,           'Poland',      'high', '1990-12-01', {eng:2,opp:0}),
    _mkf('f901114', '1990-11-14', E,      'Republic of Ireland','1992 Euro Qualifier Grp 7','ECQ','qualifier',W,      WC,           'Republic of Ireland','high','1990-12-01',{eng:1,opp:1}),
  ],

  1991: [
    _mkf('f910327', '1991-03-27', E,      'Republic of Ireland','International Friendly','Friendly','friendly',W,    WC,           'Republic of Ireland','medium','always', {eng:1,opp:1}),
    _mkf('f910501', '1991-05-01', E,      'Turkey',   '1992 Euro Qualifier Grp 7','ECQ',  'qualifier', W,               WC,           'Turkey',      'high', '1990-12-01', {eng:1,opp:0}),
    _mkf('f910521', '1991-05-21', E,      'Argentina','International Friendly','Friendly','friendly', W,               WC,           'Argentina',   'medium','always',    {eng:2,opp:2}),
    _mkf('f910525', '1991-05-25', E,      'Australia','International Friendly','Friendly','friendly', W,               WC,           'Australia',   'low',  'always',    {eng:1,opp:0}),
    _mkf('f910601', '1991-06-01', 'New Zealand',E,   'International Friendly','Friendly','friendly', 'Auckland',      'Auckland',   'New Zealand', 'low',  'always',    {eng:1,opp:0}),
    _mkf('f910603', '1991-06-03', 'New Zealand',E,   'International Friendly','Friendly','friendly', 'Wellington',    'Wellington', 'New Zealand', 'low',  'always',    {eng:2,opp:0}),
    _mkf('f910608', '1991-06-08', 'Malaysia',  E,    'International Friendly','Friendly','friendly', 'Merdeka Stadium','Kuala Lumpur','Malaysia',  'low',  'always',    {eng:4,opp:2}),
    _mkf('f910911', '1991-09-11', 'Germany',   E,    'International Friendly','Friendly','friendly', 'Olympiastadion','Munich',     'Germany',     'medium','always',    {eng:0,opp:1}),
    _mkf('f911016', '1991-10-16', 'Turkey',    E,    '1992 Euro Qualifier Grp 7','ECQ',  'qualifier', 'Atatürk Stadium','Istanbul', 'Turkey',      'high', '1990-12-01', {eng:1,opp:0}),
    _mkf('f911113', '1991-11-13', 'Poland',    E,    '1992 Euro Qualifier Grp 7','ECQ',  'qualifier', 'Legia Stadium', 'Warsaw',     'Poland',      'high', '1990-12-01', {eng:1,opp:1}),
  ],

  1992: [
    _mkf('f920219', '1992-02-19', E,      'France',   'International Friendly','Friendly','friendly', W,               WC,           'France',      'medium','always',    {eng:2,opp:0}),
    _mkf('f920325', '1992-03-25', E,      'Czechoslovakia','International Friendly','Friendly','friendly',W,           WC,           'Czechoslovakia','medium','always',   {eng:2,opp:2}),
    _mkf('f920517', '1992-05-17', E,      'Hungary',  'International Friendly','Friendly','friendly', W,               WC,           'Hungary',     'low',  'always',    {eng:1,opp:0}),
    _mkf('f920603', '1992-06-03', E,      'Brazil',   'International Friendly','Friendly','friendly', W,               WC,           'Brazil',      'medium','always',    {eng:1,opp:1}),

    // EURO 92 — draw made Jan 1992. England qualified. Group stage visible.
    _mkf('f920611', '1992-06-11', 'Denmark',   E,    'UEFA Euro 1992 Grp 1',  'EURO 92','tournament','Malmö Stadion', 'Malmö',      'Denmark',     'major','1992-01-28', {eng:0,opp:0}),
    _mkf('f920614', '1992-06-14', E,      'France',   'UEFA Euro 1992 Grp 1',  'EURO 92','tournament','Malmö Stadion', 'Malmö',      'France',      'major','1992-01-28', {eng:0,opp:0}),
    _mkf('f920617', '1992-06-17', E,      'Sweden',   'UEFA Euro 1992 Grp 1',  'EURO 92','tournament','Råsunda Stadium','Solna',    'Sweden',      'major','1992-01-28', {eng:1,opp:2}),
    // England eliminated at group stage

    // WCQ 1994 draw made Jan 1992
    _mkf('f920909', '1992-09-09', 'Spain',     E,    '1994 WC Qualifier Grp 1','WCQ',   'qualifier', 'Estadio Santander','Santander','Spain',      'high', '1992-01-01', {eng:0,opp:1}),
    _mkf('f921014', '1992-10-14', E,      'Norway',   '1994 WC Qualifier Grp 2','WCQ',   'qualifier', W,               WC,           'Norway',      'high', '1992-01-01', {eng:1,opp:1}),
    _mkf('f921118', '1992-11-18', E,      'Turkey',   '1994 WC Qualifier Grp 2','WCQ',   'qualifier', W,               WC,           'Turkey',      'high', '1992-01-01', {eng:4,opp:0}),
  ],

  1993: [
    _mkf('f930217', '1993-02-17', E,      'San Marino','1994 WC Qualifier Grp 2','WCQ',  'qualifier', W,               WC,           'San Marino',  'high', '1992-01-01', {eng:6,opp:0}),
    _mkf('f930331', '1993-03-31', 'Turkey',    E,    '1994 WC Qualifier Grp 2','WCQ',    'qualifier', 'Inönü Stadium', 'Istanbul',   'Turkey',      'high', '1992-01-01', {eng:2,opp:0}),
    _mkf('f930428', '1993-04-28', E,      'Netherlands','International Friendly','Friendly','friendly',W,             WC,           'Netherlands', 'medium','always',    {eng:2,opp:2}),
    _mkf('f930529', '1993-05-29', 'Poland',    E,    '1994 WC Qualifier Grp 2','WCQ',    'qualifier', 'Legia Stadium', 'Warsaw',     'Poland',      'high', '1992-01-01', {eng:1,opp:1}),
    // Umbro Cup 1993
    _mkf('f930601', '1993-06-01', E,      'Denmark',  'Umbro Cup 1993',        'Umbro','cup',          W,               WC,           'Denmark',     'medium','1993-04-01', {eng:1,opp:0}),
    _mkf('f930605', '1993-06-05', E,      'USA',      'Umbro Cup 1993',        'Umbro','cup',           W,               WC,           'USA',         'medium','1993-04-01', {eng:2,opp:0}),
    _mkf('f930609', '1993-06-09', E,      'Brazil',   'Umbro Cup 1993',        'Umbro','cup',           W,               WC,           'Brazil',      'medium','1993-04-01', {eng:1,opp:1}),
    _mkf('f930908', '1993-09-08', E,      'Poland',   '1994 WC Qualifier Grp 2','WCQ',   'qualifier', W,               WC,           'Poland',      'high', '1992-01-01', {eng:3,opp:0}),
    _mkf('f931013', '1993-10-13', 'Netherlands',E,   '1994 WC Qualifier Grp 2','WCQ',   'qualifier', 'De Meer Stadion','Amsterdam','Netherlands', 'high', '1992-01-01', {eng:0,opp:2}),
    _mkf('f931117', '1993-11-17', 'San Marino', E,   '1994 WC Qualifier Grp 2','WCQ',   'qualifier', 'Olimpico','Serravalle',     'San Marino',  'high', '1992-01-01', {eng:7,opp:1}),
  ],

  1994: [
    // England failed to qualify for USA 94 — no World Cup
    // New manager Graham Taylor out, Terry Venables in
    _mkf('f940309', '1994-03-09', E,      'Denmark',  'International Friendly','Friendly','friendly', W,               WC,           'Denmark',     'medium','always',    {eng:1,opp:0}),
    _mkf('f940517', '1994-05-17', E,      'Greece',   'International Friendly','Friendly','friendly', W,               WC,           'Greece',      'low',  'always',    {eng:5,opp:0}),
    _mkf('f940522', '1994-05-22', E,      'Norway',   'International Friendly','Friendly','friendly', W,               WC,           'Norway',      'medium','always',    {eng:0,opp:0}),
    // US Tour
    _mkf('f940607', '1994-06-07', E,      'USA',      'International Friendly','Friendly','friendly', 'Pontiac Silverdome','Detroit','USA',         'low',  'always',    {eng:2,opp:0}),
    _mkf('f941012', '1994-10-12', E,      'Romania',  'International Friendly','Friendly','friendly', W,               WC,           'Romania',     'medium','always',    {eng:1,opp:1}),
    _mkf('f941116', '1994-11-16', E,      'Nigeria',  'International Friendly','Friendly','friendly', W,               WC,           'Nigeria',     'medium','always',    {eng:1,opp:0}),

    // Euro 96 qualifying — draw made Jan 1994, visible from then
    _mkf('f941207', '1994-12-07', E,      'Ukraine',  '1996 Euro Qualifier',   'ECQ',    'qualifier', W,               WC,           'Ukraine',     'high', '1994-01-20', {eng:1,opp:0}),
  ],

  1995: [
    _mkf('f950129', '1995-01-29', E,      'Republic of Ireland','International Friendly','Friendly','friendly',W,    WC,           'Republic of Ireland','medium','always', {eng:0,opp:1}),
    _mkf('f950315', '1995-03-15', 'Uruguay',   E,    'International Friendly','Friendly','friendly', W,               WC,           'Uruguay',     'medium','always',    {eng:0,opp:0}),
    // Umbro Cup 1995
    _mkf('f950603', '1995-06-03', E,      'Sweden',   'Umbro Cup 1995',        'Umbro','cup',          W,               WC,           'Sweden',      'medium','1995-03-01', {eng:3,opp:3}),
    _mkf('f950608', '1995-06-08', E,      'Brazil',   'Umbro Cup 1995',        'Umbro','cup',           W,               WC,           'Brazil',      'medium','1995-03-01', {eng:1,opp:3}),
    _mkf('f950611', '1995-06-11', E,      'Japan',    'Umbro Cup 1995',        'Umbro','cup',           W,               WC,           'Japan',       'low',  '1995-03-01', {eng:2,opp:1}),
    _mkf('f950906', '1995-09-06', 'Colombia',  E,    'International Friendly','Friendly','friendly', 'El Campin',     'Bogotá',     'Colombia',    'medium','always',    {eng:0,opp:0}),
    _mkf('f951011', '1995-10-11', 'Norway',    E,    '1996 Euro Qualifier',   'ECQ',    'qualifier', 'Ullevaal Stadium','Oslo',    'Norway',      'high', '1994-01-20', {eng:0,opp:0}),
    _mkf('f951115', '1995-11-15', E,      'Switzerland','International Friendly','Friendly','friendly',W,             WC,           'Switzerland', 'medium','always',    {eng:3,opp:1}),
  ],

  1996: [
    _mkf('f960327', '1996-03-27', E,      'Bulgaria', 'International Friendly','Friendly','friendly', W,               WC,           'Bulgaria',    'low',  'always',    {eng:1,opp:0}),
    _mkf('f960423', '1996-04-23', E,      'Croatia',  'International Friendly','Friendly','friendly', W,               WC,           'Croatia',     'medium','always',   {eng:0,opp:0}),
    _mkf('f960518', '1996-05-18', E,      'Hungary',  'International Friendly','Friendly','friendly', W,               WC,           'Hungary',     'low',  'always',    {eng:3,opp:0}),
    _mkf('f960523', '1996-05-23', 'China',     E,    'International Friendly','Friendly','friendly', 'Workers Stadium','Beijing',  'China',       'low',  'always',    {eng:3,opp:0}),

    // EURO 96 — hosted by England. Draw made Jan 1996.
    _mkf('f960608', '1996-06-08', E,      'Switzerland','UEFA Euro 1996 Grp A','EURO 96','tournament',W,              WC,           'Switzerland', 'major','1996-01-17', {eng:1,opp:1}),
    _mkf('f960615', '1996-06-15', E,      'Scotland', 'UEFA Euro 1996 Grp A',  'EURO 96','tournament',W,              WC,           'Scotland',    'major','1996-01-17', {eng:2,opp:0}),
    _mkf('f960618', '1996-06-18', E,      'Netherlands','UEFA Euro 1996 Grp A','EURO 96','tournament',W,              WC,           'Netherlands', 'major','1996-01-17', {eng:4,opp:1}),
    // QF — dynamic
    _mkf('f960622', '1996-06-22', E,      'Spain',    'UEFA Euro 1996 QF',     'EURO 96','tournament',W,              WC,           'Spain',       'major','dynamic',   {eng:0,opp:0}),
    // SF — dynamic
    _mkf('f960626', '1996-06-26', E,      'Germany',  'UEFA Euro 1996 SF',     'EURO 96','tournament','Villa Park',   'Birmingham', 'Germany',     'major','dynamic',   {eng:1,opp:1}),

    // WCQ 1998 — draw June 1996, not visible until then
    _mkf('f961001', '1996-10-01', 'Moldova',   E,    '1998 WC Qualifier Grp 2','WCQ',   'qualifier', 'Republican Stadium','Chisinau','Moldova',  'high', '1996-07-01', {eng:3,opp:0}),
    _mkf('f961109', '1996-11-09', E,      'Georgia',  '1998 WC Qualifier Grp 2','WCQ',   'qualifier', W,               WC,           'Georgia',     'high', '1996-07-01', {eng:2,opp:0}),
  ],

  1997: [
    _mkf('f970212', '1997-02-12', E,      'Italy',    '1998 WC Qualifier Grp 2','WCQ',   'qualifier', W,               WC,           'Italy',       'high', '1996-07-01', {eng:0,opp:1}),
    _mkf('f970329', '1997-03-29', 'Mexico',    E,    'International Friendly','Friendly','friendly', W,               WC,           'Mexico',      'low',  'always',    {eng:2,opp:0}),
    _mkf('f970430', '1997-04-30', 'Georgia',   E,    '1998 WC Qualifier Grp 2','WCQ',    'qualifier', 'Boris Paichadze','Tbilisi',  'Georgia',     'high', '1996-07-01', {eng:2,opp:0}),
    _mkf('f970524', '1997-05-24', E,      'South Africa','International Friendly','Friendly','friendly',W,            WC,           'South Africa','low',  'always',    {eng:2,opp:1}),
    _mkf('f970601', '1997-06-01', E,      'Poland',   '1998 WC Qualifier Grp 2','WCQ',    'qualifier', W,               WC,           'Poland',      'high', '1996-07-01', {eng:2,opp:0}),
    _mkf('f970607', '1997-06-07', E,      'Italy',    'Le Tournoi de France',  'Le Tournoi','cup',     'Stade Félix Bollaert','Lens','Italy',      'medium','1997-03-01', {eng:2,opp:0}),
    _mkf('f970610', '1997-06-10', E,      'France',   'Le Tournoi de France',  'Le Tournoi','cup',     'Stade de France','Paris',   'France',      'medium','1997-03-01', {eng:1,opp:0}),
    _mkf('f970614', '1997-06-14', E,      'Brazil',   'Le Tournoi de France',  'Le Tournoi','cup',     'Stade de Lyon', 'Lyon',       'Brazil',      'medium','1997-03-01', {eng:0,opp:1}),
    _mkf('f970910', '1997-09-10', 'Moldova',   E,    '1998 WC Qualifier Grp 2','WCQ',    'qualifier', 'Republican Stadium','Chisinau','Moldova',  'high', '1996-07-01', {eng:4,opp:0}),
    _mkf('f971011', '1997-10-11', 'Italy',     E,    '1998 WC Qualifier Grp 2','WCQ',    'qualifier', 'Olimpico',      'Rome',       'Italy',       'high', '1996-07-01', {eng:0,opp:0}),
    _mkf('f971115', '1997-11-15', E,      'Cameroon', 'International Friendly','Friendly','friendly', W,               WC,           'Cameroon',    'low',  'always',    {eng:2,opp:0}),
  ],

  1998: [
    _mkf('f980211', '1998-02-11', E,      'Chile',    'International Friendly','Friendly','friendly', W,               WC,           'Chile',       'medium','always',   {eng:0,opp:2}),
    _mkf('f980325', '1998-03-25', E,      'Switzerland','International Friendly','Friendly','friendly',W,             WC,           'Switzerland', 'low',  'always',    {eng:1,opp:1}),
    _mkf('f980522', '1998-05-22', E,      'Saudi Arabia','International Friendly','Friendly','friendly',W,            WC,           'Saudi Arabia','low',  'always',    {eng:0,opp:0}),
    _mkf('f980529', '1998-05-29', 'Morocco',   E,    'International Friendly','Friendly','friendly', 'Stade de France','Paris',    'Morocco',     'low',  'always',    {eng:0,opp:0}),
    _mkf('f980601', '1998-06-01', E,      'Belgium',  'International Friendly','Friendly','friendly', 'King Baudouin','Brussels',   'Belgium',     'medium','always',   {eng:0,opp:0}),

    // France 98 — draw Dec 1997. England qualified as group winners.
    _mkf('f980615', '1998-06-15', E,      'Tunisia',  '1998 FIFA World Cup Grp G','WC 98','tournament','Stade Vélodrome','Marseille','Tunisia',    'major','1997-12-04', {eng:2,opp:0}),
    _mkf('f980622', '1998-06-22', E,      'Romania',  '1998 FIFA World Cup Grp G','WC 98','tournament','Stade de Toulouse','Toulouse','Romania',   'major','1997-12-04', {eng:1,opp:2}),
    _mkf('f980626', '1998-06-26', E,      'Colombia', '1998 FIFA World Cup Grp G','WC 98','tournament','Stade Félix Bollaert','Lens','Colombia',  'major','1997-12-04', {eng:2,opp:0}),
    // R16 — dynamic
    _mkf('f980630', '1998-06-30', E,      'Argentina','1998 FIFA World Cup R16','WC 98', 'tournament','Stade Geoffroy-Guichard','St-Étienne','Argentina','major','dynamic',{eng:2,opp:2}),
    // England eliminated on penalties

    // Euro 2000 qualifying — draw Jan 1998
    _mkf('f980905', '1998-09-05', 'Sweden',    E,    '2000 Euro Qualifier Grp 5','ECQ',  'qualifier', 'Råsunda Stadium','Solna',    'Sweden',      'high', '1998-01-26', {eng:1,opp:2}),
    _mkf('f981014', '1998-10-14', E,      'Bulgaria', '2000 Euro Qualifier Grp 5','ECQ',  'qualifier', W,               WC,           'Bulgaria',    'high', '1998-01-26', {eng:0,opp:0}),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FLATTEN: build ALL_FIXTURES from all seasons for backwards-compat
// ─────────────────────────────────────────────────────────────────────────────
window.ALL_FIXTURES = [];
Object.values(window.FIXTURE_SEASONS).forEach(season => {
  season.forEach(f => window.ALL_FIXTURES.push(f));
});
// Sort by date
window.ALL_FIXTURES.sort((a, b) => a.date.localeCompare(b.date));

// ─────────────────────────────────────────────────────────────────────────────
// VISIBILITY ENGINE
// Returns fixtures the manager can see given the current campaign date.
// ─────────────────────────────────────────────────────────────────────────────
window.getVisibleFixtures = function(campaignDate, completedIds) {
  const today    = campaignDate || '1986-04-01';
  const done     = new Set(completedIds || []);

  return window.ALL_FIXTURES.filter(f => {
    // Already played — always show
    if (done.has(f.id)) return true;

    // Visibility rule
    const vis = f.visibleFrom;
    if (vis === 'always')    return true;
    if (vis === 'dynamic')   return done.has(_prevTournamentId(f.id)); // shown after prev round
    if (vis === 'qualified') return _isQualified(f.tournamentKey, done);

    // Date-based reveal
    return today >= vis;
  });
};

// Tournament progression helper — show next round only after previous confirmed
function _prevTournamentId(id) {
  const chain = {
    // Mexico 86
    'f860618': 'f860611', // R16 after group 3
    'f860622': 'f860618', // QF after R16
    // Italia 90
    'f900626': 'f900621', // R16 after group 3
    'f900701': 'f900626', // QF after R16
    'f900704': 'f900701', // SF after QF
    'f900707': 'f900704', // 3rd place after SF loss
    // Euro 96
    'f960622': 'f960618', // QF after group 3
    'f960626': 'f960622', // SF after QF
    // France 98
    'f980630': 'f980626', // R16 after group 3
  };
  return chain[id] || null;
}

function _isQualified(key, done) {
  // Mexico 86 — pre-qualified before game starts
  if (!key || key === 'mexico86') return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUALIFIER GROUP TABLES
// Track who is in each qualifying group for group-table rendering
// ─────────────────────────────────────────────────────────────────────────────
window.QUALIFIER_GROUPS = {
  'ECQ_EURO88_7':   { comp:'1988 Euro Qualifiers', group:'Group 7', teams:['England','Yugoslavia','N. Ireland','Turkey'] },
  'WCQ_1990_2':     { comp:'1990 World Cup Qualifiers', group:'Group 2', teams:['England','Sweden','Poland','Albania'] },
  'ECQ_EURO92_7':   { comp:'1992 Euro Qualifiers', group:'Group 7', teams:['England','Republic of Ireland','Turkey','Poland'] },
  'WCQ_1994_2':     { comp:'1994 World Cup Qualifiers', group:'Group 2', teams:['England','Netherlands','Norway','Turkey','Poland','San Marino'] },
  'ECQ_EURO96':     { comp:'1996 Euro Qualifiers', group:'Group 8', teams:['England','Norway','Ukraine'] },
  'WCQ_1998_2':     { comp:'1998 World Cup Qualifiers', group:'Group 2', teams:['England','Italy','Poland','Georgia','Moldova'] },
  'ECQ_EURO2000_5': { comp:'2000 Euro Qualifiers', group:'Group 5', teams:['England','Sweden','Poland','Bulgaria','Luxembourg'] },
};

// ─────────────────────────────────────────────────────────────────────────────
// TOURNAMENT GROUPS (actual tournament, not qualifying)
// ─────────────────────────────────────────────────────────────────────────────
window.TOURNAMENT_GROUPS = {
  'MEXICO86_F':  { comp:'Mexico 1986', group:'Group F', teams:['England','Portugal','Poland','Morocco'] },
  'EURO88_B':    { comp:'Euro 1988', group:'Group B', teams:['England','Republic of Ireland','Netherlands','Soviet Union'] },
  'ITALIA90_F':  { comp:'Italia 1990', group:'Group F', teams:['England','Republic of Ireland','Netherlands','Egypt'] },
  'EURO92_1':    { comp:'Euro 1992', group:'Group 1', teams:['England','Denmark','France','Sweden'] },
  'EURO96_A':    { comp:'Euro 1996', group:'Group A', teams:['England','Switzerland','Scotland','Netherlands'] },
  'FRANCE98_G':  { comp:'France 1998', group:'Group G', teams:['England','Tunisia','Romania','Colombia'] },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
window.getOppName = function(fix) {
  return fix.homeTeam === 'England' ? fix.awayTeam : fix.homeTeam;
};

window.getSeasonFixtures = function(year) {
  return window.FIXTURE_SEASONS[year] || [];
};

// Get the campaign start date for a given era
window.getEraStartDate = function(era) {
  const starts = {
    1986: '1986-01-20',
    1990: '1990-07-15',
    1992: '1991-09-01',
    1994: '1994-01-01',
    1996: '1996-01-01',
    1998: '1998-01-01',
    2002: '2001-09-01',
    2006: '2005-09-01',
    2010: '2010-07-15',
    2014: '2013-09-01',
    2018: '2018-01-01',
  };
  return starts[era] || (era + '-01-01');
};

// Get first fixture index on or after a given date
window.getFirstFixtureIndex = function(fromDate) {
  const idx = window.ALL_FIXTURES.findIndex(f => f.date >= fromDate);
  return idx >= 0 ? idx : 0;
};

// ══════════════════════════════════════════════════════════════════════════
// 1999–2024 FIXTURES
// Friendlies, qualifiers, and tournaments
// ══════════════════════════════════════════════════════════════════════════
(function(){
const E='England',W='Wembley Stadium',WC='London';
const f=_mkf;
const more = [

// ── 1999 ──────────────────────────────────────────────────────────────────
f('f990127','1999-01-27',E,'Argentina',   'International Friendly','Friendly','friendly',W,WC,'Argentina','high','always',{eng:0,opp:2}),
f('f990328','1999-03-28','Poland',E,      'Euro 2000 Qualifier','ECQ','qualifier','Legia Stadium','Warsaw','Poland','high','always',{eng:0,opp:0}),
f('f990601','1999-06-01',E,'Hungary',     'International Friendly','Friendly','friendly',W,WC,'Hungary','low','always',{eng:1,opp:1}),
f('f990605','1999-06-05',E,'Sweden',      'Euro 2000 Qualifier','ECQ','qualifier',W,WC,'Sweden','high','always',{eng:0,opp:0}),
f('f990904','1999-09-04','Bulgaria',E,    'Euro 2000 Qualifier','ECQ','qualifier','Vasil Levski','Sofia','Bulgaria','high','always',{eng:1,opp:1}),
f('f991009','1999-10-09',E,'Luxembourg',  'Euro 2000 Qualifier','ECQ','qualifier',W,WC,'Luxembourg','high','always',{eng:6,opp:0}),
f('f991013','1999-10-13','Poland',E,      'Euro 2000 Qualifier','ECQ','qualifier','Legia Stadium','Warsaw','Poland','high','always',{eng:0,opp:0}),

// ── 2000 ──────────────────────────────────────────────────────────────────
f('f000223','2000-02-23','Argentina',E,   'International Friendly','Friendly','friendly','Estadio Monumental','Buenos Aires','Argentina','high','always',{eng:0,opp:0}),
f('f000527','2000-05-27',E,'Brazil',      'International Friendly','Friendly','friendly',W,WC,'Brazil','high','always',{eng:1,opp:1}),
f('f000531','2000-05-31',E,'Ukraine',     'International Friendly','Friendly','friendly',W,WC,'Ukraine','low','always',{eng:2,opp:0}),
f('f000612','2000-06-12',E,'Portugal',    'Euro 2000 Group A','EC 00','tournament','Estadio Cidade de Coimbra','Coimbra','Portugal','major','qualified',{eng:2,opp:3}),
f('f000617','2000-06-17',E,'Germany',     'Euro 2000 Group A','EC 00','tournament','Philips Stadion','Eindhoven','Germany','major','qualified',{eng:1,opp:0}),
f('f000620','2000-06-20',E,'Romania',     'Euro 2000 Group A','EC 00','tournament','Jan Breydel Stadium','Bruges','Romania','major','qualified',{eng:2,opp:3}),
f('f000807','2000-08-07','Sweden',E,      'International Friendly','Friendly','friendly','Friends Arena','Stockholm','Sweden','low','always',{eng:0,opp:0}),
f('f001007','2000-10-07',E,'Germany',     'World Cup 2002 Qualifier','WCQ','qualifier',W,WC,'Germany','high','always',{eng:0,opp:1}),
f('f001011','2000-10-11','Finland',E,     'World Cup 2002 Qualifier','WCQ','qualifier','Olympic Stadium','Helsinki','Finland','high','always',{eng:0,opp:0}),
f('f001115','2000-11-15',E,'Italy',       'International Friendly','Friendly','friendly',W,WC,'Italy','high','always',{eng:1,opp:0}),
f('f001128','2000-11-28','Spain',E,       'International Friendly','Friendly','friendly','El Estadio Olímpico','Seville','Spain','high','always',{eng:0,opp:0}),

// ── 2001 ──────────────────────────────────────────────────────────────────
f('f010224','2001-02-24','Spain',E,       'International Friendly','Friendly','friendly','Villa Park','Birmingham','Spain','high','always',{eng:3,opp:0}),
f('f010324','2001-03-24','Albania',E,     'World Cup 2002 Qualifier','WCQ','qualifier','Qemal Stafa','Tirana','Albania','high','always',{eng:1,opp:3}),
f('f010328','2001-03-28',E,'Finland',     'World Cup 2002 Qualifier','WCQ','qualifier',W,WC,'Finland','high','always',{eng:2,opp:1}),
f('f010525','2001-05-25',E,'Mexico',      'International Friendly','Friendly','friendly','Pride Park','Derby','Mexico','low','always',{eng:4,opp:0}),
f('f010606','2001-06-06','Greece',E,      'World Cup 2002 Qualifier','WCQ','qualifier','Nikos Goumas','Athens','Greece','high','always',{eng:0,opp:2}),
f('f010815','2001-08-15',E,'Netherlands', 'International Friendly','Friendly','friendly',W,WC,'Netherlands','high','always',{eng:0,opp:2}),
f('f010901','2001-09-01','Germany',E,     'World Cup 2002 Qualifier','WCQ','qualifier','Olympiastadion','Munich','Germany','high','always',{eng:1,opp:5}),
f('f011006','2001-10-06',E,'Greece',      'World Cup 2002 Qualifier','WCQ','qualifier',W,WC,'Greece','major','always',{eng:2,opp:2}),
f('f011010',  '2001-10-10',E,'Albania',   'World Cup 2002 Qualifier','WCQ','qualifier',W,WC,'Albania','high','always',{eng:2,opp:0}),

// ── 2002 ──────────────────────────────────────────────────────────────────
f('f020213','2002-02-13',E,'Netherlands', 'International Friendly','Friendly','friendly','Amsterdam Arena','Amsterdam','Netherlands','high','always',{eng:1,opp:1}),
f('f020327','2002-03-27',E,'Italy',       'International Friendly','Friendly','friendly','Elland Road','Leeds','Italy','high','always',{eng:1,opp:2}),
f('f020517','2002-05-17','South Korea',E, 'International Friendly','Friendly','friendly','Seogwipo World Cup Stadium','Seogwipo','South Korea','low','always',{eng:1,opp:1}),
f('f020521','2002-05-21','Cameroon',E,    'International Friendly','Friendly','friendly','Kirin Cup','Kobe','Cameroon','low','always',{eng:2,opp:2}),
f('f020602','2002-06-02',E,'Sweden',      'World Cup 2002 Group F','WC 02','tournament','Saitama Stadium','Saitama','Sweden','major','qualified',{eng:1,opp:1}),
f('f020607','2002-06-07',E,'Argentina',   'World Cup 2002 Group F','WC 02','tournament','Sapporo Dome','Sapporo','Argentina','major','qualified',{eng:1,opp:0}),
f('f020612','2002-06-12',E,'Nigeria',     'World Cup 2002 Group F','WC 02','tournament','Nagai Stadium','Osaka','Nigeria','major','qualified',{eng:0,opp:0}),
f('f020615','2002-06-15',E,'Denmark',     'World Cup 2002 R16','WC 02','tournament','Niigata Stadium','Niigata','Denmark','major','qualified',{eng:3,opp:0}),
f('f020621','2002-06-21','Brazil',E,      'World Cup 2002 QF','WC 02','tournament','Shizuoka Stadium','Shizuoka','Brazil','major','qualified',{eng:1,opp:2}),
f('f020907','2002-09-07',E,'Portugal',    'International Friendly','Friendly','friendly',W,WC,'Portugal','high','always',{eng:1,opp:1}),
f('f021012','2002-10-12',E,'Slovakia',    'Euro 2004 Qualifier','ECQ','qualifier',W,WC,'Slovakia','high','always',{eng:2,opp:2}),
f('f021016','2002-10-16','Macedonia',E,   'Euro 2004 Qualifier','ECQ','qualifier','Philip II Arena','Skopje','Macedonia','high','always',{eng:2,opp:2}),

// ── 2003 ──────────────────────────────────────────────────────────────────
f('f030212','2003-02-12',E,'Australia',   'International Friendly','Friendly','friendly',W,WC,'Australia','low','always',{eng:1,opp:3}),
f('f030329','2003-03-29',E,'Liechtenstein','Euro 2004 Qualifier','ECQ','qualifier',W,WC,'Liechtenstein','high','always',{eng:2,opp:0}),
f('f030402','2003-04-02',E,'Turkey',      'Euro 2004 Qualifier','ECQ','qualifier',W,WC,'Turkey','major','always',{eng:2,opp:0}),
f('f030522','2003-05-22','South Africa',E,'International Friendly','Friendly','friendly','Durban Stadium','Durban','South Africa','low','always',{eng:2,opp:1}),
f('f030603','2003-06-03','Serbia',E,      'International Friendly','Friendly','friendly','Red Star Stadium','Belgrade','Serbia','low','always',{eng:2,opp:1}),
f('f030611','2003-06-11','Slovakia',E,    'Euro 2004 Qualifier','ECQ','qualifier','Tehelné pole','Bratislava','Slovakia','high','always',{eng:1,opp:2}),
f('f030820','2003-08-20',E,'Croatia',     'International Friendly','Friendly','friendly','Portman Road','Ipswich','Croatia','low','always',{eng:3,opp:1}),
f('f030906','2003-09-06','Macedonia',E,   'Euro 2004 Qualifier','ECQ','qualifier','Philip II Arena','Skopje','Macedonia','high','always',{eng:1,opp:2}),
f('f031011','2003-10-11',E,'Turkey',      'Euro 2004 Qualifier','ECQ','qualifier',W,WC,'Turkey','major','always',{eng:0,opp:0}),
f('f031115','2003-11-15','Denmark',E,     'International Friendly','Friendly','friendly','Parken Stadium','Copenhagen','Denmark','low','always',{eng:2,opp:3}),

// ── 2004 ──────────────────────────────────────────────────────────────────
f('f040331','2004-03-31',E,'Sweden',      'International Friendly','Friendly','friendly','Gothenburg','Gothenburg','Sweden','low','always',{eng:0,opp:1}),
f('f040601','2004-06-01','Japan',E,       'International Friendly','Friendly','friendly','City of Manchester','Manchester','Japan','low','always',{eng:1,opp:1}),
f('f040605','2004-06-05','Iceland',E,     'International Friendly','Friendly','friendly','Laugardalsvöllur','Reykjavik','Iceland','low','always',{eng:4,opp:0}),
f('f040613','2004-06-13',E,'France',      'Euro 2004 Group B','EC 04','tournament','Estadio da Luz','Lisbon','France','major','qualified',{eng:1,opp:2}),
f('f040617','2004-06-17',E,'Switzerland', 'Euro 2004 Group B','EC 04','tournament','Estadio Cidade de Coimbra','Coimbra','Switzerland','major','qualified',{eng:3,opp:0}),
f('f040621','2004-06-21',E,'Croatia',     'Euro 2004 Group B','EC 04','tournament','Estadio da Luz','Lisbon','Croatia','major','qualified',{eng:4,opp:2}),
f('f040624','2004-06-24',E,'Portugal',    'Euro 2004 QF','EC 04','tournament','Estádio José Alvalade','Lisbon','Portugal','major','qualified',{eng:2,opp:2}),
f('f040904','2004-09-04','Austria',E,     'World Cup 2006 Qualifier','WCQ','qualifier','Ernst-Happel','Vienna','Austria','high','always',{eng:2,opp:2}),
f('f040908','2004-09-08',E,'Poland',      'World Cup 2006 Qualifier','WCQ','qualifier',W,WC,'Poland','high','always',{eng:2,opp:1}),
f('f041013','2004-10-13','Wales',E,       'World Cup 2006 Qualifier','WCQ','qualifier','Millennium Stadium','Cardiff','Wales','high','always',{eng:0,opp:2}),
f('f041017','2004-10-17','Azerbaijan',E,  'World Cup 2006 Qualifier','WCQ','qualifier','Tofig Bahramov','Baku','Azerbaijan','high','always',{eng:0,opp:1}),

// ── 2005 ──────────────────────────────────────────────────────────────────
f('f050209','2005-02-09',E,'Netherlands', 'International Friendly','Friendly','friendly',W,WC,'Netherlands','high','always',{eng:0,opp:0}),
f('f050326','2005-03-26',E,'Northern Ireland','WCQ','WCQ','qualifier',W,WC,'Northern Ireland','high','always',{eng:4,opp:0}),
f('f050330','2005-03-30',E,'Azerbaijan',  'World Cup 2006 Qualifier','WCQ','qualifier',W,WC,'Azerbaijan','high','always',{eng:2,opp:0}),
f('f050531','2005-05-31','USA',E,         'International Friendly','Friendly','friendly','Soldier Field','Chicago','USA','low','always',{eng:1,opp:2}),
f('f050603','2005-06-03','Colombia',E,    'International Friendly','Friendly','friendly','Giants Stadium','New York','Colombia','low','always',{eng:3,opp:2}),
f('f050817','2005-08-17',E,'Denmark',     'International Friendly','Friendly','friendly','Stadium of Light','Sunderland','Denmark','low','always',{eng:1,opp:4}),
f('f050903','2005-09-03',E,'Wales',       'World Cup 2006 Qualifier','WCQ','qualifier',W,WC,'Wales','high','always',{eng:1,opp:0}),
f('f051007','2005-10-07',E,'Austria',     'World Cup 2006 Qualifier','WCQ','qualifier',W,WC,'Austria','high','always',{eng:1,opp:0}),
f('f051012','2005-10-12','Poland',E,      'World Cup 2006 Qualifier','WCQ','qualifier','Legia Stadium','Warsaw','Poland','high','always',{eng:1,opp:2}),

// ── 2006 ──────────────────────────────────────────────────────────────────
f('f060301','2006-03-01',E,'Uruguay',     'International Friendly','Friendly','friendly','Anfield','Liverpool','Uruguay','low','always',{eng:2,opp:1}),
f('f060525','2006-05-25',E,'Hungary',     'International Friendly','Friendly','friendly','Old Trafford','Manchester','Hungary','low','always',{eng:3,opp:1}),
f('f060530','2006-05-30','Jamaica',E,     'International Friendly','Friendly','friendly','Old Trafford','Manchester','Jamaica','low','always',{eng:6,opp:0}),
f('f060610','2006-06-10',E,'Paraguay',    'World Cup 2006 Group B','WC 06','tournament','Frankenstadion','Nuremberg','Paraguay','major','qualified',{eng:1,opp:0}),
f('f060615','2006-06-15',E,'Trinidad and Tobago','World Cup 2006 Group B','WC 06','tournament','Signal Iduna Park','Dortmund','Trinidad and Tobago','major','qualified',{eng:2,opp:0}),
f('f060620','2006-06-20',E,'Sweden',      'World Cup 2006 Group B','WC 06','tournament','RheinEnergieStadion','Cologne','Sweden','major','qualified',{eng:2,opp:2}),
f('f060625','2006-06-25',E,'Ecuador',     'World Cup 2006 R16','WC 06','tournament','Gottlieb-Daimler-Stadion','Stuttgart','Ecuador','major','qualified',{eng:1,opp:0}),
f('f060701','2006-07-01',E,'Portugal',    'World Cup 2006 QF','WC 06','tournament','Veltins-Arena','Gelsenkirchen','Portugal','major','qualified',{eng:0,opp:0}),
f('f061007','2006-10-07',E,'Macedonia',   'Euro 2008 Qualifier','ECQ','qualifier',W,WC,'Macedonia','high','always',{eng:0,opp:0}),
f('f061011','2006-10-11','Croatia',E,     'Euro 2008 Qualifier','ECQ','qualifier','Maksimir','Zagreb','Croatia','high','always',{eng:2,opp:0}),
f('f061115','2006-11-15',E,'Netherlands', 'International Friendly','Friendly','friendly',W,WC,'Netherlands','high','always',{eng:1,opp:1}),

// ── 2007 ──────────────────────────────────────────────────────────────────
f('f070207','2007-02-07',E,'Spain',       'International Friendly','Friendly','friendly',W,WC,'Spain','high','always',{eng:0,opp:1}),
f('f070324','2007-03-24',E,'Andorra',     'Euro 2008 Qualifier','ECQ','qualifier',W,WC,'Andorra','high','always',{eng:3,opp:0}),
f('f070328','2007-03-28',E,'Israel',      'Euro 2008 Qualifier','ECQ','qualifier',W,WC,'Israel','high','always',{eng:0,opp:0}),
f('f070601','2007-06-01',E,'Brazil',      'International Friendly','Friendly','friendly',W,WC,'Brazil','high','always',{eng:1,opp:1}),
f('f070606','2007-06-06','Estonia',E,     'Euro 2008 Qualifier','ECQ','qualifier','A. Le Coq Arena','Tallinn','Estonia','high','always',{eng:0,opp:3}),
f('f070822','2007-08-22',E,'Germany',     'International Friendly','Friendly','friendly','Wembley Stadium','London','Germany','high','always',{eng:1,opp:2}),
f('f070908','2007-09-08',E,'Russia',      'Euro 2008 Qualifier','ECQ','qualifier',W,WC,'Russia','high','always',{eng:3,opp:0}),
f('f071013','2007-10-13',E,'Estonia',     'Euro 2008 Qualifier','ECQ','qualifier',W,WC,'Estonia','high','always',{eng:3,opp:0}),
f('f071117','2007-11-17','Russia',E,      'Euro 2008 Qualifier','ECQ','qualifier','Luzhniki','Moscow','Russia','major','always',{eng:1,opp:2}),
f('f071121','2007-11-21','Croatia',E,     'Euro 2008 Qualifier','ECQ','qualifier','Maksimir','Zagreb','Croatia','major','always',{eng:2,opp:3}),

// ── 2008 ──────────────────────────────────────────────────────────────────
f('f080206','2008-02-06',E,'Switzerland', 'International Friendly','Friendly','friendly',W,WC,'Switzerland','low','always',{eng:2,opp:1}),
f('f080326','2008-03-26','France',E,      'International Friendly','Friendly','friendly','Stade de France','Paris','France','high','always',{eng:1,opp:0}),
f('f080528','2008-05-28','USA',E,         'International Friendly','Friendly','friendly','Wembley Stadium','London','USA','low','always',{eng:2,opp:0}),
f('f080601','2008-06-01','Trinidad and Tobago',E,'International Friendly','Friendly','friendly','Wembley Stadium','London','Trinidad and Tobago','low','always',{eng:3,opp:0}),
f('f080820','2008-08-20',E,'Czech Republic','International Friendly','Friendly','friendly',W,WC,'Czech Republic','low','always',{eng:2,opp:2}),
f('f080906','2008-09-06',E,'Andorra',     'World Cup 2010 Qualifier','WCQ','qualifier',W,WC,'Andorra','high','always',{eng:2,opp:0}),
f('f080910','2008-09-10','Croatia',E,     'World Cup 2010 Qualifier','WCQ','qualifier','Maksimir','Zagreb','Croatia','high','always',{eng:1,opp:4}),
f('f081011','2008-10-11',E,'Kazakhstan',  'World Cup 2010 Qualifier','WCQ','qualifier',W,WC,'Kazakhstan','high','always',{eng:5,opp:1}),
f('f081015','2008-10-15','Belarus',E,     'World Cup 2010 Qualifier','WCQ','qualifier','Dinamo','Minsk','Belarus','high','always',{eng:1,opp:3}),
f('f081119','2008-11-19',E,'Germany',     'International Friendly','Friendly','friendly',W,WC,'Germany','high','always',{eng:2,opp:1}),

// ── 2009 ──────────────────────────────────────────────────────────────────
f('f090211','2009-02-11','Spain',E,       'International Friendly','Friendly','friendly','Real Madrid Training Ground','Madrid','Spain','high','always',{eng:0,opp:2}),
f('f090401','2009-04-01',E,'Ukraine',     'World Cup 2010 Qualifier','WCQ','qualifier',W,WC,'Ukraine','high','always',{eng:2,opp:1}),
f('f090529','2009-05-29',E,'Kazakhstan',  'World Cup 2010 Qualifier','WCQ','qualifier',W,WC,'Kazakhstan','high','always',{eng:4,opp:0}),
f('f090610','2009-06-10','Kazakhstan',E,  'World Cup 2010 Qualifier','WCQ','qualifier','Almaty','Almaty','Kazakhstan','high','always',{eng:0,opp:4}),
f('f090812','2009-08-12',E,'Netherlands', 'International Friendly','Friendly','friendly',W,WC,'Netherlands','high','always',{eng:2,opp:2}),
f('f090905','2009-09-05',E,'Croatia',     'World Cup 2010 Qualifier','WCQ','qualifier',W,WC,'Croatia','high','always',{eng:5,opp:1}),
f('f090909','2009-09-09','Andorra',E,     'World Cup 2010 Qualifier','WCQ','qualifier','Estadi Comunal','Andorra la Vella','Andorra','high','always',{eng:0,opp:3}),
f('f091010','2009-10-10','Ukraine',E,     'World Cup 2010 Qualifier','WCQ','qualifier','Olympic NSC','Kyiv','Ukraine','high','always',{eng:1,opp:0}),
f('f091014','2009-10-14',E,'Belarus',     'World Cup 2010 Qualifier','WCQ','qualifier',W,WC,'Belarus','high','always',{eng:3,opp:0}),

// ── 2010 ──────────────────────────────────────────────────────────────────
f('f100303','2010-03-03',E,'Egypt',       'International Friendly','Friendly','friendly',W,WC,'Egypt','low','always',{eng:3,opp:1}),
f('f100524','2010-05-24','Mexico',E,      'International Friendly','Friendly','friendly',W,WC,'Mexico','low','always',{eng:3,opp:1}),
f('f100530','2010-05-30','Japan',E,       'International Friendly','Friendly','friendly','Graz','Graz','Japan','low','always',{eng:2,opp:1}),
f('f100612','2010-06-12',E,'USA',         'World Cup 2010 Group C','WC 10','tournament','Royal Bafokeng','Rustenburg','USA','major','qualified',{eng:1,opp:1}),
f('f100618','2010-06-18',E,'Algeria',     'World Cup 2010 Group C','WC 10','tournament','Green Point','Cape Town','Algeria','major','qualified',{eng:0,opp:0}),
f('f100623','2010-06-23',E,'Slovenia',    'World Cup 2010 Group C','WC 10','tournament','Nelson Mandela Bay','Port Elizabeth','Slovenia','major','qualified',{eng:1,opp:0}),
f('f100627','2010-06-27',E,'Germany',     'World Cup 2010 R16','WC 10','tournament','Free State Stadium','Bloemfontein','Germany','major','qualified',{eng:1,opp:4}),
f('f100811','2010-08-11','Hungary',E,     'International Friendly','Friendly','friendly',W,WC,'Hungary','low','always',{eng:2,opp:1}),
f('f100903','2010-09-03','Bulgaria',E,    'Euro 2012 Qualifier','ECQ','qualifier','Vasil Levski','Sofia','Bulgaria','high','always',{eng:0,opp:4}),
f('f100907','2010-09-07',E,'Switzerland', 'Euro 2012 Qualifier','ECQ','qualifier',W,WC,'Switzerland','high','always',{eng:3,opp:1}),
f('f101008','2010-10-08','Montenegro',E,  'Euro 2012 Qualifier','ECQ','qualifier','Podgorica','Podgorica','Montenegro','high','always',{eng:0,opp:0}),
f('f101012','2010-10-12',E,'Bulgaria',    'Euro 2012 Qualifier','ECQ','qualifier',W,WC,'Bulgaria','high','always',{eng:0,opp:0}),
f('f101117','2010-11-17',E,'France',      'International Friendly','Friendly','friendly',W,WC,'France','high','always',{eng:1,opp:2}),

// ── 2011 ──────────────────────────────────────────────────────────────────
f('f110209','2011-02-09',E,'Denmark',     'International Friendly','Friendly','friendly',W,WC,'Denmark','low','always',{eng:2,opp:1}),
f('f110326','2011-03-26',E,'Wales',       'Euro 2012 Qualifier','ECQ','qualifier',W,WC,'Wales','high','always',{eng:2,opp:0}),
f('f110604','2011-06-04','Switzerland',E, 'Euro 2012 Qualifier','ECQ','qualifier','St Jakob-Park','Basel','Switzerland','high','always',{eng:2,opp:2}),
f('f110808','2011-08-08',E,'Netherlands', 'International Friendly','Friendly','friendly',W,WC,'Netherlands','high','always',{eng:2,opp:3}),
f('f110902','2011-09-02','Wales',E,       'Euro 2012 Qualifier','ECQ','qualifier','Millennium Stadium','Cardiff','Wales','high','always',{eng:0,opp:1}),
f('f110906','2011-09-06','Bulgaria',E,    'Euro 2012 Qualifier','ECQ','qualifier','Vasil Levski','Sofia','Bulgaria','high','always',null),
f('f111007','2011-10-07',E,'Montenegro',  'Euro 2012 Qualifier','ECQ','qualifier',W,WC,'Montenegro','high','always',{eng:2,opp:2}),
f('f111011','2011-10-11','Montenegro',E,  'Euro 2012 Qualifier','ECQ','qualifier','Podgorica','Podgorica','Montenegro','major','always',{eng:1,opp:2}),
f('f111115','2011-11-15','Spain',E,       'International Friendly','Friendly','friendly','Valencia','Valencia','Spain','high','always',{eng:0,opp:1}),

// ── 2012 ──────────────────────────────────────────────────────────────────
f('f120229','2012-02-29',E,'Netherlands', 'International Friendly','Friendly','friendly',W,WC,'Netherlands','high','always',{eng:2,opp:3}),
f('f120526','2012-05-26',E,'Norway',      'International Friendly','Friendly','friendly',W,WC,'Norway','low','always',{eng:1,opp:0}),
f('f120602','2012-06-02',E,'Belgium',     'International Friendly','Friendly','friendly',W,WC,'Belgium','high','always',{eng:1,opp:0}),
f('f120611','2012-06-11',E,'France',      'Euro 2012 Group D','EC 12','tournament','Donbass Arena','Donetsk','France','major','qualified',{eng:1,opp:1}),
f('f120615','2012-06-15',E,'Ukraine',     'Euro 2012 Group D','EC 12','tournament','Donbass Arena','Donetsk','Ukraine','major','qualified',{eng:1,opp:0}),
f('f120619','2012-06-19',E,'Sweden',      'Euro 2012 Group D','EC 12','tournament','Olympic Stadium','Kyiv','Sweden','major','qualified',{eng:3,opp:2}),
f('f120624','2012-06-24',E,'Italy',       'Euro 2012 QF','EC 12','tournament','Olympic Stadium','Kyiv','Italy','major','qualified',{eng:0,opp:0}),
f('f120815','2012-08-15',E,'Italy',       'International Friendly','Friendly','friendly',W,WC,'Italy','high','always',{eng:2,opp:1}),
f('f120907','2012-09-07',E,'San Marino',  'World Cup 2014 Qualifier','WCQ','qualifier',W,WC,'San Marino','high','always',{eng:5,opp:0}),
f('f121012','2012-10-12','Poland',E,      'World Cup 2014 Qualifier','WCQ','qualifier','National Stadium','Warsaw','Poland','high','always',{eng:1,opp:1}),
f('f121016','2012-10-16',E,'San Marino',  'World Cup 2014 Qualifier','WCQ','qualifier',W,WC,'San Marino','high','always',{eng:5,opp:0}),
f('f121114','2012-11-14',E,'Sweden',      'International Friendly','Friendly','friendly',W,WC,'Sweden','high','always',{eng:2,opp:4}),

// ── 2013 ──────────────────────────────────────────────────────────────────
f('f130206','2013-02-06',E,'Brazil',      'International Friendly','Friendly','friendly',W,WC,'Brazil','high','always',{eng:2,opp:1}),
f('f130322','2013-03-22',E,'Montenegro',  'World Cup 2014 Qualifier','WCQ','qualifier',W,WC,'Montenegro','high','always',{eng:1,opp:1}),
f('f130326','2013-03-26',E,'Moldova',     'World Cup 2014 Qualifier','WCQ','qualifier',W,WC,'Moldova','high','always',{eng:4,opp:0}),
f('f130529','2013-05-29','Republic of Ireland',E,'International Friendly','Friendly','friendly','Aviva Stadium','Dublin','Republic of Ireland','low','always',{eng:1,opp:1}),
f('f130603','2013-06-03',E,'Scotland',    'International Friendly','Friendly','friendly',W,WC,'Scotland','high','always',{eng:3,opp:2}),
f('f130806','2013-08-06',E,'Scotland',    'International Friendly','Friendly','friendly',W,WC,'Scotland','high','always',{eng:3,opp:2}),
f('f130906','2013-09-06',E,'Moldova',     'World Cup 2014 Qualifier','WCQ','qualifier',W,WC,'Moldova','high','always',{eng:4,opp:0}),
f('f130910','2013-09-10','Ukraine',E,     'World Cup 2014 Qualifier','WCQ','qualifier','Olympic NSC','Kyiv','Ukraine','high','always',{eng:0,opp:0}),
f('f131011','2013-10-11','Montenegro',E,  'World Cup 2014 Qualifier','WCQ','qualifier','Podgorica','Podgorica','Montenegro','high','always',{eng:1,opp:4}),
f('f131015','2013-10-15',E,'Poland',      'World Cup 2014 Qualifier','WCQ','qualifier',W,WC,'Poland','high','always',{eng:2,opp:0}),
f('f131115','2013-11-15',E,'Chile',       'International Friendly','Friendly','friendly',W,WC,'Chile','low','always',{eng:0,opp:2}),
f('f131119',  '2013-11-19',E,'Germany',   'International Friendly','Friendly','friendly',W,WC,'Germany','high','always',{eng:0,opp:1}),

// ── 2014 ──────────────────────────────────────────────────────────────────
f('f140305','2014-03-05',E,'Denmark',     'International Friendly','Friendly','friendly',W,WC,'Denmark','low','always',{eng:1,opp:0}),
f('f140530','2014-05-30',E,'Peru',        'International Friendly','Friendly','friendly',W,WC,'Peru','low','always',{eng:3,opp:0}),
f('f140604','2014-06-04','Ecuador',E,     'International Friendly','Friendly','friendly','Sun Life Stadium','Miami','Ecuador','low','always',{eng:2,opp:2}),
f('f140614','2014-06-14',E,'Italy',       'World Cup 2014 Group D','WC 14','tournament','Estadio Amazonia','Manaus','Italy','major','qualified',{eng:1,opp:2}),
f('f140619','2014-06-19',E,'Uruguay',     'World Cup 2014 Group D','WC 14','tournament','Arena de São Paulo','São Paulo','Uruguay','major','qualified',{eng:1,opp:2}),
f('f140624','2014-06-24',E,'Costa Rica',  'World Cup 2014 Group D','WC 14','tournament','Mineirão','Belo Horizonte','Costa Rica','major','qualified',{eng:0,opp:0}),
f('f140903','2014-09-03',E,'Norway',      'International Friendly','Friendly','friendly',W,WC,'Norway','low','always',{eng:1,opp:0}),
f('f140907','2014-09-07',E,'Switzerland', 'Euro 2016 Qualifier','ECQ','qualifier',W,WC,'Switzerland','high','always',{eng:2,opp:0}),
f('f141009','2014-10-09','San Marino',E,  'Euro 2016 Qualifier','ECQ','qualifier','San Marino Stadium','Serravalle','San Marino','high','always',{eng:0,opp:5}),
f('f141012','2014-10-12',E,'Estonia',     'Euro 2016 Qualifier','ECQ','qualifier',W,WC,'Estonia','high','always',{eng:1,opp:0}),
f('f141115','2014-11-15',E,'Slovenia',    'Euro 2016 Qualifier','ECQ','qualifier',W,WC,'Slovenia','high','always',{eng:3,opp:1}),

// ── 2015 ──────────────────────────────────────────────────────────────────
f('f150327','2015-03-27','Lithuania',E,   'Euro 2016 Qualifier','ECQ','qualifier','LFF Stadium','Vilnius','Lithuania','high','always',{eng:0,opp:3}),
f('f150331','2015-03-31',E,'Italy',       'International Friendly','Friendly','friendly',W,WC,'Italy','high','always',{eng:1,opp:1}),
f('f150604','2015-06-04',E,'Republic of Ireland','International Friendly','Friendly','friendly',W,WC,'Republic of Ireland','low','always',{eng:0,opp:0}),
f('f150614','2015-06-14',E,'San Marino',  'Euro 2016 Qualifier','ECQ','qualifier',W,WC,'San Marino','high','always',{eng:6,opp:0}),
f('f150904','2015-09-04',E,'San Marino',  'Euro 2016 Qualifier','ECQ','qualifier',W,WC,'San Marino','high','always',{eng:6,opp:0}),
f('f150905','2015-09-05',E,'Switzerland', 'Euro 2016 Qualifier','ECQ','qualifier',W,WC,'Switzerland','high','always',{eng:2,opp:0}),
f('f151009','2015-10-09','Estonia',E,     'Euro 2016 Qualifier','ECQ','qualifier','Le Coq Arena','Tallinn','Estonia','high','always',{eng:0,opp:2}),
f('f151012','2015-10-12',E,'Lithuania',   'Euro 2016 Qualifier','ECQ','qualifier',W,WC,'Lithuania','high','always',{eng:3,opp:0}),
f('f151115','2015-11-15','Slovenia',E,    'Euro 2016 Qualifier','ECQ','qualifier','Stozice','Ljubljana','Slovenia','major','always',{eng:2,opp:3}),
f('f151117','2015-11-17',E,'France',      'International Friendly','Friendly','friendly',W,WC,'France','high','always',{eng:2,opp:0}),

// ── 2016 ──────────────────────────────────────────────────────────────────
f('f160329','2016-03-29',E,'Netherlands', 'International Friendly','Friendly','friendly',W,WC,'Netherlands','high','always',{eng:1,opp:2}),
f('f160522','2016-05-22',E,'Turkey',      'International Friendly','Friendly','friendly','Etihad Stadium','Manchester','Turkey','low','always',{eng:2,opp:1}),
f('f160602','2016-06-02','Australia',E,   'International Friendly','Friendly','friendly','Stadium of Light','Sunderland','Australia','low','always',{eng:2,opp:1}),
f('f160611','2016-06-11',E,'Russia',      'Euro 2016 Group B','EC 16','tournament','Velodrome','Marseille','Russia','major','qualified',{eng:1,opp:1}),
f('f160616','2016-06-16',E,'Wales',       'Euro 2016 Group B','EC 16','tournament','Stade Bollaert-Delelis','Lens','Wales','major','qualified',{eng:2,opp:1}),
f('f160620','2016-06-20',E,'Slovakia',    'Euro 2016 Group B','EC 16','tournament','Stade Geoffroy-Guichard','Saint-Etienne','Slovakia','major','qualified',{eng:0,opp:0}),
f('f160627','2016-06-27',E,'Iceland',     'Euro 2016 R16','EC 16','tournament','Allianz Riviera','Nice','Iceland','major','qualified',{eng:1,opp:2}),
f('f160904','2016-09-04','Slovakia',E,    'World Cup 2018 Qualifier','WCQ','qualifier','City Arena Trnava','Trnava','Slovakia','high','always',{eng:0,opp:1}),
f('f161008','2016-10-08',E,'Malta',       'World Cup 2018 Qualifier','WCQ','qualifier',W,WC,'Malta','high','always',{eng:2,opp:0}),
f('f161011','2016-10-11',E,'Slovenia',    'World Cup 2018 Qualifier','WCQ','qualifier',W,WC,'Slovenia','high','always',{eng:1,opp:0}),
f('f161111','2016-11-11',E,'Scotland',    'World Cup 2018 Qualifier','WCQ','qualifier',W,WC,'Scotland','high','always',{eng:3,opp:0}),
f('f161115',  '2016-11-15','Spain',E,     'International Friendly','Friendly','friendly','Wembley','London','Spain','high','always',{eng:2,opp:2}),

// ── 2017 ──────────────────────────────────────────────────────────────────
f('f170322','2017-03-22','Germany',E,     'International Friendly','Friendly','friendly','Signal Iduna Park','Dortmund','Germany','high','always',{eng:0,opp:1}),
f('f170326','2017-03-26','Lithuania',E,   'World Cup 2018 Qualifier','WCQ','qualifier','LFF Stadium','Vilnius','Lithuania','high','always',{eng:0,opp:1}),
f('f170610','2017-06-10',E,'Scotland',    'World Cup 2018 Qualifier','WCQ','qualifier',W,WC,'Scotland','high','always',{eng:2,opp:2}),
f('f170613','2017-06-13',E,'France',      'International Friendly','Friendly','friendly','Stade de France','Paris','France','high','always',{eng:2,opp:3}),
f('f170831','2017-08-31',E,'Malta',       'World Cup 2018 Qualifier','WCQ','qualifier',W,WC,'Malta','high','always',{eng:4,opp:0}),
f('f170904','2017-09-04','Slovakia',E,    'World Cup 2018 Qualifier','WCQ','qualifier','City Arena Trnava','Trnava','Slovakia','high','always',{eng:1,opp:2}),
f('f171005','2017-10-05',E,'Slovenia',    'World Cup 2018 Qualifier','WCQ','qualifier',W,WC,'Slovenia','high','always',{eng:1,opp:0}),
f('f171008','2017-10-08','Lithuania',E,   'World Cup 2018 Qualifier','WCQ','qualifier','LFF Stadium','Vilnius','Lithuania','high','always',{eng:0,opp:1}),
f('f171110','2017-11-10',E,'Germany',     'International Friendly','Friendly','friendly',W,WC,'Germany','high','always',{eng:0,opp:0}),
f('f171114','2017-11-14',E,'Brazil',      'International Friendly','Friendly','friendly',W,WC,'Brazil','high','always',{eng:0,opp:0}),

// ── 2018 ──────────────────────────────────────────────────────────────────
f('f180123','2018-01-23','Netherlands',E, 'International Friendly','Friendly','friendly','Amsterdam Arena','Amsterdam','Netherlands','high','always',{eng:0,opp:1}),
f('f180327','2018-03-27','Italy',E,       'International Friendly','Friendly','friendly',W,WC,'Italy','high','always',{eng:1,opp:1}),
f('f180602','2018-06-02','Nigeria',E,     'International Friendly','Friendly','friendly',W,WC,'Nigeria','low','always',{eng:2,opp:1}),
f('f180607','2018-06-07','Costa Rica',E,  'International Friendly','Friendly','friendly','Elland Road','Leeds','Costa Rica','low','always',{eng:2,opp:0}),
f('f180618','2018-06-18',E,'Tunisia',     'World Cup 2018 Group G','WC 18','tournament','Volgograd Arena','Volgograd','Tunisia','major','qualified',{eng:2,opp:1}),
f('f180624','2018-06-24',E,'Panama',      'World Cup 2018 Group G','WC 18','tournament','Nizhny Novgorod Stadium','Nizhny Novgorod','Panama','major','qualified',{eng:6,opp:1}),
f('f180628','2018-06-28',E,'Belgium',     'World Cup 2018 Group G','WC 18','tournament','Kaliningrad Stadium','Kaliningrad','Belgium','major','qualified',{eng:0,opp:1}),
f('f180703','2018-07-03',E,'Colombia',    'World Cup 2018 R16','WC 18','tournament','Spartak Stadium','Moscow','Colombia','major','qualified',{eng:1,opp:1}),
f('f180707','2018-07-07',E,'Sweden',      'World Cup 2018 QF','WC 18','tournament','Samara Arena','Samara','Sweden','major','qualified',{eng:2,opp:0}),
f('f180711','2018-07-11',E,'Croatia',     'World Cup 2018 SF','WC 18','tournament','Luzhniki','Moscow','Croatia','major','qualified',{eng:1,opp:2}),
f('f180714','2018-07-14',E,'Belgium',     'World Cup 2018 3rd Place','WC 18','tournament','Saint Petersburg Stadium','Saint Petersburg','Belgium','major','qualified',{eng:0,opp:2}),
f('f180911','2018-09-11','Spain',E,       'UEFA Nations League','NL','cup','Estadio Benito Villamarín','Seville','Spain','high','always',{eng:2,opp:3}),
f('f180915','2018-09-15',E,'Switzerland', 'UEFA Nations League','NL','cup',W,WC,'Switzerland','high','always',{eng:1,opp:0}),
f('f181012','2018-10-12','Croatia',E,     'UEFA Nations League','NL','cup','HNK Rijeka','Rijeka','Croatia','high','always',{eng:0,opp:0}),
f('f181015','2018-10-15',E,'Spain',       'UEFA Nations League','NL','cup',W,WC,'Spain','high','always',{eng:3,opp:2}),
f('f181115','2018-11-15','United States',E,'International Friendly','Friendly','friendly','Wayne Rooney MLS','DC','USA','low','always',{eng:3,opp:0}),

// ── 2019 ──────────────────────────────────────────────────────────────────
f('f190322','2019-03-22','Czech Republic',E,'Euro 2020 Qualifier','ECQ','qualifier','Sinobo Stadium','Prague','Czech Republic','high','always',{eng:1,opp:5}),
f('f190325','2019-03-25',E,'Montenegro',  'Euro 2020 Qualifier','ECQ','qualifier',W,WC,'Montenegro','high','always',{eng:5,opp:1}),
f('f190605','2019-06-05',E,'Denmark',     'UEFA Nations League SF','NL','cup','Estadio D. Afonso Henriques','Guimarães','Denmark','high','always',{eng:0,opp:0}),
f('f190609','2019-06-09',E,'Netherlands', 'UEFA Nations League Final','NL','cup','Estadio D. Afonso Henriques','Guimarães','Netherlands','high','always',{eng:0,opp:3}),
f('f190607','2019-06-07',E,'Bulgaria',    'Euro 2020 Qualifier','ECQ','qualifier',W,WC,'Bulgaria','high','always',{eng:4,opp:0}),
f('f190907','2019-09-07','Kosovo',E,      'Euro 2020 Qualifier','ECQ','qualifier','Fadil Vokrri','Pristina','Kosovo','high','always',{eng:0,opp:4}),
f('f190910','2019-09-10',E,'Kosovo',      'Euro 2020 Qualifier','ECQ','qualifier',W,WC,'Kosovo','high','always',{eng:5,opp:3}),
f('f191010','2019-10-10','Czech Republic',E,'International Friendly','Friendly','friendly','Wembley','London','Czech Republic','low','always',null),
f('f191014','2019-10-14','Bulgaria',E,    'Euro 2020 Qualifier','ECQ','qualifier','Vasil Levski','Sofia','Bulgaria','major','always',{eng:0,opp:6}),
f('f191018','2019-10-18',E,'Czech Republic','Euro 2020 Qualifier','ECQ','qualifier',W,WC,'Czech Republic','high','always',{eng:0,opp:0}),
f('f191114','2019-11-14','Montenegro',E,  'Euro 2020 Qualifier','ECQ','qualifier','Pod Goricom','Podgorica','Montenegro','major','always',{eng:1,opp:7}),

// ── 2020/2021 ─────────────────────────────────────────────────────────────
f('f210328','2021-03-25',E,'San Marino',  'World Cup 2022 Qualifier','WCQ','qualifier',W,WC,'San Marino','high','always',{eng:5,opp:0}),
f('f210328b','2021-03-28','Albania',E,    'World Cup 2022 Qualifier','WCQ','qualifier','Air Albania','Tirana','Albania','high','always',{eng:0,opp:2}),
f('f210425','2021-04-25',E,'Albania',     'World Cup 2022 Qualifier','WCQ','qualifier',W,WC,'Albania','high','always',{eng:2,opp:0}),
f('f210530','2021-05-30','Austria',E,     'International Friendly','Friendly','friendly','Wembley','London','Austria','low','always',{eng:1,opp:0}),
f('f210602','2021-06-02',E,'Romania',     'International Friendly','Friendly','friendly',W,WC,'Romania','low','always',{eng:1,opp:0}),
f('f210606','2021-06-06',E,'Andorra',     'World Cup 2022 Qualifier','WCQ','qualifier',W,WC,'Andorra','high','always',{eng:3,opp:0}),
f('f210613','2021-06-13',E,'Croatia',     'Euro 2020 Group D','EC 20','tournament',W,WC,'Croatia','major','qualified',{eng:1,opp:0}),
f('f210618','2021-06-18',E,'Scotland',    'Euro 2020 Group D','EC 20','tournament',W,WC,'Scotland','major','qualified',{eng:0,opp:0}),
f('f210622','2021-06-22',E,'Czech Republic','Euro 2020 Group D','EC 20','tournament',W,WC,'Czech Republic','major','qualified',{eng:1,opp:0}),
f('f210626','2021-06-26',E,'Germany',     'Euro 2020 R16','EC 20','tournament',W,WC,'Germany','major','qualified',{eng:2,opp:0}),
f('f210703','2021-07-03',E,'Ukraine',     'Euro 2020 QF','EC 20','tournament','Olympic Stadium','Rome','Ukraine','major','qualified',{eng:4,opp:0}),
f('f210707','2021-07-07',E,'Denmark',     'Euro 2020 SF','EC 20','tournament',W,WC,'Denmark','major','qualified',{eng:2,opp:1}),
f('f210711','2021-07-11',E,'Italy',       'Euro 2020 Final','EC 20','tournament',W,WC,'Italy','major','qualified',{eng:1,opp:1}),
f('f210902','2021-09-02','Hungary',E,     'World Cup 2022 Qualifier','WCQ','qualifier','Puskás Arena','Budapest','Hungary','high','always',{eng:0,opp:4}),
f('f210905','2021-09-05',E,'Andorra',     'World Cup 2022 Qualifier','WCQ','qualifier',W,WC,'Andorra','high','always',{eng:4,opp:0}),
f('f211007','2021-10-07',E,'Andorra',     'World Cup 2022 Qualifier','WCQ','qualifier',W,WC,'Andorra','high','always',null),
f('f211009','2021-10-09',E,'Hungary',     'World Cup 2022 Qualifier','WCQ','qualifier',W,WC,'Hungary','high','always',{eng:1,opp:1}),
f('f211112','2021-11-12',E,'Albania',     'World Cup 2022 Qualifier','WCQ','qualifier',W,WC,'Albania','high','always',{eng:5,opp:0}),
f('f211115','2021-11-15','San Marino',E,  'World Cup 2022 Qualifier','WCQ','qualifier','San Marino Stadium','Serravalle','San Marino','high','always',{eng:0,opp:10}),

// ── 2022 ──────────────────────────────────────────────────────────────────
f('f220326','2022-03-26',E,'Switzerland', 'International Friendly','Friendly','friendly',W,WC,'Switzerland','low','always',{eng:2,opp:1}),
f('f220329','2022-03-29','Ivory Coast',E, 'International Friendly','Friendly','friendly',W,WC,'Ivory Coast','low','always',{eng:3,opp:0}),
f('f220602','2022-06-02','Hungary',E,     'UEFA Nations League','NL','cup','Puskás Arena','Budapest','Hungary','high','always',{eng:1,opp:0}),
f('f220605','2022-06-05','Germany',E,     'UEFA Nations League','NL','cup','Allianz Arena','Munich','Germany','high','always',{eng:1,opp:1}),
f('f220611','2022-06-11',E,'Italy',       'UEFA Nations League','NL','cup',W,WC,'Italy','high','always',{eng:0,opp:0}),
f('f220614','2022-06-14',E,'Hungary',     'UEFA Nations League','NL','cup',W,WC,'Hungary','high','always',{eng:0,opp:4}),
f('f220923','2022-09-23','Italy',E,       'UEFA Nations League','NL','cup','San Siro','Milan','Italy','high','always',{eng:0,opp:0}),
f('f220926','2022-09-26',E,'Germany',     'UEFA Nations League','NL','cup',W,WC,'Germany','high','always',{eng:3,opp:3}),
f('f221121','2022-11-21',E,'Iran',        'World Cup 2022 Group B','WC 22','tournament','Khalifa Int\'l','Doha','Iran','major','qualified',{eng:6,opp:2}),
f('f221125','2022-11-25',E,'USA',         'World Cup 2022 Group B','WC 22','tournament','Al Bayt','Al Khor','USA','major','qualified',{eng:0,opp:0}),
f('f221129','2022-11-29',E,'Wales',       'World Cup 2022 Group B','WC 22','tournament','Ahmed bin Ali','Al Rayyan','Wales','major','qualified',{eng:3,opp:0}),
f('f221204','2022-12-04',E,'Senegal',     'World Cup 2022 R16','WC 22','tournament','Al Bayt','Al Khor','Senegal','major','qualified',{eng:3,opp:0}),
f('f221210','2022-12-10',E,'France',      'World Cup 2022 QF','WC 22','tournament','Al Bayt','Al Khor','France','major','qualified',{eng:1,opp:2}),

// ── 2023 ──────────────────────────────────────────────────────────────────
f('f230323','2023-03-23','Italy',E,       'Euro 2024 Qualifier','ECQ','qualifier','Diego Armando Maradona','Naples','Italy','high','always',{eng:1,opp:2}),
f('f230326','2023-03-26',E,'Ukraine',     'Euro 2024 Qualifier','ECQ','qualifier',W,WC,'Ukraine','high','always',{eng:2,opp:0}),
f('f230617','2023-06-17',E,'Malta',       'Euro 2024 Qualifier','ECQ','qualifier',W,WC,'Malta','high','always',{eng:4,opp:0}),
f('f230620','2023-06-20',E,'North Macedonia','Euro 2024 Qualifier','ECQ','qualifier',W,WC,'North Macedonia','high','always',null),
f('f230909','2023-09-09',E,'Ukraine',     'Euro 2024 Qualifier','ECQ','qualifier',W,WC,'Ukraine','high','always',{eng:0,opp:0}),
f('f231012','2023-10-12',E,'Australia',   'International Friendly','Friendly','friendly',W,WC,'Australia','low','always',{eng:1,opp:0}),
f('f231017','2023-10-17','Italy',E,       'Euro 2024 Qualifier','ECQ','qualifier','San Siro','Milan','Italy','high','always',{eng:1,opp:3}),
f('f231117','2023-11-17','North Macedonia',E,'Euro 2024 Qualifier','ECQ','qualifier','Toše Proeski','Skopje','North Macedonia','high','always',{eng:1,opp:7}),
f('f231120','2023-11-20',E,'North Macedonia','Euro 2024 Qualifier','ECQ','qualifier',W,WC,'North Macedonia','high','always',{eng:2,opp:0}),

// ── 2024 ──────────────────────────────────────────────────────────────────
f('f240323','2024-03-23','Brazil',E,      'International Friendly','Friendly','friendly',W,WC,'Brazil','high','always',{eng:0,opp:1}),
f('f240326','2024-03-26',E,'Belgium',     'International Friendly','Friendly','friendly',W,WC,'Belgium','low','always',{eng:2,opp:2}),
f('f240607','2024-06-07',E,'Iceland',     'International Friendly','Friendly','friendly','Wembley','London','Iceland','low','always',{eng:1,opp:0}),
f('f240616','2024-06-16',E,'Serbia',      'Euro 2024 Group C','EC 24','tournament','Arena AufSchalke','Gelsenkirchen','Serbia','major','qualified',{eng:1,opp:0}),
f('f240620','2024-06-20',E,'Denmark',     'Euro 2024 Group C','EC 24','tournament','Frankfurt Arena','Frankfurt','Denmark','major','qualified',{eng:1,opp:1}),
f('f240625','2024-06-25',E,'Slovenia',    'Euro 2024 Group C','EC 24','tournament','Cologne Stadium','Cologne','Slovenia','major','qualified',{eng:0,opp:0}),
f('f240630','2024-06-30',E,'Slovakia',    'Euro 2024 R16','EC 24','tournament','Arena AufSchalke','Gelsenkirchen','Slovakia','major','qualified',{eng:2,opp:1}),
f('f240706','2024-07-06',E,'Switzerland', 'Euro 2024 QF','EC 24','tournament','Düsseldorf Arena','Düsseldorf','Switzerland','major','qualified',{eng:1,opp:1}),
f('f240710','2024-07-10',E,'Netherlands', 'Euro 2024 SF','EC 24','tournament','BVB Stadion','Dortmund','Netherlands','major','qualified',{eng:2,opp:1}),
f('f240714','2024-07-14',E,'Spain',       'Euro 2024 Final','EC 24','tournament','Olympiastadion','Berlin','Spain','major','qualified',{eng:1,opp:2}),

];
more.forEach(m => { if(m) window.ALL_FIXTURES.push(m); });
})();
