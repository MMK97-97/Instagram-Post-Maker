(() => {
  "use strict";

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


  const FORMATS = {
    reel: {
      width: 1080,
      height: 1920,
      label: "Reel / Story"
    },

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

    landscape: {
      width: 1920,
      height: 1080,
      label: "Landscape"
    }
  };


  const VIDEO_TEMPLATES = [

    {
      id: "match-day",
      name: "Match Day Impact",
      category: "match",
      duration: 8,
      title: "MATCH\nDAY",
      kicker: "FWCWL • MATCH DAY",
      detail: "SATURDAY • 10:00 AM • TAMPA",
      palette: [
        "#08090b",
        "#5b111b",
        "#f1c34d"
      ],
      style: "slash"
    },

    {
      id: "versus",
      name: "Big VS",
      category: "match",
      duration: 8,
      title: "TEAM A\nVS\nTEAM B",
      kicker: "THE SHOWDOWN",
      detail: "ONE GROUND • ONE WINNER",
      palette: [
        "#061421",
        "#68141f",
        "#f1c34d"
      ],
      style: "vs"
    },

    {
      id: "game-night",
      name: "Game Night",
      category: "match",
      duration: 9,
      title: "GAME\nNIGHT",
      kicker: "UNDER THE LIGHTS",
      detail: "FWCWL • PRIME TIME CRICKET",
      palette: [
        "#031018",
        "#0c3441",
        "#f1c34d"
      ],
      style: "stadium"
    },

    {
      id: "fixture",
      name: "Fixture Drop",
      category: "match",
      duration: 7,
      title: "NEXT\nFIXTURE",
      kicker: "SAVE THE DATE",
      detail: "SATURDAY • TAMPA",
      palette: [
        "#111317",
        "#4a1118",
        "#f1c34d"
      ],
      style: "grid"
    },

    {
      id: "spotlight",
      name: "Player Spotlight",
      category: "player",
      duration: 8,
      title: "PLAYER\nSPOTLIGHT",
      kicker: "FWCWL PLAYER SERIES",
      detail: "NAME • ROLE • TEAM",
      palette: [
        "#06191c",
        "#521720",
        "#f1c34d"
      ],
      style: "player"
    },

    {
      id: "potm",
      name: "Player of Match",
      category: "player",
      duration: 8,
      title: "PLAYER OF\nTHE MATCH",
      kicker: "OUTSTANDING PERFORMANCE",
      detail: "MATCH AWARD",
      palette: [
        "#151016",
        "#651c2a",
        "#d7aa3d"
      ],
      style: "player"
    },

    {
      id: "mvp",
      name: "MVP",
      category: "player",
      duration: 7,
      title: "MVP",
      kicker: "MOST VALUABLE PLAYER",
      detail: "PURE IMPACT",
      palette: [
        "#080808",
        "#2c210d",
        "#f4c94f"
      ],
      style: "gold"
    },

    {
      id: "captain",
      name: "Captain Reveal",
      category: "player",
      duration: 8,
      title: "OUR\nCAPTAIN",
      kicker: "LEADING THE SIDE",
      detail: "LEADERSHIP • BELIEF",
      palette: [
        "#06131b",
        "#341018",
        "#f1c34d"
      ],
      style: "player"
    },

    {
      id: "playing-xi",
      name: "Playing XI",
      category: "team",
      duration: 10,
      title: "PLAYING\nXI",
      kicker: "OFFICIAL TEAM SHEET",
      detail: "MATCH DAY LINEUP",
      palette: [
        "#061b18",
        "#102a22",
        "#f1c34d"
      ],
      style: "pitch"
    },

    {
      id: "squad",
      name: "Squad Reveal",
      category: "team",
      duration: 10,
      title: "SQUAD\nREVEAL",
      kicker: "MEET THE TEAM",
      detail: "FWCWL CRICKET",
      palette: [
        "#151013",
        "#5c1520",
        "#f1c34d"
      ],
      style: "cards"
    },

    {
      id: "jersey",
      name: "Jersey Reveal",
      category: "team",
      duration: 9,
      title: "JERSEY\nREVEAL",
      kicker: "NEW SEASON",
      detail: "BUILT FOR THE GAME",
      palette: [
        "#05080b",
        "#102b3b",
        "#d9ad39"
      ],
      style: "gold"
    },

    {
      id: "team-ready",
      name: "Team Ready",
      category: "team",
      duration: 8,
      title: "THE TEAM\nIS READY",
      kicker: "OFFICIAL ANNOUNCEMENT",
      detail: "FWCWL • TAMPA",
      palette: [
        "#090a0c",
        "#60151d",
        "#f1c34d"
      ],
      style: "slash"
    },

    {
      id: "result",
      name: "Match Result",
      category: "result",
      duration: 7,
      title: "VICTORY",
      kicker: "FINAL RESULT",
      detail: "WON BY 24 RUNS",
      palette: [
        "#06171b",
        "#46131a",
        "#f1c34d"
      ],
      style: "result"
    },

    {
      id: "score",
      name: "Scoreboard",
      category: "result",
      duration: 7,
      title: "186 / 5",
      kicker: "FINAL SCORE",
      detail: "20 OVERS • TARGET 163",
      palette: [
        "#050708",
        "#172428",
        "#f1c34d"
      ],
      style: "score"
    },

    {
      id: "live",
      name: "Live Score",
      category: "result",
      duration: 8,
      title: "142 / 4",
      kicker: "● LIVE",
      detail: "16.2 OVERS",
      palette: [
        "#061219",
        "#181b20",
        "#e63a47"
      ],
      style: "score"
    },

    {
      id: "champions",
      name: "Champions",
      category: "result",
      duration: 10,
      title: "CHAMPIONS",
      kicker: "FWCWL CHAMPIONS",
      detail: "THE TROPHY IS OURS",
      palette: [
        "#080808",
        "#34220c",
        "#f1c34d"
      ],
      style: "gold"
    },

    {
      id: "final",
      name: "The Final",
      category: "event",
      duration: 9,
      title: "THE\nFINAL",
      kicker: "CHAMPIONSHIP",
      detail: "ONE GAME • ONE TROPHY",
      palette: [
        "#08080a",
        "#421017",
        "#f1c34d"
      ],
      style: "gold"
    },

    {
      id: "semi",
      name: "Semi Final",
      category: "event",
      duration: 8,
      title: "SEMI\nFINAL",
      kicker: "ONE STEP AWAY",
      detail: "EVERY BALL MATTERS",
      palette: [
        "#07111f",
        "#701623",
        "#f1c34d"
      ],
      style: "slash"
    },

    {
      id: "tournament",
      name: "Tournament",
      category: "event",
      duration: 10,
      title: "WINTER\nLEAGUE",
      kicker: "FWCWL PRESENTS",
      detail: "TAMPA • FLORIDA",
      palette: [
        "#052023",
        "#10504e",
        "#edbc42"
      ],
      style: "pitch"
    },

    {
      id: "registration",
      name: "Registration",
      category: "event",
      duration: 8,
      title: "JOIN\nTHE LEAGUE",
      kicker: "REGISTRATION OPEN",
      detail: "TEAMS • PLAYERS • CRICKET",
      palette: [
        "#111013",
        "#5b131d",
        "#f1c34d"
      ],
      style: "grid"
    },

    {
      id: "tryouts",
      name: "Tryouts",
      category: "event",
      duration: 8,
      title: "OPEN\nTRYOUTS",
      kicker: "SHOW US YOUR GAME",
      detail: "YOUR NEXT INNINGS STARTS HERE",
      palette: [
        "#06171b",
        "#1f3a43",
        "#f1c34d"
      ],
      style: "slash"
    },

    {
      id: "milestone",
      name: "Milestone",
      category: "social",
      duration: 7,
      title: "100",
      kicker: "CAREER MILESTONE",
      detail: "A LANDMARK INNINGS",
      palette: [
        "#071419",
        "#50131c",
        "#f1c34d"
      ],
      style: "gold"
    },

    {
      id: "breaking",
      name: "Breaking News",
      category: "social",
      duration: 7,
      title: "BIG\nNEWS",
      kicker: "FWCWL • BREAKING",
      detail: "OFFICIAL ANNOUNCEMENT",
      palette: [
        "#090a0d",
        "#601019",
        "#f1c34d"
      ],
      style: "slash"
    },

    {
      id: "highlights",
      name: "Highlights",
      category: "social",
      duration: 10,
      title: "HIGHLIGHTS",
      kicker: "MATCH RECAP",
      detail: "THE MOMENTS THAT MATTERED",
      palette: [
        "#061419",
        "#55131d",
        "#f1c34d"
      ],
      style: "slash"
    }

  ];


  class VideoEditor {

    constructor() {

      this.poster =
        $("#posterWorkspace");

      this.root =
        document.createElement(
          "section"
        );

      this.root.id =
        "fwcwlVideoStudio";

      this.root.className =
        "video-studio";

      this.root.hidden =
        true;


      this.poster.parentNode
        .insertBefore(
          this.root,
          this.poster.nextSibling
        );


      this.project = {
        format: "reel",
        width: 1080,
        height: 1920,
        templateId:
          "match-day",
        duration: 8,
        currentTime: 0,
        title:
          "MATCH\nDAY",
        kicker:
          "FWCWL • MATCH DAY",
        detail:
          "SATURDAY • 10:00 AM • TAMPA",
        palette: [
          "#08090b",
          "#5b111b",
          "#f1c34d"
        ],
        style:
          "slash"
      };


      this.canvas =
        null;

      this.ctx =
        null;

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


      this.media =
        null;

      this.mediaUrl =
        null;

      this.audio =
        null;

      this.audioUrl =
        null;

      this.playing =
        false;

      this.playStarted =
        0;

      this.playStartTime =
        0;

      this.raf =
        null;


      this.build();

      this.bind();

      this.applyTemplate(
        "match-day"
      );
    }


    build() {
      this.root.innerHTML = `
        <header class="video-header">

          <div class="video-header-left">

            <strong>
              FWCWL VIDEO STUDIO
            </strong>

            <select id="videoFormat">

              <option value="reel">
                Reel / Story · 1080 × 1920
              </option>

              <option value="portrait">
                Portrait · 1080 × 1350
              </option>

              <option value="square">
                Square · 1080 × 1080
              </option>

              <option value="landscape">
                Landscape · 1920 × 1080
              </option>

            </select>

          </div>


          <div class="video-header-right">

            <button
              id="videoUpload"
              type="button"
            >
              + Media
            </button>

            <button
              id="videoAudioUpload"
              type="button"
            >
              + Audio
            </button>

            <button
              id="videoExport"
              class="video-export-button"
              type="button"
            >
              Export Video
            </button>

          </div>

        </header>


        <div class="video-main">

          <aside class="video-left">

            <div class="video-panel">

              <div class="micro-label">
                FWCWL MOTION LIBRARY
              </div>

              <h2
                style="
                  margin:5px 0 0;
                  font-size:15px;
                "
              >
                Video Templates
              </h2>

              <p
                style="
                  margin:6px 0 0;
                  color:#626771;
                  font-size:7px;
                  line-height:1.5;
                "
              >
                Purpose-built cricket reels
                and animated social graphics.
              </p>


              <div
                id="videoTemplateGrid"
                class="video-template-grid"
              ></div>

            </div>

          </aside>


          <main class="video-stage-column">

            <div class="video-stage">

              <canvas
                id="videoCanvas"
                width="1080"
                height="1920"
              ></canvas>

            </div>


            <div class="video-controls">

              <div class="video-time">

                <strong id="videoCurrent">
                  00:00.00
                </strong>

                <span>/</span>

                <span id="videoTotal">
                  00:08.00
                </span>

              </div>


              <div class="video-controls-center">

                <button
                  id="videoStart"
                  type="button"
                >
                  |◀
                </button>

                <button
                  id="videoBack"
                  type="button"
                >
                  ◀
                </button>

                <button
                  id="videoPlay"
                  class="video-play"
                  type="button"
                >
                  ▶
                </button>

                <button
                  id="videoForward"
                  type="button"
                >
                  ▶
                </button>

                <button
                  id="videoEnd"
                  type="button"
                >
                  ▶|
                </button>

              </div>


              <div></div>

            </div>

          </main>


          <aside class="video-right">

            <div class="video-inspector-section">

              <div class="micro-label">
                CONTENT
              </div>

              <label class="field">
                <span>Kicker</span>

                <input
                  id="videoKicker"
                >
              </label>


              <label class="field">
                <span>Headline</span>

                <textarea
                  id="videoTitle"
                ></textarea>
              </label>


              <label class="field">
                <span>Details</span>

                <textarea
                  id="videoDetail"
                ></textarea>
              </label>

            </div>


            <div class="video-inspector-section">

              <div class="micro-label">
                TIMING
              </div>

              <label class="range-field">

                <div>
                  <span>Duration</span>
                  <b id="videoDurationValue">
                    8s
                  </b>
                </div>

                <input
                  id="videoDuration"
                  type="range"
                  min="3"
                  max="30"
                  step=".5"
                  value="8"
                >

              </label>

            </div>


            <div class="video-inspector-section">

              <div class="micro-label">
                PLAYHEAD
              </div>

              <input
                id="videoSeek"
                type="range"
                min="0"
                max="8"
                step=".01"
                value="0"
              >

            </div>

          </aside>

        </div>


        <footer class="video-timeline-shell">

          <div class="video-timeline-toolbar">

            <strong>
              MULTI-TRACK TIMELINE
            </strong>

            <div>
              <button
                id="videoReset"
                type="button"
              >
                Reset
              </button>
            </div>

          </div>


          <div
            id="videoTimeline"
            class="video-timeline"
          ></div>

        </footer>


        <input
          id="videoMediaInput"
          type="file"
          accept="video/*,image/*"
          hidden
        >

        <input
          id="videoAudioInput"
          type="file"
          accept="audio/*"
          hidden
        >
      `;


      this.canvas =
        $("#videoCanvas");

      this.ctx =
        this.canvas
          .getContext("2d");


      this.renderTemplates();

      this.renderTimeline();
    }


    template() {
      return (
        VIDEO_TEMPLATES.find(
          template =>
            template.id ===
            this.project.templateId
        ) ||
        VIDEO_TEMPLATES[0]
      );
    }


    applyTemplate(
      id
    ) {
      const template =
        VIDEO_TEMPLATES.find(
          item =>
            item.id === id
        ) ||
        VIDEO_TEMPLATES[0];


      this.project.templateId =
        template.id;

      this.project.duration =
        template.duration;

      this.project.currentTime =
        0;

      this.project.title =
        template.title;

      this.project.kicker =
        template.kicker;

      this.project.detail =
        template.detail;

      this.project.palette =
        [...template.palette];

      this.project.style =
        template.style;


      $("#videoKicker")
        .value =
        this.project.kicker;

      $("#videoTitle")
        .value =
        this.project.title;

      $("#videoDetail")
        .value =
        this.project.detail;

      $("#videoDuration")
        .value =
        this.project.duration;

      $("#videoDurationValue")
        .textContent =
        `${this.project.duration}s`;

      $("#videoSeek")
        .max =
        this.project.duration;

      $("#videoSeek")
        .value =
        0;


      this.updateTime();

      this.render();

      this.renderTemplates();

      this.renderTimeline();
    }


    renderTemplates() {
      const grid =
        $("#videoTemplateGrid");

      if (!grid) {
        return;
      }


      grid.innerHTML =
        VIDEO_TEMPLATES
          .map(
            template => `
              <button
                class="video-template ${
                  template.id ===
                  this.project.templateId
                    ? "active"
                    : ""
                }"
                data-video-template="${template.id}"
                type="button"
              >

                <div class="video-template-preview">

                  <canvas
                    width="180"
                    height="320"
                    data-video-preview="${template.id}"
                  ></canvas>

                </div>

                <strong>
                  ${template.name}
                </strong>

              </button>
            `
          )
          .join("");


      grid
        .querySelectorAll(
          "[data-video-template]"
        )
        .forEach(
          button => {
            button.addEventListener(
              "click",
              () =>
                this.applyTemplate(
                  button.dataset
                    .videoTemplate
                )
            );
          }
        );


      requestAnimationFrame(
        () => {
          VIDEO_TEMPLATES.forEach(
            template => {
              const canvas =
                grid.querySelector(
                  `[data-video-preview="${template.id}"]`
                );

              if (!canvas) {
                return;
              }

              const ctx =
                canvas.getContext("2d");

              this.drawFrame(
                ctx,
                canvas.width,
                canvas.height,
                template,
                template.duration *
                .34,
                true
              );
            }
          );
        }
      );
    }


    render() {
      const format =
        FORMATS[
          this.project.format
        ];


      if (
        this.canvas.width !==
          format.width ||
        this.canvas.height !==
          format.height
      ) {
        this.canvas.width =
          format.width;

        this.canvas.height =
          format.height;
      }


      this.drawFrame(
        this.ctx,
        this.canvas.width,
        this.canvas.height,
        this.template(),
        this.project.currentTime,
        false
      );
    }


    drawFrame(
      ctx,
      W,
      H,
      template,
      time,
      thumbnail
    ) {
      const colors =
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
        colors[0]
      );

      gradient.addColorStop(
        1,
        colors[1]
      );

      ctx.fillStyle =
        gradient;

      ctx.fillRect(
        0,
        0,
        W,
        H
      );


      this.drawMedia(
        ctx,
        W,
        H,
        time
      );


      const progress =
        clamp(
          time /
          Math.max(
            .1,
            template.duration
          ),
          0,
          1
        );


      this.drawMotionArt(
        ctx,
        W,
        H,
        template,
        progress
      );


      const shade =
        ctx.createLinearGradient(
          0,
          H * .25,
          0,
          H
        );

      shade.addColorStop(
        0,
        "rgba(0,0,0,.03)"
      );

      shade.addColorStop(
        .65,
        "rgba(0,0,0,.25)"
      );

      shade.addColorStop(
        1,
        "rgba(0,0,0,.68)"
      );

      ctx.fillStyle =
        shade;

      ctx.fillRect(
        0,
        0,
        W,
        H
      );


      if (
        this.logoReady
      ) {
        const maxW =
          W * .14;

        const maxH =
          H * .075;

        const scale =
          Math.min(
            maxW /
            this.logo.naturalWidth,

            maxH /
            this.logo.naturalHeight
          );

        ctx.drawImage(
          this.logo,
          W * .055,
          H * .035,
          this.logo.naturalWidth *
          scale,
          this.logo.naturalHeight *
          scale
        );
      }


      const intro =
        clamp(
          time / .65,
          0,
          1
        );

      const titleIntro =
        clamp(
          (
            time -
            .45
          ) /
          .65,
          0,
          1
        );


      ctx.save();


      ctx.globalAlpha =
        intro;


      ctx.fillStyle =
        colors[2];

      ctx.font =
        `900 ${
          W * .025
        }px "DM Sans"`;

      ctx.textAlign =
        "left";

      ctx.textBaseline =
        "top";

      ctx.fillText(
        this.project.kicker ||
        template.kicker,
        W * .07,
        H * .38
      );


      const title =
        this.project.title ||
        template.title;


      ctx.globalAlpha =
        titleIntro;


      const titleX =
        W * .07 +
        (
          1 -
          titleIntro
        ) *
        -W *
        .12;


      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        `900 ${
          W *
          (
            thumbnail
              ? .105
              : .115
          )
        }px "Montserrat"`;


      const lines =
        title.split("\n");

      let y =
        H * .43;

      const lineHeight =
        W * .105;


      lines.forEach(
        line => {
          ctx.fillText(
            line,
            titleX,
            y
          );

          y +=
            lineHeight;
        }
      );


      const detailIntro =
        clamp(
          (
            time -
            1.2
          ) /
          .7,
          0,
          1
        );


      ctx.globalAlpha =
        detailIntro;

      ctx.fillStyle =
        "rgba(255,255,255,.72)";

      ctx.font =
        `700 ${
          W * .027
        }px "DM Sans"`;

      ctx.fillText(
        this.project.detail ||
        template.detail,
        W * .07,
        H * .70
      );


      ctx.restore();


      ctx.fillStyle =
        "rgba(255,255,255,.38)";

      ctx.font =
        `800 ${
          W * .015
        }px "DM Sans"`;

      ctx.textAlign =
        "right";

      ctx.fillText(
        "FWCWL",
        W * .94,
        H * .955
      );
    }


    drawMedia(
      ctx,
      W,
      H,
      time
    ) {
      if (!this.media) {
        return;
      }


      const source =
        this.media.element;


      if (
        this.media.type ===
        "video"
      ) {
        if (
          source.readyState < 2
        ) {
          return;
        }

        if (
          !this.playing
        ) {
          const desired =
            Math.min(
              source.duration -
              .03,
              time
            );

          if (
            Number.isFinite(desired) &&
            Math.abs(
              source.currentTime -
              desired
            ) > .08
          ) {
            try {
              source.currentTime =
                Math.max(
                  0,
                  desired
                );
            } catch {}
          }
        }
      }


      const sourceW =
        source.videoWidth ||
        source.naturalWidth;

      const sourceH =
        source.videoHeight ||
        source.naturalHeight;


      if (
        !sourceW ||
        !sourceH
      ) {
        return;
      }


      const scale =
        Math.max(
          W / sourceW,
          H / sourceH
        ) *
        (
          1 +
          time /
          Math.max(
            1,
            this.project.duration
          ) *
          .04
        );


      const drawW =
        sourceW *
        scale;

      const drawH =
        sourceH *
        scale;


      ctx.save();

      ctx.globalAlpha =
        .72;

      ctx.filter =
        "contrast(108%) saturate(106%)";


      ctx.drawImage(
        source,
        (
          W -
          drawW
        ) / 2,
        (
          H -
          drawH
        ) / 2,
        drawW,
        drawH
      );


      ctx.restore();
    }


    drawMotionArt(
      ctx,
      W,
      H,
      template,
      progress
    ) {
      const accent =
        template.palette[2];


      switch (
        template.style
      ) {

        case "slash":

          for (
            let i = 0;
            i < 4;
            i++
          ) {
            ctx.save();

            ctx.translate(
              W *
              (
                .56 +
                i * .095 +
                progress * .025
              ),
              H * .45
            );

            ctx.rotate(-.25);

            ctx.fillStyle =
              `rgba(241,195,77,${
                .045 +
                i * .012
              })`;

            ctx.fillRect(
              0,
              -H * .7,
              W * .07,
              H * 1.4
            );

            ctx.restore();
          }

          break;


        case "vs":

          ctx.strokeStyle =
            `rgba(241,195,77,${
              .22 +
              progress * .12
            })`;

          ctx.lineWidth =
            W * .01;

          ctx.beginPath();

          ctx.arc(
            W * .5,
            H * .42,
            W *
            (
              .15 +
              progress * .02
            ),
            0,
            Math.PI * 2
          );

          ctx.stroke();

          break;


        case "stadium":

          for (
            let i = 0;
            i < 6;
            i++
          ) {
            const x =
              W *
              (
                .08 +
                i * .17
              );

            const grad =
              ctx.createLinearGradient(
                x,
                0,
                W / 2,
                H * .75
              );

            grad.addColorStop(
              0,
              "rgba(255,255,255,.09)"
            );

            grad.addColorStop(
              1,
              "rgba(255,255,255,0)"
            );

            ctx.fillStyle =
              grad;

            ctx.beginPath();

            ctx.moveTo(
              x - W * .02,
              0
            );

            ctx.lineTo(
              x + W * .02,
              0
            );

            ctx.lineTo(
              W / 2,
              H * .75
            );

            ctx.closePath();

            ctx.fill();
          }

          break;


        case "gold":

          for (
            let i = 0;
            i < 16;
            i++
          ) {
            ctx.save();

            ctx.translate(
              W / 2,
              H * .43
            );

            ctx.rotate(
              i /
              16 *
              Math.PI *
              2 +
              progress * .15
            );

            ctx.fillStyle =
              "rgba(241,195,77,.05)";

            ctx.fillRect(
              W * .13,
              -W * .008,
              W * .33,
              W * .016
            );

            ctx.restore();
          }

          break;


        case "player":

          ctx.strokeStyle =
            "rgba(241,195,77,.30)";

          ctx.lineWidth =
            W * .008;

          ctx.beginPath();

          ctx.arc(
            W * .76,
            H * .35,
            W * .15,
            0,
            Math.PI * 2
          );

          ctx.stroke();

          break;


        case "pitch":

          ctx.strokeStyle =
            "rgba(241,195,77,.20)";

          ctx.lineWidth =
            W * .004;

          ctx.strokeRect(
            W * .62,
            H * .18,
            W * .25,
            H * .50
          );

          break;


        case "cards":

          for (
            let i = 0;
            i < 3;
            i++
          ) {
            ctx.fillStyle =
              i === 1
                ? "rgba(241,195,77,.10)"
                : "rgba(255,255,255,.025)";

            ctx.fillRect(
              W *
              (
                .60 +
                i * .08
              ),
              H *
              (
                .29 +
                i * .06
              ),
              W * .20,
              H * .28
            );
          }

          break;


        case "score":

          ctx.fillStyle =
            "rgba(0,0,0,.26)";

          ctx.fillRect(
            W * .06,
            H * .28,
            W * .88,
            H * .35
          );

          break;


        case "result":

          ctx.strokeStyle =
            "rgba(241,195,77,.25)";

          ctx.lineWidth =
            W * .004;

          ctx.strokeRect(
            W * .05,
            H * .05,
            W * .90,
            H * .90
          );

          break;


        case "grid":

          for (
            let y = H * .18;
            y < H;
            y += H * .055
          ) {
            ctx.strokeStyle =
              "rgba(255,255,255,.035)";

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

          break;
      }


      if (
        progress > .05
      ) {
        const sweepX =
          -W +
          progress *
          W *
          2.4;

        const sweep =
          ctx.createLinearGradient(
            sweepX,
            0,
            sweepX +
            W * .35,
            0
          );

        sweep.addColorStop(
          0,
          "rgba(255,255,255,0)"
        );

        sweep.addColorStop(
          .5,
          "rgba(241,195,77,.10)"
        );

        sweep.addColorStop(
          1,
          "rgba(255,255,255,0)"
        );

        ctx.fillStyle =
          sweep;

        ctx.fillRect(
          0,
          0,
          W,
          H
        );
      }
    }


    /* ========================================================
       TIMELINE
    ======================================================== */

    renderTimeline() {
      const root =
        $("#videoTimeline");

      if (!root) {
        return;
      }


      const scale =
        90;

      const width =
        Math.max(
          900,
          this.project.duration *
          scale
        );


      const clip = (
        name,
        className,
        start,
        duration
      ) => `
        <div
          class="video-clip ${className}"
          style="
            left:${
              start * scale
            }px;
            width:${
              duration * scale
            }px;
          "
        >
          ${name}
        </div>
      `;


      root.innerHTML = `

        <div
          class="video-track"
          style="width:${width}px"
        >

          <div class="video-track-label">
            MEDIA
          </div>

          ${clip(
            this.media
              ? this.media.name
              : "Main Media",
            "",
            0,
            this.project.duration
          )}

        </div>


        <div
          class="video-track"
          style="width:${width}px"
        >

          <div class="video-track-label">
            HEADLINE
          </div>

          ${clip(
            "Headline",
            "text",
            .4,
            Math.max(
              1,
              this.project.duration -
              1.4
            )
          )}

        </div>


        <div
          class="video-track"
          style="width:${width}px"
        >

          <div class="video-track-label">
            DETAILS
          </div>

          ${clip(
            "Details",
            "detail",
            1.1,
            Math.max(
              1,
              this.project.duration -
              2
            )
          )}

        </div>


        <div
          class="video-track"
          style="width:${width}px"
        >

          <div class="video-track-label">
            AUDIO
          </div>

          ${
            this.audio
              ? clip(
                  this.audio.name,
                  "",
                  0,
                  this.project.duration
                )
              : ""
          }

        </div>


        <div
          id="videoTimelinePlayhead"
          class="video-playhead"
          style="
            left:${
              80 +
              this.project.currentTime *
              scale
            }px
          "
        ></div>
      `;
    }


    updateTimelinePlayhead() {
      const playhead =
        $("#videoTimelinePlayhead");

      if (!playhead) {
        return;
      }

      playhead.style.left =
        `${
          80 +
          this.project.currentTime *
          90
        }px`;
    }


    /* ========================================================
       PLAYBACK
    ======================================================== */

    play() {
      if (
        this.playing
      ) {
        this.pause();
        return;
      }


      if (
        this.project.currentTime >=
        this.project.duration -
        .02
      ) {
        this.seek(0);
      }


      this.playing = true;

      this.playStarted =
        performance.now();

      this.playStartTime =
        this.project.currentTime;


      $("#videoPlay")
        .textContent =
        "Ⅱ";


      if (
        this.media?.type ===
        "video"
      ) {
        this.media.element
          .play()
          .catch(
            () => {}
          );
      }


      if (
        this.audio?.element
      ) {
        try {
          this.audio.element.currentTime =
            this.project.currentTime;
        } catch {}

        this.audio.element
          .play()
          .catch(
            () => {}
          );
      }


      const tick =
        now => {
          if (!this.playing) {
            return;
          }


          this.project.currentTime =
            this.playStartTime +
            (
              now -
              this.playStarted
            ) /
            1000;


          if (
            this.project.currentTime >=
            this.project.duration
          ) {
            this.project.currentTime =
              this.project.duration;

            this.render();

            this.updateTime();

            this.updateTimelinePlayhead();

            this.pause();

            return;
          }


          this.render();

          this.updateTime();

          this.updateTimelinePlayhead();


          $("#videoSeek")
            .value =
            this.project.currentTime;


          this.raf =
            requestAnimationFrame(
              tick
            );
        };


      this.raf =
        requestAnimationFrame(
          tick
        );
    }


    pause() {
      this.playing = false;

      cancelAnimationFrame(
        this.raf
      );


      this.media?.element
        ?.pause?.();

      this.audio?.element
        ?.pause?.();


      $("#videoPlay")
        .textContent =
        "▶";
    }


    seek(
      time
    ) {
      this.project.currentTime =
        clamp(
          time,
          0,
          this.project.duration
        );


      if (
        this.media?.type ===
        "video"
      ) {
        try {
          this.media.element.currentTime =
            Math.min(
              this.media.element.duration -
              .03,
              this.project.currentTime
            );
        } catch {}
      }


      if (
        this.audio?.element
      ) {
        try {
          this.audio.element.currentTime =
            Math.min(
              this.audio.element.duration -
              .03,
              this.project.currentTime
            );
        } catch {}
      }


      if (
        this.playing
      ) {
        this.playStarted =
          performance.now();

        this.playStartTime =
          this.project.currentTime;
      }


      $("#videoSeek")
        .value =
        this.project.currentTime;


      this.render();

      this.updateTime();

      this.updateTimelinePlayhead();
    }


    updateTime() {
      $("#videoCurrent")
        .textContent =
        this.formatTime(
          this.project.currentTime
        );

      $("#videoTotal")
        .textContent =
        this.formatTime(
          this.project.duration
        );
    }


    formatTime(
      seconds
    ) {
      const safe =
        Math.max(
          0,
          Number(seconds)
        );

      const min =
        Math.floor(
          safe / 60
        );

      const sec =
        Math.floor(
          safe % 60
        );

      const cent =
        Math.floor(
          (
            safe -
            Math.floor(safe)
          ) *
          100
        );


      return `${
        String(min)
          .padStart(
            2,
            "0"
          )
      }:${
        String(sec)
          .padStart(
            2,
            "0"
          )
      }.${
        String(cent)
          .padStart(
            2,
            "0"
          )
      }`;
    }


    /* ========================================================
       MEDIA
    ======================================================== */

    async importMedia(
      file
    ) {
      if (!file) {
        return;
      }


      this.mediaUrl &&
        URL.revokeObjectURL(
          this.mediaUrl
        );


      this.mediaUrl =
        URL.createObjectURL(
          file
        );


      if (
        file.type
          .startsWith("image/")
      ) {
        const image =
          new Image();

        image.src =
          this.mediaUrl;

        await image.decode();

        this.media = {
          type: "image",
          name: file.name,
          element: image
        };
      } else {
        const video =
          document.createElement(
            "video"
          );

        video.src =
          this.mediaUrl;

        video.preload =
          "auto";

        video.playsInline =
          true;

        await new Promise(
          (
            resolve,
            reject
          ) => {
            video.addEventListener(
              "loadedmetadata",
              resolve,
              {
                once: true
              }
            );

            video.addEventListener(
              "error",
              reject,
              {
                once: true
              }
            );
          }
        );


        this.media = {
          type: "video",
          name: file.name,
          element: video
        };
      }


      this.render();

      this.renderTimeline();
    }


    async importAudio(
      file
    ) {
      if (!file) {
        return;
      }


      this.audioUrl &&
        URL.revokeObjectURL(
          this.audioUrl
        );


      this.audioUrl =
        URL.createObjectURL(
          file
        );


      const audio =
        new Audio(
          this.audioUrl
        );

      audio.preload =
        "auto";


      this.audio = {
        name: file.name,
        element: audio
      };


      this.renderTimeline();
    }


    /* ========================================================
       EXPORT
    ======================================================== */

    async exportVideo() {
      if (
        typeof MediaRecorder ===
        "undefined"
      ) {
        alert(
          "Video export is not supported in this browser."
        );

        return;
      }


      this.pause();


      const previous =
        this.project.currentTime;


      this.seek(0);


      const stream =
        this.canvas.captureStream(
          30
        );


      const tracks = [
        ...stream
          .getVideoTracks()
      ];


      if (
        this.audio?.element &&
        typeof this.audio.element
          .captureStream ===
          "function"
      ) {
        try {
          const audioStream =
            this.audio.element
              .captureStream();

          tracks.push(
            ...audioStream
              .getAudioTracks()
          );
        } catch {}
      }


      const combined =
        new MediaStream(
          tracks
        );


      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm"
      ];


      const mime =
        mimeTypes.find(
          type =>
            MediaRecorder
              .isTypeSupported(type)
        ) ||
        "";


      const recorder =
        new MediaRecorder(
          combined,
          mime
            ? {
                mimeType: mime,
                videoBitsPerSecond:
                  12000000
              }
            : undefined
        );


      const chunks = [];


      recorder.ondataavailable =
        event => {
          if (
            event.data.size
          ) {
            chunks.push(
              event.data
            );
          }
        };


      const completed =
        new Promise(
          resolve => {
            recorder.onstop =
              resolve;
          }
        );


      recorder.start(500);


      if (
        this.media?.type ===
        "video"
      ) {
        try {
          this.media.element.currentTime =
            0;
        } catch {}

        this.media.element
          .play()
          .catch(
            () => {}
          );
      }


      if (
        this.audio?.element
      ) {
        try {
          this.audio.element.currentTime =
            0;
        } catch {}

        this.audio.element
          .play()
          .catch(
            () => {}
          );
      }


      const started =
        performance.now();


      await new Promise(
        resolve => {
          const tick =
            now => {
              const elapsed =
                (
                  now -
                  started
                ) /
                1000;


              this.project.currentTime =
                Math.min(
                  this.project.duration,
                  elapsed
                );


              this.render();


              if (
                elapsed >=
                this.project.duration
              ) {
                resolve();

                return;
              }


              requestAnimationFrame(
                tick
              );
            };


          requestAnimationFrame(
            tick
          );
        }
      );


      this.media?.element
        ?.pause?.();

      this.audio?.element
        ?.pause?.();


      recorder.stop();


      await completed;


      const blob =
        new Blob(
          chunks,
          {
            type:
              recorder.mimeType ||
              "video/webm"
          }
        );


      const url =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        url;

      link.download =
        "fwcwl-video.webm";


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
        2500
      );


      this.seek(
        previous
      );
    }


    /* ========================================================
       MODE
    ======================================================== */

    show() {
      this.poster.style.display =
        "none";

      this.root.hidden =
        false;

      $("#posterModeBtn")
        .classList
        .remove("active");

      $("#videoModeBtn")
        .classList
        .add("active");


      $("#undoBtn")
        .style.display =
        "none";

      $("#redoBtn")
        .style.display =
        "none";

      $("#resetBtn")
        .style.display =
        "none";

      $("#exportTopBtn")
        .style.display =
        "none";


      this.render();

      this.renderTemplates();
    }


    hide() {
      this.pause();

      this.root.hidden =
        true;

      this.poster.style.display =
        "";


      $("#videoModeBtn")
        .classList
        .remove("active");

      $("#posterModeBtn")
        .classList
        .add("active");


      $("#undoBtn")
        .style.display =
        "";

      $("#redoBtn")
        .style.display =
        "";

      $("#resetBtn")
        .style.display =
        "";

      $("#exportTopBtn")
        .style.display =
        "";
    }


    /* ========================================================
       UI
    ======================================================== */

    bind() {
      $("#videoModeBtn")
        .addEventListener(
          "click",
          () =>
            this.show()
        );


      $("#posterModeBtn")
        .addEventListener(
          "click",
          () =>
            this.hide()
        );


      $("#videoFormat")
        .addEventListener(
          "change",
          event => {
            const format =
              FORMATS[
                event.target.value
              ];

            this.project.format =
              event.target.value;

            this.project.width =
              format.width;

            this.project.height =
              format.height;

            this.render();
          }
        );


      $("#videoKicker")
        .addEventListener(
          "input",
          event => {
            this.project.kicker =
              event.target.value;

            this.render();
          }
        );


      $("#videoTitle")
        .addEventListener(
          "input",
          event => {
            this.project.title =
              event.target.value;

            this.render();
          }
        );


      $("#videoDetail")
        .addEventListener(
          "input",
          event => {
            this.project.detail =
              event.target.value;

            this.render();
          }
        );


      $("#videoDuration")
        .addEventListener(
          "input",
          event => {
            this.project.duration =
              Number(
                event.target.value
              );

            $("#videoDurationValue")
              .textContent =
              `${this.project.duration}s`;

            $("#videoSeek")
              .max =
              this.project.duration;

            this.project.currentTime =
              Math.min(
                this.project.currentTime,
                this.project.duration
              );

            this.updateTime();

            this.renderTimeline();
          }
        );


      $("#videoSeek")
        .addEventListener(
          "input",
          event =>
            this.seek(
              Number(
                event.target.value
              )
            )
        );


      $("#videoPlay")
        .addEventListener(
          "click",
          () =>
            this.play()
        );


      $("#videoStart")
        .addEventListener(
          "click",
          () =>
            this.seek(0)
        );


      $("#videoEnd")
        .addEventListener(
          "click",
          () =>
            this.seek(
              this.project.duration
            )
        );


      $("#videoBack")
        .addEventListener(
          "click",
          () =>
            this.seek(
              this.project.currentTime -
              1 / 30
            )
        );


      $("#videoForward")
        .addEventListener(
          "click",
          () =>
            this.seek(
              this.project.currentTime +
              1 / 30
            )
        );


      $("#videoUpload")
        .addEventListener(
          "click",
          () =>
            $("#videoMediaInput")
              .click()
        );


      $("#videoAudioUpload")
        .addEventListener(
          "click",
          () =>
            $("#videoAudioInput")
              .click()
        );


      $("#videoMediaInput")
        .addEventListener(
          "change",
          async event => {
            await this.importMedia(
              event.target.files[0]
            );

            event.target.value =
              "";
          }
        );


      $("#videoAudioInput")
        .addEventListener(
          "change",
          async event => {
            await this.importAudio(
              event.target.files[0]
            );

            event.target.value =
              "";
          }
        );


      $("#videoExport")
        .addEventListener(
          "click",
          () =>
            this.exportVideo()
        );


      $("#videoReset")
        .addEventListener(
          "click",
          () =>
            this.applyTemplate(
              "match-day"
            )
        );
    }

  }


  window.addEventListener(
    "DOMContentLoaded",
    () => {
      window.FWCWLVideoEditor =
        new VideoEditor();
    }
  );

})();
