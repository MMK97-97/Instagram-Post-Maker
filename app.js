"use strict";

/* =========================================================
   INSTAGRAM POST STUDIO
   Pure frontend / GitHub Pages compatible
========================================================= */


/* =========================================================
   DOM
========================================================= */

const canvas = document.getElementById("posterCanvas");
const ctx = canvas.getContext("2d");

const els = {
  projectName: document.getElementById("projectName"),

  canvasSize: document.getElementById("canvasSize"),
  canvasDimensions: document.getElementById("canvasDimensions"),
  exportResolution: document.getElementById("exportResolution"),

  kickerText: document.getElementById("kickerText"),
  headlineText: document.getElementById("headlineText"),
  subheadlineText: document.getElementById("subheadlineText"),
  ctaText: document.getElementById("ctaText"),
  footerText: document.getElementById("footerText"),

  brandName: document.getElementById("brandName"),

  primaryColor: document.getElementById("primaryColor"),
  primaryColorText: document.getElementById("primaryColorText"),

  textColor: document.getElementById("textColor"),
  textColorText: document.getElementById("textColorText"),

  backgroundColor: document.getElementById("backgroundColor"),
  backgroundColorText: document.getElementById("backgroundColorText"),

  headlineFont: document.getElementById("headlineFont"),
  bodyFont: document.getElementById("bodyFont"),
  headlineSize: document.getElementById("headlineSize"),
  headlineSizeValue: document.getElementById("headlineSizeValue"),
  contentY: document.getElementById("contentY"),
  contentYValue: document.getElementById("contentYValue"),

  overlayOpacity: document.getElementById("overlayOpacity"),
  overlayValue: document.getElementById("overlayValue"),

  brightness: document.getElementById("brightness"),
  brightnessValue: document.getElementById("brightnessValue"),

  saturation: document.getElementById("saturation"),
  saturationValue: document.getElementById("saturationValue"),

  accentGlow: document.getElementById("accentGlow"),

  backgroundInput: document.getElementById("backgroundInput"),
  backgroundUploadZone: document.getElementById("backgroundUploadZone"),
  backgroundPreviewWrap: document.getElementById("backgroundPreviewWrap"),
  backgroundPreview: document.getElementById("backgroundPreview"),
  removeBackgroundBtn: document.getElementById("removeBackgroundBtn"),

  imageScale: document.getElementById("imageScale"),
  imageScaleValue: document.getElementById("imageScaleValue"),

  imageX: document.getElementById("imageX"),
  imageXValue: document.getElementById("imageXValue"),

  imageY: document.getElementById("imageY"),
  imageYValue: document.getElementById("imageYValue"),

  logoUploadBtn: document.getElementById("logoUploadBtn"),
  logoInput: document.getElementById("logoInput"),
  logoPreviewWrap: document.getElementById("logoPreviewWrap"),
  logoPreview: document.getElementById("logoPreview"),
  removeLogoBtn: document.getElementById("removeLogoBtn"),

  safeZoneBtn: document.getElementById("safeZoneBtn"),

  zoomOutBtn: document.getElementById("zoomOutBtn"),
  zoomInBtn: document.getElementById("zoomInBtn"),
  zoomLabel: document.getElementById("zoomLabel"),

  undoBtn: document.getElementById("undoBtn"),
  redoBtn: document.getElementById("redoBtn"),
  resetBtn: document.getElementById("resetBtn"),

  exportTopBtn: document.getElementById("exportTopBtn"),
  exportModal: document.getElementById("exportModal"),
  closeExportModal: document.getElementById("closeExportModal"),

  downloadPngBtn: document.getElementById("downloadPngBtn"),
  downloadJpgBtn: document.getElementById("downloadJpgBtn")
};


/* =========================================================
   CANVAS PRESETS
========================================================= */

