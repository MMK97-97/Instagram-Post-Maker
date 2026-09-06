(() => {
  'use strict';

  const WATCHDOG_VERSION = '10.0.0';
  const BUILD_VERSION = '11.1.0-premium-visibility';
  const LOGO_PATH = 'assets/fwcwl-logo.jpeg';

  const REQUIRED_IDS = [
    'posterWorkspace',
    'posterCanvas',
    'posterTemplateGrid',
    'posterTemplateCount',
    'posterInspector',
    'posterInspectorTitle',
    'posterInspectorType',
    'posterCanvasSize',
    'posterStage',
    'posterZoomValue'
  ];

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const clamp = (value, min, max) =>
    Math.min(
      max,
      Math.max(
        min,
        Number(value)
      )
    );

  const uid = prefix =>
    `${prefix}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;

  const clone = value =>
    JSON.parse(
      JSON.stringify(value)
    );

  const esc = value =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');


  const normalizeHex = value => {

    let color =
      String(value || '')
        .trim();

    if (
      !color.startsWith('#')
    ) {
      color =
        `#${color}`;
    }

    return /^#[0-9a-fA-F]{6}$/.test(
      color
    )
      ? color.toUpperCase()
      : null;

  };


  const rgba = (
    hex,
    alpha
  ) => {

    let value =
      String(
        hex ||
        '#ffffff'
      )
        .replace(
          '#',
          ''
        );

    if (
      value.length ===
      3
    ) {

      value =
        value
          .split('')
          .map(
            char =>
              char +
              char
          )
          .join('');

    }

    const number =
      parseInt(
        value,
        16
      );

    if (
      Number.isNaN(
        number
      )
    ) {

      return `rgba(255,255,255,${alpha})`;

    }

    return `rgba(${
      (number >> 16) &
      255
    },${
      (number >> 8) &
      255
    },${
      number &
      255
    },${alpha})`;

  };


  const deepFreeze =
    object => {

      if (
        !object ||
        typeof object !==
          'object' ||
        Object.isFrozen(
          object
        )
      ) {

        return object;

      }

      Object.freeze(
        object
      );

      Object
        .getOwnPropertyNames(
          object
        )
        .forEach(
          key =>
            deepFreeze(
              object[key]
            )
        );

      return object;

    };


  function roundRectPath(
    ctx,
    x,
    y,
    width,
    height,
    radius
  ) {

    const r =
      Math.min(
        radius,
        Math.abs(width) /
          2,
        Math.abs(height) /
          2
      );

    ctx.beginPath();

    ctx.moveTo(
      x + r,
      y
    );

    ctx.arcTo(
      x + width,
      y,
      x + width,
      y + height,
      r
    );

    ctx.arcTo(
      x + width,
      y + height,
      x,
      y + height,
      r
    );

    ctx.arcTo(
      x,
      y + height,
      x,
      y,
      r
    );

    ctx.arcTo(
      x,
      y,
      x + width,
      y,
      r
    );

    ctx.closePath();

  }



  /* ============================================================
     FORMATS
  ============================================================ */

  const FORMATS =
    deepFreeze({

      portrait: {
        width: 1080,
        height: 1350,
        label:
          'Instagram Portrait'
      },

      square: {
        width: 1080,
        height: 1080,
        label:
          'Instagram Square'
      },

      story: {
        width: 1080,
        height: 1920,
        label:
          'Story / Reel Cover'
      }

    });



  /* ============================================================
     TEMPLATE FACTORY
  ============================================================ */

  const T = (
    id,
    name,
    category,
    style,
    kicker,
    title,
    detail,
    palette,
    options = {}
  ) => ({

    id,
    name,
    category,
    style,
    kicker,
    title,
    detail,
    palette,

    cta:
      options.cta ||
      'FWCWL',

    align:
      options.align ||
      'left',

    titleSize:
      options.titleSize ||
      120,

    titleY:
      options.titleY ||
      50,

    titleWidth:
      options.titleWidth ||
      80,

    font:
      options.font ||
      'Montserrat',

    texture:
      options.texture ||
      0

  });



  /* ============================================================
     TEMPLATE LIBRARY
     51 ORIGINAL + 37 NEW PREMIUM = 88
  ============================================================ */

  const TEMPLATES =
    deepFreeze([


      /* ========================================================
         EXISTING MATCH TEMPLATES
      ======================================================== */

      T(
        'match-day',
        'Match Day',
        'match',
        'slash',
        'FWCWL • MATCH DAY',
        'TAMPA\nVS RIVALS',
        'SATURDAY • 10:00 AM • TAMPA',
        [
          '#09090b',
          '#551019',
          '#f1c34d'
        ],
        {
          titleSize:
            132
        }
      ),


      T(
        'big-vs',
        'Big VS',
        'match',
        'versus',
        'THE SHOWDOWN',
        'TEAM A\nVS\nTEAM B',
        'TWO TEAMS • ONE WINNER',
        [
          '#061522',
          '#65141f',
          '#f1c34d'
        ],
        {
          align:
            'center',

          titleSize:
            122,

          titleY:
            37,

          font:
            'Bebas Neue'
        }
      ),


      T(
        'next-fixture',
        'Next Fixture',
        'match',
        'fixture',
        'NEXT FIXTURE',
        'SATURDAY\n10:00 AM',
        'TAMPA • FLORIDA',
        [
          '#111317',
          '#4b1017',
          '#f1c34d'
        ],
        {
          titleSize:
            115
        }
      ),


      T(
        'game-day',
        'Game Day',
        'match',
        'stadium',
        "IT'S TIME",
        'GAME\nDAY',
        'FWCWL • PRIME TIME CRICKET',
        [
          '#04151d',
          '#0e3440',
          '#f1c34d'
        ],
        {
          titleSize:
            158
        }
      ),


      T(
        'night-match',
        'Night Match',
        'match',
        'stadium',
        'UNDER THE LIGHTS',
        'GAME\nNIGHT',
        'FRIDAY • 7:30 PM',
        [
          '#03090f',
          '#102a3a',
          '#e5b63a'
        ],
        {
          titleSize:
            150
        }
      ),


      T(
        'rivalry',
        'Rivalry',
        'match',
        'split',
        'RIVALRY SERIES',
        'NO\nFRIENDS',
        'ONLY CRICKET',
        [
          '#0c0e12',
          '#66131d',
          '#f1c34d'
        ],
        {
          titleSize:
            142
        }
      ),


      T(
        'pre-match',
        'Pre-Match',
        'match',
        'lines',
        'MATCH PREVIEW',
        'READY\nTO GO',
        'THE COUNTDOWN STARTS NOW',
        [
          '#071418',
          '#4a1017',
          '#efc34f'
        ],
        {
          titleSize:
            140
        }
      ),


      T(
        'match-centre',
        'Match Centre',
        'match',
        'score',
        'FWCWL MATCH CENTRE',
        'LIVE\nCRICKET',
        'SCORES • STATS • UPDATES',
        [
          '#071515',
          '#142820',
          '#f1c34d'
        ],
        {
          titleSize:
            136
        }
      ),



      /* ========================================================
         EXISTING TEAM TEMPLATES
      ======================================================== */

      T(
        'playing-xi',
        'Playing XI',
        'team',
        'lineup',
        'MATCH PLAN',
        'PLAYING\nXI',
        'TEAM SHEET',
        [
          '#061b19',
          '#102922',
          '#f1c34d'
        ],
        {
          titleSize:
            148
        }
      ),


      T(
        'squad',
        'Squad Reveal',
        'team',
        'grid',
        'FWCWL SQUAD',
        'MEET\nTHE TEAM',
        'READY FOR BATTLE',
        [
          '#130e11',
          '#5e1520',
          '#efc04a'
        ],
        {
          titleSize:
            132
        }
      ),


      T(
        'captain',
        'Captain',
        'team',
        'captain',
        'LEADING THE SIDE',
        'OUR\nCAPTAIN',
        'LEADERSHIP • BELIEF • INTENT',
        [
          '#06131b',
          '#321016',
          '#f1c34d'
        ],
        {
          titleSize:
            150
        }
      ),


      T(
        'vice-captain',
        'Vice Captain',
        'team',
        'captain',
        'LEADERSHIP GROUP',
        'VICE\nCAPTAIN',
        'READY TO LEAD',
        [
          '#06141a',
          '#48131c',
          '#d9ac37'
        ],
        {
          titleSize:
            132
        }
      ),


      T(
        'player-spotlight',
        'Player Spotlight',
        'team',
        'player',
        'FWCWL PLAYER SERIES',
        'PLAYER\nSPOTLIGHT',
        'NAME • ROLE • TEAM',
        [
          '#061a1d',
          '#521620',
          '#f1c34d'
        ],
        {
          titleSize:
            126,

          titleWidth:
            60
        }
      ),


      T(
        'new-signing',
        'Player Signing',
        'team',
        'player',
        'WELCOME TO THE TEAM',
        'NEW\nSIGNING',
        'THE JOURNEY BEGINS',
        [
          '#0a1014',
          '#59111a',
          '#f1c34d'
        ],
        {
          titleSize:
            140
        }
      ),


      T(
        'training-day',
        'Training Day',
        'team',
        'lines',
        'PUT IN THE WORK',
        'TRAINING\nDAY',
        'NO SHORTCUTS',
        [
          '#081518',
          '#1d2e2c',
          '#e9bb43'
        ],
        {
          titleSize:
            140
        }
      ),


      T(
        'team-culture',
        'Team Culture',
        'team',
        'grit',
        'FWCWL • CRICKET CULTURE',
        'PLAY\nHARD',
        'ONE TEAM • ONE PURPOSE',
        [
          '#32110d',
          '#6c2b1a',
          '#f0bf47'
        ],
        {
          titleSize:
            152,

          texture:
            1
        }
      ),



      /* ========================================================
         EXISTING RESULT TEMPLATES
      ======================================================== */

      T(
        'potm',
        'Player of the Match',
        'result',
        'award',
        'OUTSTANDING PERFORMANCE',
        'PLAYER OF\nTHE MATCH',
        'A PERFORMANCE THAT CHANGED THE GAME',
        [
          '#171019',
          '#681d2c',
          '#d5a83b'
        ],
        {
          titleSize:
            116,

          titleWidth:
            62
        }
      ),


      T(
        'mvp',
        'MVP',
        'result',
        'gold',
        'MOST VALUABLE PLAYER',
        'MVP',
        'PURE IMPACT • PURE PERFORMANCE',
        [
          '#090909',
          '#2e220d',
          '#f6cd54'
        ],
        {
          align:
            'center',

          titleSize:
            220,

          font:
            'Bebas Neue'
        }
      ),


      T(
        'result',
        'Match Result',
        'result',
        'result',
        'FINAL RESULT',
        'VICTORY',
        'WON BY 24 RUNS',
        [
          '#06171b',
          '#49131a',
          '#f1c34d'
        ],
        {
          titleSize:
            160
        }
      ),


      T(
        'scorecard',
        'Scorecard',
        'result',
        'score',
        'FINAL SCORE',
        '186 / 5',
        '20 OVERS • TARGET 163',
        [
          '#050708',
          '#182327',
          '#f1c34d'
        ],
        {
          titleSize:
            180,

          font:
            'Bebas Neue'
        }
      ),


      T(
        'live-score',
        'Live Score',
        'result',
        'score',
        '● LIVE',
        '142 / 4',
        '16.2 OVERS • NEED 38 FROM 22',
        [
          '#061219',
          '#181b20',
          '#e93d49'
        ],
        {
          titleSize:
            180,

          font:
            'Bebas Neue'
        }
      ),


      T(
        'champions',
        'Champions',
        'result',
        'gold',
        'FWCWL CHAMPIONS',
        'CHAMPIONS',
        'THE TROPHY IS OURS',
        [
          '#080808',
          '#33210b',
          '#f1c34d'
        ],
        {
          align:
            'center',

          titleSize:
            148,

          titleY:
            46
        }
      ),


      T(
        'top-scorer',
        'Top Scorer',
        'result',
        'award',
        'BATSMAN OF THE SEASON',
        'TOP\nSCORER',
        'RUNS • AVERAGE • STRIKE RATE',
        [
          '#0a1216',
          '#4e121c',
          '#e8b63e'
        ],
        {
          titleSize:
            148
        }
      ),


      T(
        'best-bowler',
        'Best Bowler',
        'result',
        'award',
        'BOWLER OF THE SEASON',
        'BEST\nBOWLER',
        'WICKETS • ECONOMY • IMPACT',
        [
          '#06171c',
          '#42121a',
          '#f1c34d'
        ],
        {
          titleSize:
            148
        }
      ),



      /* ========================================================
         EXISTING EVENT TEMPLATES
      ======================================================== */

      T(
        'final',
        'The Final',
        'event',
        'final',
        'CHAMPIONSHIP',
        'THE\nFINAL',
        'ONE GAME • ONE TROPHY',
        [
          '#08080a',
          '#431017',
          '#f2ca55'
        ],
        {
          align:
            'center',

          titleSize:
            174,

          titleY:
            40
        }
      ),


      T(
        'semi-final',
        'Semi Final',
        'event',
        'final',
        'ONE STEP AWAY',
        'SEMI\nFINAL',
        'EVERY BALL MATTERS',
        [
          '#071120',
          '#711623',
          '#f1c34d'
        ],
        {
          align:
            'center',

          titleSize:
            160,

          titleY:
            40
        }
      ),


      T(
        'tournament',
        'Tournament',
        'event',
        'pitch',
        'FWCWL PRESENTS',
        'WINTER\nLEAGUE',
        'TAMPA • FLORIDA',
        [
          '#052023',
          '#10504e',
          '#edbc42'
        ],
        {
          titleSize:
            144
        }
      ),


      T(
        'registration',
        'Registration',
        'event',
        'ticket',
        'REGISTRATION IS OPEN',
        'JOIN\nTHE LEAGUE',
        'TEAMS • PLAYERS • CRICKET',
        [
          '#111013',
          '#5c131d',
          '#f1c34d'
        ],
        {
          titleSize:
            138
        }
      ),


      T(
        'tryouts',
        'Tryouts',
        'event',
        'slash',
        'SHOW US YOUR GAME',
        'OPEN\nTRYOUTS',
        'YOUR NEXT INNINGS STARTS HERE',
        [
          '#06171b',
          '#1e3a43',
          '#f1c34d'
        ],
        {
          titleSize:
            150
        }
      ),


      T(
        'auction',
        'Player Auction',
        'event',
        'cards',
        'FWCWL AUCTION NIGHT',
        'PLAYER\nAUCTION',
        'BUILD YOUR SQUAD',
        [
          '#140f11',
          '#5b121b',
          '#f1c34d'
        ],
        {
          titleSize:
            138
        }
      ),


      T(
        'schedule',
        'Season Schedule',
        'event',
        'fixture',
        'SEASON 2026',
        'FIXTURE\nDROP',
        'THE ROAD STARTS HERE',
        [
          '#081116',
          '#3d1016',
          '#f1c34d'
        ],
        {
          titleSize:
            144
        }
      ),


      T(
        'opening',
        'Opening Ceremony',
        'event',
        'gold',
        'FWCWL OPENING NIGHT',
        'LET THE\nSEASON BEGIN',
        'WELCOME TO THE LEAGUE',
        [
          '#090909',
          '#41141b',
          '#efc04b'
        ],
        {
          align:
            'center',

          titleSize:
            116
        }
      ),



      /* ========================================================
         EXISTING SOCIAL TEMPLATES
      ======================================================== */

      T(
        'milestone',
        'Milestone',
        'social',
        'milestone',
        'CAREER MILESTONE',
        '100',
        'A LANDMARK INNINGS',
        [
          '#071419',
          '#50131c',
          '#f1c34d'
        ],
        {
          titleSize:
            230
        }
      ),


      T(
        'birthday',
        'Birthday',
        'social',
        'confetti',
        'FWCWL FAMILY',
        'HAPPY\nBIRTHDAY',
        'WISHING YOU A GREAT YEAR',
        [
          '#160f18',
          '#6b203c',
          '#f1c34d'
        ],
        {
          titleSize:
            134
        }
      ),


      T(
        'sponsor',
        'Sponsor',
        'social',
        'frame',
        'OFFICIAL PARTNER',
        'WELCOME\nABOARD',
        'PROUDLY PARTNERING WITH FWCWL',
        [
          '#0a0b0d',
          '#232529',
          '#f1c34d'
        ],
        {
          titleSize:
            126
        }
      ),


      T(
        'thank-you',
        'Thank You',
        'social',
        'radial',
        'FROM THE FWCWL FAMILY',
        'THANK\nYOU',
        'FOR YOUR SUPPORT',
        [
          '#091417',
          '#47121a',
          '#f1c34d'
        ],
        {
          titleSize:
            162
        }
      ),


      T(
        'breaking',
        'Breaking News',
        'social',
        'news',
        'FWCWL • BREAKING',
        'BIG\nNEWS',
        'OFFICIAL ANNOUNCEMENT',
        [
          '#090a0d',
          '#601019',
          '#f1c34d'
        ],
        {
          titleSize:
            180
        }
      ),


      T(
        'highlights',
        'Match Highlights',
        'social',
        'slash',
        'MATCH RECAP',
        'HIGHLIGHTS',
        'THE MOMENTS THAT DECIDED THE GAME',
        [
          '#061419',
          '#55131d',
          '#f1c34d'
        ],
        {
          titleSize:
            140
        }
      ),



      /* ========================================================
         EXISTING RUSTIC TEMPLATES
      ======================================================== */

      T(
        'brutalist',
        'Brutalist Match',
        'rustic',
        'brutalist',
        'FWCWL MATCH CENTRE',
        'NO\nEXCUSES',
        'LIMITED • RAW • CRICKET',
        [
          '#111111',
          '#1c1a16',
          '#d4ad4a'
        ],
        {
          titleSize:
            160,

          texture:
            1
        }
      ),


      T(
        'film-grain',
        'Film Grain Player',
        'rustic',
        'film',
        'PLAYER FEATURE',
        'BUILT\nDIFFERENT',
        'GRIT • DISCIPLINE • GAME',
        [
          '#221814',
          '#3a2820',
          '#d2aa48'
        ],
        {
          titleSize:
            140,

          texture:
            1
        }
      ),


      T(
        'red-clay',
        'Red Clay Cricket',
        'rustic',
        'grit',
        'FWCWL • CRICKET CULTURE',
        'PLAY\nHARD',
        'RUSTIC SERIES',
        [
          '#35120d',
          '#722c1a',
          '#e8bb48'
        ],
        {
          titleSize:
            150,

          texture:
            1
        }
      ),


      T(
        'black-gold',
        'Black Gold Texture',
        'rustic',
        'gold-grit',
        'PREMIER CRICKET',
        'THE\nFINAL',
        'LIMITED EDITION',
        [
          '#090909',
          '#171309',
          '#d6a93a'
        ],
        {
          titleSize:
            158,

          texture:
            1
        }
      ),


      T(
        'weathered',
        'Weathered Fixture',
        'rustic',
        'paper',
        'MATCH NOTICE',
        'NEXT\nFIXTURE',
        'FWCWL ARCHIVES',
        [
          '#d8c7a6',
          '#9f8869',
          '#7f2226'
        ],
        {
          titleSize:
            138,

          texture:
            1
        }
      ),



      /* ========================================================
         EXISTING LAYERED
      ======================================================== */

      T(
        'player-collage',
        'Player Collage',
        'layered',
        'collage',
        'FWCWL PLAYER SERIES',
        'PLAYER\nSPOTLIGHT',
        'LAYERED EDITORIAL',
        [
          '#171016',
          '#6b1b27',
          '#efc14b'
        ],
        {
          titleSize:
            128
        }
      ),


      T(
        'tactical-lineup',
        'Tactical Lineup',
        'layered',
        'lineup',
        'MATCH PLAN',
        'PLAYING\nXI',
        'TACTICAL TEAM SHEET',
        [
          '#061b18',
          '#142b22',
          '#f1c34d'
        ],
        {
          titleSize:
            148
        }
      ),


      T(
        'stacked-rivalry',
        'Stacked Rivalry',
        'layered',
        'stack',
        'RIVALRY WEEK',
        'TEAM A\nVS\nTEAM B',
        'LAYERED MATCH SERIES',
        [
          '#101118',
          '#701822',
          '#f1c34d'
        ],
        {
          align:
            'center',

          titleSize:
            118
        }
      ),


      T(
        'cutout-hero',
        'Cutout Hero',
        'layered',
        'cutout',
        'PLAYER FEATURE',
        'OWN\nTHE GAME',
        'FWCWL HERO SERIES',
        [
          '#07141b',
          '#50131d',
          '#f1c34d'
        ],
        {
          titleSize:
            150
        }
      ),



      /* ========================================================
         EXISTING VINTAGE
      ======================================================== */

      T(
        'retro',
        'Retro Cricket',
        'vintage',
        'retro',
        'TAMPA CRICKET',
        'SUMMER\nCRICKET',
        'ARCHIVE SERIES',
        [
          '#c8ac81',
          '#74464b',
          '#4b2b25'
        ],
        {
          titleSize:
            132,

          font:
            'Playfair Display',

          texture:
            1
        }
      ),


      T(
        'trophy-archive',
        'Trophy Archive',
        'vintage',
        'paper',
        'FWCWL ARCHIVES',
        'CHAMPIONS',
        'A SEASON TO REMEMBER',
        [
          '#d4bc8d',
          '#a78760',
          '#852c31'
        ],
        {
          align:
            'center',

          titleSize:
            124,

          font:
            'Playfair Display',

          texture:
            1
        }
      ),


      T(
        'heritage',
        'Heritage Match',
        'vintage',
        'retro',
        'HERITAGE SERIES',
        'CLASSIC\nCRICKET',
        'TRADITION MEETS COMPETITION',
        [
          '#c6af88',
          '#675747',
          '#7b292c'
        ],
        {
          titleSize:
            126,

          font:
            'Playfair Display',

          texture:
            1
        }
      ),



      /* ========================================================
         EXISTING EDITORIAL
      ======================================================== */

      T(
        'editorial-feature',
        'Editorial Feature',
        'editorial',
        'editorial',
        'THE FWCWL EDIT',
        'THE\nGAME',
        'A MODERN CRICKET STORY',
        [
          '#eee4cf',
          '#cbb892',
          '#6f1d28'
        ],
        {
          titleSize:
            158,

          font:
            'Playfair Display'
        }
      ),



      /* ========================================================
         NEW PREMIUM RUSTIC COLLECTION
      ======================================================== */

      T(
        'leather-match',
        'Leather Match',
        'rustic',
        'gold-grit',
        'HANDCRAFTED CRICKET',
        'MATCH\nDAY',
        'LEATHER • WILLOW • GLORY',
        [
          '#100b08',
          '#332114',
          '#d9ad4a'
        ],
        {
          titleSize:
            154,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'old-scorebook',
        'Old Scorebook',
        'rustic',
        'paper',
        'OFFICIAL MATCH RECORD',
        'SCORE\nBOOK',
        'RUNS • WICKETS • OVERS',
        [
          '#1c1510',
          '#5f4a30',
          '#d5af58'
        ],
        {
          titleSize:
            138,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'clubhouse-fixture',
        'Clubhouse Fixture',
        'rustic',
        'film',
        'FROM THE CLUBHOUSE',
        'NEXT\nFIXTURE',
        'SATURDAY • 10:00 AM',
        [
          '#100c09',
          '#49301d',
          '#d7aa45'
        ],
        {
          titleSize:
            142,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'red-dust-derby',
        'Red Dust Derby',
        'rustic',
        'grit',
        'THE DUST WILL RISE',
        'DERBY\nDAY',
        'RIVALRY • GRIT • CRICKET',
        [
          '#2a100c',
          '#7c301d',
          '#e0ad46'
        ],
        {
          titleSize:
            146,

          texture:
            1
        }
      ),


      T(
        'chalkboard-xi',
        'Chalkboard XI',
        'rustic',
        'lineup',
        'TACTICAL BOARD',
        'PLAYING\nXI',
        'FIELD PLAN • ROLES • MATCHUPS',
        [
          '#06110e',
          '#16342a',
          '#d8bd63'
        ],
        {
          titleSize:
            142,

          texture:
            1
        }
      ),


      T(
        'bat-ball-heritage',
        'Bat & Ball Heritage',
        'rustic',
        'retro',
        'WILLOW & LEATHER',
        'CLASSIC\nCRICKET',
        'BUILT ON TRADITION',
        [
          '#17100a',
          '#5b3a1e',
          '#e0b657'
        ],
        {
          titleSize:
            136,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'boundary-rope',
        'Boundary Rope',
        'rustic',
        'pitch',
        'OUT ON THE FIELD',
        'MATCH\nDAY',
        'EVERY RUN MATTERS',
        [
          '#071511',
          '#18392b',
          '#dfb642'
        ],
        {
          titleSize:
            150,

          texture:
            1
        }
      ),


      T(
        'weathered-score',
        'Weathered Scorecard',
        'rustic',
        'score',
        'MATCH ARCHIVE',
        '186 / 5',
        '20 OVERS • WON BY 24 RUNS',
        [
          '#21170f',
          '#6e5437',
          '#e5bd67'
        ],
        {
          titleSize:
            190,

          texture:
            1,

          font:
            'Bebas Neue'
        }
      ),


      T(
        'pavilion-match',
        'Pavilion Match',
        'rustic',
        'retro',
        'SATURDAY AT THE PAVILION',
        'FIRST\nBALL',
        'A CLASSIC DAY OF CRICKET',
        [
          '#11100c',
          '#3b3628',
          '#d6b051'
        ],
        {
          titleSize:
            142,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'cricket-almanac',
        'Cricket Almanac',
        'rustic',
        'paper',
        'FWCWL ALMANAC',
        'SEASON\n2026',
        'FIXTURES • RECORDS • STORIES',
        [
          '#18130d',
          '#473b27',
          '#d2ac55'
        ],
        {
          titleSize:
            132,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'stitched-final',
        'Stitched Leather Final',
        'rustic',
        'gold-grit',
        'PREMIER CRICKET',
        'THE\nFINAL',
        'ONE TROPHY • ONE CHAMPION',
        [
          '#0b0908',
          '#3a2717',
          '#e5bd57'
        ],
        {
          titleSize:
            166,

          texture:
            1,

          align:
            'center'
        }
      ),


      T(
        'rustic-rivalry',
        'Rustic Rivalry',
        'rustic',
        'brutalist',
        'OLD SCHOOL RIVALRY',
        'RIVALS\nMEET',
        'NO EASY RUNS',
        [
          '#12100e',
          '#4b2619',
          '#dcb34d'
        ],
        {
          titleSize:
            148,

          texture:
            1
        }
      ),



      /* ========================================================
         NEW PREMIUM VINTAGE COLLECTION
      ======================================================== */

      T(
        'seventies-matchbill',
        '1978 Match Bill',
        'vintage',
        'retro',
        'TAMPA CRICKET CLUB',
        'MATCH\nBILL',
        'SATURDAY • 2:30 PM',
        [
          '#251b14',
          '#6d4c34',
          '#d2aa5a'
        ],
        {
          titleSize:
            136,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'classic-scorebook',
        'Classic Scorebook',
        'vintage',
        'paper',
        'OFFICIAL RECORD',
        'SCORE\nBOOK',
        'INNINGS • BOWLING • RESULT',
        [
          '#1f1810',
          '#5f4d32',
          '#d8b15c'
        ],
        {
          titleSize:
            134,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'victory-gazette',
        'Victory Gazette',
        'vintage',
        'news',
        'THE CRICKET GAZETTE',
        'VICTORY',
        'FWCWL WIN BY 24 RUNS',
        [
          '#1b1710',
          '#55452f',
          '#dcb45b'
        ],
        {
          titleSize:
            160,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'heritage-captain',
        'Heritage Captain',
        'vintage',
        'captain',
        'LEADERSHIP EDITION',
        'OUR\nCAPTAIN',
        'TRADITION • COURAGE • CLASS',
        [
          '#211912',
          '#4c3c2c',
          '#d0aa52'
        ],
        {
          titleSize:
            142,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'pavilion-poster',
        'Pavilion Poster',
        'vintage',
        'retro',
        'CRICKET AT THE PAVILION',
        'GAME\nDAY',
        'A TIMELESS SATURDAY',
        [
          '#211b13',
          '#5c4930',
          '#d9b25a'
        ],
        {
          titleSize:
            140,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'old-world-final',
        'Old World Final',
        'vintage',
        'paper',
        'CHAMPIONSHIP EDITION',
        'THE\nFINAL',
        'A MATCH FOR THE AGES',
        [
          '#1c1510',
          '#4a3725',
          '#d7b15a'
        ],
        {
          titleSize:
            154,

          texture:
            1,

          font:
            'Playfair Display',

          align:
            'center'
        }
      ),



      /* ========================================================
         NEW LAYERED COLLECTION
      ======================================================== */

      T(
        'trading-card',
        'Player Trading Card',
        'layered',
        'cards',
        'FWCWL PLAYER CARD',
        'PLAYER\n01',
        'ROLE • TEAM • STATS',
        [
          '#0a0d12',
          '#35131a',
          '#e0b343'
        ],
        {
          titleSize:
            132,

          titleWidth:
            58
        }
      ),


      T(
        'scrapbook-match',
        'Matchday Scrapbook',
        'layered',
        'collage',
        'MATCHDAY SCRAPBOOK',
        'GAME\nDAY',
        'PHOTOS • NOTES • MOMENTS',
        [
          '#15100d',
          '#5b2a20',
          '#d8af4e'
        ],
        {
          titleSize:
            142,

          texture:
            1
        }
      ),


      T(
        'tactical-blueprint',
        'Tactical Blueprint',
        'layered',
        'lineup',
        'MATCH TACTICS',
        'FIELD\nPLAN',
        'POWERPLAY • MATCHUPS • ROLES',
        [
          '#03141b',
          '#0e3b4b',
          '#e0b94e'
        ],
        {
          titleSize:
            138
        }
      ),


      T(
        'cinematic-stadium',
        'Cinematic Stadium',
        'layered',
        'stadium',
        'UNDER THE FLOODLIGHTS',
        'MATCH\nNIGHT',
        'PRIME TIME • FWCWL',
        [
          '#02060b',
          '#162536',
          '#e9bd48'
        ],
        {
          titleSize:
            154
        }
      ),


      T(
        'gold-crest-final',
        'Gold Crest Final',
        'layered',
        'gold',
        'CHAMPIONSHIP SERIES',
        'THE\nFINAL',
        'PRESTIGE • PRESSURE • GLORY',
        [
          '#08090b',
          '#261a10',
          '#e2b744'
        ],
        {
          titleSize:
            164,

          align:
            'center'
        }
      ),


      T(
        'player-press-card',
        'Player Press Card',
        'layered',
        'player',
        'OFFICIAL PLAYER PROFILE',
        'PLAYER\nFEATURE',
        'ROLE • NUMBER • RECORD',
        [
          '#111217',
          '#571620',
          '#f0c34e'
        ],
        {
          titleSize:
            126,

          titleWidth:
            60
        }
      ),



      /* ========================================================
         NEW EDITORIAL COLLECTION
      ======================================================== */

      T(
        'matchday-journal',
        'Matchday Journal',
        'editorial',
        'editorial',
        'THE MATCHDAY JOURNAL',
        'GAME\nDAY',
        'THE STORY BEFORE FIRST BALL',
        [
          '#17130f',
          '#554533',
          '#d9b35c'
        ],
        {
          titleSize:
            150,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'cricket-culture-mag',
        'Cricket Culture Magazine',
        'editorial',
        'editorial',
        'MK97 • CRICKET CULTURE',
        'THE\nGAME',
        'PEOPLE • PASSION • PERFORMANCE',
        [
          '#0c0d10',
          '#33261b',
          '#d8b15a'
        ],
        {
          titleSize:
            156,

          font:
            'Playfair Display'
        }
      ),


      T(
        'captain-issue',
        'The Captain Issue',
        'editorial',
        'editorial',
        'LEADERSHIP ISSUE',
        'THE\nCAPTAIN',
        'TACTICS • TEMPERAMENT • TEAM',
        [
          '#0a1217',
          '#3f171d',
          '#e4ba4f'
        ],
        {
          titleSize:
            148,

          font:
            'Playfair Display'
        }
      ),


      T(
        'bowling-analysis',
        'Bowling Analysis',
        'editorial',
        'lineup',
        'PERFORMANCE LAB',
        'BOWLING\nMAP',
        'LINE • LENGTH • WICKETS',
        [
          '#051317',
          '#153943',
          '#e1b84b'
        ],
        {
          titleSize:
            138
        }
      ),


      T(
        'batting-analysis',
        'Batting Analysis',
        'editorial',
        'player',
        'PERFORMANCE LAB',
        'BATTING\nCARD',
        'RUNS • STRIKE RATE • IMPACT',
        [
          '#11100e',
          '#4d2718',
          '#e4b84d'
        ],
        {
          titleSize:
            138
        }
      ),



      /* ========================================================
         NEW MATCH COLLECTION
      ======================================================== */

      T(
        'floodlight-classic',
        'Floodlight Classic',
        'match',
        'stadium',
        'FWCWL NIGHT SERIES',
        'UNDER THE\nLIGHTS',
        'SATURDAY • 7:30 PM',
        [
          '#01070c',
          '#102d3e',
          '#f1c34d'
        ],
        {
          titleSize:
            144
        }
      ),


      T(
        'boundary-battle',
        'Boundary Battle',
        'match',
        'pitch',
        'RIVALRY WEEK',
        'BOUNDARY\nBATTLE',
        'RUNS • WICKETS • PRESSURE',
        [
          '#061713',
          '#253d2c',
          '#e6b844'
        ],
        {
          titleSize:
            142
        }
      ),


      T(
        'wicket-alert',
        'Wicket Alert',
        'match',
        'brutalist',
        'MATCH MOMENT',
        'WICKET!',
        'THE GAME JUST CHANGED',
        [
          '#09090b',
          '#4b1119',
          '#f1c34d'
        ],
        {
          titleSize:
            205,

          font:
            'Bebas Neue'
        }
      ),


      T(
        'test-match-day',
        'Test Match Day',
        'match',
        'paper',
        'TRADITIONAL CRICKET',
        'TEST\nMATCH',
        'PATIENCE • PRESSURE • CLASS',
        [
          '#17140f',
          '#4a422f',
          '#d5af55'
        ],
        {
          titleSize:
            144,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),



      /* ========================================================
         NEW RESULTS
      ======================================================== */

      T(
        'vintage-score-result',
        'Vintage Score Result',
        'result',
        'score',
        'FINAL SCORE',
        '186 / 5',
        'WON BY 24 RUNS',
        [
          '#17110d',
          '#4d3824',
          '#dfb55a'
        ],
        {
          titleSize:
            190,

          texture:
            1,

          font:
            'Bebas Neue'
        }
      ),


      T(
        'gazette-result',
        'Gazette Result',
        'result',
        'news',
        'THE CRICKET GAZETTE',
        'MATCH\nRESULT',
        'FWCWL CLAIM THE WIN',
        [
          '#1b1711',
          '#56452f',
          '#d8ae55'
        ],
        {
          titleSize:
            142,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),



      /* ========================================================
         NEW EVENTS
      ======================================================== */

      T(
        'heritage-tournament',
        'Heritage Tournament',
        'event',
        'retro',
        'FWCWL PRESENTS',
        'WINTER\nLEAGUE',
        'A SEASON OF CLASSIC CRICKET',
        [
          '#17120d',
          '#443522',
          '#d6ae52'
        ],
        {
          titleSize:
            144,

          texture:
            1,

          font:
            'Playfair Display'
        }
      ),


      T(
        'pavilion-opening',
        'Pavilion Opening',
        'event',
        'gold',
        'OPENING DAY',
        'LET THE\nSEASON BEGIN',
        'WELCOME TO FWCWL',
        [
          '#12100c',
          '#453824',
          '#deb356'
        ],
        {
          titleSize:
            132,

          texture:
            1,

          font:
            'Playfair Display',

          align:
            'center'
        }
      )

    ]);



  /* ============================================================
     STATUS
  ============================================================ */

  function setStatus(
    state,
    detail = ''
  ) {

    document
      .documentElement
      .dataset
      .posterBoot =
        state;

    window
      .__FWCWL_POSTER_STATUS__ =
      {

        version:
          WATCHDOG_VERSION,

        build:
          BUILD_VERSION,

        state,

        detail,

        templates:
          TEMPLATES.length,

        at:
          Date.now()

      };

  }


  function validateDOM() {

    const missing =
      REQUIRED_IDS
        .filter(
          id =>
            !document
              .getElementById(
                id
              )
        );

    if (
      missing.length
    ) {

      throw new Error(
        `Missing required HTML IDs: ${missing.join(', ')}`
      );

    }

  }


  function showFatal(
    message,
    error
  ) {

    setStatus(
      'error',
      message
    );

    console.error(
      '[FWCWL Poster]',
      message,
      error ||
      ''
    );

    const count =
      $('#posterTemplateCount');

    if (
      count
    ) {
      count.textContent =
        '!';
    }

    const grid =
      $('#posterTemplateGrid');

    if (
      grid
    ) {

      grid.innerHTML =
        `<div class="empty-state"><strong>Poster engine could not start</strong><span>${esc(message)}</span></div>`;

    }

    const inspector =
      $('#posterInspector');

    if (
      inspector
    ) {

      inspector.innerHTML =
        `<div class="inspector-help" style="color:#dc7d85">${esc(message)}</div>`;

    }

  }



  /* ============================================================
     POSTER EDITOR
  ============================================================ */

  class PosterEditor {


    constructor() {

      validateDOM();

      this.canvas =
        $('#posterCanvas');

      this.ctx =
        this.canvas
          .getContext(
            '2d',
            {
              alpha:
                false
            }
          );

      if (
        !this.ctx
      ) {

        throw new Error(
          'Canvas 2D context is unavailable.'
        );

      }


      this.assets =
        new Map();

      this.activeFilter =
        'all';

      this.searchTerm =
        '';

      this.dragState =
        null;

      this.history =
        [];

      this.historyIndex =
        -1;

      this.resizeTimer =
        0;

      this.contextToolbar =
        null;

      this.guideX =
        null;

      this.guideY =
        null;


      this.state = {

        format:
          'portrait',

        width:
          1080,

        height:
          1350,

        templateId:
          'match-day',

        accent:
          '#f1c34d',

        background:
          '#12090d',

        brandName:
          'FWCWL',

        showLogo:
          true,

        safeZone:
          false,

        snap:
          true,

        zoom:
          .5,

        selectedId:
          null,

        textureStrength:
          52,

        layers:
          []

      };


      this.logo =
        new Image();


      this.logoReady =
        false;


      this.logo.onload =
        () => {

          this.logoReady =
            true;

          this.safeRender();

          this.safeRenderTemplates();

        };


      this.logo.onerror =
        () => {

          this.logoReady =
            false;

          this.safeRender();

        };


      this.logo.src =
        LOGO_PATH;


      this.injectPremiumVisibilityStyles();

      this.ensureRuntimeGeneratedUI();

      this.bindUI();

      this.applyTemplate(
        'match-day',
        false
      );

      this.commit();

      this.renderAssets();

      this.renderInspector();

      this.safeRenderTemplates();

      this.safeRender();


      requestAnimationFrame(
        () =>
          this.fitCanvas()
      );


      if (
        document
          .fonts
          ?.ready
      ) {

        document
          .fonts
          .ready
          .then(
            () => {

              this.safeRender();

              this.safeRenderTemplates();

            }
          )
          .catch(
            () => {}
          );

      }


      setStatus(
        'ready',
        `${TEMPLATES.length} templates loaded`
      );

    }



    currentTemplate() {

      return (
        TEMPLATES
          .find(
            item =>
              item.id ===
              this.state
                .templateId
          ) ||
        TEMPLATES[0]
      );

    }



    safeRender() {

      try {

        this.render();

      } catch (
        error
      ) {

        console.error(
          '[FWCWL Poster render]',
          error
        );

      }

    }



    safeRenderTemplates() {

      try {

        this.renderTemplates();

      } catch (
        error
      ) {

        console.error(
          '[FWCWL Poster templates]',
          error
        );

        const grid =
          $('#posterTemplateGrid');

        if (
          grid &&
          !grid.children.length
        ) {

          grid.innerHTML =
            '<div class="empty-state"><strong>Templates unavailable</strong><span>Reload after updating poster-editor.js.</span></div>';

        }

      }

    }



    makeTextLayer(
      name,
      text,
      x,
      y,
      width,
      size,
      weight,
      font,
      color,
      align,
      lineHeight = 1,
      letterSpacing = 0,
      opacity = 1
    ) {

      return {

        id:
          uid('text'),

        type:
          'text',

        role:
          'template',

        name,

        text,

        x,

        y,

        width,

        size,

        weight,

        font,

        color,

        align,

        opacity,

        lineHeight,

        letterSpacing,

        strokeColor:
          '#000000',

        strokeWidth:
          0,

        shadowEnabled:
          false,

        shadowColor:
          '#000000',

        shadowBlur:
          18,

        shadowX:
          0,

        shadowY:
          8,

        backgroundEnabled:
          false,

        backgroundColor:
          '#000000',

        backgroundOpacity:
          .35,

        backgroundPadding:
          18,

        blendMode:
          'source-over',

        visible:
          true,

        locked:
          false

      };

    }



    applyTemplate(
      id,
      save = true
    ) {

      const item =
        TEMPLATES
          .find(
            template =>
              template.id ===
              id
          ) ||
        TEMPLATES[0];


      const preservedImages =
        this.state.layers
          .filter(
            layer =>
              layer.type ===
              'image'
          );


      const preservedUserLayers =
        this.state.layers
          .filter(
            layer =>
              layer.role ===
                'user' &&
              layer.type !==
                'image'
          );


      this.state.templateId =
        item.id;

      this.state.accent =
        item.palette[2];

      this.state.background =
        item.palette[0];


      this.state.layers = [

        this.makeTextLayer(
          'Kicker',
          item.kicker,
          item.align ===
            'center'
            ? 50
            : 7,
          item.titleY -
            10,
          item.align ===
            'center'
            ? 82
            : item.titleWidth,
          25,
          900,
          'DM Sans',
          item.palette[2],
          item.align,
          1,
          2
        ),


        this.makeTextLayer(
          'Headline',
          item.title,
          item.align ===
            'center'
            ? 50
            : 7,
          item.titleY,
          item.titleWidth,
          item.titleSize,
          item.font ===
            'Bebas Neue'
            ? 400
            : 900,
          item.font,
          '#ffffff',
          item.align,
          .84,
          0
        ),


        this.makeTextLayer(
          'Details',
          item.detail,
          item.align ===
            'center'
            ? 50
            : 7,
          item.titleY +
            28,
          item.align ===
            'center'
            ? 78
            : 68,
          27,
          650,
          'DM Sans',
          '#c8cbd0',
          item.align,
          1.15,
          .4,
          .82
        ),


        this.makeTextLayer(
          'Footer',
          item.cta,
          7,
          91,
          45,
          19,
          900,
          'DM Sans',
          item.palette[2],
          'left',
          1,
          1.8
        ),


        ...preservedImages,

        ...preservedUserLayers

      ];


      this.state.selectedId =
        null;


      this.syncBrandUI();

      this.safeRender();

      this.safeRenderTemplates();

      this.renderInspector();


      if (
        save
      ) {
        this.commit();
      }

    }



    renderTemplates() {

      const grid =
        $('#posterTemplateGrid');

      if (
        !grid
      ) {
        return;
      }


      const search =
        this.searchTerm
          .trim()
          .toLowerCase();


      const filtered =
        TEMPLATES
          .filter(
            item => {

              const categoryMatch =
                this.activeFilter ===
                  'all' ||
                item.category ===
                  this.activeFilter;


              const haystack =
                `${
                  item.name
                } ${
                  item.category
                } ${
                  item.style
                } ${
                  item.kicker
                } ${
                  item.title
                } ${
                  item.detail
                }`
                  .toLowerCase();


              return (
                categoryMatch &&
                (
                  !search ||
                  haystack
                    .includes(
                      search
                    )
                )
              );

            }
          );


      const counter =
        $('#posterTemplateCount');


      if (
        counter
      ) {

        counter.textContent =
          String(
            filtered.length
          );

      }


      $('#posterTemplateEmpty')
        ?.classList
        .toggle(
          'hidden',
          filtered.length >
            0
        );


      grid.innerHTML =
        filtered
          .map(
            item => `

        <button
          class="template-card ${
            item.id ===
            this.state.templateId
              ? 'active'
              : ''
          }"
          data-template-id="${item.id}"
          type="button"
          aria-label="Use ${esc(item.name)} template"
        >

          <div class="template-art">

            <canvas
              width="216"
              height="270"
              data-template-preview="${item.id}"
            ></canvas>

          </div>

          <div class="template-meta">

            <strong>
              ${esc(item.name)}
            </strong>

            <small>
              ${esc(item.category)}
            </small>

          </div>

        </button>

      `
          )
          .join('');


      $$(
        '[data-template-id]',
        grid
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                () =>
                  this.applyTemplate(
                    button.dataset
                      .templateId
                  )
              );

          }
        );


      requestAnimationFrame(
        () => {

          filtered
            .forEach(
              item => {

                try {

                  const preview =
                    $(
                      `[data-template-preview="${item.id}"]`,
                      grid
                    );

                  if (
                    !preview
                  ) {
                    return;
                  }


                  const ctx =
                    preview
                      .getContext(
                        '2d',
                        {
                          alpha:
                            false
                        }
                      );


                  if (
                    !ctx
                  ) {
                    return;
                  }


                  this.drawTemplatePreview(
                    ctx,
                    preview.width,
                    preview.height,
                    item
                  );

                } catch (
                  error
                ) {

                  console.warn(
                    '[FWCWL template preview]',
                    item.id,
                    error
                  );

                }

              }
            );

        }
      );

    }



    drawTemplatePreview(
      ctx,
      width,
      height,
      item
    ) {

      this.drawDesignBase(
        ctx,
        width,
        height,
        item,
        Math.min(
          52,
          this.state.textureStrength
        )
      );


      if (
        this.logoReady &&
        this.logo.naturalWidth
      ) {

        const scale =
          Math.min(
            (
              width *
              .17
            ) /
              this.logo
                .naturalWidth,

            (
              height *
              .09
            ) /
              this.logo
                .naturalHeight
          );


        ctx.drawImage(
          this.logo,
          width *
            .055,
          height *
            .035,
          this.logo
            .naturalWidth *
            scale,
          this.logo
            .naturalHeight *
            scale
        );

      }


      const align =
        item.align;


      const x =
        align ===
          'center'
          ? width /
            2
          : width *
            .065;


      const maxWidth =
        width *
        (
          item.titleWidth /
          100
        );


      ctx.textAlign =
        align;

      ctx.textBaseline =
        'top';


      ctx.fillStyle =
        item.palette[2];


      ctx.font =
        `900 ${
          width *
          .026
        }px "DM Sans"`;


      ctx.fillText(
        item.kicker,
        x,
        height *
          (
            (
              item.titleY -
              10
            ) /
            100
          )
      );


      const fontSize =
        width *
        (
          item.titleSize /
          1080
        );


      ctx.fillStyle =
        '#ffffff';


      ctx.font =
        `${
          item.font ===
            'Bebas Neue'
            ? 400
            : 900
        } ${
          fontSize
        }px "${
          item.font
        }"`;


      let y =
        height *
        (
          item.titleY /
          100
        );


      this.wrapText(
        ctx,
        item.title,
        maxWidth
      )
        .forEach(
          line => {

            ctx.fillText(
              line,
              x,
              y
            );

            y +=
              fontSize *
              .84;

          }
        );


      ctx.fillStyle =
        'rgba(255,255,255,.62)';


      ctx.font =
        `700 ${
          width *
          .019
        }px "DM Sans"`;


      ctx.fillText(
        item.detail,
        x,
        height *
          (
            (
              item.titleY +
              29
            ) /
            100
          )
      );


      ctx.textAlign =
        'right';


      ctx.fillStyle =
        'rgba(255,255,255,.34)';


      ctx.font =
        `800 ${
          width *
          .016
        }px "DM Sans"`;


      ctx.fillText(
        'FWCWL',
        width *
          .94,
        height *
          .94
      );

    }



    render(
      exporting = false
    ) {

      const width =
        this.state.width;

      const height =
        this.state.height;


      if (
        this.canvas.width !==
        width
      ) {
        this.canvas.width =
          width;
      }


      if (
        this.canvas.height !==
        height
      ) {
        this.canvas.height =
          height;
      }


      const base =
        this.currentTemplate();


      const liveTemplate = {

        ...base,

        palette: [

          this.state
            .background,

          base.palette[1],

          this.state
            .accent

        ]

      };


      this.drawDesignBase(
        this.ctx,
        width,
        height,
        liveTemplate,
        this.state
          .textureStrength
      );


      for (
        const layer
        of
        this.state.layers
      ) {

        if (
          layer.visible !==
          false
        ) {

          this.drawLayer(
            this.ctx,
            layer,
            width,
            height
          );

        }

      }


      this.drawOfficialBrand(
        this.ctx,
        width,
        height
      );


      if (
        this.state.safeZone &&
        !exporting
      ) {

        this.drawSafeZone(
          this.ctx,
          width,
          height
        );

      }


      if (
        !exporting &&
        this.state.selectedId
      ) {

        const selected =
          this.getSelected();


        if (
          selected?._bounds
        ) {

          this.drawSelection(
            this.ctx,
            selected._bounds,
            width
          );

        }

      }


      if (
        !exporting
      ) {

        requestAnimationFrame(
          () =>
            this.updateContextToolbar()
        );

      }

    }



    /* ============================================================
       TEMPLATE DESIGN ENGINE
    ============================================================ */

    drawDesignBase(
      ctx,
      width,
      height,
      item,
      textureStrength = 52
    ) {

      const [
        a,
        b,
        accent
      ] =
        item.palette;


      const gradient =
        ctx.createLinearGradient(
          0,
          0,
          width,
          height
        );


      gradient.addColorStop(
        0,
        a
      );


      gradient.addColorStop(
        1,
        b
      );


      ctx.fillStyle =
        gradient;


      ctx.fillRect(
        0,
        0,
        width,
        height
      );


      this.drawDecor(
        ctx,
        width,
        height,
        item.style,
        accent
      );


      const shade =
        ctx.createLinearGradient(
          0,
          height *
            .5,
          0,
          height
        );


      shade.addColorStop(
        0,
        'rgba(0,0,0,0)'
      );


      shade.addColorStop(
        1,
        'rgba(0,0,0,.44)'
      );


      ctx.fillStyle =
        shade;


      ctx.fillRect(
        0,
        0,
        width,
        height
      );


      if (
        item.texture
      ) {

        this.drawTexture(
          ctx,
          width,
          height,
          textureStrength
        );

      }

    }



    drawDecor(
      ctx,
      width,
      height,
      style,
      accent
    ) {

      const stroke =
        alpha =>
          rgba(
            accent,
            alpha
          );


      switch (
        style
      ) {


        case 'slash':

          for (
            let i =
              0;
            i <
              4;
            i++
          ) {

            ctx.save();

            ctx.translate(
              width *
                (
                  .55 +
                  i *
                  .10
                ),
              height *
                .45
            );

            ctx.rotate(
              -.25
            );

            ctx.fillStyle =
              stroke(
                .045 +
                i *
                .015
              );

            ctx.fillRect(
              0,
              -height *
                .65,
              width *
                .07,
              height *
                1.3
            );

            ctx.restore();

          }

          ctx.fillStyle =
            accent;

          ctx.fillRect(
            width *
              .07,
            height *
              .82,
            width *
              .12,
            height *
              .004
          );

          break;



        case 'versus':

          ctx.fillStyle =
            'rgba(84,12,22,.38)';

          ctx.beginPath();

          ctx.moveTo(
            width *
              .52,
            0
          );

          ctx.lineTo(
            width,
            0
          );

          ctx.lineTo(
            width,
            height
          );

          ctx.lineTo(
            width *
              .4,
            height
          );

          ctx.closePath();

          ctx.fill();


          ctx.strokeStyle =
            stroke(
              .34
            );

          ctx.lineWidth =
            width *
            .008;

          ctx.beginPath();

          ctx.arc(
            width *
              .5,
            height *
              .44,
            width *
              .17,
            0,
            Math.PI *
              2
          );

          ctx.stroke();

          break;



        case 'fixture':

          ctx.strokeStyle =
            'rgba(255,255,255,.045)';

          ctx.lineWidth =
            2;


          for (
            let y =
              height *
              .16;
            y <
              height;
            y +=
              height *
              .055
          ) {

            ctx.beginPath();

            ctx.moveTo(
              0,
              y
            );

            ctx.lineTo(
              width,
              y
            );

            ctx.stroke();

          }


          ctx.fillStyle =
            stroke(
              .10
            );


          ctx.fillRect(
            width *
              .70,
            height *
              .17,
            width *
              .20,
            height *
              .19
          );

          break;



        case 'stadium':

          for (
            let i =
              0;
            i <
              7;
            i++
          ) {

            const x =
              width *
              (
                .08 +
                i *
                .14
              );


            const beam =
              ctx.createLinearGradient(
                x,
                0,
                width /
                  2,
                height *
                  .75
              );


            beam.addColorStop(
              0,
              'rgba(255,255,255,.10)'
            );


            beam.addColorStop(
              1,
              'rgba(255,255,255,0)'
            );


            ctx.fillStyle =
              beam;


            ctx.beginPath();


            ctx.moveTo(
              x -
                width *
                .018,
              0
            );


            ctx.lineTo(
              x +
                width *
                .018,
              0
            );


            ctx.lineTo(
              width /
                2,
              height *
                .76
            );


            ctx.closePath();


            ctx.fill();

          }


          ctx.strokeStyle =
            stroke(
              .25
            );


          ctx.lineWidth =
            width *
            .003;


          ctx.beginPath();


          ctx.ellipse(
            width /
              2,
            height *
              .87,
            width *
              .36,
            height *
              .065,
            0,
            0,
            Math.PI *
              2
          );


          ctx.stroke();

          break;



        case 'split':

          ctx.fillStyle =
            stroke(
              .08
            );


          ctx.beginPath();


          ctx.moveTo(
            width *
              .67,
            0
          );


          ctx.lineTo(
            width,
            0
          );


          ctx.lineTo(
            width,
            height
          );


          ctx.lineTo(
            width *
              .42,
            height
          );


          ctx.closePath();


          ctx.fill();

          break;



        case 'lines':

          for (
            let i =
              0;
            i <
              8;
            i++
          ) {

            ctx.strokeStyle =
              stroke(
                .035 +
                i *
                .005
              );


            ctx.lineWidth =
              width *
              .003;


            ctx.beginPath();


            ctx.moveTo(
              width *
                (
                  .58 +
                  i *
                  .04
                ),
              0
            );


            ctx.lineTo(
              width *
                (
                  .35 +
                  i *
                  .05
                ),
              height
            );


            ctx.stroke();

          }

          break;



        case 'score':

          ctx.fillStyle =
            'rgba(0,0,0,.20)';


          roundRectPath(
            ctx,
            width *
              .08,
            height *
              .25,
            width *
              .84,
            height *
              .40,
            width *
              .026
          );


          ctx.fill();


          ctx.strokeStyle =
            stroke(
              .26
            );


          ctx.lineWidth =
            width *
            .003;


          ctx.stroke();

          break;



        case 'lineup':

        case 'pitch':

          ctx.strokeStyle =
            stroke(
              .18
            );


          ctx.lineWidth =
            width *
            .003;


          ctx.strokeRect(
            width *
              .62,
            height *
              .18,
            width *
              .25,
            height *
              .52
          );


          ctx.beginPath();


          ctx.arc(
            width *
              .745,
            height *
              .44,
            width *
              .06,
            0,
            Math.PI *
              2
          );


          ctx.stroke();

          break;



        case 'grid':

          for (
            let row =
              0;
            row <
              4;
            row++
          ) {

            for (
              let col =
                0;
              col <
                3;
              col++
            ) {

              ctx.fillStyle =
                row ===
                  0 &&
                col ===
                  0
                  ? stroke(
                      .15
                    )
                  : 'rgba(255,255,255,.025)';


              roundRectPath(
                ctx,
                width *
                  (
                    .59 +
                    col *
                    .105
                  ),
                height *
                  (
                    .43 +
                    row *
                    .07
                  ),
                width *
                  .09,
                height *
                  .05,
                width *
                  .008
              );


              ctx.fill();

            }

          }

          break;



        case 'captain':

          ctx.strokeStyle =
            stroke(
              .28
            );


          ctx.lineWidth =
            width *
            .006;


          ctx.beginPath();


          ctx.moveTo(
            width *
              .68,
            height *
              .26
          );


          ctx.lineTo(
            width *
              .77,
            height *
              .19
          );


          ctx.lineTo(
            width *
              .87,
            height *
              .26
          );


          ctx.lineTo(
            width *
              .82,
            height *
              .39
          );


          ctx.lineTo(
            width *
              .72,
            height *
              .39
          );


          ctx.closePath();


          ctx.stroke();

          break;



        case 'player':

        case 'award':

          ctx.fillStyle =
            'rgba(255,255,255,.025)';


          roundRectPath(
            ctx,
            width *
              .61,
            height *
              .18,
            width *
              .30,
            height *
              .52,
            width *
              .025
          );


          ctx.fill();


          ctx.strokeStyle =
            stroke(
              .30
            );


          ctx.lineWidth =
            width *
            .006;


          ctx.beginPath();


          ctx.arc(
            width *
              .76,
            height *
              .37,
            width *
              .15,
            0,
            Math.PI *
              2
          );


          ctx.stroke();


          if (
            style ===
            'award'
          ) {

            ctx.fillStyle =
              stroke(
                .12
              );


            ctx.font =
              `400 ${
                width *
                .18
              }px "Bebas Neue"`;


            ctx.fillText(
              '01',
              width *
                .61,
              height *
                .65
            );

          }

          break;



        case 'gold':

        case 'radial':

          this.drawGoldRays(
            ctx,
            width,
            height,
            accent
          );

          break;



        case 'result':

          ctx.fillStyle =
            stroke(
              .08
            );


          ctx.fillRect(
            width *
              .68,
            0,
            width *
              .32,
            height
          );


          ctx.strokeStyle =
            stroke(
              .25
            );


          ctx.lineWidth =
            width *
            .003;


          ctx.strokeRect(
            width *
              .05,
            height *
              .06,
            width *
              .90,
            height *
              .88
          );

          break;



        case 'final':

          ctx.strokeStyle =
            stroke(
              .42
            );


          ctx.lineWidth =
            width *
            .003;


          ctx.strokeRect(
            width *
              .04,
            height *
              .025,
            width *
              .92,
            height *
              .95
          );


          this.drawGoldRays(
            ctx,
            width,
            height,
            accent
          );

          break;



        case 'ticket':

          for (
            let i =
              0;
            i <
              7;
            i++
          ) {

            ctx.fillStyle =
              i %
              2
                ? 'rgba(255,255,255,.018)'
                : stroke(
                    .035
                  );


            ctx.fillRect(
              width *
                (
                  .60 +
                  i *
                  .042
                ),
              height *
                .17,
              width *
                .024,
              height *
                .58
            );

          }

          break;



        case 'cards':

          for (
            let i =
              0;
            i <
              3;
            i++
          ) {

            ctx.save();


            ctx.translate(
              width *
                (
                  .67 +
                  i *
                  .055
                ),
              height *
                (
                  .34 +
                  i *
                  .06
                )
            );


            ctx.rotate(
              (
                i -
                1
              ) *
              .09
            );


            ctx.fillStyle =
              i ===
                1
                ? stroke(
                    .10
                  )
                : 'rgba(255,255,255,.025)';


            roundRectPath(
              ctx,
              -width *
                .11,
              -height *
                .13,
              width *
                .22,
              height *
                .26,
              width *
                .015
            );


            ctx.fill();


            ctx.restore();

          }

          break;



        case 'milestone':

          ctx.strokeStyle =
            stroke(
              .25
            );


          ctx.lineWidth =
            width *
            .013;


          ctx.beginPath();


          ctx.arc(
            width *
              .76,
            height *
              .39,
            width *
              .15,
            0,
            Math.PI *
              2
          );


          ctx.stroke();

          break;



        case 'confetti':

          for (
            let i =
              0;
            i <
              34;
            i++
          ) {

            const x =
              Math.abs(
                Math.sin(
                  i *
                  81.17
                )
              ) *
              width;


            const y =
              Math.abs(
                Math.sin(
                  i *
                  13.71
                )
              ) *
              height;


            ctx.save();


            ctx.translate(
              x,
              y
            );


            ctx.rotate(
              i
            );


            ctx.fillStyle =
              i %
              3 ===
              0
                ? '#fff'
                : accent;


            ctx.globalAlpha =
              .18;


            ctx.fillRect(
              -width *
                .004,
              -width *
                .011,
              width *
                .008,
              width *
                .022
            );


            ctx.restore();

          }

          break;



        case 'frame':

          ctx.strokeStyle =
            stroke(
              .30
            );


          ctx.lineWidth =
            width *
            .003;


          ctx.strokeRect(
            width *
              .05,
            height *
              .04,
            width *
              .90,
            height *
              .92
          );


          ctx.strokeStyle =
            'rgba(255,255,255,.05)';


          ctx.strokeRect(
            width *
              .61,
            height *
              .25,
            width *
              .28,
            height *
              .31
          );

          break;



        case 'news':

          for (
            let x =
              -width *
              .1;
            x <
              width *
              1.2;
            x +=
              width *
              .12
          ) {

            ctx.save();


            ctx.translate(
              x,
              height *
                .73
            );


            ctx.rotate(
              -.28
            );


            ctx.fillStyle =
              stroke(
                .10
              );


            ctx.fillRect(
              0,
              -height *
                .18,
              width *
                .033,
              height *
                .36
            );


            ctx.restore();

          }

          break;



        case 'brutalist':

        case 'grit':

          ctx.fillStyle =
            stroke(
              style ===
                'brutalist'
                ? .10
                : .08
            );


          ctx.beginPath();


          ctx.moveTo(
            width *
              (
                style ===
                  'brutalist'
                  ? .56
                  : .65
              ),
            0
          );


          ctx.lineTo(
            width,
            0
          );


          ctx.lineTo(
            width *
              (
                style ===
                  'brutalist'
                  ? .78
                  : .84
              ),
            height
          );


          ctx.lineTo(
            width *
              (
                style ===
                  'brutalist'
                  ? .35
                  : .44
              ),
            height
          );


          ctx.closePath();


          ctx.fill();

          break;



        case 'film':

          ctx.fillStyle =
            'rgba(255,225,185,.035)';


          ctx.fillRect(
            width *
              .55,
            0,
            width *
              .10,
            height
          );


          ctx.fillStyle =
            stroke(
              .06
            );


          ctx.fillRect(
            width *
              .68,
            0,
            width *
              .20,
            height
          );

          break;



        case 'gold-grit':

          this.drawGoldRays(
            ctx,
            width,
            height,
            accent
          );


          ctx.fillStyle =
            stroke(
              .08
            );


          ctx.beginPath();


          ctx.moveTo(
            width *
              .65,
            0
          );


          ctx.lineTo(
            width,
            0
          );


          ctx.lineTo(
            width *
              .84,
            height
          );


          ctx.lineTo(
            width *
              .44,
            height
          );


          ctx.closePath();


          ctx.fill();

          break;



        case 'paper':

          ctx.fillStyle =
            'rgba(255,255,255,.08)';


          ctx.fillRect(
            width *
              .57,
            0,
            width *
              .18,
            height
          );


          ctx.fillStyle =
            stroke(
              .09
            );


          ctx.fillRect(
            0,
            height *
              .82,
            width,
            height *
              .04
          );

          break;



        case 'collage':

          for (
            let i =
              0;
            i <
              3;
            i++
          ) {

            ctx.save();


            ctx.translate(
              width *
                (
                  .65 +
                  i *
                  .07
                ),
              height *
                (
                  .38 +
                  i *
                  .045
                )
            );


            ctx.rotate(
              (
                i -
                1
              ) *
              .08
            );


            ctx.fillStyle =
              i ===
                1
                ? stroke(
                    .12
                  )
                : 'rgba(255,255,255,.035)';


            ctx.fillRect(
              -width *
                .12,
              -height *
                .16,
              width *
                .24,
              height *
                .32
            );


            ctx.restore();

          }

          break;



        case 'stack':

          for (
            let i =
              0;
            i <
              4;
            i++
          ) {

            ctx.fillStyle =
              stroke(
                .025 +
                i *
                .022
              );


            ctx.fillRect(
              width *
                (
                  .53 +
                  i *
                  .055
                ),
              height *
                (
                  .12 +
                  i *
                  .06
                ),
              width *
                .31,
              height *
                .58
            );

          }

          break;



        case 'cutout': {

          const glow =
            ctx.createRadialGradient(
              width *
                .75,
              height *
                .38,
              0,
              width *
                .75,
              height *
                .38,
              width *
                .35
            );


          glow.addColorStop(
            0,
            stroke(
              .15
            )
          );


          glow.addColorStop(
            1,
            'rgba(0,0,0,0)'
          );


          ctx.fillStyle =
            glow;


          ctx.fillRect(
            0,
            0,
            width,
            height
          );


          break;

        }



        case 'retro':

          ctx.strokeStyle =
            stroke(
              .32
            );


          ctx.lineWidth =
            width *
            .006;


          ctx.strokeRect(
            width *
              .045,
            height *
              .04,
            width *
              .91,
            height *
              .92
          );


          ctx.fillStyle =
            'rgba(255,255,255,.05)';


          ctx.fillRect(
            width *
              .60,
            0,
            width *
              .08,
            height
          );

          break;



        case 'editorial':

          ctx.fillStyle =
            'rgba(255,255,255,.14)';


          ctx.fillRect(
            width *
              .64,
            0,
            width *
              .36,
            height
          );


          ctx.fillStyle =
            stroke(
              .10
            );


          ctx.fillRect(
            0,
            height *
              .75,
            width,
            height *
              .015
          );

          break;

      }

    }



    drawGoldRays(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let i =
          0;
        i <
          18;
        i++
      ) {

        ctx.save();


        ctx.translate(
          width /
            2,
          height *
            .43
        );


        ctx.rotate(
          (
            i /
            18
          ) *
          Math.PI *
          2
        );


        ctx.fillStyle =
          rgba(
            accent,
            i %
            2
              ? .025
              : .055
          );


        ctx.fillRect(
          width *
            .13,
          -width *
            .008,
          width *
            .34,
          width *
            .016
        );


        ctx.restore();

      }

    }



    drawTexture(
      ctx,
      width,
      height,
      strength
    ) {

      const amount =
        clamp(
          strength,
          0,
          100
        ) /
        100;


      if (
        amount <=
        0
      ) {
        return;
      }


      ctx.save();


      ctx.globalAlpha =
        .025 +
        amount *
        .12;


      const count =
        Math.round(
          180 +
          amount *
          520
        );


      for (
        let i =
          0;
        i <
          count;
        i++
      ) {

        const x =
          Math.abs(
            Math.sin(
              i *
              128.73
            )
          ) *
          width;


        const y =
          Math.abs(
            Math.sin(
              i *
              43.17
            )
          ) *
          height;


        const size =
          1 +
          Math.abs(
            Math.sin(
              i *
              5.7
            )
          ) *
          3;


        ctx.fillStyle =
          i %
          3
            ? '#000'
            : '#fff';


        ctx.fillRect(
          x,
          y,
          size,
          size
        );

      }


      ctx.restore();

    }



    drawLayer(
      ctx,
      layer,
      width,
      height
    ) {

      if (
        layer.type ===
        'text'
      ) {

        this.drawTextLayer(
          ctx,
          layer,
          width,
          height
        );

      } else if (
        layer.type ===
        'image'
      ) {

        this.drawImageLayer(
          ctx,
          layer,
          width,
          height
        );

      } else if (
        layer.type ===
        'element'
      ) {

        this.drawElementLayer(
          ctx,
          layer,
          width,
          height
        );

      }

    }



    trackedWidth(
      ctx,
      text,
      spacing
    ) {

      const chars =
        [
          ...String(
            text ||
            ''
          )
        ];


      const base =
        chars
          .reduce(
            (
              sum,
              char
            ) =>
              sum +
              ctx
                .measureText(
                  char
                )
                .width,
            0
          );


      return (
        base +
        Math.max(
          0,
          chars.length -
            1
        ) *
          spacing
      );

    }



    paintTrackedText(
      ctx,
      text,
      x,
      y,
      spacing,
      align,
      mode = 'fill'
    ) {

      if (
        !spacing
      ) {

        if (
          mode ===
          'stroke'
        ) {

          ctx.strokeText(
            text,
            x,
            y
          );

        } else {

          ctx.fillText(
            text,
            x,
            y
          );

        }

        return;

      }


      const chars =
        [
          ...text
        ];


      const widths =
        chars
          .map(
            char =>
              ctx
                .measureText(
                  char
                )
                .width
          );


      const total =
        widths
          .reduce(
            (
              sum,
              value
            ) =>
              sum +
              value,
            0
          ) +
        spacing *
          Math.max(
            0,
            chars.length -
              1
          );


      let cursor =
        x;


      if (
        align ===
        'center'
      ) {

        cursor -=
          total /
          2;

      } else if (
        align ===
        'right'
      ) {

        cursor -=
          total;

      }


      const oldAlign =
        ctx.textAlign;


      ctx.textAlign =
        'left';


      chars
        .forEach(
          (
            char,
            index
          ) => {

            if (
              mode ===
              'stroke'
            ) {

              ctx.strokeText(
                char,
                cursor,
                y
              );

            } else {

              ctx.fillText(
                char,
                cursor,
                y
              );

            }


            cursor +=
              widths[index] +
              spacing;

          }
        );


      ctx.textAlign =
        oldAlign;

    }



    drawTextLayer(
      ctx,
      layer,
      width,
      height
    ) {

      const scale =
        width /
        1080;


      const fontSize =
        (
          layer.size ||
          30
        ) *
        scale;


      const x =
        width *
        (
          layer.x /
          100
        );


      const y =
        height *
        (
          layer.y /
          100
        );


      const maxWidth =
        width *
        (
          (
            layer.width ||
            50
          ) /
          100
        );


      const align =
        layer.align ||
        'left';


      const lineHeight =
        fontSize *
        (
          layer.lineHeight ||
          1
        );


      const spacing =
        (
          layer.letterSpacing ||
          0
        ) *
        scale;


      ctx.save();


      ctx.globalAlpha =
        layer.opacity ??
        1;


      ctx.globalCompositeOperation =
        layer.blendMode ||
        'source-over';


      ctx.fillStyle =
        layer.color ||
        '#fff';


      ctx.font =
        `${
          layer.weight ||
          700
        } ${
          fontSize
        }px "${
          layer.font ||
          'Montserrat'
        }"`;


      ctx.textAlign =
        align;


      ctx.textBaseline =
        'top';


      const lines =
        this.wrapText(
          ctx,
          layer.text,
          maxWidth
        );


      const measuredWidths =
        lines
          .map(
            line =>
              this.trackedWidth(
                ctx,
                line,
                spacing
              )
          );


      const actualWidth =
        Math.min(
          maxWidth,
          Math.max(
            fontSize *
              .25,
            ...measuredWidths
          )
        );


      const textHeight =
        Math.max(
          lineHeight,
          lines.length *
            lineHeight
        );


      let actualLeft =
        x;


      if (
        align ===
        'center'
      ) {

        actualLeft =
          x -
          actualWidth /
            2;

      } else if (
        align ===
        'right'
      ) {

        actualLeft =
          x -
          actualWidth;

      }


      if (
        layer.backgroundEnabled
      ) {

        const padding =
          (
            layer.backgroundPadding ??
            18
          ) *
          scale;


        ctx.save();


        ctx.globalCompositeOperation =
          'source-over';


        ctx.globalAlpha =
          (
            layer.opacity ??
            1
          ) *
          (
            layer.backgroundOpacity ??
            .35
          );


        ctx.fillStyle =
          layer.backgroundColor ||
          '#000000';


        roundRectPath(
          ctx,
          actualLeft -
            padding,
          y -
            padding *
            .7,
          actualWidth +
            padding *
            2,
          textHeight +
            padding *
            1.4,
          Math.max(
            4,
            padding *
              .45
          )
        );


        ctx.fill();


        ctx.restore();

      }


      if (
        layer.shadowEnabled
      ) {

        ctx.shadowColor =
          layer.shadowColor ||
          '#000000';


        ctx.shadowBlur =
          (
            layer.shadowBlur ||
            0
          ) *
          scale;


        ctx.shadowOffsetX =
          (
            layer.shadowX ||
            0
          ) *
          scale;


        ctx.shadowOffsetY =
          (
            layer.shadowY ||
            0
          ) *
          scale;

      } else {

        ctx.shadowColor =
          'transparent';


        ctx.shadowBlur =
          0;


        ctx.shadowOffsetX =
          0;


        ctx.shadowOffsetY =
          0;

      }


      lines
        .forEach(
          (
            line,
            index
          ) => {

            const lineY =
              y +
              index *
              lineHeight;


            if (
              (
                layer.strokeWidth ||
                0
              ) >
              0
            ) {

              ctx.strokeStyle =
                layer.strokeColor ||
                '#000';


              ctx.lineWidth =
                (
                  layer.strokeWidth ||
                  0
                ) *
                scale;


              ctx.lineJoin =
                'round';


              this.paintTrackedText(
                ctx,
                line,
                x,
                lineY,
                spacing,
                align,
                'stroke'
              );

            }


            this.paintTrackedText(
              ctx,
              line,
              x,
              lineY,
              spacing,
              align,
              'fill'
            );

          }
        );


      let boundLeft =
        x;


      if (
        align ===
        'center'
      ) {

        boundLeft =
          x -
          maxWidth /
            2;

      } else if (
        align ===
        'right'
      ) {

        boundLeft =
          x -
          maxWidth;

      }


      layer._bounds = {

        x:
          boundLeft,

        y,

        width:
          maxWidth,

        height:
          textHeight

      };


      ctx.restore();

    }



    drawImageLayer(
      ctx,
      layer,
      width,
      height
    ) {

      const asset =
        this.assets
          .get(
            layer.assetId
          );


      if (
        !asset?.image
      ) {
        return;
      }


      const image =
        asset.image;


      const centerX =
        width *
        (
          layer.x /
          100
        );


      const centerY =
        height *
        (
          layer.y /
          100
        );


      const boxWidth =
        width *
        (
          (
            layer.width ||
            45
          ) /
          100
        ) *
        (
          layer.scale ||
          1
        );


      const boxHeight =
        boxWidth *
        (
          image.naturalHeight /
          image.naturalWidth
        );


      ctx.save();


      ctx.translate(
        centerX,
        centerY
      );


      ctx.rotate(
        (
          (
            layer.rotation ||
            0
          ) *
          Math.PI
        ) /
        180
      );


      ctx.scale(
        layer.flipX
          ? -1
          : 1,
        layer.flipY
          ? -1
          : 1
      );


      ctx.globalAlpha =
        layer.opacity ??
        1;


      ctx.globalCompositeOperation =
        layer.blendMode ||
        'source-over';


      ctx.filter =
        [

          `brightness(${
            100 +
            (
              layer.brightness ||
              0
            ) +
            (
              layer.exposure ||
              0
            ) *
            .45
          }%)`,

          `contrast(${
            100 +
            (
              layer.contrast ||
              0
            )
          }%)`,

          `saturate(${
            100 +
            (
              layer.saturation ||
              0
            )
          }%)`,

          `grayscale(${
            layer.grayscale ||
            0
          }%)`,

          `sepia(${
            layer.sepia ||
            0
          }%)`,

          `blur(${
            layer.blur ||
            0
          }px)`

        ]
          .join(' ');


      ctx.drawImage(
        image,
        -boxWidth /
          2,
        -boxHeight /
          2,
        boxWidth,
        boxHeight
      );


      layer._bounds = {

        x:
          centerX -
          boxWidth /
            2,

        y:
          centerY -
          boxHeight /
            2,

        width:
          boxWidth,

        height:
          boxHeight

      };


      ctx.restore();

    }



    drawElementLayer(
      ctx,
      layer,
      width,
      height
    ) {

      const x =
        width *
        (
          layer.x /
          100
        );


      const y =
        height *
        (
          layer.y /
          100
        );


      const scale =
        (
          layer.scale ||
          1
        ) *
        width /
        1080;


      const color =
        layer.color ||
        this.state.accent;


      ctx.save();


      ctx.translate(
        x,
        y
      );


      ctx.rotate(
        (
          (
            layer.rotation ||
            0
          ) *
          Math.PI
        ) /
        180
      );


      ctx.globalAlpha =
        layer.opacity ??
        1;


      ctx.globalCompositeOperation =
        layer.blendMode ||
        'source-over';


      ctx.scale(
        scale,
        scale
      );


      switch (
        layer.kind
      ) {

        case 'ball':

          this.drawBallElement(
            ctx,
            color
          );

          break;


        case 'wickets':

          this.drawWicketsElement(
            ctx,
            color
          );

          break;


        case 'vs':

          this.drawVsElement(
            ctx,
            color
          );

          break;


        case 'score':

          this.drawScoreElement(
            ctx,
            color
          );

          break;


        case 'trophy':

          this.drawTrophyElement(
            ctx,
            color
          );

          break;


        case 'frame':

          this.drawFrameElement(
            ctx,
            color
          );

          break;

      }


      const baseSize =
        layer.kind ===
          'frame'
          ? 320
          : (
              layer.kind ===
                'score'
                ? 340
                : 190
            );


      layer._bounds = {

        x:
          x -
          (
            baseSize *
            scale
          ) /
          2,

        y:
          y -
          (
            baseSize *
            scale
          ) /
          2,

        width:
          baseSize *
          scale,

        height:
          baseSize *
          scale

      };


      ctx.restore();

    }



    drawBallElement(
      ctx,
      accent
    ) {

      ctx.fillStyle =
        '#9b1c29';


      ctx.beginPath();


      ctx.arc(
        0,
        0,
        68,
        0,
        Math.PI *
          2
      );


      ctx.fill();


      ctx.strokeStyle =
        '#f0d5d7';


      ctx.lineWidth =
        5;


      ctx.beginPath();


      ctx.moveTo(
        -10,
        -62
      );


      ctx.lineTo(
        10,
        62
      );


      ctx.stroke();


      ctx.strokeStyle =
        rgba(
          accent,
          .55
        );


      ctx.lineWidth =
        2;


      ctx.beginPath();


      ctx.arc(
        0,
        0,
        65,
        0,
        Math.PI *
          2
      );


      ctx.stroke();

    }



    drawWicketsElement(
      ctx,
      accent
    ) {

      ctx.fillStyle =
        '#f3ead4';


      [
        -45,
        0,
        45
      ]
        .forEach(
          x => {

            roundRectPath(
              ctx,
              x -
                7,
              -100,
              14,
              200,
              4
            );


            ctx.fill();

          }
        );


      ctx.fillStyle =
        accent;


      ctx.fillRect(
        -57,
        -108,
        53,
        9
      );


      ctx.fillRect(
        4,
        -108,
        53,
        9
      );

    }



    drawVsElement(
      ctx,
      accent
    ) {

      ctx.fillStyle =
        'rgba(8,9,11,.92)';


      ctx.strokeStyle =
        accent;


      ctx.lineWidth =
        6;


      ctx.beginPath();


      ctx.arc(
        0,
        0,
        88,
        0,
        Math.PI *
          2
      );


      ctx.fill();


      ctx.stroke();


      ctx.fillStyle =
        '#fff';


      ctx.font =
        '400 86px "Bebas Neue"';


      ctx.textAlign =
        'center';


      ctx.textBaseline =
        'middle';


      ctx.fillText(
        'VS',
        0,
        6
      );

    }



    drawScoreElement(
      ctx,
      accent
    ) {

      ctx.fillStyle =
        '#101317';


      ctx.strokeStyle =
        accent;


      ctx.lineWidth =
        3;


      roundRectPath(
        ctx,
        -170,
        -60,
        340,
        120,
        14
      );


      ctx.fill();


      ctx.stroke();


      ctx.fillStyle =
        '#fff';


      ctx.font =
        '400 62px "Bebas Neue"';


      ctx.textAlign =
        'center';


      ctx.textBaseline =
        'middle';


      ctx.fillText(
        '186 / 5',
        0,
        -3
      );

    }



    drawTrophyElement(
      ctx,
      accent
    ) {

      ctx.fillStyle =
        accent;


      roundRectPath(
        ctx,
        -55,
        -95,
        110,
        105,
        30
      );


      ctx.fill();


      ctx.fillRect(
        -12,
        0,
        24,
        75
      );


      roundRectPath(
        ctx,
        -70,
        67,
        140,
        30,
        7
      );


      ctx.fill();

    }



    drawFrameElement(
      ctx,
      accent
    ) {

      ctx.strokeStyle =
        accent;


      ctx.lineWidth =
        4;


      ctx.strokeRect(
        -155,
        -155,
        310,
        310
      );

    }



    drawOfficialBrand(
      ctx,
      width,
      height
    ) {

      if (
        this.state.showLogo
      ) {

        if (
          this.logoReady &&
          this.logo.naturalWidth
        ) {

          const scale =
            Math.min(
              (
                width *
                .12
              ) /
                this.logo.naturalWidth,
              (
                height *
                .07
              ) /
                this.logo.naturalHeight
            );


          ctx.save();


          ctx.shadowColor =
            'rgba(0,0,0,.48)';


          ctx.shadowBlur =
            width *
            .012;


          ctx.drawImage(
            this.logo,
            width *
              .052,
            height *
              .032,
            this.logo.naturalWidth *
              scale,
            this.logo.naturalHeight *
              scale
          );


          ctx.restore();

        } else {

          ctx.fillStyle =
            this.state.accent;


          ctx.font =
            `900 ${
              width *
              .032
            }px "Montserrat"`;


          ctx.fillText(
            'FWCWL',
            width *
              .055,
            height *
              .045
          );

        }

      }


      ctx.save();


      ctx.textAlign =
        'right';


      ctx.fillStyle =
        'rgba(255,255,255,.40)';


      ctx.font =
        `800 ${
          width *
          .014
        }px "DM Sans"`;


      ctx.fillText(
        this.state.brandName ||
          'FWCWL',
        width *
          .94,
        height *
          .955
      );


      ctx.restore();

    }



    drawSafeZone(
      ctx,
      width,
      height
    ) {

      ctx.save();


      ctx.strokeStyle =
        rgba(
          this.state.accent,
          .60
        );


      ctx.lineWidth =
        width *
        .002;


      ctx.setLineDash(
        [
          width *
            .010,
          width *
            .007
        ]
      );


      ctx.strokeRect(
        width *
          .055,
        height *
          .055,
        width *
          .89,
        height *
          .89
      );


      ctx.restore();

    }



    drawSelection(
      ctx,
      bounds,
      width
    ) {

      ctx.save();


      ctx.strokeStyle =
        this.state.accent;


      ctx.lineWidth =
        Math.max(
          2,
          width *
            .002
        );


      ctx.setLineDash(
        [
          width *
            .007,
          width *
            .005
        ]
      );


      ctx.strokeRect(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height
      );


      ctx.setLineDash(
        []
      );


      [
        [
          bounds.x,
          bounds.y
        ],

        [
          bounds.x +
          bounds.width,
          bounds.y
        ],

        [
          bounds.x,
          bounds.y +
          bounds.height
        ],

        [
          bounds.x +
          bounds.width,
          bounds.y +
          bounds.height
        ]

      ]
        .forEach(
          (
            [
              x,
              y
            ]
          ) => {

            ctx.fillStyle =
              this.state.accent;


            ctx.beginPath();


            ctx.arc(
              x,
              y,
              width *
                .006,
              0,
              Math.PI *
                2
            );


            ctx.fill();

          }
        );


      ctx.restore();

    }



    wrapText(
      ctx,
      text,
      maxWidth
    ) {

      const result =
        [];


      String(
        text ||
        ''
      )
        .split(
          '\n'
        )
        .forEach(
          paragraph => {

            if (
              !paragraph
            ) {

              result.push(
                ''
              );

              return;

            }


            let current =
              '';


            paragraph
              .split(
                /\s+/
              )
              .forEach(
                word => {

                  const test =
                    current
                      ? `${current} ${word}`
                      : word;


                  if (
                    ctx
                      .measureText(
                        test
                      )
                      .width >
                      maxWidth &&
                    current
                  ) {

                    result.push(
                      current
                    );


                    current =
                      word;

                  } else {

                    current =
                      test;

                  }

                }
              );


            result.push(
              current
            );

          }
        );


      return result;

    }



    getSelected() {

      return (
        this.state.layers
          .find(
            layer =>
              layer.id ===
              this.state.selectedId
          ) ||
        null
      );

    }



    hitTest(
      x,
      y
    ) {

      for (
        let index =
          this.state.layers.length -
          1;
        index >=
          0;
        index--
      ) {

        const layer =
          this.state.layers[index];


        const bounds =
          layer._bounds;


        if (
          !bounds ||
          layer.visible ===
            false ||
          layer.locked
        ) {

          continue;

        }


        if (
          x >=
            bounds.x &&
          x <=
            bounds.x +
            bounds.width &&
          y >=
            bounds.y &&
          y <=
            bounds.y +
            bounds.height
        ) {

          return layer;

        }

      }


      return null;

    }



    pointerCoordinates(
      event
    ) {

      const rect =
        this.canvas
          .getBoundingClientRect();


      return {

        x:
          (
            event.clientX -
            rect.left
          ) *
          (
            this.canvas.width /
            rect.width
          ),

        y:
          (
            event.clientY -
            rect.top
          ) *
          (
            this.canvas.height /
            rect.height
          )

      };

    }



    onPointerDown(
      event
    ) {

      const point =
        this.pointerCoordinates(
          event
        );


      const layer =
        this.hitTest(
          point.x,
          point.y
        );


      if (
        !layer
      ) {

        this.state.selectedId =
          null;


        this.safeRender();


        this.renderInspector();


        return;

      }


      this.state.selectedId =
        layer.id;


      this.dragState = {

        layer,

        startX:
          point.x,

        startY:
          point.y,

        originalX:
          layer.x,

        originalY:
          layer.y

      };


      this.canvas
        .setPointerCapture?.(
          event.pointerId
        );


      this.safeRender();


      this.renderInspector();

    }



    onPointerMove(
      event
    ) {

      if (
        !this.dragState
      ) {
        return;
      }


      const point =
        this.pointerCoordinates(
          event
        );


      let x =
        this.dragState.originalX +
        (
          (
            point.x -
            this.dragState.startX
          ) /
          this.state.width
        ) *
        100;


      let y =
        this.dragState.originalY +
        (
          (
            point.y -
            this.dragState.startY
          ) /
          this.state.height
        ) *
        100;


      const snapped =
        this.applySmartSnap(
          x,
          y
        );


      x =
        snapped.x;


      y =
        snapped.y;


      this.dragState.layer.x =
        clamp(
          x,
          0,
          100
        );


      this.dragState.layer.y =
        clamp(
          y,
          0,
          100
        );


      this.safeRender();


      this.renderInspectorValues();


      this.updateContextToolbar();

    }



    onPointerUp() {

      if (
        !this.dragState
      ) {
        return;
      }


      this.dragState =
        null;


      this.hideGuides();


      this.updateContextToolbar();


      this.commit();

    }



    /* ============================================================
       PREMIUM UI VISIBILITY
    ============================================================ */

    injectPremiumVisibilityStyles() {

      const STYLE_ID =
        'fwcwlPosterPremiumVisibilityV111';


      if (
        document
          .getElementById(
            STYLE_ID
          )
      ) {
        return;
      }


      const style =
        document
          .createElement(
            'style'
          );


      style.id =
        STYLE_ID;


      style.textContent =
        `

#posterWorkspace {
  --poster-ui-gold: #f1c34d;
  --poster-ui-panel: #0a0d11;
  --poster-ui-line: rgba(255,255,255,.085);
  --poster-ui-line-strong: rgba(255,255,255,.15);
  --poster-ui-text: #f2f4f6;
  --poster-ui-danger: #ef7b85;

  grid-template-columns:
    minmax(270px,300px)
    minmax(0,1fr)
    420px !important;
}


#posterWorkspace .poster-left {
  min-width:270px !important;
  background:#090c10 !important;
}


#posterWorkspace .left-tabs {
  min-height:56px !important;
  padding:7px !important;
  gap:6px !important;
}


#posterWorkspace .left-tab {
  min-height:40px !important;
  padding:0 10px !important;
  border-radius:8px !important;
  font-size:9px !important;
  font-weight:800 !important;
  letter-spacing:.02em !important;
}


#posterWorkspace .left-tab span {
  font-size:11px !important;
}


#posterWorkspace .left-panel-scroll {
  scroll-behavior:smooth;
  scrollbar-width:thin;
  scrollbar-color:#353b45 transparent;
}


#posterWorkspace .poster-left-panel {
  padding:15px 14px 20px !important;
}


#posterWorkspace .micro-label {
  font-size:7.5px !important;
  font-weight:900 !important;
  letter-spacing:.11em !important;
  line-height:1.35 !important;
}


#posterWorkspace .panel-heading-row h2,
#posterWorkspace .panel-heading h2 {
  margin-top:5px !important;
  font-size:17px !important;
  line-height:1.15 !important;
  letter-spacing:-.02em !important;
}


#posterWorkspace .panel-heading-row p,
#posterWorkspace .panel-heading p {
  margin-top:7px !important;
  color:#727b86 !important;
  font-size:9px !important;
  line-height:1.5 !important;
}


#posterWorkspace .count-badge {
  min-width:34px !important;
  height:30px !important;
  border-radius:8px !important;
  font-size:9px !important;
  font-weight:850 !important;
}


#posterWorkspace .search-control {
  min-height:42px !important;
  margin-top:13px !important;
  padding:0 12px !important;
  border-radius:9px !important;
}


#posterWorkspace .search-control input {
  font-size:9.5px !important;
}


#posterWorkspace .template-filters {
  gap:6px !important;
  margin-top:11px !important;
  padding-bottom:4px !important;
  overflow-x:auto !important;
  scrollbar-width:none;
}


#posterWorkspace .template-filter {
  min-height:31px !important;
  flex:0 0 auto !important;
  padding:0 10px !important;
  border-radius:7px !important;
  font-size:7.5px !important;
  font-weight:800 !important;
}


#posterWorkspace .template-grid {
  gap:10px !important;
  margin-top:12px !important;
}


#posterWorkspace .template-card {
  border-radius:10px !important;
  overflow:hidden;
  transition:
    transform .16s ease,
    border-color .16s ease,
    box-shadow .16s ease !important;
}


#posterWorkspace .template-card:hover {
  transform:translateY(-2px) !important;
  box-shadow:0 10px 24px rgba(0,0,0,.22) !important;
}


#posterWorkspace .template-meta {
  min-height:44px !important;
  padding:8px 9px !important;
}


#posterWorkspace .template-meta strong {
  font-size:9px !important;
  line-height:1.25 !important;
}


#posterWorkspace .template-meta small {
  margin-top:3px !important;
  font-size:6.5px !important;
}


#posterWorkspace .upload-card {
  min-height:92px !important;
  border-radius:10px !important;
}


#posterWorkspace .quick-add-grid {
  gap:8px !important;
}


#posterWorkspace .quick-add-grid button {
  min-height:52px !important;
  border-radius:9px !important;
}


#posterWorkspace .quick-add-grid button span {
  font-size:8px !important;
}


#posterWorkspace .poster-toolbar {
  min-height:58px !important;
  padding:0 14px !important;
  gap:10px !important;
  background:
    linear-gradient(
      180deg,
      #0c0f13,
      #090c10
    ) !important;
}


#posterWorkspace .poster-toolbar-left,
#posterWorkspace .poster-toolbar-right {
  gap:8px !important;
}


#posterWorkspace .poster-toolbar select {
  min-width:220px !important;
  height:38px !important;
  padding:0 34px 0 11px !important;
  border-radius:8px !important;
  font-size:9px !important;
  font-weight:650 !important;
}


#posterWorkspace .toolbar-button {
  min-height:38px !important;
  padding:0 12px !important;
  border-radius:8px !important;
  font-size:8.5px !important;
  font-weight:750 !important;
}


#posterWorkspace .zoom-control {
  min-height:38px !important;
  border-radius:8px !important;
}


#posterWorkspace .zoom-control button {
  width:38px !important;
  min-width:38px !important;
  height:38px !important;
  font-size:14px !important;
}


#posterWorkspace #posterZoomValue {
  min-width:58px !important;
  font-size:9px !important;
  font-weight:800 !important;
}


#posterWorkspace .poster-status {
  min-height:36px !important;
  padding:0 14px !important;
  font-size:7.5px !important;
}


#posterWorkspace .poster-right {
  width:420px !important;
  min-width:420px !important;
  max-width:420px !important;
  background:
    var(--poster-ui-panel) !important;
  border-left-color:
    var(--poster-ui-line) !important;
}


#posterWorkspace .inspector-heading {
  min-height:72px !important;
  padding:0 16px !important;
  background:
    linear-gradient(
      180deg,
      rgba(13,17,22,.99),
      rgba(9,12,16,.99)
    ) !important;
  border-bottom:
    1px solid
    var(--poster-ui-line) !important;
}


#posterWorkspace .inspector-heading strong {
  margin-top:5px !important;
  color:
    var(--poster-ui-text) !important;
  font-size:13px !important;
  font-weight:850 !important;
  line-height:1.2 !important;
}


#posterWorkspace .type-badge {
  min-width:58px !important;
  height:30px !important;
  padding:0 10px !important;
  border-radius:8px !important;
  font-size:7.5px !important;
  font-weight:900 !important;
}


#posterWorkspace .poster-inspector {
  overflow-y:auto !important;
  overflow-x:hidden !important;
  overscroll-behavior:contain !important;
  scroll-behavior:smooth !important;
  scrollbar-width:thin !important;
  scrollbar-color:#3b424d transparent !important;
  padding-bottom:12px !important;
}


#posterWorkspace .poster-inspector::-webkit-scrollbar {
  width:9px !important;
}


#posterWorkspace .poster-inspector::-webkit-scrollbar-thumb {
  background:#3b424d !important;
  border:2px solid #0a0d11 !important;
  border-radius:20px !important;
}


#posterWorkspace .inspector-quickbar {
  position:sticky !important;
  top:0 !important;
  z-index:25 !important;
  grid-template-columns:
    repeat(5,1fr) !important;
  gap:7px !important;
  padding:11px 13px !important;
  background:
    rgba(9,12,16,.97) !important;
  border-bottom:
    1px solid
    var(--poster-ui-line) !important;
  backdrop-filter:blur(15px);
}


#posterWorkspace .inspector-quickbar button {
  height:40px !important;
  min-width:0 !important;
  border-radius:8px !important;
  border-color:
    var(--poster-ui-line) !important;
  background:#0e1217 !important;
  color:#9da4ae !important;
  font-size:10px !important;
  font-weight:850 !important;
}


#posterWorkspace .inspector-quickbar button:hover {
  transform:
    translateY(-1px) !important;
  color:#fff !important;
  border-color:
    var(--poster-ui-line-strong) !important;
  background:#141920 !important;
}


#posterWorkspace .inspector-quickbar button.accent {
  color:
    var(--poster-ui-gold) !important;
  border-color:
    rgba(241,195,77,.30) !important;
  background:
    rgba(241,195,77,.07) !important;
}


#posterWorkspace .inspector-quickbar button.danger {
  color:
    var(--poster-ui-danger) !important;
}


#posterWorkspace .inspector-section {
  padding:
    18px 15px 20px !important;
  border-bottom:
    1px solid
    rgba(255,255,255,.065) !important;
}


#posterWorkspace .inspector-section > .micro-label {
  color:
    var(--poster-ui-gold) !important;
  font-size:8px !important;
  font-weight:950 !important;
  letter-spacing:.12em !important;
}


#posterWorkspace .inspector-section h3 {
  margin-top:6px !important;
  color:#edf0f3 !important;
  font-size:13px !important;
  font-weight:820 !important;
  line-height:1.25 !important;
}


#posterWorkspace .inspector-section-description {
  margin-top:6px !important;
  color:#707985 !important;
  font-size:8.5px !important;
  line-height:1.5 !important;
}


#posterWorkspace .poster-inspector .field {
  gap:7px !important;
  margin-top:14px !important;
}


#posterWorkspace .poster-inspector .field > span,
#posterWorkspace .poster-inspector .range-field > div > span {
  color:#a9b0ba !important;
  font-size:9.5px !important;
  font-weight:720 !important;
  line-height:1.25 !important;
}


#posterWorkspace .poster-inspector input[type="text"],
#posterWorkspace .poster-inspector input[type="number"],
#posterWorkspace .poster-inspector input[type="search"],
#posterWorkspace .poster-inspector select,
#posterWorkspace .poster-inspector textarea {
  width:100% !important;
  min-height:43px !important;
  padding:0 12px !important;
  border:
    1px solid
    var(--poster-ui-line) !important;
  border-radius:9px !important;
  outline:none !important;
  background:#0d1116 !important;
  color:#f0f2f4 !important;
  font-size:10.5px !important;
  font-weight:600 !important;
  line-height:1.35 !important;
}


#posterWorkspace .poster-inspector textarea {
  min-height:98px !important;
  padding:11px 12px !important;
  resize:vertical !important;
  line-height:1.5 !important;
}


#posterWorkspace .poster-inspector input[type="text"]:focus,
#posterWorkspace .poster-inspector input[type="number"]:focus,
#posterWorkspace .poster-inspector select:focus,
#posterWorkspace .poster-inspector textarea:focus {
  border-color:
    rgba(241,195,77,.46) !important;
  background:#11161c !important;
  box-shadow:
    0 0 0 3px
    rgba(241,195,77,.055) !important;
}


#posterWorkspace .poster-inspector input[type="color"] {
  width:100% !important;
  height:44px !important;
  min-height:44px !important;
  padding:5px !important;
  border:
    1px solid
    var(--poster-ui-line) !important;
  border-radius:9px !important;
  background:#0d1116 !important;
  cursor:pointer !important;
}


#posterWorkspace .poster-inspector input[type="color"]::-webkit-color-swatch-wrapper {
  padding:0 !important;
}


#posterWorkspace .poster-inspector input[type="color"]::-webkit-color-swatch {
  border:0 !important;
  border-radius:5px !important;
}


#posterWorkspace .grid-2 {
  gap:9px !important;
}


#posterWorkspace .range-field {
  gap:9px !important;
  margin-top:16px !important;
}


#posterWorkspace .range-field b {
  min-width:46px !important;
  color:#e5e8eb !important;
  font-size:9.5px !important;
  font-weight:800 !important;
  text-align:right !important;
  font-variant-numeric:
    tabular-nums;
}


#posterWorkspace .poster-inspector input[type="range"] {
  width:100% !important;
  height:6px !important;
  min-height:6px !important;
  border-radius:20px !important;
  background:#343b45 !important;
  cursor:pointer !important;
}


#posterWorkspace .poster-inspector input[type="range"]::-webkit-slider-thumb {
  width:18px !important;
  height:18px !important;
  border:
    3px solid
    #090c10 !important;
  border-radius:50% !important;
  background:
    var(--poster-ui-gold) !important;
  box-shadow:
    0 0 0 1px rgba(241,195,77,.58),
    0 3px 10px rgba(0,0,0,.36) !important;
}


#posterWorkspace .poster-inspector input[type="range"]::-moz-range-thumb {
  width:14px !important;
  height:14px !important;
  border:
    3px solid
    #090c10 !important;
  border-radius:50% !important;
  background:
    var(--poster-ui-gold) !important;
}


#posterWorkspace .poster-inspector .segmented {
  gap:7px !important;
  margin-top:13px !important;
}


#posterWorkspace .poster-inspector .segmented button {
  min-height:40px !important;
  border-radius:8px !important;
  font-size:9px !important;
  font-weight:800 !important;
}


#posterWorkspace .transform-number-grid {
  gap:9px !important;
  margin-top:14px !important;
}


#posterWorkspace .transform-number > span {
  margin-bottom:6px !important;
  color:#9ca4ae !important;
  font-size:8.5px !important;
}


#posterWorkspace .transform-number input {
  min-height:42px !important;
  font-size:10px !important;
}


#posterWorkspace .transform-number em {
  right:11px !important;
  bottom:13px !important;
  color:#68717c !important;
  font-size:8px !important;
}


#posterWorkspace .action-grid,
#posterWorkspace .align-grid,
#posterWorkspace .flip-grid {
  gap:8px !important;
  margin-top:12px !important;
}


#posterWorkspace .poster-inspector .action-grid button,
#posterWorkspace .poster-inspector .align-grid button,
#posterWorkspace .poster-inspector .flip-grid button {
  min-height:40px !important;
  padding:0 10px !important;
  border-radius:8px !important;
  font-size:8.5px !important;
  font-weight:780 !important;
  line-height:1.15 !important;
}


#posterWorkspace .poster-inspector .danger-button {
  color:
    var(--poster-ui-danger) !important;
}


#posterWorkspace .poster-inspector .switch-row {
  min-height:58px !important;
  margin-top:14px !important;
  padding:10px 11px !important;
  border-radius:9px !important;
}


#posterWorkspace .poster-inspector .switch-row strong {
  color:#e2e5e8 !important;
  font-size:9.5px !important;
  font-weight:800 !important;
}


#posterWorkspace .poster-inspector .switch-row span {
  margin-top:3px !important;
  color:#6e7782 !important;
  font-size:7.5px !important;
  line-height:1.3 !important;
}


#posterWorkspace .layer-list {
  gap:8px !important;
  margin-top:13px !important;
}


#posterWorkspace .layer-row {
  min-height:58px !important;
  grid-template-columns:
    36px
    minmax(0,1fr)
    36px !important;
  border-radius:9px !important;
}


#posterWorkspace .layer-row.active {
  box-shadow:
    inset 3px 0 0
    var(--poster-ui-gold),
    0 5px 15px
    rgba(0,0,0,.12) !important;
}


#posterWorkspace .layer-main {
  gap:10px !important;
  padding:7px 4px !important;
}


#posterWorkspace .layer-icon {
  width:32px !important;
  height:32px !important;
  flex:0 0 32px !important;
  border-radius:7px !important;
  font-size:10px !important;
}


#posterWorkspace .layer-main strong {
  color:#e1e4e8 !important;
  font-size:9.5px !important;
  font-weight:800 !important;
}


#posterWorkspace .layer-main small {
  margin-top:3px !important;
  color:#626b76 !important;
  font-size:6.5px !important;
}


#posterWorkspace .inspector-help {
  margin:14px !important;
  padding:14px 15px !important;
  border-radius:9px !important;
  color:#7b8490 !important;
  font-size:8.5px !important;
  line-height:1.6 !important;
}


#posterWorkspace .poster-right-footer {
  padding:12px !important;
}


#posterWorkspace .download-button {
  min-height:56px !important;
  border-radius:9px !important;
}


#posterWorkspace .download-button strong {
  font-size:10px !important;
}


#posterWorkspace .download-button small {
  font-size:7px !important;
}


#posterWorkspace .poster-context-toolbar {
  gap:5px !important;
  padding:6px !important;
  border-radius:10px !important;
  box-shadow:
    0 15px 36px
    rgba(0,0,0,.38) !important;
}


#posterWorkspace .poster-context-toolbar button {
  min-width:36px !important;
  height:34px !important;
  padding:0 9px !important;
  border-radius:7px !important;
  font-size:9px !important;
}


#posterWorkspace button,
#posterWorkspace select,
#posterWorkspace input,
#posterWorkspace textarea {
  transition:
    color .14s ease,
    background-color .14s ease,
    border-color .14s ease,
    box-shadow .14s ease,
    transform .14s ease !important;
}


#posterWorkspace button:focus-visible,
#posterWorkspace select:focus-visible,
#posterWorkspace input:focus-visible,
#posterWorkspace textarea:focus-visible {
  outline:
    2px solid
    rgba(241,195,77,.75) !important;
  outline-offset:2px !important;
}


@media (max-width:1450px) {

  #posterWorkspace {
    grid-template-columns:
      minmax(240px,260px)
      minmax(0,1fr)
      380px !important;
  }


  #posterWorkspace .poster-left {
    min-width:240px !important;
  }


  #posterWorkspace .poster-right {
    width:380px !important;
    min-width:380px !important;
    max-width:380px !important;
  }

}


@media (max-width:1180px) {

  #posterWorkspace {
    grid-template-columns:
      220px
      minmax(0,1fr)
      340px !important;
  }


  #posterWorkspace .poster-left {
    min-width:220px !important;
  }


  #posterWorkspace .poster-right {
    width:340px !important;
    min-width:340px !important;
    max-width:340px !important;
  }


  #posterWorkspace .poster-toolbar select {
    min-width:175px !important;
  }

}


@media (max-height:760px) {

  #posterWorkspace .inspector-heading {
    min-height:62px !important;
  }


  #posterWorkspace .inspector-section {
    padding-top:15px !important;
    padding-bottom:16px !important;
  }


  #posterWorkspace .poster-inspector textarea {
    min-height:82px !important;
  }

}

      `;


      document
        .head
        .appendChild(
          style
        );

    }



    /* ============================================================
       GENERATED EDITOR UI
    ============================================================ */

    ensureRuntimeGeneratedUI() {

      const stage =
        $('#posterStage');


      if (
        !stage
      ) {
        return;
      }


      if (
        !$('#posterContextToolbar')
      ) {

        const toolbar =
          document
            .createElement(
              'div'
            );


        toolbar.id =
          'posterContextToolbar';


        toolbar.className =
          'poster-context-toolbar';


        toolbar.innerHTML =
          `

          <button data-context-action="duplicate" title="Duplicate">⧉</button>
          <button data-context-action="forward" title="Bring Forward">↑</button>
          <button data-context-action="backward" title="Send Backward">↓</button>
          <button data-context-action="lock" title="Lock">□</button>
          <button data-context-action="delete" title="Delete">×</button>

        `;


        stage.appendChild(
          toolbar
        );


        toolbar
          .addEventListener(
            'pointerdown',
            event =>
              event.stopPropagation()
          );


        $$(
          '[data-context-action]',
          toolbar
        )
          .forEach(
            button => {

              button
                .addEventListener(
                  'click',
                  event => {

                    event.stopPropagation();


                    const action =
                      button.dataset
                        .contextAction;


                    if (
                      action ===
                      'duplicate'
                    ) {

                      this.duplicateSelected();

                    } else if (
                      action ===
                      'forward'
                    ) {

                      this.moveSelected(
                        1
                      );

                    } else if (
                      action ===
                      'backward'
                    ) {

                      this.moveSelected(
                        -1
                      );

                    } else if (
                      action ===
                      'delete'
                    ) {

                      this.deleteSelected();

                    } else if (
                      action ===
                      'lock'
                    ) {

                      const layer =
                        this.getSelected();


                      if (
                        !layer
                      ) {
                        return;
                      }


                      layer.locked =
                        !layer.locked;


                      this.safeRender();

                      this.renderInspector();

                      this.commit();

                    }

                  }
                );

            }
          );

      }


      if (
        !$('#posterGuideX')
      ) {

        const x =
          document
            .createElement(
              'div'
            );


        x.id =
          'posterGuideX';


        x.className =
          'poster-guide poster-guide-x';


        stage.appendChild(
          x
        );

      }


      if (
        !$('#posterGuideY')
      ) {

        const y =
          document
            .createElement(
              'div'
            );


        y.id =
          'posterGuideY';


        y.className =
          'poster-guide poster-guide-y';


        stage.appendChild(
          y
        );

      }


      this.contextToolbar =
        $('#posterContextToolbar');


      this.guideX =
        $('#posterGuideX');


      this.guideY =
        $('#posterGuideY');

    }



    updateContextToolbar() {

      const toolbar =
        this.contextToolbar ||
        $('#posterContextToolbar');


      const stage =
        $('#posterStage');


      const selected =
        this.getSelected();


      if (
        !toolbar ||
        !stage ||
        !selected?._bounds ||
        selected.visible ===
          false
      ) {

        toolbar
          ?.classList
          .remove(
            'visible'
          );

        return;

      }


      const canvasRect =
        this.canvas
          .getBoundingClientRect();


      const stageRect =
        stage
          .getBoundingClientRect();


      const scaleX =
        canvasRect.width /
        this.canvas.width;


      const scaleY =
        canvasRect.height /
        this.canvas.height;


      const bounds =
        selected._bounds;


      const left =
        canvasRect.left -
        stageRect.left +
        stage.scrollLeft +
        (
          bounds.x +
          bounds.width /
          2
        ) *
        scaleX;


      const top =
        canvasRect.top -
        stageRect.top +
        stage.scrollTop +
        bounds.y *
        scaleY -
        42;


      toolbar.style.left =
        `${left}px`;


      toolbar.style.top =
        `${
          Math.max(
            6,
            top
          )
        }px`;


      toolbar.style.transform =
        'translateX(-50%)';


      toolbar
        .classList
        .add(
          'visible'
        );


      const lockButton =
        $(
          '[data-context-action="lock"]',
          toolbar
        );


      if (
        lockButton
      ) {

        lockButton.textContent =
          selected.locked
            ? '■'
            : '□';

      }

    }



    positionGuide(
      axis,
      percentage
    ) {

      const stage =
        $('#posterStage');


      const canvasRect =
        this.canvas
          .getBoundingClientRect();


      const stageRect =
        stage
          ?.getBoundingClientRect();


      if (
        !stage ||
        !stageRect
      ) {
        return;
      }


      if (
        axis ===
          'x' &&
        this.guideX
      ) {

        this.guideX.style.left =
          `${
            canvasRect.left -
            stageRect.left +
            stage.scrollLeft +
            canvasRect.width *
            (
              percentage /
              100
            )
          }px`;


        this.guideX.style.top =
          `${
            canvasRect.top -
            stageRect.top +
            stage.scrollTop
          }px`;


        this.guideX.style.height =
          `${canvasRect.height}px`;

      }


      if (
        axis ===
          'y' &&
        this.guideY
      ) {

        this.guideY.style.top =
          `${
            canvasRect.top -
            stageRect.top +
            stage.scrollTop +
            canvasRect.height *
            (
              percentage /
              100
            )
          }px`;


        this.guideY.style.left =
          `${
            canvasRect.left -
            stageRect.left +
            stage.scrollLeft
          }px`;


        this.guideY.style.width =
          `${canvasRect.width}px`;

      }

    }



    applySmartSnap(
      x,
      y
    ) {

      if (
        !this.state.snap
      ) {

        this.hideGuides();


        return {
          x,
          y
        };

      }


      const targets =
        [
          5,
          25,
          50,
          75,
          95
        ];


      const threshold =
        1.15;


      let bestX =
        null;


      let bestY =
        null;


      let dx =
        Infinity;


      let dy =
        Infinity;


      targets
        .forEach(
          target => {

            const currentX =
              Math.abs(
                x -
                target
              );


            const currentY =
              Math.abs(
                y -
                target
              );


            if (
              currentX <
                dx &&
              currentX <=
                threshold
            ) {

              dx =
                currentX;


              bestX =
                target;

            }


            if (
              currentY <
                dy &&
              currentY <=
                threshold
            ) {

              dy =
                currentY;


              bestY =
                target;

            }

          }
        );


      if (
        bestX !==
        null
      ) {

        x =
          bestX;


        this.positionGuide(
          'x',
          bestX
        );


        this.guideX
          ?.classList
          .add(
            'visible'
          );

      } else {

        this.guideX
          ?.classList
          .remove(
            'visible'
          );

      }


      if (
        bestY !==
        null
      ) {

        y =
          bestY;


        this.positionGuide(
          'y',
          bestY
        );


        this.guideY
          ?.classList
          .add(
            'visible'
          );

      } else {

        this.guideY
          ?.classList
          .remove(
            'visible'
          );

      }


      return {
        x,
        y
      };

    }



    hideGuides() {

      this.guideX
        ?.classList
        .remove(
          'visible'
        );


      this.guideY
        ?.classList
        .remove(
          'visible'
        );

    }



    /* ============================================================
       MEDIA
    ============================================================ */

    async importImages(
      files
    ) {

      for (
        const file
        of
        Array.from(
          files ||
          []
        )
      ) {

        if (
          !file.type
            ?.startsWith(
              'image/'
            )
        ) {

          continue;

        }


        const url =
          URL.createObjectURL(
            file
          );


        const image =
          new Image();


        image.src =
          url;


        await new Promise(
          (
            resolve,
            reject
          ) => {

            image.onload =
              resolve;


            image.onerror =
              reject;

          }
        );


        const id =
          uid(
            'asset'
          );


        this.assets
          .set(
            id,
            {

              id,

              name:
                file.name,

              url,

              image

            }
          );

      }


      this.renderAssets();

    }



    renderAssets() {

      const grid =
        $('#posterAssetGrid');


      if (
        !grid
      ) {
        return;
      }


      const assets =
        Array.from(
          this.assets
            .values()
        );


      if (
        !assets.length
      ) {

        grid.innerHTML =
          '<div class="empty-state"><strong>No uploaded media</strong><span>Upload a player or match photo.</span></div>';


        return;

      }


      grid.innerHTML =
        assets
          .map(
            asset => `

        <button
          class="asset-card"
          data-poster-asset="${asset.id}"
          type="button"
        >

          <div class="asset-thumb">

            <img
              src="${asset.url}"
              alt=""
            >

          </div>

          <strong>
            ${esc(asset.name)}
          </strong>

        </button>

      `
          )
          .join('');


      $$(
        '[data-poster-asset]',
        grid
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                () =>
                  this.addImageLayer(
                    button.dataset
                      .posterAsset
                  )
              );

          }
        );

    }



    addImageLayer(
      assetId
    ) {

      const asset =
        this.assets
          .get(
            assetId
          );


      if (
        !asset
      ) {
        return;
      }


      const layer = {

        id:
          uid(
            'image'
          ),

        type:
          'image',

        role:
          'user',

        name:
          asset.name,

        assetId,

        x:
          68,

        y:
          45,

        width:
          45,

        scale:
          1,

        rotation:
          0,

        opacity:
          1,

        brightness:
          0,

        contrast:
          0,

        saturation:
          0,

        exposure:
          0,

        grayscale:
          0,

        sepia:
          0,

        blur:
          0,

        flipX:
          false,

        flipY:
          false,

        blendMode:
          'source-over',

        visible:
          true,

        locked:
          false

      };


      this.state.layers
        .push(
          layer
        );


      this.state.selectedId =
        layer.id;


      this.safeRender();


      this.renderInspector();


      this.commit();

    }



    addText(
      type
    ) {

      const headline =
        type ===
        'headline';


      const layer = {

        id:
          uid(
            'text'
          ),

        type:
          'text',

        role:
          'user',

        name:
          headline
            ? 'Custom Headline'
            : 'Custom Subtitle',

        text:
          headline
            ? 'YOUR HEADLINE'
            : 'Add supporting text',

        x:
          10,

        y:
          headline
            ? 52
            : 67,

        width:
          headline
            ? 75
            : 65,

        size:
          headline
            ? 120
            : 30,

        weight:
          headline
            ? 900
            : 650,

        font:
          headline
            ? 'Montserrat'
            : 'DM Sans',

        color:
          '#ffffff',

        align:
          'left',

        opacity:
          1,

        lineHeight:
          headline
            ? .9
            : 1.1,

        letterSpacing:
          0,

        strokeColor:
          '#000000',

        strokeWidth:
          0,

        shadowEnabled:
          false,

        shadowColor:
          '#000000',

        shadowBlur:
          18,

        shadowX:
          0,

        shadowY:
          8,

        backgroundEnabled:
          false,

        backgroundColor:
          '#000000',

        backgroundOpacity:
          .35,

        backgroundPadding:
          18,

        blendMode:
          'source-over',

        visible:
          true,

        locked:
          false

      };


      this.state.layers
        .push(
          layer
        );


      this.state.selectedId =
        layer.id;


      this.safeRender();


      this.renderInspector();


      this.commit();

    }



    addElement(
      kind
    ) {

      const names = {

        ball:
          'Cricket Ball',

        wickets:
          'Wickets',

        vs:
          'VS Badge',

        score:
          'Score Graphic',

        trophy:
          'Trophy',

        frame:
          'Frame'

      };


      const layer = {

        id:
          uid(
            'element'
          ),

        type:
          'element',

        role:
          'user',

        kind,

        name:
          names[kind] ||
          'Element',

        x:
          72,

        y:
          43,

        scale:
          1,

        rotation:
          0,

        opacity:
          1,

        color:
          this.state.accent,

        blendMode:
          'source-over',

        visible:
          true,

        locked:
          false

      };


      this.state.layers
        .push(
          layer
        );


      this.state.selectedId =
        layer.id;


      this.safeRender();


      this.renderInspector();


      this.commit();

    }



    /* ============================================================
       INSPECTOR
    ============================================================ */

    renderInspector() {

      const container =
        $('#posterInspector');


      if (
        !container
      ) {
        return;
      }


      const layer =
        this.getSelected();


      const title =
        $('#posterInspectorTitle');


      const type =
        $('#posterInspectorType');


      if (
        title
      ) {

        title.textContent =
          layer
            ? layer.name
            : 'Edit Design';

      }


      if (
        type
      ) {

        type.textContent =
          layer
            ? layer.type
                .toUpperCase()
            : 'CANVAS';

      }


      container.innerHTML =
        `

        ${this.inspectorQuickbarHtml(layer)}

        ${
          layer
            ? this.selectedLayerInspectorHtml(layer)
            : this.canvasInspectorHtml()
        }

        <div class="inspector-section">

          <div class="micro-label">
            LAYERS
          </div>

          <h3>
            Design Layers
          </h3>

          <div class="inspector-section-description">
            ${
              this.state.layers.length
            } layers in current poster
          </div>

          ${this.layersHtml()}

        </div>

      `;


      this.bindAdvancedInspector(
        layer
      );


      this.bindLayerRows();


      this.updateContextToolbar();

    }



    inspectorQuickbarHtml(
      layer
    ) {

      if (
        !layer
      ) {

        return `

          <div class="inspector-quickbar">

            <button
              id="quickFit"
              title="Fit canvas"
            >
              FIT
            </button>

            <button
              id="quickSafe"
              class="${
                this.state.safeZone
                  ? 'accent'
                  : ''
              }"
              title="Safe Area"
            >
              SAFE
            </button>

            <button
              id="quickSnap"
              class="${
                this.state.snap
                  ? 'accent'
                  : ''
              }"
              title="Snap"
            >
              SNAP
            </button>

            <button
              id="quickUndo"
              title="Undo"
            >
              ↶
            </button>

            <button
              id="quickRedo"
              title="Redo"
            >
              ↷
            </button>

          </div>

        `;

      }


      return `

        <div class="inspector-quickbar">

          <button
            id="quickDuplicate"
            title="Duplicate"
          >
            ⧉
          </button>

          <button
            id="quickLock"
            class="${
              layer.locked
                ? 'accent'
                : ''
            }"
            title="${
              layer.locked
                ? 'Unlock'
                : 'Lock'
            }"
          >
            ${
              layer.locked
                ? '■'
                : '□'
            }
          </button>

          <button
            id="quickVisibility"
            class="${
              layer.visible ===
                false
                ? ''
                : 'accent'
            }"
            title="Visibility"
          >
            ${
              layer.visible ===
                false
                ? '○'
                : '●'
            }
          </button>

          <button
            id="quickForward"
            title="Bring Forward"
          >
            ↑
          </button>

          <button
            id="quickDelete"
            class="danger"
            title="Delete"
          >
            ×
          </button>

        </div>

      `;

    }



    canvasInspectorHtml() {

      return `

        <div class="inspector-section">

          <div class="micro-label">
            CANVAS
          </div>

          <h3>
            Poster Appearance
          </h3>

          <div class="inspector-section-description">
            Global design settings
          </div>

          ${
            this.rangeHtml(
              'posterTextureStrength',
              'Texture Strength',
              0,
              100,
              this.state.textureStrength,
              '%'
            )
          }

          <label class="field">

            <span>
              Accent
            </span>

            <input
              id="insCanvasAccent"
              type="color"
              value="${this.state.accent}"
            >

          </label>

          <label class="field">

            <span>
              Background
            </span>

            <input
              id="insCanvasBackground"
              type="color"
              value="${this.state.background}"
            >

          </label>

          <label class="switch-row">

            <div>

              <strong>
                Official FWCWL Logo
              </strong>

              <span>
                Show league branding
              </span>

            </div>

            <input
              id="insCanvasLogo"
              type="checkbox"
              ${
                this.state.showLogo
                  ? 'checked'
                  : ''
              }
            >

            <i></i>

          </label>

        </div>


        <div class="inspector-section">

          <div class="micro-label">
            EDITOR
          </div>

          <h3>
            Workspace
          </h3>

          <label class="switch-row">

            <div>

              <strong>
                Snap
              </strong>

              <span>
                Snap objects to smart guides
              </span>

            </div>

            <input
              id="insSnap"
              type="checkbox"
              ${
                this.state.snap
                  ? 'checked'
                  : ''
              }
            >

            <i></i>

          </label>


          <label class="switch-row">

            <div>

              <strong>
                Safe Area
              </strong>

              <span>
                Show Instagram safe margins
              </span>

            </div>

            <input
              id="insSafeArea"
              type="checkbox"
              ${
                this.state.safeZone
                  ? 'checked'
                  : ''
              }
            >

            <i></i>

          </label>

        </div>

      `;

    }



    selectedLayerInspectorHtml(
      layer
    ) {

      let specific =
        '';


      if (
        layer.type ===
        'text'
      ) {

        specific =
          this.advancedTextInspectorHtml(
            layer
          );

      } else if (
        layer.type ===
        'image'
      ) {

        specific =
          this.advancedImageInspectorHtml(
            layer
          );

      } else if (
        layer.type ===
        'element'
      ) {

        specific =
          this.advancedElementInspectorHtml(
            layer
          );

      }


      return `

        ${specific}

        ${this.advancedTransformHtml(layer)}

        ${this.advancedAppearanceHtml(layer)}

        ${this.advancedArrangeHtml(layer)}

      `;

    }



    normalizeTextAdvanced(
      layer
    ) {

      if (
        layer.strokeColor ==
        null
      ) {
        layer.strokeColor =
          '#000000';
      }


      if (
        layer.strokeWidth ==
        null
      ) {
        layer.strokeWidth =
          0;
      }


      if (
        layer.shadowEnabled ==
        null
      ) {
        layer.shadowEnabled =
          false;
      }


      if (
        layer.shadowColor ==
        null
      ) {
        layer.shadowColor =
          '#000000';
      }


      if (
        layer.shadowBlur ==
        null
      ) {
        layer.shadowBlur =
          18;
      }


      if (
        layer.shadowX ==
        null
      ) {
        layer.shadowX =
          0;
      }


      if (
        layer.shadowY ==
        null
      ) {
        layer.shadowY =
          8;
      }


      if (
        layer.backgroundEnabled ==
        null
      ) {
        layer.backgroundEnabled =
          false;
      }


      if (
        layer.backgroundColor ==
        null
      ) {
        layer.backgroundColor =
          '#000000';
      }


      if (
        layer.backgroundOpacity ==
        null
      ) {
        layer.backgroundOpacity =
          .35;
      }


      if (
        layer.backgroundPadding ==
        null
      ) {
        layer.backgroundPadding =
          18;
      }


      if (
        layer.blendMode ==
        null
      ) {
        layer.blendMode =
          'source-over';
      }

    }



    advancedTextInspectorHtml(
      layer
    ) {

      this.normalizeTextAdvanced(
        layer
      );


      const fonts = [

        'Montserrat',
        'Bebas Neue',
        'DM Sans',
        'Poppins',
        'Playfair Display'

      ];


      const weights = [

        400,
        500,
        600,
        700,
        800,
        900

      ];


      return `

        <div class="inspector-section">

          <div class="micro-label">
            TEXT
          </div>

          <h3>
            Content
          </h3>

          <label class="field">

            <span>
              Text
            </span>

            <textarea id="insText">${esc(layer.text)}</textarea>

          </label>

        </div>


        <div class="inspector-section">

          <div class="micro-label">
            TYPOGRAPHY
          </div>

          <h3>
            Type Styling
          </h3>

          <div class="grid-2">

            <label class="field">

              <span>
                Font
              </span>

              <select id="insFont">

                ${
                  fonts
                    .map(
                      font => `

                  <option
                    value="${font}"
                    ${
                      layer.font ===
                        font
                        ? 'selected'
                        : ''
                    }
                  >
                    ${font}
                  </option>

                `
                    )
                    .join('')
                }

              </select>

            </label>


            <label class="field">

              <span>
                Weight
              </span>

              <select id="insWeight">

                ${
                  weights
                    .map(
                      weight => `

                  <option
                    value="${weight}"
                    ${
                      Number(
                        layer.weight
                      ) ===
                        weight
                        ? 'selected'
                        : ''
                    }
                  >
                    ${weight}
                  </option>

                `
                    )
                    .join('')
                }

              </select>

            </label>

          </div>


          ${
            this.rangeHtml(
              'insSize',
              'Font Size',
              12,
              300,
              layer.size,
              ''
            )
          }


          ${
            this.rangeHtml(
              'insTextWidth',
              'Text Width',
              10,
              100,
              layer.width,
              '%'
            )
          }


          ${
            this.rangeHtml(
              'insLetterSpacing',
              'Letter Spacing',
              -10,
              40,
              layer.letterSpacing ||
              0,
              ''
            )
          }


          ${
            this.rangeHtml(
              'insLineHeight',
              'Line Height',
              50,
              220,
              (
                layer.lineHeight ||
                1
              ) *
              100,
              '%'
            )
          }


          <label class="field">

            <span>
              Fill
            </span>

            <input
              id="insTextColor"
              type="color"
              value="${layer.color || '#ffffff'}"
            >

          </label>


          <div class="segmented">

            ${
              [
                'left',
                'center',
                'right'
              ]
                .map(
                  align => `

              <button
                data-text-align="${align}"
                class="${
                  layer.align ===
                    align
                    ? 'active'
                    : ''
                }"
                type="button"
              >
                ${align}
              </button>

            `
                )
                .join('')
            }

          </div>

        </div>


        <div class="inspector-section">

          <div class="micro-label">
            TEXT FX
          </div>

          <h3>
            Stroke & Shadow
          </h3>


          ${
            this.rangeHtml(
              'insStrokeWidth',
              'Stroke',
              0,
              20,
              layer.strokeWidth,
              ''
            )
          }


          <label class="field">

            <span>
              Stroke Color
            </span>

            <input
              id="insStrokeColor"
              type="color"
              value="${layer.strokeColor}"
            >

          </label>


          <label class="switch-row">

            <div>

              <strong>
                Shadow
              </strong>

              <span>
                Add depth behind text
              </span>

            </div>

            <input
              id="insShadowEnabled"
              type="checkbox"
              ${
                layer.shadowEnabled
                  ? 'checked'
                  : ''
              }
            >

            <i></i>

          </label>


          ${
            this.rangeHtml(
              'insShadowBlur',
              'Shadow Blur',
              0,
              80,
              layer.shadowBlur,
              ''
            )
          }


          ${
            this.rangeHtml(
              'insShadowX',
              'Shadow X',
              -60,
              60,
              layer.shadowX,
              ''
            )
          }


          ${
            this.rangeHtml(
              'insShadowY',
              'Shadow Y',
              -60,
              60,
              layer.shadowY,
              ''
            )
          }


          <label class="field">

            <span>
              Shadow Color
            </span>

            <input
              id="insShadowColor"
              type="color"
              value="${layer.shadowColor}"
            >

          </label>

        </div>


        <div class="inspector-section">

          <div class="micro-label">
            TEXT BACKGROUND
          </div>

          <h3>
            Label / Plate
          </h3>

          <label class="switch-row">

            <div>

              <strong>
                Background Plate
              </strong>

              <span>
                Place a color plate behind text
              </span>

            </div>

            <input
              id="insTextBgEnabled"
              type="checkbox"
              ${
                layer.backgroundEnabled
                  ? 'checked'
                  : ''
              }
            >

            <i></i>

          </label>


          <label class="field">

            <span>
              Background Color
            </span>

            <input
              id="insTextBgColor"
              type="color"
              value="${layer.backgroundColor}"
            >

          </label>


          ${
            this.rangeHtml(
              'insTextBgOpacity',
              'Background Opacity',
              0,
              100,
              (
                layer.backgroundOpacity ||
                0
              ) *
              100,
              '%'
            )
          }


          ${
            this.rangeHtml(
              'insTextBgPadding',
              'Background Padding',
              0,
              80,
              layer.backgroundPadding ||
              0,
              ''
            )
          }

        </div>

      `;

    }



    normalizeImageAdvanced(
      layer
    ) {

      if (
        layer.exposure ==
        null
      ) {
        layer.exposure =
          0;
      }


      if (
        layer.grayscale ==
        null
      ) {
        layer.grayscale =
          0;
      }


      if (
        layer.sepia ==
        null
      ) {
        layer.sepia =
          0;
      }


      if (
        layer.flipX ==
        null
      ) {
        layer.flipX =
          false;
      }


      if (
        layer.flipY ==
        null
      ) {
        layer.flipY =
          false;
      }


      if (
        layer.blendMode ==
        null
      ) {
        layer.blendMode =
          'source-over';
      }

    }



    advancedImageInspectorHtml(
      layer
    ) {

      this.normalizeImageAdvanced(
        layer
      );


      return `

        <div class="inspector-section">

          <div class="micro-label">
            PHOTO
          </div>

          <h3>
            Image Controls
          </h3>


          ${
            this.rangeHtml(
              'insImageWidth',
              'Width',
              5,
              160,
              layer.width,
              '%'
            )
          }


          ${
            this.rangeHtml(
              'insImageScale',
              'Scale',
              10,
              400,
              (
                layer.scale ||
                1
              ) *
              100,
              '%'
            )
          }


          <div class="flip-grid">

            <button
              id="insFlipX"
              type="button"
            >
              Flip H
            </button>

            <button
              id="insFlipY"
              type="button"
            >
              Flip V
            </button>

          </div>

        </div>


        <div class="inspector-section">

          <div class="micro-label">
            ADJUST
          </div>

          <h3>
            Professional Photo Adjustments
          </h3>


          ${
            this.rangeHtml(
              'insBrightness',
              'Brightness',
              -100,
              100,
              layer.brightness ||
              0,
              ''
            )
          }


          ${
            this.rangeHtml(
              'insContrast',
              'Contrast',
              -100,
              100,
              layer.contrast ||
              0,
              ''
            )
          }


          ${
            this.rangeHtml(
              'insSaturation',
              'Saturation',
              -100,
              100,
              layer.saturation ||
              0,
              ''
            )
          }


          ${
            this.rangeHtml(
              'insExposure',
              'Exposure',
              -100,
              100,
              layer.exposure ||
              0,
              ''
            )
          }


          ${
            this.rangeHtml(
              'insGrayscale',
              'B&W',
              0,
              100,
              layer.grayscale ||
              0,
              '%'
            )
          }


          ${
            this.rangeHtml(
              'insSepia',
              'Warm / Sepia',
              0,
              100,
              layer.sepia ||
              0,
              '%'
            )
          }


          ${
            this.rangeHtml(
              'insBlur',
              'Blur',
              0,
              30,
              layer.blur ||
              0,
              ''
            )
          }


          <div class="action-grid">

            <button
              id="insResetPhoto"
              type="button"
            >
              Reset Photo FX
            </button>

            <button
              id="insFitPhoto"
              type="button"
            >
              Fit Photo
            </button>

          </div>

        </div>

      `;

    }



    advancedElementInspectorHtml(
      layer
    ) {

      return `

        <div class="inspector-section">

          <div class="micro-label">
            ELEMENT
          </div>

          <h3>
            Cricket Graphic
          </h3>

          <label class="field">

            <span>
              Color
            </span>

            <input
              id="insElementColor"
              type="color"
              value="${
                layer.color ||
                this.state.accent
              }"
            >

          </label>


          ${
            this.rangeHtml(
              'insElementScale',
              'Scale',
              10,
              400,
              (
                layer.scale ||
                1
              ) *
              100,
              '%'
            )
          }

        </div>

      `;

    }



    advancedTransformHtml(
      layer
    ) {

      return `

        <div class="inspector-section">

          <div class="micro-label">
            TRANSFORM
          </div>

          <h3>
            Position & Transform
          </h3>


          <div class="transform-number-grid">

            <label class="transform-number">

              <span>
                X
              </span>

              <input
                id="insNumberX"
                type="number"
                min="0"
                max="100"
                step=".1"
                value="${
                  Number(
                    layer.x
                  )
                    .toFixed(
                      1
                    )
                }"
              >

              <em>
                %
              </em>

            </label>


            <label class="transform-number">

              <span>
                Y
              </span>

              <input
                id="insNumberY"
                type="number"
                min="0"
                max="100"
                step=".1"
                value="${
                  Number(
                    layer.y
                  )
                    .toFixed(
                      1
                    )
                }"
              >

              <em>
                %
              </em>

            </label>

          </div>


          ${
            this.rangeHtml(
              'insX',
              'Horizontal',
              0,
              100,
              layer.x,
              '%'
            )
          }


          ${
            this.rangeHtml(
              'insY',
              'Vertical',
              0,
              100,
              layer.y,
              '%'
            )
          }


          ${
            layer.type !==
              'text'
              ? this.rangeHtml(
                  'insRotation',
                  'Rotation',
                  -180,
                  180,
                  layer.rotation ||
                  0,
                  '°'
                )
              : ''
          }


          ${
            this.rangeHtml(
              'insOpacity',
              'Opacity',
              0,
              100,
              (
                layer.opacity ??
                1
              ) *
              100,
              '%'
            )
          }


          <div class="action-grid">

            <button
              id="insResetTransform"
              type="button"
            >
              Reset Transform
            </button>

            <button
              id="insCenterCanvas"
              type="button"
            >
              Center Canvas
            </button>

          </div>

        </div>

      `;

    }



    advancedAppearanceHtml(
      layer
    ) {

      if (
        layer.blendMode ==
        null
      ) {

        layer.blendMode =
          'source-over';

      }


      const modes = [

        [
          'source-over',
          'Normal'
        ],

        [
          'multiply',
          'Multiply'
        ],

        [
          'screen',
          'Screen'
        ],

        [
          'overlay',
          'Overlay'
        ],

        [
          'soft-light',
          'Soft Light'
        ],

        [
          'hard-light',
          'Hard Light'
        ],

        [
          'difference',
          'Difference'
        ],

        [
          'lighten',
          'Lighten'
        ],

        [
          'darken',
          'Darken'
        ]

      ];


      return `

        <div class="inspector-section">

          <div class="micro-label">
            APPEARANCE
          </div>

          <h3>
            Blend
          </h3>

          <label class="field">

            <span>
              Blend Mode
            </span>

            <select id="insBlendMode">

              ${
                modes
                  .map(
                    (
                      [
                        value,
                        label
                      ]
                    ) => `

                <option
                  value="${value}"
                  ${
                    layer.blendMode ===
                      value
                      ? 'selected'
                      : ''
                  }
                >
                  ${label}
                </option>

              `
                  )
                  .join('')
              }

            </select>

          </label>

        </div>

      `;

    }



    advancedArrangeHtml() {

      return `

        <div class="inspector-section">

          <div class="micro-label">
            ALIGN
          </div>

          <h3>
            Align to Canvas
          </h3>

          <div class="align-grid">

            <button
              data-canvas-align="left"
              type="button"
            >
              Left
            </button>

            <button
              data-canvas-align="center"
              type="button"
            >
              Center
            </button>

            <button
              data-canvas-align="right"
              type="button"
            >
              Right
            </button>

            <button
              data-canvas-align="top"
              type="button"
            >
              Top
            </button>

            <button
              data-canvas-align="middle"
              type="button"
            >
              Middle
            </button>

            <button
              data-canvas-align="bottom"
              type="button"
            >
              Bottom
            </button>

          </div>

        </div>


        <div class="inspector-section">

          <div class="micro-label">
            ARRANGE
          </div>

          <h3>
            Layer Order
          </h3>

          <div class="action-grid">

            <button
              id="insBringForward"
              type="button"
            >
              Bring Forward
            </button>

            <button
              id="insSendBackward"
              type="button"
            >
              Send Backward
            </button>

            <button
              id="insDuplicate"
              type="button"
            >
              Duplicate
            </button>

            <button
              id="insDelete"
              class="danger-button"
              type="button"
            >
              Delete
            </button>

          </div>

        </div>

      `;

    }



    rangeHtml(
      id,
      label,
      min,
      max,
      value,
      suffix
    ) {

      return `

        <label class="range-field">

          <div>

            <span>
              ${label}
            </span>

            <b
              id="${id}Value"
              data-suffix="${suffix}"
            >
              ${
                Math.round(
                  Number(value)
                )
              }${suffix}
            </b>

          </div>

          <input
            id="${id}"
            type="range"
            min="${min}"
            max="${max}"
            value="${value}"
          >

        </label>

      `;

    }



    layersHtml() {

      const info = {

        text: [
          'T',
          'TEXT'
        ],

        image: [
          '▧',
          'PHOTO'
        ],

        element: [
          '◇',
          'ELEMENT'
        ]

      };


      return `

        <div class="layer-list">

          ${
            this.state.layers
              .slice()
              .reverse()
              .map(
                layer => {

                  const meta =
                    info[
                      layer.type
                    ] ||
                    [
                      '◇',
                      String(
                        layer.type ||
                        'LAYER'
                      )
                        .toUpperCase()
                    ];


                  const active =
                    layer.id ===
                    this.state.selectedId;


                  const visible =
                    layer.visible !==
                    false;


                  return `

            <div
              class="layer-row ${
                active
                  ? 'active'
                  : ''
              }"
              data-layer-row="${layer.id}"
            >

              <button
                data-layer-visible="${layer.id}"
                type="button"
                title="${
                  visible
                    ? 'Hide'
                    : 'Show'
                } layer"
              >
                ${
                  visible
                    ? '●'
                    : '○'
                }
              </button>

              <button
                class="layer-main"
                data-layer-select="${layer.id}"
                type="button"
              >

                <span class="layer-icon">
                  ${meta[0]}
                </span>

                <span>

                  <strong>
                    ${esc(layer.name || layer.type)}
                  </strong>

                  <small>
                    ${meta[1]}${
                      layer.locked
                        ? ' • LOCKED'
                        : ''
                    }
                  </small>

                </span>

              </button>

              <button
                data-layer-lock="${layer.id}"
                type="button"
                title="${
                  layer.locked
                    ? 'Unlock'
                    : 'Lock'
                } layer"
              >
                ${
                  layer.locked
                    ? '■'
                    : '□'
                }
              </button>

            </div>

          `;

                }
              )
              .join('')
          }

        </div>

      `;

    }



    bindAdvancedInspector(
      layer
    ) {

      const on =
        (
          selector,
          event,
          callback
        ) => {

          const element =
            $(selector);


          if (
            element
          ) {

            element
              .addEventListener(
                event,
                callback
              );

          }

        };


      on(
        '#quickFit',
        'click',
        () =>
          this.fitCanvas()
      );


      on(
        '#quickUndo',
        'click',
        () =>
          this.undo()
      );


      on(
        '#quickRedo',
        'click',
        () =>
          this.redo()
      );


      on(
        '#quickSafe',
        'click',
        () => {

          this.state.safeZone =
            !this.state.safeZone;


          this.safeRender();


          this.syncAllUI();


          this.renderInspector();


          this.commit();

        }
      );


      on(
        '#quickSnap',
        'click',
        () => {

          this.state.snap =
            !this.state.snap;


          this.syncAllUI();


          this.renderInspector();


          this.commit();

        }
      );


      this.bindRange(
        '#posterTextureStrength',
        value => {

          this.state.textureStrength =
            value;


          this.safeRender();

        }
      );


      on(
        '#insCanvasAccent',
        'input',
        event => {

          this.state.accent =
            event.target.value;


          this.syncBrandUI();


          this.safeRender();

        }
      );


      on(
        '#insCanvasAccent',
        'change',
        () =>
          this.commit()
      );


      on(
        '#insCanvasBackground',
        'input',
        event => {

          this.state.background =
            event.target.value;


          this.syncBrandUI();


          this.safeRender();

        }
      );


      on(
        '#insCanvasBackground',
        'change',
        () =>
          this.commit()
      );


      on(
        '#insCanvasLogo',
        'change',
        event => {

          this.state.showLogo =
            event.target.checked;


          this.syncBrandUI();


          this.safeRender();


          this.commit();

        }
      );


      on(
        '#insSnap',
        'change',
        event => {

          this.state.snap =
            event.target.checked;


          this.syncAllUI();


          this.commit();

        }
      );


      on(
        '#insSafeArea',
        'change',
        event => {

          this.state.safeZone =
            event.target.checked;


          this.syncAllUI();


          this.safeRender();


          this.commit();

        }
      );


      if (
        !layer
      ) {
        return;
      }


      on(
        '#quickDuplicate',
        'click',
        () =>
          this.duplicateSelected()
      );


      on(
        '#quickForward',
        'click',
        () =>
          this.moveSelected(
            1
          )
      );


      on(
        '#quickDelete',
        'click',
        () =>
          this.deleteSelected()
      );


      on(
        '#quickLock',
        'click',
        () => {

          layer.locked =
            !layer.locked;


          this.safeRender();


          this.renderInspector();


          this.commit();

        }
      );


      on(
        '#quickVisibility',
        'click',
        () => {

          layer.visible =
            layer.visible ===
            false;


          this.safeRender();


          this.renderInspector();


          this.commit();

        }
      );


      on(
        '#insText',
        'input',
        event => {

          layer.text =
            event.target.value;


          this.safeRender();

        }
      );


      on(
        '#insText',
        'change',
        () =>
          this.commit()
      );


      on(
        '#insFont',
        'change',
        event => {

          layer.font =
            event.target.value;


          this.safeRender();


          this.commit();

        }
      );


      on(
        '#insWeight',
        'change',
        event => {

          layer.weight =
            Number(
              event.target.value
            );


          this.safeRender();


          this.commit();

        }
      );


      this.bindRange(
        '#insSize',
        value => {

          layer.size =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insTextWidth',
        value => {

          layer.width =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insLetterSpacing',
        value => {

          layer.letterSpacing =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insLineHeight',
        value => {

          layer.lineHeight =
            value /
            100;


          this.safeRender();

        }
      );


      on(
        '#insTextColor',
        'input',
        event => {

          layer.color =
            event.target.value;


          this.safeRender();

        }
      );


      on(
        '#insTextColor',
        'change',
        () =>
          this.commit()
      );


      $$(
        '[data-text-align]'
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                () => {

                  layer.align =
                    button.dataset
                      .textAlign;


                  this.safeRender();


                  this.renderInspector();


                  this.commit();

                }
              );

          }
        );


      this.bindRange(
        '#insStrokeWidth',
        value => {

          layer.strokeWidth =
            value;


          this.safeRender();

        }
      );


      on(
        '#insStrokeColor',
        'input',
        event => {

          layer.strokeColor =
            event.target.value;


          this.safeRender();

        }
      );


      on(
        '#insStrokeColor',
        'change',
        () =>
          this.commit()
      );


      on(
        '#insShadowEnabled',
        'change',
        event => {

          layer.shadowEnabled =
            event.target.checked;


          this.safeRender();


          this.commit();

        }
      );


      this.bindRange(
        '#insShadowBlur',
        value => {

          layer.shadowBlur =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insShadowX',
        value => {

          layer.shadowX =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insShadowY',
        value => {

          layer.shadowY =
            value;


          this.safeRender();

        }
      );


      on(
        '#insShadowColor',
        'input',
        event => {

          layer.shadowColor =
            event.target.value;


          this.safeRender();

        }
      );


      on(
        '#insShadowColor',
        'change',
        () =>
          this.commit()
      );


      on(
        '#insTextBgEnabled',
        'change',
        event => {

          layer.backgroundEnabled =
            event.target.checked;


          this.safeRender();


          this.commit();

        }
      );


      on(
        '#insTextBgColor',
        'input',
        event => {

          layer.backgroundColor =
            event.target.value;


          this.safeRender();

        }
      );


      on(
        '#insTextBgColor',
        'change',
        () =>
          this.commit()
      );


      this.bindRange(
        '#insTextBgOpacity',
        value => {

          layer.backgroundOpacity =
            value /
            100;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insTextBgPadding',
        value => {

          layer.backgroundPadding =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insImageWidth',
        value => {

          layer.width =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insImageScale',
        value => {

          layer.scale =
            value /
            100;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insBrightness',
        value => {

          layer.brightness =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insContrast',
        value => {

          layer.contrast =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insSaturation',
        value => {

          layer.saturation =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insExposure',
        value => {

          layer.exposure =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insGrayscale',
        value => {

          layer.grayscale =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insSepia',
        value => {

          layer.sepia =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insBlur',
        value => {

          layer.blur =
            value;


          this.safeRender();

        }
      );


      on(
        '#insFlipX',
        'click',
        () => {

          layer.flipX =
            !layer.flipX;


          this.safeRender();


          this.commit();

        }
      );


      on(
        '#insFlipY',
        'click',
        () => {

          layer.flipY =
            !layer.flipY;


          this.safeRender();


          this.commit();

        }
      );


      on(
        '#insResetPhoto',
        'click',
        () => {

          layer.brightness =
            0;

          layer.contrast =
            0;

          layer.saturation =
            0;

          layer.exposure =
            0;

          layer.grayscale =
            0;

          layer.sepia =
            0;

          layer.blur =
            0;

          layer.flipX =
            false;

          layer.flipY =
            false;


          this.safeRender();


          this.renderInspector();


          this.commit();

        }
      );


      on(
        '#insFitPhoto',
        'click',
        () => {

          layer.width =
            70;

          layer.scale =
            1;

          layer.x =
            65;

          layer.y =
            45;


          this.safeRender();


          this.renderInspector();


          this.commit();

        }
      );


      on(
        '#insElementColor',
        'input',
        event => {

          layer.color =
            event.target.value;


          this.safeRender();

        }
      );


      on(
        '#insElementColor',
        'change',
        () =>
          this.commit()
      );


      this.bindRange(
        '#insElementScale',
        value => {

          layer.scale =
            value /
            100;


          this.safeRender();

        }
      );


      const updateX =
        value => {

          layer.x =
            clamp(
              Number(value),
              0,
              100
            );


          this.safeRender();


          this.renderInspectorValues();

        };


      const updateY =
        value => {

          layer.y =
            clamp(
              Number(value),
              0,
              100
            );


          this.safeRender();


          this.renderInspectorValues();

        };


      this.bindRange(
        '#insX',
        updateX
      );


      this.bindRange(
        '#insY',
        updateY
      );


      on(
        '#insNumberX',
        'input',
        event =>
          updateX(
            event.target.value
          )
      );


      on(
        '#insNumberX',
        'change',
        () =>
          this.commit()
      );


      on(
        '#insNumberY',
        'input',
        event =>
          updateY(
            event.target.value
          )
      );


      on(
        '#insNumberY',
        'change',
        () =>
          this.commit()
      );


      this.bindRange(
        '#insRotation',
        value => {

          layer.rotation =
            value;


          this.safeRender();

        }
      );


      this.bindRange(
        '#insOpacity',
        value => {

          layer.opacity =
            value /
            100;


          this.safeRender();

        }
      );


      on(
        '#insBlendMode',
        'change',
        event => {

          layer.blendMode =
            event.target.value;


          this.safeRender();


          this.commit();

        }
      );


      on(
        '#insResetTransform',
        'click',
        () => {

          layer.x =
            50;

          layer.y =
            50;

          layer.opacity =
            1;


          if (
            layer.type !==
            'text'
          ) {

            layer.rotation =
              0;

            layer.scale =
              1;

          }


          this.safeRender();


          this.renderInspector();


          this.commit();

        }
      );


      on(
        '#insCenterCanvas',
        'click',
        () => {

          layer.x =
            50;

          layer.y =
            50;


          this.safeRender();


          this.renderInspector();


          this.commit();

        }
      );


      $$(
        '[data-canvas-align]'
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                () => {

                  switch (
                    button.dataset
                      .canvasAlign
                  ) {

                    case 'left':

                      layer.x =
                        5;

                      break;


                    case 'center':

                      layer.x =
                        50;

                      break;


                    case 'right':

                      layer.x =
                        95;

                      break;


                    case 'top':

                      layer.y =
                        5;

                      break;


                    case 'middle':

                      layer.y =
                        50;

                      break;


                    case 'bottom':

                      layer.y =
                        95;

                      break;

                  }


                  this.safeRender();


                  this.renderInspectorValues();


                  this.commit();

                }
              );

          }
        );


      on(
        '#insBringForward',
        'click',
        () =>
          this.moveSelected(
            1
          )
      );


      on(
        '#insSendBackward',
        'click',
        () =>
          this.moveSelected(
            -1
          )
      );


      on(
        '#insDuplicate',
        'click',
        () =>
          this.duplicateSelected()
      );


      on(
        '#insDelete',
        'click',
        () =>
          this.deleteSelected()
      );

    }



    bindLayerRows() {

      $$(
        '[data-layer-select]'
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                () => {

                  this.state.selectedId =
                    button.dataset
                      .layerSelect;


                  this.safeRender();


                  this.renderInspector();

                }
              );

          }
        );


      $$(
        '[data-layer-visible]'
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                event => {

                  event.stopPropagation();


                  const layer =
                    this.state.layers
                      .find(
                        item =>
                          item.id ===
                          button.dataset
                            .layerVisible
                      );


                  if (
                    !layer
                  ) {
                    return;
                  }


                  layer.visible =
                    layer.visible ===
                    false;


                  this.safeRender();


                  this.renderInspector();


                  this.commit();

                }
              );

          }
        );


      $$(
        '[data-layer-lock]'
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                event => {

                  event.stopPropagation();


                  const layer =
                    this.state.layers
                      .find(
                        item =>
                          item.id ===
                          button.dataset
                            .layerLock
                      );


                  if (
                    !layer
                  ) {
                    return;
                  }


                  layer.locked =
                    !layer.locked;


                  this.safeRender();


                  this.renderInspector();


                  this.commit();

                }
              );

          }
        );

    }



    renderInspectorValues() {

      const layer =
        this.getSelected();


      if (
        !layer
      ) {
        return;
      }


      const setValue =
        (
          selector,
          value
        ) => {

          const element =
            $(selector);


          if (
            element
          ) {

            element.value =
              value;

          }

        };


      const setText =
        (
          selector,
          value
        ) => {

          const element =
            $(selector);


          if (
            element
          ) {

            element.textContent =
              value;

          }

        };


      setValue(
        '#insX',
        layer.x
      );


      setValue(
        '#insY',
        layer.y
      );


      setValue(
        '#insNumberX',
        Number(
          layer.x
        )
          .toFixed(
            1
          )
      );


      setValue(
        '#insNumberY',
        Number(
          layer.y
        )
          .toFixed(
            1
          )
      );


      setText(
        '#insXValue',
        `${
          Math.round(
            layer.x
          )
        }%`
      );


      setText(
        '#insYValue',
        `${
          Math.round(
            layer.y
          )
        }%`
      );

    }



    duplicateSelected() {

      const layer =
        this.getSelected();


      if (
        !layer
      ) {
        return;
      }


      const copy =
        clone(
          layer
        );


      copy.id =
        uid(
          layer.type
        );


      copy.name =
        `${layer.name} Copy`;


      copy.x =
        clamp(
          layer.x +
          2,
          0,
          100
        );


      copy.y =
        clamp(
          layer.y +
          2,
          0,
          100
        );


      delete copy._bounds;


      this.state.layers
        .push(
          copy
        );


      this.state.selectedId =
        copy.id;


      this.safeRender();


      this.renderInspector();


      this.commit();

    }



    deleteSelected() {

      const id =
        this.state.selectedId;


      if (
        !id
      ) {
        return;
      }


      this.state.layers =
        this.state.layers
          .filter(
            layer =>
              layer.id !==
              id
          );


      this.state.selectedId =
        null;


      this.safeRender();


      this.renderInspector();


      this.commit();

    }



    moveSelected(
      direction
    ) {

      const index =
        this.state.layers
          .findIndex(
            layer =>
              layer.id ===
              this.state.selectedId
          );


      if (
        index <
        0
      ) {
        return;
      }


      const target =
        clamp(
          index +
          direction,
          0,
          this.state.layers.length -
          1
        );


      if (
        target ===
        index
      ) {
        return;
      }


      const [
        layer
      ] =
        this.state.layers
          .splice(
            index,
            1
          );


      this.state.layers
        .splice(
          target,
          0,
          layer
        );


      this.safeRender();


      this.renderInspector();


      this.commit();

    }



    /* ============================================================
       HISTORY
    ============================================================ */

    snapshot() {

      return JSON.stringify({

        ...this.state,

        layers:
          this.state.layers
            .map(
              layer => {

                const copyLayer =
                  {
                    ...layer
                  };


                delete copyLayer._bounds;


                return copyLayer;

              }
            )

      });

    }



    commit() {

      const snapshot =
        this.snapshot();


      if (
        this.history[
          this.historyIndex
        ] ===
        snapshot
      ) {

        return;

      }


      this.history =
        this.history
          .slice(
            0,
            this.historyIndex +
            1
          );


      this.history
        .push(
          snapshot
        );


      if (
        this.history.length >
        80
      ) {

        this.history
          .shift();

      }


      this.historyIndex =
        this.history.length -
        1;

    }



    restoreSnapshot(
      snapshot
    ) {

      this.state =
        JSON.parse(
          snapshot
        );


      this.syncAllUI();


      this.safeRender();


      this.renderInspector();


      this.safeRenderTemplates();

    }



    undo() {

      if (
        this.historyIndex <=
        0
      ) {
        return;
      }


      this.historyIndex--;


      this.restoreSnapshot(
        this.history[
          this.historyIndex
        ]
      );

    }



    redo() {

      if (
        this.historyIndex >=
        this.history.length -
        1
      ) {
        return;
      }


      this.historyIndex++;


      this.restoreSnapshot(
        this.history[
          this.historyIndex
        ]
      );

    }



    /* ============================================================
       CANVAS
    ============================================================ */

    changeFormat(
      format
    ) {

      const definition =
        FORMATS[
          format
        ];


      if (
        !definition
      ) {
        return;
      }


      this.state.format =
        format;


      this.state.width =
        definition.width;


      this.state.height =
        definition.height;


      const dimensions =
        $('#posterDimensions');


      if (
        dimensions
      ) {

        dimensions.textContent =
          `${
            definition.width
          } × ${
            definition.height
          }`;

      }


      this.safeRender();


      this.fitCanvas();


      this.commit();

    }



    fitCanvas() {

      const stage =
        $('#posterStage');


      if (
        !stage
      ) {
        return;
      }


      const availableWidth =
        Math.max(
          100,
          stage.clientWidth -
          70
        );


      const availableHeight =
        Math.max(
          100,
          stage.clientHeight -
          60
        );


      this.state.zoom =
        Math.max(
          .10,
          Math.min(
            availableWidth /
              this.state.width,
            availableHeight /
              this.state.height,
            1
          )
        );


      this.applyZoom();


      requestAnimationFrame(
        () =>
          this.updateContextToolbar()
      );

    }



    applyZoom() {

      const zoom =
        this.state.zoom;


      this.canvas.style.width =
        `${
          this.state.width *
          zoom
        }px`;


      this.canvas.style.height =
        `${
          this.state.height *
          zoom
        }px`;


      const label =
        $('#posterZoomValue');


      if (
        label
      ) {

        label.textContent =
          `${
            Math.round(
              zoom *
              100
            )
          }%`;

      }


      requestAnimationFrame(
        () =>
          this.updateContextToolbar()
      );

    }



    /* ============================================================
       EXPORT
    ============================================================ */

    openExport() {

      $('#posterExportBackdrop')
        ?.remove();


      const modal =
        document
          .createElement(
            'div'
          );


      modal.id =
        'posterExportBackdrop';


      modal.className =
        'export-backdrop';


      modal.innerHTML =
        `

        <div class="export-dialog">

          <button
            id="posterExportClose"
            class="export-close"
            type="button"
          >
            ×
          </button>

          <div class="micro-label">
            EXPORT STUDIO
          </div>

          <h2>
            Export Poster
          </h2>

          <p>
            Export your design at full ${
              this.state.width
            } × ${
              this.state.height
            } resolution.
          </p>

          <div class="export-options">

            <button
              class="export-option"
              data-poster-export="png"
              type="button"
            >

              <strong>
                PNG
              </strong>

              <span>
                Maximum quality with crisp graphics
              </span>

            </button>

            <button
              class="export-option"
              data-poster-export="jpg"
              type="button"
            >

              <strong>
                JPG
              </strong>

              <span>
                Optimized social-media image
              </span>

            </button>

          </div>

        </div>

      `;


      document
        .body
        .appendChild(
          modal
        );


      $('#posterExportClose')
        ?.addEventListener(
          'click',
          () =>
            modal.remove()
        );


      modal
        .addEventListener(
          'click',
          event => {

            if (
              event.target ===
              modal
            ) {

              modal.remove();

            }

          }
        );


      $$(
        '[data-poster-export]',
        modal
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                () => {

                  this.download(
                    button.dataset
                      .posterExport
                  );


                  modal.remove();

                }
              );

          }
        );

    }



    download(
      format
    ) {

      try {

        this.render(
          true
        );


        const mime =
          format ===
            'jpg'
            ? 'image/jpeg'
            : 'image/png';


        const quality =
          format ===
            'jpg'
            ? .95
            : undefined;


        this.canvas
          .toBlob(
            blob => {

              if (
                !blob
              ) {

                this.safeRender();


                return;

              }


              const url =
                URL.createObjectURL(
                  blob
                );


              const link =
                document
                  .createElement(
                    'a'
                  );


              const project =
                (
                  $('#projectName')
                    ?.value ||
                  'fwcwl'
                )
                  .trim()
                  .toLowerCase()
                  .replace(
                    /[^a-z0-9]+/g,
                    '-'
                  )
                  .replace(
                    /^-|-$/g,
                    ''
                  );


              link.href =
                url;


              link.download =
                `${
                  project ||
                  'fwcwl'
                }-${
                  this.state.templateId
                }.${
                  format ===
                    'jpg'
                    ? 'jpg'
                    : 'png'
                }`;


              document
                .body
                .appendChild(
                  link
                );


              link.click();


              link.remove();


              setTimeout(
                () =>
                  URL.revokeObjectURL(
                    url
                  ),
                2000
              );


              this.safeRender();

            },
            mime,
            quality
          );

      } catch (
        error
      ) {

        console.error(
          '[FWCWL export]',
          error
        );


        this.safeRender();


        alert(
          'Could not export this poster. Please try again.'
        );

      }

    }



    reset() {

      if (
        !window.confirm(
          'Reset the current poster design?'
        )
      ) {

        return;

      }


      this.state.textureStrength =
        52;


      this.state.safeZone =
        false;


      this.state.snap =
        true;


      this.applyTemplate(
        'match-day',
        false
      );


      this.state.selectedId =
        null;


      this.syncAllUI();


      this.safeRender();


      this.renderInspector();


      this.commit();

    }



    /* ============================================================
       EVENT BINDINGS
    ============================================================ */

    bindUI() {

      $$(
        '[data-poster-tab]'
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                () => {

                  $$(
                    '[data-poster-tab]'
                  )
                    .forEach(
                      item =>
                        item.classList
                          .remove(
                            'active'
                          )
                    );


                  button.classList
                    .add(
                      'active'
                    );


                  $$('.poster-left-panel')
                    .forEach(
                      panel =>
                        panel.classList
                          .remove(
                            'active'
                          )
                    );


                  const name =
                    button.dataset
                      .posterTab;


                  const id =
                    `#poster${
                      name
                        .charAt(
                          0
                        )
                        .toUpperCase()
                    }${
                      name.slice(
                        1
                      )
                    }Panel`;


                  $(id)
                    ?.classList
                    .add(
                      'active'
                    );

                }
              );

          }
        );


      $('#posterTemplateSearch')
        ?.addEventListener(
          'input',
          event => {

            this.searchTerm =
              event.target.value;


            this.safeRenderTemplates();

          }
        );


      $$(
        '[data-filter]'
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                () => {

                  $$(
                    '[data-filter]'
                  )
                    .forEach(
                      item =>
                        item.classList
                          .remove(
                            'active'
                          )
                    );


                  button.classList
                    .add(
                      'active'
                    );


                  this.activeFilter =
                    button.dataset
                      .filter;


                  this.safeRenderTemplates();

                }
              );

          }
        );


      $('#posterUploadMediaBtn')
        ?.addEventListener(
          'click',
          () =>
            $('#posterMediaInput')
              ?.click()
        );


      $('#posterMediaInput')
        ?.addEventListener(
          'change',
          async event => {

            try {

              await this.importImages(
                event.target.files
              );

            } catch (
              error
            ) {

              console.error(
                '[FWCWL upload]',
                error
              );


              alert(
                'Could not load that image. Try PNG, JPG or WEBP.'
              );

            }


            event.target.value =
              '';

          }
        );


      $$(
        '[data-add-poster-text]'
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                () =>
                  this.addText(
                    button.dataset
                      .addPosterText
                  )
              );

          }
        );


      $$(
        '[data-add-poster-element]'
      )
        .forEach(
          button => {

            button
              .addEventListener(
                'click',
                () =>
                  this.addElement(
                    button.dataset
                      .addPosterElement
                  )
              );

          }
        );


      $('#posterCanvasSize')
        ?.addEventListener(
          'change',
          event =>
            this.changeFormat(
              event.target.value
            )
        );


      $('#posterSafeZoneBtn')
        ?.addEventListener(
          'click',
          event => {

            this.state.safeZone =
              !this.state.safeZone;


            event.currentTarget
              .classList
              .toggle(
                'active',
                this.state.safeZone
              );


            this.safeRender();


            this.renderInspector();


            this.commit();

          }
        );


      $('#posterSnapBtn')
        ?.addEventListener(
          'click',
          event => {

            this.state.snap =
              !this.state.snap;


            event.currentTarget
              .classList
              .toggle(
                'active',
                this.state.snap
              );


            this.renderInspector();


            this.commit();

          }
        );


      $('#posterFitBtn')
        ?.addEventListener(
          'click',
          () =>
            this.fitCanvas()
        );


      $('#posterZoomInBtn')
        ?.addEventListener(
          'click',
          () => {

            this.state.zoom =
              clamp(
                this.state.zoom +
                .05,
                .10,
                1.50
              );


            this.applyZoom();

          }
        );


      $('#posterZoomOutBtn')
        ?.addEventListener(
          'click',
          () => {

            this.state.zoom =
              clamp(
                this.state.zoom -
                .05,
                .10,
                1.50
              );


            this.applyZoom();

          }
        );


      $('#posterBrandName')
        ?.addEventListener(
          'input',
          event => {

            this.state.brandName =
              event.target.value;


            this.safeRender();

          }
        );


      $('#posterAccentColor')
        ?.addEventListener(
          'input',
          event => {

            this.state.accent =
              event.target.value;


            const text =
              $('#posterAccentText');


            if (
              text
            ) {

              text.value =
                event.target.value
                  .toUpperCase();

            }


            this.safeRender();

          }
        );


      $('#posterAccentText')
        ?.addEventListener(
          'change',
          event => {

            const color =
              normalizeHex(
                event.target.value
              );


            if (
              !color
            ) {

              this.syncBrandUI();


              return;

            }


            this.state.accent =
              color;


            this.syncBrandUI();


            this.safeRender();


            this.commit();

          }
        );


      $('#posterBackgroundColor')
        ?.addEventListener(
          'input',
          event => {

            this.state.background =
              event.target.value;


            const text =
              $('#posterBackgroundText');


            if (
              text
            ) {

              text.value =
                event.target.value
                  .toUpperCase();

            }


            this.safeRender();

          }
        );


      $('#posterBackgroundText')
        ?.addEventListener(
          'change',
          event => {

            const color =
              normalizeHex(
                event.target.value
              );


            if (
              !color
            ) {

              this.syncBrandUI();


              return;

            }


            this.state.background =
              color;


            this.syncBrandUI();


            this.safeRender();


            this.commit();

          }
        );


      $('#posterLogoToggle')
        ?.addEventListener(
          'change',
          event => {

            this.state.showLogo =
              event.target.checked;


            this.safeRender();


            this.renderInspector();


            this.commit();

          }
        );


      this.canvas
        .addEventListener(
          'pointerdown',
          event =>
            this.onPointerDown(
              event
            )
        );


      this.canvas
        .addEventListener(
          'pointermove',
          event =>
            this.onPointerMove(
              event
            )
        );


      window
        .addEventListener(
          'pointerup',
          () =>
            this.onPointerUp()
        );


      this.canvas
        .addEventListener(
          'dblclick',
          event => {

            const point =
              this.pointerCoordinates(
                event
              );


            const layer =
              this.hitTest(
                point.x,
                point.y
              );


            if (
              layer
            ) {

              this.state.selectedId =
                layer.id;


              this.safeRender();


              this.renderInspector();

            }

          }
        );


      $('#undoBtn')
        ?.addEventListener(
          'click',
          () =>
            this.undo()
        );


      $('#redoBtn')
        ?.addEventListener(
          'click',
          () =>
            this.redo()
        );


      $('#resetBtn')
        ?.addEventListener(
          'click',
          () =>
            this.reset()
        );


      $('#exportTopBtn')
        ?.addEventListener(
          'click',
          () =>
            this.openExport()
        );


      $('#downloadPosterBtn')
        ?.addEventListener(
          'click',
          () =>
            this.openExport()
        );


      window
        .addEventListener(
          'resize',
          () => {

            clearTimeout(
              this.resizeTimer
            );


            this.resizeTimer =
              setTimeout(
                () =>
                  this.fitCanvas(),
                80
              );

          }
        );


      $('#posterStage')
        ?.addEventListener(
          'scroll',
          () =>
            this.updateContextToolbar(),
          {
            passive:
              true
          }
        );


      document
        .addEventListener(
          'keydown',
          event =>
            this.handleKeyboard(
              event
            )
        );


      const stage =
        $('#posterStage');


      if (
        stage
      ) {

        [
          'dragenter',
          'dragover'
        ]
          .forEach(
            name => {

              stage
                .addEventListener(
                  name,
                  event => {

                    event.preventDefault();


                    stage.classList
                      .add(
                        'drag-active'
                      );

                  }
                );

            }
          );


        [
          'dragleave',
          'drop'
        ]
          .forEach(
            name => {

              stage
                .addEventListener(
                  name,
                  event => {

                    event.preventDefault();


                    stage.classList
                      .remove(
                        'drag-active'
                      );

                  }
                );

            }
          );


        stage
          .addEventListener(
            'drop',
            async event => {

              try {

                const files =
                  Array.from(
                    event.dataTransfer
                      ?.files ||
                    []
                  )
                    .filter(
                      file =>
                        file.type
                          ?.startsWith(
                            'image/'
                          )
                    );


                if (
                  !files.length
                ) {
                  return;
                }


                const before =
                  new Set(
                    this.assets.keys()
                  );


                await this.importImages(
                  files
                );


                const newest =
                  Array.from(
                    this.assets
                      .values()
                  )
                    .filter(
                      asset =>
                        !before.has(
                          asset.id
                        )
                    )
                    .pop();


                if (
                  newest
                ) {

                  this.addImageLayer(
                    newest.id
                  );

                }

              } catch (
                error
              ) {

                console.error(
                  '[FWCWL drag-drop upload]',
                  error
                );


                alert(
                  'Could not add that image.'
                );

              }

            }
          );

      }

    }



    /* ============================================================
       KEYBOARD
    ============================================================ */

    handleKeyboard(
      event
    ) {

      const workspace =
        $('#posterWorkspace');


      if (
        workspace &&
        workspace.style.display ===
          'none'
      ) {
        return;
      }


      const target =
        event.target;


      if (
        target instanceof
          HTMLInputElement ||
        target instanceof
          HTMLTextAreaElement ||
        target instanceof
          HTMLSelectElement
      ) {

        return;

      }


      const command =
        event.ctrlKey ||
        event.metaKey;


      if (
        command &&
        event.key
          .toLowerCase() ===
          'z'
      ) {

        event.preventDefault();


        event.shiftKey
          ? this.redo()
          : this.undo();


        return;

      }


      if (
        command &&
        event.key
          .toLowerCase() ===
          'y'
      ) {

        event.preventDefault();


        this.redo();


        return;

      }


      if (
        command &&
        event.key
          .toLowerCase() ===
          'd'
      ) {

        event.preventDefault();


        this.duplicateSelected();


        return;

      }


      if (
        event.key ===
          'Delete' ||
        event.key ===
          'Backspace'
      ) {

        if (
          this.state.selectedId
        ) {

          event.preventDefault();


          this.deleteSelected();

        }


        return;

      }


      const layer =
        this.getSelected();


      if (
        !layer ||
        layer.locked
      ) {
        return;
      }


      const step =
        event.shiftKey
          ? 1
          : .25;


      let changed =
        false;


      if (
        event.key ===
        'ArrowLeft'
      ) {

        layer.x =
          clamp(
            layer.x -
            step,
            0,
            100
          );


        changed =
          true;

      } else if (
        event.key ===
        'ArrowRight'
      ) {

        layer.x =
          clamp(
            layer.x +
            step,
            0,
            100
          );


        changed =
          true;

      } else if (
        event.key ===
        'ArrowUp'
      ) {

        layer.y =
          clamp(
            layer.y -
            step,
            0,
            100
          );


        changed =
          true;

      } else if (
        event.key ===
        'ArrowDown'
      ) {

        layer.y =
          clamp(
            layer.y +
            step,
            0,
            100
          );


        changed =
          true;

      }


      if (
        changed
      ) {

        event.preventDefault();


        this.safeRender();


        this.renderInspectorValues();


        this.commit();

      }

    }



    bindInput(
      selector,
      eventName,
      handler,
      commitOnChange = false
    ) {

      const element =
        $(selector);


      if (
        !element
      ) {
        return;
      }


      element
        .addEventListener(
          eventName,
          handler
        );


      if (
        commitOnChange &&
        eventName !==
          'change'
      ) {

        element
          .addEventListener(
            'change',
            () =>
              this.commit()
          );

      }

    }



    bindRange(
      selector,
      callback
    ) {

      const input =
        $(selector);


      if (
        !input
      ) {
        return;
      }


      const label =
        $(
          `${selector}Value`
        );


      input
        .addEventListener(
          'input',
          () => {

            const value =
              Number(
                input.value
              );


            callback(
              value
            );


            if (
              label
            ) {

              label.textContent =
                `${
                  Math.round(
                    value
                  )
                }${
                  label.dataset.suffix ||
                  ''
                }`;

            }

          }
        );


      input
        .addEventListener(
          'change',
          () =>
            this.commit()
        );

    }



    syncBrandUI() {

      if (
        $('#posterBrandName')
      ) {

        $('#posterBrandName')
          .value =
          this.state.brandName;

      }


      if (
        $('#posterAccentColor')
      ) {

        $('#posterAccentColor')
          .value =
          this.state.accent;

      }


      if (
        $('#posterAccentText')
      ) {

        $('#posterAccentText')
          .value =
          this.state.accent
            .toUpperCase();

      }


      if (
        $('#posterBackgroundColor')
      ) {

        $('#posterBackgroundColor')
          .value =
          this.state.background;

      }


      if (
        $('#posterBackgroundText')
      ) {

        $('#posterBackgroundText')
          .value =
          this.state.background
            .toUpperCase();

      }


      if (
        $('#posterLogoToggle')
      ) {

        $('#posterLogoToggle')
          .checked =
          this.state.showLogo;

      }

    }



    syncAllUI() {

      if (
        $('#posterCanvasSize')
      ) {

        $('#posterCanvasSize')
          .value =
          this.state.format;

      }


      $('#posterSafeZoneBtn')
        ?.classList
        .toggle(
          'active',
          this.state.safeZone
        );


      $('#posterSnapBtn')
        ?.classList
        .toggle(
          'active',
          this.state.snap
        );


      const dimensions =
        $('#posterDimensions');


      if (
        dimensions
      ) {

        dimensions.textContent =
          `${
            this.state.width
          } × ${
            this.state.height
          }`;

      }


      this.syncBrandUI();


      this.applyZoom();

    }

  }



  /* ============================================================
     BOOT
  ============================================================ */

  function boot() {

    if (
      window
        .__FWCWL_POSTER_BOOTING__
    ) {

      return;

    }


    if (
      window
        .FWCWLPosterEditor &&
      window
        .__FWCWL_POSTER_STATUS__
        ?.state ===
        'ready'
    ) {

      return;

    }


    window
      .__FWCWL_POSTER_BOOTING__ =
      true;


    setStatus(
      'booting',
      BUILD_VERSION
    );


    try {

      const editor =
        new PosterEditor();


      window
        .FWCWLPosterEditor =
        editor;


      window
        .__FWCWL_POSTER_INSTANCE__ =
        editor;

    } catch (
      error
    ) {

      showFatal(
        error?.message ||
        'Unknown initialization error.',
        error
      );

    } finally {

      window
        .__FWCWL_POSTER_BOOTING__ =
        false;

    }

  }



  /* ============================================================
     ERROR PROTECTION
  ============================================================ */

  window
    .addEventListener(
      'error',
      event => {

        if (
          !String(
            event.filename ||
            ''
          )
            .includes(
              'poster-editor'
            )
        ) {

          return;

        }


        if (
          window
            .__FWCWL_POSTER_STATUS__
            ?.state ===
            'ready'
        ) {

          console.error(
            '[FWCWL Poster runtime error]',
            event.message,
            event.error
          );


          window
            .__FWCWL_POSTER_STATUS__
            .lastError =
            event.message ||
            'unknown runtime error';


          window
            .__FWCWL_POSTER_STATUS__
            .lastErrorAt =
            Date.now();


          return;

        }


        showFatal(
          `JavaScript error: ${
            event.message ||
            'unknown error'
          }`,
          event.error
        );

      }
    );


  window
    .addEventListener(
      'unhandledrejection',
      event =>
        console.error(
          '[FWCWL Poster unhandled promise]',
          event.reason
        )
    );



  if (
    document.readyState ===
    'loading'
  ) {

    document
      .addEventListener(
        'DOMContentLoaded',
        boot,
        {
          once:
            true
        }
      );

  } else {

    boot();

  }

})();
