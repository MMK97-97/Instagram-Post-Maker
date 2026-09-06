/* =========================================================
   FWCWL PRO POSTER EDITOR
   Layer-based cricket creative studio
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
   CANVAS SIZES
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
   EDITOR OPTIONS
========================================================= */

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


    this.activeFilter =
      "all";


    this.history =
      [];


    this.historyIndex =
      -1;


    this.restoring =
      false;


    this.initialized =
      false;


    this.buildProUi();

    this.bindCoreCanvasEvents();

    this.bindExistingUi();

    this.bindProUi();

    this.initialize();
  }



  /* =====================================================
     INITIALIZATION
  ====================================================== */

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
  }



  /* =====================================================
     PUBLIC COMPATIBILITY METHODS
  ====================================================== */

  render() {

    this.canvas.requestRenderAll();
  }



  /* =====================================================
     BUILD UI
  ====================================================== */

  buildProUi() {

    this.buildToolRail();

    this.buildAdvancedMediaPanel();

    this.buildAdvancedBrandPanel();

    this.buildAdvancedInspector();
  }



  /* =====================================================
     TOOL RAIL
  ====================================================== */

  buildToolRail() {

    const workspace =
      document.getElementById(
        "posterWorkspace"
      );


    const previous =
      document.getElementById(
        "posterProRail"
      );


    if (previous) {

      previous.remove();
    }


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
        title="Select / Move"
      >
        <span>↖</span>
        <small>Select</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="text"
        title="Add Text"
      >
        <span>T</span>
        <small>Text</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="photo"
        title="Add Photo"
      >
        <span>▧</span>
        <small>Photo</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="shape"
        title="Add Shape"
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
        title="Cricket Stickers"
      >
        <span>★</span>
        <small>Sticker</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="layers"
        title="Layers"
      >
        <span>▤</span>
        <small>Layers</small>
      </button>


      <button
        type="button"
        class="pro-tool"
        data-pro-tool="background"
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



  /* =====================================================
     MEDIA PANEL
  ====================================================== */

  buildAdvancedMediaPanel() {

    const panel =
      document.getElementById(
        "posterMediaPanel"
      );


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
            Add player photos, team logos, sponsors and graphics as editable layers.
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

          <strong>▧</strong>

          <span>
            Background
          </span>

          <small>
            Full canvas
          </small>

        </label>

      </div>


      <div class="section-divider"></div>


      <div class="pro-section-label">
        TEAM / SPONSOR LOGO
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
          Upload Logo
        </strong>

        <span>
          Fully editable layer
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
                title="Add ${sticker}"
              >
                ${sticker}
              </button>

            `
          )
          .join("")}

      </div>


      <div class="section-divider"></div>


      <div class="pro-section-label">
        SHAPES
      </div>


      <div class="pro-shape-grid">

        <button
          type="button"
          data-add-shape="rect"
          title="Rectangle"
        >
          ▰
        </button>

        <button
          type="button"
          data-add-shape="circle"
          title="Circle"
        >
          ●
        </button>

        <button
          type="button"
          data-add-shape="triangle"
          title="Triangle"
        >
          ▲
        </button>

        <button
          type="button"
          data-add-shape="line"
          title="Line"
        >
          ╱
        </button>

        <button
          type="button"
          data-add-shape="badge"
          title="Badge"
        >
          ★
        </button>

      </div>

    `;
  }



  /* =====================================================
     BRAND PANEL
  ====================================================== */

  buildAdvancedBrandPanel() {

    const panel =
      document.getElementById(
        "posterBrandPanel"
      );


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
            Official league branding stays consistent across every poster.
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
            Official FWCWL Mark
          </strong>

          <p>
            Locked top-left on final exports.
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
          Accent Color
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
          Primary Text
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
        CANVAS BACKGROUND
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
          title="FWCWL Maroon"
        ></button>

        <button
          type="button"
          data-bg-preset="#071C29,#66151D"
          style="--a:#071C29;--b:#66151D"
          title="Night Stadium"
        ></button>

        <button
          type="button"
          data-bg-preset="#06141A,#087886"
          style="--a:#06141A;--b:#087886"
          title="Teal Cricket"
        ></button>

        <button
          type="button"
          data-bg-preset="#0A0A0C,#333333"
          style="--a:#0A0A0C;--b:#333333"
          title="Black Steel"
        ></button>

        <button
          type="button"
          data-bg-preset="#5A0E17,#E29E26"
          style="--a:#5A0E17;--b:#E29E26"
          title="Championship"
        ></button>

        <button
          type="button"
          data-bg-preset="#0A1830,#264A8A"
          style="--a:#0A1830;--b:#264A8A"
          title="Royal Blue"
        ></button>

      </div>

    `;
  }



  /* =====================================================
     RIGHT INSPECTOR
  ====================================================== */

  buildAdvancedInspector() {

    const panel =
      document.getElementById(
        "posterRightPanel"
      );


    const scroll =
      panel.querySelector(
        ".right-scroll"
      );


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


      <!-- ================================================
           EDIT
      ================================================= -->
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
            Select a text, photo, logo, sticker or shape directly on the poster.
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
                Flip Horizontal
              </button>

              <button
                type="button"
                id="proFlipY"
              >
                Flip Vertical
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


        <!-- TEXT CONTROLS -->
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


        <!-- IMAGE CONTROLS -->
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
              No Mask
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


        <!-- SHAPE CONTROLS -->
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


        <!-- ACTIONS -->
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
              Bring Forward
            </button>

            <button
              type="button"
              id="proSendBackward"
            >
              Send Backward
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


      <!-- ================================================
           EFFECTS
      ================================================= -->
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
                Add separation and depth
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


        <!-- PHOTO EFFECTS -->
        <section
          id="proImageEffectsSection"
          class="inspector-section hidden"
        >

          <div class="inspector-title">
            PHOTO ADJUSTMENTS
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
              Black & White
            </button>

            <button
              type="button"
              id="proSepia"
            >
              Vintage Sepia
            </button>

            <button
              type="button"
              id="proResetFilters"
            >
              Reset Filters
            </button>

          </div>


          <div class="section-divider"></div>


          <div class="pro-section-label">
            BACKGROUND / COLOR REMOVAL
          </div>


          <p class="pro-helper-text">
            Best for solid white, black or green backgrounds.
          </p>


          <div class="form-field">

            <label>
              Color to Remove
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


        <!-- CANVAS EFFECTS -->
        <section class="inspector-section">

          <div class="inspector-title">
            BACKGROUND
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


      <!-- ================================================
           LAYERS
      ================================================= -->
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


    const footer =
      panel.querySelector(
        ".right-footer"
      );


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



  /* =====================================================
     FABRIC CANVAS EVENTS
  ====================================================== */

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

        event.target?.setCoords?.();

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
            .32;
        }


        this.ensureBrandTop();

        this.renderLayers();

        this.commit();
      }
    );
  }



  /* =====================================================
     EXISTING INDEX CONTROLS
  ====================================================== */

  bindExistingUi() {

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
                  item =>
                    item.classList.remove(
                      "active"
                    )
                );


              document
                .querySelectorAll(
                  "#posterLeftPanel .left-tab-panel"
                )
                .forEach(
                  panel =>
                    panel.classList.remove(
                      "active"
                    )
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


    document
      .getElementById(
        "posterTemplateSearch"
      )
      ?.addEventListener(
        "input",
        () =>
          this.renderTemplates()
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
                  item =>
                    item.classList.remove(
                      "active"
                    )
                );


              button.classList.add(
                "active"
              );


              this.activeFilter =
                button.dataset
                  .filter;


              this.renderTemplates();
            }
          );
        }
      );


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
            !this.state
              .safeZone;


          event.currentTarget
            .classList.toggle(
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
            !this.state
              .snap;


          event.currentTarget
            .classList.toggle(
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


    document
      .getElementById(
        "posterResetBtn"
      )
      ?.addEventListener(
        "click",
        async () => {

          if (
            !confirm(
              "Reset the current poster and load the Match Day template?"
            )
          ) {
            return;
          }


          await this.applyTemplate(
            DEFAULT_TEMPLATE_ID
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

          this.exportPoster(
            "png"
          );
        }
      );
  }



  /* =====================================================
     PRO UI
  ====================================================== */

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



  /* =====================================================
     TOOL RAIL BINDINGS
  ====================================================== */

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
                button.dataset
                  .proTool;


              document
                .querySelectorAll(
                  "[data-pro-tool]"
                )
                .forEach(
                  item =>
                    item.classList.remove(
                      "active"
                    )
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



  /* =====================================================
     TOOL POPOVERS
  ====================================================== */

  showShapePopover() {

    const popover =
      document.getElementById(
        "posterToolPopover"
      );


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
                button.dataset
                  .popShape
              );


              this.hideToolPopover();
            }
          );
        }
      );
  }



  showStickerPopover() {

    const popover =
      document.getElementById(
        "posterToolPopover"
      );


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
                button.dataset
                  .popSticker
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
          Highlighter
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


    color.addEventListener(
      "input",
      () => {

        this.state.brushColor =
          color.value;


        this.configureBrush();
      }
    );


    width.addEventListener(
      "input",
      () => {

        this.state.brushWidth =
          Number(
            width.value
          );


        popover
          .querySelector(
            "#proBrushWidthValue"
          )
          .textContent =
          this.state
            .brushWidth;


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



  /* =====================================================
     DRAW MODE
  ====================================================== */

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



  /* =====================================================
     MEDIA BINDINGS
  ====================================================== */

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
                button.dataset
                  .sticker
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



  /* =====================================================
     BRAND BINDINGS
  ====================================================== */

  bindBrandPanel() {

    document
      .getElementById(
        "posterBrandName"
      )
      ?.addEventListener(
        "input",
        event => {

          this.state.brandName =
            event.target.value;


          this.updateBrandText();
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


          document
            .getElementById(
              "proBackgroundAngleValue"
            )
            .textContent =
            `${this.state.backgroundAngle}°`;


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
                a,
                b
              ] =
                button.dataset
                  .bgPreset
                  .split(",");


              this.state.backgroundColor =
                a;


              this.state.backgroundColor2 =
                b;


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
      () =>
        this.commit()
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
            picker.value
              .toUpperCase();

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



  /* =====================================================
     INSPECTOR TABS
  ====================================================== */

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
      name ===
      "layers"
    ) {

      this.renderLayers();
    }
  }



  /* =====================================================
     COMMON TRANSFORM
  ====================================================== */

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


    this.bindRangeTransform(

      "proObjectScale",

      value => {

        const object =
          this.getEditableSelection();


        if (!object) return;


        const scale =
          value /
          100;


        object.scaleX =
          scale;


        object.scaleY =
          scale;


        object.setCoords();


        document
          .getElementById(
            "proObjectScaleValue"
          )
          .textContent =
          `${Math.round(value)}%`;


        this.canvas.requestRenderAll();
      }

    );


    this.bindRangeTransform(

      "proObjectAngle",

      value => {

        const object =
          this.getEditableSelection();


        if (!object) return;


        object.angle =
          value;


        object.setCoords();


        document
          .getElementById(
            "proObjectAngleValue"
          )
          .textContent =
          `${Math.round(value)}°`;


        this.canvas.requestRenderAll();
      }

    );


    this.bindRangeTransform(

      "proObjectOpacity",

      value => {

        const object =
          this.getEditableSelection();


        if (!object) return;


        object.opacity =
          value /
          100;


        document
          .getElementById(
            "proObjectOpacityValue"
          )
          .textContent =
          `${Math.round(value)}%`;


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

          const object =
            this.getEditableSelection();


          if (!object) return;


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


          if (!object) return;


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
        () =>
          this.duplicateSelected()
      );


    document
      .getElementById(
        "proDeleteObject"
      )
      ?.addEventListener(
        "click",
        () =>
          this.deleteSelected()
      );


    document
      .getElementById(
        "proLockObject"
      )
      ?.addEventListener(
        "click",
        () =>
          this.toggleLockSelected()
      );


    document
      .getElementById(
        "proBringForward"
      )
      ?.addEventListener(
        "click",
        () =>
          this.moveSelectedLayer(
            1
          )
      );


    document
      .getElementById(
        "proSendBackward"
      )
      ?.addEventListener(
        "click",
        () =>
          this.moveSelectedLayer(
            -1
          )
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
      () =>
        this.commit()
    );
  }



  /* =====================================================
     TEXT INSPECTOR
  ====================================================== */

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
        () =>
          this.commit()
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
        () =>
          this.commit()
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
        () =>
          this.commit()
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
                        "#FFF5C5"
                    },

                    {
                      offset: .46,
                      color:
                        "#F0C34C"
                    },

                    {
                      offset: 1,
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


        document
          .getElementById(
            valueId
          )
          .textContent =
          formatter(
            value
          );


        object.setCoords();

        this.canvas.requestRenderAll();
      }
    );


    input.addEventListener(
      "change",
      () =>
        this.commit()
    );
  }



  /* =====================================================
     IMAGE INSPECTOR
  ====================================================== */

  bindImageInspector() {

    document
      .getElementById(
        "proImageFit"
      )
      ?.addEventListener(
        "click",
        () =>
          this.fitSelectedImage(
            false
          )
      );


    document
      .getElementById(
        "proImageFill"
      )
      ?.addEventListener(
        "click",
        () =>
          this.fitSelectedImage(
            true
          )
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


          if (!image) return;


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
                button.dataset
                  .mask
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


    if (!image) return;


    if (
      type ===
      "none"
    ) {

      image.clipPath =
        null;
    }


    if (
      type ===
      "circle"
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
      type ===
      "rounded"
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
            .08,

          ry:
            Math.min(
              image.width,
              image.height
            ) *
            .08,

          originX:
            "center",

          originY:
            "center",

          left: 0,

          top: 0

        });
    }


    if (
      type ===
      "portrait"
    ) {

      const width =
        Math.min(
          image.width,
          image.height *
          .8
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



  fitSelectedImage(
    fill
  ) {

    const image =
      this.getSelectedImage();


    if (!image) return;


    const sx =
      this.canvas.width /
      image.width;


    const sy =
      this.canvas.height /
      image.height;


    const scale =
      fill
        ? Math.max(
            sx,
            sy
          )
        : Math.min(
            sx,
            sy
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



  /* =====================================================
     SHAPE INSPECTOR
  ====================================================== */

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
        () =>
          this.commit()
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
        () =>
          this.commit()
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


          document
            .getElementById(
              "proShapeStrokeWidthValue"
            )
            .textContent =
            object.strokeWidth;


          this.canvas.requestRenderAll();
        }
      );


    document
      .getElementById(
        "proShapeStrokeWidth"
      )
      ?.addEventListener(
        "change",
        () =>
          this.commit()
      );
  }



  /* =====================================================
     EFFECTS
  ====================================================== */

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
        "proShadowColor"
      )
      ?.addEventListener(
        "change",
        () =>
          this.commit()
      );


    document
      .getElementById(
        "proShadowBlur"
      )
      ?.addEventListener(
        "input",
        event => {

          document
            .getElementById(
              "proShadowBlurValue"
            )
            .textContent =
            event.target.value;


          this.updateSelectedShadow();
        }
      );


    document
      .getElementById(
        "proShadowBlur"
      )
      ?.addEventListener(
        "change",
        () =>
          this.commit()
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


          if (!image) return;


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


          if (!image) return;


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


          if (!image) return;


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

          document
            .getElementById(
              "proRemoveColorDistanceValue"
            )
            .textContent =
            event.target.value;
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
              .value;


          image.removeColorDistance =
            Number(
              document
                .getElementById(
                  "proRemoveColorDistance"
                )
                .value
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
    inputId,
    labelId,
    property
  ) {

    const input =
      document.getElementById(
        inputId
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


        document
          .getElementById(
            labelId
          )
          .textContent =
          input.value;


        this.applyImageFilters(
          image
        );
      }
    );


    input.addEventListener(
      "change",
      () =>
        this.commit()
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
            .2

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
        .checked;


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
            .value,

        blur:
          Number(
            document
              .getElementById(
                "proShadowBlur"
              )
              .value
          ),

        offsetX:
          8,

        offsetY:
          12

      });


    this.canvas.requestRenderAll();
  }



  /* =====================================================
     EXPORT
  ====================================================== */

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
            ? .96
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



  /* =====================================================
     TEMPLATES
  ====================================================== */

  renderTemplates() {

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


          const searchText =
            [

              template.name,

              template.headline,

              template.kicker,

              template.category,

              template.collection,

              template.templateStyle,

              template.texture

            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          const searchOk =
            !search ||
            searchText.includes(
              search
            );


          return (
            filterOk &&
            searchOk
          );
        }
      );


    document
      .getElementById(
        "posterTemplateCount"
      )
      .textContent =
      templates.length;


    grid.innerHTML =
      templates
        .map(
          template => {

            const active =
              this.state.template ===
              template.id
                ? "active"
                : "";


            const label =
              template.collection
                ? template.collection
                    .toUpperCase()
                : template.category
                    ?.toUpperCase() ||
                  "CRICKET";


            return `

              <button
                class="poster-template-card ${active}"
                data-template-id="${template.id}"
                type="button"
              >

                <div
                  class="poster-template-art"
                  style="
                    --preview-bg-1:${template.background || "#101216"};
                    --preview-bg-2:${template.bg2 || "#050607"};
                    --preview-accent:${template.accent || "#F0C34C"};
                  "
                >

                  <img
                    src="assets/fwcwl-logo.jpeg"
                    alt=""
                  />


                  <span>
                    ${this.escapeHtml(
                      template.kicker ||
                      label
                    )}
                  </span>


                  <strong>
                    ${this.escapeHtml(
                      template.headline ||
                      template.name
                    )
                      .replace(
                        /\n/g,
                        "<br>"
                      )}
                  </strong>


                  <small>
                    ${this.escapeHtml(
                      label
                    )}
                  </small>

                </div>


                <div class="poster-template-name">

                  <span>
                    ${this.escapeHtml(
                      template.name
                    )}
                  </span>

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
                  .templateId
              );
            }
          );
        }
      );
  }



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


    if (!template) return;


    this.restoring =
      true;


    this.setDrawingMode(
      false
    );


    this.canvas.clear();


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


    this.syncBrandInputs();


    this.createBackgroundLayer();


    await applyTemplateEffects(
      this,
      template
    );


    const contentY =
      this.canvas.height *
      (
        (
          template.contentY ??
          48
        ) /
        100
      );


    /* EYEBROW */

    this.addTemplateText(

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
          this.state.accent,

        top:
          contentY,

        width:
          this.canvas.width -
          164

      }

    );


    /* HEADLINE */

    const headline =
      this.addTemplateText(

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
            this.state.textColor,

          top:
            contentY +
            58,

          width:
            this.canvas.width -
            164,

          lineHeight:
            .9,

          textAlign:
            template.align ||
            "left"

        }

      );


    const headlineHeight =
      headline.getScaledHeight();


    /* ACCENT LINE */

    const accentLine =
      new Rect({

        left:
          82,

        top:
          headline.top +
          headlineHeight +
          30,

        width:
          78,

        height:
          7,

        fill:
          this.state.accent,

        rx:
          3,

        ry:
          3

      });


    this.assignObjectMeta(
      accentLine,
      "Accent Line",
      "shape"
    );


    accentLine.role =
      "templateAccent";


    this.canvas.add(
      accentLine
    );


    /* DETAILS */

    this.addTemplateText(

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
            this.state.textColor,
            .84
          ),

        top:
          accentLine.top +
          43,

        width:
          Math.min(
            720,
            this.canvas.width -
            164
          ),

        lineHeight:
          1.32

      }

    );


    /* CTA */

    this.addCta(

      template.cta ||
      "MATCH DETAILS",

      this.state.accent

    );


    /* FOOTER */

    this.addTemplateText(

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
            this.state.textColor,
            .70
          ),

        top:
          this.canvas.height -
          105,

        width:
          this.canvas.width -
          164

      }

    );


    /* BRAND NAME */

    this.addTemplateText(

      this.state.brandName,

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
            this.state.textColor,
            .70
          ),

        top:
          this.canvas.height -
          105,

        left:
          this.canvas.width -
          300,

        width:
          220,

        textAlign:
          "right"

      }

    );


    await this.addOfficialLogo();


    this.ensureSafeZone();


    this.canvas.discardActiveObject();

    this.ensureBrandTop();

    this.canvas.requestRenderAll();


    this.restoring =
      false;


    this.renderTemplates();

    this.renderLayers();

    this.updateSelectionInspector();


    if (save) {

      this.commit();
    }
  }



  addTemplateText(
    text,
    options = {}
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

      options.name ||
      "Text",

      "text"

    );


    if (
      options.role
    ) {

      object.role =
        options.role;
    }


    this.canvas.add(
      object
    );


    return object;
  }



  addCta(
    text,
    accent
  ) {

    if (!text) return;


    const y =
      this.canvas.height *
      .79;


    const rect =
      new Rect({

        left:
          82,

        top:
          y,

        width:
          245,

        height:
          62,

        fill:
          accent,

        rx:
          10,

        ry:
          10

      });


    this.assignObjectMeta(
      rect,
      "CTA Background",
      "shape"
    );


    rect.role =
      "templateCtaBackground";


    const label =
      new Textbox(

        String(text)
          .toUpperCase(),

        {

          left:
            97,

          top:
            y +
            17,

          width:
            215,

          fontFamily:
            "DM Sans",

          fontSize:
            20,

          fontWeight:
            800,

          fill:
            "#111111",

          textAlign:
            "center"

        }

      );


    this.assignObjectMeta(
      label,
      "CTA Text",
      "text"
    );


    label.role =
      "templateCtaText";


    this.canvas.add(
      rect,
      label
    );
  }



  /* =====================================================
     ADD TEXT
  ====================================================== */

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
              .7
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



  /* =====================================================
     ADD PHOTOS
  ====================================================== */

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
      .64;


    const maxHeight =
      this.canvas.height *
      .64;


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
     * Background is placed above base color/texture,
     * but below editable design content.
     */

    this.moveObjectToIndex(
      image,
      2
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



  /* =====================================================
     STICKERS
  ====================================================== */

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



  /* =====================================================
     SHAPES
  ====================================================== */

  addShape(
    type
  ) {

    let object =
      null;


    switch (type) {

      case "rect":

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

        break;


      case "circle":

        object =
          new Circle({

            radius:
              155,

            fill:
              this.state.accent

          });

        break;


      case "triangle":

        object =
          new Triangle({

            width:
              310,

            height:
              290,

            fill:
              this.state.accent

          });

        break;


      case "line":

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

        break;


      case "badge":

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

        break;
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



  /* =====================================================
     BACKGROUND
  ====================================================== */

  createBackgroundLayer() {

    const background =
      new Rect({

        left: 0,

        top: 0,

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

    const angle =
      this.state.backgroundAngle *
      Math.PI /
      180;


    const width =
      this.canvas.width;


    const height =
      this.canvas.height;


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
        angle
      ) *
      length /
      2;


    const dy =
      Math.sin(
        angle
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
          offset: 0,
          color:
            this.state
              .backgroundColor
        },

        {
          offset: 1,
          color:
            this.state
              .backgroundColor2
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

          const input =
            document.getElementById(
              id
            );


          if (input) {

            input.value =
              this.state
                .backgroundColor;
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
              this.state
                .backgroundColor2;
          }
        }
      );
  }



  /* =====================================================
     BRAND COLOR APPLICATION
  ====================================================== */

  applyBrandAccent() {

    const accentRoles = [

      "templateEyebrow",
      "templateAccent",
      "templateCtaBackground"

    ];


    this.canvas
      .getObjects()
      .forEach(
        object => {

          if (
            accentRoles.includes(
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
              this.state
                .textColor;
          }


          if (
            object.role ===
            "templateDetails"
          ) {

            object.fill =
              this.hexToRgba(
                this.state.textColor,
                .84
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
                .70
              );
          }
        }
      );


    this.canvas.requestRenderAll();
  }



  /* =====================================================
     OFFICIAL LOGO
  ====================================================== */

  async addOfficialLogo() {

    const existing =
      this.canvas
        .getObjects()
        .find(
          object =>
            object.role ===
            "officialLogo"
        );


    if (existing) {

      this.canvas.remove(
        existing
      );
    }


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
      "official-fwcwl-logo";


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


    this.canvas.add(
      image
    );


    this.ensureBrandTop();
  }



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
            this.state
              .brandName;
        }
      );


    this.canvas.requestRenderAll();
  }



  /* =====================================================
     SAFE ZONE
  ====================================================== */

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

        strokeDashArray:
          [
            14,
            12
          ],

        selectable:
          false,

        evented:
          false,

        visible:
          this.state
            .safeZone

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
        this.state
          .safeZone

    });


    safe.setCoords();

    this.ensureBrandTop();

    this.canvas.requestRenderAll();
  }



  /* =====================================================
     CANVAS SIZE / ZOOM
  ====================================================== */

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


    document
      .getElementById(
        "posterCanvasSize"
      )
      .value =
      this.state
        .canvasSize;


    document
      .getElementById(
        "posterDimensions"
      )
      .textContent =
      `${size.width} × ${size.height}`;
  }



  resizeCanvas(
    type
  ) {

    const size =
      POSTER_SIZES[
        type
      ];


    if (!size) return;


    const oldWidth =
      this.canvas.width;


    const oldHeight =
      this.canvas.height;


    const scaleX =
      size.width /
      oldWidth;


    const scaleY =
      size.height /
      oldHeight;


    const scale =
      Math.min(
        scaleX,
        scaleY
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


          object.left *=
            scaleX;


          object.top *=
            scaleY;


          object.scaleX *=
            scale;


          object.scaleY *=
            scale;


          object.setCoords();
        }
      );


    this.updateBackground();

    this.updateSafeZone();

    this.fitCanvasToViewport();


    document
      .getElementById(
        "posterDimensions"
      )
      .textContent =
      `${size.width} × ${size.height}`;


    this.canvas.requestRenderAll();

    this.commit();
  }



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


    document
      .getElementById(
        "posterZoomValue"
      )
      .textContent =
      `${Math.round(
        this.state.zoom
      )}%`;
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
        300,
        stage.clientWidth -
        120
      );


    const availableHeight =
      Math.max(
        300,
        stage.clientHeight -
        90
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



  /* =====================================================
     SELECTION HELPERS
  ====================================================== */

  getEditableSelection() {

    const object =
      this.canvas
        .getActiveObject();


    if (
      !object ||
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


    if (
      !object
    ) {
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


    return type.includes(
      "image"
    )
      ? object
      : null;
  }



  isTextObject(
    object
  ) {

    if (!object) return false;


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

    ].includes(
      type
    );
  }



  isShapeObject(
    object
  ) {

    if (!object) return false;


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

    ].includes(
      type
    );
  }



  /* =====================================================
     SELECTION INSPECTOR
  ====================================================== */

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


    if (!object) {

      noSelection?.classList
        .remove(
          "hidden"
        );


      controls?.classList
        .add(
          "hidden"
        );


      textSection?.classList
        .add(
          "hidden"
        );


      imageSection?.classList
        .add(
          "hidden"
        );


      shapeSection?.classList
        .add(
          "hidden"
        );


      actions?.classList
        .add(
          "hidden"
        );


      imageEffects?.classList
        .add(
          "hidden"
        );


      document
        .getElementById(
          "proSelectedType"
        )
        .textContent =
        "None";


      return;
    }


    noSelection?.classList
      .add(
        "hidden"
      );


    controls?.classList
      .remove(
        "hidden"
      );


    actions?.classList
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


    textSection?.classList
      .toggle(
        "hidden",
        !isText
      );


    imageSection?.classList
      .toggle(
        "hidden",
        !isImage
      );


    shapeSection?.classList
      .toggle(
        "hidden",
        !isShape
      );


    imageEffects?.classList
      .toggle(
        "hidden",
        !isImage
      );


    document
      .getElementById(
        "proSelectedType"
      )
      .textContent =
      object.typeLabel ||
      object.editorType ||
      object.type ||
      "Layer";


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


    document
      .getElementById(
        "proObjectName"
      )
      .value =
      object.name ||
      "Layer";


    document
      .getElementById(
        "proObjectX"
      )
      .value =
      Math.round(
        object.left ||
        0
      );


    document
      .getElementById(
        "proObjectY"
      )
      .value =
      Math.round(
        object.top ||
        0
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


    document
      .getElementById(
        "proObjectScale"
      )
      .value =
      Math.max(
        10,
        Math.min(
          400,
          scale
        )
      );


    document
      .getElementById(
        "proObjectScaleValue"
      )
      .textContent =
      `${Math.round(scale)}%`;


    document
      .getElementById(
        "proObjectAngle"
      )
      .value =
      object.angle ||
      0;


    document
      .getElementById(
        "proObjectAngleValue"
      )
      .textContent =
      `${Math.round(
        object.angle ||
        0
      )}°`;


    const opacity =
      (
        object.opacity ??
        1
      ) *
      100;


    document
      .getElementById(
        "proObjectOpacity"
      )
      .value =
      Math.round(
        opacity
      );


    document
      .getElementById(
        "proObjectOpacityValue"
      )
      .textContent =
      `${Math.round(
        opacity
      )}%`;
  }



  syncTextInspector(
    object
  ) {

    document
      .getElementById(
        "proTextValue"
      )
      .value =
      object.text ||
      "";


    const font =
      FONT_OPTIONS.includes(
        object.fontFamily
      )
        ? object.fontFamily
        : "Montserrat";


    document
      .getElementById(
        "proTextFont"
      )
      .value =
      font;


    document
      .getElementById(
        "proTextWeight"
      )
      .value =
      String(
        object.fontWeight ||
        400
      );


    document
      .getElementById(
        "proTextSize"
      )
      .value =
      object.fontSize ||
      80;


    document
      .getElementById(
        "proTextSizeValue"
      )
      .textContent =
      Math.round(
        object.fontSize ||
        80
      );


    document
      .getElementById(
        "proTextSpacing"
      )
      .value =
      object.charSpacing ||
      0;


    document
      .getElementById(
        "proTextSpacingValue"
      )
      .textContent =
      Math.round(
        object.charSpacing ||
        0
      );


    document
      .getElementById(
        "proTextLineHeight"
      )
      .value =
      (
        object.lineHeight ||
        1
      ) *
      100;


    document
      .getElementById(
        "proTextLineHeightValue"
      )
      .textContent =
      (
        object.lineHeight ||
        1
      )
        .toFixed(
          2
        );


    if (
      typeof object.fill ===
      "string"
    ) {

      document
        .getElementById(
          "proTextFill"
        )
        .value =
        this.safeHex(
          object.fill,
          "#FFFFFF"
        );
    }


    document
      .getElementById(
        "proTextStroke"
      )
      .value =
      this.safeHex(
        object.stroke,
        "#000000"
      );


    document
      .getElementById(
        "proTextStrokeWidth"
      )
      .value =
      object.strokeWidth ||
      0;


    document
      .getElementById(
        "proTextStrokeWidthValue"
      )
      .textContent =
      object.strokeWidth ||
      0;


    document
      .querySelectorAll(
        "#proTextAlign [data-align]"
      )
      .forEach(
        button => {

          button.classList.toggle(

            "active",

            button.dataset
              .align ===
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
        ([id, value]) => {

          const input =
            document.getElementById(
              id
            );


          const label =
            document.getElementById(
              `${id}Value`
            );


          if (input) {

            input.value =
              value;
          }


          if (label) {

            label.textContent =
              value;
          }
        }
      );
  }



  syncShapeInspector(
    object
  ) {

    document
      .getElementById(
        "proShapeFill"
      )
      .value =
      this.safeHex(
        object.fill,
        "#F0C34C"
      );


    document
      .getElementById(
        "proShapeStroke"
      )
      .value =
      this.safeHex(
        object.stroke,
        "#FFFFFF"
      );


    document
      .getElementById(
        "proShapeStrokeWidth"
      )
      .value =
      object.strokeWidth ||
      0;


    document
      .getElementById(
        "proShapeStrokeWidthValue"
      )
      .textContent =
      object.strokeWidth ||
      0;
  }



  syncCommonEffects(
    object
  ) {

    const blend =
      object.globalCompositeOperation ||
      "source-over";


    const blendInput =
      document.getElementById(
        "proBlendMode"
      );


    if (
      BLEND_MODES.includes(
        blend
      )
    ) {

      blendInput.value =
        blend;

    } else {

      blendInput.value =
        "source-over";
    }


    const hasShadow =
      Boolean(
        object.shadow
      );


    document
      .getElementById(
        "proShadowEnabled"
      )
      .checked =
      hasShadow;


    if (hasShadow) {

      document
        .getElementById(
          "proShadowBlur"
        )
        .value =
        object.shadow.blur ||
        25;


      document
        .getElementById(
          "proShadowBlurValue"
        )
        .textContent =
        object.shadow.blur ||
        25;
    }
  }



  /* =====================================================
     LAYERS PANEL
  ====================================================== */

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


    document
      .getElementById(
        "proLayerCount"
      )
      .textContent =
      objects.length;


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
              false;


            return `

              <div
                class="pro-layer-row ${selected}"
                data-layer-row="${object.id}"
              >

                <button
                  type="button"
                  class="layer-visible-btn"
                  data-layer-visibility="${object.id}"
                  title="Show / Hide"
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
                  title="Lock / Unlock"
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


              if (!object) return;


              object.visible =
                object.visible ===
                false;


              this.canvas.requestRenderAll();

              this.renderLayers();

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



  /* =====================================================
     LAYER ORDER
  ====================================================== */

  moveSelectedLayer(
    direction
  ) {

    const object =
      this.getEditableSelection();


    if (!object) return;


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

    if (
      typeof this.canvas
        .moveObjectTo ===
      "function"
    ) {

      try {

        this.canvas.moveObjectTo(
          object,
          index
        );


        return;

      } catch {
        /* use fallback */
      }
    }


    const objects =
      this.canvas._objects;


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


    this.canvas.requestRenderAll();
  }



  /* =====================================================
     DUPLICATE / DELETE / LOCK
  ====================================================== */

  async duplicateSelected() {

    const object =
      this.getEditableSelection();


    if (!object) return;


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



  deleteSelected() {

    const object =
      this.getEditableSelection();


    if (!object) return;


    this.canvas.remove(
      object
    );


    this.canvas.discardActiveObject();

    this.canvas.requestRenderAll();

    this.renderLayers();

    this.updateSelectionInspector();

    this.commit();
  }



  toggleLockSelected() {

    const object =
      this.getEditableSelection();


    if (!object) return;


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

    const locking =
      !object.lockMovementX;


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



  /* =====================================================
     SNAP
  ====================================================== */

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



  /* =====================================================
     HISTORY
  ====================================================== */

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
        3,

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



  /* =====================================================
     AUTOSAVE
  ====================================================== */

  saveProject() {

    try {

      const snapshot =
        this.getSnapshot();


      /*
       * Browser localStorage is intentionally only used
       * for smaller projects. Large uploaded photography
       * can exceed browser storage limits.
       */

      if (
        snapshot.length <
        4_200_000
      ) {

        localStorage.setItem(

          "fwcwl-poster-pro-v3",

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
        "fwcwl-poster-pro-v3"
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
        "Saved poster could not be restored:",
        error
      );


      localStorage.removeItem(
        "fwcwl-poster-pro-v3"
      );


      return false;
    }
  }



  /* =====================================================
     KEYBOARD
  ====================================================== */

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


    if (editing) return;


    const command =
      event.ctrlKey ||
      event.metaKey;


    if (
      command &&
      event.key.toLowerCase() ===
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



  /* =====================================================
     OBJECT HELPERS
  ====================================================== */

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



  /* =====================================================
     BRAND INPUT SYNC
  ====================================================== */

  syncBrandInputs() {

    const brand =
      document.getElementById(
        "posterBrandName"
      );


    if (brand) {

      brand.value =
        this.state
          .brandName;
    }


    const accent =
      document.getElementById(
        "posterAccentColor"
      );


    const accentText =
      document.getElementById(
        "posterAccentColorText"
      );


    if (accent) {

      accent.value =
        this.state
          .accent;
    }


    if (accentText) {

      accentText.value =
        this.state
          .accent;
    }


    const text =
      document.getElementById(
        "posterTextColor"
      );


    const textString =
      document.getElementById(
        "posterTextColorText"
      );


    if (text) {

      text.value =
        this.state
          .textColor;
    }


    if (textString) {

      textString.value =
        this.state
          .textColor;
    }


    const angle =
      document.getElementById(
        "proBackgroundAngle"
      );


    if (angle) {

      angle.value =
        this.state
          .backgroundAngle;
    }


    const angleLabel =
      document.getElementById(
        "proBackgroundAngleValue"
      );


    if (angleLabel) {

      angleLabel.textContent =
        `${this.state.backgroundAngle}°`;
    }


    document
      .getElementById(
        "posterCanvasSize"
      )
      .value =
      this.state
        .canvasSize;


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



  /* =====================================================
     FILE / COLOR UTILITIES
  ====================================================== */

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
          () =>
            resolve(
              reader.result
            );


        reader.onerror =
          reject;


        reader.readAsDataURL(
          file
        );
      }
    );
  }



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
