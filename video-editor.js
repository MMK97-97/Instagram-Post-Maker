import {
  VIDEO_PRESETS
} from "./cricket-templates.js";


const VIDEO_SIZES = {

  reel: {
    width: 1080,
    height: 1920
  },

  portrait: {
    width: 1080,
    height: 1350
  },

  square: {
    width: 1080,
    height: 1080
  },

  landscape: {
    width: 1920,
    height: 1080
  }

};


export class VideoEditor {

  constructor() {

    this.canvas =
      document.getElementById(
        "videoCanvas"
      );

    this.ctx =
      this.canvas.getContext(
        "2d",
        {
          alpha: false
        }
      );


    this.video =
      document.getElementById(
        "videoSource"
      );

    this.audio =
      document.getElementById(
        "audioSource"
      );


    this.media = [];

    this.clips = [];

    this.images = [];


    this.audioTrack =
      null;


    this.selectedClipId =
      null;


    this.officialLogo =
      null;


    this.currentTime =
      0;


    this.playing =
      false;


    this.playStartTimestamp =
      0;


    this.timelineZoom =
      100;


    this.snapEnabled =
      true;


    this.activeSourceUrl =
      null;


    this.audioContext =
      null;

    this.audioDestination =
      null;

    this.videoSourceNode =
      null;

    this.audioSourceNode =
      null;

    this.videoGain =
      null;

    this.musicGain =
      null;

    this.mixGain =
      null;

    this.previewGain =
      null;


    this.exporting =
      false;


    this.history =
      [];

    this.historyIndex =
      -1;


    this.dragState =
      null;


    this.project = {

      aspect: "reel",

      logoVisible: true,

      logoSize: 100,

      musicVolume: 60,

      text: {

        title:
          "MATCH DAY",

        subtitle:
          "FWCWL • TAMPA, FLORIDA",

        score: "",

        start: 0,

        end: 5,

        animation:
          "rise"

      }

    };


    this.init();
  }



  async init() {

    this.officialLogo =
      await this.loadImage(
        "assets/fwcwl-logo.jpeg"
      );


    this.bind();

    this.renderVideoPresets();

    this.resizeCanvas();

    this.pushHistory();

    this.renderTimeline();

    this.renderFrame();
  }



  /* =====================================================
     IMAGE LOADER
  ====================================================== */

  loadImage(src) {

    return new Promise(
      (resolve, reject) => {

        const image =
          new Image();

        image.onload =
          () => resolve(image);

        image.onerror =
          reject;

        image.src =
          src;
      }
    );
  }



  /* =====================================================
     BIND
  ====================================================== */

  bind() {

    this.bindTabs();

    this.bindUploads();

    this.bindPlayback();

    this.bindTimeline();

    this.bindInspector();

    this.bindGraphics();

    this.bindBrand();

    this.bindExport();
  }



