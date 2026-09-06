/* =========================================================
   FWCWL CREATIVE STUDIO
   WORLD-CLASS PRO POSTER EDITOR
   ---------------------------------------------------------
   Fabric.js 6
   Exact template previews
   Layer editor
   Text editor
   Photo editor
   Effects
   Masks
   Shapes
   Stickers
   Drawing
   Rustic / textured templates
   Undo / redo
   Autosave
   Full-resolution export
========================================================= */


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



/* =========================================================
   TEMPLATE LIBRARY
========================================================= */

const POSTER_TEMPLATES = [

  ...ORIGINAL_POSTER_TEMPLATES,

  ...PREMIUM_POSTER_TEMPLATES

];


const DEFAULT_TEMPLATE_ID =
  POSTER_TEMPLATES.find(
    template =>
      template.id === "matchday"
  )?.id ||
  POSTER_TEMPLATES[0]?.id;



/* =========================================================
   CANVAS FORMATS
========================================================= */

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



/* =========================================================
   FONTS
========================================================= */

const FONT_OPTIONS = [

  "Montserrat",

  "Bebas Neue",

  "Poppins",

  "DM Sans",

  "Playfair Display"

];



/* =========================================================
   BLEND MODES
========================================================= */

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



/* =========================================================
   STICKERS
========================================================= */

const CRICKET_STICKERS = [

  "🏏",
  "🏆",
  "🥇",
  "⭐",
  "🔥",
  "⚡",
  "💥",
  "🎯",
  "👑",
  "🎉",
  "💪",
  "🚀",
  "📣",
  "🏅",
  "💯",
  "❤️"

];



const HISTORY_LIMIT =
  60;



/* =========================================================
   POSTER EDITOR
========================================================= */

export class PosterEditor {


  constructor() {


    /* =====================================================
       FABRIC CANVAS
    ====================================================== */

    this.canvasElement =
      document.getElementById(
        "posterCanvas"
      );


    this.canvas =
      new Canvas(
        this.canvasElement,
        {

          preserveObjectStacking:
            true,

          selection:
            true,

          uniformScaling:
            false,

          fireRightClick:
            true,

          stopContextMenu:
            true

        }
      );



    /* =====================================================
       STATE
    ====================================================== */

    this.state = {

      canvasSize:
        "portrait",

      template:
        DEFAULT_TEMPLATE_ID,

      zoom:
        50,

      safeZone:
        false,

      snap:
        true,

      brandName:
        "FWCWL",

      accent:
        "#F0C34C",

      textColor:
        "#FFFFFF",

      backgroundColor:
        "#210B0E",

      backgroundColor2:
        "#080A0D",

      backgroundAngle:
        135,

      brushColor:
        "#F0C34C",

      brushWidth:
        14,

      brushMode:
        "brush"

    };



    /* =====================================================
       TEMPLATE LIBRARY STATE
    ====================================================== */

    this.activeFilter =
      "all";


    this.templatePreviewCache =
      new Map();


    this.templatePreviewObserver =
      null;


    this.templatePreviewRenderToken =
      0;



    /* =====================================================
       HISTORY
    ====================================================== */

    this.history =
      [];


    this.historyIndex =
      -1;


    this.restoring =
      false;


    this.initialized =
      false;



    /* =====================================================
       SETUP
    ====================================================== */

    this.ensureExactTemplatePreviewStyles();


    this.buildProUi();


    this.bindCoreCanvasEvents();


    this.bindExistingUi();


    this.bindProUi();


    this.bindWindowEvents();


    this.initialize();

  }



  /* =========================================================
     INITIALIZE
  ========================================================= */

  async initialize() {


    this.setLogicalCanvasSize();


    const restored =
      await this.restoreAutosave();


    if (!restored) {

      await this.applyTemplate(
        DEFAULT_TEMPLATE_ID,
        false
      );

    }


    this.applyZoom();


    this.renderTemplates();


    this.renderLayers();


    this.updateSelectionInspector();


    this.pushHistory();


    this.initialized =
      true;


    requestAnimationFrame(
      () => {

        this.fitCanvasToViewport();

      }
    );

  }



  /* =========================================================
     WINDOW EVENTS
  ========================================================= */

  bindWindowEvents() {


    window.addEventListener(
      "resize",
      () => {

        if (
          this.initialized
        ) {

          this.fitCanvasToViewport();

        }

      }
    );

  }



  /* =========================================================
     COMPATIBILITY
  ========================================================= */

  render() {

    this.canvas.requestRenderAll();

  }



  /* =========================================================
     BUILD UI
  ========================================================= */

  buildProUi() {


    this.buildToolRail();


    this.buildAdvancedMediaPanel();


    this.buildAdvancedBrandPanel();


    this.buildAdvancedInspector();

  }



  /* =========================================================
     LEFT TOOL RAIL
  ========================================================= */