const CANVAS_SIZES = {
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
   STATE
========================================================= */

const defaultState = {
  projectName: "Untitled Campaign",

  canvasSize: "portrait",

  template: "midnight",

  kicker: "NEW COLLECTION",

  headline: "DESIGNED\nTO STAND OUT.",

  subheadline:
    "Premium design for people who refuse to blend in.",

  cta: "SHOP NOW",

  footer: "@yourbrand",

  brandName: "YOUR BRAND",

  primaryColor: "#F6FF63",

  textColor: "#FFFFFF",

  backgroundColor: "#0B0B0C",

  headlineFont: "Montserrat",

  bodyFont: "DM Sans",

  headlineSize: 108,

  contentY: 58,

  textAlign: "left",

  overlayOpacity: 35,

  brightness: 100,

  saturation: 100,

  accentGlow: true,

  imageScale: 100,

  imageX: 50,

  imageY: 50,

  safeZone: false,

  zoom: 70,

  backgroundImage: null,

  logoImage: null
};


let state = structuredClone(defaultState);

let backgroundImageObject = null;
let logoImageObject = null;

let history = [];
let historyIndex = -1;

let saveTimer = null;


/* =========================================================
   TEMPLATES
========================================================= */

const templates = {
  midnight: {
    kicker: "NEW COLLECTION",
    headline: "DESIGNED\nTO STAND OUT.",
    subheadline:
      "Premium design for people who refuse to blend in.",
    cta: "SHOP NOW",
    footer: "@yourbrand",
    primaryColor: "#F6FF63",
    textColor: "#FFFFFF",
    backgroundColor: "#0B0B0C",
    headlineFont: "Montserrat",
    bodyFont: "DM Sans",
    headlineSize: 108,
    contentY: 58,
    textAlign: "left",
    overlayOpacity: 35,
    accentGlow: true
  },

  editorial: {
    kicker: "THE EDIT • 2026",
    headline: "TIMELESS\nBY DESIGN.",
    subheadline:
      "A modern editorial story built around form, detail and restraint.",
    cta: "DISCOVER",
    footer: "ISSUE 01 / YOUR BRAND",
    primaryColor: "#111111",
    textColor: "#111111",
    backgroundColor: "#E9E5DD",
    headlineFont: "Playfair Display",
    bodyFont: "DM Sans",
    headlineSize: 116,
    contentY: 49,
    textAlign: "left",
    overlayOpacity: 8,
    accentGlow: false
  },

  sale: {
    kicker: "48 HOURS ONLY",
    headline: "40%\nOFF",
    subheadline:
      "Your biggest offer deserves a creative that cannot be ignored.",
    cta: "SHOP THE SALE",
    footer: "ENDS SUNDAY • @yourbrand",
    primaryColor: "#FFF1A8",
    textColor: "#FFFFFF",
    backgroundColor: "#D83030",
    headlineFont: "Montserrat",
    bodyFont: "DM Sans",
    headlineSize: 154,
    contentY: 49,
    textAlign: "center",
    overlayOpacity: 20,
    accentGlow: true
  },

  event: {
    kicker: "OCTOBER 18 • 7:00 PM",
    headline: "THE\nEVENT",
    subheadline:
      "An unforgettable night of ideas, energy and connection.",
    cta: "GET TICKETS",
    footer: "MIAMI • FLORIDA",
    primaryColor: "#FFD861",
    textColor: "#FFFFFF",
    backgroundColor: "#3A1D5F",
    headlineFont: "Bebas Neue",
    bodyFont: "Poppins",
    headlineSize: 152,
    contentY: 48,
    textAlign: "left",
    overlayOpacity: 32,
    accentGlow: true
  },

  minimal: {
    kicker: "INTRODUCING",
    headline: "LESS,\nBETTER.",
    subheadline:
      "Built with intention. Designed to last.",
    cta: "EXPLORE",
    footer: "01 / 04",
    primaryColor: "#111111",
    textColor: "#111111",
    backgroundColor: "#F3F1EB",
    headlineFont: "Montserrat",
    bodyFont: "DM Sans",
    headlineSize: 106,
    contentY: 48,
    textAlign: "left",
    overlayOpacity: 0,
    accentGlow: false
  },

  gradient: {
    kicker: "CREATE SOMETHING",
    headline: "YOUR\nMOMENT.",
    subheadline:
      "Bold color. Strong typography. One unforgettable post.",
    cta: "START NOW",
    footer: "@yourbrand",
    primaryColor: "#F7F0FF",
    textColor: "#FFFFFF",
    backgroundColor: "#5F2EEA",
    headlineFont: "Poppins",
    bodyFont: "Poppins",
    headlineSize: 112,
    contentY: 50,
    textAlign: "center",
    overlayOpacity: 12,
    accentGlow: true
  }
};


/* =========================================================
   INITIALIZATION
========================================================= */

async function init() {
  await document.fonts.ready;

  restoreSavedProject();

  syncControlsFromState();

  await rebuildImagesFromState();

  setCanvasDimensions();

  render();

  initializeHistory();

  setupListeners();

  updateZoom();
}


function initializeHistory() {
  history = [serializeState()];
  historyIndex = 0;
}


/* =========================================================
   STATE SERIALIZATION
========================================================= */

function serializeState() {
  return JSON.stringify(state);
}


function pushHistory() {
  const snapshot = serializeState();

  if (history[historyIndex] === snapshot) {
    return;
  }

  history = history.slice(0, historyIndex + 1);

  history.push(snapshot);

  if (history.length > 40) {
    history.shift();
  } else {
    historyIndex++;
  }

  updateHistoryButtons();
}


async function restoreHistorySnapshot(snapshot) {
  state = JSON.parse(snapshot);

  syncControlsFromState();

  await rebuildImagesFromState();

  setCanvasDimensions();

  render();

  saveProject();
}


function updateHistoryButtons() {
  els.undoBtn.disabled = historyIndex <= 0;
  els.redoBtn.disabled =
    historyIndex >= history.length - 1;

  els.undoBtn.style.opacity =
    historyIndex <= 0 ? ".35" : "1";

  els.redoBtn.style.opacity =
    historyIndex >= history.length - 1
      ? ".35"
      : "1";
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveProject() {
  clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(
        "instagramPosterStudioProject",
        JSON.stringify(state)
      );
    } catch (error) {
      console.warn(
        "Local save unavailable:",
        error
      );
    }
  }, 200);
}


function restoreSavedProject() {
  try {
    const saved =
      localStorage.getItem(
        "instagramPosterStudioProject"
      );

    if (!saved) {
      return;
    }

    const parsed = JSON.parse(saved);

    state = {
      ...structuredClone(defaultState),
      ...parsed
    };
  } catch (error) {
    console.warn(
      "Could not restore project:",
      error
    );
  }
}


/* =========================================================
   CANVAS DIMENSIONS
========================================================= */

function setCanvasDimensions() {
  const preset =
    CANVAS_SIZES[state.canvasSize];

  canvas.width = preset.width;
  canvas.height = preset.height;

  els.canvasDimensions.textContent =
    `${preset.width} × ${preset.height} px`;

  els.exportResolution.textContent =
    `${preset.width} × ${preset.height}`;

  updateZoom();
}


/* =========================================================
   RESPONSIVE PREVIEW ZOOM
========================================================= */

