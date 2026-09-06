/* ============================================================
   FWCWL CREATIVE STUDIO
   VIDEO TEMPLATE LIBRARY V2
============================================================ */

export const VIDEO_FORMATS = {
  reel: {
    label: "Reel / Story",
    width: 1080,
    height: 1920
  },
  portrait: {
    label: "Instagram Portrait",
    width: 1080,
    height: 1350
  },
  square: {
    label: "Square",
    width: 1080,
    height: 1080
  },
  landscape: {
    label: "Landscape",
    width: 1920,
    height: 1080
  }
};

export const VIDEO_TRACKS = [
  {
    id: "media",
    label: "MEDIA",
    type: "media"
  },
  {
    id: "overlay",
    label: "OVERLAY",
    type: "overlay"
  },
  {
    id: "headline",
    label: "HEADLINE",
    type: "text"
  },
  {
    id: "details",
    label: "DETAILS",
    type: "text"
  },
  {
    id: "elements",
    label: "ELEMENTS",
    type: "element"
  },
  {
    id: "audio",
    label: "AUDIO",
    type: "audio"
  }
];

const uid = prefix =>
  `${prefix}-${crypto.randomUUID()}`;

const mediaClip = duration => ({
  id: uid("clip"),
  trackId: "media",
  type: "media",
  start: 0,
  duration,
  inPoint: 0,
  assetId: null,
  placeholder: true,
  name: "Main Media",
  fit: "cover",
  opacity: 1,
  speed: 1,
  volume: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  animationIn: "slowZoom",
  animationOut: "none",
  transitionIn: "fade",
  transitionOut: "fade",
  effects: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    vibrance: 0,
    blur: 0,
    vignette: 20,
    grain: 4
  }
});

const overlayClip = (duration, preset) => ({
  id: uid("clip"),
  trackId: "overlay",
  type: "overlay",
  start: 0,
  duration,
  name: "Template Treatment",
  preset,
  opacity: 1
});

const textClip = ({
  trackId = "headline",
  start,
  duration,
  text,
  name,
  size,
  weight = 900,
  color = "#ffffff",
  accent = false,
  align = "left",
  x = 8,
  y = 50,
  width = 78,
  font = "Montserrat",
  animationIn = "sportsSlam",
  animationOut = "fade",
  uppercase = false,
  letterSpacing = 0,
  lineHeight = 0.9
}) => ({
  id: uid("clip"),
  trackId,
  type: "text",
  start,
  duration,
  text,
  name: name || text,
  font,
  size,
  weight,
  color,
  accent,
  align,
  x,
  y,
  width,
  opacity: 1,
  rotation: 0,
  animationIn,
  animationOut,
  transitionIn: "none",
  transitionOut: "none",
  uppercase,
  letterSpacing,
  lineHeight,
  shadow: true
});

const elementClip = ({
  start,
  duration,
  kind,
  name,
  x = 50,
  y = 50,
  scale = 1,
  color = null,
  animationIn = "impactZoom",
  animationOut = "fade"
}) => ({
  id: uid("clip"),
  trackId: "elements",
  type: "element",
  start,
  duration,
  kind,
  name: name || kind,
  x,
  y,
  scale,
  color,
  opacity: 1,
  rotation: 0,
  animationIn,
  animationOut
});

function standardTemplate({
  id,
  name,
  category,
  art,
  duration = 8,
  palette,
  kicker,
  headline,
  detail,
  cta,
  headlineSize = 150,
  headlineY = 45,
  headlineWidth = 82,
  headlineAlign = "left",
  headlineFont = "Montserrat",
  mediaAnimation = "slowZoom",
  tags = []
}) {
  const mainMedia = mediaClip(duration);
  mainMedia.animationIn = mediaAnimation;

  return {
    id,
    name,
    category,
    art,
    duration,
    palette,
    tags,
    clips: [
      mainMedia,
      overlayClip(duration, art),

      textClip({
        trackId: "details",
        start: 0.45,
        duration: Math.min(2.4, duration - 0.45),
        text: kicker,
        name: "Eyebrow",
        size: 27,
        weight: 900,
        accent: true,
        y: headlineY - 8,
        width: headlineWidth,
        animationIn: "trackingIn",
        animationOut: "fade"
      }),

      textClip({
        start: 0.75,
        duration: Math.max(2.3, duration - 2.2),
        text: headline,
        name: "Headline",
        size: headlineSize,
        weight: 900,
        align: headlineAlign,
        y: headlineY,
        width: headlineWidth,
        font: headlineFont,
        animationIn: "sportsSlam",
        animationOut: "blurOut",
        lineHeight: 0.82
      }),

      textClip({
        trackId: "details",
        start: Math.min(2.2, duration * 0.28),
        duration: Math.max(2, duration - 3),
        text: detail,
        name: "Details",
        size: 31,
        weight: 650,
        y: headlineY + 25,
        width: 72,
        animationIn: "fadeUp",
        animationOut: "fade"
      }),

      textClip({
        trackId: "details",
        start: Math.max(0, duration - 2.1),
        duration: 1.8,
        text: cta,
        name: "Call To Action",
        size: 23,
        weight: 900,
        accent: true,
        y: 80,
        width: 60,
        animationIn: "impactZoom",
        animationOut: "fade",
        uppercase: true
      })
    ]
  };
}

