/* ============================================================
   FWCWL CREATIVE STUDIO
   POSTER EDITOR V5.1
   ============================================================
   Fabric.js 6.6.5

   FEATURES
   ------------------------------------------------------------
   • Exact template thumbnails
   • Exact same template renderer in library + editor
   • Multiple cricket-specific layout engines
   • Match / VS / Playing XI / Score / Player / Final / Event
   • Collision-safe dynamic typography
   • Preserve user photos/logos/text when switching templates
   • Editable text/photo/shape/vector layers
   • Player photo crop mode
   • Advanced photo filters
   • Color cutout
   • Masks
   • Smart alignment guides
   • Drag-and-drop layer ordering
   • Lock / visibility / duplicate / delete
   • Group / ungroup support
   • Contextual floating toolbar
   • Drawing tools
   • Cricket vector element library
   • IndexedDB project autosave
   • IndexedDB exact thumbnail cache
   • Undo / redo
   • Safe area
   • 1x / 2x / 4x PNG/JPG export
   • Transparent PNG support
============================================================ */


import {
  Canvas,
  Rect,
  Circle,
  Triangle,
  Line,
  Textbox,
  FabricImage,
  Gradient,
  Shadow,
  PencilBrush,
  Group,
  filters
} from "https://cdn.jsdelivr.net/npm/fabric@6.6.5/+esm";


import {
  POSTER_TEMPLATES as ORIGINAL_POSTER_TEMPLATES
} from "./cricket-templates.js";


import {
  PREMIUM_POSTER_TEMPLATES
} from "./premium-cricket-templates.js";


import {
  applyTemplateEffects
} from "./template-effects.js";


/* ============================================================
   TEMPLATE LIBRARY
============================================================ */

const POSTER_TEMPLATES = [
  ...ORIGINAL_POSTER_TEMPLATES,
  ...PREMIUM_POSTER_TEMPLATES
];


const DEFAULT_TEMPLATE_ID =
  POSTER_TEMPLATES.find(
    template => template.id === "matchday"
  )?.id ||
  POSTER_TEMPLATES[0]?.id;


/* ============================================================
   CANVAS FORMATS
============================================================ */