function updateZoom() {
  state.zoom =
    Math.min(
      100,
      Math.max(30, state.zoom)
    );

  const ratio = state.zoom / 100;

  canvas.style.width =
    `${canvas.width * ratio}px`;

  canvas.style.height =
    `${canvas.height * ratio}px`;

  els.zoomLabel.textContent =
    `${state.zoom}%`;
}


/* =========================================================
   LISTENERS
========================================================= */

function setupListeners() {

  /* Sidebar tabs */

  document
    .querySelectorAll(".sidebar-tab")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          document
            .querySelectorAll(".sidebar-tab")
            .forEach(tab =>
              tab.classList.remove("active")
            );

          document
            .querySelectorAll(".side-panel")
            .forEach(panel =>
              panel.classList.remove("active")
            );

          button.classList.add("active");

          document
            .getElementById(
              button.dataset.panel
            )
            .classList.add("active");
        }
      );
    });


  /* Template cards */

  document
    .querySelectorAll(".template-card")
    .forEach(card => {
      card.addEventListener(
        "click",
        () => applyTemplate(
          card.dataset.template
        )
      );
    });


  /* Collapsible sections */

  document
    .querySelectorAll(".section-toggle")
    .forEach(toggle => {
      toggle.addEventListener(
        "click",
        () => {
          const section =
            toggle.closest(
              ".property-section"
            );

          section.classList.toggle(
            "collapsed"
          );

          toggle.lastElementChild.textContent =
            section.classList.contains(
              "collapsed"
            )
              ? "⌄"
              : "⌃";
        }
      );
    });


  /* Inputs */

  bindTextInput(
    els.projectName,
    "projectName"
  );

  bindTextInput(
    els.brandName,
    "brandName"
  );

  bindTextInput(
    els.kickerText,
    "kicker"
  );

  bindTextInput(
    els.headlineText,
    "headline"
  );

  bindTextInput(
    els.subheadlineText,
    "subheadline"
  );

  bindTextInput(
    els.ctaText,
    "cta"
  );

  bindTextInput(
    els.footerText,
    "footer"
  );


  bindSelect(
    els.headlineFont,
    "headlineFont"
  );

  bindSelect(
    els.bodyFont,
    "bodyFont"
  );


  /* Canvas size */

  els.canvasSize.addEventListener(
    "change",
    () => {
      state.canvasSize =
        els.canvasSize.value;

      setCanvasDimensions();

      render();

      commitChange();
    }
  );


  /* Range inputs */

  bindRange(
    els.headlineSize,
    "headlineSize",
    els.headlineSizeValue,
    value => `${value}`
  );

  bindRange(
    els.contentY,
    "contentY",
    els.contentYValue,
    value => `${value}%`
  );

  bindRange(
    els.overlayOpacity,
    "overlayOpacity",
    els.overlayValue,
    value => `${value}%`
  );

  bindRange(
    els.brightness,
    "brightness",
    els.brightnessValue,
    value => `${value}%`
  );

  bindRange(
    els.saturation,
    "saturation",
    els.saturationValue,
    value => `${value}%`
  );

  bindRange(
    els.imageScale,
    "imageScale",
    els.imageScaleValue,
    value => `${value}%`
  );

  bindRange(
    els.imageX,
    "imageX",
    els.imageXValue,
    value => `${value}%`
  );

  bindRange(
    els.imageY,
    "imageY",
    els.imageYValue,
    value => `${value}%`
  );


  /* Colors */

  setupColorControl(
    els.primaryColor,
    els.primaryColorText,
    "primaryColor"
  );

  setupColorControl(
    els.textColor,
    els.textColorText,
    "textColor"
  );

  setupColorControl(
    els.backgroundColor,
    els.backgroundColorText,
    "backgroundColor"
  );


  /* Alignment */

  document
    .querySelectorAll(".align-button")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          state.textAlign =
            button.dataset.align;

          document
            .querySelectorAll(
              ".align-button"
            )
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );

          button.classList.add("active");

          render();

          commitChange();
        }
      );
    });


  /* Accent glow */

  els.accentGlow.addEventListener(
    "change",
    () => {
      state.accentGlow =
        els.accentGlow.checked;

      render();

      commitChange();
    }
  );


  /* Upload background */

  els.backgroundUploadZone.addEventListener(
    "click",
    () => els.backgroundInput.click()
  );

  els.backgroundInput.addEventListener(
    "change",
    event => {
      const file =
        event.target.files[0];

      if (file) {
        loadBackgroundFile(file);
      }
    }
  );


  /* Drag/drop */

  els.backgroundUploadZone.addEventListener(
    "dragover",
    event => {
      event.preventDefault();

      els.backgroundUploadZone.classList.add(
        "dragging"
      );
    }
  );

  els.backgroundUploadZone.addEventListener(
    "dragleave",
    () => {
      els.backgroundUploadZone.classList.remove(
        "dragging"
      );
    }
  );

  els.backgroundUploadZone.addEventListener(
    "drop",
    event => {
      event.preventDefault();

      els.backgroundUploadZone.classList.remove(
        "dragging"
      );

      const file =
        event.dataTransfer.files[0];

      if (
        file &&
        file.type.startsWith("image/")
      ) {
        loadBackgroundFile(file);
      }
    }
  );


  els.removeBackgroundBtn.addEventListener(
    "click",
    event => {
      event.stopPropagation();

      state.backgroundImage = null;
      backgroundImageObject = null;

      els.backgroundPreviewWrap.classList.add(
        "hidden"
      );

      els.backgroundInput.value = "";

      render();

      commitChange();
    }
  );


  /* Logo */

  els.logoUploadBtn.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        els.logoUploadBtn
      ) {
        els.logoInput.click();
      }
    }
  );

  els.logoInput.addEventListener(
    "change",
    event => {
      const file =
        event.target.files[0];

      if (file) {
        loadLogoFile(file);
      }
    }
  );

  els.removeLogoBtn.addEventListener(
    "click",
    () => {
      state.logoImage = null;
      logoImageObject = null;

      els.logoPreviewWrap.classList.add(
        "hidden"
      );

      els.logoInput.value = "";

      render();

      commitChange();
    }
  );


  /* Safe zone */

  els.safeZoneBtn.addEventListener(
    "click",
    () => {
      state.safeZone =
        !state.safeZone;

      syncSafeZoneButton();

      render();

      saveProject();
    }
  );


  /* Zoom */

  els.zoomOutBtn.addEventListener(
    "click",
    () => {
      state.zoom -= 10;

      updateZoom();

      saveProject();
    }
  );

  els.zoomInBtn.addEventListener(
    "click",
    () => {
      state.zoom += 10;

      updateZoom();

      saveProject();
    }
  );


  /* History */

  els.undoBtn.addEventListener(
    "click",
    undo
  );

  els.redoBtn.addEventListener(
    "click",
    redo
  );


  /* Reset */

  els.resetBtn.addEventListener(
    "click",
    () => {
      if (
        !confirm(
          "Reset this poster to the default design?"
        )
      ) {
        return;
      }

      state =
        structuredClone(defaultState);

      backgroundImageObject = null;
      logoImageObject = null;

      syncControlsFromState();
      setCanvasDimensions();
      render();

      history = [serializeState()];
      historyIndex = 0;

      updateHistoryButtons();

      localStorage.removeItem(
        "instagramPosterStudioProject"
      );
    }
  );


  /* Export */

  els.exportTopBtn.addEventListener(
    "click",
    openExportModal
  );

  els.closeExportModal.addEventListener(
    "click",
    closeExportModal
  );

  els.exportModal.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        els.exportModal
      ) {
        closeExportModal();
      }
    }
  );

  document
    .querySelectorAll(
      "[data-export-format]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          downloadPoster(
            button.dataset.exportFormat
          );

          closeExportModal();
        }
      );
    });

  els.downloadPngBtn.addEventListener(
    "click",
    () => downloadPoster("png")
  );

  els.downloadJpgBtn.addEventListener(
    "click",
    () => downloadPoster("jpg")
  );


  /* Keyboard shortcuts */

  window.addEventListener(
    "keydown",
    event => {
      const key =
        event.key.toLowerCase();

      if (
        (event.ctrlKey ||
          event.metaKey) &&
        key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        undo();
      }

      if (
        (event.ctrlKey ||
          event.metaKey) &&
        (
          key === "y" ||
          (
            key === "z" &&
            event.shiftKey
          )
        )
      ) {
        event.preventDefault();
        redo();
      }
    }
  );
}