  bindTabs() {

    document
      .querySelectorAll(
        "[data-video-tab]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                "[data-video-tab]"
              )
              .forEach(item =>
                item.classList.remove(
                  "active"
                )
              );


            document
              .querySelectorAll(
                "#videoLeftPanel .left-tab-panel"
              )
              .forEach(panel =>
                panel.classList.remove(
                  "active"
                )
              );


            button.classList.add(
              "active"
            );


            const name =
              button.dataset.videoTab;


            const panelMap = {

              media:
                "videoMediaPanel",

              templates:
                "videoTemplatesPanel",

              text:
                "videoTextPanel"

            };


            document
              .getElementById(
                panelMap[name]
              )
              .classList.add(
                "active"
              );
          }
        );
      });
  }



  bindUploads() {

    document
      .getElementById(
        "videoUploadInput"
      )
      .addEventListener(
        "change",
        event => {

          this.handleVideoFiles(
            [
              ...event.target.files
            ]
          );

          event.target.value =
            "";
        }
      );


    document
      .getElementById(
        "videoImageUploadInput"
      )
      .addEventListener(
        "change",
        event => {

          this.handleImageFiles(
            [
              ...event.target.files
            ]
          );

          event.target.value =
            "";
        }
      );


    document
      .getElementById(
        "videoAudioUploadInput"
      )
      .addEventListener(
        "change",
        event => {

          const file =
            event.target.files[0];

          if (file) {
            this.handleAudioFile(
              file
            );
          }

          event.target.value =
            "";
        }
      );
  }



  bindPlayback() {

    document
      .getElementById(
        "videoPlayBtn"
      )
      .addEventListener(
        "click",
        () =>
          this.togglePlayback()
      );


    document
      .getElementById(
        "videoSkipBackBtn"
      )
      .addEventListener(
        "click",
        () =>
          this.seekRelative(-1)
      );


    document
      .getElementById(
        "videoSkipForwardBtn"
      )
      .addEventListener(
        "click",
        () =>
          this.seekRelative(1)
      );


    document
      .getElementById(
        "videoSeekRange"
      )
      .addEventListener(
        "input",
        event => {

          const duration =
            this.getDuration();


          const ratio =
            Number(
              event.target.value
            ) /
            1000;


          this.seek(
            duration *
            ratio
          );
        }
      );
  }



  bindTimeline() {

    document
      .getElementById(
        "timelineZoom"
      )
      .addEventListener(
        "input",
        event => {

          this.timelineZoom =
            Number(
              event.target.value
            );

          this.renderTimeline();
        }
      );


    document
      .getElementById(
        "timelineSnapBtn"
      )
      .addEventListener(
        "click",
        event => {

          this.snapEnabled =
            !this.snapEnabled;


          event.currentTarget
            .classList
            .toggle(
              "active",
              this.snapEnabled
            );
        }
      );


    document
      .getElementById(
        "timelineFitBtn"
      )
      .addEventListener(
        "click",
        () =>
          this.fitTimeline()
      );


    document
      .getElementById(
        "videoSplitBtn"
      )
      .addEventListener(
        "click",
        () =>
          this.splitSelectedClip()
      );


    document
      .getElementById(
        "videoDuplicateBtn"
      )
      .addEventListener(
        "click",
        () =>
          this.duplicateSelectedClip()
      );


    document
      .getElementById(
        "videoDeleteBtn"
      )
      .addEventListener(
        "click",
        () =>
          this.deleteSelectedClip()
      );


    const playheadHandle =
      document.getElementById(
        "timelinePlayheadHandle"
      );


    playheadHandle.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        this.startPlayheadDrag(
          event
        );
      }
    );
  }



  bindInspector() {

    document
      .getElementById(
        "videoAspectSelect"
      )
      .addEventListener(
        "change",
        event => {

          this.project.aspect =
            event.target.value;

          this.resizeCanvas();

          this.commit();
        }
      );


    const numberBindings = [

      [
        "clipTrimStart",
        "trimStart"
      ],

      [
        "clipTrimEnd",
        "trimEnd"
      ],

      [
        "clipScale",
        "scale"
      ],

      [
        "clipX",
        "x"
      ],

      [
        "clipY",
        "y"
      ],

      [
        "clipRotation",
        "rotation"
      ],

      [
        "clipBrightness",
        "brightness"
      ],

      [
        "clipSaturation",
        "saturation"
      ],

      [
        "clipContrast",
        "contrast"
      ]

    ];


    numberBindings.forEach(
      ([id, key]) => {

        const control =
          document.getElementById(
            id
          );


        control.addEventListener(
          "input",
          event => {

            const clip =
              this.getSelectedClip();

            if (!clip) return;


            const value =
              Number(
                event.target.value
              );


            if (
              key ===
              "trimStart"
            ) {

              clip.trimStart =
                Math.max(
                  0,
                  Math.min(
                    value,
                    clip.trimEnd -
                    0.05
                  )
                );
            }


            else if (
              key ===
              "trimEnd"
            ) {

              clip.trimEnd =
                Math.max(
                  clip.trimStart +
                  0.05,

                  Math.min(
                    value,
                    clip.sourceDuration
                  )
                );
            }


            else {

              clip[key] =
                value;
            }


            this.refreshInspectorLabels();

            this.renderTimeline();

            this.syncPreview(
              true
            );

            this.renderFrame();
          }
        );


        control.addEventListener(
          "change",
          () =>
            this.commit()
        );
      }
    );


    document
      .getElementById(
        "clipSpeed"
      )
      .addEventListener(
        "change",
        event => {

          const clip =
            this.getSelectedClip();

          if (!clip) return;


          clip.speed =
            Number(
              event.target.value
            );


          this.renderTimeline();

          this.syncPreview(
            true
          );


          this.commit();
        }
      );


    document
      .getElementById(
        "clipVolume"
      )
      .addEventListener(
        "input",
        event => {

          const clip =
            this.getSelectedClip();

          if (!clip) return;


          clip.volume =
            Number(
              event.target.value
            );


          document
            .getElementById(
              "clipVolumeValue"
            )
            .textContent =
            `${clip.volume}%`;


          this.video.volume =
            clip.volume /
            100;


          if (
            this.videoGain
          ) {

            this.videoGain
              .gain
              .value =
              clip.volume /
              100;
          }
        }
      );


    document
      .getElementById(
        "clipVolume"
      )
      .addEventListener(
        "change",
        () =>
          this.commit()
      );


    [
      [
        "clipTransitionIn",
        "transitionIn"
      ],

      [
        "clipTransitionOut",
        "transitionOut"
      ]

    ].forEach(
      ([id,key]) => {

        document
          .getElementById(id)
          .addEventListener(
            "change",
            event => {

              const clip =
                this.getSelectedClip();

              if (!clip) return;


              clip[key] =
                event.target.value;


              this.renderFrame();

              this.commit();
            }
          );
      }
    );
  }



  bindGraphics() {

    this.bindProjectText(
      "videoTitleText",
      "title"
    );


    this.bindProjectText(
      "videoSubtitleText",
      "subtitle"
    );


    this.bindProjectText(
      "videoScoreText",
      "score"
    );


    document
      .getElementById(
        "videoTextStart"
      )
      .addEventListener(
        "change",
        event => {

          this.project
            .text
            .start =
            Math.max(
              0,
              Number(
                event.target.value
              )
            );


          if (
            this.project.text.end <
            this.project.text.start
          ) {

            this.project
              .text
              .end =
              this.project
                .text
                .start +
              1;
          }


          this.renderTimeline();

          this.renderFrame();

          this.commit();
        }
      );


    document
      .getElementById(
        "videoTextEnd"
      )
      .addEventListener(
        "change",
        event => {

          this.project
            .text
            .end =
            Math.max(
              this.project
                .text
                .start +
              0.1,

              Number(
                event.target.value
              )
            );


          this.renderTimeline();

          this.renderFrame();

          this.commit();
        }
      );


    document
      .getElementById(
        "videoTextAnimation"
      )
      .addEventListener(
        "change",
        event => {

          this.project
            .text
            .animation =
            event.target.value;

          this.renderFrame();

          this.commit();
        }
      );


    document
      .getElementById(
        "videoAddMatchTitleBtn"
      )
      .addEventListener(
        "click",
        () => {

          this.applyTextPreset(
            "MATCH DAY",
            "FWCWL • TAMPA, FLORIDA",
            "",
            "rise"
          );
        }
      );


    document
      .getElementById(
        "videoAddPlayerTitleBtn"
      )
      .addEventListener(
        "click",
        () => {

          this.applyTextPreset(
            "PLAYER NAME",
            "FWCWL • PLAYER PROFILE",
            "BATSMAN",
            "slide"
          );
        }
      );


    document
      .getElementById(
        "videoAddScoreTitleBtn"
      )
      .addEventListener(
        "click",
        () => {

          this.applyTextPreset(
            "LIVE SCORE",
            "15.2 OVERS",
            "142/3",
            "pop"
          );
        }
      );
  }



  bindProjectText(
    id,
    key
  ) {

    document
      .getElementById(id)
      .addEventListener(
        "input",
        event => {

          this.project
            .text[key] =
            event.target.value;

          this.renderFrame();
        }
      );


    document
      .getElementById(id)
      .addEventListener(
        "change",
        () =>
          this.commit()
      );
  }



  bindBrand() {

    document
      .getElementById(
        "videoShowLogo"
      )
      .addEventListener(
        "change",
        event => {

          this.project
            .logoVisible =
            event.target.checked;

          this.renderFrame();

          this.commit();
        }
      );


    document
      .getElementById(
        "videoLogoSize"
      )
      .addEventListener(
        "input",
        event => {

          this.project
            .logoSize =
            Number(
              event.target.value
            );


          document
            .getElementById(
              "videoLogoSizeValue"
            )
            .textContent =
            `${this.project.logoSize}%`;


          this.renderFrame();
        }
      );


    document
      .getElementById(
        "videoLogoSize"
      )
      .addEventListener(
        "change",
        () =>
          this.commit()
      );


    document
      .getElementById(
        "videoMusicVolume"
      )
      .addEventListener(
        "input",
        event => {

          this.project
            .musicVolume =
            Number(
              event.target.value
            );


          document
            .getElementById(
              "videoMusicVolumeValue"
            )
            .textContent =
            `${this.project.musicVolume}%`;


          this.audio.volume =
            this.project
              .musicVolume /
            100;


          if (
            this.musicGain
          ) {

            this.musicGain
              .gain
              .value =
              this.project
                .musicVolume /
              100;
          }
        }
      );


    document
      .getElementById(
        "videoMusicVolume"
      )
      .addEventListener(
        "change",
        () =>
          this.commit()
      );
  }



  bindExport() {

    document
      .getElementById(
        "videoExportBtn"
      )
      .addEventListener(
        "click",
        () =>
          this.exportVideo()
      );


    document
      .getElementById(
        "videoExportTopBtn"
      )
      .addEventListener(
        "click",
        () =>
          this.exportVideo()
      );
  }



  /* =====================================================
     MEDIA
  ====================================================== */

  async handleVideoFiles(
    files
  ) {

    for (
      const file of files
    ) {

      const url =
        URL.createObjectURL(
          file
        );


      const duration =
        await this
          .getVideoDuration(
            url
          );


      const media = {

        id:
          crypto.randomUUID(),

        type:
          "video",

        name:
          file.name,

        url,

        duration

      };


      this.media.push(
        media
      );


      this.addVideoClip(
        media,
        false
      );
    }


    this.renderMediaLibrary();

    this.commit();
  }



  async handleImageFiles(
    files
  ) {

    for (
      const file of files
    ) {

      const url =
        URL.createObjectURL(
          file
        );


      const image =
        await this.loadImage(
          url
        );


      this.media.push({

        id:
          crypto.randomUUID(),

        type:
          "image",

        name:
          file.name,

        url,

        image

      });
    }


    this.renderMediaLibrary();

    this.commit();
  }



  handleAudioFile(
    file
  ) {

    const url =
      URL.createObjectURL(
        file
      );


    const media = {

      id:
        crypto.randomUUID(),

      type:
        "audio",

      name:
        file.name,

      url

    };


    this.media.push(
      media
    );


    this.audioTrack =
      media;


    this.audio.src =
      url;


    this.audio.loop =
      true;


    this.audio.volume =
      this.project
        .musicVolume /
      100;


    document
      .getElementById(
        "audioStatusCard"
      )
      .textContent =
      file.name;


    this.renderMediaLibrary();

    this.renderTimeline();

    this.commit();
  }



  getVideoDuration(
    url
  ) {

    return new Promise(
      resolve => {

        const video =
          document.createElement(
            "video"
          );


        video.preload =
          "metadata";


        video.src =
          url;


        video.onloadedmetadata =
          () => {

            resolve(
              Number.isFinite(
                video.duration
              )
                ? video.duration
                : 1
            );
          };
      }
    );
  }



  addVideoClip(
    media,
    save = true
  ) {

    const clip = {

      id:
        crypto.randomUUID(),

      mediaId:
        media.id,

      name:
        media.name,

      url:
        media.url,

      sourceDuration:
        media.duration,

      trimStart:
        0,

      trimEnd:
        media.duration,

      speed:
        1,

      volume:
        100,

      scale:
        100,

      x:
        50,

      y:
        50,

      rotation:
        0,

      brightness:
        100,

      saturation:
        100,

      contrast:
        100,

      transitionIn:
        "fade",

      transitionOut:
        "fade"

    };


    this.clips.push(
      clip
    );


    this.selectedClipId =
      clip.id;


    this.updateInspector();

    this.renderTimeline();


    this.seek(
      this.getClipStart(
        clip.id
      )
    );


    if (save) {
      this.commit();
    }
  }



  addImageOverlay(
    media
  ) {

    const duration =
      Math.max(
        this.getDuration(),
        5
      );


    const start =
      Math.min(
        this.currentTime,
        duration
      );


    this.images.push({

      id:
        crypto.randomUUID(),

      mediaId:
        media.id,

      name:
        media.name,

      image:
        media.image,

      start,

      end:
        Math.min(
          duration,
          start + 5
        ),

      x:
        50,

      y:
        53,

      scale:
        42,

      opacity:
        1

    });


    this.renderTimeline();

    this.renderFrame();

    this.commit();
  }



  renderMediaLibrary() {

    const container =
      document.getElementById(
        "videoMediaLibrary"
      );


    document
      .getElementById(
        "videoMediaCount"
      )
      .textContent =
      `${this.media.length} item${
        this.media.length === 1
          ? ""
          : "s"
      }`;


    if (
      !this.media.length
    ) {

      container.innerHTML =
        `
        <div class="empty-state">

          <div class="empty-state-icon">
            ▶
          </div>

          <strong>
            No media yet
          </strong>

          <span>
            Upload match clips, player photos or music.
          </span>

        </div>
        `;

      return;
    }


    container.innerHTML =
      this.media
        .map(media => {

          const icon =
            media.type === "video"
              ? "▶"
              : media.type === "image"
                ? "▧"
                : "♫";


          const action =
            media.type === "video"
              ? "Add"
              : media.type === "image"
                ? "Overlay"
                : "Use";


          return `
            <div class="media-library-card">

              <div class="media-library-icon">
                ${icon}
              </div>

              <div class="media-library-info">

                <strong>
                  ${this.escapeHtml(
                    media.name
                  )}
                </strong>

                <span>
                  ${media.type}
                </span>

              </div>

              <button
                type="button"
                data-media-action="${media.id}"
              >
                ${action}
              </button>

            </div>
          `;
        })
        .join("");


    container
      .querySelectorAll(
        "[data-media-action]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const media =
              this.media.find(
                item =>
                  item.id ===
                  button.dataset
                    .mediaAction
              );


            if (!media) return;


            if (
              media.type ===
              "video"
            ) {

              this.addVideoClip(
                media
              );
            }


            if (
              media.type ===
              "image"
            ) {

              this.addImageOverlay(
                media
              );
            }


            if (
              media.type ===
              "audio"
            ) {

              this.audioTrack =
                media;


              this.audio.src =
                media.url;


              document
                .getElementById(
                  "audioStatusCard"
                )
                .textContent =
                media.name;


              this.renderTimeline();

              this.commit();
            }
          }
        );
      });
  }



  /* =====================================================
     PRESETS
  ====================================================== */

  renderVideoPresets() {

    const grid =
      document.getElementById(
        "videoPresetGrid"
      );


    grid.innerHTML =
      VIDEO_PRESETS
        .map(
          preset => `
          <button
            class="video-preset-card"
            data-video-preset="${preset.id}"
            type="button"
          >

            <img
              src="assets/fwcwl-logo.jpeg"
              alt=""
            />

            <span>
              FWCWL
            </span>

            <strong>
              ${this.escapeHtml(
                preset.title
              )}
            </strong>

            <small>
              ${this.escapeHtml(
                preset.name
              )}
            </small>

          </button>
        `
        )
        .join("");


    grid
      .querySelectorAll(
        "[data-video-preset]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const preset =
              VIDEO_PRESETS.find(
                item =>
                  item.id ===
                  button.dataset
                    .videoPreset
              );


            if (!preset) return;


            this.applyTextPreset(

              preset.title,

              preset.subtitle,

              preset.score,

              preset.animation

            );
          }
        );
      });
  }



  applyTextPreset(
    title,
    subtitle,
    score,
    animation
  ) {

    const duration =
      Math.max(
        this.getDuration(),
        5
      );


    this.project.text = {

      title,

      subtitle,

      score,

      start:
        this.currentTime,

      end:
        Math.min(
          duration,
          this.currentTime +
          5
        ),

      animation

    };


    document
      .getElementById(
        "videoTitleText"
      )
      .value =
      title;


    document
      .getElementById(
        "videoSubtitleText"
      )
      .value =
      subtitle;


    document
      .getElementById(
        "videoScoreText"
      )
      .value =
      score;


    document
      .getElementById(
        "videoTextStart"
      )
      .value =
      this.project
        .text
        .start
        .toFixed(1);


    document
      .getElementById(
        "videoTextEnd"
      )
      .value =
      this.project
        .text
        .end
        .toFixed(1);


    document
      .getElementById(
        "videoTextAnimation"
      )
      .value =
      animation;


    this.renderTimeline();

    this.renderFrame();

    this.commit();
  }



  /* =====================================================
     CLIPS
  ====================================================== */

  getClipDuration(
    clip
  ) {

    return (
      (
        clip.trimEnd -
        clip.trimStart
      ) /
      clip.speed
    );
  }



  getDuration() {

    return this.clips.reduce(
      (
        total,
        clip
      ) =>
        total +
        this.getClipDuration(
          clip
        ),
      0
    );
  }



  getClipStart(
    clipId
  ) {

    let time =
      0;


    for (
      const clip of
      this.clips
    ) {

      if (
        clip.id ===
        clipId
      ) {

        return time;
      }


      time +=
        this.getClipDuration(
          clip
        );
    }


    return 0;
  }



  getClipAtTime(
    time
  ) {

    let start =
      0;


    for (
      let index = 0;
      index <
      this.clips.length;
      index++
    ) {

      const clip =
        this.clips[index];


      const duration =
        this.getClipDuration(
          clip
        );


      const end =
        start +
        duration;


      if (
        time >= start &&
        (
          time < end ||
          (
            index ===
              this.clips.length -
              1 &&
            time === end
          )
        )
      ) {

        return {

          clip,

          index,

          start,

          end,

          local:
            Math.max(
              0,
              time -
              start
            )

        };
      }


      start =
        end;
    }


    return null;
  }



  getSelectedClip() {

    return (
      this.clips.find(
        clip =>
          clip.id ===
          this.selectedClipId
      ) ||
      null
    );
  }



  selectClip(
    id
  ) {

    this.selectedClipId =
      id;


    this.updateInspector();

    this.renderTimeline();
  }



  splitSelectedClip() {

    const clip =
      this.getSelectedClip();


    if (!clip) return;


    const start =
      this.getClipStart(
        clip.id
      );


    const localTimeline =
      this.currentTime -
      start;


    const duration =
      this.getClipDuration(
        clip
      );


    if (
      localTimeline <= .05 ||
      localTimeline >=
        duration - .05
    ) {

      return;
    }


    const sourceSplit =
      clip.trimStart +
      localTimeline *
      clip.speed;


    const first = {

      ...clip,

      id:
        crypto.randomUUID(),

      trimEnd:
        sourceSplit

    };


    const second = {

      ...clip,

      id:
        crypto.randomUUID(),

      trimStart:
        sourceSplit

    };


    const index =
      this.clips.findIndex(
        item =>
          item.id ===
          clip.id
      );


    this.clips.splice(
      index,
      1,
      first,
      second
    );


    this.selectedClipId =
      second.id;


    this.updateInspector();

    this.renderTimeline();

    this.syncPreview(
      true
    );

    this.commit();
  }



  duplicateSelectedClip() {

    const clip =
      this.getSelectedClip();


    if (!clip) return;


    const duplicate = {

      ...clip,

      id:
        crypto.randomUUID(),

      name:
        `${clip.name} Copy`

    };


    const index =
      this.clips.findIndex(
        item =>
          item.id ===
          clip.id
      );


    this.clips.splice(
      index + 1,
      0,
      duplicate
    );


    this.selectedClipId =
      duplicate.id;


    this.updateInspector();

    this.renderTimeline();

    this.commit();
  }



  deleteSelectedClip() {

    const index =
      this.clips.findIndex(
        item =>
          item.id ===
          this.selectedClipId
      );


    if (
      index === -1
    ) {
      return;
    }


    this.clips.splice(
      index,
      1
    );


    this.selectedClipId =
      this.clips[index]?.id ||
      this.clips[
        index - 1
      ]?.id ||
      null;


    const duration =
      this.getDuration();


    if (
      this.currentTime >
      duration
    ) {

      this.currentTime =
        duration;
    }


    this.updateInspector();

    this.renderTimeline();

    this.syncPreview(
      true
    );

    this.renderFrame();

    this.commit();
  }



  moveClip(
    fromIndex,
    toIndex
  ) {

    if (
      fromIndex ===
      toIndex
    ) {
      return;
    }


    const [clip] =
      this.clips.splice(
        fromIndex,
        1
      );


    this.clips.splice(
      toIndex,
      0,
      clip
    );


    this.renderTimeline();

    this.syncPreview(
      true
    );

    this.commit();
  }



  /* =====================================================
     INSPECTOR
  ====================================================== */

  updateInspector() {

    const clip =
      this.getSelectedClip();


    document
      .getElementById(
        "selectedClipBadge"
      )
      .textContent =
      clip
        ? clip.name
        : "None selected";


    if (!clip) {
      return;
    }


    document
      .getElementById(
        "clipTrimStart"
      )
      .value =
      clip.trimStart
        .toFixed(2);


    document
      .getElementById(
        "clipTrimEnd"
      )
      .value =
      clip.trimEnd
        .toFixed(2);


    document
      .getElementById(
        "clipTrimEnd"
      )
      .max =
      clip.sourceDuration;


    document
      .getElementById(
        "clipSpeed"
      )
      .value =
      String(
        clip.speed
      );


    document
      .getElementById(
        "clipVolume"
      )
      .value =
      clip.volume;


    document
      .getElementById(
        "clipScale"
      )
      .value =
      clip.scale;


    document
      .getElementById(
        "clipX"
      )
      .value =
      clip.x;


    document
      .getElementById(
        "clipY"
      )
      .value =
      clip.y;


    document
      .getElementById(
        "clipRotation"
      )
      .value =
      clip.rotation;


    document
      .getElementById(
        "clipBrightness"
      )
      .value =
      clip.brightness;


    document
      .getElementById(
        "clipSaturation"
      )
      .value =
      clip.saturation;


    document
      .getElementById(
        "clipContrast"
      )
      .value =
      clip.contrast;


    document
      .getElementById(
        "clipTransitionIn"
      )
      .value =
      clip.transitionIn;


    document
      .getElementById(
        "clipTransitionOut"
      )
      .value =
      clip.transitionOut;


    this.refreshInspectorLabels();
  }



  refreshInspectorLabels() {

    const clip =
      this.getSelectedClip();


    if (!clip) return;


    const labels = {

      clipVolumeValue:
        `${clip.volume}%`,

      clipScaleValue:
        `${clip.scale}%`,

      clipXValue:
        `${clip.x}%`,

      clipYValue:
        `${clip.y}%`,

      clipRotationValue:
        `${clip.rotation}°`,

      clipBrightnessValue:
        `${clip.brightness}%`,

      clipSaturationValue:
        `${clip.saturation}%`,

      clipContrastValue:
        `${clip.contrast}%`

    };


    Object.entries(
      labels
    )
      .forEach(
        ([id,value]) => {

          document
            .getElementById(id)
            .textContent =
            value;
        }
      );
  }



  /* =====================================================
     PLAYBACK
  ====================================================== */

  togglePlayback() {

    if (
      this.playing
    ) {

      this.pause();

    } else {

      this.play();
    }
  }



  async play() {

    const duration =
      this.getDuration();


    if (
      !duration
    ) {
      return;
    }


    if (
      this.currentTime >=
      duration
    ) {

      this.currentTime =
        0;
    }


    this.playing =
      true;


    document
      .getElementById(
        "videoPlayBtn"
      )
      .textContent =
      "❚❚";


    this.playStartTimestamp =
      performance.now() -
      this.currentTime *
      1000;


    await this.syncPreview(
      true
    );


    if (
      this.audioTrack
    ) {

      try {

        if (
          Number.isFinite(
            this.audio.duration
          ) &&
          this.audio.duration >
          0
        ) {

          this.audio.currentTime =
            this.currentTime %
            this.audio.duration;
        }


        await this.audio.play();

      } catch {}
    }


    requestAnimationFrame(
      () =>
        this.tick()
    );
  }



  pause() {

    this.playing =
      false;


    this.video.pause();

    this.audio.pause();


    document
      .getElementById(
        "videoPlayBtn"
      )
      .textContent =
      "▶";
  }



  async tick() {

    if (
      !this.playing
    ) {
      return;
    }


    const duration =
      this.getDuration();


    this.currentTime =
      (
        performance.now() -
        this.playStartTimestamp
      ) /
      1000;


    if (
      this.currentTime >=
      duration
    ) {

      this.currentTime =
        duration;


      this.pause();

      this.renderFrame();

      this.updatePlaybackUi();


      if (
        this.exporting
      ) {

        this
          .onExportPlaybackFinished
          ?.();
      }


      return;
    }


    await this.syncPreview(
      false
    );


    this.renderFrame();

    this.updatePlaybackUi();


    requestAnimationFrame(
      () =>
        this.tick()
    );
  }



  seekRelative(
    delta
  ) {

    this.seek(
      this.currentTime +
      delta
    );
  }



  seek(
    time
  ) {

    const duration =
      this.getDuration();


    this.currentTime =
      Math.max(
        0,
        Math.min(
          time,
          duration
        )
      );


    if (
      this.playing
    ) {

      this.playStartTimestamp =
        performance.now() -
        this.currentTime *
        1000;
    }


    this.syncPreview(
      true
    );


    this.syncAudioToTime();


    this.renderFrame();

    this.updatePlaybackUi();
  }



  async syncPreview(
    forceSeek = false
  ) {

    const active =
      this.getClipAtTime(
        this.currentTime
      );


    if (!active) {

      this.video.pause();

      return;
    }


    const {
      clip,
      local
    } =
      active;


    const sourceTime =
      clip.trimStart +
      local *
      clip.speed;


    const changed =
      this.activeSourceUrl !==
      clip.url;


    if (changed) {

      this.video.pause();


      this.video.src =
        clip.url;


      this.activeSourceUrl =
        clip.url;


      await new Promise(
        resolve => {

          if (
            this.video.readyState >=
            1
          ) {

            resolve();

          } else {

            this.video
              .onloadedmetadata =
              () => resolve();
          }
        }
      );


      try {

        this.video.currentTime =
          sourceTime;

      } catch {}
    }


    else if (
      forceSeek ||
      Math.abs(
        this.video.currentTime -
        sourceTime
      ) >
      .14
    ) {

      try {

        this.video.currentTime =
          sourceTime;

      } catch {}
    }


    this.video.playbackRate =
      clip.speed;


    this.video.volume =
      clip.volume /
      100;


    if (
      this.videoGain
    ) {

      this.videoGain
        .gain
        .value =
        clip.volume /
        100;
    }


    if (
      this.playing &&
      this.video.paused
    ) {

      try {

        await this.video.play();

      } catch {}
    }
  }



  syncAudioToTime() {

    if (
      !this.audioTrack
    ) {
      return;
    }


    if (
      Number.isFinite(
        this.audio.duration
      ) &&
      this.audio.duration >
      0
    ) {

      this.audio.currentTime =
        this.currentTime %
        this.audio.duration;
    }
  }



  /* =====================================================
     RENDER
  ====================================================== */

  resizeCanvas() {

    const size =
      VIDEO_SIZES[
        this.project.aspect
      ];


    this.canvas.width =
      size.width;


    this.canvas.height =
      size.height;


    const shell =
      document.querySelector(
        ".video-preview-shell"
      );


    shell.style.aspectRatio =
      `${size.width} / ${size.height}`;


    this.renderFrame();
  }



  renderFrame() {

    const ctx =
      this.ctx;


    const w =
      this.canvas.width;


    const h =
      this.canvas.height;


    ctx.clearRect(
      0,
      0,
      w,
      h
    );


    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        w,
        h
      );


    gradient.addColorStop(
      0,
      "#12151a"
    );


    gradient.addColorStop(
      1,
      "#040506"
    );


    ctx.fillStyle =
      gradient;


    ctx.fillRect(
      0,
      0,
      w,
      h
    );


    const active =
      this.getClipAtTime(
        this.currentTime
      );


    document
      .getElementById(
        "videoEmptyPreview"
      )
      .classList
      .toggle(
        "hidden",
        Boolean(active)
      );


    if (
      active &&
      this.video.readyState >=
      2
    ) {

      this.drawVideoClip(
        active
      );
    }


    this.drawImageOverlays();


    if (
      this.project
        .logoVisible
    ) {

      this.drawOfficialLogo();
    }


    this.drawVideoText();


    this.updatePlaybackUi();
  }



  drawVideoClip(
    active
  ) {

    const {
      clip,
      local
    } =
      active;


    const ctx =
      this.ctx;


    const w =
      this.canvas.width;


    const h =
      this.canvas.height;


    const sourceW =
      this.video.videoWidth ||
      w;


    const sourceH =
      this.video.videoHeight ||
      h;


    let scale =
      Math.max(
        w / sourceW,
        h / sourceH
      );


    scale *=
      clip.scale /
      100;


    const dw =
      sourceW *
      scale;


    const dh =
      sourceH *
      scale;


    const overflowX =
      Math.max(
        0,
        dw - w
      );


    const overflowY =
      Math.max(
        0,
        dh - h
      );


    let x =
      -(
        overflowX *
        (
          clip.x /
          100
        )
      );


    let y =
      -(
        overflowY *
        (
          clip.y /
          100
        )
      );


    const duration =
      this.getClipDuration(
        clip
      );


    const transition =
      Math.min(
        .45,
        duration /
        3
      );


    let alpha =
      1;


    let effectScale =
      1;


    let offsetX =
      0;


    if (
      local <
      transition
    ) {

      const p =
        local /
        transition;


      if (
        clip.transitionIn ===
        "fade"
      ) {

        alpha *=
          p;
      }


      if (
        clip.transitionIn ===
        "zoom"
      ) {

        alpha *=
          p;

        effectScale =
          1.14 -
          .14 *
          this.easeOutCubic(
            p
          );
      }


      if (
        clip.transitionIn ===
        "slide"
      ) {

        alpha *=
          p;

        offsetX =
          (
            1 -
            this.easeOutCubic(
              p
            )
          ) *
          w *
          .14;
      }
    }


    const remaining =
      duration -
      local;


    if (
      remaining <
      transition
    ) {

      const p =
        remaining /
        transition;


      if (
        clip.transitionOut ===
        "fade"
      ) {

        alpha *=
          p;
      }


      if (
        clip.transitionOut ===
        "zoom"
      ) {

        alpha *=
          p;

        effectScale =
          1 +
          (
            1 -
            p
          ) *
          .10;
      }


      if (
        clip.transitionOut ===
        "slide"
      ) {

        alpha *=
          p;

        offsetX =
          -(
            1 -
            p
          ) *
          w *
          .12;
      }
    }


    ctx.save();


    ctx.globalAlpha =
      Math.max(
        0,
        Math.min(
          1,
          alpha
        )
      );


    ctx.filter =
      `
      brightness(${clip.brightness}%)
      saturate(${clip.saturation}%)
      contrast(${clip.contrast}%)
      `;


    ctx.translate(
      w / 2,
      h / 2
    );


    ctx.rotate(
      clip.rotation *
      Math.PI /
      180
    );


    ctx.scale(
      effectScale,
      effectScale
    );


    ctx.translate(
      -w / 2,
      -h / 2
    );


    ctx.drawImage(
      this.video,
      x + offsetX,
      y,
      dw,
      dh
    );


    ctx.restore();


    if (
      clip.transitionIn ===
        "flash" &&
      local <
        transition
    ) {

      const flash =
        1 -
        local /
        transition;


      ctx.fillStyle =
        `rgba(
          255,
          245,
          215,
          ${flash * .72}
        )`;


      ctx.fillRect(
        0,
        0,
        w,
        h
      );
    }
  }



  drawImageOverlays() {

    const w =
      this.canvas.width;


    const h =
      this.canvas.height;


    this.images.forEach(
      item => {

        if (
          this.currentTime <
            item.start ||
          this.currentTime >
            item.end
        ) {

          return;
        }


        const maxWidth =
          w *
          (
            item.scale /
            100
          );


        const ratio =
          item.image.width /
          item.image.height;


        let width =
          maxWidth;


        let height =
          width /
          ratio;


        if (
          height >
          h *
          .75
        ) {

          height =
            h *
            .75;


          width =
            height *
            ratio;
        }


        const x =
          w *
          (
            item.x /
            100
          ) -
          width /
          2;


        const y =
          h *
          (
            item.y /
            100
          ) -
          height /
          2;


        this.ctx.save();


        this.ctx.globalAlpha =
          item.opacity;


        this.ctx.shadowColor =
          "rgba(0,0,0,.48)";


        this.ctx.shadowBlur =
          38;


        this.ctx.drawImage(
          item.image,
          x,
          y,
          width,
          height
        );


        this.ctx.restore();
      }
    );
  }



  drawOfficialLogo() {

    if (
      !this.officialLogo
    ) {
      return;
    }


    const w =
      this.canvas.width;


    const h =
      this.canvas.height;


    const short =
      Math.min(
        w,
        h
      );


    const maxHeight =
      short *
      .105 *
      (
        this.project
          .logoSize /
        100
      );


    const ratio =
      this.officialLogo.width /
      this.officialLogo.height;


    let logoWidth;
    let logoHeight;


    if (
      ratio >=
      1
    ) {

      logoWidth =
        maxHeight *
        ratio;


      logoHeight =
        maxHeight;

    } else {

      logoHeight =
        maxHeight;


      logoWidth =
        maxHeight *
        ratio;
    }


    const margin =
      short *
      .045;


    this.ctx.save();


    this.ctx.shadowColor =
      "rgba(0,0,0,.58)";


    this.ctx.shadowBlur =
      30;


    this.ctx.drawImage(
      this.officialLogo,
      margin,
      margin,
      logoWidth,
      logoHeight
    );


    this.ctx.restore();
  }



  drawVideoText() {

    const text =
      this.project.text;


    if (
      this.currentTime <
        text.start ||
      this.currentTime >
        text.end
    ) {

      return;
    }


    const w =
      this.canvas.width;


    const h =
      this.canvas.height;


    const local =
      this.currentTime -
      text.start;


    const intro =
      Math.min(
        1,
        local /
        .45
      );


    const outro =
      Math.min(
        1,
        (
          text.end -
          this.currentTime
        ) /
        .35
      );


    let alpha =
      Math.min(
        intro,
        outro
      );


    let offsetY =
      0;


    let offsetX =
      0;


    let scale =
      1;


    if (
      text.animation ===
      "rise"
    ) {

      offsetY =
        (
          1 -
          this.easeOutCubic(
            intro
          )
        ) *
        75;
    }


    if (
      text.animation ===
      "slide"
    ) {

      offsetX =
        -(
          1 -
          this.easeOutCubic(
            intro
          )
        ) *
        w *
        .15;
    }


    if (
      text.animation ===
      "pop"
    ) {

      scale =
        .72 +
        .28 *
        this.easeOutBack(
          intro
        );
    }


    if (
      text.animation ===
      "none"
    ) {

      alpha =
        1;
    }


    this.ctx.save();


    this.ctx.globalAlpha =
      Math.max(
        0,
        Math.min(
          1,
          alpha
        )
      );


    const centerY =
      h *
      .70;


    this.ctx.translate(
      w / 2,
      centerY
    );


    this.ctx.scale(
      scale,
      scale
    );


    this.ctx.translate(
      -w / 2,
      -centerY
    );


    const width =
      w *
      .86;


    const x =
      (
        w -
        width
      ) /
      2 +
      offsetX;


    const y =
      h *
      .67 +
      offsetY;


    const height =
      text.score
        ? 300
        : 242;


    const panel =
      this.ctx
        .createLinearGradient(
          x,
          y,
          x + width,
          y + height
        );


    panel.addColorStop(
      0,
      "rgba(105,19,29,.94)"
    );


    panel.addColorStop(
      .58,
      "rgba(52,13,18,.93)"
    );


    panel.addColorStop(
      1,
      "rgba(8,10,13,.94)"
    );


    this.roundRect(
      x,
      y,
      width,
      height,
      24
    );


    this.ctx.fillStyle =
      panel;


    this.ctx.fill();


    this.ctx.fillStyle =
      "#F0C34C";


    this.ctx.fillRect(
      x,
      y,
      width,
      8
    );


    /* KICKER */

    this.ctx.textAlign =
      "left";


    this.ctx.textBaseline =
      "top";


    this.ctx.fillStyle =
      "#F0C34C";


    this.ctx.font =
      `800 ${
        Math.round(
          w *
          .023
        )
      }px "Inter"`;


    this.ctx.fillText(
      text.subtitle
        .toUpperCase(),

      x + 45,

      y + 38
    );


    /* TITLE */

    this.ctx.fillStyle =
      "#FFFFFF";


    this.ctx.font =
      `900 ${
        Math.round(
          w *
          .064
        )
      }px "Montserrat"`;


    this.ctx.fillText(
      text.title
        .toUpperCase(),

      x + 45,

      y + 80
    );


    /* SCORE */

    if (
      text.score
    ) {

      this.ctx.fillStyle =
        "#F0C34C";


      this.ctx.font =
        `900 ${
          Math.round(
            w *
            .05
          )
        }px "Montserrat"`;


      this.ctx.fillText(
        text.score
          .toUpperCase(),

        x + 45,

        y + 170
      );
    }


    this.ctx.restore();
  }



  /* =====================================================
     TIMELINE
  ====================================================== */

  getPixelsPerSecond() {

    return (
      60 *
      (
        this.timelineZoom /
        100
      )
    );
  }



  renderTimeline() {

    const duration =
      Math.max(
        this.getDuration(),
        1
      );


    const pps =
      this.getPixelsPerSecond();


    const width =
      Math.max(
        900,
        duration *
        pps
      );


    document
      .getElementById(
        "timelineContent"
      )
      .style.width =
      `${width + 92}px`;


    this.renderRuler(
      duration,
      pps
    );


    this.renderVideoTrack(
      pps
    );


    this.renderImageTrack(
      pps
    );


    this.renderTextTrack(
      pps
    );


    this.renderBrandTrack(
      duration,
      pps
    );


    this.renderAudioTrack(
      duration,
      pps
    );


    document
      .getElementById(
        "timelineDurationLabel"
      )
      .textContent =
      `${duration.toFixed(1)} sec`;


    document
      .getElementById(
        "videoDuration"
      )
      .textContent =
      this.formatTime(
        duration
      );


    this.updateTimelinePlayhead();
  }



  renderRuler(
    duration,
    pps
  ) {

    const ruler =
      document.getElementById(
        "timelineRuler"
      );


    let html =
      "";


    const step =
      duration > 60
        ? 10
        : duration > 30
          ? 5
          : duration > 15
            ? 2
            : 1;


    for (
      let second = 0;
      second <=
      Math.ceil(
        duration
      );
      second +=
      step
    ) {

      html += `
        <span
          class="ruler-tick"
          style="
            left:${
              second *
              pps
            }px
          "
        >
          ${this.formatTime(
            second
          )}
        </span>
      `;
    }


    ruler.innerHTML =
      html;


    ruler.onclick =
      event => {

        const rect =
          ruler
            .getBoundingClientRect();


        const x =
          event.clientX -
          rect.left;


        this.seek(
          x /
          pps
        );
      };
  }



  renderVideoTrack(
    pps
  ) {

    const track =
      document.getElementById(
        "videoTrack"
      );


    let runningStart =
      0;


    track.innerHTML =
      this.clips
        .map(
          (
            clip,
            index
          ) => {

            const duration =
              this.getClipDuration(
                clip
              );


            const left =
              runningStart *
              pps;


            const width =
              Math.max(
                38,
                duration *
                pps
              );


            runningStart +=
              duration;


            const selected =
              clip.id ===
              this.selectedClipId
                ? "selected"
                : "";


            return `
              <div
                class="timeline-block video-block ${selected}"
                draggable="true"
                data-clip-id="${clip.id}"
                data-clip-index="${index}"
                style="
                  left:${left}px;
                  width:${width}px;
                "
              >

                <div
                  class="timeline-trim-handle left"
                  data-trim-side="left"
                ></div>

                <span class="timeline-block-icon">
                  ▶
                </span>

                <strong>
                  ${this.escapeHtml(
                    clip.name
                  )}
                </strong>

                <small>
                  ${duration.toFixed(1)}s
                </small>

                <div
                  class="timeline-trim-handle right"
                  data-trim-side="right"
                ></div>

              </div>
            `;
          }
        )
        .join("");


    track
      .querySelectorAll(
        "[data-clip-id]"
      )
      .forEach(block => {

        const id =
          block.dataset.clipId;


        block.addEventListener(
          "click",
          event => {

            if (
              event.target
                .closest(
                  "[data-trim-side]"
                )
            ) {

              return;
            }


            this.selectClip(
              id
            );


            this.seek(
              this.getClipStart(
                id
              )
            );
          }
        );


        block.addEventListener(
          "dragstart",
          event => {

            event.dataTransfer
              .setData(
                "text/plain",
                block.dataset
                  .clipIndex
              );


            event.dataTransfer
              .effectAllowed =
              "move";
          }
        );


        block.addEventListener(
          "dragover",
          event => {

            event.preventDefault();

            event.dataTransfer
              .dropEffect =
              "move";
          }
        );


        block.addEventListener(
          "drop",
          event => {

            event.preventDefault();


            const from =
              Number(
                event
                  .dataTransfer
                  .getData(
                    "text/plain"
                  )
              );


            const to =
              Number(
                block.dataset
                  .clipIndex
              );


            this.moveClip(
              from,
              to
            );
          }
        );


        block
          .querySelectorAll(
            "[data-trim-side]"
          )
          .forEach(handle => {

            handle.addEventListener(
              "pointerdown",
              event => {

                event.stopPropagation();

                event.preventDefault();


                this.startTrimDrag(

                  event,

                  id,

                  handle.dataset
                    .trimSide

                );
              }
            );
          });
      });
  }



  renderImageTrack(
    pps
  ) {

    document
      .getElementById(
        "imageTrack"
      )
      .innerHTML =
      this.images
        .map(item => {

          const left =
            item.start *
            pps;


          const width =
            Math.max(
              30,
              (
                item.end -
                item.start
              ) *
              pps
            );


          return `
            <div
              class="timeline-block image-block"
              style="
                left:${left}px;
                width:${width}px;
              "
            >
              ▧
              ${this.escapeHtml(
                item.name
              )}
            </div>
          `;
        })
        .join("");
  }



  renderTextTrack(
    pps
  ) {

    const text =
      this.project.text;


    if (
      !text.title
    ) {

      document
        .getElementById(
          "textTrack"
        )
        .innerHTML =
        "";

      return;
    }


    const left =
      text.start *
      pps;


    const width =
      Math.max(
        30,
        (
          text.end -
          text.start
        ) *
        pps
      );


    document
      .getElementById(
        "textTrack"
      )
      .innerHTML =
      `
      <div
        class="timeline-block text-block"
        style="
          left:${left}px;
          width:${width}px;
        "
      >
        T
        ${this.escapeHtml(
          text.title
        )}
      </div>
      `;
  }



  renderBrandTrack(
    duration,
    pps
  ) {

    document
      .getElementById(
        "logoTimelineBlock"
      )
      .style.width =
      `${duration * pps}px`;
  }



  renderAudioTrack(
    duration,
    pps
  ) {

    document
      .getElementById(
        "audioTrack"
      )
      .innerHTML =
      this.audioTrack
        ? `
          <div
            class="timeline-block audio-block"
            style="
              left:0;
              width:${
                duration *
                pps
              }px;
            "
          >
            ♫
            ${this.escapeHtml(
              this.audioTrack.name
            )}
          </div>
        `
        : "";
  }



  fitTimeline() {

    const duration =
      this.getDuration();


    if (
      !duration
    ) {
      return;
    }


    const scroll =
      document.getElementById(
        "timelineScroll"
      );


    const available =
      Math.max(
        500,
        scroll.clientWidth -
        120
      );


    const targetPps =
      available /
      duration;


    this.timelineZoom =
      Math.max(
        45,
        Math.min(
          240,
          (
            targetPps /
            60
          ) *
          100
        )
      );


    document
      .getElementById(
        "timelineZoom"
      )
      .value =
      this.timelineZoom;


    this.renderTimeline();
  }



  /* =====================================================
     TRIM DRAG
  ====================================================== */

  startTrimDrag(
    event,
    clipId,
    side
  ) {

    const clip =
      this.clips.find(
        item =>
          item.id ===
          clipId
      );


    if (!clip) return;


    this.selectClip(
      clipId
    );


    const startX =
      event.clientX;


    const originalStart =
      clip.trimStart;


    const originalEnd =
      clip.trimEnd;


    const pps =
      this.getPixelsPerSecond();


    const onMove =
      moveEvent => {

        const deltaPixels =
          moveEvent.clientX -
          startX;


        const deltaTimeline =
          deltaPixels /
          pps;


        const deltaSource =
          deltaTimeline *
          clip.speed;


        if (
          side ===
          "left"
        ) {

          clip.trimStart =
            Math.max(
              0,
              Math.min(
                originalStart +
                deltaSource,

                clip.trimEnd -
                .05
              )
            );
        }


        else {

          clip.trimEnd =
            Math.min(
              clip.sourceDuration,

              Math.max(
                clip.trimStart +
                .05,

                originalEnd +
                deltaSource
              )
            );
        }


        this.updateInspector();

        this.renderTimeline();

        this.syncPreview(
          true
        );

        this.renderFrame();
      };


    const onUp =
      () => {

        window
          .removeEventListener(
            "pointermove",
            onMove
          );


        window
          .removeEventListener(
            "pointerup",
            onUp
          );


        this.commit();
      };


    window
      .addEventListener(
        "pointermove",
        onMove
      );


    window
      .addEventListener(
        "pointerup",
        onUp
      );
  }



  /* =====================================================
     PLAYHEAD DRAG
  ====================================================== */

  startPlayheadDrag(
    event
  ) {

    this.pause();


    const timeline =
      document.getElementById(
        "timelineContent"
      );


    const rect =
      timeline
        .getBoundingClientRect();


    const pps =
      this.getPixelsPerSecond();


    const update =
      moveEvent => {

        let x =
          moveEvent.clientX -
          rect.left -
          92;


        x =
          Math.max(
            0,
            x
          );


        let time =
          x /
          pps;


        if (
          this.snapEnabled
        ) {

          time =
            this.snapTime(
              time
            );
        }


        this.seek(
          time
        );
      };


    update(
      event
    );


    const onUp =
      () => {

        window
          .removeEventListener(
            "pointermove",
            update
          );


        window
          .removeEventListener(
            "pointerup",
            onUp
          );
      };


    window
      .addEventListener(
        "pointermove",
        update
      );


    window
      .addEventListener(
        "pointerup",
        onUp
      );
  }



  snapTime(
    time
  ) {

    const snapDistance =
      .12;


    const points =
      [
        0,
        this.getDuration(),
        this.project.text.start,
        this.project.text.end
      ];


    let running =
      0;


    this.clips.forEach(
      clip => {

        points.push(
          running
        );


        running +=
          this.getClipDuration(
            clip
          );


        points.push(
          running
        );
      }
    );


    for (
      const point of
      points
    ) {

      if (
        Math.abs(
          point -
          time
        ) <=
        snapDistance
      ) {

        return point;
      }
    }


    return time;
  }



  /* =====================================================
     UI
  ====================================================== */

  updateTimelinePlayhead() {

    const pps =
      this.getPixelsPerSecond();


    document
      .getElementById(
        "timelinePlayhead"
      )
      .style.left =
      `${
        92 +
        this.currentTime *
        pps
      }px`;
  }



  updatePlaybackUi() {

    const duration =
      this.getDuration();


    document
      .getElementById(
        "videoCurrentTime"
      )
      .textContent =
      this.formatTime(
        this.currentTime
      );


    document
      .getElementById(
        "videoDuration"
      )
      .textContent =
      this.formatTime(
        duration
      );


    document
      .getElementById(
        "videoSeekRange"
      )
      .value =
      duration
        ? Math.round(
            (
              this.currentTime /
              duration
            ) *
            1000
          )
        : 0;


    this.updateTimelinePlayhead();


    if (
      this.exporting
    ) {

      const progress =
        duration
          ? Math.min(
              100,
              (
                this.currentTime /
                duration
              ) *
              100
            )
          : 0;


      document
        .getElementById(
          "videoExportProgressBar"
        )
        .style.width =
        `${progress}%`;


      document
        .getElementById(
          "videoExportProgressLabel"
        )
        .textContent =
        `${Math.round(
          progress
        )}%`;
    }
  }



  /* =====================================================
     HISTORY
  ====================================================== */

  getSerializableState() {

    return {

      clips:
        this.clips.map(
          clip => ({
            ...clip
          })
        ),

      images:
        this.images.map(
          item => ({
            id:
              item.id,

            mediaId:
              item.mediaId,

            name:
              item.name,

            start:
              item.start,

            end:
              item.end,

            x:
              item.x,

            y:
              item.y,

            scale:
              item.scale,

            opacity:
              item.opacity
          })
        ),

      selectedClipId:
        this.selectedClipId,

      project:
        JSON.parse(
          JSON.stringify(
            this.project
          )
        )

    };
  }



  pushHistory() {

    const state =
      JSON.stringify(
        this.getSerializableState()
      );


    const current =
      this.history[
        this.historyIndex
      ];


    if (
      current ===
      state
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
      state
    );


    if (
      this.history.length >
      60
    ) {

      this.history.shift();

    } else {

      this.historyIndex++;
    }
  }



  commit() {

    this.pushHistory();
  }



  undo() {

    if (
      this.historyIndex <=
      0
    ) {

      return;
    }


    this.historyIndex--;


    this.restoreHistory(
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


    this.restoreHistory(
      this.history[
        this.historyIndex
      ]
    );
  }



  restoreHistory(
    serialized
  ) {

    const saved =
      JSON.parse(
        serialized
      );


    this.clips =
      saved.clips;


    this.selectedClipId =
      saved.selectedClipId;


    this.project =
      saved.project;


    /* restore image references */

    this.images =
      saved.images.map(
        savedImage => {

          const media =
            this.media.find(
              item =>
                item.id ===
                savedImage.mediaId
            );


          return {

            ...savedImage,

            image:
              media?.image ||
              null

          };
        }
      )
      .filter(
        item =>
          item.image
      );


    document
      .getElementById(
        "videoAspectSelect"
      )
      .value =
      this.project.aspect;


    document
      .getElementById(
        "videoShowLogo"
      )
      .checked =
      this.project
        .logoVisible;


    document
      .getElementById(
        "videoLogoSize"
      )
      .value =
      this.project
        .logoSize;


    document
      .getElementById(
        "videoTitleText"
      )
      .value =
      this.project
        .text
        .title;


    document
      .getElementById(
        "videoSubtitleText"
      )
      .value =
      this.project
        .text
        .subtitle;


    document
      .getElementById(
        "videoScoreText"
      )
      .value =
      this.project
        .text
        .score;


    this.resizeCanvas();

    this.updateInspector();

    this.renderTimeline();

    this.seek(
      Math.min(
        this.currentTime,
        this.getDuration()
      )
    );
  }



  /* =====================================================
     EXPORT AUDIO GRAPH
  ====================================================== */

  async ensureAudioGraph() {

    if (
      this.audioContext
    ) {

      await this.audioContext
        .resume();

      return;
    }


    this.audioContext =
      new AudioContext();


    this.audioDestination =
      this.audioContext
        .createMediaStreamDestination();


    this.mixGain =
      this.audioContext
        .createGain();


    this.previewGain =
      this.audioContext
        .createGain();


    this.videoGain =
      this.audioContext
        .createGain();


    this.musicGain =
      this.audioContext
        .createGain();


    this.videoSourceNode =
      this.audioContext
        .createMediaElementSource(
          this.video
        );


    this.audioSourceNode =
      this.audioContext
        .createMediaElementSource(
          this.audio
        );


    this.videoSourceNode
      .connect(
        this.videoGain
      );


    this.audioSourceNode
      .connect(
        this.musicGain
      );


    this.videoGain
      .connect(
        this.mixGain
      );


    this.musicGain
      .connect(
        this.mixGain
      );


    this.mixGain
      .connect(
        this.audioDestination
      );


    this.mixGain
      .connect(
        this.previewGain
      );


    this.previewGain
      .connect(
        this.audioContext
          .destination
      );


    this.musicGain
      .gain
      .value =
      this.project
        .musicVolume /
      100;


    await this.audioContext
      .resume();
  }



  /* =====================================================
     EXPORT
  ====================================================== */

  async exportVideo() {

    const duration =
      this.getDuration();


    if (
      !duration
    ) {

      alert(
        "Add at least one video clip before exporting."
      );

      return;
    }


    if (
      typeof MediaRecorder ===
      "undefined"
    ) {

      alert(
        "This browser does not support browser video export."
      );

      return;
    }


    const fps =
      Number(
        document
          .getElementById(
            "videoExportFps"
          )
          .value
      );


    const quality =
      document
        .getElementById(
          "videoExportQuality"
        )
        .value;


    const bitrateMap = {

      standard:
        5_000_000,

      high:
        10_000_000,

      maximum:
        18_000_000

    };


    const bitrate =
      bitrateMap[
        quality
      ];


    await this.ensureAudioGraph();


    const mp4Supported =
      MediaRecorder
        .isTypeSupported(
          "video/mp4;codecs=h264,aac"
        );


    const webmVp9 =
      MediaRecorder
        .isTypeSupported(
          "video/webm;codecs=vp9,opus"
        );


    const mimeType =
      mp4Supported
        ? "video/mp4;codecs=h264,aac"
        : webmVp9
          ? "video/webm;codecs=vp9,opus"
          : "video/webm";


    const extension =
      mimeType.startsWith(
        "video/mp4"
      )
        ? "mp4"
        : "webm";


    document
      .getElementById(
        "videoExportTypeLabel"
      )
      .textContent =
      `${extension.toUpperCase()} • ${fps} FPS`;


    const canvasStream =
      this.canvas
        .captureStream(
          fps
        );


    const tracks =
      [
        ...canvasStream
          .getVideoTracks()
      ];


    const audioTracks =
      this.audioDestination
        .stream
        .getAudioTracks();


    if (
      audioTracks.length
    ) {

      tracks.push(
        ...audioTracks
      );
    }


    const stream =
      new MediaStream(
        tracks
      );


    const recorder =
      new MediaRecorder(
        stream,
        {
          mimeType,

          videoBitsPerSecond:
            bitrate
        }
      );


    const chunks =
      [];


    recorder.ondataavailable =
      event => {

        if (
          event.data &&
          event.data.size
        ) {

          chunks.push(
            event.data
          );
        }
      };


    const finished =
      new Promise(
        resolve => {

          recorder.onstop =
            resolve;
        }
      );


    this.exporting =
      true;


    document
      .getElementById(
        "videoExportProgressWrap"
      )
      .classList.remove(
        "hidden"
      );


    this.previewGain
      .gain
      .value =
      0;


    this.seek(
      0
    );


    recorder.start(
      400
    );


    await new Promise(
      resolve => {

        this
          .onExportPlaybackFinished =
          resolve;


        this.play();
      }
    );


    recorder.stop();


    await finished;


    this
      .onExportPlaybackFinished =
      null;


    this.exporting =
      false;


    this.previewGain
      .gain
      .value =
      1;


    const blob =
      new Blob(
        chunks,
        {
          type:
            mimeType
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


    const projectName =
      document
        .getElementById(
          "projectName"
        )
        .value
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
      "fwcwl-video";


    link.href =
      url;


    link.download =
      `${projectName}.${extension}`;


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
      3000
    );


    document
      .getElementById(
        "videoExportProgressBar"
      )
      .style.width =
      "100%";


    document
      .getElementById(
        "videoExportProgressLabel"
      )
      .textContent =
      "100%";


    setTimeout(
      () => {

        document
          .getElementById(
            "videoExportProgressWrap"
          )
          .classList.add(
            "hidden"
          );

      },
      1400
    );
  }



  /* =====================================================
     UTILITIES
  ====================================================== */

  easeOutBack(
    x
  ) {

    const c1 =
      1.70158;


    const c3 =
      c1 +
      1;


    return (
      1 +
      c3 *
      Math.pow(
        x - 1,
        3
      ) +
      c1 *
      Math.pow(
        x - 1,
        2
      )
    );
  }



  easeOutCubic(
    x
  ) {

    return (
      1 -
      Math.pow(
        1 - x,
        3
      )
    );
  }



  roundRect(
    x,
    y,
    width,
    height,
    radius
  ) {

    const ctx =
      this.ctx;


    const r =
      Math.min(
        radius,
        width /
        2,
        height /
        2
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



  formatTime(
    seconds
  ) {

    if (
      !Number.isFinite(
        seconds
      )
    ) {

      return "00:00.0";
    }


    const minutes =
      Math.floor(
        seconds /
        60
      );


    const secs =
      seconds -
      minutes *
      60;


    return (
      `${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:` +
      `${secs
        .toFixed(1)
        .padStart(
          4,
          "0"
        )}`
    );
  }



  escapeHtml(
    value
  ) {

    return String(
      value
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
