(() => {
  'use strict';

  /* ============================================================
     FWCWL POSTER EDITOR V10.0.0
     ------------------------------------------------------------
     SELF-CONTAINED / FAIL-SAFE BUILD

     Protects against:
     • Blank template library
     • Silent runtime failures
     • Missing required HTML IDs
     • Individual template-preview failures
     • Logo-load failures
     • Upload failures
     • Rendering exceptions
     • Stale browser cache when used with V10 index script
  ============================================================ */

  const VERSION = '10.0.0';
  const LOGO_PATH = 'assets/fwcwl-logo.jpeg';


  /* ============================================================
     HELPERS
  ============================================================ */

  const $ = (
    selector,
    root = document
  ) =>
    root.querySelector(selector);


  const $$ = (
    selector,
    root = document
  ) =>
    Array.from(
      root.querySelectorAll(selector)
    );


  const clamp = (
    value,
    min,
    max
  ) =>
    Math.min(
      max,
      Math.max(
        min,
        Number(value)
      )
    );


  const uid = prefix =>
    `${prefix}-${Date.now()
      .toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;


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

    if (!color.startsWith('#')) {
      color = `#${color}`;
    }

    return /^#[0-9a-fA-F]{6}$/.test(color)
      ? color.toUpperCase()
      : null;
  };


  const rgba = (
    hex,
    alpha
  ) => {

    let value =
      String(
        hex || '#ffffff'
      ).replace('#', '');


    if (
      value.length === 3
    ) {

      value =
        value
          .split('')
          .map(
            char =>
              char + char
          )
          .join('');
    }


    const number =
      parseInt(
        value,
        16
      );


    if (
      Number.isNaN(number)
    ) {
      return `rgba(255,255,255,${alpha})`;
    }


    return `rgba(${
      (number >> 16) & 255
    },${
      (number >> 8) & 255
    },${
      number & 255
    },${alpha})`;
  };


  const clone = object =>
    JSON.parse(
      JSON.stringify(object)
    );


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
        Math.abs(width) / 2,
        Math.abs(height) / 2
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

  const FORMATS = {

    portrait: {
      width: 1080,
      height: 1350
    },

    square: {
      width: 1080,
      height: 1080
    },

    story: {
      width: 1080,
      height: 1920
    }

  };


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
     COMPLETE CRICKET TEMPLATE LIBRARY
  ============================================================ */

  const TEMPLATES = [

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
        titleSize: 132
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
        align: 'center',
        titleSize: 122,
        titleY: 37,
        font: 'Bebas Neue'
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
        titleSize: 115
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
        titleSize: 158
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
        titleSize: 150
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
        titleSize: 142
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
        titleSize: 140
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
        titleSize: 136
      }
    ),

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
        titleSize: 148
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
        titleSize: 132
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
        titleSize: 150
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
        titleSize: 132
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
        titleSize: 126,
        titleWidth: 60
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
        titleSize: 140
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
        titleSize: 140
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
        titleSize: 152,
        texture: 1
      }
    ),

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
        titleSize: 116,
        titleWidth: 62
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
        align: 'center',
        titleSize: 220,
        font: 'Bebas Neue'
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
        titleSize: 160
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
        titleSize: 180,
        font: 'Bebas Neue'
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
        titleSize: 180,
        font: 'Bebas Neue'
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
        align: 'center',
        titleSize: 148,
        titleY: 46
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
        titleSize: 148
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
        titleSize: 148
      }
    ),

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
        align: 'center',
        titleSize: 174,
        titleY: 40
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
        align: 'center',
        titleSize: 160,
        titleY: 40
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
        titleSize: 144
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
        titleSize: 138
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
        titleSize: 150
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
        titleSize: 138
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
        titleSize: 144
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
        align: 'center',
        titleSize: 116
      }
    ),

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
        titleSize: 230
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
        titleSize: 134
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
        titleSize: 126
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
        titleSize: 162
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
        titleSize: 180
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
        titleSize: 140
      }
    ),

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
        titleSize: 160,
        texture: 1
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
        titleSize: 140,
        texture: 1
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
        titleSize: 150,
        texture: 1
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
        titleSize: 158,
        texture: 1
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
        titleSize: 138,
        texture: 1
      }
    ),

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
        titleSize: 128
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
        titleSize: 148
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
        align: 'center',
        titleSize: 118
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
        titleSize: 150
      }
    ),

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
        titleSize: 132,
        font: 'Playfair Display',
        texture: 1
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
        align: 'center',
        titleSize: 124,
        font: 'Playfair Display',
        texture: 1
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
        titleSize: 126,
        font: 'Playfair Display',
        texture: 1
      }
    ),

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
        titleSize: 158,
        font: 'Playfair Display'
      }
    )

  ];


  /* ============================================================
     REQUIRED HTML CONTRACT
  ============================================================ */

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


  function setBootState(
    state,
    detail = ''
  ) {

    document.documentElement
      .dataset
      .posterBoot =
      state;


    window.__FWCWL_POSTER_STATUS__ = {

      version:
        VERSION,

      state,

      detail,

      at:
        Date.now()

    };
  }


  function validateDOM() {

    const missing =
      REQUIRED_IDS.filter(
        id =>
          !document.getElementById(
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


  /* ============================================================
     VISIBLE FAILURE MODE
     Never leave user with an unexplained empty screen.
  ============================================================ */

  function showBootError(
    message,
    error
  ) {

    setBootState(
      'error',
      message
    );


    console.error(
      '[FWCWL Poster]',
      message,
      error || ''
    );


    const count =
      $('#posterTemplateCount');


    if (count) {
      count.textContent =
        '!';
    }


    const grid =
      $('#posterTemplateGrid');


    if (grid) {

      grid.innerHTML = `
        <div
          style="
            grid-column:1/-1;
            padding:14px;
            border:1px solid rgba(222,102,112,.28);
            border-radius:10px;
            background:rgba(222,102,112,.05);
            color:#e58b93;
            font-size:8px;
            line-height:1.5;
          "
        >

          <strong
            style="
              display:block;
              margin-bottom:5px;
              color:#ff9fa7;
            "
          >
            Poster engine could not start
          </strong>

          ${esc(message)}

          <br>

          <span
            style="color:#777d86"
          >
            Poster Editor V${VERSION}
          </span>

        </div>
      `;
    }


    const inspector =
      $('#posterInspector');


    if (inspector) {

      inspector.innerHTML = `
        <div
          class="inspector-help"
          style="color:#da7a82"
        >
          Poster Editor failed to initialize.
          ${esc(message)}
        </div>
      `;
    }
  }


  /* ============================================================
     EDITOR
  ============================================================ */

  class PosterEditor {

    constructor() {

      validateDOM();


      this.canvas =
        $('#posterCanvas');


      this.ctx =
        this.canvas.getContext(
          '2d',
          {
            alpha: false
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
          .50,

        selectedId:
          null,

        textureStrength:
          52,

        layers: []

      };


      /* ========================================================
         LOGO
      ======================================================== */

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


      /* ========================================================
         INITIALIZE
      ======================================================== */

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


      const counter =
        $('#posterTemplateCount');


      if (counter) {

        counter.textContent =
          String(
            TEMPLATES.length
          );
      }


      requestAnimationFrame(
        () =>
          this.fitCanvas()
      );


      if (
        document.fonts &&
        document.fonts.ready
      ) {

        document.fonts
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


      setBootState(
        'ready',
        `${TEMPLATES.length} templates loaded`
      );


      window.FWCWLPosterEditor =
        this;
    }


    /* ========================================================
       SAFE RENDER WRAPPERS
       One failed preview can no longer crash the whole editor.
    ======================================================== */

    safeRender() {

      try {

        this.render();

      } catch (
        error
      ) {

        console.error(
          '[FWCWL Poster Render]',
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
          '[FWCWL Poster Templates]',
          error
        );


        const grid =
          $('#posterTemplateGrid');


        if (
          grid &&
          !grid.children.length
        ) {

          grid.innerHTML = `
            <div class="empty-state">

              <strong>
                Templates unavailable
              </strong>

              <span>
                Reload after updating poster-editor.js.
              </span>

            </div>
          `;
        }
      }
    }


    /* ========================================================
       CURRENT TEMPLATE
    ======================================================== */

    currentTemplate() {

      return (
        TEMPLATES.find(
          item =>
            item.id ===
            this.state.templateId
        ) ||
        TEMPLATES[0]
      );
    }


    /* ========================================================
       TEXT LAYER FACTORY
    ======================================================== */

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

        lineHeight,

        letterSpacing,

        opacity,

        visible:
          true,

        locked:
          false
      };
    }


    /* ========================================================
       APPLY TEMPLATE
    ======================================================== */

    applyTemplate(
      id,
      save = true
    ) {

      const item =
        TEMPLATES.find(
          template =>
            template.id === id
        ) ||
        TEMPLATES[0];


      const preservedImages =
        this.state.layers.filter(
          layer =>
            layer.type ===
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
          item.titleY - 10,
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
          item.titleY + 28,
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


        ...preservedImages
      ];


      this.state.selectedId =
        null;


      this.syncBrandUI();


      this.safeRender();


      this.safeRenderTemplates();


      this.renderInspector();


      if (save) {
        this.commit();
      }
    }


    /* ========================================================
       TEMPLATE LIBRARY
    ======================================================== */

    renderTemplates() {

      const grid =
        $('#posterTemplateGrid');


      if (!grid) {
        return;
      }


      const search =
        this.searchTerm
          .trim()
          .toLowerCase();


      const filtered =
        TEMPLATES.filter(
          item => {

            const categoryMatch =
              this.activeFilter ===
                'all' ||
              item.category ===
                this.activeFilter;


            const text =
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
                text.includes(
                  search
                )
              )
            );
          }
        );


      $('#posterTemplateCount')
        .textContent =
        String(
          filtered.length
        );


      $('#posterTemplateEmpty')
        ?.classList
        .toggle(
          'hidden',
          filtered.length > 0
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
                    ${esc(
                      item.name
                    )}
                  </strong>

                  <small>
                    ${esc(
                      item.category
                    )}
                  </small>

                </div>

              </button>
            `
          )
          .join('');


      $$(
        '[data-template-id]',
        grid
      ).forEach(
        button => {

          button.addEventListener(
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

          filtered.forEach(
            item => {

              try {

                const preview =
                  $(
                    `[data-template-preview="${item.id}"]`,
                    grid
                  );


                if (!preview) {
                  return;
                }


                const context =
                  preview.getContext(
                    '2d',
                    {
                      alpha: false
                    }
                  );


                this.drawTemplatePreview(
                  context,
                  preview.width,
                  preview.height,
                  item
                );

              } catch (
                error
              ) {

                console.warn(
                  '[FWCWL Template Preview]',
                  item.id,
                  error
                );
              }
            }
          );
        }
      );
    }


    /* ========================================================
       EXACT TEMPLATE THUMBNAIL
    ======================================================== */

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
              width * .17
            ) /
            this.logo.naturalWidth,

            (
              height * .09
            ) /
            this.logo.naturalHeight
          );


        ctx.drawImage(
          this.logo,
          width * .055,
          height * .035,
          this.logo.naturalWidth *
          scale,
          this.logo.naturalHeight *
          scale
        );
      }


      const align =
        item.align;


      const x =
        align ===
          'center'
          ? width / 2
          : width * .065;


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
          width * .026
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
      ).forEach(
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
          width * .019
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
          width * .016
        }px "DM Sans"`;


      ctx.fillText(
        'FWCWL',
        width * .94,
        height * .94
      );
    }


    /* ========================================================
       MAIN POSTER RENDER
    ======================================================== */

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


      /*
       * Keep template's second background tone,
       * but make Brand Background + Accent controls functional.
       */

      const baseTemplate =
        this.currentTemplate();


      const liveTemplate = {

        ...baseTemplate,

        palette: [
          this.state.background,
          baseTemplate.palette[1],
          this.state.accent
        ]
      };


      this.drawDesignBase(
        this.ctx,
        width,
        height,
        liveTemplate,
        this.state.textureStrength
      );


      this.state.layers.forEach(
        layer => {

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
      );


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
          selected &&
          selected._bounds
        ) {

          this.drawSelection(
            this.ctx,
            selected._bounds,
            width
          );
        }
      }
    }


    /* ========================================================
       TEMPLATE BACKGROUND
    ======================================================== */

    drawDesignBase(
      ctx,
      width,
      height,
      item,
      textureStrength = 52
    ) {

      const palette =
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
        palette[0]
      );


      gradient.addColorStop(
        1,
        palette[1]
      );


      ctx.fillStyle =
        gradient;


      ctx.fillRect(
        0,
        0,
        width,
        height
      );


      const accent =
        palette[2];


      switch (
        item.style
      ) {

        case 'slash':

          this.drawSlashes(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'versus':

          this.drawVersus(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'fixture':

          this.drawFixture(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'stadium':

          this.drawStadium(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'split':

          this.drawSplit(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'lines':

          this.drawLines(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'score':

          this.drawScorePanel(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'lineup':
        case 'pitch':

          this.drawPitch(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'grid':

          this.drawGrid(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'captain':

          this.drawCaptain(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'player':

          this.drawPlayerPanel(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'award':

          this.drawAward(
            ctx,
            width,
            height,
            accent
          );

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

          this.drawResult(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'final':

          this.drawFinal(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'ticket':

          this.drawTicket(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'cards':

          this.drawCards(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'milestone':

          this.drawMilestone(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'confetti':

          this.drawConfetti(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'frame':

          this.drawFrame(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'news':

          this.drawNews(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'brutalist':

          this.drawBrutalist(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'film':

          this.drawFilm(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'grit':

          this.drawGrit(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'gold-grit':

          this.drawGoldRays(
            ctx,
            width,
            height,
            accent
          );


          this.drawGrit(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'paper':

          this.drawPaper(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'collage':

          this.drawCollage(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'stack':

          this.drawStack(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'cutout':

          this.drawCutout(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'retro':

          this.drawRetro(
            ctx,
            width,
            height,
            accent
          );

          break;


        case 'editorial':

          this.drawEditorial(
            ctx,
            width,
            height,
            accent
          );

          break;


        default:

          this.drawSlashes(
            ctx,
            width,
            height,
            accent
          );
      }


      const shade =
        ctx.createLinearGradient(
          0,
          height * .50,
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


    /* ========================================================
       TEMPLATE DECORATION METHODS
    ======================================================== */

    drawSlashes(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let i = 0;
        i < 4;
        i++
      ) {

        ctx.save();

        ctx.translate(
          width *
          (
            .55 +
            i * .10
          ),
          height * .45
        );

        ctx.rotate(
          -.25
        );

        ctx.fillStyle =
          rgba(
            accent,
            .045 +
            i * .015
          );

        ctx.fillRect(
          0,
          -height * .65,
          width * .07,
          height * 1.30
        );

        ctx.restore();
      }


      ctx.fillStyle =
        accent;


      ctx.fillRect(
        width * .07,
        height * .82,
        width * .12,
        height * .004
      );
    }


    drawVersus(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.fillStyle =
        'rgba(84,12,22,.38)';


      ctx.beginPath();

      ctx.moveTo(
        width * .52,
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
        width * .40,
        height
      );

      ctx.closePath();

      ctx.fill();


      ctx.strokeStyle =
        rgba(
          accent,
          .34
        );

      ctx.lineWidth =
        width * .008;


      ctx.beginPath();

      ctx.arc(
        width * .50,
        height * .44,
        width * .17,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }


    drawFixture(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.strokeStyle =
        'rgba(255,255,255,.045)';

      ctx.lineWidth =
        2;


      for (
        let y =
          height * .16;
        y < height;
        y +=
          height * .055
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
        rgba(
          accent,
          .10
        );


      ctx.fillRect(
        width * .70,
        height * .17,
        width * .20,
        height * .19
      );
    }


    drawStadium(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let i = 0;
        i < 7;
        i++
      ) {

        const x =
          width *
          (
            .08 +
            i * .14
          );


        const beam =
          ctx.createLinearGradient(
            x,
            0,
            width / 2,
            height * .75
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
          x - width * .018,
          0
        );

        ctx.lineTo(
          x + width * .018,
          0
        );

        ctx.lineTo(
          width / 2,
          height * .76
        );

        ctx.closePath();

        ctx.fill();
      }


      ctx.strokeStyle =
        rgba(
          accent,
          .25
        );


      ctx.lineWidth =
        width * .003;


      ctx.beginPath();

      ctx.ellipse(
        width / 2,
        height * .87,
        width * .36,
        height * .065,
        0,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }


    drawSplit(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.fillStyle =
        rgba(
          accent,
          .08
        );


      ctx.beginPath();

      ctx.moveTo(
        width * .67,
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
        width * .42,
        height
      );

      ctx.closePath();

      ctx.fill();
    }


    drawLines(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let i = 0;
        i < 8;
        i++
      ) {

        ctx.strokeStyle =
          rgba(
            accent,
            .035 +
            i * .005
          );


        ctx.lineWidth =
          width * .003;


        ctx.beginPath();

        ctx.moveTo(
          width *
          (
            .58 +
            i * .04
          ),
          0
        );

        ctx.lineTo(
          width *
          (
            .35 +
            i * .05
          ),
          height
        );

        ctx.stroke();
      }
    }


    drawScorePanel(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.fillStyle =
        'rgba(0,0,0,.20)';


      roundRectPath(
        ctx,
        width * .08,
        height * .25,
        width * .84,
        height * .40,
        width * .026
      );


      ctx.fill();


      ctx.strokeStyle =
        rgba(
          accent,
          .26
        );


      ctx.lineWidth =
        width * .003;


      ctx.stroke();
    }


    drawPitch(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.strokeStyle =
        rgba(
          accent,
          .18
        );


      ctx.lineWidth =
        width * .003;


      ctx.strokeRect(
        width * .62,
        height * .18,
        width * .25,
        height * .52
      );


      ctx.beginPath();

      ctx.arc(
        width * .745,
        height * .44,
        width * .06,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }


    drawGrid(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let row = 0;
        row < 4;
        row++
      ) {

        for (
          let col = 0;
          col < 3;
          col++
        ) {

          ctx.fillStyle =
            (
              row === 0 &&
              col === 0
            )
              ? rgba(
                  accent,
                  .15
                )
              : 'rgba(255,255,255,.025)';


          roundRectPath(
            ctx,
            width *
            (
              .59 +
              col * .105
            ),
            height *
            (
              .43 +
              row * .07
            ),
            width * .09,
            height * .05,
            width * .008
          );


          ctx.fill();
        }
      }
    }


    drawCaptain(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.strokeStyle =
        rgba(
          accent,
          .28
        );


      ctx.lineWidth =
        width * .006;


      ctx.beginPath();

      ctx.moveTo(
        width * .68,
        height * .26
      );

      ctx.lineTo(
        width * .77,
        height * .19
      );

      ctx.lineTo(
        width * .87,
        height * .26
      );

      ctx.lineTo(
        width * .82,
        height * .39
      );

      ctx.lineTo(
        width * .72,
        height * .39
      );

      ctx.closePath();

      ctx.stroke();
    }


    drawPlayerPanel(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.fillStyle =
        'rgba(255,255,255,.025)';


      roundRectPath(
        ctx,
        width * .61,
        height * .18,
        width * .30,
        height * .52,
        width * .025
      );


      ctx.fill();


      ctx.strokeStyle =
        rgba(
          accent,
          .30
        );


      ctx.lineWidth =
        width * .006;


      ctx.beginPath();

      ctx.arc(
        width * .76,
        height * .37,
        width * .15,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }


    drawAward(
      ctx,
      width,
      height,
      accent
    ) {

      this.drawPlayerPanel(
        ctx,
        width,
        height,
        accent
      );


      ctx.fillStyle =
        rgba(
          accent,
          .12
        );


      ctx.font =
        `400 ${
          width * .18
        }px "Bebas Neue"`;


      ctx.fillText(
        '01',
        width * .61,
        height * .65
      );
    }


    drawGoldRays(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let i = 0;
        i < 18;
        i++
      ) {

        ctx.save();

        ctx.translate(
          width / 2,
          height * .43
        );

        ctx.rotate(
          i /
          18 *
          Math.PI *
          2
        );


        ctx.fillStyle =
          rgba(
            accent,
            i % 2
              ? .025
              : .055
          );


        ctx.fillRect(
          width * .13,
          -width * .008,
          width * .34,
          width * .016
        );


        ctx.restore();
      }
    }


    drawResult(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.fillStyle =
        rgba(
          accent,
          .08
        );


      ctx.fillRect(
        width * .68,
        0,
        width * .32,
        height
      );


      ctx.strokeStyle =
        rgba(
          accent,
          .25
        );


      ctx.lineWidth =
        width * .003;


      ctx.strokeRect(
        width * .05,
        height * .06,
        width * .90,
        height * .88
      );
    }


    drawFinal(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.strokeStyle =
        rgba(
          accent,
          .42
        );


      ctx.lineWidth =
        width * .003;


      ctx.strokeRect(
        width * .04,
        height * .025,
        width * .92,
        height * .95
      );


      this.drawGoldRays(
        ctx,
        width,
        height,
        accent
      );
    }


    drawTicket(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let i = 0;
        i < 7;
        i++
      ) {

        ctx.fillStyle =
          i % 2
            ? 'rgba(255,255,255,.018)'
            : rgba(
                accent,
                .035
              );


        ctx.fillRect(
          width *
          (
            .60 +
            i * .042
          ),
          height * .17,
          width * .024,
          height * .58
        );
      }
    }


    drawCards(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let i = 0;
        i < 3;
        i++
      ) {

        ctx.save();

        ctx.translate(
          width *
          (
            .67 +
            i * .055
          ),
          height *
          (
            .34 +
            i * .06
          )
        );

        ctx.rotate(
          (
            i - 1
          ) *
          .09
        );


        ctx.fillStyle =
          i === 1
            ? rgba(
                accent,
                .10
              )
            : 'rgba(255,255,255,.025)';


        roundRectPath(
          ctx,
          -width * .11,
          -height * .13,
          width * .22,
          height * .26,
          width * .015
        );


        ctx.fill();

        ctx.restore();
      }
    }


    drawMilestone(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.strokeStyle =
        rgba(
          accent,
          .25
        );


      ctx.lineWidth =
        width * .013;


      ctx.beginPath();

      ctx.arc(
        width * .76,
        height * .39,
        width * .15,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }


    drawConfetti(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let i = 0;
        i < 34;
        i++
      ) {

        const x =
          Math.abs(
            Math.sin(
              i * 81.17
            )
          ) *
          width;


        const y =
          Math.abs(
            Math.sin(
              i * 13.71
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
          i % 3 === 0
            ? '#ffffff'
            : accent;


        ctx.globalAlpha =
          .18;


        ctx.fillRect(
          -width * .004,
          -width * .011,
          width * .008,
          width * .022
        );


        ctx.restore();
      }
    }


    drawFrame(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.strokeStyle =
        rgba(
          accent,
          .30
        );


      ctx.lineWidth =
        width * .003;


      ctx.strokeRect(
        width * .05,
        height * .04,
        width * .90,
        height * .92
      );


      ctx.strokeStyle =
        'rgba(255,255,255,.05)';


      ctx.strokeRect(
        width * .61,
        height * .25,
        width * .28,
        height * .31
      );
    }


    drawNews(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let x =
          -width * .1;
        x <
          width * 1.2;
        x +=
          width * .12
      ) {

        ctx.save();

        ctx.translate(
          x,
          height * .73
        );

        ctx.rotate(
          -.28
        );


        ctx.fillStyle =
          rgba(
            accent,
            .10
          );


        ctx.fillRect(
          0,
          -height * .18,
          width * .033,
          height * .36
        );


        ctx.restore();
      }
    }


    drawBrutalist(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.fillStyle =
        rgba(
          accent,
          .10
        );


      ctx.beginPath();

      ctx.moveTo(
        width * .56,
        0
      );

      ctx.lineTo(
        width,
        0
      );

      ctx.lineTo(
        width * .78,
        height
      );

      ctx.lineTo(
        width * .35,
        height
      );

      ctx.closePath();

      ctx.fill();
    }


    drawFilm(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.fillStyle =
        'rgba(255,225,185,.035)';


      ctx.fillRect(
        width * .55,
        0,
        width * .10,
        height
      );


      ctx.fillStyle =
        rgba(
          accent,
          .06
        );


      ctx.fillRect(
        width * .68,
        0,
        width * .20,
        height
      );
    }


    drawGrit(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.fillStyle =
        rgba(
          accent,
          .08
        );


      ctx.beginPath();

      ctx.moveTo(
        width * .65,
        0
      );

      ctx.lineTo(
        width,
        0
      );

      ctx.lineTo(
        width * .84,
        height
      );

      ctx.lineTo(
        width * .44,
        height
      );

      ctx.closePath();

      ctx.fill();
    }


    drawPaper(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.fillStyle =
        'rgba(255,255,255,.08)';


      ctx.fillRect(
        width * .57,
        0,
        width * .18,
        height
      );


      ctx.fillStyle =
        rgba(
          accent,
          .09
        );


      ctx.fillRect(
        0,
        height * .82,
        width,
        height * .04
      );
    }


    drawCollage(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let i = 0;
        i < 3;
        i++
      ) {

        ctx.save();

        ctx.translate(
          width *
          (
            .65 +
            i * .07
          ),
          height *
          (
            .38 +
            i * .045
          )
        );

        ctx.rotate(
          (
            i - 1
          ) *
          .08
        );


        ctx.fillStyle =
          i === 1
            ? rgba(
                accent,
                .12
              )
            : 'rgba(255,255,255,.035)';


        ctx.fillRect(
          -width * .12,
          -height * .16,
          width * .24,
          height * .32
        );


        ctx.restore();
      }
    }


    drawStack(
      ctx,
      width,
      height,
      accent
    ) {

      for (
        let i = 0;
        i < 4;
        i++
      ) {

        ctx.fillStyle =
          rgba(
            accent,
            .025 +
            i * .022
          );


        ctx.fillRect(
          width *
          (
            .53 +
            i * .055
          ),
          height *
          (
            .12 +
            i * .06
          ),
          width * .31,
          height * .58
        );
      }
    }


    drawCutout(
      ctx,
      width,
      height,
      accent
    ) {

      const glow =
        ctx.createRadialGradient(
          width * .75,
          height * .38,
          0,
          width * .75,
          height * .38,
          width * .35
        );


      glow.addColorStop(
        0,
        rgba(
          accent,
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
    }


    drawRetro(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.strokeStyle =
        rgba(
          accent,
          .32
        );


      ctx.lineWidth =
        width * .006;


      ctx.strokeRect(
        width * .045,
        height * .04,
        width * .91,
        height * .92
      );


      ctx.fillStyle =
        'rgba(255,255,255,.05)';


      ctx.fillRect(
        width * .60,
        0,
        width * .08,
        height
      );
    }


    drawEditorial(
      ctx,
      width,
      height,
      accent
    ) {

      ctx.fillStyle =
        'rgba(255,255,255,.14)';


      ctx.fillRect(
        width * .64,
        0,
        width * .36,
        height
      );


      ctx.fillStyle =
        rgba(
          accent,
          .10
        );


      ctx.fillRect(
        0,
        height * .75,
        width,
        height * .015
      );
    }


    /* ========================================================
       TEXTURE
    ======================================================== */

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
        amount <= 0
      ) {
        return;
      }


      ctx.save();


      ctx.globalAlpha =
        .025 +
        amount * .12;


      const count =
        Math.round(
          180 +
          amount * 520
        );


      for (
        let i = 0;
        i < count;
        i++
      ) {

        const x =
          Math.abs(
            Math.sin(
              i * 128.73
            )
          ) *
          width;


        const y =
          Math.abs(
            Math.sin(
              i * 43.17
            )
          ) *
          height;


        const size =
          1 +
          Math.abs(
            Math.sin(
              i * 5.7
            )
          ) *
          3;


        ctx.fillStyle =
          i % 3
            ? '#000000'
            : '#ffffff';


        ctx.fillRect(
          x,
          y,
          size,
          size
        );
      }


      ctx.restore();
    }


    /* ========================================================
       DRAW LAYER
    ======================================================== */

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


    /* ========================================================
       TEXT LAYER
    ======================================================== */

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
        layer.size *
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
          layer.width /
          100
        );


      ctx.save();


      ctx.globalAlpha =
        layer.opacity ??
        1;


      ctx.fillStyle =
        layer.color ||
        '#ffffff';


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
        layer.align ||
        'left';


      ctx.textBaseline =
        'top';


      ctx.shadowColor =
        'rgba(0,0,0,.42)';


      ctx.shadowBlur =
        fontSize *
        .08;


      ctx.shadowOffsetY =
        fontSize *
        .035;


      const lines =
        this.wrapText(
          ctx,
          layer.text,
          maxWidth
        );


      const lineHeight =
        fontSize *
        (
          layer.lineHeight ||
          1
        );


      lines.forEach(
        (
          line,
          index
        ) => {

          this.fillTrackedText(
            ctx,
            line,
            x,
            y +
            index *
            lineHeight,
            layer.letterSpacing ||
            0,
            layer.align ||
            'left'
          );
        }
      );


      let left =
        x;


      if (
        layer.align ===
        'center'
      ) {

        left =
          x -
          maxWidth / 2;

      } else if (
        layer.align ===
        'right'
      ) {

        left =
          x -
          maxWidth;
      }


      layer._bounds = {

        x:
          left,

        y,

        width:
          maxWidth,

        height:
          Math.max(
            lineHeight,
            lines.length *
            lineHeight
          )
      };


      ctx.restore();
    }


    /* ========================================================
       PHOTO LAYER
    ======================================================== */

    drawImageLayer(
      ctx,
      layer,
      width,
      height
    ) {

      const asset =
        this.assets.get(
          layer.assetId
        );


      if (
        !asset ||
        !asset.image
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
          layer.width /
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
          layer.rotation ||
          0
        ) *
        Math.PI /
        180
      );


      ctx.globalAlpha =
        layer.opacity ??
        1;


      ctx.filter =
        `brightness(${
          100 +
          (
            layer.brightness ||
            0
          )
        }%) contrast(${
          100 +
          (
            layer.contrast ||
            0
          )
        }%) saturate(${
          100 +
          (
            layer.saturation ||
            0
          )
        }%) blur(${
          layer.blur ||
          0
        }px)`;


      ctx.drawImage(
        image,
        -boxWidth / 2,
        -boxHeight / 2,
        boxWidth,
        boxHeight
      );


      layer._bounds = {

        x:
          centerX -
          boxWidth / 2,

        y:
          centerY -
          boxHeight / 2,

        width:
          boxWidth,

        height:
          boxHeight
      };


      ctx.restore();
    }


    /* ========================================================
       GRAPHIC ELEMENT LAYER
    ======================================================== */

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
          layer.rotation ||
          0
        ) *
        Math.PI /
        180
      );

      ctx.scale(
        scale,
        scale
      );

      ctx.globalAlpha =
        layer.opacity ??
        1;


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


      const base =
        layer.kind ===
        'frame'
          ? 320
          : 190;


      layer._bounds = {

        x:
          x -
          base *
          scale /
          2,

        y:
          y -
          base *
          scale /
          2,

        width:
          base *
          scale,

        height:
          base *
          scale
      };


      ctx.restore();
    }


    /* ========================================================
       CRICKET ELEMENTS
    ======================================================== */

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
        Math.PI * 2
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
        Math.PI * 2
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
      ].forEach(
        x => {

          roundRectPath(
            ctx,
            x - 7,
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
        Math.PI * 2
      );

      ctx.fill();

      ctx.stroke();


      ctx.fillStyle =
        '#ffffff';


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
        '#ffffff';


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


    /* ========================================================
       OFFICIAL BRAND
    ======================================================== */

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
                width * .12
              ) /
              this.logo.naturalWidth,

              (
                height * .07
              ) /
              this.logo.naturalHeight
            );


          ctx.save();


          ctx.shadowColor =
            'rgba(0,0,0,.48)';


          ctx.shadowBlur =
            width * .012;


          ctx.drawImage(
            this.logo,
            width * .052,
            height * .032,
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
              width * .032
            }px "Montserrat"`;


          ctx.fillText(
            'FWCWL',
            width * .055,
            height * .045
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
          width * .014
        }px "DM Sans"`;


      ctx.fillText(
        this.state.brandName ||
        'FWCWL',
        width * .94,
        height * .955
      );


      ctx.restore();
    }


    /* ========================================================
       SAFE AREA
    ======================================================== */

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
        width * .002;


      ctx.setLineDash([
        width * .010,
        width * .007
      ]);


      ctx.strokeRect(
        width * .055,
        height * .055,
        width * .89,
        height * .89
      );


      ctx.restore();
    }


    /* ========================================================
       SELECTION OUTLINE
    ======================================================== */

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
          width * .002
        );


      ctx.setLineDash([
        width * .007,
        width * .005
      ]);


      ctx.strokeRect(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height
      );


      ctx.setLineDash([]);


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

      ].forEach(
        point => {

          ctx.fillStyle =
            this.state.accent;


          ctx.beginPath();

          ctx.arc(
            point[0],
            point[1],
            width * .006,
            0,
            Math.PI * 2
          );

          ctx.fill();
        }
      );


      ctx.restore();
    }


    /* ========================================================
       TEXT WRAPPING
    ======================================================== */

    wrapText(
      ctx,
      text,
      maxWidth
    ) {

      const result =
        [];


      String(
        text || ''
      )
        .split('\n')
        .forEach(
          paragraph => {

            if (!paragraph) {

              result.push('');

              return;
            }


            let current =
              '';


            paragraph
              .split(/\s+/)
              .forEach(
                word => {

                  const test =
                    current
                      ? `${current} ${word}`
                      : word;


                  if (
                    ctx.measureText(
                      test
                    ).width >
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


    fillTrackedText(
      ctx,
      text,
      x,
      y,
      spacing,
      align
    ) {

      if (!spacing) {

        ctx.fillText(
          text,
          x,
          y
        );

        return;
      }


      const chars =
        [...text];


      const widths =
        chars.map(
          char =>
            ctx.measureText(
              char
            ).width
        );


      const total =
        widths.reduce(
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


      chars.forEach(
        (
          char,
          index
        ) => {

          ctx.fillText(
            char,
            cursor,
            y
          );


          cursor +=
            widths[index] +
            spacing;
        }
      );


      ctx.textAlign =
        oldAlign;
    }


    /* ========================================================
       SELECTION / HIT TEST
    ======================================================== */

    getSelected() {

      return (
        this.state.layers.find(
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
        index >= 0;
        index--
      ) {

        const layer =
          this.state.layers[
            index
          ];


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
          x >= bounds.x &&
          x <=
            bounds.x +
            bounds.width &&
          y >= bounds.y &&
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


      if (!layer) {

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
        .setPointerCapture
        ?.(
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
          point.x -
          this.dragState.startX
        ) /
        this.state.width *
        100;


      let y =
        this.dragState.originalY +
        (
          point.y -
          this.dragState.startY
        ) /
        this.state.height *
        100;


      if (
        this.state.snap
      ) {

        x =
          Math.round(
            x * 2
          ) /
          2;


        y =
          Math.round(
            y * 2
          ) /
          2;
      }


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
    }


    onPointerUp() {

      if (
        !this.dragState
      ) {
        return;
      }


      this.dragState =
        null;


      this.commit();
    }


    /* ========================================================
       MEDIA
    ======================================================== */

    async importImages(
      files
    ) {

      for (
        const file of
        Array.from(
          files || []
        )
      ) {

        if (
          !file.type
            .startsWith(
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
          uid('asset');


        this.assets.set(
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


      if (!grid) {
        return;
      }


      const assets =
        Array.from(
          this.assets.values()
        );


      if (
        !assets.length
      ) {

        grid.innerHTML = `
          <div class="empty-state">

            <strong>
              No uploaded media
            </strong>

            <span>
              Upload a player or match photo.
            </span>

          </div>
        `;

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
                  ${esc(
                    asset.name
                  )}
                </strong>

              </button>
            `
          )
          .join('');


      $$(
        '[data-poster-asset]',
        grid
      ).forEach(
        button => {

          button.addEventListener(
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
        this.assets.get(
          assetId
        );


      if (!asset) {
        return;
      }


      const layer = {

        id:
          uid('image'),

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

        blur:
          0,

        visible:
          true,

        locked:
          false
      };


      this.state.layers.push(
        layer
      );


      this.state.selectedId =
        layer.id;


      this.safeRender();


      this.renderInspector();


      this.commit();
    }


    /* ========================================================
       ADD TEXT
    ======================================================== */

    addText(
      type
    ) {

      const headline =
        type ===
        'headline';


      const layer = {

        id:
          uid('text'),

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

        visible:
          true,

        locked:
          false
      };


      this.state.layers.push(
        layer
      );


      this.state.selectedId =
        layer.id;


      this.safeRender();


      this.renderInspector();


      this.commit();
    }


    /* ========================================================
       ADD GRAPHIC
    ======================================================== */

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
          uid('element'),

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

        visible:
          true,

        locked:
          false
      };


      this.state.layers.push(
        layer
      );


      this.state.selectedId =
        layer.id;


      this.safeRender();


      this.renderInspector();


      this.commit();
    }


    /* ========================================================
       INSPECTOR
    ======================================================== */

    renderInspector() {

      const container =
        $('#posterInspector');


      if (!container) {
        return;
      }


      const layer =
        this.getSelected();


      if (!layer) {

        $('#posterInspectorTitle')
          .textContent =
          'Edit Design';


        $('#posterInspectorType')
          .textContent =
          'CANVAS';


        container.innerHTML = `
          <div class="inspector-section">

            <div class="micro-label">
              DESIGN
            </div>

            <h3>
              Canvas Settings
            </h3>


            ${this.rangeHtml(
              'posterTextureStrength',
              'Texture Strength',
              0,
              100,
              this.state.textureStrength,
              '%'
            )}


            <label class="field">

              <span>
                Accent Color
              </span>

              <input
                id="insCanvasAccent"
                type="color"
                value="${this.state.accent}"
              >

            </label>


            <label class="switch-row">

              <div>

                <strong>
                  Official FWCWL Logo
                </strong>

                <span>
                  Keep league branding visible
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
              LAYERS
            </div>

            <h3>
              ${
                this.state.layers
                  .length
              } Design Layers
            </h3>

            ${this.layersHtml()}

          </div>


          <div class="inspector-help">

            Select a text layer, photo or cricket element
            from the canvas or Layers panel.

            Drag selected objects directly on the poster.
            Use Properties for typography, positioning,
            scale, opacity, photo adjustments, ordering
            and layer management.

          </div>
        `;


        this.bindCanvasInspector();


        this.bindLayerRows();


        return;
      }


      $('#posterInspectorTitle')
        .textContent =
        layer.name ||
        'Selected Layer';


      $('#posterInspectorType')
        .textContent =
        layer.type
          .toUpperCase();


      if (
        layer.type ===
        'text'
      ) {

        container.innerHTML =
          this.textInspectorHtml(
            layer
          );


        this.bindTextInspector(
          layer
        );

      } else if (
        layer.type ===
        'image'
      ) {

        container.innerHTML =
          this.imageInspectorHtml(
            layer
          );


        this.bindImageInspector(
          layer
        );

      } else {

        container.innerHTML =
          this.elementInspectorHtml(
            layer
          );


        this.bindElementInspector(
          layer
        );
      }
    }


    bindCanvasInspector() {

      this.bindRange(
        '#posterTextureStrength',
        value => {

          this.state.textureStrength =
            value;


          this.safeRender();
        }
      );


      this.bindInput(
        '#insCanvasAccent',
        'input',
        event => {

          this.state.accent =
            event.target.value;


          this.syncBrandUI();


          this.safeRender();
        },
        true
      );


      $('#insCanvasLogo')
        ?.addEventListener(
          'change',
          event => {

            this.state.showLogo =
              event.target.checked;


            this.syncBrandUI();


            this.safeRender();


            this.commit();
          }
        );
    }


    /* ========================================================
       LAYERS
    ======================================================== */

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

          ${this.state.layers
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
                    ).toUpperCase()
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
                          ${esc(
                            layer.name ||
                            layer.type
                          )}
                        </strong>

                        <small>
                          ${
                            meta[1]
                          }${
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
            .join('')}

        </div>
      `;
    }


    /* ========================================================
       TEXT INSPECTOR
    ======================================================== */

    textInspectorHtml(
      layer
    ) {

      return `
        <div class="inspector-section">

          <div class="micro-label">
            CONTENT
          </div>

          <h3>
            Text Content
          </h3>


          <label class="field">

            <span>
              Text
            </span>

            <textarea
              id="insText"
            >${esc(
              layer.text
            )}</textarea>

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

                ${[
                  'Montserrat',
                  'Bebas Neue',
                  'DM Sans',
                  'Poppins',
                  'Playfair Display'
                ]
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
                  .join('')}

              </select>

            </label>


            <label class="field">

              <span>
                Weight
              </span>

              <select id="insWeight">

                ${[
                  400,
                  500,
                  600,
                  700,
                  800,
                  900
                ]
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
                  .join('')}

              </select>

            </label>

          </div>


          ${this.rangeHtml(
            'insSize',
            'Font Size',
            12,
            280,
            layer.size,
            ''
          )}


          ${this.rangeHtml(
            'insTextWidth',
            'Text Width',
            15,
            95,
            layer.width,
            '%'
          )}


          ${this.rangeHtml(
            'insLetterSpacing',
            'Letter Spacing',
            -5,
            30,
            layer.letterSpacing ||
            0,
            ''
          )}


          ${this.rangeHtml(
            'insLineHeight',
            'Line Height',
            60,
            180,
            (
              layer.lineHeight ||
              1
            ) *
            100,
            '%'
          )}


          <label class="field">

            <span>
              Color
            </span>

            <input
              id="insTextColor"
              type="color"
              value="${
                String(
                  layer.color
                ).startsWith('#')
                  ? layer.color
                  : '#ffffff'
              }"
            >

          </label>


          <div class="segmented">

            ${[
              'left',
              'center',
              'right'
            ]
              .map(
                align => `
                  <button
                    class="${
                      layer.align ===
                      align
                        ? 'active'
                        : ''
                    }"
                    data-text-align="${align}"
                    type="button"
                  >
                    ${align}
                  </button>
                `
              )
              .join('')}

          </div>

        </div>


        ${this.transformInspectorHtml(
          layer
        )}


        ${this.layerActionsHtml()}
      `;
    }


    /* ========================================================
       PHOTO INSPECTOR
    ======================================================== */

    imageInspectorHtml(
      layer
    ) {

      return `
        <div class="inspector-section">

          <div class="micro-label">
            PHOTO
          </div>

          <h3>
            ${esc(
              layer.name
            )}
          </h3>


          ${this.rangeHtml(
            'insImageWidth',
            'Photo Width',
            10,
            120,
            layer.width,
            '%'
          )}


          ${this.rangeHtml(
            'insImageScale',
            'Scale',
            20,
            300,
            (
              layer.scale ||
              1
            ) *
            100,
            '%'
          )}

        </div>


        ${this.transformInspectorHtml(
          layer
        )}


        <div class="inspector-section">

          <div class="micro-label">
            ADJUST
          </div>

          <h3>
            Photo Adjustments
          </h3>


          ${this.rangeHtml(
            'insBrightness',
            'Brightness',
            -100,
            100,
            layer.brightness ||
            0,
            ''
          )}


          ${this.rangeHtml(
            'insContrast',
            'Contrast',
            -100,
            100,
            layer.contrast ||
            0,
            ''
          )}


          ${this.rangeHtml(
            'insSaturation',
            'Saturation',
            -100,
            100,
            layer.saturation ||
            0,
            ''
          )}


          ${this.rangeHtml(
            'insBlur',
            'Blur',
            0,
            20,
            layer.blur ||
            0,
            ''
          )}

        </div>


        ${this.layerActionsHtml()}
      `;
    }


    /* ========================================================
       ELEMENT INSPECTOR
    ======================================================== */

    elementInspectorHtml(
      layer
    ) {

      return `
        <div class="inspector-section">

          <div class="micro-label">
            CRICKET ELEMENT
          </div>

          <h3>
            ${esc(
              layer.name
            )}
          </h3>


          <label class="field">

            <span>
              Element Color
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

        </div>


        ${this.transformInspectorHtml(
          layer
        )}


        ${this.layerActionsHtml()}
      `;
    }


    /* ========================================================
       TRANSFORM
    ======================================================== */

    transformInspectorHtml(
      layer
    ) {

      return `
        <div class="inspector-section">

          <div class="micro-label">
            TRANSFORM
          </div>

          <h3>
            Position & Size
          </h3>


          ${this.rangeHtml(
            'insX',
            'Horizontal',
            0,
            100,
            layer.x,
            '%'
          )}


          ${this.rangeHtml(
            'insY',
            'Vertical',
            0,
            100,
            layer.y,
            '%'
          )}


          ${
            layer.type ===
            'element'
              ? this.rangeHtml(
                  'insScale',
                  'Scale',
                  20,
                  300,
                  (
                    layer.scale ||
                    1
                  ) *
                  100,
                  '%'
                )
              : ''
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


          ${this.rangeHtml(
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
          )}

        </div>
      `;
    }


    /* ========================================================
       ARRANGE
    ======================================================== */

    layerActionsHtml() {

      return `
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


        <div class="inspector-section">

          <div class="micro-label">
            LAYERS
          </div>

          <h3>
            ${
              this.state.layers
                .length
            } Design Layers
          </h3>

          ${this.layersHtml()}

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
              ${Math.round(
                Number(value)
              )}${suffix}
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


    /* ========================================================
       INSPECTOR BINDINGS
    ======================================================== */

    bindTextInspector(
      layer
    ) {

      this.bindInput(
        '#insText',
        'input',
        event => {

          layer.text =
            event.target.value;


          this.safeRender();
        },
        true
      );


      this.bindInput(
        '#insFont',
        'change',
        event => {

          layer.font =
            event.target.value;


          this.safeRender();


          this.commit();
        }
      );


      this.bindInput(
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


      this.bindInput(
        '#insTextColor',
        'input',
        event => {

          layer.color =
            event.target.value;


          this.safeRender();
        },
        true
      );


      $$(
        '[data-text-align]'
      ).forEach(
        button => {

          button.addEventListener(
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


      this.bindTransformInspector(
        layer
      );


      this.bindLayerActions();


      this.bindLayerRows();
    }


    bindImageInspector(
      layer
    ) {

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
        '#insBlur',
        value => {

          layer.blur =
            value;


          this.safeRender();
        }
      );


      this.bindTransformInspector(
        layer
      );


      this.bindLayerActions();


      this.bindLayerRows();
    }


    bindElementInspector(
      layer
    ) {

      this.bindInput(
        '#insElementColor',
        'input',
        event => {

          layer.color =
            event.target.value;


          this.safeRender();
        },
        true
      );


      this.bindTransformInspector(
        layer
      );


      this.bindLayerActions();


      this.bindLayerRows();
    }


    bindTransformInspector(
      layer
    ) {

      this.bindRange(
        '#insX',
        value => {

          layer.x =
            value;


          this.safeRender();
        }
      );


      this.bindRange(
        '#insY',
        value => {

          layer.y =
            value;


          this.safeRender();
        }
      );


      if (
        $('#insScale')
      ) {

        this.bindRange(
          '#insScale',
          value => {

            layer.scale =
              value /
              100;


            this.safeRender();
          }
        );
      }


      if (
        $('#insRotation')
      ) {

        this.bindRange(
          '#insRotation',
          value => {

            layer.rotation =
              value;


            this.safeRender();
          }
        );
      }


      this.bindRange(
        '#insOpacity',
        value => {

          layer.opacity =
            value /
            100;


          this.safeRender();
        }
      );
    }


    bindLayerActions() {

      $('#insDuplicate')
        ?.addEventListener(
          'click',
          () =>
            this.duplicateSelected()
        );


      $('#insDelete')
        ?.addEventListener(
          'click',
          () =>
            this.deleteSelected()
        );


      $('#insBringForward')
        ?.addEventListener(
          'click',
          () =>
            this.moveSelected(
              1
            )
        );


      $('#insSendBackward')
        ?.addEventListener(
          'click',
          () =>
            this.moveSelected(
              -1
            )
        );
    }


    bindLayerRows() {

      $$(
        '[data-layer-select]'
      ).forEach(
        button => {

          button.addEventListener(
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
      ).forEach(
        button => {

          button.addEventListener(
            'click',
            event => {

              event.stopPropagation();


              const layer =
                this.state.layers.find(
                  item =>
                    item.id ===
                    button.dataset
                      .layerVisible
                );


              if (!layer) {
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
      ).forEach(
        button => {

          button.addEventListener(
            'click',
            event => {

              event.stopPropagation();


              const layer =
                this.state.layers.find(
                  item =>
                    item.id ===
                    button.dataset
                      .layerLock
                );


              if (!layer) {
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


      if (!layer) {
        return;
      }


      const x =
        $('#insX');


      const y =
        $('#insY');


      if (x) {

        x.value =
          layer.x;


        const value =
          $('#insXValue');


        if (value) {

          value.textContent =
            `${Math.round(
              layer.x
            )}%`;
        }
      }


      if (y) {

        y.value =
          layer.y;


        const value =
          $('#insYValue');


        if (value) {

          value.textContent =
            `${Math.round(
              layer.y
            )}%`;
        }
      }
    }


    /* ========================================================
       LAYER COMMANDS
    ======================================================== */

    duplicateSelected() {

      const layer =
        this.getSelected();


      if (!layer) {
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


      this.state.layers.push(
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


      if (!id) {
        return;
      }


      this.state.layers =
        this.state.layers.filter(
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
        index < 0
      ) {
        return;
      }


      const target =
        clamp(
          index +
          direction,
          0,
          this.state.layers
            .length -
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


    /* ========================================================
       HISTORY
    ======================================================== */

    snapshot() {

      return JSON.stringify({

        ...this.state,

        layers:
          this.state.layers
            .map(
              layer => {

                const copy = {
                  ...layer
                };


                delete copy._bounds;


                return copy;
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
        this.history.slice(
          0,
          this.historyIndex +
          1
        );


      this.history.push(
        snapshot
      );


      if (
        this.history.length >
        80
      ) {

        this.history.shift();
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


    /* ========================================================
       FORMAT / ZOOM
    ======================================================== */

    changeFormat(
      format
    ) {

      const definition =
        FORMATS[
          format
        ];


      if (!definition) {
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


      if (dimensions) {

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


      if (!stage) {
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


      if (label) {

        label.textContent =
          `${
            Math.round(
              zoom *
              100
            )
          }%`;
      }
    }


    /* ========================================================
       EXPORT
    ======================================================== */

    openExport() {

      $('#posterExportBackdrop')
        ?.remove();


      const modal =
        document.createElement(
          'div'
        );


      modal.id =
        'posterExportBackdrop';


      modal.className =
        'export-backdrop';


      modal.innerHTML = `
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
            Export at full ${
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
                Maximum quality
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
                Optimized social image
              </span>

            </button>

          </div>

        </div>
      `;


      document.body.appendChild(
        modal
      );


      $('#posterExportClose')
        ?.addEventListener(
          'click',
          () =>
            modal.remove()
        );


      modal.addEventListener(
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
      ).forEach(
        button => {

          button.addEventListener(
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


      this.canvas.toBlob(
        blob => {

          if (!blob) {

            this.safeRender();

            return;
          }


          const url =
            URL.createObjectURL(
              blob
            );


          const link =
            document.createElement(
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


          document.body
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
    }


    /* ========================================================
       RESET
    ======================================================== */

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


      this.syncAllUI();


      this.safeRender();


      this.renderInspector();


      this.commit();
    }


    /* ========================================================
       GLOBAL UI
    ======================================================== */

    bindUI() {

      /* tabs */

      $$(
        '[data-poster-tab]'
      ).forEach(
        button => {

          button.addEventListener(
            'click',
            () => {

              const name =
                button.dataset
                  .posterTab;


              $$(
                '[data-poster-tab]'
              ).forEach(
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


              $$(
                '.poster-left-panel'
              ).forEach(
                panel =>
                  panel.classList
                    .remove(
                      'active'
                    )
              );


              const id =
                `#poster${
                  name
                    .charAt(0)
                    .toUpperCase() +
                  name.slice(1)
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


      /* template search */

      $('#posterTemplateSearch')
        ?.addEventListener(
          'input',
          event => {

            this.searchTerm =
              event.target.value;


            this.safeRenderTemplates();
          }
        );


      /* template filters */

      $$(
        '[data-filter]'
      ).forEach(
        button => {

          button.addEventListener(
            'click',
            () => {

              $$(
                '[data-filter]'
              ).forEach(
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


      /* media */

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
                '[FWCWL Poster Upload]',
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


      /* add text */

      $$(
        '[data-add-poster-text]'
      ).forEach(
        button => {

          button.addEventListener(
            'click',
            () =>
              this.addText(
                button.dataset
                  .addPosterText
              )
          );
        }
      );


      /* add cricket elements */

      $$(
        '[data-add-poster-element]'
      ).forEach(
        button => {

          button.addEventListener(
            'click',
            () =>
              this.addElement(
                button.dataset
                  .addPosterElement
              )
          );
        }
      );


      /* format */

      $('#posterCanvasSize')
        ?.addEventListener(
          'change',
          event =>
            this.changeFormat(
              event.target.value
            )
        );


      /* safe zone */

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


            this.commit();
          }
        );


      /* snap */

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


            this.commit();
          }
        );


      /* fit */

      $('#posterFitBtn')
        ?.addEventListener(
          'click',
          () =>
            this.fitCanvas()
        );


      /* zoom */

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


      /* brand */

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


            if (text) {

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


            if (!color) {

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


            if (text) {

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


            if (!color) {

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


      /* pointer */

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


      window.addEventListener(
        'pointerup',
        () =>
          this.onPointerUp()
      );


      /* history */

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


      /* reset */

      $('#resetBtn')
        ?.addEventListener(
          'click',
          () =>
            this.reset()
        );


      /* export */

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


      /* resize */

      window.addEventListener(
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


      /* keyboard */

      document.addEventListener(
        'keydown',
        event =>
          this.handleKeyboard(
            event
          )
      );
    }


    /* ========================================================
       KEYBOARD
    ======================================================== */

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

        event.preventDefault();


        this.deleteSelected();


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
      }


      if (
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
      }


      if (
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
      }


      if (
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


      if (changed) {

        event.preventDefault();


        this.safeRender();


        this.renderInspectorValues();


        this.commit();
      }
    }


    /* ========================================================
       GENERIC BINDERS
    ======================================================== */

    bindInput(
      selector,
      eventName,
      handler,
      commitOnChange = false
    ) {

      const element =
        $(selector);


      if (!element) {
        return;
      }


      element.addEventListener(
        eventName,
        handler
      );


      if (
        commitOnChange &&
        eventName !==
        'change'
      ) {

        element.addEventListener(
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


      if (!input) {
        return;
      }


      const label =
        $(
          `${selector}Value`
        );


      input.addEventListener(
        'input',
        () => {

          const value =
            Number(
              input.value
            );


          callback(
            value
          );


          if (label) {

            const suffix =
              label.dataset
                .suffix ||
              '';


            label.textContent =
              `${Math.round(
                value
              )}${suffix}`;
          }
        }
      );


      input.addEventListener(
        'change',
        () =>
          this.commit()
      );
    }


    /* ========================================================
       UI SYNC
    ======================================================== */

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


      if (dimensions) {

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
      window.__FWCWL_POSTER_BOOTING__
    ) {
      return;
    }


    window.__FWCWL_POSTER_BOOTING__ =
      true;


    setBootState(
      'booting'
    );


    try {

      const editor =
        new PosterEditor();


      window.FWCWLPosterEditor =
        editor;

    } catch (
      error
    ) {

      showBootError(
        error &&
        error.message
          ? error.message
          : 'Unknown initialization error.',
        error
      );

    } finally {

      window.__FWCWL_POSTER_BOOTING__ =
        false;
    }
  }


  /* ============================================================
     ERROR MONITOR
  ============================================================ */

  window.addEventListener(
    'error',
    event => {

      if (
        event.filename &&
        event.filename.includes(
          'poster-editor'
        )
      ) {

        showBootError(
          `JavaScript error: ${
            event.message ||
            'unknown error'
          }`
        );
      }
    }
  );


  window.addEventListener(
    'unhandledrejection',
    event => {

      console.error(
        '[FWCWL Poster unhandled promise]',
        event.reason
      );
    }
  );


  /* ============================================================
     START ONCE
  ============================================================ */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      boot,
      {
        once: true
      }
    );

  } else {

    boot();
  }

})();
