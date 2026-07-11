# England Manager — Project Structure

## Architecture

```
england-manager/
├── index.html                  # Entry point
├── css/
│   ├── base.css                # Reset, variables, typography
│   ├── layout.css              # Screen shells, grids
│   ├── components.css          # Buttons, cards, inputs, tables
│   └── screens/
│       ├── menu.css
│       ├── squad.css
│       ├── match.css
│       └── result.css
├── js/
│   ├── main.js                 # Boot, screen router
│   ├── state.js                # Single source of truth (game state)
│   ├── data/
│   │   ├── players/
│   │   │   ├── 1986.js         # ~50 players
│   │   │   ├── 1990.js
│   │   │   ├── 1994.js
│   │   │   ├── 1996.js
│   │   │   ├── 1998.js
│   │   │   ├── 2000.js
│   │   │   ├── 2002.js
│   │   │   ├── 2004.js
│   │   │   ├── 2006.js
│   │   │   ├── 2010.js
│   │   │   ├── 2014.js
│   │   │   ├── 2018.js
│   │   │   ├── 2020.js
│   │   │   └── 2024.js
│   │   ├── fixtures/
│   │   │   ├── 1986-87.js      # Full fixture list per season
│   │   │   ├── 1987-88.js
│   │   │   └── ...
│   │   ├── nations.js          # All opponent nations + ratings
│   │   └── formations.js       # Formation definitions
│   ├── engine/
│   │   ├── match.js            # Core match simulation loop
│   │   ├── events.js           # Goal / card / injury event generation
│   │   ├── tactics.js          # Tactical modifiers + calculations
│   │   ├── ratings.js          # Player rating logic
│   │   └── commentary.js       # Commentary text banks
│   └── ui/
│       ├── menu.js
│       ├── squad.js
│       ├── match.js
│       ├── result.js
│       └── components.js       # Shared UI builders
└── assets/
    └── fonts/                  # Self-hosted if needed
```

## Data Model

### Player
```js
{
  id: 'shilton_peter',
  name: 'Peter Shilton',
  dob: '1949-09-18',
  pos: 'GK',              // GK RB CB LB RM CM LM ST
  posGroup: 'GK',         // GK DEF MID FWD
  club: 'Southampton',
  caps: 100,
  goals: 0,
  // Attributes (1-20 scale)
  attrs: {
    pace: 8, shooting: 4, passing: 10,
    dribbling: 5, defending: 6, physical: 13,
    gk_handling: 18, gk_reflexes: 19, gk_positioning: 17
  },
  // Overall per season (calculated)
  seasons: {
    1986: { rating: 92, club: 'Southampton' },
    1987: { rating: 91, club: 'Derby County' },
    ...
  },
  // Career record
  englandRecord: { caps: 125, goals: 0, debut: '1970-11-25' }
}
```

### Fixture
```js
{
  id: 'eng_nir_oct1986',
  date: '1986-10-15',
  homeTeam: 'England',
  awayTeam: 'N. Ireland',
  competition: 'WCQ',
  competitionFull: '1986 World Cup Qualifier — Group 7',
  venue: 'Wembley Stadium',
  venueCity: 'London',
  importance: 'high',       // affects crowd, pressure
  neutralGround: false,
  historicResult: { eng: 3, opp: 0 }   // shown post-match as trivia
}
```

## State Shape
```js
GameState = {
  meta: { manager, era, difficulty, season, started },
  campaign: { fixtureIdx, results[], standings{} },
  squad: { slots[11], bench[5] },
  match: { running, minute, score, events[], tactics, subs },
}
```
