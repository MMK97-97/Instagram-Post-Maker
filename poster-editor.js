(() => {
  "use strict";

  /* ==========================================================
     HELPERS
  ========================================================== */

  const $ = selector =>
    document.querySelector(selector);

  const $$ = selector =>
    Array.from(
      document.querySelectorAll(selector)
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
    `${prefix}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${Date.now()
      .toString(36)
      .slice(-5)}`;

  const escapeHtml = value =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const hex = value => {
    let v =
      String(value || "")
        .trim();

    if (!v.startsWith("#")) {
      v = `#${v}`;
    }

    return /^#[0-9a-fA-F]{6}$/.test(v)
      ? v.toUpperCase()
      : null;
  };

  const rgba = (
    color,
    alpha
  ) => {
    const value =
      String(
        color || "#ffffff"
      ).replace("#", "");

    const n =
      parseInt(
        value.length === 3
          ? value
              .split("")
              .map(x => x + x)
              .join("")
          : value,
        16
      );

    if (Number.isNaN(n)) {
      return `rgba(255,255,255,${alpha})`;
    }

    return `rgba(${
      (n >> 16) & 255
    },${
      (n >> 8) & 255
    },${
      n & 255
    },${alpha})`;
  };


  function roundedRect(
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


  /* ==========================================================
     FORMATS
  ========================================================== */

  const FORMATS = {
    portrait: {
      width: 1080,
      height: 1350,
      label: "Portrait"
    },

    square: {
      width: 1080,
      height: 1080,
      label: "Square"
    },

    story: {
      width: 1080,
      height: 1920,
      label: "Story"
    }
  };


  /* ==========================================================
     TEMPLATE LIBRARY
  ========================================================== */

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
    cta:
      options.cta ||
      "FWCWL",
    palette,
    align:
      options.align ||
      "left",
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
      "Montserrat",
    texture:
      options.texture ||
      0
  });


  const TEMPLATES = [

    T(
      "match-day",
      "Match Day",
      "match",
      "slash",
      "FWCWL • MATCH DAY",
      "TAMPA\nVS RIVALS",
      "SATURDAY • 10:00 AM • TAMPA",
      ["#09090b", "#551019", "#f1c34d"],
      {
        titleSize: 132
      }
    ),

    T(
      "big-vs",
      "Big VS",
      "match",
      "versus",
      "THE SHOWDOWN",
      "TEAM A\nVS\nTEAM B",
      "TWO TEAMS • ONE WINNER",
      ["#061522", "#65141f", "#f1c34d"],
      {
        align: "center",
        titleSize: 122,
        titleY: 37,
        font: "Bebas Neue"
      }
    ),

    T(
      "next-fixture",
      "Next Fixture",
      "match",
      "fixture",
      "NEXT FIXTURE",
      "SATURDAY\n10:00 AM",
      "TAMPA • FLORIDA",
      ["#111317", "#4b1017", "#f1c34d"],
      {
        titleSize: 115
      }
    ),

    T(
      "game-day",
      "Game Day",
      "match",
      "stadium",
      "IT'S TIME",
      "GAME\nDAY",
      "FWCWL • PRIME TIME CRICKET",
      ["#04151d", "#0e3440", "#f1c34d"],
      {
        titleSize: 158
      }
    ),

    T(
      "night-match",
      "Night Match",
      "match",
      "stadium",
      "UNDER THE LIGHTS",
      "GAME\nNIGHT",
      "FRIDAY • 7:30 PM",
      ["#03090f", "#102a3a", "#e5b63a"],
      {
        titleSize: 150
      }
    ),

    T(
      "rivalry",
      "Rivalry",
      "match",
      "split",
      "RIVALRY SERIES",
      "NO\nFRIENDS",
      "ONLY CRICKET",
      ["#0c0e12", "#66131d", "#f1c34d"],
      {
        titleSize: 142
      }
    ),

    T(
      "pre-match",
      "Pre-Match",
      "match",
      "lines",
      "MATCH PREVIEW",
      "READY\nTO GO",
      "THE COUNTDOWN STARTS NOW",
      ["#071418", "#4a1017", "#efc34f"],
      {
        titleSize: 140
      }
    ),

    T(
      "match-centre",
      "Match Centre",
      "match",
      "score",
      "FWCWL MATCH CENTRE",
      "LIVE\nCRICKET",
      "SCORES • STATS • UPDATES",
      ["#071515", "#142820", "#f1c34d"],
      {
        titleSize: 136
      }
    ),

    T(
      "playing-xi",
      "Playing XI",
      "team",
      "lineup",
      "MATCH PLAN",
      "PLAYING\nXI",
      "TEAM SHEET",
      ["#061b19", "#102922", "#f1c34d"],
      {
        titleSize: 148
      }
    ),

    T(
      "squad",
      "Squad Reveal",
      "team",
      "grid",
      "FWCWL SQUAD",
      "MEET\nTHE TEAM",
      "READY FOR BATTLE",
      ["#130e11", "#5e1520", "#efc04a"],
      {
        titleSize: 132
      }
    ),

    T(
      "captain",
      "Captain",
      "team",
      "captain",
      "LEADING THE SIDE",
      "OUR\nCAPTAIN",
      "LEADERSHIP • BELIEF • INTENT",
      ["#06131b", "#321016", "#f1c34d"],
      {
        titleSize: 150
      }
    ),

    T(
      "vice-captain",
      "Vice Captain",
      "team",
      "captain",
      "LEADERSHIP GROUP",
      "VICE\nCAPTAIN",
      "READY TO LEAD",
      ["#06141a", "#48131c", "#d9ac37"],
      {
        titleSize: 132
      }
    ),

    T(
      "player-spotlight",
      "Player Spotlight",
      "team",
      "player",
      "FWCWL PLAYER SERIES",
      "PLAYER\nSPOTLIGHT",
      "NAME • ROLE • TEAM",
      ["#061a1d", "#521620", "#f1c34d"],
      {
        titleSize: 126,
        titleWidth: 60
      }
    ),

    T(
      "new-signing",
      "Player Signing",
      "team",
      "player",
      "WELCOME TO THE TEAM",
      "NEW\nSIGNING",
      "THE JOURNEY BEGINS",
      ["#0a1014", "#59111a", "#f1c34d"],
      {
        titleSize: 140
      }
    ),

    T(
      "training-day",
      "Training Day",
      "team",
      "lines",
      "PUT IN THE WORK",
      "TRAINING\nDAY",
      "NO SHORTCUTS",
      ["#081518", "#1d2e2c", "#e9bb43"],
      {
        titleSize: 140
      }
    ),

    T(
      "team-culture",
      "Team Culture",
      "team",
      "grit",
      "FWCWL • CRICKET CULTURE",
      "PLAY\nHARD",
      "ONE TEAM • ONE PURPOSE",
      ["#32110d", "#6c2b1a", "#f0bf47"],
      {
        titleSize: 152,
        texture: 1
      }
    ),

    T(
      "potm",
      "Player of the Match",
      "result",
      "award",
      "OUTSTANDING PERFORMANCE",
      "PLAYER OF\nTHE MATCH",
      "A PERFORMANCE THAT CHANGED THE GAME",
      ["#171019", "#681d2c", "#d5a83b"],
      {
        titleSize: 116,
        titleWidth: 62
      }
    ),

    T(
      "mvp",
      "MVP",
      "result",
      "gold",
      "MOST VALUABLE PLAYER",
      "MVP",
      "PURE IMPACT • PURE PERFORMANCE",
      ["#090909", "#2e220d", "#f6cd54"],
      {
        align: "center",
        titleSize: 220,
        font: "Bebas Neue"
      }
    ),

    T(
      "result",
      "Match Result",
      "result",
      "result",
      "FINAL RESULT",
      "VICTORY",
      "WON BY 24 RUNS",
      ["#06171b", "#49131a", "#f1c34d"],
      {
        titleSize: 160
      }
    ),

    T(
      "scorecard",
      "Scorecard",
      "result",
      "score",
      "FINAL SCORE",
      "186 / 5",
      "20 OVERS • TARGET 163",
      ["#050708", "#182327", "#f1c34d"],
      {
        titleSize: 180,
        font: "Bebas Neue"
      }
    ),

    T(
      "live-score",
      "Live Score",
      "result",
      "score",
      "● LIVE",
      "142 / 4",
      "16.2 OVERS • NEED 38 FROM 22",
      ["#061219", "#181b20", "#e93d49"],
      {
        titleSize: 180,
        font: "Bebas Neue"
      }
    ),

    T(
      "champions",
      "Champions",
      "result",
      "gold",
      "FWCWL CHAMPIONS",
      "CHAMPIONS",
      "THE TROPHY IS OURS",
      ["#080808", "#33210b", "#f1c34d"],
      {
        align: "center",
        titleSize: 148,
        titleY: 46
      }
    ),

    T(
      "top-scorer",
      "Top Scorer",
      "result",
      "award",
      "BATSMAN OF THE SEASON",
      "TOP\nSCORER",
      "RUNS • AVERAGE • STRIKE RATE",
      ["#0a1216", "#4e121c", "#e8b63e"],
      {
        titleSize: 148
      }
    ),

    T(
      "best-bowler",
      "Best Bowler",
      "result",
      "award",
      "BOWLER OF THE SEASON",
      "BEST\nBOWLER",
      "WICKETS • ECONOMY • IMPACT",
      ["#06171c", "#42121a", "#f1c34d"],
      {
        titleSize: 148
      }
    ),

    T(
      "final",
      "The Final",
      "event",
      "final",
      "CHAMPIONSHIP",
      "THE\nFINAL",
      "ONE GAME • ONE TROPHY",
      ["#08080a", "#431017", "#f2ca55"],
      {
        align: "center",
        titleSize: 174,
        titleY: 40
      }
    ),

    T(
      "semi-final",
      "Semi Final",
      "event",
      "final",
      "ONE STEP AWAY",
      "SEMI\nFINAL",
      "EVERY BALL MATTERS",
      ["#071120", "#711623", "#f1c34d"],
      {
        align: "center",
        titleSize: 160,
        titleY: 40
      }
    ),

    T(
      "tournament",
      "Tournament",
      "event",
      "pitch",
      "FWCWL PRESENTS",
      "WINTER\nLEAGUE",
      "TAMPA • FLORIDA",
      ["#052023", "#10504e", "#edbc42"],
      {
        titleSize: 144
      }
    ),

    T(
      "registration",
      "Registration",
      "event",
      "ticket",
      "REGISTRATION IS OPEN",
      "JOIN\nTHE LEAGUE",
      "TEAMS • PLAYERS • CRICKET",
      ["#111013", "#5c131d", "#f1c34d"],
      {
        titleSize: 138
      }
    ),

    T(
      "tryouts",
      "Tryouts",
      "event",
      "slash",
      "SHOW US YOUR GAME",
      "OPEN\nTRYOUTS",
      "YOUR NEXT INNINGS STARTS HERE",
      ["#06171b", "#1e3a43", "#f1c34d"],
      {
        titleSize: 150
      }
    ),

    T(
      "auction",
      "Player Auction",
      "event",
      "cards",
      "FWCWL AUCTION NIGHT",
      "PLAYER\nAUCTION",
      "BUILD YOUR SQUAD",
      ["#140f11", "#5b121b", "#f1c34d"],
      {
        titleSize: 138
      }
    ),

    T(
      "schedule",
      "Season Schedule",
      "event",
      "fixture",
      "SEASON 2026",
      "FIXTURE\nDROP",
      "THE ROAD STARTS HERE",
      ["#081116", "#3d1016", "#f1c34d"],
      {
        titleSize: 144
      }
    ),

    T(
      "opening",
      "Opening Ceremony",
      "event",
      "gold",
      "FWCWL OPENING NIGHT",
      "LET THE\nSEASON BEGIN",
      "WELCOME TO THE LEAGUE",
      ["#090909", "#41141b", "#efc04b"],
      {
        align: "center",
        titleSize: 116
      }
    ),

    T(
      "milestone",
      "Milestone",
      "social",
      "milestone",
      "CAREER MILESTONE",
      "100",
      "A LANDMARK INNINGS",
      ["#071419", "#50131c", "#f1c34d"],
      {
        titleSize: 230
      }
    ),

    T(
      "birthday",
      "Birthday",
      "social",
      "confetti",
      "FWCWL FAMILY",
      "HAPPY\nBIRTHDAY",
      "WISHING YOU A GREAT YEAR",
      ["#160f18", "#6b203c", "#f1c34d"],
      {
        titleSize: 134
      }
    ),

    T(
      "sponsor",
      "Sponsor",
      "social",
      "frame",
      "OFFICIAL PARTNER",
      "WELCOME\nABOARD",
      "PROUDLY PARTNERING WITH FWCWL",
      ["#0a0b0d", "#232529", "#f1c34d"],
      {
        titleSize: 126
      }
    ),

    T(
      "thank-you",
      "Thank You",
      "social",
      "radial",
      "FROM THE FWCWL FAMILY",
      "THANK\nYOU",
      "FOR YOUR SUPPORT",
      ["#091417", "#47121a", "#f1c34d"],
      {
        titleSize: 162
      }
    ),

    T(
      "breaking",
      "Breaking News",
      "social",
      "news",
      "FWCWL • BREAKING",
      "BIG\nNEWS",
      "OFFICIAL ANNOUNCEMENT",
      ["#090a0d", "#601019", "#f1c34d"],
      {
        titleSize: 180
      }
    ),

    T(
      "highlights",
      "Match Highlights",
      "social",
      "slash",
      "MATCH RECAP",
      "HIGHLIGHTS",
      "THE MOMENTS THAT DECIDED THE GAME",
      ["#061419", "#55131d", "#f1c34d"],
      {
        titleSize: 140
      }
    ),

    T(
      "brutalist",
      "Brutalist Match",
      "rustic",
      "brutalist",
      "FWCWL MATCH CENTRE",
      "NO\nEXCUSES",
      "LIMITED • RAW • CRICKET",
      ["#111111", "#1c1a16", "#d4ad4a"],
      {
        titleSize: 160,
        texture: 1
      }
    ),

    T(
      "film-grain",
      "Film Grain Player",
      "rustic",
      "film",
      "PLAYER FEATURE",
      "BUILT\nDIFFERENT",
      "GRIT • DISCIPLINE • GAME",
      ["#221814", "#3a2820", "#d2aa48"],
      {
        titleSize: 140,
        texture: 1
      }
    ),

    T(
      "red-clay",
      "Red Clay Cricket",
      "rustic",
      "grit",
      "FWCWL • CRICKET CULTURE",
      "PLAY\nHARD",
      "RUSTIC SERIES",
      ["#35120d", "#722c1a", "#e8bb48"],
      {
        titleSize: 150,
        texture: 1
      }
    ),

    T(
      "black-gold",
      "Black Gold Texture",
      "rustic",
      "gold-grit",
      "PREMIER CRICKET",
      "THE\nFINAL",
      "LIMITED EDITION",
      ["#090909", "#171309", "#d6a93a"],
      {
        titleSize: 158,
        texture: 1
      }
    ),

    T(
      "weathered",
      "Weathered Fixture",
      "rustic",
      "paper",
      "MATCH NOTICE",
      "NEXT\nFIXTURE",
      "FWCWL ARCHIVES",
      ["#d8c7a6", "#9f8869", "#7f2226"],
      {
        titleSize: 138,
        texture: 1
      }
    ),

    T(
      "player-collage",
      "Player Collage",
      "layered",
      "collage",
      "FWCWL PLAYER SERIES",
      "PLAYER\nSPOTLIGHT",
      "LAYERED EDITORIAL",
      ["#171016", "#6b1b27", "#efc14b"],
      {
        titleSize: 128
      }
    ),

    T(
      "tactical-lineup",
      "Tactical Lineup",
      "layered",
      "lineup",
      "MATCH PLAN",
      "PLAYING\nXI",
      "TACTICAL TEAM SHEET",
      ["#061b18", "#142b22", "#f1c34d"],
      {
        titleSize: 148
      }
    ),

    T(
      "stacked-rivalry",
      "Stacked Rivalry",
      "layered",
      "stack",
      "RIVALRY WEEK",
      "TEAM A\nVS\nTEAM B",
      "LAYERED MATCH SERIES",
      ["#101118", "#701822", "#f1c34d"],
      {
        align: "center",
        titleSize: 118
      }
    ),

    T(
      "cutout-hero",
      "Cutout Hero",
      "layered",
      "cutout",
      "PLAYER FEATURE",
      "OWN\nTHE GAME",
      "FWCWL HERO SERIES",
      ["#07141b", "#50131d", "#f1c34d"],
      {
        titleSize: 150
      }
    ),

    T(
      "retro",
      "Retro Cricket",
      "vintage",
      "retro",
      "TAMPA CRICKET",
      "SUMMER\nCRICKET",
      "ARCHIVE SERIES",
      ["#c8ac81", "#74464b", "#4b2b25"],
      {
        titleSize: 132,
        font: "Playfair Display",
        texture: 1
      }
    ),

    T(
      "trophy-archive",
      "Trophy Archive",
      "vintage",
      "paper",
      "FWCWL ARCHIVES",
      "CHAMPIONS",
      "A SEASON TO REMEMBER",
      ["#d4bc8d", "#a78760", "#852c31"],
      {
        align: "center",
        titleSize: 124,
        font: "Playfair Display",
        texture: 1
      }
    ),

    T(
      "heritage",
      "Heritage Match",
      "vintage",
      "retro",
      "HERITAGE SERIES",
      "CLASSIC\nCRICKET",
      "TRADITION MEETS COMPETITION",
      ["#c6af88", "#675747", "#7b292c"],
      {
        titleSize: 126,
        font: "Playfair Display",
        texture: 1
      }
    ),

    T(
      "editorial-feature",
      "Editorial Feature",
      "editorial",
      "editorial",
      "THE FWCWL EDIT",
      "THE\nGAME",
      "A MODERN CRICKET STORY",
      ["#eee4cf", "#cbb892", "#6f1d28"],
      {
        titleSize: 158,
        font: "Playfair Display"
      }
    )

  ];


  /* ==========================================================
     APP
  ========================================================== */

  class PosterEditor {

    constructor() {

      this.canvas =
        $("#posterCanvas");

      this.ctx =
        this.canvas.getContext("2d");

      this.assets =
        new Map();

      this.logo =
        new Image();

      this.logoReady =
        false;

      this.logo.onload =
        () => {
          this.logoReady = true;
          this.render();
          this.renderTemplates();
        };

      this.logo.src =
        "assets/fwcwl-logo.jpeg";


      this.state = {
        format: "portrait",

        width:
          FORMATS.portrait.width,

        height:
          FORMATS.portrait.height,

        templateId:
          "match-day",

        accent:
          "#f1c34d",

        background:
          "#12090d",

        brandName:
          "FWCWL",

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

        layers: []
      };


      this.filter =
        "all";

      this.search =
        "";

      this.drag =
        null;

      this.history =
        [];

      this.historyIndex =
        -1;

      this.previewRaf =
        null;


      this.bindUI();

      this.applyTemplate(
        "match-day",
        false
      );

      this.commit();

      document.fonts?.ready
        ?.then(
          () => {
            this.render();
            this.renderTemplates();
          }
        );

      requestAnimationFrame(
        () =>
          this.fitCanvas()
      );
    }


    /* ========================================================
       TEMPLATE
    ======================================================== */

    template() {
      return (
        TEMPLATES.find(
          template =>
            template.id ===
            this.state.templateId
        ) ||
        TEMPLATES[0]
      );
    }


    applyTemplate(
      id,
      save = true
    ) {
      const template =
        TEMPLATES.find(
          item =>
            item.id === id
        ) ||
        TEMPLATES[0];

      const mediaLayers =
        this.state.layers.filter(
          layer =>
            layer.type === "image"
        );

      this.state.templateId =
        template.id;

      this.state.accent =
        template.palette[2];

      this.state.background =
        template.palette[0];


      this.state.layers = [

        {
          id:
            uid("text"),

          type:
            "text",

          name:
            "Kicker",

          text:
            template.kicker,

          x:
            template.align ===
            "center"
              ? 50
              : 7,

          y:
            template.titleY -
            10,

          width:
            template.align ===
            "center"
              ? 82
              : template.titleWidth,

          size:
            25,

          weight:
            900,

          font:
            "DM Sans",

          color:
            template.palette[2],

          align:
            template.align,

          opacity:
            1,

          letterSpacing:
            2
        },


        {
          id:
            uid("text"),

          type:
            "text",

          name:
            "Headline",

          text:
            template.title,

          x:
            template.align ===
            "center"
              ? 50
              : 7,

          y:
            template.titleY,

          width:
            template.titleWidth,

          size:
            template.titleSize,

          weight:
            template.font ===
            "Bebas Neue"
              ? 400
              : 900,

          font:
            template.font,

          color:
            "#ffffff",

          align:
            template.align,

          opacity:
            1,

          lineHeight:
            .84,

          letterSpacing:
            0
        },


        {
          id:
            uid("text"),

          type:
            "text",

          name:
            "Details",

          text:
            template.detail,

          x:
            template.align ===
            "center"
              ? 50
              : 7,

          y:
            template.titleY +
            28,

          width:
            template.align ===
            "center"
              ? 78
              : 68,

          size:
            27,

          weight:
            650,

          font:
            "DM Sans",

          color:
            "rgba(255,255,255,.72)",

          align:
            template.align,

          opacity:
            1,

          lineHeight:
            1.15,

          letterSpacing:
            .4
        },


        {
          id:
            uid("text"),

          type:
            "text",

          name:
            "Footer",

          text:
            template.cta,

          x: 7,

          y: 91,

          width: 45,

          size: 19,

          weight: 900,

          font:
            "DM Sans",

          color:
            template.palette[2],

          align:
            "left",

          opacity:
            1,

          letterSpacing:
            1.8
        },

        ...mediaLayers
      ];


      this.state.selectedId =
        null;

      this.syncBrandUI();

      this.render();

      this.renderTemplates();

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
        $("#posterTemplateGrid");

      if (!grid) {
        return;
      }

      const search =
        this.search
          .trim()
          .toLowerCase();

      const filtered =
        TEMPLATES.filter(
          template => {
            const category =
              this.filter === "all" ||
              template.category ===
              this.filter;

            const haystack =
              [
                template.name,
                template.category,
                template.style,
                template.kicker,
                template.title
              ]
                .join(" ")
                .toLowerCase();

            return (
              category &&
              (
                !search ||
                haystack.includes(search)
              )
            );
          }
        );


      $("#posterTemplateCount")
        .textContent =
        filtered.length;


      $("#posterTemplateEmpty")
        .classList
        .toggle(
          "hidden",
          filtered.length > 0
        );


      grid.innerHTML =
        filtered
          .map(
            template => `
              <button
                class="template-card ${
                  template.id ===
                  this.state.templateId
                    ? "active"
                    : ""
                }"
                data-template-id="${template.id}"
                type="button"
              >

                <div class="template-art">

                  <canvas
                    width="216"
                    height="270"
                    data-template-preview="${template.id}"
                  ></canvas>

                </div>

                <div class="template-meta">

                  <strong>
                    ${escapeHtml(
                      template.name
                    )}
                  </strong>

                  <small>
                    ${escapeHtml(
                      template.category
                    )}
                  </small>

                </div>

              </button>
            `
          )
          .join("");


      grid
        .querySelectorAll(
          "[data-template-id]"
        )
        .forEach(
          button => {
            button.addEventListener(
              "click",
              () => {
                this.applyTemplate(
                  button.dataset
                    .templateId
                );
              }
            );
          }
        );


      requestAnimationFrame(
        () => {
          filtered.forEach(
            template => {
              const canvas =
                grid.querySelector(
                  `[data-template-preview="${template.id}"]`
                );

              if (!canvas) {
                return;
              }

              const ctx =
                canvas.getContext("2d");

              this.drawTemplatePreview(
                ctx,
                canvas.width,
                canvas.height,
                template
              );
            }
          );
        }
      );
    }


    drawTemplatePreview(
      ctx,
      width,
      height,
      template
    ) {
      this.drawDesignBase(
        ctx,
        width,
        height,
        template,
        0
      );


      if (
        this.logoReady
      ) {
        const maxW =
          width * .17;

        const maxH =
          height * .09;

        const scale =
          Math.min(
            maxW /
            this.logo.naturalWidth,
            maxH /
            this.logo.naturalHeight
          );

        const w =
          this.logo.naturalWidth *
          scale;

        const h =
          this.logo.naturalHeight *
          scale;

        ctx.drawImage(
          this.logo,
          width * .055,
          height * .035,
          w,
          h
        );
      }


      const align =
        template.align;

      const x =
        align === "center"
          ? width / 2
          : width * .065;

      const maxWidth =
        width *
        (
          template.titleWidth /
          100
        );


      ctx.textAlign =
        align;

      ctx.textBaseline =
        "top";


      ctx.fillStyle =
        template.palette[2];

      ctx.font =
        `900 ${
          width * .026
        }px "DM Sans"`;

      ctx.fillText(
        template.kicker,
        x,
        height *
        (
          (
            template.titleY -
            10
          ) /
          100
        )
      );


      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        `${
          template.font ===
          "Bebas Neue"
            ? 400
            : 900
        } ${
          width *
          (
            template.titleSize /
            1080
          )
        }px "${template.font}"`;


      const titleLines =
        this.wrapText(
          ctx,
          template.title,
          maxWidth
        );

      let y =
        height *
        (
          template.titleY /
          100
        );

      const lineHeight =
        width *
        (
          template.titleSize /
          1080
        ) *
        .84;


      titleLines.forEach(
        line => {
          ctx.fillText(
            line,
            x,
            y
          );

          y +=
            lineHeight;
        }
      );


      ctx.fillStyle =
        "rgba(255,255,255,.58)";

      ctx.font =
        `700 ${
          width * .019
        }px "DM Sans"`;

      ctx.fillText(
        template.detail,
        x,
        height *
        (
          (
            template.titleY +
            29
          ) /
          100
        )
      );


      ctx.fillStyle =
        "rgba(255,255,255,.32)";

      ctx.font =
        `800 ${
          width * .016
        }px "DM Sans"`;

      ctx.textAlign =
        "right";

      ctx.fillText(
        "FWCWL",
        width * .94,
        height * .94
      );
    }


    /* ========================================================
       DRAWING
    ======================================================== */

    render(
      exporting = false
    ) {
      const ctx =
        this.ctx;

      const W =
        this.state.width;

      const H =
        this.state.height;

      if (
        this.canvas.width !== W ||
        this.canvas.height !== H
      ) {
        this.canvas.width = W;
        this.canvas.height = H;
      }


      const template =
        this.template();


      this.drawDesignBase(
        ctx,
        W,
        H,
        template,
        0
      );


      for (
        const layer of
        this.state.layers
      ) {
        if (
          layer.visible ===
          false
        ) {
          continue;
        }

        this.drawLayer(
          ctx,
          layer,
          W,
          H
        );
      }


      this.drawOfficialBrand(
        ctx,
        W,
        H
      );


      if (
        this.state.safeZone &&
        !exporting
      ) {
        this.drawSafeZone(
          ctx,
          W,
          H
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
            ctx,
            selected._bounds,
            W
          );
        }
      }
    }


    drawDesignBase(
      ctx,
      W,
      H,
      template,
      time
    ) {
      const p =
        template.palette;

      const gradient =
        ctx.createLinearGradient(
          0,
          0,
          W,
          H
        );

      gradient.addColorStop(
        0,
        p[0]
      );

      gradient.addColorStop(
        1,
        p[1]
      );

      ctx.fillStyle =
        gradient;

      ctx.fillRect(
        0,
        0,
        W,
        H
      );


      switch (
        template.style
      ) {

        case "slash":
          this.drawSlashes(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "versus":
          this.drawVersus(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "fixture":
          this.drawFixture(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "stadium":
          this.drawStadium(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "split":
          this.drawSplit(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "lines":
          this.drawLines(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "score":
          this.drawScorePanel(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "lineup":
          this.drawPitch(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "grid":
          this.drawGrid(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "captain":
          this.drawCaptain(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "player":
          this.drawPlayerPanel(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "award":
          this.drawAward(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "gold":
          this.drawGoldRays(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "result":
          this.drawResult(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "final":
          this.drawFinal(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "pitch":
          this.drawPitch(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "ticket":
          this.drawTicket(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "cards":
          this.drawCards(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "milestone":
          this.drawMilestone(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "confetti":
          this.drawConfetti(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "frame":
          this.drawFrame(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "radial":
          this.drawGoldRays(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "news":
          this.drawNews(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "brutalist":
          this.drawBrutalist(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "film":
          this.drawFilm(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "grit":
          this.drawGrit(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "gold-grit":
          this.drawGoldRays(
            ctx,
            W,
            H,
            p[2]
          );

          this.drawGrit(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "paper":
          this.drawPaper(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "collage":
          this.drawCollage(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "stack":
          this.drawStack(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "cutout":
          this.drawCutout(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "retro":
          this.drawRetro(
            ctx,
            W,
            H,
            p[2]
          );
          break;

        case "editorial":
          this.drawEditorial(
            ctx,
            W,
            H,
            p[2]
          );
          break;
      }


      const bottomShade =
        ctx.createLinearGradient(
          0,
          H * .5,
          0,
          H
        );

      bottomShade.addColorStop(
        0,
        "rgba(0,0,0,0)"
      );

      bottomShade.addColorStop(
        1,
        "rgba(0,0,0,.44)"
      );

      ctx.fillStyle =
        bottomShade;

      ctx.fillRect(
        0,
        0,
        W,
        H
      );


      if (
        template.texture
      ) {
        this.drawTexture(
          ctx,
          W,
          H
        );
      }
    }


    drawSlashes(
      ctx,
      W,
      H,
      accent
    ) {
      for (
        let i = 0;
        i < 4;
        i++
      ) {
        ctx.save();

        ctx.translate(
          W *
          (
            .55 +
            i * .10
          ),
          H * .45
        );

        ctx.rotate(-.25);

        ctx.fillStyle =
          rgba(
            accent,
            .045 +
            i * .015
          );

        ctx.fillRect(
          0,
          -H * .65,
          W * .07,
          H * 1.3
        );

        ctx.restore();
      }

      ctx.fillStyle =
        accent;

      ctx.fillRect(
        W * .07,
        H * .82,
        W * .12,
        H * .004
      );
    }


    drawVersus(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.fillStyle =
        "rgba(84,12,22,.38)";

      ctx.beginPath();

      ctx.moveTo(
        W * .52,
        0
      );

      ctx.lineTo(
        W,
        0
      );

      ctx.lineTo(
        W,
        H
      );

      ctx.lineTo(
        W * .40,
        H
      );

      ctx.closePath();

      ctx.fill();


      ctx.strokeStyle =
        rgba(
          accent,
          .34
        );

      ctx.lineWidth =
        W * .008;

      ctx.beginPath();

      ctx.arc(
        W * .5,
        H * .44,
        W * .17,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }


    drawFixture(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.strokeStyle =
        "rgba(255,255,255,.045)";

      ctx.lineWidth = 2;

      for (
        let y = H * .16;
        y < H;
        y += H * .055
      ) {
        ctx.beginPath();

        ctx.moveTo(
          0,
          y
        );

        ctx.lineTo(
          W,
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
        W * .70,
        H * .17,
        W * .20,
        H * .19
      );
    }


    drawStadium(
      ctx,
      W,
      H,
      accent
    ) {
      for (
        let i = 0;
        i < 7;
        i++
      ) {
        const x =
          W *
          (
            .08 +
            i * .14
          );

        const beam =
          ctx.createLinearGradient(
            x,
            0,
            W / 2,
            H * .75
          );

        beam.addColorStop(
          0,
          "rgba(255,255,255,.10)"
        );

        beam.addColorStop(
          1,
          "rgba(255,255,255,0)"
        );

        ctx.fillStyle =
          beam;

        ctx.beginPath();

        ctx.moveTo(
          x - W * .018,
          0
        );

        ctx.lineTo(
          x + W * .018,
          0
        );

        ctx.lineTo(
          W / 2,
          H * .76
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
        W * .003;

      ctx.beginPath();

      ctx.ellipse(
        W / 2,
        H * .87,
        W * .36,
        H * .065,
        0,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }


    drawSplit(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.fillStyle =
        rgba(
          accent,
          .08
        );

      ctx.beginPath();

      ctx.moveTo(
        W * .67,
        0
      );

      ctx.lineTo(
        W,
        0
      );

      ctx.lineTo(
        W,
        H
      );

      ctx.lineTo(
        W * .42,
        H
      );

      ctx.closePath();

      ctx.fill();
    }


    drawLines(
      ctx,
      W,
      H,
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
          W * .003;

        ctx.beginPath();

        ctx.moveTo(
          W *
          (
            .58 +
            i * .04
          ),
          0
        );

        ctx.lineTo(
          W *
          (
            .35 +
            i * .05
          ),
          H
        );

        ctx.stroke();
      }
    }


    drawScorePanel(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.fillStyle =
        "rgba(0,0,0,.20)";

      roundedRect(
        ctx,
        W * .08,
        H * .25,
        W * .84,
        H * .40,
        W * .026
      );

      ctx.fill();

      ctx.strokeStyle =
        rgba(
          accent,
          .26
        );

      ctx.lineWidth =
        W * .003;

      ctx.stroke();
    }


    drawPitch(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.strokeStyle =
        rgba(
          accent,
          .18
        );

      ctx.lineWidth =
        W * .003;

      ctx.strokeRect(
        W * .62,
        H * .18,
        W * .25,
        H * .52
      );

      ctx.beginPath();

      ctx.arc(
        W * .745,
        H * .44,
        W * .06,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }


    drawGrid(
      ctx,
      W,
      H,
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
            row === 0 &&
            col === 0
              ? rgba(
                  accent,
                  .15
                )
              : "rgba(255,255,255,.025)";

          roundedRect(
            ctx,
            W *
            (
              .59 +
              col * .105
            ),
            H *
            (
              .43 +
              row * .07
            ),
            W * .09,
            H * .05,
            W * .008
          );

          ctx.fill();
        }
      }
    }


    drawCaptain(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.strokeStyle =
        rgba(
          accent,
          .28
        );

      ctx.lineWidth =
        W * .006;

      ctx.beginPath();

      ctx.moveTo(
        W * .68,
        H * .26
      );

      ctx.lineTo(
        W * .77,
        H * .19
      );

      ctx.lineTo(
        W * .87,
        H * .26
      );

      ctx.lineTo(
        W * .82,
        H * .39
      );

      ctx.lineTo(
        W * .72,
        H * .39
      );

      ctx.closePath();

      ctx.stroke();
    }


    drawPlayerPanel(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.fillStyle =
        "rgba(255,255,255,.025)";

      roundedRect(
        ctx,
        W * .61,
        H * .18,
        W * .30,
        H * .52,
        W * .025
      );

      ctx.fill();

      ctx.strokeStyle =
        rgba(
          accent,
          .30
        );

      ctx.lineWidth =
        W * .006;

      ctx.beginPath();

      ctx.arc(
        W * .76,
        H * .37,
        W * .15,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }


    drawAward(
      ctx,
      W,
      H,
      accent
    ) {
      this.drawPlayerPanel(
        ctx,
        W,
        H,
        accent
      );

      ctx.fillStyle =
        rgba(
          accent,
          .12
        );

      ctx.font =
        `400 ${
          W * .18
        }px "Bebas Neue"`;

      ctx.fillText(
        "01",
        W * .61,
        H * .65
      );
    }


    drawGoldRays(
      ctx,
      W,
      H,
      accent
    ) {
      for (
        let i = 0;
        i < 18;
        i++
      ) {
        ctx.save();

        ctx.translate(
          W / 2,
          H * .43
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
          W * .13,
          -W * .008,
          W * .34,
          W * .016
        );

        ctx.restore();
      }
    }


    drawResult(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.fillStyle =
        rgba(
          accent,
          .08
        );

      ctx.fillRect(
        W * .68,
        0,
        W * .32,
        H
      );

      ctx.strokeStyle =
        rgba(
          accent,
          .25
        );

      ctx.lineWidth =
        W * .003;

      ctx.strokeRect(
        W * .05,
        H * .06,
        W * .90,
        H * .88
      );
    }


    drawFinal(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.strokeStyle =
        rgba(
          accent,
          .42
        );

      ctx.lineWidth =
        W * .003;

      ctx.strokeRect(
        W * .04,
        H * .025,
        W * .92,
        H * .95
      );

      this.drawGoldRays(
        ctx,
        W,
        H,
        accent
      );
    }


    drawTicket(
      ctx,
      W,
      H,
      accent
    ) {
      for (
        let i = 0;
        i < 7;
        i++
      ) {
        ctx.fillStyle =
          i % 2
            ? "rgba(255,255,255,.018)"
            : rgba(
                accent,
                .035
              );

        ctx.fillRect(
          W *
          (
            .60 +
            i * .042
          ),
          H * .17,
          W * .024,
          H * .58
        );
      }
    }


    drawCards(
      ctx,
      W,
      H,
      accent
    ) {
      for (
        let i = 0;
        i < 3;
        i++
      ) {
        ctx.save();

        ctx.translate(
          W *
          (
            .67 +
            i * .055
          ),
          H *
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
            : "rgba(255,255,255,.025)";

        roundedRect(
          ctx,
          -W * .11,
          -H * .13,
          W * .22,
          H * .26,
          W * .015
        );

        ctx.fill();

        ctx.restore();
      }
    }


    drawMilestone(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.strokeStyle =
        rgba(
          accent,
          .25
        );

      ctx.lineWidth =
        W * .013;

      ctx.beginPath();

      ctx.arc(
        W * .76,
        H * .39,
        W * .15,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }


    drawConfetti(
      ctx,
      W,
      H,
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
          W;

        const y =
          Math.abs(
            Math.sin(
              i * 13.71
            )
          ) *
          H;

        ctx.save();

        ctx.translate(
          x,
          y
        );

        ctx.rotate(i);

        ctx.fillStyle =
          i % 3 === 0
            ? "#ffffff"
            : accent;

        ctx.globalAlpha =
          .18;

        ctx.fillRect(
          -W * .004,
          -W * .011,
          W * .008,
          W * .022
        );

        ctx.restore();
      }
    }


    drawFrame(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.strokeStyle =
        rgba(
          accent,
          .30
        );

      ctx.lineWidth =
        W * .003;

      ctx.strokeRect(
        W * .05,
        H * .04,
        W * .90,
        H * .92
      );

      ctx.strokeStyle =
        "rgba(255,255,255,.05)";

      ctx.strokeRect(
        W * .61,
        H * .25,
        W * .28,
        H * .31
      );
    }


    drawNews(
      ctx,
      W,
      H,
      accent
    ) {
      for (
        let x = -W * .1;
        x < W * 1.2;
        x += W * .12
      ) {
        ctx.save();

        ctx.translate(
          x,
          H * .73
        );

        ctx.rotate(-.28);

        ctx.fillStyle =
          rgba(
            accent,
            .10
          );

        ctx.fillRect(
          0,
          -H * .18,
          W * .033,
          H * .36
        );

        ctx.restore();
      }
    }


    drawBrutalist(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.fillStyle =
        rgba(
          accent,
          .10
        );

      ctx.beginPath();

      ctx.moveTo(
        W * .56,
        0
      );

      ctx.lineTo(
        W,
        0
      );

      ctx.lineTo(
        W * .78,
        H
      );

      ctx.lineTo(
        W * .35,
        H
      );

      ctx.closePath();

      ctx.fill();
    }


    drawFilm(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.fillStyle =
        "rgba(255,225,185,.035)";

      ctx.fillRect(
        W * .55,
        0,
        W * .10,
        H
      );

      ctx.fillStyle =
        rgba(
          accent,
          .06
        );

      ctx.fillRect(
        W * .68,
        0,
        W * .20,
        H
      );
    }


    drawGrit(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.fillStyle =
        rgba(
          accent,
          .08
        );

      ctx.beginPath();

      ctx.moveTo(
        W * .65,
        0
      );

      ctx.lineTo(
        W,
        0
      );

      ctx.lineTo(
        W * .84,
        H
      );

      ctx.lineTo(
        W * .44,
        H
      );

      ctx.closePath();

      ctx.fill();
    }


    drawPaper(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.fillStyle =
        "rgba(255,255,255,.08)";

      ctx.fillRect(
        W * .57,
        0,
        W * .18,
        H
      );

      ctx.fillStyle =
        rgba(
          accent,
          .09
        );

      ctx.fillRect(
        0,
        H * .82,
        W,
        H * .04
      );
    }


    drawCollage(
      ctx,
      W,
      H,
      accent
    ) {
      for (
        let i = 0;
        i < 3;
        i++
      ) {
        ctx.save();

        ctx.translate(
          W *
          (
            .65 +
            i * .07
          ),
          H *
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
            : "rgba(255,255,255,.035)";

        ctx.fillRect(
          -W * .12,
          -H * .16,
          W * .24,
          H * .32
        );

        ctx.restore();
      }
    }


    drawStack(
      ctx,
      W,
      H,
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
          W *
          (
            .53 +
            i * .055
          ),
          H *
          (
            .12 +
            i * .06
          ),
          W * .31,
          H * .58
        );
      }
    }


    drawCutout(
      ctx,
      W,
      H,
      accent
    ) {
      const glow =
        ctx.createRadialGradient(
          W * .75,
          H * .38,
          0,
          W * .75,
          H * .38,
          W * .35
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
        "rgba(0,0,0,0)"
      );

      ctx.fillStyle =
        glow;

      ctx.fillRect(
        0,
        0,
        W,
        H
      );
    }


    drawRetro(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.strokeStyle =
        rgba(
          accent,
          .32
        );

      ctx.lineWidth =
        W * .006;

      ctx.strokeRect(
        W * .045,
        H * .04,
        W * .91,
        H * .92
      );

      ctx.fillStyle =
        "rgba(255,255,255,.05)";

      ctx.fillRect(
        W * .60,
        0,
        W * .08,
        H
      );
    }


    drawEditorial(
      ctx,
      W,
      H,
      accent
    ) {
      ctx.fillStyle =
        "rgba(255,255,255,.14)";

      ctx.fillRect(
        W * .64,
        0,
        W * .36,
        H
      );

      ctx.fillStyle =
        rgba(
          accent,
          .10
        );

      ctx.fillRect(
        0,
        H * .75,
        W,
        H * .015
      );
    }


    drawTexture(
      ctx,
      W,
      H
    ) {
      ctx.save();

      ctx.globalAlpha =
        .08;

      for (
        let i = 0;
        i < 520;
        i++
      ) {
        const x =
          Math.abs(
            Math.sin(
              i * 128.73
            )
          ) *
          W;

        const y =
          Math.abs(
            Math.sin(
              i * 43.17
            )
          ) *
          H;

        const s =
          1 +
          Math.abs(
            Math.sin(
              i * 5.7
            )
          ) *
          3;

        ctx.fillStyle =
          i % 3
            ? "#000000"
            : "#ffffff";

        ctx.fillRect(
          x,
          y,
          s,
          s
        );
      }

      ctx.restore();
    }


    /* ========================================================
       LAYERS
    ======================================================== */

    drawLayer(
      ctx,
      layer,
      W,
      H
    ) {
      if (
        layer.type ===
        "text"
      ) {
        this.drawTextLayer(
          ctx,
          layer,
          W,
          H
        );
      }

      if (
        layer.type ===
        "image"
      ) {
        this.drawImageLayer(
          ctx,
          layer,
          W,
          H
        );
      }

      if (
        layer.type ===
        "element"
      ) {
        this.drawElementLayer(
          ctx,
          layer,
          W,
          H
        );
      }
    }


    drawTextLayer(
      ctx,
      layer,
      W,
      H
    ) {
      const scale =
        W / 1080;

      const size =
        layer.size *
        scale;

      const x =
        W *
        (
          layer.x /
          100
        );

      const y =
        H *
        (
          layer.y /
          100
        );

      const maxWidth =
        W *
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
        "#ffffff";

      ctx.font =
        `${
          layer.weight ||
          700
        } ${size}px "${
          layer.font ||
          "Montserrat"
        }"`;

      ctx.textAlign =
        layer.align ||
        "left";

      ctx.textBaseline =
        "top";

      ctx.shadowColor =
        "rgba(0,0,0,.42)";

      ctx.shadowBlur =
        size * .08;

      ctx.shadowOffsetY =
        size * .035;


      const lines =
        this.wrapText(
          ctx,
          layer.text,
          maxWidth
        );

      const lineHeight =
        size *
        (
          layer.lineHeight ||
          1
        );

      let anchorX = x;

      if (
        layer.align ===
        "center"
      ) {
        anchorX = x;
      }

      if (
        layer.align ===
        "right"
      ) {
        anchorX = x;
      }


      lines.forEach(
        (line, index) => {
          this.fillTrackedText(
            ctx,
            line,
            anchorX,
            y +
            index *
            lineHeight,
            layer.letterSpacing ||
            0,
            layer.align ||
            "left"
          );
        }
      );


      const textHeight =
        Math.max(
          lineHeight,
          lines.length *
          lineHeight
        );


      let left = x;

      if (
        layer.align ===
        "center"
      ) {
        left =
          x -
          maxWidth / 2;
      }

      if (
        layer.align ===
        "right"
      ) {
        left =
          x -
          maxWidth;
      }


      layer._bounds = {
        x: left,
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
      W,
      H
    ) {
      const asset =
        this.assets.get(
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
        W *
        (
          layer.x /
          100
        );

      const centerY =
        H *
        (
          layer.y /
          100
        );

      const boxWidth =
        W *
        (
          layer.width /
          100
        ) *
        (
          layer.scale ||
          1
        );

      const ratio =
        image.naturalHeight /
        image.naturalWidth;

      const boxHeight =
        boxWidth *
        ratio;


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

      ctx.filter = [
        `brightness(${
          100 +
          (
            layer.brightness ||
            0
          )
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

        `blur(${
          layer.blur ||
          0
        }px)`
      ].join(" ");


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


    drawElementLayer(
      ctx,
      layer,
      W,
      H
    ) {
      const x =
        W *
        (
          layer.x /
          100
        );

      const y =
        H *
        (
          layer.y /
          100
        );

      const scale =
        (
          layer.scale ||
          1
        ) *
        W /
        1080;


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


      const color =
        layer.color ||
        this.state.accent;


      switch (
        layer.kind
      ) {

        case "ball":
          this.drawBallElement(
            ctx,
            color
          );
          break;

        case "wickets":
          this.drawWicketsElement(
            ctx,
            color
          );
          break;

        case "vs":
          this.drawVsElement(
            ctx,
            color
          );
          break;

        case "score":
          this.drawScoreElement(
            ctx,
            color
          );
          break;

        case "trophy":
          this.drawTrophyElement(
            ctx,
            color
          );
          break;

        case "frame":
          this.drawFrameElement(
            ctx,
            color
          );
          break;
      }


      const base =
        layer.kind ===
        "frame"
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


    drawBallElement(
      ctx,
      accent
    ) {
      ctx.fillStyle =
        "#9b1c29";

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
        "#f0d5d7";

      ctx.lineWidth = 5;

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

      ctx.lineWidth = 2;

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
        "#f3ead4";

      [
        -45,
        0,
        45
      ].forEach(
        x => {
          roundedRect(
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
        "rgba(8,9,11,.92)";

      ctx.strokeStyle =
        accent;

      ctx.lineWidth = 6;

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
        "#ffffff";

      ctx.font =
        '400 86px "Bebas Neue"';

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";

      ctx.fillText(
        "VS",
        0,
        6
      );
    }


    drawScoreElement(
      ctx,
      accent
    ) {
      ctx.fillStyle =
        "#101317";

      ctx.strokeStyle =
        accent;

      ctx.lineWidth = 3;

      roundedRect(
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
        "#ffffff";

      ctx.font =
        '400 62px "Bebas Neue"';

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";

      ctx.fillText(
        "186 / 5",
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

      roundedRect(
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

      roundedRect(
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

      ctx.lineWidth = 4;

      ctx.strokeRect(
        -155,
        -155,
        310,
        310
      );
    }


    /* ========================================================
       BRAND
    ======================================================== */

    drawOfficialBrand(
      ctx,
      W,
      H
    ) {
      if (
        this.state.showLogo
      ) {
        if (
          this.logoReady &&
          this.logo.naturalWidth
        ) {
          const maxW =
            W * .12;

          const maxH =
            H * .07;

          const scale =
            Math.min(
              maxW /
              this.logo.naturalWidth,
              maxH /
              this.logo.naturalHeight
            );

          const width =
            this.logo.naturalWidth *
            scale;

          const height =
            this.logo.naturalHeight *
            scale;

          ctx.save();

          ctx.shadowColor =
            "rgba(0,0,0,.48)";

          ctx.shadowBlur =
            W * .012;

          ctx.drawImage(
            this.logo,
            W * .052,
            H * .032,
            width,
            height
          );

          ctx.restore();
        } else {
          ctx.fillStyle =
            this.state.accent;

          ctx.font =
            `900 ${
              W * .032
            }px "Montserrat"`;

          ctx.fillText(
            "FWCWL",
            W * .055,
            H * .045
          );
        }
      }


      ctx.save();

      ctx.textAlign =
        "right";

      ctx.fillStyle =
        "rgba(255,255,255,.40)";

      ctx.font =
        `800 ${
          W * .014
        }px "DM Sans"`;

      ctx.fillText(
        this.state.brandName ||
        "FWCWL",
        W * .94,
        H * .955
      );

      ctx.restore();
    }


    drawSafeZone(
      ctx,
      W,
      H
    ) {
      ctx.save();

      ctx.strokeStyle =
        rgba(
          this.state.accent,
          .60
        );

      ctx.lineWidth =
        W * .002;

      ctx.setLineDash([
        W * .010,
        W * .007
      ]);

      ctx.strokeRect(
        W * .055,
        H * .055,
        W * .89,
        H * .89
      );

      ctx.restore();
    }


    drawSelection(
      ctx,
      bounds,
      W
    ) {
      ctx.save();

      ctx.strokeStyle =
        this.state.accent;

      ctx.lineWidth =
        Math.max(
          2,
          W * .002
        );

      ctx.setLineDash([
        W * .007,
        W * .005
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
            W * .006,
            0,
            Math.PI * 2
          );

          ctx.fill();
        }
      );

      ctx.restore();
    }


    /* ========================================================
       TEXT
    ======================================================== */

    wrapText(
      ctx,
      text,
      maxWidth
    ) {
      const paragraphs =
        String(
          text || ""
        ).split("\n");

      const lines = [];


      paragraphs.forEach(
        paragraph => {
          const words =
            paragraph.split(/\s+/);

          let current = "";


          words.forEach(
            word => {
              const test =
                current
                  ? `${current} ${word}`
                  : word;

              if (
                ctx.measureText(test)
                  .width >
                  maxWidth &&
                current
              ) {
                lines.push(
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


          lines.push(
            current
          );
        }
      );


      return lines;
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
            ctx.measureText(char)
              .width
        );

      const total =
        widths.reduce(
          (
            sum,
            width
          ) =>
            sum + width,
          0
        ) +
        spacing *
        Math.max(
          0,
          chars.length - 1
        );


      let cursor = x;

      if (
        align === "center"
      ) {
        cursor -=
          total / 2;
      }

      if (
        align === "right"
      ) {
        cursor -=
          total;
      }


      ctx.textAlign =
        "left";


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
    }


    /* ========================================================
       SELECT / DRAG
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
        let i =
          this.state.layers.length -
          1;
        i >= 0;
        i--
      ) {
        const layer =
          this.state.layers[i];

        const b =
          layer._bounds;

        if (
          !b ||
          layer.visible ===
          false ||
          layer.locked
        ) {
          continue;
        }

        if (
          x >= b.x &&
          x <= b.x + b.width &&
          y >= b.y &&
          y <= b.y + b.height
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

        this.render();

        this.renderInspector();

        return;
      }


      this.state.selectedId =
        layer.id;


      this.drag = {
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


      this.canvas.setPointerCapture?.(
        event.pointerId
      );


      this.render();

      this.renderInspector();
    }


    onPointerMove(
      event
    ) {
      if (!this.drag) {
        return;
      }

      const point =
        this.pointerCoordinates(
          event
        );

      const dx =
        point.x -
        this.drag.startX;

      const dy =
        point.y -
        this.drag.startY;


      let x =
        this.drag.originalX +
        dx /
        this.state.width *
        100;

      let y =
        this.drag.originalY +
        dy /
        this.state.height *
        100;


      if (
        this.state.snap
      ) {
        x =
          Math.round(
            x * 2
          ) / 2;

        y =
          Math.round(
            y * 2
          ) / 2;
      }


      this.drag.layer.x =
        clamp(
          x,
          0,
          100
        );

      this.drag.layer.y =
        clamp(
          y,
          0,
          100
        );


      this.render();

      this.renderInspectorValues();
    }


    onPointerUp() {
      if (!this.drag) {
        return;
      }

      this.drag = null;

      this.commit();
    }


    /* ========================================================
       ADD MEDIA
    ======================================================== */

    async importImages(
      files
    ) {
      for (
        const file of
        Array.from(files)
      ) {
        if (
          !file.type
            .startsWith("image/")
        ) {
          continue;
        }


        const url =
          URL.createObjectURL(
            file
          );

        const image =
          new Image();

        image.src = url;

        await image.decode();


        const id =
          uid("asset");


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
          uid("image"),

        type:
          "image",

        name:
          asset.name,

        assetId,

        x: 67,

        y: 45,

        width: 46,

        scale: 1,

        rotation: 0,

        opacity: 1,

        brightness: 0,

        contrast: 0,

        saturation: 0,

        blur: 0
      };


      this.state.layers.push(
        layer
      );

      this.state.selectedId =
        layer.id;


      this.render();

      this.renderInspector();

      this.commit();
    }


    renderAssets() {
      const grid =
        $("#posterAssetGrid");

      if (!grid) {
        return;
      }


      const assets =
        Array.from(
          this.assets.values()
        );


      grid.innerHTML =
        assets.length
          ? assets
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
                      ${escapeHtml(
                        asset.name
                      )}
                    </strong>

                  </button>
                `
              )
              .join("")
          : `
              <div class="empty-state">
                <strong>No uploaded media</strong>
                <span>
                  Upload a player or match photo.
                </span>
              </div>
            `;


      grid
        .querySelectorAll(
          "[data-poster-asset]"
        )
        .forEach(
          button => {
            button.addEventListener(
              "click",
              () =>
                this.addImageLayer(
                  button.dataset
                    .posterAsset
                )
            );
          }
        );
    }


    /* ========================================================
       ADD TEXT / ELEMENT
    ======================================================== */

    addText(
      type
    ) {
      const layer = {
        id:
          uid("text"),

        type:
          "text",

        name:
          type ===
          "headline"
            ? "Custom Headline"
            : "Custom Subtitle",

        text:
          type ===
          "headline"
            ? "YOUR HEADLINE"
            : "Add supporting text",

        x: 10,

        y:
          type ===
          "headline"
            ? 52
            : 67,

        width:
          type ===
          "headline"
            ? 75
            : 65,

        size:
          type ===
          "headline"
            ? 120
            : 30,

        weight:
          type ===
          "headline"
            ? 900
            : 650,

        font:
          type ===
          "headline"
            ? "Montserrat"
            : "DM Sans",

        color:
          "#ffffff",

        align:
          "left",

        opacity: 1,

        lineHeight:
          type ===
          "headline"
            ? .9
            : 1.1,

        letterSpacing: 0
      };


      this.state.layers.push(
        layer
      );

      this.state.selectedId =
        layer.id;

      this.render();

      this.renderInspector();

      this.commit();
    }


    addElement(
      kind
    ) {
      const layer = {
        id:
          uid("element"),

        type:
          "element",

        kind,

        name:
          {
            ball:
              "Cricket Ball",
            wickets:
              "Wickets",
            vs:
              "VS Badge",
            score:
              "Score Graphic",
            trophy:
              "Trophy",
            frame:
              "Frame"
          }[kind] ||
          "Element",

        x: 72,

        y: 43,

        scale: 1,

        rotation: 0,

        opacity: 1,

        color:
          this.state.accent
      };


      this.state.layers.push(
        layer
      );

      this.state.selectedId =
        layer.id;

      this.render();

      this.renderInspector();

      this.commit();
    }


    /* ========================================================
       INSPECTOR
    ======================================================== */

    renderInspector() {
      const container =
        $("#posterInspector");

      const layer =
        this.getSelected();


      if (!layer) {
        $("#posterInspectorTitle")
          .textContent =
          "Edit Design";

        $("#posterInspectorType")
          .textContent =
          "CANVAS";


        container.innerHTML = `
          <div class="inspector-section">

            <div class="micro-label">
              DESIGN
            </div>

            <h3>
              Canvas Settings
            </h3>

            ${this.rangeHtml(
              "posterOverlayStrength",
              "Texture Strength",
              0,
              100,
              0,
              "%"
            )}

          </div>


          <div class="inspector-section">

            <div class="micro-label">
              LAYERS
            </div>

            ${this.layersHtml()}

          </div>


          <div class="inspector-help">
            Select any text, photo or cricket
            graphic on the canvas to edit it.
            You can drag selected objects directly
            on the artwork.
          </div>
        `;

        this.bindLayerRows();

        return;
      }


      $("#posterInspectorTitle")
        .textContent =
        layer.name ||
        "Selected Layer";

      $("#posterInspectorType")
        .textContent =
        layer.type.toUpperCase();


      if (
        layer.type ===
        "text"
      ) {
        container.innerHTML =
          this.textInspectorHtml(
            layer
          );

        this.bindTextInspector(
          layer
        );
      }


      if (
        layer.type ===
        "image"
      ) {
        container.innerHTML =
          this.imageInspectorHtml(
            layer
          );

        this.bindImageInspector(
          layer
        );
      }


      if (
        layer.type ===
        "element"
      ) {
        container.innerHTML =
          this.elementInspectorHtml(
            layer
          );

        this.bindElementInspector(
          layer
        );
      }
    }


    layersHtml() {
      return `
        <div class="layer-list">

          ${this.state.layers
            .slice()
            .reverse()
            .map(
              layer => `
                <div
                  class="layer-row ${
                    layer.id ===
                    this.state.selectedId
                      ? "active"
                      : ""
                  }"
                >

                  <button
                    data-layer-visible="${layer.id}"
                    type="button"
                  >
                    ${
                      layer.visible ===
                      false
                        ? "○"
                        : "●"
                    }
                  </button>


                  <button
                    class="layer-main"
                    data-layer-select="${layer.id}"
                    type="button"
                  >

                    <span class="layer-icon">
                      ${
                        layer.type ===
                        "text"
                          ? "T"
                          : layer.type ===
                            "image"
                            ? "▧"
                            : "◇"
                      }
                    </span>

                    <span>
                      <strong>
                        ${escapeHtml(
                          layer.name ||
                          layer.type
                        )}
                      </strong>

                      <small>
                        ${layer.type}
                      </small>
                    </span>

                  </button>


                  <button
                    data-layer-lock="${layer.id}"
                    type="button"
                  >
                    ${
                      layer.locked
                        ? "■"
                        : "□"
                    }
                  </button>

                </div>
              `
            )
            .join("")}

        </div>
      `;
    }


    textInspectorHtml(
      layer
    ) {
      return `
        <div class="inspector-section">

          <div class="micro-label">
            CONTENT
          </div>

          <label class="field">
            <span>Text</span>

            <textarea
              id="insText"
            >${escapeHtml(
              layer.text
            )}</textarea>
          </label>

        </div>


        <div class="inspector-section">

          <div class="micro-label">
            TYPOGRAPHY
          </div>

          <div class="grid-2">

            <label class="field">
              <span>Font</span>

              <select id="insFont">

                ${[
                  "Montserrat",
                  "Bebas Neue",
                  "DM Sans",
                  "Poppins",
                  "Playfair Display"
                ]
                  .map(
                    font => `
                      <option
                        ${
                          layer.font ===
                          font
                            ? "selected"
                            : ""
                        }
                      >
                        ${font}
                      </option>
                    `
                  )
                  .join("")}

              </select>
            </label>


            <label class="field">
              <span>Weight</span>

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
                            ? "selected"
                            : ""
                        }
                      >
                        ${weight}
                      </option>
                    `
                  )
                  .join("")}

              </select>
            </label>

          </div>


          ${this.rangeHtml(
            "insSize",
            "Font Size",
            12,
            280,
            layer.size,
            ""
          )}


          ${this.rangeHtml(
            "insTextWidth",
            "Text Width",
            15,
            95,
            layer.width,
            "%"
          )}


          ${this.rangeHtml(
            "insLetterSpacing",
            "Letter Spacing",
            -5,
            30,
            layer.letterSpacing ||
            0,
            ""
          )}


          <label class="field">
            <span>Color</span>

            <input
              id="insTextColor"
              type="color"
              value="${
                layer.color.startsWith("#")
                  ? layer.color
                  : "#ffffff"
              }"
            >
          </label>


          <div class="segmented">

            ${[
              "left",
              "center",
              "right"
            ]
              .map(
                align => `
                  <button
                    class="${
                      layer.align ===
                      align
                        ? "active"
                        : ""
                    }"
                    data-text-align="${align}"
                    type="button"
                  >
                    ${align}
                  </button>
                `
              )
              .join("")}

          </div>

        </div>


        ${this.transformInspectorHtml(
          layer
        )}


        ${this.layerActionsHtml()}
      `;
    }


    imageInspectorHtml(
      layer
    ) {
      return `
        <div class="inspector-section">

          <div class="micro-label">
            PHOTO
          </div>

          <h3>
            ${escapeHtml(
              layer.name
            )}
          </h3>


          ${this.rangeHtml(
            "insImageWidth",
            "Size",
            10,
            120,
            layer.width,
            "%"
          )}


          ${this.rangeHtml(
            "insImageScale",
            "Scale",
            20,
            300,
            (
              layer.scale ||
              1
            ) * 100,
            "%"
          )}

        </div>


        ${this.transformInspectorHtml(
          layer
        )}


        <div class="inspector-section">

          <div class="micro-label">
            ADJUST
          </div>

          ${this.rangeHtml(
            "insBrightness",
            "Brightness",
            -100,
            100,
            layer.brightness ||
            0,
            ""
          )}

          ${this.rangeHtml(
            "insContrast",
            "Contrast",
            -100,
            100,
            layer.contrast ||
            0,
            ""
          )}

          ${this.rangeHtml(
            "insSaturation",
            "Saturation",
            -100,
            100,
            layer.saturation ||
            0,
            ""
          )}

          ${this.rangeHtml(
            "insBlur",
            "Blur",
            0,
            20,
            layer.blur ||
            0,
            ""
          )}

        </div>


        ${this.layerActionsHtml()}
      `;
    }


    elementInspectorHtml(
      layer
    ) {
      return `
        <div class="inspector-section">

          <div class="micro-label">
            CRICKET ELEMENT
          </div>

          <h3>
            ${escapeHtml(
              layer.name
            )}
          </h3>


          <label class="field">
            <span>Color</span>

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


    transformInspectorHtml(
      layer
    ) {
      return `
        <div class="inspector-section">

          <div class="micro-label">
            TRANSFORM
          </div>

          ${this.rangeHtml(
            "insX",
            "Horizontal",
            0,
            100,
            layer.x,
            "%"
          )}

          ${this.rangeHtml(
            "insY",
            "Vertical",
            0,
            100,
            layer.y,
            "%"
          )}

          ${
            layer.type ===
            "element"
              ? this.rangeHtml(
                  "insScale",
                  "Scale",
                  20,
                  300,
                  (
                    layer.scale ||
                    1
                  ) * 100,
                  "%"
                )
              : ""
          }

          ${
            layer.type !==
            "text"
              ? this.rangeHtml(
                  "insRotation",
                  "Rotation",
                  -180,
                  180,
                  layer.rotation ||
                  0,
                  "°"
                )
              : ""
          }

          ${this.rangeHtml(
            "insOpacity",
            "Opacity",
            0,
            100,
            (
              layer.opacity ??
              1
            ) * 100,
            "%"
          )}

        </div>
      `;
    }


    layerActionsHtml() {
      return `
        <div class="inspector-section">

          <div class="micro-label">
            ARRANGE
          </div>

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

            <b id="${id}Value">
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


    bindTextInspector(
      layer
    ) {
      this.bindInput(
        "#insText",
        "input",
        event => {
          layer.text =
            event.target.value;

          this.render();
        },
        true
      );


      this.bindInput(
        "#insFont",
        "change",
        event => {
          layer.font =
            event.target.value;

          this.render();

          this.commit();
        }
      );


      this.bindInput(
        "#insWeight",
        "change",
        event => {
          layer.weight =
            Number(
              event.target.value
            );

          this.render();

          this.commit();
        }
      );


      this.bindRange(
        "#insSize",
        value => {
          layer.size = value;
          this.render();
        }
      );


      this.bindRange(
        "#insTextWidth",
        value => {
          layer.width = value;
          this.render();
        }
      );


      this.bindRange(
        "#insLetterSpacing",
        value => {
          layer.letterSpacing =
            value;

          this.render();
        }
      );


      this.bindInput(
        "#insTextColor",
        "input",
        event => {
          layer.color =
            event.target.value;

          this.render();
        },
        true
      );


      $$(
        "[data-text-align]"
      ).forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              layer.align =
                button.dataset
                  .textAlign;

              this.render();

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
        "#insImageWidth",
        value => {
          layer.width =
            value;

          this.render();
        }
      );


      this.bindRange(
        "#insImageScale",
        value => {
          layer.scale =
            value / 100;

          this.render();
        }
      );


      this.bindRange(
        "#insBrightness",
        value => {
          layer.brightness =
            value;

          this.render();
        }
      );


      this.bindRange(
        "#insContrast",
        value => {
          layer.contrast =
            value;

          this.render();
        }
      );


      this.bindRange(
        "#insSaturation",
        value => {
          layer.saturation =
            value;

          this.render();
        }
      );


      this.bindRange(
        "#insBlur",
        value => {
          layer.blur =
            value;

          this.render();
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
        "#insElementColor",
        "input",
        event => {
          layer.color =
            event.target.value;

          this.render();
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
        "#insX",
        value => {
          layer.x = value;
          this.render();
        }
      );


      this.bindRange(
        "#insY",
        value => {
          layer.y = value;
          this.render();
        }
      );


      if (
        $("#insScale")
      ) {
        this.bindRange(
          "#insScale",
          value => {
            layer.scale =
              value / 100;

            this.render();
          }
        );
      }


      if (
        $("#insRotation")
      ) {
        this.bindRange(
          "#insRotation",
          value => {
            layer.rotation =
              value;

            this.render();
          }
        );
      }


      this.bindRange(
        "#insOpacity",
        value => {
          layer.opacity =
            value / 100;

          this.render();
        }
      );
    }


    bindLayerActions() {
      $("#insDuplicate")
        ?.addEventListener(
          "click",
          () =>
            this.duplicateSelected()
        );

      $("#insDelete")
        ?.addEventListener(
          "click",
          () =>
            this.deleteSelected()
        );

      $("#insBringForward")
        ?.addEventListener(
          "click",
          () =>
            this.moveSelected(1)
        );

      $("#insSendBackward")
        ?.addEventListener(
          "click",
          () =>
            this.moveSelected(-1)
        );
    }


    bindLayerRows() {
      $$(
        "[data-layer-select]"
      ).forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.state.selectedId =
                button.dataset
                  .layerSelect;

              this.render();

              this.renderInspector();
            }
          );
        }
      );


      $$(
        "[data-layer-visible]"
      ).forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
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

              this.render();

              this.renderInspector();

              this.commit();
            }
          );
        }
      );


      $$(
        "[data-layer-lock]"
      ).forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
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

              this.renderInspector();

              this.commit();
            }
          );
        }
      );
    }


    renderInspectorValues() {
      const selected =
        this.getSelected();

      if (!selected) {
        return;
      }

      const x =
        $("#insX");

      const y =
        $("#insY");

      if (x) {
        x.value =
          selected.x;

        $("#insXValue")
          .textContent =
          `${Math.round(
            selected.x
          )}%`;
      }

      if (y) {
        y.value =
          selected.y;

        $("#insYValue")
          .textContent =
          `${Math.round(
            selected.y
          )}%`;
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
        JSON.parse(
          JSON.stringify(layer)
        );

      copy.id =
        uid(layer.type);

      copy.name =
        `${layer.name} Copy`;

      copy.x =
        clamp(
          layer.x + 2,
          0,
          100
        );

      copy.y =
        clamp(
          layer.y + 2,
          0,
          100
        );

      delete copy._bounds;


      this.state.layers.push(
        copy
      );

      this.state.selectedId =
        copy.id;

      this.render();

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
            layer.id !== id
        );

      this.state.selectedId =
        null;

      this.render();

      this.renderInspector();

      this.commit();
    }


    moveSelected(
      direction
    ) {
      const id =
        this.state.selectedId;

      const index =
        this.state.layers.findIndex(
          layer =>
            layer.id === id
        );

      if (
        index < 0
      ) {
        return;
      }


      const target =
        clamp(
          index + direction,
          0,
          this.state.layers.length -
          1
        );


      const [
        layer
      ] =
        this.state.layers.splice(
          index,
          1
        );

      this.state.layers.splice(
        target,
        0,
        layer
      );

      this.render();

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
          this.state.layers.map(
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
        ] === snapshot
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
        60
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

      this.render();

      this.renderInspector();

      this.renderTemplates();
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
        FORMATS[format];

      if (!definition) {
        return;
      }


      this.state.format =
        format;

      this.state.width =
        definition.width;

      this.state.height =
        definition.height;


      $("#posterDimensions")
        .textContent =
        `${definition.width} × ${definition.height}`;


      this.render();

      this.fitCanvas();

      this.commit();
    }


    fitCanvas() {
      const stage =
        $("#posterStage");

      if (!stage) {
        return;
      }


      const availableWidth =
        stage.clientWidth -
        70;

      const availableHeight =
        stage.clientHeight -
        60;


      const zoom =
        Math.min(
          availableWidth /
          this.state.width,

          availableHeight /
          this.state.height,

          1
        );


      this.state.zoom =
        Math.max(
          .10,
          zoom
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


      $("#posterZoomValue")
        .textContent =
        `${
          Math.round(
            zoom * 100
          )
        }%`;
    }


    /* ========================================================
       EXPORT
    ======================================================== */

    openExport() {
      $("#posterExportBackdrop")
        ?.remove();


      const modal =
        document.createElement(
          "div"
        );

      modal.id =
        "posterExportBackdrop";

      modal.className =
        "export-backdrop";


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
            Export the current design at
            full canvas resolution.
          </p>


          <div class="export-options">

            <button
              class="export-option"
              data-poster-export="png"
              type="button"
            >
              <strong>PNG</strong>
              <span>
                Highest visual quality
              </span>
            </button>


            <button
              class="export-option"
              data-poster-export="jpg"
              type="button"
            >
              <strong>JPG</strong>
              <span>
                Smaller social-media file
              </span>
            </button>

          </div>

        </div>
      `;


      document.body.appendChild(
        modal
      );


      $("#posterExportClose")
        .addEventListener(
          "click",
          () =>
            modal.remove()
        );


      modal
        .querySelectorAll(
          "[data-poster-export]"
        )
        .forEach(
          button => {
            button.addEventListener(
              "click",
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
      this.render(true);


      const mime =
        format === "jpg"
          ? "image/jpeg"
          : "image/png";


      const quality =
        format === "jpg"
          ? .94
          : undefined;


      this.canvas.toBlob(
        blob => {
          if (!blob) {
            return;
          }

          const url =
            URL.createObjectURL(
              blob
            );

          const link =
            document.createElement(
              "a"
            );

          link.href = url;

          link.download =
            `fwcwl-${
              this.state.templateId
            }.${
              format ===
              "jpg"
                ? "jpg"
                : "png"
            }`;

          document.body.appendChild(
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

          this.render();
        },
        mime,
        quality
      );
    }


    /* ========================================================
       RESET
    ======================================================== */

    reset() {
      const confirmed =
        window.confirm(
          "Reset the current poster design?"
        );

      if (!confirmed) {
        return;
      }

      this.applyTemplate(
        "match-day",
        false
      );

      this.state.selectedId =
        null;

      this.render();

      this.renderInspector();

      this.commit();
    }


    /* ========================================================
       UI
    ======================================================== */

    bindUI() {
      $$(
        "[data-poster-tab]"
      ).forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              $$(
                "[data-poster-tab]"
              ).forEach(
                item =>
                  item.classList.remove(
                    "active"
                  )
              );

              button.classList.add(
                "active"
              );


              $$(".poster-left-panel")
                .forEach(
                  panel =>
                    panel.classList.remove(
                      "active"
                    )
                );


              const panel =
                $(
                  `#poster${
                    button.dataset
                      .posterTab
                      .charAt(0)
                      .toUpperCase() +
                    button.dataset
                      .posterTab
                      .slice(1)
                  }Panel`
                );


              panel?.classList.add(
                "active"
              );
            }
          );
        }
      );


      $("#posterTemplateSearch")
        ?.addEventListener(
          "input",
          event => {
            this.search =
              event.target.value;

            this.renderTemplates();
          }
        );


      $$(
        "[data-filter]"
      ).forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              $$(
                "[data-filter]"
              ).forEach(
                item =>
                  item.classList.remove(
                    "active"
                  )
              );

              button.classList.add(
                "active"
              );

              this.filter =
                button.dataset
                  .filter;

              this.renderTemplates();
            }
          );
        }
      );


      $("#posterUploadMediaBtn")
        ?.addEventListener(
          "click",
          () =>
            $("#posterMediaInput")
              ?.click()
        );


      $("#posterMediaInput")
        ?.addEventListener(
          "change",
          async event => {
            await this.importImages(
              event.target.files
            );

            event.target.value =
              "";
          }
        );


      $$(
        "[data-add-poster-text]"
      ).forEach(
        button => {
          button.addEventListener(
            "click",
            () =>
              this.addText(
                button.dataset
                  .addPosterText
              )
          );
        }
      );


      $$(
        "[data-add-poster-element]"
      ).forEach(
        button => {
          button.addEventListener(
            "click",
            () =>
              this.addElement(
                button.dataset
                  .addPosterElement
              )
          );
        }
      );


      $("#posterCanvasSize")
        ?.addEventListener(
          "change",
          event =>
            this.changeFormat(
              event.target.value
            )
        );


      $("#posterSafeZoneBtn")
        ?.addEventListener(
          "click",
          event => {
            this.state.safeZone =
              !this.state.safeZone;

            event.currentTarget
              .classList
              .toggle(
                "active",
                this.state.safeZone
              );

            this.render();

            this.commit();
          }
        );


      $("#posterSnapBtn")
        ?.addEventListener(
          "click",
          event => {
            this.state.snap =
              !this.state.snap;

            event.currentTarget
              .classList
              .toggle(
                "active",
                this.state.snap
              );

            this.commit();
          }
        );


      $("#posterFitBtn")
        ?.addEventListener(
          "click",
          () =>
            this.fitCanvas()
        );


      $("#posterZoomInBtn")
        ?.addEventListener(
          "click",
          () => {
            this.state.zoom =
              clamp(
                this.state.zoom +
                .05,
                .10,
                1.25
              );

            this.applyZoom();
          }
        );


      $("#posterZoomOutBtn")
        ?.addEventListener(
          "click",
          () => {
            this.state.zoom =
              clamp(
                this.state.zoom -
                .05,
                .10,
                1.25
              );

            this.applyZoom();
          }
        );


      $("#posterBrandName")
        ?.addEventListener(
          "input",
          event => {
            this.state.brandName =
              event.target.value;

            this.render();
          }
        );


      $("#posterAccentColor")
        ?.addEventListener(
          "input",
          event => {
            this.state.accent =
              event.target.value;

            $("#posterAccentText")
              .value =
              event.target.value
                .toUpperCase();

            this.render();
          }
        );


      $("#posterAccentText")
        ?.addEventListener(
          "change",
          event => {
            const value =
              hex(
                event.target.value
              );

            if (!value) {
              this.syncBrandUI();

              return;
            }

            this.state.accent =
              value;

            this.syncBrandUI();

            this.render();

            this.commit();
          }
        );


      $("#posterBackgroundColor")
        ?.addEventListener(
          "input",
          event => {
            this.state.background =
              event.target.value;

            $("#posterBackgroundText")
              .value =
              event.target.value
                .toUpperCase();

            this.render();
          }
        );


      $("#posterLogoToggle")
        ?.addEventListener(
          "change",
          event => {
            this.state.showLogo =
              event.target.checked;

            this.render();

            this.commit();
          }
        );


      this.canvas.addEventListener(
        "pointerdown",
        event =>
          this.onPointerDown(
            event
          )
      );

      this.canvas.addEventListener(
        "pointermove",
        event =>
          this.onPointerMove(
            event
          )
      );

      window.addEventListener(
        "pointerup",
        () =>
          this.onPointerUp()
      );


      $("#undoBtn")
        ?.addEventListener(
          "click",
          () =>
            this.undo()
        );


      $("#redoBtn")
        ?.addEventListener(
          "click",
          () =>
            this.redo()
        );


      $("#resetBtn")
        ?.addEventListener(
          "click",
          () =>
            this.reset()
        );


      $("#exportTopBtn")
        ?.addEventListener(
          "click",
          () =>
            this.openExport()
        );


      $("#downloadPosterBtn")
        ?.addEventListener(
          "click",
          () =>
            this.openExport()
        );


      window.addEventListener(
        "resize",
        () =>
          this.fitCanvas()
      );


      document.addEventListener(
        "keydown",
        event => {
          if (
            $("#posterWorkspace")
              ?.style
              .display ===
              "none"
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
              "z"
          ) {
            event.preventDefault();

            event.shiftKey
              ? this.redo()
              : this.undo();
          }


          if (
            command &&
            event.key
              .toLowerCase() ===
              "d"
          ) {
            event.preventDefault();

            this.duplicateSelected();
          }


          if (
            event.key ===
              "Delete" ||
            event.key ===
              "Backspace"
          ) {
            this.deleteSelected();
          }
        }
      );
    }


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
        "change"
      ) {
        element.addEventListener(
          "change",
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


      input.addEventListener(
        "input",
        () => {
          const value =
            Number(
              input.value
            );

          callback(value);


          const label =
            $(
              `${selector}Value`
            );

          if (label) {
            const old =
              label.textContent;

            const suffix =
              old.includes("%")
                ? "%"
                : old.includes("°")
                  ? "°"
                  : "";

            label.textContent =
              `${Math.round(
                value
              )}${suffix}`;
          }
        }
      );


      input.addEventListener(
        "change",
        () =>
          this.commit()
      );
    }


    syncBrandUI() {
      if (
        $("#posterBrandName")
      ) {
        $("#posterBrandName")
          .value =
          this.state.brandName;
      }

      if (
        $("#posterAccentColor")
      ) {
        $("#posterAccentColor")
          .value =
          this.state.accent;
      }

      if (
        $("#posterAccentText")
      ) {
        $("#posterAccentText")
          .value =
          this.state.accent
            .toUpperCase();
      }

      if (
        $("#posterBackgroundColor")
      ) {
        $("#posterBackgroundColor")
          .value =
          this.state.background;
      }

      if (
        $("#posterBackgroundText")
      ) {
        $("#posterBackgroundText")
          .value =
          this.state.background
            .toUpperCase();
      }

      if (
        $("#posterLogoToggle")
      ) {
        $("#posterLogoToggle")
          .checked =
          this.state.showLogo;
      }
    }


    syncAllUI() {
      $("#posterCanvasSize")
        .value =
        this.state.format;

      $("#posterSafeZoneBtn")
        .classList
        .toggle(
          "active",
          this.state.safeZone
        );

      $("#posterSnapBtn")
        .classList
        .toggle(
          "active",
          this.state.snap
        );

      $("#posterDimensions")
        .textContent =
        `${
          this.state.width
        } × ${
          this.state.height
        }`;

      this.syncBrandUI();

      this.applyZoom();
    }

  }


  /* ==========================================================
     INIT
  ========================================================== */

  window.addEventListener(
    "DOMContentLoaded",
    () => {
      window.FWCWLPosterEditor =
        new PosterEditor();
    }
  );

})();