/* =========================================================
   INPUT BINDERS
========================================================= */

function bindTextInput(
  element,
  stateKey
) {
  element.addEventListener(
    "input",
    () => {
      state[stateKey] =
        element.value;

      render();
      saveProject();
    }
  );

  element.addEventListener(
    "change",
    pushHistory
  );
}


function bindSelect(
  element,
  stateKey
) {
  element.addEventListener(
    "change",
    () => {
      state[stateKey] =
        element.value;

      render();

      commitChange();
    }
  );
}


function bindRange(
  element,
  stateKey,
  label,
  formatter
) {
  element.addEventListener(
    "input",
    () => {
      const value =
        Number(element.value);

      state[stateKey] = value;

      if (label) {
        label.textContent =
          formatter(value);
      }

      render();
      saveProject();
    }
  );

  element.addEventListener(
    "change",
    pushHistory
  );
}


function setupColorControl(
  picker,
  textInput,
  stateKey
) {
  picker.addEventListener(
    "input",
    () => {
      const color =
        picker.value.toUpperCase();

      textInput.value = color;

      state[stateKey] = color;

      render();
      saveProject();
    }
  );

  picker.addEventListener(
    "change",
    pushHistory
  );

  textInput.addEventListener(
    "change",
    () => {
      const value =
        normalizeHexColor(
          textInput.value
        );

      if (!value) {
        textInput.value =
          state[stateKey];

        return;
      }

      state[stateKey] = value;

      picker.value =
        value.toLowerCase();

      textInput.value = value;

      render();

      commitChange();
    }
  );
}


function normalizeHexColor(value) {
  let color =
    value.trim().toUpperCase();

  if (!color.startsWith("#")) {
    color = `#${color}`;
  }

  if (
    /^#[0-9A-F]{6}$/.test(color)
  ) {
    return color;
  }

  return null;
}


function commitChange() {
  saveProject();
  pushHistory();
}


/* =========================================================
   TEMPLATES
========================================================= */

function applyTemplate(name) {
  const template =
    templates[name];

  if (!template) {
    return;
  }

  state = {
    ...state,
    ...template,
    template: name
  };

  document
    .querySelectorAll(".template-card")
    .forEach(card => {
      card.classList.toggle(
        "active",
        card.dataset.template === name
      );
    });

  syncControlsFromState();

  render();

  commitChange();
}


/* =========================================================
   MEDIA
========================================================= */

function fileToDataURL(file) {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload =
        () => resolve(reader.result);

      reader.onerror = reject;

      reader.readAsDataURL(file);
    }
  );
}


function dataURLToImage(dataURL) {
  return new Promise(
    (resolve, reject) => {
      const image = new Image();

      image.onload =
        () => resolve(image);

      image.onerror = reject;

      image.src = dataURL;
    }
  );
}