const POSTER_SIZES = {

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
   EDITOR CONSTANTS
============================================================ */

const FONT_OPTIONS = [
  "Montserrat",
  "Bebas Neue",
  "Poppins",
  "DM Sans",
  "Playfair Display"
];


const BLEND_MODES = [
  "source-over",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference"
];


const HISTORY_LIMIT = 60;

const PREVIEW_CONCURRENCY = 2;

const PREVIEW_CACHE_VERSION = "preview-v5-1";

const DB_NAME = "FWCWL-Creative-Studio";

const DB_VERSION = 1;

const PROJECT_KEY = "current-poster-v5-1";


/* ============================================================
   POSTER EDITOR
============================================================ */

export class PosterEditor {


  constructor() {

    this.canvasElement =
      document.getElementById(
        "posterCanvas"
      );


    if (!this.canvasElement) {
      throw new Error(
        "Poster editor could not find #posterCanvas."
      );
    }


    this.canvas =
      new Canvas(
        this.canvasElement,
        {
          preserveObjectStacking: true,
          selection: true,
          uniformScaling: false,
          fireRightClick: true,
          stopContextMenu: true
        }
      );


    this.state = {

      canvasSize: "portrait",

      template:
        DEFAULT_TEMPLATE_ID,

      zoom: 50,

      safeZone: false,

      snap: true,

      brandName: "FWCWL",

      accent: "#F0C34C",

      textColor: "#FFFFFF",

      backgroundColor: "#210B0E",

      backgroundColor2: "#080A0D",

      backgroundAngle: 135,

      brushColor: "#F0C34C",

      brushWidth: 14,

      brushMode: "brush"

    };


    /* Template browser */

    this.activeFilter = "all";

    this.templatePreviewCache =
      new Map();

    this.templatePreviewObserver =
      null;

    this.templatePreviewRenderToken =
      0;

    this.previewQueue = [];

    this.previewWorkers = 0;


    /* History */

    this.history = [];

    this.historyIndex = -1;


    /* Runtime */

    this.restoring = false;

    this.initialized = false;


    /* Crop */

    this.cropMode = null;


    /* Smart guides */

    this.guideObjects = [];


    /* Database */

    this.dbPromise = null;


    this.installRuntimeStyles();

    this.buildProUi();

    this.bindCanvasEvents();

    this.bindPageUi();

    this.bindProUi();

    this.bindGlobalEvents();

    this.initialize();

  }


  /* ============================================================
     INITIALIZE
  ============================================================ */

  async initialize() {

    await this.openDatabase();


    this.setLogicalCanvasSize();


    const restored =
      await this.restoreAutosave();


    if (!restored) {

      await this.applyTemplate(
        DEFAULT_TEMPLATE_ID,
        false,
        false
      );

    }


    this.renderTemplates();

    this.renderLayers();

    this.updateSelectionInspector();

    this.pushHistory();


    this.initialized = true;


    requestAnimationFrame(
      () => {

        this.fitCanvasToViewport();

      }
    );

  }


  render() {

    this.canvas.requestRenderAll();

  }


  /* ============================================================
     INDEXED DB
  ============================================================ */

  openDatabase() {

    if (this.dbPromise) {

      return this.dbPromise;

    }


    this.dbPromise =
      new Promise(
        (resolve, reject) => {

          const request =
            indexedDB.open(
              DB_NAME,
              DB_VERSION
            );


          request.onupgradeneeded =
            event => {

              const db =
                event.target.result;


              if (
                !db.objectStoreNames.contains(
                  "projects"
                )
              ) {

                db.createObjectStore(
                  "projects"
                );

              }


              if (
                !db.objectStoreNames.contains(
                  "previews"
                )
              ) {

                db.createObjectStore(
                  "previews"
                );

              }

            };


          request.onsuccess =
            () => {

              resolve(
                request.result
              );

            };


          request.onerror =
            () => {

              reject(
                request.error
              );

            };

        }
      );


    return this.dbPromise;

  }


  async dbGet(
    storeName,
    key
  ) {

    try {

      const db =
        await this.openDatabase();


      return await new Promise(
        (resolve, reject) => {

          const transaction =
            db.transaction(
              storeName,
              "readonly"
            );


          const store =
            transaction.objectStore(
              storeName
            );


          const request =
            store.get(key);


          request.onsuccess =
            () => {

              resolve(
                request.result
              );

            };


          request.onerror =
            () => {

              reject(
                request.error
              );

            };

        }
      );

    } catch (error) {

      console.warn(
        "IndexedDB read failed:",
        error
      );


      return null;

    }

  }


  async dbSet(
    storeName,
    key,
    value
  ) {

    try {

      const db =
        await this.openDatabase();


      await new Promise(
        (resolve, reject) => {

          const transaction =
            db.transaction(
              storeName,
              "readwrite"
            );


          const store =
            transaction.objectStore(
              storeName
            );


          store.put(
            value,
            key
          );


          transaction.oncomplete =
            () => resolve();


          transaction.onerror =
            () => reject(
              transaction.error
            );

        }
      );


      return true;

    } catch (error) {

      console.warn(
        "IndexedDB write failed:",
        error
      );


      return false;

    }

  }


  /* ============================================================
     BUILD UI
  ============================================================ */

  buildProUi() {

    this.buildToolRail();

    this.buildMediaPanel();

    this.buildBrandPanel();

    this.buildInspector();

    this.buildContextToolbar();

    this.buildCropToolbar();

    this.buildExportModal();

  }


  /* ============================================================
     TOOL RAIL
  ============================================================ */

  buildToolRail() {

    const workspace =
      document.getElementById(
        "posterWorkspace"
      );


    if (!workspace) return;


    document
      .getElementById(
        "posterProRail"
      )
      ?.remove();


    const rail =
      document.createElement(
        "div"
      );


    rail.id =
      "posterProRail";


    rail.className =
      "poster-pro-rail";


    rail.innerHTML = `

      <button
        class="pro-tool active"
        data-pro-tool="select"
        type="button"
        title="Select"
      >
        <span>↖</span>
        <small>Select</small>
      </button>


      <button
        class="pro-tool"
        data-pro-tool="text"
        type="button"
        title="Add Text"
      >
        <span>T</span>
        <small>Text</small>
      </button>


      <button
        class="pro-tool"
        data-pro-tool="photo"
        type="button"
        title="Add Photo"
      >
        <span>▧</span>
        <small>Photo</small>
      </button>


      <button
        class="pro-tool"
        data-pro-tool="elements"
        type="button"
        title="Cricket Elements"
      >
        <span>◇</span>
        <small>Elements</small>
      </button>


      <button
        class="pro-tool"
        data-pro-tool="shape"
        type="button"
        title="Shapes"
      >
        <span>○</span>
        <small>Shape</small>
      </button>


      <button
        class="pro-tool"
        data-pro-tool="draw"
        type="button"
        title="Draw"
      >
        <span>✎</span>
        <small>Draw</small>
      </button>


      <button
        class="pro-tool"
        data-pro-tool="layers"
        type="button"
        title="Layers"
      >
        <span>▤</span>
        <small>Layers</small>
      </button>


      <button
        class="pro-tool"
        data-pro-tool="background"
        type="button"
        title="Background"
      >
        <span>◫</span>
        <small>BG</small>
      </button>


      <input
        id="proQuickPhotoInput"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
      />


      <div
        id="posterToolPopover"
        class="poster-tool-popover hidden"
      ></div>

    `;


    workspace.appendChild(
      rail
    );

  }


  /* ============================================================
     MEDIA PANEL
  ============================================================ */

  buildMediaPanel() {

    const panel =
      document.getElementById(
        "posterMediaPanel"
      );


    if (!panel) return;


    panel.innerHTML = `

      <div class="panel-title-row">

        <div>

          <div class="panel-eyebrow">
            CREATIVE ASSETS
          </div>

          <h2>
            Media & Elements
          </h2>

          <p>
            Add player photos, sponsor logos and editable cricket graphics.
          </p>

        </div>

      </div>


      <div class="pro-upload-grid">

        <label class="pro-upload-tile">

          <input
            id="proAddPhotoInput"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
          />

          <strong>＋</strong>

          <span>
            Add Photo
          </span>

          <small>
            Player / action layer
          </small>

        </label>


        <label class="pro-upload-tile">

          <input
            id="proBackgroundPhotoInput"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
          />

          <strong>▧</strong>

          <span>
            Background
          </span>

          <small>
            Full-poster image
          </small>

        </label>

      </div>


      <div class="section-divider"></div>


      <div class="pro-section-label">
        TEAM / SPONSOR
      </div>


      <label class="upload-card compact">

        <input
          id="posterSponsorLogoInput"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          hidden
        />

        <div class="upload-icon-small">
          ＋
        </div>

        <strong>
          Add Logo
        </strong>

        <span>
          Sponsor or team logo
        </span>

      </label>


      <div class="section-divider"></div>


      <div class="pro-section-label">
        CRICKET ELEMENTS
      </div>


      <div class="cricket-element-grid">

        <button
          type="button"
          data-cricket-element="ball"
        >
          <strong>●</strong>
          <span>Ball</span>
        </button>


        <button
          type="button"
          data-cricket-element="bat"
        >
          <strong>▰</strong>
          <span>Bat</span>
        </button>


        <button
          type="button"
          data-cricket-element="wickets"
        >
          <strong>Ⅲ</strong>
          <span>Wickets</span>
        </button>


        <button
          type="button"
          data-cricket-element="score"
        >
          <strong>#</strong>
          <span>Score</span>
        </button>


        <button
          type="button"
          data-cricket-element="live"
        >
          <strong>●</strong>
          <span>Live</span>
        </button>


        <button
          type="button"
          data-cricket-element="versus"
        >
          <strong>VS</strong>
          <span>Versus</span>
        </button>


        <button
          type="button"
          data-cricket-element="playercard"
        >
          <strong>07</strong>
          <span>Player</span>
        </button>


        <button
          type="button"
          data-cricket-element="trophy"
        >
          <strong>◆</strong>
          <span>Trophy</span>
        </button>

      </div>


      <div class="section-divider"></div>


      <div class="pro-section-label">
        SHAPES
      </div>


      <div class="pro-shape-grid">

        <button
          type="button"
          data-add-shape="rect"
        >
          ▰
        </button>

        <button
          type="button"
          data-add-shape="circle"
        >
          ●
        </button>

        <button
          type="button"
          data-add-shape="triangle"
        >
          ▲
        </button>

        <button
          type="button"
          data-add-shape="line"
        >
          ╱
        </button>

        <button
          type="button"
          data-add-shape="badge"
        >
          ★
        </button>

      </div>

    `;

  }


  /* ============================================================
     BRAND PANEL
  ============================================================ */

  buildBrandPanel() {

    const panel =
      document.getElementById(
        "posterBrandPanel"
      );


    if (!panel) return;


    panel.innerHTML = `

      <div class="panel-title-row">

        <div>

          <div class="panel-eyebrow">
            FWCWL BRAND SYSTEM
          </div>

          <h2>
            Brand Identity
          </h2>

          <p>
            Maintain consistent league branding across every design.
          </p>

        </div>

      </div>


      <div class="official-brand-card">

        <div class="brand-preview-logo">

          <img
            src="assets/fwcwl-logo.jpeg"
            alt="FWCWL"
          />

        </div>


        <div>

          <strong>
            Official FWCWL Logo
          </strong>

          <p>
            Protected and placed above the creative layers.
          </p>

        </div>

      </div>


      <div class="form-field">

        <label>
          Brand Name
        </label>

        <input
          id="posterBrandName"
          type="text"
          value="FWCWL"
        />

      </div>


      <div class="form-field">

        <label>
          Accent
        </label>

        <div class="color-row">

          <input
            id="posterAccentColor"
            type="color"
            value="#F0C34C"
          />

          <input
            id="posterAccentColorText"
            type="text"
            value="#F0C34C"
          />

        </div>

      </div>


      <div class="form-field">

        <label>
          Text
        </label>

        <div class="color-row">

          <input
            id="posterTextColor"
            type="color"
            value="#FFFFFF"
          />

          <input
            id="posterTextColorText"
            type="text"
            value="#FFFFFF"
          />

        </div>

      </div>


      <div class="section-divider"></div>


      <div class="pro-section-label">
        BACKGROUND
      </div>


      <div class="form-grid-2">

        <div class="form-field">

          <label>
            Color A
          </label>

          <input
            id="proBackgroundColor1"
            type="color"
            value="#210B0E"
          />

        </div>


        <div class="form-field">

          <label>
            Color B
          </label>

          <input
            id="proBackgroundColor2"
            type="color"
            value="#080A0D"
          />

        </div>

      </div>


      <div class="field-block">

        <div class="range-head">

          <label>
            Gradient Angle
          </label>

          <span id="proBackgroundAngleValue">
            135°
          </span>

        </div>

        <input
          id="proBackgroundAngle"
          type="range"
          min="0"
          max="360"
          value="135"
        />

      </div>


      <div class="pro-background-presets">

        <button
          type="button"
          data-bg-preset="#210B0E,#080A0D"
          style="--a:#210B0E;--b:#080A0D"
        ></button>

        <button
          type="button"
          data-bg-preset="#071C29,#66151D"
          style="--a:#071C29;--b:#66151D"
        ></button>

        <button
          type="button"
          data-bg-preset="#06141A,#087886"
          style="--a:#06141A;--b:#087886"
        ></button>

        <button
          type="button"
          data-bg-preset="#0A0A0C,#333333"
          style="--a:#0A0A0C;--b:#333333"
        ></button>

        <button
          type="button"
          data-bg-preset="#5A0E17,#E29E26"
          style="--a:#5A0E17;--b:#E29E26"
        ></button>

        <button
          type="button"
          data-bg-preset="#0A1830,#264A8A"
          style="--a:#0A1830;--b:#264A8A"
        ></button>

      </div>

    `;

  }


  /* ============================================================
     INSPECTOR
  ============================================================ */

  buildInspector() {

    const panel =
      document.getElementById(
        "posterRightPanel"
      );


    const scroll =
      panel?.querySelector(
        ".right-scroll"
      );


    if (
      !panel ||
      !scroll
    ) return;


    scroll.innerHTML = `

      <div class="pro-inspector-tabs">

        <button
          class="active"
          data-inspector-tab="edit"
          type="button"
        >
          Edit
        </button>

        <button
          data-inspector-tab="effects"
          type="button"
        >
          Effects
        </button>

        <button
          data-inspector-tab="layers"
          type="button"
        >
          Layers
        </button>

      </div>


      <div
        id="proInspectorEdit"
        class="pro-inspector-tab active"
      >

        <section class="inspector-section">

          <div class="inspector-title-row">

            <div class="inspector-title">
              SELECTED LAYER
            </div>

            <span
              id="proSelectedType"
              class="selected-badge"
            >
              None
            </span>

          </div>


          <div
            id="proNoSelection"
            class="pro-no-selection"
          >
            Select a text, photo, shape or graphic on the poster.
          </div>


          <div
            id="proSelectionControls"
            class="hidden"
          >

            <div class="form-field">

              <label>
                Layer Name
              </label>

              <input
                id="proObjectName"
                type="text"
              />

            </div>


            <div class="form-grid-2">

              <div class="form-field">

                <label>X</label>

                <input
                  id="proObjectX"
                  type="number"
                />

              </div>


              <div class="form-field">

                <label>Y</label>

                <input
                  id="proObjectY"
                  type="number"
                />

              </div>

            </div>


            <div class="field-block">

              <div class="range-head">

                <label>
                  Scale
                </label>

                <span id="proObjectScaleValue">
                  100%
                </span>

              </div>

              <input
                id="proObjectScale"
                type="range"
                min="10"
                max="400"
                value="100"
              />

            </div>


            <div class="field-block">

              <div class="range-head">

                <label>
                  Rotation
                </label>

                <span id="proObjectAngleValue">
                  0°
                </span>

              </div>

              <input
                id="proObjectAngle"
                type="range"
                min="-180"
                max="180"
                value="0"
              />

            </div>


            <div class="field-block">

              <div class="range-head">

                <label>
                  Opacity
                </label>

                <span id="proObjectOpacityValue">
                  100%
                </span>

              </div>

              <input
                id="proObjectOpacity"
                type="range"
                min="0"
                max="100"
                value="100"
              />

            </div>


            <div class="pro-command-grid">

              <button
                id="proFlipX"
                type="button"
              >
                Flip H
              </button>

              <button
                id="proFlipY"
                type="button"
              >
                Flip V
              </button>

              <button
                id="proCenterX"
                type="button"
              >
                Center H
              </button>

              <button
                id="proCenterY"
                type="button"
              >
                Center V
              </button>

            </div>

          </div>

        </section>


        <section
          id="proTextSection"
          class="inspector-section hidden"
        >

          <div class="inspector-title">
            TYPOGRAPHY
          </div>


          <div class="form-field">

            <label>
              Text
            </label>

            <textarea
              id="proTextValue"
              rows="3"
            ></textarea>

          </div>


          <div class="form-grid-2">

            <div class="form-field">

              <label>
                Font
              </label>

              <select id="proTextFont">

                ${FONT_OPTIONS.map(
                  font => `

                    <option value="${font}">
                      ${font}
                    </option>

                  `
                ).join("")}

              </select>

            </div>


            <div class="form-field">

              <label>
                Weight
              </label>

              <select id="proTextWeight">

                <option value="400">
                  Regular
                </option>

                <option value="500">
                  Medium
                </option>

                <option value="600">
                  Semi Bold
                </option>

                <option value="700">
                  Bold
                </option>

                <option value="800">
                  Extra Bold
                </option>

                <option value="900">
                  Black
                </option>

              </select>

            </div>

          </div>


          <div class="field-block">

            <div class="range-head">

              <label>
                Font Size
              </label>

              <span id="proTextSizeValue">
                80
              </span>

            </div>

            <input
              id="proTextSize"
              type="range"
              min="10"
              max="320"
              value="80"
            />

          </div>


          <div class="field-block">

            <div class="range-head">

              <label>
                Letter Spacing
              </label>

              <span id="proTextSpacingValue">
                0
              </span>

            </div>

            <input
              id="proTextSpacing"
              type="range"
              min="-100"
              max="700"
              value="0"
            />

          </div>


          <div class="field-block">

            <div class="range-head">

              <label>
                Line Height
              </label>

              <span id="proTextLineHeightValue">
                1.00
              </span>

            </div>

            <input
              id="proTextLineHeight"
              type="range"
              min="65"
              max="220"
              value="100"
            />

          </div>


          <div class="form-grid-2">

            <div class="form-field">

              <label>
                Fill
              </label>

              <input
                id="proTextFill"
                type="color"
                value="#FFFFFF"
              />

            </div>


            <div class="form-field">

              <label>
                Outline
              </label>

              <input
                id="proTextStroke"
                type="color"
                value="#000000"
              />

            </div>

          </div>


          <div class="field-block">

            <div class="range-head">

              <label>
                Outline Width
              </label>

              <span id="proTextStrokeWidthValue">
                0
              </span>

            </div>

            <input
              id="proTextStrokeWidth"
              type="range"
              min="0"
              max="20"
              value="0"
            />

          </div>


          <div class="form-field">

            <label>
              Text Highlight
            </label>

            <input
              id="proTextBackground"
              type="color"
              value="#F0C34C"
            />

          </div>


          <div
            id="proTextAlign"
            class="segmented-control"
          >

            <button
              data-align="left"
              type="button"
            >
              Left
            </button>

            <button
              data-align="center"
              type="button"
            >
              Center
            </button>

            <button
              data-align="right"
              type="button"
            >
              Right
            </button>

          </div>


          <div class="pro-command-grid">

            <button
              id="proTextItalic"
              type="button"
            >
              Italic
            </button>

            <button
              id="proTextUnderline"
              type="button"
            >
              Underline
            </button>

            <button
              id="proTextUppercase"
              type="button"
            >
              UPPERCASE
            </button>

            <button
              id="proGradientText"
              type="button"
            >
              Gold Gradient
            </button>

            <button
              id="proTextHighlight"
              type="button"
            >
              Highlight
            </button>

            <button
              id="proTextAutoFit"
              type="button"
            >
              Auto Fit
            </button>

          </div>

        </section>


        <section
          id="proImageSection"
          class="inspector-section hidden"
        >

          <div class="inspector-title">
            PHOTO
          </div>


          <div class="pro-command-grid">

            <button
              id="proCropImage"
              type="button"
            >
              Crop
            </button>

            <button
              id="proImageFit"
              type="button"
            >
              Fit
            </button>

            <button
              id="proImageFill"
              type="button"
            >
              Fill
            </button>

            <button
              id="proImageCenter"
              type="button"
            >
              Center
            </button>

          </div>


          <div class="pro-section-label inspector-gap">
            MASKS
          </div>


          <div class="pro-command-grid">

            <button
              data-mask="none"
              type="button"
            >
              None
            </button>

            <button
              data-mask="circle"
              type="button"
            >
              Circle
            </button>

            <button
              data-mask="rounded"
              type="button"
            >
              Rounded
            </button>

            <button
              data-mask="portrait"
              type="button"
            >
              Portrait
            </button>

          </div>

        </section>


        <section
          id="proShapeSection"
          class="inspector-section hidden"
        >

          <div class="inspector-title">
            SHAPE
          </div>


          <div class="form-grid-2">

            <div class="form-field">

              <label>
                Fill
              </label>

              <input
                id="proShapeFill"
                type="color"
                value="#F0C34C"
              />

            </div>


            <div class="form-field">

              <label>
                Stroke
              </label>

              <input
                id="proShapeStroke"
                type="color"
                value="#FFFFFF"
              />

            </div>

          </div>


          <div class="field-block">

            <div class="range-head">

              <label>
                Stroke Width
              </label>

              <span id="proShapeStrokeWidthValue">
                0
              </span>

            </div>

            <input
              id="proShapeStrokeWidth"
              type="range"
              min="0"
              max="30"
              value="0"
            />

          </div>

        </section>


        <section
          id="proObjectActionsSection"
          class="inspector-section hidden"
        >

          <div class="inspector-title">
            ARRANGE
          </div>


          <div class="pro-command-grid">

            <button
              id="proDuplicateObject"
              type="button"
            >
              Duplicate
            </button>

            <button
              id="proLockObject"
              type="button"
            >
              Lock
            </button>

            <button
              id="proBringForward"
              type="button"
            >
              Forward
            </button>

            <button
              id="proSendBackward"
              type="button"
            >
              Backward
            </button>

            <button
              id="proGroupObjects"
              type="button"
            >
              Group
            </button>

            <button
              id="proUngroupObjects"
              type="button"
            >
              Ungroup
            </button>

          </div>


          <button
            id="proDeleteObject"
            class="pro-danger-button"
            type="button"
          >
            Delete Selected
          </button>

        </section>

      </div>


      <div
        id="proInspectorEffects"
        class="pro-inspector-tab"
      >

        <section class="inspector-section">

          <div class="inspector-title">
            BLEND & DEPTH
          </div>


          <div class="form-field">

            <label>
              Blend Mode
            </label>

            <select id="proBlendMode">

              ${BLEND_MODES.map(
                mode => `

                  <option value="${mode}">
                    ${mode}
                  </option>

                `
              ).join("")}

            </select>

          </div>


          <label class="switch-row">

            <div>

              <strong>
                Drop Shadow
              </strong>

              <span>
                Depth and separation
              </span>

            </div>

            <input
              id="proShadowEnabled"
              type="checkbox"
            />

            <span class="switch-ui"></span>

          </label>


          <div class="form-field">

            <label>
              Shadow Color
            </label>

            <input
              id="proShadowColor"
              type="color"
              value="#000000"
            />

          </div>


          ${this.buildAdjustmentSlider(
            "proShadowBlur",
            "Shadow Blur",
            0,
            120,
            25
          )}

        </section>


        <section
          id="proImageEffectsSection"
          class="inspector-section hidden"
        >

          <div class="inspector-title">
            PHOTO ADJUST
          </div>


          ${this.buildAdjustmentSlider(
            "proImageBrightness",
            "Brightness",
            -100,
            100,
            0
          )}


          ${this.buildAdjustmentSlider(
            "proImageContrast",
            "Contrast",
            -100,
            100,
            0
          )}


          ${this.buildAdjustmentSlider(
            "proImageSaturation",
            "Saturation",
            -100,
            100,
            0
          )}


          ${this.buildAdjustmentSlider(
            "proImageVibrance",
            "Vibrance",
            -100,
            100,
            0
          )}


          ${this.buildAdjustmentSlider(
            "proImageBlur",
            "Blur",
            0,
            100,
            0
          )}


          ${this.buildAdjustmentSlider(
            "proImageGrain",
            "Grain",
            0,
            100,
            0
          )}


          <div class="pro-section-label inspector-gap">
            FILTER PRESETS
          </div>


          <div class="pro-filter-grid">

            <button
              data-photo-preset="clean"
              type="button"
            >
              Clean
            </button>

            <button
              data-photo-preset="stadium"
              type="button"
            >
              Stadium
            </button>

            <button
              data-photo-preset="night"
              type="button"
            >
              Night
            </button>

            <button
              data-photo-preset="dramatic"
              type="button"
            >
              Dramatic
            </button>

            <button
              data-photo-preset="vintage"
              type="button"
            >
              Vintage
            </button>

            <button
              data-photo-preset="bw"
              type="button"
            >
              B&W
            </button>

          </div>


          <div class="section-divider"></div>


          <div class="pro-section-label">
            COLOR CUTOUT
          </div>


          <p class="pro-helper-text">
            Removes a selected solid background color.
          </p>


          <div class="form-field">

            <label>
              Remove Color
            </label>

            <input
              id="proRemoveColor"
              type="color"
              value="#FFFFFF"
            />

          </div>


          ${this.buildAdjustmentSlider(
            "proRemoveColorDistance",
            "Tolerance",
            1,
            100,
            20
          )}


          <button
            id="proApplyRemoveColor"
            class="pro-gold-button"
            type="button"
          >
            Apply Color Cutout
          </button>

        </section>


        <section class="inspector-section">

          <div class="inspector-title">
            CANVAS BACKGROUND
          </div>


          <div class="form-grid-2">

            <div class="form-field">

              <label>
                Color A
              </label>

              <input
                id="proFxBackground1"
                type="color"
                value="#210B0E"
              />

            </div>


            <div class="form-field">

              <label>
                Color B
              </label>

              <input
                id="proFxBackground2"
                type="color"
                value="#080A0D"
              />

            </div>

          </div>

        </section>

      </div>


      <div
        id="proInspectorLayers"
        class="pro-inspector-tab"
      >

        <section class="inspector-section">

          <div class="inspector-title-row">

            <div class="inspector-title">
              LAYERS
            </div>

            <span
              id="proLayerCount"
              class="selected-badge"
            >
              0
            </span>

          </div>


          <p class="pro-helper-text">
            Drag layers to change stacking order.
          </p>


          <div
            id="proLayerList"
            class="pro-layer-list"
          ></div>

        </section>

      </div>

    `;


    const footer =
      panel.querySelector(
        ".right-footer"
      );


    if (footer) {

      footer.innerHTML = `

        <button
          id="posterDownloadPngBtn"
          class="export-main-btn"
          type="button"
        >

          <span>

            <strong>
              Export Poster
            </strong>

            <small>
              PNG / JPG · 1× / 2× / 4×
            </small>

          </span>

          <span>↓</span>

        </button>

      `;

    }

  }


  buildAdjustmentSlider(
    id,
    label,
    min,
    max,
    value
  ) {

    return `

      <div class="field-block">

        <div class="range-head">

          <label>
            ${label}
          </label>

          <span id="${id}Value">
            ${value}
          </span>

        </div>

        <input
          id="${id}"
          type="range"
          min="${min}"
          max="${max}"
          value="${value}"
        />

      </div>

    `;

  }


  /* ============================================================
     CONTEXT TOOLBAR
  ============================================================ */

  buildContextToolbar() {

    document
      .getElementById(
        "posterContextToolbar"
      )
      ?.remove();


    const toolbar =
      document.createElement(
        "div"
      );


    toolbar.id =
      "posterContextToolbar";


    toolbar.className =
      "poster-context-toolbar hidden";


    toolbar.innerHTML = `

      <button
        data-context-action="duplicate"
        type="button"
      >
        Duplicate
      </button>

      <button
        data-context-action="forward"
        type="button"
      >
        Forward
      </button>

      <button
        data-context-action="backward"
        type="button"
      >
        Back
      </button>

      <button
        data-context-action="center"
        type="button"
      >
        Center
      </button>

      <button
        data-context-action="crop"
        class="context-image-only"
        type="button"
      >
        Crop
      </button>

      <button
        data-context-action="delete"
        class="danger"
        type="button"
      >
        Delete
      </button>

    `;


    document.body.appendChild(
      toolbar
    );

  }


  /* ============================================================
     CROP TOOLBAR
  ============================================================ */

  buildCropToolbar() {

    document
      .getElementById(
        "posterCropToolbar"
      )
      ?.remove();


    const toolbar =
      document.createElement(
        "div"
      );


    toolbar.id =
      "posterCropToolbar";


    toolbar.className =
      "poster-crop-toolbar hidden";


    toolbar.innerHTML = `

      <strong>
        Crop Photo
      </strong>

      <button
        data-crop-action="frame"
        type="button"
      >
        Edit Frame
      </button>

      <button
        data-crop-action="image"
        type="button"
      >
        Move Image
      </button>

      <button
        data-crop-action="cancel"
        type="button"
      >
        Cancel
      </button>

      <button
        data-crop-action="apply"
        class="primary"
        type="button"
      >
        Apply Crop
      </button>

    `;


    document.body.appendChild(
      toolbar
    );

  }


  /* ============================================================
     EXPORT MODAL
  ============================================================ */

  buildExportModal() {

    document
      .getElementById(
        "posterExportStudio"
      )
      ?.remove();


    const modal =
      document.createElement(
        "div"
      );


    modal.id =
      "posterExportStudio";


    modal.className =
      "poster-export-studio hidden";


    modal.innerHTML = `

      <div class="poster-export-dialog">

        <button
          id="closePosterExportStudio"
          class="export-dialog-close"
          type="button"
        >
          ×
        </button>


        <div class="panel-eyebrow">
          EXPORT STUDIO
        </div>

        <h2>
          Export Poster
        </h2>

        <p>
          Export your finished design at production-quality resolution.
        </p>


        <div class="export-studio-grid">

          <div class="form-field">

            <label>
              Format
            </label>

            <select id="posterExportFormat">

              <option value="png">
                PNG
              </option>

              <option value="jpg">
                JPG
              </option>

            </select>

          </div>


          <div class="form-field">

            <label>
              Resolution
            </label>

            <select id="posterExportMultiplier">

              <option value="1">
                1× · Original
              </option>

              <option value="2">
                2× · High Resolution
              </option>

              <option value="4">
                4× · Maximum
              </option>

            </select>

          </div>

        </div>


        <label class="switch-row">

          <div>

            <strong>
              Include Background
            </strong>

            <span>
              Disable for transparent PNG
            </span>

          </div>

          <input
            id="posterExportBackground"
            type="checkbox"
            checked
          />

          <span class="switch-ui"></span>

        </label>


        <div
          id="posterExportSizePreview"
          class="export-size-preview"
        ></div>


        <button
          id="confirmPosterExport"
          class="pro-gold-button"
          type="button"
        >
          Export
        </button>

      </div>

    `;


    document.body.appendChild(
      modal
    );

  }


  /* ============================================================
     CANVAS EVENTS
  ============================================================ */

  bindCanvasEvents() {

    this.canvas.on(
      "selection:created",
      () => this.onSelectionChanged()
    );


    this.canvas.on(
      "selection:updated",
      () => this.onSelectionChanged()
    );


    this.canvas.on(
      "selection:cleared",
      () => this.onSelectionChanged()
    );


    this.canvas.on(
      "object:moving",
      event => {

        const object =
          event.target;


        if (
          object &&
          !object.isUi
        ) {

          this.applySmartGuides(
            object
          );

        }


        this.updateTransformControls();

        this.updateContextToolbar();

      }
    );


    this.canvas.on(
      "object:scaling",
      () => {

        this.updateTransformControls();

        this.updateContextToolbar();

      }
    );


    this.canvas.on(
      "object:rotating",
      () => {

        this.updateTransformControls();

        this.updateContextToolbar();

      }
    );


    this.canvas.on(
      "object:modified",
      event => {

        this.clearSmartGuides();


        event.target
          ?.setCoords?.();


        this.canvas.requestRenderAll();

        this.renderLayers();

        this.updateSelectionInspector();

        this.updateContextToolbar();

        this.commit();

      }
    );


    this.canvas.on(
      "mouse:up",
      () => {

        this.clearSmartGuides();

      }
    );


    this.canvas.on(
      "path:created",
      event => {

        const path =
          event.path;


        this.assignObjectMeta(
          path,
          "Drawing",
          "drawing",
          "user"
        );


        if (
          this.state.brushMode ===
          "highlighter"
        ) {

          path.opacity = 0.3;

        }


        if (
          this.state.brushMode ===
          "eraser"
        ) {

          path.globalCompositeOperation =
            "destination-out";

        }


        this.ensureBrandTop();

        this.renderLayers();

        this.commit();

      }
    );

  }


  onSelectionChanged() {

    if (!this.cropMode) {

      this.setDrawingMode(
        false
      );

    }


    this.updateSelectionInspector();

    this.renderLayers();

    this.updateContextToolbar();

  }


  /* ============================================================
     PAGE UI
  ============================================================ */

  bindPageUi() {

    this.bindPosterTabs();

    this.bindTemplateControls();

    this.bindCanvasControls();

    this.bindBrandControls();

  }


  bindProUi() {

    this.bindToolRail();

    this.bindMediaPanel();

    this.bindInspectorTabs();

    this.bindTransformInspector();

    this.bindTextInspector();

    this.bindImageInspector();

    this.bindShapeInspector();

    this.bindEffectsInspector();

    this.bindContextToolbar();

    this.bindCropToolbar();

    this.bindExportStudio();

  }


  bindGlobalEvents() {

    window.addEventListener(
      "resize",
      () => {

        if (
          this.initialized
        ) {

          this.fitCanvasToViewport();

        }


        this.updateContextToolbar();

        this.updateCropToolbarPosition();

      }
    );


    document.addEventListener(
      "keydown",
      event => {

        this.handleKeyboard(
          event
        );

      }
    );

  }


  /* ============================================================
     LEFT TABS
  ============================================================ */

  bindPosterTabs() {

    document
      .querySelectorAll(
        "[data-poster-tab]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              document
                .querySelectorAll(
                  "[data-poster-tab]"
                )
                .forEach(
                  item => {

                    item.classList.remove(
                      "active"
                    );

                  }
                );


              document
                .querySelectorAll(
                  "#posterLeftPanel .left-tab-panel"
                )
                .forEach(
                  panel => {

                    panel.classList.remove(
                      "active"
                    );

                  }
                );


              button.classList.add(
                "active"
              );


              const map = {

                templates:
                  "posterTemplatesPanel",

                media:
                  "posterMediaPanel",

                brand:
                  "posterBrandPanel"

              };


              document
                .getElementById(
                  map[
                    button.dataset
                      .posterTab
                  ]
                )
                ?.classList
                .add(
                  "active"
                );

            }
          );

        }
      );

  }


  /* ============================================================
     TEMPLATE CONTROLS
  ============================================================ */

  bindTemplateControls() {

    document
      .getElementById(
        "posterTemplateSearch"
      )
      ?.addEventListener(
        "input",
        () => {

          this.renderTemplates();

        }
      );


    document
      .querySelectorAll(
        "#posterTemplateFilters .filter-chip"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              document
                .querySelectorAll(
                  "#posterTemplateFilters .filter-chip"
                )
                .forEach(
                  chip => {

                    chip.classList.remove(
                      "active"
                    );

                  }
                );


              button.classList.add(
                "active"
              );


              this.activeFilter =
                button.dataset.filter;


              this.renderTemplates();

            }
          );

        }
      );

  }


  /* ============================================================
     CANVAS CONTROLS
  ============================================================ */

  bindCanvasControls() {

    document
      .getElementById(
        "posterCanvasSize"
      )
      ?.addEventListener(
        "change",
        event => {

          this.resizeCanvas(
            event.target.value
          );

        }
      );


    document
      .getElementById(
        "posterSafeZoneBtn"
      )
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


          this.updateSafeZone();

        }
      );


    document
      .getElementById(
        "posterSnapBtn"
      )
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

        }
      );


    document
      .getElementById(
        "posterFitBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          this.fitCanvasToViewport();

        }
      );


    document
      .getElementById(
        "posterZoomOutBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          this.state.zoom =
            Math.max(
              20,
              this.state.zoom - 5
            );


          this.applyZoom();

        }
      );


    document
      .getElementById(
        "posterZoomInBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          this.state.zoom =
            Math.min(
              100,
              this.state.zoom + 5
            );


          this.applyZoom();

        }
      );


    document
      .getElementById(
        "posterResetBtn"
      )
      ?.addEventListener(
        "click",
        async () => {

          if (
            !confirm(
              "Reset the poster and remove custom layers?"
            )
          ) {

            return;

          }


          await this.applyTemplate(
            DEFAULT_TEMPLATE_ID,
            true,
            false
          );

        }
      );


    document
      .getElementById(
        "posterExportTopBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          this.openExportStudio();

        }
      );

  }


  /* ============================================================
     BRAND CONTROLS
  ============================================================ */

  bindBrandControls() {

    const brandInput =
      document.getElementById(
        "posterBrandName"
      );


    brandInput
      ?.addEventListener(
        "input",
        event => {

          this.state.brandName =
            event.target.value;


          this.updateBrandText();

        }
      );


    brandInput
      ?.addEventListener(
        "change",
        () => {

          this.clearTemplatePreviewCache();

          this.renderTemplates();

          this.commit();

        }
      );


    this.bindColorPair(
      "posterAccentColor",
      "posterAccentColorText",
      value => {

        this.state.accent =
          value;


        this.applyBrandAccent();

      }
    );


    this.bindColorPair(
      "posterTextColor",
      "posterTextColorText",
      value => {

        this.state.textColor =
          value;


        this.applyBrandTextColor();

      }
    );


    document
      .getElementById(
        "proBackgroundColor1"
      )
      ?.addEventListener(
        "input",
        event => {

          this.state.backgroundColor =
            event.target.value;


          this.syncBackgroundInputs();

          this.updateBackground();

        }
      );


    document
      .getElementById(
        "proBackgroundColor2"
      )
      ?.addEventListener(
        "input",
        event => {

          this.state.backgroundColor2 =
            event.target.value;


          this.syncBackgroundInputs();

          this.updateBackground();

        }
      );


    document
      .getElementById(
        "proBackgroundAngle"
      )
      ?.addEventListener(
        "input",
        event => {

          this.state.backgroundAngle =
            Number(
              event.target.value
            );


          this.setText(
            "proBackgroundAngleValue",
            `${this.state.backgroundAngle}°`
          );


          this.updateBackground();

        }
      );


    document
      .querySelectorAll(
        "[data-bg-preset]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const [
                colorA,
                colorB
              ] =
                button.dataset
                  .bgPreset
                  .split(",");


              this.state.backgroundColor =
                colorA;


              this.state.backgroundColor2 =
                colorB;


              this.syncBackgroundInputs();

              this.updateBackground();

              this.commit();

            }
          );

        }
      );

  }


  bindColorPair(
    pickerId,
    textId,
    callback
  ) {

    const picker =
      document.getElementById(
        pickerId
      );


    const text =
      document.getElementById(
        textId
      );


    if (
      !picker ||
      !text
    ) {

      return;

    }


    picker.addEventListener(
      "input",
      () => {

        const value =
          picker.value
            .toUpperCase();


        text.value =
          value;


        callback(
          value
        );

      }
    );


    picker.addEventListener(
      "change",
      () => {

        this.commit();

      }
    );


    text.addEventListener(
      "change",
      () => {

        const normalized =
          this.normalizeColor(
            text.value
          );


        if (!normalized) {

          text.value =
            picker.value
              .toUpperCase();


          return;

        }


        picker.value =
          normalized;


        text.value =
          normalized;


        callback(
          normalized
        );


        this.commit();

      }
    );

  }


  /* ============================================================
     TOOL RAIL
  ============================================================ */

  bindToolRail() {

    document
      .querySelectorAll(
        "[data-pro-tool]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              document
                .querySelectorAll(
                  "[data-pro-tool]"
                )
                .forEach(
                  item => {

                    item.classList.remove(
                      "active"
                    );

                  }
                );


              button.classList.add(
                "active"
              );


              this.handleTool(
                button.dataset
                  .proTool
              );

            }
          );

        }
      );


    document
      .getElementById(
        "proQuickPhotoInput"
      )
      ?.addEventListener(
        "change",
        event => {

          const file =
            event.target.files[0];


          if (file) {

            this.addPhotoFile(
              file
            );

          }


          event.target.value =
            "";

        }
      );

  }


  handleTool(tool) {

    this.hideToolPopover();


    switch (tool) {

      case "select":

        this.setDrawingMode(
          false
        );

        break;


      case "text":

        this.setDrawingMode(
          false
        );

        this.addTextLayer();

        break;


      case "photo":

        this.setDrawingMode(
          false
        );

        document
          .getElementById(
            "proQuickPhotoInput"
          )
          ?.click();

        break;


      case "elements":

        this.setDrawingMode(
          false
        );

        this.showElementPopover();

        break;


      case "shape":

        this.setDrawingMode(
          false
        );

        this.showShapePopover();

        break;


      case "draw":

        this.showDrawPopover();

        break;


      case "layers":

        this.setDrawingMode(
          false
        );

        this.switchInspectorTab(
          "layers"
        );

        break;


      case "background":

        this.setDrawingMode(
          false
        );

        this.switchInspectorTab(
          "effects"
        );

        break;

    }

  }


  showElementPopover() {

    const popover =
      document.getElementById(
        "posterToolPopover"
      );


    if (!popover) return;


    const elements = [

      [
        "ball",
        "BALL"
      ],

      [
        "bat",
        "BAT"
      ],

      [
        "wickets",
        "WICKETS"
      ],

      [
        "score",
        "SCORE"
      ],

      [
        "live",
        "LIVE"
      ],

      [
        "versus",
        "VS"
      ],

      [
        "playercard",
        "PLAYER"
      ],

      [
        "trophy",
        "TROPHY"
      ]

    ];


    popover.innerHTML = `

      <div class="tool-popover-title">
        CRICKET ELEMENTS
      </div>

      <div class="premium-element-popover">

        ${elements.map(
          ([id, label]) => `

            <button
              data-pop-element="${id}"
              type="button"
            >
              ${label}
            </button>

          `
        ).join("")}

      </div>

    `;


    popover.classList.remove(
      "hidden"
    );


    popover
      .querySelectorAll(
        "[data-pop-element]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              this.addCricketElement(
                button.dataset
                  .popElement
              );


              this.hideToolPopover();

            }
          );

        }
      );

  }


  showShapePopover() {

    const popover =
      document.getElementById(
        "posterToolPopover"
      );


    if (!popover) return;


    popover.innerHTML = `

      <div class="tool-popover-title">
        SHAPES
      </div>

      <div class="popover-shape-grid">

        <button
          data-pop-shape="rect"
          type="button"
        >
          ▰
        </button>

        <button
          data-pop-shape="circle"
          type="button"
        >
          ●
        </button>

        <button
          data-pop-shape="triangle"
          type="button"
        >
          ▲
        </button>

        <button
          data-pop-shape="line"
          type="button"
        >
          ╱
        </button>

        <button
          data-pop-shape="badge"
          type="button"
        >
          ★
        </button>

      </div>

    `;


    popover.classList.remove(
      "hidden"
    );


    popover
      .querySelectorAll(
        "[data-pop-shape]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              this.addShape(
                button.dataset
                  .popShape
              );


              this.hideToolPopover();

            }
          );

        }
      );

  }


  showDrawPopover() {

    const popover =
      document.getElementById(
        "posterToolPopover"
      );


    if (!popover) return;


    popover.innerHTML = `

      <div class="tool-popover-title">
        DRAW
      </div>


      <div class="form-field">

        <label>
          Brush Color
        </label>

        <input
          id="proBrushColor"
          type="color"
          value="${this.state.brushColor}"
        />

      </div>


      <div class="field-block">

        <div class="range-head">

          <label>
            Brush Size
          </label>

          <span id="proBrushWidthValue">
            ${this.state.brushWidth}
          </span>

        </div>

        <input
          id="proBrushWidth"
          type="range"
          min="2"
          max="100"
          value="${this.state.brushWidth}"
        />

      </div>


      <div class="pro-command-grid">

        <button
          data-brush-mode="brush"
          type="button"
        >
          Brush
        </button>

        <button
          data-brush-mode="highlighter"
          type="button"
        >
          Highlight
        </button>

        <button
          data-brush-mode="eraser"
          type="button"
        >
          Eraser
        </button>

      </div>

    `;


    popover.classList.remove(
      "hidden"
    );


    this.setDrawingMode(
      true
    );


    popover
      .querySelector(
        "#proBrushColor"
      )
      ?.addEventListener(
        "input",
        event => {

          this.state.brushColor =
            event.target.value;


          this.configureBrush();

        }
      );


    popover
      .querySelector(
        "#proBrushWidth"
      )
      ?.addEventListener(
        "input",
        event => {

          this.state.brushWidth =
            Number(
              event.target.value
            );


          this.setText(
            "proBrushWidthValue",
            this.state.brushWidth
          );


          this.configureBrush();

        }
      );


    popover
      .querySelectorAll(
        "[data-brush-mode]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              this.state.brushMode =
                button.dataset
                  .brushMode;


              this.configureBrush();

            }
          );

        }
      );

  }


  hideToolPopover() {

    document
      .getElementById(
        "posterToolPopover"
      )
      ?.classList
      .add(
        "hidden"
      );

  }


  setDrawingMode(enabled) {

    this.canvas.isDrawingMode =
      enabled;


    if (enabled) {

      this.canvas.discardActiveObject();

      this.configureBrush();

      this.canvas.requestRenderAll();

      this.updateContextToolbar();

    }

  }


  configureBrush() {

    const brush =
      new PencilBrush(
        this.canvas
      );


    brush.width =
      this.state.brushWidth;


    brush.color =
      this.state.brushMode ===
      "eraser"
        ? "#000000"
        : this.state.brushColor;


    this.canvas.freeDrawingBrush =
      brush;

  }


  /* ============================================================
     MEDIA PANEL BINDINGS
  ============================================================ */

  bindMediaPanel() {

    document
      .getElementById(
        "proAddPhotoInput"
      )
      ?.addEventListener(
        "change",
        event => {

          const file =
            event.target.files[0];


          if (file) {

            this.addPhotoFile(
              file
            );

          }


          event.target.value =
            "";

        }
      );


    document
      .getElementById(
        "proBackgroundPhotoInput"
      )
      ?.addEventListener(
        "change",
        event => {

          const file =
            event.target.files[0];


          if (file) {

            this.addBackgroundPhoto(
              file
            );

          }


          event.target.value =
            "";

        }
      );


    document
      .getElementById(
        "posterSponsorLogoInput"
      )
      ?.addEventListener(
        "change",
        event => {

          const file =
            event.target.files[0];


          if (file) {

            this.addSponsorLogo(
              file
            );

          }


          event.target.value =
            "";

        }
      );


    document
      .querySelectorAll(
        "[data-cricket-element]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              this.addCricketElement(
                button.dataset
                  .cricketElement
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-add-shape]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              this.addShape(
                button.dataset
                  .addShape
              );

            }
          );

        }
      );

  }


  /* ============================================================
     INSPECTOR TABS
  ============================================================ */

  bindInspectorTabs() {

    document
      .querySelectorAll(
        "[data-inspector-tab]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              this.switchInspectorTab(
                button.dataset
                  .inspectorTab
              );

            }
          );

        }
      );

  }


  switchInspectorTab(name) {

    document
      .querySelectorAll(
        "[data-inspector-tab]"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "active",
            button.dataset
              .inspectorTab ===
              name
          );

        }
      );


    document
      .querySelectorAll(
        ".pro-inspector-tab"
      )
      .forEach(
        panel => {

          panel.classList.remove(
            "active"
          );

        }
      );


    const map = {

      edit:
        "proInspectorEdit",

      effects:
        "proInspectorEffects",

      layers:
        "proInspectorLayers"

    };


    document
      .getElementById(
        map[name]
      )
      ?.classList
      .add(
        "active"
      );


    if (
      name === "layers"
    ) {

      this.renderLayers();

    }

  }


  /* ============================================================
     TRANSFORM INSPECTOR
  ============================================================ */

  bindTransformInspector() {

    document
      .getElementById(
        "proObjectName"
      )
      ?.addEventListener(
        "change",
        event => {

          const object =
            this.getEditableSelection();


          if (!object) return;


          object.name =
            event.target.value
              .trim() ||
            "Layer";


          this.renderLayers();

          this.commit();

        }
      );


    document
      .getElementById(
        "proObjectX"
      )
      ?.addEventListener(
        "change",
        event => {

          const object =
            this.getEditableSelection();


          if (!object) return;


          object.left =
            Number(
              event.target.value
            );


          object.setCoords();

          this.canvas.requestRenderAll();

          this.commit();

        }
      );


    document
      .getElementById(
        "proObjectY"
      )
      ?.addEventListener(
        "change",
        event => {

          const object =
            this.getEditableSelection();


          if (!object) return;


          object.top =
            Number(
              event.target.value
            );


          object.setCoords();

          this.canvas.requestRenderAll();

          this.commit();

        }
      );


    this.bindRange(
      "proObjectScale",
      value => {

        const object =
          this.getEditableSelection();


        if (!object) return;


        const scale =
          value / 100;


        object.scaleX =
          scale;


        object.scaleY =
          scale;


        object.setCoords();


        this.setText(
          "proObjectScaleValue",
          `${Math.round(value)}%`
        );


        this.canvas.requestRenderAll();

      }
    );


    this.bindRange(
      "proObjectAngle",
      value => {

        const object =
          this.getEditableSelection();


        if (!object) return;


        object.angle =
          value;


        object.setCoords();


        this.setText(
          "proObjectAngleValue",
          `${Math.round(value)}°`
        );


        this.canvas.requestRenderAll();

      }
    );


    this.bindRange(
      "proObjectOpacity",
      value => {

        const object =
          this.getEditableSelection();


        if (!object) return;


        object.opacity =
          value / 100;


        this.setText(
          "proObjectOpacityValue",
          `${Math.round(value)}%`
        );


        this.canvas.requestRenderAll();

      }
    );


    document
      .getElementById(
        "proFlipX"
      )
      ?.addEventListener(
        "click",
        () => {

          const object =
            this.getEditableSelection();


          if (!object) return;


          object.flipX =
            !object.flipX;


          this.canvas.requestRenderAll();

          this.commit();

        }
      );


    document
      .getElementById(
        "proFlipY"
      )
      ?.addEventListener(
        "click",
        () => {

          const object =
            this.getEditableSelection();


          if (!object) return;


          object.flipY =
            !object.flipY;


          this.canvas.requestRenderAll();

          this.commit();

        }
      );


    document
      .getElementById(
        "proCenterX"
      )
      ?.addEventListener(
        "click",
        () => {

          this.centerSelected(
            "x"
          );

        }
      );


    document
      .getElementById(
        "proCenterY"
      )
      ?.addEventListener(
        "click",
        () => {

          this.centerSelected(
            "y"
          );

        }
      );


    document
      .getElementById(
        "proDuplicateObject"
      )
      ?.addEventListener(
        "click",
        () => {

          this.duplicateSelected();

        }
      );


    document
      .getElementById(
        "proDeleteObject"
      )
      ?.addEventListener(
        "click",
        () => {

          this.deleteSelected();

        }
      );


    document
      .getElementById(
        "proLockObject"
      )
      ?.addEventListener(
        "click",
        () => {

          this.toggleLockSelected();

        }
      );


    document
      .getElementById(
        "proBringForward"
      )
      ?.addEventListener(
        "click",
        () => {

          this.moveSelectedLayer(
            1
          );

        }
      );


    document
      .getElementById(
        "proSendBackward"
      )
      ?.addEventListener(
        "click",
        () => {

          this.moveSelectedLayer(
            -1
          );

        }
      );


    document
      .getElementById(
        "proGroupObjects"
      )
      ?.addEventListener(
        "click",
        () => {

          this.groupSelected();

        }
      );


    document
      .getElementById(
        "proUngroupObjects"
      )
      ?.addEventListener(
        "click",
        () => {

          this.ungroupSelected();

        }
      );

  }


  bindRange(
    id,
    callback
  ) {

    const input =
      document.getElementById(
        id
      );


    if (!input) return;


    input.addEventListener(
      "input",
      () => {

        callback(
          Number(
            input.value
          )
        );

      }
    );


    input.addEventListener(
      "change",
      () => {

        this.commit();

      }
    );

  }


  centerSelected(axis) {

    const object =
      this.getEditableSelection();


    if (!object) return;


    const center =
      object.getCenterPoint();


    if (
      axis === "x"
    ) {

      object.left +=
        this.canvas.width /
        2 -
        center.x;

    }


    if (
      axis === "y"
    ) {

      object.top +=
        this.canvas.height /
        2 -
        center.y;

    }


    object.setCoords();

    this.canvas.requestRenderAll();

    this.updateTransformControls();

    this.updateContextToolbar();

    this.commit();

  }


  /* ============================================================
     TEXT INSPECTOR
  ============================================================ */

  bindTextInspector() {

    const withText =
      callback => {

        const object =
          this.getEditableSelection();


        if (
          !this.isTextObject(
            object
          )
        ) {

          return;

        }


        callback(
          object
        );


        object.setCoords();

        this.canvas.requestRenderAll();

        this.updateContextToolbar();

      };


    document
      .getElementById(
        "proTextValue"
      )
      ?.addEventListener(
        "input",
        event => {

          withText(
            object => {

              object.text =
                event.target.value;

            }
          );

        }
      );


    document
      .getElementById(
        "proTextValue"
      )
      ?.addEventListener(
        "change",
        () => {

          this.commit();

        }
      );


    document
      .getElementById(
        "proTextFont"
      )
      ?.addEventListener(
        "change",
        event => {

          withText(
            object => {

              object.fontFamily =
                event.target.value;

            }
          );


          this.commit();

        }
      );


    document
      .getElementById(
        "proTextWeight"
      )
      ?.addEventListener(
        "change",
        event => {

          withText(
            object => {

              object.fontWeight =
                Number(
                  event.target.value
                );

            }
          );


          this.commit();

        }
      );


    this.bindTextRange(
      "proTextSize",
      "proTextSizeValue",
      (object, value) => {

        object.fontSize =
          value;

      },
      value => Math.round(
        value
      )
    );


    this.bindTextRange(
      "proTextSpacing",
      "proTextSpacingValue",
      (object, value) => {

        object.charSpacing =
          value;

      },
      value => Math.round(
        value
      )
    );


    this.bindTextRange(
      "proTextLineHeight",
      "proTextLineHeightValue",
      (object, value) => {

        object.lineHeight =
          value / 100;

      },
      value =>
        (
          value / 100
        )
          .toFixed(
            2
          )
    );


    document
      .getElementById(
        "proTextFill"
      )
      ?.addEventListener(
        "input",
        event => {

          withText(
            object => {

              object.fill =
                event.target.value;

            }
          );

        }
      );


    document
      .getElementById(
        "proTextFill"
      )
      ?.addEventListener(
        "change",
        () => {

          this.commit();

        }
      );


    document
      .getElementById(
        "proTextStroke"
      )
      ?.addEventListener(
        "input",
        event => {

          withText(
            object => {

              object.stroke =
                event.target.value;

            }
          );

        }
      );


    document
      .getElementById(
        "proTextStroke"
      )
      ?.addEventListener(
        "change",
        () => {

          this.commit();

        }
      );


    this.bindTextRange(
      "proTextStrokeWidth",
      "proTextStrokeWidthValue",
      (object, value) => {

        object.strokeWidth =
          value;

      },
      value =>
        Math.round(
          value
        )
    );


    document
      .querySelectorAll(
        "#proTextAlign [data-align]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              withText(
                object => {

                  object.textAlign =
                    button.dataset
                      .align;

                }
              );


              this.updateSelectionInspector();

              this.commit();

            }
          );

        }
      );


    document
      .getElementById(
        "proTextItalic"
      )
      ?.addEventListener(
        "click",
        () => {

          withText(
            object => {

              object.fontStyle =
                object.fontStyle ===
                "italic"
                  ? "normal"
                  : "italic";

            }
          );


          this.commit();

        }
      );


    document
      .getElementById(
        "proTextUnderline"
      )
      ?.addEventListener(
        "click",
        () => {

          withText(
            object => {

              object.underline =
                !object.underline;

            }
          );


          this.commit();

        }
      );


    document
      .getElementById(
        "proTextUppercase"
      )
      ?.addEventListener(
        "click",
        () => {

          withText(
            object => {

              object.text =
                String(
                  object.text ||
                  ""
                )
                  .toUpperCase();

            }
          );


          this.updateSelectionInspector();

          this.commit();

        }
      );


    document
      .getElementById(
        "proGradientText"
      )
      ?.addEventListener(
        "click",
        () => {

          withText(
            object => {

              object.fill =
                new Gradient({

                  type:
                    "linear",

                  coords: {

                    x1: 0,

                    y1: 0,

                    x2:
                      Math.max(
                        object.width ||
                        400,
                        400
                      ),

                    y2: 0

                  },

                  colorStops: [

                    {
                      offset: 0,
                      color:
                        "#FFF4BF"
                    },

                    {
                      offset:
                        0.48,
                      color:
                        "#F0C34C"
                    },

                    {
                      offset: 1,
                      color:
                        "#9D6E0D"
                    }

                  ]

                });

            }
          );


          this.commit();

        }
      );


    document
      .getElementById(
        "proTextHighlight"
      )
      ?.addEventListener(
        "click",
        () => {

          withText(
            object => {

              if (
                object.textBackgroundColor
              ) {

                object.textBackgroundColor =
                  "";

              } else {

                object.textBackgroundColor =
                  document
                    .getElementById(
                      "proTextBackground"
                    )
                    ?.value ||
                  "#F0C34C";

              }

            }
          );


          this.commit();

        }
      );


    document
      .getElementById(
        "proTextAutoFit"
      )
      ?.addEventListener(
        "click",
        () => {

          const object =
            this.getEditableSelection();


          if (
            !this.isTextObject(
              object
            )
          ) {

            return;

          }


          object.width =
            this.canvas.width *
            0.76;


          object.scaleX = 1;

          object.scaleY = 1;


          let guard = 0;


          while (
            object.fontSize >
              16 &&
            object.getScaledHeight() >
              this.canvas.height *
              0.42 &&
            guard <
              100
          ) {

            object.fontSize -=
              2;


            if (
              typeof object
                .initDimensions ===
              "function"
            ) {

              object.initDimensions();

            }


            guard++;

          }


          object.setCoords();

          this.canvas.requestRenderAll();

          this.updateSelectionInspector();

          this.commit();

        }
      );

  }


  bindTextRange(
    inputId,
    valueId,
    setter,
    formatter
  ) {

    const input =
      document.getElementById(
        inputId
      );


    if (!input) return;


    input.addEventListener(
      "input",
      () => {

        const object =
          this.getEditableSelection();


        if (
          !this.isTextObject(
            object
          )
        ) {

          return;

        }


        const value =
          Number(
            input.value
          );


        setter(
          object,
          value
        );


        this.setText(
          valueId,
          formatter(
            value
          )
        );


        object.setCoords();

        this.canvas.requestRenderAll();

        this.updateContextToolbar();

      }
    );


    input.addEventListener(
      "change",
      () => {

        this.commit();

      }
    );

  }


  /* ============================================================
     IMAGE INSPECTOR
  ============================================================ */

  bindImageInspector() {

    document
      .getElementById(
        "proCropImage"
      )
      ?.addEventListener(
        "click",
        () => {

          this.enterCropMode();

        }
      );


    document
      .getElementById(
        "proImageFit"
      )
      ?.addEventListener(
        "click",
        () => {

          this.fitSelectedImage(
            false
          );

        }
      );


    document
      .getElementById(
        "proImageFill"
      )
      ?.addEventListener(
        "click",
        () => {

          this.fitSelectedImage(
            true
          );

        }
      );


    document
      .getElementById(
        "proImageCenter"
      )
      ?.addEventListener(
        "click",
        () => {

          const image =
            this.getSelectedImage();


          if (!image) return;


          image.set({

            left:
              this.canvas.width /
              2,

            top:
              this.canvas.height /
              2,

            originX:
              "center",

            originY:
              "center"

          });


          image.setCoords();

          this.canvas.requestRenderAll();

          this.commit();

        }
      );


    document
      .querySelectorAll(
        "[data-mask]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              this.applyImageMask(
                button.dataset
                  .mask
              );

            }
          );

        }
      );

  }


  fitSelectedImage(fill) {

    const image =
      this.getSelectedImage();


    if (!image) return;


    const scaleX =
      this.canvas.width /
      image.width;


    const scaleY =
      this.canvas.height /
      image.height;


    const scale =
      fill
        ? Math.max(
            scaleX,
            scaleY
          )
        : Math.min(
            scaleX,
            scaleY
          );


    image.set({

      scaleX:
        scale,

      scaleY:
        scale,

      left:
        this.canvas.width /
        2,

      top:
        this.canvas.height /
        2,

      originX:
        "center",

      originY:
        "center",

      angle: 0

    });


    image.setCoords();

    this.canvas.requestRenderAll();

    this.updateSelectionInspector();

    this.commit();

  }


  applyImageMask(type) {

    const image =
      this.getSelectedImage();


    if (!image) return;


    if (
      type === "none"
    ) {

      image.clipPath =
        null;

    }


    if (
      type === "circle"
    ) {

      image.clipPath =
        new Circle({

          radius:
            Math.min(
              image.width,
              image.height
            ) /
            2,

          originX:
            "center",

          originY:
            "center",

          left: 0,

          top: 0

        });

    }


    if (
      type === "rounded"
    ) {

      image.clipPath =
        new Rect({

          width:
            image.width,

          height:
            image.height,

          rx:
            Math.min(
              image.width,
              image.height
            ) *
            0.08,

          ry:
            Math.min(
              image.width,
              image.height
            ) *
            0.08,

          originX:
            "center",

          originY:
            "center",

          left: 0,

          top: 0

        });

    }


    if (
      type === "portrait"
    ) {

      const width =
        Math.min(
          image.width,
          image.height *
          0.8
        );


      image.clipPath =
        new Rect({

          width,

          height:
            width *
            1.25,

          rx: 35,

          ry: 35,

          originX:
            "center",

          originY:
            "center",

          left: 0,

          top: 0

        });

    }


    image.setCoords();

    this.canvas.requestRenderAll();

    this.commit();

  }


  /* ============================================================
     CROP MODE
  ============================================================ */

  enterCropMode() {

    const image =
      this.getSelectedImage();


    if (!image) return;


    if (
      Math.abs(
        image.angle ||
        0
      ) >
      0.1
    ) {

      alert(
        "Set the photo rotation to 0° before cropping."
      );


      return;

    }


    this.cancelCropMode();


    const bounds =
      image.getBoundingRect();


    const width =
      Math.min(
        bounds.width *
        0.82,
        this.canvas.width *
        0.72
      );


    const height =
      Math.min(
        bounds.height *
        0.82,
        this.canvas.height *
        0.62
      );


    const frame =
      new Rect({

        left:
          bounds.left +
          bounds.width /
          2,

        top:
          bounds.top +
          bounds.height /
          2,

        width,

        height,

        originX:
          "center",

        originY:
          "center",

        fill:
          "rgba(0,0,0,0)",

        stroke:
          "#F0C34C",

        strokeWidth:
          4,

        strokeDashArray: [
          18,
          10
        ],

        cornerColor:
          "#F0C34C",

        borderColor:
          "#F0C34C",

        transparentCorners:
          false,

        selectable:
          true,

        evented:
          true

      });


    this.assignObjectMeta(
      frame,
      "Crop Frame",
      "ui",
      "ui"
    );


    frame.isUi =
      true;


    frame.isCropFrame =
      true;


    this.canvas.add(
      frame
    );


    this.moveObjectToIndex(
      frame,
      this.canvas
        .getObjects()
        .length -
      1
    );


    this.cropMode = {

      image,

      frame

    };


    this.canvas.setActiveObject(
      frame
    );


    document
      .getElementById(
        "posterCropToolbar"
      )
      ?.classList
      .remove(
        "hidden"
      );


    this.updateCropToolbarPosition();

    this.updateContextToolbar();

    this.canvas.requestRenderAll();

  }


  bindCropToolbar() {

    document
      .querySelectorAll(
        "[data-crop-action]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const action =
                button.dataset
                  .cropAction;


              if (
                action === "cancel"
              ) {

                this.cancelCropMode();

              }


              if (
                action === "apply"
              ) {

                this.applyCrop();

              }


              if (
                action === "frame"
              ) {

                const frame =
                  this.cropMode
                    ?.frame;


                if (!frame) return;


                frame.selectable =
                  true;


                frame.evented =
                  true;


                this.canvas.setActiveObject(
                  frame
                );


                this.canvas.requestRenderAll();

              }


              if (
                action === "image"
              ) {

                const image =
                  this.cropMode
                    ?.image;


                const frame =
                  this.cropMode
                    ?.frame;


                if (
                  !image ||
                  !frame
                ) {

                  return;

                }


                frame.selectable =
                  false;


                frame.evented =
                  false;


                this.canvas.setActiveObject(
                  image
                );


                this.canvas.requestRenderAll();

              }

            }
          );

        }
      );

  }


  applyCrop() {

    if (
      !this.cropMode
    ) {

      return;

    }


    const {
      image,
      frame
    } =
      this.cropMode;


    const imageBounds =
      image.getBoundingRect();


    const frameBounds =
      frame.getBoundingRect();


    const left =
      Math.max(
        imageBounds.left,
        frameBounds.left
      );


    const top =
      Math.max(
        imageBounds.top,
        frameBounds.top
      );


    const right =
      Math.min(
        imageBounds.left +
        imageBounds.width,
        frameBounds.left +
        frameBounds.width
      );


    const bottom =
      Math.min(
        imageBounds.top +
        imageBounds.height,
        frameBounds.top +
        frameBounds.height
      );


    if (
      right <=
        left ||
      bottom <=
        top
    ) {

      alert(
        "The crop frame must overlap the photo."
      );


      return;

    }


    const scaleX =
      Math.abs(
        image.scaleX ||
        1
      );


    const scaleY =
      Math.abs(
        image.scaleY ||
        1
      );


    const sourceX =
      Math.max(
        0,
        (
          left -
          imageBounds.left
        ) /
        scaleX
      );


    const sourceY =
      Math.max(
        0,
        (
          top -
          imageBounds.top
        ) /
        scaleY
      );


    const sourceWidth =
      Math.min(
        image.width -
        sourceX,
        (
          right -
          left
        ) /
        scaleX
      );


    const sourceHeight =
      Math.min(
        image.height -
        sourceY,
        (
          bottom -
          top
        ) /
        scaleY
      );


    image.cropX =
      (
        image.cropX ||
        0
      ) +
      sourceX;


    image.cropY =
      (
        image.cropY ||
        0
      ) +
      sourceY;


    image.width =
      sourceWidth;


    image.height =
      sourceHeight;


    image.set({

      left:
        left +
        (
          right -
          left
        ) /
        2,

      top:
        top +
        (
          bottom -
          top
        ) /
        2,

      originX:
        "center",

      originY:
        "center"

    });


    image.setCoords();


    this.canvas.remove(
      frame
    );


    this.cropMode =
      null;


    document
      .getElementById(
        "posterCropToolbar"
      )
      ?.classList
      .add(
        "hidden"
      );


    this.canvas.setActiveObject(
      image
    );


    this.canvas.requestRenderAll();

    this.updateSelectionInspector();

    this.updateContextToolbar();

    this.commit();

  }


  cancelCropMode() {

    if (
      !this.cropMode
    ) {

      return;

    }


    const {
      image,
      frame
    } =
      this.cropMode;


    if (frame) {

      this.canvas.remove(
        frame
      );

    }


    this.cropMode =
      null;


    document
      .getElementById(
        "posterCropToolbar"
      )
      ?.classList
      .add(
        "hidden"
      );


    if (image) {

      this.canvas.setActiveObject(
        image
      );

    }


    this.canvas.requestRenderAll();

  }


  updateCropToolbarPosition() {

    if (
      !this.cropMode
    ) {

      return;

    }


    const toolbar =
      document.getElementById(
        "posterCropToolbar"
      );


    const rect =
      this.canvas
        .lowerCanvasEl
        .getBoundingClientRect();


    if (
      !toolbar ||
      !rect
    ) {

      return;

    }


    toolbar.style.left =
      `${
        rect.left +
        rect.width /
        2
      }px`;


    toolbar.style.top =
      `${
        Math.max(
          8,
          rect.bottom -
          58
        )
      }px`;

  }


  /* ============================================================
     EFFECTS
  ============================================================ */

  bindEffectsInspector() {

    document
      .getElementById(
        "proBlendMode"
      )
      ?.addEventListener(
        "change",
        event => {

          const object =
            this.getEditableSelection();


          if (!object) return;


          object.globalCompositeOperation =
            event.target.value;


          this.canvas.requestRenderAll();

          this.commit();

        }
      );


    document
      .getElementById(
        "proShadowEnabled"
      )
      ?.addEventListener(
        "change",
        () => {

          this.updateSelectedShadow();

          this.commit();

        }
      );


    document
      .getElementById(
        "proShadowColor"
      )
      ?.addEventListener(
        "input",
        () => {

          this.updateSelectedShadow();

        }
      );


    document
      .getElementById(
        "proShadowBlur"
      )
      ?.addEventListener(
        "input",
        event => {

          this.setText(
            "proShadowBlurValue",
            event.target.value
          );


          this.updateSelectedShadow();

        }
      );


    document
      .getElementById(
        "proShadowBlur"
      )
      ?.addEventListener(
        "change",
        () => {

          this.commit();

        }
      );


    this.bindImageFilterSlider(
      "proImageBrightness",
      "filterBrightness"
    );


    this.bindImageFilterSlider(
      "proImageContrast",
      "filterContrast"
    );


    this.bindImageFilterSlider(
      "proImageSaturation",
      "filterSaturation"
    );


    this.bindImageFilterSlider(
      "proImageVibrance",
      "filterVibrance"
    );


    this.bindImageFilterSlider(
      "proImageBlur",
      "filterBlur"
    );


    this.bindImageFilterSlider(
      "proImageGrain",
      "filterGrain"
    );


    document
      .querySelectorAll(
        "[data-photo-preset]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              this.applyPhotoPreset(
                button.dataset
                  .photoPreset
              );

            }
          );

        }
      );


    document
      .getElementById(
        "proRemoveColorDistance"
      )
      ?.addEventListener(
        "input",
        event => {

          this.setText(
            "proRemoveColorDistanceValue",
            event.target.value
          );

        }
      );


    document
      .getElementById(
        "proApplyRemoveColor"
      )
      ?.addEventListener(
        "click",
        () => {

          const image =
            this.getSelectedImage();


          if (!image) return;


          image.removeColorEnabled =
            true;


          image.removeColor =
            document
              .getElementById(
                "proRemoveColor"
              )
              ?.value ||
            "#FFFFFF";


          image.removeColorDistance =
            Number(
              document
                .getElementById(
                  "proRemoveColorDistance"
                )
                ?.value ||
              20
            ) /
            100;


          this.applyImageFilters(
            image
          );


          this.commit();

        }
      );


    document
      .getElementById(
        "proFxBackground1"
      )
      ?.addEventListener(
        "input",
        event => {

          this.state.backgroundColor =
            event.target.value;


          this.syncBackgroundInputs();

          this.updateBackground();

        }
      );


    document
      .getElementById(
        "proFxBackground2"
      )
      ?.addEventListener(
        "input",
        event => {

          this.state.backgroundColor2 =
            event.target.value;


          this.syncBackgroundInputs();

          this.updateBackground();

        }
      );

  }


  bindImageFilterSlider(
    id,
    property
  ) {

    const input =
      document.getElementById(
        id
      );


    if (!input) return;


    input.addEventListener(
      "input",
      () => {

        const image =
          this.getSelectedImage();


        if (!image) return;


        image[property] =
          Number(
            input.value
          );


        this.setText(
          `${id}Value`,
          input.value
        );


        this.applyImageFilters(
          image
        );

      }
    );


    input.addEventListener(
      "change",
      () => {

        this.commit();

      }
    );

  }


  applyPhotoPreset(name) {

    const image =
      this.getSelectedImage();


    if (!image) return;


    const presets = {

      clean: {

        brightness: 0,

        contrast: 0,

        saturation: 0,

        vibrance: 0,

        blur: 0,

        grain: 0,

        grayscale: false,

        sepia: false

      },


      stadium: {

        brightness: 8,

        contrast: 24,

        saturation: 15,

        vibrance: 25,

        blur: 0,

        grain: 5,

        grayscale: false,

        sepia: false

      },


      night: {

        brightness: -8,

        contrast: 30,

        saturation: -8,

        vibrance: 12,

        blur: 0,

        grain: 10,

        grayscale: false,

        sepia: false

      },


      dramatic: {

        brightness: -4,

        contrast: 42,

        saturation: 6,

        vibrance: 30,

        blur: 0,

        grain: 15,

        grayscale: false,

        sepia: false

      },


      vintage: {

        brightness: 5,

        contrast: -4,

        saturation: -25,

        vibrance: -15,

        blur: 0,

        grain: 25,

        grayscale: false,

        sepia: true

      },


      bw: {

        brightness: 3,

        contrast: 25,

        saturation: -100,

        vibrance: 0,

        blur: 0,

        grain: 15,

        grayscale: true,

        sepia: false

      }

    };


    const preset =
      presets[name];


    if (!preset) return;


    image.filterBrightness =
      preset.brightness;


    image.filterContrast =
      preset.contrast;


    image.filterSaturation =
      preset.saturation;


    image.filterVibrance =
      preset.vibrance;


    image.filterBlur =
      preset.blur;


    image.filterGrain =
      preset.grain;


    image.filterGrayscale =
      preset.grayscale;


    image.filterSepia =
      preset.sepia;


    this.applyImageFilters(
      image
    );


    this.updateSelectionInspector();

    this.commit();

  }


  applyImageFilters(image) {

    const list = [];


    const brightness =
      Number(
        image.filterBrightness ||
        0
      );


    if (
      brightness !==
      0
    ) {

      list.push(

        new filters.Brightness({

          brightness:
            brightness /
            100

        })

      );

    }


    const contrast =
      Number(
        image.filterContrast ||
        0
      );


    if (
      contrast !==
      0
    ) {

      list.push(

        new filters.Contrast({

          contrast:
            contrast /
            100

        })

      );

    }


    const saturation =
      Number(
        image.filterSaturation ||
        0
      );


    if (
      saturation !==
      0
    ) {

      list.push(

        new filters.Saturation({

          saturation:
            saturation /
            100

        })

      );

    }


    const vibrance =
      Number(
        image.filterVibrance ||
        0
      );


    if (
      vibrance !==
        0 &&
      filters.Vibrance
    ) {

      list.push(

        new filters.Vibrance({

          vibrance:
            vibrance /
            100

        })

      );

    }


    const blur =
      Number(
        image.filterBlur ||
        0
      );


    if (
      blur >
      0
    ) {

      list.push(

        new filters.Blur({

          blur:
            blur /
            100

        })

      );

    }


    const grain =
      Number(
        image.filterGrain ||
        0
      );


    if (
      grain >
        0 &&
      filters.Noise
    ) {

      list.push(

        new filters.Noise({

          noise:
            Math.round(
              grain *
              2.5
            )

        })

      );

    }


    if (
      image.filterGrayscale
    ) {

      list.push(
        new filters.Grayscale()
      );

    }


    if (
      image.filterSepia
    ) {

      list.push(
        new filters.Sepia()
      );

    }


    if (
      image.removeColorEnabled
    ) {

      list.push(

        new filters.RemoveColor({

          color:
            image.removeColor ||
            "#FFFFFF",

          distance:
            image.removeColorDistance ||
            0.2

        })

      );

    }


    image.filters =
      list;


    image.applyFilters();

    this.canvas.requestRenderAll();

  }


  updateSelectedShadow() {

    const object =
      this.getEditableSelection();


    if (!object) return;


    const enabled =
      document
        .getElementById(
          "proShadowEnabled"
        )
        ?.checked;


    if (!enabled) {

      object.shadow =
        null;


      this.canvas.requestRenderAll();


      return;

    }


    object.shadow =
      new Shadow({

        color:
          document
            .getElementById(
              "proShadowColor"
            )
            ?.value ||
          "#000000",

        blur:
          Number(
            document
              .getElementById(
                "proShadowBlur"
              )
              ?.value ||
            25
          ),

        offsetX: 7,

        offsetY: 10

      });


    this.canvas.requestRenderAll();

  }


  /* ============================================================
     SHAPE INSPECTOR
  ============================================================ */

  bindShapeInspector() {

    document
      .getElementById(
        "proShapeFill"
      )
      ?.addEventListener(
        "input",
        event => {

          const object =
            this.getEditableSelection();


          if (
            !this.isShapeObject(
              object
            )
          ) {

            return;

          }


          object.fill =
            event.target.value;


          this.canvas.requestRenderAll();

        }
      );


    document
      .getElementById(
        "proShapeStroke"
      )
      ?.addEventListener(
        "input",
        event => {

          const object =
            this.getEditableSelection();


          if (
            !this.isShapeObject(
              object
            )
          ) {

            return;

          }


          object.stroke =
            event.target.value;


          this.canvas.requestRenderAll();

        }
      );


    document
      .getElementById(
        "proShapeStrokeWidth"
      )
      ?.addEventListener(
        "input",
        event => {

          const object =
            this.getEditableSelection();


          if (
            !this.isShapeObject(
              object
            )
          ) {

            return;

          }


          object.strokeWidth =
            Number(
              event.target.value
            );


          this.setText(
            "proShapeStrokeWidthValue",
            object.strokeWidth
          );


          this.canvas.requestRenderAll();

        }
      );


    [
      "proShapeFill",
      "proShapeStroke",
      "proShapeStrokeWidth"
    ]
      .forEach(
        id => {

          document
            .getElementById(
              id
            )
            ?.addEventListener(
              "change",
              () => {

                this.commit();

              }
            );

        }
      );

  }


  /* ============================================================
     CONTEXT TOOLBAR
  ============================================================ */

  bindContextToolbar() {

    document
      .querySelectorAll(
        "[data-context-action]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const action =
                button.dataset
                  .contextAction;


              if (
                action ===
                "duplicate"
              ) {

                this.duplicateSelected();

              }


              if (
                action ===
                "forward"
              ) {

                this.moveSelectedLayer(
                  1
                );

              }


              if (
                action ===
                "backward"
              ) {

                this.moveSelectedLayer(
                  -1
                );

              }


              if (
                action ===
                "center"
              ) {

                this.centerSelected(
                  "x"
                );

              }


              if (
                action ===
                "crop"
              ) {

                this.enterCropMode();

              }


              if (
                action ===
                "delete"
              ) {

                this.deleteSelected();

              }

            }
          );

        }
      );

  }


  updateContextToolbar() {

    const toolbar =
      document.getElementById(
        "posterContextToolbar"
      );


    if (!toolbar) return;


    const object =
      this.getEditableSelection();


    if (
      !object ||
      this.canvas.isDrawingMode ||
      this.cropMode
    ) {

      toolbar.classList.add(
        "hidden"
      );


      return;

    }


    toolbar.classList.remove(
      "hidden"
    );


    toolbar
      .querySelectorAll(
        ".context-image-only"
      )
      .forEach(
        button => {

          button.style.display =
            this.getSelectedImage()
              ? ""
              : "none";

        }
      );


    const bounds =
      object.getBoundingRect();


    const canvasRect =
      this.canvas
        .lowerCanvasEl
        .getBoundingClientRect();


    const ratioX =
      canvasRect.width /
      this.canvas.width;


    const ratioY =
      canvasRect.height /
      this.canvas.height;


    const x =
      canvasRect.left +
      (
        bounds.left +
        bounds.width /
        2
      ) *
      ratioX;


    const y =
      canvasRect.top +
      bounds.top *
      ratioY -
      48;


    toolbar.style.left =
      `${x}px`;


    toolbar.style.top =
      `${
        Math.max(
          8,
          y
        )
      }px`;

  }


  /* ============================================================
     EXACT TEMPLATE LIBRARY
  ============================================================ */

  async renderTemplates() {

    const grid =
      document.getElementById(
        "posterTemplateGrid"
      );


    if (!grid) return;


    const search =
      document
        .getElementById(
          "posterTemplateSearch"
        )
        ?.value
        ?.trim()
        ?.toLowerCase() ||
      "";


    const collectionFilters = [

      "rustic",

      "layered",

      "vintage",

      "editorial"

    ];


    const templates =
      POSTER_TEMPLATES.filter(
        template => {

          const filterOk =

            this.activeFilter ===
              "all" ||

            template.category ===
              this.activeFilter ||

            (
              collectionFilters.includes(
                this.activeFilter
              ) &&
              template.collection ===
                this.activeFilter
            );


          const haystack =
            [
              template.name,
              template.headline,
              template.kicker,
              template.subheadline,
              template.footer,
              template.category,
              template.collection,
              template.texture,
              template.templateStyle,
              template.decorativeStyle
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          return (
            filterOk &&
            (
              !search ||
              haystack.includes(
                search
              )
            )
          );

        }
      );


    this.setText(
      "posterTemplateCount",
      templates.length
    );


    if (
      this.templatePreviewObserver
    ) {

      this.templatePreviewObserver.disconnect();

      this.templatePreviewObserver =
        null;

    }


    this.templatePreviewRenderToken++;


    const token =
      this.templatePreviewRenderToken;


    const size =
      POSTER_SIZES[
        this.state.canvasSize
      ] ||
      POSTER_SIZES.portrait;


    grid.innerHTML =
      templates
        .map(
          template => {

            const active =
              this.state.template ===
              template.id
                ? "active"
                : "";


            const collection =
              (
                template.collection ||
                template.category ||
                "CRICKET"
              )
                .toUpperCase();


            return `

              <button
                class="poster-template-card ${active}"
                data-template-id="${template.id}"
                type="button"
                title="${this.escapeHtml(
                  template.name
                )}"
              >

                <div
                  class="poster-template-art exact-template-preview"
                  data-template-preview="${template.id}"
                  style="
                    aspect-ratio:
                    ${size.width}/${size.height};
                  "
                >

                  <div class="exact-preview-loading">

                    <span></span>

                    <small>
                      Rendering
                    </small>

                  </div>

                </div>


                <div class="poster-template-name">

                  <span>
                    ${this.escapeHtml(
                      template.name
                    )}
                  </span>

                  <small>
                    ${this.escapeHtml(
                      collection
                    )}
                  </small>

                </div>

              </button>

            `;

          }
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
            async () => {

              await this.applyTemplate(
                button.dataset
                  .templateId,
                true,
                true
              );

            }
          );

        }
      );


    const previews =
      Array.from(
        grid.querySelectorAll(
          "[data-template-preview]"
        )
      );


    const root =
      document.getElementById(
        "posterTemplatesPanel"
      );


    if (
      "IntersectionObserver" in
      window
    ) {

      this.templatePreviewObserver =
        new IntersectionObserver(
          entries => {

            entries.forEach(
              entry => {

                if (
                  !entry.isIntersecting
                ) {

                  return;

                }


                this.templatePreviewObserver
                  ?.unobserve(
                    entry.target
                  );


                this.enqueuePreview(
                  entry.target,
                  token
                );

              }
            );

          },
          {

            root:
              root ||
              null,

            rootMargin:
              "500px 0px 500px 0px",

            threshold:
              0.01

          }
        );


      previews.forEach(
        preview => {

          this.templatePreviewObserver.observe(
            preview
          );

        }
      );

    } else {

      previews.forEach(
        preview => {

          this.enqueuePreview(
            preview,
            token
          );

        }
      );

    }

  }


  enqueuePreview(
    element,
    token
  ) {

    this.previewQueue.push({

      element,

      token

    });


    this.processPreviewQueue();

  }


  processPreviewQueue() {

    while (
      this.previewWorkers <
        PREVIEW_CONCURRENCY &&
      this.previewQueue.length >
        0
    ) {

      const job =
        this.previewQueue.shift();


      this.previewWorkers++;


      this.loadExactTemplatePreview(
        job.element,
        job.token
      )
        .finally(
          () => {

            this.previewWorkers--;

            this.processPreviewQueue();

          }
        );

    }

  }


  async loadExactTemplatePreview(
    element,
    token
  ) {

    if (
      !element ||
      element.dataset
        .previewLoading ===
        "true"
    ) {

      return;

    }


    const templateId =
      element.dataset
        .templatePreview;


    const template =
      POSTER_TEMPLATES.find(
        item =>
          item.id ===
          templateId
      );


    if (!template) return;


    element.dataset.previewLoading =
      "true";


    try {

      const dataUrl =
        await this.getExactTemplatePreview(
          template
        );


      if (
        token !==
        this.templatePreviewRenderToken
      ) {

        return;

      }


      if (
        !element.isConnected
      ) {

        return;

      }


      element.style.backgroundImage =
        `url("${dataUrl}")`;


      element.classList.add(
        "preview-ready"
      );


      element
        .querySelector(
          ".exact-preview-loading"
        )
        ?.remove();


      element.dataset.previewLoaded =
        "true";

    } catch (error) {

      console.warn(
        "Template preview failed:",
        template.id,
        error
      );


      const loader =
        element.querySelector(
          ".exact-preview-loading"
        );


      if (loader) {

        loader.innerHTML = `

          <small>
            Preview unavailable
          </small>

        `;

      }

    } finally {

      element.dataset.previewLoading =
        "false";

    }

  }


  async getExactTemplatePreview(
    template
  ) {

    const cacheKey =
      [
        PREVIEW_CACHE_VERSION,
        template.id,
        this.state.canvasSize,
        this.state.brandName
      ]
        .join(
          "::"
        );


    if (
      this.templatePreviewCache.has(
        cacheKey
      )
    ) {

      return this.templatePreviewCache.get(
        cacheKey
      );

    }


    const persisted =
      await this.dbGet(
        "previews",
        cacheKey
      );


    if (persisted) {

      this.templatePreviewCache.set(
        cacheKey,
        persisted
      );


      return persisted;

    }


    const size =
      POSTER_SIZES[
        this.state.canvasSize
      ] ||
      POSTER_SIZES.portrait;


    const element =
      document.createElement(
        "canvas"
      );


    element.width =
      size.width;


    element.height =
      size.height;


    const preview =
      new Canvas(
        element,
        {

          width:
            size.width,

          height:
            size.height,

          selection:
            false,

          preserveObjectStacking:
            true,

          renderOnAddRemove:
            false

        }
      );


    try {

      await this.renderTemplateScene(
        preview,
        template,
        {

          interactive:
            false,

          clearCanvas:
            true,

          brandName:
            this.state.brandName

        }
      );


      preview.renderAll();


      const dataUrl =
        preview.toDataURL({

          format:
            "jpeg",

          quality:
            0.9,

          multiplier:
            0.25

        });


      this.templatePreviewCache.set(
        cacheKey,
        dataUrl
      );


      this.dbSet(
        "previews",
        cacheKey,
        dataUrl
      );


      return dataUrl;

    } finally {

      try {

        preview.dispose();

      } catch {

        /* ignore */

      }

    }

  }


  clearTemplatePreviewCache() {

    this.templatePreviewCache.clear();

    this.templatePreviewRenderToken++;

    this.previewQueue = [];


    if (
      this.templatePreviewObserver
    ) {

      this.templatePreviewObserver.disconnect();

      this.templatePreviewObserver =
        null;

    }

  }


  /* ============================================================
     APPLY TEMPLATE
  ============================================================ */

  async applyTemplate(
    templateId,
    save = true,
    preserveUserLayers = true
  ) {

    const template =
      POSTER_TEMPLATES.find(
        item =>
          item.id ===
          templateId
      );


    if (!template) return;


    this.restoring =
      true;


    this.setDrawingMode(
      false
    );


    this.cancelCropMode();


    try {

      if (
        preserveUserLayers
      ) {

        this.removeTemplateScopes();

      } else {

        this.canvas.clear();

      }


      this.state.template =
        template.id;


      this.state.accent =
        template.accent ||
        "#F0C34C";


      this.state.textColor =
        template.text ||
        "#FFFFFF";


      this.state.backgroundColor =
        template.background ||
        "#210B0E";


      this.state.backgroundColor2 =
        template.bg2 ||
        "#080A0D";


      this.state.backgroundAngle =
        template.backgroundAngle ??
        135;


      this.syncBrandInputs();


      await this.renderTemplateScene(
        this.canvas,
        template,
        {

          interactive:
            true,

          clearCanvas:
            false,

          brandName:
            this.state.brandName

        }
      );


      this.ensureSafeZone();

      this.normalizeLayerOrder();

      this.canvas.discardActiveObject();

      this.ensureBrandTop();

      this.canvas.requestRenderAll();

    } finally {

      this.restoring =
        false;

    }


    this.renderTemplates();

    this.renderLayers();

    this.updateSelectionInspector();

    this.updateContextToolbar();


    if (save) {

      this.commit();

    }

  }


  removeTemplateScopes() {

    const remove =
      this.canvas
        .getObjects()
        .filter(
          object =>

            object.layerScope ===
              "template" ||

            object.layerScope ===
              "brand" ||

            object.layerScope ===
              "ui" ||

            object.isBackground

        );


    remove.forEach(
      object => {

        this.canvas.remove(
          object
        );

      }
    );

  }


  /* ============================================================
     SHARED TEMPLATE RENDERER
  ============================================================ */

  async renderTemplateScene(
    targetCanvas,
    template,
    options = {}
  ) {

    const interactive =
      options.interactive !==
      false;


    const brandName =
      options.brandName ||
      "FWCWL";


    if (
      options.clearCanvas
    ) {

      targetCanvas.clear();

    }


    const backgroundColor =
      template.background ||
      "#210B0E";


    const backgroundColor2 =
      template.bg2 ||
      "#080A0D";


    const accent =
      template.accent ||
      "#F0C34C";


    const textColor =
      template.text ||
      "#FFFFFF";


    /* ========================================================
       BACKGROUND
    ======================================================== */

    const background =
      new Rect({

        left: 0,

        top: 0,

        width:
          targetCanvas.width,

        height:
          targetCanvas.height,

        originX:
          "left",

        originY:
          "top",

        fill:
          this.createTemplateGradient(
            targetCanvas,
            backgroundColor,
            backgroundColor2,
            template.backgroundAngle ??
            135
          ),

        selectable:
          false,

        evented:
          false

      });


    this.assignObjectMeta(
      background,
      "Canvas Background",
      "background",
      "template"
    );


    background.isBackground =
      true;


    targetCanvas.add(
      background
    );


    this.moveObjectToIndexOnCanvas(
      targetCanvas,
      background,
      0
    );


    /* ========================================================
       PROCEDURAL TEMPLATE EFFECTS
    ======================================================== */

    const beforeEffects =
      new Set(
        targetCanvas.getObjects()
      );


    const effectBridge = {

      canvas:
        targetCanvas,

      state: {

        ...this.state,

        backgroundColor,

        backgroundColor2,

        accent,

        textColor,

        brandName

      },

      moveObjectToIndex:
        (
          object,
          index
        ) => {

          this.moveObjectToIndexOnCanvas(
            targetCanvas,
            object,
            index
          );

        }

    };


    try {

      await applyTemplateEffects(
        effectBridge,
        template
      );

    } catch (error) {

      console.warn(
        "Template effects failed:",
        template.id,
        error
      );

    }


    targetCanvas
      .getObjects()
      .forEach(
        object => {

          if (
            !beforeEffects.has(
              object
            )
          ) {

            object.layerScope =
              "template";


            object.isTemplateDecoration =
              true;


            object.selectable =
              false;


            object.evented =
              false;

          }

        }
      );


    /* ========================================================
       LAYOUT
    ======================================================== */

    const layout =
      this.resolveTemplateLayout(
        template
      );


    const renderOptions = {

      canvas:
        targetCanvas,

      template,

      interactive,

      accent,

      textColor,

      brandName

    };


    switch (layout) {

      case "versus":

        this.renderVersusLayout(
          renderOptions
        );

        break;


      case "team":

        this.renderTeamLayout(
          renderOptions
        );

        break;


      case "score":

        this.renderScoreLayout(
          renderOptions
        );

        break;


      case "player":

        this.renderPlayerLayout(
          renderOptions
        );

        break;


      case "championship":

        this.renderChampionshipLayout(
          renderOptions
        );

        break;


      case "event":

        this.renderEventLayout(
          renderOptions
        );

        break;


      case "social":

        this.renderSocialLayout(
          renderOptions
        );

        break;


      default:

        this.renderMatchLayout(
          renderOptions
        );

        break;

    }


    await this.addOfficialLogoToCanvas(
      targetCanvas
    );


    targetCanvas.discardActiveObject();

    targetCanvas.requestRenderAll();

  }


  resolveTemplateLayout(template) {

    const id =
      String(
        template.id ||
        ""
      )
        .toLowerCase();


    if (
      id.includes(
        "versus"
      ) ||
      id.includes(
        "-vs"
      )
    ) {

      return "versus";

    }


    if (
      [
        "playingxi",
        "squad",
        "chalkboard-xi",
        "blueprint-squad",
        "tactical-lineup"
      ].includes(id) ||
      id.includes(
        "playing-xi"
      ) ||
      id.includes(
        "lineup"
      ) ||
      id.includes(
        "squad"
      )
    ) {

      return "team";

    }


    if (
      id.includes(
        "score"
      ) ||
      id.includes(
        "result"
      ) ||
      id ===
        "live" ||
      id.includes(
        "ink-result"
      ) ||
      id.includes(
        "vintage-scorecard"
      )
    ) {

      return "score";

    }


    /*
     * Player-related IDs all route through the
     * collision-safe Player layout.
     */

    if (
      id.includes(
        "player"
      ) ||
      id.includes(
        "captain"
      ) ||
      id.includes(
        "mvp"
      ) ||
      id.includes(
        "motm"
      ) ||
      id.includes(
        "man-of-the-match"
      ) ||
      id.includes(
        "player-of-the-match"
      )
    ) {

      return "player";

    }


    if (
      id.includes(
        "final"
      ) ||
      id.includes(
        "champion"
      ) ||
      id.includes(
        "dust-"
      ) ||
      id.includes(
        "black-gold"
      )
    ) {

      return "championship";

    }


    if (
      id.includes(
        "tournament"
      ) ||
      id.includes(
        "registration"
      ) ||
      id.includes(
        "tryout"
      ) ||
      id.includes(
        "auction"
      ) ||
      template.category ===
        "event"
    ) {

      return "event";

    }


    if (
      template.category ===
      "social"
    ) {

      return "social";

    }


    return "match";

  }


  /* ============================================================
     MATCH LAYOUT
  ============================================================ */

  renderMatchLayout({
    canvas,
    template,
    interactive,
    accent,
    textColor,
    brandName
  }) {

    const W =
      canvas.width;


    const H =
      canvas.height;


    const left =
      82;


    const y =
      H *
      (
        (
          template.contentY ??
          48
        ) /
        100
      );


    const stripe =
      new Rect({

        left:
          W *
          0.69,

        top:
          -120,

        width:
          155,

        height:
          H *
          0.82,

        angle:
          18,

        fill:
          accent,

        opacity:
          0.11,

        selectable:
          false,

        evented:
          false

      });


    this.markTemplateObject(
      stripe,
      "Match Accent"
    );


    canvas.add(
      stripe
    );


    this.addTemplateText(
      canvas,
      template.kicker ||
      "FWCWL • MATCH DAY",
      {

        left,

        top:
          y,

        width:
          W -
          164,

        fontFamily:
          "DM Sans",

        fontSize:
          25,

        fontWeight:
          800,

        fill:
          accent

      },
      "Eyebrow",
      interactive
    );


    const headline =
      this.addTemplateText(
        canvas,
        template.headline ||
        "MATCH DAY",
        {

          left,

          top:
            y +
            55,

          width:
            W *
            0.72,

          fontFamily:
            template.font ||
            "Montserrat",

          fontSize:
            template.headlineSize ||
            145,

          fontWeight:
            template.font ===
            "Bebas Neue"
              ? 400
              : 900,

          fill:
            textColor,

          lineHeight:
            0.87

        },
        "Headline",
        interactive
      );


    this.fitTextToHeight(
      headline,
      H *
      0.27,
      54
    );


    const detailTop =
      headline.top +
      headline.getScaledHeight() +
      42;


    this.addTemplateText(
      canvas,
      template.subheadline ||
      "Saturday • Tampa, Florida",
      {

        left,

        top:
          detailTop,

        width:
          W *
          0.7,

        fontFamily:
          "DM Sans",

        fontSize:
          27,

        fontWeight:
          600,

        fill:
          this.hexToRgba(
            textColor,
            0.82
          )

      },
      "Match Details",
      interactive
    );


    this.addTemplateCta(
      canvas,
      template.cta ||
      "MATCH DETAILS",
      accent,
      interactive,
      left,
      H *
      0.79
    );


    this.addTemplateFooter(
      canvas,
      template,
      brandName,
      textColor,
      interactive
    );

  }


  /* ============================================================
     VERSUS LAYOUT
  ============================================================ */

  renderVersusLayout({
    canvas,
    template,
    interactive,
    accent,
    textColor,
    brandName
  }) {

    const W =
      canvas.width;


    const H =
      canvas.height;


    const split =
      new Rect({

        left:
          W /
          2,

        top: 0,

        width:
          W /
          2,

        height:
          H,

        fill:
          template.accent2 ||
          "#7A1721",

        opacity:
          0.30,

        selectable:
          false,

        evented:
          false

      });


    this.markTemplateObject(
      split,
      "Versus Split"
    );


    canvas.add(
      split
    );


    const ring =
      new Circle({

        left:
          W /
          2,

        top:
          H *
          0.45,

        radius:
          Math.min(
            170,
            W *
            0.16
          ),

        originX:
          "center",

        originY:
          "center",

        fill:
          "rgba(0,0,0,0)",

        stroke:
          accent,

        strokeWidth:
          7,

        opacity:
          0.24,

        selectable:
          false,

        evented:
          false

      });


    this.markTemplateObject(
      ring,
      "Versus Ring"
    );


    canvas.add(
      ring
    );


    this.addTemplateText(
      canvas,
      template.kicker ||
      "THE SHOWDOWN",
      {

        left:
          82,

        top:
          H *
          0.22,

        width:
          W -
          164,

        textAlign:
          "center",

        fontFamily:
          "DM Sans",

        fontSize:
          25,

        fontWeight:
          900,

        fill:
          accent

      },
      "Eyebrow",
      interactive
    );


    const headline =
      this.addTemplateText(
        canvas,
        template.headline ||
        "TEAM A\nVS\nTEAM B",
        {

          left:
            82,

          top:
            H *
            0.31,

          width:
            W -
            164,

          textAlign:
            "center",

          fontFamily:
            template.font ||
            "Bebas Neue",

          fontSize:
            template.headlineSize ||
            150,

          fontWeight:
            900,

          lineHeight:
            0.82,

          fill:
            textColor

        },
        "Headline",
        interactive
      );


    this.fitTextToHeight(
      headline,
      H *
      0.30,
      54
    );


    const detailTop =
      headline.top +
      headline.getScaledHeight() +
      40;


    this.addTemplateText(
      canvas,
      template.subheadline ||
      "Two teams. One ground. One winner.",
      {

        left:
          170,

        top:
          detailTop,

        width:
          W -
          340,

        textAlign:
          "center",

        fontFamily:
          "DM Sans",

        fontSize:
          27,

        fontWeight:
          600,

        fill:
          this.hexToRgba(
            textColor,
            0.80
          )

      },
      "Match Details",
      interactive
    );


    this.addTemplateCta(
      canvas,
      template.cta ||
      "GAME ON",
      accent,
      interactive,
      W /
      2 -
      122,
      H *
      0.76
    );


    this.addTemplateFooter(
      canvas,
      template,
      brandName,
      textColor,
      interactive
    );

  }


  /* ============================================================
     PLAYING XI / SQUAD
  ============================================================ */

  renderTeamLayout({
    canvas,
    template,
    interactive,
    accent,
    textColor,
    brandName
  }) {

    const W =
      canvas.width;


    const H =
      canvas.height;


    this.addTemplateText(
      canvas,
      template.kicker ||
      "OFFICIAL TEAM SHEET",
      {

        left:
          82,

        top:
          H *
          0.205,

        width:
          W -
          164,

        fontFamily:
          "DM Sans",

        fontSize:
          24,

        fontWeight:
          900,

        fill:
          accent

      },
      "Eyebrow",
      interactive
    );


    const headline =
      this.addTemplateText(
        canvas,
        template.headline ||
        "PLAYING XI",
        {

          left:
            82,

          top:
            H *
            0.26,

          width:
            W *
            0.60,

          fontFamily:
            template.font ||
            "Montserrat",

          fontSize:
            template.headlineSize ||
            128,

          fontWeight:
            900,

          lineHeight:
            0.87,

          fill:
            textColor

        },
        "Headline",
        interactive
      );


    this.fitTextToHeight(
      headline,
      H *
      0.20,
      48
    );


    const cardStartY =
      Math.max(
        H *
        0.50,
        headline.top +
        headline.getScaledHeight() +
        70
      );


    const cardWidth =
      (
        W -
        164 -
        30
      ) /
      3;


    const cardHeight =
      68;


    for (
      let index = 0;
      index < 11;
      index++
    ) {

      const column =
        index %
        3;


      const row =
        Math.floor(
          index /
          3
        );


      const x =
        82 +
        column *
        (
          cardWidth +
          15
        );


      const y =
        cardStartY +
        row *
        82;


      const card =
        new Rect({

          left:
            x,

          top:
            y,

          width:
            cardWidth,

          height:
            cardHeight,

          rx:
            9,

          ry:
            9,

          fill:
            index ===
            0
              ? accent
              : "rgba(255,255,255,.055)",

          stroke:
            "rgba(255,255,255,.10)",

          strokeWidth:
            1,

          selectable:
            interactive,

          evented:
            interactive

        });


      this.assignObjectMeta(
        card,
        `Player ${index + 1} Card`,
        "shape",
        "template"
      );


      canvas.add(
        card
      );


      this.addTemplateText(
        canvas,
        `${
          String(
            index +
            1
          )
            .padStart(
              2,
              "0"
            )
        }  PLAYER ${index + 1}`,
        {

          left:
            x +
            14,

          top:
            y +
            21,

          width:
            cardWidth -
            28,

          fontFamily:
            "DM Sans",

          fontSize:
            17,

          fontWeight:
            800,

          fill:
            index ===
            0
              ? "#15120B"
              : textColor

        },
        `Player ${index + 1}`,
        interactive
      );

    }


    this.addTemplateFooter(
      canvas,
      template,
      brandName,
      textColor,
      interactive
    );

  }


  /* ============================================================
     SCORE / RESULT
  ============================================================ */

  renderScoreLayout({
    canvas,
    template,
    interactive,
    accent,
    textColor,
    brandName
  }) {

    const W =
      canvas.width;


    const H =
      canvas.height;


    const board =
      new Rect({

        left:
          75,

        top:
          H *
          0.29,

        width:
          W -
          150,

        height:
          H *
          0.39,

        rx:
          20,

        ry:
          20,

        fill:
          "rgba(0,0,0,.38)",

        stroke:
          this.hexToRgba(
            accent,
            0.45
          ),

        strokeWidth:
          2,

        selectable:
          interactive,

        evented:
          interactive

      });


    this.assignObjectMeta(
      board,
      "Scoreboard",
      "shape",
      "template"
    );


    canvas.add(
      board
    );


    this.addTemplateText(
      canvas,
      template.kicker ||
      "FINAL SCORE",
      {

        left:
          105,

        top:
          H *
          0.325,

        width:
          W -
          210,

        fontFamily:
          "DM Sans",

        fontSize:
          24,

        fontWeight:
          900,

        fill:
          accent

      },
      "Score Eyebrow",
      interactive
    );


    const score =
      this.addTemplateText(
        canvas,
        template.headline ||
        "186/5",
        {

          left:
            105,

          top:
            H *
            0.38,

          width:
            W -
            210,

          fontFamily:
            template.font ||
            "Bebas Neue",

          fontSize:
            template.headlineSize ||
            190,

          fontWeight:
            900,

          fill:
            textColor,

          lineHeight:
            0.86

        },
        "Headline",
        interactive
      );


    this.fitTextToHeight(
      score,
      H *
      0.18,
      60
    );


    const detailTop =
      Math.max(
        H *
        0.58,
        score.top +
        score.getScaledHeight() +
        32
      );


    this.addTemplateText(
      canvas,
      template.subheadline ||
      "20 Overs • Won by 24 Runs",
      {

        left:
          105,

        top:
          detailTop,

        width:
          W -
          210,

        fontFamily:
          "DM Sans",

        fontSize:
          28,

        fontWeight:
          700,

        fill:
          this.hexToRgba(
            textColor,
            0.80
          )

      },
      "Result",
      interactive
    );


    const line =
      new Rect({

        left:
          105,

        top:
          Math.min(
            H *
            0.65,
            H -
            220
          ),

        width:
          W -
          210,

        height:
          5,

        fill:
          accent,

        opacity:
          0.7,

        selectable:
          false,

        evented:
          false

      });


    this.markTemplateObject(
      line,
      "Score Accent"
    );


    canvas.add(
      line
    );


    this.addTemplateFooter(
      canvas,
      template,
      brandName,
      textColor,
      interactive
    );

  }


  /* ============================================================
     PLAYER FEATURE / MVP / PLAYER OF MATCH
     COLLISION-SAFE VERSION
  ============================================================ */

  renderPlayerLayout({
    canvas,
    template,
    interactive,
    accent,
    textColor,
    brandName
  }) {

    const W =
      canvas.width;


    const H =
      canvas.height;


    const left =
      82;


    /*
     * Separate the text column from the player image zone.
     *
     * This prevents "PLAYER OF THE MATCH" and similar long
     * headlines from colliding with the image placeholder.
     */

    const leftColumnWidth =
      W *
      0.47;


    const rightColumnLeft =
      W *
      0.61;


    const rightColumnWidth =
      W *
      0.31;


    /* ========================================================
       PHOTO ZONE
    ======================================================== */

    const photoTop =
      H *
      0.225;


    const photoHeight =
      H *
      0.43;


    const halo =
      new Circle({

        left:
          W *
          0.79,

        top:
          H *
          0.39,

        radius:
          Math.min(
            W *
            0.205,
            H *
            0.17
          ),

        originX:
          "center",

        originY:
          "center",

        fill:
          "rgba(0,0,0,0)",

        stroke:
          this.hexToRgba(
            accent,
            0.42
          ),

        strokeWidth:
          14,

        selectable:
          false,

        evented:
          false

      });


    this.markTemplateObject(
      halo,
      "Player Spotlight"
    );


    canvas.add(
      halo
    );


    const placeholder =
      new Rect({

        left:
          rightColumnLeft,

        top:
          photoTop,

        width:
          rightColumnWidth,

        height:
          photoHeight,

        rx:
          26,

        ry:
          26,

        fill:
          "rgba(255,255,255,.035)",

        stroke:
          "rgba(255,255,255,.11)",

        strokeWidth:
          2,

        selectable:
          false,

        evented:
          false

      });


    this.markTemplateObject(
      placeholder,
      "Player Photo Area"
    );


    canvas.add(
      placeholder
    );


    const cornerTop =
      new Rect({

        left:
          rightColumnLeft -
          14,

        top:
          photoTop -
          14,

        width:
          90,

        height:
          5,

        fill:
          accent,

        opacity:
          0.80,

        selectable:
          false,

        evented:
          false

      });


    this.markTemplateObject(
      cornerTop,
      "Player Frame Accent"
    );


    canvas.add(
      cornerTop
    );


    const cornerSide =
      new Rect({

        left:
          rightColumnLeft -
          14,

        top:
          photoTop -
          14,

        width:
          5,

        height:
          90,

        fill:
          accent,

        opacity:
          0.80,

        selectable:
          false,

        evented:
          false

      });


    this.markTemplateObject(
      cornerSide,
      "Player Frame Accent"
    );


    canvas.add(
      cornerSide
    );


    /* ========================================================
       EYEBROW
    ======================================================== */

    const eyebrowTop =
      H *
      0.285;


    this.addTemplateText(
      canvas,
      template.kicker ||
      "OUTSTANDING PERFORMANCE",
      {

        left,

        top:
          eyebrowTop,

        width:
          leftColumnWidth,

        fontFamily:
          "DM Sans",

        fontSize:
          24,

        fontWeight:
          900,

        fill:
          accent,

        lineHeight:
          1

      },
      "Eyebrow",
      interactive
    );


    /* ========================================================
       HEADLINE
    ======================================================== */

    const headlineTop =
      eyebrowTop +
      72;


    const headline =
      this.addTemplateText(
        canvas,
        template.headline ||
        "PLAYER OF THE MATCH",
        {

          left,

          top:
            headlineTop,

          width:
            leftColumnWidth,

          fontFamily:
            template.font ||
            "Montserrat",

          fontSize:
            Math.min(
              template.headlineSize ||
              112,
              112
            ),

          fontWeight:
            900,

          lineHeight:
            0.86,

          fill:
            textColor

        },
        "Headline",
        interactive
      );


    /*
     * Critical collision fix:
     *
     * Fit the headline according to its ACTUAL rendered height,
     * rather than placing the description at a fixed percentage.
     */

    this.fitTextToHeight(
      headline,
      H *
      0.285,
      52
    );


    const headlineBottom =
      headline.top +
      headline.getScaledHeight();


    /* ========================================================
       ACCENT RULE
    ======================================================== */

    const ruleTop =
      headlineBottom +
      27;


    const accentRule =
      new Rect({

        left,

        top:
          ruleTop,

        width:
          86,

        height:
          7,

        rx:
          3,

        ry:
          3,

        fill:
          accent,

        selectable:
          false,

        evented:
          false

      });


    this.markTemplateObject(
      accentRule,
      "Player Accent Rule"
    );


    canvas.add(
      accentRule
    );


    /* ========================================================
       DESCRIPTION
    ======================================================== */

    const detailTop =
      ruleTop +
      35;


    const details =
      this.addTemplateText(
        canvas,
        template.subheadline ||
        "A performance that changed the game.",
        {

          left,

          top:
            detailTop,

          width:
            leftColumnWidth,

          fontFamily:
            "DM Sans",

          fontSize:
            25,

          fontWeight:
            600,

          lineHeight:
            1.28,

          fill:
            this.hexToRgba(
              textColor,
              0.78
            )

        },
        "Player Detail",
        interactive
      );


    this.fitTextToHeight(
      details,
      H *
      0.115,
      16
    );


    const detailBottom =
      details.top +
      details.getScaledHeight();


    /* ========================================================
       AWARD STRIP
    ======================================================== */

    const statTop =
      Math.max(
        detailBottom +
        42,
        H *
        0.705
      );


    const safeStatTop =
      Math.min(
        statTop,
        H -
        235
      );


    const statPanel =
      new Rect({

        left,

        top:
          safeStatTop,

        width:
          leftColumnWidth,

        height:
          78,

        rx:
          12,

        ry:
          12,

        fill:
          "rgba(255,255,255,.045)",

        stroke:
          "rgba(255,255,255,.075)",

        strokeWidth:
          1,

        selectable:
          interactive,

        evented:
          interactive

      });


    this.assignObjectMeta(
      statPanel,
      "Player Stat Panel",
      "shape",
      "template"
    );


    canvas.add(
      statPanel
    );


    this.addTemplateText(
      canvas,
      "MATCH AWARD",
      {

        left:
          left +
          18,

        top:
          safeStatTop +
          15,

        width:
          leftColumnWidth -
          36,

        fontFamily:
          "DM Sans",

        fontSize:
          14,

        fontWeight:
          900,

        fill:
          this.hexToRgba(
            textColor,
            0.48
          )

      },
      "Award Label",
      interactive
    );


    this.addTemplateText(
      canvas,
      template.awardText ||
      "PLAYER OF THE MATCH",
      {

        left:
          left +
          18,

        top:
          safeStatTop +
          38,

        width:
          leftColumnWidth -
          36,

        fontFamily:
          "DM Sans",

        fontSize:
          18,

        fontWeight:
          900,

        fill:
          accent

      },
      "Award",
      interactive
    );


    /* ========================================================
       PLAYER NUMBER
    ======================================================== */

    this.addTemplateText(
      canvas,
      template.playerNumber ||
      "01",
      {

        left:
          rightColumnLeft -
          34,

        top:
          photoTop +
          photoHeight -
          105,

        width:
          145,

        fontFamily:
          "Bebas Neue",

        fontSize:
          110,

        fontWeight:
          400,

        fill:
          this.hexToRgba(
            accent,
            0.22
          )

      },
      "Player Number",
      interactive
    );


    this.addTemplateFooter(
      canvas,
      template,
      brandName,
      textColor,
      interactive
    );

  }


  /* ============================================================
     CHAMPIONSHIP / FINAL
  ============================================================ */

  renderChampionshipLayout({
    canvas,
    template,
    interactive,
    accent,
    textColor,
    brandName
  }) {

    const W =
      canvas.width;


    const H =
      canvas.height;


    const border =
      new Rect({

        left:
          42,

        top:
          42,

        width:
          W -
          84,

        height:
          H -
          84,

        fill:
          "rgba(0,0,0,0)",

        stroke:
          accent,

        strokeWidth:
          4,

        opacity:
          0.42,

        selectable:
          false,

        evented:
          false

      });


    this.markTemplateObject(
      border,
      "Championship Frame"
    );


    canvas.add(
      border
    );


    for (
      let index = 0;
      index < 8;
      index++
    ) {

      const ray =
        new Rect({

          left:
            W /
            2 +
            index *
            10,

          top:
            H *
            0.18,

          width:
            20,

          height:
            H *
            0.34,

          angle:
            -40 +
            index *
            12,

          originX:
            "center",

          fill:
            accent,

          opacity:
            0.08,

          selectable:
            false,

          evented:
            false

        });


      this.markTemplateObject(
        ray,
        `Championship Ray ${index + 1}`
      );


      canvas.add(
        ray
      );

    }


    this.addTemplateText(
      canvas,
      template.kicker ||
      "CHAMPIONSHIP",
      {

        left:
          82,

        top:
          H *
          0.27,

        width:
          W -
          164,

        textAlign:
          "center",

        fontFamily:
          "DM Sans",

        fontSize:
          25,

        fontWeight:
          900,

        fill:
          accent

      },
      "Eyebrow",
      interactive
    );


    const headline =
      this.addTemplateText(
        canvas,
        template.headline ||
        "THE FINAL",
        {

          left:
            82,

          top:
            H *
            0.34,

          width:
            W -
            164,

          textAlign:
            "center",

          fontFamily:
            template.font ||
            "Montserrat",

          fontSize:
            template.headlineSize ||
            155,

          fontWeight:
            900,

          lineHeight:
            0.86,

          fill:
            textColor

        },
        "Headline",
        interactive
      );


    this.fitTextToHeight(
      headline,
      H *
      0.24,
      54
    );


    const detailTop =
      headline.top +
      headline.getScaledHeight() +
      48;


    this.addTemplateText(
      canvas,
      template.subheadline ||
      "Where champions are made.",
      {

        left:
          160,

        top:
          detailTop,

        width:
          W -
          320,

        textAlign:
          "center",

        fontFamily:
          "Playfair Display",

        fontSize:
          29,

        fontWeight:
          700,

        fill:
          this.hexToRgba(
            textColor,
            0.80
          )

      },
      "Championship Detail",
      interactive
    );


    this.addTemplateCta(
      canvas,
      template.cta ||
      "CHAMPIONSHIP",
      accent,
      interactive,
      W /
      2 -
      122,
      H *
      0.73
    );


    this.addTemplateFooter(
      canvas,
      template,
      brandName,
      textColor,
      interactive
    );

  }


  /* ============================================================
     EVENT
  ============================================================ */

  renderEventLayout({
    canvas,
    template,
    interactive,
    accent,
    textColor,
    brandName
  }) {

    const W =
      canvas.width;


    const H =
      canvas.height;


    const ticket =
      new Rect({

        left:
          75,

        top:
          H *
          0.28,

        width:
          W -
          150,

        height:
          H *
          0.43,

        rx:
          22,

        ry:
          22,

        fill:
          "rgba(0,0,0,.24)",

        stroke:
          this.hexToRgba(
            accent,
            0.42
          ),

        strokeWidth:
          2,

        selectable:
          interactive,

        evented:
          interactive

      });


    this.assignObjectMeta(
      ticket,
      "Event Card",
      "shape",
      "template"
    );


    canvas.add(
      ticket
    );


    const perforation =
      new Line(
        [
          W *
          0.71,
          H *
          0.30,

          W *
          0.71,
          H *
          0.69
        ],
        {

          stroke:
            this.hexToRgba(
              textColor,
              0.28
            ),

          strokeWidth:
            2,

          strokeDashArray: [
            12,
            12
          ],

          selectable:
            false,

          evented:
            false

        }
      );


    this.markTemplateObject(
      perforation,
      "Ticket Perforation"
    );


    canvas.add(
      perforation
    );


    this.addTemplateText(
      canvas,
      template.kicker ||
      "FWCWL EVENT",
      {

        left:
          110,

        top:
          H *
          0.33,

        width:
          W *
          0.50,

        fontFamily:
          "DM Sans",

        fontSize:
          24,

        fontWeight:
          900,

        fill:
          accent

      },
      "Eyebrow",
      interactive
    );


    const headline =
      this.addTemplateText(
        canvas,
        template.headline ||
        "TOURNAMENT",
        {

          left:
            110,

          top:
            H *
            0.39,

          width:
            W *
            0.52,

          fontFamily:
            template.font ||
            "Montserrat",

          fontSize:
            template.headlineSize ||
            112,

          fontWeight:
            900,

          lineHeight:
            0.90,

          fill:
            textColor

        },
        "Headline",
        interactive
      );


    this.fitTextToHeight(
      headline,
      H *
      0.18,
      48
    );


    const detailTop =
      headline.top +
      headline.getScaledHeight() +
      38;


    this.addTemplateText(
      canvas,
      template.subheadline ||
      "Registration now open.",
      {

        left:
          110,

        top:
          detailTop,

        width:
          W *
          0.48,

        fontFamily:
          "DM Sans",

        fontSize:
          25,

        fontWeight:
          600,

        fill:
          this.hexToRgba(
            textColor,
            0.78
          )

      },
      "Event Detail",
      interactive
    );


    this.addTemplateCta(
      canvas,
      template.cta ||
      "REGISTER",
      accent,
      interactive,
      W *
      0.735,
      H *
      0.51,
      185
    );


    this.addTemplateFooter(
      canvas,
      template,
      brandName,
      textColor,
      interactive
    );

  }


  /* ============================================================
     SOCIAL / EDITORIAL
  ============================================================ */

  renderSocialLayout({
    canvas,
    template,
    interactive,
    accent,
    textColor,
    brandName
  }) {

    const W =
      canvas.width;


    const H =
      canvas.height;


    const vertical =
      new Rect({

        left:
          74,

        top:
          H *
          0.27,

        width:
          8,

        height:
          H *
          0.42,

        fill:
          accent,

        selectable:
          false,

        evented:
          false

      });


    this.markTemplateObject(
      vertical,
      "Editorial Accent"
    );


    canvas.add(
      vertical
    );


    this.addTemplateText(
      canvas,
      template.kicker ||
      "FWCWL STORIES",
      {

        left:
          112,

        top:
          H *
          0.28,

        width:
          W *
          0.68,

        fontFamily:
          "DM Sans",

        fontSize:
          24,

        fontWeight:
          900,

        fill:
          accent

      },
      "Eyebrow",
      interactive
    );


    const headline =
      this.addTemplateText(
        canvas,
        template.headline ||
        "CRICKET\nCULTURE",
        {

          left:
            112,

          top:
            H *
            0.35,

          width:
            W *
            0.70,

          fontFamily:
            template.font ||
            "Playfair Display",

          fontSize:
            template.headlineSize ||
            125,

          fontWeight:
            900,

          lineHeight:
            0.90,

          fill:
            textColor

        },
        "Headline",
        interactive
      );


    this.fitTextToHeight(
      headline,
      H *
      0.24,
      50
    );


    const detailTop =
      headline.top +
      headline.getScaledHeight() +
      38;


    this.addTemplateText(
      canvas,
      template.subheadline ||
      "Cricket. Community. Competition.",
      {

        left:
          112,

        top:
          detailTop,

        width:
          W *
          0.62,

        fontFamily:
          "DM Sans",

        fontSize:
          26,

        fontWeight:
          600,

        fill:
          this.hexToRgba(
            textColor,
            0.78
          )

      },
      "Social Detail",
      interactive
    );


    this.addTemplateFooter(
      canvas,
      template,
      brandName,
      textColor,
      interactive
    );

  }


  /* ============================================================
     DYNAMIC TEXT FITTING
  ============================================================ */

  fitTextToHeight(
    object,
    maximumHeight,
    minimumFontSize = 20
  ) {

    if (!object) return;


    let guard = 0;


    while (
      object.getScaledHeight() >
        maximumHeight &&
      object.fontSize >
        minimumFontSize &&
      guard <
        100
    ) {

      object.set({

        fontSize:
          object.fontSize -
          3

      });


      if (
        typeof object
          .initDimensions ===
        "function"
      ) {

        object.initDimensions();

      }


      object.setCoords();


      guard++;

    }

  }


  /* ============================================================
     TEMPLATE HELPERS
  ============================================================ */

  addTemplateText(
    canvas,
    text,
    options,
    name,
    interactive
  ) {

    const object =
      new Textbox(
        text,
        {

          left:
            options.left ??
            82,

          top:
            options.top ??
            200,

          width:
            options.width ??
            800,

          fontFamily:
            options.fontFamily ||
            "Montserrat",

          fontSize:
            options.fontSize ||
            80,

          fontWeight:
            options.fontWeight ||
            700,

          fill:
            options.fill ||
            "#FFFFFF",

          lineHeight:
            options.lineHeight ||
            1,

          textAlign:
            options.textAlign ||
            "left",

          originX:
            "left",

          originY:
            "top",

          selectable:
            interactive,

          evented:
            interactive,

          cornerColor:
            "#F0C34C",

          cornerStrokeColor:
            "#070809",

          borderColor:
            "#F0C34C",

          transparentCorners:
            false,

          cornerSize:
            16

        }
      );


    this.assignObjectMeta(
      object,
      name,
      "text",
      "template"
    );


    object.role =
      this.templateRoleForName(
        name
      );


    canvas.add(
      object
    );


    return object;

  }


  templateRoleForName(name) {

    const normalized =
      String(
        name
      )
        .toLowerCase();


    if (
      normalized.includes(
        "headline"
      )
    ) {

      return "templateHeadline";

    }


    if (
      normalized.includes(
        "eyebrow"
      )
    ) {

      return "templateEyebrow";

    }


    if (
      normalized.includes(
        "footer"
      )
    ) {

      return "templateFooter";

    }


    if (
      normalized ===
      "brand"
    ) {

      return "brandText";

    }


    return "templateText";

  }


  addTemplateCta(
    canvas,
    text,
    accent,
    interactive,
    left,
    top,
    width = 245
  ) {

    if (!text) return;


    const height =
      62;


    const rect =
      new Rect({

        left,

        top,

        width,

        height,

        fill:
          accent,

        rx:
          10,

        ry:
          10,

        selectable:
          interactive,

        evented:
          interactive

      });


    this.assignObjectMeta(
      rect,
      "CTA Background",
      "shape",
      "template"
    );


    rect.role =
      "templateCtaBackground";


    const label =
      new Textbox(
        String(
          text
        )
          .toUpperCase(),
        {

          left:
            left +
            15,

          top:
            top +
            18,

          width:
            width -
            30,

          fontFamily:
            "DM Sans",

          fontSize:
            19,

          fontWeight:
            900,

          fill:
            "#111111",

          textAlign:
            "center",

          selectable:
            interactive,

          evented:
            interactive

        }
      );


    this.assignObjectMeta(
      label,
      "CTA Text",
      "text",
      "template"
    );


    label.role =
      "templateCtaText";


    canvas.add(
      rect
    );


    canvas.add(
      label
    );

  }


  addTemplateFooter(
    canvas,
    template,
    brandName,
    textColor,
    interactive
  ) {

    this.addTemplateText(
      canvas,
      template.footer ||
      "FLORIDA WEST COAST WINTER LEAGUE",
      {

        left:
          82,

        top:
          canvas.height -
          105,

        width:
          canvas.width -
          164,

        fontFamily:
          "DM Sans",

        fontSize:
          19,

        fontWeight:
          700,

        fill:
          this.hexToRgba(
            textColor,
            0.68
          )

      },
      "Footer",
      interactive
    );


    this.addTemplateText(
      canvas,
      brandName,
      {

        left:
          canvas.width -
          280,

        top:
          canvas.height -
          105,

        width:
          200,

        textAlign:
          "right",

        fontFamily:
          "DM Sans",

        fontSize:
          19,

        fontWeight:
          900,

        fill:
          this.hexToRgba(
            textColor,
            0.72
          )

      },
      "Brand",
      interactive
    );

  }


  markTemplateObject(
    object,
    name,
    interactive = false
  ) {

    this.assignObjectMeta(
      object,
      name,
      "decoration",
      "template"
    );


    object.isTemplateDecoration =
      true;


    if (!interactive) {

      object.selectable =
        false;


      object.evented =
        false;

    }

  }


  /* ============================================================
     OFFICIAL LOGO
  ============================================================ */

  async addOfficialLogoToCanvas(
    canvas
  ) {

    try {

      const image =
        await FabricImage.fromURL(
          "assets/fwcwl-logo.jpeg"
        );


      const scale =
        Math.min(
          195 /
          image.width,
          130 /
          image.height
        );


      image.set({

        left:
          58,

        top:
          58,

        originX:
          "left",

        originY:
          "top",

        scaleX:
          scale,

        scaleY:
          scale,

        selectable:
          false,

        evented:
          false,

        hasControls:
          false,

        hasBorders:
          false,

        shadow:
          new Shadow({

            color:
              "rgba(0,0,0,.50)",

            blur:
              26,

            offsetX:
              0,

            offsetY:
              9

          })

      });


      this.assignObjectMeta(
        image,
        "Official FWCWL Logo",
        "brand",
        "brand"
      );


      image.role =
        "officialLogo";


      image.isBrand =
        true;


      canvas.add(
        image
      );


      this.moveObjectToIndexOnCanvas(
        canvas,
        image,
        canvas
          .getObjects()
          .length -
        1
      );

    } catch (error) {

      console.warn(
        "FWCWL logo failed to load:",
        error
      );


      const fallback =
        new Textbox(
          "FWCWL",
          {

            left:
              58,

            top:
              58,

            width:
              200,

            fontFamily:
              "Montserrat",

            fontSize:
              34,

            fontWeight:
              900,

            fill:
              "#F0C34C",

            selectable:
              false,

            evented:
              false

          }
        );


      this.assignObjectMeta(
        fallback,
        "Official FWCWL Logo",
        "brand",
        "brand"
      );


      fallback.role =
        "officialLogo";


      fallback.isBrand =
        true;


      canvas.add(
        fallback
      );

    }

  }


  /* ============================================================
     USER TEXT
  ============================================================ */

  addTextLayer() {

    const text =
      new Textbox(
        "YOUR TEXT",
        {

          left:
            this.canvas.width /
            2,

          top:
            this.canvas.height /
            2,

          width:
            this.canvas.width *
            0.64,

          originX:
            "center",

          originY:
            "center",

          fontFamily:
            "Montserrat",

          fontSize:
            88,

          fontWeight:
            900,

          fill:
            "#FFFFFF",

          textAlign:
            "center",

          cornerColor:
            "#F0C34C",

          cornerStrokeColor:
            "#060708",

          borderColor:
            "#F0C34C",

          transparentCorners:
            false,

          cornerSize:
            16

        }
      );


    this.assignObjectMeta(
      text,
      "Custom Text",
      "text",
      "user"
    );


    this.canvas.add(
      text
    );


    this.canvas.setActiveObject(
      text
    );


    this.ensureBrandTop();

    this.canvas.requestRenderAll();

    this.switchInspectorTab(
      "edit"
    );

    this.updateSelectionInspector();

    this.renderLayers();

    this.commit();

  }


  /* ============================================================
     PHOTOS
  ============================================================ */

  async addPhotoFile(file) {

    const data =
      await this.fileToDataUrl(
        file
      );


    const image =
      await FabricImage.fromURL(
        data
      );


    this.initializeImageObject(
      image,
      file.name
    );


    const scale =
      Math.min(

        (
          this.canvas.width *
          0.64
        ) /
        image.width,

        (
          this.canvas.height *
          0.64
        ) /
        image.height

      );


    image.set({

      left:
        this.canvas.width /
        2,

      top:
        this.canvas.height /
        2,

      originX:
        "center",

      originY:
        "center",

      scaleX:
        scale,

      scaleY:
        scale

    });


    this.canvas.add(
      image
    );


    this.canvas.setActiveObject(
      image
    );


    this.ensureBrandTop();

    this.canvas.requestRenderAll();

    this.switchInspectorTab(
      "edit"
    );

    this.renderLayers();

    this.updateSelectionInspector();

    this.commit();

  }


  async addBackgroundPhoto(
    file
  ) {

    const existing =
      this.canvas
        .getObjects()
        .find(
          object =>
            object.role ===
            "backgroundPhoto"
        );


    if (existing) {

      this.canvas.remove(
        existing
      );

    }


    const data =
      await this.fileToDataUrl(
        file
      );


    const image =
      await FabricImage.fromURL(
        data
      );


    this.initializeImageObject(
      image,
      "Background Photo"
    );


    image.role =
      "backgroundPhoto";


    const scale =
      Math.max(

        this.canvas.width /
        image.width,

        this.canvas.height /
        image.height

      );


    image.set({

      left:
        this.canvas.width /
        2,

      top:
        this.canvas.height /
        2,

      originX:
        "center",

      originY:
        "center",

      scaleX:
        scale,

      scaleY:
        scale

    });


    this.canvas.add(
      image
    );


    this.moveObjectToIndex(
      image,
      1
    );


    this.canvas.setActiveObject(
      image
    );


    this.canvas.requestRenderAll();

    this.renderLayers();

    this.updateSelectionInspector();

    this.commit();

  }


  async addSponsorLogo(
    file
  ) {

    const data =
      await this.fileToDataUrl(
        file
      );


    const image =
      await FabricImage.fromURL(
        data
      );


    this.initializeImageObject(
      image,
      file.name ||
      "Sponsor Logo"
    );


    image.role =
      "sponsorLogo";


    const scale =
      Math.min(

        220 /
        image.width,

        115 /
        image.height

      );


    image.set({

      left:
        this.canvas.width -
        65,

      top:
        65,

      originX:
        "right",

      originY:
        "top",

      scaleX:
        scale,

      scaleY:
        scale

    });


    this.canvas.add(
      image
    );


    this.canvas.setActiveObject(
      image
    );


    this.ensureBrandTop();

    this.canvas.requestRenderAll();

    this.renderLayers();

    this.updateSelectionInspector();

    this.commit();

  }


  initializeImageObject(
    image,
    name
  ) {

    this.assignObjectMeta(
      image,
      name,
      "image",
      "user"
    );


    image.set({

      cornerColor:
        "#F0C34C",

      cornerStrokeColor:
        "#060708",

      borderColor:
        "#F0C34C",

      transparentCorners:
        false,

      cornerSize:
        16

    });


    image.filterBrightness =
      0;


    image.filterContrast =
      0;


    image.filterSaturation =
      0;


    image.filterVibrance =
      0;


    image.filterBlur =
      0;


    image.filterGrain =
      0;


    image.filterGrayscale =
      false;


    image.filterSepia =
      false;


    image.removeColorEnabled =
      false;

  }


  /* ============================================================
     CRICKET ELEMENTS
  ============================================================ */

  addCricketElement(type) {

    let group =
      null;


    switch (type) {

      case "ball":

        group =
          this.createCricketBall();

        break;


      case "bat":

        group =
          this.createCricketBat();

        break;


      case "wickets":

        group =
          this.createWickets();

        break;


      case "score":

        group =
          this.createScoreGraphic();

        break;


      case "live":

        group =
          this.createLiveBadge();

        break;


      case "versus":

        group =
          this.createVersusBadge();

        break;


      case "playercard":

        group =
          this.createPlayerCard();

        break;


      case "trophy":

        group =
          this.createTrophy();

        break;

    }


    if (!group) return;


    this.assignObjectMeta(
      group,
      this.cricketElementName(
        type
      ),
      "element",
      "user"
    );


    group.set({

      left:
        this.canvas.width /
        2,

      top:
        this.canvas.height /
        2,

      originX:
        "center",

      originY:
        "center",

      cornerColor:
        "#F0C34C",

      borderColor:
        "#F0C34C",

      transparentCorners:
        false

    });


    this.canvas.add(
      group
    );


    this.canvas.setActiveObject(
      group
    );


    this.ensureBrandTop();

    this.canvas.requestRenderAll();

    this.renderLayers();

    this.updateSelectionInspector();

    this.commit();

  }


  cricketElementName(type) {

    const names = {

      ball:
        "Cricket Ball",

      bat:
        "Cricket Bat",

      wickets:
        "Wickets",

      score:
        "Score Graphic",

      live:
        "LIVE Badge",

      versus:
        "VS Badge",

      playercard:
        "Player Card",

      trophy:
        "Trophy"

    };


    return names[type] ||
      "Cricket Element";

  }


  createCricketBall() {

    const ball =
      new Circle({

        radius:
          72,

        fill:
          "#A51F2D",

        stroke:
          "#E6BFC3",

        strokeWidth:
          4

      });


    const seam1 =
      new Line(
        [
          -10,
          -65,
          10,
          65
        ],
        {

          stroke:
            "#F2DFDF",

          strokeWidth:
            4

        }
      );


    const seam2 =
      new Line(
        [
          2,
          -65,
          22,
          65
        ],
        {

          stroke:
            "#F2DFDF",

          strokeWidth:
            2

        }
      );


    return new Group(
      [
        ball,
        seam1,
        seam2
      ]
    );

  }


  createCricketBat() {

    const blade =
      new Rect({

        left:
          -45,

        top:
          -85,

        width:
          90,

        height:
          240,

        rx:
          18,

        ry:
          18,

        fill:
          "#D6B274",

        stroke:
          "#8A6A3F",

        strokeWidth:
          4

      });


    const handle =
      new Rect({

        left:
          -16,

        top:
          -185,

        width:
          32,

        height:
          115,

        rx:
          8,

        ry:
          8,

        fill:
          "#242424"

      });


    const grip1 =
      new Rect({

        left:
          -18,

        top:
          -170,

        width:
          36,

        height:
          8,

        fill:
          "#F0C34C"

      });


    const grip2 =
      new Rect({

        left:
          -18,

        top:
          -142,

        width:
          36,

        height:
          8,

        fill:
          "#F0C34C"

      });


    return new Group(
      [
        blade,
        handle,
        grip1,
        grip2
      ]
    );

  }


  createWickets() {

    const objects = [];


    [
      -55,
      0,
      55
    ]
      .forEach(
        x => {

          objects.push(

            new Rect({

              left:
                x -
                8,

              top:
                -120,

              width:
                16,

              height:
                240,

              rx:
                5,

              ry:
                5,

              fill:
                "#F2E8C9"

            })

          );

        }
      );


    objects.push(

      new Rect({

        left:
          -68,

        top:
          -128,

        width:
          65,

        height:
          12,

        rx:
          5,

        ry:
          5,

        fill:
          "#F0C34C"

      })

    );


    objects.push(

      new Rect({

        left:
          3,

        top:
          -128,

        width:
          65,

        height:
          12,

        rx:
          5,

        ry:
          5,

        fill:
          "#F0C34C"

      })

    );


    return new Group(
      objects
    );

  }


  createScoreGraphic() {

    const panel =
      new Rect({

        left:
          -210,

        top:
          -75,

        width:
          420,

        height:
          150,

        rx:
          18,

        ry:
          18,

        fill:
          "#121417",

        stroke:
          "#F0C34C",

        strokeWidth:
          3

      });


    const score =
      new Textbox(
        "186 / 5",
        {

          left:
            -170,

          top:
            -40,

          width:
            340,

          textAlign:
            "center",

          fontFamily:
            "Bebas Neue",

          fontSize:
            72,

          fill:
            "#FFFFFF"

        }
      );


    const overs =
      new Textbox(
        "20 OVERS",
        {

          left:
            -170,

          top:
            30,

          width:
            340,

          textAlign:
            "center",

          fontFamily:
            "DM Sans",

          fontSize:
            18,

          fontWeight:
            800,

          fill:
            "#F0C34C"

        }
      );


    return new Group(
      [
        panel,
        score,
        overs
      ]
    );

  }


  createLiveBadge() {

    const panel =
      new Rect({

        left:
          -100,

        top:
          -35,

        width:
          200,

        height:
          70,

        rx:
          35,

        ry:
          35,

        fill:
          "#C62835"

      });


    const dot =
      new Circle({

        left:
          -72,

        top:
          -8,

        radius:
          9,

        fill:
          "#FFFFFF"

      });


    const label =
      new Textbox(
        "LIVE",
        {

          left:
            -40,

          top:
            -17,

          width:
            120,

          fontFamily:
            "DM Sans",

          fontSize:
            28,

          fontWeight:
            900,

          fill:
            "#FFFFFF"

        }
      );


    return new Group(
      [
        panel,
        dot,
        label
      ]
    );

  }


  createVersusBadge() {

    const ring =
      new Circle({

        radius:
          95,

        fill:
          "#101214",

        stroke:
          "#F0C34C",

        strokeWidth:
          8

      });


    const text =
      new Textbox(
        "VS",
        {

          left:
            -72,

          top:
            -42,

          width:
            144,

          textAlign:
            "center",

          fontFamily:
            "Bebas Neue",

          fontSize:
            90,

          fill:
            "#FFFFFF"

        }
      );


    return new Group(
      [
        ring,
        text
      ]
    );

  }


  createPlayerCard() {

    const card =
      new Rect({

        left:
          -150,

        top:
          -220,

        width:
          300,

        height:
          440,

        rx:
          24,

        ry:
          24,

        fill:
          "#121518",

        stroke:
          "#F0C34C",

        strokeWidth:
          3

      });


    const photo =
      new Rect({

        left:
          -125,

        top:
          -190,

        width:
          250,

        height:
          260,

        rx:
          16,

        ry:
          16,

        fill:
          "rgba(255,255,255,.07)"

      });


    const number =
      new Textbox(
        "07",
        {

          left:
            -125,

          top:
            85,

          width:
            70,

          fontFamily:
            "Bebas Neue",

          fontSize:
            70,

          fill:
            "#F0C34C"

        }
      );


    const name =
      new Textbox(
        "PLAYER NAME",
        {

          left:
            -45,

          top:
            105,

          width:
            160,

          fontFamily:
            "Montserrat",

          fontSize:
            23,

          fontWeight:
            900,

          fill:
            "#FFFFFF"

        }
      );


    const role =
      new Textbox(
        "ALL ROUNDER",
        {

          left:
            -45,

          top:
            145,

          width:
            160,

          fontFamily:
            "DM Sans",

          fontSize:
            15,

          fontWeight:
            700,

          fill:
            "rgba(255,255,255,.58)"

        }
      );


    return new Group(
      [
        card,
        photo,
        number,
        name,
        role
      ]
    );

  }


  createTrophy() {

    const cup =
      new Rect({

        left:
          -65,

        top:
          -100,

        width:
          130,

        height:
          125,

        rx:
          38,

        ry:
          38,

        fill:
          "#F0C34C"

      });


    const stem =
      new Rect({

        left:
          -16,

        top:
          15,

        width:
          32,

        height:
          80,

        fill:
          "#F0C34C"

      });


    const base =
      new Rect({

        left:
          -80,

        top:
          85,

        width:
          160,

        height:
          35,

        rx:
          9,

        ry:
          9,

        fill:
          "#BE8F20"

      });


    const handleLeft =
      new Circle({

        left:
          -105,

        top:
          -72,

        radius:
          45,

        fill:
          "rgba(0,0,0,0)",

        stroke:
          "#F0C34C",

        strokeWidth:
          15

      });


    const handleRight =
      new Circle({

        left:
          15,

        top:
          -72,

        radius:
          45,

        fill:
          "rgba(0,0,0,0)",

        stroke:
          "#F0C34C",

        strokeWidth:
          15

      });


    return new Group(
      [
        handleLeft,
        handleRight,
        cup,
        stem,
        base
      ]
    );

  }


  /* ============================================================
     SHAPES
  ============================================================ */

  addShape(type) {

    let object =
      null;


    if (
      type === "rect"
    ) {

      object =
        new Rect({

          width:
            360,

          height:
            220,

          rx:
            26,

          ry:
            26,

          fill:
            this.state.accent

        });

    }


    if (
      type === "circle"
    ) {

      object =
        new Circle({

          radius:
            150,

          fill:
            this.state.accent

        });

    }


    if (
      type === "triangle"
    ) {

      object =
        new Triangle({

          width:
            310,

          height:
            290,

          fill:
            this.state.accent

        });

    }


    if (
      type === "line"
    ) {

      object =
        new Line(
          [
            0,
            0,
            400,
            0
          ],
          {

            stroke:
              this.state.accent,

            strokeWidth:
              16

          }
        );

    }


    if (
      type === "badge"
    ) {

      object =
        new Circle({

          radius:
            145,

          fill:
            this.state.accent,

          stroke:
            "#FFFFFF",

          strokeWidth:
            7

        });

    }


    if (!object) return;


    object.set({

      left:
        this.canvas.width /
        2,

      top:
        this.canvas.height /
        2,

      originX:
        "center",

      originY:
        "center",

      cornerColor:
        "#F0C34C",

      borderColor:
        "#F0C34C",

      transparentCorners:
        false

    });


    this.assignObjectMeta(
      object,
      "Shape",
      "shape",
      "user"
    );


    this.canvas.add(
      object
    );


    this.canvas.setActiveObject(
      object
    );


    this.ensureBrandTop();

    this.canvas.requestRenderAll();

    this.renderLayers();

    this.updateSelectionInspector();

    this.commit();

  }


  /* ============================================================
     SMART GUIDES
  ============================================================ */

  applySmartGuides(object) {

    if (
      !this.state.snap ||
      !object ||
      object.isUi
    ) {

      return;

    }


    this.clearSmartGuides();


    const tolerance =
      10;


    const bounds =
      object.getBoundingRect();


    const center =
      object.getCenterPoint();


    const canvasCenterX =
      this.canvas.width /
      2;


    const canvasCenterY =
      this.canvas.height /
      2;


    let snappedX =
      false;


    let snappedY =
      false;


    if (
      Math.abs(
        center.x -
        canvasCenterX
      ) <=
      tolerance
    ) {

      object.left +=
        canvasCenterX -
        center.x;


      snappedX =
        true;


      this.addGuideLine(
        canvasCenterX,
        0,
        canvasCenterX,
        this.canvas.height
      );

    }


    if (
      Math.abs(
        center.y -
        canvasCenterY
      ) <=
      tolerance
    ) {

      object.top +=
        canvasCenterY -
        center.y;


      snappedY =
        true;


      this.addGuideLine(
        0,
        canvasCenterY,
        this.canvas.width,
        canvasCenterY
      );

    }


    const verticalMargins = [

      72,

      this.canvas.width -
      72

    ];


    verticalMargins.forEach(
      x => {

        if (
          Math.abs(
            bounds.left -
            x
          ) <=
          tolerance
        ) {

          object.left +=
            x -
            bounds.left;


          this.addGuideLine(
            x,
            0,
            x,
            this.canvas.height
          );

        }


        if (
          Math.abs(
            bounds.left +
            bounds.width -
            x
          ) <=
          tolerance
        ) {

          object.left +=
            x -
            (
              bounds.left +
              bounds.width
            );


          this.addGuideLine(
            x,
            0,
            x,
            this.canvas.height
          );

        }

      }
    );


    const candidates =
      this.canvas
        .getObjects()
        .filter(
          candidate =>

            candidate !==
              object &&

            !candidate.isUi &&

            !candidate.isBackground &&

            candidate.visible !==
              false

        );


    for (
      const candidate of
      candidates
    ) {

      const candidateCenter =
        candidate.getCenterPoint();


      if (
        !snappedX &&
        Math.abs(
          center.x -
          candidateCenter.x
        ) <=
        tolerance
      ) {

        object.left +=
          candidateCenter.x -
          center.x;


        snappedX =
          true;


        this.addGuideLine(
          candidateCenter.x,
          0,
          candidateCenter.x,
          this.canvas.height
        );

      }


      if (
        !snappedY &&
        Math.abs(
          center.y -
          candidateCenter.y
        ) <=
        tolerance
      ) {

        object.top +=
          candidateCenter.y -
          center.y;


        snappedY =
          true;


        this.addGuideLine(
          0,
          candidateCenter.y,
          this.canvas.width,
          candidateCenter.y
        );

      }

    }

  }


  addGuideLine(
    x1,
    y1,
    x2,
    y2
  ) {

    const line =
      new Line(
        [
          x1,
          y1,
          x2,
          y2
        ],
        {

          stroke:
            "#F0C34C",

          strokeWidth:
            2,

          strokeDashArray: [
            8,
            8
          ],

          selectable:
            false,

          evented:
            false,

          opacity:
            0.72

        }
      );


    this.assignObjectMeta(
      line,
      "Smart Guide",
      "ui",
      "ui"
    );


    line.isUi =
      true;


    this.canvas.add(
      line
    );


    this.guideObjects.push(
      line
    );


    this.moveObjectToIndex(
      line,
      this.canvas
        .getObjects()
        .length -
      1
    );

  }


  clearSmartGuides() {

    this.guideObjects
      .forEach(
        guide => {

          this.canvas.remove(
            guide
          );

        }
      );


    this.guideObjects = [];

  }


  /* ============================================================
     LAYERS
  ============================================================ */

  renderLayers() {

    const list =
      document.getElementById(
        "proLayerList"
      );


    if (!list) return;


    const objects =
      this.canvas
        .getObjects()
        .filter(
          object =>

            !object.isUi &&

            !object.isBackground

        )
        .slice()
        .reverse();


    this.setText(
      "proLayerCount",
      objects.length
    );


    const active =
      this.canvas.getActiveObject();


    if (
      !objects.length
    ) {

      list.innerHTML = `

        <div class="pro-no-selection">
          No layers.
        </div>

      `;


      return;

    }


    list.innerHTML =
      objects
        .map(
          object => {

            const selected =
              active ===
              object
                ? "active"
                : "";


            const locked =
              object.selectable ===
              false;


            return `

              <div
                class="pro-layer-row ${selected}"
                data-layer-row="${object.id}"
                draggable="${
                  object.layerScope !==
                  "brand"
                }"
              >

                <button
                  class="layer-visible-btn"
                  data-layer-visibility="${object.id}"
                  type="button"
                  ${
                    object.layerScope ===
                    "brand"
                      ? "disabled"
                      : ""
                  }
                >
                  ${
                    object.visible ===
                    false
                      ? "○"
                      : "◉"
                  }
                </button>


                <button
                  class="layer-main-btn"
                  data-layer-select="${object.id}"
                  type="button"
                >

                  <span class="layer-type-icon">
                    ${this.getLayerIcon(
                      object
                    )}
                  </span>


                  <span>

                    <strong>
                      ${this.escapeHtml(
                        object.name ||
                        "Layer"
                      )}
                    </strong>

                    <small>
                      ${
                        object.layerScope ===
                        "template"
                          ? "TEMPLATE · "
                          : ""
                      }${this.escapeHtml(
                        object.typeLabel ||
                        object.editorType ||
                        object.type ||
                        "layer"
                      )}
                    </small>

                  </span>

                </button>


                <button
                  class="layer-lock-btn"
                  data-layer-lock="${object.id}"
                  type="button"
                  ${
                    object.layerScope ===
                    "brand"
                      ? "disabled"
                      : ""
                  }
                >
                  ${
                    locked
                      ? "🔒"
                      : "◌"
                  }
                </button>

              </div>

            `;

          }
        )
        .join("");


    list
      .querySelectorAll(
        "[data-layer-select]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const object =
                this.findObjectById(
                  button.dataset
                    .layerSelect
                );


              if (
                !object ||
                object.layerScope ===
                  "brand" ||
                object.selectable ===
                  false
              ) {

                return;

              }


              if (
                object.visible ===
                false
              ) {

                object.visible =
                  true;

              }


              this.canvas.setActiveObject(
                object
              );


              this.canvas.requestRenderAll();

              this.switchInspectorTab(
                "edit"
              );

              this.onSelectionChanged();

            }
          );

        }
      );


    list
      .querySelectorAll(
        "[data-layer-visibility]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const object =
                this.findObjectById(
                  button.dataset
                    .layerVisibility
                );


              if (
                !object ||
                object.layerScope ===
                "brand"
              ) {

                return;

              }


              object.visible =
                object.visible ===
                false;


              if (
                object.visible ===
                  false &&
                this.canvas
                  .getActiveObject() ===
                  object
              ) {

                this.canvas.discardActiveObject();

              }


              this.canvas.requestRenderAll();

              this.renderLayers();

              this.updateSelectionInspector();

              this.commit();

            }
          );

        }
      );


    list
      .querySelectorAll(
        "[data-layer-lock]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const object =
                this.findObjectById(
                  button.dataset
                    .layerLock
                );


              if (
                !object ||
                object.layerScope ===
                "brand"
              ) {

                return;

              }


              this.toggleObjectLock(
                object
              );


              this.canvas.discardActiveObject();

              this.canvas.requestRenderAll();

              this.renderLayers();

              this.updateSelectionInspector();

              this.commit();

            }
          );

        }
      );


    this.bindLayerDragDrop(
      list
    );

  }


  bindLayerDragDrop(list) {

    let draggedId =
      null;


    list
      .querySelectorAll(
        "[data-layer-row]"
      )
      .forEach(
        row => {

          row.addEventListener(
            "dragstart",
            event => {

              draggedId =
                row.dataset
                  .layerRow;


              event.dataTransfer
                .setData(
                  "text/plain",
                  draggedId
                );


              row.classList.add(
                "dragging"
              );

            }
          );


          row.addEventListener(
            "dragend",
            () => {

              row.classList.remove(
                "dragging"
              );


              draggedId =
                null;

            }
          );


          row.addEventListener(
            "dragover",
            event => {

              event.preventDefault();


              row.classList.add(
                "drag-over"
              );

            }
          );


          row.addEventListener(
            "dragleave",
            () => {

              row.classList.remove(
                "drag-over"
              );

            }
          );


          row.addEventListener(
            "drop",
            event => {

              event.preventDefault();


              row.classList.remove(
                "drag-over"
              );


              const source =
                draggedId ||
                event.dataTransfer
                  .getData(
                    "text/plain"
                  );


              const target =
                row.dataset
                  .layerRow;


              if (
                source &&
                target &&
                source !==
                target
              ) {

                this.reorderLayer(
                  source,
                  target
                );

              }

            }
          );

        }
      );

  }


  reorderLayer(
    sourceId,
    targetId
  ) {

    const objects =
      this.canvas._objects;


    const source =
      this.findObjectById(
        sourceId
      );


    const target =
      this.findObjectById(
        targetId
      );


    if (
      !source ||
      !target ||
      source.layerScope ===
      "brand"
    ) {

      return;

    }


    const sourceIndex =
      objects.indexOf(
        source
      );


    const targetIndex =
      objects.indexOf(
        target
      );


    if (
      sourceIndex <
        0 ||
      targetIndex <
        0
    ) {

      return;

    }


    objects.splice(
      sourceIndex,
      1
    );


    objects.splice(
      targetIndex,
      0,
      source
    );


    this.ensureBrandTop();

    this.canvas.requestRenderAll();

    this.renderLayers();

    this.commit();

  }


  getLayerIcon(object) {

    if (
      object.layerScope ===
      "brand"
    ) {

      return "◆";

    }


    if (
      object.isTemplateDecoration
    ) {

      return "✦";

    }


    if (
      object.editorType ===
      "image"
    ) {

      return "▧";

    }


    if (
      object.editorType ===
      "drawing"
    ) {

      return "✎";

    }


    if (
      object.editorType ===
      "element"
    ) {

      return "◇";

    }


    if (
      this.isTextObject(
        object
      )
    ) {

      return "T";

    }


    return "●";

  }


  /* ============================================================
     GROUP / UNGROUP
  ============================================================ */

  groupSelected() {

    const active =
      this.canvas
        .getActiveObject();


    if (!active) return;


    const type =
      String(
        active.type ||
        ""
      )
        .toLowerCase();


    if (
      !type.includes(
        "activeselection"
      )
    ) {

      return;

    }


    if (
      typeof active.toGroup ===
      "function"
    ) {

      const group =
        active.toGroup();


      this.assignObjectMeta(
        group,
        "Group",
        "group",
        "user"
      );


      this.canvas.setActiveObject(
        group
      );


      this.canvas.requestRenderAll();

      this.renderLayers();

      this.commit();

    }

  }


  ungroupSelected() {

    const active =
      this.canvas
        .getActiveObject();


    if (!active) return;


    const type =
      String(
        active.type ||
        ""
      )
        .toLowerCase();


    if (
      !type.includes(
        "group"
      )
    ) {

      return;

    }


    if (
      typeof active
        .toActiveSelection ===
      "function"
    ) {

      active.toActiveSelection();

      this.canvas.requestRenderAll();

      this.renderLayers();

      this.commit();

    }

  }


  /* ============================================================
     DUPLICATE / DELETE / LOCK / LAYER ORDER
  ============================================================ */

  async duplicateSelected() {

    const object =
      this.getEditableSelection();


    if (!object) return;


    const clone =
      await object.clone();


    clone.id =
      crypto.randomUUID();


    clone.name =
      `${
        object.name ||
        "Layer"
      } Copy`;


    clone.layerScope =
      "user";


    clone.role =
      null;


    clone.isBrand =
      false;


    clone.isUi =
      false;


    clone.isBackground =
      false;


    clone.isTemplateDecoration =
      false;


    clone.left =
      (
        object.left ||
        0
      ) +
      28;


    clone.top =
      (
        object.top ||
        0
      ) +
      28;


    clone.selectable =
      true;


    clone.evented =
      true;


    clone.lockMovementX =
      false;


    clone.lockMovementY =
      false;


    clone.lockScalingX =
      false;


    clone.lockScalingY =
      false;


    clone.lockRotation =
      false;


    clone.hasControls =
      true;


    this.canvas.add(
      clone
    );


    this.canvas.setActiveObject(
      clone
    );


    this.ensureBrandTop();

    this.canvas.requestRenderAll();

    this.renderLayers();

    this.updateSelectionInspector();

    this.commit();

  }


  deleteSelected() {

    const object =
      this.getEditableSelection();


    if (!object) return;


    if (
      object.layerScope ===
      "brand"
    ) {

      return;

    }


    const type =
      String(
        object.type ||
        ""
      )
        .toLowerCase();


    if (
      type.includes(
        "activeselection"
      ) &&
      typeof object
        .getObjects ===
        "function"
    ) {

      const selected =
        object.getObjects();


      this.canvas.discardActiveObject();


      selected.forEach(
        item => {

          if (
            item.layerScope !==
            "brand"
          ) {

            this.canvas.remove(
              item
            );

          }

        }
      );

    } else {

      this.canvas.remove(
        object
      );

    }


    this.canvas.discardActiveObject();

    this.canvas.requestRenderAll();

    this.renderLayers();

    this.updateSelectionInspector();

    this.updateContextToolbar();

    this.commit();

  }


  toggleLockSelected() {

    const object =
      this.getEditableSelection();


    if (
      !object ||
      object.layerScope ===
      "brand"
    ) {

      return;

    }


    this.toggleObjectLock(
      object
    );


    this.canvas.discardActiveObject();

    this.canvas.requestRenderAll();

    this.renderLayers();

    this.updateSelectionInspector();

    this.commit();

  }


  toggleObjectLock(object) {

    const locking =
      object.selectable !==
      false;


    object.lockMovementX =
      locking;


    object.lockMovementY =
      locking;


    object.lockScalingX =
      locking;


    object.lockScalingY =
      locking;


    object.lockRotation =
      locking;


    object.selectable =
      !locking;


    object.evented =
      !locking;


    object.hasControls =
      !locking;

  }


  moveSelectedLayer(direction) {

    const object =
      this.getEditableSelection();


    if (
      !object ||
      object.layerScope ===
      "brand"
    ) {

      return;

    }


    const objects =
      this.canvas
        .getObjects();


    const index =
      objects.indexOf(
        object
      );


    if (
      index <
      0
    ) {

      return;

    }


    const target =
      Math.max(
        1,
        Math.min(
          objects.length -
          2,
          index +
          direction
        )
      );


    this.moveObjectToIndex(
      object,
      target
    );


    this.ensureBrandTop();

    this.canvas.requestRenderAll();

    this.renderLayers();

    this.commit();

  }


  /* ============================================================
     SELECTION
  ============================================================ */

  getEditableSelection() {

    const object =
      this.canvas
        .getActiveObject();


    if (
      !object ||
      object.isBackground ||
      object.isUi ||
      object.layerScope ===
      "brand"
    ) {

      return null;

    }


    return object;

  }


  getSelectedImage() {

    const object =
      this.getEditableSelection();


    if (!object) return null;


    if (
      object.editorType ===
      "image"
    ) {

      return object;

    }


    const type =
      String(
        object.type ||
        ""
      )
        .toLowerCase();


    return type.includes(
      "image"
    )
      ? object
      : null;

  }


  isTextObject(object) {

    if (!object) return false;


    if (
      object.editorType ===
      "text"
    ) {

      return true;

    }


    return [
      "textbox",
      "text",
      "i-text",
      "itext"
    ].includes(
      String(
        object.type ||
        ""
      )
        .toLowerCase()
    );

  }


  isShapeObject(object) {

    if (!object) return false;


    if (
      object.editorType ===
      "shape"
    ) {

      return true;

    }


    return [
      "rect",
      "circle",
      "triangle",
      "line"
    ].includes(
      String(
        object.type ||
        ""
      )
        .toLowerCase()
    );

  }


  /* ============================================================
     INSPECTOR SYNC
  ============================================================ */

  updateSelectionInspector() {

    const object =
      this.getEditableSelection();


    const noSelection =
      document.getElementById(
        "proNoSelection"
      );


    const controls =
      document.getElementById(
        "proSelectionControls"
      );


    const textSection =
      document.getElementById(
        "proTextSection"
      );


    const imageSection =
      document.getElementById(
        "proImageSection"
      );


    const shapeSection =
      document.getElementById(
        "proShapeSection"
      );


    const actionSection =
      document.getElementById(
        "proObjectActionsSection"
      );


    const imageEffects =
      document.getElementById(
        "proImageEffectsSection"
      );


    if (!object) {

      noSelection
        ?.classList
        .remove(
          "hidden"
        );


      controls
        ?.classList
        .add(
          "hidden"
        );


      textSection
        ?.classList
        .add(
          "hidden"
        );


      imageSection
        ?.classList
        .add(
          "hidden"
        );


      shapeSection
        ?.classList
        .add(
          "hidden"
        );


      actionSection
        ?.classList
        .add(
          "hidden"
        );


      imageEffects
        ?.classList
        .add(
          "hidden"
        );


      this.setText(
        "proSelectedType",
        "None"
      );


      return;

    }


    noSelection
      ?.classList
      .add(
        "hidden"
      );


    controls
      ?.classList
      .remove(
        "hidden"
      );


    actionSection
      ?.classList
      .remove(
        "hidden"
      );


    const isText =
      this.isTextObject(
        object
      );


    const isImage =
      Boolean(
        this.getSelectedImage()
      );


    const isShape =
      this.isShapeObject(
        object
      );


    textSection
      ?.classList
      .toggle(
        "hidden",
        !isText
      );


    imageSection
      ?.classList
      .toggle(
        "hidden",
        !isImage
      );


    shapeSection
      ?.classList
      .toggle(
        "hidden",
        !isShape
      );


    imageEffects
      ?.classList
      .toggle(
        "hidden",
        !isImage
      );


    this.setText(
      "proSelectedType",
      object.typeLabel ||
      object.editorType ||
      object.type ||
      "Layer"
    );


    this.updateTransformControls();

    this.syncCommonEffects(
      object
    );


    if (isText) {

      this.syncTextInspector(
        object
      );

    }


    if (isImage) {

      this.syncImageInspector(
        object
      );

    }


    if (isShape) {

      this.syncShapeInspector(
        object
      );

    }

  }


  updateTransformControls() {

    const object =
      this.getEditableSelection();


    if (!object) return;


    this.setInputValue(
      "proObjectName",
      object.name ||
      "Layer"
    );


    this.setInputValue(
      "proObjectX",
      Math.round(
        object.left ||
        0
      )
    );


    this.setInputValue(
      "proObjectY",
      Math.round(
        object.top ||
        0
      )
    );


    const scale =
      (
        Math.abs(
          object.scaleX ||
          1
        ) +
        Math.abs(
          object.scaleY ||
          1
        )
      ) /
      2 *
      100;


    this.setInputValue(
      "proObjectScale",
      Math.max(
        10,
        Math.min(
          400,
          scale
        )
      )
    );


    this.setText(
      "proObjectScaleValue",
      `${Math.round(scale)}%`
    );


    this.setInputValue(
      "proObjectAngle",
      object.angle ||
      0
    );


    this.setText(
      "proObjectAngleValue",
      `${
        Math.round(
          object.angle ||
          0
        )
      }°`
    );


    const opacity =
      (
        object.opacity ??
        1
      ) *
      100;


    this.setInputValue(
      "proObjectOpacity",
      opacity
    );


    this.setText(
      "proObjectOpacityValue",
      `${Math.round(opacity)}%`
    );

  }


  syncTextInspector(object) {

    this.setInputValue(
      "proTextValue",
      object.text ||
      ""
    );


    this.setInputValue(
      "proTextFont",
      FONT_OPTIONS.includes(
        object.fontFamily
      )
        ? object.fontFamily
        : "Montserrat"
    );


    this.setInputValue(
      "proTextWeight",
      String(
        object.fontWeight ||
        400
      )
    );


    this.setInputValue(
      "proTextSize",
      object.fontSize ||
      80
    );


    this.setText(
      "proTextSizeValue",
      Math.round(
        object.fontSize ||
        80
      )
    );


    this.setInputValue(
      "proTextSpacing",
      object.charSpacing ||
      0
    );


    this.setText(
      "proTextSpacingValue",
      Math.round(
        object.charSpacing ||
        0
      )
    );


    this.setInputValue(
      "proTextLineHeight",
      (
        object.lineHeight ||
        1
      ) *
      100
    );


    this.setText(
      "proTextLineHeightValue",
      (
        object.lineHeight ||
        1
      )
        .toFixed(
          2
        )
    );


    if (
      typeof object.fill ===
      "string"
    ) {

      this.setInputValue(
        "proTextFill",
        this.safeHex(
          object.fill,
          "#FFFFFF"
        )
      );

    }


    this.setInputValue(
      "proTextStroke",
      this.safeHex(
        object.stroke,
        "#000000"
      )
    );


    this.setInputValue(
      "proTextStrokeWidth",
      object.strokeWidth ||
      0
    );


    this.setText(
      "proTextStrokeWidthValue",
      object.strokeWidth ||
      0
    );


    document
      .querySelectorAll(
        "#proTextAlign [data-align]"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "active",
            button.dataset.align ===
            (
              object.textAlign ||
              "left"
            )
          );

        }
      );

  }


  syncImageInspector(image) {

    const values = {

      proImageBrightness:
        image.filterBrightness ||
        0,

      proImageContrast:
        image.filterContrast ||
        0,

      proImageSaturation:
        image.filterSaturation ||
        0,

      proImageVibrance:
        image.filterVibrance ||
        0,

      proImageBlur:
        image.filterBlur ||
        0,

      proImageGrain:
        image.filterGrain ||
        0

    };


    Object.entries(
      values
    )
      .forEach(
        ([id, value]) => {

          this.setInputValue(
            id,
            value
          );


          this.setText(
            `${id}Value`,
            value
          );

        }
      );

  }


  syncShapeInspector(object) {

    this.setInputValue(
      "proShapeFill",
      this.safeHex(
        object.fill,
        "#F0C34C"
      )
    );


    this.setInputValue(
      "proShapeStroke",
      this.safeHex(
        object.stroke,
        "#FFFFFF"
      )
    );


    this.setInputValue(
      "proShapeStrokeWidth",
      object.strokeWidth ||
      0
    );


    this.setText(
      "proShapeStrokeWidthValue",
      object.strokeWidth ||
      0
    );

  }


  syncCommonEffects(object) {

    const blend =
      object.globalCompositeOperation ||
      "source-over";


    this.setInputValue(
      "proBlendMode",
      BLEND_MODES.includes(
        blend
      )
        ? blend
        : "source-over"
    );


    const shadowEnabled =
      Boolean(
        object.shadow
      );


    const toggle =
      document.getElementById(
        "proShadowEnabled"
      );


    if (toggle) {

      toggle.checked =
        shadowEnabled;

    }


    if (
      shadowEnabled
    ) {

      this.setInputValue(
        "proShadowBlur",
        object.shadow.blur ||
        25
      );


      this.setText(
        "proShadowBlurValue",
        object.shadow.blur ||
        25
      );

    }

  }


  /* ============================================================
     BACKGROUND
  ============================================================ */

  updateBackground() {

    const background =
      this.canvas
        .getObjects()
        .find(
          object =>
            object.isBackground
        );


    if (!background) return;


    background.set({

      width:
        this.canvas.width,

      height:
        this.canvas.height,

      fill:
        this.createTemplateGradient(
          this.canvas,
          this.state.backgroundColor,
          this.state.backgroundColor2,
          this.state.backgroundAngle
        )

    });


    this.canvas.requestRenderAll();

  }


  createTemplateGradient(
    canvas,
    color1,
    color2,
    angle = 135
  ) {

    const radians =
      angle *
      Math.PI /
      180;


    const width =
      canvas.width;


    const height =
      canvas.height;


    const cx =
      width /
      2;


    const cy =
      height /
      2;


    const length =
      Math.sqrt(
        width *
        width +
        height *
        height
      );


    const dx =
      Math.cos(
        radians
      ) *
      length /
      2;


    const dy =
      Math.sin(
        radians
      ) *
      length /
      2;


    return new Gradient({

      type:
        "linear",

      coords: {

        x1:
          cx -
          dx,

        y1:
          cy -
          dy,

        x2:
          cx +
          dx,

        y2:
          cy +
          dy

      },

      colorStops: [

        {
          offset: 0,
          color:
            color1
        },

        {
          offset: 1,
          color:
            color2
        }

      ]

    });

  }


  syncBackgroundInputs() {

    [
      "proBackgroundColor1",
      "proFxBackground1"
    ]
      .forEach(
        id => {

          this.setInputValue(
            id,
            this.state.backgroundColor
          );

        }
      );


    [
      "proBackgroundColor2",
      "proFxBackground2"
    ]
      .forEach(
        id => {

          this.setInputValue(
            id,
            this.state.backgroundColor2
          );

        }
      );

  }


  /* ============================================================
     BRAND
  ============================================================ */

  applyBrandAccent() {

    this.canvas
      .getObjects()
      .forEach(
        object => {

          if (
            [
              "templateEyebrow",
              "templateCtaBackground"
            ].includes(
              object.role
            )
          ) {

            object.fill =
              this.state.accent;

          }

        }
      );


    this.canvas.requestRenderAll();

  }


  applyBrandTextColor() {

    this.canvas
      .getObjects()
      .forEach(
        object => {

          if (
            object.role ===
            "templateHeadline"
          ) {

            object.fill =
              this.state.textColor;

          }


          if (
            object.role ===
            "templateFooter"
          ) {

            object.fill =
              this.hexToRgba(
                this.state.textColor,
                0.68
              );

          }

        }
      );


    this.canvas.requestRenderAll();

  }


  updateBrandText() {

    this.canvas
      .getObjects()
      .filter(
        object =>
          object.name ===
          "Brand"
      )
      .forEach(
        object => {

          object.text =
            this.state.brandName;

        }
      );


    this.canvas.requestRenderAll();

  }


  ensureBrandTop() {

    const brand =
      this.canvas
        .getObjects()
        .filter(
          object =>
            object.layerScope ===
            "brand"
        );


    brand.forEach(
      object => {

        this.moveObjectToIndex(
          object,
          this.canvas
            .getObjects()
            .length -
          1
        );

      }
    );


    const safe =
      this.getSafeZoneObject();


    if (safe) {

      this.moveObjectToIndex(
        safe,
        this.canvas
          .getObjects()
          .length -
        1
      );

    }

  }


  normalizeLayerOrder() {

    const objects =
      this.canvas
        .getObjects()
        .slice();


    const weight =
      object => {

        if (
          object.isBackground
        ) {

          return 0;

        }


        if (
          object.role ===
          "backgroundPhoto"
        ) {

          return 10;

        }


        if (
          object.layerScope ===
            "template" &&
          object.isTemplateDecoration
        ) {

          return 20;

        }


        if (
          object.layerScope ===
          "template"
        ) {

          return 30;

        }


        if (
          object.layerScope ===
          "user"
        ) {

          return 50;

        }


        if (
          object.layerScope ===
          "brand"
        ) {

          return 90;

        }


        if (
          object.layerScope ===
          "ui"
        ) {

          return 100;

        }


        return 40;

      };


    objects.sort(
      (a, b) =>
        weight(a) -
        weight(b)
    );


    this.canvas._objects =
      objects;


    this.ensureBrandTop();

    this.canvas.requestRenderAll();

  }


  /* ============================================================
     SAFE AREA
  ============================================================ */

  ensureSafeZone() {

    if (
      this.getSafeZoneObject()
    ) {

      return;

    }


    const top =
      this.state.canvasSize ===
      "story"
        ? 245
        : 72;


    const safe =
      new Rect({

        left:
          72,

        top,

        width:
          this.canvas.width -
          144,

        height:
          this.canvas.height -
          top *
          2,

        fill:
          "rgba(0,0,0,0)",

        stroke:
          "#F0C34C",

        strokeWidth:
          2,

        strokeDashArray: [
          14,
          12
        ],

        selectable:
          false,

        evented:
          false,

        visible:
          this.state.safeZone

      });


    this.assignObjectMeta(
      safe,
      "Safe Area",
      "ui",
      "ui"
    );


    safe.id =
      "safe-zone";


    safe.isUi =
      true;


    this.canvas.add(
      safe
    );


    this.ensureBrandTop();

  }


  getSafeZoneObject() {

    return this.canvas
      .getObjects()
      .find(
        object =>
          object.id ===
          "safe-zone"
      );

  }


  updateSafeZone() {

    this.ensureSafeZone();


    const safe =
      this.getSafeZoneObject();


    if (!safe) return;


    const top =
      this.state.canvasSize ===
      "story"
        ? 245
        : 72;


    safe.set({

      left:
        72,

      top,

      width:
        this.canvas.width -
        144,

      height:
        this.canvas.height -
        top *
        2,

      visible:
        this.state.safeZone

    });


    safe.setCoords();

    this.ensureBrandTop();

    this.canvas.requestRenderAll();

  }


  /* ============================================================
     CANVAS SIZE
  ============================================================ */

  setLogicalCanvasSize() {

    const size =
      POSTER_SIZES[
        this.state.canvasSize
      ];


    this.canvas.setDimensions({

      width:
        size.width,

      height:
        size.height

    });


    this.setInputValue(
      "posterCanvasSize",
      this.state.canvasSize
    );


    this.setText(
      "posterDimensions",
      `${size.width} × ${size.height}`
    );

  }


  resizeCanvas(type) {

    const size =
      POSTER_SIZES[type];


    if (!size) return;


    const oldWidth =
      this.canvas.width;


    const oldHeight =
      this.canvas.height;


    if (
      oldWidth ===
        size.width &&
      oldHeight ===
        size.height
    ) {

      return;

    }


    const ratioX =
      size.width /
      oldWidth;


    const ratioY =
      size.height /
      oldHeight;


    const scale =
      Math.min(
        ratioX,
        ratioY
      );


    this.state.canvasSize =
      type;


    this.canvas.setDimensions({

      width:
        size.width,

      height:
        size.height

    });


    this.canvas
      .getObjects()
      .forEach(
        object => {

          if (
            object.isUi
          ) {

            return;

          }


          if (
            object.isBackground
          ) {

            object.set({

              width:
                size.width,

              height:
                size.height

            });


            return;

          }


          if (
            object.layerScope ===
            "brand"
          ) {

            object.set({

              left:
                58,

              top:
                58

            });


            return;

          }


          object.left *=
            ratioX;


          object.top *=
            ratioY;


          if (
            object.isTemplateDecoration &&
            object.typeLabel ===
            "texture"
          ) {

            object.scaleX *=
              ratioX;


            object.scaleY *=
              ratioY;

          } else {

            object.scaleX *=
              scale;


            object.scaleY *=
              scale;

          }


          object.setCoords();

        }
      );


    this.updateBackground();

    this.updateSafeZone();

    this.clearTemplatePreviewCache();

    this.renderTemplates();

    this.fitCanvasToViewport();


    this.setText(
      "posterDimensions",
      `${size.width} × ${size.height}`
    );


    this.canvas.requestRenderAll();

    this.commit();

  }


  /* ============================================================
     ZOOM
  ============================================================ */

  applyZoom() {

    const ratio =
      this.state.zoom /
      100;


    this.canvas.setDimensions(
      {

        width:
          this.canvas.width *
          ratio,

        height:
          this.canvas.height *
          ratio

      },
      {

        cssOnly:
          true

      }
    );


    this.setText(
      "posterZoomValue",
      `${Math.round(
        this.state.zoom
      )}%`
    );


    this.updateContextToolbar();

    this.updateCropToolbarPosition();

  }


  fitCanvasToViewport() {

    const stage =
      document.querySelector(
        ".poster-stage-area"
      );


    if (!stage) {

      this.applyZoom();

      return;

    }


    const width =
      Math.max(
        300,
        stage.clientWidth -
        120
      );


    const height =
      Math.max(
        300,
        stage.clientHeight -
        90
      );


    const ratio =
      Math.min(

        width /
        this.canvas.width,

        height /
        this.canvas.height

      );


    this.state.zoom =
      Math.max(
        20,
        Math.min(
          100,
          Math.floor(
            ratio *
            100
          )
        )
      );


    this.applyZoom();

  }


  /* ============================================================
     EXPORT STUDIO
  ============================================================ */

  bindExportStudio() {

    document
      .getElementById(
        "posterDownloadPngBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          this.openExportStudio();

        }
      );


    document
      .getElementById(
        "closePosterExportStudio"
      )
      ?.addEventListener(
        "click",
        () => {

          this.closeExportStudio();

        }
      );


    document
      .getElementById(
        "posterExportMultiplier"
      )
      ?.addEventListener(
        "change",
        () => {

          this.updateExportSizePreview();

        }
      );


    document
      .getElementById(
        "posterExportFormat"
      )
      ?.addEventListener(
        "change",
        () => {

          this.updateExportSizePreview();

        }
      );


    document
      .getElementById(
        "confirmPosterExport"
      )
      ?.addEventListener(
        "click",
        () => {

          const format =
            document
              .getElementById(
                "posterExportFormat"
              )
              ?.value ||
            "png";


          const multiplier =
            Number(
              document
                .getElementById(
                  "posterExportMultiplier"
                )
                ?.value ||
              1
            );


          const includeBackground =
            document
              .getElementById(
                "posterExportBackground"
              )
              ?.checked !==
            false;


          this.exportPoster(
            format,
            multiplier,
            includeBackground
          );

        }
      );

  }


  openExportStudio() {

    document
      .getElementById(
        "posterExportStudio"
      )
      ?.classList
      .remove(
        "hidden"
      );


    this.updateExportSizePreview();

  }


  closeExportStudio() {

    document
      .getElementById(
        "posterExportStudio"
      )
      ?.classList
      .add(
        "hidden"
      );

  }


  updateExportSizePreview() {

    const multiplier =
      Number(
        document
          .getElementById(
            "posterExportMultiplier"
          )
          ?.value ||
        1
      );


    this.setText(
      "posterExportSizePreview",
      `${
        this.canvas.width *
        multiplier
      } × ${
        this.canvas.height *
        multiplier
      } px`
    );

  }


  exportPoster(
    format = "png",
    multiplier = 1,
    includeBackground = true
  ) {

    const hiddenObjects =
      [];


    this.canvas
      .getObjects()
      .forEach(
        object => {

          if (
            object.isUi
          ) {

            hiddenObjects.push({

              object,

              visible:
                object.visible

            });


            object.visible =
              false;

          }


          if (
            !includeBackground &&
            (
              object.isBackground ||
              object.role ===
              "backgroundPhoto"
            )
          ) {

            hiddenObjects.push({

              object,

              visible:
                object.visible

            });


            object.visible =
              false;

          }

        }
      );


    this.canvas.discardActiveObject();

    this.canvas.requestRenderAll();


    const actualFormat =
      format ===
      "jpg"
        ? "jpeg"
        : "png";


    const dataUrl =
      this.canvas.toDataURL({

        format:
          actualFormat,

        quality:
          actualFormat ===
          "jpeg"
            ? 0.96
            : 1,

        multiplier

      });


    hiddenObjects.forEach(
      item => {

        item.object.visible =
          item.visible;

      }
    );


    this.canvas.requestRenderAll();


    const projectName =
      document
        .getElementById(
          "projectName"
        )
        ?.value
        ?.trim()
        ?.replace(
          /[^a-z0-9-_]+/gi,
          "-"
        )
        ?.replace(
          /-+/g,
          "-"
        )
        ?.replace(
          /^-|-$/g,
          ""
        )
        ?.toLowerCase() ||
      "fwcwl-poster";


    const link =
      document.createElement(
        "a"
      );


    link.href =
      dataUrl;


    link.download =
      `${projectName}-${multiplier}x.${format}`;


    document.body.appendChild(
      link
    );


    link.click();

    link.remove();


    this.closeExportStudio();

  }


  /* ============================================================
     HISTORY / AUTOSAVE
  ============================================================ */

  getSnapshot() {

    const canvas =
      this.canvas.toJSON(
        [
          "id",
          "name",
          "typeLabel",
          "editorType",
          "layerScope",
          "role",
          "isBrand",
          "isBackground",
          "isUi",
          "isTemplateDecoration",
          "filterBrightness",
          "filterContrast",
          "filterSaturation",
          "filterVibrance",
          "filterBlur",
          "filterGrain",
          "filterGrayscale",
          "filterSepia",
          "removeColorEnabled",
          "removeColor",
          "removeColorDistance"
        ]
      );


    if (
      Array.isArray(
        canvas.objects
      )
    ) {

      canvas.objects =
        canvas.objects.filter(
          object =>

            object.layerScope !==
              "ui" &&

            !object.isUi

        );

    }


    return JSON.stringify({

      version:
        "5.1",

      state:
        this.state,

      canvas

    });

  }


  pushHistory() {

    if (
      this.restoring
    ) {

      return;

    }


    const snapshot =
      this.getSnapshot();


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
      HISTORY_LIMIT
    ) {

      this.history.shift();


      this.historyIndex =
        this.history.length -
        1;

    } else {

      this.historyIndex++;

    }

  }


  commit() {

    if (
      this.restoring
    ) {

      return;

    }


    this.pushHistory();

    this.saveProject();

  }


  async saveProject() {

    try {

      const snapshot =
        this.getSnapshot();


      this.setSaveStatus(
        "saving"
      );


      const success =
        await this.dbSet(
          "projects",
          PROJECT_KEY,
          snapshot
        );


      this.setSaveStatus(
        success
          ? "saved"
          : "error"
      );

    } catch (error) {

      console.warn(
        "Autosave failed:",
        error
      );


      this.setSaveStatus(
        "error"
      );

    }

  }


  setSaveStatus(status) {

    const project =
      document.querySelector(
        ".project-status-dot"
      );


    if (!project) return;


    project.dataset.saveStatus =
      status;


    project.title =
      status ===
      "saved"
        ? "Saved"
        : status ===
          "saving"
          ? "Saving..."
          : "Autosave unavailable";

  }


  async restoreAutosave() {

    const saved =
      await this.dbGet(
        "projects",
        PROJECT_KEY
      );


    if (!saved) {

      return false;

    }


    try {

      await this.restoreSnapshot(
        saved
      );


      return true;

    } catch (error) {

      console.warn(
        "Saved poster could not be restored:",
        error
      );


      return false;

    }

  }


  async undo() {

    if (
      this.historyIndex <=
      0
    ) {

      return;

    }


    this.historyIndex--;


    await this.restoreSnapshot(
      this.history[
        this.historyIndex
      ]
    );

  }


  async redo() {

    if (
      this.historyIndex >=
      this.history.length -
      1
    ) {

      return;

    }


    this.historyIndex++;


    await this.restoreSnapshot(
      this.history[
        this.historyIndex
      ]
    );

  }


  async restoreSnapshot(snapshot) {

    this.restoring =
      true;


    try {

      const parsed =
        JSON.parse(
          snapshot
        );


      this.state = {

        ...this.state,

        ...parsed.state

      };


      const size =
        POSTER_SIZES[
          this.state.canvasSize
        ] ||
        POSTER_SIZES.portrait;


      this.canvas.setDimensions({

        width:
          size.width,

        height:
          size.height

      });


      await this.canvas.loadFromJSON(
        parsed.canvas
      );


      this.canvas
        .getObjects()
        .forEach(
          object => {

            if (
              object.editorType ===
              "image"
            ) {

              this.applyImageFilters(
                object
              );

            }

          }
        );


      this.ensureSafeZone();

      this.updateSafeZone();

      this.ensureBrandTop();

      this.syncBrandInputs();

      this.applyZoom();

      this.canvas.discardActiveObject();

      this.canvas.requestRenderAll();

      this.renderTemplates();

      this.renderLayers();

      this.updateSelectionInspector();

      this.updateContextToolbar();

    } finally {

      this.restoring =
        false;

    }

  }


  /* ============================================================
     KEYBOARD SHORTCUTS
  ============================================================ */

  handleKeyboard(event) {

    const target =
      event.target;


    const editing =

      target instanceof
        HTMLInputElement ||

      target instanceof
        HTMLTextAreaElement ||

      target instanceof
        HTMLSelectElement;


    if (editing) {

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


      if (
        event.shiftKey
      ) {

        this.redo();

      } else {

        this.undo();

      }


      return;

    }


    if (
      command &&
      event.key
        .toLowerCase() ===
        "y"
    ) {

      event.preventDefault();

      this.redo();

      return;

    }


    if (
      command &&
      event.key
        .toLowerCase() ===
        "d"
    ) {

      event.preventDefault();

      this.duplicateSelected();

      return;

    }


    if (
      event.key ===
        "Delete" ||
      event.key ===
        "Backspace"
    ) {

      event.preventDefault();

      this.deleteSelected();

      return;

    }


    const object =
      this.getEditableSelection();


    if (!object) return;


    const step =
      event.shiftKey
        ? 10
        : 1;


    let moved =
      false;


    if (
      event.key ===
      "ArrowLeft"
    ) {

      object.left -=
        step;


      moved =
        true;

    }


    if (
      event.key ===
      "ArrowRight"
    ) {

      object.left +=
        step;


      moved =
        true;

    }


    if (
      event.key ===
      "ArrowUp"
    ) {

      object.top -=
        step;


      moved =
        true;

    }


    if (
      event.key ===
      "ArrowDown"
    ) {

      object.top +=
        step;


      moved =
        true;

    }


    if (moved) {

      event.preventDefault();


      object.setCoords();

      this.canvas.requestRenderAll();

      this.updateTransformControls();

      this.updateContextToolbar();

    }

  }


  /* ============================================================
     OBJECT HELPERS
  ============================================================ */

  assignObjectMeta(
    object,
    name,
    editorType,
    layerScope = "user"
  ) {

    object.id =
      object.id ||
      crypto.randomUUID();


    object.name =
      name;


    object.typeLabel =
      editorType;


    object.editorType =
      editorType;


    object.layerScope =
      layerScope;

  }


  findObjectById(id) {

    return this.canvas
      .getObjects()
      .find(
        object =>
          object.id ===
          id
      );

  }


  moveObjectToIndex(
    object,
    index
  ) {

    this.moveObjectToIndexOnCanvas(
      this.canvas,
      object,
      index
    );

  }


  moveObjectToIndexOnCanvas(
    canvas,
    object,
    index
  ) {

    if (
      !canvas ||
      !object
    ) {

      return;

    }


    if (
      typeof canvas
        .moveObjectTo ===
      "function"
    ) {

      try {

        canvas.moveObjectTo(
          object,
          index
        );


        return;

      } catch {

        /* fallback below */

      }

    }


    const objects =
      canvas._objects;


    if (!objects) return;


    const current =
      objects.indexOf(
        object
      );


    if (
      current <
      0
    ) {

      return;

    }


    objects.splice(
      current,
      1
    );


    objects.splice(
      Math.max(
        0,
        Math.min(
          index,
          objects.length
        )
      ),
      0,
      object
    );


    canvas.requestRenderAll();

  }


  /* ============================================================
     UI SYNC
  ============================================================ */

  syncBrandInputs() {

    this.setInputValue(
      "posterBrandName",
      this.state.brandName
    );


    this.setInputValue(
      "posterAccentColor",
      this.state.accent
    );


    this.setInputValue(
      "posterAccentColorText",
      this.state.accent
    );


    this.setInputValue(
      "posterTextColor",
      this.state.textColor
    );


    this.setInputValue(
      "posterTextColorText",
      this.state.textColor
    );


    this.setInputValue(
      "proBackgroundAngle",
      this.state.backgroundAngle
    );


    this.setText(
      "proBackgroundAngleValue",
      `${this.state.backgroundAngle}°`
    );


    this.setInputValue(
      "posterCanvasSize",
      this.state.canvasSize
    );


    document
      .getElementById(
        "posterSafeZoneBtn"
      )
      ?.classList
      .toggle(
        "active",
        this.state.safeZone
      );


    document
      .getElementById(
        "posterSnapBtn"
      )
      ?.classList
      .toggle(
        "active",
        this.state.snap
      );


    this.syncBackgroundInputs();

  }


  setInputValue(
    id,
    value
  ) {

    const element =
      document.getElementById(
        id
      );


    if (element) {

      element.value =
        value;

    }

  }


  setText(
    id,
    value
  ) {

    const element =
      document.getElementById(
        id
      );


    if (element) {

      element.textContent =
        value;

    }

  }


  /* ============================================================
     FILE HELPERS
  ============================================================ */

  fileToDataUrl(file) {

    return new Promise(
      (resolve, reject) => {

        const reader =
          new FileReader();


        reader.onload =
          () => {

            resolve(
              reader.result
            );

          };


        reader.onerror =
          reject;


        reader.readAsDataURL(
          file
        );

      }
    );

  }


  /* ============================================================
     COLOR HELPERS
  ============================================================ */

  normalizeColor(value) {

    let color =
      String(
        value
      )
        .trim();


    if (
      !color.startsWith(
        "#"
      )
    ) {

      color =
        `#${color}`;

    }


    if (
      !/^#[0-9A-Fa-f]{6}$/.test(
        color
      )
    ) {

      return null;

    }


    return color.toUpperCase();

  }


  safeHex(
    value,
    fallback
  ) {

    if (
      typeof value !==
      "string"
    ) {

      return fallback;

    }


    return (
      this.normalizeColor(
        value
      ) ||
      fallback
    );

  }


  hexToRgba(
    hex,
    alpha
  ) {

    const normalized =
      this.normalizeColor(
        hex
      );


    if (!normalized) {

      return `rgba(255,255,255,${alpha})`;

    }


    const clean =
      normalized.slice(
        1
      );


    const red =
      parseInt(
        clean.slice(
          0,
          2
        ),
        16
      );


    const green =
      parseInt(
        clean.slice(
          2,
          4
        ),
        16
      );


    const blue =
      parseInt(
        clean.slice(
          4,
          6
        ),
        16
      );


    return `rgba(${red},${green},${blue},${alpha})`;

  }


  escapeHtml(value) {

    return String(
      value ??
      ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );

  }


  /* ============================================================
     RUNTIME CSS
  ============================================================ */

  installRuntimeStyles() {

    if (
      document.getElementById(
        "posterEditorV51Styles"
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "posterEditorV51Styles";


    style.textContent = `

      .hidden {
        display: none !important;
      }


      /* =====================================================
         EXACT TEMPLATE PREVIEWS
      ===================================================== */

      .poster-template-art.exact-template-preview::before,
      .poster-template-art.exact-template-preview::after {
        display: none !important;
        content: none !important;
      }


      .poster-template-art.exact-template-preview {
        position: relative !important;

        display: block !important;

        width: 100% !important;

        height: auto !important;

        min-height: 0 !important;

        overflow: hidden !important;

        background-color: #090a0c !important;

        background-repeat: no-repeat !important;

        background-position: center !important;

        background-size: contain !important;

        border-radius: inherit;

        box-shadow:
          inset 0 0 0 1px
          rgba(255,255,255,.04);

        transition:
          transform .18s ease,
          box-shadow .18s ease,
          opacity .18s ease;
      }


      .poster-template-card:hover
      .poster-template-art.exact-template-preview {
        transform:
          translateY(-1px);
      }


      .poster-template-card.active
      .poster-template-art.exact-template-preview {
        box-shadow:
          0 0 0 1px #f0c34c,
          0 0 22px rgba(240,195,76,.12);
      }


      .exact-preview-loading {
        position: absolute !important;

        inset: 0 !important;

        z-index: 30 !important;

        display: flex !important;

        flex-direction: column !important;

        align-items: center !important;

        justify-content: center !important;

        gap: 6px !important;

        background:
          linear-gradient(
            145deg,
            #111318,
            #08090c
          ) !important;
      }


      .exact-preview-loading > span {
        position: relative !important;

        width: 18px !important;

        height: 18px !important;

        border:
          2px solid
          rgba(255,255,255,.08) !important;

        border-top-color:
          #f0c34c !important;

        border-radius:
          50% !important;

        background:
          transparent !important;

        animation:
          posterPreviewSpin
          .75s
          linear
          infinite;
      }


      .exact-preview-loading small {
        position: static !important;

        margin: 0 !important;

        color: #666b75 !important;

        background: transparent !important;

        font-size: 5px !important;

        font-weight: 800 !important;

        line-height: 1 !important;

        text-transform: uppercase !important;

        letter-spacing: .08em !important;
      }


      @keyframes posterPreviewSpin {

        to {
          transform:
            rotate(360deg);
        }

      }


      .poster-template-name {
        display: flex;

        align-items: center;

        justify-content: space-between;

        gap: 6px;
      }


      .poster-template-name > span {
        min-width: 0;

        overflow: hidden;

        text-overflow: ellipsis;

        white-space: nowrap;
      }


      .poster-template-name > small {
        flex: 0 0 auto;

        color: #5f636c;

        font-size: 5px;

        font-weight: 900;

        letter-spacing: .05em;
      }


      /* =====================================================
         CONTEXT TOOLBAR
      ===================================================== */

      .poster-context-toolbar {
        position: fixed;

        z-index: 99999;

        display: flex;

        align-items: center;

        gap: 4px;

        padding: 5px;

        transform:
          translateX(-50%);

        border:
          1px solid
          rgba(255,255,255,.08);

        border-radius:
          10px;

        background:
          rgba(13,15,18,.96);

        box-shadow:
          0 16px 45px
          rgba(0,0,0,.45);

        backdrop-filter:
          blur(14px);
      }


      .poster-context-toolbar button {
        min-height: 30px;

        padding:
          0 9px;

        border: 0;

        border-radius:
          7px;

        color:
          #c8cad0;

        background:
          rgba(255,255,255,.035);

        font: inherit;

        font-size:
          9px;

        font-weight:
          700;

        cursor:
          pointer;
      }


      .poster-context-toolbar button:hover {
        color: #fff;

        background:
          rgba(255,255,255,.08);
      }


      .poster-context-toolbar button.danger:hover {
        color:
          #ff9999;
      }


      /* =====================================================
         CROP TOOLBAR
      ===================================================== */

      .poster-crop-toolbar {
        position: fixed;

        z-index: 100000;

        display: flex;

        align-items: center;

        gap: 6px;

        transform:
          translateX(-50%);

        padding: 7px;

        border:
          1px solid
          rgba(240,195,76,.22);

        border-radius:
          11px;

        background:
          rgba(10,11,14,.96);

        box-shadow:
          0 18px 50px
          rgba(0,0,0,.5);
      }


      .poster-crop-toolbar strong {
        padding:
          0 7px;

        color:
          #f0c34c;

        font-size:
          9px;
      }


      .poster-crop-toolbar button {
        height:
          32px;

        border:
          1px solid
          rgba(255,255,255,.07);

        border-radius:
          7px;

        padding:
          0 10px;

        color:
          #c9ccd3;

        background:
          rgba(255,255,255,.035);

        font: inherit;

        font-size:
          9px;

        font-weight:
          700;

        cursor:
          pointer;
      }


      .poster-crop-toolbar button.primary {
        color:
          #171309;

        border-color:
          #f0c34c;

        background:
          linear-gradient(
            180deg,
            #f8d76f,
            #f0c34c
          );
      }


      /* =====================================================
         EXPORT STUDIO
      ===================================================== */

      .poster-export-studio {
        position: fixed;

        inset: 0;

        z-index: 120000;

        display: grid;

        place-items: center;

        background:
          rgba(0,0,0,.70);

        backdrop-filter:
          blur(8px);
      }


      .poster-export-dialog {
        position: relative;

        width:
          min(
            440px,
            calc(100vw - 36px)
          );

        padding:
          26px;

        border:
          1px solid
          rgba(255,255,255,.08);

        border-radius:
          18px;

        background:
          #101216;

        box-shadow:
          0 28px 90px
          rgba(0,0,0,.6);
      }


      .poster-export-dialog h2 {
        margin:
          6px 0 6px;

        color:
          #fff;
      }


      .poster-export-dialog > p {
        margin:
          0 0 22px;

        color:
          #737780;

        font-size:
          11px;

        line-height:
          1.5;
      }


      .export-dialog-close {
        position:
          absolute;

        right:
          15px;

        top:
          15px;

        width:
          30px;

        height:
          30px;

        border:
          1px solid
          rgba(255,255,255,.08);

        border-radius:
          8px;

        color:
          #8d9199;

        background:
          transparent;

        cursor:
          pointer;
      }


      .export-studio-grid {
        display: grid;

        grid-template-columns:
          repeat(
            2,
            minmax(0,1fr)
          );

        gap: 12px;

        margin-bottom:
          15px;
      }


      .export-size-preview {
        margin:
          15px 0;

        padding:
          12px;

        border:
          1px solid
          rgba(255,255,255,.06);

        border-radius:
          9px;

        color:
          #f0c34c;

        background:
          rgba(240,195,76,.04);

        font-size:
          11px;

        font-weight:
          800;

        text-align:
          center;
      }


      /* =====================================================
         CRICKET ELEMENT LIBRARY
      ===================================================== */

      .cricket-element-grid {
        display: grid;

        grid-template-columns:
          repeat(
            4,
            minmax(0,1fr)
          );

        gap:
          7px;
      }


      .cricket-element-grid button {
        display: flex;

        flex-direction:
          column;

        align-items:
          center;

        justify-content:
          center;

        gap:
          4px;

        min-height:
          57px;

        border:
          1px solid
          rgba(255,255,255,.055);

        border-radius:
          9px;

        color:
          #9da1aa;

        background:
          rgba(255,255,255,.025);

        cursor:
          pointer;

        transition:
          border-color .16s ease,
          background .16s ease,
          color .16s ease,
          transform .16s ease;
      }


      .cricket-element-grid button:hover {
        color:
          #f0c34c;

        border-color:
          rgba(240,195,76,.18);

        background:
          rgba(240,195,76,.045);

        transform:
          translateY(-1px);
      }


      .cricket-element-grid strong {
        font-size:
          12px;
      }


      .cricket-element-grid span {
        font-size:
          6px;

        font-weight:
          800;

        text-transform:
          uppercase;
      }


      .premium-element-popover {
        display: grid;

        grid-template-columns:
          repeat(
            2,
            minmax(0,1fr)
          );

        gap:
          5px;
      }


      .premium-element-popover button {
        min-height:
          32px;

        border:
          1px solid
          rgba(255,255,255,.06);

        border-radius:
          7px;

        color:
          #a5a9b1;

        background:
          rgba(255,255,255,.025);

        font: inherit;

        font-size:
          7px;

        font-weight:
          800;

        cursor:
          pointer;
      }


      .premium-element-popover button:hover {
        color:
          #f0c34c;

        border-color:
          rgba(240,195,76,.20);
      }


      /* =====================================================
         FILTERS
      ===================================================== */

      .pro-filter-grid {
        display: grid;

        grid-template-columns:
          repeat(
            3,
            minmax(0,1fr)
          );

        gap:
          6px;
      }


      .pro-filter-grid button {
        min-height:
          34px;

        border:
          1px solid
          rgba(255,255,255,.06);

        border-radius:
          8px;

        color:
          #a7abb3;

        background:
          rgba(255,255,255,.025);

        font: inherit;

        font-size:
          8px;

        font-weight:
          700;

        cursor:
          pointer;
      }


      .pro-filter-grid button:hover {
        color:
          #f0c34c;

        border-color:
          rgba(240,195,76,.18);
      }


      /* =====================================================
         LAYER DRAGGING
      ===================================================== */

      .pro-layer-row {
        transition:
          border-color .14s ease,
          opacity .14s ease,
          background .14s ease,
          transform .14s ease;
      }


      .pro-layer-row.dragging {
        opacity:
          .35;
      }


      .pro-layer-row.drag-over {
        border-color:
          #f0c34c !important;

        background:
          rgba(240,195,76,.055) !important;

        transform:
          translateY(1px);
      }


      /* =====================================================
         AUTOSAVE
      ===================================================== */

      .project-status-dot[
        data-save-status="saving"
      ] {
        background:
          #f0c34c !important;

        box-shadow:
          0 0 8px
          rgba(240,195,76,.5);
      }


      .project-status-dot[
        data-save-status="saved"
      ] {
        background:
          #62df98 !important;

        box-shadow:
          0 0 8px
          rgba(98,223,152,.28);
      }


      .project-status-dot[
        data-save-status="error"
      ] {
        background:
          #df6262 !important;

        box-shadow:
          0 0 8px
          rgba(223,98,98,.28);
      }

    `;


    document.head.appendChild(
      style
    );

  }


}