export const VIDEO_TEMPLATES = [
  standardTemplate({
    id: "match-day-impact",
    name: "Match Day Impact",
    category: "match",
    art: "impact",
    duration: 8,
    palette: ["#09090b", "#5c111a", "#f1c34d"],
    kicker: "FWCWL • MATCH DAY",
    headline: "MATCH\nDAY",
    detail: "SATURDAY • 10:00 AM • TAMPA, FL",
    cta: "GAME ON",
    headlineSize: 188,
    tags: ["match", "impact", "sports", "reel"]
  }),

  standardTemplate({
    id: "big-vs",
    name: "Big VS",
    category: "match",
    art: "versus",
    duration: 8,
    palette: ["#071724", "#65151e", "#f1c34d"],
    kicker: "THE SHOWDOWN",
    headline: "TEAM A\nVS\nTEAM B",
    detail: "TWO TEAMS • ONE GROUND • ONE WINNER",
    cta: "MATCH DAY",
    headlineSize: 142,
    headlineAlign: "center",
    headlineWidth: 84,
    headlineY: 36,
    headlineFont: "Bebas Neue",
    tags: ["vs", "match", "teams"]
  }),

  standardTemplate({
    id: "game-night",
    name: "Game Night",
    category: "match",
    art: "stadium",
    duration: 9,
    palette: ["#03161e", "#0b3342", "#e9b93b"],
    kicker: "UNDER THE LIGHTS",
    headline: "GAME\nNIGHT",
    detail: "FWCWL • PRIME TIME CRICKET",
    cta: "TONIGHT",
    headlineSize: 176,
    tags: ["night", "stadium", "lights"]
  }),

  standardTemplate({
    id: "fixture-drop",
    name: "Fixture Drop",
    category: "match",
    art: "fixture",
    duration: 7,
    palette: ["#111214", "#4d0e17", "#f1c34d"],
    kicker: "NEXT FIXTURE",
    headline: "SATURDAY\n10:00 AM",
    detail: "TAMPA • FLORIDA",
    cta: "SAVE THE DATE",
    headlineSize: 132,
    tags: ["fixture", "schedule", "date"]
  }),

  standardTemplate({
    id: "player-spotlight",
    name: "Player Spotlight",
    category: "player",
    art: "player",
    duration: 8,
    palette: ["#071d22", "#531721", "#f1c34d"],
    kicker: "FWCWL PLAYER SERIES",
    headline: "PLAYER\nSPOTLIGHT",
    detail: "NAME • ROLE • TEAM",
    cta: "WATCH THIS SPACE",
    headlineSize: 150,
    headlineWidth: 55,
    tags: ["player", "profile", "spotlight"]
  }),

  standardTemplate({
    id: "player-of-match",
    name: "Player of the Match",
    category: "player",
    art: "award",
    duration: 8,
    palette: ["#141117", "#661b2a", "#d6a93b"],
    kicker: "OUTSTANDING PERFORMANCE",
    headline: "PLAYER OF\nTHE MATCH",
    detail: "A PERFORMANCE THAT CHANGED THE GAME",
    cta: "MATCH AWARD",
    headlineSize: 140,
    headlineWidth: 60,
    tags: ["motm", "award", "player"]
  }),

  standardTemplate({
    id: "mvp",
    name: "MVP",
    category: "player",
    art: "gold",
    duration: 7,
    palette: ["#080808", "#271d0b", "#f6cf5b"],
    kicker: "MOST VALUABLE PLAYER",
    headline: "MVP",
    detail: "PURE IMPACT • PURE PERFORMANCE",
    cta: "FWCWL",
    headlineSize: 240,
    headlineAlign: "center",
    headlineWidth: 84,
    headlineY: 40,
    tags: ["mvp", "gold", "award"]
  }),

  standardTemplate({
    id: "captain-reveal",
    name: "Captain Reveal",
    category: "player",
    art: "captain",
    duration: 8,
    palette: ["#07141b", "#301118", "#f1c34d"],
    kicker: "LEADING THE SIDE",
    headline: "OUR\nCAPTAIN",
    detail: "LEADERSHIP • BELIEF • INTENT",
    cta: "C",
    headlineSize: 164,
    tags: ["captain", "leader"]
  }),

  standardTemplate({
    id: "playing-xi",
    name: "Playing XI",
    category: "team",
    art: "lineup",
    duration: 10,
    palette: ["#061a18", "#102b24", "#e9bc43"],
    kicker: "OFFICIAL TEAM SHEET",
    headline: "PLAYING\nXI",
    detail: "MATCH DAY LINEUP",
    cta: "TEAM LOCKED",
    headlineSize: 178,
    tags: ["playing xi", "lineup", "team"]
  }),

  standardTemplate({
    id: "squad-reveal",
    name: "Squad Reveal",
    category: "team",
    art: "squad",
    duration: 10,
    palette: ["#171012", "#5e1620", "#efc14b"],
    kicker: "MEET THE TEAM",
    headline: "SQUAD\nREVEAL",
    detail: "FWCWL CRICKET",
    cta: "READY",
    headlineSize: 158,
    tags: ["squad", "players", "team"]
  }),

  standardTemplate({
    id: "jersey-reveal",
    name: "Jersey Reveal",
    category: "team",
    art: "jersey",
    duration: 9,
    palette: ["#05070a", "#10293a", "#d9ad39"],
    kicker: "NEW SEASON • NEW IDENTITY",
    headline: "JERSEY\nREVEAL",
    detail: "BUILT FOR THE GAME",
    cta: "2026",
    headlineSize: 165,
    tags: ["jersey", "reveal", "kit"],
    mediaAnimation: "heroRise"
  }),

  standardTemplate({
    id: "team-announcement",
    name: "Team Announcement",
    category: "team",
    art: "split",
    duration: 8,
    palette: ["#090a0c", "#62161d", "#f1c34d"],
    kicker: "OFFICIAL ANNOUNCEMENT",
    headline: "THE TEAM\nIS READY",
    detail: "FWCWL • TAMPA",
    cta: "LET'S GO",
    headlineSize: 145,
    tags: ["team", "announcement"]
  }),

  standardTemplate({
    id: "match-result",
    name: "Match Result",
    category: "result",
    art: "result",
    duration: 7,
    palette: ["#071b1e", "#43131a", "#f0c34c"],
    kicker: "FINAL RESULT",
    headline: "VICTORY",
    detail: "186/5 • WON BY 24 RUNS",
    cta: "FULL TIME",
    headlineSize: 186,
    tags: ["result", "victory", "win"]
  }),

  standardTemplate({
    id: "scoreboard",
    name: "Scoreboard",
    category: "result",
    art: "scoreboard",
    duration: 7,
    palette: ["#050708", "#162429", "#f1c34d"],
    kicker: "FINAL SCORE",
    headline: "186 / 5",
    detail: "20 OVERS • TARGET 163",
    cta: "FWCWL",
    headlineSize: 190,
    headlineFont: "Bebas Neue",
    tags: ["score", "scorecard", "broadcast"]
  }),

  standardTemplate({
    id: "live-score",
    name: "Live Score",
    category: "result",
    art: "live",
    duration: 8,
    palette: ["#061219", "#17191f", "#e93442"],
    kicker: "● LIVE",
    headline: "142 / 4",
    detail: "16.2 OVERS • NEED 38 FROM 22",
    cta: "LIVE NOW",
    headlineSize: 190,
    headlineFont: "Bebas Neue",
    tags: ["live", "score", "broadcast"]
  }),

  standardTemplate({
    id: "champions",
    name: "Champions",
    category: "result",
    art: "champions",
    duration: 10,
    palette: ["#080808", "#321d0c", "#f1c34d"],
    kicker: "FWCWL CHAMPIONS",
    headline: "CHAMPIONS",
    detail: "THE TROPHY IS OURS",
    cta: "HISTORY MADE",
    headlineSize: 170,
    headlineAlign: "center",
    headlineWidth: 86,
    headlineY: 45,
    tags: ["champions", "trophy", "celebration"]
  }),

  standardTemplate({
    id: "the-final",
    name: "The Final",
    category: "event",
    art: "final",
    duration: 9,
    palette: ["#08080a", "#411017", "#f2ca55"],
    kicker: "CHAMPIONSHIP",
    headline: "THE\nFINAL",
    detail: "ONE GAME • ONE TROPHY",
    cta: "WHO TAKES IT?",
    headlineSize: 192,
    headlineAlign: "center",
    headlineWidth: 80,
    headlineY: 39,
    tags: ["final", "championship"]
  }),

  standardTemplate({
    id: "semi-final",
    name: "Semi Final",
    category: "event",
    art: "semifinal",
    duration: 8,
    palette: ["#071120", "#721724", "#f1c34d"],
    kicker: "ONE STEP FROM THE FINAL",
    headline: "SEMI\nFINAL",
    detail: "EVERY BALL MATTERS",
    cta: "GAME ON",
    headlineSize: 174,
    headlineAlign: "center",
    headlineWidth: 82,
    headlineY: 39,
    tags: ["semi final", "playoffs"]
  }),

  standardTemplate({
    id: "tournament-promo",
    name: "Tournament Promo",
    category: "event",
    art: "tournament",
    duration: 10,
    palette: ["#062024", "#0d4d4c", "#edbc42"],
    kicker: "FWCWL PRESENTS",
    headline: "WINTER\nLEAGUE",
    detail: "TAMPA • FLORIDA • 2026",
    cta: "REGISTER NOW",
    headlineSize: 160,
    tags: ["tournament", "league"]
  }),

  standardTemplate({
    id: "registration",
    name: "Registration Open",
    category: "event",
    art: "registration",
    duration: 8,
    palette: ["#121013", "#5a121d", "#f1c34d"],
    kicker: "REGISTRATION IS OPEN",
    headline: "JOIN\nTHE LEAGUE",
    detail: "TEAMS • PLAYERS • CRICKET",
    cta: "REGISTER TODAY",
    headlineSize: 151,
    tags: ["registration", "join"]
  }),

  standardTemplate({
    id: "tryouts",
    name: "Tryouts",
    category: "event",
    art: "tryouts",
    duration: 8,
    palette: ["#06161a", "#193841", "#f1c34d"],
    kicker: "SHOW US YOUR GAME",
    headline: "OPEN\nTRYOUTS",
    detail: "YOUR NEXT INNINGS STARTS HERE",
    cta: "SIGN UP",
    headlineSize: 168,
    tags: ["tryouts", "recruitment"]
  }),

  standardTemplate({
    id: "sponsor-reveal",
    name: "Sponsor Reveal",
    category: "social",
    art: "sponsor",
    duration: 7,
    palette: ["#090a0b", "#212326", "#f1c34d"],
    kicker: "OFFICIAL PARTNER",
    headline: "WELCOME\nABOARD",
    detail: "PROUDLY PARTNERING WITH FWCWL",
    cta: "THANK YOU",
    headlineSize: 145,
    tags: ["sponsor", "partner"]
  }),

  standardTemplate({
    id: "milestone",
    name: "Milestone",
    category: "social",
    art: "milestone",
    duration: 7,
    palette: ["#07141a", "#50121c", "#f0c34c"],
    kicker: "CAREER MILESTONE",
    headline: "100",
    detail: "A LANDMARK INNINGS",
    cta: "CONGRATULATIONS",
    headlineSize: 260,
    tags: ["milestone", "100", "achievement"]
  }),

  standardTemplate({
    id: "breaking-news",
    name: "Breaking News",
    category: "social",
    art: "breaking",
    duration: 7,
    palette: ["#0b0b0d", "#5c1018", "#f1c34d"],
    kicker: "FWCWL • BREAKING",
    headline: "BIG\nNEWS",
    detail: "OFFICIAL ANNOUNCEMENT",
    cta: "JUST IN",
    headlineSize: 196,
    tags: ["news", "announcement"]
  }),

  standardTemplate({
    id: "birthday",
    name: "Birthday",
    category: "social",
    art: "birthday",
    duration: 8,
    palette: ["#15101a", "#68203c", "#f0c34c"],
    kicker: "FWCWL FAMILY",
    headline: "HAPPY\nBIRTHDAY",
    detail: "WISHING YOU A GREAT YEAR AHEAD",
    cta: "CELEBRATE",
    headlineSize: 150,
    tags: ["birthday", "social"]
  }),

  standardTemplate({
    id: "highlights",
    name: "Match Highlights",
    category: "social",
    art: "highlights",
    duration: 10,
    palette: ["#061419", "#55131d", "#f1c34d"],
    kicker: "MATCH RECAP",
    headline: "HIGHLIGHTS",
    detail: "THE MOMENTS THAT DECIDED THE GAME",
    cta: "WATCH NOW",
    headlineSize: 156,
    tags: ["highlights", "recap", "reel"],
    mediaAnimation: "pushIn"
  })
];

export function cloneTemplate(templateId) {
  const template =
    VIDEO_TEMPLATES.find(item => item.id === templateId) ||
    VIDEO_TEMPLATES[0];

  return structuredClone(template);
}