async function loadBackgroundFile(file) {
  try {
    const dataURL =
      await fileToDataURL(file);

    const image =
      await dataURLToImage(dataURL);

    state.backgroundImage =
      dataURL;

    backgroundImageObject =
      image;

    els.backgroundPreview.src =
      dataURL;

    els.backgroundPreviewWrap.classList.remove(
      "hidden"
    );

    render();

    commitChange();
  } catch (error) {
    console.error(error);

    alert(
      "The selected image could not be loaded."
    );
  }
}


async function loadLogoFile(file) {
  try {
    const dataURL =
      await fileToDataURL(file);

    const image =
      await dataURLToImage(dataURL);

    state.logoImage =
      dataURL;

    logoImageObject =
      image;

    els.logoPreview.src =
      dataURL;

    els.logoPreviewWrap.classList.remove(
      "hidden"
    );

    render();

    commitChange();
  } catch (error) {
    console.error(error);

    alert(
      "The selected logo could not be loaded."
    );
  }
}


async function rebuildImagesFromState() {
  backgroundImageObject = null;
  logoImageObject = null;

  try {
    if (state.backgroundImage) {
      backgroundImageObject =
        await dataURLToImage(
          state.backgroundImage
        );

      els.backgroundPreview.src =
        state.backgroundImage;

      els.backgroundPreviewWrap.classList.remove(
        "hidden"
      );
    }

    if (state.logoImage) {
      logoImageObject =
        await dataURLToImage(
          state.logoImage
        );

      els.logoPreview.src =
        state.logoImage;

      els.logoPreviewWrap.classList.remove(
        "hidden"
      );
    }
  } catch (error) {
    console.warn(
      "Could not restore uploaded media",
      error
    );
  }
}


/* =========================================================
   HISTORY
========================================================= */

async function undo() {
  if (historyIndex <= 0) {
    return;
  }

  historyIndex--;

  await restoreHistorySnapshot(
    history[historyIndex]
  );

  updateHistoryButtons();
}


async function redo() {
  if (
    historyIndex >=
    history.length - 1
  ) {
    return;
  }

  historyIndex++;

  await restoreHistorySnapshot(
    history[historyIndex]
  );

  updateHistoryButtons();
}


/* =========================================================
   SYNC UI
========================================================= */

function syncControlsFromState() {
  els.projectName.value =
    state.projectName;

  els.canvasSize.value =
    state.canvasSize;

  els.kickerText.value =
    state.kicker;

  els.headlineText.value =
    state.headline;

  els.subheadlineText.value =
    state.subheadline;

  els.ctaText.value =
    state.cta;

  els.footerText.value =
    state.footer;

  els.brandName.value =
    state.brandName;

  els.primaryColor.value =
    state.primaryColor.toLowerCase();

  els.primaryColorText.value =
    state.primaryColor;

  els.textColor.value =
    state.textColor.toLowerCase();

  els.textColorText.value =
    state.textColor;

  els.backgroundColor.value =
    state.backgroundColor.toLowerCase();

  els.backgroundColorText.value =
    state.backgroundColor;

  els.headlineFont.value =
    state.headlineFont;

  els.bodyFont.value =
    state.bodyFont;

  els.headlineSize.value =
    state.headlineSize;

  els.headlineSizeValue.textContent =
    state.headlineSize;

  els.contentY.value =
    state.contentY;

  els.contentYValue.textContent =
    `${state.contentY}%`;

  els.overlayOpacity.value =
    state.overlayOpacity;

  els.overlayValue.textContent =
    `${state.overlayOpacity}%`;

  els.brightness.value =
    state.brightness;

  els.brightnessValue.textContent =
    `${state.brightness}%`;

  els.saturation.value =
    state.saturation;

  els.saturationValue.textContent =
    `${state.saturation}%`;

  els.accentGlow.checked =
    state.accentGlow;

  els.imageScale.value =
    state.imageScale;

  els.imageScaleValue.textContent =
    `${state.imageScale}%`;

  els.imageX.value =
    state.imageX;

  els.imageXValue.textContent =
    `${state.imageX}%`;

  els.imageY.value =
    state.imageY;

  els.imageYValue.textContent =
    `${state.imageY}%`;

  document
    .querySelectorAll(".align-button")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.align ===
          state.textAlign
      );
    });

  document
    .querySelectorAll(".template-card")
    .forEach(card => {
      card.classList.toggle(
        "active",
        card.dataset.template ===
          state.template
      );
    });

  syncSafeZoneButton();
  updateZoom();
}


function syncSafeZoneButton() {
  els.safeZoneBtn.classList.toggle(
    "active",
    state.safeZone
  );
}


/* =========================================================
   CANVAS RENDER
========================================================= */

function render() {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawBaseBackground();

  drawDecorativeBackground();

  if (backgroundImageObject) {
    drawBackgroundImage(
      backgroundImageObject
    );
  }

  drawOverlay();

  drawTemplateDecorations();

  drawBrand();

  drawContent();

  drawFooter();

  if (state.safeZone) {
    drawSafeZone();
  }
}


/* =========================================================
   BACKGROUND
========================================================= */

function drawBaseBackground() {
  ctx.fillStyle =
    state.backgroundColor;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}


