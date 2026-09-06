import { VIDEO_PRESETS } from "./cricket-templates.js";

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
      document.getElementById("videoCanvas");

    this.ctx =
      this.canvas.getContext("2d");


    this.video =
      document.getElementById("videoSource");

    this.audio =
      document.getElementById("audioSource");


    this.media = [];
    this.clips = [];
    this.images = [];


    this.audioTrack = null;


    this.selectedClipId = null;


    this.officialLogo = null;


    this.currentTime = 0;
    this.playing = false;

    this.playStartTimestamp = 0;


    this.timelineZoom = 100;


    this.activeSourceUrl = null;


    this.project = {

      aspect: "reel",

      logoVisible: true,
      logoSize: 100,

      musicVolume: 60,

      text: {
        title: "MATCH DAY",
        subtitle: "FWCWL • TAMPA, FLORIDA",
        score: "",
        start: 0,
        end: 5,
        animation: "rise"
      }
    };


    this.audioContext = null;
    this.audioDestination = null;

    this.videoSourceNode = null;
    this.audioSourceNode = null;

    this.videoGain = null;
    this.musicGain = null;

    this.mixGain = null;
    this.previewGain = null;


    this.exporting = false;


    this.loadOfficialLogo();
    this.renderVideoPresets();
    this.bind();

    this.resizeCanvas();

    this.renderTimeline();
    this.renderFrame();
  }



  async loadOfficialLogo() {

    this.officialLogo =
      await this.loadImage(
        "assets/fwcwl-logo.jpeg"
      );

    this.renderFrame();
  }


  loadImage(src) {

    return new Promise((resolve, reject) => {

      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = reject;

      image.src = src;
    });
  }



  bind() {

    document
      .querySelectorAll("[data-video-tab]")
      .forEach(button => {

        button.addEventListener("click", () => {

          document
            .querySelectorAll("[data-video-tab]")
            .forEach(item =>
              item.classList.remove("active")
            );

          document
            .querySelectorAll("#videoLeftPanel .left-tab-panel")
            .forEach(panel =>
              panel.classList.remove("active")
            );


          button.classList.add("active");


          const name =
            button.dataset.videoTab;

          const panelId =
            name === "media"
              ? "videoMediaPanel"
              : name === "templates"
                ? "videoTemplatesPanel"
                : "videoTextPanel";

          document
            .getElementById(panelId)
            .classList.add("active");
        });
      });



    document
      .getElementById("videoUploadInput")
      .addEventListener("change", event => {

        this.handleVideoFiles(
          [...event.target.files]
        );

        event.target.value = "";
      });



    document
      .getElementById("videoImageUploadInput")
      .addEventListener("change", event => {

        this.handleImageFiles(
          [...event.target.files]
        );

        event.target.value = "";
      });



    document
      .getElementById("videoAudioUploadInput")
      .addEventListener("change", event => {

        const file =
          event.target.files[0];

        if (file) {
          this.handleAudioFile(file);
        }

        event.target.value = "";
      });



    document
      .getElementById("videoAspectSelect")
      .addEventListener("change", event => {

        this.project.aspect = event.target.value;

        this.resizeCanvas();
        this.renderFrame();
      });



    document
      .getElementById("videoPlayBtn")
      .addEventListener("click", () => {

        if (this.playing) {
          this.pause();
        } else {
          this.play();
        }
      });



    document
      .getElementById("videoSkipBackBtn")
      .addEventListener("click", () => {

        this.seek(
          Math.max(
            0,
            this.currentTime - 1
          )
        );
      });



    document
      .getElementById("videoSkipForwardBtn")
      .addEventListener("click", () => {

        this.seek(
          Math.min(
            this.getDuration(),
            this.currentTime + 1
          )
        );
      });



    document
      .getElementById("videoSeekRange")
      .addEventListener("input", event => {

        const duration =
          this.getDuration();

        const ratio =
          Number(event.target.value) / 1000;

        this.seek(duration * ratio);
      });



    document
      .getElementById("timelineZoom")
      .addEventListener("input", event => {

        this.timelineZoom =
          Number(event.target.value);

        this.renderTimeline();
      });



    document
      .getElementById("videoSplitBtn")
      .addEventListener("click", () =>
        this.splitSelectedClip()
      );


    document
      .getElementById("videoDuplicateBtn")
      .addEventListener("click", () =>
        this.duplicateSelectedClip()
      );


    document
      .getElementById("videoDeleteBtn")
      .addEventListener("click", () =>
        this.deleteSelectedClip()
      );



    this.bindClipInspector();


    this.bindTextControl(
      "videoTitleText",
      "title"
    );

    this.bindTextControl(
      "videoSubtitleText",
      "subtitle"
    );

    this.bindTextControl(
      "videoScoreText",
      "score"
    );


    document
      .getElementById("videoTextStart")
      .addEventListener("input", event => {

        this.project.text.start =
          Math.max(
            0,
            Number(event.target.value)
          );

        this.renderTimeline();
        this.renderFrame();
      });


    document
      .getElementById("videoTextEnd")
      .addEventListener("input", event => {

        this.project.text.end =
          Math.max(
            this.project.text.start,
            Number(event.target.value)
          );

        this.renderTimeline();
        this.renderFrame();
      });


    document
      .getElementById("videoTextAnimation")
      .addEventListener("change", event => {

        this.project.text.animation =
          event.target.value;

        this.renderFrame();
      });



    document
      .getElementById("videoShowLogo")
      .addEventListener("change", event => {

        this.project.logoVisible =
          event.target.checked;

        this.renderFrame();
      });



    document
      .getElementById("videoLogoSize")
      .addEventListener("input", event => {

        this.project.logoSize =
          Number(event.target.value);

        document
          .getElementById("videoLogoSizeValue")
          .textContent =
          `${this.project.logoSize}%`;

        this.renderFrame();
      });



    document
      .getElementById("videoMusicVolume")
      .addEventListener("input", event => {

        this.project.musicVolume =
          Number(event.target.value);

        document
          .getElementById("videoMusicVolumeValue")
          .textContent =
          `${this.project.musicVolume}%`;

        this.audio.volume =
          this.project.musicVolume / 100;

        if (this.musicGain) {
          this.musicGain.gain.value =
            this.project.musicVolume / 100;
        }
      });



    document
      .getElementById("videoAddMatchTitleBtn")
      .addEventListener("click", () => {

        this.applyTextPreset(
          "MATCH DAY",
          "FWCWL • TAMPA, FLORIDA",
          "",
          "rise"
        );
      });


    document
      .getElementById("videoAddPlayerTitleBtn")
      .addEventListener("click", () => {

        this.applyTextPreset(
          "PLAYER NAME",
          "FWCWL • PLAYER PROFILE",
          "BATSMAN",
          "slide"
        );
      });


    document
      .getElementById("videoAddScoreTitleBtn")
      .addEventListener("click", () => {

        this.applyTextPreset(
          "LIVE SCORE",
          "15.2 OVERS",
          "142/3",
          "pop"
        );
      });



    document
      .getElementById("videoExportBtn")
      .addEventListener("click", () =>
        this.exportVideo()
      );


    document
      .getElementById("videoExportTopBtn")
      .addEventListener("click", () =>
        this.exportVideo()
      );
  }



  bindTextControl(id, key) {

    document
      .getElementById(id)
      .addEventListener("input", event => {

        this.project.text[key] =
          event.target.value;

        this.renderFrame();
      });
  }



  bindClipInspector() {

    const numberFields = [
      ["clipTrimStart", "trimStart"],
      ["clipTrimEnd", "trimEnd"],
      ["clipScale", "scale"],
      ["clipX", "x"],
      ["clipY", "y"],
      ["clipRotation", "rotation"],
      ["clipBrightness", "brightness"],
      ["clipSaturation", "saturation"],
      ["clipContrast", "contrast"]
    ];


    numberFields.forEach(
      ([id, key]) => {

        document
          .getElementById(id)
          .addEventListener("input", event => {

            const clip =
              this.getSelectedClip();

            if (!clip) return;

            const value =
              Number(event.target.value);


            if (key === "trimStart") {

              clip.trimStart =
                Math.max(
                  0,
                  Math.min(
                    value,
                    clip.trimEnd - 0.05
                  )
                );
            }

            else if (key === "trimEnd") {

              clip.trimEnd =
                Math.max(
                  clip.trimStart + 0.05,
                  Math.min(
                    value,
                    clip.sourceDuration
                  )
                );
            }

            else {
              clip[key] = value;
            }


            this.refreshInspectorLabels();
            this.renderTimeline();
            this.syncPreview(true);
            this.renderFrame();
          });
      }
    );



    document
      .getElementById("clipSpeed")
      .addEventListener("change", event => {

        const clip =
          this.getSelectedClip();

        if (!clip) return;

        clip.speed =
          Number(event.target.value);

        this.renderTimeline();
        this.syncPreview(true);
      });



    document
      .getElementById("clipVolume")
      .addEventListener("input", event => {

        const clip =
          this.getSelectedClip();

        if (!clip) return;

        clip.volume =
          Number(event.target.value);

        document
          .getElementById("clipVolumeValue")
          .textContent =
          `${clip.volume}%`;

        this.video.volume =
          clip.volume / 100;

        if (this.videoGain) {
          this.videoGain.gain.value =
            clip.volume / 100;
        }
      });



    document
      .getElementById("clipTransitionIn")
      .addEventListener("change", event => {

        const clip =
          this.getSelectedClip();

        if (!clip) return;

        clip.transitionIn =
          event.target.value;

        this.renderFrame();
      });



    document
      .getElementById("clipTransitionOut")
      .addEventListener("change", event => {

        const clip =
          this.getSelectedClip();

        if (!clip) return;

        clip.transitionOut =
          event.target.value;

        this.renderFrame();
      });
  }



  async handleVideoFiles(files) {

    for (const file of files) {

      const url =
        URL.createObjectURL(file);

      const duration =
        await this.getVideoDuration(url);

      const media = {
        id: crypto.randomUUID(),
        type: "video",
        name: file.name,
        url,
        duration
      };

      this.media.push(media);

      this.addVideoClip(media);
    }

    this.renderMediaLibrary();
  }



  async handleImageFiles(files) {

    for (const file of files) {

      const url =
        URL.createObjectURL(file);

      const image =
        await this.loadImage(url);

      const media = {
        id: crypto.randomUUID(),
        type: "image",
        name: file.name,
        url,
        image
      };

      this.media.push(media);
    }

    this.renderMediaLibrary();
  }



  handleAudioFile(file) {

    const url =
      URL.createObjectURL(file);

    const media = {
      id: crypto.randomUUID(),
      type: "audio",
      name: file.name,
      url
    };

    this.media.push(media);


    this.audioTrack = media;

    this.audio.src = url;
    this.audio.loop = true;

    this.audio.volume =
      this.project.musicVolume / 100;


    document
      .getElementById("audioStatusCard")
      .textContent =
      file.name;


    this.renderMediaLibrary();
    this.renderTimeline();
  }



  getVideoDuration(url) {

    return new Promise(resolve => {

      const video =
        document.createElement("video");

      video.preload = "metadata";
      video.src = url;

      video.onloadedmetadata = () => {

        resolve(
          Number.isFinite(video.duration)
            ? video.duration
            : 1
        );
      };
    });
  }



  addVideoClip(media) {

    const clip = {

      id: crypto.randomUUID(),

      mediaId: media.id,

      name: media.name,
      url: media.url,

      sourceDuration: media.duration,

      trimStart: 0,
      trimEnd: media.duration,

      speed: 1,
      volume: 100,

      scale: 100,
      x: 50,
      y: 50,
      rotation: 0,

      brightness: 100,
      saturation: 100,
      contrast: 100,

      transitionIn: "fade",
      transitionOut: "fade"
    };


    this.clips.push(clip);

    this.selectedClipId =
      clip.id;


    if (
      this.project.text.end <= 5 &&
      this.getDuration() > 5
    ) {
      this.project.text.end = 5;
    }


    this.updateInspector();
    this.renderTimeline();

    this.seek(
      this.getClipStart(clip.id)
    );
  }



  addImageOverlay(media) {

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

      id: crypto.randomUUID(),

      mediaId: media.id,

      name: media.name,

      image: media.image,

      start,

      end:
        Math.min(
          duration,
          start + 5
        ),

      x: 50,
      y: 55,

      scale: 42,

      opacity: 1
    });


    this.renderTimeline();
    this.renderFrame();
  }



  renderMediaLibrary() {

    const container =
      document.getElementById("videoMediaLibrary");


    document.getElementById("videoMediaCount").textContent =
      `${this.media.length} item${this.media.length === 1 ? "" : "s"}`;


    if (!this.media.length) {

      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">▶</div>
          <strong>Add your first clip</strong>
          <span>
            Videos, photos and audio will appear here.
          </span>
        </div>
      `;

      return;
    }


    container.innerHTML =
      this.media.map(media => {

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
              : "Music";

        return `
          <div class="media-library-card">

            <div class="media-library-icon">
              ${icon}
            </div>

            <div class="media-library-info">
              <strong>${this.escapeHtml(media.name)}</strong>
              <span>${media.type}</span>
            </div>

            <button
              type="button"
              data-media-action="${media.id}"
            >
              ${action}
            </button>

          </div>
        `;
      }).join("");


    container
      .querySelectorAll("[data-media-action]")
      .forEach(button => {

        button.addEventListener("click", () => {

          const media =
            this.media.find(
              item =>
                item.id === button.dataset.mediaAction
            );

          if (!media) return;


          if (media.type === "video") {
            this.addVideoClip(media);
          }

          if (media.type === "image") {
            this.addImageOverlay(media);
          }

          if (media.type === "audio") {

            this.audioTrack = media;

            this.audio.src =
              media.url;

            document
              .getElementById("audioStatusCard")
              .textContent =
              media.name;

            this.renderTimeline();
          }
        });
      });
  }



  renderVideoPresets() {

    const grid =
      document.getElementById("videoPresetGrid");


    grid.innerHTML =
      VIDEO_PRESETS.map(
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

            <span>FWCWL</span>

            <strong>
              ${preset.title}
            </strong>

            <small>
              ${preset.name}
            </small>
          </button>
        `
      ).join("");


    grid
      .querySelectorAll("[data-video-preset]")
      .forEach(button => {

        button.addEventListener("click", () => {

          const preset =
            VIDEO_PRESETS.find(
              item =>
                item.id === button.dataset.videoPreset
            );

          if (!preset) return;


          this.applyTextPreset(
            preset.title,
            preset.subtitle,
            preset.score,
            preset.animation
          );
        });
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

      start: this.currentTime,

      end:
        Math.min(
          duration,
          this.currentTime + 5
        ),

      animation
    };


    document.getElementById("videoTitleText").value =
      title;

    document.getElementById("videoSubtitleText").value =
      subtitle;

    document.getElementById("videoScoreText").value =
      score;

    document.getElementById("videoTextStart").value =
      this.project.text.start.toFixed(1);

    document.getElementById("videoTextEnd").value =
      this.project.text.end.toFixed(1);

    document.getElementById("videoTextAnimation").value =
      animation;


    this.renderTimeline();
    this.renderFrame();
  }



  getClipDuration(clip) {

    return (
      (clip.trimEnd - clip.trimStart) /
      clip.speed
    );
  }



  getDuration() {

    return this.clips.reduce(
      (total, clip) =>
        total + this.getClipDuration(clip),
      0
    );
  }



  getClipStart(clipId) {

    let time = 0;

    for (const clip of this.clips) {

      if (clip.id === clipId) {
        return time;
      }

      time +=
        this.getClipDuration(clip);
    }

    return 0;
  }



  getClipAtTime(time) {

    let start = 0;

    for (
      let index = 0;
      index < this.clips.length;
      index++
    ) {

      const clip =
        this.clips[index];

      const duration =
        this.getClipDuration(clip);

      const end =
        start + duration;


      if (
        time >= start &&
        (
          time < end ||
          (
            index === this.clips.length - 1 &&
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
              time - start
            )
        };
      }

      start = end;
    }

    return null;
  }



  getSelectedClip() {

    return this.clips.find(
      clip =>
        clip.id === this.selectedClipId
    ) || null;
  }



  selectClip(id) {

    this.selectedClipId = id;

    this.updateInspector();
    this.renderTimeline();
  }



  updateInspector() {

    const clip =
      this.getSelectedClip();


    document
      .getElementById("selectedClipBadge")
      .textContent =
      clip
        ? clip.name
        : "None";


    if (!clip) return;


    document.getElementById("clipTrimStart").value =
      clip.trimStart.toFixed(2);

    document.getElementById("clipTrimEnd").value =
      clip.trimEnd.toFixed(2);

    document.getElementById("clipTrimEnd").max =
      clip.sourceDuration;


    document.getElementById("clipSpeed").value =
      String(clip.speed);

    document.getElementById("clipVolume").value =
      clip.volume;


    document.getElementById("clipScale").value =
      clip.scale;

    document.getElementById("clipX").value =
      clip.x;

    document.getElementById("clipY").value =
      clip.y;

    document.getElementById("clipRotation").value =
      clip.rotation;


    document.getElementById("clipBrightness").value =
      clip.brightness;

    document.getElementById("clipSaturation").value =
      clip.saturation;

    document.getElementById("clipContrast").value =
      clip.contrast;


    document.getElementById("clipTransitionIn").value =
      clip.transitionIn;

    document.getElementById("clipTransitionOut").value =
      clip.transitionOut;


    this.refreshInspectorLabels();
  }



  refreshInspectorLabels() {

    const clip =
      this.getSelectedClip();

    if (!clip) return;


    document.getElementById("clipVolumeValue").textContent =
      `${clip.volume}%`;

    document.getElementById("clipScaleValue").textContent =
      `${clip.scale}%`;

    document.getElementById("clipXValue").textContent =
      `${clip.x}%`;

    document.getElementById("clipYValue").textContent =
      `${clip.y}%`;

    document.getElementById("clipRotationValue").textContent =
      `${clip.rotation}°`;

    document.getElementById("clipBrightnessValue").textContent =
      `${clip.brightness}%`;

    document.getElementById("clipSaturationValue").textContent =
      `${clip.saturation}%`;

    document.getElementById("clipContrastValue").textContent =
      `${clip.contrast}%`;
  }



  splitSelectedClip() {

    const clip =
      this.getSelectedClip();

    if (!clip) return;


    const start =
      this.getClipStart(clip.id);

    const localTimelineTime =
      this.currentTime - start;


    const clipDuration =
      this.getClipDuration(clip);


    if (
      localTimelineTime <= 0.05 ||
      localTimelineTime >= clipDuration - 0.05
    ) {
      return;
    }


    const sourceSplit =
      clip.trimStart +
      localTimelineTime * clip.speed;


    const first = {
      ...clip,
      id: crypto.randomUUID(),
      trimEnd: sourceSplit
    };


    const second = {
      ...clip,
      id: crypto.randomUUID(),
      trimStart: sourceSplit
    };


    const index =
      this.clips.findIndex(
        item =>
          item.id === clip.id
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
    this.syncPreview(true);
  }



  duplicateSelectedClip() {

    const clip =
      this.getSelectedClip();

    if (!clip) return;


    const duplicate = {
      ...clip,
      id: crypto.randomUUID(),
      name: `${clip.name} Copy`
    };


    const index =
      this.clips.findIndex(
        item =>
          item.id === clip.id
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
  }



  deleteSelectedClip() {

    const index =
      this.clips.findIndex(
        item =>
          item.id === this.selectedClipId
      );


    if (index === -1) return;


    this.clips.splice(index, 1);


    this.selectedClipId =
      this.clips[index]?.id ||
      this.clips[index - 1]?.id ||
      null;


    const duration =
      this.getDuration();


    if (this.currentTime > duration) {
      this.currentTime = duration;
    }


    this.updateInspector();
    this.renderTimeline();
    this.syncPreview(true);
    this.renderFrame();
  }



  resizeCanvas() {

    const size =
      VIDEO_SIZES[this.project.aspect];

    this.canvas.width =
      size.width;

    this.canvas.height =
      size.height;
  }



  async play() {

    const duration =
      this.getDuration();


    if (!duration) return;


    if (
      this.currentTime >= duration
    ) {
      this.currentTime = 0;
    }


    this.playing = true;


    document.getElementById("videoPlayBtn").textContent =
      "❚❚";


    this.playStartTimestamp =
      performance.now() -
      this.currentTime * 1000;


    await this.syncPreview(true);


    if (this.audioTrack) {

      try {

        if (
          Number.isFinite(this.audio.duration) &&
          this.audio.duration > 0
        ) {
          this.audio.currentTime =
            this.currentTime %
            this.audio.duration;
        }

        await this.audio.play();

      } catch {}
    }


    requestAnimationFrame(
      () => this.tick()
    );
  }



  pause() {

    this.playing = false;

    this.video.pause();
    this.audio.pause();

    document.getElementById("videoPlayBtn").textContent =
      "▶";
  }



  async tick() {

    if (!this.playing) return;


    const duration =
      this.getDuration();


    this.currentTime =
      (performance.now() - this.playStartTimestamp) /
      1000;


    if (
      this.currentTime >= duration
    ) {

      this.currentTime = duration;

      this.pause();

      this.renderFrame();
      this.updatePlaybackUi();

      if (this.exporting) {
        this.onExportPlaybackFinished?.();
      }

      return;
    }


    await this.syncPreview(false);

    this.renderFrame();
    this.updatePlaybackUi();


    requestAnimationFrame(
      () => this.tick()
    );
  }



  seek(time) {

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


    if (this.playing) {

      this.playStartTimestamp =
        performance.now() -
        this.currentTime * 1000;
    }


    this.syncPreview(true);

    this.syncAudioToTime();

    this.renderFrame();
    this.updatePlaybackUi();
  }



  async syncPreview(forceSeek = false) {

    const active =
      this.getClipAtTime(
        this.currentTime
      );


    if (!active) {

      this.video.pause();
      return;
    }


    const { clip, local } =
      active;


    const sourceTime =
      clip.trimStart +
      local * clip.speed;


    const sourceChanged =
      this.activeSourceUrl !==
      clip.url;


    if (sourceChanged) {

      this.video.pause();

      this.video.src =
        clip.url;

      this.activeSourceUrl =
        clip.url;


      await new Promise(resolve => {

        if (
          this.video.readyState >= 1
        ) {
          resolve();
        } else {

          this.video.onloadedmetadata =
            () => resolve();
        }
      });


      this.video.currentTime =
        Math.min(
          clip.trimEnd,
          sourceTime
        );
    }

    else if (
      forceSeek ||
      Math.abs(
        this.video.currentTime -
        sourceTime
      ) > 0.18
    ) {

      try {
        this.video.currentTime =
          sourceTime;
      } catch {}
    }


    this.video.playbackRate =
      clip.speed;

    this.video.volume =
      clip.volume / 100;


    if (this.videoGain) {
      this.videoGain.gain.value =
        clip.volume / 100;
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

    if (!this.audioTrack) return;


    if (
      Number.isFinite(this.audio.duration) &&
      this.audio.duration > 0
    ) {

      this.audio.currentTime =
        this.currentTime %
        this.audio.duration;
    }
  }



  renderFrame() {

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;


    ctx.clearRect(
      0,
      0,
      w,
      h
    );


    const bg =
      ctx.createLinearGradient(
        0,
        0,
        w,
        h
      );

    bg.addColorStop(0, "#111318");
    bg.addColorStop(1, "#050607");

    ctx.fillStyle = bg;

    ctx.fillRect(0, 0, w, h);


    const active =
      this.getClipAtTime(
        this.currentTime
      );


    document
      .getElementById("videoEmptyPreview")
      .classList.toggle(
        "hidden",
        Boolean(active)
      );


    if (
      active &&
      this.video.readyState >= 2
    ) {

      this.drawVideoClip(active);
    }


    this.drawImageOverlays();


    if (this.project.logoVisible) {
      this.drawOfficialLogo();
    }


    this.drawVideoText();


    this.updatePlaybackUi();
  }



  drawVideoClip(active) {

    const { clip, local } =
      active;


    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;


    const videoW =
      this.video.videoWidth || w;

    const videoH =
      this.video.videoHeight || h;


    let scale =
      Math.max(
        w / videoW,
        h / videoH
      );


    scale *=
      clip.scale / 100;


    const dw =
      videoW * scale;

    const dh =
      videoH * scale;


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
      -(overflowX * (clip.x / 100));

    let y =
      -(overflowY * (clip.y / 100));


    const duration =
      this.getClipDuration(clip);


    const transitionDuration =
      Math.min(
        0.45,
        duration / 3
      );


    let alpha = 1;
    let effectScale = 1;
    let offsetX = 0;


    if (
      local < transitionDuration
    ) {

      const progress =
        local /
        transitionDuration;

      if (clip.transitionIn === "fade") {
        alpha *= progress;
      }

      if (clip.transitionIn === "zoom") {
        alpha *= progress;
        effectScale =
          1.14 -
          0.14 * progress;
      }

      if (clip.transitionIn === "slide") {
        alpha *= progress;
        offsetX =
          (1 - progress) *
          w *
          0.12;
      }

      if (clip.transitionIn === "flash") {
        alpha *= progress;
      }
    }


    const remaining =
      duration - local;


    if (
      remaining <
      transitionDuration
    ) {

      const progress =
        remaining /
        transitionDuration;

      if (clip.transitionOut === "fade") {
        alpha *= progress;
      }

      if (clip.transitionOut === "zoom") {
        alpha *= progress;
        effectScale =
          1 +
          (1 - progress) * 0.12;
      }

      if (clip.transitionOut === "slide") {
        alpha *= progress;
        offsetX =
          -(1 - progress) *
          w *
          0.12;
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
      `brightness(${clip.brightness}%)
       saturate(${clip.saturation}%)
       contrast(${clip.contrast}%)`;


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
      clip.transitionIn === "flash" &&
      local < transitionDuration
    ) {

      const flash =
        1 -
        local /
        transitionDuration;

      ctx.fillStyle =
        `rgba(255,255,255,${flash * 0.7})`;

      ctx.fillRect(0, 0, w, h);
    }
  }



  drawImageOverlays() {

    const w =
      this.canvas.width;

    const h =
      this.canvas.height;


    this.images.forEach(item => {

      if (
        this.currentTime < item.start ||
        this.currentTime > item.end
      ) {
        return;
      }


      const maxWidth =
        w * (item.scale / 100);


      const ratio =
        item.image.width /
        item.image.height;


      let width =
        maxWidth;

      let height =
        width / ratio;


      if (height > h * 0.75) {

        height =
          h * 0.75;

        width =
          height * ratio;
      }


      const x =
        w *
        (item.x / 100) -
        width / 2;


      const y =
        h *
        (item.y / 100) -
        height / 2;


      this.ctx.save();

      this.ctx.globalAlpha =
        item.opacity;

      this.ctx.shadowColor =
        "rgba(0,0,0,.45)";

      this.ctx.shadowBlur = 35;


      this.ctx.drawImage(
        item.image,
        x,
        y,
        width,
        height
      );


      this.ctx.restore();
    });
  }



  drawOfficialLogo() {

    if (!this.officialLogo) return;


    const w =
      this.canvas.width;

    const h =
      this.canvas.height;


    const baseSize =
      Math.min(w, h) *
      0.105 *
      (this.project.logoSize / 100);


    const ratio =
      this.officialLogo.width /
      this.officialLogo.height;


    let width;
    let height;


    if (ratio >= 1) {

      width = baseSize;

      height =
        width / ratio;

    } else {

      height = baseSize;

      width =
        height * ratio;
    }


    const margin =
      Math.min(w, h) * 0.045;


    this.ctx.save();


    this.ctx.shadowColor =
      "rgba(0,0,0,.55)";

    this.ctx.shadowBlur = 28;


    this.ctx.drawImage(
      this.officialLogo,
      margin,
      margin,
      width,
      height
    );


    this.ctx.restore();
  }



  drawVideoText() {

    const text =
      this.project.text;


    if (
      this.currentTime < text.start ||
      this.currentTime > text.end
    ) {
      return;
    }


    const w =
      this.canvas.width;

    const h =
      this.canvas.height;


    const visibleDuration =
      Math.max(
        0.1,
        text.end - text.start
      );


    const local =
      this.currentTime -
      text.start;


    const intro =
      Math.min(
        1,
        local / 0.45
      );


    const outro =
      Math.min(
        1,
        (text.end - this.currentTime) /
        0.35
      );


    let alpha =
      Math.min(
        intro,
        outro
      );


    let offsetY = 0;
    let scale = 1;
    let offsetX = 0;


    if (
      text.animation === "rise"
    ) {
      offsetY =
        (1 - intro) *
        80;
    }


    if (
      text.animation === "pop"
    ) {
      scale =
        0.72 +
        0.28 *
        this.easeOutBack(intro);
    }


    if (
      text.animation === "slide"
    ) {
      offsetX =
        -(1 - intro) *
        w *
        0.15;
    }


    if (
      text.animation === "none"
    ) {
      alpha = 1;
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


    this.ctx.translate(
      w / 2,
      h * 0.71 + offsetY
    );


    this.ctx.scale(
      scale,
      scale
    );


    this.ctx.translate(
      -w / 2,
      -(h * 0.71 + offsetY)
    );


    const cardWidth =
      w * 0.86;


    const cardX =
      (w - cardWidth) / 2 +
      offsetX;


    const cardY =
      h * 0.68 +
      offsetY;


    const cardHeight =
      text.score
        ? 300
        : 245;


    const gradient =
      this.ctx.createLinearGradient(
        cardX,
        cardY,
        cardX + cardWidth,
        cardY + cardHeight
      );


    gradient.addColorStop(
      0,
      "rgba(93,17,24,.93)"
    );

    gradient.addColorStop(
      1,
      "rgba(9,12,16,.93)"
    );


    this.roundRect(
      cardX,
      cardY,
      cardWidth,
      cardHeight,
      24
    );


    this.ctx.fillStyle =
      gradient;

    this.ctx.fill();


    this.ctx.fillStyle =
      "#F0C34C";

    this.ctx.fillRect(
      cardX,
      cardY,
      cardWidth,
      8
    );


    this.ctx.textAlign =
      "left";

    this.ctx.textBaseline =
      "top";


    this.ctx.fillStyle =
      "#F0C34C";

    this.ctx.font =
      `800 ${Math.round(w * 0.025)}px "DM Sans"`;


    this.ctx.fillText(
      text.subtitle.toUpperCase(),
      cardX + 45,
      cardY + 38
    );


    this.ctx.fillStyle =
      "#FFFFFF";

    this.ctx.font =
      `900 ${Math.round(w * 0.067)}px "Montserrat"`;


    this.ctx.fillText(
      text.title.toUpperCase(),
      cardX + 45,
      cardY + 82
    );


    if (text.score) {

      this.ctx.fillStyle =
        "#F0C34C";

      this.ctx.font =
        `900 ${Math.round(w * 0.052)}px "Montserrat"`;


      this.ctx.fillText(
        text.score.toUpperCase(),
        cardX + 45,
        cardY + 175
      );
    }


    this.ctx.restore();
  }



  renderTimeline() {

    const duration =
      Math.max(
        this.getDuration(),
        1
      );


    const basePixelsPerSecond = 60;

    const pixelsPerSecond =
      basePixelsPerSecond *
      (this.timelineZoom / 100);


    const width =
      Math.max(
        900,
        duration *
        pixelsPerSecond
      );


    document
      .getElementById("timelineContent")
      .style.width =
      `${width + 90}px`;


    this.renderRuler(
      duration,
      pixelsPerSecond
    );


    const videoTrack =
      document.getElementById("videoTrack");


    let runningStart = 0;


    videoTrack.innerHTML =
      this.clips.map(clip => {

        const clipDuration =
          this.getClipDuration(clip);


        const left =
          runningStart *
          pixelsPerSecond;


        const blockWidth =
          Math.max(
            36,
            clipDuration *
            pixelsPerSecond
          );


        runningStart +=
          clipDuration;


        const active =
          clip.id === this.selectedClipId
            ? "selected"
            : "";


        return `
          <button
            class="timeline-block video-block ${active}"
            data-clip-id="${clip.id}"
            type="button"
            style="
              left:${left}px;
              width:${blockWidth}px;
            "
          >
            <span class="timeline-block-icon">▶</span>

            <strong>
              ${this.escapeHtml(clip.name)}
            </strong>

            <small>
              ${clipDuration.toFixed(1)}s
            </small>
          </button>
        `;
      }).join("");


    videoTrack
      .querySelectorAll("[data-clip-id]")
      .forEach(block => {

        block.addEventListener(
          "click",
          event => {

            event.stopPropagation();

            this.selectClip(
              block.dataset.clipId
            );

            this.seek(
              this.getClipStart(
                block.dataset.clipId
              )
            );
          }
        );
      });



    const imageTrack =
      document.getElementById("imageTrack");


    imageTrack.innerHTML =
      this.images.map(item => {

        const left =
          item.start *
          pixelsPerSecond;

        const blockWidth =
          Math.max(
            30,
            (item.end - item.start) *
            pixelsPerSecond
          );


        return `
          <div
            class="timeline-block image-block"
            style="
              left:${left}px;
              width:${blockWidth}px;
            "
          >
            ▧ ${this.escapeHtml(item.name)}
          </div>
        `;
      }).join("");



    const text =
      this.project.text;


    const textLeft =
      text.start *
      pixelsPerSecond;


    const textWidth =
      Math.max(
        30,
        (
          Math.max(
            text.end,
            text.start
          ) -
          text.start
        ) *
        pixelsPerSecond
      );


    document
      .getElementById("textTrack")
      .innerHTML =
      text.title
        ? `
          <div
            class="timeline-block text-block"
            style="
              left:${textLeft}px;
              width:${textWidth}px;
            "
          >
            T ${this.escapeHtml(text.title)}
          </div>
        `
        : "";



    document
      .getElementById("logoTimelineBlock")
      .style.width =
      `${duration * pixelsPerSecond}px`;



    document
      .getElementById("audioTrack")
      .innerHTML =
      this.audioTrack
        ? `
          <div
            class="timeline-block audio-block"
            style="
              left:0;
              width:${duration * pixelsPerSecond}px;
            "
          >
            ♫ ${this.escapeHtml(this.audioTrack.name)}
          </div>
        `
        : "";



    document
      .getElementById("timelineDurationLabel")
      .textContent =
      `${duration.toFixed(1)} sec`;


    document
      .getElementById("videoDuration")
      .textContent =
      this.formatTime(duration);


    this.updateTimelinePlayhead();
  }



  renderRuler(
    duration,
    pixelsPerSecond
  ) {

    const ruler =
      document.getElementById("timelineRuler");


    let html = "";


    const step =
      duration > 30
        ? 5
        : duration > 15
          ? 2
          : 1;


    for (
      let second = 0;
      second <= Math.ceil(duration);
      second += step
    ) {

      html += `
        <span
          class="ruler-tick"
          style="left:${second * pixelsPerSecond}px"
        >
          ${this.formatTime(second)}
        </span>
      `;
    }


    ruler.innerHTML = html;


    ruler.onclick = event => {

      const rect =
        ruler.getBoundingClientRect();

      const x =
        event.clientX - rect.left;

      const time =
        x / pixelsPerSecond;

      this.seek(time);
    };
  }



  updateTimelinePlayhead() {

    const pixelsPerSecond =
      60 *
      (this.timelineZoom / 100);


    document
      .getElementById("timelinePlayhead")
      .style.left =
      `${90 + this.currentTime * pixelsPerSecond}px`;
  }



  updatePlaybackUi() {

    const duration =
      this.getDuration();


    document.getElementById("videoCurrentTime").textContent =
      this.formatTime(this.currentTime);


    document.getElementById("videoDuration").textContent =
      this.formatTime(duration);


    document.getElementById("videoSeekRange").value =
      duration
        ? Math.round(
            this.currentTime /
            duration *
            1000
          )
        : 0;


    this.updateTimelinePlayhead();


    if (this.exporting) {

      const progress =
        duration
          ? Math.min(
              100,
              this.currentTime /
              duration *
              100
            )
          : 0;


      document
        .getElementById("videoExportProgressBar")
        .style.width =
        `${progress}%`;


      document
        .getElementById("videoExportProgressLabel")
        .textContent =
        `${Math.round(progress)}%`;
    }
  }



  formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
      return "00:00.0";
    }

    const minutes =
      Math.floor(seconds / 60);

    const secs =
      seconds - minutes * 60;

    return (
      `${String(minutes).padStart(2, "0")}:` +
      `${secs.toFixed(1).padStart(4, "0")}`
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
        width / 2,
        height / 2
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



  easeOutBack(x) {

    const c1 = 1.70158;
    const c3 = c1 + 1;

    return (
      1 +
      c3 *
      Math.pow(x - 1, 3) +
      c1 *
      Math.pow(x - 1, 2)
    );
  }



  escapeHtml(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }



  async ensureAudioGraph() {

    if (this.audioContext) {

      await this.audioContext.resume();
      return;
    }


    this.audioContext =
      new AudioContext();


    this.audioDestination =
      this.audioContext.createMediaStreamDestination();


    this.mixGain =
      this.audioContext.createGain();


    this.previewGain =
      this.audioContext.createGain();


    this.videoGain =
      this.audioContext.createGain();


    this.musicGain =
      this.audioContext.createGain();


    this.videoSourceNode =
      this.audioContext.createMediaElementSource(
        this.video
      );


    this.audioSourceNode =
      this.audioContext.createMediaElementSource(
        this.audio
      );


    this.videoSourceNode.connect(
      this.videoGain
    );


    this.audioSourceNode.connect(
      this.musicGain
    );


    this.videoGain.connect(
      this.mixGain
    );


    this.musicGain.connect(
      this.mixGain
    );


    this.mixGain.connect(
      this.audioDestination
    );


    this.mixGain.connect(
      this.previewGain
    );


    this.previewGain.connect(
      this.audioContext.destination
    );


    this.musicGain.gain.value =
      this.project.musicVolume / 100;


    await this.audioContext.resume();
  }



  async exportVideo() {

    const duration =
      this.getDuration();


    if (!duration) {

      alert(
        "Add at least one video clip before exporting."
      );

      return;
    }


    if (
      typeof MediaRecorder === "undefined"
    ) {

      alert(
        "Video export is not supported by this browser."
      );

      return;
    }


    await this.ensureAudioGraph();


    const supportedMp4 =
      MediaRecorder.isTypeSupported(
        "video/mp4;codecs=h264,aac"
      );


    const mimeType =
      supportedMp4
        ? "video/mp4;codecs=h264,aac"
        : MediaRecorder.isTypeSupported(
            "video/webm;codecs=vp9,opus"
          )
          ? "video/webm;codecs=vp9,opus"
          : "video/webm";


    const extension =
      mimeType.startsWith("video/mp4")
        ? "mp4"
        : "webm";


    document
      .getElementById("videoExportTypeLabel")
      .textContent =
      extension.toUpperCase();


    const canvasStream =
      this.canvas.captureStream(30);


    const tracks = [
      ...canvasStream.getVideoTracks()
    ];


    if (
      this.audioDestination
        .stream
        .getAudioTracks()
        .length
    ) {

      tracks.push(
        ...this.audioDestination
          .stream
          .getAudioTracks()
      );
    }


    const stream =
      new MediaStream(tracks);


    const recorder =
      new MediaRecorder(
        stream,
        {
          mimeType,
          videoBitsPerSecond: 10_000_000
        }
      );


    const chunks = [];


    recorder.ondataavailable = event => {

      if (
        event.data &&
        event.data.size
      ) {
        chunks.push(event.data);
      }
    };


    const finished =
      new Promise(resolve => {

        recorder.onstop =
          () => resolve();
      });


    this.exporting = true;


    document
      .getElementById("videoExportProgressWrap")
      .classList.remove("hidden");


    this.previewGain.gain.value = 0;


    this.seek(0);


    recorder.start(500);


    await new Promise(resolve => {

      this.onExportPlaybackFinished =
        resolve;

      this.play();
    });


    recorder.stop();


    await finished;


    this.onExportPlaybackFinished = null;


    this.exporting = false;


    this.previewGain.gain.value = 1;


    const blob =
      new Blob(
        chunks,
        { type: mimeType }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;


    link.download =
      `fwcwl-video-${Date.now()}.${extension}`;


    document.body.appendChild(link);

    link.click();

    link.remove();


    setTimeout(
      () => URL.revokeObjectURL(url),
      3000
    );


    document
      .getElementById("videoExportProgressBar")
      .style.width =
      "100%";


    document
      .getElementById("videoExportProgressLabel")
      .textContent =
      "100%";


    setTimeout(() => {

      document
        .getElementById("videoExportProgressWrap")
        .classList.add("hidden");

    }, 1200);
  }
}
