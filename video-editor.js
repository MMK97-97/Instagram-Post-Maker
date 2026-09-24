/*
================================================================
FWCWL CREATIVE STUDIO — VIDEO EDITOR V12.0 PRO
================================================================
Self-contained advanced browser video editor.

Preserves the rest of the application:
- Does not modify the Poster editor engine or its data.
- Uses the existing #posterModeBtn / #videoModeBtn integration.
- Creates its own isolated Video workspace and scoped CSS.
- Intercepts global Undo / Redo / Reset / Export only while Video
  mode is active, so Poster actions remain unchanged in Poster mode.

Major capabilities:
- 26 cricket video templates
- Multi-track timeline
- Drag clips + trim handles
- Playhead scrubbing
- Timeline zoom
- Video / image / audio upload
- Drag-and-drop import
- Text / graphics / overlays
- Split / duplicate / delete
- Keyframes with interpolation
- Transform + opacity animation
- In / out transitions
- Motion presets
- Color correction + effects
- Crop fit modes
- Speed + volume + mute
- Audio fade in / out
- Frame stepping
- Safe area
- Markers
- Autosave with IndexedDB asset persistence
- Real-time WebM export with canvas + best-effort audio
- Runtime guards and visible error states

No external JavaScript dependency is required.
================================================================
*/