function drawDecorativeBackground() {
  if (backgroundImageObject) {
    return;
  }

  const w = canvas.width;
  const h = canvas.height;

  if (state.template === "midnight") {
    const gradient =
      ctx.createRadialGradient(
        w * .82,
        h * .2,
        0,
        w * .82,
        h * .2,
        w * .65
      );

    gradient.addColorStop(
      0,
      hexToRgba(
        state.primaryColor,
        .24
      )
    );

    gradient.addColorStop(
      .35,
      hexToRgba(
        state.primaryColor,
        .06
      )
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(0,0,w,h);

    return;
  }


  if (state.template === "gradient") {
    const first =
      ctx.createRadialGradient(
        w * .18,
        h * .15,
        0,
        w * .18,
        h * .15,
        w * .85
      );

    first.addColorStop(
      0,
      "#E64DC8"
    );

    first.addColorStop(
      .52,
      "rgba(230,77,200,0)"
    );

    ctx.fillStyle = first;
    ctx.fillRect(0,0,w,h);

    const second =
      ctx.createRadialGradient(
        w * .8,
        h * .82,
        0,
        w * .8,
        h * .82,
        w * .9
      );

    second.addColorStop(
      0,
      "#28BCE0"
    );

    second.addColorStop(
      .5,
      "rgba(40,188,224,0)"
    );

    ctx.fillStyle = second;
    ctx.fillRect(0,0,w,h);

    return;
  }


  if (state.template === "event") {
    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        w,
        h
      );

    gradient.addColorStop(
      0,
      "#271648"
    );

    gradient.addColorStop(
      .65,
      state.backgroundColor
    );

    gradient.addColorStop(
      1,
      "#A941B2"
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,w,h);
  }


  if (state.template === "sale") {
    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        w,
        h
      );

    gradient.addColorStop(
      0,
      "#F95757"
    );

    gradient.addColorStop(
      .55,
      state.backgroundColor
    );

    gradient.addColorStop(
      1,
      "#A80F1D"
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,w,h);
  }
}


function drawBackgroundImage(image) {
  const w = canvas.width;
  const h = canvas.height;

  const baseScale =
    Math.max(
      w / image.width,
      h / image.height
    );

  const zoom =
    state.imageScale / 100;

  const drawW =
    image.width *
    baseScale *
    zoom;

  const drawH =
    image.height *
    baseScale *
    zoom;

  const overflowX =
    Math.max(0, drawW - w);

  const overflowY =
    Math.max(0, drawH - h);

  const x =
    -(overflowX *
      (state.imageX / 100));

  const y =
    -(overflowY *
      (state.imageY / 100));

  ctx.save();

  ctx.filter =
    `brightness(${state.brightness}%)
     saturate(${state.saturation}%)`;

  ctx.drawImage(
    image,
    x,
    y,
    drawW,
    drawH
  );

  ctx.restore();
}


function drawOverlay() {
  const opacity =
    state.overlayOpacity / 100;

  if (opacity <= 0) {
    return;
  }

  if (
    state.template === "minimal" ||
    state.template === "editorial"
  ) {
    ctx.fillStyle =
      `rgba(255,255,255,${opacity * .15})`;
  } else {
    ctx.fillStyle =
      `rgba(0,0,0,${opacity})`;
  }

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}


/* =========================================================
   TEMPLATE DECORATION
========================================================= */