  buildToolRail() {


    const workspace =
      document.getElementById(
        "posterWorkspace"
      );


    if (!workspace) {

      return;

    }


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
        type="button"
        class="pro-tool active"
        data-pro-tool="select"
        title="Select and move layers"
      >
        <span>↖</span>
        <small>Select</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="text"
        title="Add text"
      >
        <span>T</span>
        <small>Text</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="photo"
        title="Add photo"
      >
        <span>▧</span>
        <small>Photo</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="shape"
        title="Add shape"
      >
        <span>○</span>
        <small>Shape</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="draw"
        title="Draw"
      >
        <span>✎</span>
        <small>Draw</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="sticker"
        title="Cricket stickers"
      >
        <span>★</span>
        <small>Sticker</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="layers"
        title="Open layers"
      >
        <span>▤</span>
        <small>Layers</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="background"
        title="Background studio"
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



  /* =========================================================
     MEDIA PANEL
  ========================================================= */

  buildAdvancedMediaPanel() {


    const panel =
      document.getElementById(
        "posterMediaPanel"
      );


    if (!panel) {

      return;

    }


    panel.innerHTML = `

      <div class="panel-title-row">

        <div>

          <div class="panel-eyebrow">
            CREATIVE ASSETS
          </div>

          <h2>
            Photos & Elements
          </h2>

          <p>
            Add player photos, logos and design elements as editable layers.
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

          <strong>
            ＋
          </strong>

          <span>
            Add Photo
          </span>

          <small>
            Editable layer
          </small>

        </label>


        <label class="pro-upload-tile">

          <input
            id="proBackgroundPhotoInput"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
          />

          <strong>
            ▧
          </strong>

          <span>
            Background
          </span>

          <small>
            Behind template
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
          Editable team or sponsor layer
        </span>

      </label>


      <div class="section-divider"></div>


      <div class="pro-section-label">
        CRICKET STICKERS
      </div>


      <div
        id="proStickerGrid"
        class="pro-sticker-grid"
      >

        ${CRICKET_STICKERS
          .map(
            sticker => `

              <button
                type="button"
                data-sticker="${sticker}"
              >
                ${sticker}
              </button>

            `
          )
          .join("")}

      </div>


      <div class="section-divider"></div>


      <div class="pro-section-label">
        QUICK SHAPES
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



  /* =========================================================
     BRAND PANEL
  ========================================================= */

  buildAdvancedBrandPanel() {


    const panel =
      document.getElementById(
        "posterBrandPanel"
      );


    if (!panel) {

      return;

    }


    panel.innerHTML = `

      <div class="panel-title-row">

        <div>

          <div class="panel-eyebrow">
            FWCWL BRAND STUDIO
          </div>

          <h2>
            Brand Identity
          </h2>

          <p>
            Control the official league colors and poster environment.
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
            Permanently locked at the top-left of every final poster.
          </p>

        </div>

      </div>


      <div class="form-field">

        <label>
          Brand / Team Name
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
        BACKGROUND GRADIENT
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



  /* =========================================================
     RIGHT INSPECTOR
  ========================================================= */

  buildAdvancedInspector() {


    const panel =
      document.getElementById(
        "posterRightPanel"
      );


    if (!panel) {

      return;

    }


    const scroll =
      panel.querySelector(
        ".right-scroll"
      );


    if (!scroll) {

      return;

    }


    scroll.innerHTML = `

      <div class="pro-inspector-tabs">

        <button
          type="button"
          class="active"
          data-inspector-tab="edit"
        >
          Edit
        </button>

        <button
          type="button"
          data-inspector-tab="effects"
        >
          Effects
        </button>

        <button
          type="button"
          data-inspector-tab="layers"
        >
          Layers
        </button>

      </div>



      <!-- =================================================
           EDIT
      ================================================== -->

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
            Select a layer directly on the poster or from the Layers panel.
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

                <label>
                  X
                </label>

                <input
                  id="proObjectX"
                  type="number"
                  step="1"
                />

              </div>


              <div class="form-field">

                <label>
                  Y
                </label>

                <input
                  id="proObjectY"
                  type="number"
                  step="1"
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
                type="button"
                id="proFlipX"
              >
                Flip H
              </button>

              <button
                type="button"
                id="proFlipY"
              >
                Flip V
              </button>

              <button
                type="button"
                id="proCenterX"
              >
                Center H
              </button>

              <button
                type="button"
                id="proCenterY"
              >
                Center V
              </button>

            </div>

          </div>

        </section>



        <!-- =================================================
             TEXT
        ================================================== -->

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

                ${FONT_OPTIONS
                  .map(
                    font => `

                      <option value="${font}">
                        ${font}
                      </option>

                    `
                  )
                  .join("")}

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


          <div
            id="proTextAlign"
            class="segmented-control"
          >

            <button
              type="button"
              data-align="left"
            >
              Left
            </button>

            <button
              type="button"
              data-align="center"
            >
              Center
            </button>

            <button
              type="button"
              data-align="right"
            >
              Right
            </button>

          </div>


          <div class="pro-command-grid">

            <button
              type="button"
              id="proTextItalic"
            >
              Italic
            </button>

            <button
              type="button"
              id="proTextUnderline"
            >
              Underline
            </button>

            <button
              type="button"
              id="proTextUppercase"
            >
              UPPERCASE
            </button>

            <button
              type="button"
              id="proGradientText"
            >
              Gold Gradient
            </button>

          </div>

        </section>



        <!-- =================================================
             IMAGE
        ================================================== -->

        <section
          id="proImageSection"
          class="inspector-section hidden"
        >

          <div class="inspector-title">
            IMAGE
          </div>


          <div class="pro-command-grid">

            <button
              type="button"
              id="proImageFit"
            >
              Fit Canvas
            </button>

            <button
              type="button"
              id="proImageFill"
            >
              Fill Canvas
            </button>

            <button
              type="button"
              id="proImageCenter"
            >
              Center
            </button>

            <button
              type="button"
              id="proImageReset"
            >
              Reset
            </button>

          </div>


          <div class="pro-section-label inspector-gap">
            MASK
          </div>


          <div class="pro-command-grid">

            <button
              type="button"
              data-mask="none"
            >
              None
            </button>

            <button
              type="button"
              data-mask="circle"
            >
              Circle
            </button>

            <button
              type="button"
              data-mask="rounded"
            >
              Rounded
            </button>

            <button
              type="button"
              data-mask="portrait"
            >
              Portrait
            </button>

          </div>

        </section>



        <!-- =================================================
             SHAPE
        ================================================== -->

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



        <!-- =================================================
             OBJECT ACTIONS
        ================================================== -->

        <section
          id="proObjectActionsSection"
          class="inspector-section hidden"
        >

          <div class="inspector-title">
            LAYER ACTIONS
          </div>


          <div class="pro-command-grid">

            <button
              type="button"
              id="proDuplicateObject"
            >
              Duplicate
            </button>

            <button
              type="button"
              id="proLockObject"
            >
              Lock
            </button>

            <button
              type="button"
              id="proBringForward"
            >
              Forward
            </button>

            <button
              type="button"
              id="proSendBackward"
            >
              Backward
            </button>

          </div>


          <button
            type="button"
            id="proDeleteObject"
            class="pro-danger-button"
          >
            Delete Selected Layer
          </button>

        </section>

      </div>



      <!-- =================================================
           EFFECTS
      ================================================== -->

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

              ${BLEND_MODES
                .map(
                  mode => `

                    <option value="${mode}">
                      ${mode}
                    </option>

                  `
                )
                .join("")}

            </select>

          </div>


          <label class="switch-row">

            <div>

              <strong>
                Drop Shadow
              </strong>

              <span>
                Add depth and separation
              </span>

            </div>

            <input
              id="proShadowEnabled"
              type="checkbox"
            />

            <span class="switch-ui"></span>

          </label>


          <div class="form-field inspector-gap">

            <label>
              Shadow Color
            </label>

            <input
              id="proShadowColor"
              type="color"
              value="#000000"
            />

          </div>


          <div class="field-block">

            <div class="range-head">

              <label>
                Shadow Blur
              </label>

              <span id="proShadowBlurValue">
                25
              </span>

            </div>

            <input
              id="proShadowBlur"
              type="range"
              min="0"
              max="120"
              value="25"
            />

          </div>

        </section>



        <!-- =================================================
             PHOTO EFFECTS
        ================================================== -->

        <section
          id="proImageEffectsSection"
          class="inspector-section hidden"
        >

          <div class="inspector-title">
            PHOTO ADJUST
          </div>


          <div class="field-block">

            <div class="range-head">

              <label>
                Brightness
              </label>

              <span id="proImageBrightnessValue">
                0
              </span>

            </div>

            <input
              id="proImageBrightness"
              type="range"
              min="-100"
              max="100"
              value="0"
            />

          </div>


          <div class="field-block">

            <div class="range-head">

              <label>
                Contrast
              </label>

              <span id="proImageContrastValue">
                0
              </span>

            </div>

            <input
              id="proImageContrast"
              type="range"
              min="-100"
              max="100"
              value="0"
            />

          </div>


          <div class="field-block">

            <div class="range-head">

              <label>
                Saturation
              </label>

              <span id="proImageSaturationValue">
                0
              </span>

            </div>

            <input
              id="proImageSaturation"
              type="range"
              min="-100"
              max="100"
              value="0"
            />

          </div>


          <div class="field-block">

            <div class="range-head">

              <label>
                Blur
              </label>

              <span id="proImageBlurValue">
                0
              </span>

            </div>

            <input
              id="proImageBlur"
              type="range"
              min="0"
              max="100"
              value="0"
            />

          </div>


          <div class="pro-command-grid">

            <button
              type="button"
              id="proGrayscale"
            >
              B&W
            </button>

            <button
              type="button"
              id="proSepia"
            >
              Sepia
            </button>

            <button
              type="button"
              id="proResetFilters"
            >
              Reset
            </button>

          </div>


          <div class="section-divider"></div>


          <div class="pro-section-label">
            COLOR CUTOUT
          </div>


          <p class="pro-helper-text">
            Remove a solid background color such as white or green.
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


          <div class="field-block">

            <div class="range-head">

              <label>
                Tolerance
              </label>

              <span id="proRemoveColorDistanceValue">
                20
              </span>

            </div>

            <input
              id="proRemoveColorDistance"
              type="range"
              min="1"
              max="100"
              value="20"
            />

          </div>


          <button
            type="button"
            id="proApplyRemoveColor"
            class="pro-gold-button"
          >
            Remove Selected Color
          </button>

        </section>



        <!-- =================================================
             BACKGROUND
        ================================================== -->

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

        </section>

      </div>



      <!-- =================================================
           LAYERS
      ================================================== -->

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


          <div
            id="proLayerList"
            class="pro-layer-list"
          ></div>

        </section>

      </div>

    `;



    /* =====================================================
       FOOTER
    ====================================================== */

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
              Export PNG
            </strong>

            <small>
              Full 1080px quality
            </small>

          </span>

          <span>
            ↓
          </span>

        </button>


        <button
          id="posterDownloadJpgBtn"
          class="export-alt-btn"
          type="button"
        >
          Export JPG
        </button>

      `;

    }

  }



  /* =========================================================
     CANVAS EVENTS
  ========================================================= */

  bindCoreCanvasEvents() {


    this.canvas.on(
      "selection:created",
      () => {

        this.setDrawingMode(
          false
        );


        this.updateSelectionInspector();


        this.renderLayers();

      }
    );


    this.canvas.on(
      "selection:updated",
      () => {

        this.updateSelectionInspector();


        this.renderLayers();

      }
    );


    this.canvas.on(
      "selection:cleared",
      () => {

        this.updateSelectionInspector();


        this.renderLayers();

      }
    );


    this.canvas.on(
      "object:moving",
      event => {

        this.applyLiveSnap(
          event.target
        );


        this.updateTransformControls();

      }
    );


    this.canvas.on(
      "object:scaling",
      () => {

        this.updateTransformControls();

      }
    );


    this.canvas.on(
      "object:rotating",
      () => {

        this.updateTransformControls();

      }
    );


    this.canvas.on(
      "object:modified",
      event => {


        this.applyLiveSnap(
          event.target
        );


        event.target
          ?.setCoords?.();


        this.canvas.requestRenderAll();


        this.updateSelectionInspector();


        this.renderLayers();


        this.commit();

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
          "drawing"
        );


        if (
          this.state.brushMode ===
          "eraser"
        ) {

          path.globalCompositeOperation =
            "destination-out";

        }


        if (
          this.state.brushMode ===
          "highlighter"
        ) {

          path.opacity =
            0.32;

        }


        this.ensureBrandTop();


        this.renderLayers();


        this.commit();

      }
    );

  }



  /* =========================================================
     PAGE UI
  ========================================================= */

  bindExistingUi() {


    /* =====================================================
       LEFT PANEL TABS
    ====================================================== */

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
                    button.dataset.posterTab
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



    /* =====================================================
       TEMPLATE SEARCH
    ====================================================== */

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



    /* =====================================================
       TEMPLATE FILTERS
    ====================================================== */

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



    /* =====================================================
       CANVAS SIZE
    ====================================================== */

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



    /* =====================================================
       SAFE AREA
    ====================================================== */

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



    /* =====================================================
       SNAP
    ====================================================== */

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



    /* =====================================================
       FIT
    ====================================================== */

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



    /* =====================================================
       ZOOM
    ====================================================== */

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
              this.state.zoom -
              5
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
              this.state.zoom +
              5
            );


          this.applyZoom();

        }
      );



    /* =====================================================
       RESET
    ====================================================== */

    document
      .getElementById(
        "posterResetBtn"
      )
      ?.addEventListener(
        "click",
        async () => {


          if (
            !confirm(
              "Reset this poster and load Match Day?"
            )
          ) {

            return;

          }


          await this.applyTemplate(
            DEFAULT_TEMPLATE_ID
          );

        }
      );



    /* =====================================================
       EXPORT TOP
    ====================================================== */

    document
      .getElementById(
        "posterExportTopBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          this.exportPoster(
            "png"
          );

        }
      );

  }



  /* =========================================================
     PRO UI BINDINGS
  ========================================================= */

  bindProUi() {


    this.bindToolRail();


    this.bindMediaPanel();


    this.bindBrandPanel();


    this.bindInspectorTabs();


    this.bindTransformInspector();


    this.bindTextInspector();


    this.bindImageInspector();


    this.bindShapeInspector();


    this.bindEffectsInspector();


    this.bindExportButtons();

  }



  /* =========================================================
     TOOL RAIL
  ========================================================= */

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


              const tool =
                button.dataset.proTool;


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
                tool
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



  handleTool(
    tool
  ) {


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



      case "shape":

        this.setDrawingMode(
          false
        );


        this.showShapePopover();

        break;



      case "draw":

        this.showDrawPopover();

        break;



      case "sticker":

        this.setDrawingMode(
          false
        );


        this.showStickerPopover();

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



  /* =========================================================
     SHAPE POPOVER
  ========================================================= */

  showShapePopover() {


    const popover =
      document.getElementById(
        "posterToolPopover"
      );


    if (!popover) {

      return;

    }


    popover.innerHTML = `

      <div class="tool-popover-title">
        SHAPES
      </div>


      <div class="popover-shape-grid">

        <button
          type="button"
          data-pop-shape="rect"
        >
          ▰
        </button>

        <button
          type="button"
          data-pop-shape="circle"
        >
          ●
        </button>

        <button
          type="button"
          data-pop-shape="triangle"
        >
          ▲
        </button>

        <button
          type="button"
          data-pop-shape="line"
        >
          ╱
        </button>

        <button
          type="button"
          data-pop-shape="badge"
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
                button.dataset.popShape
              );


              this.hideToolPopover();

            }
          );

        }
      );

  }



  /* =========================================================
     STICKER POPOVER
  ========================================================= */

  showStickerPopover() {


    const popover =
      document.getElementById(
        "posterToolPopover"
      );


    if (!popover) {

      return;

    }


    popover.innerHTML = `

      <div class="tool-popover-title">
        CRICKET STICKERS
      </div>


      <div class="popover-sticker-grid">

        ${CRICKET_STICKERS
          .map(
            sticker => `

              <button
                type="button"
                data-pop-sticker="${sticker}"
              >
                ${sticker}
              </button>

            `
          )
          .join("")}

      </div>

    `;


    popover.classList.remove(
      "hidden"
    );


    popover
      .querySelectorAll(
        "[data-pop-sticker]"
      )
      .forEach(
        button => {


          button.addEventListener(
            "click",
            () => {


              this.addSticker(
                button.dataset.popSticker
              );


              this.hideToolPopover();

            }
          );

        }
      );

  }



  /* =========================================================
     DRAW POPOVER
  ========================================================= */

  showDrawPopover() {


    const popover =
      document.getElementById(
        "posterToolPopover"
      );


    if (!popover) {

      return;

    }


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
          type="button"
          data-brush-mode="brush"
        >
          Brush
        </button>

        <button
          type="button"
          data-brush-mode="highlighter"
        >
          Highlight
        </button>

        <button
          type="button"
          data-brush-mode="eraser"
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


    const color =
      popover.querySelector(
        "#proBrushColor"
      );


    const width =
      popover.querySelector(
        "#proBrushWidth"
      );


    color
      ?.addEventListener(
        "input",
        () => {


          this.state.brushColor =
            color.value;


          this.configureBrush();

        }
      );


    width
      ?.addEventListener(
        "input",
        () => {


          this.state.brushWidth =
            Number(
              width.value
            );


          const value =
            popover.querySelector(
              "#proBrushWidthValue"
            );


          if (value) {

            value.textContent =
              this.state.brushWidth;

          }


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
                button.dataset.brushMode;


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



  /* =========================================================
     DRAWING
  ========================================================= */

  setDrawingMode(
    enabled
  ) {


    this.canvas.isDrawingMode =
      enabled;


    if (enabled) {


      this.canvas.discardActiveObject();


      this.configureBrush();


      this.canvas.requestRenderAll();

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



  /* =========================================================
     MEDIA PANEL BINDINGS
  ========================================================= */

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
        "#proStickerGrid [data-sticker]"
      )
      .forEach(
        button => {


          button.addEventListener(
            "click",
            () => {


              this.addSticker(
                button.dataset.sticker
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
                button.dataset.addShape
              );

            }
          );

        }
      );

  }



  /* =========================================================
     BRAND PANEL BINDINGS
  ========================================================= */

  bindBrandPanel() {


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


          const label =
            document.getElementById(
              "proBackgroundAngleValue"
            );


          if (label) {

            label.textContent =
              `${this.state.backgroundAngle}°`;

          }


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
                first,
                second
              ] =
                button.dataset
                  .bgPreset
                  .split(",");


              this.state.backgroundColor =
                first;


              this.state.backgroundColor2 =
                second;


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
          picker.value.toUpperCase();


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


        const value =
          this.normalizeColor(
            text.value
          );


        if (!value) {


          text.value =
            picker.value.toUpperCase();


          return;

        }


        picker.value =
          value;


        text.value =
          value;


        callback(
          value
        );


        this.commit();

      }
    );

  }



  /* =========================================================
     INSPECTOR TABS
  ========================================================= */

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
                button.dataset.inspectorTab
              );

            }
          );

        }
      );

  }



  switchInspectorTab(
    name
  ) {


    document
      .querySelectorAll(
        "[data-inspector-tab]"
      )
      .forEach(
        button => {


          button.classList.toggle(

            "active",

            button.dataset.inspectorTab ===
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



  /* =========================================================
     TRANSFORM INSPECTOR
  ========================================================= */

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


          if (!object) {

            return;

          }


          object.name =
            event.target.value.trim() ||
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


          if (!object) {

            return;

          }


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


          if (!object) {

            return;

          }


          object.top =
            Number(
              event.target.value
            );


          object.setCoords();


          this.canvas.requestRenderAll();


          this.commit();

        }
      );



    this.bindRangeTransform(

      "proObjectScale",

      value => {


        const object =
          this.getEditableSelection();


        if (!object) {

          return;

        }


        const scale =
          value /
          100;


        object.scaleX =
          scale;


        object.scaleY =
          scale;


        object.setCoords();


        const label =
          document.getElementById(
            "proObjectScaleValue"
          );


        if (label) {

          label.textContent =
            `${Math.round(value)}%`;

        }


        this.canvas.requestRenderAll();

      }

    );



    this.bindRangeTransform(

      "proObjectAngle",

      value => {


        const object =
          this.getEditableSelection();


        if (!object) {

          return;

        }


        object.angle =
          value;


        object.setCoords();


        const label =
          document.getElementById(
            "proObjectAngleValue"
          );


        if (label) {

          label.textContent =
            `${Math.round(value)}°`;

        }


        this.canvas.requestRenderAll();

      }

    );



    this.bindRangeTransform(

      "proObjectOpacity",

      value => {


        const object =
          this.getEditableSelection();


        if (!object) {

          return;

        }


        object.opacity =
          value /
          100;


        const label =
          document.getElementById(
            "proObjectOpacityValue"
          );


        if (label) {

          label.textContent =
            `${Math.round(value)}%`;

        }


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


          if (!object) {

            return;

          }


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


          if (!object) {

            return;

          }


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


          const object =
            this.getEditableSelection();


          if (!object) {

            return;

          }


          object.set({

            left:
              this.canvas.width /
              2,

            originX:
              "center"

          });


          object.setCoords();


          this.canvas.requestRenderAll();


          this.updateTransformControls();


          this.commit();

        }
      );


    document
      .getElementById(
        "proCenterY"
      )
      ?.addEventListener(
        "click",
        () => {


          const object =
            this.getEditableSelection();


          if (!object) {

            return;

          }


          object.set({

            top:
              this.canvas.height /
              2,

            originY:
              "center"

          });


          object.setCoords();


          this.canvas.requestRenderAll();


          this.updateTransformControls();


          this.commit();

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

  }



  bindRangeTransform(
    id,
    callback
  ) {


    const input =
      document.getElementById(
        id
      );


    if (!input) {

      return;

    }


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



  /* =========================================================
     TEXT INSPECTOR
  ========================================================= */

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

      (
        object,
        value
      ) => {

        object.fontSize =
          value;

      },

      value =>
        Math.round(
          value
        )

    );



    this.bindTextRange(

      "proTextSpacing",

      "proTextSpacingValue",

      (
        object,
        value
      ) => {

        object.charSpacing =
          value;

      },

      value =>
        Math.round(
          value
        )

    );



    this.bindTextRange(

      "proTextLineHeight",

      "proTextLineHeightValue",

      (
        object,
        value
      ) => {

        object.lineHeight =
          value /
          100;

      },

      value =>
        (
          value /
          100
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

      (
        object,
        value
      ) => {

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
                    button.dataset.align;

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

                      offset:
                        0,

                      color:
                        "#FFF5C5"

                    },

                    {

                      offset:
                        0.46,

                      color:
                        "#F0C34C"

                    },

                    {

                      offset:
                        1,

                      color:
                        "#A97713"

                    }

                  ]

                });

            }
          );


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


    if (!input) {

      return;

    }


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


        const label =
          document.getElementById(
            valueId
          );


        if (label) {

          label.textContent =
            formatter(
              value
            );

        }


        object.setCoords();


        this.canvas.requestRenderAll();

      }
    );


    input.addEventListener(
      "change",
      () => {

        this.commit();

      }
    );

  }



  /* =========================================================
     IMAGE INSPECTOR
  ========================================================= */

  bindImageInspector() {


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


          if (!image) {

            return;

          }


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


          this.updateTransformControls();


          this.commit();

        }
      );


    document
      .getElementById(
        "proImageReset"
      )
      ?.addEventListener(
        "click",
        () => {


          const image =
            this.getSelectedImage();


          if (!image) {

            return;

          }


          image.set({

            scaleX:
              1,

            scaleY:
              1,

            angle:
              0,

            flipX:
              false,

            flipY:
              false,

            opacity:
              1,

            clipPath:
              null

          });


          image.filterBrightness =
            0;


          image.filterContrast =
            0;


          image.filterSaturation =
            0;


          image.filterBlur =
            0;


          image.filterGrayscale =
            false;


          image.filterSepia =
            false;


          image.removeColorEnabled =
            false;


          this.applyImageFilters(
            image
          );


          image.setCoords();


          this.canvas.requestRenderAll();


          this.updateSelectionInspector();


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
                button.dataset.mask
              );

            }
          );

        }
      );

  }



  applyImageMask(
    type
  ) {


    const image =
      this.getSelectedImage();


    if (!image) {

      return;

    }


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

          left:
            0,

          top:
            0,

          originX:
            "center",

          originY:
            "center"

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

          left:
            0,

          top:
            0,

          originX:
            "center",

          originY:
            "center"

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


      const height =
        width *
        1.25;


      image.clipPath =
        new Rect({

          width,

          height,

          rx:
            34,

          ry:
            34,

          left:
            0,

          top:
            0,

          originX:
            "center",

          originY:
            "center"

        });

    }


    image.setCoords();


    this.canvas.requestRenderAll();


    this.commit();

  }



  fitSelectedImage(
    fill
  ) {


    const image =
      this.getSelectedImage();


    if (!image) {

      return;

    }


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

      angle:
        0

    });


    image.setCoords();


    this.canvas.requestRenderAll();


    this.updateSelectionInspector();


    this.commit();

  }



  /* =========================================================
     SHAPE INSPECTOR
  ========================================================= */

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
        "proShapeFill"
      )
      ?.addEventListener(
        "change",
        () => {

          this.commit();

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
        "proShapeStroke"
      )
      ?.addEventListener(
        "change",
        () => {

          this.commit();

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


          const label =
            document.getElementById(
              "proShapeStrokeWidthValue"
            );


          if (label) {

            label.textContent =
              object.strokeWidth;

          }


          this.canvas.requestRenderAll();

        }
      );


    document
      .getElementById(
        "proShapeStrokeWidth"
      )
      ?.addEventListener(
        "change",
        () => {

          this.commit();

        }
      );

  }



  /* =========================================================
     EFFECTS
  ========================================================= */

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


          if (!object) {

            return;

          }


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
        "proShadowColor"
      )
      ?.addEventListener(
        "change",
        () => {

          this.commit();

        }
      );


    document
      .getElementById(
        "proShadowBlur"
      )
      ?.addEventListener(
        "input",
        event => {


          const label =
            document.getElementById(
              "proShadowBlurValue"
            );


          if (label) {

            label.textContent =
              event.target.value;

          }


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

      "proImageBrightnessValue",

      "filterBrightness"

    );


    this.bindImageFilterSlider(

      "proImageContrast",

      "proImageContrastValue",

      "filterContrast"

    );


    this.bindImageFilterSlider(

      "proImageSaturation",

      "proImageSaturationValue",

      "filterSaturation"

    );


    this.bindImageFilterSlider(

      "proImageBlur",

      "proImageBlurValue",

      "filterBlur"

    );



    document
      .getElementById(
        "proGrayscale"
      )
      ?.addEventListener(
        "click",
        () => {


          const image =
            this.getSelectedImage();


          if (!image) {

            return;

          }


          image.filterGrayscale =
            !image.filterGrayscale;


          this.applyImageFilters(
            image
          );


          this.commit();

        }
      );


    document
      .getElementById(
        "proSepia"
      )
      ?.addEventListener(
        "click",
        () => {


          const image =
            this.getSelectedImage();


          if (!image) {

            return;

          }


          image.filterSepia =
            !image.filterSepia;


          this.applyImageFilters(
            image
          );


          this.commit();

        }
      );


    document
      .getElementById(
        "proResetFilters"
      )
      ?.addEventListener(
        "click",
        () => {


          const image =
            this.getSelectedImage();


          if (!image) {

            return;

          }


          image.filterBrightness =
            0;


          image.filterContrast =
            0;


          image.filterSaturation =
            0;


          image.filterBlur =
            0;


          image.filterGrayscale =
            false;


          image.filterSepia =
            false;


          image.removeColorEnabled =
            false;


          this.applyImageFilters(
            image
          );


          this.updateSelectionInspector();


          this.commit();

        }
      );


    document
      .getElementById(
        "proRemoveColorDistance"
      )
      ?.addEventListener(
        "input",
        event => {


          const label =
            document.getElementById(
              "proRemoveColorDistanceValue"
            );


          if (label) {

            label.textContent =
              event.target.value;

          }

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


          if (!image) {

            return;

          }


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



    /* =====================================================
       EFFECTS BACKGROUND COLORS
    ====================================================== */

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
    inputId,
    valueId,
    property
  ) {


    const input =
      document.getElementById(
        inputId
      );


    if (!input) {

      return;

    }


    input.addEventListener(
      "input",
      () => {


        const image =
          this.getSelectedImage();


        if (!image) {

          return;

        }


        image[property] =
          Number(
            input.value
          );


        const label =
          document.getElementById(
            valueId
          );


        if (label) {

          label.textContent =
            input.value;

        }


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



  applyImageFilters(
    image
  ) {


    const list =
      [];


    const brightness =
      Number(
        image.filterBrightness ||
        0
      );


    if (
      brightness !== 0
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
      contrast !== 0
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
      saturation !== 0
    ) {


      list.push(

        new filters.Saturation({

          saturation:
            saturation /
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
      blur > 0
    ) {


      list.push(

        new filters.Blur({

          blur:
            blur /
            100

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


    if (!object) {

      return;

    }


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

        offsetX:
          8,

        offsetY:
          12

      });


    this.canvas.requestRenderAll();

  }



  /* =========================================================
     EXPORT
  ========================================================= */

  bindExportButtons() {


    document
      .getElementById(
        "posterDownloadPngBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          this.exportPoster(
            "png"
          );

        }
      );


    document
      .getElementById(
        "posterDownloadJpgBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          this.exportPoster(
            "jpg"
          );

        }
      );

  }



  exportPoster(
    format
  ) {


    const safeZone =
      this.getSafeZoneObject();


    const safeVisible =
      safeZone?.visible ??
      false;


    if (safeZone) {

      safeZone.visible =
        false;

    }


    this.canvas.discardActiveObject();


    this.canvas.requestRenderAll();


    const data =
      this.canvas.toDataURL({

        format:
          format === "jpg"
            ? "jpeg"
            : "png",

        quality:
          format === "jpg"
            ? 0.96
            : 1,

        multiplier:
          1

      });


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
          /^-|-$|_/g,
          ""
        )
        ?.toLowerCase() ||
      "fwcwl-poster";


    const link =
      document.createElement(
        "a"
      );


    link.href =
      data;


    link.download =
      `${projectName}.${format}`;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    if (safeZone) {

      safeZone.visible =
        safeVisible;

    }


    this.canvas.requestRenderAll();

  }



  /* =========================================================
     EXACT TEMPLATE LIBRARY
  ========================================================= */

  async renderTemplates() {


    const grid =
      document.getElementById(
        "posterTemplateGrid"
      );


    if (!grid) {

      return;

    }


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


          const searchString =
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


          const searchOk =
            !search ||
            searchString.includes(
              search
            );


          return (
            filterOk &&
            searchOk
          );

        }
      );


    const count =
      document.getElementById(
        "posterTemplateCount"
      );


    if (count) {

      count.textContent =
        templates.length;

    }



    /* =====================================================
       STOP OLD PREVIEW OBSERVER
    ====================================================== */

    if (
      this.templatePreviewObserver
    ) {


      this.templatePreviewObserver
        .disconnect();


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



    /* =====================================================
       CARDS
    ====================================================== */

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
              template.collection
                ? template.collection
                    .toUpperCase()
                : (
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
                    ${size.width} /
                    ${size.height};
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



    /* =====================================================
       SELECT TEMPLATE
    ====================================================== */

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
                button.dataset.templateId
              );

            }
          );

        }
      );



    /* =====================================================
       LAZY EXACT PREVIEWS
    ====================================================== */

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


                const preview =
                  entry.target;


                this.templatePreviewObserver
                  ?.unobserve(
                    preview
                  );


                this.loadExactTemplatePreview(

                  preview,

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
              "400px 0px 400px 0px",

            threshold:
              0.01

          }

        );


      previews.forEach(
        preview => {


          this.templatePreviewObserver
            .observe(
              preview
            );

        }
      );


    } else {


      for (
        const preview of previews
      ) {


        await this.loadExactTemplatePreview(

          preview,

          token

        );


        await new Promise(
          resolve => {

            requestAnimationFrame(
              resolve
            );

          }
        );

      }

    }

  }



  /* =========================================================
     EXACT THUMBNAIL LOADER
  ========================================================= */

  async loadExactTemplatePreview(
    previewElement,
    token
  ) {


    if (
      !previewElement ||
      previewElement.dataset.previewLoading ===
        "true"
    ) {

      return;

    }


    const templateId =
      previewElement.dataset
        .templatePreview;


    const template =
      POSTER_TEMPLATES.find(
        item =>
          item.id ===
          templateId
      );


    if (!template) {

      return;

    }


    previewElement.dataset.previewLoading =
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
        !previewElement.isConnected
      ) {

        return;

      }


      previewElement.style.backgroundImage =
        `url("${dataUrl}")`;


      previewElement.classList.add(
        "preview-ready"
      );


      previewElement
        .querySelector(
          ".exact-preview-loading"
        )
        ?.remove();


      previewElement.dataset.previewLoaded =
        "true";


    } catch (
      error
    ) {


      console.warn(

        `Template preview failed: ${template.name}`,

        error

      );


      const loading =
        previewElement.querySelector(
          ".exact-preview-loading"
        );


      if (loading) {


        loading.innerHTML = `

          <small>
            Preview unavailable
          </small>

        `;

      }


    } finally {


      previewElement.dataset.previewLoading =
        "false";

    }

  }



  /* =========================================================
     CREATE EXACT THUMBNAIL
  ========================================================= */

  async getExactTemplatePreview(
    template
  ) {


    const cacheKey =
      [

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


    const size =
      POSTER_SIZES[
        this.state.canvasSize
      ] ||
      POSTER_SIZES.portrait;


    const htmlCanvas =
      document.createElement(
        "canvas"
      );


    htmlCanvas.width =
      size.width;


    htmlCanvas.height =
      size.height;


    const previewCanvas =
      new Canvas(
        htmlCanvas,
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

        previewCanvas,

        template,

        {

          interactive:
            false,

          brandName:
            this.state.brandName,

          canvasSize:
            this.state.canvasSize

        }

      );


      previewCanvas.renderAll();


      /*
       * Full template rendered first.
       * Only after rendering do we downsample the result.
       */

      const dataUrl =
        previewCanvas.toDataURL({

          format:
            "jpeg",

          quality:
            0.90,

          multiplier:
            0.25

        });


      this.templatePreviewCache.set(

        cacheKey,

        dataUrl

      );


      return dataUrl;


    } finally {


      try {

        previewCanvas.dispose();

      } catch {

        /* ignore */

      }

    }

  }



  /* =========================================================
     APPLY TEMPLATE
  ========================================================= */

  async applyTemplate(
    templateId,
    save = true
  ) {


    const template =
      POSTER_TEMPLATES.find(
        item =>
          item.id ===
          templateId
      );


    if (!template) {

      return;

    }


    this.restoring =
      true;


    this.setDrawingMode(
      false
    );


    try {


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



      /*
       * CRITICAL:
       *
       * Main poster and left thumbnail use this exact
       * same render function.
       */

      await this.renderTemplateScene(

        this.canvas,

        template,

        {

          interactive:
            true,

          brandName:
            this.state.brandName,

          canvasSize:
            this.state.canvasSize

        }

      );


      this.ensureSafeZone();


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


    if (save) {

      this.commit();

    }

  }



  /* =========================================================
     SHARED TEMPLATE RENDERER
     ---------------------------------------------------------
     This renders BOTH:
       1. Main poster
       2. Sidebar thumbnail

     Therefore thumbnails cannot visually drift away from
     the actual selected template.
  ========================================================= */

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


    const backgroundAngle =
      template.backgroundAngle ??
      135;



    /* =====================================================
       CLEAR
    ====================================================== */

    targetCanvas.clear();



    /* =====================================================
       BACKGROUND
    ====================================================== */

    const background =
      new Rect({

        left:
          0,

        top:
          0,

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

            backgroundAngle

          ),

        selectable:
          false,

        evented:
          false

      });


    background.id =
      interactive
        ? "poster-background"
        : `preview-bg-${template.id}`;


    background.name =
      "Canvas Background";


    background.typeLabel =
      "background";


    background.editorType =
      "background";


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



    /* =====================================================
       PREMIUM TEMPLATE EFFECTS
    ====================================================== */

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


    await applyTemplateEffects(

      effectBridge,

      template

    );



    /* =====================================================
       CONTENT POSITION
    ====================================================== */

    const alignment =
      template.align ||
      "left";


    const contentY =
      targetCanvas.height *
      (
        (
          template.contentY ??
          48
        ) /
        100
      );



    /* =====================================================
       EYEBROW
    ====================================================== */

    this.addTemplateTextToCanvas(

      targetCanvas,

      template.kicker ||
      "FWCWL • CRICKET",

      {

        name:
          "Eyebrow",

        role:
          "templateEyebrow",

        fontSize:
          25,

        fontFamily:
          "DM Sans",

        fontWeight:
          800,

        fill:
          accent,

        top:
          contentY,

        width:
          targetCanvas.width -
          164,

        textAlign:
          alignment

      },

      interactive

    );



    /* =====================================================
       HEADLINE
    ====================================================== */

    const headline =
      this.addTemplateTextToCanvas(

        targetCanvas,

        template.headline ||
        "MATCH DAY",

        {

          name:
            "Headline",

          role:
            "templateHeadline",

          fontSize:
            template.headlineSize ||
            130,

          fontFamily:
            template.font ||
            "Montserrat",

          fontWeight:
            template.font ===
              "Bebas Neue"
                ? 400
                : 900,

          fill:
            textColor,

          top:
            contentY +
            58,

          width:
            targetCanvas.width -
            164,

          lineHeight:
            0.90,

          textAlign:
            alignment

        },

        interactive

      );


    const headlineHeight =
      headline.getScaledHeight();



    /* =====================================================
       ACCENT LINE
    ====================================================== */

    let accentLeft =
      82;


    if (
      alignment ===
      "center"
    ) {


      accentLeft =
        targetCanvas.width /
        2 -
        39;

    }


    if (
      alignment ===
      "right"
    ) {


      accentLeft =
        targetCanvas.width -
        160;

    }


    const accentLine =
      new Rect({

        left:
          accentLeft,

        top:
          headline.top +
          headlineHeight +
          30,

        width:
          78,

        height:
          7,

        fill:
          accent,

        rx:
          3,

        ry:
          3,

        selectable:
          interactive,

        evented:
          interactive

      });


    this.setTemplateObjectMetadata(

      accentLine,

      "Accent Line",

      "shape",

      "templateAccent",

      interactive

    );


    targetCanvas.add(
      accentLine
    );



    /* =====================================================
       SUBHEADLINE
    ====================================================== */

    this.addTemplateTextToCanvas(

      targetCanvas,

      template.subheadline ||
      "Saturday • Tampa, Florida",

      {

        name:
          "Match Details",

        role:
          "templateDetails",

        fontSize:
          27,

        fontFamily:
          "DM Sans",

        fontWeight:
          500,

        fill:
          this.hexToRgba(
            textColor,
            0.84
          ),

        top:
          accentLine.top +
          43,

        width:
          Math.min(
            720,
            targetCanvas.width -
            164
          ),

        textAlign:
          alignment,

        lineHeight:
          1.32

      },

      interactive

    );



    /* =====================================================
       CTA
    ====================================================== */

    this.addCtaToCanvas(

      targetCanvas,

      template.cta ||
      "MATCH DETAILS",

      accent,

      interactive,

      alignment

    );



    /* =====================================================
       FOOTER
    ====================================================== */

    this.addTemplateTextToCanvas(

      targetCanvas,

      template.footer ||
      "FLORIDA WEST COAST WINTER LEAGUE",

      {

        name:
          "Footer",

        role:
          "templateFooter",

        fontSize:
          20,

        fontFamily:
          "DM Sans",

        fontWeight:
          700,

        fill:
          this.hexToRgba(
            textColor,
            0.70
          ),

        top:
          targetCanvas.height -
          105,

        width:
          targetCanvas.width -
          164

      },

      interactive

    );



    /* =====================================================
       BRAND NAME
    ====================================================== */

    this.addTemplateTextToCanvas(

      targetCanvas,

      brandName,

      {

        name:
          "Brand Name",

        role:
          "brandText",

        fontSize:
          20,

        fontFamily:
          "DM Sans",

        fontWeight:
          800,

        fill:
          this.hexToRgba(
            textColor,
            0.70
          ),

        top:
          targetCanvas.height -
          105,

        left:
          targetCanvas.width -
          300,

        width:
          220,

        textAlign:
          "right"

      },

      interactive

    );



    /* =====================================================
       OFFICIAL LOGO
    ====================================================== */

    await this.addOfficialLogoToCanvas(

      targetCanvas,

      interactive

    );


    targetCanvas.discardActiveObject();


    targetCanvas.requestRenderAll();

  }



  /* =========================================================
     SHARED TEMPLATE TEXT
  ========================================================= */

  addTemplateTextToCanvas(
    targetCanvas,
    text,
    options = {},
    interactive = true
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
            options.fontFamily ??
            "Montserrat",

          fontSize:
            options.fontSize ??
            80,

          fontWeight:
            options.fontWeight ??
            700,

          fill:
            options.fill ??
            "#FFFFFF",

          lineHeight:
            options.lineHeight ??
            1,

          textAlign:
            options.textAlign ??
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


    this.setTemplateObjectMetadata(

      object,

      options.name ||
      "Text",

      "text",

      options.role ||
      null,

      interactive

    );


    targetCanvas.add(
      object
    );


    return object;

  }



  /* =========================================================
     SHARED CTA
  ========================================================= */

  addCtaToCanvas(
    targetCanvas,
    text,
    accent,
    interactive = true,
    alignment = "left"
  ) {


    if (!text) {

      return;

    }


    const width =
      245;


    const height =
      62;


    let left =
      82;


    if (
      alignment ===
      "center"
    ) {


      left =
        targetCanvas.width /
        2 -
        width /
        2;

    }


    if (
      alignment ===
      "right"
    ) {


      left =
        targetCanvas.width -
        82 -
        width;

    }


    const top =
      targetCanvas.height *
      0.79;


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


    this.setTemplateObjectMetadata(

      rect,

      "CTA Background",

      "shape",

      "templateCtaBackground",

      interactive

    );


    const label =
      new Textbox(

        String(text)
          .toUpperCase(),

        {

          left:
            left +
            15,

          top:
            top +
            17,

          width:
            width -
            30,

          fontFamily:
            "DM Sans",

          fontSize:
            20,

          fontWeight:
            800,

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


    this.setTemplateObjectMetadata(

      label,

      "CTA Text",

      "text",

      "templateCtaText",

      interactive

    );


    targetCanvas.add(
      rect
    );


    targetCanvas.add(
      label
    );

  }



  /* =========================================================
     SHARED LOGO
  ========================================================= */

  async addOfficialLogoToCanvas(
    targetCanvas,
    interactive = false
  ) {


    try {


      const image =
        await FabricImage.fromURL(
          "assets/fwcwl-logo.jpeg"
        );


      const maxWidth =
        195;


      const maxHeight =
        130;


      const scale =
        Math.min(

          maxWidth /
          image.width,

          maxHeight /
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


      image.id =
        interactive
          ? "official-fwcwl-logo"
          : `preview-logo-${crypto.randomUUID()}`;


      image.name =
        "Official FWCWL Logo";


      image.typeLabel =
        "brand";


      image.editorType =
        "brand";


      image.isBrand =
        true;


      image.role =
        "officialLogo";


      targetCanvas.add(
        image
      );


      this.moveObjectToIndexOnCanvas(

        targetCanvas,

        image,

        targetCanvas
          .getObjects()
          .length -
        1

      );


    } catch (
      error
    ) {


      const fallback =
        new Textbox(

          "FWCWL",

          {

            left:
              58,

            top:
              58,

            width:
              185,

            fontFamily:
              "Montserrat",

            fontSize:
              35,

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


      fallback.id =
        interactive
          ? "official-fwcwl-logo"
          : crypto.randomUUID();


      fallback.name =
        "FWCWL Logo";


      fallback.typeLabel =
        "brand";


      fallback.editorType =
        "brand";


      fallback.isBrand =
        true;


      fallback.role =
        "officialLogo";


      targetCanvas.add(
        fallback
      );


      this.moveObjectToIndexOnCanvas(

        targetCanvas,

        fallback,

        targetCanvas
          .getObjects()
          .length -
        1

      );

    }

  }



  /* =========================================================
     TEMPLATE METADATA
  ========================================================= */

  setTemplateObjectMetadata(
    object,
    name,
    editorType,
    role = null,
    interactive = true
  ) {


    object.id =
      crypto.randomUUID();


    object.name =
      name;


    object.typeLabel =
      editorType;


    object.editorType =
      editorType;


    if (role) {

      object.role =
        role;

    }


    if (!interactive) {


      object.selectable =
        false;


      object.evented =
        false;


      object.hasControls =
        false;


      object.hasBorders =
        false;

    }

  }



  /* =========================================================
     TEMPLATE GRADIENT
  ========================================================= */

  createTemplateGradient(
    targetCanvas,
    color1,
    color2,
    angle = 135
  ) {


    const radians =
      angle *
      Math.PI /
      180;


    const width =
      targetCanvas.width;


    const height =
      targetCanvas.height;


    const centerX =
      width /
      2;


    const centerY =
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
          centerX -
          dx,

        y1:
          centerY -
          dy,

        x2:
          centerX +
          dx,

        y2:
          centerY +
          dy

      },

      colorStops: [

        {

          offset:
            0,

          color:
            color1

        },

        {

          offset:
            1,

          color:
            color2

        }

      ]

    });

  }



  /* =========================================================
     ADD CUSTOM TEXT
  ========================================================= */

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
            Math.min(
              650,
              this.canvas.width *
              0.70
            ),

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

          borderColor:
            "#F0C34C",

          cornerStrokeColor:
            "#060708",

          transparentCorners:
            false,

          cornerSize:
            16

        }

      );


    this.assignObjectMeta(

      text,

      "Custom Text",

      "text"

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



  /* =========================================================
     ADD PHOTO
  ========================================================= */

  async addPhotoFile(
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

      file.name

    );


    const maxWidth =
      this.canvas.width *
      0.64;


    const maxHeight =
      this.canvas.height *
      0.64;


    const scale =
      Math.min(

        maxWidth /
        image.width,

        maxHeight /
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


    this.updateSelectionInspector();


    this.renderLayers();


    this.commit();

  }



  /* =========================================================
     ADD BACKGROUND PHOTO
  ========================================================= */

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


    /*
     * Index 1 puts background photo over base gradient,
     * but below the generated template texture.
     */

    this.moveObjectToIndex(

      image,

      1

    );


    this.canvas.setActiveObject(
      image
    );


    this.ensureBrandTop();


    this.canvas.requestRenderAll();


    this.updateSelectionInspector();


    this.renderLayers();


    this.commit();

  }



  /* =========================================================
     SPONSOR LOGO
  ========================================================= */

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


    this.updateSelectionInspector();


    this.renderLayers();


    this.commit();

  }



  initializeImageObject(
    image,
    name
  ) {


    this.assignObjectMeta(

      image,

      name,

      "image"

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


    image.filterBlur =
      0;


    image.filterGrayscale =
      false;


    image.filterSepia =
      false;


    image.removeColorEnabled =
      false;

  }



  /* =========================================================
     STICKER
  ========================================================= */

  addSticker(
    sticker
  ) {


    const object =
      new Textbox(

        sticker,

        {

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

          width:
            220,

          fontSize:
            150,

          textAlign:
            "center",

          fill:
            "#FFFFFF",

          cornerColor:
            "#F0C34C",

          borderColor:
            "#F0C34C",

          transparentCorners:
            false

        }

      );


    this.assignObjectMeta(

      object,

      `Sticker ${sticker}`,

      "sticker"

    );


    this.canvas.add(
      object
    );


    this.canvas.setActiveObject(
      object
    );


    this.ensureBrandTop();


    this.canvas.requestRenderAll();


    this.updateSelectionInspector();


    this.renderLayers();


    this.commit();

  }



  /* =========================================================
     SHAPES
  ========================================================= */

  addShape(
    type
  ) {


    let object =
      null;


    if (
      type === "rect"
    ) {


      object =
        new Rect({

          width:
            370,

          height:
            220,

          rx:
            28,

          ry:
            28,

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
            155,

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
            150,

          fill:
            this.state.accent,

          stroke:
            "#FFFFFF",

          strokeWidth:
            7

        });

    }


    if (!object) {

      return;

    }


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

      cornerStrokeColor:
        "#060708",

      borderColor:
        "#F0C34C",

      transparentCorners:
        false

    });


    this.assignObjectMeta(

      object,

      "Shape",

      "shape"

    );


    this.canvas.add(
      object
    );


    this.canvas.setActiveObject(
      object
    );


    this.ensureBrandTop();


    this.canvas.requestRenderAll();


    this.updateSelectionInspector();


    this.renderLayers();


    this.commit();

  }



  /* =========================================================
     BACKGROUND
  ========================================================= */

  createBackgroundLayer() {


    const background =
      new Rect({

        left:
          0,

        top:
          0,

        width:
          this.canvas.width,

        height:
          this.canvas.height,

        originX:
          "left",

        originY:
          "top",

        selectable:
          false,

        evented:
          false,

        fill:
          this.createBackgroundGradient()

      });


    background.id =
      "poster-background";


    background.name =
      "Canvas Background";


    background.typeLabel =
      "background";


    background.editorType =
      "background";


    background.isBackground =
      true;


    this.canvas.add(
      background
    );


    this.moveObjectToIndex(

      background,

      0

    );

  }



  updateBackground() {


    let background =
      this.canvas
        .getObjects()
        .find(
          object =>
            object.isBackground
        );


    if (!background) {


      this.createBackgroundLayer();


      background =
        this.canvas
          .getObjects()
          .find(
            object =>
              object.isBackground
          );

    }


    background.set({

      width:
        this.canvas.width,

      height:
        this.canvas.height,

      fill:
        this.createBackgroundGradient()

    });


    this.canvas.requestRenderAll();

  }



  createBackgroundGradient() {


    return this.createTemplateGradient(

      this.canvas,

      this.state.backgroundColor,

      this.state.backgroundColor2,

      this.state.backgroundAngle

    );

  }



  syncBackgroundInputs() {


    [

      "proBackgroundColor1",

      "proFxBackground1"

    ]
      .forEach(
        id => {


          const input =
            document.getElementById(
              id
            );


          if (input) {

            input.value =
              this.state.backgroundColor;

          }

        }
      );


    [

      "proBackgroundColor2",

      "proFxBackground2"

    ]
      .forEach(
        id => {


          const input =
            document.getElementById(
              id
            );


          if (input) {

            input.value =
              this.state.backgroundColor2;

          }

        }
      );

  }



  /* =========================================================
     BRAND COLORS
  ========================================================= */

  applyBrandAccent() {


    const roles = [

      "templateEyebrow",

      "templateAccent",

      "templateCtaBackground"

    ];


    this.canvas
      .getObjects()
      .forEach(
        object => {


          if (
            roles.includes(
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
            "templateDetails"
          ) {

            object.fill =
              this.hexToRgba(
                this.state.textColor,
                0.84
              );

          }


          if (
            object.role ===
              "templateFooter" ||
            object.role ===
              "brandText"
          ) {

            object.fill =
              this.hexToRgba(
                this.state.textColor,
                0.70
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
          object.role ===
          "brandText"
      )
      .forEach(
        object => {


          object.text =
            this.state.brandName;

        }
      );


    this.canvas.requestRenderAll();

  }



  /* =========================================================
     BRAND TOP
  ========================================================= */

  ensureBrandTop() {


    const logo =
      this.canvas
        .getObjects()
        .find(
          object =>
            object.role ===
            "officialLogo"
        );


    const safe =
      this.getSafeZoneObject();


    if (logo) {


      this.moveObjectToIndex(

        logo,

        this.canvas
          .getObjects()
          .length -
        1

      );

    }


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



  /* =========================================================
     SAFE AREA
  ========================================================= */

  ensureSafeZone() {


    if (
      this.getSafeZoneObject()
    ) {

      return;

    }


    const marginY =
      this.state.canvasSize ===
      "story"
        ? 245
        : 72;


    const safe =
      new Rect({

        left:
          72,

        top:
          marginY,

        width:
          this.canvas.width -
          144,

        height:
          this.canvas.height -
          marginY *
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


    safe.id =
      "safe-zone";


    safe.name =
      "Safe Area";


    safe.typeLabel =
      "ui";


    safe.editorType =
      "ui";


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


    if (!safe) {

      return;

    }


    const marginY =
      this.state.canvasSize ===
      "story"
        ? 245
        : 72;


    safe.set({

      left:
        72,

      top:
        marginY,

      width:
        this.canvas.width -
        144,

      height:
        this.canvas.height -
        marginY *
        2,

      visible:
        this.state.safeZone

    });


    safe.setCoords();


    this.ensureBrandTop();


    this.canvas.requestRenderAll();

  }



  /* =========================================================
     CANVAS SIZE
  ========================================================= */

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


    const selector =
      document.getElementById(
        "posterCanvasSize"
      );


    if (selector) {

      selector.value =
        this.state.canvasSize;

    }


    const dimensions =
      document.getElementById(
        "posterDimensions"
      );


    if (dimensions) {

      dimensions.textContent =
        `${size.width} × ${size.height}`;

    }

  }



  resizeCanvas(
    type
  ) {


    const size =
      POSTER_SIZES[
        type
      ];


    if (!size) {

      return;

    }


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


    const uniformRatio =
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



    /* =====================================================
       SCALE OBJECTS
    ====================================================== */

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
            object.role ===
            "officialLogo"
          ) {


            object.set({

              left:
                58,

              top:
                58

            });


            return;

          }



          /*
           * Textures/decorations can stretch to match
           * the new canvas ratio.
           */

          if (
            object.isTemplateDecoration &&
            object.typeLabel ===
              "texture"
          ) {


            object.left *=
              ratioX;


            object.top *=
              ratioY;


            object.scaleX *=
              ratioX;


            object.scaleY *=
              ratioY;


            object.setCoords();


            return;

          }



          /*
           * Everything else remains proportionally scaled.
           */

          object.left *=
            ratioX;


          object.top *=
            ratioY;


          object.scaleX *=
            uniformRatio;


          object.scaleY *=
            uniformRatio;


          object.setCoords();

        }
      );


    this.updateBackground();


    this.updateSafeZone();


    this.fitCanvasToViewport();


    const dimensions =
      document.getElementById(
        "posterDimensions"
      );


    if (dimensions) {

      dimensions.textContent =
        `${size.width} × ${size.height}`;

    }



    /* =====================================================
       NEW FORMAT = NEW EXACT THUMBNAILS
    ====================================================== */

    this.clearTemplatePreviewCache();


    this.renderTemplates();


    this.canvas.requestRenderAll();


    this.commit();

  }



  /* =========================================================
     ZOOM
  ========================================================= */

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


    const label =
      document.getElementById(
        "posterZoomValue"
      );


    if (label) {

      label.textContent =
        `${Math.round(
          this.state.zoom
        )}%`;

    }

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


    const availableWidth =
      Math.max(

        320,

        stage.clientWidth -
        120

      );


    const availableHeight =
      Math.max(

        300,

        stage.clientHeight -
        100

      );


    const ratio =
      Math.min(

        availableWidth /
        this.canvas.width,

        availableHeight /
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



  /* =========================================================
     SELECTION
  ========================================================= */

  getEditableSelection() {


    const object =
      this.canvas
        .getActiveObject();


    if (!object) {

      return null;

    }


    if (
      object.isBrand ||
      object.isBackground ||
      object.isUi
    ) {

      return null;

    }


    return object;

  }



  getSelectedImage() {


    const object =
      this.getEditableSelection();


    if (!object) {

      return null;

    }


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


    if (
      type.includes(
        "image"
      )
    ) {

      return object;

    }


    return null;

  }



  isTextObject(
    object
  ) {


    if (!object) {

      return false;

    }


    if (
      object.editorType ===
        "text" ||
      object.editorType ===
        "sticker"
    ) {

      return true;

    }


    const type =
      String(
        object.type ||
        ""
      )
        .toLowerCase();


    return [

      "textbox",

      "text",

      "i-text",

      "itext"

    ]
      .includes(
        type
      );

  }



  isShapeObject(
    object
  ) {


    if (!object) {

      return false;

    }


    if (
      object.editorType ===
      "shape"
    ) {

      return true;

    }


    const type =
      String(
        object.type ||
        ""
      )
        .toLowerCase();


    return [

      "rect",

      "circle",

      "triangle",

      "line"

    ]
      .includes(
        type
      );

  }



  /* =========================================================
     INSPECTOR SYNC
  ========================================================= */

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


    const actions =
      document.getElementById(
        "proObjectActionsSection"
      );


    const imageEffects =
      document.getElementById(
        "proImageEffectsSection"
      );


    const badge =
      document.getElementById(
        "proSelectedType"
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


      actions
        ?.classList
        .add(
          "hidden"
        );


      imageEffects
        ?.classList
        .add(
          "hidden"
        );


      if (badge) {

        badge.textContent =
          "None";

      }


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


    actions
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


    if (badge) {


      badge.textContent =
        object.typeLabel ||
        object.editorType ||
        object.type ||
        "Layer";

    }


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


    if (!object) {

      return;

    }


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
        2
      ) *
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

      `${Math.round(
        object.angle ||
        0
      )}°`

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

      `${Math.round(
        opacity
      )}%`

    );

  }



  syncTextInspector(
    object
  ) {


    this.setInputValue(
      "proTextValue",
      object.text ||
      ""
    );


    const font =
      FONT_OPTIONS.includes(
        object.fontFamily
      )
        ? object.fontFamily
        : "Montserrat";


    this.setInputValue(
      "proTextFont",
      font
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



  syncImageInspector(
    image
  ) {


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

      proImageBlur:
        image.filterBlur ||
        0

    };


    Object.entries(
      values
    )
      .forEach(
        (
          [
            id,
            value
          ]
        ) => {


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



  syncShapeInspector(
    object
  ) {


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



  syncCommonEffects(
    object
  ) {


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


    const hasShadow =
      Boolean(
        object.shadow
      );


    const shadowToggle =
      document.getElementById(
        "proShadowEnabled"
      );


    if (shadowToggle) {

      shadowToggle.checked =
        hasShadow;

    }


    if (hasShadow) {


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


      if (
        typeof object.shadow.color ===
        "string"
      ) {


        this.setInputValue(

          "proShadowColor",

          this.safeHex(
            object.shadow.color,
            "#000000"
          )

        );

      }

    }

  }



  /* =========================================================
     LAYERS PANEL
  ========================================================= */

  renderLayers() {


    const list =
      document.getElementById(
        "proLayerList"
      );


    if (!list) {

      return;

    }


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


    if (
      !objects.length
    ) {


      list.innerHTML = `

        <div class="pro-no-selection">
          No layers yet.
        </div>

      `;


      return;

    }


    const active =
      this.canvas
        .getActiveObject();


    list.innerHTML =
      objects
        .map(
          object => {


            const selected =
              active ===
              object
                ? "active"
                : "";


            const icon =
              this.getLayerIcon(
                object
              );


            const locked =
              object.selectable ===
                false ||
              object.lockMovementX ===
                true;


            return `

              <div
                class="pro-layer-row ${selected}"
                data-layer-row="${object.id}"
              >

                <button
                  type="button"
                  class="layer-visible-btn"
                  data-layer-visibility="${object.id}"
                  title="Show / hide layer"
                  ${
                    object.isBrand
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
                  type="button"
                  class="layer-main-btn"
                  data-layer-select="${object.id}"
                >

                  <span class="layer-type-icon">
                    ${icon}
                  </span>


                  <span>

                    <strong>
                      ${this.escapeHtml(
                        object.name ||
                        "Layer"
                      )}
                    </strong>

                    <small>
                      ${this.escapeHtml(
                        object.typeLabel ||
                        object.editorType ||
                        object.type ||
                        "layer"
                      )}
                    </small>

                  </span>

                </button>


                <button
                  type="button"
                  class="layer-lock-btn"
                  data-layer-lock="${object.id}"
                  title="Lock / unlock layer"
                  ${
                    object.isBrand
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



    /* =====================================================
       SELECT LAYER
    ====================================================== */

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
                  button.dataset.layerSelect
                );


              if (
                !object ||
                object.isBrand
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


              if (
                object.selectable ===
                false
              ) {

                return;

              }


              this.canvas.setActiveObject(
                object
              );


              this.canvas.requestRenderAll();


              this.switchInspectorTab(
                "edit"
              );


              this.updateSelectionInspector();


              this.renderLayers();

            }
          );

        }
      );



    /* =====================================================
       VISIBILITY
    ====================================================== */

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
                  button.dataset.layerVisibility
                );


              if (
                !object ||
                object.isBrand
              ) {

                return;

              }


              object.visible =
                object.visible ===
                false;


              if (
                object.visible ===
                false &&
                this.canvas.getActiveObject() ===
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



    /* =====================================================
       LOCK
    ====================================================== */

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
                  button.dataset.layerLock
                );


              if (
                !object ||
                object.isBrand
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

  }



  getLayerIcon(
    object
  ) {


    if (
      object.isBrand
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
      "sticker"
    ) {

      return "★";

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



  /* =========================================================
     LAYER ORDER
  ========================================================= */

  moveSelectedLayer(
    direction
  ) {


    const object =
      this.getEditableSelection();


    if (!object) {

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
      index === -1
    ) {

      return;

    }


    const minIndex =
      1;


    const maxIndex =
      Math.max(

        minIndex,

        objects.length -
        2

      );


    const target =
      Math.max(

        minIndex,

        Math.min(

          maxIndex,

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
    targetCanvas,
    object,
    index
  ) {


    if (
      !targetCanvas ||
      !object
    ) {

      return;

    }


    if (
      typeof targetCanvas.moveObjectTo ===
      "function"
    ) {


      try {


        targetCanvas.moveObjectTo(

          object,

          index

        );


        return;


      } catch {

        /* fallback */

      }

    }


    const objects =
      targetCanvas._objects;


    if (!objects) {

      return;

    }


    const current =
      objects.indexOf(
        object
      );


    if (
      current === -1
    ) {

      return;

    }


    objects.splice(

      current,

      1

    );


    const destination =
      Math.max(

        0,

        Math.min(

          index,

          objects.length

        )

      );


    objects.splice(

      destination,

      0,

      object

    );


    targetCanvas.requestRenderAll();

  }



  /* =========================================================
     DUPLICATE
  ========================================================= */

  async duplicateSelected() {


    const object =
      this.getEditableSelection();


    if (!object) {

      return;

    }


    const clone =
      await object.clone();


    clone.id =
      crypto.randomUUID();


    clone.name =
      `${object.name || "Layer"} Copy`;


    clone.editorType =
      object.editorType;


    clone.typeLabel =
      object.typeLabel;


    clone.role =
      null;


    clone.isTemplateDecoration =
      false;


    clone.isBrand =
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



  /* =========================================================
     DELETE
  ========================================================= */

  deleteSelected() {


    const object =
      this.getEditableSelection();


    if (!object) {

      return;

    }


    this.canvas.remove(
      object
    );


    this.canvas.discardActiveObject();


    this.canvas.requestRenderAll();


    this.renderLayers();


    this.updateSelectionInspector();


    this.commit();

  }



  /* =========================================================
     LOCK
  ========================================================= */

  toggleLockSelected() {


    const object =
      this.getEditableSelection();


    if (!object) {

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



  toggleObjectLock(
    object
  ) {


    const currentlyLocked =

      object.selectable ===
        false ||

      object.lockMovementX ===
        true ||

      object.lockMovementY ===
        true;


    const locking =
      !currentlyLocked;


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


    object.hasControls =
      !locking;


    object.selectable =
      !locking;


    object.evented =
      !locking;

  }



  /* =========================================================
     SNAP
  ========================================================= */

  applyLiveSnap(
    object
  ) {


    if (
      !this.state.snap ||
      !object ||
      object.isBrand ||
      object.isBackground ||
      object.isUi
    ) {

      return;

    }


    const tolerance =
      12;


    const centerX =
      this.canvas.width /
      2;


    const centerY =
      this.canvas.height /
      2;


    const center =
      object.getCenterPoint();


    if (
      Math.abs(
        center.x -
        centerX
      ) <=
      tolerance
    ) {


      object.left +=
        centerX -
        center.x;

    }


    if (
      Math.abs(
        center.y -
        centerY
      ) <=
      tolerance
    ) {


      object.top +=
        centerY -
        center.y;

    }

  }



  /* =========================================================
     HISTORY
  ========================================================= */

  getSnapshot() {


    const canvas =
      this.canvas.toJSON(
        [

          "id",

          "name",

          "typeLabel",

          "editorType",

          "role",

          "isBrand",

          "isBackground",

          "isUi",

          "isTemplateDecoration",

          "filterBrightness",

          "filterContrast",

          "filterSaturation",

          "filterBlur",

          "filterGrayscale",

          "filterSepia",

          "removeColorEnabled",

          "removeColor",

          "removeColorDistance"

        ]
      );


    return JSON.stringify({

      version:
        4,

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



  async restoreSnapshot(
    snapshot
  ) {


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


    } finally {


      this.restoring =
        false;

    }

  }



  /* =========================================================
     AUTOSAVE
  ========================================================= */

  saveProject() {


    try {


      const snapshot =
        this.getSnapshot();


      /*
       * Prevent localStorage quota corruption.
       */

      if (
        snapshot.length <
        4_200_000
      ) {


        localStorage.setItem(

          "fwcwl-poster-pro-v4",

          snapshot

        );

      }


    } catch (
      error
    ) {


      console.warn(

        "Poster autosave skipped:",

        error

      );

    }

  }



  async restoreAutosave() {


    const saved =
      localStorage.getItem(
        "fwcwl-poster-pro-v4"
      );


    if (!saved) {

      return false;

    }


    try {


      await this.restoreSnapshot(
        saved
      );


      return true;


    } catch (
      error
    ) {


      console.warn(

        "Poster autosave could not be restored:",

        error

      );


      localStorage.removeItem(
        "fwcwl-poster-pro-v4"
      );


      return false;

    }

  }



  /* =========================================================
     KEYBOARD
  ========================================================= */

  handleKeyboard(
    event
  ) {


    const editing =

      event.target instanceof
        HTMLInputElement ||

      event.target instanceof
        HTMLTextAreaElement ||

      event.target instanceof
        HTMLSelectElement;


    if (editing) {

      return;

    }


    const command =
      event.ctrlKey ||
      event.metaKey;



    /* =====================================================
       DUPLICATE
    ====================================================== */

    if (
      command &&
      event.key.toLowerCase() ===
      "d"
    ) {


      event.preventDefault();


      this.duplicateSelected();


      return;

    }



    /* =====================================================
       DELETE
    ====================================================== */

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


    if (!object) {

      return;

    }


    const step =
      event.shiftKey
        ? 10
        : 1;


    let changed =
      false;


    if (
      event.key ===
      "ArrowLeft"
    ) {


      object.left -=
        step;


      changed =
        true;

    }


    if (
      event.key ===
      "ArrowRight"
    ) {


      object.left +=
        step;


      changed =
        true;

    }


    if (
      event.key ===
      "ArrowUp"
    ) {


      object.top -=
        step;


      changed =
        true;

    }


    if (
      event.key ===
      "ArrowDown"
    ) {


      object.top +=
        step;


      changed =
        true;

    }


    if (changed) {


      event.preventDefault();


      this.applyLiveSnap(
        object
      );


      object.setCoords();


      this.canvas.requestRenderAll();


      this.updateTransformControls();

    }

  }



  /* =========================================================
     PREVIEW CACHE
  ========================================================= */

  clearTemplatePreviewCache() {


    this.templatePreviewCache.clear();


    this.templatePreviewRenderToken++;


    if (
      this.templatePreviewObserver
    ) {


      this.templatePreviewObserver.disconnect();


      this.templatePreviewObserver =
        null;

    }

  }



  /* =========================================================
     PREVIEW CSS
  ========================================================= */

  ensureExactTemplatePreviewStyles() {


    if (
      document.getElementById(
        "fwcwlExactPreviewStyles"
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "fwcwlExactPreviewStyles";


    style.textContent = `

      /*
       * Exact previews are real template snapshots.
       * Disable old fake preview decoration.
       */

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

        background-color: #08090b !important;

        background-size: contain !important;

        background-position: center !important;

        background-repeat: no-repeat !important;

        border-radius: inherit;

        box-shadow:
          inset 0 0 0 1px
          rgba(255,255,255,.04);

        transition:
          transform .18s ease,
          box-shadow .18s ease,
          opacity .18s ease;
      }


      .poster-template-art.exact-template-preview.preview-ready {
        background-color: #050607 !important;
      }


      .exact-preview-loading {
        position: absolute !important;

        inset: 0 !important;

        z-index: 30 !important;

        display: flex !important;

        flex-direction: column !important;

        align-items: center !important;

        justify-content: center !important;

        gap: 7px !important;

        background:
          linear-gradient(
            145deg,
            #111319,
            #08090c
          ) !important;
      }


      .exact-preview-loading > span {
        position: relative !important;

        left: auto !important;

        right: auto !important;

        top: auto !important;

        bottom: auto !important;

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
          fwcwlExactPreviewSpin
          .75s
          linear
          infinite;
      }


      .exact-preview-loading small {
        position: static !important;

        margin: 0 !important;

        padding: 0 !important;

        color: #5f626a !important;

        background: transparent !important;

        font-size: 5px !important;

        font-weight: 800 !important;

        line-height: 1 !important;

        letter-spacing: .09em !important;

        text-transform: uppercase !important;
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

        color: #4d5058;

        font-size: 4.5px;

        font-weight: 800;

        letter-spacing: .06em;
      }


      .poster-template-card.active
      .poster-template-art.exact-template-preview {
        box-shadow:
          0 0 0 1px #f0c34c,
          0 0 24px rgba(240,195,76,.12);
      }


      .poster-template-card:hover
      .poster-template-art.exact-template-preview {
        transform: translateY(-1px);
      }


      @keyframes fwcwlExactPreviewSpin {

        to {
          transform: rotate(360deg);
        }

      }

    `;


    document.head.appendChild(
      style
    );

  }



  /* =========================================================
     GENERIC OBJECT META
  ========================================================= */

  assignObjectMeta(
    object,
    name,
    editorType
  ) {


    object.id =
      crypto.randomUUID();


    object.name =
      name;


    object.typeLabel =
      editorType;


    object.editorType =
      editorType;

  }



  findObjectById(
    id
  ) {


    return this.canvas
      .getObjects()
      .find(
        object =>
          object.id ===
          id
      );

  }



  /* =========================================================
     BRAND UI SYNC
  ========================================================= */

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



  /* =========================================================
     DOM HELPERS
  ========================================================= */

  setInputValue(
    id,
    value
  ) {


    const input =
      document.getElementById(
        id
      );


    if (input) {

      input.value =
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



  /* =========================================================
     FILE HELPERS
  ========================================================= */

  fileToDataUrl(
    file
  ) {


    return new Promise(
      (
        resolve,
        reject
      ) => {


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



  /* =========================================================
     COLOR HELPERS
  ========================================================= */

  normalizeColor(
    value
  ) {


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



  /* =========================================================
     HTML ESCAPE
  ========================================================= */

  escapeHtml(
    value
  ) {


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
      );

  }


}