(() => {
  "use strict";

  const BUILD_VERSION = "23.0.0-full-rewrite";
  const STATUS_KEY = "__FWCWL_VIDEO_STATUS__";
  const ROOT_ID = "fwcwlVideoStudio";
  const STYLE_ID = "fwcwlVideoStudioStyleV22";
  const PROJECT_KEY = "fwcwl.video.project.v12";
  const DB_NAME = "fwcwl-video-studio-v12";
  const DB_STORE = "assets";
  const LOGO_PATH = "assets/fwcwl-logo.jpeg";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
  const round = (value, digits = 2) => Number(Number(value).toFixed(digits));
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const esc = value => String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  const setStatus = (state, detail = "") => {
    window[STATUS_KEY] = {
      version: BUILD_VERSION,
      state,
      detail,
      at: Date.now()
    };
    document.documentElement.dataset.videoBoot = state;
  };

  const FORMATS = {
    reel:      { label: "Reel / Story", width: 1080, height: 1920 },
    portrait:  { label: "Portrait", width: 1080, height: 1350 },
    square:    { label: "Square", width: 1080, height: 1080 },
    landscape: { label: "Landscape", width: 1920, height: 1080 }
  };

  const TRACKS = [
    { id: "media", label: "MEDIA", types: ["video", "image"] },
    { id: "overlay", label: "OVERLAY", types: ["overlay"] },
    { id: "graphic", label: "GRAPHICS", types: ["graphic"] },
    { id: "text", label: "TEXT", types: ["text"] },
    { id: "audio", label: "AUDIO", types: ["audio"] }
  ];

  const EFFECTS = {
    clean:     { label: "Clean", brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0, sepia: 0, grayscale: 0 },
    stadium:   { label: "Stadium", brightness: 5, contrast: 18, saturation: 18, hue: 0, blur: 0, sepia: 0, grayscale: 0 },
    dramatic:  { label: "Dramatic", brightness: -4, contrast: 30, saturation: 8, hue: 0, blur: 0, sepia: 0, grayscale: 0 },
    night:     { label: "Night", brightness: -10, contrast: 20, saturation: -12, hue: -8, blur: 0, sepia: 0, grayscale: 0 },
    vintage:   { label: "Vintage", brightness: 3, contrast: 8, saturation: -18, hue: -5, blur: 0, sepia: 28, grayscale: 0 },
    mono:      { label: "Mono", brightness: 2, contrast: 24, saturation: -100, hue: 0, blur: 0, sepia: 0, grayscale: 100 },
    warm:      { label: "Warm", brightness: 5, contrast: 8, saturation: 14, hue: -8, blur: 0, sepia: 12, grayscale: 0 },
    cool:      { label: "Cool", brightness: 2, contrast: 10, saturation: 8, hue: 12, blur: 0, sepia: 0, grayscale: 0 },
    punch:     { label: "Punch", brightness: 4, contrast: 24, saturation: 30, hue: 0, blur: 0, sepia: 0, grayscale: 0 }
  };

  const TRANSITIONS = [
    "none", "fade", "dissolve", "wipe-left", "wipe-right",
    "wipe-up", "wipe-down", "zoom", "spin", "flash", "glitch", "blur"
  ];

  const MOTIONS = [
    "none", "fade", "slide-up", "slide-down", "slide-left", "slide-right",
    "zoom-in", "zoom-out", "pop", "drift-left", "drift-right"
  ];

  const TEMPLATE_ROWS = [
    ["match-day-impact","Match Day Impact","MATCH DAY","TAMPA VS RIVALS","SAT • 10:00 AM","#08090b","#62131d","#f1c34d","slash"],
    ["big-vs","Big VS","THE SHOWDOWN","TEAM A  VS  TEAM B","ONE GAME • ONE WINNER","#071522","#6a1520","#f1c34d","vs"],
    ["game-night","Game Night","UNDER THE LIGHTS","GAME NIGHT","FRIDAY • 7:30 PM","#03090f","#143041","#f1c34d","stadium"],
    ["fixture-drop","Fixture Drop","NEXT FIXTURE","SATURDAY • 10:00 AM","TAMPA • FLORIDA","#0b0d10","#51121a","#f1c34d","fixture"],
    ["player-spotlight","Player Spotlight","PLAYER SERIES","PLAYER SPOTLIGHT","NAME • ROLE • TEAM","#07141b","#5d1722","#f1c34d","player"],
    ["player-of-match","Player of Match","OUTSTANDING PERFORMANCE","PLAYER OF THE MATCH","MATCH WINNER","#151016","#681d2c","#d8aa3b","player"],
    ["mvp","MVP","MOST VALUABLE PLAYER","MVP","PURE IMPACT","#090909","#2e220d","#f6cd54","gold"],
    ["captain-reveal","Captain Reveal","LEADING THE SIDE","OUR CAPTAIN","BELIEF • INTENT • LEADERSHIP","#07131b","#391018","#f1c34d","captain"],
    ["playing-xi","Playing XI","MATCH PLAN","PLAYING XI","TEAM SHEET","#061b19","#102922","#f1c34d","pitch"],
    ["squad-reveal","Squad Reveal","FWCWL SQUAD","MEET THE TEAM","READY FOR BATTLE","#120e11","#5e1520","#efc04a","grid"],
    ["jersey-reveal","Jersey Reveal","NEW SEASON","JERSEY REVEAL","BUILT FOR THE GAME","#071016","#57131c","#f1c34d","reveal"],
    ["team-announcement","Team Announcement","OFFICIAL","TEAM ANNOUNCEMENT","FWCWL","#071418","#3c1118","#f1c34d","news"],
    ["match-result","Match Result","FINAL RESULT","VICTORY","WON BY 24 RUNS","#06171b","#49131a","#f1c34d","result"],
    ["scoreboard","Scoreboard","FINAL SCORE","186 / 5","20 OVERS • TARGET 163","#050708","#182327","#f1c34d","score"],
    ["live-score","Live Score","● LIVE","142 / 4","16.2 OVERS","#061219","#181b20","#e93d49","score"],
    ["champions","Champions","FWCWL CHAMPIONS","CHAMPIONS","THE TROPHY IS OURS","#080808","#33210b","#f1c34d","gold"],
    ["the-final","The Final","CHAMPIONSHIP","THE FINAL","ONE GAME • ONE TROPHY","#08080a","#431017","#f2ca55","gold"],
    ["semi-final","Semi Final","ONE STEP AWAY","SEMI FINAL","EVERY BALL MATTERS","#071120","#711623","#f1c34d","slash"],
    ["tournament-promo","Tournament Promo","FWCWL PRESENTS","WINTER LEAGUE","TAMPA • FLORIDA","#052023","#10504e","#edbc42","pitch"],
    ["registration","Registration Open","REGISTRATION IS OPEN","JOIN THE LEAGUE","TEAMS • PLAYERS • CRICKET","#111013","#5c131d","#f1c34d","fixture"],
    ["tryouts","Tryouts","SHOW US YOUR GAME","OPEN TRYOUTS","YOUR NEXT INNINGS STARTS HERE","#06171b","#1e3a43","#f1c34d","slash"],
    ["sponsor-reveal","Sponsor Reveal","OFFICIAL PARTNER","WELCOME ABOARD","PROUD PARTNER OF FWCWL","#090b0e","#292c30","#f1c34d","frame"],
    ["milestone","Milestone","CAREER MILESTONE","100","A LANDMARK INNINGS","#071419","#50131c","#f1c34d","gold"],
    ["breaking-news","Breaking News","FWCWL • BREAKING","BIG NEWS","OFFICIAL ANNOUNCEMENT","#090a0d","#601019","#f1c34d","news"],
    ["birthday","Birthday","FWCWL FAMILY","HAPPY BIRTHDAY","WISHING YOU A GREAT YEAR","#160f18","#6b203c","#f1c34d","confetti"],
    ["match-highlights","Match Highlights","MATCH RECAP","HIGHLIGHTS","THE MOMENTS THAT DECIDED IT","#061419","#55131d","#f1c34d","stadium"]
  ];

  const TEMPLATES = TEMPLATE_ROWS.map((r, i) => ({
    id: r[0], name: r[1], kicker: r[2], headline: r[3], detail: r[4],
    bg1: r[5], bg2: r[6], accent: r[7], art: r[8],
    duration: i % 4 === 0 ? 10 : 8
  }));

  const defaultClip = partial => ({
    id: uid("clip"),
    track: "media",
    type: "image",
    name: "Clip",
    start: 0,
    duration: 4,
    trimIn: 0,
    x: 50,
    y: 50,
    width: 100,
    scale: 1,
    rotation: 0,
    opacity: 1,
    fit: "cover",
    speed: 1,
    volume: 1,
    muted: false,
    fadeIn: 0,
    fadeOut: 0,
    transitionIn: "fade",
    transitionOut: "fade",
    transitionDuration: .35,
    motionIn: "none",
    motionOut: "none",
    motionDuration: .45,
    effect: "clean",
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    color: "#ffffff",
    font: "Montserrat",
    fontSize: 110,
    fontWeight: 900,
    align: "center",
    strokeColor: "#000000",
    strokeWidth: 0,
    shadow: true,
    shadowBlur: 20,
    backgroundColor: "#000000",
    backgroundOpacity: 0,
    graphic: "ball",
    locked: false,
    visible: true,
    keyframes: [],
    ...partial
  });

  const safeClone = object => {
    const copy = JSON.parse(JSON.stringify(object));
    return copy;
  };

  class VideoEditor {
    constructor() {
      this.posterWorkspace = $("#posterWorkspace");
      this.posterModeBtn = $("#posterModeBtn");
      this.videoModeBtn = $("#videoModeBtn");

      if (!this.posterWorkspace || !this.posterModeBtn || !this.videoModeBtn) {
        throw new Error("Required Poster/Video mode integration elements are missing.");
      }

      this.assets = new Map();
      this.audioNodes = new Map();
      this.history = [];
      this.historyIndex = -1;
      this.drag = null;
      this.scrub = null;
      this.raf = 0;
      this.lastFrameTime = 0;
      this.autosaveTimer = 0;
      this.exporting = false;
      this.exportCancel = false;
      this.timelineSnap = true;
      this.timelineSnapTime = null;
      this.audioContext = null;
      this.recordDestination = null;
      this.masterGain = null;
      this.db = null;

      this.logo = new Image();
      this.logoReady = false;
      this.logo.onload = () => { this.logoReady = true; this.safeRender(); };
      this.logo.onerror = () => { this.logoReady = false; this.safeRender(); };
      this.logo.src = LOGO_PATH;

      this.state = this.makeInitialState();

      this.injectStyles();
      this.createRoot();
      this.cacheDOM();
      this.bindUI();
      this.bindGlobalTopbarInterception();
      this.bindKeyboard();
      this.bindDragDrop();
      this.bindTimelinePointerDelegation();

      this.applyTemplate("match-day-impact", false);
      this.commit(false);
      this.refreshAll();

      this.openDatabase()
        .then(() => this.restoreProject())
        .catch(error => console.warn("[FWCWL Video DB]", error));

      setStatus("ready", `${TEMPLATES.length} templates loaded`);
      window.FWCWLVideoEditor = this;
    }

    makeInitialState() {
      return {
        active: false,
        format: "reel",
        width: FORMATS.reel.width,
        height: FORMATS.reel.height,
        fps: 30,
        duration: 10,
        currentTime: 0,
        playing: false,
        timelineZoom: 90,
        selectedClipId: null,
        templateId: "match-day-impact",
        background1: "#08090b",
        background2: "#62131d",
        accent: "#f1c34d",
        safeZone: false,
        showLogo: true,
        markers: [],
        clips: []
      };
    }

    injectStyles() {
      if (document.getElementById(STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
#${ROOT_ID}{
  --v-bg:#07090c;--v-panel:#0b0e12;--v-card:#101318;--v-line:rgba(255,255,255,.075);
  --v-line2:rgba(255,255,255,.13);--v-text:#f3f4f6;--v-muted:#7a818c;--v-dim:#505761;
  --v-gold:#f1c34d;--v-gold-soft:rgba(241,195,77,.08);--v-danger:#e36f79;
  display:none;height:calc(100vh - 72px);min-height:620px;background:var(--v-bg);color:var(--v-text);
  font-family:"DM Sans",system-ui,sans-serif;overflow:hidden;
}
#${ROOT_ID}.active{display:grid;grid-template-rows:minmax(0,1fr) 270px}
#${ROOT_ID} *{box-sizing:border-box}
#${ROOT_ID} button,#${ROOT_ID} input,#${ROOT_ID} select,#${ROOT_ID} textarea{font:inherit}
#${ROOT_ID} button{cursor:pointer}
#${ROOT_ID} .v-main{display:grid;grid-template-columns:268px minmax(420px,1fr) 340px;min-height:0}
#${ROOT_ID} .v-left,#${ROOT_ID} .v-right{min-height:0;background:var(--v-panel);border-color:var(--v-line);overflow:hidden}
#${ROOT_ID} .v-left{border-right:1px solid var(--v-line)}
#${ROOT_ID} .v-right{border-left:1px solid var(--v-line)}
#${ROOT_ID} .v-panel-scroll{height:100%;overflow:auto;scrollbar-width:thin;scrollbar-color:#343a44 transparent}
#${ROOT_ID} .v-panel-scroll::-webkit-scrollbar{width:7px}
#${ROOT_ID} .v-panel-scroll::-webkit-scrollbar-thumb{background:#343a44;border-radius:10px}
#${ROOT_ID} .v-tabs{height:46px;display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--v-line);padding:6px;gap:4px}
#${ROOT_ID} .v-tabs button{border:1px solid transparent;border-radius:7px;background:transparent;color:#68707a;font-size:7px;font-weight:850;letter-spacing:.05em}
#${ROOT_ID} .v-tabs button:hover{color:#d5d9de;background:rgba(255,255,255,.025)}
#${ROOT_ID} .v-tabs button.active{color:var(--v-gold);border-color:rgba(241,195,77,.2);background:var(--v-gold-soft)}
#${ROOT_ID} .v-left-content{padding:12px}
#${ROOT_ID} .v-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}
#${ROOT_ID} .v-kicker{color:var(--v-gold);font-size:6px;font-weight:950;letter-spacing:.12em}
#${ROOT_ID} h2,#${ROOT_ID} h3,#${ROOT_ID} p{margin:0}
#${ROOT_ID} .v-head h2{margin-top:4px;font-size:11px}
#${ROOT_ID} .v-head p{margin-top:5px;color:#626a75;font-size:7px;line-height:1.45}
#${ROOT_ID} .v-count{min-width:28px;height:24px;display:grid;place-items:center;border:1px solid var(--v-line);border-radius:7px;color:#8c939d;font-size:7px}
#${ROOT_ID} .v-search{height:34px;display:flex;align-items:center;gap:7px;padding:0 9px;border:1px solid var(--v-line);border-radius:8px;background:#0c0f13;margin-bottom:10px}
#${ROOT_ID} .v-search input{width:100%;border:0;outline:0;background:transparent;color:#dfe2e6;font-size:7px}
#${ROOT_ID} .v-template-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#${ROOT_ID} .v-template{padding:0;overflow:hidden;border:1px solid var(--v-line);border-radius:9px;background:#0d1014;text-align:left;transition:.15s ease}
#${ROOT_ID} .v-template:hover{transform:translateY(-1px);border-color:var(--v-line2)}
#${ROOT_ID} .v-template.active{border-color:rgba(241,195,77,.38);box-shadow:0 0 0 1px rgba(241,195,77,.05)}
#${ROOT_ID} .v-template-preview{aspect-ratio:9/13;position:relative;overflow:hidden;padding:10px;background:linear-gradient(145deg,var(--a),var(--b))}
#${ROOT_ID} .v-template-preview:after{content:"";position:absolute;inset:-20%;background:linear-gradient(120deg,transparent 25%,rgba(255,255,255,.07),transparent 65%);transform:rotate(-15deg)}
#${ROOT_ID} .v-template-preview b{position:absolute;left:9px;right:9px;bottom:20px;z-index:2;color:#fff;font-size:9px;line-height:.9;font-weight:950;text-transform:uppercase}
#${ROOT_ID} .v-template-preview small{position:absolute;left:9px;bottom:8px;z-index:2;color:var(--c);font-size:4px;font-weight:950;letter-spacing:.09em}
#${ROOT_ID} .v-template-meta{padding:7px 8px}
#${ROOT_ID} .v-template-meta strong{display:block;color:#d7dbe0;font-size:7px}
#${ROOT_ID} .v-template-meta small{display:block;margin-top:2px;color:#545b65;font-size:5px}
#${ROOT_ID} .v-upload{width:100%;min-height:72px;border:1px dashed rgba(241,195,77,.28);border-radius:10px;background:rgba(241,195,77,.035);color:#d4b354}
#${ROOT_ID} .v-upload strong{display:block;font-size:18px;font-weight:400}
#${ROOT_ID} .v-upload span{display:block;margin-top:3px;font-size:7px;font-weight:850}
#${ROOT_ID} .v-upload small{display:block;margin-top:2px;color:#5e6670;font-size:5px}
#${ROOT_ID} .v-quick{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:10px}
#${ROOT_ID} .v-quick button{min-height:38px;border:1px solid var(--v-line);border-radius:8px;background:#0d1014;color:#858c96;font-size:7px}
#${ROOT_ID} .v-quick button:hover{color:#fff;border-color:var(--v-line2)}
#${ROOT_ID} .v-assets{display:grid;gap:6px;margin-top:12px}
#${ROOT_ID} .v-asset{display:grid;grid-template-columns:40px minmax(0,1fr) 28px;gap:7px;align-items:center;padding:6px;border:1px solid var(--v-line);border-radius:8px;background:#0d1014}
#${ROOT_ID} .v-asset-thumb{height:34px;border-radius:6px;overflow:hidden;background:#15191e;display:grid;place-items:center;color:#747b85;font-size:11px}
#${ROOT_ID} .v-asset-thumb img,#${ROOT_ID} .v-asset-thumb video{width:100%;height:100%;object-fit:cover}
#${ROOT_ID} .v-asset strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:7px}
#${ROOT_ID} .v-asset small{display:block;color:#5a626c;font-size:5px;margin-top:2px}
#${ROOT_ID} .v-asset button{width:28px;height:28px;border:1px solid var(--v-line);border-radius:6px;background:#11151a;color:var(--v-gold)}
#${ROOT_ID} .v-center{min-width:0;min-height:0;display:grid;grid-template-rows:48px minmax(0,1fr) 42px;background:#07090c}
#${ROOT_ID} .v-toolbar{display:flex;align-items:center;justify-content:space-between;padding:0 10px;border-bottom:1px solid var(--v-line);background:#0a0d10}
#${ROOT_ID} .v-toolbar-group{display:flex;align-items:center;gap:6px}
#${ROOT_ID} .v-toolbar button,#${ROOT_ID} .v-toolbar select{height:30px;border:1px solid var(--v-line);border-radius:7px;background:#0d1014;color:#8f969f;font-size:7px}
#${ROOT_ID} .v-toolbar button{padding:0 9px}
#${ROOT_ID} .v-toolbar button:hover{color:#fff;border-color:var(--v-line2)}
#${ROOT_ID} .v-toolbar button.active{color:var(--v-gold);border-color:rgba(241,195,77,.28);background:var(--v-gold-soft)}
#${ROOT_ID} .v-toolbar select{padding:0 8px}
#${ROOT_ID} .v-preview-wrap{position:relative;display:grid;place-items:center;overflow:hidden;padding:18px;background:radial-gradient(circle at center,rgba(255,255,255,.025),transparent 38%)}
#${ROOT_ID} .v-preview-frame{position:relative;display:grid;place-items:center;max-width:100%;max-height:100%;box-shadow:0 24px 75px rgba(0,0,0,.42)}
#${ROOT_ID} #videoCanvas{display:block;max-width:100%;max-height:100%;background:#000}
#${ROOT_ID} .v-drop{display:none;position:absolute;inset:18px;z-index:30;place-items:center;border:1px dashed rgba(241,195,77,.55);border-radius:14px;background:rgba(8,10,13,.80);backdrop-filter:blur(8px);color:var(--v-gold);font-size:9px;font-weight:900;letter-spacing:.08em}
#${ROOT_ID}.dragging .v-drop{display:grid}
#${ROOT_ID} .v-playbar{display:flex;align-items:center;justify-content:center;gap:8px;border-top:1px solid var(--v-line);background:#090c0f}
#${ROOT_ID} .v-playbar button{width:30px;height:28px;border:1px solid var(--v-line);border-radius:7px;background:#0d1014;color:#9299a2}
#${ROOT_ID} .v-playbar button.v-play{width:38px;color:#111;background:var(--v-gold);border-color:var(--v-gold)}
#${ROOT_ID} .v-time{min-width:92px;text-align:center;color:#7d848d;font-size:7px;font-variant-numeric:tabular-nums}
#${ROOT_ID} .v-right-head{height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 13px;border-bottom:1px solid var(--v-line)}
#${ROOT_ID} .v-right-head strong{display:block;margin-top:4px;font-size:9px}
#${ROOT_ID} .v-badge{height:24px;display:flex;align-items:center;padding:0 8px;border:1px solid rgba(241,195,77,.2);border-radius:7px;color:var(--v-gold);background:var(--v-gold-soft);font-size:6px;font-weight:900}
#${ROOT_ID} .v-inspector{height:calc(100% - 52px);overflow:auto;scrollbar-width:thin;scrollbar-color:#343a44 transparent}
#${ROOT_ID} .v-section{padding:13px;border-bottom:1px solid rgba(255,255,255,.055)}
#${ROOT_ID} .v-section h3{margin-top:4px;font-size:9px}
#${ROOT_ID} .v-section p{margin-top:4px;color:#5c646e;font-size:6px;line-height:1.45}
#${ROOT_ID} .v-field{display:grid;gap:5px;margin-top:10px}
#${ROOT_ID} .v-field>span,#${ROOT_ID} .v-range>div>span{color:#858c96;font-size:7px;font-weight:720}
#${ROOT_ID} .v-field input,#${ROOT_ID} .v-field select,#${ROOT_ID} .v-field textarea{width:100%;min-height:34px;border:1px solid var(--v-line);border-radius:7px;outline:0;background:#0d1014;color:#dce0e4;padding:0 9px;font-size:7px}
#${ROOT_ID} .v-field textarea{min-height:68px;padding-top:8px;resize:vertical}
#${ROOT_ID} .v-field input:focus,#${ROOT_ID} .v-field select:focus,#${ROOT_ID} .v-field textarea:focus{border-color:rgba(241,195,77,.35);box-shadow:0 0 0 2px rgba(241,195,77,.035)}
#${ROOT_ID} .v-grid2{display:grid;grid-template-columns:1fr 1fr;gap:6px}
#${ROOT_ID} .v-range{display:grid;gap:6px;margin-top:10px}
#${ROOT_ID} .v-range>div{display:flex;align-items:center;justify-content:space-between}
#${ROOT_ID} .v-range b{color:#ccd0d5;font-size:7px;font-variant-numeric:tabular-nums}
#${ROOT_ID} .v-range input{width:100%;height:4px;appearance:none;border-radius:10px;background:#303640}
#${ROOT_ID} .v-range input::-webkit-slider-thumb{appearance:none;width:13px;height:13px;border:2px solid #080a0d;border-radius:50%;background:var(--v-gold);box-shadow:0 0 0 1px rgba(241,195,77,.45)}
#${ROOT_ID} .v-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}
#${ROOT_ID} .v-actions button{min-height:32px;border:1px solid var(--v-line);border-radius:7px;background:#0d1014;color:#858c96;font-size:7px}
#${ROOT_ID} .v-actions button:hover{color:#fff;border-color:var(--v-line2)}
#${ROOT_ID} .v-actions button.danger{color:#d47a82;border-color:rgba(227,111,121,.18)}
#${ROOT_ID} .v-keyframes{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
#${ROOT_ID} .v-keyframe{height:26px;padding:0 8px;border:1px solid rgba(241,195,77,.2);border-radius:7px;background:var(--v-gold-soft);color:var(--v-gold);font-size:6px}
#${ROOT_ID} .v-empty{margin:12px;padding:12px;border:1px solid var(--v-line);border-radius:8px;background:#0d1014;color:#656d77;font-size:7px;line-height:1.5}
#${ROOT_ID} .v-timeline{min-height:0;display:grid;grid-template-rows:42px minmax(0,1fr);border-top:1px solid var(--v-line);background:#080a0d}
#${ROOT_ID} .v-timeline-head{display:flex;align-items:center;justify-content:space-between;padding:0 10px;border-bottom:1px solid var(--v-line)}
#${ROOT_ID} .v-timeline-head-left,#${ROOT_ID} .v-timeline-head-right{display:flex;align-items:center;gap:6px}
#${ROOT_ID} .v-timeline-head button,#${ROOT_ID} .v-timeline-head select{height:28px;border:1px solid var(--v-line);border-radius:7px;background:#0d1014;color:#878e98;font-size:7px}
#${ROOT_ID} .v-timeline-head button{padding:0 9px}
#${ROOT_ID} .v-timeline-head button:hover{color:#fff;border-color:var(--v-line2)}
#${ROOT_ID} .v-timeline-body{min-height:0;display:grid;grid-template-columns:96px minmax(0,1fr);overflow:hidden}
#${ROOT_ID} .v-track-labels{padding-top:24px;border-right:1px solid var(--v-line);background:#090c0f}
#${ROOT_ID} .v-track-label{height:37px;display:flex;align-items:center;padding:0 10px;border-bottom:1px solid rgba(255,255,255,.045);color:#656d77;font-size:6px;font-weight:850;letter-spacing:.08em}
#${ROOT_ID} .v-scroll{position:relative;overflow:auto;min-width:0;scrollbar-width:thin;scrollbar-color:#343a44 transparent}
#${ROOT_ID} .v-inner{position:relative;min-height:209px}
#${ROOT_ID} .v-ruler{position:relative;height:24px;border-bottom:1px solid var(--v-line);background:#0a0d11}
#${ROOT_ID} .v-tick{position:absolute;bottom:0;width:1px;height:8px;background:#3a4049}
#${ROOT_ID} .v-tick.major{height:13px}
#${ROOT_ID} .v-tick span{position:absolute;top:-10px;left:4px;color:#565e68;font-size:5px;white-space:nowrap}
#${ROOT_ID} .v-track-row{position:relative;height:37px;border-bottom:1px solid rgba(255,255,255,.045);background-image:linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);background-size:90px 100%}
#${ROOT_ID} .v-clip{position:absolute;top:4px;height:29px;min-width:18px;overflow:hidden;border:1px solid rgba(255,255,255,.11);border-radius:6px;background:linear-gradient(90deg,#222a33,#161c22);color:#cfd4d9;box-shadow:0 3px 10px rgba(0,0,0,.18);cursor:grab}
#${ROOT_ID} .v-clip[data-type="text"]{background:linear-gradient(90deg,#4d3d13,#29230e)}
#${ROOT_ID} .v-clip[data-type="audio"]{background:linear-gradient(90deg,#16362a,#11271f)}
#${ROOT_ID} .v-clip[data-type="graphic"]{background:linear-gradient(90deg,#3a1c3f,#241428)}
#${ROOT_ID} .v-clip[data-type="overlay"]{background:linear-gradient(90deg,#34373d,#22252a)}
#${ROOT_ID} .v-clip.selected{border-color:var(--v-gold);box-shadow:0 0 0 1px rgba(241,195,77,.18)}
#${ROOT_ID} .v-clip-label{position:absolute;inset:0 8px;display:flex;align-items:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:6px;font-weight:750}
#${ROOT_ID} .v-trim{position:absolute;top:0;bottom:0;width:7px;background:rgba(255,255,255,.07);cursor:ew-resize}
#${ROOT_ID} .v-trim.left{left:0} #${ROOT_ID} .v-trim.right{right:0}
#${ROOT_ID} .v-kf-dot{position:absolute;top:4px;width:6px;height:6px;transform:translateX(-50%) rotate(45deg);background:var(--v-gold);box-shadow:0 0 0 1px #111}
#${ROOT_ID} .v-marker{position:absolute;top:0;bottom:0;width:1px;background:rgba(241,195,77,.55);pointer-events:none}
#${ROOT_ID} .v-marker:before{content:"";position:absolute;top:1px;left:-4px;border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid var(--v-gold)}
#${ROOT_ID} .v-playhead{position:absolute;z-index:12;top:0;bottom:0;width:1px;background:#f1c34d;pointer-events:none}
#${ROOT_ID} .v-playhead:before{content:"";position:absolute;top:0;left:-5px;width:11px;height:9px;border-radius:2px 2px 5px 5px;background:#f1c34d}
#${ROOT_ID} .v-modal-backdrop{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(0,0,0,.72);backdrop-filter:blur(8px)}
#${ROOT_ID} .v-modal{width:min(460px,calc(100vw - 30px));padding:18px;border:1px solid var(--v-line2);border-radius:13px;background:#0b0e12;box-shadow:0 30px 90px rgba(0,0,0,.52)}
#${ROOT_ID} .v-modal h2{margin-top:5px;font-size:15px}
#${ROOT_ID} .v-modal p{margin-top:6px;color:#69717b;font-size:7px;line-height:1.5}
#${ROOT_ID} .v-progress{height:7px;margin-top:14px;overflow:hidden;border-radius:10px;background:#171b20}
#${ROOT_ID} .v-progress i{display:block;width:0;height:100%;background:var(--v-gold);transition:width .15s linear}
#${ROOT_ID} .v-export-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}
#${ROOT_ID} .v-export-row select{height:36px;border:1px solid var(--v-line);border-radius:8px;background:#0d1014;color:#d7dbe0;padding:0 9px;font-size:7px}
#${ROOT_ID} .v-modal-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:14px}
#${ROOT_ID} .v-modal-actions button{height:34px;padding:0 13px;border:1px solid var(--v-line);border-radius:8px;background:#101419;color:#8f969f;font-size:7px}
#${ROOT_ID} .v-modal-actions button.primary{border-color:var(--v-gold);background:var(--v-gold);color:#111;font-weight:900}
#${ROOT_ID} .v-toast{position:absolute;z-index:50;left:50%;bottom:54px;transform:translateX(-50%) translateY(8px);padding:7px 10px;border:1px solid var(--v-line2);border-radius:8px;background:rgba(12,15,19,.94);color:#d8dde2;font-size:7px;opacity:0;pointer-events:none;transition:.18s ease}
#${ROOT_ID} .v-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
@media(max-width:1200px){#${ROOT_ID} .v-main{grid-template-columns:225px minmax(380px,1fr) 300px}}
@media(max-width:980px){#${ROOT_ID} .v-main{grid-template-columns:200px minmax(340px,1fr) 280px}#${ROOT_ID}.active{grid-template-rows:minmax(0,1fr) 240px}}
`;
      document.head.appendChild(style);
    }

    createRoot() {
      const existing = document.getElementById(ROOT_ID);
      if (existing) existing.remove();

      const root = document.createElement("section");
      root.id = ROOT_ID;
      root.setAttribute("aria-label", "FWCWL Video Editor");
      root.innerHTML = `
<div class="v-main">
  <aside class="v-left">
    <div class="v-tabs">
      <button class="active" data-vtab="templates">TEMPLATES</button>
      <button data-vtab="media">MEDIA</button>
      <button data-vtab="create">CREATE</button>
    </div>
    <div class="v-panel-scroll">
      <div class="v-left-content">
        <section data-vpanel="templates">
          <div class="v-head">
            <div><div class="v-kicker">FWCWL VIDEO LIBRARY</div><h2>Cricket Sequences</h2><p>Ready-to-edit animated cricket layouts.</p></div>
            <div class="v-count" id="vTemplateCount">${TEMPLATES.length}</div>
          </div>
          <div class="v-search"><span>⌕</span><input id="vTemplateSearch" placeholder="Search video templates..." /></div>
          <div class="v-template-grid" id="vTemplateGrid"></div>
        </section>

        <section data-vpanel="media" hidden>
          <div class="v-head"><div><div class="v-kicker">MEDIA</div><h2>Asset Library</h2><p>Video, image and audio files.</p></div></div>
          <button class="v-upload" id="vUploadBtn"><strong>＋</strong><span>Upload Media</span><small>MP4 · WEBM · JPG · PNG · MP3 · WAV</small></button>
          <input id="vMediaInput" type="file" accept="video/*,image/*,audio/*" multiple hidden />
          <div class="v-assets" id="vAssetGrid"></div>
        </section>

        <section data-vpanel="create" hidden>
          <div class="v-head"><div><div class="v-kicker">CREATE</div><h2>Add Layers</h2><p>Build your own sequence from scratch.</p></div></div>
          <div class="v-quick">
            <button data-vcreate="headline">+ Headline</button>
            <button data-vcreate="subtitle">+ Subtitle</button>
            <button data-vcreate="ball">+ Cricket Ball</button>
            <button data-vcreate="wickets">+ Wickets</button>
            <button data-vcreate="vs">+ VS Badge</button>
            <button data-vcreate="trophy">+ Trophy</button>
            <button data-vcreate="overlay">+ Overlay</button>
            <button data-vcreate="score">+ Score</button>
          </div>
        </section>
      </div>
    </div>
  </aside>

  <section class="v-center">
    <div class="v-toolbar">
      <div class="v-toolbar-group">
        <select id="vFormat">
          ${Object.entries(FORMATS).map(([id,f]) => `<option value="${id}">${f.label} · ${f.width}×${f.height}</option>`).join("")}
        </select>
        <button id="vSafe">Safe Area</button>
        <button id="vAddMarker">+ Marker</button>
      </div>
      <div class="v-toolbar-group">
        <button id="vSplit">Split</button>
        <button id="vDuplicate">Duplicate</button>
        <button id="vDelete">Delete</button>
        <button id="vExport" style="color:#111;background:#f1c34d;border-color:#f1c34d;font-weight:900">Export</button>
      </div>
    </div>

    <div class="v-preview-wrap">
      <div class="v-preview-frame" id="vPreviewFrame">
        <canvas id="videoCanvas" width="1080" height="1920"></canvas>
      </div>
      <div class="v-drop">DROP MEDIA TO ADD TO TIMELINE</div>
      <div class="v-toast" id="vToast"></div>
    </div>

    <div class="v-playbar">
      <button id="vPrevFrame" title="Previous frame">‹</button>
      <button id="vPlay" class="v-play" title="Play / Pause">▶</button>
      <button id="vNextFrame" title="Next frame">›</button>
      <div class="v-time" id="vTime">00:00.00 / 00:10.00</div>
      <button id="vGoStart" title="Go to start">|‹</button>
      <button id="vGoEnd" title="Go to end">›|</button>
    </div>
  </section>

  <aside class="v-right">
    <div class="v-right-head">
      <div><div class="v-kicker">PROPERTIES</div><strong id="vInspectorTitle">Project</strong></div>
      <span class="v-badge" id="vInspectorType">VIDEO</span>
    </div>
    <div class="v-inspector" id="vInspector"></div>
  </aside>
</div>

<section class="v-timeline">
  <div class="v-timeline-head">
    <div class="v-timeline-head-left">
      <button id="vUndo">↶ Undo</button>
      <button id="vRedo">↷ Redo</button>
      <button id="vTimelineSplit">✂ Split</button>
      <button id="vTimelineDuplicate">⧉ Duplicate</button>
      <button id="vTimelineDelete">× Delete</button>
      <button id="vSnapTimeline" class="active">✦ Snap</button>
    </div>
    <div class="v-timeline-head-right">
      <span class="v-kicker">TIMELINE</span>
      <button id="vZoomOut">−</button>
      <span id="vZoomLabel" style="min-width:40px;text-align:center;color:#777f89;font-size:6px">90 px/s</span>
      <button id="vZoomIn">+</button>
    </div>
  </div>
  <div class="v-timeline-body">
    <div class="v-track-labels">
      ${TRACKS.map(t => `<div class="v-track-label">${t.label}</div>`).join("")}
    </div>
    <div class="v-scroll" id="vTimelineScroll">
      <div class="v-inner" id="vTimelineInner">
        <div class="v-ruler" id="vRuler"></div>
        ${TRACKS.map(t => `<div class="v-track-row" data-track="${t.id}"></div>`).join("")}
        <div class="v-snap-guide" id="vSnapGuide"></div>
        <div class="v-playhead" id="vPlayhead"></div>
      </div>
    </div>
  </div>
</section>
`;
      this.posterWorkspace.insertAdjacentElement("afterend", root);
      this.root = root;
    }

    cacheDOM() {
      this.canvas = $("#videoCanvas", this.root);
      this.ctx = this.canvas.getContext("2d", { alpha: false });
      if (!this.ctx) throw new Error("Video canvas 2D rendering is unavailable.");

      this.timelineInner = $("#vTimelineInner", this.root);
      this.timelineScroll = $("#vTimelineScroll", this.root);
      this.playhead = $("#vPlayhead", this.root);
      this.inspector = $("#vInspector", this.root);
    }

    bindUI() {
      $$("[data-vtab]", this.root).forEach(button => {
        button.addEventListener("click", () => {
          $$("[data-vtab]", this.root).forEach(b => b.classList.toggle("active", b === button));
          $$("[data-vpanel]", this.root).forEach(panel => {
            panel.hidden = panel.dataset.vpanel !== button.dataset.vtab;
          });
        });
      });

      this.videoModeBtn.addEventListener("click", () => this.showVideoMode());
      this.posterModeBtn.addEventListener("click", () => this.showPosterMode());

      $("#vTemplateSearch", this.root).addEventListener("input", event => this.renderTemplates(event.target.value));

      $("#vUploadBtn", this.root).addEventListener("click", () => $("#vMediaInput", this.root).click());
      $("#vMediaInput", this.root).addEventListener("change", async event => {
        await this.importFiles(event.target.files);
        event.target.value = "";
      });

      $$("[data-vcreate]", this.root).forEach(button => {
        button.addEventListener("click", () => this.createLayer(button.dataset.vcreate));
      });

      $("#vFormat", this.root).addEventListener("change", event => this.changeFormat(event.target.value));
      $("#vSafe", this.root).addEventListener("click", () => {
        this.state.safeZone = !this.state.safeZone;
        $("#vSafe", this.root).classList.toggle("active", this.state.safeZone);
        this.safeRender();
        this.commit();
      });
      $("#vAddMarker", this.root).addEventListener("click", () => this.addMarker());

      const splitButtons = ["#vSplit","#vTimelineSplit"];
      splitButtons.forEach(id => $(id, this.root).addEventListener("click", () => this.splitSelected()));
      ["#vDuplicate","#vTimelineDuplicate"].forEach(id => $(id, this.root).addEventListener("click", () => this.duplicateSelected()));
      ["#vDelete","#vTimelineDelete"].forEach(id => $(id, this.root).addEventListener("click", () => this.deleteSelected()));

      $("#vPlay", this.root).addEventListener("click", () => this.togglePlayback());
      $("#vPrevFrame", this.root).addEventListener("click", () => this.stepFrame(-1));
      $("#vNextFrame", this.root).addEventListener("click", () => this.stepFrame(1));
      $("#vGoStart", this.root).addEventListener("click", () => this.seek(0));
      $("#vGoEnd", this.root).addEventListener("click", () => this.seek(this.state.duration));

      $("#vUndo", this.root).addEventListener("click", () => this.undo());
      $("#vRedo", this.root).addEventListener("click", () => this.redo());

      $("#vZoomOut", this.root).addEventListener("click", () => {
        this.state.timelineZoom = clamp(this.state.timelineZoom - 15, 35, 260);
        this.renderTimeline();
      });
      $("#vZoomIn", this.root).addEventListener("click", () => {
        this.state.timelineZoom = clamp(this.state.timelineZoom + 15, 35, 260);
        this.renderTimeline();
      });
      $("#vSnapTimeline", this.root)?.addEventListener("click", event => {
        this.timelineSnap = !this.timelineSnap;
        event.currentTarget.classList.toggle("active", this.timelineSnap);
        this.toast(this.timelineSnap ? "Magnetic snapping on" : "Magnetic snapping off");
      });

      $("#vExport", this.root).addEventListener("click", () => this.openExport());
      window.addEventListener("resize", () => this.fitPreview());
    }

    bindGlobalTopbarInterception() {
      document.addEventListener("click", event => {
        if (!this.state.active) return;
        const target = event.target.closest?.("#undoBtn,#redoBtn,#resetBtn,#exportTopBtn");
        if (!target) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (target.id === "undoBtn") this.undo();
        if (target.id === "redoBtn") this.redo();
        if (target.id === "resetBtn") this.resetProject();
        if (target.id === "exportTopBtn") this.openExport();
      }, true);
    }

    bindKeyboard() {
      document.addEventListener("keydown", event => {
        if (!this.state.active) return;
        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;

        const command = event.ctrlKey || event.metaKey;
        const key = event.key.toLowerCase();

        if (event.code === "Space") {
          event.preventDefault();
          this.togglePlayback();
          return;
        }
        if (command && key === "z") {
          event.preventDefault();
          event.shiftKey ? this.redo() : this.undo();
          return;
        }
        if (command && key === "y") {
          event.preventDefault();
          this.redo();
          return;
        }
        if (command && key === "d") {
          event.preventDefault();
          this.duplicateSelected();
          return;
        }
        if (key === "s" && !command) {
          event.preventDefault();
          this.splitSelected();
          return;
        }
        if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          this.deleteSelected();
          return;
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          this.seek(this.state.currentTime - (event.shiftKey ? 1 : 1 / this.state.fps));
          return;
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          this.seek(this.state.currentTime + (event.shiftKey ? 1 : 1 / this.state.fps));
          return;
        }

        const clip = this.selectedClip();
        if (!clip || clip.locked) return;
        const nudge = event.shiftKey ? 2 : .5;
        if (key === "a") clip.x = clamp(clip.x - nudge, 0, 100);
        else if (key === "d") clip.x = clamp(clip.x + nudge, 0, 100);
        else if (key === "w") clip.y = clamp(clip.y - nudge, 0, 100);
        else if (key === "x") clip.y = clamp(clip.y + nudge, 0, 100);
        else return;

        event.preventDefault();
        this.safeRender();
        this.renderInspector();
        this.commit();
      });
    }

    bindDragDrop() {
      const prevent = event => {
        event.preventDefault();
        event.stopPropagation();
      };

      ["dragenter","dragover"].forEach(name => this.root.addEventListener(name, event => {
        prevent(event);
        this.root.classList.add("dragging");
      }));

      ["dragleave","drop"].forEach(name => this.root.addEventListener(name, event => {
        prevent(event);
        this.root.classList.remove("dragging");
      }));

      this.root.addEventListener("drop", async event => {
        const files = Array.from(event.dataTransfer?.files || []);
        if (!files.length) return;
        const imported = await this.importFiles(files);
        if (imported.length) {
          const first = imported[0];
          this.addAssetAsClip(first.id, this.state.currentTime);
        }
      });
    }

    getTimelineSnap(value, clip, edge = "start") {
      if (!this.timelineSnap) return { value, snapped: false, target: null };
      const threshold = Math.max(.035, 10 / Math.max(35, this.state.timelineZoom));
      const targets = [0, this.state.currentTime, ...(this.state.markers || [])];
      this.state.clips.forEach(other => {
        if (!other || other.id === clip?.id || other.visible === false) return;
        targets.push(other.start, other.start + other.duration);
      });
      let best = null;
      let dist = Infinity;
      for (const target of targets) {
        const d = Math.abs(Number(value) - Number(target));
        if (d < dist && d <= threshold) { dist = d; best = Number(target); }
      }
      if (best == null) return { value, snapped: false, target: null };
      return { value: round(best, 3), snapped: true, target: best };
    }

    showTimelineSnapGuide(time = null) {
      const guide = $("#vSnapGuide", this.root);
      if (!guide) return;
      if (time == null || Number.isNaN(Number(time))) {
        guide.classList.remove("show");
        return;
      }
      guide.style.left = `${Number(time) * this.state.timelineZoom}px`;
      guide.classList.add("show");
    }

    bindTimelinePointerDelegation() {
      this.timelineInner.addEventListener("pointerdown", event => {
        const trim = event.target.closest(".v-trim");
        const clipEl = event.target.closest(".v-clip");
        const ruler = event.target.closest(".v-ruler");

        if (ruler && !clipEl) {
          const rect = this.timelineInner.getBoundingClientRect();
          const x = event.clientX - rect.left + this.timelineScroll.scrollLeft;
          this.seek(x / this.state.timelineZoom);
          this.scrub = { type: "playhead" };
          return;
        }

        if (!clipEl) return;
        const clip = this.state.clips.find(c => c.id === clipEl.dataset.clipId);
        if (!clip) return;

        this.selectClip(clip.id);

        if (clip.locked) return;

        event.preventDefault();
        const startX = event.clientX;
        this.drag = {
          mode: trim ? (trim.classList.contains("left") ? "trim-left" : "trim-right") : "move",
          clip,
          startX,
          originalStart: clip.start,
          originalDuration: clip.duration,
          originalTrimIn: clip.trimIn || 0
        };
        clipEl.setPointerCapture?.(event.pointerId);
      });

      window.addEventListener("pointermove", event => {
        if (this.scrub?.type === "playhead") {
          const rect = this.timelineInner.getBoundingClientRect();
          const x = event.clientX - rect.left + this.timelineScroll.scrollLeft;
          this.seek(x / this.state.timelineZoom, false);
          return;
        }

        if (!this.drag) return;
        const delta = (event.clientX - this.drag.startX) / this.state.timelineZoom;
        const c = this.drag.clip;

        if (this.drag.mode === "move") {
          const raw = clamp(round(this.drag.originalStart + delta, 3), 0, Math.max(0, this.state.duration - .1));
          const snap = this.getTimelineSnap(raw, c, "start");
          c.start = clamp(snap.value, 0, Math.max(0, this.state.duration - .1));
          this.showTimelineSnapGuide(snap.snapped ? snap.target : null);
        } else if (this.drag.mode === "trim-left") {
          const maxDelta = this.drag.originalDuration - .15;
          let used = clamp(delta, -this.drag.originalStart, maxDelta);
          const rawStart = round(this.drag.originalStart + used, 3);
          const snap = this.getTimelineSnap(rawStart, c, "start");
          if (snap.snapped) used = snap.value - this.drag.originalStart;
          c.start = round(this.drag.originalStart + used, 3);
          c.duration = round(this.drag.originalDuration - used, 3);
          this.showTimelineSnapGuide(snap.snapped ? snap.target : null);
          if (c.type === "video" || c.type === "audio") {
            c.trimIn = Math.max(0, round(this.drag.originalTrimIn + used * (c.speed || 1), 3));
          }
        } else if (this.drag.mode === "trim-right") {
          const rawDuration = clamp(round(this.drag.originalDuration + delta, 3), .15, this.state.duration - c.start);
          const rawEnd = c.start + rawDuration;
          const snap = this.getTimelineSnap(rawEnd, c, "end");
          c.duration = snap.snapped ? clamp(round(snap.value - c.start, 3), .15, this.state.duration - c.start) : rawDuration;
          this.showTimelineSnapGuide(snap.snapped ? snap.target : null);
        }

        this.recalculateDuration();
        this.renderTimeline();
        this.safeRender();
        this.renderInspector();
      });

      window.addEventListener("pointerup", () => {
        if (this.drag) {
          this.drag = null;
          this.commit();
        }
        this.showTimelineSnapGuide(null);
        this.scrub = null;
      });
    }

    showVideoMode() {
      this.state.active = true;
      this.posterWorkspace.style.display = "none";
      this.root.classList.add("active");
      this.videoModeBtn.classList.add("active");
      this.posterModeBtn.classList.remove("active");
      this.videoModeBtn.setAttribute("aria-pressed", "true");
      this.posterModeBtn.setAttribute("aria-pressed", "false");
      requestAnimationFrame(() => {
        this.fitPreview();
        this.safeRender();
        this.renderTimeline();
      });
    }

    showPosterMode() {
      this.pause();
      this.state.active = false;
      this.root.classList.remove("active");
      this.posterWorkspace.style.display = "";
      this.videoModeBtn.classList.remove("active");
      this.posterModeBtn.classList.add("active");
      this.videoModeBtn.setAttribute("aria-pressed", "false");
      this.posterModeBtn.setAttribute("aria-pressed", "true");
    }

    applyTemplate(templateId, save = true) {
      const t = TEMPLATES.find(item => item.id === templateId) || TEMPLATES[0];
      const keepAssets = this.state.clips.filter(c => (c.type === "video" || c.type === "image") && c.assetId);

      this.state.templateId = t.id;
      this.state.background1 = t.bg1;
      this.state.background2 = t.bg2;
      this.state.accent = t.accent;
      this.state.duration = t.duration;
      this.state.currentTime = 0;

      const headlineSize = this.state.height > this.state.width ? 128 : 105;

      this.state.clips = [
        defaultClip({
          id: uid("clip"), track: "overlay", type: "overlay", name: "Cinematic Shade",
          start: 0, duration: t.duration, opacity: .22, color: "#000000",
          transitionIn: "fade", transitionOut: "fade", transitionDuration: .5
        }),
        defaultClip({
          id: uid("clip"), track: "text", type: "text", name: "Kicker", text: t.kicker,
          start: .2, duration: Math.max(1, t.duration - .4), x: 50, y: 36, width: 86,
          fontSize: 32, fontWeight: 900, color: t.accent, align: "center",
          motionIn: "slide-up", motionOut: "fade", motionDuration: .55, shadow: false
        }),
        defaultClip({
          id: uid("clip"), track: "text", type: "text", name: "Headline", text: t.headline,
          start: .55, duration: Math.max(1, t.duration - .9), x: 50, y: 43, width: 88,
          fontSize: headlineSize, fontWeight: 900, color: "#ffffff", align: "center",
          motionIn: "zoom-in", motionOut: "zoom-out", motionDuration: .6, strokeWidth: 0
        }),
        defaultClip({
          id: uid("clip"), track: "text", type: "text", name: "Details", text: t.detail,
          start: 1.0, duration: Math.max(1, t.duration - 1.4), x: 50, y: 60, width: 78,
          fontSize: 29, fontWeight: 700, color: "#d7dbe0", align: "center",
          motionIn: "fade", motionOut: "fade", motionDuration: .5
        }),
        defaultClip({
          id: uid("clip"), track: "graphic", type: "graphic", name: "Cricket Graphic",
          start: .35, duration: Math.max(1, t.duration - .7), x: 50, y: 73,
          graphic: t.art === "pitch" ? "wickets" : t.art === "gold" ? "trophy" : t.art === "vs" ? "vs" : "ball",
          scale: .85, color: t.accent, opacity: .75,
          motionIn: "pop", motionOut: "fade", motionDuration: .5
        }),
        ...keepAssets.map(c => ({ ...c, start: 0, duration: Math.min(c.duration || t.duration, t.duration) }))
      ];

      this.state.selectedClipId = null;
      this.renderTemplates();
      this.renderTimeline();
      this.renderInspector();
      this.safeRender();
      if (save) this.commit();
    }

    renderTemplates(search = "") {
      const grid = $("#vTemplateGrid", this.root);
      if (!grid) return;
      const q = String(search || "").trim().toLowerCase();
      const list = TEMPLATES.filter(t => !q || `${t.name} ${t.kicker} ${t.headline}`.toLowerCase().includes(q));
      $("#vTemplateCount", this.root).textContent = list.length;

      grid.innerHTML = list.map(t => `
<button class="v-template ${t.id === this.state.templateId ? "active" : ""}" data-template="${t.id}" style="--a:${t.bg1};--b:${t.bg2};--c:${t.accent}">
  <div class="v-template-preview"><b>${esc(t.headline)}</b><small>${esc(t.kicker)}</small></div>
  <div class="v-template-meta"><strong>${esc(t.name)}</strong><small>${t.duration}s sequence</small></div>
</button>`).join("");

      $$("[data-template]", grid).forEach(button => {
        button.addEventListener("click", () => this.applyTemplate(button.dataset.template));
      });
    }

    async importFiles(fileList) {
      const imported = [];
      for (const file of Array.from(fileList || [])) {
        try {
          const type = file.type.startsWith("video/") ? "video"
            : file.type.startsWith("image/") ? "image"
            : file.type.startsWith("audio/") ? "audio" : null;
          if (!type) continue;

          const asset = await this.createAsset(file, type);
          this.assets.set(asset.id, asset);
          imported.push(asset);

          try {
            await this.persistAsset(asset.id, file, { name: file.name, type });
          } catch (error) {
            console.warn("[FWCWL Video asset persistence]", error);
          }
        } catch (error) {
          console.error("[FWCWL Video import]", file?.name, error);
          this.toast(`Could not import ${file?.name || "file"}`);
        }
      }
      this.renderAssets();
      this.scheduleAutosave();
      return imported;
    }

    async createAsset(file, type, forcedId = null) {
      const id = forcedId || uid("asset");
      const url = URL.createObjectURL(file);

      if (type === "image") {
        const image = new Image();
        image.src = url;
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });
        return { id, type, name: file.name, file, url, element: image, duration: 5 };
      }

      const element = document.createElement(type === "video" ? "video" : "audio");
      element.src = url;
      element.preload = "auto";
      element.playsInline = true;
      element.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        const done = () => { cleanup(); resolve(); };
        const fail = () => { cleanup(); reject(new Error("Media metadata failed to load.")); };
        const cleanup = () => {
          element.removeEventListener("loadedmetadata", done);
          element.removeEventListener("error", fail);
        };
        element.addEventListener("loadedmetadata", done);
        element.addEventListener("error", fail);
        element.load();
      });
      const duration = Number.isFinite(element.duration) ? element.duration : 5;
      return { id, type, name: file.name, file, url, element, duration };
    }

    renderAssets() {
      const grid = $("#vAssetGrid", this.root);
      if (!grid) return;
      const assets = Array.from(this.assets.values());

      if (!assets.length) {
        grid.innerHTML = `<div class="v-empty">No imported assets yet. Upload or drag video, image or audio into the editor.</div>`;
        return;
      }

      grid.innerHTML = assets.map(asset => `
<div class="v-asset">
  <div class="v-asset-thumb">
    ${asset.type === "image" ? `<img src="${asset.url}" alt="">`
      : asset.type === "video" ? `<video src="${asset.url}" muted></video>`
      : "♫"}
  </div>
  <div><strong>${esc(asset.name)}</strong><small>${asset.type.toUpperCase()} • ${this.formatTime(asset.duration)}</small></div>
  <button data-add-asset="${asset.id}" title="Add to timeline">＋</button>
</div>`).join("");

      $$("[data-add-asset]", grid).forEach(button => {
        button.addEventListener("click", () => this.addAssetAsClip(button.dataset.addAsset, this.state.currentTime));
      });
    }

    addAssetAsClip(assetId, start = 0) {
      const asset = this.assets.get(assetId);
      if (!asset) return;

      const isAudio = asset.type === "audio";
      const duration = Math.min(asset.duration || 5, Math.max(1, this.state.duration - start));

      const clip = defaultClip({
        id: uid("clip"),
        track: isAudio ? "audio" : "media",
        type: asset.type,
        name: asset.name,
        assetId,
        start: clamp(start, 0, this.state.duration),
        duration: Math.max(.2, duration),
        width: isAudio ? 100 : 100,
        fit: "cover"
      });

      this.state.clips.push(clip);
      this.state.selectedClipId = clip.id;
      this.recalculateDuration();
      this.refreshAll();
      this.commit();
    }

    createLayer(kind) {
      let clip;

      if (kind === "headline" || kind === "subtitle") {
        const headline = kind === "headline";
        clip = defaultClip({
          id: uid("clip"), track: "text", type: "text", name: headline ? "Headline" : "Subtitle",
          text: headline ? "YOUR HEADLINE" : "Add supporting text",
          start: this.state.currentTime, duration: Math.min(4, this.state.duration - this.state.currentTime || 4),
          x: 50, y: headline ? 48 : 62, width: 82, fontSize: headline ? 125 : 38,
          fontWeight: headline ? 900 : 700, color: "#ffffff", align: "center",
          motionIn: headline ? "zoom-in" : "fade", motionOut: "fade"
        });
      } else if (kind === "overlay") {
        clip = defaultClip({
          id: uid("clip"), track: "overlay", type: "overlay", name: "Color Overlay",
          start: this.state.currentTime, duration: Math.min(4, this.state.duration - this.state.currentTime || 4),
          color: "#000000", opacity: .35
        });
      } else {
        clip = defaultClip({
          id: uid("clip"), track: "graphic", type: "graphic",
          name: kind === "score" ? "Score Graphic" : `${kind.charAt(0).toUpperCase()}${kind.slice(1)}`,
          graphic: kind, start: this.state.currentTime,
          duration: Math.min(4, this.state.duration - this.state.currentTime || 4),
          x: 50, y: 52, scale: 1, color: this.state.accent, motionIn: "pop", motionOut: "fade"
        });
      }

      clip.duration = Math.max(.3, clip.duration);
      this.state.clips.push(clip);
      this.state.selectedClipId = clip.id;
      this.refreshAll();
      this.commit();
    }

    selectedClip() {
      return this.state.clips.find(c => c.id === this.state.selectedClipId) || null;
    }

    selectClip(id) {
      this.state.selectedClipId = id;
      this.renderTimeline();
      this.renderInspector();
      this.safeRender();
    }

    splitSelected() {
      const clip = this.selectedClip();
      if (!clip || clip.locked) return;
      const local = this.state.currentTime - clip.start;
      if (local <= .08 || local >= clip.duration - .08) {
        this.toast("Place the playhead inside the selected clip to split.");
        return;
      }

      const second = safeClone(clip);
      second.id = uid("clip");
      second.name = `${clip.name} B`;
      second.start = this.state.currentTime;
      second.duration = clip.duration - local;
      if (clip.type === "video" || clip.type === "audio") {
        second.trimIn = (clip.trimIn || 0) + local * (clip.speed || 1);
      }
      second.keyframes = (clip.keyframes || [])
        .filter(k => k.t > local)
        .map(k => ({ ...k, t: k.t - local }));

      clip.duration = local;
      clip.keyframes = (clip.keyframes || []).filter(k => k.t <= local);

      this.state.clips.push(second);
      this.state.selectedClipId = second.id;
      this.refreshAll();
      this.commit();
    }

    duplicateSelected() {
      const clip = this.selectedClip();
      if (!clip) return;
      const copy = safeClone(clip);
      copy.id = uid("clip");
      copy.name = `${clip.name} Copy`;
      copy.start = clamp(clip.start + Math.min(.25, clip.duration * .1), 0, this.state.duration);
      this.state.clips.push(copy);
      this.state.selectedClipId = copy.id;
      this.refreshAll();
      this.commit();
    }

    deleteSelected() {
      if (!this.state.selectedClipId) return;
      this.state.clips = this.state.clips.filter(c => c.id !== this.state.selectedClipId);
      this.state.selectedClipId = null;
      this.refreshAll();
      this.commit();
    }

    moveClipLayer(direction) {
      const clip = this.selectedClip();
      if (!clip) return;
      const index = this.state.clips.findIndex(c => c.id === clip.id);
      const target = clamp(index + direction, 0, this.state.clips.length - 1);
      if (target === index) return;
      const [item] = this.state.clips.splice(index, 1);
      this.state.clips.splice(target, 0, item);
      this.refreshAll();
      this.commit();
    }

    addMarker() {
      const t = round(this.state.currentTime, 3);
      if (!this.state.markers.some(m => Math.abs(m - t) < .03)) {
        this.state.markers.push(t);
        this.state.markers.sort((a,b) => a-b);
        this.renderTimeline();
        this.commit();
      }
    }

    addKeyframe() {
      const clip = this.selectedClip();
      if (!clip) return;
      const local = clamp(this.state.currentTime - clip.start, 0, clip.duration);
      if (!clip.keyframes) clip.keyframes = [];

      const data = {
        id: uid("kf"),
        t: round(local, 3),
        x: clip.x, y: clip.y, scale: clip.scale, rotation: clip.rotation, opacity: clip.opacity
      };

      const existing = clip.keyframes.findIndex(k => Math.abs(k.t - local) < .04);
      if (existing >= 0) clip.keyframes[existing] = data;
      else clip.keyframes.push(data);

      clip.keyframes.sort((a,b) => a.t-b.t);
      this.renderTimeline();
      this.renderInspector();
      this.commit();
    }

    deleteKeyframe(id) {
      const clip = this.selectedClip();
      if (!clip) return;
      clip.keyframes = (clip.keyframes || []).filter(k => k.id !== id);
      this.renderTimeline();
      this.renderInspector();
      this.commit();
    }

    interpolateKeyframes(clip, localTime) {
      const list = (clip.keyframes || []).slice().sort((a,b) => a.t-b.t);
      if (!list.length) return {
        x: clip.x, y: clip.y, scale: clip.scale, rotation: clip.rotation, opacity: clip.opacity
      };

      if (localTime <= list[0].t) return { ...list[0] };
      if (localTime >= list[list.length - 1].t) return { ...list[list.length - 1] };

      let a = list[0], b = list[list.length - 1];
      for (let i=0; i<list.length-1; i++) {
        if (localTime >= list[i].t && localTime <= list[i+1].t) {
          a = list[i]; b = list[i+1]; break;
        }
      }

      const raw = (localTime - a.t) / Math.max(.001, b.t - a.t);
      const p = raw < .5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;

      return {
        x: a.x + (b.x-a.x)*p,
        y: a.y + (b.y-a.y)*p,
        scale: a.scale + (b.scale-a.scale)*p,
        rotation: a.rotation + (b.rotation-a.rotation)*p,
        opacity: a.opacity + (b.opacity-a.opacity)*p
      };
    }

    renderTimeline() {
      const zoom = this.state.timelineZoom;
      const width = Math.max(600, Math.ceil(this.state.duration * zoom));
      this.timelineInner.style.width = `${width}px`;
      $("#vZoomLabel", this.root).textContent = `${Math.round(zoom)} px/s`;

      const ruler = $("#vRuler", this.root);
      const minor = zoom >= 120 ? .5 : 1;
      const ticks = [];
      for (let t = 0; t <= this.state.duration + .001; t += minor) {
        const major = Math.abs(t - Math.round(t)) < .001;
        ticks.push(`<div class="v-tick ${major ? "major" : ""}" style="left:${t*zoom}px">${major ? `<span>${this.formatTime(t, false)}</span>` : ""}</div>`);
      }
      ruler.innerHTML = ticks.join("");

      TRACKS.forEach(track => {
        const row = $(`[data-track="${track.id}"]`, this.root);
        const clips = this.state.clips.filter(c => c.track === track.id);
        row.innerHTML = clips.map(c => {
          const left = c.start * zoom;
          const clipWidth = Math.max(18, c.duration * zoom);
          const kfs = (c.keyframes || []).map(k => `<i class="v-kf-dot" style="left:${(k.t / c.duration) * 100}%"></i>`).join("");
          return `
<div class="v-clip ${c.id === this.state.selectedClipId ? "selected" : ""}" data-clip-id="${c.id}" data-type="${c.type}" style="left:${left}px;width:${clipWidth}px;opacity:${c.visible === false ? .35 : 1}">
  <i class="v-trim left"></i><span class="v-clip-label">${c.locked ? "▣ " : ""}${esc(c.name)}</span>${kfs}<i class="v-trim right"></i>
</div>`;
        }).join("");
      });

      $$(".v-clip", this.root).forEach(el => {
        el.addEventListener("click", event => {
          event.stopPropagation();
          this.selectClip(el.dataset.clipId);
        });
      });

      const markers = $$(".v-marker", this.timelineInner);
      markers.forEach(el => el.remove());
      this.state.markers.forEach(t => {
        const marker = document.createElement("div");
        marker.className = "v-marker";
        marker.style.left = `${t * zoom}px`;
        this.timelineInner.appendChild(marker);
      });

      this.updatePlayhead();
    }

    updatePlayhead() {
      if (!this.playhead) return;
      this.playhead.style.left = `${this.state.currentTime * this.state.timelineZoom}px`;
      $("#vTime", this.root).textContent = `${this.formatTime(this.state.currentTime)} / ${this.formatTime(this.state.duration)}`;
    }

    renderInspector() {
      const clip = this.selectedClip();
      const title = $("#vInspectorTitle", this.root);
      const type = $("#vInspectorType", this.root);

      if (!clip) {
        title.textContent = "Project";
        type.textContent = "VIDEO";
        this.inspector.innerHTML = this.projectInspectorHtml();
        this.bindProjectInspector();
        return;
      }

      title.textContent = clip.name;
      type.textContent = clip.type.toUpperCase();
      this.inspector.innerHTML = this.clipInspectorHtml(clip);
      this.bindClipInspector(clip);
    }

    projectInspectorHtml() {
      return `
<div class="v-section">
  <div class="v-kicker">PROJECT</div><h3>Sequence Settings</h3><p>Global timing and canvas controls.</p>
  ${this.rangeHtml("vDuration","Duration",2,60,this.state.duration,"s",.25)}
  ${this.rangeHtml("vFPS","Preview FPS",24,60,this.state.fps,"",1)}
  <label class="v-field"><span>Background A</span><input id="vBg1" type="color" value="${this.state.background1}"></label>
  <label class="v-field"><span>Background B</span><input id="vBg2" type="color" value="${this.state.background2}"></label>
  <label class="v-field"><span>Accent</span><input id="vAccent" type="color" value="${this.state.accent}"></label>
</div>
<div class="v-section">
  <div class="v-kicker">BRAND</div><h3>FWCWL Identity</h3>
  <label class="v-field"><span>Official Logo</span><select id="vLogo"><option value="1" ${this.state.showLogo ? "selected":""}>Visible</option><option value="0" ${!this.state.showLogo ? "selected":""}>Hidden</option></select></label>
</div>
<div class="v-section">
  <div class="v-kicker">SHORTCUTS</div><h3>Power Editing</h3>
  <p>Space play/pause · S split · Cmd/Ctrl+D duplicate · Delete remove · Arrow keys frame step · Shift+Arrow 1 second.</p>
</div>`;
    }

    clipInspectorHtml(c) {
      const isMedia = c.type === "video" || c.type === "image";
      const isTimedMedia = c.type === "video" || c.type === "audio";
      const isAudio = c.type === "audio";
      const isText = c.type === "text";
      const isGraphic = c.type === "graphic";
      const hasVisualTransform = !isAudio;

      return `
<div class="v-section">
  <div class="v-kicker">CLIP</div><h3>Timing</h3>
  <div class="v-grid2">
    <label class="v-field"><span>Start</span><input id="vClipStart" type="number" min="0" step=".01" value="${round(c.start,2)}"></label>
    <label class="v-field"><span>Duration</span><input id="vClipDuration" type="number" min=".1" step=".01" value="${round(c.duration,2)}"></label>
  </div>
  ${isTimedMedia ? `<div class="v-grid2">
    <label class="v-field"><span>Trim In</span><input id="vTrimIn" type="number" min="0" step=".01" value="${round(c.trimIn || 0,2)}"></label>
    <label class="v-field"><span>Speed</span><input id="vSpeedNumber" type="number" min=".1" max="4" step=".05" value="${round(c.speed || 1,2)}"></label>
  </div>` : ""}
</div>

${isText ? `
<div class="v-section">
  <div class="v-kicker">TEXT</div><h3>Typography</h3>
  <label class="v-field"><span>Content</span><textarea id="vText">${esc(c.text || "")}</textarea></label>
  <div class="v-grid2">
    <label class="v-field"><span>Font</span><select id="vFont">${["Montserrat","Bebas Neue","DM Sans","Poppins","Playfair Display"].map(f => `<option ${c.font===f?"selected":""}>${f}</option>`).join("")}</select></label>
    <label class="v-field"><span>Weight</span><select id="vWeight">${[400,500,600,700,800,900].map(w => `<option value="${w}" ${Number(c.fontWeight)===w?"selected":""}>${w}</option>`).join("")}</select></label>
  </div>
  ${this.rangeHtml("vFontSize","Font Size",12,300,c.fontSize || 110,"",1)}
  <div class="v-grid2">
    <label class="v-field"><span>Fill</span><input id="vTextColor" type="color" value="${c.color || "#ffffff"}"></label>
    <label class="v-field"><span>Stroke</span><input id="vStrokeColor" type="color" value="${c.strokeColor || "#000000"}"></label>
  </div>
  ${this.rangeHtml("vStrokeWidth","Stroke Width",0,20,c.strokeWidth || 0,"",1)}
  <label class="v-field"><span>Alignment</span><select id="vTextAlign">${["left","center","right"].map(a => `<option ${c.align===a?"selected":""}>${a}</option>`).join("")}</select></label>
</div>` : ""}

${isGraphic ? `
<div class="v-section">
  <div class="v-kicker">GRAPHIC</div><h3>Cricket Element</h3>
  <label class="v-field"><span>Type</span><select id="vGraphic">${["ball","wickets","vs","trophy","score"].map(g => `<option ${c.graphic===g?"selected":""}>${g}</option>`).join("")}</select></label>
  <label class="v-field"><span>Color</span><input id="vGraphicColor" type="color" value="${c.color || this.state.accent}"></label>
</div>` : ""}

${c.type === "overlay" ? `
<div class="v-section">
  <div class="v-kicker">OVERLAY</div><h3>Color Layer</h3>
  <label class="v-field"><span>Color</span><input id="vOverlayColor" type="color" value="${c.color || "#000000"}"></label>
</div>` : ""}

${hasVisualTransform ? `
<div class="v-section">
  <div class="v-kicker">TRANSFORM</div><h3>Position & Scale</h3>
  ${this.rangeHtml("vX","Horizontal",0,100,c.x,"% ",.1)}
  ${this.rangeHtml("vY","Vertical",0,100,c.y,"% ",.1)}
  ${this.rangeHtml("vScale","Scale",10,400,(c.scale || 1)*100,"%",1)}
  ${this.rangeHtml("vRotation","Rotation",-180,180,c.rotation || 0,"°",1)}
  ${this.rangeHtml("vOpacity","Opacity",0,100,(c.opacity ?? 1)*100,"%",1)}
  ${isMedia ? `<label class="v-field"><span>Fit</span><select id="vFit">${["cover","contain","stretch"].map(f => `<option ${c.fit===f?"selected":""}>${f}</option>`).join("")}</select></label>` : ""}
  <div class="v-actions"><button id="vCenterClip">Center</button><button id="vResetTransform">Reset Transform</button></div>
</div>` : ""}

${isMedia ? `
<div class="v-section">
  <div class="v-kicker">COLOR</div><h3>Professional Adjustments</h3>
  <label class="v-field"><span>Preset</span><select id="vEffect">${Object.entries(EFFECTS).map(([id,e]) => `<option value="${id}" ${c.effect===id?"selected":""}>${e.label}</option>`).join("")}</select></label>
  ${this.rangeHtml("vBrightness","Brightness",-100,100,c.brightness || 0,"",1)}
  ${this.rangeHtml("vContrast","Contrast",-100,100,c.contrast || 0,"",1)}
  ${this.rangeHtml("vSaturation","Saturation",-100,100,c.saturation || 0,"",1)}
  ${this.rangeHtml("vHue","Hue",-180,180,c.hue || 0,"°",1)}
  ${this.rangeHtml("vBlur","Blur",0,24,c.blur || 0,"",1)}
  ${this.rangeHtml("vSepia","Sepia",0,100,c.sepia || 0,"%",1)}
  ${this.rangeHtml("vGray","B&W",0,100,c.grayscale || 0,"%",1)}
  <div class="v-actions"><button id="vResetEffects">Reset Effects</button><button id="vPunchEffect">Punch</button></div>
</div>` : ""}

<div class="v-section">
  <div class="v-kicker">MOTION</div><h3>Transitions & Animation</h3>
  <div class="v-grid2">
    <label class="v-field"><span>Transition In</span><select id="vTransIn">${TRANSITIONS.map(v => `<option value="${v}" ${c.transitionIn===v?"selected":""}>${v}</option>`).join("")}</select></label>
    <label class="v-field"><span>Transition Out</span><select id="vTransOut">${TRANSITIONS.map(v => `<option value="${v}" ${c.transitionOut===v?"selected":""}>${v}</option>`).join("")}</select></label>
  </div>
  ${this.rangeHtml("vTransDuration","Transition Duration",0,2,c.transitionDuration || .35,"s",.05)}
  <div class="v-grid2">
    <label class="v-field"><span>Motion In</span><select id="vMotionIn">${MOTIONS.map(v => `<option value="${v}" ${c.motionIn===v?"selected":""}>${v}</option>`).join("")}</select></label>
    <label class="v-field"><span>Motion Out</span><select id="vMotionOut">${MOTIONS.map(v => `<option value="${v}" ${c.motionOut===v?"selected":""}>${v}</option>`).join("")}</select></label>
  </div>
  ${this.rangeHtml("vMotionDuration","Motion Duration",0,2,c.motionDuration || .45,"s",.05)}
</div>

<div class="v-section">
  <div class="v-kicker">KEYFRAMES</div><h3>Precision Motion</h3><p>Add a transform keyframe at the current playhead position.</p>
  <div class="v-actions"><button id="vAddKeyframe">+ Keyframe</button><button id="vClearKeyframes">Clear All</button></div>
  <div class="v-keyframes">${(c.keyframes || []).map(k => `<button class="v-keyframe" data-kf="${k.id}">${round(k.t,2)}s ×</button>`).join("") || `<span style="color:#555d67;font-size:6px;margin-top:6px">No keyframes</span>`}</div>
</div>

${isAudio || c.type === "video" ? `
<div class="v-section">
  <div class="v-kicker">AUDIO</div><h3>Sound</h3>
  ${this.rangeHtml("vVolume","Volume",0,150,(c.volume ?? 1)*100,"%",1)}
  ${this.rangeHtml("vFadeIn","Fade In",0,5,c.fadeIn || 0,"s",.05)}
  ${this.rangeHtml("vFadeOut","Fade Out",0,5,c.fadeOut || 0,"s",.05)}
  <label class="v-field"><span>Mute</span><select id="vMute"><option value="0" ${!c.muted?"selected":""}>Audio On</option><option value="1" ${c.muted?"selected":""}>Muted</option></select></label>
</div>` : ""}

<div class="v-section">
  <div class="v-kicker">ARRANGE</div><h3>Clip Actions</h3>
  <div class="v-actions">
    <button id="vInsSplit">Split</button><button id="vInsDuplicate">Duplicate</button>
    <button id="vInsForward">Bring Forward</button><button id="vInsBackward">Send Backward</button>
    <button id="vInsLock">${c.locked ? "Unlock" : "Lock"}</button><button id="vInsVisible">${c.visible === false ? "Show" : "Hide"}</button>
    <button id="vInsDelete" class="danger">Delete</button>
  </div>
</div>`;
    }

    rangeHtml(id, label, min, max, value, suffix = "", step = 1) {
      return `
<label class="v-range"><div><span>${label}</span><b id="${id}Value">${round(value, step < 1 ? 2 : 0)}${suffix}</b></div>
<input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
    }

    bindProjectInspector() {
      this.bindRange("#vDuration", value => {
        this.state.duration = clamp(value, 2, 60);
        this.state.currentTime = Math.min(this.state.currentTime, this.state.duration);
        this.state.clips.forEach(c => {
          if (c.start >= this.state.duration) c.start = Math.max(0, this.state.duration - .2);
          c.duration = Math.min(c.duration, Math.max(.1, this.state.duration - c.start));
        });
        this.renderTimeline();
        this.safeRender();
      });
      this.bindRange("#vFPS", value => { this.state.fps = Math.round(value); });
      this.bindInput("#vBg1","input",e => { this.state.background1=e.target.value; this.safeRender(); });
      this.bindInput("#vBg2","input",e => { this.state.background2=e.target.value; this.safeRender(); });
      this.bindInput("#vAccent","input",e => { this.state.accent=e.target.value; this.safeRender(); });
      this.bindInput("#vLogo","change",e => { this.state.showLogo=e.target.value==="1"; this.safeRender(); this.commit(); });
    }

    bindClipInspector(c) {
      const n = (selector, event, fn, commit = true) => this.bindInput(selector, event, e => {
        fn(e);
        this.safeRender();
        if (commit && event === "change") this.commit();
      });

      n("#vClipStart","change",e => { c.start=clamp(+e.target.value,0,this.state.duration-.05); this.recalculateDuration(); this.renderTimeline(); });
      n("#vClipDuration","change",e => { c.duration=clamp(+e.target.value,.1,Math.max(.1,this.state.duration-c.start)); this.renderTimeline(); });
      n("#vTrimIn","change",e => { c.trimIn=Math.max(0,+e.target.value||0); });
      n("#vSpeedNumber","change",e => { c.speed=clamp(+e.target.value,.1,4); });

      n("#vText","input",e => c.text=e.target.value,false);
      n("#vFont","change",e => c.font=e.target.value);
      n("#vWeight","change",e => c.fontWeight=+e.target.value);
      this.bindRange("#vFontSize",v => { c.fontSize=v; this.safeRender(); });
      n("#vTextColor","input",e => c.color=e.target.value,false);
      n("#vStrokeColor","input",e => c.strokeColor=e.target.value,false);
      this.bindRange("#vStrokeWidth",v => { c.strokeWidth=v; this.safeRender(); });
      n("#vTextAlign","change",e => c.align=e.target.value);

      n("#vGraphic","change",e => c.graphic=e.target.value);
      n("#vGraphicColor","input",e => c.color=e.target.value,false);
      n("#vOverlayColor","input",e => c.color=e.target.value,false);

      this.bindRange("#vX",v => { c.x=v; this.safeRender(); });
      this.bindRange("#vY",v => { c.y=v; this.safeRender(); });
      this.bindRange("#vScale",v => { c.scale=v/100; this.safeRender(); });
      this.bindRange("#vRotation",v => { c.rotation=v; this.safeRender(); });
      this.bindRange("#vOpacity",v => { c.opacity=v/100; this.safeRender(); });
      n("#vFit","change",e => c.fit=e.target.value);

      n("#vEffect","change",e => {
        c.effect=e.target.value;
        const p=EFFECTS[c.effect]||EFFECTS.clean;
        Object.assign(c,p);
        this.renderInspector();
      });
      this.bindRange("#vBrightness",v => { c.brightness=v; this.safeRender(); });
      this.bindRange("#vContrast",v => { c.contrast=v; this.safeRender(); });
      this.bindRange("#vSaturation",v => { c.saturation=v; this.safeRender(); });
      this.bindRange("#vHue",v => { c.hue=v; this.safeRender(); });
      this.bindRange("#vBlur",v => { c.blur=v; this.safeRender(); });
      this.bindRange("#vSepia",v => { c.sepia=v; this.safeRender(); });
      this.bindRange("#vGray",v => { c.grayscale=v; this.safeRender(); });

      n("#vTransIn","change",e => c.transitionIn=e.target.value);
      n("#vTransOut","change",e => c.transitionOut=e.target.value);
      this.bindRange("#vTransDuration",v => { c.transitionDuration=v; this.safeRender(); });
      n("#vMotionIn","change",e => c.motionIn=e.target.value);
      n("#vMotionOut","change",e => c.motionOut=e.target.value);
      this.bindRange("#vMotionDuration",v => { c.motionDuration=v; this.safeRender(); });

      this.bindRange("#vVolume",v => { c.volume=v/100; this.updateAudioMix(); });
      this.bindRange("#vFadeIn",v => { c.fadeIn=v; this.updateAudioMix(); });
      this.bindRange("#vFadeOut",v => { c.fadeOut=v; this.updateAudioMix(); });
      n("#vMute","change",e => { c.muted=e.target.value==="1"; this.updateAudioMix(); });

      const click = (selector, fn) => {
        const el=$(selector,this.root);
        if(el) el.addEventListener("click",fn);
      };

      click("#vCenterClip",()=>{c.x=50;c.y=50;this.refreshAll();this.commit();});
      click("#vResetTransform",()=>{c.x=50;c.y=50;c.scale=1;c.rotation=0;c.opacity=1;this.refreshAll();this.commit();});
      click("#vResetEffects",()=>{Object.assign(c,EFFECTS.clean);c.effect="clean";this.refreshAll();this.commit();});
      click("#vPunchEffect",()=>{Object.assign(c,EFFECTS.punch);c.effect="punch";this.refreshAll();this.commit();});
      click("#vAddKeyframe",()=>this.addKeyframe());
      click("#vClearKeyframes",()=>{c.keyframes=[];this.renderTimeline();this.renderInspector();this.commit();});

      $$("[data-kf]",this.root).forEach(button=>button.addEventListener("click",()=>this.deleteKeyframe(button.dataset.kf)));

      click("#vInsSplit",()=>this.splitSelected());
      click("#vInsDuplicate",()=>this.duplicateSelected());
      click("#vInsForward",()=>this.moveClipLayer(1));
      click("#vInsBackward",()=>this.moveClipLayer(-1));
      click("#vInsLock",()=>{c.locked=!c.locked;this.refreshAll();this.commit();});
      click("#vInsVisible",()=>{c.visible=c.visible===false;this.refreshAll();this.commit();});
      click("#vInsDelete",()=>this.deleteSelected());
    }

    bindInput(selector, eventName, handler) {
      const el = $(selector, this.root);
      if (!el) return;
      el.addEventListener(eventName, handler);
      if (eventName === "input") {
        el.addEventListener("change", () => this.commit());
      }
    }

    bindRange(selector, callback) {
      const input = $(selector, this.root);
      if (!input) return;
      const label = $(`${selector}Value`, this.root);
      input.addEventListener("input", () => {
        const value = Number(input.value);
        callback(value);
        if (label) {
          const original = label.textContent;
          const suffixMatch = original.match(/[^\d.\-]+$/);
          const suffix = suffixMatch ? suffixMatch[0] : "";
          label.textContent = `${round(value, Number(input.step) < 1 ? 2 : 0)}${suffix}`;
        }
      });
      input.addEventListener("change", () => this.commit());
    }

    changeFormat(format) {
      const f = FORMATS[format];
      if (!f) return;
      this.state.format = format;
      this.state.width = f.width;
      this.state.height = f.height;
      this.canvas.width = f.width;
      this.canvas.height = f.height;
      this.fitPreview();
      this.safeRender();
      this.commit();
    }

    fitPreview() {
      const wrap = $(".v-preview-wrap", this.root);
      const frame = $("#vPreviewFrame", this.root);
      if (!wrap || !frame) return;
      const maxW = Math.max(100, wrap.clientWidth - 36);
      const maxH = Math.max(100, wrap.clientHeight - 36);
      const ratio = this.state.width / this.state.height;
      let w = maxW, h = w / ratio;
      if (h > maxH) { h = maxH; w = h * ratio; }
      frame.style.width = `${w}px`;
      frame.style.height = `${h}px`;
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
    }

    safeRender(time = this.state.currentTime) {
      try {
        this.render(time);
      } catch (error) {
        console.error("[FWCWL Video render]", error);
        setStatus("ready", `render warning: ${error.message || error}`);
      }
    }

    render(time = 0) {
      const ctx = this.ctx;
      const w = this.state.width;
      const h = this.state.height;

      if (this.canvas.width !== w) this.canvas.width = w;
      if (this.canvas.height !== h) this.canvas.height = h;

      const bg = ctx.createLinearGradient(0,0,w,h);
      bg.addColorStop(0,this.state.background1);
      bg.addColorStop(1,this.state.background2);
      ctx.fillStyle = bg;
      ctx.fillRect(0,0,w,h);

      this.drawTemplateArt(ctx,w,h,this.state.templateId,time);

      const trackOrder = new Map(TRACKS.map((t,i)=>[t.id,i]));
      const active = this.state.clips
        .filter(c => c.visible !== false && time >= c.start && time <= c.start + c.duration)
        .slice()
        .sort((a,b) => {
          const ta=trackOrder.get(a.track)||0, tb=trackOrder.get(b.track)||0;
          if(ta!==tb) return ta-tb;
          return this.state.clips.indexOf(a)-this.state.clips.indexOf(b);
        });

      active.forEach(clip => {
        if (clip.type === "audio") return;
        this.drawClip(ctx, clip, time, w, h);
      });

      this.drawBrand(ctx,w,h);
      if(this.state.safeZone) this.drawSafeZone(ctx,w,h);
      this.syncMedia(time);
      this.updatePlayhead();
    }

    drawTemplateArt(ctx,w,h,templateId,time) {
      const t = TEMPLATES.find(item=>item.id===templateId) || TEMPLATES[0];
      const p = (time % 4) / 4;
      ctx.save();

      if (["slash","news","fixture","reveal"].includes(t.art)) {
        for(let i=0;i<6;i++){
          ctx.save();
          ctx.translate(w*(.5+i*.09)-p*w*.08,h*.45);
          ctx.rotate(-.25);
          ctx.fillStyle=`rgba(241,195,77,${.018+i*.008})`;
          ctx.fillRect(0,-h*.7,w*.055,h*1.4);
          ctx.restore();
        }
      }

      if (t.art==="stadium") {
        for(let i=0;i<7;i++){
          const x=w*(.08+i*.14);
          const g=ctx.createLinearGradient(x,0,w/2,h*.78);
          g.addColorStop(0,"rgba(255,255,255,.085)");
          g.addColorStop(1,"rgba(255,255,255,0)");
          ctx.fillStyle=g;
          ctx.beginPath();
          ctx.moveTo(x-w*.015,0);ctx.lineTo(x+w*.015,0);ctx.lineTo(w/2,h*.78);ctx.closePath();ctx.fill();
        }
      }

      if (t.art==="gold" || t.art==="confetti") {
        ctx.translate(w/2,h*.45);
        for(let i=0;i<18;i++){
          ctx.save();ctx.rotate((i/18)*Math.PI*2 + p*.08);
          ctx.fillStyle=`rgba(241,195,77,${i%2?.018:.045})`;
          ctx.fillRect(w*.1,-w*.006,w*.38,w*.012);ctx.restore();
        }
      }

      if (t.art==="pitch") {
        ctx.strokeStyle="rgba(241,195,77,.15)";ctx.lineWidth=w*.003;
        ctx.strokeRect(w*.62,h*.18,w*.25,h*.52);
      }

      if (t.art==="grid") {
        for(let r=0;r<4;r++)for(let c=0;c<3;c++){
          ctx.fillStyle=(r===0&&c===0)?"rgba(241,195,77,.12)":"rgba(255,255,255,.02)";
          ctx.fillRect(w*(.59+c*.105),h*(.43+r*.07),w*.09,h*.05);
        }
      }

      ctx.restore();
    }

    drawClip(ctx,c,time,w,h) {
      const local = clamp(time-c.start,0,c.duration);
      const k = this.interpolateKeyframes(c,local);
      const transition = this.transitionState(c,local);
      const motion = this.motionState(c,local);

      const x = w*(k.x/100) + motion.dx*w;
      const y = h*(k.y/100) + motion.dy*h;
      const scale = (k.scale ?? c.scale ?? 1) * motion.scale * transition.scale;
      const rotation = (k.rotation ?? c.rotation ?? 0) + motion.rotation + transition.rotation;
      const opacity = clamp((k.opacity ?? c.opacity ?? 1) * motion.opacity * transition.opacity,0,1);

      ctx.save();
      ctx.globalAlpha = opacity;

      if (transition.clip) {
        ctx.beginPath();
        const r=transition.clip;
        ctx.rect(w*r.x,h*r.y,w*r.w,h*r.h);
        ctx.clip();
      }

      ctx.translate(x,y);
      ctx.rotate(rotation*Math.PI/180);
      ctx.scale(scale,scale);

      if (c.type==="video" || c.type==="image") {
        this.drawMediaClip(ctx,c,w,h);
      } else if (c.type==="text") {
        this.drawTextClip(ctx,c,w,h);
      } else if (c.type==="graphic") {
        this.drawGraphicClip(ctx,c,w,h);
      } else if (c.type==="overlay") {
        ctx.fillStyle=c.color||"#000";
        ctx.fillRect(-w,-h,w*2,h*2);
      }

      if (transition.flash>0) {
        ctx.globalAlpha=transition.flash;
        ctx.fillStyle="#fff";
        ctx.fillRect(-w,-h,w*2,h*2);
      }

      ctx.restore();
    }

    drawMediaClip(ctx,c,w,h) {
      const asset=this.assets.get(c.assetId);
      const el=asset?.element;
      if(!el) return;

      const mediaW = c.width ? w*(c.width/100) : w;
      const mediaH = h;
      let drawW=mediaW, drawH=mediaH;

      const sw = asset.type==="video" ? (el.videoWidth||w) : (el.naturalWidth||w);
      const sh = asset.type==="video" ? (el.videoHeight||h) : (el.naturalHeight||h);
      const srcRatio=sw/sh;
      const targetRatio=mediaW/mediaH;

      if(c.fit==="contain"){
        if(srcRatio>targetRatio){drawW=mediaW;drawH=mediaW/srcRatio;}
        else{drawH=mediaH;drawW=mediaH*srcRatio;}
      }else if(c.fit==="cover"){
        if(srcRatio>targetRatio){drawH=mediaH;drawW=mediaH*srcRatio;}
        else{drawW=mediaW;drawH=mediaW/srcRatio;}
      }

      ctx.filter = [
        `brightness(${100+(c.brightness||0)}%)`,
        `contrast(${100+(c.contrast||0)}%)`,
        `saturate(${100+(c.saturation||0)}%)`,
        `hue-rotate(${c.hue||0}deg)`,
        `blur(${c.blur||0}px)`,
        `sepia(${c.sepia||0}%)`,
        `grayscale(${c.grayscale||0}%)`
      ].join(" ");

      ctx.drawImage(el,-drawW/2,-drawH/2,drawW,drawH);
      ctx.filter="none";
    }

    drawTextClip(ctx,c,w,h) {
      const maxWidth=w*((c.width||80)/100);
      const size=(c.fontSize||100)*(w/1080);
      ctx.font=`${c.fontWeight||800} ${size}px "${c.font||"Montserrat"}"`;
      ctx.textAlign=c.align||"center";
      ctx.textBaseline="middle";
      ctx.fillStyle=c.color||"#fff";
      ctx.lineJoin="round";

      if(c.shadow){
        ctx.shadowColor="rgba(0,0,0,.48)";
        ctx.shadowBlur=(c.shadowBlur||18)*(w/1080);
        ctx.shadowOffsetY=6*(w/1080);
      }

      const lines=this.wrapText(ctx,c.text||"",maxWidth);
      const lineHeight=size*.9;
      const top=-(lines.length-1)*lineHeight/2;

      lines.forEach((line,i)=>{
        const yy=top+i*lineHeight;
        if((c.strokeWidth||0)>0){
          ctx.strokeStyle=c.strokeColor||"#000";
          ctx.lineWidth=(c.strokeWidth||0)*(w/1080);
          ctx.strokeText(line,0,yy);
        }
        ctx.fillText(line,0,yy);
      });
    }

    drawGraphicClip(ctx,c,w,h) {
      const s=w/1080;
      ctx.scale(s,s);
      ctx.fillStyle=c.color||this.state.accent;
      ctx.strokeStyle=c.color||this.state.accent;
      ctx.lineWidth=5;

      if(c.graphic==="ball"){
        ctx.fillStyle="#a61e2c";ctx.beginPath();ctx.arc(0,0,74,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#ead4d6";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-12,-68);ctx.lineTo(12,68);ctx.stroke();
      }else if(c.graphic==="wickets"){
        ctx.fillStyle="#f3ead4";
        [-50,0,50].forEach(x=>ctx.fillRect(x-7,-115,14,230));
        ctx.fillStyle=c.color||this.state.accent;ctx.fillRect(-64,-122,56,9);ctx.fillRect(8,-122,56,9);
      }else if(c.graphic==="vs"){
        ctx.fillStyle="rgba(8,9,11,.88)";ctx.strokeStyle=c.color||this.state.accent;ctx.lineWidth=6;
        ctx.beginPath();ctx.arc(0,0,95,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.fillStyle="#fff";ctx.font='400 92px "Bebas Neue"';ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("VS",0,8);
      }else if(c.graphic==="trophy"){
        ctx.fillStyle=c.color||this.state.accent;this.roundRect(ctx,-60,-105,120,115,28);ctx.fill();
        ctx.fillRect(-13,5,26,76);this.roundRect(ctx,-78,72,156,32,7);ctx.fill();
      }else if(c.graphic==="score"){
        ctx.fillStyle="rgba(9,11,14,.88)";this.roundRect(ctx,-190,-65,380,130,16);ctx.fill();
        ctx.strokeStyle=c.color||this.state.accent;ctx.stroke();
        ctx.fillStyle="#fff";ctx.font='400 70px "Bebas Neue"';ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("186 / 5",0,0);
      }
    }

    roundRect(ctx,x,y,w,h,r){
      const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);
      ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
    }

    wrapText(ctx,text,maxWidth){
      const result=[];
      String(text||"").split("\n").forEach(paragraph=>{
        if(!paragraph){result.push("");return;}
        let line="";
        paragraph.split(/\s+/).forEach(word=>{
          const test=line?`${line} ${word}`:word;
          if(ctx.measureText(test).width>maxWidth && line){result.push(line);line=word;}
          else line=test;
        });
        result.push(line);
      });
      return result;
    }

    transitionState(c,local){
      const d=Math.max(.001,c.transitionDuration||.35);
      let inP=clamp(local/d,0,1);
      let outP=clamp((c.duration-local)/d,0,1);
      let opacity=1,scale=1,rotation=0,clip=null,flash=0;

      const apply=(type,p,isIn)=>{
        if(type==="none") return;
        const q=isIn?p:p;
        if(type==="fade"||type==="dissolve") opacity*=q;
        if(type==="zoom") scale*=isIn?(.72+.28*q):(.72+.28*q);
        if(type==="spin") rotation+=(isIn?(1-q):(q-1))*18;
        if(type==="flash") flash=Math.max(flash,(1-q)*.65);
        if(type==="blur") opacity*=.55+.45*q;
        if(type.startsWith("wipe-")){
          if(type==="wipe-left") clip={x:0,y:0,w:q,h:1};
          if(type==="wipe-right") clip={x:1-q,y:0,w:q,h:1};
          if(type==="wipe-up") clip={x:0,y:1-q,w:1,h:q};
          if(type==="wipe-down") clip={x:0,y:0,w:1,h:q};
        }
        if(type==="glitch"){opacity*=.75+.25*q;rotation+=(1-q)*Math.sin(local*55)*1.4;}
      };

      if(local<d) apply(c.transitionIn||"none",inP,true);
      if(c.duration-local<d) apply(c.transitionOut||"none",outP,false);
      return{opacity,scale,rotation,clip,flash};
    }

    motionState(c,local){
      const d=Math.max(.001,c.motionDuration||.45);
      let p=1,phase="none",type="none";
      if(local<d){p=clamp(local/d,0,1);phase="in";type=c.motionIn||"none";}
      else if(c.duration-local<d){p=clamp((c.duration-local)/d,0,1);phase="out";type=c.motionOut||"none";}
      const eased=1-Math.pow(1-p,3);
      let dx=0,dy=0,scale=1,rotation=0,opacity=1;
      if(type==="fade") opacity=eased;
      if(type==="slide-up") dy=(1-eased)*.08;
      if(type==="slide-down") dy=-(1-eased)*.08;
      if(type==="slide-left") dx=(1-eased)*.08;
      if(type==="slide-right") dx=-(1-eased)*.08;
      if(type==="zoom-in") scale=.72+.28*eased;
      if(type==="zoom-out") scale=1.28-.28*eased;
      if(type==="pop"){scale=.55+.45*(1-Math.pow(1-p,4));rotation=(1-p)*-3;}
      if(type==="drift-left") dx=(1-eased)*.04;
      if(type==="drift-right") dx=-(1-eased)*.04;
      if(phase==="out" && type!=="none") opacity*=p;
      return{dx,dy,scale,rotation,opacity};
    }

    drawBrand(ctx,w,h){
      if(!this.state.showLogo) return;
      if(this.logoReady && this.logo.naturalWidth){
        const maxW=w*.12,maxH=h*.07;
        const s=Math.min(maxW/this.logo.naturalWidth,maxH/this.logo.naturalHeight);
        ctx.save();ctx.shadowColor="rgba(0,0,0,.4)";ctx.shadowBlur=w*.012;
        ctx.drawImage(this.logo,w*.05,h*.03,this.logo.naturalWidth*s,this.logo.naturalHeight*s);ctx.restore();
      }else{
        ctx.fillStyle=this.state.accent;ctx.font=`900 ${w*.032}px "Montserrat"`;ctx.fillText("FWCWL",w*.05,h*.05);
      }
    }

    drawSafeZone(ctx,w,h){
      ctx.save();ctx.strokeStyle="rgba(241,195,77,.58)";ctx.lineWidth=Math.max(2,w*.002);ctx.setLineDash([w*.01,w*.007]);
      ctx.strokeRect(w*.055,h*.055,w*.89,h*.89);ctx.restore();
    }

    seek(time, render = true){
      this.state.currentTime=clamp(time,0,this.state.duration);
      if(render)this.safeRender();
      else this.updatePlayhead();
      this.syncMedia(this.state.currentTime,true);
      this.ensurePlayheadVisible();
    }

    stepFrame(direction){
      this.pause();
      this.seek(this.state.currentTime+direction*(1/this.state.fps));
    }

    togglePlayback(){
      this.state.playing ? this.pause() : this.play();
    }

    async play(){
      if(this.state.currentTime>=this.state.duration-.001)this.state.currentTime=0;
      this.state.playing=true;
      $("#vPlay",this.root).textContent="❚❚";
      await this.ensureAudioContext().catch(()=>{});
      this.lastFrameTime=performance.now();
      this.syncMedia(this.state.currentTime,true);

      const tick=now=>{
        if(!this.state.playing)return;
        const dt=(now-this.lastFrameTime)/1000;
        this.lastFrameTime=now;
        this.state.currentTime+=dt;
        if(this.state.currentTime>=this.state.duration){
          this.state.currentTime=this.state.duration;
          this.safeRender();
          this.pause();
          return;
        }
        this.safeRender();
        this.raf=requestAnimationFrame(tick);
      };
      this.raf=requestAnimationFrame(tick);
    }

    pause(){
      this.state.playing=false;
      cancelAnimationFrame(this.raf);
      const play=$("#vPlay",this.root);
      if(play)play.textContent="▶";
      this.assets.forEach(asset=>{
        if(asset.type==="video"||asset.type==="audio"){
          try{asset.element.pause();}catch{}
        }
      });
    }

    syncMedia(time,forceSeek=false){
      const activeIds=new Set();
      this.state.clips.forEach(c=>{
        if(c.type!=="video"&&c.type!=="audio")return;
        const asset=this.assets.get(c.assetId);
        if(!asset?.element)return;
        const el=asset.element;
        const active=time>=c.start&&time<=c.start+c.duration&&c.visible!==false;
        if(!active){try{el.pause();}catch{};return;}
        activeIds.add(asset.id);
        const desired=(c.trimIn||0)+(time-c.start)*(c.speed||1);
        if(forceSeek||Math.abs((el.currentTime||0)-desired)>.16){
          try{el.currentTime=clamp(desired,0,Math.max(0,(asset.duration||desired)-.02));}catch{}
        }
        el.playbackRate=clamp(c.speed||1,.1,4);
        el.muted=true; // audio is routed through AudioContext when available
        if(this.state.playing){
          el.play().catch(()=>{});
        }else{
          el.pause();
        }
      });
      this.updateAudioMix();
    }

    async ensureAudioContext(){
      if(this.audioContext)return;
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return;
      this.audioContext=new AC();
      this.masterGain=this.audioContext.createGain();
      this.masterGain.gain.value=1;
      this.masterGain.connect(this.audioContext.destination);
      this.recordDestination=this.audioContext.createMediaStreamDestination();
      this.masterGain.connect(this.recordDestination);

      for(const asset of this.assets.values())this.attachAssetAudio(asset);
      if(this.audioContext.state==="suspended")await this.audioContext.resume();
    }

    attachAssetAudio(asset){
      if(!this.audioContext||!asset?.element||asset.type==="image"||this.audioNodes.has(asset.id))return;
      try{
        const source=this.audioContext.createMediaElementSource(asset.element);
        const gain=this.audioContext.createGain();
        source.connect(gain);gain.connect(this.masterGain);
        this.audioNodes.set(asset.id,{source,gain});
        asset.element.muted=false;
      }catch(error){
        console.warn("[FWCWL Video audio routing]",error);
      }
    }

    updateAudioMix(){
      this.audioNodes.forEach((node,assetId)=>{
        const clips=this.state.clips.filter(c=>c.assetId===assetId&&(c.type==="audio"||c.type==="video"));
        const c=clips.find(c=>this.state.currentTime>=c.start&&this.state.currentTime<=c.start+c.duration&&c.visible!==false);
        let volume=0;
        if(c&&!c.muted){
          const local=this.state.currentTime-c.start;
          const tail=c.duration-local;
          const fadeIn=c.fadeIn?clamp(local/c.fadeIn,0,1):1;
          const fadeOut=c.fadeOut?clamp(tail/c.fadeOut,0,1):1;
          volume=(c.volume??1)*fadeIn*fadeOut;
        }
        try{node.gain.gain.setTargetAtTime(volume,this.audioContext.currentTime,.015);}catch{}
      });
    }

    ensurePlayheadVisible(){
      const x=this.state.currentTime*this.state.timelineZoom;
      const left=this.timelineScroll.scrollLeft;
      const right=left+this.timelineScroll.clientWidth;
      if(x<left+20)this.timelineScroll.scrollLeft=Math.max(0,x-40);
      if(x>right-20)this.timelineScroll.scrollLeft=x-this.timelineScroll.clientWidth+40;
    }

    recalculateDuration(){
      const max=Math.max(2,...this.state.clips.map(c=>c.start+c.duration));
      if(max>this.state.duration)this.state.duration=Math.min(60,Math.ceil(max*4)/4);
      this.state.currentTime=Math.min(this.state.currentTime,this.state.duration);
    }

    formatTime(seconds, hundredths = true){
      const s=Math.max(0,Number(seconds)||0);
      const m=Math.floor(s/60);
      const sec=Math.floor(s%60);
      const hs=Math.floor((s-Math.floor(s))*100);
      return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}${hundredths?`.${String(hs).padStart(2,"0")}`:""}`;
    }

    refreshAll(){
      this.renderTemplates($("#vTemplateSearch",this.root)?.value||"");
      this.renderAssets();
      this.renderTimeline();
      this.renderInspector();
      this.safeRender();
      this.fitPreview();
    }

    snapshot(){
      const state=safeClone(this.state);
      state.playing=false;
      return JSON.stringify(state);
    }

    commit(autosave = true){
      const snap=this.snapshot();
      if(this.history[this.historyIndex]===snap)return;
      this.history=this.history.slice(0,this.historyIndex+1);
      this.history.push(snap);
      if(this.history.length>100)this.history.shift();
      this.historyIndex=this.history.length-1;
      if(autosave)this.scheduleAutosave();
    }

    restoreSnapshot(snapshot){
      this.pause();
      this.state=JSON.parse(snapshot);
      this.state.playing=false;
      this.refreshAll();
    }

    undo(){
      if(this.historyIndex<=0)return;
      this.historyIndex--;
      this.restoreSnapshot(this.history[this.historyIndex]);
    }

    redo(){
      if(this.historyIndex>=this.history.length-1)return;
      this.historyIndex++;
      this.restoreSnapshot(this.history[this.historyIndex]);
    }

    resetProject(){
      if(!window.confirm("Reset the current Video project?"))return;
      this.pause();
      const active=this.state.active;
      this.state=this.makeInitialState();
      this.state.active=active;
      this.applyTemplate("match-day-impact",false);
      this.history=[];this.historyIndex=-1;this.commit();
      this.refreshAll();
    }

    scheduleAutosave(){
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer=setTimeout(()=>this.saveProject(),350);
    }

    saveProject(){
      try{
        const payload={
          version:BUILD_VERSION,
          savedAt:Date.now(),
          state:JSON.parse(this.snapshot())
        };
        localStorage.setItem(PROJECT_KEY,JSON.stringify(payload));
        setStatus("ready","autosaved");
      }catch(error){
        console.warn("[FWCWL Video autosave]",error);
      }
    }

    async restoreProject(){
      let payload;
      try{payload=JSON.parse(localStorage.getItem(PROJECT_KEY)||"null");}catch{return;}
      if(!payload?.state)return;

      try{
        const assetIds=new Set(payload.state.clips.map(c=>c.assetId).filter(Boolean));
        for(const id of assetIds){
          const record=await this.dbGet(id);
          if(!record?.blob)continue;
          const file=new File([record.blob],record.name||"asset",{type:record.blob.type});
          const asset=await this.createAsset(file,record.type,id);
          this.assets.set(id,asset);
        }

        const active=this.state.active;
        this.state={...this.makeInitialState(),...payload.state,active,playing:false};
        this.history=[];this.historyIndex=-1;
        this.commit(false);
        this.refreshAll();
        this.renderAssets();
        this.toast("Recovered autosaved video project");
      }catch(error){
        console.warn("[FWCWL Video restore]",error);
      }
    }

    openDatabase(){
      return new Promise((resolve,reject)=>{
        if(!("indexedDB" in window)){resolve(null);return;}
        const request=indexedDB.open(DB_NAME,1);
        request.onupgradeneeded=()=>{
          const db=request.result;
          if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE,{keyPath:"id"});
        };
        request.onsuccess=()=>{this.db=request.result;resolve(this.db);};
        request.onerror=()=>reject(request.error);
      });
    }

    persistAsset(id,file,meta){
      if(!this.db)return Promise.resolve();
      return new Promise((resolve,reject)=>{
        const tx=this.db.transaction(DB_STORE,"readwrite");
        tx.objectStore(DB_STORE).put({id,blob:file,name:meta.name,type:meta.type});
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error);
      });
    }

    dbGet(id){
      if(!this.db)return Promise.resolve(null);
      return new Promise((resolve,reject)=>{
        const tx=this.db.transaction(DB_STORE,"readonly");
        const req=tx.objectStore(DB_STORE).get(id);
        req.onsuccess=()=>resolve(req.result||null);
        req.onerror=()=>reject(req.error);
      });
    }

    toast(message){
      const toast=$("#vToast",this.root);
      if(!toast)return;
      toast.textContent=message;
      toast.classList.add("show");
      clearTimeout(this.toastTimer);
      this.toastTimer=setTimeout(()=>toast.classList.remove("show"),1800);
    }

    openExport(){
      if(this.exporting)return;
      const old=$(".v-modal-backdrop",this.root);
      old?.remove();

      const backdrop=document.createElement("div");
      backdrop.className="v-modal-backdrop";
      backdrop.innerHTML=`
<div class="v-modal">
  <div class="v-kicker">EXPORT STUDIO</div>
  <h2>Render Video</h2>
  <p>Exports the current sequence in real time using your browser's MediaRecorder engine. WebM is the most reliable browser-native format.</p>
  <div class="v-export-row">
    <select id="vExportScale"><option value="1">Full Resolution</option><option value=".6667">High · 720-ish</option><option value=".5">Preview · 540-ish</option></select>
    <select id="vExportFPS"><option value="30">30 FPS</option><option value="60">60 FPS</option><option value="24">24 FPS</option></select>
  </div>
  <div class="v-progress"><i id="vExportProgress"></i></div>
  <p id="vExportStatus">Ready to render ${this.state.duration}s.</p>
  <div class="v-modal-actions"><button id="vExportClose">Cancel</button><button class="primary" id="vExportStart">Export WebM</button></div>
</div>`;
      this.root.appendChild(backdrop);

      $("#vExportClose",backdrop).addEventListener("click",()=>{
        if(this.exporting)this.exportCancel=true;
        else backdrop.remove();
      });
      $("#vExportStart",backdrop).addEventListener("click",()=>this.exportWebM(backdrop));
    }

    async exportWebM(backdrop){
      if(this.exporting)return;
      if(!window.MediaRecorder||!this.canvas.captureStream){
        $("#vExportStatus",backdrop).textContent="This browser does not support canvas video recording.";
        return;
      }

      this.pause();
      this.exporting=true;
      this.exportCancel=false;

      const scale=Number($("#vExportScale",backdrop).value)||1;
      const fps=Number($("#vExportFPS",backdrop).value)||30;
      const oldW=this.state.width,oldH=this.state.height,oldFPS=this.state.fps,oldTime=this.state.currentTime;
      const targetW=Math.max(320,Math.round(oldW*scale/2)*2);
      const targetH=Math.max(320,Math.round(oldH*scale/2)*2);

      this.state.width=targetW;this.state.height=targetH;this.state.fps=fps;
      this.canvas.width=targetW;this.canvas.height=targetH;
      this.fitPreview();

      try{await this.ensureAudioContext();}catch{}

      const canvasStream=this.canvas.captureStream(fps);
      const tracks=[...canvasStream.getVideoTracks()];
      if(this.recordDestination?.stream?.getAudioTracks()?.length){
        tracks.push(...this.recordDestination.stream.getAudioTracks());
      }
      const stream=new MediaStream(tracks);

      const mimeCandidates=[
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm"
      ];
      const mime=mimeCandidates.find(m=>MediaRecorder.isTypeSupported?.(m))||"video/webm";
      const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:scale>=1?12000000:7000000});
      const chunks=[];
      recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};

      const done=new Promise((resolve,reject)=>{
        recorder.onstop=resolve;
        recorder.onerror=e=>reject(e.error||new Error("Recording failed"));
      });

      recorder.start(250);
      const started=performance.now();
      this.state.currentTime=0;
      this.state.playing=true;
      this.syncMedia(0,true);

      const status=$("#vExportStatus",backdrop);
      const bar=$("#vExportProgress",backdrop);

      await new Promise(resolve=>{
        const frame=now=>{
          const elapsed=(now-started)/1000;
          this.state.currentTime=Math.min(this.state.duration,elapsed);
          this.safeRender(this.state.currentTime);
          this.syncMedia(this.state.currentTime,false);
          const p=clamp(this.state.currentTime/this.state.duration,0,1);
          bar.style.width=`${p*100}%`;
          status.textContent=this.exportCancel? "Cancelling..." : `Rendering ${Math.round(p*100)}% • ${this.formatTime(this.state.currentTime)} / ${this.formatTime(this.state.duration)}`;

          if(this.exportCancel||elapsed>=this.state.duration){
            resolve();
            return;
          }
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });

      this.state.playing=false;
      this.assets.forEach(a=>{if(a.type!=="image")a.element.pause();});
      recorder.stop();

      try{await done;}catch(error){console.error("[FWCWL Video export]",error);}
      stream.getTracks().forEach(t=>{if(t.kind==="video")t.stop();});

      if(!this.exportCancel&&chunks.length){
        const blob=new Blob(chunks,{type:mime});
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a");
        const project=($("#projectName")?.value||"fwcwl-video").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
        a.href=url;a.download=`${project||"fwcwl-video"}-${this.state.templateId}.webm`;
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(url),3000);
        status.textContent="Export complete.";
        bar.style.width="100%";
      }else if(this.exportCancel){
        status.textContent="Export cancelled.";
      }

      this.state.width=oldW;this.state.height=oldH;this.state.fps=oldFPS;this.state.currentTime=oldTime;
      this.canvas.width=oldW;this.canvas.height=oldH;
      this.exporting=false;
      this.exportCancel=false;
      this.fitPreview();this.safeRender();this.updatePlayhead();

      setTimeout(()=>{if(!this.exporting)backdrop.remove();},this.exportCancel?500:900);
    }
  }

  function showFatal(message,error){
    console.error("[FWCWL Video fatal]",message,error||"");
    setStatus("error",message);
    const poster=$("#posterWorkspace");
    if(!poster)return;

    let existing=document.getElementById("fwcwlVideoFatal");
    if(existing)existing.remove();

    const box=document.createElement("div");
    box.id="fwcwlVideoFatal";
    box.style.cssText="position:fixed;right:16px;bottom:16px;z-index:10000;max-width:340px;padding:13px 15px;border:1px solid rgba(227,111,121,.32);border-radius:10px;background:#130d10;color:#e9949b;font:12px/1.45 system-ui;box-shadow:0 18px 50px rgba(0,0,0,.4)";
    box.innerHTML=`<strong style="display:block;margin-bottom:4px;color:#ffabb2">Video Editor could not start</strong>${esc(message)}<div style="margin-top:5px;color:#7b6870;font-size:10px">Build ${BUILD_VERSION}</div>`;
    document.body.appendChild(box);
  }

  function boot(){
    if(window.__FWCWL_VIDEO_BOOTING__)return;
    if(window.FWCWLVideoEditor&&window[STATUS_KEY]?.state==="ready")return;

    window.__FWCWL_VIDEO_BOOTING__=true;
    setStatus("booting",BUILD_VERSION);

    try{
      new VideoEditor();
    }catch(error){
      showFatal(error?.message||"Unknown Video Editor initialization error.",error);
    }finally{
      window.__FWCWL_VIDEO_BOOTING__=false;
    }
  }

  window.addEventListener("error",event=>{
    if(!String(event.filename||"").includes("video-editor"))return;
    if(window[STATUS_KEY]?.state==="ready"){
      console.error("[FWCWL Video runtime error]",event.message,event.error);
      window[STATUS_KEY].lastError=event.message||"runtime error";
      window[STATUS_KEY].lastErrorAt=Date.now();
      return;
    }
    showFatal(`JavaScript error: ${event.message||"unknown error"}`,event.error);
  });

  window.addEventListener("unhandledrejection",event=>{
    console.error("[FWCWL Video unhandled promise]",event.reason);
  });

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",boot,{once:true});
  }else{
    boot();
  }
})();


/* ============================================================
   MK97 V22 — PRO VIDEO TIMELINE + MOBILE TOOL WORKFLOW
   Additive UI layer. Existing video engine/render/export is preserved.
============================================================ */
(() => {
  'use strict';
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

  function waitForEditor(){
    const editor = window.FWCWLVideoEditor;
    if(!editor || !editor.root){ setTimeout(waitForEditor,120); return; }
    if(window.__MK97_VIDEO_V22__) return;
    window.__MK97_VIDEO_V22__ = true;
    install(editor);
  }

  function install(editor){
    const root = editor.root;
    const style = document.createElement('style');
    style.id = 'mk97VideoV22Style';
    style.textContent = `
      #fwcwlVideoStudio .v-snap-guide{position:absolute;z-index:11;top:0;bottom:0;width:1px;background:#5bd5ff;box-shadow:0 0 0 1px rgba(91,213,255,.14),0 0 14px rgba(91,213,255,.35);opacity:0;pointer-events:none}
      #fwcwlVideoStudio .v-snap-guide.show{opacity:1}
      #fwcwlVideoStudio .v-timeline-head button.active{color:#f3c95b;border-color:rgba(243,201,91,.24);background:rgba(243,201,91,.08)}
      #fwcwlVideoStudio .v-track-label{position:relative;padding-left:26px!important;font-weight:850!important;letter-spacing:.08em!important}
      #fwcwlVideoStudio .v-track-label:before{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:#778692;font-size:10px}
      #fwcwlVideoStudio .v-track-label:nth-child(1):before{content:'▣'}
      #fwcwlVideoStudio .v-track-label:nth-child(2):before{content:'✦'}
      #fwcwlVideoStudio .v-track-label:nth-child(3):before{content:'◇'}
      #fwcwlVideoStudio .v-track-label:nth-child(4):before{content:'T'}
      #fwcwlVideoStudio .v-track-label:nth-child(5):before{content:'♫'}
      #fwcwlVideoStudio .v-track-row{background:linear-gradient(90deg,rgba(255,255,255,.018),rgba(255,255,255,.008))}
      #fwcwlVideoStudio .v-clip{height:31px!important;border-radius:9px!important;box-shadow:0 5px 14px rgba(0,0,0,.22)!important;transition:border-color .12s ease,box-shadow .12s ease,transform .12s ease}
      #fwcwlVideoStudio .v-clip:hover{transform:translateY(-1px)}
      #fwcwlVideoStudio .v-clip.selected{border-color:#f3c95b!important;box-shadow:0 0 0 1px rgba(243,201,91,.22),0 8px 18px rgba(0,0,0,.28)!important}
      #fwcwlVideoStudio .v-clip[data-type="audio"]:after{content:'';position:absolute;left:10px;right:10px;top:11px;height:8px;opacity:.34;background:repeating-linear-gradient(90deg,#65e0b7 0 2px,transparent 2px 5px);clip-path:polygon(0 45%,4% 20%,8% 75%,12% 25%,16% 68%,20% 34%,24% 80%,28% 18%,32% 65%,36% 40%,40% 72%,44% 22%,48% 65%,52% 30%,56% 82%,60% 20%,64% 74%,68% 35%,72% 69%,76% 20%,80% 78%,84% 33%,88% 70%,92% 24%,96% 62%,100% 45%)}
      #fwcwlVideoStudio .mk97-v-clipbar{
        position:absolute;z-index:90;left:50%;bottom:52px;transform:translate(-50%,10px);
        display:flex;align-items:center;gap:6px;max-width:calc(100% - 24px);padding:7px;border:1px solid rgba(255,255,255,.08);border-radius:17px;
        background:rgba(8,13,18,.91);backdrop-filter:blur(16px);box-shadow:0 16px 44px rgba(0,0,0,.34);opacity:0;pointer-events:none;transition:.18s ease
      }
      #fwcwlVideoStudio .mk97-v-clipbar.visible{opacity:1;pointer-events:auto;transform:translate(-50%,0)}
      #fwcwlVideoStudio .mk97-v-clipbar .clipname{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 8px;color:#dfe6eb;font-size:9px;font-weight:850}
      #fwcwlVideoStudio .mk97-v-clipbar button{height:34px;padding:0 10px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:#0e1720;color:#b8c3cc;font-size:8px;font-weight:800}
      #fwcwlVideoStudio .mk97-v-clipbar button.primary{color:#171309;border-color:transparent;background:linear-gradient(180deg,#ffdf86,#f3c95b)}
      #fwcwlVideoStudio .mk97-v-mobile-scrim{display:none}
      #fwcwlVideoStudio .mk97-v-mobile-dock{display:none}
      @media(max-width:900px){
        #fwcwlVideoStudio.active{grid-template-rows:minmax(0,1fr) 300px!important;padding-bottom:78px!important}
        #fwcwlVideoStudio .v-main{grid-template-columns:1fr!important;min-height:0!important}
        #fwcwlVideoStudio .v-center{grid-template-rows:auto minmax(0,1fr) 52px!important}
        #fwcwlVideoStudio .v-toolbar{overflow:auto;gap:8px;justify-content:flex-start!important;padding:8px 10px!important}
        #fwcwlVideoStudio .v-toolbar-group{flex:0 0 auto}
        #fwcwlVideoStudio .v-preview-wrap{padding:10px!important}
        #fwcwlVideoStudio .v-playbar{min-height:52px}
        #fwcwlVideoStudio .v-left,#fwcwlVideoStudio .v-right{
          position:fixed!important;z-index:12010!important;left:8px!important;right:8px!important;bottom:84px!important;
          width:auto!important;height:min(68dvh,600px)!important;max-height:none!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:24px!important;
          background:linear-gradient(180deg,#101a24,#0a1118)!important;box-shadow:0 28px 80px rgba(0,0,0,.55)!important;
          transform:translateY(calc(100% + 110px));transition:transform .24s cubic-bezier(.2,.8,.2,1);overflow:hidden!important
        }
        #fwcwlVideoStudio .v-left.mk97-open,#fwcwlVideoStudio .v-right.mk97-open{transform:translateY(0)}
        #fwcwlVideoStudio .v-panel-scroll,#fwcwlVideoStudio .v-inspector{height:calc(100% - 52px)!important}
        #fwcwlVideoStudio .v-left:before,#fwcwlVideoStudio .v-right:before{content:'';position:absolute;z-index:4;left:50%;top:7px;transform:translateX(-50%);width:44px;height:4px;border-radius:99px;background:rgba(255,255,255,.14)}
        #fwcwlVideoStudio .mk97-v-mobile-scrim{position:fixed;z-index:12000;inset:0;display:block;background:rgba(1,4,7,.54);backdrop-filter:blur(7px);opacity:0;pointer-events:none;transition:.2s ease}
        #fwcwlVideoStudio .mk97-v-mobile-scrim.visible{opacity:1;pointer-events:auto}
        #fwcwlVideoStudio .mk97-v-mobile-dock{
          position:fixed;z-index:12100;left:8px;right:8px;bottom:8px;display:flex;gap:7px;padding:7px;overflow-x:auto;scrollbar-width:none;
          border:1px solid rgba(255,255,255,.09);border-radius:22px;background:rgba(8,13,18,.94);backdrop-filter:blur(20px);box-shadow:0 20px 56px rgba(0,0,0,.46)
        }
        #fwcwlVideoStudio .mk97-v-mobile-dock button{flex:1 0 74px;min-height:52px;border:0;border-radius:16px;background:transparent;color:#82919d;display:grid;place-items:center;gap:2px;font-size:8px;font-weight:750}
        #fwcwlVideoStudio .mk97-v-mobile-dock button span{font-size:17px}
        #fwcwlVideoStudio .mk97-v-mobile-dock button.active{background:rgba(243,201,91,.08);color:#f3c95b}
        #fwcwlVideoStudio .mk97-v-mobile-dock button.export{color:#171309;background:linear-gradient(180deg,#ffdf86,#f3c95b)}
        #fwcwlVideoStudio .v-timeline{border-radius:22px 22px 0 0;overflow:hidden;border:1px solid rgba(255,255,255,.06);border-bottom:0}
        #fwcwlVideoStudio .v-timeline-head{overflow:auto;gap:8px}
        #fwcwlVideoStudio .v-timeline-head-left,#fwcwlVideoStudio .v-timeline-head-right{flex:0 0 auto}
        #fwcwlVideoStudio .v-timeline-body{grid-template-columns:74px minmax(0,1fr)!important}
        #fwcwlVideoStudio .v-track-label{font-size:6px!important;padding-left:23px!important}
        #fwcwlVideoStudio .mk97-v-clipbar{bottom:88px;max-width:calc(100% - 18px);overflow:auto}
        #fwcwlVideoStudio .mk97-v-clipbar .clipname{max-width:100px}
      }
    `;
    document.head.appendChild(style);

    const clipbar = document.createElement('div');
    clipbar.className = 'mk97-v-clipbar';
    clipbar.innerHTML = `
      <span class="clipname">Selected clip</span>
      <button class="primary" data-v22clip="split">Split</button>
      <button data-v22clip="duplicate">Duplicate</button>
      <button data-v22clip="keyframe">◇ Keyframe</button>
      <button data-v22clip="inspector">Edit</button>
      <button data-v22clip="delete">Delete</button>
    `;
    root.appendChild(clipbar);

    const scrim = document.createElement('div');
    scrim.className = 'mk97-v-mobile-scrim';
    root.appendChild(scrim);

    const dock = document.createElement('nav');
    dock.className = 'mk97-v-mobile-dock';
    dock.setAttribute('aria-label','Video editing tools');
    dock.innerHTML = `
      <button data-v22tool="media"><span>▣</span>Media</button>
      <button data-v22tool="audio"><span>♫</span>Audio</button>
      <button data-v22tool="text"><span>T</span>Text</button>
      <button data-v22tool="effects"><span>✦</span>Effects</button>
      <button data-v22tool="color"><span>◉</span>Color</button>
      <button data-v22tool="motion"><span>↗</span>Motion</button>
      <button data-v22tool="transition"><span>⋈</span>Transition</button>
      <button class="export" data-v22tool="export"><span>⇩</span>Export</button>
    `;
    root.appendChild(dock);

    function closeSheets(){
      $('.v-left',root)?.classList.remove('mk97-open');
      $('.v-right',root)?.classList.remove('mk97-open');
      scrim.classList.remove('visible');
      $$('[data-v22tool]',dock).forEach(b=>b.classList.remove('active'));
    }
    function openLeft(panel){
      closeSheets();
      const left=$('.v-left',root); left?.classList.add('mk97-open'); scrim.classList.add('visible');
      const tab=$(`[data-vtab="${panel}"]`,root); tab?.click();
    }
    function openInspector(label){
      closeSheets();
      const right=$('.v-right',root); right?.classList.add('mk97-open'); scrim.classList.add('visible');
      requestAnimationFrame(()=>{
        const sections=$$('.v-section',root);
        const target=sections.find(s=>{
          const text=(s.textContent||'').toLowerCase();
          return text.includes(label.toLowerCase());
        });
        target?.scrollIntoView({behavior:'smooth',block:'start'});
      });
    }
    scrim.addEventListener('click',closeSheets);

    dock.addEventListener('click',e=>{
      const b=e.target.closest('[data-v22tool]'); if(!b)return;
      const tool=b.dataset.v22tool;
      $$('[data-v22tool]',dock).forEach(x=>x.classList.toggle('active',x===b));
      if(tool==='media') openLeft('media');
      else if(tool==='audio') openLeft('media');
      else if(tool==='text') openLeft('create');
      else if(tool==='effects') openInspector('effects');
      else if(tool==='color') openInspector('color');
      else if(tool==='motion') openInspector('motion');
      else if(tool==='transition') openInspector('transition');
      else if(tool==='export'){ closeSheets(); $('#vExport',root)?.click(); }
    });

    clipbar.addEventListener('click',e=>{
      const b=e.target.closest('[data-v22clip]'); if(!b)return;
      const action=b.dataset.v22clip;
      if(action==='split') editor.splitSelected?.();
      if(action==='duplicate') editor.duplicateSelected?.();
      if(action==='keyframe') editor.addKeyframe?.();
      if(action==='delete') editor.deleteSelected?.();
      if(action==='inspector') openInspector('transform');
      syncClipbar();
    });

    function syncClipbar(){
      const clip=editor.selectedClip?.();
      clipbar.classList.toggle('visible',!!clip);
      if(clip) $('.clipname',clipbar).textContent=clip.name||clip.type||'Selected clip';
    }

    const originalSelect=editor.selectClip?.bind(editor);
    if(originalSelect){
      editor.selectClip=function(...args){ const result=originalSelect(...args); requestAnimationFrame(syncClipbar); return result; };
    }
    const originalRenderTimeline=editor.renderTimeline?.bind(editor);
    if(originalRenderTimeline){
      editor.renderTimeline=function(...args){ const result=originalRenderTimeline(...args); requestAnimationFrame(syncClipbar); return result; };
    }

    root.addEventListener('dblclick',e=>{
      const clipEl=e.target.closest('.v-clip');
      if(!clipEl)return;
      editor.selectClip?.(clipEl.dataset.clipId);
      if(window.innerWidth<=900) openInspector('transform');
    });

    document.addEventListener('keydown',e=>{
      if(!editor.state?.active)return;
      const typing=e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement;
      if(typing)return;
      if(e.key.toLowerCase()==='s'&&!e.ctrlKey&&!e.metaKey){ editor.splitSelected?.(); }
      if(e.key.toLowerCase()==='k'&&!e.ctrlKey&&!e.metaKey){ editor.addKeyframe?.(); }
      if(e.key==='Escape')closeSheets();
    });

    syncClipbar();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',waitForEditor,{once:true});
  else waitForEditor();
})();