function drawTemplateDecorations() {
  const w = canvas.width;
  const h = canvas.height;

  if (state.accentGlow) {
    ctx.save();

    const glow =
      ctx.createRadialGradient(
        w * .85,
        h * .74,
        0,
        w * .85,
        h * .74,
        w * .55
      );

    glow.addColorStop(
      0,
      hexToRgba(
        state.primaryColor,
        .18
      )
    );

    glow.addColorStop(
      1,
      hexToRgba(
        state.primaryColor,
        0
      )
    );

    ctx.fillStyle = glow;

    ctx.fillRect(0,0,w,h);

    ctx.restore();
  }


  if (state.template === "editorial") {
    ctx.save();

    ctx.strokeStyle =
      hexToRgba(
        state.textColor,
        .2
      );

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(85, 150);

    ctx.lineTo(
      w - 85,
      150
    );

    ctx.stroke();

    ctx.restore();
  }


  if (state.template === "sale") {
    ctx.save();

    ctx.strokeStyle =
      hexToRgba(
        state.primaryColor,
        .3
      );

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.arc(
      w * .82,
      h * .2,
      150,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();
  }


  if (state.template === "minimal") {
    ctx.save();

    ctx.strokeStyle =
      hexToRgba(
        state.textColor,
        .17
      );

    ctx.lineWidth = 2;

    ctx.strokeRect(
      58,
      58,
      w - 116,
      h - 116
    );

    ctx.restore();
  }
}


/* =========================================================
   BRAND / LOGO
========================================================= */

function drawBrand() {
  const w = canvas.width;
  const margin = getMargin();

  const top =
    state.canvasSize === "story"
      ? 125
      : 82;

  if (logoImageObject) {
    const maxWidth = 190;
    const maxHeight = 90;

    const ratio =
      Math.min(
        maxWidth /
          logoImageObject.width,
        maxHeight /
          logoImageObject.height
      );

    const logoW =
      logoImageObject.width *
      ratio;

    const logoH =
      logoImageObject.height *
      ratio;

    let x = margin;

    if (
      state.textAlign ===
      "center"
    ) {
      x =
        (w - logoW) / 2;
    }

    if (
      state.textAlign ===
      "right"
    ) {
      x =
        w - margin - logoW;
    }

    ctx.drawImage(
      logoImageObject,
      x,
      top,
      logoW,
      logoH
    );

    return;
  }


  ctx.save();

  ctx.fillStyle =
    state.textColor;

  ctx.font =
    `700 26px "${state.bodyFont}"`;

  ctx.textBaseline = "top";

  ctx.letterSpacing = "2px";

  ctx.textAlign =
    state.textAlign;

  const x =
    getTextAnchorX(margin);

  ctx.fillText(
    state.brandName.toUpperCase(),
    x,
    top
  );

  ctx.restore();
}


/* =========================================================
   CONTENT
========================================================= */

function drawContent() {
  const w = canvas.width;
  const h = canvas.height;

  const margin = getMargin();

  const maxWidth =
    w - margin * 2;

  let y =
    h * (
      state.contentY / 100
    );

  const x =
    getTextAnchorX(margin);


  /* Kicker */

  ctx.save();

  ctx.textAlign =
    state.textAlign;

  ctx.textBaseline = "top";

  ctx.fillStyle =
    state.primaryColor;

  ctx.font =
    `700 25px "${state.bodyFont}"`;

  drawTextWithTracking(
    ctx,
    state.kicker.toUpperCase(),
    x,
    y,
    5,
    state.textAlign
  );

  ctx.restore();

  y += 55;


  /* Headline */

  ctx.save();

  ctx.fillStyle =
    state.textColor;

  ctx.textAlign =
    state.textAlign;

  ctx.textBaseline =
    "top";

  const fontSize =
    getResponsiveHeadlineSize();

  const weight =
    state.headlineFont ===
      "Bebas Neue"
      ? "400"
      : "800";

  ctx.font =
    `${weight} ${fontSize}px "${state.headlineFont}"`;

  const lineHeight =
    fontSize * .93;

  const headlineHeight =
    drawHeadline(
      state.headline,
      x,
      y,
      maxWidth,
      lineHeight
    );

  y +=
    headlineHeight +
    Math.max(
      32,
      fontSize * .24
    );

  ctx.restore();


  /* Accent line */

  if (
    state.textAlign !==
      "center" &&
    state.template !==
      "minimal"
  ) {
    ctx.fillStyle =
      state.primaryColor;

    const lineWidth = 62;

    const lineX =
      state.textAlign === "right"
        ? w - margin - lineWidth
        : margin;

    ctx.fillRect(
      lineX,
      y,
      lineWidth,
      6
    );

    y += 34;
  }


  /* Subheadline */

  ctx.save();

  ctx.fillStyle =
    hexToRgba(
      state.textColor,
      .78
    );

  ctx.textAlign =
    state.textAlign;

  ctx.textBaseline =
    "top";

  const bodySize =
    state.canvasSize === "story"
      ? 29
      : 25;

  ctx.font =
    `500 ${bodySize}px "${state.bodyFont}"`;

  const subWidth =
    Math.min(
      maxWidth,
      700
    );

  const subHeight =
    drawWrappedText(
      ctx,
      state.subheadline,
      x,
      y,
      subWidth,
      bodySize * 1.48,
      state.textAlign
    );

  y += subHeight + 43;

  ctx.restore();


  /* CTA */

  if (state.cta.trim()) {
    drawCTA(x, y);
  }
}


function drawHeadline(
  text,
  x,
  y,
  maxWidth,
  lineHeight
) {
  const sourceLines =
    text.split("\n");

  const finalLines = [];

  sourceLines.forEach(line => {
    if (!line.trim()) {
      finalLines.push("");
      return;
    }

    const wrapped =
      wrapLine(
        ctx,
        line,
        maxWidth
      );

    finalLines.push(
      ...wrapped
    );
  });

  finalLines.forEach(
    (line, index) => {
      ctx.fillText(
        line,
        x,
        y +
          index *
            lineHeight
      );
    }
  );

  return (
    finalLines.length *
    lineHeight
  );
}


function drawCTA(x, y) {
  const paddingX = 27;
  const height = 54;

  ctx.save();

  ctx.font =
    `700 20px "${state.bodyFont}"`;

  const width =
    ctx.measureText(
      state.cta.toUpperCase()
    ).width +
    paddingX * 2;

  let rectX;

  if (
    state.textAlign ===
    "center"
  ) {
    rectX =
      x - width / 2;
  } else if (
    state.textAlign ===
    "right"
  ) {
    rectX =
      x - width;
  } else {
    rectX = x;
  }

  roundRect(
    ctx,
    rectX,
    y,
    width,
    height,
    8
  );

  ctx.fillStyle =
    state.primaryColor;

  ctx.fill();

  ctx.fillStyle =
    getContrastColor(
      state.primaryColor
    );

  ctx.textAlign = "center";
  ctx.textBaseline =
    "middle";

  ctx.fillText(
    state.cta.toUpperCase(),
    rectX + width / 2,
    y + height / 2 + 1
  );

  ctx.restore();
}


/* =========================================================
   FOOTER
========================================================= */

function drawFooter() {
  const w = canvas.width;
  const h = canvas.height;

  const margin = getMargin();

  const bottom =
    state.canvasSize === "story"
      ? 125
      : 82;

  ctx.save();

  ctx.fillStyle =
    hexToRgba(
      state.textColor,
      .7
    );

  ctx.font =
    `600 21px "${state.bodyFont}"`;

  ctx.textAlign = "left";
  ctx.textBaseline =
    "bottom";

  ctx.fillText(
    state.footer,
    margin,
    h - bottom
  );

  ctx.textAlign = "right";

  ctx.fillText(
    state.brandName.toUpperCase(),
    w - margin,
    h - bottom
  );

  ctx.restore();
}


/* =========================================================
   SAFE ZONE
========================================================= */

function drawSafeZone() {
  const w = canvas.width;
  const h = canvas.height;

  let side = 70;
  let vertical = 70;

  if (
    state.canvasSize ===
    "story"
  ) {
    side = 70;
    vertical = 250;
  }

  ctx.save();

  ctx.strokeStyle =
    "rgba(246,255,99,.7)";

  ctx.lineWidth = 2;

  ctx.setLineDash(
    [12, 12]
  );

  ctx.strokeRect(
    side,
    vertical,
    w - side * 2,
    h - vertical * 2
  );

  ctx.fillStyle =
    "rgba(246,255,99,.9)";

  ctx.font =
    `600 17px "DM Sans"`;

  ctx.textAlign = "left";

  ctx.fillText(
    "SAFE AREA",
    side + 12,
    vertical + 28
  );

  ctx.restore();
}


/* =========================================================
   TEXT UTILITIES
========================================================= */

function drawWrappedText(
  context,
  text,
  x,
  y,
  maxWidth,
  lineHeight,
  alignment
) {
  const paragraphs =
    text.split("\n");

  const lines = [];

  paragraphs.forEach(paragraph => {
    lines.push(
      ...wrapLine(
        context,
        paragraph,
        maxWidth
      )
    );
  });

  lines.forEach(
    (line, index) => {
      context.fillText(
        line,
        x,
        y +
          index *
            lineHeight
      );
    }
  );

  return (
    lines.length *
    lineHeight
  );
}


function wrapLine(
  context,
  text,
  maxWidth
) {
  if (!text.trim()) {
    return [""];
  }

  const words =
    text.split(/\s+/);

  const lines = [];

  let current = "";

  for (const word of words) {
    const candidate =
      current
        ? `${current} ${word}`
        : word;

    if (
      context
        .measureText(candidate)
        .width >
        maxWidth &&
      current
    ) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}


function drawTextWithTracking(
  context,
  text,
  x,
  y,
  tracking,
  align
) {
  const characters =
    [...text];

  const widths =
    characters.map(
      char =>
        context
          .measureText(char)
          .width
    );

  const total =
    widths.reduce(
      (sum, width) =>
        sum + width,
      0
    ) +
    tracking *
      Math.max(
        characters.length - 1,
        0
      );

  let startX = x;

  if (align === "center") {
    startX -= total / 2;
  }

  if (align === "right") {
    startX -= total;
  }

  characters.forEach(
    (char, index) => {
      context.fillText(
        char,
        startX,
        y
      );

      startX +=
        widths[index] +
        tracking;
    }
  );
}


/* =========================================================
   HELPERS
========================================================= */

function getMargin() {
  return state.canvasSize === "story"
    ? 90
    : 82;
}


function getTextAnchorX(margin) {
  if (
    state.textAlign ===
    "center"
  ) {
    return canvas.width / 2;
  }

  if (
    state.textAlign ===
    "right"
  ) {
    return canvas.width - margin;
  }

  return margin;
}


function getResponsiveHeadlineSize() {
  let size =
    Number(state.headlineSize);

  if (
    state.canvasSize ===
    "story"
  ) {
    size *= 1.1;
  }

  return size;
}


function hexToRgba(
  hex,
  alpha
) {
  const clean =
    hex.replace("#", "");

  const red =
    parseInt(
      clean.substring(0, 2),
      16
    );

  const green =
    parseInt(
      clean.substring(2, 4),
      16
    );

  const blue =
    parseInt(
      clean.substring(4, 6),
      16
    );

  return `rgba(${red},${green},${blue},${alpha})`;
}


function getContrastColor(hex) {
  const clean =
    hex.replace("#", "");

  const r =
    parseInt(
      clean.substring(0,2),
      16
    );

  const g =
    parseInt(
      clean.substring(2,4),
      16
    );

  const b =
    parseInt(
      clean.substring(4,6),
      16
    );

  const luminance =
    (
      0.299 * r +
      0.587 * g +
      0.114 * b
    );

  return luminance > 160
    ? "#0B0B0C"
    : "#FFFFFF";
}


function roundRect(
  context,
  x,
  y,
  width,
  height,
  radius
) {
  const r =
    Math.min(
      radius,
      width / 2,
      height / 2
    );

  context.beginPath();

  context.moveTo(
    x + r,
    y
  );

  context.arcTo(
    x + width,
    y,
    x + width,
    y + height,
    r
  );

  context.arcTo(
    x + width,
    y + height,
    x,
    y + height,
    r
  );

  context.arcTo(
    x,
    y + height,
    x,
    y,
    r
  );

  context.arcTo(
    x,
    y,
    x + width,
    y,
    r
  );

  context.closePath();
}


/* =========================================================
   EXPORT
========================================================= */

function openExportModal() {
  els.exportModal.classList.remove(
    "hidden"
  );
}


function closeExportModal() {
  els.exportModal.classList.add(
    "hidden"
  );
}


function downloadPoster(format) {
  const safeZoneWasEnabled =
    state.safeZone;

  state.safeZone = false;

  render();

  const mimeType =
    format === "jpg"
      ? "image/jpeg"
      : "image/png";

  const quality =
    format === "jpg"
      ? .94
      : 1;

  const url =
    canvas.toDataURL(
      mimeType,
      quality
    );

  const project =
    sanitizeFilename(
      state.projectName ||
      "instagram-poster"
    );

  const link =
    document.createElement("a");

  link.download =
    `${project}.${format}`;

  link.href = url;

  document.body.appendChild(link);

  link.click();

  link.remove();

  state.safeZone =
    safeZoneWasEnabled;

  render();
}


function sanitizeFilename(value) {
  return value
    .trim()
    .replace(
      /[^a-z0-9-_]+/gi,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-|-$|_/g,
      ""
    )
    .toLowerCase() ||
    "instagram-poster";
}


/* =========================================================
   START
========================================================= */

init();
