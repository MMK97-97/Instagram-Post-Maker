import { POSTER_TEMPLATES } from "./cricket-templates.js";

const SIZES = {
  portrait: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 }
};

export class PosterEditor {

  constructor() {

    this.canvas = document.getElementById("posterCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.logo = null;
    this.backgroundImage = null;
    this.sponsorLogo = null;

    this.activeFilter = "all";

    this.state = {
      template: "matchday",

      canvasSize: "portrait",

      kicker: "",
      headline: "",
      subheadline: "",
      cta: "",
      footer: "",

      brandName: "FWCWL",

      accent: "#F0C34C",
      textColor: "#FFFFFF",
      background: "#210B0E",
      bg2: "#0B0D10",

      headlineFont: "Montserrat",
      headlineSize: 112,

      contentY: 56,
      align: "left",

      overlay: 37,
      brightness: 100,
      saturation: 100,

      accentGlow: true,

      imageScale: 100,
      imageX: 50,
      imageY: 50,

      safeZone: false,

      zoom: 55
    };

    this.loadLogo();
    this.bind();
    this.renderTemplates();
    this.applyTemplate("matchday");
  }


  async loadLogo() {
    this.logo = await this.loadImage("assets/fwcwl-logo.jpeg");
    this.render();
  }


  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = reject;

      img.src = src;
    });
  }


  bind() {

    document.querySelectorAll("[data-poster-tab]").forEach(button => {

      button.addEventListener("click", () => {

        document
          .querySelectorAll("[data-poster-tab]")
          .forEach(item => item.classList.remove("active"));

        document
          .querySelectorAll("#posterLeftPanel .left-tab-panel")
          .forEach(panel => panel.classList.remove("active"));

        button.classList.add("active");

        document
          .getElementById(
            `poster${
              button.dataset.posterTab.charAt(0).toUpperCase() +
              button.dataset.posterTab.slice(1)
            }Panel`
          )
          ?.classList.add("active");
      });
    });


    document
      .getElementById("posterTemplateSearch")
      .addEventListener("input", () => this.renderTemplates());


    document
      .querySelectorAll("#posterTemplateFilters .filter-chip")
      .forEach(button => {

        button.addEventListener("click", () => {

          document
            .querySelectorAll("#posterTemplateFilters .filter-chip")
            .forEach(item => item.classList.remove("active"));

          button.classList.add("active");

          this.activeFilter = button.dataset.filter;

          this.renderTemplates();
        });
      });


    document
      .getElementById("posterCanvasSize")
      .addEventListener("change", event => {

        this.state.canvasSize = event.target.value;

        this.resizeCanvas();
        this.render();
      });


    this.bindText("posterKicker", "kicker");
    this.bindText("posterHeadline", "headline");
    this.bindText("posterSubheadline", "subheadline");
    this.bindText("posterCta", "cta");
    this.bindText("posterFooter", "footer");
    this.bindText("posterBrandName", "brandName");


    document
      .getElementById("posterHeadlineFont")
      .addEventListener("change", event => {

        this.state.headlineFont = event.target.value;
        this.render();
      });


    this.bindRange(
      "posterHeadlineSize",
      "headlineSize",
      "posterHeadlineSizeValue",
      value => value
    );

    this.bindRange(
      "posterContentY",
      "contentY",
      "posterContentYValue",
      value => `${value}%`
    );

    this.bindRange(
      "posterOverlay",
      "overlay",
      "posterOverlayValue",
      value => `${value}%`
    );

    this.bindRange(
      "posterBrightness",
      "brightness",
      "posterBrightnessValue",
      value => `${value}%`
    );

    this.bindRange(
      "posterSaturation",
      "saturation",
      "posterSaturationValue",
      value => `${value}%`
    );

    this.bindRange(
      "posterImageScale",
      "imageScale",
      "posterImageScaleValue",
      value => `${value}%`
    );

    this.bindRange(
      "posterImageX",
      "imageX",
      "posterImageXValue",
      value => `${value}%`
    );

    this.bindRange(
      "posterImageY",
      "imageY",
      "posterImageYValue",
      value => `${value}%`
    );


    document
      .getElementById("posterAlignmentButtons")
      .addEventListener("click", event => {

        const button = event.target.closest("[data-align]");

        if (!button) return;

        this.state.align = button.dataset.align;

        document
          .querySelectorAll("#posterAlignmentButtons button")
          .forEach(item => item.classList.remove("active"));

        button.classList.add("active");

        this.render();
      });


    document
      .getElementById("posterAccentGlow")
      .addEventListener("change", event => {

        this.state.accentGlow = event.target.checked;
        this.render();
      });


    this.bindColor(
      "posterAccentColor",
      "posterAccentColorText",
      "accent"
    );

    this.bindColor(
      "posterTextColor",
      "posterTextColorText",
      "textColor"
    );

    this.bindColor(
      "posterBackgroundColor",
      "posterBackgroundColorText",
      "background"
    );


    document
      .getElementById("posterBackgroundInput")
      .addEventListener("change", async event => {

        const file = event.target.files[0];

        if (!file) return;

        const url = URL.createObjectURL(file);

        this.backgroundImage = await this.loadImage(url);

        document.getElementById("posterBackgroundPreview").src = url;

        document
          .getElementById("posterBackgroundPreviewWrap")
          .classList.remove("hidden");

        this.render();
      });


    document
      .getElementById("posterRemoveBackgroundBtn")
      .addEventListener("click", () => {

        this.backgroundImage = null;

        document
          .getElementById("posterBackgroundPreviewWrap")
          .classList.add("hidden");

        this.render();
      });


    document
      .getElementById("posterSponsorLogoInput")
      .addEventListener("change", async event => {

        const file = event.target.files[0];

        if (!file) return;

        const url = URL.createObjectURL(file);

        this.sponsorLogo = await this.loadImage(url);

        document.getElementById("posterSponsorPreview").src = url;

        document
          .getElementById("posterSponsorPreviewWrap")
          .classList.remove("hidden");

        this.render();
      });


    document
      .getElementById("posterRemoveSponsorBtn")
      .addEventListener("click", () => {

        this.sponsorLogo = null;

        document
          .getElementById("posterSponsorPreviewWrap")
          .classList.add("hidden");

        this.render();
      });


    document
      .getElementById("posterSafeZoneBtn")
      .addEventListener("click", event => {

        this.state.safeZone = !this.state.safeZone;

        event.currentTarget.classList.toggle(
          "active",
          this.state.safeZone
        );

        this.render();
      });


    document
      .getElementById("posterZoomOutBtn")
      .addEventListener("click", () => {

        this.state.zoom = Math.max(25, this.state.zoom - 5);
        this.applyZoom();
      });


    document
      .getElementById("posterZoomInBtn")
      .addEventListener("click", () => {

        this.state.zoom = Math.min(100, this.state.zoom + 5);
        this.applyZoom();
      });


    document
      .getElementById("posterDownloadPngBtn")
      .addEventListener("click", () => this.export("png"));


    document
      .getElementById("posterDownloadJpgBtn")
      .addEventListener("click", () => this.export("jpg"));


    document
      .getElementById("posterExportTopBtn")
      .addEventListener("click", () => this.export("png"));


    document
      .getElementById("posterResetBtn")
      .addEventListener("click", () => this.applyTemplate("matchday"));
  }


  bindText(id, key) {
    document.getElementById(id).addEventListener("input", event => {
      this.state[key] = event.target.value;
      this.render();
    });
  }


  bindRange(id, key, labelId, formatter) {

    document.getElementById(id).addEventListener("input", event => {

      const value = Number(event.target.value);

      this.state[key] = value;

      document.getElementById(labelId).textContent = formatter(value);

      this.render();
    });
  }


  bindColor(colorId, textId, key) {

    const picker = document.getElementById(colorId);
    const text = document.getElementById(textId);

    picker.addEventListener("input", () => {

      const value = picker.value.toUpperCase();

      text.value = value;

      this.state[key] = value;

      this.render();
    });


    text.addEventListener("change", () => {

      const value = this.normalizeColor(text.value);

      if (!value) {
        text.value = this.state[key];
        return;
      }

      this.state[key] = value;

      picker.value = value;

      text.value = value;

      this.render();
    });
  }


  normalizeColor(value) {

    let color = value.trim();

    if (!color.startsWith("#")) {
      color = `#${color}`;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return null;
    }

    return color.toUpperCase();
  }


  renderTemplates() {

    const grid = document.getElementById("posterTemplateGrid");

    const search =
      document
        .getElementById("posterTemplateSearch")
        .value
        .trim()
        .toLowerCase();

    const templates = POSTER_TEMPLATES.filter(template => {

      const categoryMatch =
        this.activeFilter === "all" ||
        template.category === this.activeFilter;

      const searchMatch =
        !search ||
        template.name.toLowerCase().includes(search) ||
        template.headline.toLowerCase().includes(search) ||
        template.category.toLowerCase().includes(search);

      return categoryMatch && searchMatch;
    });


    grid.innerHTML = templates.map(template => {

      const active =
        this.state.template === template.id
          ? "active"
          : "";

      return `
        <button
          class="poster-template-card ${active}"
          data-template-id="${template.id}"
          type="button"
        >
          <div
            class="poster-template-art"
            style="
              --preview-bg-1:${template.background};
              --preview-bg-2:${template.bg2};
              --preview-accent:${template.accent};
            "
          >
            <img
              src="assets/fwcwl-logo.jpeg"
              alt=""
            />

            <span>${template.kicker}</span>

            <strong>
              ${template.headline.replace(/\n/g, "<br>")}
            </strong>

            <small>${template.footer}</small>
          </div>

          <div class="poster-template-name">
            ${template.name}
          </div>
        </button>
      `;
    }).join("");


    document.getElementById("posterTemplateCount").textContent =
      templates.length;


    grid.querySelectorAll("[data-template-id]").forEach(card => {

      card.addEventListener("click", () => {
        this.applyTemplate(card.dataset.templateId);
      });
    });
  }


  applyTemplate(id) {

    const template =
      POSTER_TEMPLATES.find(item => item.id === id);

    if (!template) return;

    this.state.template = template.id;

    this.state.kicker = template.kicker;
    this.state.headline = template.headline;
    this.state.subheadline = template.subheadline;
    this.state.cta = template.cta;
    this.state.footer = template.footer;

    this.state.accent = template.accent;
    this.state.textColor = template.text;
    this.state.background = template.background;
    this.state.bg2 = template.bg2;

    this.state.headlineFont = template.font;
    this.state.headlineSize = template.headlineSize;
    this.state.contentY = template.contentY;
    this.state.align = template.align;

    this.state.overlay = template.overlay;

    this.syncControls();

    this.renderTemplates();
    this.render();
  }


  syncControls() {

    document.getElementById("posterKicker").value = this.state.kicker;
    document.getElementById("posterHeadline").value = this.state.headline;
    document.getElementById("posterSubheadline").value = this.state.subheadline;
    document.getElementById("posterCta").value = this.state.cta;
    document.getElementById("posterFooter").value = this.state.footer;

    document.getElementById("posterBrandName").value = this.state.brandName;

    document.getElementById("posterAccentColor").value = this.state.accent;
    document.getElementById("posterAccentColorText").value = this.state.accent;

    document.getElementById("posterTextColor").value = this.state.textColor;
    document.getElementById("posterTextColorText").value = this.state.textColor;

    document.getElementById("posterBackgroundColor").value = this.state.background;
    document.getElementById("posterBackgroundColorText").value = this.state.background;

    document.getElementById("posterHeadlineFont").value =
      this.state.headlineFont;

    document.getElementById("posterHeadlineSize").value =
      this.state.headlineSize;

    document.getElementById("posterHeadlineSizeValue").textContent =
      this.state.headlineSize;

    document.getElementById("posterContentY").value =
      this.state.contentY;

    document.getElementById("posterContentYValue").textContent =
      `${this.state.contentY}%`;

    document.getElementById("posterOverlay").value =
      this.state.overlay;

    document.getElementById("posterOverlayValue").textContent =
      `${this.state.overlay}%`;

    document
      .querySelectorAll("#posterAlignmentButtons button")
      .forEach(button => {

        button.classList.toggle(
          "active",
          button.dataset.align === this.state.align
        );
      });
  }


  resizeCanvas() {

    const size = SIZES[this.state.canvasSize];

    this.canvas.width = size.width;
    this.canvas.height = size.height;

    document.getElementById("posterDimensions").textContent =
      `${size.width} × ${size.height}`;

    this.applyZoom();
  }


  applyZoom() {

    const ratio = this.state.zoom / 100;

    this.canvas.style.width =
      `${this.canvas.width * ratio}px`;

    this.canvas.style.height =
      `${this.canvas.height * ratio}px`;

    document.getElementById("posterZoomValue").textContent =
      `${this.state.zoom}%`;
  }


  drawCoverImage(image) {

    const w = this.canvas.width;
    const h = this.canvas.height;

    const base = Math.max(
      w / image.width,
      h / image.height
    );

    const scale =
      base * (this.state.imageScale / 100);

    const dw = image.width * scale;
    const dh = image.height * scale;

    const overflowX = Math.max(0, dw - w);
    const overflowY = Math.max(0, dh - h);

    const x =
      -(overflowX * (this.state.imageX / 100));

    const y =
      -(overflowY * (this.state.imageY / 100));

    this.ctx.save();

    this.ctx.filter =
      `brightness(${this.state.brightness}%)
       saturate(${this.state.saturation}%)`;

    this.ctx.drawImage(
      image,
      x,
      y,
      dw,
      dh
    );

    this.ctx.restore();
  }


  render() {

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);


    const backgroundGradient =
      ctx.createLinearGradient(0, 0, w, h);

    backgroundGradient.addColorStop(0, this.state.background);
    backgroundGradient.addColorStop(1, this.state.bg2);

    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, w, h);


    if (this.backgroundImage) {
      this.drawCoverImage(this.backgroundImage);
    }


    if (this.state.overlay > 0) {
      ctx.fillStyle =
        `rgba(0,0,0,${this.state.overlay / 100})`;

      ctx.fillRect(0, 0, w, h);
    }


    if (this.state.accentGlow) {

      const glow =
        ctx.createRadialGradient(
          w * 0.82,
          h * 0.20,
          0,
          w * 0.82,
          h * 0.20,
          w * 0.65
        );

      glow.addColorStop(
        0,
        this.hexToRgba(this.state.accent, 0.24)
      );

      glow.addColorStop(
        1,
        this.hexToRgba(this.state.accent, 0)
      );

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }


    this.drawLeagueLogo();
    this.drawSponsorLogo();
    this.drawContent();


    if (this.state.safeZone) {
      this.drawSafeZone();
    }
  }


  drawLeagueLogo() {

    if (!this.logo) return;

    const margin =
      this.state.canvasSize === "story"
        ? 70
        : 58;

    const top =
      this.state.canvasSize === "story"
        ? 90
        : 58;

    const maxHeight =
      this.state.canvasSize === "story"
        ? 150
        : 125;

    const ratio =
      Math.min(
        maxHeight / this.logo.height,
        190 / this.logo.width
      );

    const width = this.logo.width * ratio;
    const height = this.logo.height * ratio;

    this.ctx.save();

    this.ctx.shadowColor = "rgba(0,0,0,.45)";
    this.ctx.shadowBlur = 28;

    this.ctx.drawImage(
      this.logo,
      margin,
      top,
      width,
      height
    );

    this.ctx.restore();
  }


  drawSponsorLogo() {

    if (!this.sponsorLogo) return;

    const w = this.canvas.width;

    const margin =
      this.state.canvasSize === "story"
        ? 70
        : 58;

    const top =
      this.state.canvasSize === "story"
        ? 95
        : 64;

    const maxW = 180;
    const maxH = 90;

    const ratio =
      Math.min(
        maxW / this.sponsorLogo.width,
        maxH / this.sponsorLogo.height
      );

    const width = this.sponsorLogo.width * ratio;
    const height = this.sponsorLogo.height * ratio;

    this.ctx.drawImage(
      this.sponsorLogo,
      w - margin - width,
      top,
      width,
      height
    );
  }


  drawContent() {

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const margin =
      this.state.canvasSize === "story"
        ? 90
        : 82;

    const maxWidth =
      w - margin * 2;

    const anchorX =
      this.state.align === "center"
        ? w / 2
        : this.state.align === "right"
          ? w - margin
          : margin;

    let y =
      h * (this.state.contentY / 100);


    ctx.textAlign = this.state.align;
    ctx.textBaseline = "top";

    ctx.fillStyle = this.state.accent;

    ctx.font =
      `800 25px "DM Sans"`;

    ctx.fillText(
      this.state.kicker.toUpperCase(),
      anchorX,
      y
    );

    y += 58;


    ctx.fillStyle = this.state.textColor;

    const headlineSize =
      this.state.canvasSize === "story"
        ? this.state.headlineSize * 1.08
        : this.state.headlineSize;

    const weight =
      this.state.headlineFont === "Bebas Neue"
        ? 400
        : 800;

    ctx.font =
      `${weight} ${headlineSize}px "${this.state.headlineFont}"`;

    const headlineHeight =
      this.drawWrappedHeadline(
        this.state.headline,
        anchorX,
        y,
        maxWidth,
        headlineSize * 0.93
      );

    y += headlineHeight + 35;


    if (
      this.state.align !== "center"
    ) {

      const lineWidth = 65;

      const lineX =
        this.state.align === "right"
          ? w - margin - lineWidth
          : margin;

      ctx.fillStyle = this.state.accent;

      ctx.fillRect(
        lineX,
        y,
        lineWidth,
        7
      );

      y += 36;
    }


    ctx.fillStyle =
      this.hexToRgba(
        this.state.textColor,
        0.82
      );

    ctx.font =
      `500 26px "DM Sans"`;

    const subHeight =
      this.drawWrappedText(
        this.state.subheadline,
        anchorX,
        y,
        Math.min(maxWidth, 760),
        39
      );

    y += subHeight + 44;


    if (this.state.cta.trim()) {
      this.drawCta(anchorX, y);
    }


    const bottom =
      this.state.canvasSize === "story"
        ? 120
        : 82;

    ctx.font =
      `700 20px "DM Sans"`;

    ctx.fillStyle =
      this.hexToRgba(
        this.state.textColor,
        0.72
      );

    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";

    ctx.fillText(
      this.state.footer,
      margin,
      h - bottom
    );

    ctx.textAlign = "right";

    ctx.fillText(
      this.state.brandName.toUpperCase(),
      w - margin,
      h - bottom
    );
  }


  drawWrappedHeadline(text, x, y, maxWidth, lineHeight) {

    const lines = [];

    text.split("\n").forEach(paragraph => {
      lines.push(...this.wrapLine(paragraph, maxWidth));
    });

    lines.forEach((line, index) => {
      this.ctx.fillText(
        line,
        x,
        y + index * lineHeight
      );
    });

    return lines.length * lineHeight;
  }


  drawWrappedText(text, x, y, maxWidth, lineHeight) {

    const lines = [];

    text.split("\n").forEach(paragraph => {
      lines.push(...this.wrapLine(paragraph, maxWidth));
    });

    lines.forEach((line, index) => {
      this.ctx.fillText(
        line,
        x,
        y + index * lineHeight
      );
    });

    return lines.length * lineHeight;
  }


  wrapLine(text, maxWidth) {

    const words = text.split(/\s+/);

    const lines = [];

    let current = "";

    words.forEach(word => {

      const candidate =
        current
          ? `${current} ${word}`
          : word;

      if (
        this.ctx.measureText(candidate).width > maxWidth &&
        current
      ) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });

    if (current) {
      lines.push(current);
    }

    return lines;
  }


  drawCta(x, y) {

    const ctx = this.ctx;

    ctx.font =
      `800 20px "DM Sans"`;

    const text =
      this.state.cta.toUpperCase();

    const width =
      ctx.measureText(text).width + 54;

    const height = 56;

    let left = x;

    if (this.state.align === "center") {
      left = x - width / 2;
    }

    if (this.state.align === "right") {
      left = x - width;
    }

    ctx.fillStyle = this.state.accent;

    this.roundRect(
      left,
      y,
      width,
      height,
      9
    );

    ctx.fill();


    ctx.fillStyle =
      this.getContrastColor(this.state.accent);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      text,
      left + width / 2,
      y + height / 2
    );
  }


  drawSafeZone() {

    const w = this.canvas.width;
    const h = this.canvas.height;

    const side = 72;

    const vertical =
      this.state.canvasSize === "story"
        ? 245
        : 72;

    this.ctx.save();

    this.ctx.setLineDash([13, 13]);

    this.ctx.strokeStyle =
      "rgba(240,195,76,.85)";

    this.ctx.lineWidth = 2;

    this.ctx.strokeRect(
      side,
      vertical,
      w - side * 2,
      h - vertical * 2
    );

    this.ctx.restore();
  }


  roundRect(x, y, width, height, radius) {

    const ctx = this.ctx;

    const r =
      Math.min(radius, width / 2, height / 2);

    ctx.beginPath();

    ctx.moveTo(x + r, y);

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


  getContrastColor(hex) {

    const clean = hex.replace("#", "");

    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);

    const brightness =
      r * 0.299 +
      g * 0.587 +
      b * 0.114;

    return brightness > 165
      ? "#0A0A0B"
      : "#FFFFFF";
  }


  hexToRgba(hex, alpha) {

    const clean = hex.replace("#", "");

    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);

    return `rgba(${r},${g},${b},${alpha})`;
  }


  export(format = "png") {

    const safe = this.state.safeZone;

    this.state.safeZone = false;

    this.render();

    const mime =
      format === "jpg"
        ? "image/jpeg"
        : "image/png";

    const data =
      this.canvas.toDataURL(
        mime,
        format === "jpg" ? 0.94 : 1
      );

    const link = document.createElement("a");

    link.download =
      `fwcwl-poster-${Date.now()}.${format}`;

    link.href = data;

    link.click();

    this.state.safeZone = safe;

    this.render();
  }
}
